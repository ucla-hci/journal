/**
 * App.tsx - Entrypoint
 *
 * Journaling web application for mental health. Levels of intervention (L1, L2, L3) are implemented as text editing + UI features.
 *
 */

import { useEffect, useState } from "react";
import { EditorView } from "@codemirror/view";
import Menu from "./Components/UI/Menu";
import FeedbackSidebar from "./Components/UI/FeedbackSidebar";
import { Editor } from "./Components/Codemirror/Editor";
import "./App.css";
import Popup from "./Components/UI/Popup";
import { db, Highlight } from "./Components/Dexie/db";
import GraphBuilder from "./Components/Graphics/GraphBuilder";
import ReactModal from "react-modal";
import FAQ from "./Components/UI/FAQ";
import Welcome from "./Components/UI/Welcome";
import Onboarding from "./Components/UI/Onboarding";
import { useLiveQuery } from "dexie-react-hooks";

import HighlightContext from "./Contexts/HighlightContext";
import Tabs from "./Components/UI/Tabs";

type TabsType = {
  label: string;
  index: number;
  Component: React.FC<{}>;
}[];

const tabs: TabsType = [
  {
    label: "Welcome",
    index: 1,
    Component: Welcome,
  },
  {
    label: "Reports",
    index: 2,
    Component: GraphBuilder,
  },
  {
    label: "Onboarding",
    index: 3,
    Component: Onboarding,
  },
];

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

  // tab menu
  const [selectedTab, setSelectedTab] = useState<number>(tabs[0].index);

  // state refactor - start with highlights
  const highlightContext = HighlightContext();
  const [highlight, setHighlight] = useState<Highlight>({
    id: -1,
    pos: { from: 0, to: 0 },
    active: false,
    color: null,
  });

  function updateHighlight(val: Highlight) {
    setHighlight(val);
  }

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
              <Tabs
                selectedTab={selectedTab}
                onClick={setSelectedTab}
                tabs={tabs}
              />
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
            backgroundColor: "rgba(0,0,0,0.3)",
          },
          content: {
            background: "rgba(244, 241, 255, 0.7)",
            backdropFilter: "blur(8px)",
            borderRadius: "6px",
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
