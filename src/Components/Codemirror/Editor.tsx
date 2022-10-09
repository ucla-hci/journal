/**
 * reference: https://www.bayanbennett.com/posts/failing-to-add-codemirror-6-and-then-succeeding-devlog-004/
 *            https://codesandbox.io/s/codemirror6-t9ywwc?file=/src/index.js && https://discuss.codemirror.net/t/how-to-listen-to-changes-for-react-controlled-component/4506/4
 */

import React from "react";
import { EditorView } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";

import { onChange } from "./cmhelpers";
import { keymaps } from "./keymaps";
// import { updatelisteners } from "./updatelisteners";

let myTheme = EditorView.theme(
  {
    "&": {
      color: "var(--fontcollight)",
      backgroundColor: "var(--bgcollight)",
      width: "100%",
      height: "100%",
      textAlign: "left",
    },
    ".cm-content": {
      caretColor: "#0e9",
      border: "var(--borderdebug) cyan",
      fontFamily: "'Roboto Mono', monospace",
    },
    "&.cm-focused .cm-cursor": {
      // borderLeftColor: "2px solid var(--fontcollight)",
      border: "1px solid var(--fontcollight)",
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "#074",
      border: "2px solid yellow",
    },
    ".cm-gutters": {
      backgroundColor: "var(--bgcolmid)",
      color: "var(--bgcolshadow)",
      border: "2px solid magenta",
    },
  },
  { dark: true }
);

const state = EditorState.create({
  doc: "type here...",
  extensions: [
    // updatelisteners,
    keymaps,
    javascript(),
    myTheme,
    EditorView.updateListener.of(({ state }) => {
      onChange({
        text: state.doc.toString(),
        selection: state.selection,
        full: state,
      });
    }),
  ],
});

interface editorProps {
  setView: React.Dispatch<React.SetStateAction<EditorView | null>>;
}

export function Editor({ setView }: editorProps) {
  const editorRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (editorRef.current === null) return;

    const view = new EditorView({
      state: state,
      parent: editorRef.current,
    });

    setView(view);

    return () => {
      view.destroy();
      setView(null);
    };
  }, []);

  return (
    <div
      style={{
        border: "var(--borderdebug) green",
        width: "100%",
        height: "100%",
        backgroundColor: "var(--bgcollighter)",
      }}
    >
      <button className="hl-button">highlight</button>
      <button className="save-button">save</button>
      <section
        ref={editorRef}
        style={{
          border: "5px solid var(--highlight2)",
          width: "100%",
          height: "94.6%",
          // -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
          // -moz-box-sizing: border-box;    /* Firefox, other Gecko */
          boxSizing: "border-box" /* Opera/IE 8+ */,
        }}
      />
    </div>
  );
}
