import React, { useEffect, useRef, useState } from "react";
import * as Plot from "@observablehq/plot";
import { db } from "../Dexie/db";

export default function UEDLine() {
  const plotRef = useRef<any>();
  const [uedData, setUedData] = useState<any | null>(1);

  const ued = [
    { day: 1, valence: 100 },
    { day: 2, valence: 132 },
    { day: 3, valence: 115 },
    { day: 4, valence: 250 },
  ];

  useEffect(() => {
    if (uedData === null) return;
    const chart = Plot.plot({
      height: 280,
      inset: 10,
      grid: true,
      x: {
        domain: ued.map((val) => val.day),
        label: "Days →",
      },
      y: {
        label: "↑ Valence (unpleasant - pleasant)",
        zero: true,
        domain: [0, 500],
      },
      marks: [
        Plot.line(ued, {
          x: "day",
          y: "valence",
          curve: "catmull-rom",
          marker: "circle",
        }),
      ],
    });

    plotRef.current.append(chart);
    return () => chart.remove();
  }, [uedData]);

  return (
    <div
      style={{
        border: "var(--borderdebug) red",
        width: "49%",
        marginTop: "10px",
      }}
    >
      <p>Emotion Dynamics (NOT IMPLEMENTED)</p>
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
