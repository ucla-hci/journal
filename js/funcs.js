/**
 * Latest updates: 05/17/22
 * - smartcompose features almost ready
 *   - after placeholder works pretty well (not perfect)
 *   - need to fine tune edit interactions for "before" + "replace" placeholders
 *   - need to implement "replace" placeholder
 *
 * - general improvements missing
 *   - improve analysis by leveraging wordnet + phrase extensions
 *   - compile found matches in sentences and focus on 1 strategy based on importance (?)
 *
 * - need to confirm logger is working well
 *
 * - need to validate deployment scripts + adjust if necessary
 *
 */

var write = document.getElementById("write");
// init codeMirror - manipulate document using cm instance methods
var cm = CodeMirror.fromTextArea(write, {
  lineWrapping: true,
  lineNumbers: false,
  styleSelectedText: true,
  cursorHeight: 0.85,
  scrollbarStyle: null,
});

/**
 * initializing globals
 *
 */
let word_counter = {}; // <--- dict needed to
let global_feedback = [];

// Note: need to handle pairs of words e.g. "very good"
// tentative format:
let dict_temp = [
  {
    strategy_code: "L2y",
    category_number: 0, // ----------- could use array index instead
    semantic_anchor: "Positive Adjectives",
    words: ["happy", "accomplishments"],
    wordnet_ext: ["joy", "positive", "glad"],
    color: "#eb4034",
    brief_feedback: "Positive mind!",
    longer_feedback: "Longer feedback. Explain benefits of healthy mind.",
    rewrite: "Regardless of adversity, I can still find enjoyment.",
    rewrite_position: "after",
  },
  {
    strategy_code: "L2z",
    category_number: 1,
    semantic_anchor: "Suicide and death",
    words: [
      "Bury",
      "coffin",
      "kill",
      "suicide",
      "suicidal",
      "torture",
      "escape",
      "ending it",
      "die",
    ],
    wordnet_ext: [],
    color: "#34cceb",
    brief_feedback:
      "Suicide is the act of killing yourself, most often as a result of depression or other mental illness.",
    longer_feedback:
      "Suicide can be seen as a behavior motivated by the desire to escape from unbearable psychological pain. If you're experiencing these symptoms, please call 800-273-8255 (suicide hotline).",
    rewrite: "Suicide is never a solution. ",
    rewrite_position: "before",
  },
  {
    strategy_code: "L2x",
    category_number: 2,
    semantic_anchor: "Fatigue",
    words: [
      "weariness",
      "tiredness",
      "tire",
      "pall",
      "weary",
      "jade",
      "tire",
      "wear upon",
      "tire out",
      "wear",
      "weary",
      "jade",
      "wear out",
      "outwear",
      "wear down",
      "fag out",
      "fag",
    ],
    wordnet_ext: [],
    color: "#3434eb",
    brief_feedback: "Signs of depression --> Fatigue.",
    longer_feedback:
      "Depression can be defined as a mood disorder that leaves you feeling sad, disinterested in things, depressed and tired. Also called ‘clinical depression’ or ‘major depressive disorder,’ depression impacts how you think, feel, and behave, leading to a range of physical and emotional problems.",
    rewrite: "rest",
    rewrite_position: "replace",
    target_word: "writing",
    line_offset: 0,
  },
  {
    strategy_code: "L2a",
    category_number: 3,
    semantic_anchor: "Overgeneralization",
    words: [
      "never",
      "always",
      "forever",
      "again",
      "all",
      "everyone",
      "everything",
      "anyone",
      "anything",
      "only",
      "totally",
      "no one",
      "none",
      "nothing",
    ],
    wordnet_ext: [],
    color: "#5e32a8",
    brief_feedback:
      "Overgeneralization is a type of cognitive distortion where a person applies something from one event to all other events.",
    longer_feedback:
      "Overgeneralization involves your thoughts. Therefore, when you are mindful of your thoughts, you can begin to notice patterns. Once you see those patterns, you can start to break them. Some people find it useful to keep a journal in which they record their thoughts so they can identify patterns more easily, as well as identifying overgeneralization triggers.",
  },
];

/*************************************************************************** NEW ADDS */

function analyzeText(category = "all") {
  // ---------------------------------------------------------------------------------------TODO missing wordnet extension/multiword matching

  // clearSquares();
  global_feedback = [];
  word_counter = {};

  let allText = cm.getValue();
  allText = allText.replace(/[",!. ():?–-]|[^\S]/gu, " ").split(" ");
  allText = allText.filter(function (word) {
    if (word === "") {
      return false;
    }
    return true;
  });

  // param needed for search
  let start = CodeMirror.Pos(cm.firstLine(), 0);

  // store categories for matched words
  let categories = [];
  let target_category = category === "all" ? "" : category; // ----------------------------TODO - handle multiple categories

  // filter words not in dict
  allText = allText.filter(function (element) {
    for (let i = 0; i < dict_temp.length; i++) {
      if (dict_temp[i].words.indexOf(element.toLowerCase()) > -1) {
        if (target_category !== "") {
          // check target category
          // if ( target_category.indexOf(dict_temp[i].strategy_code) > -1) {
          if (dict_temp[i].strategy_code === target_category) {
            categories.push(dict_temp[i].category_number);
            return true;
          } else {
            return false;
          }
        } else {
          categories.push(dict_temp[i].category_number);
          return true;
        }
      } else {
        continue;
      }
    }
  });

  let returnArr = allText.reduce(function (
    previousElement,
    currentElement,
    index
  ) {
    if (currentElement === "") {
      return previousElement;
    }
    let offset = 0;
    if (currentElement in word_counter) {
      word_counter[currentElement] += 1;
      offset = word_counter[currentElement];
    } else {
      word_counter[currentElement] = 0;
    }

    let search_coords;
    try {
      search_coords = search(currentElement, start, offset);
    } catch (e) {
      if (e === "Not Found") {
        return previousElement;
      }
    }

    previousElement.push({
      search_coords: search_coords,
      word: currentElement,
      color: dict_temp[categories[index]].color,
      title: dict_temp[categories[index]].semantic_anchor,
      brief_feedback: dict_temp[categories[index]].brief_feedback,
      longer_feedback: dict_temp[categories[index]].longer_feedback,
      rewrite: dict_temp[categories[index]].rewrite,
      rewrite_position: dict_temp[categories[index]].rewrite_position,
    });
    return previousElement;
  },
  []);

  // console.log("analysis returnarr", returnArr);

  return returnArr;
}

function killSequence() {
  // remove periodic intervals
  if (L2interval_ID !== null) {
    toggleL2();
  }

  // remove highlihgts
  cleanMarks();

  // close popup
  if (document.getElementsByClassName("L2-popup")) {
    document.getElementsByClassName("L2-popup")[0].style.display = "none";
  }

  // closeright bar
  // document.getElementById("rightsidebar").style.width = "0px";
  document.getElementById("myBottombar").style.right = "-250px";

  word_counter = {};
  global_feedback = [];

  // rm all squares
  clearSquares();
}

function clearSquares() {
  let squarelist = document.getElementsByClassName("clickable-marker");
  if (squarelist) {
    Array.from(squarelist).forEach(function (element) {
      element.remove();
    });
  }
  return;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// https://discuss.codemirror.net/t/programmatically-search-and-select-a-keyword/1666
function search(astring, start, offset = 0) {
  // uses offset to differentiate among multiple matches

  let search_query = new RegExp(
    "(?<![^ .,?!;(\r\n])" + astring + "(?![^ .,?!;)\r\n])",
    "gm"
  );

  var cursor = cm.getSearchCursor(search_query, start, {
    caseFold: true,
    multiline: true,
  });
  for (let i = 0; i < offset; i++) {
    cursor.findNext();
  }
  if (cursor.find(false)) {
    return { from: cursor.from(), to: cursor.to() };
  } else {
    throw "Not Found";
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function showSquare(args, index = "", nearestPeriod = false) {
  var cords = cm.cursorCoords(args.search_coords.to);
  var color = args.color;

  // create marker
  let marker = document.createElement("div");
  if (index !== "") {
    marker.id = index;
    marker.className = "clickable-marker";
  }

  marker.style.position = "absolute";
  marker.style.left = (cords.left - 2).toString() + "px";
  marker.style.top = (cords.top - 1).toString() + "px";
  marker.style.opacity = 0.4;
  marker.style.display = "block";

  let color_rgb = hexToRgb(color);
  marker.style.backgroundColor =
    "rgba(" + color_rgb.r + "," + color_rgb.g + "," + color_rgb.b + ",0.6)";

  marker.addEventListener("click", function () {
    highlightText(args, index);
  });
  marker.addEventListener("mouseover", function (event) {
    // event.target.style.opacity = 0.75;
    event.target.style.backgroundColor =
      "rgba(" + color_rgb.r + "," + color_rgb.g + "," + color_rgb.b + ",1)";
  });
  marker.addEventListener("mouseout", function (event) {
    // event.target.style.opacity = 0.75;
    event.target.style.backgroundColor =
      "rgba(" + color_rgb.r + "," + color_rgb.g + "," + color_rgb.b + ",0.6)";
  });

  document.body.appendChild(marker);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var rephrase_lastTagObj = null; // is this really necessary? if not delete

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function highlightText(args, index = "") {
  cleanMarks();
  closeRightBar();
  closeNewPopup();
  var col = hexToRgb(args.color);
  // console.log(args.search_coords);
  let target_col = "rgba(" + col.r + "," + col.g + "," + col.b + ",0.4)";
  let hover_col = "rgba(" + col.r + "," + col.g + "," + col.b + ",0.7)";

  document.documentElement.style.setProperty(
    "--L2-highlight-color",
    target_col
  );

  rephrase_lastTagObj = []
    .concat(args.search_coords)
    .map(function (currentElement) {
      return cm.markText(currentElement.from, currentElement.to, {
        className: "L2-highlight",
      });
    });

  // add popup onclick
  let hls = document.getElementsByClassName("L2-highlight");
  for (let i = 0; i < hls.length; i++) {
    hls[i].addEventListener("click", function () {
      showEditorPopUp(args);
    });
    hls[i].addEventListener("mouseover", function () {
      document.documentElement.style.setProperty(
        "--L2-highlight-color",
        hover_col
      );
    });
    hls[i].addEventListener("mouseout", function () {
      document.documentElement.style.setProperty(
        "--L2-highlight-color",
        target_col
      );
    });
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function showEditorPopUp(contents) {
  let box = document.getElementsByClassName("L2-popup")[0];
  var cords = cm.cursorCoords(true);

  document.getElementById("popup-header").textContent = contents.title;
  document.getElementById("popup-content").textContent =
    contents.brief_feedback;

  let window_width = window.innerWidth;

  if (window_width - cords.left < 400) {
    // distance to
    console.log("TOO TO THE RIGHT - adjusting");
    box.style.left = (cords.left - 200).toString() + "px";
  } else {
    box.style.left = (cords.left - 100).toString() + "px";
  }
  box.style.top = (cords.top + 30).toString() + "px";

  box.style.display = "flex";

  document
    .querySelector(".readmore-container button")
    .addEventListener("click", function () {
      showRightbar(contents);
    });
}

function closeNewPopup() {
  document.getElementsByClassName("L2-popup")[0].style.display = "none";
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function showRightbar(contents) {
  document.querySelector(".right-sidebar h3").textContent = contents.title;
  document.querySelector(".right-sidebar p").textContent =
    contents.longer_feedback;
  // document.getElementById("rightsidebar").style.width = "250px";
  document.getElementById("rightsidebar").style.right = "0px";
  // document.getElementById("myBottombar").style.right = "0px";

  let rewrite_button = document.querySelector("button.rewrite-button");

  let new_rewrite_button = rewrite_button.cloneNode(true);
  rewrite_button.parentNode.replaceChild(new_rewrite_button, rewrite_button);
  new_rewrite_button.addEventListener("click", function () {
    closeNewPopup();
    triggerRewrite(contents);
  });
}

function closeRightBar() {
  // document.getElementById("rightsidebar").style.width = "0px";
  document.getElementById("rightsidebar").style.right = "-250px";
  // document.getElementById("myBottombar").style.right = "0px";
}

function triggerRewrite(contents) {
  console.log(contents.rewrite, contents.rewrite_position);

  let curr_doc = cm.getDoc();

  switch (contents.rewrite_position) {
    case "after":
      placeholder_location = "after";
      let end_line = curr_doc.lineCount() - 1;
      let end_ch = cm.getLine(end_line).length;

      let last_char = curr_doc.getRange(
        { line: end_line, ch: end_ch - 1 },
        { line: end_line, ch: end_ch }
      );

      if (!(last_char === " " || last_char === "")) {
        curr_doc.replaceRange(" ", { line: end_line, ch: end_ch++ });
      }
      cm.focus();
      cm.setCursor({ line: end_line, ch: end_ch });

      suggestion = contents.rewrite;
      delta_edits_suggestion = "";

      showPlaceholder(contents.rewrite, { line: end_line, ch: end_ch });

      placeholder_active = true;

      break;
    case "before":
      placeholder_location = "before";
      let period_cords = null;

      // search period after target text
      // try {
      //   period_cords = search(".", contents.search_coords.from);
      // } catch (e) {
      //   console.log("search error:", e);
      // }
      // if (period_cords === null) {
      //   // no period after target word
      // }

      // search previous period by comparing with target text cords
      period_cords = findPeriod(contents, period_cords);

      if (period_cords === null) {
        // no period before sentence. Set target ch = 0;
        period_cords = { line: contents.search_coords.from.line, ch: 0 };
      } else {
        period_cords["ch"] += 1;
      }

      // insert text + tag with placeholder class
      cm.replaceRange(contents.rewrite + " ", period_cords);
      cm_placeholder = cm.markText(
        period_cords,
        {
          line: period_cords.line,
          ch: period_cords.ch + contents.rewrite.length,
        },
        { className: "placeholder" }
      );

      cm.focus();
      cm.setCursor(period_cords);

      before_change_flag = true;

      placeholder_active = true;
      placeholder_coords = {
        from: period_cords,
        to: {
          line: period_cords.line,
          ch: period_cords.ch + contents.rewrite.length,
        },
      };
      suggestion = contents.rewrite;
      delta_edits_suggestion = "";
      suggestion_cursor = 0;

      break;
    case "replace":
      placeholder_location = "replace";
      // find target word
      console.log("target word: ", "writing");

      // ---------- Need to edit to ensure the right word was marked.
      let search_coords;
      try {
        search_coords = search(
          "writing",
          { line: contents.search_coords.from.line, ch: 0 },
          0
        );
        console.log("search_coords", search_coords);
        cm_placeholder = cm.markText(search_coords.from, search_coords.to, {
          className: "placeholder replace_ph",
        });
      } catch (e) {
        if (e === "Not Found") {
          return previousElement;
        }
      }
      // get search.from position
      // - insert space
      cm.replaceRange(" ", search_coords.from);
      // - move cursor here
      cm.focus();
      cm.setCursor(search_coords.from);

      placeholder_active = true;
      placeholder_coords = search_coords;

      suggestion = contents.rewrite;
      delta_edits_suggestion = "";
      suggestion_cursor = 0;
      // then -- track changes
      // - see if target word is being reached

      break;
    default:
      break;
  }
}

function findPeriod(contents, period_cords) {
  let ch_counter = 0;
  while (ch_counter < contents.search_coords.from.ch) {
    try {
      let cursor = cm.getSearchCursor(".", {
        line: contents.search_coords.from.line,
        ch: ch_counter++,
      });
      if (cursor.find(false)) {
        // if found
        if (!(cursor.from().ch > contents.search_coords.from.ch)) {
          // if in bounds
          period_cords = cursor.to();
        }
      }
    } catch (e) {
      ch_counter++;
    }
  }
  return period_cords;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function showPlaceholder(sug, target_editor_location = {}) {
  if (placeholder_active) {
    return;
  }

  let cmbox = document
    .querySelector("pre.CodeMirror-line")
    .getBoundingClientRect();

  let target_cord = cm.charCoords(target_editor_location);

  placeholder_coords = { from: target_editor_location };

  let x = document.createElement("div");
  x.id = "dynamic_placeholder";

  x.style.position = "absolute";
  x.style.left = (cmbox.left - 0.1).toString() + "px";
  x.style.width = (cmbox.width - 8).toString() + "px";
  x.style.top = (target_cord.top + 1).toString() + "px";
  x.style.textIndent = (target_cord.left - cmbox.left - 3).toString() + "px";
  x.style.height = (target_cord.bottom - target_cord.top).toString() + "px";
  x.style.fontSize = "18px";
  x.style.zIndex = "1";
  x.style.color = "lightgrey";
  x.style.padding = "0px 3.3px";
  x.style.overflowWrap = "break-word";
  x.style.lineHeight = "28px";
  x.style.display = "inline-block";

  // x.style.border = "solid 1px rgba(255,0,0,70)";

  x.textContent = sug;
  document.body.appendChild(x);
}

function hidePlaceholder() {
  // OJO: placeholder_active remains true here!
  let placeh = document.querySelector("#dynamic_placeholder");
  if (placeh) {
    placeh.style.visibility = "hidden";
  }
}

function reShowPlaceholder() {
  let placeh = document.querySelector("#dynamic_placeholder");
  if (placeh) {
    placeh.style.visibility = "";
  }
}

function dismissPlaceholder() {
  if (!placeholder_active) {
    return;
  }

  //hacky solution
  let placeh = document.querySelector("#dynamic_placeholder");
  if (placeh) {
    placeh.remove();
  }

  // cm solution
  console.log("cm_placeholder", cm_placeholder);
  if (Object.keys(cm_placeholder) !== 0) {
    if (placeholder_location === "replace") {
      if (suggestion === delta_edits_suggestion) {
        // win
        let mark_locations = cm_placeholder.find();
        console.log("ph mark", mark_locations);
        cm.replaceRange("", mark_locations.from, mark_locations.to);
        cm_placeholder = {};
      } else {
        cm_placeholder.clear();
        cm_placeholder = {};
      }
    } else {
      let mark_locations = cm_placeholder.find();
      console.log("ph mark", mark_locations);
      cm.replaceRange("", mark_locations.from, mark_locations.to);
      cm_placeholder = {};
    }
  }

  delta_edits_suggestion = "";
  placeholder_active = false;
  placeholder_coords = {};
  suggestion_cursor = 0;
}

/************************* End new adds */

var feedbackMsg = "";

var entries;
var key,
  prevKey,
  flag = 0;
// var suggestion, s_start, s_end;
var s_start, s_end;

// IndexedDB计数器
var maxID = 0;
var currentID = 0;

// 键入数据的临时存储，之后存到IndexedDB中
var currentFlag = 0;
var currentDate = "";
var entryTitle = {};
var entryFlag = {};

var promptObjects = new Array();
var _del_ID = 0;

// onLoad方法，网站载入成功后执行，放初始化相关的东西
function loader() {
  document.getElementById("main").style.display = "none";
  document.getElementById("temp").style.display = "block";
}

window.addEventListener("beforeunload", async function (e) {
  await manualSave();
});

// 输入/标注模式切换，注意，为了方便这里用了绝对地址
async function changeMode(option) {
  await manualSave();
  if (option === "writing") {
    window.open("/", "_self");
  }
  if (option === "rephrase") {
    window.open("/rephrase", "_self");
  }
  if (option === "expert") {
    window.open("/exp", "_self");
  }
}

// Simple Toast System
var timer = setInterval(function () {
  if (currentID > 0) {
    saveEntry();
    let aObj = document.getElementById("toast");
    aObj.innerText = "Auto Saving...";
    setTimeout(autoSaveRec, 1000);
  }
}, 20000);

// 自动保存 及 配套的简单过渡动画
function autoSaveRec() {
  let aObj = document.getElementById("toast");
  aObj.innerText = "Saved";
  aObj.style.color = "var(--save-confirm)";
  setTimeout(function () {
    aObj.innerText = "Save";
    aObj.style.color = "var(--save-normal)";
  }, 1300);
}

function manualSave() {
  if (currentID > 0) {
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
// function createMenu() {
//   console.log("createMenu");
//   menuData();
// }

function initMenu() {
  maxID = 0;
  currentID = 1;
  entryTitle = {};
}

// 回调函数，会被indexDB.js中的方法调用。入参menu即使entry的摘要信息
function buildMenu(menu, _maxID) {
  // console.log("buildMenu");
  // console.log(menu);
  $("#entryTitles").empty();
  if (menu && menu !== "menuFailed") {
    maxID = _maxID;
    for (id in menu) {
      let title = menu[id]["title"];
      // console.log(title, title.length);
      if (title.length > 14) {
        title = title.slice(0, 12) + "...";
      }
      let flag = menu[id]["flag"];
      if (title != null) {
        if (id === "0") {
          $("#entryTitles").append(
            '<div class="oneEntry"><div class="delbt" style="opacity: 1%"></div><div class="circle1"></div><p class="sidebar-title" onclick="openEntry(0)">Prompts</p></div>'
          );
          continue;
        }
        let del = '<div class="delbt" onclick="deleteEntry(' + id + ')"></div>';
        let fg = '<div class="circle' + flag + '"></div>';
        let short =
          '<p class="sidebar-title" onclick="openEntry(' +
          id +
          ')">' +
          title +
          "</p>";
        $("#entryTitles").append(
          '<div class="oneEntry">' + del + fg + short + "</div>"
        );
      }
    }
  }
}

// Entry Manipulations
function newEntry() {
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

function toEntry(mood) {
  currentID = maxID + 1;
  document.getElementById("toast").style.display = "block";
  document.getElementById("temp").style.display = "none";
  document.getElementById("main").style.display = "block";
  currentDate = getTime();
  $("#entrydate").text(currentDate);

  if (mood == "good") {
    currentFlag = 1;
  } else if (mood == "bad") {
    currentFlag = 3;
  } else if (mood == "neutral") {
    currentFlag = 2;
  }
  document.getElementById("title").innerHTML = "Enter the title here..."; // + today;
  refreshFlagColor();
}

function deleteEntry(id) {
  _del_ID = id;
  messagePopUp("Do you want to delete this entry?"); // 删除确认->confirmDelete()
}

// 回调：删除执行
function deleteEntryRecall() {
  // console.log("deleting entry #" + _del_ID);
  removeData(_del_ID);
  _del_ID = 0;
  newEntry();
}

function openEntry(id) {
  // cleanMarks();
  dismissPlaceholder();
  closeNewPopup();
  clearSquares();
  closeRightBar();
  document.getElementById("toast").style.display = "block";
  // console.log("Open entry #" + id);
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
  } else {
    addData(id, flag, title, content, date, marks, mouselog, keyboardlog);
  }
}

function loadContent(id) {
  // console.log("Loading entry #" + id);
  readData(id); // 在indexDB.js中
}

// 由indexDB.js中的方法发起的回调
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
    tag = m["tag"];
    from = m["from"];
    to = m["to"];
    if (tag === "autosuggest-font") {
      promptInstance = cm.markText(from, to, { className: tag });
    } else {
      cm.markText(from, to, { className: tag });
    }
  }
  cleanMarks(); // ------------------------------------------------------- ATTENTION when reviewing writitng+reflection
  //saveEntry();
}

// CodeMirror Utilities
function fetchTitle() {
  var text = $("#title").text();
  return text;
}

function fetchContent() {
  var text = cm.getValue();
  return text;
}

function cleanMarks() {
  cm.getAllMarks().forEach((mark) => {
    mark.clear();
  });
}

function fetchMarks() {
  // console.log("fetchMarks");
  var marksOutput = new Array();
  cm.getAllMarks().forEach((mark) => {
    // console.log(mark, mark.find());
    if (mark.find().to) {
      marksOutput.push({
        tag: mark.className,
        from: { line: mark.find().from.line, ch: mark.find().from.ch },
        to: { line: mark.find().to.line, ch: mark.find().to.ch },
      });
    }
  });
  return marksOutput;
}

// Other Utilities
function getTime() {
  let today = new Date();
  let yy = String(today.getFullYear());
  let dd = String(today.getDate()).padStart(2, "0");
  let mm = String(today.getMonth() + 1).padStart(2, "0");
  let hh = String(today.getHours());
  let mn = String(today.getMinutes());

  if (mn.length < 2) {
    mn = "0" + mn;
  }
  currentDate = mm + "/" + dd + "/" + yy + " " + hh + ":" + mn;
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
      $(".circleCurrnetFlag").css("background-color", "#8ac8a4");
    } else if (currentFlag === 2) {
      $(".circleCurrnetFlag").css("background-color", "#2f7fed");
    } else if (currentFlag === 3) {
      $(".circleCurrnetFlag").css("background-color", "#fa9a9a");
    }
  }
}

// Related Utilities
function checkInRange(target, start, end, offset = 0) {
  // Offset > 1 need special handle, otherwise document may lose contents
  if (offset > 0) {
    end.ch += offset;
  } else {
    start.ch += offset;
  }
  if (
    target.line >= start.line &&
    target.ch >= start.ch &&
    target.line <= end.line &&
    target.ch <= end.ch
  ) {
    return true;
  } else {
    console.log(
      target.line >= start.line,
      target.ch >= start.ch,
      target.line <= start.line,
      target.ch <= start.ch
    );
    return false;
  }
}

// 拆分location信息为line#和char#
function analysisCoord(coord) {
  if (coord != null) {
    return { l: parseInt(coord["line"]), c: parseInt(coord["ch"]) };
  }
}

// 比较两个location坐标是否相同
function compareCoord(start, end) {
  if (start == null || end == null) {
    return false;
  } else {
    let st = analysisCoord(start);
    let ed = analysisCoord(end);
    if (st.l != ed.l) {
      return false;
    } else if (st.c != ed.c) {
      return false;
    }
    return true;
  }
}

// 判断光标是否由键盘触发移动
function isMovementKey(keyCode) {
  return 33 <= keyCode && keyCode <= 40;
}

// UI Operations
function openNav() {
  document.getElementById("mySidebar").style.left = "0px";
  let bottombar = document.getElementById("myBottombar");
  if (bottombar) {
    bottombar.style.left = "220px";
  }

  document.getElementById("opnsidebar").setAttribute("onclick", "closeNav()");
}

function closeNav() {
  document.getElementById("mySidebar").style.left = "-220px";
  let bottombar = document.getElementById("myBottombar");
  if (bottombar) {
    bottombar.style.left = "0px";
  }
  document.getElementById("opnsidebar").setAttribute("onclick", "openNav()");
}

function openDef() {
  document.getElementById("myBottombar").style.height = "auto";
  document.getElementById("myBottombar").style.minHeight = "200px";
  document.getElementById("main").style.marginBottom = "250px";
}

function closeDef() {
  document.getElementById("myBottombar").style.height = "0";
  document.getElementById("myBottombar").style.minHeight = "0";
  document.getElementById("main").style.marginBottom = "0";
}

function acceptChange() {
  cm.replaceRange(suggestion, s_start, s_end);
  $("#textmanipulation").css("display", "none");
}

function rejectChange() {
  $("#textmanipulation").css("display", "none");
}

function messagePopUp(text) {
  $("#popUpMessage").text(text);
  showPopUp();
  console.log("show");
}

function showPopUp() {
  $("#popUpWindow").css("display", "block");
}

function hidePopUp() {
  $("#popUpWindow").css("display", "none");
}

function confirmDelete() {
  hidePopUp();
  deleteEntryRecall();
}

// CodeMirror Listener
// Handling mouse activities
var movedByMouse = false;
cm.on("mousedown", function () {
  movedByMouse = true;
});

cm.on("keyup", function () {
  prevKey = key;
  key = event.keyCode;

  if (isMovementKey(event.which)) {
    movedByMouse = false;
  }

  // 当检测到断句，换行等操作时，触发自动保存
  if (key == 190 || key == 110 || key == 13 || key == 49 || key == 191) {
    if (currentID > 0) {
      saveEntry(); //Autosave
      let aObj = document.getElementById("toast");
      aObj.innerText = "Auto Saving...";
      setTimeout(autoSaveRec, 1000);
    }
    clearInterval(timer);
    timer = setInterval(function () {
      if (currentID > 0) {
        saveEntry();
        let aObj = document.getElementById("toast");
        aObj.innerText = "Auto Saving...";
        setTimeout(autoSaveRec, 1000);
      }
    }, 20000); // 动画持续时间的控制变量
  }
});

cm.on("beforeChange", function (cm, changeObj) {
  console.log("beforeChange changeObj", changeObj);
  // send one for input
  if (
    placeholder_active &&
    before_change_flag &&
    changeObj.origin !== "+delete"
  ) {
    changeObj.cancel();
    newEdit(changeObj);
  }
  // send one for removing
  if (
    placeholder_active &&
    before_change_flag &&
    changeObj.origin === "+delete"
  ) {
    console.log("beforchange delete");
    backspacePlaceholder();
  }
  // If change occurs somewhere else, query mark and clear it. --> aka dismiss
});

// USE FLAG TO AVOID INFINITE LOOP
function newEdit(prevChangeObj) {
  console.log("in new edit, prevChangeObj", prevChangeObj);
  before_change_flag = false;

  cm.replaceRange(prevChangeObj.text[0], prevChangeObj.from, {
    line: prevChangeObj.to.line,
    ch: prevChangeObj.to.ch + 1,
  });

  setTimeout(() => {
    before_change_flag = true;
  }, 10);
}

function backspacePlaceholder() {
  // ---------------------------------------------------------------------------------------- TODO:
  // use suggestion cursor to get backspaced letter
  console.log(
    "backspacePlaceholder suggestion[suggestion_cursor]",
    suggestion[suggestion_cursor]
  );
  // then insert with placeholder mark
}

let before_change_flag = false;

let cm_placeholder = {};
let placeholder_active = false;
let placeholder_location = "";
let placeholder_coords = {}; // two coords objects if bounded by two. one if at the end

let suggestion = "";
let delta_edits_suggestion = "";
let suggestion_cursor = 0;
let typo_counter = 0;

function resetPHStates() {
  delta_edits_suggestion = "";
  placeholder_active = false;
  placeholder_coords = {};
  suggestion_cursor = 0;
}

// if input --> changeObj.origin === "+input"
// if delete --> changeObj.origin === "+delete"
cm.on("change", function (cm, changeObj) {
  console.log("inside onchange func", changeObj);
  let input = changeObj.text;
  let removed = changeObj.removed;

  if (placeholder_active) {
    // detect edit location ----------------------------------
    if (
      placeholder_location === "before" ||
      placeholder_location === "replace"
    ) {
      // check two bounds - necessary in case in between texts
      if (
        changeObj.from.line < placeholder_coords.from.line ||
        changeObj.from.ch < placeholder_coords.from.ch ||
        changeObj.from.line > placeholder_coords.to.line ||
        changeObj.from.ch > placeholder_coords.to.ch
      ) {
        console.log("dimissing ph");
        closePH_lose();
        before_change_flag = false;
      }
    } else if (placeholder_location === "after") {
      // check only final end bound
      if (
        changeObj.from.line < placeholder_coords.from.line ||
        changeObj.from.ch < placeholder_coords.from.ch
      ) {
        closePH_lose();
        before_change_flag = false;
      }
    }

    // detect newline ----------------------------------
    if (input.length === 2) {
      console.log("new line --> closingPH lose");
      closePH_lose();
      before_change_flag = false;
    }

    // backspace -- pop from delta + decrement cursor
    else if (input[0] === "" && removed[0] !== "" && removed[0].length === 1) {
      if (placeholder_location === "after") {
        delta_edits_suggestion = delta_edits_suggestion.slice(0, -1);
        suggestion_cursor--;
      } else {
        // backspace for cm_placeholder
        // ---------------------------------------------------------------------TODO: missing backspace on replace/before
        closePH_lose();
      }
      // ------------------------------------------------------------------------------------ TODO - compare+show suggestion
    }

    // handle larger deletes/inserts ------------------

    // on correct -------------------------------------
    else if (input[0] === suggestion[suggestion_cursor]) {
      console.log("good", input[0]);
      suggestion_cursor++;
      delta_edits_suggestion += input[0];
      if (typo_counter > 0) {
        typo_counter = 0;
        reShowPlaceholder();
      }
    }
    // if typo -- hide -----------------------------------
    else if (
      input[0] !== suggestion[suggestion_cursor] &&
      (placeholder_location !== "after" || removed[0] === "")
    ) {
      // console.log("typo!");
      hidePlaceholder();
      delta_edits_suggestion += input[0];
      suggestion_cursor++;
      typo_counter++;
    }
    console.log("typo_counter", typo_counter);
    if (typo_counter >= 1) {
      console.log("max errors reached. dismissing");
      closePH_lose();
      before_change_flag = false;
    }

    // if success! ------------------------------------------
    if (suggestion === delta_edits_suggestion) {
      console.log("rewrite accepted successfully!");
      closePH_win();
      before_change_flag = false;
    }
  }
});

function closePH_lose() {
  dismissPlaceholder();
  resetPHStates();
}

function closePH_win() {
  dismissPlaceholder();
  resetPHStates();
}

/**
 * input_cat :  is used to select what analysis category to focus on
 *              By default this string is empty which selects all
 */
function manualAnalyzeTrigger(force_cook = false, input_cat = "") {
  let previous_feedback = global_feedback;

  if (input_cat === "") {
    global_feedback = analyzeText();
  } else {
    global_feedback = analyzeText(input_cat);
  }

  // skip recook if not needed
  if (
    JSON.stringify(global_feedback) === JSON.stringify(previous_feedback) &&
    force_cook === false
  ) {
    return;
  }

  clearSquares();

  if (global_feedback.length > 0) {
    global_feedback.map((element, index) => {
      showSquare(element, index.toString());
      return;
    });
  }
}

let L2interval_ID = null;

function toggleL2() {
  let temp = document.querySelector("button.L2Button");
  if (temp.textContent === "Analysis off") {
    temp.textContent = "Analysis on";
    temp.style.opacity = 0.8;
    manualAnalyzeTrigger((force_cook = true), "");
    L2interval_ID = setInterval(manualAnalyzeTrigger, 200);
  } else {
    temp.textContent = "Analysis off";
    clearSquares();
    temp.style.opacity = 0.3;
    clearInterval(L2interval_ID);
  }
}

toggleL2();
