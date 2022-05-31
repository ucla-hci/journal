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

function testNLP() {
  let selectedText = cm.getSelection();
  console.log(normalizeText(selectedText));
  let target = "james";
  console.log("leven test", leven(selectedText, target));
}

let normOptions = {
  whitespace: true,
  case: false,
  punctuation: false,
  unicode: false,
  contractions: true,
  acronyms: false,
  parentheses: false,
  possessives: true,
  plurals: true,
  verbs: true,
  honorifics: false,
};

function normalizeText(input) {
  if (typeof input === "string") {
    return nlp(input).normalize(normOptions).out();
  }
  // handle arrays ...
}

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
let word_counter = {}; // <--- dict needed to capture right place of word.
let global_feedback = [];

let dict_temp = [
  {
    strategy_code: "L2a",
    category_number: 1,
    semantic_anchor: "Positive Adjectives",
    words: ["brave"],
    wordnet_ext: [],
    phrase_ext: ["xx is adj"],
    rewrite: ["... because"],
    rewrite_position: "after",
    brief_feedback: null,
    longer_feedback: null,
    color: "#597dce",
  },
  {
    strategy_code: "L2a",
    category_number: 2,
    semantic_anchor: "Negative Adjectives",
    words: ["egoist", "egoistic"],
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: ["This is a negative thought."],
    rewrite_position: "before",
    brief_feedback: null,
    longer_feedback: null,
    color: "#d27d2c",
  },
  {
    strategy_code: "L2b",
    category_number: 1,
    semantic_anchor: "Should Statement",
    words: ["should"],
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: ["can", "choose", "want to", "prefer", "would like to", "plan to"],
    rewrite_position: "replace",
    brief_feedback: null,
    longer_feedback: null,
    color: "#8595a1",
  },
  {
    strategy_code: "L2b",
    category_number: 2,
    semantic_anchor: "All or Nothing Thinking / Overgeneralization",
    words: [
      "never",
      "always",
      "forever",
      "all",
      "everyone",
      "everything",
      "anyone",
      "anything",
      "only",
      "totally",
      "no one",
      "again",
      "nothing",
      "none",
    ],
    wordnet_ext: ["everybody", "anybody"],
    phrase_ext: [],
    rewrite: [
      "Things feel very black and white, right or wrong but they don't have to be.",
    ],
    rewrite_position: "before",
    brief_feedback: null,
    longer_feedback: null,
    color: "#6daa2c",
  },
  {
    strategy_code: "L2b",
    category_number: 3,
    semantic_anchor: "Catastrophizing",
    words: ["what if"],
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Thinking of potential scenarios could be beneficial, but only if I consider rationally good and bad outcomes.",
    ],
    rewrite_position: "before",
    brief_feedback: null,
    longer_feedback: null,
    color: "#d2aa99",
  },
  {
    strategy_code: "L2c",
    category_number: 0,
    semantic_anchor: "Dysfunctional Self-Talk",
    words: [
      "loser",
      "suck",
      "hate",
      "lazy",
      "the worst",
      "useless",
      "failure",
      "pathetic",
      "good-for-nothing",
      "dumb",
      "stupid",
    ],
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: ["I am having the thought of ..."],
    rewrite_position: "after",
    brief_feedback: null,
    longer_feedback: null,
    color: "#6dc2ca",
  },
  {
    strategy_code: "L2d",
    category_number: 1,
    semantic_anchor: "Signs of Depression -> Depressed Mood or Dyshphoria",
    words: ["depress", "depressed", "depression"],
    wordnet_ext: [
      "gloomy grim",
      "blue",
      "dispirited",
      "down",
      "downcast",
      "downhearted",
      "down in the mouth",
      "low",
      "low-spirited",
    ],
    phrase_ext: [],
    rewrite: [
      "There is nothing wrong with feeling bad. Everybody experiences it sometime.",
    ],
    rewrite_position: "after",
    brief_feedback:
      "Depression is a mental state of low mood and aversion to activity",
    longer_feedback:
      "Classified medically as a mental and behavioral disorder, the experience of depression affects a person's thoughts, behavior, motivation, feelings, and sense of well-being. The core symptom of depression is said to be anhedonia, which refers to loss of interest or a loss of feeling of pleasure in certain activities that usually bring joy to people.",
    color: "#140c1c",
  },
  {
    strategy_code: "L2d",
    category_number: 1,
    semantic_anchor: "Signs of Depression -> Depressed Mood or Dyshphoria",
    words: [],
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    brief_feedback:
      "Depression is a mental state of low mood and aversion to activity",
    longer_feedback:
      "Classified medically as a mental and behavioral disorder, the experience of depression affects a person's thoughts, behavior, motivation, feelings, and sense of well-being. The core symptom of depression is said to be anhedonia, which refers to loss of interest or a loss of feeling of pleasure in certain activities that usually bring joy to people.",
    color: "#140c1c",
  },
  {
    strategy_code: "L2d",
    category_number: 2,
    semantic_anchor: "Signs of Depression -> Hopeless Outlook",
    words: ["helpless"],
    wordnet_ext: ["incapacitated "],
    phrase_ext: ["nobody/no one + help"],
    rewrite: ["But ..."],
    rewrite_position: "after",
    brief_feedback:
      "Hopelessness is an emotion characterized by a lack of hope, optimism, and passion",
    longer_feedback:
      "Hopelessness is a powerful emotion that often contributes to a dark or low mood and may adversely affect the way one perceives the self, other individuals, personal circumstances, and even the world. Often hopelessness can have a significant influence on human behavior, as it may reflect an individual’s negative view of the future.",
    color: "#442434",
  },
  {
    strategy_code: "L2d",
    category_number: 2,
    semantic_anchor: "Signs of Depression -> Hopeless Outlook",
    words: ["hopeless"],
    wordnet_ext: [],
    phrase_ext: ["no/don't + help"],
    rewrite: ["But ..."],
    rewrite_position: "after",
    brief_feedback:
      "Hopelessness is an emotion characterized by a lack of hope, optimism, and passion",
    longer_feedback:
      "Hopelessness is a powerful emotion that often contributes to a dark or low mood and may adversely affect the way one perceives the self, other individuals, personal circumstances, and even the world. Often hopelessness can have a significant influence on human behavior, as it may reflect an individual’s negative view of the future.",
    color: "#442434",
  },
  {
    strategy_code: "L2d",
    category_number: 2,
    semantic_anchor: "Signs of Depression -> Hopeless Outlook",
    words: ["guilty"],
    wordnet_ext: [],
    phrase_ext: ["all my fault", " blame on me"],
    rewrite: ["But ..."],
    rewrite_position: "after",
    brief_feedback:
      "Hopelessness is an emotion characterized by a lack of hope, optimism, and passion",
    longer_feedback:
      "Hopelessness is a powerful emotion that often contributes to a dark or low mood and may adversely affect the way one perceives the self, other individuals, personal circumstances, and even the world. Often hopelessness can have a significant influence on human behavior, as it may reflect an individual’s negative view of the future.",
    color: "#442434",
  },
  {
    strategy_code: "L2d",
    category_number: 2,
    semantic_anchor: "Signs of Depression -> Hopeless Outlook",
    words: [],
    wordnet_ext: [],
    phrase_ext: ["hate myself"],
    rewrite: ["But ..."],
    rewrite_position: "after",
    brief_feedback:
      "Hopelessness is an emotion characterized by a lack of hope, optimism, and passion",
    longer_feedback:
      "Hopelessness is a powerful emotion that often contributes to a dark or low mood and may adversely affect the way one perceives the self, other individuals, personal circumstances, and even the world. Often hopelessness can have a significant influence on human behavior, as it may reflect an individual’s negative view of the future.",
    color: "#442434",
  },
  {
    strategy_code: "L2d",
    category_number: 2,
    semantic_anchor: "Signs of Depression -> Hopeless Outlook",
    words: ["worthlessness", "worthless"],
    wordnet_ext: [
      "despicable",
      "ugly",
      "vile",
      "slimy",
      "unworthy",
      "worthless",
      "wretched ",
    ],
    phrase_ext: [
      "what is the point",
      "there is no point",
      "worth nothing",
      "not worthing anything",
    ],
    rewrite: ["But ..."],
    rewrite_position: "after",
    brief_feedback:
      "Hopelessness is an emotion characterized by a lack of hope, optimism, and passion",
    longer_feedback:
      "Hopelessness is a powerful emotion that often contributes to a dark or low mood and may adversely affect the way one perceives the self, other individuals, personal circumstances, and even the world. Often hopelessness can have a significant influence on human behavior, as it may reflect an individual’s negative view of the future.",
    color: "#442434",
  },
  {
    strategy_code: "L2d",
    category_number: 3,
    semantic_anchor: "Signs of Depression -> Loss of interest in activities",
    words: ["indifferent"],
    wordnet_ext: ["apathetic"],
    phrase_ext: [
      "loss of interest",
      " lost/lose interest",
      " used to + interest*",
    ],
    rewrite: ["Have I been unusually tired lately?"],
    rewrite_position: "after",
    brief_feedback:
      "This loss of interest is known as anhedonia — a main symptom of depression.",
    longer_feedback:
      "This loss of interest is known as anhedonia — a main symptom of depression. Loss of interest can be an overwhelming and far-reaching symptom that impacts your relationships with friends and family, your sexual health, work and school productivity, and hobby enjoyment.",
    color: "#30346d",
  },
  {
    strategy_code: "L2d",
    category_number: 4,
    semantic_anchor: "Signs of Depression -> Sleep and Appetite Changes",
    words: ["starving"],
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: ["hungry"],
    rewrite_position: "replace",
    brief_feedback:
      "Depression can affect our appetite and change the relationship that we have with food. It can cause us to eat unhealthily, eat more than usual and it can also lead to a loss of appetite.",
    longer_feedback:
      "When someone has depression, it may be that they occasionally skip or do not finish their meals. They may go for days without eating or drinking enough. This can impact on their energy levels and cause weight loss and health problems, making their depression even worse.",
    color: "#4e4a4e",
  },
  {
    strategy_code: "L2d",
    category_number: 4,
    semantic_anchor: "Signs of Depression -> Sleep and Appetite Changes",
    words: ["insomnia", "disrupted sleep", "lethargy"],
    wordnet_ext: ["sleeplessness"],
    phrase_ext: ["can't sleep", " sleep less"],
    rewrite: ["Maybe I should get some rest."],
    rewrite_position: "after",
    brief_feedback:
      "Sleep problems can increase the risk of initially developing depression, and persistent sleep issues can also increase the risk of relapse in people who have successfully been treated for depression.",
    longer_feedback:
      "Sleep issues associated with depression include insomnia, hypersomnia, and obstructive sleep apnea. Insomnia is the most common and is estimated to occur in about 75% of adult patients with depression9. It is believed that about 20% of people with depression have obstructive sleep apnea and about 15% have hypersomnia. Many people with depression may go back and forth between insomnia and hypersomnia during a single period of depression.",
    color: "#4e4a4e",
  },
  {
    strategy_code: "L2d",
    category_number: 5,
    semantic_anchor: "Signs of Depression -> Fatigue",
    words: ["fatigue"],
    wordnet_ext: [
      "weariness",
      "tiredness\ntire",
      "pall",
      "weary",
      "jade \ntire",
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
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    brief_feedback: null,
    longer_feedback: null,
    color: "#854c30",
  },
  {
    strategy_code: "L2d",
    category_number: 6,
    semantic_anchor: "Signs of Depression -> Restlessness",
    words: ["restlessness"],
    wordnet_ext: ["uneasiness", " queasiness"],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    brief_feedback: null,
    longer_feedback: null,
    color: "#346524",
  },
  {
    strategy_code: "L2d",
    category_number: 7,
    semantic_anchor: "Signs of Depression -> Concentration Problems",
    words: ["distract"],
    wordnet_ext: [
      "perturb",
      " unhinge",
      " disquiet",
      " trouble",
      " cark",
      " disorder ",
    ],
    phrase_ext: ["can't/hard to concentrate/focus/pay attention"],
    rewrite: null,
    rewrite_position: null,
    brief_feedback: null,
    longer_feedback: null,
    color: "#d04648",
  },
  {
    strategy_code: "L2d",
    category_number: 8,
    semantic_anchor: "Signs of Depression -> Suicidal ideation",
    words: [
      "ending it",
      "die",
      "Bury",
      "coffin",
      "kill",
      "suicide",
      "suicidal",
      "torture",
      "escape",
    ],
    wordnet_ext: ["self-destruction", " self-annihilation", " felo-de-se"],
    phrase_ext: ["end my life"],
    rewrite: null,
    rewrite_position: null,
    brief_feedback: null,
    longer_feedback: null,
    color: "#757161",
  },
  {
    strategy_code: "L2e",
    category_number: 1,
    semantic_anchor: "First Pronoun",
    words: ["self", "myself", "mine", "I", "me", "my"],
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    brief_feedback: null,
    longer_feedback: null,
    color: "#dad45e",
  },
  {
    strategy_code: "L2f",
    category_number: 1,
    semantic_anchor: "Insights words",
    words: ["realize", "understand"],
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: ["L2f No Reprogramming"],
    rewrite_position: null,
    brief_feedback: null,
    longer_feedback: null,
    color: "#deeed6",
  },
  {
    strategy_code: "L2f",
    category_number: 2,
    semantic_anchor: "Coherent narrative words",
    words: ["hence", "because", "therefore"],
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    brief_feedback: null,
    longer_feedback: null,
    color: "#aed65a",
  },
  {
    strategy_code: "L2f",
    category_number: 3,
    semantic_anchor: "Constructive Self-Talk",
    words: ["work on", "help", "improve"],
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    brief_feedback: null,
    longer_feedback: null,
    color: "#44aa38",
  },
  {
    strategy_code: "L2f",
    category_number: 4,
    semantic_anchor: "Cognitive Defusion",
    words: [],
    wordnet_ext: [],
    phrase_ext: ["I am having the thought of"],
    rewrite: null,
    rewrite_position: null,
    brief_feedback: null,
    longer_feedback: null,
    color: "#d3cd57",
  },
];

/*************************************************************************** NEW ADDS */

function get_ngram(alist, n) {
  let holder = [];
  for (let i = 0; i < alist.length - (n - 1); i++) {
    let temp = alist[i];
    for (let j = 1; j < n; j++) {
      temp = temp.concat(" ", alist[i + j]);
    }
    holder.push(temp);
  }
  return holder;
}

function analyzeText() {
  // ---------------------------------------------------------------------------------------TODO missing wordnet extension

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

  nWords_fulldoc = allText.length;

  allText = allText.concat(get_ngram(allText, 2), get_ngram(allText, 3));

  // param needed for search
  let start = CodeMirror.Pos(cm.firstLine(), 0);

  // store categories for matched words
  let categories = [];

  // filter words not in dict
  allText = allText.filter(function (element) {
    for (let i = 0; i < dict_temp.length; i++) {
      if (dict_temp[i].words.indexOf(element.toLowerCase()) > -1) {
        categories.push({
          strategy_code: dict_temp[i].strategy_code,
          category_number: dict_temp[i].category_number,
        });
        return true;
      } else if (dict_temp[i].wordnet_ext.indexOf(element.toLowerCase()) > -1) {
        categories.push({
          strategy_code: dict_temp[i].strategy_code,
          category_number: dict_temp[i].category_number,
        });
        return true;
      } else if (dict_temp[i].phrase_ext.indexOf(element.toLowerCase()) > -1) {
        categories.push({
          strategy_code: dict_temp[i].strategy_code,
          category_number: dict_temp[i].category_number,
        });
        return true;
      }
      {
        continue;
      }
    }
  });

  let returnArr = allText.reduce(function (
    previousElement,
    currentElement,
    index
  ) {
    // console.log("reducing", currentElement);
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
        console.log("in reduce -- not found error", currentElement);
        return previousElement;
      }
    }

    let obj_filt = dict_temp.filter(
      (entry) =>
        entry.strategy_code === categories[index].strategy_code &&
        entry.category_number === categories[index].category_number
    )[0];

    previousElement.push({
      // maybe add normalization marker here?
      search_coords: search_coords,
      word: currentElement,
      color: obj_filt.color,
      title: obj_filt.semantic_anchor,
      brief_feedback: obj_filt.brief_feedback,
      longer_feedback: obj_filt.longer_feedback,
      rewrite: obj_filt.rewrite,
      rewrite_position: obj_filt.rewrite_position,
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

  // remove previous event listeners.
  var old_element = document.querySelector(".readmore-container button");
  var new_element = old_element.cloneNode(true);
  old_element.parentNode.replaceChild(new_element, old_element);
  new_element.addEventListener("click", function () {
    showRightbar(contents);
  });
}

function closeNewPopup() {
  let popup = document.querySelector(".L2-popup");
  if (popup) {
    popup.style.display = "none";
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function showRightbar(contents) {
  document.querySelector(".right-sidebar h3").textContent = contents.title;
  document.querySelector(".right-sidebar p").textContent =
    contents.longer_feedback;
  document.getElementById("rightsidebar").style.right = "0px";

  let b_rewrite = false;
  if (contents.rewrite !== null) {
    b_rewrite = contents.rewrite.length > 0;
  }

  let rewrite_button = document.querySelector("button.rewrite-button");

  if (b_rewrite) {
    rewrite_button.style.display = "block";
    let new_rewrite_button = rewrite_button.cloneNode(true);
    rewrite_button.parentNode.replaceChild(new_rewrite_button, rewrite_button);
    new_rewrite_button.addEventListener("click", function () {
      closeNewPopup();
      triggerRewrite(contents);
    });
  } else {
    rewrite_button.style.display = "none";
  }
}

function closeRightBar() {
  // document.getElementById("rightsidebar").style.width = "0px";
  document.getElementById("rightsidebar").style.right = "-250px";
  // document.getElementById("myBottombar").style.right = "0px";
  cleanMarks();
}

function triggerRewrite(contents) {
  console.log(contents.rewrite, contents.rewrite_position);
  if (placeholder_active) {
    return false;
  }

  // IMPLEMENT HERE IF NEED TO DECIDE ON MULTIPLE REWRITE OPTIONS FROM DICT ARRAYS
  // currently, just extracting the one item
  let rewrite_content =
    contents.rewrite[Math.floor(Math.random() * contents.rewrite.length)];
  // let rewrite_position = contents.rewrite_position;
  // console.log(rewrite_content, rewrite_position);

  let curr_doc = cm.getDoc();

  switch (contents.rewrite_position) {
    case "end":
      placeholder_location = "end";

      cm.replaceRange(". " + rewrite_content + " ", contents.search_coords);
      cm_placeholder = cm.markText(
        {
          line: contents.search_coords.line,
          ch: contents.search_coords.ch + 2,
        },
        {
          line: contents.search_coords.line,
          ch: contents.search_coords.ch + rewrite_content.length + 2,
        },
        { className: "placeholder" }
      );

      // console.log("cm_placeholder", cm_placeholder);

      cm.focus();
      cm.setCursor({
        line: contents.search_coords.line,
        ch: contents.search_coords.ch + 2,
      });

      before_change_flag = true;

      placeholder_active = true;
      placeholder_coords = {
        from: contents.search_coords,
        to: {
          line: contents.search_coords.line,
          ch: contents.search_coords.ch + rewrite_content.length,
        },
      };
      suggestion = rewrite_content;
      delta_edits_suggestion = "";
      suggestion_cursor = 0;

      break;

    case "after":
      // need to handle if there is text after current marker.
      // currently only implemented after placeholder for after document ends.
      placeholder_location = "after";

      // 1. check if at end of document or not
      // 2. if not at end use cm placeholder option <--------
      let implementation = "cm";

      if (implementation === "cm") {
        let period_cords = null;
        period_cords = findPeriodAfter(contents);

        if (period_cords === null) {
          // no period after target word. Set target ch = line.length;
          let linelength = cm.getLine(contents.search_coords.from.line).length;
          period_cords = {
            line: contents.search_coords.from.line,
            ch: linelength,
          }; //
        }

        // add space
        // cm.replaceRange(" ", period_cords);

        // insert placeholder
        cm.replaceRange(" " + rewrite_content + " ", period_cords);
        period_cords["ch"] += 1; // adjust for initial space
        cm_placeholder = cm.markText(
          period_cords,
          {
            line: period_cords.line,
            ch: period_cords.ch + rewrite_content.length,
          },
          { className: "placeholder" }
        );

        console.log("cm_placeholder", cm_placeholder);

        cm.focus();
        cm.setCursor(period_cords);

        before_change_flag = true;

        placeholder_active = true;
        placeholder_coords = {
          from: period_cords,
          to: {
            line: period_cords.line,
            ch: period_cords.ch + rewrite_content.length,
          },
        };
        suggestion = rewrite_content;
        delta_edits_suggestion = "";
        suggestion_cursor = 0;
      } else {
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

        suggestion = rewrite_content;
        delta_edits_suggestion = "";

        showPlaceholder(rewrite_content, { line: end_line, ch: end_ch });

        placeholder_active = true;
      }

      break;
    case "before":
      placeholder_location = "before";
      let period_cords = null;

      // search previous period by comparing with target text cords
      period_cords = findPeriodBefore(contents);

      if (period_cords === null) {
        // no period before sentence. Set target ch = 0;
        console.log("no period found - beforetrigger");
        period_cords = { line: contents.search_coords.from.line, ch: 0 };
      } else {
        console.log("period found - beforetrigger", period_cords);

        period_cords["ch"] += 1;
      }

      // insert text + tag with placeholder class
      cm.replaceRange(rewrite_content + " ", period_cords);
      cm_placeholder = cm.markText(
        period_cords,
        {
          line: period_cords.line,
          ch: period_cords.ch + rewrite_content.length,
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
          ch: period_cords.ch + rewrite_content.length,
        },
      };
      suggestion = rewrite_content;
      delta_edits_suggestion = "";
      suggestion_cursor = 0;

      break;
    case "replace":
      placeholder_location = "replace";
      // find target word
      console.log("word to delete: ", contents.word);
      console.log("word to type: ", rewrite_content);

      // ---------- Need to edit to ensure the right word was marked.
      let search_coords;
      try {
        search_coords = search(
          contents.word,
          { line: contents.search_coords.from.line, ch: 0 },
          0
        );
        cm_placeholder_toreplace = cm.markText(
          search_coords.from,
          search_coords.to,
          {
            className: "placeholder replace_ph",
          }
        );
      } catch (e) {
        if (e === "Not Found") {
          console.log("NOT FOUND ERROR IN SEARCH");
        }
      }

      cm.replaceRange(" ", search_coords.from);
      cm.replaceRange(rewrite_content + " ", search_coords.from);
      cm_placeholder = cm.markText(
        search_coords.from,
        {
          line: search_coords.from.line,
          ch: search_coords.from.ch + rewrite_content.length,
        },
        { className: "placeholder" }
      );

      cm.focus();
      cm.setCursor(search_coords.from);

      before_change_flag = true;

      placeholder_active = true;
      placeholder_coords = {
        from: search_coords.from,
        to: {
          line: search_coords.from.line,
          ch: search_coords.from.ch + rewrite_content.length,
        },
      };

      suggestion = rewrite_content;
      delta_edits_suggestion = "";
      suggestion_cursor = 0;
      // then -- track changes
      // - see if target word is being reached

      break;
    default:
      break;
  }

  return true;
}

function findPeriodBefore(contents) {
  let result = null;
  let cursor;

  try {
    cursor = cm.getSearchCursor(".", contents.search_coords.from, {
      multiline: "disable",
    });
    cursor.findPrevious(false);
  } catch (e) {
    console.log("error in findPeriodBefore search", e);
  }

  result = cursor.to();
  if (cursor.to().line !== contents.search_coords.from.line) {
    result = null;
  }

  return result;
}

function findPeriodAfter(contents) {
  let result = null;
  let cursor;

  try {
    cursor = cm.getSearchCursor(".", contents.search_coords.from, {
      multiline: "disable",
    });
    cursor.find(false);
  } catch (e) {
    console.log("error in findPerioAfter search", e);
    result = null;
  }

  result = cursor.to();
  if (cursor.to().line !== contents.search_coords.from.line) {
    result = null;
  }

  return result;
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
  if (Object.keys(cm_placeholder).length !== 0) {
    let mark_locations = cm_placeholder.find();

    if (typeof mark_locations != "undefined") {
      cm.replaceRange("", mark_locations.from, mark_locations.to);
      cm_placeholder = {};
    }
  }
  if (Object.keys(cm_placeholder_toreplace).length !== 0) {
    let mark_locations = cm_placeholder_toreplace.find();

    if (typeof mark_locations != "undefined") {
      cm.replaceRange("", mark_locations.from, mark_locations.to);
      cm_placeholder_toreplace = {};
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
  let bottombar = document.getElementById("myBottombar");
  if (bottombar) {
    bottombar.style.height = "auto";
    bottombar.style.minHeight = "200px";
  }
  document.getElementById("main").style.marginBottom = "250px";
}

function closeDef() {
  let bottombar = document.getElementById("myBottombar");
  if (bottombar) {
    bottombar.style.height = "0";
    bottombar.style.minHeight = "0";
  }
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
    backspacePlaceholder(changeObj);
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
  }, 5);
}

function backspacePlaceholder(prevChangeObj) {
  // ---------------------------------------------------------------------------------------- TODO:
  // use suggestion cursor to get backspaced letter
  console.log(
    "backspacePlaceholder suggestion[suggestion_cursor]",
    suggestion[suggestion_cursor]
  );
  before_change_flag = false;
  // cm.replaceRange(suggestion[suggestion_cursor], prevChangeObj.from);
  // then insert with placeholder mark

  setTimeout(() => {
    before_change_flag = true;
  }, 5);
}

let before_change_flag = false;

let cm_placeholder = {};
let cm_placeholder_toreplace = {};
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
  // watchL1();
  if (L1_active) {
    clearL1interval();
  }

  // console.log("inside onchange func", changeObj);

  let input = changeObj.text;
  let removed = changeObj.removed;

  if (placeholder_active) {
    // detect edit location --------------------------------------------------------------------
    // check two bounds - necessary in case in between texts
    if (
      changeObj.from.line < placeholder_coords.from.line ||
      changeObj.from.ch < placeholder_coords.from.ch ||
      changeObj.from.line > placeholder_coords.to.line ||
      changeObj.from.ch > placeholder_coords.to.ch
    ) {
      console.log("EDIT OUSTIDE OF BOUNDS - dimissing ph");
      closePH_lose();
      before_change_flag = false;
    }

    // detect newline -------------------------------------------------------------------------
    if (input.length === 2) {
      console.log("NEWLINE --> dimissing PH");
      closePH_lose();
      before_change_flag = false;
    }

    // backspace -- dismiss for simplicity -----------------------------------------------------
    else if (input[0] === "" && removed[0] !== "" && removed[0].length === 1) {
      console.log("BACKSPACE --> dimissing PH");
      closePH_lose();
    }

    // on correct --------------------------------------------------------------------------
    else if (input[0] === suggestion[suggestion_cursor]) {
      console.log("good", input[0]);
      suggestion_cursor++;
      delta_edits_suggestion += input[0];
      if (typo_counter > 0) {
        typo_counter = 0;
        reShowPlaceholder();
      }
    }
    // if typo -- hide ----------------------------------------------------------------------
    else if (input[0] !== "" && input[0] !== suggestion[suggestion_cursor]) {
      // {
      //   hidePlaceholder();
      //   delta_edits_suggestion += input[0];
      //   suggestion_cursor++;
      //   typo_counter++;
      // }

      // console.log("typo_counter", typo_counter);
      // if (typo_counter >= 1)
      console.log("TYPO - dismissing PH");
      // console.log("max errors reached. dismissing");
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
  // log how much of the rewrite was done
  // words that came next can be found in rest of logs by checking timestamps.
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
function manualAnalyzeTrigger(force_cook = false) {
  let previous_feedback = global_feedback;

  global_feedback = analyzeText();

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
    manualAnalyzeTrigger(true);
    L2interval_ID = setInterval(manualAnalyzeTrigger, 200);
  } else {
    temp.textContent = "Analysis off";
    clearSquares();
    temp.style.opacity = 0.3;
    clearInterval(L2interval_ID);
  }
}

const L1_T_low = 5000;
const L1_T_high = 100000;
let L1_T_current;
let L1_active = false;

// let L1interval_ID = setInterval(watchL1, L1_T_high);
let L1interval_ID = null;
let nWords_fulldoc = 0;
const L1_words_thresh = 10;

function clearL1interval() {
  clearInterval(L1interval_ID);
  L1interval_ID = setInterval(watchL1, L1_T_current);
}

function watchL1() {
  if (nWords_fulldoc > L1_words_thresh && L1_T_current !== L1_T_high) {
    // flip switch
    console.log("Above thresh: flipping L1 period from low to high");
    clearInterval(L1interval_ID);
    L1_T_current = L1_T_high;
    L1interval_ID = setInterval(watchL1, L1_T_high);
  } else if (nWords_fulldoc < L1_words_thresh && L1_T_current !== L1_T_low) {
    console.log("Below thresh: flipping L1 period from high to low");
    clearInterval(L1interval_ID);
    L1interval_ID = setInterval(watchL1, L1_T_low);
    L1_T_current = L1_T_low;
  }

  console.log("called L1");
  if (!placeholder_active) {
    console.log("created L1 Placeholder");
    let end_line = cm.getDoc().lastLine();
    let end_ch = cm.getLine(end_line).length;
    triggerRewrite({
      search_coords: { line: end_line, ch: end_ch },
      rewrite: ["I am having the thought of"],
      rewrite_position: "end",
    });
  }
}

function toggleL1() {
  let btn = document.querySelector("button.L1Button");
  if (btn.textContent === "Expressiveness off") {
    btn.textContent = "Expressiveness on";
    btn.style.opacity = 0.8;
    L1_T_current = L1_T_high;
    L1_active = true;
    L1interval_ID = setInterval(watchL1, L1_T_high);
  } else {
    btn.textContent = "Expressiveness off";
    dismissPlaceholder();
    resetPHStates();
    L1_active = false;
    btn.style.opacity = 0.3;
    clearInterval(L1interval_ID);
  }
}

if (window.location.href.includes("rephrase")) {
  toggleL2();
  toggleL1();
}
