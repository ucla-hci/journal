import React, { useEffect, useState } from "react";
import "../Styles/Menu.css";
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
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import NoteList from "./NoteList";
import { db, downloadDB } from "../Dexie/db";

const theme = createTheme({
  palette: {
    primary: {
      main: "#e6a1cf",
    },
    secondary: {
      main: "#000059",
    },
  },
});
const theme2 = createTheme({
  palette: {
    primary: {
      // main: "#e6a1cf",
      main: "#ffffff",
    },
    secondary: {
      main: "#ffffff",
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
  setL1trigger: React.Dispatch<React.SetStateAction<boolean>>;
  setViewHelp: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Menu({
  setCurrentNote,
  currentNote,
  setShowmenu,
  setL1active,
  setL2active,
  L1active,
  L2active,
  setL1trigger,
  setViewHelp,
}: MenuProps) {
  const [showbar, setShowbar] = useState<"hide" | "show">("hide");

  async function addNote() {
    let existent = await db.notes.toArray();
    let untitled = existent
      .filter((val) => {
        return val.title.toLowerCase().includes("untitled note");
      })
      .sort();

    try {
      // add new blank note
      const id = await db.notes.add({
        title: "Untitled Note " + untitled.length,
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
    let barstate = showbar === "hide" || currentNote === null ? false : true;
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
                {/* <h1>Menu</h1> */}
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
                  <Button
                    onClick={downloadDB}
                    color="primary"
                    variant="contained"
                    endIcon={<FileDownloadIcon />}
                  >
                    Logs
                  </Button>
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
              <>
                <div
                  style={{
                    position: "absolute",
                    width: "230px",
                    bottom: "0px",
                    right: "30px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ThemeProvider theme={theme2}>
                    <IconButton
                      color="inherit"
                      onClick={() => {
                        setViewHelp(true);
                      }}
                    >
                      <HelpOutlineIcon />
                    </IconButton>
                  </ThemeProvider>
                  <p
                    style={{
                      width: "100%",
                      marginRight: "20px",
                    }}
                  >
                    hci@ucla
                  </p>
                </div>
                {/* // </div> */}
              </>
              {/* )} */}
            </div>
          ),
        }[showbar]
      }
    </>
  );
}
