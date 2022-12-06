/**
 * MAKES QUERIES HERE FOR PREPARING DATASETS
 */

import { useEffect, useState } from "react";
import { db } from "../Dexie/db";
import BarPlot from "./BarPlot";
import DailyTimePlot from "./DailyTimePlot";
import UEDLine from "./UEDLine";
import WordCountPlot from "./WordCountPlot";

export default function GraphBuilder() {
  const [Nnotes, setNnotes] = useState<number | null>(null);

  const getdata = async () => {
    let x = await db.notes.toArray();
    setNnotes(x.length);
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
      {Nnotes! < 2 ? null : (
        <>
          {/* <MarksPlot graphNote={graphNote!} /> */}
          <DailyTimePlot />
          <WordCountPlot />
          <BarPlot />
          {/* <UEDLine /> */}
        </>
      )}
    </div>
  );
}
