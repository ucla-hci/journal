import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import {
  StateField,
  StateEffect,
  EditorSelection,
  SelectionRange,
} from "@codemirror/state";
import { annotation1 } from "../keymaps";
import { Highlight } from "../../Dexie/db";

const addUnderline = StateEffect.define<{ from: number; to: number }>({
  map: ({ from, to }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to),
  }),
});

export const underlineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(underlines, tr) {
    underlines = underlines.map(tr.changes);
    for (let e of tr.effects)
      if (e.is(addUnderline)) {
        underlines = underlines.update({
          add: [underlineMark.range(e.value.from, e.value.to)],
        });
      }
    return underlines;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const underlineMark = Decoration.mark({ class: "cm-underline" });

const underlineTheme = EditorView.baseTheme({
  ".cm-underline": { textDecoration: "underline 3px red" },
});

export function underlineSelection(view: EditorView, highlight: Highlight) {
  // let deco = Decoration.mark({ class: "cm-underline" }).range(
  //   highlight.pos.from,
  //   highlight.pos.to
  // );
  // return Decoration.set(deco);

  // make selection
  let sel = EditorSelection.create([
    SelectionRange.fromJSON({
      from: highlight!.pos.from,
      to: highlight!.pos.to,
    }),
  ]);

  let effects: StateEffect<unknown>[] = sel.ranges.map(({ from, to }) =>
    addUnderline.of({ from, to })
  );

  view.dispatch({ effects });

  // let effects: StateEffect<unknown>[] = addUnderline.of({from: highlight!.pos.from, to:highlight!.pos.to });
  if (!effects.length) return [];

  if (!view.state.field(underlineField, false))
    effects.push(StateEffect.appendConfig.of([underlineField, underlineTheme]));
  view.dispatch({ effects });
  return [];
}
