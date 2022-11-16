import Dexie, { Table } from "dexie";
import "dexie-export-import";
import download from "downloadjs";

export interface Note {
  id?: number;
  title: string;
  content: string;
  creationdate: number;
  lastedit: number;
  timeduration: number;
  stats: {};
}

export interface Timelog {
  id?: number;
  note: number;
  pause: number | null;
  timestep: number;
}

export interface Logs {
  id?: number;
  assocnote: number;
  timestamp: number;
  feature:
    | "L1autoexpressiveness"
    | "L1singleexpressiveness"
    | "L2autoanalysis"
    | "L2popup"
    | "L2sidebar"
    | "L3rephrase";
  featurestate: "enable" | "dismiss" | "complete" | "disable" | "toggle";
  comments: any | null;
}

export interface Sidebar {
  id?: number;
  title: string;
  content: { [key: string]: string };
  display: boolean;
  rephrase: boolean;
}
export interface Popup {
  id?: number;
  title: string;
  content: string;
  display: boolean;
  location: { x: number; y: number };
}

export interface Placeholder {
  id?: number;
  origin: "L1" | "L3";
  active: boolean;
  suggestion: string;
  location: number;
  replace: { from: number; to: number } | null;
}

export class MySubClassedDexie extends Dexie {
  notes!: Table<Note>;
  sidebars!: Table<Sidebar>;
  popups!: Table<Popup>;
  placeholders!: Table<Placeholder>;
  timelogs!: Table<Timelog>;
  logs!: Table<Logs>;

  constructor() {
    super("myDatabase");
    this.version(4).stores({
      notes: "++id, title, content, creationdate, timeduration, stats",
    });
    this.version(5).stores({
      sidebars: "++id, title, content, display",
      popups: "++id, title, content, display, location",
    });
    this.version(7).stores({
      placeholders: "++id, active, suggestion",
    });
    this.version(8).stores({
      timelogs: "++id, note, pause, timestep",
    });
    this.version(9).stores({
      logs: "++id, assocnote, timestamp, feature",
    });
  }
}

export const db = new MySubClassedDexie();

export const downloadDB = async () => {
  try {
    const blob = await db.export({ prettyJson: true });
    download(blob, "dexie-export.json", "application/json");
  } catch (error) {
    console.error("" + error);
  }
};
