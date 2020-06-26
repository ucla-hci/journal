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

var promptObjects = new Array();
//var globalFeedBackMessage = new Map();

function darkMode(){
    if($('.switch-anim').prop('checked')){
        document.getElementById("theme").setAttribute("href","css/theme_dark.css");
    }else{
        document.getElementById("theme").setAttribute("href","css/theme_light.css");
    }
}

function fetch(){
    var text = entry.getValue();
    console.log("Current Textarea:",text);
    return text;
}

function testNLP() {
    let text = fetch();
    let sentiment = checkKeywordsSentiment(text);
    for (s in sentiment){
        findKeyword(s, sentiment[s]);
    }
}

function testNLP2() {
    let text = fetch();
    let sentiment = checkKeywordsSentiment(text);
    let keywords = [];
    for (s in sentiment){
        keywords.push(s);
    }
    console.log(keywords);
    let emotion = checkKeywordsEmotion(JSON.stringify({"text":text, "keywords": keywords}));
    for (e in emotion){
        findKeyword(e, emotion[e]);
    }
}

function findKeyword(keyword, type){
    let cursor = entry.getSearchCursor(keyword);
    if (type === "netural") {
        return;
    }

    while (cursor.findNext()){
        console.log(cursor.from(), cursor.to());
        entry.markText(cursor.from(), cursor.to(), {className: type+"-font"});
    }
}

function loadJSON(){
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/load",
        async: false,
        data: { }
    });

    return jqXHR.responseText;
}

function checkKeywordsEmotion(input){
    console.log("Calling backend");
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/emotions",
        async: false,
        data: { mydata: input }
    });
    
    let json = JSON.parse(jqXHR.responseText);
    let keywords = json["emotion"]["targets"]
    let output = {}
    for (k of keywords){
        let text = k["text"];
        let emotion = k["emotion"];
        let tag = "";
        let max = 0;
        for (e in emotion){
            if (emotion[e] >= max){
                tag = e;
                max = emotion[e];
            }
        }
        output[text]=tag;
    }
    console.log(output);
    return output;
}

function checkKeywordsSentiment(input){
    console.log("Calling backend");
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/keywords",
        async: false,
        data: { mydata: input }
    });

    let json = JSON.parse(jqXHR.responseText);
    let keywords = json["keywords"]
    let output = {}
    for (k of keywords){
        let text = k["text"];
        let tag = k["sentiment"]["label"]
        output[text]=tag;
    }
    console.log(output);
    return output;
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
            let marks = entry.findMarksAt(entry.getCursor())
            let len = marks.length
            if(len != 0) {
                clearBottomBarElement();
                for (let mark of marks){
                    console.log(entry.getCursor());
                    let tag = mark["className"];
                    switch(tag) {
                        case "BeingRight" : populateDistortion("BeingRight"); break;
                        case "Blaming" : populateDistortion("Blaming"); break;
                        case "Catastrophizing" : populateDistortion("Catastrophizing"); break;
                        case "MindReading" : populateDistortion("MindReading"); break;
                        case "Splitting" : populateDistortion("Splitting"); break;
                    }
                }
            }
        }
    }
});

entry.on("keydown", function() {
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

// +input -> user type; undefined -> expert type
entry.on("change", function (cm, changeObj) {
    let input = changeObj.text;
    let origin = changeObj.origin ? true : false    
    if (origin && (promptObjects != undefined) && (promptObjects.length>=1)){
        let cStart = changeObj.from;
        let cEnd = changeObj.to;
        let delIndex = -1;

        promptObjects.some(function(obj, index){    // Find, and break.
            let mtLocation = obj.find()
            let start = mtLocation.from;
            let end = mtLocation.to;
            console.log("check:", cStart, cEnd, start, end)
            if (checkInRange(cStart, start, end, -1) || checkInRange(cEnd, start, end)) {
                console.log("Auto Fade Away, del:", start, end);
                cm.replaceRange(input, start, end)
                delIndex = index;
                return true;
            }
        });

        console.log("before del:", promptObjects)
        if (delIndex > -1) {
            promptObjects.splice(delIndex, 1)
        }
        console.log("after del:", promptObjects)
        //let first = checkInRange(cStart, start, end, -2)
        //let second = checkInRange(cEnd, start, end)
        //console.log(first, second)
    }
});

function checkInRange(target, start, end, offset=0) {
    // Offset > 1 need special handle, otherwise document may lose contents
    if (offset > 0) {
        end.ch += offset;
    }
    else {
        start.ch += offset;
    }
    if ((target.line >= start.line) && (target.ch >= start.ch) && (target.line <= end.line) && (target.ch <= end.ch)) {
        return true;
    }
    else {
        console.log((target.line >= start.line),(target.ch >= start.ch),(target.line <= start.line),(target.ch <= start.ch))
        return false;
    }
}

function isMovementKey(keyCode) {
    return 33 <= keyCode && keyCode <= 40;
}

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
    document.getElementById("myBottombar").style.height = "auto";
    document.getElementById("myBottombar").style.minHeight = "200px";
    document.getElementById("main").style.marginBottom = "250px";
}
  
function closeDef() {
    document.getElementById("myBottombar").style.height = "0";
    document.getElementById("myBottombar").style.minHeight = "0";
    document.getElementById("main").style.marginBottom= "0";
}

function loader() {
    document.getElementById("main").style.display = "none";
    document.getElementById("temp").style.display = "block";
    /*
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

    document.getElementById("alltypes").style.maxHeight = document.getElementById("alltypes").scrollHeight + "px";*/
}

function acceptChange() {
    entry.replaceRange(suggestion, s_start, s_end);
    $("#textmanipulation").css("display","none");
}

function rejectChange() {
    $("#textmanipulation").css("display","none");
}

// CodeMirror Coordinates Utilities
function analysisCoord(coord) {
    if (coord != null) {
        return {l:parseInt(coord["line"]), c:parseInt(coord["ch"])}
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

// CodeMirro Decoration Functions
function handlePrompt(start, end, sel_start=null, sel_end=null){
    //console.log("add prompt, start:", start, "end:", end, "sel_start:", sel_start, "sel_end:", sel_end)
    let promptObject = entry.markText(start, end, {className: "autosuggest-font"})
    promptObjects.push(promptObject)
    if ((sel_start != null) && (sel_end != null)) {
        entry.markText(sel_start, sel_end, {className: "autosuggest-background"});
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
    console.log(id.replace(/\s/g,''));
    entry.markText(start, end, {className: id.replace(/\s/g,'')});
}

function handleFeedback(start, end, sentence){
    feedbackMsg += "<br>" + "(" + start["line"] + "," + start["ch"] + ")";
    if (!compareCoord(start, end)) {
        feedbackMsg += "->(" + + end["line"] + "," + end["ch"] + ")";
    }
    feedbackMsg += ": "+ sentence;
    feedbackKey = start["line"] + "," + start["ch"] + "," + end["line"] + "," + end["ch"];

    clearBottomBarElement();
    newBottomBarElement("Expert Feedback", sentence);
    openDef();
}

function clearBottomBarElement(){
    document.getElementById("myBottombar").innerHTML = "";
}

function newBottomBarElement(title, body) {
    let newDiv = "<div><a href=\"javascript:void(0)\" class=\"closedef onedeftitle\" onclick=\"closeDef()\">" + title + "</a>";
    newDiv += "<a href=\"#\" class=\"onedefbody\">" + body + "</a></div>"
    document.getElementById("myBottombar").innerHTML += newDiv;
}

function populateDistortion(name) {
    if(name == "BeingRight") {
        newBottomBarElement("Being Right", "Being right distortion demo text"); }
    else if(name == "Blaming") {
        newBottomBarElement("Blaming", "Blaming distortion demo text"); }
    else if(name == "Catastrophizing") {
        newBottomBarElement("Catastrophizing", "Catastrophizing distortion demo text"); }
    else if(name == "MindReading") { 
        newBottomBarElement("MindReading", "MindReading distortion demo text"); }
    else if(name == "Splitting") { 
        newBottomBarElement("Splitting", "Splitting distortion demo text"); }
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
    handleCognDistortion(start, end, id);
});

socket.on("feedback", (start, end, sentence) => {
    console.log("Feedback:", start, end, sentence);
    handleFeedback(start, end, sentence)
});

socket.on("utility", (command) => {
    console.log("utility:", command);
    handleFeedback(command)
});

socket.on("download", functions => {
    console.log("download:", functions);
    if (functions == "Keyboard") {
        reportKeyboardLog();
    }
    else if (functions == "Mouse") {
        reportMouseLog();
    }
});

socket.on("get", functions => {
    console.log("get:", functions);
    if (functions == "Keyboard") {
        if (UnixZero != -1) {
            socket.emit('Log', 1, keyboardlog);
        }
    }
    else if (functions == "Mouse") {
        if (UnixZero != -1) {
            socket.emit('Log', 2, mouselog);
        }
    }
});

socket.on("display", functions => {
    console.log("display:", functions);
    if (functions == "Feedback") {
        openDef();
    }
});