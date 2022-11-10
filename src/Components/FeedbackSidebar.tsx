import { useEffect, useState } from "react";
import "./FeedbackSidebar.css";
import { Button, IconButton } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
import MenuIcon from "@mui/icons-material/Menu";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./Dexie/db";

const theme = createTheme({
  palette: {
    primary: {
      main: "#123123",
    },
  },
});

interface FeedbackSidebarProps {
  currentNote: Number | null;
  setFeedbackbar: React.Dispatch<React.SetStateAction<boolean>>;
  feedbackbar: boolean;
}

export default function FeedbackSidebar({
  currentNote,
  setFeedbackbar,
  feedbackbar,
}: FeedbackSidebarProps) {
  const [content, setContent] = useState<{ [key: string]: string } | null>(
    null
  );

  useEffect(() => {
    // console.log("feedbackbar in fbsidebar", feedbackbar);
  }, [feedbackbar]);

  useLiveQuery(async () => {
    const result = await db.sidebars.get(1);
    if (result !== undefined) {
      setContent(result.content);
    }
  });

  return (
    <>
      {feedbackbar ? (
        <div className="feedback-sidebar on">
          <header>
            <ThemeProvider theme={theme}>
              <IconButton
                onClick={() => setFeedbackbar(false)}
                aria-label="delete"
                color="primary"
              >
                <ClearIcon />
              </IconButton>
            </ThemeProvider>
            <h1 style={{ textAlign: "center" }}>
              Feedback
              <br />
              Sidebar
            </h1>
          </header>
          <div className="Feedback">
            {content
              ? Object.entries(content).map((pair, idx) => {
                  console.log(`${pair[0]}: ${pair[1]}`);
                  return (
                    <div className="card">
                      <h3>{pair[0]}</h3>
                      <p>{pair[1]}</p>
                    </div>
                  );
                })
              : null}
            <div className="card">
              <h3>Shortcuts</h3>
              <p>* cmd+s to search</p>
              <p>* cmd+i to insert text {"-->"} placeholder</p>
              <p>* cmd+p send to python</p>
              <p>* hover over "test" for tooltip</p>
              <p>* ctrl+space for autocompletion</p>
            </div>
            <div className="card">
              <h3>LIWC Analysis</h3>
              <p>Through API queries?</p>
            </div>
          </div>
          <div className="rewrite-btn">
            <ThemeProvider theme={theme}>
              <Button variant="contained">Rewrite</Button>
            </ThemeProvider>
          </div>
        </div>
      ) : (
        <div className="feedback-sidebar off">
          {currentNote ? (
            <ThemeProvider theme={theme}>
              <IconButton
                onClick={() => setFeedbackbar(true)}
                aria-label="delete"
                color="primary"
              >
                <MenuIcon />
              </IconButton>
            </ThemeProvider>
          ) : null}
        </div>
      )}
    </>
  );
}
