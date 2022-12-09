import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Sidebar } from "../Dexie/db";
import "../Styles/FeedbackSidebar.css";

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
    console.log("feedbackbar change in content", data);
    setFeedbackbar(data?.display!);
  }, [data]);

  useEffect(() => {
    if (currentNote !== null) {
      if (feedbackbar) {
        db.logs.add({
          note: currentNote!,
          realtime: Date.now(),
          timestamp: timespent,
          feature: "L2sidebar",
          featurestate: "enable",
          comments: `title: ${data!.title}`,
        });
      } else {
        db.logs.add({
          note: currentNote!,
          realtime: Date.now(),
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
            {/* <h1 style={{ textAlign: "center" }}>
              Feedback
              <br />
              Sidebar
            </h1> */}
          </header>
          <div className="Feedback">
            {/* {Array.isArray(data?.content)
              ? data?.content.map((html, idx) => {
                  let x = document.createElement("div");
                  x.className = "card";
                  x.innerHTML = html;
                  return x;
                })
              : null} */}
            <>
              {data?.content !== null && Array.isArray(data?.content)
                ? data!.content.map((html, idx) => {
                    // let x = document.createElement("div");
                    // x.className = "card";
                    // x.innerHTML = html;
                    return (
                      <div
                        className="card"
                        dangerouslySetInnerHTML={{ __html: html }}
                      ></div>
                    );
                  })
                : null}
              {data?.content !== null && !Array.isArray(data?.content) ? (
                <div
                  className="card"
                  dangerouslySetInnerHTML={{ __html: data!.content }}
                ></div>
              ) : null}
            </>
            {/* <div className="card">
              <h3>Shortcuts</h3>
              <p>* cmd+o for analysis</p>
              <p>* ctrl+space for placeholder</p>
            </div>
            <div className="card">
              <h3>LIWC Analysis</h3>
              <p>Through API queries?</p>
            </div> */}
          </div>
          <div className="rewrite-btn">
            {data!.rephrase ? (
              <ThemeProvider theme={theme}>
                <Button
                  onClick={() => {
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
        <div className="feedback-sidebar off"></div>
      )}
    </>
  );
}
