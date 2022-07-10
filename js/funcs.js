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
    Word: "altruistic",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "high-rpincipled",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "right",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "fair",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "perfect",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "wonderful",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "confident",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "egoistic",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "wrong",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "unfair",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "stupid",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "lazy",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "bad",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "terrible",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "mean",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "diligent",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "tenderhearted",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "despotic",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "brave",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "Without this judgment, I will",
      " Beyond judgment, the situation and my feelings can be described as:",
    ],
    rewrite_position: "After",
    popup_title: "Judgment",
    popup_feedback:
      "Nothing special. We make judgments all the time! Just be aware of the unproductive negative ones.",
    Sidebar_feedback:
      '<h3>More About Judgments</h3>\n<p>Maybe you look out the window, see rain and wind, and make the judgment that the weather is bad. These negative judgments aren\'t right or wrong, but they are often unconscious and often unproductive. Negative judgments often make us feel bad and make us less effective at managing the situation.</p>\n<ul>\n<li>Yes, I can have judgments!</li>\n<li>Does the judgment make me feel bad?</li>\n<li>Take a step back, write down the situation, the resulting emotion, and the outcome of the judgment</li>\n<li>Yeah, I become more aware of how unwanted negative judgments are becoming part of my thoughts!</li>\n</ul>\n<h3>Reframe Negative Judgments</h3>\n<ul>\n<li>Turn a judgment into a nonjudgmental descriptive statement</li>\n</ul>\n<p>The idea is to try to rewrite our negative judgments in a form that is nonjudgmental. You will still express what happened, how you felt, and what you thought, but this time without using words that will express a negative and judging attitude. Describe the situation factually, write down what feeling you had, and write down what you were thinking about.</p>\n<p>Reference: <a href="https://dialecticalbehaviortherapy.com/mindfulness/mindfulness-of-negative-judgments/" target="_blank" rel="noopener">Negative Judgments</a>, <a href="https://dialecticalbehaviortherapy.com/mindfulness/letting-go/" target="_blank" rel="noopener">Letting Go of Judgments</a></p>',
    color: "#287db5",
  },
  {
    Word: "should",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "can",
      " choose to",
      " want to",
      " prefer to",
      " would like to",
      " plan to",
    ],
    rewrite_position: "Replace",
    popup_title: "Should Statment",
    popup_feedback: "Come on! Things don't have to be a certain way.",
    Sidebar_feedback:
      "<h3>More About Should Statements</h3>\n<p>Should statements are statements that you make to yourself about what you &ldquo;should&rdquo; do, what you &ldquo;ought&rdquo; to do, or what you &ldquo;must&rdquo; do. They can also be applied to others, imposing a set of expectations that will likely not be met.</p>\n<ul>\n<li>Why do I think that it &ldquo;should&rdquo; be?</li>\n<li>What if I let go of &ldquo;should&rdquo; and &ldquo;shouldn&rsquo;t&rdquo;?</li>\n<li>What if I allowed myself to feel however I feel&mdash;without regrets or expectations or projections of what it &ldquo;should&rdquo; be?</li>\n</ul>\n<h3>Reframe Should Statements</h3>\n<p>Use more compassionate and realistic statements. Try to soften it by replacing &ldquo;should&rdquo;-type words with &ldquo;prefer&rdquo;-type words or empower it by using &ldquo;can/will/choose&rdquo;-type words and think about doable actions.</p>",
    color: "#287db5",
  },
  {
    Word: "ought",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "can",
      " choose to",
      " want to",
      " prefer to",
      " would like to",
      " plan to",
    ],
    rewrite_position: "Replace",
    popup_title: "Should Statment",
    popup_feedback: "Come on! Things don't have to be a certain way.",
    Sidebar_feedback:
      "<h3>More About Should Statements</h3>\n<p>Should statements are statements that you make to yourself about what you &ldquo;should&rdquo; do, what you &ldquo;ought&rdquo; to do, or what you &ldquo;must&rdquo; do. They can also be applied to others, imposing a set of expectations that will likely not be met.</p>\n<ul>\n<li>Why do I think that it &ldquo;should&rdquo; be?</li>\n<li>What if I let go of &ldquo;should&rdquo; and &ldquo;shouldn&rsquo;t&rdquo;?</li>\n<li>What if I allowed myself to feel however I feel&mdash;without regrets or expectations or projections of what it &ldquo;should&rdquo; be?</li>\n</ul>\n<h3>Reframe Should Statements</h3>\n<p>Use more compassionate and realistic statements. Try to soften it by replacing &ldquo;should&rdquo;-type words with &ldquo;prefer&rdquo;-type words or empower it by using &ldquo;can/will/choose&rdquo;-type words and think about doable actions.</p>",
    color: "#287db5",
  },
  {
    Word: "supposed",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "can",
      " choose to",
      " want to",
      " prefer to",
      " would like to",
      " plan to",
    ],
    rewrite_position: "Replace",
    popup_title: "Should Statment",
    popup_feedback: "Come on! Things don't have to be a certain way.",
    Sidebar_feedback:
      "<h3>More About Should Statements</h3>\n<p>Should statements are statements that you make to yourself about what you &ldquo;should&rdquo; do, what you &ldquo;ought&rdquo; to do, or what you &ldquo;must&rdquo; do. They can also be applied to others, imposing a set of expectations that will likely not be met.</p>\n<ul>\n<li>Why do I think that it &ldquo;should&rdquo; be?</li>\n<li>What if I let go of &ldquo;should&rdquo; and &ldquo;shouldn&rsquo;t&rdquo;?</li>\n<li>What if I allowed myself to feel however I feel&mdash;without regrets or expectations or projections of what it &ldquo;should&rdquo; be?</li>\n</ul>\n<h3>Reframe Should Statements</h3>\n<p>Use more compassionate and realistic statements. Try to soften it by replacing &ldquo;should&rdquo;-type words with &ldquo;prefer&rdquo;-type words or empower it by using &ldquo;can/will/choose&rdquo;-type words and think about doable actions.</p>",
    color: "#287db5",
  },
  {
    Word: "must",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "can",
      " choose to",
      " want to",
      " prefer to",
      " would like to",
      " plan to",
    ],
    rewrite_position: "Replace",
    popup_title: "Should Statment",
    popup_feedback: "Come on! Things don't have to be a certain way.",
    Sidebar_feedback:
      "<h3>More About Should Statements</h3>\n<p>Should statements are statements that you make to yourself about what you &ldquo;should&rdquo; do, what you &ldquo;ought&rdquo; to do, or what you &ldquo;must&rdquo; do. They can also be applied to others, imposing a set of expectations that will likely not be met.</p>\n<ul>\n<li>Why do I think that it &ldquo;should&rdquo; be?</li>\n<li>What if I let go of &ldquo;should&rdquo; and &ldquo;shouldn&rsquo;t&rdquo;?</li>\n<li>What if I allowed myself to feel however I feel&mdash;without regrets or expectations or projections of what it &ldquo;should&rdquo; be?</li>\n</ul>\n<h3>Reframe Should Statements</h3>\n<p>Use more compassionate and realistic statements. Try to soften it by replacing &ldquo;should&rdquo;-type words with &ldquo;prefer&rdquo;-type words or empower it by using &ldquo;can/will/choose&rdquo;-type words and think about doable actions.</p>",
    color: "#287db5",
  },
  {
    Word: "have to",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "can",
      " choose to",
      " want to",
      " prefer to",
      " would like to",
      " plan to",
    ],
    rewrite_position: "Replace",
    popup_title: "Should Statment",
    popup_feedback: "Come on! Things don't have to be a certain way.",
    Sidebar_feedback:
      "<h3>More About Should Statements</h3>\n<p>Should statements are statements that you make to yourself about what you &ldquo;should&rdquo; do, what you &ldquo;ought&rdquo; to do, or what you &ldquo;must&rdquo; do. They can also be applied to others, imposing a set of expectations that will likely not be met.</p>\n<ul>\n<li>Why do I think that it &ldquo;should&rdquo; be?</li>\n<li>What if I let go of &ldquo;should&rdquo; and &ldquo;shouldn&rsquo;t&rdquo;?</li>\n<li>What if I allowed myself to feel however I feel&mdash;without regrets or expectations or projections of what it &ldquo;should&rdquo; be?</li>\n</ul>\n<h3>Reframe Should Statements</h3>\n<p>Use more compassionate and realistic statements. Try to soften it by replacing &ldquo;should&rdquo;-type words with &ldquo;prefer&rdquo;-type words or empower it by using &ldquo;can/will/choose&rdquo;-type words and think about doable actions.</p>",
    color: "#287db5",
  },
  {
    Word: "should",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: ["The actions I can take are", " My goal is"],
    rewrite_position: "After",
    popup_title: "Should Statment",
    popup_feedback: "Come on! Things don't have to be a certain way.",
    Sidebar_feedback:
      "<h3>More About Should Statements</h3>\n<p>Should statements are statements that you make to yourself about what you &ldquo;should&rdquo; do, what you &ldquo;ought&rdquo; to do, or what you &ldquo;must&rdquo; do. They can also be applied to others, imposing a set of expectations that will likely not be met.</p>\n<ul>\n<li>Why do I think that it &ldquo;should&rdquo; be?</li>\n<li>What if I let go of &ldquo;should&rdquo; and &ldquo;shouldn&rsquo;t&rdquo;?</li>\n<li>What if I allowed myself to feel however I feel&mdash;without regrets or expectations or projections of what it &ldquo;should&rdquo; be?</li>\n</ul>\n<h3>Reframe Should Statements</h3>\n<p>Use more compassionate and realistic statements. Try to soften it by replacing &ldquo;should&rdquo;-type words with &ldquo;prefer&rdquo;-type words or empower it by using &ldquo;can/will/choose&rdquo;-type words and think about doable actions.</p>",
    color: "#287db5",
  },
  {
    Word: "ought",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: ["The actions I can take are", " My goal is"],
    rewrite_position: "After",
    popup_title: "Should Statment",
    popup_feedback: "Come on! Things don't have to be a certain way.",
    Sidebar_feedback:
      "<h3>More About Should Statements</h3>\n<p>Should statements are statements that you make to yourself about what you &ldquo;should&rdquo; do, what you &ldquo;ought&rdquo; to do, or what you &ldquo;must&rdquo; do. They can also be applied to others, imposing a set of expectations that will likely not be met.</p>\n<ul>\n<li>Why do I think that it &ldquo;should&rdquo; be?</li>\n<li>What if I let go of &ldquo;should&rdquo; and &ldquo;shouldn&rsquo;t&rdquo;?</li>\n<li>What if I allowed myself to feel however I feel&mdash;without regrets or expectations or projections of what it &ldquo;should&rdquo; be?</li>\n</ul>\n<h3>Reframe Should Statements</h3>\n<p>Use more compassionate and realistic statements. Try to soften it by replacing &ldquo;should&rdquo;-type words with &ldquo;prefer&rdquo;-type words or empower it by using &ldquo;can/will/choose&rdquo;-type words and think about doable actions.</p>",
    color: "#287db5",
  },
  {
    Word: "supposed",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: ["The actions I can take are", " My goal is"],
    rewrite_position: "After",
    popup_title: "Should Statment",
    popup_feedback: "Come on! Things don't have to be a certain way.",
    Sidebar_feedback:
      "<h3>More About Should Statements</h3>\n<p>Should statements are statements that you make to yourself about what you &ldquo;should&rdquo; do, what you &ldquo;ought&rdquo; to do, or what you &ldquo;must&rdquo; do. They can also be applied to others, imposing a set of expectations that will likely not be met.</p>\n<ul>\n<li>Why do I think that it &ldquo;should&rdquo; be?</li>\n<li>What if I let go of &ldquo;should&rdquo; and &ldquo;shouldn&rsquo;t&rdquo;?</li>\n<li>What if I allowed myself to feel however I feel&mdash;without regrets or expectations or projections of what it &ldquo;should&rdquo; be?</li>\n</ul>\n<h3>Reframe Should Statements</h3>\n<p>Use more compassionate and realistic statements. Try to soften it by replacing &ldquo;should&rdquo;-type words with &ldquo;prefer&rdquo;-type words or empower it by using &ldquo;can/will/choose&rdquo;-type words and think about doable actions.</p>",
    color: "#287db5",
  },
  {
    Word: "must",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: ["The actions I can take are", " My goal is"],
    rewrite_position: "After",
    popup_title: "Should Statment",
    popup_feedback: "Come on! Things don't have to be a certain way.",
    Sidebar_feedback:
      "<h3>More About Should Statements</h3>\n<p>Should statements are statements that you make to yourself about what you &ldquo;should&rdquo; do, what you &ldquo;ought&rdquo; to do, or what you &ldquo;must&rdquo; do. They can also be applied to others, imposing a set of expectations that will likely not be met.</p>\n<ul>\n<li>Why do I think that it &ldquo;should&rdquo; be?</li>\n<li>What if I let go of &ldquo;should&rdquo; and &ldquo;shouldn&rsquo;t&rdquo;?</li>\n<li>What if I allowed myself to feel however I feel&mdash;without regrets or expectations or projections of what it &ldquo;should&rdquo; be?</li>\n</ul>\n<h3>Reframe Should Statements</h3>\n<p>Use more compassionate and realistic statements. Try to soften it by replacing &ldquo;should&rdquo;-type words with &ldquo;prefer&rdquo;-type words or empower it by using &ldquo;can/will/choose&rdquo;-type words and think about doable actions.</p>",
    color: "#287db5",
  },
  {
    Word: "everything",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "however, to be more realistic",
      " however, there is exception when",
      " however, one evidence against it is",
    ],
    rewrite_position: "after",
    popup_title: "All-or-Nothing",
    popup_feedback:
      "A common cognitive distortion that will extrapolate one thing.",
    Sidebar_feedback:
      "<h3>More About All-or-Nothing and Overgeneralization</h3>\n<p>All or Nothing Thinking is also called Splitting, Black or White Thinking, Polarized Thinking. With this cognitive distortion, not being perfect means a complete failure. One of a few incidents can be extrapolated out as a general never-ending pattern.</p>\n<ul>\n<li>Thoughts are not facts</li>\n<li>Attitude toward negative thoughts matters</li>\n<li>Try thinking in shades of gray instead of black and white</li>\n<li>Try thinking in concrete time (last week) instead of a never-ending pattern (never, forever)</li>\n</ul>\n<h3>Reframe All-or-Nothing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Assign a percentage value like 30% instead of absolutive 0% or 100%; assign a specific person or situation instead of absolutive everyone or always</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "never",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "however, to be more realistic",
      " however, there is exception when",
      " however, one evidence against it is",
    ],
    rewrite_position: "after",
    popup_title: "All-or-Nothing",
    popup_feedback:
      "A common cognitive distortion that will extrapolate one thing.",
    Sidebar_feedback:
      "<h3>More About All-or-Nothing and Overgeneralization</h3>\n<p>All or Nothing Thinking is also called Splitting, Black or White Thinking, Polarized Thinking. With this cognitive distortion, not being perfect means a complete failure. One of a few incidents can be extrapolated out as a general never-ending pattern.</p>\n<ul>\n<li>Thoughts are not facts</li>\n<li>Attitude toward negative thoughts matters</li>\n<li>Try thinking in shades of gray instead of black and white</li>\n<li>Try thinking in concrete time (last week) instead of a never-ending pattern (never, forever)</li>\n</ul>\n<h3>Reframe All-or-Nothing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Assign a percentage value like 30% instead of absolutive 0% or 100%; assign a specific person or situation instead of absolutive everyone or always</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "always",
    wordnet_ext: [],
    phrase_ext: ["every time", " any time"],
    rewrite: [
      "however, to be more realistic",
      " however, there is exception when",
      " however, one evidence against it is",
    ],
    rewrite_position: "after",
    popup_title: "All-or-Nothing",
    popup_feedback:
      "A common cognitive distortion that will extrapolate one thing.",
    Sidebar_feedback:
      "<h3>More About All-or-Nothing and Overgeneralization</h3>\n<p>All or Nothing Thinking is also called Splitting, Black or White Thinking, Polarized Thinking. With this cognitive distortion, not being perfect means a complete failure. One of a few incidents can be extrapolated out as a general never-ending pattern.</p>\n<ul>\n<li>Thoughts are not facts</li>\n<li>Attitude toward negative thoughts matters</li>\n<li>Try thinking in shades of gray instead of black and white</li>\n<li>Try thinking in concrete time (last week) instead of a never-ending pattern (never, forever)</li>\n</ul>\n<h3>Reframe All-or-Nothing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Assign a percentage value like 30% instead of absolutive 0% or 100%; assign a specific person or situation instead of absolutive everyone or always</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "forever",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "however, to be more realistic",
      " however, there is exception when",
      " however, one evidence against it is",
    ],
    rewrite_position: "after",
    popup_title: "All-or-Nothing",
    popup_feedback:
      "A common cognitive distortion that will extrapolate one thing.",
    Sidebar_feedback:
      "<h3>More About All-or-Nothing and Overgeneralization</h3>\n<p>All or Nothing Thinking is also called Splitting, Black or White Thinking, Polarized Thinking. With this cognitive distortion, not being perfect means a complete failure. One of a few incidents can be extrapolated out as a general never-ending pattern.</p>\n<ul>\n<li>Thoughts are not facts</li>\n<li>Attitude toward negative thoughts matters</li>\n<li>Try thinking in shades of gray instead of black and white</li>\n<li>Try thinking in concrete time (last week) instead of a never-ending pattern (never, forever)</li>\n</ul>\n<h3>Reframe All-or-Nothing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Assign a percentage value like 30% instead of absolutive 0% or 100%; assign a specific person or situation instead of absolutive everyone or always</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "again",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "however, to be more realistic",
      " however, there is exception when",
      " however, one evidence against it is",
    ],
    rewrite_position: "after",
    popup_title: "All-or-Nothing",
    popup_feedback:
      "A common cognitive distortion that will extrapolate one thing.",
    Sidebar_feedback:
      "<h3>More About All-or-Nothing and Overgeneralization</h3>\n<p>All or Nothing Thinking is also called Splitting, Black or White Thinking, Polarized Thinking. With this cognitive distortion, not being perfect means a complete failure. One of a few incidents can be extrapolated out as a general never-ending pattern.</p>\n<ul>\n<li>Thoughts are not facts</li>\n<li>Attitude toward negative thoughts matters</li>\n<li>Try thinking in shades of gray instead of black and white</li>\n<li>Try thinking in concrete time (last week) instead of a never-ending pattern (never, forever)</li>\n</ul>\n<h3>Reframe All-or-Nothing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Assign a percentage value like 30% instead of absolutive 0% or 100%; assign a specific person or situation instead of absolutive everyone or always</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "have to",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: ["The actions I can take are", " My goal is"],
    rewrite_position: "After",
    popup_title: "Should Statment",
    popup_feedback: "Come on! Things don't have to be a certain way.",
    Sidebar_feedback:
      "<h3>More About Should Statements</h3>\n<p>Should statements are statements that you make to yourself about what you &ldquo;should&rdquo; do, what you &ldquo;ought&rdquo; to do, or what you &ldquo;must&rdquo; do. They can also be applied to others, imposing a set of expectations that will likely not be met.</p>\n<ul>\n<li>Why do I think that it &ldquo;should&rdquo; be?</li>\n<li>What if I let go of &ldquo;should&rdquo; and &ldquo;shouldn&rsquo;t&rdquo;?</li>\n<li>What if I allowed myself to feel however I feel&mdash;without regrets or expectations or projections of what it &ldquo;should&rdquo; be?</li>\n</ul>\n<h3>Reframe Should Statements</h3>\n<p>Use more compassionate and realistic statements. Try to soften it by replacing &ldquo;should&rdquo;-type words with &ldquo;prefer&rdquo;-type words or empower it by using &ldquo;can/will/choose&rdquo;-type words and think about doable actions.</p>",
    color: "#287db5",
  },
  {
    Word: "anyone",
    wordnet_ext: ["anybody"],
    phrase_ext: [],
    rewrite: [
      "however, to be more realistic",
      " however, there is exception when",
      " however, one evidence against it is",
    ],
    rewrite_position: "after",
    popup_title: "All-or-Nothing",
    popup_feedback:
      "A common cognitive distortion that will extrapolate one thing.",
    Sidebar_feedback:
      "<h3>More About All-or-Nothing and Overgeneralization</h3>\n<p>All or Nothing Thinking is also called Splitting, Black or White Thinking, Polarized Thinking. With this cognitive distortion, not being perfect means a complete failure. One of a few incidents can be extrapolated out as a general never-ending pattern.</p>\n<ul>\n<li>Thoughts are not facts</li>\n<li>Attitude toward negative thoughts matters</li>\n<li>Try thinking in shades of gray instead of black and white</li>\n<li>Try thinking in concrete time (last week) instead of a never-ending pattern (never, forever)</li>\n</ul>\n<h3>Reframe All-or-Nothing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Assign a percentage value like 30% instead of absolutive 0% or 100%; assign a specific person or situation instead of absolutive everyone or always</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "all",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "however, to be more realistic",
      " however, there is exception when",
      " however, one evidence against it is",
    ],
    rewrite_position: "after",
    popup_title: "All-or-Nothing",
    popup_feedback:
      "A common cognitive distortion that will extrapolate one thing.",
    Sidebar_feedback:
      "<h3>More About All-or-Nothing and Overgeneralization</h3>\n<p>All or Nothing Thinking is also called Splitting, Black or White Thinking, Polarized Thinking. With this cognitive distortion, not being perfect means a complete failure. One of a few incidents can be extrapolated out as a general never-ending pattern.</p>\n<ul>\n<li>Thoughts are not facts</li>\n<li>Attitude toward negative thoughts matters</li>\n<li>Try thinking in shades of gray instead of black and white</li>\n<li>Try thinking in concrete time (last week) instead of a never-ending pattern (never, forever)</li>\n</ul>\n<h3>Reframe All-or-Nothing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Assign a percentage value like 30% instead of absolutive 0% or 100%; assign a specific person or situation instead of absolutive everyone or always</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "all my faults",
    wordnet_ext: [],
    phrase_ext: [
      "all my fault",
      " blame myself",
      " I should have",
      " I feel guilty",
      " I am shamed of myself",
      " I am inadequate",
      " I didn't live up to",
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
    Sidebar_feedback:
      "<h3>More About Blaming</h3><p>It often happens in perfectionists. When it actually isn&rsquo;t that bad, thinking the worst-case scenario happens.</p><h3>Reframe Blaming</h3><ul><li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li><li>Putting equal emphasis on the positive and negative of the situation, on possible strength or weakness;</li><li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li><li>How you will respond if a close friend said a similar thing to you?</li></ul>",
    color: "#287db5",
  },
  {
    Word: "all his fault",
    wordnet_ext: [],
    phrase_ext: [
      "all her fault",
      " all their fault",
      " blame him",
      " blame her",
      " blame them",
    ],
    rewrite: [
      "I understand that it may happen when",
      " if my close friend did that accidentally",
    ],
    rewrite_position: "after",
    popup_title: "Blaming others",
    popup_feedback:
      "A common distrotion that believes only one person is responsible for a situation that they may have little control over.",
    Sidebar_feedback:
      "<h3>More About Blaming</h3><p>It often happens in perfectionists. When it actually isn&rsquo;t that bad, thinking the worst-case scenario happens.</p><h3>Reframe Blaming</h3><ul><li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li><li>Putting equal emphasis on the positive and negative of the situation, on possible strength or weakness;</li><li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li><li>How you will respond if a close friend said a similar thing to you?</li></ul>",
    color: "#287db5",
  },
  {
    Word: "ruined all efforts",
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
    Sidebar_feedback:
      "<h3>More About Catastrophizing</h3>\n<p>It often happens in perfectionists. When it actually isn&rsquo;t that bad, thinking the worst-case scenario happens.</p>\n<ul>\n<li>Live in the present</li>\n<li>Accept the current situation</li>\n<li>Separate facts, feelings, and negative thoughts</li>\n</ul>\n<h3>Reframe Catastrophizing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Putting equal emphasis on the positive and negative of the situation, on possible strength or weakness;</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n<li>How you will respond if a close friend said a similar thing to you?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "will probably",
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
    Sidebar_feedback:
      "<h3>More About Catastrophizing</h3>\n<p>It often happens in perfectionists. When it actually isn&rsquo;t that bad, thinking the worst-case scenario happens.</p>\n<ul>\n<li>Live in the present</li>\n<li>Accept the current situation</li>\n<li>Separate facts, feelings, and negative thoughts</li>\n</ul>\n<h3>Reframe Catastrophizing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Putting equal emphasis on the positive and negative of the situation, on possible strength or weakness;</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n<li>How you will respond if a close friend said a similar thing to you?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "will bet",
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
    Sidebar_feedback:
      "<h3>More About Catastrophizing</h3>\n<p>It often happens in perfectionists. When it actually isn&rsquo;t that bad, thinking the worst-case scenario happens.</p>\n<ul>\n<li>Live in the present</li>\n<li>Accept the current situation</li>\n<li>Separate facts, feelings, and negative thoughts</li>\n</ul>\n<h3>Reframe Catastrophizing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Putting equal emphasis on the positive and negative of the situation, on possible strength or weakness;</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n<li>How you will respond if a close friend said a similar thing to you?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "worry",
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
    Sidebar_feedback:
      "<h3>More About Catastrophizing</h3>\n<p>It often happens in perfectionists. When it actually isn&rsquo;t that bad, thinking the worst-case scenario happens.</p>\n<ul>\n<li>Live in the present</li>\n<li>Accept the current situation</li>\n<li>Separate facts, feelings, and negative thoughts</li>\n</ul>\n<h3>Reframe Catastrophizing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Putting equal emphasis on the positive and negative of the situation, on possible strength or weakness;</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n<li>How you will respond if a close friend said a similar thing to you?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "panicked",
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
    Sidebar_feedback:
      "<h3>More About Catastrophizing</h3>\n<p>It often happens in perfectionists. When it actually isn&rsquo;t that bad, thinking the worst-case scenario happens.</p>\n<ul>\n<li>Live in the present</li>\n<li>Accept the current situation</li>\n<li>Separate facts, feelings, and negative thoughts</li>\n</ul>\n<h3>Reframe Catastrophizing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Putting equal emphasis on the positive and negative of the situation, on possible strength or weakness;</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n<li>How you will respond if a close friend said a similar thing to you?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "everyone",
    wordnet_ext: ["everybody"],
    phrase_ext: [],
    rewrite: [
      "however, to be more realistic",
      " however, there is exception when",
      " however, one evidence against it is",
    ],
    rewrite_position: "after",
    popup_title: "All-or-Nothing",
    popup_feedback:
      "A common cognitive distortion that will extrapolate one thing.",
    Sidebar_feedback:
      "<h3>More About All-or-Nothing and Overgeneralization</h3>\n<p>All or Nothing Thinking is also called Splitting, Black or White Thinking, Polarized Thinking. With this cognitive distortion, not being perfect means a complete failure. One of a few incidents can be extrapolated out as a general never-ending pattern.</p>\n<ul>\n<li>Thoughts are not facts</li>\n<li>Attitude toward negative thoughts matters</li>\n<li>Try thinking in shades of gray instead of black and white</li>\n<li>Try thinking in concrete time (last week) instead of a never-ending pattern (never, forever)</li>\n</ul>\n<h3>Reframe All-or-Nothing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Assign a percentage value like 30% instead of absolutive 0% or 100%; assign a specific person or situation instead of absolutive everyone or always</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "what if",
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
    Sidebar_feedback:
      "<h3>More About Catastrophizing</h3>\n<p>It often happens in perfectionists. When it actually isn&rsquo;t that bad, thinking the worst-case scenario happens.</p>\n<ul>\n<li>Live in the present</li>\n<li>Accept the current situation</li>\n<li>Separate facts, feelings, and negative thoughts</li>\n</ul>\n<h3>Reframe Catastrophizing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Putting equal emphasis on the positive and negative of the situation, on possible strength or weakness;</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n<li>How you will respond if a close friend said a similar thing to you?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "nothing",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "however, to be more realistic",
      " however, there is exception when",
      " however, one evidence against it is",
    ],
    rewrite_position: "after",
    popup_title: "All-or-Nothing",
    popup_feedback:
      "A common cognitive distortion that will extrapolate one thing.",
    Sidebar_feedback:
      "<h3>More About All-or-Nothing and Overgeneralization</h3>\n<p>All or Nothing Thinking is also called Splitting, Black or White Thinking, Polarized Thinking. With this cognitive distortion, not being perfect means a complete failure. One of a few incidents can be extrapolated out as a general never-ending pattern.</p>\n<ul>\n<li>Thoughts are not facts</li>\n<li>Attitude toward negative thoughts matters</li>\n<li>Try thinking in shades of gray instead of black and white</li>\n<li>Try thinking in concrete time (last week) instead of a never-ending pattern (never, forever)</li>\n</ul>\n<h3>Reframe All-or-Nothing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Assign a percentage value like 30% instead of absolutive 0% or 100%; assign a specific person or situation instead of absolutive everyone or always</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "none",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "however, to be more realistic",
      " however, there is exception when",
      " however, one evidence against it is",
    ],
    rewrite_position: "after",
    popup_title: "All-or-Nothing",
    popup_feedback:
      "A common cognitive distortion that will extrapolate one thing.",
    Sidebar_feedback:
      "<h3>More About All-or-Nothing and Overgeneralization</h3>\n<p>All or Nothing Thinking is also called Splitting, Black or White Thinking, Polarized Thinking. With this cognitive distortion, not being perfect means a complete failure. One of a few incidents can be extrapolated out as a general never-ending pattern.</p>\n<ul>\n<li>Thoughts are not facts</li>\n<li>Attitude toward negative thoughts matters</li>\n<li>Try thinking in shades of gray instead of black and white</li>\n<li>Try thinking in concrete time (last week) instead of a never-ending pattern (never, forever)</li>\n</ul>\n<h3>Reframe All-or-Nothing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Assign a percentage value like 30% instead of absolutive 0% or 100%; assign a specific person or situation instead of absolutive everyone or always</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "no one",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "however, to be more realistic",
      " however, there is exception when",
      " however, one evidence against it is",
    ],
    rewrite_position: "after",
    popup_title: "All-or-Nothing",
    popup_feedback:
      "A common cognitive distortion that will extrapolate one thing.",
    Sidebar_feedback:
      "<h3>More About All-or-Nothing and Overgeneralization</h3>\n<p>All or Nothing Thinking is also called Splitting, Black or White Thinking, Polarized Thinking. With this cognitive distortion, not being perfect means a complete failure. One of a few incidents can be extrapolated out as a general never-ending pattern.</p>\n<ul>\n<li>Thoughts are not facts</li>\n<li>Attitude toward negative thoughts matters</li>\n<li>Try thinking in shades of gray instead of black and white</li>\n<li>Try thinking in concrete time (last week) instead of a never-ending pattern (never, forever)</li>\n</ul>\n<h3>Reframe All-or-Nothing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Assign a percentage value like 30% instead of absolutive 0% or 100%; assign a specific person or situation instead of absolutive everyone or always</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "totally",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "however, to be more realistic",
      " however, there is exception when",
      " however, one evidence against it is",
    ],
    rewrite_position: "after",
    popup_title: "All-or-Nothing",
    popup_feedback:
      "A common cognitive distortion that will extrapolate one thing.",
    Sidebar_feedback:
      "<h3>More About All-or-Nothing and Overgeneralization</h3>\n<p>All or Nothing Thinking is also called Splitting, Black or White Thinking, Polarized Thinking. With this cognitive distortion, not being perfect means a complete failure. One of a few incidents can be extrapolated out as a general never-ending pattern.</p>\n<ul>\n<li>Thoughts are not facts</li>\n<li>Attitude toward negative thoughts matters</li>\n<li>Try thinking in shades of gray instead of black and white</li>\n<li>Try thinking in concrete time (last week) instead of a never-ending pattern (never, forever)</li>\n</ul>\n<h3>Reframe All-or-Nothing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Assign a percentage value like 30% instead of absolutive 0% or 100%; assign a specific person or situation instead of absolutive everyone or always</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "only",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "however, to be more realistic",
      " however, there is exception when",
      " however, one evidence against it is",
    ],
    rewrite_position: "after",
    popup_title: "All-or-Nothing",
    popup_feedback:
      "A common cognitive distortion that will extrapolate one thing.",
    Sidebar_feedback:
      "<h3>More About All-or-Nothing and Overgeneralization</h3>\n<p>All or Nothing Thinking is also called Splitting, Black or White Thinking, Polarized Thinking. With this cognitive distortion, not being perfect means a complete failure. One of a few incidents can be extrapolated out as a general never-ending pattern.</p>\n<ul>\n<li>Thoughts are not facts</li>\n<li>Attitude toward negative thoughts matters</li>\n<li>Try thinking in shades of gray instead of black and white</li>\n<li>Try thinking in concrete time (last week) instead of a never-ending pattern (never, forever)</li>\n</ul>\n<h3>Reframe All-or-Nothing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Assign a percentage value like 30% instead of absolutive 0% or 100%; assign a specific person or situation instead of absolutive everyone or always</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "anything",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "however, to be more realistic",
      " however, there is exception when",
      " however, one evidence against it is",
    ],
    rewrite_position: "after",
    popup_title: "All-or-Nothing",
    popup_feedback:
      "A common cognitive distortion that will extrapolate one thing.",
    Sidebar_feedback:
      "<h3>More About All-or-Nothing and Overgeneralization</h3>\n<p>All or Nothing Thinking is also called Splitting, Black or White Thinking, Polarized Thinking. With this cognitive distortion, not being perfect means a complete failure. One of a few incidents can be extrapolated out as a general never-ending pattern.</p>\n<ul>\n<li>Thoughts are not facts</li>\n<li>Attitude toward negative thoughts matters</li>\n<li>Try thinking in shades of gray instead of black and white</li>\n<li>Try thinking in concrete time (last week) instead of a never-ending pattern (never, forever)</li>\n</ul>\n<h3>Reframe All-or-Nothing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Assign a percentage value like 30% instead of absolutive 0% or 100%; assign a specific person or situation instead of absolutive everyone or always</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "panic",
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
    Sidebar_feedback:
      "<h3>More About Catastrophizing</h3>\n<p>It often happens in perfectionists. When it actually isn&rsquo;t that bad, thinking the worst-case scenario happens.</p>\n<ul>\n<li>Live in the present</li>\n<li>Accept the current situation</li>\n<li>Separate facts, feelings, and negative thoughts</li>\n</ul>\n<h3>Reframe Catastrophizing</h3>\n<ul>\n<li>Examine the Evidence: performing an accurate analysis of one&rsquo;s situation. Does any evidence support it? Does any evidence against it?</li>\n<li>Putting equal emphasis on the positive and negative of the situation, on possible strength or weakness;</li>\n<li>How does this thought make you feel? Without this cognitive distortion, what you will do?</li>\n<li>How you will respond if a close friend said a similar thing to you?</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "stupid",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "I am having the thought of ...",
      " It is my thought but not fact that",
    ],
    rewrite_position: "before",
    popup_title: "Negative Self-Talk",
    popup_feedback:
      "Time to shift your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3>\n<p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p>\n<p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p>\n<ul>\n<li>Listening closely to your inner dialogues.&nbsp;</li>\n<li>Write down important or frequent negative thoughts.</li>\n<li>Be aware of the unbalanced, harmful thoughts.</li>\n</ul>\n<h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3>\n<ul>\n<li>Look back at the thoughts and reword them in a kinder, more positive light.</li>\n<li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li>\n<li>Writing down what you are grateful for.</li>\n<li>Understanding the concept of impermanence and look into future in a positive way.</li>\n<li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "dumb",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "I am having the thought of ...",
      " It is my thought but not fact that",
    ],
    rewrite_position: "before",
    popup_title: "Negative Self-Talk",
    popup_feedback:
      "Time to shift your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3>\n<p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p>\n<p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p>\n<ul>\n<li>Listening closely to your inner dialogues.&nbsp;</li>\n<li>Write down important or frequent negative thoughts.</li>\n<li>Be aware of the unbalanced, harmful thoughts.</li>\n</ul>\n<h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3>\n<ul>\n<li>Look back at the thoughts and reword them in a kinder, more positive light.</li>\n<li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li>\n<li>Writing down what you are grateful for.</li>\n<li>Understanding the concept of impermanence and look into future in a positive way.</li>\n<li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "pathetic",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: [
      "I am having the thought of ...",
      " It is my thought but not fact that",
    ],
    rewrite_position: "before",
    popup_title: "Negative Self-Talk",
    popup_feedback:
      "Time to shift your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3>\n<p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p>\n<p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p>\n<ul>\n<li>Listening closely to your inner dialogues.&nbsp;</li>\n<li>Write down important or frequent negative thoughts.</li>\n<li>Be aware of the unbalanced, harmful thoughts.</li>\n</ul>\n<h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3>\n<ul>\n<li>Look back at the thoughts and reword them in a kinder, more positive light.</li>\n<li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li>\n<li>Writing down what you are grateful for.</li>\n<li>Understanding the concept of impermanence and look into future in a positive way.</li>\n<li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "good-for-nothing",
    wordnet_ext: [],
    phrase_ext: ["in a bad way"],
    rewrite: [
      "A different perspective might be",
      " A better way to look at it might be",
    ],
    rewrite_position: "after",
    popup_title: "Negative Self-Talk",
    popup_feedback:
      "Time to shift your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3>\n<p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p>\n<p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p>\n<ul>\n<li>Listening closely to your inner dialogues.&nbsp;</li>\n<li>Write down important or frequent negative thoughts.</li>\n<li>Be aware of the unbalanced, harmful thoughts.</li>\n</ul>\n<h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3>\n<ul>\n<li>Look back at the thoughts and reword them in a kinder, more positive light.</li>\n<li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li>\n<li>Writing down what you are grateful for.</li>\n<li>Understanding the concept of impermanence and look into future in a positive way.</li>\n<li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "failed myself",
    wordnet_ext: [],
    phrase_ext: [
      "embarrassed myself",
      " It is impossible for me to",
      " no way",
    ],
    rewrite: [
      "but it is still possible for me to",
      " Actutally, this is a wonderful opportunity for me to",
    ],
    rewrite_position: "after",
    popup_title: "Negative Self-Talk",
    popup_feedback:
      "Time to shift your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3>\n<p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p>\n<p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p>\n<ul>\n<li>Listening closely to your inner dialogues.&nbsp;</li>\n<li>Write down important or frequent negative thoughts.</li>\n<li>Be aware of the unbalanced, harmful thoughts.</li>\n</ul>\n<h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3>\n<ul>\n<li>Look back at the thoughts and reword them in a kinder, more positive light.</li>\n<li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li>\n<li>Writing down what you are grateful for.</li>\n<li>Understanding the concept of impermanence and look into future in a positive way.</li>\n<li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "useless",
    wordnet_ext: [],
    phrase_ext: [
      "I am useless; I screwed up",
      " I can't",
      " I cannot",
      " I am not able to",
    ],
    rewrite: [
      "I am proud of myself when trying",
      " next time I am going to try",
      " at least I can try",
      " in the past, but in the future",
    ],
    rewrite_position: "after",
    popup_title: "Negative Self-Talk",
    popup_feedback:
      "Time to shift your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3>\n<p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p>\n<p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p>\n<ul>\n<li>Listening closely to your inner dialogues.&nbsp;</li>\n<li>Write down important or frequent negative thoughts.</li>\n<li>Be aware of the unbalanced, harmful thoughts.</li>\n</ul>\n<h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3>\n<ul>\n<li>Look back at the thoughts and reword them in a kinder, more positive light.</li>\n<li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li>\n<li>Writing down what you are grateful for.</li>\n<li>Understanding the concept of impermanence and look into future in a positive way.</li>\n<li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "suck",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: ["I notice that this is only a thought and I let it go"],
    rewrite_position: "after",
    popup_title: "Negative Self-Talk",
    popup_feedback:
      "Time to shift your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3>\n<p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p>\n<p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p>\n<ul>\n<li>Listening closely to your inner dialogues.&nbsp;</li>\n<li>Write down important or frequent negative thoughts.</li>\n<li>Be aware of the unbalanced, harmful thoughts.</li>\n</ul>\n<h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3>\n<ul>\n<li>Look back at the thoughts and reword them in a kinder, more positive light.</li>\n<li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li>\n<li>Writing down what you are grateful for.</li>\n<li>Understanding the concept of impermanence and look into future in a positive way.</li>\n<li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "lazy",
    wordnet_ext: [],
    phrase_ext: ["I am lazy"],
    rewrite: ["I have the power to"],
    rewrite_position: "after",
    popup_title: "Negative Self-Talk",
    popup_feedback:
      "Time to shift your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3>\n<p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p>\n<p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p>\n<ul>\n<li>Listening closely to your inner dialogues.&nbsp;</li>\n<li>Write down important or frequent negative thoughts.</li>\n<li>Be aware of the unbalanced, harmful thoughts.</li>\n</ul>\n<h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3>\n<ul>\n<li>Look back at the thoughts and reword them in a kinder, more positive light.</li>\n<li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li>\n<li>Writing down what you are grateful for.</li>\n<li>Understanding the concept of impermanence and look into future in a positive way.</li>\n<li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "hate",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: ["I notice that this is only a thought and I let it go"],
    rewrite_position: "after",
    popup_title: "Negative Self-Talk",
    popup_feedback:
      "Time to shift your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3>\n<p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p>\n<p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p>\n<ul>\n<li>Listening closely to your inner dialogues.&nbsp;</li>\n<li>Write down important or frequent negative thoughts.</li>\n<li>Be aware of the unbalanced, harmful thoughts.</li>\n</ul>\n<h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3>\n<ul>\n<li>Look back at the thoughts and reword them in a kinder, more positive light.</li>\n<li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li>\n<li>Writing down what you are grateful for.</li>\n<li>Understanding the concept of impermanence and look into future in a positive way.</li>\n<li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "failure",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: ["but I am so close to …", " soon I will be able to …"],
    rewrite_position: "after",
    popup_title: "Negative Self-Talk",
    popup_feedback:
      "Time to shift your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3>\n<p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p>\n<p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p>\n<ul>\n<li>Listening closely to your inner dialogues.&nbsp;</li>\n<li>Write down important or frequent negative thoughts.</li>\n<li>Be aware of the unbalanced, harmful thoughts.</li>\n</ul>\n<h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3>\n<ul>\n<li>Look back at the thoughts and reword them in a kinder, more positive light.</li>\n<li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li>\n<li>Writing down what you are grateful for.</li>\n<li>Understanding the concept of impermanence and look into future in a positive way.</li>\n<li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "failure",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: ["failure but a valuable experience"],
    rewrite_position: "Replace",
    popup_title: "Negative Self-Talk",
    popup_feedback:
      "Time to shift your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3>\n<p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p>\n<p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p>\n<ul>\n<li>Listening closely to your inner dialogues.&nbsp;</li>\n<li>Write down important or frequent negative thoughts.</li>\n<li>Be aware of the unbalanced, harmful thoughts.</li>\n</ul>\n<h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3>\n<ul>\n<li>Look back at the thoughts and reword them in a kinder, more positive light.</li>\n<li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li>\n<li>Writing down what you are grateful for.</li>\n<li>Understanding the concept of impermanence and look into future in a positive way.</li>\n<li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: " loser",
    wordnet_ext: [],
    phrase_ext: ["I will disappoint", " I am a loser", " what a loser"],
    rewrite: [
      "I am having the thought of ...",
      " It is my thought but not fact that",
    ],
    rewrite_position: "Before",
    popup_title: "Negative Self-Talk",
    popup_feedback:
      "Time to shift your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3>\n<p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p>\n<p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p>\n<ul>\n<li>Listening closely to your inner dialogues.&nbsp;</li>\n<li>Write down important or frequent negative thoughts.</li>\n<li>Be aware of the unbalanced, harmful thoughts.</li>\n</ul>\n<h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3>\n<ul>\n<li>Look back at the thoughts and reword them in a kinder, more positive light.</li>\n<li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li>\n<li>Writing down what you are grateful for.</li>\n<li>Understanding the concept of impermanence and look into future in a positive way.</li>\n<li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "idiot",
    wordnet_ext: [],
    phrase_ext: ["what an idiot", " I am an idiot"],
    rewrite: [
      "I am having the thought of ...",
      " It is my thought but not fact that",
    ],
    rewrite_position: "Before",
    popup_title: "Negative Self-Talk",
    popup_feedback:
      "Time to shift your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3>\n<p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p>\n<p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p>\n<ul>\n<li>Listening closely to your inner dialogues.&nbsp;</li>\n<li>Write down important or frequent negative thoughts.</li>\n<li>Be aware of the unbalanced, harmful thoughts.</li>\n</ul>\n<h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3>\n<ul>\n<li>Look back at the thoughts and reword them in a kinder, more positive light.</li>\n<li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li>\n<li>Writing down what you are grateful for.</li>\n<li>Understanding the concept of impermanence and look into future in a positive way.</li>\n<li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "the worst",
    wordnet_ext: [],
    phrase_ext: ["I am the worst"],
    rewrite: [
      "I am having the thought of ...",
      " It is my thought but not fact that",
    ],
    rewrite_position: "before",
    popup_title: "Negative Self-Talk",
    popup_feedback:
      "Time to shift your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3>\n<p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p>\n<p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p>\n<ul>\n<li>Listening closely to your inner dialogues.&nbsp;</li>\n<li>Write down important or frequent negative thoughts.</li>\n<li>Be aware of the unbalanced, harmful thoughts.</li>\n</ul>\n<h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3>\n<ul>\n<li>Look back at the thoughts and reword them in a kinder, more positive light.</li>\n<li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li>\n<li>Writing down what you are grateful for.</li>\n<li>Understanding the concept of impermanence and look into future in a positive way.</li>\n<li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: " loser",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: ["a person who "],
    rewrite_position: "Replace",
    popup_title: "Negative Self-Talk",
    popup_feedback:
      "Time to shift your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3>\n<p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p>\n<p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p>\n<ul>\n<li>Listening closely to your inner dialogues.&nbsp;</li>\n<li>Write down important or frequent negative thoughts.</li>\n<li>Be aware of the unbalanced, harmful thoughts.</li>\n</ul>\n<h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3>\n<ul>\n<li>Look back at the thoughts and reword them in a kinder, more positive light.</li>\n<li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li>\n<li>Writing down what you are grateful for.</li>\n<li>Understanding the concept of impermanence and look into future in a positive way.</li>\n<li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li>\n</ul>",
    color: "#287db5",
  },
  {
    Word: "depress",
    wordnet_ext: [
      "depressed",
      " depression",
      " gloomy",
      " grim",
      " blue",
      " dispirited",
      " feeling down",
      " feel down",
      " downcast",
      " downhearted",
      " down in the mouth",
      " low",
      " low-spirited",
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
    Word: "stress",
    wordnet_ext: ["stressful", " stressed", " overwhelmed", " overwhelming"],
    phrase_ext: [
      "difficulty breathing",
      " hard of breathing",
      " unable to rest",
      " unable to enjoy",
      " unable to relax",
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
    Word: "dyshphoria",
    wordnet_ext: [
      "unhappy",
      " uneasy",
      " dissatisfied",
      " discomfort",
      " distress",
      " unease",
      " fidgeting",
      " frustration",
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
    Word: "hopeless",
    wordnet_ext: ["desperate", " despairing"],
    phrase_ext: ["no help", " don't help"],
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
    Word: "helpless",
    wordnet_ext: ["incapacitated "],
    phrase_ext: ["nobody help", " no one help"],
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
    Word: "worthlessness",
    wordnet_ext: [
      "worthless",
      " despicable",
      " ugly",
      " vile",
      " slimy",
      " unworthy",
      " worthless",
      " wretched",
      " undeserving ",
    ],
    phrase_ext: [
      "what is the point",
      " there is no point",
      " worth nothing",
      " not worthing anything",
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
    Word: "guilt",
    wordnet_ext: ["guilty", " ashamed", " embarrased"],
    phrase_ext: ["all my fault", " blame on me"],
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
    Word: null,
    wordnet_ext: ["indifferent", " apathetic"],
    phrase_ext: [
      "loss of interest",
      " lost interest",
      " lose interest",
      " used to be interested",
      " not interested any more",
      " can't enjoy",
      " life is boring",
      " life is meaningless",
      " uninterested in life",
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
    Word: null,
    wordnet_ext: ["avolition", " demotivated", " unmotivated"],
    phrase_ext: [
      "loss of motivation",
      " not motivated",
      " not motivated any more",
      " less motivated",
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
    Word: null,
    wordnet_ext: [],
    phrase_ext: ["lose sense of humor", " lost my sense of humor"],
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
    Word: "insomnia",
    wordnet_ext: ["sleeplessness"],
    phrase_ext: ["can't sleep", " sleepless", " difficulty falling asleep"],
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
    Word: "disrupted sleep",
    wordnet_ext: [],
    phrase_ext: ["wake up in the midnight", " sleeping disorders"],
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
    Word: "lethargy",
    wordnet_ext: [],
    phrase_ext: [
      "sleep long",
      " sleep too long",
      " sleep too much",
      " hard to wake up",
      " hard waking up",
      " difficulty staying asleep",
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
    Word: null,
    wordnet_ext: [],
    phrase_ext: [
      "hungrier",
      " eat less",
      " eat more",
      " loss of appetite",
      " increased appetite",
      " decreased appetite",
      " eating disorders",
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
    Word: "fatigue",
    wordnet_ext: [
      "weariness",
      " tiredness\ntire",
      " pall",
      " weary",
      " jade \ntire",
      " wear upon",
      " tire out",
      " wear",
      " weary",
      " jade",
      " wear out",
      " outwear",
      " wear down",
      " fag out",
      " fag",
      " lethargy",
    ],
    phrase_ext: [
      "out of energy",
      " lack of energy",
      " little energy",
      " burn out",
      " burnout",
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
    Word: "restlessness",
    wordnet_ext: ["uneasiness", " queasiness"],
    phrase_ext: [
      "unable to calm",
      " have to move around",
      " wound-up",
      " on-edge",
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
    Word: "self-hate",
    wordnet_ext: ["self-hatred", " self-loathing", " self-disgust"],
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
    Word: "Bury",
    wordnet_ext: ["self-destruction", " self-annihilation", " felo-de-se"],
    phrase_ext: ["kill myself", " end my life"],
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
    Word: "chest pain",
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
    Word: "body pain",
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
    Word: "stomachaches",
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
    Word: "muscle aches",
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
    Word: "headaches",
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
    Word: "worry",
    wordnet_ext: ["worried"],
    phrase_ext: [
      "can't help worrying",
      " keep worrying",
      " can't stop worrying",
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
    Word: "panic",
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
    Word: "die",
    wordnet_ext: ["self-destruction", " self-annihilation", " felo-de-se"],
    phrase_ext: ["kill myself", " end my life"],
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
    Word: "suicidal",
    wordnet_ext: ["self-destruction", " self-annihilation", " felo-de-se"],
    phrase_ext: ["kill myself", " end my life"],
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
    Word: "suicide",
    wordnet_ext: ["self-destruction", " self-annihilation", " felo-de-se"],
    phrase_ext: ["kill myself", " end my life"],
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
    Word: "kill",
    wordnet_ext: ["self-destruction", " self-annihilation", " felo-de-se"],
    phrase_ext: ["kill myself", " end my life"],
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
    Word: "coffin",
    wordnet_ext: ["self-destruction", " self-annihilation", " felo-de-se"],
    phrase_ext: ["kill myself", " end my life"],
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
    Word: "irritable",
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
    Word: "distract",
    wordnet_ext: ["perturb", " unhinge", " disquiet"],
    phrase_ext: [
      "can't concentrate",
      " hard to concentrate",
      " difficulty concentrating",
      " can't focus",
      " hard to focus",
      " difficulty focusing",
      " can't pay attention",
      " hard to pay attention",
      " difficulty paying attention",
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
    Word: "myself",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "First Pronoun",
    popup_feedback:
      "This indicates a viewpoint of your own. You may have high level of self-awareness.",
    Sidebar_feedback:
      "<p>&ldquo;I&rdquo;-focused language is used to describe one&rsquo;s own viewpoint. Pronouns tell us where people focus their attention. If someone uses the pronoun &ldquo;I,&rdquo; it&rsquo;s a sign of self-focus. It can be a sign of high self-confidence and self-awareness. It can also be a sign of only focusing on one viewpoint.&nbsp;</p>\n<h3>Reframe I-focused View Point</h3>\n<p>People who moved in a positive direction wrote about their situation from multiple perspectives. Try to use&nbsp; &ldquo;he/she/they&rdquo;-oriented language before shifting back to &ldquo;I.&rdquo; This cycle represents the helpful ability to consider different viewpoints &ndash; and is a key factor in helping people process their most difficult experiences.</p>\n<p>If you are using I words to express negative thoughts, try to refer to yourself by a nickname instead. using the third person in self-talk can help you step back and think more objectively about your response and emotions, whether you&rsquo;re thinking about a past event or looking into the future. It can also help you reduce stress and anxiety.</p>",
    color: "#4b2a7e",
  },
  {
    Word: "self",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "First Pronoun",
    popup_feedback:
      "This indicates a viewpoint of your own. You may have high level of self-awareness.",
    Sidebar_feedback:
      "<p>&ldquo;I&rdquo;-focused language is used to describe one&rsquo;s own viewpoint. Pronouns tell us where people focus their attention. If someone uses the pronoun &ldquo;I,&rdquo; it&rsquo;s a sign of self-focus. It can be a sign of high self-confidence and self-awareness. It can also be a sign of only focusing on one viewpoint.&nbsp;</p>\n<h3>Reframe I-focused View Point</h3>\n<p>People who moved in a positive direction wrote about their situation from multiple perspectives. Try to use&nbsp; &ldquo;he/she/they&rdquo;-oriented language before shifting back to &ldquo;I.&rdquo; This cycle represents the helpful ability to consider different viewpoints &ndash; and is a key factor in helping people process their most difficult experiences.</p>\n<p>If you are using I words to express negative thoughts, try to refer to yourself by a nickname instead. using the third person in self-talk can help you step back and think more objectively about your response and emotions, whether you&rsquo;re thinking about a past event or looking into the future. It can also help you reduce stress and anxiety.</p>",
    color: "#4b2a7e",
  },
  {
    Word: "mine",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "First Pronoun",
    popup_feedback:
      "This indicates a viewpoint of your own. You may have high level of self-awareness.",
    Sidebar_feedback:
      "<p>&ldquo;I&rdquo;-focused language is used to describe one&rsquo;s own viewpoint. Pronouns tell us where people focus their attention. If someone uses the pronoun &ldquo;I,&rdquo; it&rsquo;s a sign of self-focus. It can be a sign of high self-confidence and self-awareness. It can also be a sign of only focusing on one viewpoint.&nbsp;</p>\n<h3>Reframe I-focused View Point</h3>\n<p>People who moved in a positive direction wrote about their situation from multiple perspectives. Try to use&nbsp; &ldquo;he/she/they&rdquo;-oriented language before shifting back to &ldquo;I.&rdquo; This cycle represents the helpful ability to consider different viewpoints &ndash; and is a key factor in helping people process their most difficult experiences.</p>\n<p>If you are using I words to express negative thoughts, try to refer to yourself by a nickname instead. using the third person in self-talk can help you step back and think more objectively about your response and emotions, whether you&rsquo;re thinking about a past event or looking into the future. It can also help you reduce stress and anxiety.</p>",
    color: "#4b2a7e",
  },
  {
    Word: "me",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "First Pronoun",
    popup_feedback:
      "This indicates a viewpoint of your own. You may have high level of self-awareness.",
    Sidebar_feedback:
      "<p>&ldquo;I&rdquo;-focused language is used to describe one&rsquo;s own viewpoint. Pronouns tell us where people focus their attention. If someone uses the pronoun &ldquo;I,&rdquo; it&rsquo;s a sign of self-focus. It can be a sign of high self-confidence and self-awareness. It can also be a sign of only focusing on one viewpoint.&nbsp;</p>\n<h3>Reframe I-focused View Point</h3>\n<p>People who moved in a positive direction wrote about their situation from multiple perspectives. Try to use&nbsp; &ldquo;he/she/they&rdquo;-oriented language before shifting back to &ldquo;I.&rdquo; This cycle represents the helpful ability to consider different viewpoints &ndash; and is a key factor in helping people process their most difficult experiences.</p>\n<p>If you are using I words to express negative thoughts, try to refer to yourself by a nickname instead. using the third person in self-talk can help you step back and think more objectively about your response and emotions, whether you&rsquo;re thinking about a past event or looking into the future. It can also help you reduce stress and anxiety.</p>",
    color: "#4b2a7e",
  },
  {
    Word: "I",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "First Pronoun",
    popup_feedback:
      "This indicates a viewpoint of your own. You may have high level of self-awareness.",
    Sidebar_feedback:
      "<p>&ldquo;I&rdquo;-focused language is used to describe one&rsquo;s own viewpoint. Pronouns tell us where people focus their attention. If someone uses the pronoun &ldquo;I,&rdquo; it&rsquo;s a sign of self-focus. It can be a sign of high self-confidence and self-awareness. It can also be a sign of only focusing on one viewpoint.&nbsp;</p>\n<h3>Reframe I-focused View Point</h3>\n<p>People who moved in a positive direction wrote about their situation from multiple perspectives. Try to use&nbsp; &ldquo;he/she/they&rdquo;-oriented language before shifting back to &ldquo;I.&rdquo; This cycle represents the helpful ability to consider different viewpoints &ndash; and is a key factor in helping people process their most difficult experiences.</p>\n<p>If you are using I words to express negative thoughts, try to refer to yourself by a nickname instead. using the third person in self-talk can help you step back and think more objectively about your response and emotions, whether you&rsquo;re thinking about a past event or looking into the future. It can also help you reduce stress and anxiety.</p>",
    color: "#4b2a7e",
  },
  {
    Word: "my",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "First Pronoun",
    popup_feedback:
      "This indicates a viewpoint of your own. You may have high level of self-awareness.",
    Sidebar_feedback:
      "<p>&ldquo;I&rdquo;-focused language is used to describe one&rsquo;s own viewpoint. Pronouns tell us where people focus their attention. If someone uses the pronoun &ldquo;I,&rdquo; it&rsquo;s a sign of self-focus. It can be a sign of high self-confidence and self-awareness. It can also be a sign of only focusing on one viewpoint.&nbsp;</p>\n<h3>Reframe I-focused View Point</h3>\n<p>People who moved in a positive direction wrote about their situation from multiple perspectives. Try to use&nbsp; &ldquo;he/she/they&rdquo;-oriented language before shifting back to &ldquo;I.&rdquo; This cycle represents the helpful ability to consider different viewpoints &ndash; and is a key factor in helping people process their most difficult experiences.</p>\n<p>If you are using I words to express negative thoughts, try to refer to yourself by a nickname instead. using the third person in self-talk can help you step back and think more objectively about your response and emotions, whether you&rsquo;re thinking about a past event or looking into the future. It can also help you reduce stress and anxiety.</p>",
    color: "#4b2a7e",
  },
  {
    Word: "thankful",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "Positive Self-Talk",
    popup_feedback:
      "Make your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3><p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p><p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p><ul><li>Listening closely to your inner dialogues.&nbsp;</li><li>Write down important or frequent negative thoughts.</li><li>Be aware of the unbalanced, harmful thoughts.</li></ul><h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3><ul><li>Look back at the thoughts and reword them in a kinder, more positive light.</li><li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li><li>Writing down what you are grateful for.</li><li>Understanding the concept of impermanence and look into future in a positive way.</li><li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li></ul>",
    color: "#44aa38",
  },
  {
    Word: "grateful",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "Positive Self-Talk",
    popup_feedback:
      "Make your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3><p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p><p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p><ul><li>Listening closely to your inner dialogues.&nbsp;</li><li>Write down important or frequent negative thoughts.</li><li>Be aware of the unbalanced, harmful thoughts.</li></ul><h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3><ul><li>Look back at the thoughts and reword them in a kinder, more positive light.</li><li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li><li>Writing down what you are grateful for.</li><li>Understanding the concept of impermanence and look into future in a positive way.</li><li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li></ul>",
    color: "#44aa38",
  },
  {
    Word: "hopefully",
    wordnet_ext: [],
    phrase_ext: ["I wish", " I hope"],
    rewrite: null,
    rewrite_position: null,
    popup_title: "Positive Self-Talk",
    popup_feedback:
      "Make your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3><p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p><p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p><ul><li>Listening closely to your inner dialogues.&nbsp;</li><li>Write down important or frequent negative thoughts.</li><li>Be aware of the unbalanced, harmful thoughts.</li></ul><h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3><ul><li>Look back at the thoughts and reword them in a kinder, more positive light.</li><li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li><li>Writing down what you are grateful for.</li><li>Understanding the concept of impermanence and look into future in a positive way.</li><li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li></ul>",
    color: "#44aa38",
  },
  {
    Word: "I am capable of",
    wordnet_ext: [],
    phrase_ext: [
      "I am good enough",
      " I can make it",
      " I can do it",
      " I believe in myself",
      " I have confidence",
      " I am awesome",
    ],
    rewrite: null,
    rewrite_position: null,
    popup_title: "Positive Self-Talk",
    popup_feedback:
      "Make your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3><p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p><p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p><ul><li>Listening closely to your inner dialogues.&nbsp;</li><li>Write down important or frequent negative thoughts.</li><li>Be aware of the unbalanced, harmful thoughts.</li></ul><h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3><ul><li>Look back at the thoughts and reword them in a kinder, more positive light.</li><li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li><li>Writing down what you are grateful for.</li><li>Understanding the concept of impermanence and look into future in a positive way.</li><li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li></ul>",
    color: "#44aa38",
  },
  {
    Word: "can",
    wordnet_ext: [],
    phrase_ext: [
      "work on",
      " can try",
      " choose",
      " want to",
      " prefer to",
      " plan to",
      " would like to",
      " will fulfill",
      " will achieve",
      " will outcome",
      " I am going to",
      " I cannot wait to see",
      " I wish",
    ],
    rewrite: null,
    rewrite_position: null,
    popup_title: "Positive Self-Talk",
    popup_feedback:
      "Make your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3><p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p><p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p><ul><li>Listening closely to your inner dialogues.&nbsp;</li><li>Write down important or frequent negative thoughts.</li><li>Be aware of the unbalanced, harmful thoughts.</li></ul><h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3><ul><li>Look back at the thoughts and reword them in a kinder, more positive light.</li><li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li><li>Writing down what you are grateful for.</li><li>Understanding the concept of impermanence and look into future in a positive way.</li><li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li></ul>",
    color: "#44aa38",
  },
  {
    Word: "improve",
    wordnet_ext: [],
    phrase_ext: ["better"],
    rewrite: null,
    rewrite_position: null,
    popup_title: "Positive Self-Talk",
    popup_feedback:
      "Make your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3><p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p><p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p><ul><li>Listening closely to your inner dialogues.&nbsp;</li><li>Write down important or frequent negative thoughts.</li><li>Be aware of the unbalanced, harmful thoughts.</li></ul><h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3><ul><li>Look back at the thoughts and reword them in a kinder, more positive light.</li><li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li><li>Writing down what you are grateful for.</li><li>Understanding the concept of impermanence and look into future in a positive way.</li><li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li></ul>",
    color: "#44aa38",
  },
  {
    Word: "help",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "Positive Self-Talk",
    popup_feedback:
      "Make your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3><p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p><p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p><ul><li>Listening closely to your inner dialogues.&nbsp;</li><li>Write down important or frequent negative thoughts.</li><li>Be aware of the unbalanced, harmful thoughts.</li></ul><h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3><ul><li>Look back at the thoughts and reword them in a kinder, more positive light.</li><li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li><li>Writing down what you are grateful for.</li><li>Understanding the concept of impermanence and look into future in a positive way.</li><li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li></ul>",
    color: "#44aa38",
  },
  {
    Word: "therefore",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "Coherent narrative words",
    popup_feedback:
      "You will benefit from using these words to construct a coherent story, experience insights, and find a path forward.",
    Sidebar_feedback:
      '<h3>More About Insight Words and Coherent Narrative Words</h3>\n<p>People who write about things over and over in the same ways aren\'t getting any better. Evidence of a changed perspective can be found in the language people use. The more people use such cause-and-effect words as "realize" and "understand,"&nbsp; the more they appear to benefit. These words helped the writer construct a coherent story, experience insights, and find a path forward. Words such as "hence," "because" and "therefore" might also signal efforts to create a more coherent narrative out of fragmented stressful memories.</p>',
    color: "#44aa38",
  },
  {
    Word: "hence",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "Coherent narrative words",
    popup_feedback:
      "You will benefit from using these words to construct a coherent story, experience insights, and find a path forward.",
    Sidebar_feedback:
      '<h3>More About Insight Words and Coherent Narrative Words</h3>\n<p>People who write about things over and over in the same ways aren\'t getting any better. Evidence of a changed perspective can be found in the language people use. The more people use such cause-and-effect words as "realize" and "understand,"&nbsp; the more they appear to benefit. These words helped the writer construct a coherent story, experience insights, and find a path forward. Words such as "hence," "because" and "therefore" might also signal efforts to create a more coherent narrative out of fragmented stressful memories.</p>',
    color: "#44aa38",
  },
  {
    Word: "believe",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "Insight Words",
    popup_feedback:
      "You will benefit from using these words to construct a coherent story, experience insights, and find a path forward.",
    Sidebar_feedback:
      '<h3>More About Insight Words and Coherent Narrative Words</h3>\n<p>People who write about things over and over in the same ways aren\'t getting any better. Evidence of a changed perspective can be found in the language people use. The more people use such cause-and-effect words as "realize" and "understand,"&nbsp; the more they appear to benefit. These words helped the writer construct a coherent story, experience insights, and find a path forward. Words such as "hence," "because" and "therefore" might also signal efforts to create a more coherent narrative out of fragmented stressful memories.</p>',
    color: "#44aa38",
  },
  {
    Word: "understand",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "Insight Words",
    popup_feedback:
      "You will benefit from using these words to construct a coherent story, experience insights, and find a path forward.",
    Sidebar_feedback:
      '<h3>More About Insight Words and Coherent Narrative Words</h3>\n<p>People who write about things over and over in the same ways aren\'t getting any better. Evidence of a changed perspective can be found in the language people use. The more people use such cause-and-effect words as "realize" and "understand,"&nbsp; the more they appear to benefit. These words helped the writer construct a coherent story, experience insights, and find a path forward. Words such as "hence," "because" and "therefore" might also signal efforts to create a more coherent narrative out of fragmented stressful memories.</p>',
    color: "#44aa38",
  },
  {
    Word: "realize",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "Insight Words",
    popup_feedback:
      "You will benefit from using these words to construct a coherent story, experience insights, and find a path forward.",
    Sidebar_feedback:
      '<h3>More About Insight Words and Coherent Narrative Words</h3>\n<p>People who write about things over and over in the same ways aren\'t getting any better. Evidence of a changed perspective can be found in the language people use. The more people use such cause-and-effect words as "realize" and "understand,"&nbsp; the more they appear to benefit. These words helped the writer construct a coherent story, experience insights, and find a path forward. Words such as "hence," "because" and "therefore" might also signal efforts to create a more coherent narrative out of fragmented stressful memories.</p>',
    color: "#44aa38",
  },
  {
    Word: "think",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "Insight Words",
    popup_feedback:
      "You will benefit from using these words to construct a coherent story, experience insights, and find a path forward.",
    Sidebar_feedback:
      '<h3>More About Insight Words and Coherent Narrative Words</h3>\n<p>People who write about things over and over in the same ways aren\'t getting any better. Evidence of a changed perspective can be found in the language people use. The more people use such cause-and-effect words as "realize" and "understand,"&nbsp; the more they appear to benefit. These words helped the writer construct a coherent story, experience insights, and find a path forward. Words such as "hence," "because" and "therefore" might also signal efforts to create a more coherent narrative out of fragmented stressful memories.</p>',
    color: "#44aa38",
  },
  {
    Word: "lucky",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "Positive Self-Talk",
    popup_feedback:
      "Make your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3><p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p><p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p><ul><li>Listening closely to your inner dialogues.&nbsp;</li><li>Write down important or frequent negative thoughts.</li><li>Be aware of the unbalanced, harmful thoughts.</li></ul><h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3><ul><li>Look back at the thoughts and reword them in a kinder, more positive light.</li><li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li><li>Writing down what you are grateful for.</li><li>Understanding the concept of impermanence and look into future in a positive way.</li><li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li></ul>",
    color: "#44aa38",
  },
  {
    Word: "because",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "Coherent narrative words",
    popup_feedback:
      "You will benefit from using these words to construct a coherent story, experience insights, and find a path forward.",
    Sidebar_feedback:
      '<h3>More About Insight Words and Coherent Narrative Words</h3>\n<p>People who write about things over and over in the same ways aren\'t getting any better. Evidence of a changed perspective can be found in the language people use. The more people use such cause-and-effect words as "realize" and "understand,"&nbsp; the more they appear to benefit. These words helped the writer construct a coherent story, experience insights, and find a path forward. Words such as "hence," "because" and "therefore" might also signal efforts to create a more coherent narrative out of fragmented stressful memories.</p>',
    color: "#44aa38",
  },
  {
    Word: "Fortunately",
    wordnet_ext: [],
    phrase_ext: [],
    rewrite: null,
    rewrite_position: null,
    popup_title: "Positive Self-Talk",
    popup_feedback:
      "Make your inner dialogue to be more encouraging and uplifting!",
    Sidebar_feedback:
      "<h3>More About Self-Talk</h3><p>Self-talk is something you do naturally throughout your waking hours. Positive self-talk is supportive and affirming. Positive self-talk can help you improve your outlook on life. It can also have lasting positive health benefits, including improved well-being and a better quality of life.</p><p>Rumination is the flip side of positive self-talk. It happens when you replay upsetting or cringe-worthy thoughts or events over and over again in your head. Thinking through a problem can be useful, but if you spend a lot of time ruminating, small issues tend to snowball. Negative thoughts can grow and become self-defeating.</p><ul><li>Listening closely to your inner dialogues.&nbsp;</li><li>Write down important or frequent negative thoughts.</li><li>Be aware of the unbalanced, harmful thoughts.</li></ul><h3>Reframe Negative Self-Talk and Reinforce Positive Self-Talk</h3><ul><li>Look back at the thoughts and reword them in a kinder, more positive light.</li><li>Writing down statements with the growth mindset of accepting the current situation and feelings, and concrete actions to make things better or make you feel better.</li><li>Writing down what you are grateful for.</li><li>Understanding the concept of impermanence and look into future in a positive way.</li><li>Praise yourself when you write down positive self-talk! Try to think about what concrete actions you can take and let&rsquo;s move!</li></ul>",
    color: "#44aa38",
  },
];

let l1_dict = [
  {
    Word: "loser",
    rewrite: ["My inner value behind these is"],
    rewrite_position: "end",
  },
  {
    Word: "suck",
    rewrite: ["My inner value behind these is"],
    rewrite_position: "end",
  },
  {
    Word: "hate",
    rewrite: ["My inner value behind these is"],
    rewrite_position: "end",
  },
  {
    Word: "lazy",
    rewrite: ["My inner value behind these is"],
    rewrite_position: "end",
  },
  {
    Word: "the worst",
    rewrite: ["My inner value behind these is"],
    rewrite_position: "end",
  },
  {
    Word: "useless",
    rewrite: ["My inner value behind these is"],
    rewrite_position: "end",
  },
  {
    Word: "failure",
    rewrite: ["My inner value behind these is"],
    rewrite_position: "end",
  },
  {
    Word: "pathetic",
    rewrite: ["My inner value behind these is"],
    rewrite_position: "end",
  },
  {
    Word: "good-for-nothing",
    rewrite: ["My inner value behind these is"],
    rewrite_position: "end",
  },
  {
    Word: "dumb",
    rewrite: ["My inner value behind these is"],
    rewrite_position: "end",
  },
  {
    Word: "stupid",
    rewrite: ["My inner value behind these is"],
    rewrite_position: "end",
  },
  {
    Word: "sad",
    rewrite: [
      "I have these feelings maybe because I value ...",
      "I have these feelings maybe because I need ...",
      "I have these feelings maybe because I want ...",
      "I have these feelings maybe because I lack …",
      " Take a step back, I'm feeling like this because...",
      " I will feel better if ",
    ],
    rewrite_position: "end",
  },
  {
    Word: "depressed",
    rewrite: [
      "I have these feelings maybe because I value ...",
      "I have these feelings maybe because I need ...",
      "I have these feelings maybe because I want ...",
      "I have these feelings maybe because I lack …",
      " Take a step back, I'm feeling like this because...",
      " I will feel better if ",
    ],
    rewrite_position: "end",
  },
  {
    Word: "heartbreak",
    rewrite: [
      "I have these feelings maybe because I value ...",
      "I have these feelings maybe because I need ...",
      "I have these feelings maybe because I want ...",
      "I have these feelings maybe because I lack …",
      " Take a step back, I'm feeling like this because...",
      " I will feel better if ",
    ],
    rewrite_position: "end",
  },
  {
    Word: "heartbroken",
    rewrite: [
      "I have these feelings maybe because I value ...",
      "I have these feelings maybe because I need ...",
      "I have these feelings maybe because I want ...",
      "I have these feelings maybe because I lack …",
      " Take a step back, I'm feeling like this because...",
      " I will feel better if ",
    ],
    rewrite_position: "end",
  },
  {
    Word: "angry",
    rewrite: [
      "I have these feelings maybe because I value ...",
      "I have these feelings maybe because I need ...",
      "I have these feelings maybe because I want ...",
      "I have these feelings maybe because I lack …",
      " Take a step back, I'm feeling like this because...",
      " I will feel better if ",
    ],
    rewrite_position: "end",
  },
  {
    Word: "lonely",
    rewrite: [
      "I have these feelings maybe because I value ...",
      "I have these feelings maybe because I need ...",
      "I have these feelings maybe because I want ...",
      "I have these feelings maybe because I lack …",
      " Take a step back, I'm feeling like this because...",
      " I will feel better if ",
    ],
    rewrite_position: "end",
  },
  {
    Word: "panic",
    rewrite: [
      "I have these feelings maybe because I value ...",
      "I have these feelings maybe because I need ...",
      "I have these feelings maybe because I want ...",
      "I have these feelings maybe because I lack …",
      " Take a step back, I'm feeling like this because...",
      " I will feel better if ",
    ],
    rewrite_position: "end",
  },
  {
    Word: "worry",
    rewrite: [
      "I have these feelings maybe because I value ...",
      "I have these feelings maybe because I need ...",
      "I have these feelings maybe because I want ...",
      "I have these feelings maybe because I lack …",
      " Take a step back, I'm feeling like this because...",
      " I will feel better if ",
    ],
    rewrite_position: "end",
  },
  {
    Word: null,
    rewrite: ["When I say this, I mean..."],
    rewrite_position: "end",
  },
  {
    Word: null,
    rewrite: ["To explain it further ..."],
    rewrite_position: "end",
  },
  {
    Word: null,
    rewrite: ["A different point of view can be..."],
    rewrite_position: "end",
  },
  { Word: null, rewrite: ["To be specific,"], rewrite_position: "end" },
  {
    Word: null,
    rewrite: ["An example to support this is..."],
    rewrite_position: "end",
  },
  {
    Word: null,
    rewrite: ["Someone else may respond to this in a different way:"],
    rewrite_position: "end",
  },
  {
    Word: null,
    rewrite: ["The long-term implications of this can be..."],
    rewrite_position: "end",
  },
  {
    Word: "feel",
    rewrite: ["how do I feel about having these emotions?"],
    rewrite_position: "end",
  },
  {
    Word: "feel",
    rewrite: ["can I accept my feelings without judgment?"],
    rewrite_position: "end",
  },
  {
    Word: "feel",
    rewrite: [
      "Do I feel comfortable with expressing my emotions authentically? Why or why not?",
    ],
    rewrite_position: "end",
  },
  {
    Word: "feel",
    rewrite: [
      "I can write down more details separately about the event, my feelings, my opinions and evidences for/against my opinions as follows:",
    ],
    rewrite_position: "end",
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
      // if (dict_temp[i].words.indexOf(element.toLowerCase()) > -1) {
      if (dict_temp[i].Word === element.toLowerCase()) {
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

    // find matching words in dict
    const word_options = dict_temp.filter(
      (dict_entry) => dict_entry.Word === currentElement
    );
    // - put into array

    // choose at random from array and use that selection to populate previousElement.push(...)
    let chosen = word_options[getRandomInt(word_options.length)];

    // let obj_filt = dict_temp.filter(
    //   (entry) =>
    //     entry.strategy_code === categories[index].strategy_code &&
    //     entry.category_number === categories[index].category_number
    // )[0];

    previousElement.push({
      // maybe add normalization marker here?
      search_coords: search_coords,
      word: currentElement,
      color: chosen.color,
      // title: obj_filt.semantic_anchor,
      popup_title: chosen.popup_title,
      sidebar_title: chosen.sidebar_title,
      popup_feedback: chosen.popup_feedback,
      Sidebar_feedback: chosen.Sidebar_feedback,
      rewrite: chosen.rewrite,
      rewrite_position: chosen.rewrite_position,
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
  closeRightBar();
  closeNewPopup();

  console.log("highlighting text");
  console.log("placeholder_active", placeholder_active);
  // if (placeholder_active) {
  // closePH_lose();
  // }
  // cleanMarks();

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
  document.querySelector(".target-cont").innerHTML = contents.Sidebar_feedback;
  document.getElementById("rightsidebar").style.right = "0px";

  logSidebar(contents);

  let b_rewrite = false;
  console.log("in sidebar-contents ", contents);
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
  let rightbar = document.getElementById("rightsidebar");
  if (rightbar) {
    rightbar.style.right = "-300px";
  }

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
  switch (contents.rewrite_position.toLowerCase()) {
    // for L1
    case "end":
      // check if need to add space or not.
      // get end cursor
      let last_char = cm.getRange(
        {
          line: contents.search_coords.line,
          ch: contents.search_coords.ch - 1,
        },
        contents.search_coords
      );

      let rewrite_offset = 0;

      if (last_char !== " ") {
        console.log("B: ", last_char);
        // setup rewrite to add space beginning
        rewrite_content = " " + rewrite_content;
        rewrite_offset++;
      }

      cm.replaceRange(rewrite_content + " ", contents.search_coords);
      cm_placeholder = cm.markText(
        {
          line: contents.search_coords.line,
          ch: contents.search_coords.ch + rewrite_offset,
        },
        {
          line: contents.search_coords.line,
          ch:
            contents.search_coords.ch + rewrite_offset + rewrite_content.length,
        },
        { className: "placeholder", atomic: toggleAtomic }
      );

      cm.focus();
      cm.setCursor({
        line: contents.search_coords.line,
        ch: contents.search_coords.ch + rewrite_offset,
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
      if (rewrite_offset === 1) {
        suggestion = rewrite_content.slice(1);
      } else {
        suggestion = rewrite_content;
      }
      delta_edits_suggestion = "";
      suggestion_cursor = 0;

      break;

    case "after":
      period_cords = null;
      period_cords = findPeriod(contents);

      if (period_cords == null) {
        // no period after target word. Set target ch = line.length;
        let linelength = cm.getLine(contents.search_coords.from.line).length;
        period_cords = {
          line: contents.search_coords.from.line,
          ch: linelength,
        };
      }

      // add space
      // cm.replaceRange(" ", period_cords);

      // console.log("period_cords", period_cords);
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

    result = cursor.to();
    if (cursor.to().line !== contents.search_coords.from.line) {
      result = null;
    }
  } catch (e) {
    console.log("error in findPeriod search", e);
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
  console.log("called dismiss Placeholder");
  console.log("placeholder_active", placeholder_active);

  if (!placeholder_active) {
    return;
  }

  cm.doc.getAllMarks().forEach((marker) => {
    console.log("marker", marker);
    let marker_cords = marker.find();
    if (marker.className === "placeholder") {
      cm.replaceRange("", marker_cords.from, marker_cords.to);
    }
  });

  if (document.querySelector("button.L2Button").textContent === "Analysis on")
    manualAnalyzeTrigger(true);

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
  initialization();
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
  dismisslist = [];
  word_counter = {}; // <--- dict needed to capture right place of word.
  global_feedback = [];
  dismissPlaceholder();
  closeNewPopup();
  clearSquares();
  closeRightBar();
  // initialization();
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
  toggleLog = data["toggleLog"];
  popupLog = data["popupLog"];
  sidebarLog = data["sidebarLog"];
  dismissLog = data["dismissLog"];
  acceptLog = data["acceptLog"];
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
  if (placeholder_active) {
    // console.log("cleanmarks , closing ph lose");
    noEdit = true;
    closePH_lose();
  }

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
  // console.log("before change,", changeObj);

  // sends changeObj unaltered.
  if (noEdit) {
    console.log("beforechange noedit. bypassing");
    // return;
  }

  // on tab (for L1)
  if (changeObj.text[0] === "\t") {
    changeObj.cancel();
  }

  if (
    placeholder_active &&
    before_change_flag &&
    changeObj.origin !== "+delete"
  ) {
    // insert-like input
    console.log("beforeChange: insert-like input");
    changeObj.cancel();
    newEdit(changeObj);
  }

  // Re-adding placeholder letters
  if (
    placeholder_active &&
    before_change_flag &&
    changeObj.origin === "+delete"
  ) {
    console.log("beforeChange: readding PH letter");
    backspacePlaceholder(changeObj);
  }
});

// USE FLAG TO AVOID INFINITE LOOP
function newEdit(prevChangeObj) {
  // console.log("in new edit, prevChangeObj", prevChangeObj);
  before_change_flag = false;

  cm.replaceRange(prevChangeObj.text[0], prevChangeObj.from, {
    line: prevChangeObj.from.line,
    ch: prevChangeObj.from.ch + 1,
  });

  setTimeout(() => {
    before_change_flag = true;
  }, 2);
}

let redo_placeholder = false;

function backspacePlaceholder(prevChangeObj) {
  // catch if deleting at invocation to dismiss - or if not even active
  if (suggestion_cursor === 0 || !placeholder_active) {
    before_change_flag = false;
    closePH_lose();
    return;
  }

  // check if it was deleted by querying mark
  let markPresentFlag = false;
  cm.doc.getAllMarks().forEach((marker) => {
    if (marker.className === "placeholder") {
      markPresentFlag = true;
    }
  });

  if (!markPresentFlag) {
    console.log("!!!breaking backspace placeholder");
    // resetPHStates();
    closePH_lose();
    return;
  }

  suggestion_cursor--;
  before_change_flag = false;

  console.log("---replacing w ", suggestion[suggestion_cursor]);
  redo_placeholder = true;
  noEdit = true;
  cm.replaceRange(suggestion[suggestion_cursor], prevChangeObj.to);

  setTimeout(() => {
    before_change_flag = true;
    noEdit = false;
    redo_placeholder = false;
  }, 2);

  cm.doc.getAllMarks().forEach((marker) => {
    let marker_cords = null;
    if (marker.className === "placeholder") {
      marker_cords = marker.find();
      marker.clear();
    }
    //

    try {
      cm.getDoc().setCursor(prevChangeObj.from.line, prevChangeObj.from.ch);
      cm.markText(
        { line: marker_cords.from.line, ch: marker_cords.from.ch - 1 },
        marker_cords.to,
        {
          className: "placeholder",
          atomic: toggleAtomic,
        }
      );
    } catch (error) {
      if (error instanceof TypeError) {
        console.log("typeerror in backspace ph");
      }
    }

    // noEdit = false;
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
  typo_counter = 0;
  suggestion = "";
}

cm.on("change", function (cm, changeObj) {
  // console.log("change-redo_placeholder", redo_placeholder);

  if (L1timer.active) {
    console.log("resetting timer");
    L1timer.reset(L1interval * 1000);
  }

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
    if (redo_placeholder) {
      console.log("--------------------------------------redo -bypassong");
      return;
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

      console.log(
        "hit typo",
        input[0],
        "-- target:",
        suggestion[suggestion_cursor]
      );
      console.log("sugg:", suggestion);
      console.log("typo_counter", typo_counter);

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

var L1interval = 5; // seconds
// var L1interval_ID = null;

function L1autoController() {
  // handle on and off states
  let temp = document.querySelector("button.L1ButtonAuto");
  if (temp.textContent === "Auto Expressiveness off") {
    temp.textContent = "Auto Expressiveness on";
    temp.style.opacity = 0.8;
    L1timer.start();
  } else {
    temp.textContent = "Auto Expressiveness off";
    before_change_flag = false;
    closePH_lose();
    temp.style.opacity = 0.3;
    L1timer.stop();
  }
  // should have a time off parameter
  // timer should reset at each edit
}

class Timer {
  constructor(fn, t) {
    var timerObj = setInterval(fn, t);
    this.active = true;

    this.stop = function () {
      if (timerObj) {
        clearInterval(timerObj);
        timerObj = null;
        this.active = false;
      }
      return this;
    };

    // this.active = function () {
    //   if (timerObj) {
    //     return true;
    //   } else {
    //     false;
    //   }
    // };

    // start timer using current settings (if it's not already running)
    this.start = function () {
      if (!timerObj) {
        this.stop();
        timerObj = setInterval(fn, t);
        this.active = true;
      }
      return this;
    };

    // start with new or original interval, stop current interval
    this.reset = function (newT = t) {
      t = newT;
      this.active = true;
      return this.stop().start();
    };
  }
}
var L1timer = new Timer(triggerL1, L1interval * 1000);
L1timer.stop();

// to be used with the actual dictionary - called via keypress
function triggerL1() {
  console.log("inside triggerL1");

  if (placeholder_active) {
    return;
  }

  let temp = document.querySelector("button.L1Button");
  temp.style.opacity = 0.8;
  temp.style.animationDuration = "5s";
  setTimeout(() => {
    temp.style.opacity = 0.3;
    temp.style.animationDuration = "1s";
  }, 100);

  // read last sentence and check if any of the L1 keywords are included
  let shuffled_l1_dict = shuffleArray(l1_dict);

  let sentence = isolateCurrentSentence();
  let found = shuffled_l1_dict.find((o) => sentence.includes(o.Word)); // want the object

  if (found) {
    console.log("found:", found);
    // reprogramming options:
    let n_options = found.rewrite.length; // arr
    let random_selection = getRandomInt(n_options);

    let end_line = cm.getDoc().lastLine();
    let end_ch = cm.getLine(end_line).length;
    triggerRewrite({
      search_coords: { line: end_line, ch: end_ch },
      rewrite: [found.rewrite[random_selection]],
      rewrite_position: "end",
    });

    // if yes, map with relevant suggestive text
  } else {
    // else, choose from the null ones
    console.log("not found, using null options");
    let l1_options = shuffled_l1_dict
      .filter((entry) => entry.Word === null)
      .map((el) => el.rewrite[0]);
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
  // if analysis is on
  if (document.querySelector("button.L2Button").textContent === "Analysis on")
    manualAnalyzeTrigger(true);
  // could make L2 popup move here to follow text
});

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

// saving json -----------------------------------------------------
function generateFile() {
  console.log("calling generateFile");
  generatePackOne();
}

function generatePackRecall(file) {
  console.log("in pack recall2");
  console.log(file);
  download(JSON.stringify(file), "report.json");
}
