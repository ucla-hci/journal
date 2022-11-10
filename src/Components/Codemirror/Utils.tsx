/**
 * TODO: make Searcher >> this.target = dictionary
 *
 *
 */

import { EditorSelection, EditorState } from "@codemirror/state";
import { SearchCursor, SearchQuery } from "@codemirror/search";

// could adapt searcher for array filtering functions (see DemoTooltip)
// i.e. return true/false
export class Searcher {
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
        searchresults.push(
          EditorSelection.range(cursor.value.from, cursor.value.to)
        );
      }
    }
    return searchresults;
  }
}

export function getNmap(wordlist: string[], n: number): string[] {
  return wordlist;
}
