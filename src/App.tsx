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
  const [currentNote, setCurrentNote] = useState<Number | null>(null);
  const [showmenu, setShowmenu] = useState<boolean>(false);
  const [feedbackbar, setFeedbackbar] = useState<boolean>(false);

  useEffect(() => {
    // on first load clear popups, sidebars, placeholders tables
    setFeedbackbar(false);
    if (currentNote === null) {
      console.log("clearing state dbs");
      db.sidebars.clear();
      db.placeholders.clear();
      db.popups.clear();
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
      <Popup setFeedbackbar={setFeedbackbar} />
      <Menu setCurrentNote={setCurrentNote} setShowmenu={setShowmenu} />
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
            <Editor setView={setView} currentNote={currentNote} />
          )}
        </div>
      </header>
      <FeedbackSidebar
        currentNote={currentNote}
        setFeedbackbar={setFeedbackbar}
        feedbackbar={feedbackbar}
      />
    </div>
  );
}

export default App;
