import { keymap } from "@codemirror/view";
import { sendToPy } from "./Extensions/sendToPy";
import { db } from "../Dexie/db";

export const keymaps = keymap.of([
  {
    key: "Escape",
    preventDefault: true,
    run: () => {
      db.placeholders.update(1, { active: false });
      return true;
    },
  },
  {
    key: "Control-Space",
    preventDefault: true,
    run: () => {
      // if disabled -> enable
      // if already enabled -> toggle <---- constraint to only at beginning? when start typing, change decoration
      toggleSuggestion();
      return true;
    },
  },
  {
    key: "Mod-p",
    preventDefault: true,
    run: sendToPy,
  },
]);

async function toggleSuggestion() {
  const res = await db.placeholders.toArray();
  if (res.length > 0) {
    if (res[0].active) {
      if (res[0].suggestion === "basic suggestion") {
        await db.placeholders.update(res[0].id!, {
          suggestion: "new suggestion",
        });
      } else {
        await db.placeholders.update(res[0].id!, {
          suggestion: "basic suggestion",
        });
      }
    } else {
      await db.placeholders.update(res[0].id!, {
        active: true,
        suggestion: "new suggestion",
      });
    }
  } else {
    await db.placeholders.add({
      active: true,
      suggestion: "basic suggestion",
    });
  }
  return;
}
