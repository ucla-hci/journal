import React, { useEffect, useState } from "react";
import "../Styles/Menu.css";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import ClearIcon from "@mui/icons-material/Clear";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";

import NoteList from "./NoteList";
import { db, downloadDB, downloadDBlite } from "../Dexie/db";

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
      main: "#333",
    },
    secondary: {
      main: "#333",
    },
  },
});

interface MenuProps {
  setCurrentNote: React.Dispatch<React.SetStateAction<number | null>>;
  currentNote: number | null;
  setShowmenu: React.Dispatch<React.SetStateAction<boolean>>;
  setViewHelp: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Menu({
  setCurrentNote,
  currentNote,
  setShowmenu,
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
              <ThemeProvider theme={theme2}>
                <IconButton
                  onClick={() => {
                    setShowbar(showbar === "hide" ? "show" : "hide");
                  }}
                  aria-label="delete"
                  color="default"
                >
                  <MenuIcon />
                </IconButton>
              </ThemeProvider>
            </div>
          ),
          show: (
            <div className="menu-sidebar on">
              <header>
                {/* <ThemeProvider theme={theme2}> */}
                <IconButton
                  onClick={() => {
                    setShowbar(showbar === "hide" ? "show" : "hide");
                  }}
                  aria-label="Close Menu"
                  color="default"
                >
                  <ClearIcon sx={{ fontSize: "32px" }} />
                </IconButton>

                <Tooltip
                  title={<Typography fontSize={14}>Home</Typography>}
                  placement="right"
                >
                  <IconButton
                    aria-label="Home"
                    color="default"
                    onClick={() => {
                      setCurrentNote(null);
                    }}
                  >
                    <HomeIcon sx={{ fontSize: "32px" }} />
                  </IconButton>
                </Tooltip>

                <Tooltip
                  title={<Typography fontSize={14}>New Entry</Typography>}
                  placement="right"
                >
                  <IconButton
                    aria-label="New Entry"
                    color="default"
                    onClick={() => {
                      addNote().then((id) => {
                        if (id) {
                          // console.log("in promise chain");
                          setCurrentNote(id as number);
                          setShowbar("hide");
                        }
                      });
                    }}
                  >
                    <NoteAddIcon sx={{ fontSize: "32px" }} />
                  </IconButton>
                </Tooltip>
                <Tooltip
                  title={<Typography fontSize={14}>Logs</Typography>}
                  placement="right"
                >
                  <IconButton
                    aria-label="Download Logs"
                    color="default"
                    onClick={downloadDB}
                  >
                    <FileDownloadIcon sx={{ fontSize: "32px" }} />
                  </IconButton>
                </Tooltip>
                <Tooltip
                  title={<Typography fontSize={14}>Lite Logs</Typography>}
                  placement="right"
                >
                  <IconButton
                    aria-label="Download Lite Logs"
                    color="default"
                    onClick={downloadDBlite}
                  >
                    <DownloadForOfflineIcon sx={{ fontSize: "32px" }} />
                  </IconButton>
                </Tooltip>
                {/* </ThemeProvider> */}
              </header>
              <NoteList
                setCurrentNote={setCurrentNote}
                setShowbar={setShowbar}
                currentNote={currentNote}
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
                      color="primary"
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
                      color: "#333",
                    }}
                  >
                    hci@ucla
                  </p>
                </div>
              </>
            </div>
          ),
        }[showbar]
      }
    </>
  );
}
