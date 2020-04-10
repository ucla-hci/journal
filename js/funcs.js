var num = 0;
var write = document.getElementById('write');
var entry = CodeMirror.fromTextArea(write, {
    lineWrapping: true, 
    lineNumbers: false, 
    styleSelectedText: true,
    cursorHeight: 0.85
});

var feedbackMsg = ""

var socket = io();

var entries;
var key, prevKey, flag = 0;
var suggestion, s_start, s_end;

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
        document.getElementById("title").innerHTML = "Good Entry";// + today;
        socket.emit('title', "Good Entry");
    } else if (mood == 'bad') {
        document.getElementById("title").innerHTML = "Bad Entry";// + today;
        socket.emit('title', "Bad Entry");
    } else if (mood == 'neutral') {
        document.getElementById("title").innerHTML = "Neutral Entry";// + today;
        socket.emit('title', "Neutral Entry");
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

function acceptChange() {
    entry.replaceRange(suggestion, s_start, s_end);
    $("#textmanipulation").css("display","none");
}

function rejectChange() {
    $("#textmanipulation").css("display","none");
}

// CodeMirro Decoration Functions

function handlePrompt(start, end, sel_start=null, sel_end=null){
    entry.markText(start, end, {className: "autosuggest-font"})
    if ((sel_start != null) && (sel_end != null)) {
        entry.markText(start, end, {className: "autosuggest-background"});
    }
}

function handleReplace(start, end, s){
    entry.markText(start, end, {className: "replacement-font"});
    console.log(entry.charCoords(start));
    console.log(entry.charCoords(start)["left"]);
    console.log(entry.charCoords(start)["top"]);
    var newLeft = entry.charCoords(start)["left"].toString() + "px";
    var newTop = (entry.charCoords(start)["top"]+30).toString() + "px"

    $("#textmanipulation").css("display","block");
    $("#textmanipulation").css("margin-left", newLeft);
    $("#textmanipulation").css("margin-top", newTop);
    document.getElementById("pop-up-title-text").textContent = s;

    suggestion = s;
    s_start = start;
    s_end = end;
}

function handleHighlight(start, end){
    entry.markText(start, end, {className: "highlight-background"});
}

function handleCognDistortion(start, end, id){
    entry.markText(start, end, {className: "cognitive-distortion"});
}

function handleFeedback(start, end, sentence){
    document.getElementById("deftitle").innerHTML = "Expert Feedback";
    feedbackMsg += "\n" + "(" + start["line"] + "," + start["ch"] + ")->(" + + end["line"] + "," + end["ch"] + "): " + sentence
    console.log(feedbackMsg);
    document.getElementById("defbody").innerHTML == feedbackMsg;
    openDef();
}

function handleOperation(command){
    switch (command){
        case 'undo': entry.undo(); break;
        case 'redo': entry.redo(); break;
        case 'clear': entry.clear(); break;
    }
}

// Socket & ot.js initialization
socket.on('doc', function(data) {
    console.log(data);
    entry.setValue(data.str);
    var serverAdapter = new ot.SocketIOAdapter(socket);
    var editorAdapter = new ot.CodeMirrorAdapter(entry);
    var client = new ot.EditorClient(data.revision, data.clients, serverAdapter, editorAdapter);
})

// Receive Expert Command from Server
socket.on("sendToClient", (command) => {
    console.log(command);
});

socket.on("prompt1", (start, end, l) => {
    console.log("Prompt-Insert:", start, end, l);
    handlePrompt(start, end);
});

socket.on("prompt2", (sel_start, sel_end, start, end, l) => {
    console.log("Prompt-Select:", sel_start, sel_end, start, end, l);
    handlePrompt(start, end, sel_start, sel_end);
});

socket.on("replace", (start, end, l, s) => {
    console.log("Replace:", start, end, l, s);
    handleReplace(start, end, s)
});

socket.on("highlight", (start, end) => {
    console.log("Highlight:", start, end);
    handleHighlight(start, end)
});

socket.on("cd", (start, end, id) => {
    console.log("CD:", start, end, id);
    handleCognDistortion(start, end)
});

socket.on("feedback", (start, end, sentence) => {
    console.log("Feedback:", start, end, sentence);
    handleFeedback(start, end, sentence)
});

socket.on("utility", (command) => {
    console.log("utility:", command);
    handleFeedback(command)
});

socket.on("turnon", functions => {
    console.log("turnon:", functions);
    //
  });

socket.on("display", functions => {
    console.log("display:", functions);
    if (functions == "Feedback") {
        openDef();
    }
});

// Demo: How to get text from CodeMirror
function fetch(){
    var text = entry.getValue();
    console.log("Socket:",text);
}