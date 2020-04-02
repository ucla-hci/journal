var num = 0;
var write = document.getElementById('write');
var entry = CodeMirror.fromTextArea(write, {
    lineWrapping: true, 
});

var entries;
var key, prevKey, flag = 0;

function loadJSON(){
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://localhost:5000/load",
        async: false,
        data: { }
    });

    return jqXHR.responseText;
}

function runPyScript(input){
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://localhost:5000/login",
        async: false,
        data: { mydata: input }
    });

    return jqXHR.responseText;
}

function runPyScript_check(input){
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/check",
        async: false,
        data: { mydata: input }
    });
    return jqXHR.responseText;
}

//handling mouse clicks... 
//jesus, that was a whole thing to track down
var movedByMouse = false;
entry.on("mousedown", function () {
    movedByMouse = true;
});

entry.on("cursorActivity", function () {
    if (movedByMouse) {
        movedByMouse = false;
        if (!entry.getSelection()) {
            closeDef();
            //branch based on whether a highlight was clicked here
            if(entry.findMarksAt(entry.getCursor()).length != 0) {
                if(entry.findMarksAt(entry.getCursor())[0]["className"] == "markneg") 
                    openDef();
            }
        }
    }
});

entry.on("keydown", function () {
    prevKey = key;
    key = event.keyCode;

    if (isMovementKey(event.which)) {
        movedByMouse = false;
    }

    if(key == 190 || prevKey == 16 && key == 49 || prevKey == 16 && key == 191) {
        entry.getAllMarks().forEach(mark => mark.clear());
        var result = runPyScript(entry.doc.getValue());
        var resparse = JSON.parse(result);

        for(i = 0; i < resparse["valence"].length; i++) {
            if(resparse["valence"][i] == "negative")
                entry.markText(entry.doc.posFromIndex(resparse["starts"][i]), entry.doc.posFromIndex(resparse["ends"][i]), {className: "markneg"});
        } 
    }
});

entry.on("beforeChange", function () {
    movedByMouse = false;
});

function isMovementKey(keyCode) {
    return 33 <= keyCode && keyCode <= 40;
};

function openEntry(date) {
    for(var i = 0; i < entries.length; ++i) {
        if (entries[i]["date"] == date) {
            document.getElementById("temp").style.display = "none";
            document.getElementById("main").style.display = "block";

            document.getElementById("title").innerHTML = "Bad Day :(";
            entry.setValue(entries[i]["content"]);
            console.log(entries[i]["content"]);
        }
    }
}

function newEntry(){
    document.getElementById("temp").style.display = "block";
    document.getElementById("main").style.display = "none";
}

function toEntry(mood){
    document.getElementById("temp").style.display = "none";
    document.getElementById("main").style.display = "block";

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    today = mm + '/' + dd;

    if (mood == 'good') {
        document.getElementById("title").innerHTML = "Good Entry " + today;
    } else if (mood == 'bad') {
        document.getElementById("title").innerHTML = "Bad Entry " + today;
    } else if (mood == 'neutral') {
        document.getElementById("title").innerHTML = "Neutral Entry " + today;
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
    document.getElementById("myBottombar").style.height = "250px";
    document.getElementById("main").style.marginBottom = "250px";
}
  
function closeDef() {
    document.getElementById("myBottombar").style.height = "0";
    document.getElementById("main").style.marginBottom= "0";
}

function loader() {
    document.getElementById("main").style.display = "none";
    document.getElementById("temp").style.display = "block";

    var temp = loadJSON();
    var parsed = JSON.parse(temp);
    entries = parsed["content"]["entries"];

    var coll = document.getElementsByClassName("collapsible");
    var i;

    for(i = 0; i < entries.length; i++) {
        if(entries[i]["mood"] == "bad") {
            var entry = document.createElement("div");
            entry.innerHTML = entries[i]["date"];
            entry.className = "entryList";
            entry.setAttribute("onclick", "openEntry('"+entries[i]["date"]+"')");
            document.getElementById("baddays").appendChild(entry);
        }
    }

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight){
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            } 
        });
    }

    document.getElementById("alltypes").style.maxHeight = document.getElementById("alltypes").scrollHeight + "px";
}

var socket = io();
socket.on('doc', function(data) {
    console.log(data);
    entry.setValue(data.str);
    var serverAdapter = new ot.SocketIOAdapter(socket);
    var editorAdapter = new ot.CodeMirrorAdapter(entry);
    var client = new ot.EditorClient(data.revision, data.clients, serverAdapter, editorAdapter);
})

function getFirstCoor(command, tag) {
    let bias = tag.length + 1;
    let start = bias+1;
    let comma = command.indexOf(",",start);
    let end = command.indexOf(")",comma)
    let _line = parseInt(command.substring(start,comma+1));
    let _char = parseInt(command.substring(comma+1,end));
    return {line: _line, ch: _char}
}

function getSecondCoor(command, tag) {
    let bias = tag.length + 1;
    let start = command.indexOf(")",bias) + 3;
    let comma = command.indexOf(",",start);
    let end = command.indexOf(")",comma)
    let _line = parseInt(command.substring(start,comma));
    let _char = parseInt(command.substring(comma+1,end));
    console.log("2nd:", start, comma, end)
    return {line: _line, ch: _char}
}

function handleCommand(command){
    console.log(command)
    if (command.indexOf("HighLt:") == 0){
    let from = getFirstCoor(command, "HighLt")
    let to = getSecondCoor(command, "HighLt")
    entry.markText(from, to, {className: "styled-background"})
    }
    else if (command.indexOf("AutoSug:") == 0) {
    let start = getFirstCoor(command, "AutoSug");
    let end = getSecondCoor(command, "AutoSug");
    entry.markText(start, end, {className: "AutoSuggest-font"})
    }
    else if (command.indexOf("On:Keyboard") == 0) {
    $('#keyboardlog').trigger("click");
    }
    else if (command.indexOf("On:Mouse") == 0) {
    reportMouseLog();
    }
}
// Receive Expert Command from Server
socket.on("sendToClient", command => {
    console.log(command);
    handleCommand(command.command);
});

// Demo: How to get text from CodeMirror
function fetch(){
    var text = entry.getValue();
    console.log("Socket:",text);
}