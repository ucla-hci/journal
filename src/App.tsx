/**
 * App.tsx
 *
 * Entrypoint - KEEP IT MINIMAL
 */

import { useEffect, useState } from "react";
import { EditorView } from "@codemirror/view";
import Menu from "./Components/Menu";
import FeedbackSidebar from "./Components/FeedbackSidebar";
import { Editor } from "./Components/Codemirror/Editor";
import "./App.css";
import Popup from "./Components/Popup";
import { db } from "./Components/Dexie/db";

function App() {
  const [view, setView] = useState<EditorView | null>(null);
  const [currentNote, setCurrentNote] = useState<number | null>(null);
  const [showmenu, setShowmenu] = useState<boolean>(false);
  const [feedbackbar, setFeedbackbar] = useState<boolean>(false);
  const [L2active, setL2active] = useState<boolean>(false);
  const [L1active, setL1active] = useState<boolean>(false);
  const [timespent, setTimespent] = useState<number>(0);

  useEffect(() => {
    // on first load clear popups, sidebars, placeholders tables
    setFeedbackbar(false);
    if (currentNote === null) {
      console.log("clearing state dbs");
      db.sidebars.clear();
      db.placeholders.update(1, { display: false });
      db.placeholders.clear();
      db.popups.clear();
      setL2active(false);
      setL1active(false);
    }
  }, [currentNote]);

  return (
    <div
      className="App"
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Popup
        setFeedbackbar={setFeedbackbar}
        currentNote={currentNote}
        timespent={timespent}
      />
      <Menu
        setCurrentNote={setCurrentNote}
        currentNote={currentNote}
        setShowmenu={setShowmenu}
        setL1active={setL1active}
        setL2active={setL2active}
        L1active={L1active}
        L2active={L2active}
      />
      <header
        className="App-header"
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 4,
          border: "var(--borderdebug) red",
          backgroundColor: "var(--bgcollight)",
          marginLeft: currentNote === null ? "260px" : "30px",
          marginRight: currentNote === null ? "260px" : "30px",
        }}
      >
        <div
          style={{
            border: "var(--borderdebug) green",
            width: "90%",
            height: "100%",
            margin: "2vw",
          }}
        >
          {currentNote === null ? (
            <>
              <h1>Expresso+</h1>
              <div
                style={{ border: "solid 1px var(--softgrey)", height: "60%" }}
              >
                <h4 style={{ textAlign: "left", margin: "20px" }}>
                  Weekly Report
                </h4>
              </div>
            </>
          ) : (
            <Editor
              setView={setView}
              currentNote={currentNote}
              L2active={L2active}
              L1active={L1active}
              setL1active={setL1active}
              setL2active={setL2active}
              timespent={timespent}
              setTimespent={setTimespent}
            />
          )}
        </div>
      </header>
      <FeedbackSidebar
        currentNote={currentNote}
        setFeedbackbar={setFeedbackbar}
        feedbackbar={feedbackbar}
        timespent={timespent}
      />
    </div>
  );
}

export default App;
