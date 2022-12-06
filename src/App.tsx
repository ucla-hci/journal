/**
 * App.tsx
 *
 * Entrypoint - KEEP IT MINIMAL
 */

import { useEffect, useState } from "react";
import { EditorView } from "@codemirror/view";
import Menu from "./Components/UI/Menu";
import FeedbackSidebar from "./Components/UI/FeedbackSidebar";
import { Editor } from "./Components/Codemirror/Editor";
import "./App.css";
import Popup from "./Components/UI/Popup";
import { db } from "./Components/Dexie/db";
import GraphBuilder from "./Components/Graphics/GraphBuilder";
import ReactModal from "react-modal";
import FAQ from "./Components/UI/FAQ";
import Welcome from "./Components/UI/Welcome";
import { useLiveQuery } from "dexie-react-hooks";

function App() {
  const [view, setView] = useState<EditorView | null>(null);
  const [currentNote, setCurrentNote] = useState<number | null>(null);
  const [showmenu, setShowmenu] = useState<boolean>(true);
  const [feedbackbar, setFeedbackbar] = useState<boolean>(false);
  const [L2active, setL2active] = useState<boolean>(false);
  const [L1active, setL1active] = useState<boolean>(false);
  const [L1trigger, setL1trigger] = useState<boolean>(false);
  const [timespent, setTimespent] = useState<number>(0);
  const [viewHelp, setViewHelp] = useState<boolean>(false);
  const [Nnotes, setNnotes] = useState<number | null>(null);

  useLiveQuery(async () => {
    let x = await db.notes.toArray();
    setNnotes(x.length);
  });

  useEffect(() => {
    ReactModal.setAppElement("#root");
  }, []);

  useEffect(() => {
    // on first load clear popups, sidebars, placeholders tables
    setFeedbackbar(false);
    if (currentNote === null) {
      console.log("clearing state dbs");
      db.sidebars.clear();
      db.placeholders.update(1, { display: false });
      db.placeholders.clear();
      db.highlights.update(1, { active: false });
      db.highlights.clear();
      db.popups.clear();
      setL2active(false);
      setL1active(false);
    } else {
      // log note opens
      db.logs.add({
        note: currentNote,
        realtime: Date.now(),
        timestamp: timespent,
        feature: "noteopen",
      });
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
      <Menu
        setCurrentNote={setCurrentNote}
        currentNote={currentNote}
        setShowmenu={setShowmenu}
        setL1active={setL1active}
        setL2active={setL2active}
        L1active={L1active}
        L2active={L2active}
        setL1trigger={setL1trigger}
        setViewHelp={setViewHelp}
      />
      <header
        className="App-header"
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 4,
          border: "var(--borderdebug) red",
          backgroundColor: "var(--bgcollight)",
          // marginLeft: currentNote === null ? "30px" : "30px",
          // marginRight: currentNote === null ? "30px" : "30px",
          width: "100%",
          alignItems: "center",
        }}
      >
        <div
          style={{
            border: "var(--borderdebug) green",
            width: "90%",
            height: "100%",
            // margin: "2vw",
            display: "flex",

            flexDirection: "column",
          }}
        >
          {currentNote === null ? (
            <>
              <h1 className="homelogo noselect">Expresso+</h1>
              {/* <h1 className="homelogo">Expresso+</h1> */}
              {Nnotes! >= 2 ? (
                <div
                  style={{
                    border: "var(--borderdebug) grey",
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    flex: 1,
                    marginTop: "-30px",
                  }}
                >
                  <h4
                    style={{
                      textAlign: "left",
                      margin: "20px",
                      border: "var(--borderdebug) purple",
                    }}
                  >
                    Recent Activity (last {Nnotes! < 7 ? Nnotes?.toString() : 7}{" "}
                    entries)
                  </h4>
                  <GraphBuilder />
                </div>
              ) : (
                <div style={{ margin: "0 0 -60px 0" }}>
                  <Welcome />
                </div>
              )}
            </>
          ) : (
            <>
              <Popup
                setFeedbackbar={setFeedbackbar}
                currentNote={currentNote}
                timespent={timespent}
              />
              <Editor
                view={view}
                setView={setView}
                currentNote={currentNote}
                L2active={L2active}
                L1active={L1active}
                setL1active={setL1active}
                setL2active={setL2active}
                timespent={timespent}
                setTimespent={setTimespent}
                L1trigger={L1trigger}
                setL1trigger={setL1trigger}
              />
            </>
          )}
        </div>
      </header>
      <ReactModal
        isOpen={viewHelp}
        onRequestClose={() => {
          setViewHelp(false);
        }}
        style={{
          overlay: {
            zIndex: "5",
            backgroundColor: "rgba(0,0,0,0.6)",
          },
          content: {
            background: "#ccc",
          },
        }}
      >
        <FAQ setViewHelp={setViewHelp} />
      </ReactModal>
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
