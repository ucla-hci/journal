/**
 * Latest changes:
 *
 * Currently logging:
 * - on expressiveness/analysis toggles
 * - Popup onopen, onmove to next event
 * - Sidebar onopen, onmove to next event
 * - rewrite - done in keyup handler
 */

var UnixZero = -1; // Used to record the timestamp of the application
var mouselog = new Array();
var keyboardlog = new Array();
var toggleLog = new Array();
var popupLog = new Array();
var sidebarLog = new Array();
var dismissLog = new Array();
var acceptLog = new Array();
// var l2dismissLog = new Array();

function startTimer() {
  let dateTime = Date.now();
  UnixZero = dateTime;
  console.log("logger restart:", dateTime);
}

function initialization() {
  startTimer();
  mouselog = new Array();
  keyboardlog = new Array();
  keyboardlog.push({ timestamp: UnixZero, type: "start" });
  mouselog.push({ timestamp: UnixZero, type: "start" });
}

// Keyboard Operations logger ----> keyup executes after the press is handled.
$(document).keyup(function (evt) {
  console.log("inside logger keyup");
  if (UnixZero == -1) {
    initialization();
  }
  let ph = "";
  if (placeholder_active) {
    ph = suggestion;
  }

  keyboardlog.push({
    timestamp: evt.timeStamp,
    type: "type",
    keycode: evt.which,
    cursor: cm.getCursor(),
    text: fetchContent(),
    marks: fetchMarks(),
    placeholder: ph,
    dismisses: dismissLog,
    accepts: acceptLog,
    l2dismisses: dismisslist,
  });
});

// Mouse Movement logger
// $(document).mousemove(function (evt) {
//   if (UnixZero == -1) {
//     initialization();
//   }
//   t = evt.timeStamp;
//   mouselog.push({ timestamp: t, type: "move", x: evt.pageX, y: evt.pageY });
// });

$(document).mouseup(function (evt) {
  if (UnixZero == -1) {
    initialization();
  }
  t = evt.timeStamp;
  let ph = "";
  if (placeholder_active) {
    ph = suggestion;
  }

  mouselog.push({
    timestamp: t,
    type: "click",
    x: evt.pageX,
    y: evt.pageY,
    marks: fetchMarks(),
    placeholder: ph,
    dismisses: dismissLog,
    accepts: acceptLog,
    l2dismisses: dismisslist,
    // marks: cm.getAllMarks(),
  });
});

// The following functions do not have buttons in the current version and need to be called through the console of the developer tools
// Demo can be tested in older versions
function reportKeyboardLog() {
  if (UnixZero == -1) {
    return;
  }
  let now = Date.now();
  if (keyboardlog.length > 0) {
    output = JSON.stringify(keyboardlog);
    fps = keyboardlog.length / ((now - UnixZero) / 1000); // ms -> s
    console.log("Type Speed ≈" + fps.toFixed(2) + " letters per second");
  }
  download(output, "keyboard.json");
}

function reportMouseLog() {
  if (UnixZero == -1) {
    return;
  }
  if (mouselog.length > 0) {
    output = JSON.stringify(mouselog);
    download(output, "mouse.json");
  }
}

function mouseHeatmap(mouseCoor) {
  var canvas = document.getElementById("heatmap");
  canvas.style.display = "block";
  canvas.innerHTML = "";
  canvas.onclick = function () {
    canvas.style.display = "none";
  };

  for (var i = 0; i < mouselog.length - 1; ++i) {
    xCoor = mouseCoor[i].x;
    yCoor = mouseCoor[i].y;
    type = mouseCoor[i].type;
    if (typeof xCoor == "number" && typeof yCoor == "number") {
      let d = document.createElement("div");

      if (type == "move") {
        d.style.width = "5px";
        d.style.height = "5px";
        d.style.background = "red";
        d.style.borderRadius = "50%";
        d.style.position = "absolute";
      } else if (type == "down") {
        d.style.width = "15px";
        d.style.height = "15px";
        d.style.background = "blue";
        d.style.borderRadius = "50%";
        d.style.position = "absolute";
      }
      canvas.appendChild(d);
      d.style.left = xCoor + "px";
      d.style.top = yCoor + "px";
    }
  }
}

function download(text, filename) {
  text = text.replace(/\n/g, "\r\n"); // To retain the Line breaks.
  var blob = new Blob([text], { type: "text/plain" });
  var anchor = document.createElement("a");
  anchor.download = filename;
  anchor.href = window.URL.createObjectURL(blob);
  anchor.target = "_blank";
  anchor.style.display = "none"; // just to be safe!
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

// ----------------------------------------------------------------------------------------

function onL1Toggle(evt) {
  console.log("inside onL1toggle logger");

  if (UnixZero == -1) {
    initialization();
  }
  t = evt.timeStamp;
  let state = null;
  if (evt.target.innerText === "Expressiveness on") {
    state = true;
  } else {
    state = false;
  }
  toggleLog.push({
    type: "toggleL1",
    timestamp: t,
    activated: state,
  });
}

function onL2Toggle(evt) {
  // track state change (on/off)
  console.log("inside onL2toggle logger");
  // console.log("-evt:", evt);
  // console.log("-evt.target.innerText:", evt.target.innerText);

  if (UnixZero == -1) {
    initialization();
  }
  t = evt.timeStamp;
  let state = null;
  if (evt.target.innerText === "Analysis on") {
    state = true;
  } else {
    state = false;
  }
  toggleLog.push({
    type: "toggleL2",
    timestamp: t,
    activated: state,
  });
}

let popupLogMark = null;

function logPopup(contents) {
  console.log("starting logPopup timer");
  if (UnixZero == -1) {
    initialization();
  }

  popupLogMark = performance.mark("popup-performance-mark");

  popupLog.push({
    type: "popup",
    timestamp: Date.now(),
    search_cords: contents.search_cords,
    word: contents.word,
    popup_title: contents.popup_title,
    state: "start",
  });
  setTimeout(() => {
    monitorEvents(document.body);
  }, 100);
}

let sidebarLogMark = null;

function stopLogTimerPopup(duration) {
  console.log("inside stopLogTimerPopup logger. duration in ms:", duration);
  popupLog.push({
    timestamp: Date.now(),
    type: "popup",
    duration: duration,
    state: "stop",
  });
}

function stopLogTimerSidebar(duration) {
  console.log("inside stopLogTimerSidebar logger. duration in ms:", duration);
  popupLog.push({
    timestamp: Date.now(),
    type: "sidebar",
    duration: duration,
    state: "stop",
  });
}

function logSidebar(contents) {
  console.log("starting logSidebar timer");
  if (UnixZero == -1) {
    initialization();
  }
  sidebarLogMark = performance.mark("sidebar-performance-mark");

  sidebarLog.push({
    type: "sidebar",
    timestamp: Date.now(),
    word: contents.word,
    sidebar_title: contents.sidebar_title,
    state: "start",
  });
  setTimeout(() => {
    monitorEvents(document.body);
  }, 100);
}

// -------------------------------- use this to stop other timers
function monitorEvents(element) {
  if (popupLogMark !== null) {
    var stopPopupTimer = function (e) {
      performance.measure("popupMeasure", "popup-performance-mark");
      let measures = performance.getEntriesByType("measure");

      stopLogTimerPopup(measures[0].duration);

      performance.clearMarks("popup-performance-mark");
      performance.clearMeasures("popupMeasure");

      popupLogMark = null;
      // remove my own listener
      var events2remove = [];
      for (var i in element) {
        if (i.startsWith("onclick") || i.startsWith("onkey"))
          events2remove.push(i.substring(2));
      }
      events2remove.forEach(function (eventName) {
        element.removeEventListener(eventName, stopPopupTimer);
      });
    };
    // add event listener here
    var events = [];

    for (var i in element) {
      if (i.startsWith("onclick") || i.startsWith("onkey"))
        events.push(i.substring(2));
    }
    events.forEach(function (eventName) {
      element.addEventListener(eventName, stopPopupTimer);
    });
  }
  if (sidebarLogMark !== null) {
    var stopSidebarTimer = function (e) {
      // console.log("stoping sidebar timer");
      performance.measure("sidebarMeasure", "sidebar-performance-mark");
      let measures = performance.getEntriesByType("measure");
      stopLogTimerSidebar(measures[0].duration);
      performance.clearMarks("sidebar-performance-mark");
      performance.clearMeasures("sidebarMeasure");
      sidebarLogMark = null;
      // remove my own listener
      var events2remove = [];
      for (var i in element) {
        if (i.startsWith("onclick") || i.startsWith("onkey"))
          events2remove.push(i.substring(2));
      }
      events2remove.forEach(function (eventName) {
        element.removeEventListener(eventName, stopSidebarTimer);
      });
    };
    var events = [];

    for (var i in element) {
      if (i.startsWith("onclick") || i.startsWith("onkey"))
        events.push(i.substring(2));
    }
    events.forEach(function (eventName) {
      element.addEventListener(eventName, stopSidebarTimer);
    });
  }
}
