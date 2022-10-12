import React, { useState } from "react";
import "./Menu.css";
import {
  Button,
  FormControlLabel,
  FormGroup,
  IconButton,
  Switch,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
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
    secondary: {
      // main: cs.getPropertyValue("--fontcolmid"),
      main: "#123123",
    },
  },
});

export default function Menu() {
  const [showbar, setShowbar] = useState<"hide" | "show">("hide");
  var noteentries = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <>
      {
        {
          hide: (
            <div className="menu-sidebar off">
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
            <div className="menu-sidebar on">
              <header>
                <h1>Menu</h1>
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
              </header>
              <div>
                <ThemeProvider theme={theme}>
                  <Button
                    variant="contained"
                    color="secondary"
                    endIcon={<NoteAddIcon />}
                  >
                    New Note
                  </Button>
                </ThemeProvider>
              </div>
              <div className="notelist">
                {noteentries.map((x) => {
                  return <div key={String(x)}>x{x}</div>;
                })}
              </div>

              <div className="featuretoggles">
                <ThemeProvider theme={theme}>
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch />}
                      label="Auto Expressiveness"
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label="Auto Analysis"
                    />
                    <Button variant="contained">Express now</Button>
                  </FormGroup>
                </ThemeProvider>
              </div>
              <p>hci@ucla</p>
            </div>
          ),
        }[showbar]
      }
    </>
  );
}
