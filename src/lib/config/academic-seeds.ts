// ============================================================================
// FILE: src/lib/config/academic-seeds.ts
// ============================================================================
export type AcademicSeedTarget = { label: string; url: string };

export const ACADEMIC_SEED_TARGETS: AcademicSeedTarget[] = [
  { label: 'Harvard SEAS news', url: 'https://www.seas.harvard.edu/news' },
  { label: 'Harvard CS (SEAS) directory', url: 'https://www.seas.harvard.edu/computer-science' },
  { label: 'MIT CSAIL news', url: 'https://www.csail.mit.edu/news' },
  { label: 'Stanford AI Lab news', url: 'https://ai.stanford.edu/blog/' },
  { label: 'Berkeley AI Research (BAIR) blog', url: 'https://bair.berkeley.edu/blog/' },
];

export function getAcademicSeedTargets() {
  return ACADEMIC_SEED_TARGETS;
}
