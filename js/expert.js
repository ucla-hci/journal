var write = document.getElementById('write');
var cm = CodeMirror.fromTextArea(write, {
    lineWrapping: true, 
    lineNumbers: false, 
    styleSelectedText: true,
    cursorHeight: 0.85,
    scrollbarStyle: null
});

var current_sel_from = null;
var current_sel_to = null;
var last_menu_selection = 0;
var assigned_tag = null;
var selected_text = '';

var commentLog = {};
var commentSet = [];
var tagCount = 0;
var lastTagObj = null;

var movedByMouse = false;

var maxID = 0;
var currentID = 0;

var currentFlag = 0;
var mouselog = null;
var keyboardlog = null;
var currentDate = "";
var entryTitle = {};
var entryFlag = {};

function loader() {
    //createMenu();
}

// Backend Communication APIs
function createMenu(){
    console.log("createMenu");
    menuData();
}

function buildMenu(menu, _maxID) {
    console.log("buildMenu");
    $('#entryTitles').empty();
    if (menu === "menuFailed"){  // No saved entry
        maxID = 0;
        currentID = 0;
        window.alert("No saved entry detected!")
    }
    else {
        maxID = _maxID;
        for (id in menu) {
            if (id === 0) { continue;}  // Entry 0 is for error handling and backup recoverey
            let title = menu[id]["title"];
            let flag = menu[id]["flag"];
            if (title != null){
                let fg = '<div class="circle' + flag + '"></div>';
                let short = '<p onclick="openEntry('+id+')">'+title+'</p>';
                $('#entryTitles').append('<div class="oneEntry">' + fg + short + '</div>');
            }
        }
    }
}

// Entry Manipulations
function openEntry(id) {
    console.log("Open entry #"+id);
    if (id <= maxID) {
        currentID = id;
        loadContent(id);
    }
}

function loadContent(id) {
    console.log("Loading entry #"+id);
    readData(id);
    readMark(id);
}

function loadContentRecall(_id, data) {
    let title = data["title"];
    let text = data["content"];
    let date = data["date"];
    let flag = data["flag"];
    currentID = _id;
    currentFlag = flag;
    mouselog = data["mouseLog"];
    keyboardlog = data["keyLog"];
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
    
    /*
    jString = loadJSON(currentID+'_mark');
    if (jString !== "Load Failed") {
        data = JSON.parse(jString);
        commentLog = data["log"];
        commentSet = data["comment"];
        tagCount = data["count"];
    }*/
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
        addMark(id, commentLog, commentSet, tagCount);
    }
}

function loadMarkRecall(_id, data) {
    if (data && _id !== -1 && _id === currentID) {
        commentLog = data["commentLog"];
        commentSet = data["commentSet"];
        tagCount = data["tagCount"];
    }
    else {
        console.log(currentID, _id, 'no mark available');
    }
}

function manualSave() {
    if (currentID !== 0){
        saveEntry();
        window.alert("All Secured!");
    }
}

function generateFile() {
    generatePackOne();
}

function generatePackRecall(file){
    console.log(file);
    download(JSON.stringify(file), "report.json");
}

// Save JSON data to .txt File
// Ref: https://stackoverflow.com/questions/21479107/saving-html5-textarea-contents-to-file/30740104
function download(text, filename){
    text = text.replace(/\n/g, "\r\n"); // To retain the Line breaks.
    var blob = new Blob([text], { type: "text/plain"});
    var anchor = document.createElement("a");
    anchor.download = filename;
    anchor.href = window.URL.createObjectURL(blob);
    anchor.target ="_blank";
    anchor.style.display = "none"; // just to be safe!
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

// CodeMirror Utilities
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


/*/ Watson APIs: Client-Server Comunications
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
}*/

// UI Operations
function darkMode(){
    if($('.switch-anim').prop('checked')){
        document.getElementById("theme").setAttribute("href","css/theme_dark.css");
    }else{
        document.getElementById("theme").setAttribute("href","css/theme_light.css");
    }
}

function openNav() {
    document.getElementById("mySidebar").style.width = '250px';
    document.getElementById("container").style.marginLeft = '250px';
    document.getElementById("myBottombar").style.left = '250px';
    document.getElementById("myBottombar").style.width = 'calc(100% - 250px)';
    document.getElementById("opnsidebar").setAttribute("onclick", "closeNav()");
    //document.getElementById("opnsidebar").style.backgroundImage = 'url("../src/xmark.png")';
}
  
function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("container").style.marginLeft= "0";
    document.getElementById("myBottombar").style.left = "0px";
    document.getElementById("myBottombar").style.width = '100%';
    document.getElementById("opnsidebar").setAttribute("onclick", "openNav()");
    //document.getElementById("opnsidebar").style.backgroundImage = 'url("../src/hamburger.png")';
}

function openDef() {
    document.getElementById("myBottombar").style.height = "auto";
    document.getElementById("myBottombar").style.minHeight = "100px";
}
  
function closeDef() {
    document.getElementById("myBottombar").style.height = "0";
    document.getElementById("myBottombar").style.minHeight = "0";
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
        $("#pop-up-content-text").val("");
    }
    else if (type == 4){
        last_menu_selection = 4;
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
    lastTagObj.clear();
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
        case 4: {
            commentSet[tagCount] = sentence;
            tagCount++;
            commentLog[tagCount] = {tag: assigned_tag, comment: sentence};
            break;
        }
    }
    $("#textmanipulation").css("display","none");
});

$(".pop-up-selection").on("click", function(){
    let id = this.id;
    if ((current_sel_from!=null) && (current_sel_to!=null)) {
        cm.markText(current_sel_from, current_sel_to, {className: id.replace(/\s/g,'')})
        let from = analysisCoord(current_sel_from);
        let to = analysisCoord(current_sel_to);
        let command = "CD:(" + from.l + "," + from.c + '),(' + to.l + ',' + to.c + '),'+id;
        log(command);
    }
    $("#cogndistortion").css("display","none");
});

function clearBottomBarElement(){
    document.getElementById("myBottombar").innerHTML = "";
}

function newBottomBarElement(pair) {
    for (let v of pair){
        title = v[0];
        body = v[1];
        if (body !== -1 && body !== '-1') {
            let newDiv = "<div><a href=\"javascript:void(0)\" class=\"closedef onedeftitle\" onclick=\"closeDef()\">" + title + "</a>";
            newDiv += "<a href=\"#\" class=\"onedefbody\">" + body + "</a></div>"
            document.getElementById("myBottombar").innerHTML += newDiv;
        }
    }
}

// System Utilities
function log(sentence) {
    /*
    let html = "<li><p>" + sentence + "</p></li>"
    $("#logTable").append(html);*/
    console.log(sentence);
}

    // Other Utlities
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
    let s = analysisCoord(start)
    let e = analysisCoord(end)
    log("feedback:("+s.l+","+s.c+"),("+e.l+","+e.c+"),"+sentence);
    var toAppend = document.createElement("change");
    toAppend.innerHTML = "<b>Feedback:</b> "+sentence+"<br> On: "+selectedText;
    document.getElementById("changetracker").appendChild(toAppend);
}

function findMargin(pageX, pageY) {
    console.log(pageX, pageY);
    pageX -= 480;
    pageY -= 20;
    pageX = pageX < 10 ? 10 : pageX;
    pageX = pageX < 20 ? 20 : pageX;
    return {x: pageX, y: pageY}
}

function changePopUpPrompt(text){
    if (text === '' || text === null || text === undefined){
        document.getElementById("pop-up-title-text").innerHTML = 'Comment:';
    }
    else {
        document.getElementById("pop-up-title-text").innerHTML = text;
    }
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
                name: "Behavior", 
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
                                changePopUpPrompt('Why did you pause here? <br> What AI feedback may help you write fluently?');
                                let mg = findMargin(rootMenu.pageX, rootMenu.pageY)
                                $("#textmanipulation").css("margin-left", (mg.x)+"px");
                                $("#textmanipulation").css("margin-top", (mg.y)+"px");
                                lastTagObj = cm.markText(start, end, {className: "pause-hl " + tagCount});
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
                                changePopUpPrompt('How did you write fluently here?');
                                let mg = findMargin(rootMenu.pageX, rootMenu.pageY)
                                $("#textmanipulation").css("margin-left", (mg.x)+"px");
                                $("#textmanipulation").css("margin-top", (mg.y)+"px");
                                lastTagObj = cm.markText(start, end, {className: "fluent-hl " + tagCount});
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
                    "keyword": {
                        name: "Label Keywords",
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
                                changePopUpPrompt('Why this term is meaningful? <br> Can you provide more details as expansion?');
                                let mg = findMargin(rootMenu.pageX, rootMenu.pageY)
                                $("#textmanipulation").css("margin-left", (mg.x)+"px");
                                $("#textmanipulation").css("margin-top", (mg.y)+"px");
                                lastTagObj = cm.markText(start, end, {className: "keyword-hl " + tagCount});
                                let s = analysisCoord(start);
                                let e = analysisCoord(end);
                                log("pause:("+s.l+","+s.c+"),("+e.l+","+e.c+")");
                                
                            }
                        }
                    },
                    "summary": {
                        name: "Give Summary",
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
                                changePopUpPrompt('Summary the topic idea in short terms:');
                                let mg = findMargin(rootMenu.pageX, rootMenu.pageY)
                                $("#textmanipulation").css("margin-left", (mg.x)+"px");
                                $("#textmanipulation").css("margin-top", (mg.y)+"px");
                                lastTagObj = cm.markText(start, end, {className: "summary-hl " + tagCount});
                                let s = analysisCoord(start);
                                let e = analysisCoord(end);
                                log("pause:("+s.l+","+s.c+"),("+e.l+","+e.c+")");
                            }
                        }
                    },
                }
            },
            "feedback": {
                name: "Comment", 
                icon: "fa-commenting-o",
                callback: function(itemKey, opt, rootMenu, originalEvent) {
                    assigned_tag = 'others';
                    callTextPrompt(4);
                    changePopUpPrompt();
                    let mg = findMargin(rootMenu.pageX, rootMenu.pageY)
                    $("#textmanipulation").css("margin-left", (mg.x)+"px");
                    $("#textmanipulation").css("margin-top", (mg.y)+"px");
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
                        lastTagObj = cm.markText(start, end, {className: "comment-hl " + tagCount});
                        let s = analysisCoord(start);
                        let e = analysisCoord(end);
                        log("pause:("+s.l+","+s.c+"),("+e.l+","+e.c+")");
                    }
                }
            },
            /*
            "reflection": {
                name: "Reflection", 
                icon: "fa-lightbulb-o",
                items: {
                    "reflection": {
                        name: "Reflection",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            assigned_tag = 'reflection';
                            callTextPrompt(4);
                            let mg = findMargin(rootMenu.pageX, rootMenu.pageY)
                            $("#textmanipulation").css("margin-left", (mg.x)+"px");
                            $("#textmanipulation").css("margin-top", (mg.y)+"px");
                        }
                    },
                    "liwc": {
                        name: "LIWC",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            assigned_tag = 'liwc';
                            callTextPrompt(4);
                            let mg = findMargin(rootMenu.pageX, rootMenu.pageY)
                            $("#textmanipulation").css("margin-left", (mg.x)+"px");
                            $("#textmanipulation").css("margin-top", (mg.y)+"px");
                        }
                    },
                    "watson": {
                        name: "Watson",
                        callback: function(itemKey, opt, rootMenu, originalEvent) {
                            assigned_tag = 'watson';
                            callTextPrompt(4);
                            let mg = findMargin(rootMenu.pageX, rootMenu.pageY)
                            $("#textmanipulation").css("margin-left", (mg.x)+"px");
                            $("#textmanipulation").css("margin-top", (mg.y)+"px");
                        }
                    }
                }
            },*/
            "claeer": {
                name: "Clear Mark",
                icon: "fa-cog",
                callback: function(itemKey, opt, rootMenu, originalEvent) {
                    cursor = cm.getCursor();
                    cm.findMarksAt(cursor).forEach(mark => {
                        let tags = mark["className"];
                        if (tags[1]) {
                            let tagid = parseInt(tags[1]);
                            commentSet[tagid] = -1;
                            commentLog[tagid] = null;
                        }
                        mark.clear()
                    });
                    console.log("clear marks", cursor);
                    log("clear");
                }
            }
        }
    });
});

// Mouse Activity Listener
cm.on("mousedown", function () {
    movedByMouse = true;
    $('.context-menu-list').trigger('contextmenu:hide');
});

cm.on("cursorActivity", function () {
    if (movedByMouse) {
        movedByMouse = false;
        if (!cm.getSelection()) {
            closeDef();
            //branch based on whether a highlight was clicked here
            let marks = cm.findMarksAt(cm.getCursor())
            let len = marks.length;
            if(len != 0) {
                let pair = [];
                for (let mark of marks){
                    let tag = mark["className"];
                    if (tag === undefined) {
                        continue;
                    }
                    let tags = tag.split(" ");
                    if (tags[1]) {
                        let id = parseInt(tags[1]);
                        pair.push([tags[0], commentSet[id]]);
                    }
                }
                openDef();
                clearBottomBarElement();
                newBottomBarElement(pair);
            }
        }
    }
});

cm.on("beforeChange", function () {
    movedByMouse = false;
});

