import React, { useContext } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../Dexie/db";
import { IconButton, Tooltip } from "@mui/material";
// import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";

interface NoteListProps {
  setCurrentNote: React.Dispatch<React.SetStateAction<number | null>>;
  setShowbar: React.Dispatch<React.SetStateAction<"hide" | "show">>;
  currentNote: number | null;
}

export default function NoteList({
  setCurrentNote,
  setShowbar,
  currentNote,
}: NoteListProps) {
  const notes = useLiveQuery(async () => {
    const notes = (
      await db.notes.toCollection().sortBy("creationdate")
    ).reverse();

    return notes;
  });

  const deleteNote = async (id: number | undefined) => {
    if (id !== undefined) {
      await db.notes.delete(id);
    }
  };

  const updateNotes = async () => {
    let res = await db.notes.toArray();
    if (res.length > 0) {
      setCurrentNote(res[0].id!);
    } else {
      setCurrentNote(null);
    }
  };

  return (
    <div className="notelist">
      {notes?.map((note) => (
        <div className="notebrief-container">
          <div
            className={
              note.id === currentNote ? "notebrief selected" : "notebrief"
            }
            key={note.id}
            onClick={() => {
              setCurrentNote(note.id!);
              setShowbar("hide");
            }}
          >
            <p className="title">{note.title}</p>
            <p className="date">
              {
                new Date(note.creationdate)
                  .toLocaleString("en-US")
                  .split(",")[0]
              }
            </p>
          </div>

          {note.id === currentNote ? (
            <IconButton
              onClick={async () => {
                await deleteNote(note.id);
                await updateNotes();
                setShowbar("show");
              }}
              aria-label="delete"
              color="default"
            >
              <DeleteIcon />
            </IconButton>
          ) : null}
        </div>
      ))}
    </div>
  );
}
