// ============================================================================
// FILE: src/lib/config/knowledge-base.ts
// ============================================================================
export type SourceCategory =
  | 'university'
  | 'industry'
  | 'government'
  | 'startup'
  | 'github'
  | 'think-tank'
  | 'media'
  | 'archive';

export interface ResearchSource {
  name: string;
  institution?: string;
  url: string;
  category: SourceCategory;
  focus: string[];
  region: 'NA' | 'EU' | 'ASIA' | 'GLOBAL' | 'ME' | 'LATAM' | 'AFRICA';

  /**
   * Optional RSS endpoints.
   * If present, rss-aggregator will use these directly (no guessing).
   */
  rss?: string[];

  /**
   * Optional crawl settings for policy-aware ingestion.
   * Keep conservative defaults; universities may block aggressive crawling.
   */
  crawl?: {
    enabled: boolean;
    maxDepth: number; // recommended 0–2 for “polite” runs
    maxPagesPerRun: number;
    minDelayMs: number;
  };
}

export const GLOBAL_SOURCES: ResearchSource[] = [
  // =================================================================
  // 1. NORTH AMERICAN UNIVERSITIES (The Heavy Hitters)
  // =================================================================
  { name: 'Stanford AI Lab', institution: 'Stanford', url: 'https://ai.stanford.edu', category: 'university', focus: ['ML', 'AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 20, minDelayMs: 900 } },
  { name: 'Stanford HAI', institution: 'Stanford', url: 'https://hai.stanford.edu', category: 'university', focus: ['Human-AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'Stanford Bio-X', institution: 'Stanford', url: 'https://biox.stanford.edu', category: 'university', focus: ['Biomedical'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'SLAC Accelerator', institution: 'Stanford', url: 'https://www6.slac.stanford.edu', category: 'university', focus: ['Physics'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },

  { name: 'MIT CSAIL', institution: 'MIT', url: 'https://csail.mit.edu', category: 'university', focus: ['AI', 'Robotics'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 20, minDelayMs: 900 } },
  { name: 'MIT Media Lab', institution: 'MIT', url: 'https://media.mit.edu', category: 'university', focus: ['Digital Media'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'MIT Quest for Intelligence', institution: 'MIT', url: 'https://quest.mit.edu', category: 'university', focus: ['AI Foundations'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 12, minDelayMs: 900 } },
  { name: 'MIT Lincoln Lab', institution: 'MIT', url: 'https://www.ll.mit.edu', category: 'university', focus: ['Defense', 'Cybersecurity'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 12, minDelayMs: 1100 } },

  { name: 'Berkeley AI Research (BAIR)', institution: 'UC Berkeley', url: 'https://bair.berkeley.edu', category: 'university', focus: ['AI', 'Robotics'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 20, minDelayMs: 900 } },
  { name: 'Berkeley RISE Lab', institution: 'UC Berkeley', url: 'https://rise.cs.berkeley.edu', category: 'university', focus: ['Systems'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'Berkeley SkyDeck', institution: 'UC Berkeley', url: 'https://skydeck.berkeley.edu', category: 'university', focus: ['Startups'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },

  { name: 'CMU Robotics Institute', institution: 'Carnegie Mellon', url: 'https://www.ri.cmu.edu', category: 'university', focus: ['Robotics'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'CMU Language Tech', institution: 'Carnegie Mellon', url: 'https://www.lti.cs.cmu.edu', category: 'university', focus: ['NLP', 'Speech'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },

  { name: 'Harvard SEAS AI', institution: 'Harvard', url: 'https://cse-lab.seas.harvard.edu', category: 'university', focus: ['ML'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Harvard Data Science', institution: 'Harvard', url: 'https://datascience.harvard.edu', category: 'university', focus: ['Data Science'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },

  { name: 'Columbia Vision Lab', institution: 'Columbia', url: 'https://www1.cs.columbia.edu/CAVE/', category: 'university', focus: ['Computer Vision'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Yale AI Lab', institution: 'Yale', url: 'https://cpsc.yale.edu/research', category: 'university', focus: ['AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Princeton ML Group', institution: 'Princeton', url: 'https://www.cs.princeton.edu/research', category: 'university', focus: ['ML', 'Optimization'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },

  { name: 'Caltech Neuroscience', institution: 'Caltech', url: 'https://neuroscience.caltech.edu', category: 'university', focus: ['Neuroscience'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Georgia Tech GVU', institution: 'Georgia Tech', url: 'https://www.gvu.gatech.edu', category: 'university', focus: ['HCI', 'Graphics'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Purdue Quantum Lab', institution: 'Purdue', url: 'https://engineering.purdue.edu/QCL', category: 'university', focus: ['Quantum'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: 'Vector Institute', institution: 'U of Toronto', url: 'https://www.vectorinstitute.ai', category: 'university', focus: ['AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },

  // =================================================================
  // 2. INTERNATIONAL UNIVERSITIES (Asia & Europe)
  // =================================================================
  { name: 'Tsinghua AIR', institution: 'Tsinghua', url: 'https://air.tsinghua.edu.cn/en/', category: 'university', focus: ['Industrial AI'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Tsinghua Brain & Cognition', institution: 'Tsinghua', url: 'https://brain.tsinghua.edu.cn/en/', category: 'university', focus: ['Cognitive AI'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Peking U CS', institution: 'Peking U', url: 'https://cs.pku.edu.cn', category: 'university', focus: ['CS Research'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'NTU MARS Lab', institution: 'NTU Singapore', url: 'http://marslab.tech', category: 'university', focus: ['Robotics'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'NUS Computing', institution: 'NUS', url: 'https://www.comp.nus.edu.sg', category: 'university', focus: ['Systems'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },

  { name: 'Cambridge Cavendish', institution: 'Cambridge', url: 'https://www.phy.cam.ac.uk', category: 'university', focus: ['Physics'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Oxford CS', institution: 'Oxford', url: 'https://www.cs.ox.ac.uk', category: 'university', focus: ['Verification', 'AI'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'ETH Zurich CS', institution: 'ETH Zurich', url: 'https://www.inf.ethz.ch', category: 'university', focus: ['Systems'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'TUM CS', institution: 'TU Munich', url: 'https://www.cs.tum.de', category: 'university', focus: ['AI', 'Systems'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },

  // =================================================================
  // 3. TECH INDUSTRY GIANTS
  // =================================================================
  { name: 'Google AI', url: 'https://ai.google', category: 'industry', focus: ['Deep Learning'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 20, minDelayMs: 700 } },
  { name: 'DeepMind', url: 'https://www.deepmind.com', category: 'industry', focus: ['AGI', 'AlphaFold'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 20, minDelayMs: 700 } },
  { name: 'Microsoft Research', url: 'https://www.microsoft.com/en-us/research/', category: 'industry', focus: ['General AI'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 20, minDelayMs: 700 } },
  { name: 'IBM Research', url: 'https://www.research.ibm.com', category: 'industry', focus: ['Quantum'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 700 } },
  { name: 'NVIDIA Research', url: 'https://www.nvidia.com/en-us/research/', category: 'industry', focus: ['GPU', 'AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 700 } },
  { name: 'Meta AI (FAIR)', url: 'https://ai.meta.com/research/', category: 'industry', focus: ['Vision', 'LLMs'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 700 } },
  { name: 'OpenAI', url: 'https://openai.com/research', category: 'industry', focus: ['LLMs', 'AGI'], region: 'NA', rss: ['https://openai.com/blog/rss.xml'], crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 20, minDelayMs: 700 } },
  { name: 'Anthropic', url: 'https://www.anthropic.com/research', category: 'industry', focus: ['Safety'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 700 } },

  // =================================================================
  // 5. GOVERNMENT & RESEARCH ORGS (Science)
  // =================================================================
  { name: 'CERN LHC', url: 'https://home.cern', category: 'government', focus: ['Particle Physics'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'NASA JPL', url: 'https://www.jpl.nasa.gov', category: 'government', focus: ['Space AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },

  // =================================================================
  // 6. STARTUPS & GITHUB
  // =================================================================
  { name: 'Hugging Face', url: 'https://huggingface.co/blog', category: 'startup', focus: ['Open Source'], region: 'GLOBAL', rss: ['https://huggingface.co/blog/feed.xml'], crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 20, minDelayMs: 700 } },
  { name: 'Mistral', url: 'https://mistral.ai/news', category: 'startup', focus: ['LLMs'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'PyTorch Repo', url: 'https://github.com/pytorch/pytorch', category: 'github', focus: ['Framework'], region: 'GLOBAL', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },

  // =================================================================
  // 15. MEDIA (Optional RSS handled in rss-aggregator TRUSTED_OVERRIDES)
  // =================================================================
  { name: 'Reuters', url: 'https://www.reuters.com', category: 'media', focus: ['Global News'], region: 'GLOBAL', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
];

/**
 * Helper: Extract domain from URL to check against knowledge base
 */
export function getDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Helper: Check if a URL belongs to a priority source
 */
export function isPrioritySource(url: string): boolean {
  const domain = getDomain(url);
  return GLOBAL_SOURCES.some((source) => url.includes(source.url) || domain.includes(getDomain(source.url)));
}

/**
 * RSS seeds for aggregator:
 * - prefer explicit rss[] on sources
 * - otherwise fall back to “guessing” only if desired by aggregator
 */
export function getRssSeeds() {
  return GLOBAL_SOURCES.flatMap((s) =>
    (s.rss || []).map((rssUrl) => ({
      id: s.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: s.name,
      rssUrl,
      category: s.category,
      region: s.region,
      institution: s.institution,
    }))
  );
}

export function getCrawlSeeds() {
  return GLOBAL_SOURCES.filter((s) => s.crawl?.enabled);
}
