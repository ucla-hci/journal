import React, { useEffect, useState } from "react";
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
import HomeIcon from "@mui/icons-material/Home";

import NoteList from "./NoteList";
import { db } from "./Dexie/db";

const theme = createTheme({
  palette: {
    primary: {
      main: "#123123",
    },
    secondary: {
      main: "#123123",
    },
  },
});

interface MenuProps {
  setCurrentNote: React.Dispatch<React.SetStateAction<Number | null>>;
  setShowmenu: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Menu({ setCurrentNote, setShowmenu }: MenuProps) {
  const [showbar, setShowbar] = useState<"hide" | "show">("hide");

  async function addNote() {
    let existent = await db.notes.toArray();
    let untitled = existent
      .filter((val) => {
        return val.title.includes("untitled note");
      })
      .sort();

    try {
      // add new blank note
      const id = await db.notes.add({
        title: "untitled note " + untitled.length,
        content: "",
        creationdate: Date.now(),
        lastedit: Date.now(),
        timeduration: 0,
        stats: {},
      });

      console.log("added new note with id", id);
      return id;
    } catch (error) {
      console.log(`Failed to add new note: ${error}`);
      return null;
    }
  }
  useEffect(() => {
    let barstate = showbar === "hide" ? false : true;
    console.log("in showbareffect menu: state", barstate);
    setShowmenu(barstate);
  }, [showbar]);

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
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>
              </ThemeProvider>
            </div>
          ),
          show: (
            <div className="menu-sidebar on">
              <header>
                <ThemeProvider theme={theme}>
                  <IconButton
                    aria-label="delete"
                    color="inherit"
                    onClick={() => {
                      setCurrentNote(null);
                    }}
                  >
                    <HomeIcon />
                  </IconButton>
                </ThemeProvider>
                <h1>Menu</h1>
                <ThemeProvider theme={theme}>
                  <IconButton
                    onClick={() => {
                      setShowbar(showbar === "hide" ? "show" : "hide");
                    }}
                    aria-label="delete"
                    color="inherit"
                  >
                    <ClearIcon />
                  </IconButton>
                </ThemeProvider>
              </header>
              <div>
                <ThemeProvider theme={theme}>
                  <Button
                    onClick={() => {
                      addNote().then((id) => {
                        if (id) {
                          console.log("in promise chain");
                          setCurrentNote(id as number);
                        }
                      });
                    }}
                    variant="contained"
                    color="secondary"
                    endIcon={<NoteAddIcon />}
                  >
                    New Note
                  </Button>
                </ThemeProvider>
              </div>
              <NoteList
                setCurrentNote={setCurrentNote}
                setShowbar={setShowbar}
              />
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
