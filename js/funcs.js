var num = 0;
var write = document.getElementById('write');
var cm = CodeMirror.fromTextArea(write, {
    lineWrapping: true, 
    lineNumbers: false, 
    styleSelectedText: true,
    cursorHeight: 0.85
});

var feedbackMsg = ""

var entries;
var key, prevKey, flag = 0;
var suggestion, s_start, s_end;

var constructive = ['help', 'better', 'improve', 'practice', 'workon', 'understand', 'analyze', 'plan', 'change', 'try']
var dysfunctional = ['loser', 'suck', 'hate', 'lazy', 'theworst', 'useless', 'failure', 'pathetic', 'good-for-nothing', 'dumb', 'stupid']
var trigger = ['cannot', 'ca', 'always', 'never', 'ever', 'must', 'mustnot', 'should', 'shouldnot', 'haveto', 'orelse', 'every', 'everything', 'nothing', 'anything', 'all', 'none', 'any', 'atall', 'everybody', 'nobody', 'anybody', 'noone', 'only']
var pronoun = ['I', 'me', 'my', 'myself']

// Styles Switching
function darkMode(){
    if($('.switch-anim').prop('checked')){
        document.getElementById("theme").setAttribute("href","css/theme_dark.css");
    }else{
        document.getElementById("theme").setAttribute("href","css/theme_light.css");
    }
}


// Color keywords by sentiments
function testNLP() {
    cleanMarks();
    $('#sentiment').css("display","block");
    $('#emotion').css("display","none");
    $('#category').css("display","none");
    let text = fetchContent();
    let sentiment = checkKeywordsSentiment(text);
    for (s in sentiment){
        markKeywords(s, sentiment[s]);
    }
}

// Color keywords by emotions
function testNLP2() {
    cleanMarks();
    $('#sentiment').css("display","none");
    $('#emotion').css("display","block");
    $('#category').css("display","none");
    let text = fetchContent();
    let sentiment = checkKeywordsSentiment(text);
    let keywords = [];
    for (s in sentiment){
        keywords.push(s);
    }
    console.log(keywords);
    let emotion = checkKeywordsEmotion(JSON.stringify({"text":text, "keywords": keywords}));
    for (e in emotion){
        markKeywords(e, emotion[e]);
    }
}

// Color keywords by categories
function testNLP3() {
    $('#sentiment').css("display","none");
    $('#emotion').css("display","none");
    $('#category').css("display","block");
    cleanMarks();
    for (kw of constructive){
        markKeywords(kw, "constructive");
    }
    for (kw of dysfunctional){
        markKeywords(kw, "dysfunctional");
    }
    for (kw of trigger){
        markKeywords(kw, "trigger");
    }
    for (kw of pronoun){
        markKeywords(kw, "pronoun");
    }
}


// CodeMirror Utilities
var markTextCollections = new Array();  // Save all markText result

function saveContent() {
    let content = fetchContent();
    let marks = fetchMarks();
    let jString = JSON.stringify({"content":content, "marks":marks});
    saveJSON(jString, "test");
}

function loadContent() {
    let jString = loadJSON("test");
    let data = JSON.parse(jString);
    let text = data["content"];
    cm.setValue(text);
    let marks = data["marks"];
    for (m of marks) {
        tag = m["tag"];
        from = m["from"];
        to = m["to"];
        cm.markText(from, to, {className: tag});
    }
}

function handleOperation(command){
    switch (command){
        case 'undo': cm.undo(); break;
        case 'redo': cm.redo(); break;
        case 'clear': cm.clear(); break;
    }
}

function fetchContent(){
    var text = cm.getValue();
    console.log("Current Textarea:",text);
    return text;
}

function cleanMarks() {
    cm.getAllMarks().forEach(mark => {
        mark.clear();
    });
}

function fetchMarks() {
    var marksOutput = new Array();
    cm.getAllMarks().forEach(mark => {
        console.log(mark, mark.find());
        marksOutput.push({"tag": mark.className, "from": {"line":mark.find().from.line, "ch":mark.find().from.ch}, "to": {"line":mark.find().to.line, "ch":mark.find().to.ch}})
    });
    return marksOutput;
}

function markKeywords(keyword, type){
    let cursor = cm.getSearchCursor(keyword);
    if (type === "netural") {   // Do not color netural keywords
        return;
    }

    while (cursor.findNext()){
        let from = cursor.from();
        let to = cursor.to();
        let word = cm.findWordAt(from);
        if ((word.anchor.line === from.line) && (word.anchor.ch === from.ch) && (word.head.line === to.line) && (word.head.ch === to.ch)){
            cm.markText(cursor.from(), cursor.to(), {className: type+"-font"});
        }
        //let marker = 
        //markTextCollections.push(marker);
    }
}


// Watson APIs: Client-Server Comunications
function loadJSON(name){
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/load",
        async: false,
        data: { filename: name}
    });
    //console.log(jqXHR.responseText);
    return jqXHR.responseText;
}

function saveJSON(input, name){
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/save",
        async: false,
        data: { entry: input, filename: name}
    });
    console.log(jqXHR.responseText);
}

function checkKeywordsCats(input){
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/check",
        async: false,
        data: { mydata: input }
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


//Handling mouse activities
var movedByMouse = false;
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
                clearBottomBarElement();
                for (let mark of marks){
                    console.log(cm.getCursor());
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

cm.on("keydown", function() {
    prevKey = key;
    key = event.keyCode;

    if (isMovementKey(event.which)) {
        movedByMouse = false;
    }

    /*
    if(key == 190 || prevKey == 16 && key == 49 || prevKey == 16 && key == 191) {
        cm.getAllMarks().forEach(mark => mark.clear());
        var result = runPyScript(cm.doc.getValue());
        var resparse = JSON.parse(result);

        for(i = 0; i < resparse["valence"].length; i++) {
            if(resparse["valence"][i] == "negative")
                cm.markText(cm.doc.posFromIndex(resparse["starts"][i]), cm.doc.posFromIndex(resparse["ends"][i]), {className: "markneg"});
        } 
    }*/
});

cm.on("beforeChange", function () {
    movedByMouse = false;
});

/*
// +input -> user type; undefined -> expert type
cm.on("change", function (cm, changeObj) {
    let input = changeObj.text;
    let origin = changeObj.origin ? true : false    
    if (origin && (markTextCollections != undefined) && (markTextCollections.length>=1)){
        let cStart = changeObj.from;
        let cEnd = changeObj.to;
        let delIndex = -1;

        markTextCollections.some(function(obj, index){    // Find, and break.
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

        console.log("before del:", markTextCollections)
        if (delIndex > -1) {
            markTextCollections.splice(delIndex, 1)
        }
        console.log("after del:", markTextCollections)
        //let first = checkInRange(cStart, start, end, -2)
        //let second = checkInRange(cEnd, start, end)
        //console.log(first, second)
    }
});
*/
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
            cm.setValue(entries[i]["content"]);
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
        //socket.emit('title', "Good Entry");
    } else if (mood == 'bad') {
        document.getElementById("title").innerHTML = "Bad Entry";// + today;
        //socket.emit('title', "Bad Entry");
    } else if (mood == 'neutral') {
        document.getElementById("title").innerHTML = "Neutral Entry";// + today;
        //socket.emit('title', "Neutral Entry");
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
            var cm = document.createElement("div");
            cm.innerHTML = entries[i]["date"];
            cm.className = "cmList";
            cm.setAttribute("onclick", "opencm('"+entries[i]["date"]+"')");
            document.getElementById("baddays").appendChild(cm);
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
    cm.replaceRange(suggestion, s_start, s_end);
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

// CodeMirror Decoration Functions
function handlePrompt(start, end, sel_start=null, sel_end=null){
    //console.log("add prompt, start:", start, "end:", end, "sel_start:", sel_start, "sel_end:", sel_end)
    let promptObject = cm.markText(start, end, {className: "autosuggest-font"})
    //markTextCollections.push(promptObject)
    if ((sel_start != null) && (sel_end != null)) {
        promptObject = cm.markText(sel_start, sel_end, {className: "autosuggest-background"});
        //markTextCollections.push(promptObject);
    }
}

function handleReplace(start, end, s){
    let marker = cm.markText(start, end, {className: "replacement-font"});
    //markTextCollections.push(marker);
    console.log(cm.charCoords(start));
    console.log(cm.charCoords(start)["left"]);
    console.log(cm.charCoords(start)["top"]);
    var newLeft = cm.charCoords(start)["left"].toString() + "px";
    var newTop = (cm.charCoords(start)["top"]+30).toString() + "px"

    $("#textmanipulation").css("display","block");
    $("#textmanipulation").css("margin-left", newLeft);
    $("#textmanipulation").css("margin-top", newTop);
    document.getElementById("pop-up-title-text").textContent = s;

    suggestion = s;
    s_start = start;
    s_end = end;
}

function handleHighlight(start, end){
    let marker = cm.markText(start, end, {className: "highlight-background"});
    //markTextCollections.push(marker);
}

function handleCognDistortion(start, end, id){
    console.log(id.replace(/\s/g,''));
    let marker = cm.markText(start, end, {className: id.replace(/\s/g,'')});
    //markTextCollections.push(marker);
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

/*
var socket = io();
// Socket & ot.js initialization
socket.on('doc', function(data) {
    cm.setValue(data.str);
    var serverAdapter = new ot.SocketIOAdapter(socket);
    var editorAdapter = new ot.CodeMirrorAdapter(cm);
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
});*/