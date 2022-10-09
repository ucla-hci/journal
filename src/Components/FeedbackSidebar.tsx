import React from "react";
import "./FeedbackSidebar.css";
import { Button, IconButton } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";

// const colors =
let ele = document.querySelector(":root")!;
let cs = getComputedStyle(ele);

const theme = createTheme({
  palette: {
    primary: {
      main: cs.getPropertyValue("--bgcolmid"),
      // main: "#123123",
    },
  },
});

export default function FeedbackSidebar() {
  return (
    <div className="feedback-sidebar">
      <header>
        <h1>FeedbackSidebar</h1>
        <ThemeProvider theme={theme}>
          <IconButton aria-label="delete" color="primary">
            <ClearIcon />
          </IconButton>
        </ThemeProvider>
      </header>
      <div className="Feedback">
        <p>cmd+s to search</p>
        <p>cmd+d to show dots</p>
        <p>cmd+p to show popup</p>
      </div>
      <ThemeProvider theme={theme}>
        <Button variant="contained">Rewrite</Button>
      </ThemeProvider>
    </div>
  );
}
