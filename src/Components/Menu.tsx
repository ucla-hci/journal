import React from "react";
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

// const colors =
let ele = document.querySelector(":root")!;
let cs = getComputedStyle(ele);

const theme = createTheme({
  palette: {
    primary: {
      main: cs.getPropertyValue("--bgcolmid"),
      // main: "#123123",
    },
    secondary: {
      main: cs.getPropertyValue("--fontcolmid"),
      // main: "#123123",
    },
  },
});

export default function Menu() {
  var noteentries = [10];

  return (
    <div className="menu-sidebar">
      <header>
        <h1>Menu</h1>
        <ThemeProvider theme={theme}>
          <IconButton aria-label="delete" color="primary">
            <ClearIcon />
          </IconButton>
        </ThemeProvider>
      </header>
      <ThemeProvider theme={theme}>
        <Button variant="contained" color="secondary" endIcon={<NoteAddIcon />}>
          New Note
        </Button>
      </ThemeProvider>
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
            <FormControlLabel control={<Switch />} label="Auto Analysis" />
            <Button variant="contained">Express now</Button>
          </FormGroup>
        </ThemeProvider>
      </div>
      <p>hci@ucla</p>
    </div>
  );
}
