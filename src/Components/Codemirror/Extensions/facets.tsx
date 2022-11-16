import { Facet } from "@codemirror/state";

interface suggestiondata {
  target?: string;
  from?: number;
  to?: number;
  replace?: { from: number; to: number } | null;
  origin?: "L1" | "L3";
}

export const suggestionfacet = Facet.define<suggestiondata, suggestiondata>({
  combine: (values) => values[0], // CAREFUL
});

export interface notemetadata {
  noteid: number;
  timeduration: number;
}

export const metadatafacet = Facet.define<notemetadata, notemetadata>({
  combine: (values) => values[0],
});
