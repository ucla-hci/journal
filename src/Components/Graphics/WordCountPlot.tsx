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
    let pairs = mynotes.slice(-7).map((note, idx) => {
      return { day: idx + 1, nwords: note.content.split(" ").length - 1 };
    });
    setLineData(pairs);
  }

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
        label: "Most Recent Entries →",
        tickFormat: (d: any) => (d % 1 !== 0 ? null : d),
      },
      y: {
        label: "↑ Number of words",
        zero: true,
        nice: true,
        domain: [0, Math.max(...lineData.map((o) => o.nwords)) + 10],
      },
      marks: [
        Plot.line(lineData, {
          x: "day",
          y: "nwords",
          // curve: "catmull-rom",
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
      <div
        className="plotdiv"
        ref={plotRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      ></div>
    </div>
  );
}
