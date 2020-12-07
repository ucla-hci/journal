var num = 0;
var write = document.getElementById('write');
var cm = CodeMirror.fromTextArea(write, {
    lineWrapping: true, 
    lineNumbers: false, 
    styleSelectedText: true,
    cursorHeight: 0.85
});

var feedbackMsg = ""

var maxID = 0;
var currentID = 0;

var currentFlag = 0;
var currentDate = "";

var entryTitle = {};
var entryFlag = {};

var allMarks = null;

var entryFold = false;
var markDisplay = true;
var pausedOperation = null;
var pausedOperationId = 0;
var promptInstance = null;

var docStart = null;
var docEnd = null;

var entries;
var key, prevKey, flag = 0;
var suggestion, s_start, s_end;

var constructive = ['help', 'better', 'improve', 'practice', 'workon', 'understand', 'analyze', 'plan', 'change', 'try']
var dysfunctional = ['loser', 'suck', 'hate', 'lazy', 'theworst', 'useless', 'failure', 'pathetic', 'good-for-nothing', 'dumb', 'stupid']
var trigger = ['cannot', 'ca', 'always', 'never', 'ever', 'must', 'mustnot', 'should', 'shouldnot', 'haveto', 'orelse', 'every', 'everything', 'nothing', 'anything', 'all', 'none', 'any', 'atall', 'everybody', 'nobody', 'anybody', 'noone', 'only']
var pronoun = ['I', 'me', 'my', 'myself']

// Journey Onload
function loader() {
    document.getElementById("main").style.display = "none";
    document.getElementById("temp").style.display = "block";
    createMenu();
}

// Themes Switching
function darkMode(){
    if($('.switch-anim').prop('checked')){
        document.getElementById("theme").setAttribute("href","css/theme_dark.css");
    }else{
        document.getElementById("theme").setAttribute("href","css/theme_light.css");
    }
}

// System Functions
    // Menu Build-up
function createMenu(){
    $('#entryTitles').empty();
    let menuData = getMenu();
    if (menuData === "Get menu Failed"){  // No saved entry
        maxID = 0;
        currentID = 1;
        entryTitle = {};
    }
    else {
        let menu = JSON.parse(menuData);
        maxID = parseInt(menu["maxID"]);
        entryTitle = menu["entries"];
        entryFlag = menu["flags"]
        for (id in entryTitle) {
            let title = entryTitle[id];
            let flag = entryFlag[id];
            console.log(id, title, flag); // null is deleted entry
            //flag = (flag === 0) ? 1 : flag; // new entry with no flag assigned
            if (title != null){
                let del = '<div class="delbt" onclick="deleteEntry('+ id +')"></div>'
                let fg = '<div class="circle' + flag + '"></div>'
                let short = '<p onclick="openEntry('+id+')">'+title+'</p>';
                $('#entryTitles').append('<div class="oneEntry">' + del + fg + short + '</div>');
            }
        }
    }
}

function showEntries(){
    if (entryFold){
        $('#entryTitles').css("max-height", "50vh");
        entryFold = false;
    }
    else {
        $('#entryTitles').css("max-height", "0px");
        entryFold = true;
    }
}

function explanationPopUp() {
    $('#textExplanation').css("display","block");
}

function explanationHide() {
    $('#textExplanation').css("display","none");
}

function deleteEntryPopUp() {
    $('#deleteConfirm').css("display","block");
}

function deleteEntryGiveUp() {
    $('#deleteConfirm').css("display","none");
}

function beforeSavePopUp() {
    $('#saveConfirm').css("display","block");
}

function beforeSaveGiveUp() {
    $('#saveConfirm').css("display","none");
}

function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("container").style.marginLeft = "250px";
    document.getElementById("myBottombar").style.left = "250px";
    document.getElementById("opnsidebar").setAttribute("onclick", "closeNav()");
    document.getElementById("opnsidebar").style.backgroundImage = 'url("./src/xmark.png")';
}
  
function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("container").style.marginLeft= "0";
    document.getElementById("myBottombar").style.left = "0px";
    document.getElementById("opnsidebar").setAttribute("onclick", "openNav()");
    document.getElementById("opnsidebar").style.backgroundImage = 'url("./src/hamburger.png")';
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

/*
function saveConfirm() {
    saveAfterChange = true;
    if (pausedOperation == "new") {
        newEntry();
    }
    else if (pausedOperation == "load") {
        loadContent(pausedOperationId);
    }
    beforeSaveGiveUp();
    pausedOperation = null;
}*/

    // Entry Manipulation
function openEntry(id) {
    if (id <= maxID) {
        currentID = id;
        document.getElementById("temp").style.display = "none";
        document.getElementById("main").style.display = "block";
        loadContent(id);
    }
}

function deleteEntry(id) {
    if (id != null) {
        console.log("del "+id);
        delJSON(id.toString());
        entryTitle[id] = null;
        entryFlag[id] = null;
        updateMenu(JSON.stringify({"maxID": maxID, "entries": entryTitle, "flags": entryFlag}));
        createMenu();
    }
    else if ((currentID > 0) && (currentID <= maxID)) {
        delJSON(currentID.toString());
        entryTitle[currentID] = null;
        entryFlag[currentID] = null;
        updateMenu(JSON.stringify({"maxID": maxID, "entries": entryTitle, "flags": entryFlag}));
        createMenu();
        newEntry();
    }
}

function newEntry(){
    saveEntry();
    cleanMarks();
    closeDef();
    cm.setValue("");
    currentDate = getTime();
    currentFlag = 1;
    document.getElementById("temp").style.display = "block";
    document.getElementById("main").style.display = "none";
}

function toEntry(mood){
    currentID = maxID + 1;
    document.getElementById("temp").style.display = "none";
    document.getElementById("main").style.display = "block";
    currentDate = getTime();
    $("#entrydate").text(currentDate);

    if (mood == 'good') {
        currentFlag = 1;
        document.getElementById("title").innerHTML = "What a good day";
    } else if (mood == 'bad') {
        currentFlag = 3;
        document.getElementById("title").innerHTML = "Not a good day";
    } else if (mood == 'neutral') {
        currentFlag = 2;
        document.getElementById("title").innerHTML = "Just so so";
    }
    refreshFlagColor();
}

function saveEntry(){
    currentDate = getTime();
    
    saveContent();
    if (currentID > maxID) {
        maxID = currentID;
    }

    let title = fetchTitle();
    /*
    if (title.length > 10) {
        title = title.slice(0,10)+"...";
    }*/
    entryTitle[currentID] = title;
    console.log(entryFlag, currentFlag);
    entryFlag[currentID] = currentFlag;
    updateMenu(JSON.stringify({"maxID": maxID, "entries": entryTitle, "flags": entryFlag}));
    createMenu();
}

function getTime(){
    let today = new Date();
    let yy = String(today.getFullYear());
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let hh = String(today.getHours());
    let mn = String(today.getMinutes());

    if (mn.length < 2) { mn = '0'+mn;}
    currentDate = mm + '/' + dd + '/' + yy + ' ' + hh + ':' + mn;
    return currentDate;
}

function circleFlag() {
    console.log(currentFlag);
    currentFlag += 1;
    if (currentFlag > 3) {
        currentFlag = 1;
    }
    refreshFlagColor();
    saveEntry();
}

function refreshFlagColor() {
    console.log(currentFlag);
    if (currentFlag != 0) {
        if (currentFlag === 1) {
            $('.circleCurrnetFlag').css("background-color","#8ac8a4");
        }
        else if (currentFlag === 2) {
            $('.circleCurrnetFlag').css("background-color","#2f7fed");
        }
        else if (currentFlag === 3) {
            $('.circleCurrnetFlag').css("background-color","#fa9a9a");
        }
    }
}

// Color keywords by sentiments
function checkSentiment() {
    //cleanMarks();
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
function checkEmotion() {
    //cleanMarks();
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


// Check LIWC
function checkLIWC() {
    let text = fetchContent();
    checkLIWCAPIs(text);
}

// Color keywords by categories
function checkCat() {
    $('#sentiment').css("display","none");
    $('#emotion').css("display","none");
    $('#category').css("display","block");
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

// Color sentences by cognitive distortion
function checkCD() {
    let result = JSON.parse(checkCognDistortion(fetchContent()));
    let cursor = setCursorEnd();
    cm.replaceRange(" ", cursor);
    let end = setCursorEnd();
    console.log(cursor, end)
    if (result.class === "spl") {
        cm.markText(cursor, end, {className: "Splitting"});
    }
    else if (result.class === "sld") {
        cm.markText(cursor, end, {className: "Should"});
    }
    else if (result.class === "frt") {
        cm.markText(cursor, end, {className: "FortuneTelling"});
    }
    else if (result.class === "blm") {
        cm.markText(cursor, end, {className: "Blaming"});
    }
    else { //nan
        return;
    }
}

// Color keywords by categories
function addPrompt() {
    let text = fetchContent();
    let result = autoComplete(text);
    console.log(result);
    if (result !== 'None') {
        let start = cm.getCursor("to");
        cm.replaceRange(" "+result, start);
        let end = cm.getCursor();
        console.log(start, end)
        promptInstance = cm.markText(start, end, {className: "autosuggest-font"})
    }
}


// CodeMirror Utilities
var markTextCollections = new Array();  // Save all markText result

function displayMarks() {
    if (markDisplay) {
        allMarks = fetchMarks();
        cleanMarks();
        markDisplay = false;
    }
    else {
        markDisplay = true;
        applyMarks(allMarks);
    }
}

function saveContent() {
    let title = fetchTitle();
    let content = fetchContent();
    let marks = fetchMarks();
    let id = currentID;
    let jString = JSON.stringify({"title":title, "content":content, "date": currentDate, "flag": currentFlag, "marks":marks});
    if (isNaN(id)) {
        saveJSON(jString, "error_recovery");
    }
    else {
        saveJSON(jString, id.toString());
    }
    //loadContent(id); only use to refresh date/time?
}

function loadContent(id) {
    console.log("Load "+id);
    let jString = loadJSON(id);
    let data = JSON.parse(jString);
    let title = data["title"];
    let text = data["content"];
    let date = data["date"];
    let flag = data["flag"];
    currentFlag = flag;
    refreshFlagColor();
    cm.setValue(text);
    if (title != null) {
        $("#title").text(title);
    }
    if (date != null) {
        $("#entrydate").text(date);
    }
    let marks = data["marks"];
    console.log("Load new!");
    console.log(title);
    console.log(marks);
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
    setCursorEnd();
    saveEntry();
}

function handleOperation(command){
    switch (command){
        case 'undo': cm.undo(); break;
        case 'redo': cm.redo(); break;
        case 'clear': cm.clear(); break;
    }
}

function fetchTitle(){
    var text = $("#title").text()
    return text;
}

function fetchContent(){
    var text = cm.getValue();
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

function applyMarks(marks) {
    console.log("applyMarks");
    console.log(marks);
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
}

function markKeywords(keyword, type){
    let cursor = cm.getSearchCursor(keyword, null, {caseFold: true});
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
function getMenu() {
    var jqXHR = $.ajax({
        type: "GET",
        url: "http://127.0.0.1:5000/menu",
        async: false,
        data: {}
    });
    return jqXHR.responseText;
}

function updateMenu(input) {
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/menu",
        async: false,
        data: {menu: input}
    });
    return jqXHR.responseText;
}

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

function delJSON(name){
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/del",
        async: false,
        data: {filename: name}
    });
    console.log(jqXHR.responseText);
}

function autoComplete(text){
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/check",
        async: false,
        data: {sentence: text}
    });
    return jqXHR.responseText;
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

function checkCognDistortion(input){
    console.log("trying to run python");
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/cd",
        async: false,
        data: { mydata: input }
    });
    console.log(jqXHR.responseText);
    return jqXHR.responseText;
}

function checkLIWCAPIs(input){
    console.log("trying to run python");
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/liwc",
        async: false,
        data: { mydata: input }
    });
    console.log(jqXHR.responseText);
    return jqXHR.responseText;
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
                for (let mark of marks){
                    let tag = mark["className"];
                    openDef();
                    explanationHide();
                    clearBottomBarElement();
                    switch(tag) {
                        case "BeingRight" : populateDistortion("BeingRight"); break;
                        case "Blaming" : populateDistortion("Blaming"); break;
                        case "Catastrophizing" : populateDistortion("Catastrophizing"); break;
                        case "MindReading" : populateDistortion("MindReading"); break;
                        case "Splitting" : populateDistortion("Splitting"); break;
                        case "Should" : populateDistortion("Should"); break;
                        case "FortuneTelling" : populateDistortion("FortuneTelling"); break;
                        case "autosuggest-font" : {
                            let place = promptInstance.find();
                            promptInstance.clear();
                            cm.replaceRange(" ", place.from, place.to);
                            closeDef();
                            break;
                        }
                        default: {
                            newPopUpElement(tag, "Test Message that will display all related info", cm.getCursor());
                            closeDef();
                        }
                    }
                }
            }
            else{
                explanationHide();
            }
        }
    }
});

cm.on("keyup", function() {
    prevKey = key;
    key = event.keyCode;
    console.log("k",key);

    if (isMovementKey(event.which)) {
        movedByMouse = false;
    }

    if (key == 190 || key == 110 || key == 13 || (prevKey == 16 && key == 49) || (prevKey == 16 && key == 191)) {
        //checkEmotion();
        addPrompt();
        checkCD();
        saveEntry();
    }
});

cm.on("beforeChange", function () {
    movedByMouse = false;
});

cm.on("changes", function (ins, changes) {
    //console.log(changes);
    if (changes[0].origin == "setValue") {  // Load entry, no need to save again
        return;
    }
    console.log("Auto Save:"+currentID);
    saveEntry();
});

$("body").on('DOMSubtreeModified', '.title_in_line', function(){
    console.log("Auto Save:"+currentID);
    saveEntry();
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

function setCursorEnd() {
    cm.focus();// Set the cursor at the end of existing content
    cm.setCursor(cm.lineCount(), 0);
    return cm.getCursor();
}

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

function acceptChange() {
    cm.replaceRange(suggestion, s_start, s_end);
    $("#textManipulation").css("display","none");
}

function rejectChange() {
    $("#textManipulation").css("display","none");
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

    $("#textManipulation").css("display","block");
    $("#textManipulation").css("margin-left", newLeft);
    $("#textManipulation").css("margin-top", newTop);
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

function newPopUpElement(title, body, cmTextMaker) {
    let start = cmTextMaker;
    console.log(cm.charCoords(start));
    console.log(cm.charCoords(start)["left"]);
    console.log(cm.charCoords(start)["top"]);
    var newLeft = cm.charCoords(start)["left"].toString() + "px";
    var newTop = (cm.charCoords(start)["top"]+30).toString() + "px"

    $("#textExplanation").css("display","block");
    $("#textExplanation").css("left", newLeft);
    $("#textExplanation").css("top", newTop);
    $("#textExplanation").css("border-color", "var(--"+title+")");
    document.getElementById("pop-up-element-title").textContent = title;
    document.getElementById("pop-up-element-content").textContent = body;
}

function populateDistortion(name) {
    console.log("+"+name);
    if(name == "BeingRight") {
        newBottomBarElement("Being Right", "Being right distortion demo text"); 
    }
    else if(name == "Blaming") {
        newBottomBarElement("Blaming", "Blaming distortion demo text"); 
    }
    else if(name == "Catastrophizing") {
        newBottomBarElement("Catastrophizing", "Catastrophizing distortion demo text"); 
    }
    else if(name == "MindReading") { 
        newBottomBarElement("MindReading", "MindReading distortion demo text"); 
    }
    else if(name == "Splitting") { 
        newBottomBarElement("Splitting", "Splitting distortion demo text"); 
    }
    else if(name == "Should") { 
        newBottomBarElement("Should", "Should distortion demo text"); 
    }
    else if(name == "FortuneTelling") { 
        newBottomBarElement("FortuneTelling", "FortuneTelling distortion demo text"); 
    }
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