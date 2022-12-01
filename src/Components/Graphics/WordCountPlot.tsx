import React, { useEffect, useRef, useState } from "react";
import * as Plot from "@observablehq/plot";
import { db } from "../Dexie/db";

export default function WordCountPlot() {
  const plotRef = useRef<any>();
  const [lineData, setLineData] = useState<
    | {
        day: number;
        nwords: number;
      }[]
    | null
  >(null);

  async function getWordCountData() {
    let mynotes = await db.notes.toArray();
    // reverse and get last 7
    let pairs = mynotes.slice(-7).map((note) => {
      return { day: note.id!, nwords: note.content.split(" ").length };
    });
    setLineData(pairs);
  }

  const driving = [
    { day: 1, nwords: 100 },
    { day: 2, nwords: 132 },
    { day: 3, nwords: 115 },
    { day: 4, nwords: 250 },
  ];

  useEffect(() => {
    getWordCountData();
  }, []);

  useEffect(() => {
    if (lineData === null) return;
    const chart = Plot.plot({
      height: 280,
      inset: 10,
      grid: true,
      x: {
        domain: lineData.map((val) => val.day),
        label: "Entries →",
        tickFormat: (d: any) => (d % 1 !== 0 ? null : d),
      },
      y: {
        label: "↑ Number of words",
        zero: true,
        nice: true,
      },
      marks: [
        Plot.line(lineData, {
          x: "day",
          y: "nwords",
          curve: "catmull-rom",
          marker: "circle",
        }),
      ],
    });

    plotRef.current.append(chart);
    return () => chart.remove();
  }, [lineData]);

  return (
    <div
      style={{
        border: "var(--borderdebug) red",
        width: "49%",
        marginTop: "10px",
      }}
    >
      <p>WordCount</p>
      <div className="plotdiv" ref={plotRef}></div>
    </div>
  );
}
