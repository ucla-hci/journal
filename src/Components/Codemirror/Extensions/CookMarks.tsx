import { Tooltip, showTooltip, EditorView } from "@codemirror/view";
import { StateField, EditorState } from "@codemirror/state";
import { Searcher, ExtendedSearchResult } from "../cmhelpers";
import { db } from "../../Dexie/db";

async function togglePopup(item: ExtendedSearchResult, event: MouseEvent) {
  try {
    const arr = await db.popups.toArray();
    if (arr.length === 0) {
      // create item
      const id = await db.popups.add({
        title: item.popupcontent.title,
        content: item.popupcontent.content,
        display: true,
        location: { x: event.clientX, y: event.clientY },
      });
      // console.log("added new popup with id", id);
    } else {
      const ret = await db.popups.update(1, {
        title: item.popupcontent.title,
        content: item.popupcontent.content,
        location: { x: event.clientX, y: event.clientY },
        display: !arr[0].display,
      });
      console.log("popup updated, return:", ret);
    }
  } catch (error) {
    console.log(`Failed to add new popup: ${error}`);
  }
}

async function loadSidebar(item: ExtendedSearchResult) {
  try {
    const arr = await db.sidebars.toArray();
    console.log("sidebars get array", arr);
    if (arr.length === 0) {
      const id = await db.sidebars.add({
        title: item.sidebarcontent.title,
        content: item.sidebarcontent.content,
        display: false,
      });
    } else {
      const ret = await db.sidebars.update(1, {
        title: item.sidebarcontent.title,
        content: item.sidebarcontent.content,
      });
    }
  } catch (error) {
    console.log(`Failed to add new sidebar: ${error}`);
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
  create: getCursorTooltips,

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
        };

        dom.className = "cm-tooltip-cursor " + index;
        dom.style.backgroundColor = item.color;

        return { dom };
      },
    };
  });
}

export function cursorTooltip() {
  return [cursorTooltipField, cursorTooltipBaseTheme];
}
