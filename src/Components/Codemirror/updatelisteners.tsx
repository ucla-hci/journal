import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { SearchCursor, SearchQuery } from "@codemirror/search";
import {
  EditorSelection,
  EditorState,
  SelectionRange,
  StateEffect,
  StateField,
} from "@codemirror/state";

// do we need to extract Search to another file?
class Searcher {
  state: EditorState;
  target: string;

  constructor({ state, target }: { state: EditorState; target: string }) {
    this.state = state;
    this.target = target;
  }

  search(): { from: number; to: number }[] {
    var q = new SearchQuery({ search: this.target });
    var cursor = q.getCursor(this.state.doc) as SearchCursor;
    var searchresults = [];
    while (!cursor.done) {
      cursor.next();
      if (cursor.value.from < cursor.value.to) {
        // console.log("sc.value:", cursor.value);
        // console.log("found mid search");
        searchresults.push(
          EditorSelection.range(cursor.value.from, cursor.value.to)
        );
      }
    }
    return searchresults;
  }
}

const addHighlight = StateEffect.define<{ from: number; to: number }>({
  // HERE WE ARE DOING THE MODS TO THE EDITOR
  map: ({ from, to }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to),
  }),
});

const highlightField = StateField.define<DecorationSet>({
  // HERE WE CALL EFFECT AND MAP ASSIGNED THE MARK TO TRUE MATCHES
  create() {
    return Decoration.none;
  },
  update(highlights, tr) {
    highlights = highlights.map(tr.changes);
    // for (let effect of tr.effects)
    tr.effects.forEach((effect) => {
      if (effect.is(addHighlight)) {
        highlights = highlights.update({
          add: [highlightMark.range(effect.value.from, effect.value.to)],
        });
      }
    });
    return highlights;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const highlightMark = Decoration.mark({ class: "cm-highlight" });

const highlightTheme = EditorView.baseTheme({
  ".cm-highlight": { textDecoration: "underline 3px red" },
});

export function highlightSearch(view: EditorView) {
  var s = new Searcher({ state: view.state, target: "test" });
  var searchresults = s.search() as SelectionRange[];

  console.log(view.coordsAtPos(1));

  let effects: StateEffect<unknown>[] = searchresults // <------- should be a selection.ranges type
    .filter((r) => !r.empty)
    .map(({ from, to }) => {
      console.log("ADDING HIGHLIGHT");
      return addHighlight.of({ from, to });
    });

  if (!effects.length) {
    console.log("no effects :(");
    return false;
  }

  if (!view.state.field(highlightField, false))
    effects.push(StateEffect.appendConfig.of([highlightField, highlightTheme]));
  view.dispatch({ effects });
  console.log("appended effect");
  return false;
}
