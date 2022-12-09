import { useEffect, useRef, useState } from "react";
import * as Plot from "@observablehq/plot";
import { db } from "../Dexie/db";
import { dev_dict } from "../expressoDictionary";

let colors = {
  l2a: "#287db5",
  l2b: "#D15B17",
  l2c: "#D181BC",
  // l2b: "#287db5",
  // l2c: "#287db5",
  l2d: "#d3cd57",
  l2e: "#4b2a7e",
  l2f: "#44aa38",
} as { [key: string]: string };

export default function BarPlot() {
  const plotRef = useRef<any>();
  const [lineData, setLineData] = useState<
    | {
        letter: string;
        frequency: number;
      }[]
    | null
  >(null);
  const [concatContent, setConcatContent] = useState<string | null>(null);

  const getcontent = async () => {
    let mynotes = await db.notes.toArray();
    let content = mynotes.slice(-7).reduce((acc, curr) => {
      return acc + curr.content;
    }, "");
    setConcatContent(content);
  };

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

    contentarray.forEach((word) => {
      for (let i = 0; i < dev_dict.length; i++) {
        if (dev_dict[i].words.includes(word.toLowerCase())) {
          categories.push({
            strategy_code: dev_dict[i].strategy_code,
            // category_number: dev_dict[i].category_number,
          });
        }
      }
    });

    let emptycount = { l2a: 0, l2b: 0, l2c: 0, l2d: 0, l2e: 0, l2f: 0 } as {
      [key: string]: number;
    };
    const count = categories.reduce((acc, curr) => {
      acc[curr.strategy_code.toLowerCase()] += 1;
      return acc;
    }, emptycount);
    // console.log("barplotcount:", count);

    let namemapper = {
      l2a: "Judgement",
      l2b: "Cognitive Distortions",
      l2c: "Harmful Self-talk",
      l2d: "Common Symptom Indicators",
      l2e: "Pronoun Perspectives",
      l2f: "Healthy Patterns",
    } as { [key: string]: string };

    let plotdata = Object.entries(count).map((pair) => {
      return {
        letter: namemapper[pair[0]],
        frequency: pair[1],
        color: colors[pair[0]],
      };
    });
    setLineData(plotdata);
  }, [concatContent]);

  useEffect(() => {
    if (lineData === null) return;
    const chart = Plot.plot({
      height: 280,
      marginBottom: 100,
      x: {
        domain: [
          "Judgement",
          "Cognitive Distortions",
          "Harmful Self-talk",
          "Common Symptom Indicators",
          "Pronoun Perspectives",
          "Healthy Patterns",
        ],
        label: "Thought Categories",
        tickRotate: "-36",
      },
      y: {
        grid: true,
        label: "↑ Count",
        domain: [0, Math.max(...lineData.map((o) => o.frequency)) + 4],
      },
      marks: [
        Plot.barY(lineData, {
          x: "letter",
          y: "frequency",
          fill: "color",
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
      <p>Aggregate analysis</p>
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
