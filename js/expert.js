var socket = io();
var cm;
var current_sel_from = null;
var current_sel_to = null;
var last_menu_selection = 0;
var savedDoc = null;

function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("container").style.marginLeft = "250px";
    document.getElementById("myBottombar").style.left = "250px";
    document.getElementById("opnsidebar").setAttribute("onclick", "closeNav()");
    document.getElementById("opnsidebar").style.backgroundImage = 'url("../src/xmark.png")';
}
  
function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("container").style.marginLeft= "0";
    document.getElementById("myBottombar").style.left = "0px";
    document.getElementById("opnsidebar").setAttribute("onclick", "openNav()");
    document.getElementById("opnsidebar").style.backgroundImage = 'url("../src/hamburger.png")';
}

function openDef() {
    document.getElementById("myBottombar").style.height = "250px";
    document.getElementById("main").style.marginBottom = "250px";
}
  
function closeDef() {
    document.getElementById("myBottombar").style.height = "0";
    document.getElementById("main").style.marginBottom= "0";
}

// Socket & ot.js initialization
socket.on('doc', function(data) {
    cm = CodeMirror.fromTextArea(document.getElementById('write'), {lineNumbers: false, styleSelectedText: true});
    cm.setValue(data.str);
    var serverAdapter = new ot.SocketIOAdapter(socket);
    var editorAdapter = new ot.CodeMirrorAdapter(cm);
    var client = new ot.EditorClient(data.revision, data.clients, serverAdapter, editorAdapter);
})

function Test(){
    socket.emit("sentToServer", "Shakehand");
    console.log(command);
    log(command);
}

function control(i){
    let command = ""
    switch (i) {
        case 1: command += "Autosuggestion"; break;
        case 3: command += "Keyboard"; break;
        case 4: command += "Mouse"; break;
    }
    log(command);
    socket.emit("TurnOn", command);
}

function analysisCoord(coord) {
    if (coord != null) {
        return {l:parseInt(coord["line"]), c:parseInt(coord["ch"])}
    }
}

function checkStartCoord(start, end) {
    if ((start == null) && (end == null)) {return false;}
    else if (start == null) {return false;}
    else if (end == null) {return true;}
    else {
        let st = analysisCoord(start)
        let ed = analysisCoord(end)
        if (st.l > ed.l) {return false;}
        else if (st.l < ed.l) {return true;}
        else if (st.c > ed.c) {return false;}
        else {
            return true;
        }
    }
}

function compareCoord(start, end) {
    if ((start == null) || (end == null)) {return false;}
    else {
        let st = analysisCoord(start)
        let ed = analysisCoord(end)
        if (st.l != ed.l) {return false;}
        else if (st.c != ed.c) {return false;}
        return true;
    }
}


function updateSelect(from=null, to=null) {
    current_sel_from = from;
    current_sel_to = to;
}

function log(sentence) {
    /*
    let html = "<li><p>" + sentence + "</p></li>"
    $("#logTable").append(html);*/
    console.log(sentence);
}

function callTextPrompt(type) {
    if (type == 1) {
        last_menu_selection = 1;
        $("#pop-up-title-text").text("Type Your Suggestion Below:");
    }
    else if (type == 2) {
        last_menu_selection = 2;
        $("#pop-up-title-text").text("Replace with:");
    }
    else if (type == 3){
        last_menu_selection = 3;
        $("#pop-up-title-text").text("Your feedback:");
    }
    else{
        console.log("Prompt Error Occured!");
    }
    $("#textmanipulation").css("display","block");
}


$("#close-cogndistortion").on("click", function(){
    $("#cogndistortion").css("display","none");
});

$("#close-textmanipulation").on("click", function(){
    $("#textmanipulation").css("display","none");
});

$(".confirm-pop-up").on("click", function(){
    sentence = $(".pop-up-textarea").val();
    if ((sentence==undefined) || (sentence=="")) {
        alert("No text found.")
        return;
    }
    switch (last_menu_selection) {
        case 1: handelPrompt(sentence); break;
        case 2: handelReplace(sentence); break;
        case 3: handelFeedback(sentence); break;
    }
    $("#textmanipulation").css("display","none");
});

$(".pop-up-selection").one("click", function(){
    let id = this.id;
    if ((current_sel_from!=null) && (current_sel_to!=null)) {
        cm.markText(current_sel_from, current_sel_to, {className: "cognitive-distortion"})
        socket.emit("cd", current_sel_from, current_sel_to, id);
        let from = analysisCoord(current_sel_from);
        let to = analysisCoord(current_sel_to);
        let command = "CD:(" + from.l + "," + from.c + '),(' + to.l + ',' + to.c + '),'+id;
        log(command);
    }
    $("#cogndistortion").css("display","none");
});

function handelPrompt(sentence) {
    let start = cm.getCursor("from")
    let end = cm.getCursor("to");
    let sel_start;
    let sel_end;
    let sentence_back = sentence;
    sentence = " "+sentence;
    if (!checkStartCoord(start, end)) {
        let tmp = start;
        start = end;
        end = tmp;
    }
    if (compareCoord(start, end)) {
        cm.replaceRange(sentence, end);
        end = cm.getCursor("to");
        socket.emit("prompt1", start, end, sentence.length);
        let e = analysisCoord(end)
        log("prompt1:("+e.l+","+e.c+"),"+sentence);
    }
    else {
        cm.markText(start, end, {className: "autosuggest-background"});
        sel_start = start;
        sel_end = end;
        let q = /\.|\?|\!/;
        let cursor = cm.getSearchCursor(q, end);  // Find the nearest end of sentence from selection word
        if (cursor.findNext()){
            start = cursor.to();
            console.log("found!", start);
            cm.replaceRange(sentence, start);
            cursor = cm.getSearchCursor(sentence, start);   // Now find where does the new insertion textend
            cursor.findNext();
            end = cursor.to();
        }
        else {  // Not sure about sentences ending, add prompt alternativly
            sentence = "("+sentence_back+")";
            start = end;
            cm.replaceRange(sentence, start);
            end = cm.getCursor("to");
        }
        socket.emit("prompt2", sel_start, sel_end, start, end, sentence.length);
        let ss = analysisCoord(sel_start)
        let se = analysisCoord(sel_end)
        let s = analysisCoord(start)
        let e = analysisCoord(end)
        log("prompt2:("+ss.l+","+ss.c+"),("+se.l+","+se.c+"),("+s.l+","+s.c+"),("+e.l+","+e.c+"),"+sentence);
    } 
    cm.markText(start, end, {className: "autosuggest-font"});
}

function handelReplace(sentence) {
    if (cm.somethingSelected()) {
        let start = cm.getCursor("from")
        let end = cm.getCursor("to")
        if (!checkStartCoord(start, end)) {
            let tmp = start;
            start = end;
            end = tmp;
        }
        sentence = "("+cm.getRange(start,end)+")->" + sentence
        cm.replaceRange(sentence, start, end);
        end = cm.getCursor("to")
        cm.markText(start, end, {className: "replacement-font"});
        socket.emit("replace", start, end, sentence.length);
        let s = analysisCoord(start)
        let e = analysisCoord(end)
        log("replace:("+s.l+","+s.c+"),("+e.l+","+e.c+"),"+sentence);
    }
}

function handelFeedback(sentence) {
    let start = cm.getCursor("from")
    let end = cm.getCursor("to")
    if (!checkStartCoord(start, end)) {
        let tmp = start;
        start = end;
        end = tmp;
    }
    socket.emit("feedback", start, end, sentence);
    let s = analysisCoord(start)
    let e = analysisCoord(end)
    log("feedback:("+s.l+","+s.c+"),("+e.l+","+e.c+"),"+sentence);
}

// ContextMenu
$(function() {
    $.contextMenu({
        selector: '.CodeMirror',
        callback: function(key, options) {
            console.log("Click at：" + key);
        },
        items: {
            "suggest": {
                name: "Suggest", 
                icon: "edit",
                items: {
                    "prompt": {
                        name: "Prompt",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            //let sentence = prompt("Please type your prompt below:","...");
                            callTextPrompt(1);
                        }
                    },
                    "replace":  {   // TODO: Float Design
                        name: "Replace",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            callTextPrompt(2);
                        }
                    },
                    "others":  {name: "Others"}
                }	
            },
            "highlight": {
                name: "Highlight", 
                icon: "fa-flag",
                items: {
                    "cd":{
                        name: "Cognitive Distortion",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            let start = cm.getCursor("from")
                            let end = cm.getCursor("to")
                            if (!checkStartCoord(start, end)) {
                                let tmp = start;
                                start = end;
                                end = tmp;
                            }
                            updateSelect(start, end)
                            $("#cogndistortion").css("display","block");
                        }
                    },
                    "highlight":{
                        name: "Highlight",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            if (cm.somethingSelected()) {
                                let start = cm.getCursor("from")
                                let end = cm.getCursor("to")
                                if (!checkStartCoord(start, end)) {
                                    let tmp = start;
                                    start = end;
                                    end = tmp;
                                }
                                cm.markText(start, end, {className: "highlight-background"})
                                socket.emit("highlight", start, end);
                                let s = analysisCoord(start)
                                let e = analysisCoord(end)
                                log("highlight:("+s.l+","+s.c+"),("+e.l+","+e.c+")");
                            }
                        }
                    }
                }
            },
            "feedback": {
                name: "Feedback", 
                icon: "fa-commenting-o",
                callback: function(itemKey, opt, rootMenu, originalEvent) {
                    callTextPrompt(3);
                }
            },
            "utility": {
                name: "Utility",
                icon: "fa-cog",
                items: {
                    "undo": {
                        name: "Undo",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            cm.undo()
                            socket.emit("utility", "undo");
                            log("undo");
                        }
                    },
                    "redo": {
                        name: "Redo",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            cm.redo()
                            socket.emit("utility", "redo");
                            log("redo");
                        }
                    },
                    "clear":  {
                        name: "Clear",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            console.log("clear all")
                            console.log(cm.setValue(""));
                            socket.emit("utility", "clear");
                            log("clear");
                        }
                    },
                    "save":  {
                        name: "Save",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            savedDoc = cm.getDoc(); 
                            console.log("All saved!", savedDoc);
                        }
                    },
                    "load":  {
                        name: "Load",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            if (savedDoc!=null) {
                                let a = cm.swapDoc(savedDoc);
                                console.log("Swapped:",a);
                            }
                        }
                    }
                }
            }
        }
    });
});