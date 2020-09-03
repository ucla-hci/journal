var num = 0;
var write = document.getElementById('write');
var cm = CodeMirror.fromTextArea(write, {
    lineWrapping: true, 
    lineNumbers: false, 
    styleSelectedText: true,
    cursorHeight: 0.85,
    scrollbarStyle: null
});

var feedbackMsg = ""

var entries;
var key, prevKey, flag = 0;
var suggestion, s_start, s_end;

var maxID = 0;
var currentID = 0;

var currentFlag = 0;
var currentDate = "";
var entryTitle = {};
var entryFlag = {};

var promptObjects = new Array();
var _del_ID = 0;

function loader() {
    document.getElementById("main").style.display = "none";
    document.getElementById("temp").style.display = "block";
}

window.addEventListener('beforeunload', async function (e) {
    await manualSave();
});

async function changeMode() {
    await manualSave();
    window.open("http://67.158.54.10/exp", "_self");
}

// Simple Toast System
var timer = setInterval(function() {
    if (currentID > 0) {
        saveEntry();
        let aObj = document.getElementById("toast");
        aObj.innerText = "Auto Saving...";
        setTimeout(autoSaveRec, 1000);
    }
}, 20000)

function autoSaveRec(){
    let aObj = document.getElementById("toast");
    aObj.innerText = "Saved";
    aObj.style.color = "var(--save-confirm)";
    setTimeout(function(){
        aObj.innerText = "Save";
        aObj.style.color = "var(--save-normal)";
    }, 1300);
}

function manualSave() {
    if (currentID > 0){
        saveEntry();
        let aObj = document.getElementById("toast");
        aObj.innerText = "Saving...";
        setTimeout(autoSaveRec, 1000);
    }
}

function startRecord() {
    window.open("https://www.screencastify.com/");
}

// IndexedDB Communication APIs
// Menu Operations
function createMenu(){
    console.log("createMenu");
    menuData();
}

function initMenu() {
    maxID = 0;
    currentID = 1;
    entryTitle = {};
}

function buildMenu(menu, _maxID) {
    console.log("buildMenu");
    console.log(menu);
    $('#entryTitles').empty();
    if (menu && menu !== "menuFailed"){
        maxID = _maxID;
        for (id in menu) {
            let title = menu[id]["title"];
            console.log(title, title.length);
            if (title.length > 14) {
                title = title.slice(0, 12) + "...";
            }
            let flag = menu[id]["flag"];
            if (title != null){
                if (id === '0') {
                    $('#entryTitles').append('<div class="oneEntry"><div class="delbt" style="opacity: 1%"></div><div class="circle1"></div><p class="sidebar-title" onclick="openEntry(0)">Prompts</p></div>');
                    continue;
                }
                let del = '<div class="delbt" onclick="deleteEntry('+ id +')"></div>'
                let fg = '<div class="circle' + flag + '"></div>'
                let short = '<p class="sidebar-title" onclick="openEntry('+id+')">'+title+'</p>';
                $('#entryTitles').append('<div class="oneEntry">' + del + fg + short + '</div>');
            }
        }
    }
}

// Entry Manipulations
function newEntry(){
    //saveEntry();
    cleanMarks();
    closeDef();
    cm.setValue("");
    currentDate = getTime();
    currentFlag = 1;
    document.getElementById("toast").style.display = "none";
    document.getElementById("temp").style.display = "block";
    document.getElementById("main").style.display = "none";
}

function toEntry(mood){
    currentID = maxID + 1;
    document.getElementById("toast").style.display = "block";
    document.getElementById("temp").style.display = "none";
    document.getElementById("main").style.display = "block";
    currentDate = getTime();
    $("#entrydate").text(currentDate);

    if (mood == 'good') {
        currentFlag = 1;
    } else if (mood == 'bad') {
        currentFlag = 3
    } else if (mood == 'neutral') {
        currentFlag = 2;
    }
    document.getElementById("title").innerHTML = "Enter the title here...";// + today;
    refreshFlagColor();
}

function deleteEntry(id) {
    _del_ID = id;
    messagePopUp("Do you want to delete this entry?");
}

function deleteEntryRecall() {
    console.log("deleting entry #"+_del_ID);
    removeData(_del_ID);
    _del_ID = 0;
    newEntry();
}

function openEntry(id) {
    document.getElementById("toast").style.display = "block";
    console.log("Open entry #"+id);
    if (id <= maxID) {
        currentID = id;
        document.getElementById("temp").style.display = "none";
        document.getElementById("main").style.display = "block";
        loadContent(id);
    }
}

function saveEntry() {
    let title = fetchTitle();
    let content = fetchContent();
    let marks = fetchMarks();
    currentDate = getTime();
    let id = currentID;
    let flag = currentFlag;
    let date = currentDate;
    if (isNaN(id)) {
        addData(0, flag, title, content, date, marks, mouselog, keyboardlog);
    }
    else {
        addData(id, flag, title, content, date, marks, mouselog, keyboardlog);
    }
}

function loadContent(id) {
    console.log("Loading entry #"+id);
    readData(id);
}

function loadContentRecall(id, data) {
    let title = data["title"];
    let text = data["content"];
    let date = data["date"];
    let flag = data["flag"];
    mouselog = data["mouseLog"];
    keyboardlog = data["keyLog"];
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
    for (m of marks) {
        console.log(m);
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
    //saveEntry();
}

// CodeMirror Utilities
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
    console.log("fetchMarks");
    var marksOutput = new Array();
    cm.getAllMarks().forEach(mark => {
        console.log(mark, mark.find());
        if (mark.find().to) {
            marksOutput.push({"tag": mark.className, "from": {"line":mark.find().from.line, "ch":mark.find().from.ch}, "to": {"line":mark.find().to.line, "ch":mark.find().to.ch}})
        }
    });
    return marksOutput;
}

// Other Utilities
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
    currentFlag += 1;
    if (currentFlag > 3) {
        currentFlag = 1;
    }
    refreshFlagColor();
}

function refreshFlagColor() {
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

// Related Utilities
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

function isMovementKey(keyCode) {
    return 33 <= keyCode && keyCode <= 40;
}

// UI Operations
function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("container").style.marginLeft = "250px";
    document.getElementById("myBottombar").style.left = "250px";
    document.getElementById("opnsidebar").setAttribute("onclick", "closeNav()");
    //document.getElementById("opnsidebar").style.backgroundImage = 'url("../src/xmark.png")';
}
  
function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("container").style.marginLeft= "0";
    document.getElementById("myBottombar").style.left = "0px";
    document.getElementById("opnsidebar").setAttribute("onclick", "openNav()");
    //document.getElementById("opnsidebar").style.backgroundImage = 'url("../src/hamburger.png")';
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

function darkMode(){
    if($('.switch-anim').prop('checked')){
        document.getElementById("theme").setAttribute("href","css/theme_dark.css");
    }else{
        document.getElementById("theme").setAttribute("href","css/theme_light.css");
    }
}

function acceptChange() {
    cm.replaceRange(suggestion, s_start, s_end);
    $("#textmanipulation").css("display","none");
}

function rejectChange() {
    $("#textmanipulation").css("display","none");
}

function messagePopUp(text) {
    $("#popUpMessage").text(text);
    showPopUp();
    console.log("show");
}

function showPopUp() {
    $("#popUpWindow").css("display","block");
}

function hidePopUp() {
    $("#popUpWindow").css("display","none");
}

function confirmDelete() {
    hidePopUp();
    deleteEntryRecall();
}

/* CodeMirror Decoration Functions
function handlePrompt(start, end, sel_start=null, sel_end=null){
    //console.log("add prompt, start:", start, "end:", end, "sel_start:", sel_start, "sel_end:", sel_end)
    let promptObject = cm.markText(start, end, {className: "autosuggest-font"})
    promptObjects.push(promptObject)
    if ((sel_start != null) && (sel_end != null)) {
        cm.markText(sel_start, sel_end, {className: "autosuggest-background"});
    }
}

function handleReplace(start, end, s){
    cm.markText(start, end, {className: "replacement-font"});
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

function handleHighlight(start, end, type){
    cm.markText(start, end, {className: type});
}

function handleCognDistortion(start, end, id){
    console.log(id.replace(/\s/g,''));
    cm.markText(start, end, {className: id.replace(/\s/g,'')});
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
*/
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
        case 'undo': cm.undo(); break;
        case 'redo': cm.redo(); break;
        case 'clear': cm.clear(); break;
    }
}

// CodeMirror Listener
// Handling mouse activities 
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
            let marks = cm.findMarksAt(cm.getCursor());
            let len = marks.length;
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

cm.on("keyup", function() {
    prevKey = key;
    key = event.keyCode;

    if (isMovementKey(event.which)) {
        movedByMouse = false;
    }

    if (key == 190 || key == 110 || key == 13 || key == 49 || key == 191) {
        if (currentID > 0) {
            saveEntry();    //Autosave
            let aObj = document.getElementById("toast");
            aObj.innerText = "Auto Saving...";
            setTimeout(autoSaveRec, 1000);
        }
        clearInterval(timer);
        timer = setInterval(function() {
            if (currentID > 0) {
                saveEntry();
                let aObj = document.getElementById("toast");
                aObj.innerText = "Auto Saving...";
                setTimeout(autoSaveRec, 1000);
            }
        }, 20000)        
    }
});

cm.on("beforeChange", function () {
    movedByMouse = false;
});

cm.on("change", function (cm, changeObj) {
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
