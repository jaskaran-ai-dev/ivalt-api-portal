import { DEMO_MODE } from "@/lib/demo";

// In demo mode, we never touch the database, so we export a stub
// that will throw a clear error if accidentally called.
let db: import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof import("./schema")>;

if (!DEMO_MODE) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local or enable NEXT_PUBLIC_DEMO_MODE=true");
  }
  const { drizzle } = require("drizzle-orm/postgres-js");
  const postgres = require("postgres");
  const schema = require("./schema");
  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  db = drizzle(client, { schema });
} else {
  // Demo stub — any call to db in demo mode is a bug
  db = new Proxy({} as any, {
    get(_target, prop) {
      return new Proxy(() => {}, {
        get(_t, _p) { return () => { throw new Error(`[DEMO] DB called (${String(prop)}). This is a bug — demo routes should short-circuit before hitting the DB.`); }; },
        apply() { throw new Error(`[DEMO] DB called. This is a bug.`); },
      });
    },
  });
}

export { db };
