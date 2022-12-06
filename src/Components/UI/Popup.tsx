import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useLiveQuery } from "dexie-react-hooks";
import React, { useEffect, useRef } from "react";
import { db, Popup as popuptype } from "../Dexie/db";
import "../Styles/Popup.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export async function addSidebar() {}

const theme = createTheme({
  palette: {
    primary: {
      main: "#000",
    },
    secondary: {
      main: "#000059",
    },
  },
});

interface popupprops {
  setFeedbackbar: React.Dispatch<React.SetStateAction<boolean>>;
  currentNote: number | null;
  timespent: number;
}

export default function Popup({
  setFeedbackbar,
  currentNote,
  timespent,
}: popupprops) {
  const [show, setShow] = React.useState<boolean>(false);
  const [contents, setContents] = React.useState<popuptype | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        closePopup && closePopup();
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  async function closePopup() {
    const result = await db.popups.get(1);
    if (result !== undefined) {
      const ret = await db.popups.update(1, {
        display: false,
      });
    }
  }

  function addToDismiss(word: string, pos: { from: number; to: number }) {
    db.dismiss.add({
      note: currentNote!,
      word: word,
      pos: pos,
      timestamp: timespent,
      realtime: Date.now(),
    });
  }

  useEffect(() => {
    if (show) {
      db.logs.add({
        note: currentNote!,
        realtime: Date.now(),
        timestamp: timespent,
        feature: "L2popup",
        featurestate: "enable",
        comments: `title ${contents?.title!}`,
      });
    } else {
      db.logs.add({
        note: currentNote!,
        realtime: Date.now(),
        timestamp: timespent,
        feature: "L2popup",
        featurestate: "disable",
        comments: null,
      });
    }
  }, [show]);

  useLiveQuery(async () => {
    const result = await db.popups.get(1);
    if (result !== undefined) {
      if (result.display) {
        setContents(result);
        setShow(true);
      } else {
        setShow(false);
      }
    }
  });

  return (
    <div
      className="popup"
      ref={ref}
      style={{
        display: show ? "flex" : "none",
        left: contents?.location.x.toString() + "px",
        top: contents?.location.y.toString() + "px",
      }}
    >
      <div className="popup-header">
        <h4>{contents?.title}</h4>

        <IconButton onClick={closePopup} aria-label="delete">
          <CloseIcon />
        </IconButton>
      </div>
      <p
        style={{
          textAlign: "left",
          margin: "0px",
          flex: 1,
        }}
      >
        {contents?.content}
      </p>
      <div className="popup-buttons">
        <ThemeProvider theme={theme}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setFeedbackbar(true)}
            color="primary"
          >
            More
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              addToDismiss(contents?.triggerword!, contents?.wordlocation!);
              db.highlights.update(1, {
                active: false,
              });
              closePopup();
            }}
          >
            Dismiss
          </Button>
        </ThemeProvider>
      </div>
    </div>
  );
}
