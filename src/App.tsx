/**
 * App.tsx
 *
 * Entrypoint - KEEP IT MINIMAL
 */

import { useState } from "react";
import { EditorView } from "@codemirror/view";
import Menu from "./Components/Menu";
import FeedbackSidebar from "./Components/FeedbackSidebar";
import { Editor } from "./Components/Codemirror/Editor";
import "./App.css";

function App() {
  const [view, setView] = useState<EditorView | null>(null);

  return (
    <div
      className="App"
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Menu />
      <header
        className="App-header"
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 4,
          border: "var(--borderdebug) red",
          backgroundColor: "var(--bgcollight)",
        }}
      >
        <h1>xprss yrslf 2</h1>
        <Editor setView={setView} />
        {/* <GideonDemo /> */}
      </header>
      <FeedbackSidebar />
    </div>
  );
}

export default App;
