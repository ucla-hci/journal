var socket = io();
var cm;

var current_sel_from = null;
var current_sel_to = null;
var last_menu_selection = 0;
var assigned_tag = null;
var selected_text = '';

var mouseLog = [];
var KeyboardLog = [];
var commentLog = {};

var entryCount = 1;
var tagCount = 0;
var commentSet = [];
var movedByMouse = false;


function darkMode(){
    if($('.switch-anim').prop('checked')){
        document.getElementById("theme").setAttribute("href","css/theme_dark.css");
    }else{
        document.getElementById("theme").setAttribute("href","css/theme_light.css");
    }
}

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
    document.getElementById("myBottombar").style.height = "auto";
    document.getElementById("myBottombar").style.minHeight = "200px";
    //document.getElementById("main").style.marginBottom = "250px";
}
  
function closeDef() {
    document.getElementById("myBottombar").style.height = "0";
    document.getElementById("myBottombar").style.minHeight = "0";
    //document.getElementById("main").style.marginBottom= "0";
}

// Socket & ot.js initialization
socket.on('doc', function(data) {
    cm = CodeMirror.fromTextArea(document.getElementById('write'), {lineWrapping: true, lineNumbers: false, styleSelectedText: true, cursorHeight: 0.85});
    afterCMCreated();
    cm.setValue(data.str);
    var serverAdapter = new ot.SocketIOAdapter(socket);
    var editorAdapter = new ot.CodeMirrorAdapter(cm);
    var client = new ot.EditorClient(data.revision, data.clients, serverAdapter, editorAdapter);
})

socket.on('title', (title) => {
    console.log(title);
    document.getElementById("title").textContent = title;
});

socket.on("Log", (type, array) => {
    console.log("Receive Log:", type);
    if (type == 1) {
        keyboardLog = array;
        console.log(keyboardLog);
    }
    else if (type == 2) {
        mouseLog = array;
        console.log(mouseLog);
    }
});

socket.on("entry", (text, marks) => {
    entryCount++;
    cm.setValue(text);
    tagCount = 0;
    for (m of marks) {
        tag = m["tag"];
        from = m["from"];
        to = m["to"];
        if (tag === 'autosuggest-font') {
            promptInstance = cm.markText(from, to, {className: tag});
        }
        else {
            cm.markText(from, to, {className: tag});
        }
    }
});

function Test(){    // Demo
    socket.emit("sentToServer", "Shakehand");
    console.log(command);
    log(command);
}

function control(i){
    let functions = ""
    let command = "display"
    switch (i) {
        case 1: functions = "Feedback"; break;
        case 2: functions = "Highlight"; break;
        case 3: functions = "Keyboard"; command = "download"; break;
        case 4: functions = "Mouse"; command = "download"; break;
        case 5: functions = "Keyboard"; command = "get"; break;
        case 6: functions = "Mouse"; command = "get"; break;
    }
    log(command+":"+functions);
    socket.emit(command, functions);
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
        $("#pop-up-content-text").val("");
    }
    else if (type == 2) {
        last_menu_selection = 2;
        $("#pop-up-title-text").text("Replace with:");
        $("#pop-up-content-text").val("");
    }
    else if (type == 3){
        last_menu_selection = 3;
        $("#pop-up-title-text").text("Comment:");
        $("#pop-up-content-text").val("");
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
        case 3: {
            commentSet[tagCount] = sentence;
            tagCount++;
            commentLog[tagCount] = {content: selected_text, tag: assigned_tag, comment: sentence, from: current_sel_from, to: current_sel_to};
            break;
        }
    }
    $("#textmanipulation").css("display","none");
});

$(".pop-up-selection").on("click", function(){
    let id = this.id;
    if ((current_sel_from!=null) && (current_sel_to!=null)) {
        cm.markText(current_sel_from, current_sel_to, {className: id.replace(/\s/g,'')})
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
    var selectedText = cm.getRange(start, end);
    let sel_start;
    let sel_end;
    let sentence_back = sentence;
    //sentence = " "+sentence;
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
    var toAppend = document.createElement("change");
    toAppend.innerHTML = "<b>Prompt:</b> "+sentence+"<br> On: "+selectedText;
    document.getElementById("changetracker").appendChild(toAppend);
}

function handelReplace(sentence) {
    if (cm.somethingSelected()) {
        let start = cm.getCursor("from")
        let end = cm.getCursor("to")
        var selectedText = cm.getRange(start, end);
        if (!checkStartCoord(start, end)) {
            let tmp = start;
            start = end;
            end = tmp;
        }
        /*
        sentence = "("+cm.getRange(start,end)+")->" + sentence
        cm.replaceRange(sentence, start, end);
        end = cm.getCursor("to")
        */
        cm.markText(start, end, {className: "replacement-font"});
        socket.emit("replace", start, end, sentence.length, sentence);
        let s = analysisCoord(start)
        let e = analysisCoord(end)
        log("replace:("+s.l+","+s.c+"),("+e.l+","+e.c+"),"+sentence);
        var toAppend = document.createElement("change");
        toAppend.innerHTML = "<b>Replacement:</b> "+sentence+"<br> On: "+selectedText;
        document.getElementById("changetracker").appendChild(toAppend);
    }
}

function handelFeedback(sentence) {
    let start = cm.getCursor("from")
    let end = cm.getCursor("to")
    var selectedText = cm.getRange(start, end);
    if (!checkStartCoord(start, end)) {
        let tmp = start;
        start = end;
        end = tmp;
    }
    socket.emit("feedback", start, end, sentence);
    let s = analysisCoord(start)
    let e = analysisCoord(end)
    log("feedback:("+s.l+","+s.c+"),("+e.l+","+e.c+"),"+sentence);
    var toAppend = document.createElement("change");
    toAppend.innerHTML = "<b>Feedback:</b> "+sentence+"<br> On: "+selectedText;
    document.getElementById("changetracker").appendChild(toAppend);
}

function findMargin(pageX, pageY) {
    pageX -= 200;
    pageY -= 60;
    pageX = pageX < 10 ? 10 : pageX;
    pageX = pageX < 20 ? 20 : pageX;
    return {x: pageX, y: pageY}
}

// ContextMenu
$(function() {
    $.contextMenu({
        selector: '.CodeMirror',
        callback: function(key, options) {
            console.log("Click at：" + key);
        },
        items: {
            "Behaviors": {
                name: "Behaviors", 
                icon: "fa-flag",
                items: {
                    "pause": {
                        name: "Pause",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            if (cm.somethingSelected()) {
                                let start = cm.getCursor("from")
                                let end = cm.getCursor("to")
                                if (!checkStartCoord(start, end)) {
                                    let tmp = start;
                                    start = end;
                                    end = tmp;
                                }
                                current_sel_from = start;
                                current_sel_to = end;
                                assigned_tag = 'pause';
                                selected_text = cm.getSelection();
                                callTextPrompt(3);
                                cm.markText(start, end, {className: "pause-hl " + tagCount});
                                //socket.emit("highlight", start, end, "pause-hl");
                                let s = analysisCoord(start);
                                let e = analysisCoord(end);
                                log("pause:("+s.l+","+s.c+"),("+e.l+","+e.c+")");
                                
                            }
                        }
                    },
                    "fluent": {
                        name: "Fluent",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            if (cm.somethingSelected()) {
                                let start = cm.getCursor("from")
                                let end = cm.getCursor("to")
                                if (!checkStartCoord(start, end)) {
                                    let tmp = start;
                                    start = end;
                                    end = tmp;
                                }
                                current_sel_from = start;
                                current_sel_to = end;
                                assigned_tag = 'fluent';
                                selected_text = cm.getSelection();
                                callTextPrompt(3);
                                cm.markText(start, end, {className: "fluent-hl " + tagCount});
                                //socket.emit("highlight", start, end, "fluent-hl");
                                let s = analysisCoord(start);
                                let e = analysisCoord(end);
                                log("pause:("+s.l+","+s.c+"),("+e.l+","+e.c+")");
                            }
                        }
                    }
                }
            },
            "Content": {
                name: "Content", 
                icon: "edit",
                items: {
                    "excellent": {
                        name: "Excellent Work",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            if (cm.somethingSelected()) {
                                let start = cm.getCursor("from")
                                let end = cm.getCursor("to")
                                if (!checkStartCoord(start, end)) {
                                    let tmp = start;
                                    start = end;
                                    end = tmp;
                                }
                                current_sel_from = start;
                                current_sel_to = end;
                                assigned_tag = 'excellent';
                                selected_text = cm.getSelection();
                                callTextPrompt(3);
                                cm.markText(start, end, {className: "excellent-hl " + tagCount});
                                //socket.emit("highlight", start, end, "excellent-hl");
                                let s = analysisCoord(start);
                                let e = analysisCoord(end);
                                log("pause:("+s.l+","+s.c+"),("+e.l+","+e.c+")");
                                
                            }
                        }
                    },
                    "expansion": {
                        name: "Need Expansion",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            if (cm.somethingSelected()) {
                                let start = cm.getCursor("from")
                                let end = cm.getCursor("to")
                                if (!checkStartCoord(start, end)) {
                                    let tmp = start;
                                    start = end;
                                    end = tmp;
                                }
                                current_sel_from = start;
                                current_sel_to = end;
                                assigned_tag = 'expansion';
                                selected_text = cm.getSelection();
                                callTextPrompt(3);
                                cm.markText(start, end, {className: "expansion-hl " + tagCount});
                                //socket.emit("highlight", start, end, "expansion-hl");
                                let s = analysisCoord(start);
                                let e = analysisCoord(end);
                                log("pause:("+s.l+","+s.c+"),("+e.l+","+e.c+")");
                            }
                        }
                    },
                    "modification": {
                        name: "Need Modifaication",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            if (cm.somethingSelected()) {
                                let start = cm.getCursor("from")
                                let end = cm.getCursor("to")
                                if (!checkStartCoord(start, end)) {
                                    let tmp = start;
                                    start = end;
                                    end = tmp;
                                }
                                current_sel_from = start;
                                current_sel_to = end;
                                assigned_tag = 'modification';
                                selected_text = cm.getSelection();
                                callTextPrompt(3);
                                cm.markText(start, end, {className: "modification-hl " + tagCount});
                                //socket.emit("highlight", start, end, "modification-hl");
                                let s = analysisCoord(start);
                                let e = analysisCoord(end); 
                                log("pause:("+s.l+","+s.c+"),("+e.l+","+e.c+")");
                            }
                        }
                    },
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
                            updateSelect(start, end);
                            $("#cogndistortion").css("display","block");
                            let mg = findMargin(rootMenu.pageX, rootMenu.pageY)
                            $("#cogndistortion").css("margin-left", (mg.x)+"px");
                            $("#cogndistortion").css("margin-top", (mg.y)+"px");
                        }
                    },
                }
            },
            "reflection": {
                name: "Reflection", 
                icon: "fa-commenting-o",
                items: {
                    "reflection": {
                        name: "Reflection",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            callTextPrompt(3);
                            let mg = findMargin(rootMenu.pageX, rootMenu.pageY)
                            $("#textmanipulation").css("margin-left", (mg.x)+"px");
                            $("#textmanipulation").css("margin-top", (mg.y)+"px");
                        }
                    },
                    "liwc": {
                        name: "LIWC",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            callTextPrompt(3);
                            let mg = findMargin(rootMenu.pageX, rootMenu.pageY)
                            $("#textmanipulation").css("margin-left", (mg.x)+"px");
                            $("#textmanipulation").css("margin-top", (mg.y)+"px");
                        }
                    },
                    "watson": {
                        name: "Watson",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            callTextPrompt(3);
                            let mg = findMargin(rootMenu.pageX, rootMenu.pageY)
                            $("#textmanipulation").css("margin-left", (mg.x)+"px");
                            $("#textmanipulation").css("margin-top", (mg.y)+"px");
                        }
                    }
                }
            },
            "suggest": {
                name: "Suggest", 
                icon: "edit",
                items: {
                    "prompt": {
                        name: "Prompt",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            console.log(opt, rootMenu, originalEvent)
                            callTextPrompt(1);
                            let mg = findMargin(rootMenu.pageX, rootMenu.pageY)
                            $("#textmanipulation").css("margin-left", (mg.x)+"px");
                            $("#textmanipulation").css("margin-top", (mg.y)+"px");
                            
                        }
                    },
                    "replace":  {
                        name: "Replace",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            callTextPrompt(2);
                            let mg = findMargin(rootMenu.pageX, rootMenu.pageY)
                            $("#textmanipulation").css("margin-left", (mg.x)+"px");
                            $("#textmanipulation").css("margin-top", (mg.y)+"px");
                        }
                    }
                }	
            },
            "feedback": {
                name: "Feedback", 
                icon: "fa-commenting-o",
                callback: function(itemKey, opt, rootMenu, originalEvent) {
                    callTextPrompt(3);
                    let mg = findMargin(rootMenu.pageX, rootMenu.pageY)
                    $("#textmanipulation").css("margin-left", (mg.x)+"px");
                    $("#textmanipulation").css("margin-top", (mg.y)+"px");
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
                            cursor = cm.getCursor();
                            cm.findMarksAt(cursor).forEach(mark => mark.clear());
                            console.log("clear marks", cursor);
                            socket.emit("utility", "clear", cursor);
                            log("clear");
                        }
                    },
                    "save":  {
                        name: "Save",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            let content = cm.getValue();
                            let package = {text: content, log: commentLog, mouse: mouseLog, key: keyboardLog};
                            socket.emit("file", entryCount, package);
                        }
                    }
                }
            }
        }
    });
});

function clearBottomBarElement(){
    document.getElementById("myBottombar").innerHTML = "";
}

function newBottomBarElement(title, body) {
    let newDiv = "<div><a href=\"javascript:void(0)\" class=\"closedef onedeftitle\" onclick=\"closeDef()\">" + title + "</a>";
    newDiv += "<a href=\"#\" class=\"onedefbody\">" + body + "</a></div>"
    document.getElementById("myBottombar").innerHTML += newDiv;
}

// Mouse Click Activities
function afterCMCreated() {
    cm.on("mousedown", function () {
        movedByMouse = true;
    });

    cm.on("cursorActivity", function () {
        if (movedByMouse) {
            movedByMouse = false;
            if (!cm.getSelection()) {
                closeDef();
                //branch based on whether a highlight was clicked here
                let marks = cm.findMarksAt(cm.getCursor())
                let len = marks.length
                if(len != 0) {
                    for (let mark of marks){
                        let tag = mark["className"];
                        let tags = tag.split(" ");
                        let id = -1;
                        if (tags[1]) {
                            id = parseInt(tags[1]);
                        }
                        openDef();
                        clearBottomBarElement();
                        switch(tags[0]) {
                            case "BeingRight" : populateDistortion("BeingRight"); break;
                            case "Blaming" : populateDistortion("Blaming"); break;
                            case "Catastrophizing" : populateDistortion("Catastrophizing"); break;
                            case "MindReading" : populateDistortion("MindReading"); break;
                            case "Splitting" : populateDistortion("Splitting"); break;
                            case "Should" : populateDistortion("Should"); break;
                            case "FortuneTelling" : populateDistortion("FortuneTelling"); break;
                            default: {
                                newBottomBarElement(tags[0], commentSet[id]);
                                //closeDef();
                            }
                        }
                    }
                }
            }
        }
    });

    cm.on("beforeChange", function () {
        movedByMouse = false;
    });
}
