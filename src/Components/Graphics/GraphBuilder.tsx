/**
 * MAKES QUERIES HERE FOR PREPARING DATASETS
 */

import React, { useEffect, useState } from "react";
import { db } from "../Dexie/db";
import BarPlot from "./BarPlot";
import DailyTimePlot from "./DailyTimePlot";
import LinesPlot from "./WordCountPlot";
import MarksPlot from "./MarksPlot";
import UEDLine from "./UEDLine";
import WordCountPlot from "./WordCountPlot";

export default function GraphBuilder() {
  const [graphNote, setGraphNote] = useState<number | null>(null);

  const getdata = async () => {
    let x = await db.notes.toArray();
    setGraphNote(x.slice(-1)[0].id!);
  };

  useEffect(() => {
    getdata();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
      }}
    >
      {graphNote === null ? null : (
        <>
          {/* <MarksPlot graphNote={graphNote!} /> */}
          <DailyTimePlot />
          <WordCountPlot />
          <BarPlot />
          <UEDLine />
        </>
      )}
    </div>
  );
}
