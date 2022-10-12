import React, { useState } from "react";
import "./FeedbackSidebar.css";
import { Button, IconButton } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
import MenuIcon from "@mui/icons-material/Menu";

// const colors =
let ele = document.querySelector(":root")!;
let cs = getComputedStyle(ele);

const theme = createTheme({
  palette: {
    primary: {
      // main: cs.getPropertyValue("--bgcolmid"),
      main: "#123123",
    },
  },
});

export default function FeedbackSidebar() {
  const [showbar, setShowbar] = useState<"hide" | "show">("hide");

  return (
    <>
      {
        {
          hide: (
            <div className="feedback-sidebar off">
              <ThemeProvider theme={theme}>
                <IconButton
                  onClick={() => {
                    setShowbar(showbar === "hide" ? "show" : "hide");
                  }}
                  aria-label="delete"
                  color="primary"
                >
                  <MenuIcon />
                </IconButton>
              </ThemeProvider>
            </div>
          ),
          show: (
            <div className="feedback-sidebar on">
              <header>
                <ThemeProvider theme={theme}>
                  <IconButton
                    onClick={() => {
                      setShowbar(showbar === "hide" ? "show" : "hide");
                    }}
                    aria-label="delete"
                    color="primary"
                  >
                    <ClearIcon />
                  </IconButton>
                </ThemeProvider>
                <h1>
                  Feedback
                  <br />
                  Sidebar
                </h1>
              </header>
              <div className="Feedback">
                <p>cmd+s to search</p>
                <p>cmd+d to show dots</p>
                <p>cmd+p to show popup</p>
              </div>
              <div className="rewrite-btn">
                <ThemeProvider theme={theme}>
                  <Button variant="contained">Rewrite</Button>
                </ThemeProvider>
              </div>
            </div>
          ),
        }[showbar]
      }
    </>
  );
}
