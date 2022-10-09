import { keymap } from "@codemirror/view";
import { underlineSelection } from "./Extensions/highlighter";
import { highlightSearch } from "./updatelisteners";

export const keymaps = keymap.of([
  {
    key: "Mod-s",
    preventDefault: true,
    // run: underlineSelection,
    run: highlightSearch,
  },
]);
