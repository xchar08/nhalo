// ============================================================================
// FILE: src/lib/rxdb/db.ts
// ============================================================================
import { createRxDatabase, RxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { claimSchema, documentSchema } from './schema';

// Add plugins (dev mode only features should be conditional in real app)
// import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
// addRxPlugin(RxDBDevModePlugin);

let dbPromise: Promise<RxDatabase> | null = null;

export const createDatabase = async () => {
  const db = await createRxDatabase({
    name: 'halodb',
    storage: getRxStorageDexie(),
    ignoreDuplicate: true // Helpful for hot reload in Next.js
  });

  await db.addCollections({
    claims: {
      schema: claimSchema
    },
    documents: {
      schema: documentSchema
    }
  });

  return db;
};

export const getDatabase = () => {
  if (!dbPromise) {
    dbPromise = createDatabase();
  }
  return dbPromise;
};
