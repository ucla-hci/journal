/*                      }_{ __{
 *                   .-{   }   }-.
 *                  (   }     {   )
 *                  |`-.._____..-'|
 *                  |             ;--.
 *                  |            (__  \
 *                  |             | )  )
 *                  |             |/  /
 *                  |            (  /
 *                  \             y'
 *                   `-.._____..-'
 *     ______
 *    / ____/________  ________  ______________
 *   / __/ / ___/ __ \/ ___/ _ \/ ___/ ___/ __ \
 *  / /___(__  ) /_/ / /  /  __(__  |__  ) /_/ /
 * /_____/____/ .___/_/   \___/____/____/\____/
 *           /_/
 *
 *  Latest updates: 06/19/22
 *
 * Fixes:
 * - replace word interaction (when to delete strikethrough letter)
 *
 * Pending Finetuning
 * - placeholder
 * - editor width
 * - L1 time intervals
 *
 * Recent features:
 * - save json
 * - save use of project features --> need DB understanding
 *  - clicks on buttons to toggle popups/or rewrites
 * - implement dismissing analysis and saving that to cache - dict
 *
 * Next features:
 * - log accepted/dismissed rewrites
 * - bugs :(
 *
 * future items:
 * - logo
 * - themes (retro cyber!)
 *  - reuse the colors in the dict - maybe have as primary the most repeated one after analysis
 *
 */

// const e = require("express");

// init codeMirror
var write = document.getElementById("write");
var cm = CodeMirror.fromTextArea(write, {
  lineWrapping: true,
  lineNumbers: false,
  styleSelectedText: true,
  cursorHeight: 0.85,
  scrollbarStyle: null,
});

/**
 * initializing globals for tweaking interaction parameters.
 *
 */
let dismisslist = [];
let word_counter = {}; // <--- dict needed to capture right place of word.
let global_feedback = [];
let nTyposPossible = 3;
let toggleAtomic = true;
// bring L1 intervals here

let dict_temp = [
  {
    strategy_code: "L2a",
    category_number: 1,
    semantic_anchor: "Positive Adjectives",
    words: [
      "altruistic",
      "high-rpincipled",
      "right",
      "fair",
      "perfect",
      "wonderful",
      "confident",
      "diligent",
      "brave",
    ],
    wordnet_ext: [],
    phrase_ext: [
      "(expand)",
      "he is not brave",
      "she is not brave",
      "they are not brave",
      "i am not brave",
      "he is far from brave",
      "she is far from brave",
      "they are far from brave",
    ],
    rewrite: null,
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    strategy_code: "L2a",
    category_number: 2,
    semantic_anchor: "Negative Adjectives",
    words: [
      "egoistic",
      "wrong",
      "unfair",
      "stupid",
      "lazy",
      "bad",
      "terrible",
      "mean",
      "tenderhearted",
      "despotic",
    ],
    wordnet_ext: [],
    phrase_ext: [
      "he is egoistic",
      "she is egoistic",
      "i am egoistic",
      "they are egoistic",
      "(expand)",
    ],
    rewrite: null,
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    strategy_code: "L2b",
    category_number: 1,
    semantic_anchor: "Should Statement",
    words: [
      "have to",
      "should",
      "should",
      "have to",
      "must",
      "supposed",
      "ought",
      "supposed",
      "must",
      "ought",
    ],
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: ["The actions I can take are", " My goal is"],
    rewrite_position: "After",
    popup_title: "Should Statment",
    popup_feedback: "Come on! Things don't have to be a certain way.",
    Sidebar_feedback: null,
    color: "#287db5",
  },
  {
    strategy_code: "L2b",
    category_number: 2,
    semantic_anchor: "All or Nothing Thinking / Overgeneralization",
    words: [
      "all",
      "again",
      "forever",
      "always",
      "never",
      "anyone",
      "anything",
      "everyone",
      "everything",
      "nothing",
      "none",
      "no one",
      "totally",
      "only",
    ],
    wordnet_ext: ["anybody", "everybody"],
    phrase_ext: ["every time", "any time"],
    rewrite: [
      "however, to be more realistic",
      " however, there is exception when",
      " however, one evidence against it is",
    ],
    rewrite_position: "after",
    popup_title: "All-or-Nothing",
    popup_feedback:
      "A common cognitive distortion that will extrapolate one thing.",
    Sidebar_feedback: null,
    color: "#287db5",
  },
  {
    strategy_code: "L2b",
    category_number: 3,
    semantic_anchor: "Catastrophizing",
    words: [
      "ruined all efforts",
      "will probably",
      "will bet",
      "worry",
      "panic",
      "what if",
      "panicked",
    ],
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "however, to be more realistic",
      " however, there is exception when",
      " there is a chance but it is a small one of",
      " I am aware that I am making a mountain out of a molehill. The mountain is... the molehill is...",
      " I can give the situation a posive name instead:",
      " I will let go of my worries and foucs my energy on...",
    ],
    rewrite_position: "after",
    popup_title: "Catastrophizing",
    popup_feedback:
      "A common cognitive distortion that believes in the worst case.",
    Sidebar_feedback: null,
    color: null,
  },
  {
    strategy_code: "L2b",
    category_number: 4,
    semantic_anchor: "Blaming",
    words: [],
    wordnet_ext: [],
    phrase_ext: [
      "all his fault",
      "all her fault",
      "all their fault",
      "blame him",
      "blame her",
      "blame them",
    ],
    rewrite: [
      "I understand that it may happen when",
      " if my close friend did that accidentally",
      "",
    ],
    rewrite_position: "after",
    popup_title: "Blaming others",
    popup_feedback:
      "A common distrotion that believes only one person is responsible for a situation that they may have little control over.",
    Sidebar_feedback: null,
    color: null,
  },
  {
    strategy_code: "L2b",
    category_number: 4,
    semantic_anchor: "Blaming",
    words: [],
    wordnet_ext: [],
    phrase_ext: [
      "all my faults",
      "all my fault",
      "blame myself",
      "I should have",
      "I feel guilty",
      "I am shamed of myself",
      "I am inadequate",
      "I didn't live up to",
    ],
    rewrite: [
      "but I can't control",
      " but I can't predict",
      " but I accept it when",
      " but next time I will",
    ],
    rewrite_position: "after",
    popup_title: "Blaming ourselves",
    popup_feedback:
      "A common distrotion that believes only one person is responsible for a situation that they may have little control over.",
    Sidebar_feedback: null,
    color: null,
  },
  {
    strategy_code: "L2c",
    category_number: 1,
    semantic_anchor: "Negative Self-Talk",
    words: ["failure", " loser", " loser"],
    wordnet_ext: [],
    phrase_ext: ["I will disappoint", "I am a loser", "what a loser"],
    rewrite: ["a person who "],
    rewrite_position: "Replace",
    popup_title: null,
    popup_feedback: null,
    Sidebar_feedback: null,
    color: null,
  },
  {
    strategy_code: "L2c",
    category_number: 1,
    semantic_anchor: "Negative Self-Talk",
    words: [
      "idiot",
      "stupid",
      "dumb",
      "good-for-nothing",
      "pathetic",
      "lazy",
      "useless",
      "the worst",
      "hate",
      "suck",
      "failure",
    ],
    wordnet_ext: [],
    phrase_ext: [
      "It is impossible for me to",
      "I screwed up",
      "what an idiot",
      "I am an idiot",
      "I am lazy",
      "I am useless",
      "I am the worst",
      "failed myself",
      "embarrassed myself",
    ],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback: null,
    Sidebar_feedback: null,
    color: null,
  },
  {
    strategy_code: "L2d",
    category_number: 1,
    semantic_anchor: "Signs of Depression -> Depressed Mood or Dyshphoria",
    words: ["depress"],
    wordnet_ext: [
      "depressed",
      "depression",
      "gloomy",
      "grim",
      "blue",
      "dispirited",
      "feeling down",
      "feel down",
      "downcast",
      "downhearted",
      "down in the mouth",
      "low",
      "low-spirited",
    ],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 1,
    semantic_anchor: "Signs of Depression -> Depressed Mood or Dyshphoria",
    words: ["dyshphoria"],
    wordnet_ext: [
      "unhappy",
      "uneasy",
      "dissatisfied",
      "discomfort",
      "distress",
      "unease",
      "fidgeting",
      "frustration",
    ],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 2,
    semantic_anchor: "Signs of Depression -> Hopeless Outlook",
    words: ["helpless"],
    wordnet_ext: ["incapacitated"],
    phrase_ext: ["nobody help", "no one help"],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 2,
    semantic_anchor: "Signs of Depression -> Hopeless Outlook",
    words: ["hopeless"],
    wordnet_ext: ["desperate", "despairing"],
    phrase_ext: ["no help", "don't help"],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 2,
    semantic_anchor: "Signs of Depression -> Hopeless Outlook",
    words: ["guilt"],
    wordnet_ext: ["guilty", "ashamed", "embarrased"],
    phrase_ext: ["all my fault", "blame on me"],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 2,
    semantic_anchor: "Signs of Depression -> Hopeless Outlook",
    words: ["self-hate"],
    wordnet_ext: ["self-hatred", "self-loathing", "self-disgust"],
    phrase_ext: ["hate myself"],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 2,
    semantic_anchor: "Signs of Depression -> Hopeless Outlook",
    words: ["worthlessness"],
    wordnet_ext: [
      "worthless",
      "despicable",
      "ugly",
      "vile",
      "slimy",
      "unworthy",
      "worthless",
      "wretched",
      "undeserving",
    ],
    phrase_ext: [
      "what is the point",
      "there is no point",
      "worth nothing",
      "not worthing anything",
    ],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 3,
    semantic_anchor: "Signs of Depression -> Loss of interest in activities",
    words: [],
    wordnet_ext: ["indifferent", "apathetic"],
    phrase_ext: [
      "loss of interest",
      "lost interest",
      "lose interest",
      "used to be interested",
      "not interested any more",
      "can't enjoy",
      "life is boring",
      "life is meaningless",
      "uninterested in life",
    ],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 3,
    semantic_anchor: "Signs of Depression -> Loss of interest in activities",
    words: [],
    wordnet_ext: ["avolition", "demotivated", "unmotivated"],
    phrase_ext: [
      "loss of motivation",
      "not motivated",
      "not motivated any more",
      "less motivated",
    ],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 3,
    semantic_anchor: "Signs of Depression -> Loss of interest in activities",
    words: [],
    wordnet_ext: [],
    phrase_ext: ["lose sense of humor", "lost my sense of humor"],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 4,
    semantic_anchor:
      "Signs of Depression/Anxiety -> Sleep and Appetite Changes",
    words: [],
    wordnet_ext: [],
    phrase_ext: [
      "hungrier",
      "eat less",
      "eat more",
      "loss of appetite",
      "increased appetite",
      "decreased appetite",
      "eating disorders",
    ],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 4,
    semantic_anchor:
      "Signs of Depression/Anxiety -> Sleep and Appetite Changes",
    words: ["insomnia", "disrupted sleep", "lethargy"],
    wordnet_ext: ["sleeplessness"],
    phrase_ext: [
      "can't sleep",
      "sleepless",
      "difficulty falling asleep",
      "wake up in the midnight",
      "sleeping disorders",
      "sleep long",
      "sleep too long",
      "sleep too much",
      "hard to wake up",
      "hard waking up",
      "difficulty staying asleep",
    ],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 5,
    semantic_anchor: "Signs of Depression/Anxiety -> Fatigue",
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
      "lethargy",
    ],
    phrase_ext: [
      "out of energy",
      "lack of energy",
      "little energy",
      "burn out",
      "burnout",
    ],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 6,
    semantic_anchor: "Signs of Depression/Anxiety -> Restlessness",
    words: ["restlessness"],
    wordnet_ext: ["uneasiness", "queasiness"],
    phrase_ext: [
      "unable to calm",
      "have to move around",
      "wound-up",
      "on-edge",
    ],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 7,
    semantic_anchor: "Signs of Depression/Anxiety -> Concentration Problems",
    words: ["distract"],
    wordnet_ext: ["perturb", "unhinge", "disquiet"],
    phrase_ext: [
      "can't concentrate",
      "hard to concentrate",
      "difficulty concentrating",
      "can't focus",
      "hard to focus",
      "difficulty focusing",
      "can't pay attention",
      "hard to pay attention",
      "difficulty paying attention",
    ],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 8,
    semantic_anchor: "Signs of Depression -> Suicidal ideation",
    words: ["Bury", "die", "suicidal", "suicide", "kill", "coffin"],
    wordnet_ext: [
      "self-destruction",
      "self-annihilation",
      "felo-de-se",
      "self-destruction",
      "self-annihilation",
      "felo-de-se",
      "self-destruction",
      "self-annihilation",
      "felo-de-se",
      "self-destruction",
      "self-annihilation",
      "felo-de-se",
      "self-destruction",
      "self-annihilation",
      "felo-de-se",
      "self-destruction",
      "self-annihilation",
      "felo-de-se",
    ],
    phrase_ext: [
      "kill myself",
      "end my life",
      "kill myself",
      "end my life",
      "kill myself",
      "end my life",
      "kill myself",
      "end my life",
      "kill myself",
      "end my life",
      "kill myself",
      "end my life",
    ],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 9,
    semantic_anchor: "Signs of Anxiety -> Being irritable",
    words: ["irritable"],
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 9,
    semantic_anchor:
      "Signs of Anxiety -> Difficulty controlling feelings of worry",
    words: ["worry"],
    wordnet_ext: ["worried"],
    phrase_ext: ["can't help worrying", "keep worrying", "can't stop worrying"],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 9,
    semantic_anchor: "Signs of Anxiety -> Panic",
    words: ["panic"],
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 9,
    semantic_anchor: "Signs of Anxiety -> Unexplained body pains",
    words: [
      "chest pain",
      "body pain",
      "stomachaches",
      "muscle aches",
      "headaches",
    ],
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
  },
  {
    strategy_code: "L2d",
    category_number: 10,
    semantic_anchor: "Signs of Stress",
    words: ["stress"],
    wordnet_ext: ["stressful", "stressed", "overwhelmed", "overwhelming"],
    phrase_ext: [
      "difficulty breathing",
      "hard of breathing",
      "unable to rest",
      "unable to enjoy",
      "unable to relax",
    ],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback:
      "This is a common sign that it is time to care for your mental health. You are not alone!",
    Sidebar_feedback:
      '<p>Are you feeling depressed, anxious, stressed or mood swings recently?</p>\n<p>Some actions you can take:</p>\n<ul>\n<li>Here, try to write down every a event in your mind, also clearly describe your emotions. Be aware of your emotions and accept them is the first and most important achievement!</li>\n<li>Identify and reframe your negative thoughts</li>\n<li>Do some relaxation exercises or mindfulness practices, such as <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindful-breathing/" target="_blank" rel="noopener">breathing</a> and <a href="https://dialecticalbehaviortherapy.com/mindfulness/mental-body-scan/" target="_blank" rel="noopener">mental body scan</a></li>\n<li>Writing down 3 things make you feel good or you think you can try later today, e.g., reaching out to your friends, taking a walking in the park nearby</li>\n<li>Set a small goal to improve your eating, sleep or physical exercise routine</li>\n</ul>\n<p>These tests may help you determine if you are experiencing symptoms of Depression, Anxiety, or PTSD. These are not diagnostic tests. Please consult a physician if you are concerned about your status.</p>\n<ul>\n<li><a href="https://www.mdcalc.com/phq-9-patient-health-questionnaire-9" target="_blank" rel="noopener">PHQ-9: Depression Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/gad-7-general-anxiety-disorder-7" target="_blank" rel="noopener">GAD-7: Anxiety Screening Test</a></li>\n<li><a href="https://www.mdcalc.com/dsm-5-criteria-posttraumatic-stress-disorder" target="_blank" rel="noopener">DSM-5: PTSD Screening Test</a></li>\n</ul>\n<p>If you are in immediate distress or are thinking about hurting yourself, call the National Suicide Prevention Lifeline toll-free at 1-800-273-TALK (8255). You also can text the Crisis Text Line (HELLO to 741741) or use the Lifeline Chat on the National Suicide Prevention Lifeline website.</p>',
    color: "#d3cd57",
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
    popup_title: "First Pronoun",
    popup_feedback:
      "This indicates a viewpoint of your own. You may have high level of self-awareness.",
    Sidebar_feedback: null,
    color: null,
  },
  {
    strategy_code: "L2f",
    category_number: 1,
    semantic_anchor: "Insight words",
    words: ["think", "realize", "understand", "believe"],
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "Insight Words",
    popup_feedback:
      "You will benefit from using these words to construct a coherent story, experience insights, and find a path forward.",
    Sidebar_feedback: null,
    color: null,
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
    popup_title: "Coherent narrative words",
    popup_feedback:
      "You will benefit from using these words to construct a coherent story, experience insights, and find a path forward.",
    Sidebar_feedback: null,
    color: null,
  },
  {
    strategy_code: "L2f",
    category_number: 3,
    semantic_anchor: "Constructive Self-Talk",
    words: ["improve", "help", "work on"],
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: null,
    popup_feedback: null,
    Sidebar_feedback: null,
    color: null,
  },
];

let l1_dict = [
  {
    Word: "loser",
    Reprogramming: ["My inner value behind these is"],
    ReprogramType: "end",
  },
  {
    Word: "sad",
    Reprogramming: [
      "I have these feelings maybe because I value ...",
      "I have these feelings maybe because I need ...",
      "I have these feelings maybe because I want ...",
      "I have these feelings maybe because I lack …",
      " Take a step back, I'm feeling like this because...",
      " I will feel better if ",
    ],
    ReprogramType: "end",
  },
  {
    Word: "depressed",
    Reprogramming: [
      "I have these feelings maybe because I value ...",
      "I have these feelings maybe because I need ...",
      "I have these feelings maybe because I want ...",
      "I have these feelings maybe because I lack …",
      " Take a step back, I'm feeling like this because...",
      " I will feel better if ",
    ],
    ReprogramType: "end",
  },
  {
    Word: "heartbreak",
    Reprogramming: [
      "I have these feelings maybe because I value ...",
      "I have these feelings maybe because I need ...",
      "I have these feelings maybe because I want ...",
      "I have these feelings maybe because I lack …",
      " Take a step back, I'm feeling like this because...",
      " I will feel better if ",
    ],
    ReprogramType: "end",
  },
  {
    Word: "heartbroken",
    Reprogramming: [
      "I have these feelings maybe because I value ...",
      "I have these feelings maybe because I need ...",
      "I have these feelings maybe because I want ...",
      "I have these feelings maybe because I lack …",
      " Take a step back, I'm feeling like this because...",
      " I will feel better if ",
    ],
    ReprogramType: "end",
  },
  {
    Word: "angry",
    Reprogramming: [
      "I have these feelings maybe because I value ...",
      "I have these feelings maybe because I need ...",
      "I have these feelings maybe because I want ...",
      "I have these feelings maybe because I lack …",
      " Take a step back, I'm feeling like this because...",
      " I will feel better if ",
    ],
    ReprogramType: "end",
  },
  {
    Word: "lonely",
    Reprogramming: [
      "I have these feelings maybe because I value ...",
      "I have these feelings maybe because I need ...",
      "I have these feelings maybe because I want ...",
      "I have these feelings maybe because I lack …",
      " Take a step back, I'm feeling like this because...",
      " I will feel better if ",
    ],
    ReprogramType: "end",
  },
  {
    Word: "panic",
    Reprogramming: [
      "I have these feelings maybe because I value ...",
      "I have these feelings maybe because I need ...",
      "I have these feelings maybe because I want ...",
      "I have these feelings maybe because I lack …",
      " Take a step back, I'm feeling like this because...",
      " I will feel better if ",
    ],
    ReprogramType: "end",
  },
  {
    Word: "worry",
    Reprogramming: [
      "I have these feelings maybe because I value ...",
      "I have these feelings maybe because I need ...",
      "I have these feelings maybe because I want ...",
      "I have these feelings maybe because I lack …",
      " Take a step back, I'm feeling like this because...",
      " I will feel better if ",
    ],
    ReprogramType: "end",
  },
  {
    Word: null,
    Reprogramming: ["When I say this, I mean..."],
    ReprogramType: "end",
  },
  {
    Word: null,
    Reprogramming: ["To explain it further ..."],
    ReprogramType: "end",
  },
  {
    Word: null,
    Reprogramming: ["A different point of view can be..."],
    ReprogramType: "end",
  },
  { Word: null, Reprogramming: ["To be specific,"], ReprogramType: "end" },
  {
    Word: null,
    Reprogramming: ["An example to support this is..."],
    ReprogramType: "end",
  },
  {
    Word: null,
    Reprogramming: ["Someone else may respond to this in a different way:"],
    ReprogramType: "end",
  },
  {
    Word: null,
    Reprogramming: ["The long-term implications of this can be..."],
    ReprogramType: "end",
  },
  {
    Word: "feel",
    Reprogramming: ["how do I feel about having these emotions?"],
    ReprogramType: "end",
  },
  {
    Word: "feel",
    Reprogramming: ["can I accept my feelings without judgment?"],
    ReprogramType: "end",
  },
  {
    Word: "feel",
    Reprogramming: [
      "Do I feel comfortable with expressing my emotions authentically? Why or why not?",
    ],
    ReprogramType: "end",
  },
  {
    Word: "feel",
    Reprogramming: [
      "I can write down more details separately about the event, my feelings, my opinions and evidences for/against my opinions as follows:",
    ],
    ReprogramType: "end",
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

    let search_coords = null;
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
      popup_title: obj_filt.popup_title,
      sidebar_title: obj_filt.sidebar_title,
      popup_feedback: obj_filt.popup_feedback,
      Sidebar_feedback: obj_filt.Sidebar_feedback,
      rewrite: obj_filt.rewrite,
      rewrite_position: obj_filt.rewrite_position,
      // offset
      offset: offset,
      display: true,
    });
    return previousElement;
  },
  []);

  // dismiss here
  returnArr.forEach((element) => {
    const found = dismisslist.find(
      (d_element) =>
        d_element.word === element.word && d_element.offset === element.offset
    );
    if (found) {
      // console.log("hiding an element");
      element.display = false;
    }
  });

  // console.log("analysis returnarr", returnArr);

  return returnArr;
}

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

function showSquare(args, index = "") {
  if (!args.display) {
    return;
  }
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
    hls[i].addEventListener("click", function (evt) {
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
  logPopup(contents);

  // document.getElementById("popup-header").textContent = contents.title;
  document.getElementById("popup-header").textContent = contents.popup_title;
  document.getElementById("popup-content").textContent =
    contents.popup_feedback;

  let window_width = window.innerWidth;

  if (window_width - cords.left < 400) {
    // distance to avoid colliding with rightbar
    // console.log("TOO TO THE RIGHT - adjusting");
    box.style.left = (cords.left - 200).toString() + "px";
  } else {
    box.style.left = (cords.left - 100).toString() + "px";
  }
  box.style.top = (cords.top + 30).toString() + "px";
  box.style.display = "flex";

  // remove previous event listeners.
  var old_element = document.querySelector(".readmore-button");
  var new_element = old_element.cloneNode(true);
  old_element.parentNode.replaceChild(new_element, old_element);
  new_element.addEventListener("click", function () {
    showRightbar(contents);
  });

  // remove previous event listeners -- dismiss
  var old_element = document.querySelector(".dismiss-button");
  var new_element = old_element.cloneNode(true);
  old_element.parentNode.replaceChild(new_element, old_element);

  new_element.addEventListener("click", function () {
    dismisslist.push({ word: contents.word, offset: contents.offset });
    cm.getAllMarks().forEach((mark) => {
      if (mark.className === "L2-highlight") mark.clear();
    });
    closeNewPopup();
    manualAnalyzeTrigger(true);
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
  // document.querySelector(".right-sidebar h3").textContent = contents.title;
  // document.querySelector(".right-sidebar h3").textContent =
  //   contents.sidebar_title;
  document.querySelector(".right-sidebar .target-cont").innerHTML =
    contents.Sidebar_feedback;
  document.getElementById("rightsidebar").style.right = "0px";

  logSidebar(contents);

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

  let rightbar = document.getElementById("rightsidebar");
  if (rightbar) {
    rightbar.style.right = "-300px";
  }
  // document.getElementById("myBottombar").style.right = "0px";
  cleanMarks();
}

function triggerRewrite(contents) {
  if (placeholder_active) {
    return false;
  }

  let period_cords = null;

  // IMPLEMENT HERE IF NEED TO DECIDE ON MULTIPLE REWRITE OPTIONS FROM DICT ARRAYS
  // currently, just extracting the one item
  let rewrite_content =
    contents.rewrite[
      Math.floor(Math.random() * contents.rewrite.length)
    ].trim();

  // check for ". " to avoid introducing unecessary ones + insert good ones
  switch (contents.rewrite_position) {
    // for L1
    case "end":
      cm.replaceRange(rewrite_content + " ", contents.search_coords);
      cm_placeholder = cm.markText(
        {
          line: contents.search_coords.line,
          ch: contents.search_coords.ch,
        },
        {
          line: contents.search_coords.line,
          ch: contents.search_coords.ch + rewrite_content.length,
        },
        { className: "placeholder", atomic: toggleAtomic }
      );

      cm.focus();
      cm.setCursor({
        line: contents.search_coords.line,
        ch: contents.search_coords.ch,
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
      period_cords = null;
      period_cords = findPeriod(contents);

      if (period_cords === null) {
        // no period after target word. Set target ch = line.length;
        let linelength = cm.getLine(contents.search_coords.from.line).length;
        period_cords = {
          line: contents.search_coords.from.line,
          ch: linelength,
        };
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
        { className: "placeholder", atomic: toggleAtomic }
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

      break;
    case "before":
      period_cords = null;
      period_cords = findPeriod(contents, true);

      if (period_cords === null) {
        // no period before sentence. Set target ch = 0;
        period_cords = { line: contents.search_coords.from.line, ch: 0 };
      } else {
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
        { className: "placeholder", atomic: toggleAtomic }
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
        { className: "placeholder", atomic: toggleAtomic }
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

      break;
    default:
      break;
  }

  return true;
}

function findPeriod(contents, before = false) {
  let result = null;
  let cursor;

  try {
    cursor = cm.getSearchCursor(".", contents.search_coords.from, {
      multiline: "disable",
    });
    if (before) {
      cursor.findPrevious(false);
    } else {
      cursor.find(false);
    }
  } catch (e) {
    console.log("error in findPeriod search", e);
  }

  result = cursor.to();
  if (cursor.to().line !== contents.search_coords.from.line) {
    result = null;
  }

  return result;
}

function hidePlaceholder() {
  // OJO: placeholder_active remains true here!
  let placeh = document.querySelector("#dynamic_placeholder");
  if (placeh) {
    placeh.style.visibility = "hidden";
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

  cm.doc.getAllMarks().forEach((marker) => {
    console.log("marker", marker);
    if (marker.className === "placeholder") {
      cm.replaceRange("", marker.find().from, marker.find().to);
    }
    // marker.clear();
  });

  cm_placeholder = {};
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
  //                                 <<<<<<----------------------------------------
  let title = fetchTitle();
  let content = fetchContent();
  let marks = fetchMarks();
  currentDate = getTime();
  let id = currentID;
  let flag = currentFlag;
  let date = currentDate;

  if (isNaN(id)) {
    addData(
      0,
      flag,
      title,
      content,
      date,
      marks,
      mouselog,
      keyboardlog,
      toggleLog,
      popupLog,
      sidebarLog,
      dismissLog,
      acceptLog,
      dismisslist
    );
  } else {
    addData(
      id,
      flag,
      title,
      content,
      date,
      marks,
      mouselog,
      keyboardlog,
      toggleLog,
      popupLog,
      sidebarLog,
      dismissLog,
      acceptLog,
      dismisslist
    );
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
  // let marks = data["marks"];
  // for (m of marks) {
  //   tag = m["tag"];
  //   from = m["from"];
  //   to = m["to"];
  //   if (tag === "autosuggest-font") {
  //     promptInstance = cm.markText(from, to, { className: tag });
  //   } else {
  //     cm.markText(from, to, { className: tag });
  //   }
  // }
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
  console.log("before change,", changeObj);
  if (noEdit) {
    return;
  }

  if (changeObj.text[0] === "\t") {
    changeObj.cancel();
  }

  if (
    placeholder_active &&
    before_change_flag &&
    changeObj.origin !== "+delete"
  ) {
    // insert-like input
    changeObj.cancel();
    newEdit(changeObj);
  }

  // Readding placeholder letters
  if (
    placeholder_active &&
    before_change_flag &&
    changeObj.origin === "+delete"
  ) {
    backspacePlaceholder(changeObj);
  }
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
  // catch if deleting at invocation to dismiss - or if not even active
  if (suggestion_cursor === 0 || !placeholder_active) {
    console.log("bypassing backspace ---");
    return;
  }

  noEdit = true;
  suggestion_cursor--;
  before_change_flag = false;

  console.log("---replacing w ", suggestion[suggestion_cursor]);
  cm.replaceRange(suggestion[suggestion_cursor], prevChangeObj.from);

  setTimeout(() => {
    before_change_flag = true;
    let marker_cords = null;
    cm.doc.getAllMarks().forEach((marker) => {
      if (marker.className === "placeholder") {
        marker_cords = marker.find();
        marker.clear();
      }
    });

    cm.getDoc().setCursor(prevChangeObj.from.line, prevChangeObj.from.ch);
    cm.markText(
      { line: marker_cords.from.line, ch: marker_cords.from.ch - 1 },
      marker_cords.to,
      {
        className: "placeholder",
        atomic: toggleAtomic,
      }
    );

    noEdit = false;
  }, 5);
}

let before_change_flag = false;

let cm_placeholder = {};
let cm_placeholder_toreplace = {};
let placeholder_active = false;
let placeholder_coords = {}; // two coords objects if bounded by two. one if at the end

let suggestion = "";
let delta_edits_suggestion = "";
let suggestion_cursor = 0;
let typo_counter = 0;
let noEdit = false;

function resetPHStates() {
  delta_edits_suggestion = "";
  placeholder_active = false;
  placeholder_coords = {};
  suggestion_cursor = 0;
}

cm.on("change", function (cm, changeObj) {
  // watchL1();
  // if (L1_active) {
  //   clearL1interval();
  // }

  if (noEdit) {
    return;
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

    // backspace in separate func ^ --------------------------------------------------

    // on correct --------------------------------------------------------------------------
    else if (input[0] === suggestion[suggestion_cursor]) {
      console.log("good", input[0]);
      suggestion_cursor++;
      delta_edits_suggestion += input[0];

      if (typo_counter > 0 && suggestion.includes(delta_edits_suggestion)) {
        typo_counter = 0;
        // reShowPlaceholder();
      }
    }
    // if typo ----------------------------------------------------------------------
    else if (input[0] !== "" && input[0] !== suggestion[suggestion_cursor]) {
      suggestion_cursor++;
      typo_counter++;

      // console.log("typo_counter", typo_counter);
      if (typo_counter >= nTyposPossible) {
        console.log("max errors reached. dismissing");
        closePH_lose();
        before_change_flag = false;
      }
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
  dismissLog.push({
    time: Date.now(),
    suggestion: suggestion,
    completed_amount: suggestion_cursor - 1,
  });
  dismissPlaceholder();
  resetPHStates();
}

function closePH_win() {
  acceptLog.push({
    time: Date.now(),
    suggestion: suggestion,
  });
  dismissPlaceholder();
  resetPHStates();
}

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

// to be used with the actual dictionary - called via keypress
function triggerL1() {
  console.log("inside triggerL1");
  // read last sentence and check if any of the L1 keywords are included

  let shuffled_l1_dict = shuffleArray(l1_dict);

  let sentence = isolateCurrentSentence();
  let found = shuffled_l1_dict.find((o) => sentence.includes(o.Word)); // want the object

  if (found) {
    console.log("found:", found);
    // reprogramming options:
    let n_options = found.Reprogramming.length; // arr
    let random_selection = getRandomInt(n_options);

    let end_line = cm.getDoc().lastLine();
    let end_ch = cm.getLine(end_line).length;
    triggerRewrite({
      search_coords: { line: end_line, ch: end_ch },
      rewrite: [found.Reprogramming[random_selection]],
      rewrite_position: "end",
    });

    // if yes, map with relevant suggestive text
  } else {
    // else, choose from the null ones
    console.log("not found, using null options");
    let l1_options = shuffled_l1_dict
      .filter((entry) => entry.Word === null)
      .map((el) => el.Reprogramming[0]);
    console.log("l1_options", l1_options);

    let n_options = l1_options.length; // arr
    let random_selection = getRandomInt(n_options);

    let end_line = cm.getDoc().lastLine();
    let end_ch = cm.getLine(end_line).length;
    triggerRewrite({
      search_coords: { line: end_line, ch: end_ch },
      rewrite: [l1_options[random_selection]],
      rewrite_position: "end",
    });
  }
  L1_active = true;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function isolateCurrentSentence() {
  // let cur = cm.getCursor(); // should be end
  let end_line = cm.getDoc().lastLine();
  let end_ch = cm.getLine(end_line).length;
  // console.log("cur", cur);
  var cursor = cm.getSearchCursor(
    ".",
    { line: end_line, ch: end_ch },
    {
      caseFold: true,
      multiline: true,
    }
  );

  let start = null;
  if (cursor.findPrevious()) {
    start = cursor.to();
  } else {
    start = { line: end_line, ch: 0 };
  }

  return cm.getRange(start, { line: end_line, ch: end_ch });
}

// document.querySelector("button.L1Button").addEventListener("click", onL1Toggle);
document.querySelector("button.L2Button").addEventListener("click", onL2Toggle);

$(window).resize(function () {
  manualAnalyzeTrigger(true);
  // could make L2 popup move here to follow text
});

// saving json -----------------------------------------------------
function generateFile() {
  console.log("calling generateFile");
  generatePackOne();
}

function generatePackRecall(file) {
  console.log(file);
  download(JSON.stringify(file), "report.json");
}

// --------

document.addEventListener("keydown", (evt) => {
  // change color of button and make a subtle transition back after a timeout

  if (evt.key === "Tab") {
    triggerL1();
  }
});

function shuffleArray(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
