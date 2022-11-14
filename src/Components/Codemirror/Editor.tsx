/**
 * reference: https://www.bayanbennett.com/posts/failing-to-add-codemirror-6-and-then-succeeding-devlog-004/
 *            https://codesandbox.io/s/codemirror6-t9ywwc?file=/src/index.js && https://discuss.codemirror.net/t/how-to-listen-to-changes-for-react-controlled-component/4506/4
 *
 *
 */

import React, { useEffect, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import { EditorSelection, EditorState, Extension } from "@codemirror/state";

import { keymaps } from "./keymaps";
import { db, Note, Placeholder } from "../Dexie/db";
import { IndexableType } from "dexie";

import "./Editor.css";
import { cursorTooltip, cursorTooltipField } from "./Extensions/CookMarks";

import { history } from "@codemirror/commands";

import { toggleWith } from "./Extensions/toggleWith";
import { setSuggestionFacet } from "./Extensions/facets";

import { placeholders } from "./Extensions/phViewPlugin";
import { useLiveQuery } from "dexie-react-hooks";
import { debounce } from "lodash";
import { timeChecker } from "./Extensions/checkPauses";

let myTheme = EditorView.theme(
  {
    "&": {
      color: "rgba(1,1,1,0.9)",
      width: "100%",
      height: "100%",
      textAlign: "left",
    },
    ".cm-content": {
      caretColor: "#f00",
      fontFamily: "'Roboto Mono', monospace",
      fontSize: "18px",
    },
    "&.cm-focused .cm-cursor": {
      border: "1px solid var(--fontcollight)",
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "#074",
    },
    ".cm-gutters": {
      backgroundColor: "var(--bgcolmid)",
      color: "var(--bgcolshadow)",
    },
    ".cm-atomic": {
      backgroundColor: "cornsilk",
    },
  },
  { dark: false }
);

interface editorProps {
  setView: React.Dispatch<React.SetStateAction<EditorView | null>>;
  currentNote: Number | null;
}

export function Editor({ setView, currentNote }: editorProps) {
  const editorRef = useRef<HTMLElement>(null);
  const [fetchedNote, setfetchedNote] = useState<Note | undefined>(undefined);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [showSave, setShowSave] = useState<boolean>(false);
  const [marksActive, setMarksActive] = useState<boolean>(false);
  const [nanalyses, setNanalyses] = useState<number>(0);

  //placeholderstuff
  const [suggestion, setSuggestion] = useState<Placeholder | null>(null);
  const [noteLength, setNoteLength] = useState<number>(0);
  const [placeholderActive, setPlaceholderActive] = useState<boolean>(false);

  // persist through editor reconfig
  const [cursor, setCursor] = useState<number>(0);

  const fetchNote = async () => {
    if (currentNote === null) return;
    var response = await db.notes.get(currentNote!);
    if (response !== undefined) {
      setfetchedNote(response);
      setNoteLength(response.content.length);
    }
  };

  useLiveQuery(async () => {
    const res = await db.placeholders.get(1);
    if (res !== undefined) {
      console.log("livequery setting suggestion");
      setSuggestion(res);
      setPlaceholderActive(res.active);
    }
  });

  function getLocation() {
    if (placeholderActive) {
      return suggestion!.location;
    } else {
      if (cursor === 0) {
        return noteLength;
      } else {
        return cursor;
      }
    }
  }

  React.useEffect(() => {
    console.log("setting cursor");
  }, [cursor]);

  // 1. Fetch contents
  React.useEffect(() => {
    fetchNote().catch(console.error);
    setMarksActive(false);
  }, [currentNote, placeholderActive, suggestion]);

  // 2. After contents have loaded, remake the editor
  React.useEffect(() => {
    if (editorRef.current === null) return;
    if (fetchedNote === undefined) return;

    setTitle(fetchedNote?.title);

    const state = EditorState.create({
      doc: fetchedNote?.content,
      selection: {
        anchor: getLocation(),
      }, // auto cursor at end of notes
      extensions: [
        // base ------------------------------------------------------------
        myTheme,
        history(),
        EditorView.lineWrapping,

        // custom for expresso ------------------------------------------------
        toggleWith("Mod-o", cursorTooltip(), setMarksActive), // toggles marks
        keymaps,
        placeholderActive
          ? setSuggestionFacet({
              target: suggestion!.suggestion,
              from: suggestion!.location,
              to: suggestion!.suggestion.length,
            })
          : [],
        // display ph
        placeholderActive ? placeholders : [],

        // use dom handlers to check for pauses
        timeChecker(fetchedNote),

        // onchange listener ------------------------------------------------
        EditorView.updateListener.of(({ state, view, changes }) => {
          setCursor(state.selection.ranges[0].to);
          let field = state.field(cursorTooltipField, false);
          if (field) {
            setNanalyses(field.length);
          }
          saveNoteContents(state.doc.toString());
          setNoteLength(state.doc.length);
        }),
      ],
    });

    const view = new EditorView({
      state: state,
      parent: editorRef.current,
    });

    view.focus();

    setView(view);

    return () => {
      view.destroy();
      setView(null);
    };
  }, [fetchedNote]);

  function handleTitleChange(e: React.FormEvent<HTMLInputElement>) {
    let newtitle: string = (e.target as HTMLInputElement).value;
    setTitle(newtitle);
    saveTitle(newtitle);
  }

  const saveNoteContents = async (notetext: string) => {
    await db.notes.update(currentNote! as IndexableType, {
      content: notetext,
      lastedit: Date.now(),
    });
    setShowSave(true);
  };

  // ------------------------------------------------------------------------------- on debounced save, we get bugs since we're using
  //                                                                                 indexed db for part of the state
  // const saveNoteContents = debounce(async (notetext: string) => {
  //   await db.notes.update(currentNote! as IndexableType, { content: notetext });
  //   setShowSave(true);
  // }, 1000);

  const saveTitle = debounce(async (newtitle: string) => {
    await db.notes.update(currentNote! as IndexableType, { title: newtitle });
  }, 1000);

  useEffect(() => {
    if (showSave) {
      setTimeout(() => {
        setShowSave(false);
      }, 1000);
    }
  }, [showSave]);

  return (
    <div
      style={{
        margin: "0 22vw 10px 30px",
        width: "auto",
        height: "90%",
      }}
    >
      <div className="notifiers">
        {showSave ? <p>Saving</p> : <p />}
        {marksActive ? <p>marks on</p> : <p />}
        {marksActive ? <p>{nanalyses} found</p> : <p />}
        {placeholderActive ? <p>placeholder on</p> : <p />}
        {placeholderActive ? <p>1/2</p> : <p />}
      </div>
      <div className="note-header">
        <input
          className="note-title"
          value={title}
          onChange={async (e) => {
            handleTitleChange(e);
          }}
        />

        <p className="note-date">
          {fetchedNote === undefined
            ? ""
            : new Date(fetchedNote?.lastedit!)
                .toLocaleString("en-US")
                .split(",")[0]}
        </p>
      </div>
      <section
        ref={editorRef}
        style={{
          // border: "5px solid var(--highlight2)",
          width: "100%",
          height: "100%",
          WebkitBoxSizing: "border-box" /* Safari/Chrome, other WebKit */,
          // -moz-box-sizing: border-box;    /* Firefox, other Gecko */
          boxSizing: "border-box" /* Opera/IE 8+ */,
        }}
      />
    </div>
  );
}
