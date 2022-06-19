/**
 * Quite messy. comments in chinese :(
 * trimming unnecessary stuff.
 * potentially redo logic for marks, since currently it assumes marks will remain at time of saving
 *
 * -> current version:
 *     able to load, play, and replay file
 *
 * todo:
 * - also read marks from logs, that way we can recreate the highlights!
 * see line 152
 *
 *
 *
 *
 * SOLUTION
 * - IN LOGGING: RECORD MARKS AT EACH KEY PRESS
 * - SINCE WE'RE ANIMATING CHARACTERS FRAME BY FRAME, JUST MARK BASED ON THAT
 * - THEN ONRENDER PREPARE MARKS
 *
 */

var num = 0;
var write = document.getElementById("write");
var cm = CodeMirror.fromTextArea(write, {
  lineWrapping: true,
  lineNumbers: false,
  styleSelectedText: true,
  cursorHeight: 0.85,
  scrollbarStyle: null,
});
var loadedEntry = [];
var pauseCursor = [];
var lengthControl = 0;
var globalDisplayTimer = 0;
var replyModeBool = true;
// reply mode(true): 按时间戳复现输入，复现完成再显示标注
// preview mode(false): 一次性展示终止时间点的文档和标注

openNav();

document
  .getElementById("file-loader")
  .addEventListener("change", handleFileSelect, false);

// onload()
function loader() {
  document.getElementById("main").style.display = "none";
  document.getElementById("temp").style.display = "block";
}

function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("container").style.marginLeft = "270px";
  document.getElementById("myBottombar").style.left = "250px";
  // document.getElementById("opnsidebar").setAttribute("onclick", "closeNav()");
  //document.getElementById("opnsidebar").style.backgroundImage = 'url("../src/xmark.png")';
}

function openDef() {
  document.getElementById("myBottombar").style.height = "auto";
  document.getElementById("myBottombar").style.minHeight = "100px";
}

function closeDef() {
  document.getElementById("myBottombar").style.height = "0";
  document.getElementById("myBottombar").style.minHeight = "0";
}

function clearBottomBarElement() {
  document.getElementById("myBottombar").innerHTML = "";
}

function newBottomBarElement(pair) {
  for (let v of pair) {
    console.log("in newbottombar loop. v:", v);
    title = v[0];
    body = v[1];
    if (body !== -1 && body !== "-1") {
      let newDiv =
        '<div><a href="javascript:void(0)" class="closedef onedeftitle" onclick="closeDef()">' +
        title +
        "</a>";
      newDiv += '<a href="#" class="onedefbody">' + body + "</a></div>";
      document.getElementById("myBottombar").innerHTML += newDiv;
    }
  }
}

function showPopUp() {
  $("#popUpWindow").css("display", "block");
}

function hidePopUp() {
  $("#popUpWindow").css("display", "none");
}

var globalActCounter = 0; // Reproduce to the xth key record for coding pause/review function
var lastTime = -1;
var animationStartTimeStamp = 0;
var nextInterval = 0;
var keyboardRawData = demo_data_hw["data"]["keyboardlog"]; // In format of array, demo data for test only
var maxActIndex = keyboardRawData.length;
var prevFrameObject = null;
var currentDelayThreshold = 5000;
var animationStartTimeStamp = 0;
// var delayDataRecord = [];

// only use to debug, delete in production
function checkData() {
  let prev = keyboardRawData[globalActCounter]["timestamp"];
  globalActCounter += 1;
  while (globalActCounter < 300) {
    let text = keyboardRawData[globalActCounter]["text"];
    let time = keyboardRawData[globalActCounter]["timestamp"];
    let diff = time - prev;
    prev = time;
    console.log(diff, text);
    globalActCounter++;
  }
}

// 终止按时间轴复现输入，注意这个不是暂停功能
function stopAnimation() {
  globalActCounter = 9999999999;
  console.log("Terminated!");
}

// Click on the menu, trigger reply/preview showing
function openEntry(key) {
  let id = +key; // unary operator converts to number
  console.log("openning entry:", loadedEntry[id]);
  keyboardRawData = loadedEntry[id]["data"]["key"]; // In format of array
  maxActIndex = keyboardRawData.length;
  prevFrameObject = null;
  title = loadedEntry[id]["data"]["title"];
  document.getElementById("title").innerHTML = title;
  // Clear Timer Display
  globalDisplayTimer = 0;
  document.getElementById("timer_display").innerHTML = "0";
  // Clear Previous delay data
  //   delayDataRecord = [];
  loadData();
}

// 从json文件中提取用于复现的data
function loadData() {
  let prev = keyboardRawData[1]["timestamp"];
  let i = 2;
  let len = keyboardRawData.length;
  while (i < len) {
    let text = keyboardRawData[i]["text"];
    if (text !== "") {
      globalActCounter = i; // 可用于以后coding pause/review功能
      cm.setValue(text);
      nextInterval = keyboardRawData[i]["timestamp"] - prev;
      break;
    }
    prev = keyboardRawData[i]["timestamp"];
    i += 1;
    // -------------------------------------- <<<<< TODO: aca setup marks------------
    // clear all marks
    //    - doc.findMarks
    //    - loop through this and clear them
    // loop through keyboardRawData.marks and add them.
  }
  console.log("start");
  //   console.log("early return, loaddata()");
  //   return;
  nextInterval = 0;

  // ----------------------------------------- replay mode
  animationStartTimeStamp = 0;
  lastTime = -1;
  prevFrameObject = requestAnimationFrame(nextFrame); // trigger next reocurrence based on interval

  // keepLoad(); ---------- leftover from disabling replay/preview mode
}

// Preview Mode
// function keepLoad() {
//   let text = "";
//   while (globalActCounter < maxActIndex) {
//     text = keyboardRawData[globalActCounter]["text"];

//     if (text.length <= lengthControl * 0.2) {
//       // 发生了清空
//       pauseCursor = [];
//     } else {
//       lengthControl = text.length;
//     }

//     if (keyboardRawData[globalActCounter + 1] === undefined) {
//       break;
//     }

//     nextInterval =
//       keyboardRawData[globalActCounter + 1]["timestamp"] -
//       keyboardRawData[globalActCounter]["timestamp"];
//     if (nextInterval > currentDelayThreshold) {
//       // 检测到一个delay
//       let cursor = keyboardRawData[globalActCounter]["cursor"];
//       pauseCursor.push([cursor, nextInterval]);
//     }
//     console.log(nextInterval);
//     globalActCounter += 1;
//   }
//   cm.setValue(text);
//   applyPauseUnderline();
// }

// Reply Mode(Animation)
function nextFrame(currentTime) {
  if (globalActCounter >= maxActIndex) {
    cancelAnimationFrame(prevFrameObject);
    return;
  } else if (lastTime === -1) {
    // timer initialization
    lastTime = currentTime;
    animationStartTimeStamp = currentTime;
  } else {
    if (currentTime - lastTime >= nextInterval) {
      let text = keyboardRawData[globalActCounter]["text"];
      //console.log(globalActCounter, text);
      cm.setValue(text);
      if (text.length <= lengthControl * 0.2) {
        // 发生了清空或者大范围向前退格，这边逻辑比较暴力，需要重写...
        pauseCursor = [];
      } else {
        lengthControl = text.length;
      }
      if (keyboardRawData[globalActCounter + 1] === undefined) {
        cancelAnimationFrame(prevFrameObject);
        return;
      }
      nextInterval =
        keyboardRawData[globalActCounter + 1]["timestamp"] -
        keyboardRawData[globalActCounter]["timestamp"];

      if (nextInterval > currentDelayThreshold) {
        // 检测到一个delay
        let cursor = keyboardRawData[globalActCounter]["cursor"];
        pauseCursor.push([cursor, nextInterval]);
      }
      console.log(nextInterval);
      lastTime = currentTime; // New Interval is awaiting
      globalActCounter += 1;
    }
    // Refresh Timer Display
    globalDisplayTimer = currentTime - animationStartTimeStamp;
    document.getElementById("timer_display").innerHTML = Math.round(
      globalDisplayTimer / 1000
    );
  }
  prevFrameObject = requestAnimationFrame(nextFrame);
}

// Apply Red Underline to the complete document
// function applyPauseUnderline() {
//   var counter = 0;
//   for (mark of pauseCursor) {
//     let cursor = mark[0];
//     let cursorFrom = { line: cursor.line, ch: cursor.ch - 2, sticky: null };
//     let cursorTo = { line: cursor.line, ch: cursor.ch + 2, sticky: null };
//     console.log(cursorFrom, cursorTo, mark[1]);
//     // Save delay number(ms) to the tmp data storage
//     delayDataRecord[counter] = mark[1];
//     cm.markText(cursorFrom, cursorTo, { className: "pause-hl " + counter });
//     counter++;
//   }
// }

//--------------------------------------------- FILE LOADING -------------------------------------------

// CALLED WHEN json FILE IS LOADED
function handleFileSelect(evt) {
  const reader = new FileReader();
  reader.onload = onReaderLoad;
  reader.readAsText(evt.target.files[0]);
}

function onReaderLoad(evt) {
  var data = JSON.parse(evt.target.result);
  console.log("onReaderLoad(): finished reading input:", data);
  rebuildData(data);
}

// Rebuild the database. The current logic is that the uploaded json data package will be parsed into data, and
// then overwrite the local indexedDB database. If you don't want to overwrite indexedDB, watch 312 315

// use this to preprocess data for playback?
function rebuildData(data) {
  console.log("rebuild start!");
  $("#entryTitles").empty();
  for (let key of Object.keys(data)) {
    // --------------------------key is int starting at 1, object is log content.
    let object = data[key];
    console.log("rebuildData adding entry:", key, object);
    title = object["data"]["title"];
    loadedEntry[+key] = object;
    if (key !== "0") {
      let short =
        '<p class="sidebar-title" onclick="openEntry(' +
        key +
        ')">' +
        title +
        "</p>";
      $("#entryTitles").append('<div class="oneEntry">' + short + "</div>");
    }

    // unecessary to keep track of marks.
    // let processedMark = [];
    // if (object["mark"] !== null) {
    //   let objectMark = object["mark"];
    //   let objectComLog = objectMark["commentLog"];

    //   for (let i of Object.keys(objectComLog)) {
    //     let item = objectComLog[i];
    //     if (item["tag"] === "pause" || item["tag"] === "fluent") {
    //       processedMark.push({
    //         tag: item["tag"] + "-hl " + i,
    //         from: item["from"],
    //         to: item["to"],
    //       });
    //     }
    //   }
    //   addMark(
    //     +key,
    //     objectComLog,
    //     objectMark["commentSet"],
    //     objectMark["tagCount"]
    //   );
    // }
    //
    // console.log(key, processedMark);
    // if (object["data"]["marks"]) {
    //   addData(
    //     // calls indexDB_Pro ----------- can we do without this? just keep the thing in memory.
    //     +key,
    //     object["data"]["flag"],
    //     object["data"]["title"],
    //     object["data"]["content"],
    //     object["data"]["date"],
    //     object["data"]["marks"],
    //     object["data"]["mouse"],
    //     object["data"]["key"]
    //   );
    // } else {
    //   addData(
    //     +key,
    //     object["data"]["flag"],
    //     object["data"]["title"],
    //     object["data"]["content"],
    //     object["data"]["date"],
    //     processedMark,
    //     object["data"]["mouse"],
    //     object["data"]["key"]
    //   );
    // }
  }
}

// ex bottombar generation & display handling
cm.on("mousedown", function () {});

cm.on("cursorActivity", function () {});
