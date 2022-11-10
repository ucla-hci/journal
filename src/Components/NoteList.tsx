import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./Dexie/db";
import { IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

interface NoteListProps {
  setCurrentNote: React.Dispatch<React.SetStateAction<Number | null>>;
  setShowbar: React.Dispatch<React.SetStateAction<"hide" | "show">>;
}

export default function NoteList({
  setCurrentNote,
  setShowbar,
}: NoteListProps) {
  const notes = useLiveQuery(
    async () => {
      // query dexie api
      const notes = (
        await db.notes.toCollection().sortBy("creationdate")
      ).reverse();

      return notes;
    }
    // vars that affect the query
  );

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
        <div
          className="notebrief"
          key={note.id}
          onClick={() => {
            setCurrentNote(note.id!);
            // hide menu
            setShowbar("hide");
          }}
        >
          <p>{note.title}</p>
          <p className="date">
            {new Date(note.creationdate).toLocaleString("en-US").split(",")[0]}
          </p>
          <IconButton
            onClick={async () => {
              await deleteNote(note.id);
              await updateNotes();
            }}
            aria-label="delete"
            color="primary"
          >
            <ClearIcon />
          </IconButton>
        </div>
      ))}
    </div>
  );
}
