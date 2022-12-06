import { EditorView, keymap } from "@codemirror/view";
import { Annotation } from "@codemirror/state";
import { sendToPy } from "./Extensions/sendToPy";
import { db, Placeholder } from "../Dexie/db";
import { L1_dict, dev_dict } from "../expressoDictionary";

export const keymaps = keymap.of([
  {
    key: "Escape",
    preventDefault: true,
    run: (view) => {
      db.placeholders.update(1, {
        active: false,
        origin: "L1",
        triggerword: null,
        replace: null,
      });
      view.dispatch({ annotations: annotation1.of("esc") });
      return true;
    },
  },
  {
    key: "Control-Space",
    preventDefault: true,
    run: (view: EditorView) => {
      // check if L1 or L3
      let current = db.placeholders.get(1).then((res) => {
        if (res?.origin === "L3") {
          console.log("ctrl space on l3");
          togglePlaceholder(view, "L3", res);
        } else {
          console.log("ctrl space on l1");
          togglePlaceholder(view, "L1", res!);
        }
      });
      setTimeout(() => db.placeholders.update(1, { active: true }), 10);
      return true;
    },
  },
  {
    key: "Control-`",
    preventDefault: true,
    run: (view: EditorView) => {
      console.log("control `!");
      return false;
    },
  },
  {
    key: "Mod-p",
    preventDefault: true,
    run: sendToPy,
  },
]);

// MOVE TO CMHELPERS
export async function togglePlaceholder(
  view: EditorView,
  type: "L1" | "L3",
  prevPh: Placeholder
) {
  if (type === "L3") {
    // ----------------------------------------------------------------------------------------------------- toggling L3 options
    // const res = await db.placeholders.get(1);
    let prevsuggestion = prevPh?.suggestion!;
    let triggerword = prevPh?.triggerword!;

    // search alternative replace based on same triggerword
    let filtereddict = dev_dict.filter((entry) =>
      entry.words.includes(triggerword.toLowerCase())
    );
    console.log("filtered dict size", filtereddict.length);
    let possiblesuggestions = filtereddict[0].rewrite!;
    possiblesuggestions = possiblesuggestions.filter((entry) => {
      return entry === prevsuggestion ? false : true;
    });
    let newsuggestion =
      possiblesuggestions[
        Math.floor(Math.random() * possiblesuggestions.length)
      ];

    await db.placeholders.update(1, {
      active: true,
      origin: "L3",
      triggerword: triggerword,
      suggestion: newsuggestion,
      location: view.state.doc.length,
    });
    return;
  } else {
    // -------------------------------------------------------------------------------------------------- L1 options
    if (prevPh?.active === false) {
      console.log("on create suggestion L1");
      // ------------------------------------------------------------------------------------------------ Create suggestion
      // using only words from last two lines
      let text = view.state.doc.toJSON().slice(-2);
      let lastwords = [] as string[];
      for (let i = 0; i < text.length; i++) {
        let line = text[i];
        line.split(/[.?!]+/).forEach(function (sentence) {
          if (sentence.length > 3) {
            sentence.split(" ").forEach(function (word) {
              if (word.length > 0) {
                lastwords.push(word);
              }
            });
          }
        });
      }

      let filteredwords = lastwords
        .filter(
          (word) =>
            L1_dict.filter((w) => w.Word === word.toLowerCase()).length > 0
        )
        .reverse();

      // console.log("filteredwords post dict filter", filteredwords);

      let availableoptions = [] as typeof L1_dict;
      let triggerw = null as null | string;
      if (filteredwords.length === 0) {
        // use NULL matching
        availableoptions = L1_dict.filter((entry) => entry.Word === null);
      } else {
        // use the first word in filteredwords
        availableoptions.push(
          L1_dict.find((entry) => entry.Word === filteredwords[0])!
        );
        triggerw = filteredwords[0];
      }
      console.log("availableoptions[0]", availableoptions[0]);

      if (prevPh !== undefined) {
        // update

        await db.placeholders.update(1, {
          active: true,
          origin: "L1",
          triggerword: triggerw,
          suggestion: availableoptions[0].rewrite[0],
          location: view.state.doc.length,
        });
      } else {
        //add
        await db.placeholders.add({
          id: 1,
          active: true,
          origin: "L1",
          triggerword: triggerw,
          suggestion: availableoptions[0].rewrite[0],
          location: view.state.doc.length,
          replace: null,
        });
      }
    } else {
      // ------------------------------------------------------------------------------------------------ toggle
      let prevsuggestion = prevPh?.suggestion!;
      let triggerw = prevPh?.triggerword;

      let availableoptions = [] as typeof L1_dict;
      let targetsuggestion: string;

      if (triggerw === null || triggerw === undefined) {
        availableoptions = L1_dict.filter((entry) => entry.Word === null);
      } else {
        availableoptions = L1_dict.filter(
          (entry) => entry.Word === triggerw!.toLowerCase()
        );
      }

      let suggestions = [] as string[];
      availableoptions.forEach((opt) => suggestions.push(...opt.rewrite));
      suggestions = suggestions.filter((val) => val !== prevsuggestion);
      console.log("suggestionsize", suggestions.length);
      if (suggestions.length <= 1) {
        targetsuggestion = prevsuggestion;
      } else {
        targetsuggestion =
          suggestions[Math.floor(Math.random() * suggestions.length)];
      }

      console.log("TARGET SUGGESTION ON TOGGLE", targetsuggestion);

      const res = await db.placeholders.get(1);
      if (res !== undefined) {
        // update

        await db.placeholders.update(1, {
          active: true,
          origin: "L1",
          triggerword: triggerw,
          suggestion: targetsuggestion,
          location: view.state.doc.length,
        });
      } else {
        //add
        await db.placeholders.add({
          id: 1,
          active: true,
          origin: "L1",
          triggerword: triggerw!,
          suggestion: targetsuggestion,
          location: view.state.doc.length,
          replace: null,
        });
      }
    }
  }

  return;
}

export const annotation1 = Annotation.define();
