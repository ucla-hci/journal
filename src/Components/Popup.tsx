import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useLiveQuery } from "dexie-react-hooks";
import React, { useEffect, useRef } from "react";
import { db, Popup as popuptype } from "./Dexie/db";
import "./Popup.css";

export async function addSidebar() {}

interface popupprops {
  setFeedbackbar: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Popup({ setFeedbackbar }: popupprops) {
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
        <Button
          size="small"
          variant="outlined"
          onClick={() => setFeedbackbar(true)}
        >
          Sidebar
        </Button>
        <Button size="small" variant="outlined">
          Dismiss
        </Button>
      </div>
    </div>
  );
}
