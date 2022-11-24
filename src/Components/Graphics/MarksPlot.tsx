import React, { useEffect, useRef, useState } from "react";
import * as Plot from "@observablehq/plot";
import { db } from "../Dexie/db";

export interface markplotdata {
  feature: string;
  timestamp: number;
}

export interface pauseplotdata {
  feature: string;
  timestampend: number;
  timestampstart: number;
}

interface MarksPlotProps {
  graphNote: number;
}

export default function MarksPlot({ graphNote }: MarksPlotProps) {
  const plotRef = useRef<any>();
  const [markData, setMarkData] = useState<markplotdata[]>();
  const [rectData, setRectData] = useState<pauseplotdata[]>();
  const features = [
    "L3rephrase",
    "L2sidebar",
    "L2popup",
    "L2autoanalysis",
    "L1autoexpressiveness",
    "L1singleexpressiveness",
    "pauses",
  ];

  const getpausedata = async (noteid: number) => {
    let req = await db.timelogs.where("note").equals(noteid).toArray();
    let y = req.map((value) => {
      return {
        feature: "pauses",
        timestampstart: value.timestep - value.pause!,
        timestampend: value.timestep,
      };
    });
    setRectData(y);
  };
  const getfeaturemarkdata = async (noteid: number) => {
    let req = await db.logs.where("note").equals(noteid).toArray();
    let y = req.map((value) => {
      return {
        feature: value.feature,
        timestamp: value.timestamp,
      };
    });
    setMarkData(y);
  };

  useEffect(() => {
    getpausedata(graphNote);
    getfeaturemarkdata(graphNote);
  }, []);

  useEffect(() => {
    if (markData === undefined) return;
    const chart = Plot.plot({
      marginLeft: 100,
      marginRight: 30,
      height: 264,
      grid: true,
      style: { backgroundColor: "#e0f5ee" },
      x: {
        label: "Time (min) →",
        transform: (d: number) => d / 60000,
        // inset: 100,
      },
      y: {
        domain: features,
        label: "Features",
      },
      marks: [
        Plot.ruleX([0]),
        Plot.tickX(markData, {
          x: "timestamp",
          y: "feature",
          stroke: "feature",
          strokeWidth: 4,
        }),
        Plot.barX(rectData, {
          x1: "timestampstart",
          x2: "timestampend",
          y: "feature",
          fill: "feature",
        }),
      ],
    });
    plotRef.current.append(chart);
    return () => chart.remove();
  }, [markData]);

  return (
    <div
      style={{
        border: "var(--borderdebug) red",
        width: "49%",
        marginTop: "10px",
      }}
    >
      {/* <button
        onClick={() => {
          console.log("markdata", markData);
          console.log("rectdata", rectData);
          setTrigger(!trigger);
        }}
      >
        printlogs
      </button> */}
      <div className="plotdiv" ref={plotRef}></div>
    </div>
  );
}
