import Dexie, { Table } from "dexie";

export interface Note {
  id?: number;
  title: string;
  content: string;
  creationdate: number;
  lastedit: number;
  timeduration: number;
  stats: {};
}

export interface Sidebar {
  id?: number;
  title: string;
  content: {};
  display: boolean;
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
  active: boolean;
  suggestion: string;
}

export class MySubClassedDexie extends Dexie {
  notes!: Table<Note>;
  sidebars!: Table<Sidebar>;
  popups!: Table<Popup>;
  placeholders!: Table<Placeholder>;

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
  }
}

export const db = new MySubClassedDexie();
