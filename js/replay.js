var num = 0;
var write = document.getElementById('write');
var cm = CodeMirror.fromTextArea(write, {
    lineWrapping: true, 
    lineNumbers: false, 
    styleSelectedText: true,
    cursorHeight: 0.85,
    scrollbarStyle: null
});
var loadedEntry = [];

document.getElementById("files").addEventListener("change", handleFileSelect, false);

function loader() {
    document.getElementById("main").style.display = "none";
    document.getElementById("temp").style.display = "block";
}

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

function closeDef() {
    document.getElementById("myBottombar").style.height = "0";
    document.getElementById("myBottombar").style.minHeight = "0";
    document.getElementById("main").style.marginBottom= "0";
}

function showPopUp() {
    $("#popUpWindow").css("display","block");
}

function hidePopUp() {
    $("#popUpWindow").css("display","none");
}


var globalActCounter = 0;
var lastTime = -1;
var startTime = -1;
var nextInterval = 0;
var keyboardRawData = demo_data_hw['data']['keyboardlog'];// In format of array
var maxActIndex = keyboardRawData.length;
var prevFrameObject = null;

function checkData() {
    let prev = keyboardRawData[globalActCounter]['timestamp'];
    globalActCounter += 1;
    while (globalActCounter < 300) {
        let text = keyboardRawData[globalActCounter]['text'];
        let time = keyboardRawData[globalActCounter]['timestamp'];
        let diff = time - prev;
        prev = time;
        console.log(diff, text);
        globalActCounter++;
    }
}

function loadData() {
    let prev = keyboardRawData[1]['timestamp'];
    let i = 2;
    let len = keyboardRawData.length;
    while (i<len) {
        let text = keyboardRawData[i]['text'];
        if (text !== '') {
            globalActCounter = i;
            cm.setValue(text);
            nextInterval = keyboardRawData[i]['timestamp'] - prev;
            break;
        }
        prev = keyboardRawData[i]['timestamp'];
        i += 1;
    }
    console.log("start");
    //checkData();
    //console.log(globalActCounter, nextInterval, startTime, lastTime);
    prevFrameObject = requestAnimationFrame(nextFrame);
}

function nextFrame(currentTime){
    if (globalActCounter === maxActIndex) {
        cancelAnimationFrame(prevFrameObject);
        return;
    }
    else if (lastTime === -1) {
        lastTime = currentTime;
    }
    else {
        if ((currentTime - lastTime)>= nextInterval) {
            let text = keyboardRawData[globalActCounter]['text'];
            //console.log(globalActCounter, text);
            cm.setValue(text);
            if (keyboardRawData[globalActCounter+1] === undefined) {
                cancelAnimationFrame(prevFrameObject);
                return;
            }
            nextInterval = keyboardRawData[globalActCounter+1]['timestamp'] - keyboardRawData[globalActCounter]['timestamp']
            lastTime = currentTime; // New Interval is awaiting
            globalActCounter += 1;
        }
    }
    prevFrameObject = requestAnimationFrame(nextFrame);
}

function openEntry(key) {
    let id = +key;
    console.log(loadedEntry[id]);
    keyboardRawData = loadedEntry[id]['data']['key'];// In format of array
    maxActIndex = keyboardRawData.length;
    prevFrameObject = null;
    title = loadedEntry[id]['data']['title'];
    document.getElementById("title").innerHTML = title;
    loadData();
}

function handleFileSelect(evt) {
    const reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(evt.target.files[0]);
}

function onReaderLoad(evt) {
    var data = JSON.parse(evt.target.result);
    console.log(data);
    rebuildData(data);
}

function rebuildData(data) {
    console.log("rebuild start!");
    $('#entryTitles').empty();
    for (let key of Object.keys(data)) {
        let object = data[key];
        console.log(key, object);
        title = object['data']['title'];
        loadedEntry[+key] = object;
        if (key !== '0') {
            let short = '<p class="sidebar-title" onclick="openEntry('+key+')">'+title+'</p>';
            $('#entryTitles').append('<div class="oneEntry">' + short + '</div>');
        }
        
        let processedMark = [];
        if (object['mark'] !== null){
            let objectMark = object['mark'];
            let objectComLog = objectMark['commentLog'];

            for (let i of Object.keys(objectComLog)) {
                let item = objectComLog[i];
                if (item['tag'] === 'pause' || item['tag'] === 'fluent') {
                    processedMark.push({tag: item['tag']+"-hl "+i, from: item['from'], to: item['to']});
                }
            }
            addMark(+key, objectComLog, objectMark['commentSet'], objectMark['tagCount']);
        }

        console.log(key, processedMark);
        if (object['data']['marks']) {
            addData(+key, object['data']['flag'], object['data']['title'], object['data']['content'], object['data']['date'], object['data']['marks'], object['data']['mouse'], object['data']['key']);
        }
        else {
            addData(+key, object['data']['flag'], object['data']['title'], object['data']['content'], object['data']['date'], processedMark, object['data']['mouse'], object['data']['key']);
        }
    }
}