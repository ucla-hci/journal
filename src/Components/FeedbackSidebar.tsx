import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Sidebar } from "./Dexie/db";
import "./FeedbackSidebar.css";

import { Button, IconButton } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
import MenuIcon from "@mui/icons-material/Menu";

const theme = createTheme({
  palette: {
    primary: {
      main: "#123123",
    },
  },
});

interface FeedbackSidebarProps {
  currentNote: number | null;
  setFeedbackbar: React.Dispatch<React.SetStateAction<boolean>>;
  feedbackbar: boolean;
  timespent: number;
}

export default function FeedbackSidebar({
  currentNote,
  setFeedbackbar,
  feedbackbar,
  timespent,
}: FeedbackSidebarProps) {
  const [data, setData] = useState<Sidebar | null>(null);

  useEffect(() => {
    // console.log("feedbackbar change in content", data);
    setFeedbackbar(data?.display!);
  }, [data]);

  useEffect(() => {
    if (currentNote !== null) {
      if (feedbackbar) {
        db.logs.add({
          assocnote: currentNote!,
          timestamp: timespent,
          feature: "L2sidebar",
          featurestate: "enable",
          comments: `title: ${data!.title}`,
        });
      } else {
        db.logs.add({
          assocnote: currentNote!,
          timestamp: timespent,
          feature: "L2sidebar",
          featurestate: "disable",
          comments: null,
        });
      }
    }
  }, [feedbackbar]);

  useLiveQuery(async () => {
    const result = await db.sidebars.get(1);
    if (result !== undefined) {
      setFeedbackbar(result.display!);
      setData(result);
      return result.display;
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
            {data?.content
              ? Object.entries(data.content).map((pair, idx) => {
                  // console.log(`${pair[0]}: ${pair[1]}`);
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
              <p>* cmd+o for analysis</p>
              <p>* ctrl+space for placeholder</p>
            </div>
            <div className="card">
              <h3>LIWC Analysis</h3>
              <p>Through API queries?</p>
            </div>
          </div>
          <div className="rewrite-btn">
            {data!.rephrase ? (
              <ThemeProvider theme={theme}>
                <Button
                  onClick={() => {
                    console.log("on rewrite click");
                    db.placeholders.update(1, { active: true });
                  }}
                  variant="contained"
                >
                  Rewrite
                </Button>
              </ThemeProvider>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="feedback-sidebar off">
          {data?.display !== undefined && currentNote !== null ? (
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
