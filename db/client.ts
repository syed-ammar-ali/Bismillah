import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

export const DATABASE_NAME = 'bismillah.db';

export const expoDb = SQLite.openDatabaseSync(DATABASE_NAME);

// Enable WAL mode for concurrency and ensure foreign key cascades work
expoDb.execSync('PRAGMA journal_mode = WAL;');
expoDb.execSync('PRAGMA foreign_keys = ON;');

export const db = drizzle(expoDb, { schema });
export type AppDatabase = typeof db;
