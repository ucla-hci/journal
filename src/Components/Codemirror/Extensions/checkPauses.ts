/**
 * use this to check edit time and pauses
 *
 * Be careful that states reset often.
 */

import { EditorView } from "@codemirror/view";
import { db, Note } from "../../Dexie/db";

export function timeChecker(
  note: Note,
  setTimespent: React.Dispatch<React.SetStateAction<number>>
) {
  var timeaccumulator = note.timeduration; //start =0
  var lasttime = Date.now();
  var pauseThreshold_ms = 3000;

  return EditorView.domEventHandlers({
    keydown(event, view) {
      let timenow = Date.now();
      timeaccumulator += timenow - lasttime;
      let pause = null as number | null;
      if (timenow - lasttime > pauseThreshold_ms) {
        // only log pauses, to minimize logsize
        pause = timenow - lasttime;
        db.timelogs.add({
          note: note.id!,
          pause: pause,
          timestep: timeaccumulator,
        });
      }
      // keep track of writeduration
      setTimespent(timeaccumulator);
      db.notes.update(note.id!, { timeduration: timeaccumulator });
      lasttime = timenow;
    },
  });
}
