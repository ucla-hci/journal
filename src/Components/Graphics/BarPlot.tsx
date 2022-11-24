import React, { useEffect, useRef, useState } from "react";
import * as Plot from "@observablehq/plot";
import { db } from "../Dexie/db";
import { dict_temp, dict_temp_reduced } from "../expressoDictionary";

export default function BarPlot() {
  const plotRef = useRef<any>();
  const [lineData, setLineData] = useState<{ [key: string]: number } | null>(
    null
  );
  const [concatContent, setConcatContent] = useState<string | null>(null);

  const getcontent = async () => {
    let mynotes = await db.notes.toArray();
    let content = mynotes.slice(-7).reduce((acc, curr) => {
      return acc + curr.content;
    }, "");
    console.log("concatenated content:", content);
    setConcatContent(content);
  };

  const alphabet = [
    { letter: "Depression/Anxiety", frequency: 10 },
    { letter: "Stress", frequency: 20 },
    { letter: "Positive Adjectives", frequency: 50 },
    { letter: "Negative Adjectives", frequency: 23 },
    { letter: "Should Statements", frequency: 53 },
    { letter: "Overgeneralization", frequency: 11 },
    { letter: "First Pronound", frequency: 2 },
    { letter: "Self-talk", frequency: 5 },
  ];

  useEffect(() => {
    getcontent();
  }, []);

  useEffect(() => {
    let categories = [] as { [key: string]: string }[];
    let contentarray = concatContent
      ?.toLowerCase()
      .replace(/[",!. ():?–-]|[^\S]/gu, " ")
      .split(" ");
    if (contentarray === undefined) return;

    // contentarray = contentarray!.filter(function (word) {
    //   if (word === "") {
    //     return false;
    //   }
    //   return true;
    // });

    contentarray.forEach((word) => {
      for (let i = 0; i < dict_temp_reduced.length; i++) {
        if (dict_temp_reduced[i].Word === word.toLowerCase()) {
          categories.push({
            strategy_code: dict_temp_reduced[i].strategy_code,
            // category_number: dict_temp_reduced[i].category_number,
          });
        }
      }
    });

    console.log("categories", categories);
    console.log("categoriescount", categories);

    let emptycount = { l2a: 0, l2b: 0, l2c: 0 } as { [key: string]: number };
    const count = categories.reduce((acc, curr) => {
      acc[curr.strategy_code.toLowerCase()] += 1;
      return acc;
    }, emptycount);
    console.log("category count is:", count);
  }, [concatContent]);

  useEffect(() => {
    if (lineData === null) return;
    const chart = Plot.plot({
      height: 280,
      marginBottom: 100,
      x: {
        label: "Thought Categories",
        tickRotate: "-45",
      },
      y: {
        label: "Count",
      },
      marks: [
        Plot.barY(alphabet, { x: "letter", y: "frequency", fill: "letter" }),
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
      <div className="plotdiv" ref={plotRef}></div>
    </div>
  );
}
