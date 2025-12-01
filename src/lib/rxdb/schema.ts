// ============================================================================
// FILE: src/lib/rxdb/schema.ts
// ============================================================================
import { RxJsonSchema } from 'rxdb';

/**
 * RxDB Schema for local-first data syncing.
 * Matches the data model in Spec D.
 */

export const claimSchema: RxJsonSchema<any> = {
  title: 'claim schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    projectId: { type: 'string' },
    text: { type: 'string' },
    domain: { type: 'string' },
    verdict: { type: 'string' },
    confidence: { type: 'number' },
    evidence: { 
      type: 'array',
      items: { type: 'object' } // simplified for JSON
    },
    tags: { 
      type: 'array',
      items: { type: 'string' }
    },
    updatedAt: { type: 'string' }
  },
  required: ['id', 'text', 'domain']
};

export const documentSchema: RxJsonSchema<any> = {
  title: 'document schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    url: { type: 'string' },
    title: { type: 'string' },
    domain: { type: 'string' },
    isRead: { type: 'boolean' }, // Crucial for red-tint UI
    isStarred: { type: 'boolean' },
    confidenceAggregate: { type: 'number' },
    metadata: { type: 'object' }
  },
  required: ['id', 'url']
};
