import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { createSeed } from "./seed";
import type { Database } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

let cache: Database | null = null;
let queue: Promise<void> = Promise.resolve();

function load(): Database {
  if (cache) return cache;
  try {
    cache = JSON.parse(readFileSync(DB_PATH, "utf8")) as Database;
    return cache;
  } catch {
    cache = createSeed();
    persist(cache);
    return cache;
  }
}

function persist(db: Database) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export async function readDb(): Promise<Database> {
  return load();
}

export async function updateDb<T>(mutator: (db: Database) => T): Promise<T> {
  const run = queue.then(() => {
    const db = load();
    const result = mutator(db);
    persist(db);
    cache = db;
    return result;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function resetDb() {
  cache = createSeed();
  persist(cache);
  return cache;
}
