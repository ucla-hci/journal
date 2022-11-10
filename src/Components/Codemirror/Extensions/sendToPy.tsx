import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";

import { postcontents } from "../../../resthelpers";

// const addUnderline =
export function sendToPy(view: EditorView) {
  postcontents(view.state.doc);
  return false;
}
