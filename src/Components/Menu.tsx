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
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import NoteList from "./NoteList";
import { db, downloadDB } from "./Dexie/db";

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
  setCurrentNote: React.Dispatch<React.SetStateAction<number | null>>;
  currentNote: number | null;
  setShowmenu: React.Dispatch<React.SetStateAction<boolean>>;
  setL1active: React.Dispatch<React.SetStateAction<boolean>>;
  setL2active: React.Dispatch<React.SetStateAction<boolean>>;
  L1active: boolean;
  L2active: boolean;
}

export default function Menu({
  setCurrentNote,
  currentNote,
  setShowmenu,
  setL1active,
  setL2active,
  L1active,
  L2active,
}: MenuProps) {
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
              <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                <ThemeProvider theme={theme}>
                  <IconButton onClick={downloadDB}>
                    <FileDownloadIcon />
                  </IconButton>
                  <Button
                    onClick={() => {
                      addNote().then((id) => {
                        if (id) {
                          // console.log("in promise chain");
                          setCurrentNote(id as number);
                          setShowbar("hide");
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
              {currentNote !== null ? (
                <>
                  <div className="featuretoggles">
                    <ThemeProvider theme={theme}>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={L1active}
                              onChange={(event, checked) => {
                                console.log("L1 value", checked);
                                // enable auto expressiveness! periodic suggestions!
                                setL1active(checked);
                              }}
                            />
                          }
                          label="Auto Expressiveness"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={L2active}
                              onChange={(event, checked) => {
                                setL2active(checked);
                                // enable marks!
                              }}
                            />
                          }
                          label="Auto Analysis"
                        />
                        <Button variant="contained" onClick={() => {}}>
                          Stuck?
                        </Button>
                      </FormGroup>
                    </ThemeProvider>
                  </div>

                  <p style={{}}>hci@ucla</p>
                </>
              ) : (
                <p
                  style={{
                    position: "absolute",
                    width: "100%",
                    bottom: "0px",
                  }}
                >
                  hci@ucla
                </p>
              )}
            </div>
          ),
        }[showbar]
      }
    </>
  );
}
