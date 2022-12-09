import React, { useEffect, useRef, useState } from "react";
import * as Plot from "@observablehq/plot";
import { db } from "../Dexie/db";

interface LineData {
  noteid: number;
  writingtime: number;
  pausetime: number;
}

export default function DailyTimePlot() {
  const plotRef = useRef<any>();
  const [lineData, setLineData] = useState<LineData[] | null>(null);
  const [noteIds, setNoteIds] = useState<number[] | null>(null);
  const [pauses, setPauses] = useState<number[] | null>(null);
  const [times, setTimes] = useState<number[] | null>(null);

  async function getNotes() {
    let mynotes = await db.notes.toArray();
    // reverse and get last 7
    let ids = mynotes.slice(-7).map((note) => note.id!);
    setNoteIds(ids);
  }

  async function getTimes() {
    if (noteIds === null) return;
    let times = [];
    for (let i = 0; i < noteIds.length; i++) {
      let note = await db.notes.get(noteIds[i]);
      times.push(note!.timeduration);
    }
    setTimes(times);
  }

  async function getPauses() {
    if (noteIds === null) return;
    let pauses = [];
    for (let i = 0; i < noteIds.length; i++) {
      let pauselog = await db.timelogs
        .where("note")
        .equals(noteIds[i])
        .toArray();
      let pausetime = pauselog.reduce((acc, curr) => {
        return acc + curr.pause!;
      }, 0);
      pauses.push(pausetime);
    }

    setPauses(pauses);
  }

  useEffect(() => {
    getNotes();
  }, []);

  useEffect(() => {
    if (noteIds === null) return;
    getTimes();
    getPauses();
  }, [noteIds]);

  useEffect(() => {
    if (pauses === null || times === null) return;
    let plotdata = noteIds?.map((id, index) => {
      return {
        noteid: index + 1,
        writingtime: times![index],
        pausetime: pauses![index],
      };
    });

    setLineData(plotdata!);
    // console.log("plotData()", plotdata);
  }, [pauses, times]);

  useEffect(() => {
    if (lineData === null) return;
    const chart = Plot.plot({
      height: 280,
      inset: 10,
      grid: true,
      x: {
        domain: lineData.map((val) => val.noteid),
        label: "Most Recent Entries →",
        tickFormat: (d: any) => (d % 1 !== 0 ? null : d),
      },
      y: {
        label: "↑ Time (min)",
        zero: true,
        domain: [
          0,
          Math.max(...lineData.map((o) => o.writingtime)) / 60000 + 10,
        ],
      },
      marks: [
        Plot.areaY(lineData, {
          x: "noteid",
          y: (d: any) => d.writingtime / 60000,
          fill: "#ccc",
          fillOpacity: 0.5,
        }),
        Plot.line(lineData, {
          x: "noteid",
          y: (d: any) => d.writingtime / 60000,
          marker: "circle",
        }),
        Plot.areaY(lineData, {
          x: "noteid",
          y: (d: any) => d.pausetime / 60000,
          fill: "#ff9c9c",
          fillOpacity: 0.5,
        }),
        Plot.line(lineData, {
          x: "noteid",
          y: (d: any) => d.pausetime / 60000,
          marker: "circle",
          stroke: "#fc1717",
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
      <p>
        Total writing time & <span style={{ color: "red" }}>pause time</span>
      </p>
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
