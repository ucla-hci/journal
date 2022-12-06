/**
 * reference: https://www.bayanbennett.com/posts/failing-to-add-codemirror-6-and-then-succeeding-devlog-004/
 *            https://codesandbox.io/s/codemirror6-t9ywwc?file=/src/index.js && https://discuss.codemirror.net/t/how-to-listen-to-changes-for-react-controlled-component/4506/4
 *
 *
 */

import React, { useEffect, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";

import { annotation1, keymaps, togglePlaceholder } from "./keymaps";
import { db, DismissLog, Highlight, Note, Placeholder } from "../Dexie/db";
import { IndexableType } from "dexie";

import "../Styles/Editor.css";
import { cursorTooltip } from "./Extensions/CookMarks";

import { history } from "@codemirror/commands";

import { toggleWith, toggleWith2 } from "./Extensions/toggleWith";
import { metadatafacet, suggestionfacet } from "./Extensions/facets";

import { placeholders } from "./Extensions/phViewPlugin";
import { useLiveQuery } from "dexie-react-hooks";
import { debounce } from "lodash";
import { timeChecker } from "./Extensions/checkPauses";
import { l2underline } from "./Extensions/textMarker";
import { FormControlLabel, FormGroup, Switch } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#e6a1cf",
      // main: "#ffffff",
    },
    secondary: {
      main: "#000059",
    },
  },
});

interface editorProps {
  view: EditorView | null;
  setView: React.Dispatch<React.SetStateAction<EditorView | null>>;
  currentNote: number | null;
  L2active: boolean;
  L1active: boolean;
  setL1active: React.Dispatch<React.SetStateAction<boolean>>;
  setL2active: React.Dispatch<React.SetStateAction<boolean>>;
  timespent: number;
  setTimespent: React.Dispatch<React.SetStateAction<number>>;
  L1trigger: boolean;
  setL1trigger: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Editor({
  view,
  setView,
  currentNote,
  L2active,
  L1active,
  setL1active,
  setL2active,
  timespent,
  setTimespent,
  L1trigger,
  setL1trigger,
}: editorProps) {
  const editorRef = useRef<HTMLElement>(null);
  const [fetchedNote, setfetchedNote] = useState<Note | undefined>(undefined);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [showSave, setShowSave] = useState<boolean>(false);
  // const [timespent, setTimespent] = useState<number>(0);

  //placeholderstuff
  const [suggestion, setSuggestion] = useState<Placeholder | null>(null);
  const [placeholderActive, setPlaceholderActive] = useState<boolean>(false);
  const [wordcount, setWordcount] = useState<number>(0);

  // persist through editor reconfig
  const [cursor, setCursor] = useState<number>(0);
  const [waitTime, setWaitTime] = useState<number | null>(10000);
  const [highlight, setHighlight] = useState<Highlight | null>(null);

  const [dismisslist, setDismisslist] = useState<DismissLog[] | null>(null);

  let myTheme = EditorView.theme(
    {
      "&": {
        color: "rgba(1,1,1,0.9)",
        width: "100%",
        // height: "100%",
        height: "calc(100vh - 150px)",
        textAlign: "left",
        overflowY: "scroll",
        // -ms-overflow-style: none;  /* IE and Edge */
        scrollbarWidth: "none",
      },
      "&.cm-editor": {
        scrollbarWidth: "none",
        // border: "2px solid orange",
        boxShadow: "rgba(0, 0, 0, 0.10) 0px 3px 8px",
        padding: "20px",
      },
      "&.cm-editor.cm-focused": {
        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
        // border: "2px solid blue",
        outline: "none",
      },
      ".cm-content": {
        // caretColor: "#f00",
        fontFamily: "'Inter', sans-serif",
        fontSize: "18px",
      },
      "&.cm-focused .cm-cursor": {
        border: "1px solid var(--fontcollight)",
      },
      "&.cm-focused .cm-selectionBackground, ::selection": {
        // backgroundColor: "#074",
      },
      ".cm-gutters": {
        backgroundColor: "var(--bgcolmid)",
        color: "var(--bgcolshadow)",
      },
      ".cm-atomic": {
        // backgroundColor: "cornsilk",
      },
      ".cm-replace": {
        backgroundColor: "pink",
        textDecoration: "line-through",
      },

      ".cm-underline": {
        textDecoration: "underline 3px var(--analysis-highlight)",
        // backgroundColor: "var(--analysis-highlight-light)",
      },
    },
    { dark: false }
  );

  const fetchNote = async () => {
    if (currentNote === null) return;
    var response = await db.notes.get(currentNote!);
    if (response !== undefined) {
      setfetchedNote(response);
      setTimespent(response.timeduration);
      setCursor(response.content.length);
    }
  };

  useLiveQuery(async () => {
    const res = await db.placeholders.get(1);
    if (res !== undefined) {
      setSuggestion(res);
      setPlaceholderActive(res.active);
    }
  });
  useLiveQuery(async () => {
    const res = await db.highlights.get(1);
    if (res !== undefined) {
      setHighlight(res);
    }
  });
  useLiveQuery(async () => {
    const res = await db.dismiss.where("note").equals(currentNote!).toArray();
    if (res !== undefined) {
      setDismisslist(res);
    }
  });

  // use for single expressiveness triggers
  useEffect(() => {
    if (L1trigger && view !== null) {
      db.placeholders.get(1).then((res) => {
        togglePlaceholder(view, "L1", res!);
      });
    }
  }, [L1trigger]);

  useInterval(
    () => {
      if (!placeholderActive) {
        setTimeout(() => {
          setL1trigger(false);
        }, 15);
        setL1trigger(true);
        // 2. push display=true
        db.placeholders.update(1, { active: true });
      }
    },
    L1active ? waitTime : null
  );

  useEffect(() => {
    if (suggestion !== null) {
      db.logs.add({
        note: fetchedNote?.id!,
        realtime: Date.now(),
        timestamp: timespent,
        feature:
          suggestion.origin === "L1" ? "L1singleexpressiveness" : "L3rephrase",
        featurestate: "toggle",
        comments: `new suggestion ${suggestion.suggestion}`,
      });
    }
  }, [suggestion]);

  useEffect(() => {
    if (L2active) {
      db.logs.add({
        note: fetchedNote?.id!,
        realtime: Date.now(),
        timestamp: timespent,
        feature: "L2autoanalysis",
        featurestate: "enable",
        comments: null,
      });
    } else {
      db.logs.add({
        note: fetchedNote?.id!,
        realtime: Date.now(),
        timestamp: timespent,
        feature: "L2autoanalysis",
        featurestate: "disable",
        comments: null,
      });
    }
  }, [L2active]);

  function getCursorLocation() {
    if (placeholderActive) {
      console.log("returning cursorlocation", suggestion!.location);
      return suggestion!.location;
    } else {
      console.log("returning cursorlocation", cursor);
      return cursor;
    }
  }

  // 1. Fetch contents
  React.useEffect(() => {
    fetchNote().catch(console.error);
  }, [placeholderActive, suggestion, L2active, highlight]);
  React.useEffect(() => {
    fetchNote().catch(console.error);
    setPlaceholderActive(false);
    setL2active(false);
    setHighlight(null);
    db.highlights.update(1, { active: false });
  }, [currentNote]);

  // 2. After contents have loaded, remake the editor
  React.useEffect(() => {
    if (editorRef.current === null) return;
    if (fetchedNote === undefined) return;

    setTitle(fetchedNote?.title);

    const state = EditorState.create({
      doc: fetchedNote?.content,
      selection: {
        anchor: getCursorLocation(),
        // anchor: 0,
      },
      extensions: [
        // base ------------------------------------------------------------
        myTheme,
        history(),
        EditorView.lineWrapping,

        // custom for expresso ------------------------------------------------
        timeChecker(fetchedNote, setTimespent),
        metadatafacet.of({ noteid: fetchedNote?.id!, timeduration: timespent }),

        L2active
          ? toggleWith2("Mod-o", cursorTooltip(dismisslist!), setL2active)
          : toggleWith("Mod-o", cursorTooltip(dismisslist!), setL2active), // toggles marks

        L2active && highlight?.active ? [l2underline(highlight)] : [],

        keymaps,
        placeholderActive
          ? suggestionfacet.of({
              target: suggestion!.suggestion,
              from: suggestion!.location,
              to: suggestion!.suggestion.length,
              replace: suggestion!.replace,
              origin: suggestion!.origin,
            })
          : [],

        // display ph
        placeholderActive ? placeholders : [],

        // onchange listener ------------------------------------------------
        EditorView.updateListener.of(({ state, view, transactions }) => {
          if (waitTime !== null) {
            setTimeout(() => {
              setWaitTime(10000);
            }, 10000);
            setWaitTime(null);
          }

          transactions.forEach((tr) => {
            if (tr.docChanged && L1active) {
              // reset timeout
            }

            if (tr.annotation(annotation1) === "esc") {
              setL2active(false);
            }
          });

          let nwords = state.doc.toJSON().join("").split(" ").length - 1;
          setWordcount(nwords);
          setCursor(state.selection.ranges[0].to);
          saveNoteContents(state.doc.toString());
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
      {/* <div className="notifiers">
        {showSave ? <p>Saving</p> : <p />}
        {L2active ? <p>marks on</p> : <p />}
        {placeholderActive ? <p>placeholder on</p> : <p />}
        <p>Word Count: {wordcount}</p>
        <p>Write Time: {Math.floor(timespent / 60000)} min</p>
      </div> */}
      <div className="note-header">
        <div className="notifiers">
          <p className="note-date">
            {fetchedNote === undefined
              ? ""
              : new Date(fetchedNote?.lastedit!)
                  .toLocaleString("en-US")
                  .split(",")[0]}
          </p>
          <p>{wordcount} words</p>
          <p>{Math.floor(timespent / 60000)} minutes</p>
        </div>
        <div className="headerrow">
          <input
            className="note-title"
            value={title}
            onChange={async (e) => {
              handleTitleChange(e);
            }}
          />
          <div className="featuretoggles">
            <ThemeProvider theme={theme}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={L1active}
                      onChange={(event, checked) => {
                        console.log("L1 value", checked);
                        // enable auto expressiveness! periodic suggestions!
                        setL1active(checked);
                      }}
                    />
                  }
                  label="Expresso"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={L2active}
                      onChange={(event, checked) => {
                        setL2active(checked);
                        // enable marks!
                      }}
                    />
                  }
                  label="Analysis"
                />
                {/* <Button
                  variant="contained"
                  onClick={() => {
                    // 1. prepare placeholder
                    setTimeout(() => {
                      setL1trigger(false);
                    }, 15);
                    setL1trigger(true);
                    // 2. push display=true
                    db.placeholders.update(1, { active: true });
                  }}
                >
                  Stuck?
                </Button> */}
              </FormGroup>
            </ThemeProvider>
          </div>
        </div>
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

function useInterval(callback: any, delay: number | null) {
  const savedCallback = useRef<any>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
