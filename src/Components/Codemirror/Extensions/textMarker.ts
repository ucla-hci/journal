import {
  EditorView,
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { db, Highlight } from "../../Dexie/db";

async function flipPopup() {
  let y = await db.popups.update(1, { display: true });
}

export function l2underline(highlight: Highlight) {
  return ViewPlugin.fromClass(
    class {
      // pos: {from: number, to: number};
      myDeco: DecorationSet;
      constructor(view: EditorView) {
        let e = new RangeSetBuilder<Decoration>();
        e.add(
          highlight!.pos.from,
          highlight!.pos.to,
          Decoration.mark({
            class: "cm-underline",
          })
        );
        this.myDeco = e.finish();
        let root = document.documentElement;
        root.style.setProperty("--analysis-highlight", highlight.color!);
        setTimeout(() => {
          let p = document.getElementsByClassName(
            "cm-underline"
          )[0] as HTMLElement;
          console.log("p", p);
          if (p !== undefined) {
            p.onclick = flipPopup;
          }
        }, 10);
        // console.log("highlight color", highlight);
      }
      update(u: ViewUpdate) {
        if (u.docChanged || u.viewportChanged) {
          this.myDeco = this.myDeco.map(u.changes);
        }
      }
    },
    {
      decorations: (instance) => instance.myDeco,
    }
  );
}
