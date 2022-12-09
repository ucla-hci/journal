import React, { createContext, useState } from "react";
import { Highlight } from "../Components/Dexie/db";

export default function HighlightContext() {
  const [highlight, setHighlight] = useState<Highlight>({
    id: -1,
    pos: { from: 0, to: 0 },
    active: false,
    color: null,
  });

  function updateHighlight(val: Highlight) {
    setHighlight(val);
  }

  const HighlightContext = createContext({
    highlight: {
      id: -1,
      pos: { from: 0, to: 0 },
      active: false,
      color: null,
    } as Highlight,
    updateHighlight,
  });
  return HighlightContext;
}
