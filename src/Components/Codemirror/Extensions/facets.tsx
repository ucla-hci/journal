import { Extension, Facet } from "@codemirror/state";

interface suggestiondata {
  target?: string;
  from?: number;
  to?: number;
}

export const suggestionfacet = Facet.define<suggestiondata, suggestiondata>({
  combine: (values) => values[0], // CAREFUL
});

export function setSuggestionFacet(options: suggestiondata = {}): Extension {
  return [options.target ? suggestionfacet.of(options) : []];
}
