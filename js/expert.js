var socket = io();
var cm;
socket.on('doc', function(data) {
    cm = CodeMirror.fromTextArea(document.getElementById('write'), {lineNumbers: false, styleSelectedText: true});
    cm.setValue(data.str);
    var serverAdapter = new ot.SocketIOAdapter(socket);
    var editorAdapter = new ot.CodeMirrorAdapter(cm);
    var client = new ot.EditorClient(data.revision, data.clients, serverAdapter, editorAdapter);
})

function Test(){
    let command = "ShakeHand:";
    socket.emit("sentToServer", command);
    console.log(command);
    log(command);
}

function control(i){
    let command = "On:"

    switch (i) {
        case 1: command += "AutoSug"; break;
        case 3: command += "Keyboard"; break;
        case 4: command += "Mouse"; break;
    }
    log(command);
    socket.emit("sentToServer", command);
}

function log(sentence) {
    let html = "<li><p>" + sentence + "</p></li>"
    $("#logTable").append(html);
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
    document.getElementById("myBottombar").style.height = "250px";
    document.getElementById("main").style.marginBottom = "250px";
}
  
function closeDef() {
    document.getElementById("myBottombar").style.height = "0";
    document.getElementById("main").style.marginBottom= "0";
}


$(".close-pop-up").on("click", function(){
    $("#cd-pop-up").css("display","none");
});

$(".pop-up-selection").one("click", function(){
    let id = this.id;
    console.log(id);
    $("#cd-pop-up").css("display","none");
});

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
                            let start = cm.getCursor("to");
                            let _line = parseInt(start["line"]);
                            let _ch = parseInt(start["ch"]);
                            let sentence = prompt("Please type your prompt below:","...");
                            if(sentence){
                                cm.replaceRange(sentence, start);
                                let end = cm.getCursor("to");
                                cm.markText(start, end, {className: "AutoSuggest-font"});

                                let command = "Prompt:(" + _line + "," + _ch + '),(' + end.line + "," + end.ch + ")";
                                socket.emit("sentToServer", command);
                                log(command);
                            }
                        }
                    },
                    "replace":  {
                        name: "Replace",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            let start = cm.getCursor("from")
                            let end = cm.getCursor("to")
                            let from_line = parseInt(cm.getCursor("from")["line"])
                            let from_ch = parseInt(cm.getCursor("from")["ch"])
                            let to_line = parseInt(cm.getCursor("to")["line"])
                            let to_ch = parseInt(cm.getCursor("to")["ch"])
                            let sentence = prompt("Please type replacement below:","...");
                            if(sentence){
                                cm.replaceRange(sentence, start, end);
                                end = cm.getCursor("to")
                                cm.markText(start, end, {className: "Replacement-font"});

                                let command = "Replace:(" + from_line + "," + from_ch + '),(' + to_line + "," + to_ch + ")";
                                socket.emit("sentToServer", command);
                                log(command);
                            }
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
                            $("#cd-pop-up").css("display","block");
                        }
                    },
                    "highlight":{
                        name: "Highlight",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            if (cm.somethingSelected()) {
                                let from_line = parseInt(cm.getCursor("from")["line"])
                                let from_ch = parseInt(cm.getCursor("from")["ch"])
                                let to_line = parseInt(cm.getCursor("to")["line"])
                                let to_ch = parseInt(cm.getCursor("to")["ch"])
                                console.log({line: from_line, ch: from_ch}, {line: to_line, ch: to_ch})
                                cm.markText({line: from_line, ch: from_ch}, {line: to_line, ch: to_ch}, {className: "styled-background"})
                                let command = "HighLt:(" + from_line + "," + from_ch + '),(' + to_line + ',' + to_ch + '),' + '[distortion-type]';
                                socket.emit("sentToServer", command);
                                console.log(command);
                                log(command);
                            }
                        }
                    }
                }
            },
            "feedback": {
                name: "Feedback", 
                icon: "fa-commenting-o",
                callback: function(itemKey, opt, rootMenu, originalEvent) {
                    let from_line = parseInt(cm.getCursor("from")["line"])
                    let from_ch = parseInt(cm.getCursor("from")["ch"])
                    let to_line = parseInt(cm.getCursor("to")["line"])
                    let to_ch = parseInt(cm.getCursor("to")["ch"])
                    let sentence = prompt("Please type your feedback below:","...");
                    if(sentence){
                        let command = "FeedBk:(" + from_line + "," + from_ch + '),(' + to_line + ',' + to_ch + '),' + sentence;
                        socket.emit("sentToServer", command);
                        console.log(command);
                        log(command);
                    }
                }
            },
            "utility": {
                name: "Utility",
                icon: "fa-cog",
                items: {
                    "undo": {
                        name: "Undo Last",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            cm.undo()
                        }
                    },
                    "redo": {
                        name: "Redo Last",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            cm.redo()
                        }
                    },
                    "clear":  {
                        name: "Others",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            console.log("clear all")
                            console.log(cm.setValue(""));
                        }
                    }
                }
            }
        }
    });
});