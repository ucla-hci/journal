/**
 * Extension that will prepare and provide the analysis marks
 * - Also, populates the sidebar and placeholder
 */

import { Tooltip, showTooltip, EditorView } from "@codemirror/view";
import { StateField, EditorState } from "@codemirror/state";
import { Searcher, ExtendedSearchResult } from "../cmhelpers";
import { db } from "../../Dexie/db";

async function togglePopup(item: ExtendedSearchResult, event: MouseEvent) {
  try {
    const ret = await db.popups.get(1);
    if (ret === undefined) {
      // create item
      await db.popups.add({
        id: 1,
        title: item.popupcontent.title,
        content: item.popupcontent.content,
        display: true,
        location: { x: event.clientX, y: event.clientY },
      });
      // console.log("added new popup with id", id);
    } else {
      await db.popups.update(1, {
        title: item.popupcontent.title,
        content: item.popupcontent.content,
        display: true,
        location: { x: event.clientX, y: event.clientY },
      });
    }
  } catch (error) {
    console.log(`Failed to add new popup: ${error}`);
  }
}

async function loadSidebar(item: ExtendedSearchResult) {
  try {
    const ret = await db.sidebars.get(1);
    // console.log("sidebars get array", arr);
    if (ret === undefined) {
      await db.sidebars.add({
        id: 1,
        title: item.sidebarcontent.title,
        content: item.sidebarcontent.content,
        display: false,
        rephrase: item.sidebarcontent.rephrase,
      });
    } else {
      console.log("updating sidebar");
      await db.sidebars.update(1, {
        title: item.sidebarcontent.title,
        content: item.sidebarcontent.content,
        display: false,
        rephrase: item.sidebarcontent.rephrase,
      });
    }
  } catch (error) {
    console.log(`Failed to add sidebar content: ${error}`);
  }
}

async function loadPlaceholder(item: ExtendedSearchResult) {
  if (item.placeholdercontent.suggestion === null) {
    console.log("in loadPlaceholder, but siggestion is null", item);
    return;
  }
  console.log("about to push ph with", item.placeholdercontent);

  try {
    // ph
    const ret = await db.placeholders.get(1);
    console.log("return get id 1", ret);
    if (ret === undefined) {
      // add
      db.placeholders.add({
        id: 1,
        origin: "L3",
        active: false,
        suggestion: item.placeholdercontent.suggestion,
        location: item.placeholdercontent.location,
        replace: item.placeholdercontent.replace,
      });
    } else {
      // update
      await db.placeholders.update(1, {
        active: false,
        origin: "L3",
        suggestion: item.placeholdercontent.suggestion,
        location: item.placeholdercontent.location,
        replace: item.placeholdercontent.replace,
      });
    }
  } catch (error) {
    console.log(`Failed to add placeholder content ${error}`);
  }
}

const cursorTooltipBaseTheme = EditorView.baseTheme({
  ".cm-tooltip.cm-tooltip-cursor": {
    backgroundColor: "#22b",
    color: "white",
    border: "none",
    padding: "2px 6px",
    borderRadius: "6px",
    height: "6px",
    cursor: "pointer",
    position: "relative",
    marginRight: "8px",
    marginTop: "8px",
    zIndex: 1,
    "&:hover": {
      backgroundColor: "#bfb",
    },
  },
});

export const cursorTooltipField = StateField.define<readonly Tooltip[]>({
  create(state) {
    return getCursorTooltips(state);
  },

  update(tooltips, tr) {
    if (!tr.docChanged && !tr.selection) return tooltips; // if unchanged, return prev
    return getCursorTooltips(tr.state); // if change, recompute
  },

  provide: (f) => showTooltip.computeN([f], (state) => state.field(f)),
});

function getCursorTooltips(state: EditorState): readonly Tooltip[] {
  var s = new Searcher({ state: state });
  var searchresults = s.searchDict();

  return searchresults.map((item, index) => {
    return {
      pos: item.range.to,
      above: true,
      strictSide: true,
      arrow: false,
      create: () => {
        let dom = document.createElement("div"); // create popup
        dom.onclick = function (event) {
          // alternatively, could post state to dexie!
          togglePopup(item, event);
          loadSidebar(item);
          if (item.placeholdercontent.suggestion !== null) {
            console.log("loading placeholder", item.placeholdercontent);
            loadPlaceholder(item);
          }
        };

        dom.className = "cm-tooltip-cursor " + index;
        dom.style.backgroundColor = item.color;

        return { dom };
      },
    };
  });
}

export function cursorTooltip() {
  // db.sidebars.update(1, { display: false, content: {} });
  return [cursorTooltipField, cursorTooltipBaseTheme];
}
