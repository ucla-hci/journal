import { EditorView, keymap } from "@codemirror/view";
import { sendToPy } from "./Extensions/sendToPy";
import { db } from "../Dexie/db";
import { L1_dict } from "../expressoDictionary";
import { SearchQuery, SearchCursor } from "@codemirror/search";

export const keymaps = keymap.of([
  {
    key: "Escape",
    preventDefault: true,
    run: () => {
      db.placeholders.update(1, { active: false });
      return true;
    },
  },
  {
    key: "Control-Space",
    preventDefault: true,
    run: (view: EditorView) => {
      toggleSuggestion(view);
      return true;
    },
  },
  {
    key: "Mod-p",
    preventDefault: true,
    run: sendToPy,
  },
]);

// temporary hardcoded values --> replace with L1 prompts. use view to select appropriate ones
async function toggleSuggestion(view: EditorView) {
  // get last sentence
  var text = view.state.toString();
  const doclength = text.length;

  let q = new SearchQuery({ search: "[.?!]+", regexp: true });
  var searchcursor = q.getCursor(view.state.doc).next() as SearchCursor;
  let searchresults = [];

  while (!searchcursor.done) {
    searchresults.push(searchcursor.value);
    searchcursor.next();
  }
  searchresults = searchresults.reverse().map((val) => val.to);

  var lastsentence = text;

  if (searchresults.length > 2) {
    if (doclength - searchresults[0] > 40) {
      lastsentence = text.slice(doclength - 40);
    }
  }

  // TODO: checks to ensure beginning prompts are suitable
  // TODO: include trigger word matching.

  let filteredL1_dict = L1_dict.filter((val) => {
    if (val.Word === null) {
      // missing targeted ones.
      return true;
    }

    return false;
  });

  let suggestionList =
    filteredL1_dict[Math.floor(Math.random() * filteredL1_dict.length)];
  let suggestion =
    suggestionList.rewrite[
      Math.floor(Math.random() * suggestionList.rewrite.length)
    ];
  console.log("expressiveness suggestion:", suggestion);

  const res = await db.placeholders.get(1);
  if (res !== undefined) {
    // update

    await db.placeholders.update(1, {
      active: true,
      suggestion: suggestion,
      location: view.state.doc.length,
    });
  } else {
    //add
    await db.placeholders.add({
      id: 1,
      active: true,
      suggestion: suggestion,
      location: view.state.doc.length,
    });
  }
  return;
}
