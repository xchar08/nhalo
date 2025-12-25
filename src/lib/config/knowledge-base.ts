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
  region: 'NA' | 'EU' | 'ASIA' | 'GLOBAL' | 'ME' | 'LATAM' | 'AFRICA' | 'OCEANIA';

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
  // 1. NORTH AMERICAN UNIVERSITIES (The Heavy Hitters & Major State Schools)
  // =================================================================
  // --- Stanford ---
  { name: 'Stanford AI Lab', institution: 'Stanford', url: 'https://ai.stanford.edu', category: 'university', focus: ['ML', 'AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 20, minDelayMs: 900 } },
  { name: 'Stanford HAI', institution: 'Stanford', url: 'https://hai.stanford.edu', category: 'university', focus: ['Human-AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'Stanford Bio-X', institution: 'Stanford', url: 'https://biox.stanford.edu', category: 'university', focus: ['Biomedical'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'SLAC Accelerator', institution: 'Stanford', url: 'https://www6.slac.stanford.edu', category: 'university', focus: ['Physics'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: 'Stanford CRFM', institution: 'Stanford', url: 'https://crfm.stanford.edu', category: 'university', focus: ['Foundation Models'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },

  // --- MIT ---
  { name: 'MIT CSAIL', institution: 'MIT', url: 'https://csail.mit.edu', category: 'university', focus: ['AI', 'Robotics'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 20, minDelayMs: 900 } },
  { name: 'MIT Media Lab', institution: 'MIT', url: 'https://media.mit.edu', category: 'university', focus: ['Digital Media'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'MIT Quest for Intelligence', institution: 'MIT', url: 'https://quest.mit.edu', category: 'university', focus: ['AI Foundations'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 12, minDelayMs: 900 } },
  { name: 'MIT Lincoln Lab', institution: 'MIT', url: 'https://www.ll.mit.edu', category: 'university', focus: ['Defense', 'Cybersecurity'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 12, minDelayMs: 1100 } },
  { name: 'MIT LIDS', institution: 'MIT', url: 'https://lids.mit.edu', category: 'university', focus: ['Systems', 'Control'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },

  // --- UC Berkeley ---
  { name: 'Berkeley AI Research (BAIR)', institution: 'UC Berkeley', url: 'https://bair.berkeley.edu', category: 'university', focus: ['AI', 'Robotics'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 20, minDelayMs: 900 } },
  { name: 'Berkeley RISE Lab', institution: 'UC Berkeley', url: 'https://rise.cs.berkeley.edu', category: 'university', focus: ['Systems'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'Berkeley SkyDeck', institution: 'UC Berkeley', url: 'https://skydeck.berkeley.edu', category: 'university', focus: ['Startups'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: 'Berkeley Simons Institute', institution: 'UC Berkeley', url: 'https://simons.berkeley.edu', category: 'university', focus: ['Theory'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },

  // --- CMU ---
  { name: 'CMU Robotics Institute', institution: 'Carnegie Mellon', url: 'https://www.ri.cmu.edu', category: 'university', focus: ['Robotics'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'CMU Language Tech', institution: 'Carnegie Mellon', url: 'https://www.lti.cs.cmu.edu', category: 'university', focus: ['NLP', 'Speech'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'CMU Machine Learning', institution: 'Carnegie Mellon', url: 'https://www.ml.cmu.edu', category: 'university', focus: ['ML'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'CMU CyLab', institution: 'Carnegie Mellon', url: 'https://www.cylab.cmu.edu', category: 'university', focus: ['Security'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },

  // --- Harvard ---
  { name: 'Harvard SEAS AI', institution: 'Harvard', url: 'https://cse-lab.seas.harvard.edu', category: 'university', focus: ['ML'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Harvard Data Science', institution: 'Harvard', url: 'https://datascience.harvard.edu', category: 'university', focus: ['Data Science'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Harvard Kempner Institute', institution: 'Harvard', url: 'https://kempner.harvard.edu', category: 'university', focus: ['Natural Intelligence'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },

  // --- Other Ivy & Top Tier ---
  { name: 'Columbia Vision Lab', institution: 'Columbia', url: 'https://www1.cs.columbia.edu/CAVE/', category: 'university', focus: ['Computer Vision'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Yale AI Lab', institution: 'Yale', url: 'https://cpsc.yale.edu/research', category: 'university', focus: ['AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Princeton ML Group', institution: 'Princeton', url: 'https://www.cs.princeton.edu/research', category: 'university', focus: ['ML', 'Optimization'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Cornell Tech', institution: 'Cornell', url: 'https://tech.cornell.edu/research', category: 'university', focus: ['Applied AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'UPenn GRASP', institution: 'UPenn', url: 'https://www.grasp.upenn.edu', category: 'university', focus: ['Robotics'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Brown Visual Computing', institution: 'Brown', url: 'https://visual.cs.brown.edu', category: 'university', focus: ['Graphics', 'Vision'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },

  // --- Major Public & Tech Schools ---
  { name: 'Caltech Neuroscience', institution: 'Caltech', url: 'https://neuroscience.caltech.edu', category: 'university', focus: ['Neuroscience'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Caltech CAST', institution: 'Caltech', url: 'https://cast.caltech.edu', category: 'university', focus: ['Autonomous Systems'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Georgia Tech GVU', institution: 'Georgia Tech', url: 'https://www.gvu.gatech.edu', category: 'university', focus: ['HCI', 'Graphics'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Georgia Tech ML', institution: 'Georgia Tech', url: 'https://ml.gatech.edu', category: 'university', focus: ['ML'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Purdue Quantum Lab', institution: 'Purdue', url: 'https://engineering.purdue.edu/QCL', category: 'university', focus: ['Quantum'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: 'UT Austin AI', institution: 'UT Austin', url: 'https://www.cs.utexas.edu/research/area/artificial-intelligence', category: 'university', focus: ['AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'UIUC AI Group', institution: 'UIUC', url: 'https://ai.illinois.edu', category: 'university', focus: ['AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'UW Allen AI', institution: 'U Washington', url: 'https://ai.cs.washington.edu', category: 'university', focus: ['AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 12, minDelayMs: 900 } },
  { name: 'UCSD AI', institution: 'UCSD', url: 'https://ai.ucsd.edu', category: 'university', focus: ['AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'UCLA Vision Lab', institution: 'UCLA', url: 'https://vision.ucla.edu', category: 'university', focus: ['Vision'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'UMich AI', institution: 'Michigan', url: 'https://ai.eecs.umich.edu', category: 'university', focus: ['AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'UMD Maryland Robotics', institution: 'UMD', url: 'https://robotics.umd.edu', category: 'university', focus: ['Robotics'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'USC ISI', institution: 'USC', url: 'https://www.isi.edu', category: 'university', focus: ['AI', 'Networking'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'JHU CLSP', institution: 'Johns Hopkins', url: 'https://www.clsp.jhu.edu', category: 'university', focus: ['Speech', 'Language'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Vector Institute', institution: 'U of Toronto', url: 'https://www.vectorinstitute.ai', category: 'university', focus: ['AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'Mila', institution: 'U Montreal/McGill', url: 'https://mila.quebec', category: 'university', focus: ['Deep Learning'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'Waterloo AI', institution: 'U Waterloo', url: 'https://uwaterloo.ca/artificial-intelligence-institute/', category: 'university', focus: ['Applied AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },

  // --- More North America (strong CS/AI schools) ---
  { name: 'UT Arlington CSE', institution: 'UT Arlington', url: 'https://www.uta.edu/academics/schools-colleges/engineering/academics/departments/cse', category: 'university', focus: ['CS', 'Engineering'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1200 } },
  { name: 'UT Arlington Research News', institution: 'UT Arlington', url: 'https://www.uta.edu/research/news', category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1200 } },
  { name: 'UT Dallas ECS', institution: 'UT Dallas', url: 'https://engineering.utdallas.edu', category: 'university', focus: ['CS', 'Engineering'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1200 } },
  { name: 'Rice D2K Lab', institution: 'Rice', url: 'https://d2k.rice.edu', category: 'university', focus: ['Data', 'AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 6, minDelayMs: 1200 } },
  { name: 'UC Davis AI', institution: 'UC Davis', url: 'https://ai.ucdavis.edu', category: 'university', focus: ['AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1200 } },
  { name: 'UC Irvine AI', institution: 'UC Irvine', url: 'https://www.ics.uci.edu/research', category: 'university', focus: ['AI', 'Systems'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1200 } },
  { name: 'NYU Center for Data Science', institution: 'NYU', url: 'https://cds.nyu.edu', category: 'university', focus: ['Data Science', 'ML'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'NYU Courant CS', institution: 'NYU', url: 'https://cims.nyu.edu', category: 'university', focus: ['CS', 'Math'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'University of Chicago Data Science Institute', institution: 'UChicago', url: 'https://datascience.uchicago.edu', category: 'university', focus: ['Data Science', 'AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1200 } },
  { name: 'University of Wisconsin–Madison CS', institution: 'UW–Madison', url: 'https://www.cs.wisc.edu', category: 'university', focus: ['CS'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1200 } },
  { name: 'Duke AI', institution: 'Duke', url: 'https://ai.duke.edu', category: 'university', focus: ['AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1200 } },
  { name: 'UNC Chapel Hill CS', institution: 'UNC', url: 'https://cs.unc.edu', category: 'university', focus: ['CS'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1200 } },
  { name: 'UToronto Scarborough DCS', institution: 'U of Toronto', url: 'https://www.utsc.utoronto.ca/cms', category: 'university', focus: ['Computing'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 6, minDelayMs: 1200 } },

  // =================================================================
  // 2. INTERNATIONAL UNIVERSITIES (Asia, Europe, Oceania)
  // =================================================================
  // --- Asia ---
  { name: 'Tsinghua AIR', institution: 'Tsinghua', url: 'https://air.tsinghua.edu.cn/en/', category: 'university', focus: ['Industrial AI'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Tsinghua Brain & Cognition', institution: 'Tsinghua', url: 'https://brain.tsinghua.edu.cn/en/', category: 'university', focus: ['Cognitive AI'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Peking U CS', institution: 'Peking U', url: 'https://cs.pku.edu.cn', category: 'university', focus: ['CS Research'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Peking U AI', institution: 'Peking U', url: 'https://ai.pku.edu.cn/en/', category: 'university', focus: ['AI'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'NTU MARS Lab', institution: 'NTU Singapore', url: 'http://marslab.tech', category: 'university', focus: ['Robotics'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'NTU MMLab', institution: 'NTU Singapore', url: 'https://www.mmlab-ntu.com', category: 'university', focus: ['Multimedia'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'NUS Computing', institution: 'NUS', url: 'https://www.comp.nus.edu.sg', category: 'university', focus: ['Systems'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'NUS AI', institution: 'NUS', url: 'https://ai.nus.edu.sg', category: 'university', focus: ['AI'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'HKUST CSE', institution: 'HKUST', url: 'https://cse.hkust.edu.hk/research/', category: 'university', focus: ['AI', 'Data'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'KAIST AI', institution: 'KAIST', url: 'https://gsai.kaist.ac.kr', category: 'university', focus: ['AI'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Seoul National U AI', institution: 'SNU', url: 'https://ai.snu.ac.kr', category: 'university', focus: ['AI'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Tokyo U IST', institution: 'U Tokyo', url: 'https://www.i.u-tokyo.ac.jp/edu/course/cs/index_e.shtml', category: 'university', focus: ['CS'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'RIKEN AIP', institution: 'RIKEN', url: 'https://aip.riken.jp/?lang=en', category: 'university', focus: ['Advanced Intelligence'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },

  // --- More Asia (top research ecosystems) ---
  { name: 'IIIT Hyderabad', institution: 'IIIT Hyderabad', url: 'https://www.iiit.ac.in', category: 'university', focus: ['AI', 'NLP', 'Systems'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1400 } },
  { name: 'IIT Bombay CSE', institution: 'IIT Bombay', url: 'https://www.cse.iitb.ac.in', category: 'university', focus: ['CS'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1400 } },
  { name: 'IIT Madras', institution: 'IIT Madras', url: 'https://www.iitm.ac.in', category: 'university', focus: ['Engineering', 'AI'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 6, minDelayMs: 1400 } },
  { name: 'HKU Computer Science', institution: 'HKU', url: 'https://www.cs.hku.hk', category: 'university', focus: ['CS'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1400 } },
  { name: 'CUHK Computer Science', institution: 'CUHK', url: 'https://www.cse.cuhk.edu.hk', category: 'university', focus: ['CS', 'AI'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1400 } },

  // --- Europe ---
  { name: 'Cambridge Cavendish', institution: 'Cambridge', url: 'https://www.phy.cam.ac.uk', category: 'university', focus: ['Physics'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Cambridge AI', institution: 'Cambridge', url: 'https://www.ai.cam.ac.uk', category: 'university', focus: ['AI'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Oxford CS', institution: 'Oxford', url: 'https://www.cs.ox.ac.uk', category: 'university', focus: ['Verification', 'AI'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Oxford VGG', institution: 'Oxford', url: 'https://www.robots.ox.ac.uk/~vgg/', category: 'university', focus: ['Vision'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'ETH Zurich CS', institution: 'ETH Zurich', url: 'https://www.inf.ethz.ch', category: 'university', focus: ['Systems'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'ETH Zurich AI Center', institution: 'ETH Zurich', url: 'https://ai.ethz.ch', category: 'university', focus: ['AI'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'EPFL AI', institution: 'EPFL', url: 'https://ai.epfl.ch', category: 'university', focus: ['AI'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'TUM CS', institution: 'TU Munich', url: 'https://www.cs.tum.de', category: 'university', focus: ['AI', 'Systems'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'MPI Informatics', institution: 'Max Planck', url: 'https://www.mpi-inf.mpg.de', category: 'university', focus: ['Informatics'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'MPI Intelligent Systems', institution: 'Max Planck', url: 'https://is.mpg.de', category: 'university', focus: ['Robotics', 'ML'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Inria', institution: 'Inria', url: 'https://www.inria.fr/en', category: 'university', focus: ['Digital Science'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'UCL AI', institution: 'UCL', url: 'https://www.ucl.ac.uk/ai-centre', category: 'university', focus: ['AI'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Imperial College AI', institution: 'Imperial', url: 'https://www.imperial.ac.uk/artificial-intelligence', category: 'university', focus: ['AI'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'KTH Robotics', institution: 'KTH', url: 'https://www.kth.se/is/rpl', category: 'university', focus: ['Robotics'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Amsterdam ELLIS', institution: 'UvA', url: 'https://ellis.eu/units/amsterdam', category: 'university', focus: ['ML'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },

  // --- More Europe ---
  { name: 'University of Edinburgh Informatics', institution: 'Edinburgh', url: 'https://www.ed.ac.uk/informatics', category: 'university', focus: ['AI', 'CS'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'University of Edinburgh NLP', institution: 'Edinburgh', url: 'https://edinburghnlp.inf.ed.ac.uk', category: 'university', focus: ['NLP'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1200 } },
  { name: 'Aalto University', institution: 'Aalto', url: 'https://www.aalto.fi/en', category: 'university', focus: ['AI', 'HCI', 'Systems'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 6, minDelayMs: 1400 } },
  { name: 'Politecnico di Milano', institution: 'Polimi', url: 'https://www.polimi.it', category: 'university', focus: ['Engineering', 'AI'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 6, minDelayMs: 1400 } },

  // --- Oceania & Others ---
  { name: 'ANU College of Computing', institution: 'ANU', url: 'https://cecs.anu.edu.au', category: 'university', focus: ['Computing'], region: 'OCEANIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'UNSW Engineering', institution: 'UNSW', url: 'https://www.unsw.edu.au/engineering', category: 'university', focus: ['Engineering', 'AI'], region: 'OCEANIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1200 } },
  { name: 'University of Melbourne Computing', institution: 'UniMelb', url: 'https://cis.unimelb.edu.au', category: 'university', focus: ['CS', 'AI'], region: 'OCEANIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1200 } },
  { name: 'Technion CS', institution: 'Technion', url: 'https://cs.technion.ac.il', category: 'university', focus: ['CS'], region: 'ME', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Weizmann Institute', institution: 'Weizmann', url: 'https://www.weizmann.ac.il', category: 'university', focus: ['Science', 'AI'], region: 'ME', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 6, minDelayMs: 1400 } },

  // =================================================================
  // 3. TECH INDUSTRY GIANTS
  // =================================================================
  { name: 'Google AI', url: 'https://ai.google', category: 'industry', focus: ['Deep Learning'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 20, minDelayMs: 700 } },
  { name: 'Google Research', url: 'https://research.google', category: 'industry', focus: ['General CS'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 20, minDelayMs: 700 } },
  { name: 'DeepMind', url: 'https://www.deepmind.com', category: 'industry', focus: ['AGI', 'AlphaFold'], region: 'GLOBAL', rss: ['https://deepmind.com/blog/feed/basic/'], crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 20, minDelayMs: 700 } },
  { name: 'Microsoft Research', url: 'https://www.microsoft.com/en-us/research/', category: 'industry', focus: ['General AI'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 20, minDelayMs: 700 } },
  { name: 'IBM Research', url: 'https://www.research.ibm.com', category: 'industry', focus: ['Quantum', 'Hybrid Cloud'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 700 } },
  { name: 'NVIDIA Research', url: 'https://www.nvidia.com/en-us/research/', category: 'industry', focus: ['GPU', 'AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 700 } },
  { name: 'Meta AI (FAIR)', url: 'https://ai.meta.com/research/', category: 'industry', focus: ['Vision', 'LLMs'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 700 } },
  { name: 'OpenAI', url: 'https://openai.com/research', category: 'industry', focus: ['LLMs', 'AGI'], region: 'NA', rss: ['https://openai.com/blog/rss.xml'], crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 20, minDelayMs: 700 } },
  { name: 'Anthropic', url: 'https://www.anthropic.com/research', category: 'industry', focus: ['Safety'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 700 } },
  { name: 'Apple Machine Learning', url: 'https://machinelearning.apple.com', category: 'industry', focus: ['On-device AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: 'Amazon Science', url: 'https://www.amazon.science', category: 'industry', focus: ['Logistics', 'AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 800 } },
  { name: 'Intel Labs', url: 'https://www.intel.com/content/www/us/en/research/overview.html', category: 'industry', focus: ['Hardware'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: 'Adobe Research', url: 'https://research.adobe.com', category: 'industry', focus: ['Creative AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: 'Salesforce Research', url: 'https://blog.salesforceairesearch.com', category: 'industry', focus: ['Enterprise AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: 'Baidu Research', url: 'http://research.baidu.com', category: 'industry', focus: ['AI', 'Search'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Tencent AI Lab', url: 'https://ai.tencent.com/ailab/en/index', category: 'industry', focus: ['Gaming', 'Social'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Alibaba DAMO Academy', url: 'https://damo.alibaba.com/?lang=en', category: 'industry', focus: ['E-commerce'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Toyota Research Institute', url: 'https://www.tri.global', category: 'industry', focus: ['Robotics', 'Auto'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: 'Boston Dynamics AI Institute', url: 'https://theaiinstitute.com', category: 'industry', focus: ['Robotics'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },

  // --- More industry research orgs ---
  { name: 'xAI', url: 'https://x.ai', category: 'industry', focus: ['LLMs', 'AGI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1100 } },
  { name: 'Tesla AI', url: 'https://www.tesla.com/AI', category: 'industry', focus: ['Autonomy', 'Robotics'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 6, minDelayMs: 1100 } },
  { name: 'Samsung Research', url: 'https://research.samsung.com', category: 'industry', focus: ['AI', 'Hardware'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1100 } },
  { name: 'Sony AI', url: 'https://ai.sony', category: 'industry', focus: ['Robotics', 'Vision'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1100 } },
  { name: 'Qualcomm AI Research', url: 'https://www.qualcomm.com/research/artificial-intelligence', category: 'industry', focus: ['On-device AI', 'Edge'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1100 } },

  // =================================================================
  // 5. GOVERNMENT & RESEARCH ORGS (Science)
  // =================================================================
  { name: 'CERN LHC', url: 'https://home.cern', category: 'government', focus: ['Particle Physics'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'NASA JPL', url: 'https://www.jpl.nasa.gov', category: 'government', focus: ['Space AI'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'DARPA News', url: 'https://www.darpa.mil/news', category: 'government', focus: ['Defense'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1500 } },
  { name: 'NIST', url: 'https://www.nist.gov/news-events/news', category: 'government', focus: ['Standards'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1500 } },
  { name: 'NSF News', url: 'https://www.nsf.gov/news/', category: 'government', focus: ['Funding'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1500 } },
  { name: 'NIH News', url: 'https://www.nih.gov/news-events/news-releases', category: 'government', focus: ['Biomedical'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1500 } },

  // --- More government / public sector ---
  { name: 'White House OSTP', url: 'https://www.whitehouse.gov/ostp/', category: 'government', focus: ['Science Policy', 'AI Policy'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1600 } },
  { name: 'US Department of Energy', url: 'https://www.energy.gov', category: 'government', focus: ['Energy', 'Science'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1600 } },
  { name: 'NOAA Research', url: 'https://research.noaa.gov', category: 'government', focus: ['Climate', 'Earth Science'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1600 } },
  { name: 'European Commission (Digital/AI)', url: 'https://digital-strategy.ec.europa.eu', category: 'government', focus: ['AI Policy', 'Regulation'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1600 } },
  { name: 'GOV.UK', url: 'https://www.gov.uk', category: 'government', focus: ['Policy'], region: 'EU', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },

  // =================================================================
  // 6. THINK TANKS / INSTITUTES
  // =================================================================
  { name: 'Allen Institute for AI (AI2)', url: 'https://allenai.org', category: 'think-tank', focus: ['Common Sense'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 900 } },
  { name: 'Allen Institute for Brain Science', url: 'https://alleninstitute.org', category: 'think-tank', focus: ['Neuroscience'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: 'Broad Institute', url: 'https://www.broadinstitute.org', category: 'think-tank', focus: ['Genomics'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: 'Francis Crick Institute', url: 'https://www.crick.ac.uk', category: 'think-tank', focus: ['Biomedical'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },

  // --- Policy / security / economics ---
  { name: 'CSET', institution: 'Georgetown', url: 'https://cset.georgetown.edu', category: 'think-tank', focus: ['AI Policy', 'Security', 'China'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 12, minDelayMs: 1200 } },
  { name: 'RAND', url: 'https://www.rand.org', category: 'think-tank', focus: ['Policy', 'Security'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'Brookings', url: 'https://www.brookings.edu', category: 'think-tank', focus: ['Policy'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'NBER', url: 'https://www.nber.org', category: 'think-tank', focus: ['Economics', 'Policy'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1200 } },
  { name: 'OECD AI Policy Observatory', url: 'https://oecd.ai', category: 'think-tank', focus: ['AI Policy', 'Global'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1400 } },

  // =================================================================
  // 7. STARTUPS & GITHUB
  // =================================================================
  { name: 'Hugging Face', url: 'https://huggingface.co/blog', category: 'startup', focus: ['Open Source'], region: 'GLOBAL', rss: ['https://huggingface.co/blog/feed.xml'], crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 20, minDelayMs: 700 } },
  { name: 'Mistral', url: 'https://mistral.ai/news', category: 'startup', focus: ['LLMs'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Cohere', url: 'https://cohere.com/blog', category: 'startup', focus: ['NLP'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Stability AI', url: 'https://stability.ai/blog', category: 'startup', focus: ['Generative'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Scale AI', url: 'https://scale.com/blog', category: 'startup', focus: ['Data'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Databricks Blog', url: 'https://www.databricks.com/blog', category: 'startup', focus: ['Data Eng'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'PyTorch Repo', url: 'https://github.com/pytorch/pytorch', category: 'github', focus: ['Framework'], region: 'GLOBAL', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'TensorFlow Blog', url: 'https://blog.tensorflow.org', category: 'github', focus: ['Framework'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: 'LangChain Blog', url: 'https://blog.langchain.dev', category: 'startup', focus: ['Agents'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },

  // --- More startups / infra ---
  { name: 'Together AI', url: 'https://www.together.ai/blog', category: 'startup', focus: ['LLM Serving', 'Open Models'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Perplexity', url: 'https://www.perplexity.ai/hub/blog', category: 'startup', focus: ['Search', 'LLMs'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Cerebras', url: 'https://www.cerebras.net/blog/', category: 'startup', focus: ['AI Hardware', 'Training'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Groq', url: 'https://groq.com/blog/', category: 'startup', focus: ['Inference', 'Hardware'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },
  { name: 'Runway', url: 'https://runwayml.com/blog/', category: 'startup', focus: ['Generative Video'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 900 } },

  // --- More GitHub (high-signal repos) ---
  { name: 'Hugging Face Transformers', url: 'https://github.com/huggingface/transformers', category: 'github', focus: ['LLMs', 'NLP'], region: 'GLOBAL', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'vLLM', url: 'https://github.com/vllm-project/vllm', category: 'github', focus: ['Inference', 'Serving'], region: 'GLOBAL', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'llama.cpp', url: 'https://github.com/ggerganov/llama.cpp', category: 'github', focus: ['Inference', 'On-device'], region: 'GLOBAL', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'OpenAI Cookbook', url: 'https://github.com/openai/openai-cookbook', category: 'github', focus: ['LLMs', 'Patterns'], region: 'GLOBAL', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },

  // =================================================================
  // 8. ARCHIVES / INDEXES / PREPRINTS / PROCEEDINGS
  // =================================================================
  { name: 'OpenReview', url: 'https://openreview.net', category: 'archive', focus: ['Peer Review', 'ML'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 1200 } },
  { name: 'Proceedings of Machine Learning Research (PMLR)', url: 'https://proceedings.mlr.press', category: 'archive', focus: ['Proceedings', 'ML'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 15, minDelayMs: 1200 } },
  { name: 'ACL Anthology', url: 'https://aclanthology.org', category: 'archive', focus: ['NLP', 'Proceedings'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 12, minDelayMs: 1200 } },
  { name: 'DBLP Computer Science Bibliography', url: 'https://dblp.org', category: 'archive', focus: ['Bibliography', 'CS'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 12, minDelayMs: 1200 } },

  // --- arXiv (explicit RSS per category) ---
  { name: 'ArXiv', url: 'https://arxiv.org', category: 'archive', focus: ['Preprints'], region: 'GLOBAL', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'arXiv cs.AI (RSS)', url: 'https://arxiv.org/list/cs.AI/recent', category: 'archive', focus: ['AI', 'Preprints'], region: 'GLOBAL', rss: ['https://rss.arxiv.org/rss/cs.AI'], crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'arXiv cs.LG (RSS)', url: 'https://arxiv.org/list/cs.LG/recent', category: 'archive', focus: ['ML', 'Preprints'], region: 'GLOBAL', rss: ['https://rss.arxiv.org/rss/cs.LG'], crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'arXiv cs.CL (RSS)', url: 'https://arxiv.org/list/cs.CL/recent', category: 'archive', focus: ['NLP', 'Preprints'], region: 'GLOBAL', rss: ['https://rss.arxiv.org/rss/cs.CL'], crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'arXiv cs.CV (RSS)', url: 'https://arxiv.org/list/cs.CV/recent', category: 'archive', focus: ['Vision', 'Preprints'], region: 'GLOBAL', rss: ['https://rss.arxiv.org/rss/cs.CV'], crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'arXiv stat.ML (RSS)', url: 'https://arxiv.org/list/stat.ML/recent', category: 'archive', focus: ['ML', 'Statistics'], region: 'GLOBAL', rss: ['https://rss.arxiv.org/rss/stat.ML'], crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },

  // --- bioRxiv ---
  { name: 'bioRxiv', url: 'https://www.biorxiv.org', category: 'archive', focus: ['Biology', 'Preprints'], region: 'GLOBAL', rss: ['https://www.biorxiv.org/alertsrss'], crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },

  // =================================================================
  // 9. CONFERENCES (announcements / CFP / proceedings pointers)
  // =================================================================
  { name: 'NeurIPS', url: 'https://neurips.cc', category: 'archive', focus: ['ML', 'Conference'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1400 } },
  { name: 'NeurIPS Blog', url: 'https://blog.neurips.cc', category: 'archive', focus: ['ML', 'Conference'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1400 } },
  { name: 'ICML', url: 'https://icml.cc', category: 'archive', focus: ['ML', 'Conference'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1400 } },
  { name: 'ICLR', url: 'https://iclr.cc', category: 'archive', focus: ['Deep Learning', 'Conference'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1400 } },
  { name: 'AAAI', url: 'https://aaai.org', category: 'archive', focus: ['AI', 'Conference'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1400 } },
  { name: 'IJCAI', url: 'https://www.ijcai.org', category: 'archive', focus: ['AI', 'Conference'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1400 } },
  { name: 'ACL', url: 'https://www.aclweb.org', category: 'archive', focus: ['NLP', 'Conference'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1400 } },
  { name: 'CVPR (CVF)', url: 'https://cvpr.thecvf.com', category: 'archive', focus: ['Vision', 'Conference'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1400 } },
  { name: 'ICCV (CVF)', url: 'https://iccv.thecvf.com', category: 'archive', focus: ['Vision', 'Conference'], region: 'GLOBAL', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1400 } },
  { name: 'ECCV', url: 'https://eccv.ecva.net', category: 'archive', focus: ['Vision', 'Conference'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 8, minDelayMs: 1400 } },

  // =================================================================
  // 15. MEDIA (Optional RSS handled in rss-aggregator TRUSTED_OVERRIDES)
  // =================================================================
  { name: 'Reuters', url: 'https://www.reuters.com', category: 'media', focus: ['Global News'], region: 'GLOBAL', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'Bloomberg Tech', url: 'https://www.bloomberg.com/technology', category: 'media', focus: ['Tech Biz'], region: 'GLOBAL', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'TechCrunch', url: 'https://techcrunch.com', category: 'media', focus: ['Startups'], region: 'NA', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'The Verge', url: 'https://www.theverge.com/tech', category: 'media', focus: ['Consumer Tech'], region: 'NA', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'Wired', url: 'https://www.wired.com', category: 'media', focus: ['Tech Culture'], region: 'NA', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com', category: 'media', focus: ['Deep Tech'], region: 'NA', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'IEEE Spectrum', url: 'https://spectrum.ieee.org', category: 'media', focus: ['Engineering'], region: 'GLOBAL', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'Nature', url: 'https://www.nature.com', category: 'media', focus: ['Science'], region: 'GLOBAL', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'Science', url: 'https://www.science.org', category: 'media', focus: ['Science'], region: 'GLOBAL', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },

  // --- Engineering blogs (optional) ---
  { name: 'Netflix TechBlog', url: 'https://netflixtechblog.com', category: 'media', focus: ['Systems', 'ML in Prod'], region: 'NA', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },
  { name: 'Uber Engineering', url: 'https://www.uber.com/blog/engineering/', category: 'media', focus: ['Systems', 'ML in Prod'], region: 'NA', crawl: { enabled: false, maxDepth: 0, maxPagesPerRun: 0, minDelayMs: 0 } },

  // =================================================================
  // TRACKER LABS (Auto-imported from spreadsheet)
  // =================================================================
  { name: "Regenerative Medicine Lab | Dr. Liping Tang", institution: "UTA BME", url: "mailto:ltang@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Nanomedicine & Drug Delivery | Dr. Kytai Nguyen", institution: "UTA BME", url: "mailto:knguyen@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Tissue Biomechanics Lab | Dr. Jun Liao", institution: "UTA BME", url: "mailto:jun.liao@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Biomaterials & Tissue Eng. | Dr. Yi Hong", institution: "UTA BME", url: "mailto:yi.hong@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Medical Optics (MOIL) | Dr. Hanli Liu", institution: "UTA BME", url: "mailto:hanli@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Cardiovascular Mechanobiology | Dr. Juhyun Lee", institution: "UTA BME", url: "mailto:juhyun.lee@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Cellular Biomechanics | Dr. Michael Cho", institution: "UTA BME", url: "mailto:michael.cho@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Ultrasound & Optical Imaging | Dr. Baohong Yuan", institution: "UTA BME", url: "mailto:baohong@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Soft Matter & Molecular Rec. | Dr. Justyn Jaworski", institution: "UTA BME", url: "mailto:justyn.jaworski@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Functional Brain Imaging | Dr. George Alexandrakis", institution: "UTA BME", url: "mailto:galex@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Biomedical Optics (OCT) | Dr. Digant Davé", institution: "UTA BME", url: "mailto:ddave@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Neural Engineering Lab | Dr. Young-tae Kim", institution: "UTA BME", url: "mailto:ykim@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Respiratory & Sleep | Dr. Khosrow Behbehani", institution: "UTA BME", url: "mailto:kb@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Comp. Biomechanics | Dr. Cheng-Jen Chuong", institution: "UTA BME", url: "mailto:chuong@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Data Mining & DBX Lab | Dr. Gautam Das", institution: "UTA CSE", url: "mailto:gdas@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "ACES Lab (Architecture) | Dr. Hong Jiang", institution: "UTA CSE", url: "mailto:hong.jiang@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Green Computing Lab | Dr. Ishfaq Ahmad", institution: "UTA CSE", url: "mailto:iahmad@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Scalable Systems Lab | Dr. Song Jiang", institution: "UTA CSE", url: "mailto:song.jiang@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Information Security (iSec) | Dr. Jiang Ming", institution: "UTA CSE", url: "mailto:jiang.ming@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "SCOPE Lab (Software Eng.) | Dr. Christoph Csallner", institution: "UTA CSE", url: "mailto:csallner@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "VLM Lab (Vision/AI) | Dr. Vassilis Athitsos", institution: "UTA CSE", url: "mailto:athitsos@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Robotic Vision Lab | Dr. Manfred Huber", institution: "UTA CSE", url: "mailto:huber@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Medical Image Analysis | Dr. Won Hwa Kim", institution: "UTA CSE", url: "mailto:wonhwa.kim@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Brain Connectivity Lab | Dr. Dajiang Zhu", institution: "UTA CSE", url: "mailto:dajiang.zhu@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Security & Privacy | Dr. Shirin Nilizadeh", institution: "UTA CSE", url: "mailto:shirin.nilizadeh@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Database Systems | Dr. Ramez Elmasri", institution: "UTA CSE", url: "mailto:elmasri@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Big Data & Graph Mining | Dr. Chengkai Li", institution: "UTA CSE", url: "mailto:cli@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Large Scale Data Mining | Dr. Junzhou Huang", institution: "UTA CSE", url: "mailto:jzhuang@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Cloud Computing | Dr. Jia Rao", institution: "UTA CSE", url: "mailto:jia.rao@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Software Analysis | Dr. Jeff Lei", institution: "UTA CSE", url: "mailto:ylei@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Software Eng. Center | Dr. David Kung", institution: "UTA CSE", url: "mailto:kung@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Software Evolution | Dr. Allison Sullivan", institution: "UTA CSE", url: "mailto:allison.sullivan@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Internet Engineering | Dr. Hao Che", institution: "UTA CSE", url: "mailto:hche@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Query Optimization | Dr. Leonidas Fegaras", institution: "UTA CSE", url: "mailto:fegaras@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Cancer & Genome Data | Dr. Jacob Luber", institution: "UTA CSE", url: "mailto:jacob.luber@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "High Energy Physics (ATLAS) | Dr. Kaushik De", institution: "UTA Physics", url: "mailto:kaushik@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Neutrino Physics (Next/IceCube) | Dr. Ben Jones", institution: "UTA Physics", url: "mailto:ben.jones@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Space Physics (MURI) | Dr. Yue Deng", institution: "UTA Physics", url: "mailto:yuedeng@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Space Physics | Dr. Ramon Lopez", institution: "UTA Physics", url: "mailto:relopez@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Nanomedicine & Cancer | Dr. Wei Chen", institution: "UTA Physics", url: "mailto:weichen@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "High Energy Physics (ATLAS) | Dr. Haleh Hadavand", institution: "UTA Physics", url: "mailto:haleh.hadavand@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "High Energy Physics (HEP) | Dr. Jaehoon Yu", institution: "UTA Physics", url: "mailto:jaehoon@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "High Energy Physics (HEP) | Dr. Andrew Brandt", institution: "UTA Physics", url: "mailto:brandta@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Positron Surface Lab | Dr. Alex Weiss", institution: "UTA Physics", url: "mailto:weiss@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Nanostructured Magnets | Dr. Ping Liu", institution: "UTA Physics", url: "mailto:pliu@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Condensed Matter | Dr. Ali Koymen", institution: "UTA Physics", url: "mailto:koymen@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Condensed Matter | Dr. Qiming Zhang", institution: "UTA Physics", url: "mailto:qzhang@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Medical Physics | Dr. Mingwu Jin", institution: "UTA Physics", url: "mailto:mingwu@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Computational Materials | Dr. Muhammad Huda", institution: "UTA Physics", url: "mailto:huda@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Supernova Remnants | Dr. Sangwook Park", institution: "UTA Physics", url: "mailto:s.park@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Biophysics | Dr. Samarendra Mohanty", institution: "UTA Physics", url: "mailto:smohanty@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Space Physics | Dr. Cheng Sheng", institution: "UTA Physics", url: "mailto:cheng.sheng@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Integrative Physiology | Dr. Paul Fadel", institution: "UTA CONHI + Kine", url: "mailto:paul.fadel@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Muscle & Bone Center | Dr. Marco Brotto", institution: "UTA CONHI + Kine", url: "mailto:marco.brotto@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Healthcare Innovation (HI) | Dr. Yan Xiao", institution: "UTA CONHI + Kine", url: "mailto:yan.xiao@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Immunology & Metabolism | Dr. Daniel Trott", institution: "UTA CONHI + Kine", url: "mailto:daniel.trott@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Autonomic Control Lab | Dr. Matthew Brothers", institution: "UTA CONHI + Kine", url: "mailto:matthew.brothers@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Neuromuscular Diseases | Dr. Jingsong Zhou", institution: "UTA CONHI + Kine", url: "mailto:jingsong.zhou@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Clinical Physiology | Dr. Michael Nelson", institution: "UTA CONHI + Kine", url: "mailto:michael.nelson@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Maternal Health Equity | Dr. Kyrah Brown", institution: "UTA CONHI + Kine", url: "mailto:kyrah.brown@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Thermal & Vascular Phys. | Dr. David Keller", institution: "UTA CONHI + Kine", url: "mailto:dkeller@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Healthy Living (Pediatric) | Dr. Xiangli Gu", institution: "UTA CONHI + Kine", url: "mailto:xiangli.gu@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Developmental Motor | Dr. Priscila Caçola", institution: "UTA CONHI + Kine", url: "mailto:cacola@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Spatial Health Equity (SHE) | Dr. Feinuo Sun", institution: "UTA CONHI + Kine", url: "mailto:feinuo.sun@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Disability Sports Lab | Dr. Judy Wilson", institution: "UTA CONHI + Kine", url: "mailto:judy.wilson@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Tobacco Research | Dr. Ziyad Ben Taleb", institution: "UTA CONHI + Kine", url: "mailto:ziyad.bentaleb@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Social Determinants | Dr. Yeonwoo Kim", institution: "UTA CONHI + Kine", url: "mailto:yeonwoo.kim@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Athletic Training Res. | Dr. Cynthia Trowbridge", institution: "UTA CONHI + Kine", url: "mailto:ctrowbridge@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Behavioral Neuroscience | Dr. Linda Perrotti", institution: "UTA Neuroscience", url: "mailto:perrotti@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Pain Neurobiology | Dr. Qing Lin", institution: "UTA Neuroscience", url: "mailto:qilin@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Inner Ear Neurobiology | Dr. Bradley Walters", institution: "UTA Neuroscience", url: "mailto:bwalters@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Cerebral Cortex Lab | Dr. Stephen Lomber", institution: "UTA Neuroscience", url: "mailto:stephen.lomber@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Neurophysiology | Dr. Yuan Bo Peng", institution: "UTA Neuroscience", url: "mailto:ypeng@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Pain & Stress | Dr. Perry Fuchs", institution: "UTA Neuroscience", url: "mailto:fuchs@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Human Memory | Dr. Heekyeong Park", institution: "UTA Neuroscience", url: "mailto:heekyeong.park@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Calcium Signaling | Dr. Zui Pan", institution: "UTA Neuroscience", url: "mailto:zui.pan@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Cognitive Modeling (CAM) | Dr. Daniel Levine", institution: "UTA Neuroscience", url: "mailto:levine@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Cognitive Motor Neuro. | Dr. Jerwen Jou", institution: "UTA Neuroscience", url: "mailto:jjou@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Clinical Health Psych | Dr. Tracy Greer", institution: "UTA Neuroscience", url: "mailto:tracy.greer@uta.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Renal-clearable nanomedicine | Dr. Jie Zheng", institution: "UTD Biochemistry", url: "mailto:jiezheng@utdallas.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Heart-Brain Connection | Dr. Ihab Hajjar", institution: "UTSW Neurology", url: "mailto:ihab.hajjar@utsouthwestern.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Kempner Institute", institution: "Harvard University", url: "https://kempnerinstitute.harvard.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "DtAK Lab | Finale Doshi-Velez", institution: "Harvard SEAS", url: "https://dtak.github.io", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Lukin Group | Mikhail Lukin", institution: "Harvard Physics", url: "https://lukin.physics.harvard.edu", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Harvard Quantum Initiative (HQI)", institution: "Harvard University", url: "https://hqi.harvard.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Wyss Institute | Donald Ingber", institution: "Harvard University", url: "https://wyss.harvard.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Harvard Stem Cell Institute (HSCI)", institution: "Harvard University", url: "https://hsci.harvard.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Center for Brain Science (CBS)", institution: "Harvard FAS", url: "https://cbs.harvard.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Lichtman Lab | Jeff Lichtman", institution: "Harvard University", url: "https://lichtman.harvard.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Church Lab | George Church", institution: "Harvard University", url: "https://church.harvard.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Center for Systems Biology | Marc Kirschner", institution: "Harvard University", url: "https://sysbio.med.harvard.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Laboratory of Systems Pharmacology | Peter Sorger", institution: "Harvard University", url: "https://sorger.med.harvard.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Boaz Barak", institution: "Harvard SEAS", url: "https://www.boazbarak.org/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "CSAIL (Distributed Robotics) | Daniela Rus", institution: "MIT CSAIL", url: "mailto:rus@csail.mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "CSAIL (Decentralized Info) | Tim Berners-Lee", institution: "MIT CSAIL", url: "mailto:timbl@w3.org", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "CSAIL (Cryptography) | Shafi Goldwasser", institution: "MIT CSAIL", url: "mailto:shafi@csail.mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "CSAIL (Algorithmic Mechanism) | Silvio Micali", institution: "MIT CSAIL", url: "mailto:silvio@csail.mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "CSAIL (Database Group) | Michael Stonebraker", institution: "MIT CSAIL", url: "mailto:stonebraker@csail.mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "CSAIL (Clinical ML) | Regina Barzilay", institution: "MIT CSAIL", url: "mailto:regina@csail.mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "CSAIL (Wireless Center) | Dina Katabi", institution: "MIT CSAIL", url: "mailto:dina@csail.mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "CSAIL (Comp. Cognitive Sci) | Josh Tenenbaum", institution: "MIT CSAIL", url: "mailto:jbt@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "CSAIL (Genesis Group) | Randall Davis", institution: "MIT CSAIL", url: "mailto:davis@csail.mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "CSAIL (Prog. Methodology) | Barbara Liskov", institution: "MIT CSAIL", url: "mailto:liskov@csail.mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "CSAIL (Systems Security) | Srini Devadas", institution: "MIT CSAIL", url: "mailto:devadas@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "CSAIL (Computer Vision) | Antonio Torralba", institution: "MIT CSAIL", url: "mailto:torralba@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "CSAIL (NLP/Language) | Regina Barzilay", institution: "MIT CSAIL", url: "mailto:regina@csail.mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Media Lab (Biomechatronics) | Hugh Herr", institution: "MIT Media Lab", url: "mailto:hherr@media.mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Media Lab (Fluid Interfaces) | Pattie Maes", institution: "MIT Media Lab", url: "mailto:pattie@media.mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Media Lab (Tangible Media) | Hiroshi Ishii", institution: "MIT Media Lab", url: "mailto:ishii@media.mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Media Lab (Camera Culture) | Ramesh Raskar", institution: "MIT Media Lab", url: "mailto:raskar@media.mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Media Lab (Lifelong Kindergarten) | Mitchel Resnick", institution: "MIT Media Lab", url: "mailto:mres@media.mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Media Lab (Affective Computing) | Rosalind Picard", institution: "MIT Media Lab", url: "mailto:picard@media.mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Media Lab (City Science) | Kent Larson", institution: "MIT Media Lab", url: "mailto:kll@media.mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Physics (Center for Theoretical Phys) | Alan Guth", institution: "MIT Physics", url: "mailto:guth@ctp.mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Physics (Center for Theoretical Phys) | Frank Wilczek", institution: "MIT Physics", url: "mailto:wilczek@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Physics (Ultracold Quantum Gases) | Wolfgang Ketterle", institution: "MIT Physics", url: "mailto:ketterle@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Physics (LIGO Group) | Rainer Weiss", institution: "MIT Physics", url: "mailto:weiss@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Physics (Jarillo-Herrero Lab) | Pablo Jarillo-Herrero", institution: "MIT Physics", url: "mailto:pjarillo@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Physics (Tegmark Lab) | Max Tegmark", institution: "MIT Physics", url: "mailto:tegmark@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Physics (Quantum Photonics) | Dirk Englund", institution: "MIT Physics", url: "mailto:englund@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Physics (Quanta Lab) | Isaac Chuang", institution: "MIT Physics", url: "mailto:ichuang@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Physics (Dark Matter/Higgs) | Philip Harris", institution: "MIT Physics", url: "mailto:pcharris@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Physics (Ultracold Atoms) | Vladan Vuletić", institution: "MIT Physics", url: "mailto:vuletic@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Physics (Soljacic Lab) | Marin Soljacic", institution: "MIT Physics", url: "mailto:soljacic@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Biomedical (Langer Lab) | Robert Langer", institution: "MIT", url: "mailto:rlanger@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Biomedical (Collins Lab) | James Collins", institution: "MIT", url: "mailto:jimjc@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Biomedical (Synthetic Neurobiology) | Ed Boyden", institution: "MIT", url: "mailto:eboyden@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Biomedical (Bhatia Lab) | Sangeeta Bhatia", institution: "MIT", url: "mailto:sbhatia@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Biomedical (Yaffe Lab) | Michael Yaffe", institution: "MIT", url: "mailto:myaffe@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Biomedical (Yilmaz Lab) | Omer Yilmaz", institution: "MIT", url: "mailto:oyilmaz@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Biomedical (Immunoengineering) | Darrell Irvine", institution: "MIT", url: "mailto:dirvine@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Neuroscience (McGovern Institute) | Li-Huei Tsai", institution: "MIT", url: "mailto:lhtsai@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Neuroscience (Picower Institute) | Ann Graybiel", institution: "MIT", url: "mailto:graybiel@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Neuroscience (Picower) | Mark Bear", institution: "MIT", url: "mailto:mbear@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Neuroscience (Picower) | Susumu Tonegawa", institution: "MIT", url: "mailto:tonegawa@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Neuroscience (Picower) | James DiCarlo", institution: "MIT", url: "mailto:dicarlo@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Neuroscience (Picower) | Nancy Kanwisher", institution: "MIT", url: "mailto:ngk@mit.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "MSRP (Summer Research Program)", institution: "MIT", url: "https://msrp.mit.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "MISTI (Global Research)", institution: "MIT", url: "https://misti.mit.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Lincoln Laboratory", institution: "MIT/DoD", url: "https://jhuapl.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Deisseroth Lab | Karl Deisseroth", institution: "Stanford", url: "https://deisseroth.stanford.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Shenoy/Henderson Lab | Jaimie Henderson", institution: "Stanford", url: "https://henderson-lab.stanford.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Center for Research on FM | Percy Liang", institution: "Stanford", url: "https://crfm.stanford.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Human-Centered AI | Fei-Fei Li", institution: "Stanford", url: "https://hai.stanford.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Machine Learning Group | Andrew Ng", institution: "Stanford", url: "https://ml.stanford.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Stanford Robotics Lab | Oussama Khatib", institution: "Stanford", url: "https://robotics.stanford.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Stanford NLP Group | Christopher Manning", institution: "Stanford", url: "https://nlp.stanford.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Stanford Vision Lab | Li Fei-Fei", institution: "Stanford", url: "https://vision.stanford.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Genetics Bioscience | Michael Snyder", institution: "Stanford", url: "https://snyder.stanford.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "IQIM Quantum | John Preskill", institution: "Caltech", url: "https://iqim.caltech.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "TAPIR Astrophysics | Sterl Phinney", institution: "Caltech", url: "https://tapir.caltech.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "LIGO Lab | Rana Adhikari", institution: "Caltech", url: "https://ligo.caltech.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Division of Biology | Kai Zinn", institution: "Caltech", url: "https://biology.caltech.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Jet Propulsion Lab | NASA", institution: "Caltech", url: "https://jpl.nasa.gov", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Tsao Lab | Doris Tsao", institution: "UC Berkeley", url: "https://tsao-lab.berkeley.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Gallant Lab | Jack Gallant", institution: "UC Berkeley", url: "https://gallantlab.org", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "RISELab | Ion Stoica", institution: "UC Berkeley", url: "https://riselab.org", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Vision & Learning | Jitendra Malik", institution: "UC Berkeley", url: "https://malik-lab.berkeley.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Berkeley AI Lab (BAIR) | Stuart Russell", institution: "UC Berkeley", url: "https://bair.berkeley.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Neurodynamics Lab | Bruno Olshausen", institution: "UC Berkeley", url: "https://redwood.berkeley.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Robotics Institute | Martial Hebert", institution: "CMU", url: "https://ri.cmu.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Machine Learning Department | Tom Mitchell", institution: "CMU", url: "https://ml.cmu.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "School of Computer Science | Dean Raj Reddy", institution: "CMU", url: "https://cs.cmu.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "AI and Language Lab | Yonatan Bisk", institution: "CMU", url: "https://argmin.net", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Biomedical ML | Zhenming Liu", institution: "CMU", url: "https://cmu.edu/bioml", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Cornell AI Lab | Carla Gomes", institution: "Cornell", url: "https://ai.cornell.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Cornell Center for Astrophysics", institution: "Cornell", url: "https://astro.cornell.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Bowers College of Computing & IT", institution: "Cornell", url: "https://computing.cornell.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Cornell Neuroscience", institution: "Cornell", url: "https://neuroscience.cornell.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Cornell Biomedical Engineering | David Needham", institution: "Cornell", url: "https://bme.cornell.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Cornell Computational Biology | Bart Selman", institution: "Cornell", url: "https://cs.cornell.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Penn Engineering (AI/ML) | Nikolaos Pappas", institution: "UPenn", url: "https://seas.upenn.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Penn Neuroscience | Eve Marder (Visiting)", institution: "UPenn", url: "https://neuro.upenn.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Penn Medicine AI Lab | Benjamin Vogelstein", institution: "UPenn", url: "https://vogelstein.upenn.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Perelman School of Medicine | (Biomedical)", institution: "UPenn", url: "https://med.upenn.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Data Science Institute | Garud Iyengar", institution: "Columbia University", url: "https://datascience.columbia.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "ARNI (AI Institute)", institution: "Columbia University", url: "https://arni-institute.org", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Zuckerman Institute | Rui Costa", institution: "Columbia University", url: "https://shohamy-lab.org", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Columbia Nano Initiative", institution: "Columbia University", url: "https://cni.columbia.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Inst. Comp. Medicine | Natalia Trayanova", institution: "JHU", url: "mailto:trayanova@jhu.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Trans. Tissue Eng. | Jennifer Elisseeff", institution: "JHU", url: "mailto:elisseeff@jhu.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Hearing & Balance | Xiaoqin Wang", institution: "JHU", url: "mailto:xwang@jhu.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "Immunoengineering Lab | Jonathan Schneck", institution: "JHU", url: "mailto:jschneck@jhu.edu", category: 'university', focus: ['Research'], region: 'NA' },
  { name: "MINDS Institute", institution: "JHU", url: "https://minds.jhu.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Kavli NDI", institution: "JHU", url: "https://kavli.jhu.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Duke AI Lab | Lingling Chen", institution: "Duke University", url: "https://ai.duke.edu", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Pratt School of Engineering", institution: "Duke University", url: "https://pratt.duke.edu", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Duke Center for Brain Science", institution: "Duke University", url: "https://brain.duke.edu", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Siebel School of Computing & Data Science", institution: "UIUC", url: "https://siebelschool.illinois.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Coordinated Science Lab | Hosung Park", institution: "UIUC", url: "https://csl.illinois.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "UIUC AI Research Lab | Paris Smaragdis", institution: "UIUC", url: "https://asl.illinois.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Illinois Bioengineering | Andrew Gewirth", institution: "UIUC", url: "https://biophotonics.illinois.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Georgia Tech AI Lab | Thad Starner", institution: "Georgia Tech", url: "https://ai.gatech.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "School of Interactive Computing", institution: "Georgia Tech", url: "https://ic.gatech.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Wallace H. Coulter Department | Hang Lu", institution: "Georgia Tech", url: "https://bme.gatech.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Chang Lab | Edward Chang", institution: "UCSF", url: "https://changlab.ucsf.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "McDevitt Lab | Todd McDevitt", institution: "UCSF", url: "https://mcdevittlab.org", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "UCSF Brain Initiative | Loren Frank", institution: "UCSF", url: "https://braininitiative.ucsf.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Princeton Neuro Inst (PNI) | John Hopfield", institution: "nan", url: "https://pni.princeton.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Princeton CS (ML Area) | Sanjeev Arora", institution: "nan", url: "https://cs.princeton.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Center for Neural Science | NYU", institution: "nan", url: "https://cns.nyu.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Center for Data Science | NYU | Yann LeCun", institution: "nan", url: "https://cds.nyu.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "UT Austin AI Lab | Scott Niekum", institution: "UT Austin", url: "https://www2.cs.utexas.edu/~ai-lab", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Searle AI Institute | Peter Stone", institution: "UT Austin", url: "https://www2.cs.utexas.edu/~AustinVilla", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "UT Brain Initiative", institution: "UT Austin", url: "https://utbraininitiative.org", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Paul G. Allen School of CS", institution: "UWashington", url: "https://cs.washington.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "UW Center for Sensorimotor Neural Engineering", institution: "UWashington", url: "https://csne.washington.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Ubiquitous Computing Lab | Shyam Gollakota", institution: "UWashington", url: "https://ubicomplab.cs.washington.edu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Tsinghua AI Lab | Andrew Ng (Affiliated)", institution: "Tsinghua University", url: "https://tsinghua.edu.cn/ai", category: 'university', focus: ['Research'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Department of Computer Science", institution: "Tsinghua University", url: "https://dcs.tsinghua.edu.cn", category: 'university', focus: ['Research'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Institute for Artificial Intelligence | Hai Yang", institution: "Tsinghua University", url: "https://iail.tsinghua.edu.cn", category: 'university', focus: ['Research'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "School of Life Sciences | Yiming Cheng", institution: "Tsinghua University", url: "https://sls.tsinghua.edu.cn", category: 'university', focus: ['Research'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Tsinghua Quantum Lab | Pan Jianwei", institution: "Tsinghua University", url: "https://quantum.tsinghua.edu.cn", category: 'university', focus: ['Research'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Peking AI Lab | Michael I. Jordan (Affiliated)", institution: "Peking University", url: "https://pku.edu.cn/ai", category: 'university', focus: ['Research'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "School of Artificial Intelligence", institution: "Peking University", url: "https://sai.pku.edu.cn", category: 'university', focus: ['Research'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Center for Quantitative Biology | Chao Tang", institution: "Peking University", url: "https://cqb.pku.edu.cn", category: 'university', focus: ['Research'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Institute of Brain Sciences | Hailan Hu", institution: "Peking University", url: "https://ibs.pku.edu.cn", category: 'university', focus: ['Research'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "School of Computer Science | (AI Focus)", institution: "ShanghaiTech", url: "https://sist.shanghaitech.edu.cn", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Institute of Biomedical Sciences | Guo Zhang", institution: "ShanghaiTech", url: "https://ibs.shanghaitech.edu.cn", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Fudan Institute of Advanced Study", institution: "Fudan University", url: "https://fias.fudan.edu.cn", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "School of Computer Science", institution: "Fudan University", url: "https://cs.fudan.edu.cn", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "NUS School of Computing | Xavier Bresson", institution: "NUS", url: "https://comp.nus.edu.sg", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "NUS Institute of AI | (Joint Centre)", institution: "NUS", url: "https://nus.edu.sg/ai", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "NUS BioInformatics & Data Science", institution: "NUS", url: "https://bioinfo.nus.edu.sg", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Centre for Quantum Technologies | Peter Knight", institution: "NUS", url: "https://quantech.nus.edu.sg", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "NTU School of Computer Science & Engineering | Bo An", institution: "NTU", url: "https://scse.ntu.edu.sg", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "NTU S. Rajaratnam School of International Studies", institution: "NTU", url: "https://rsis.ntu.edu.sg", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "AI Singapore (AI-IS) | (AISG Partner Lab)", institution: "NTU/NUS", url: "https://aisingapore.org", category: 'university', focus: ['Research'], region: 'ASIA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Cavendish Lab", institution: "Cambridge University", url: "https://cambridge.ac.uk", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Department of Computer Science & Technology", institution: "Cambridge University", url: "https://cam.ac.uk/cs", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Cambridge Centre for AI Safety", institution: "Cambridge University", url: "https://ai-safety.org", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Department of Psychology | Eleanor Maguire", institution: "Cambridge University", url: "https://psychology.cam.ac.uk", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Department of Applied Mathematics | Stephen Tobias", institution: "Cambridge University", url: "https://damtp.cam.ac.uk", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Medical Research Council (MRC) Labs", institution: "Cambridge University", url: "https://mrc-lmb.cam.ac.uk", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Future of Humanity Institute | Nick Bostrom", institution: "Oxford University", url: "https://fhi.ox.ac.uk", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Department of Computer Science", institution: "Oxford University", url: "https://cs.ox.ac.uk", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Computational Biology Research Group", institution: "Oxford University", url: "https://compbio.ox.ac.uk", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Oxford Brookes University (AI Lab)", institution: "Oxford University", url: "https://brookes.ac.uk", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Department of Computing | Yike Guo", institution: "Imperial College", url: "https://imperial.ac.uk/computing", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Institute for Mathematical Sciences", institution: "Imperial College", url: "https://imperial.ac.uk/maths", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Bio-inspired Materials | Molly Stevens", institution: "Imperial College", url: "https://imperial.ac.uk", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Department of Materials Science | Robert Sinclair", institution: "Imperial College", url: "https://imperial.ac.uk/materials", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Gatsby Unit | Maneesh Sahani", institution: "University College London", url: "https://gatsby.ucl.ac.uk", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Department of Computer Science", institution: "University College London", url: "https://ucl.ac.uk/cs", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "UCL Neuroscience | Lisa Gentet", institution: "University College London", url: "https://ucl.ac.uk/neuroscience", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "School of Informatics | Amos Storkey", institution: "University of Edinburgh", url: "https://ed.ac.uk/informatics", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Institute for Adaptive and Neural Computation", institution: "University of Edinburgh", url: "https://ed.ac.uk/ianc", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Robotics & Autonomous Systems Group", institution: "University of Edinburgh", url: "https://ed.ac.uk/robots", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "CERN (ATLAS/CMS)", institution: "Geneva", url: "https://cern.ch", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "CERN Theory Division | Rolf Heuer", institution: "Geneva", url: "https://home.cern/theory", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "CERN Computing & Data Centre", institution: "Geneva", url: "https://home.cern/computing", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Janelia Research Campus", institution: "Howard Hughes Medical Institute (HHMI)", url: "https://janelia.org", category: 'think-tank', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Anthropic | Dario Amodei", institution: "SF", url: "https://anthropic.com", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Google DeepMind | Demis Hassabis", institution: "London", url: "https://deepmind.google", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Meta FAIR | Yann LeCun", institution: "NYC", url: "https://facebook.com/ai", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "OpenAI Research | Jakub Pachocki", institution: "SF", url: "https://openai.com", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "D. E. Shaw Research | David Shaw", institution: "NYC", url: "https://deshawresearch.com", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Jane Street Research", institution: "NYC", url: "https://janestreet.com", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Citadel Securities | Peng Zhao", institution: "Chicago", url: "https://citadelgroup.com", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Microsoft Research | Eric Horvitz", institution: "Redmond", url: "https://microsoft.com/research", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "NVIDIA Research | Bill Dally", institution: "Santa Clara", url: "https://nvidia.com/research", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Amazon AGI | Rohit Prasad", institution: "Seattle", url: "https://amazon.com/ai", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "X Development (Google X) | Astro Teller", institution: "Mountain View", url: "https://x.company", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Boston Consulting Group (BCG) AI Lab", institution: "Boston", url: "https://bcg.com/ai", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "NSF REU", institution: "USA", url: "https://nsf.gov/reu", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Amgen Scholars", institution: "Global", url: "https://amgenscholars.com", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Goldwater Scholarship", institution: "USA", url: "https://goldwater.org", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "NSF GRFP", institution: "USA", url: "https://nsf.gov/grfp", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Rhodes Scholarship", institution: "Oxford", url: "https://rhodeshouse.ox.ac.uk", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Marshall Scholarship", institution: "UK", url: "https://marshallscholarship.org", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Churchill Scholarship", institution: "Cambridge", url: "https://churchillscholarship.org", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Hertz Fellowship", institution: "USA", url: "https://hertzfoundation.org", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "DoD NDSEG", institution: "USA", url: "https://ndseg.asee.org", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "HHMI International Student Research Fellowships", institution: "USA", url: "https://hhmi.org", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Royal Commission for the Exhibition of 1851 Awards", institution: "UK", url: "https://royalcommission1851.org.uk", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Nucleate", institution: "Nucleate", url: "https://nucleate.xyz/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Activate Fellowship", institution: "Activate", url: "https://www.activate.org/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Greentown Labs", institution: "Greentown Labs", url: "https://greentownlabs.com/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "MassChallenge", institution: "MassChallenge", url: "https://masschallenge.org/", category: 'think-tank', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "UMass M2D2", institution: "UMass M2D2", url: "https://www.uml.edu/research/m2d2/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "DRIVe (BARDA)", institution: "BARDA DRIVe", url: "https://drive.hhs.gov/about.html", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "MassVentures Acorn Innovation Grant", institution: "MassVentures", url: "https://www.mass-ventures.com/mvcapital/acorn", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "MIT The Engine — Blueprint", institution: "MIT The Engine", url: "https://engine.xyz/network/blueprint-s2023", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "U.S. Tech Force (Early‑Career AI/Tech Corps)", institution: "U.S. Federal Govt (OPM)", url: "https://techforce.gov/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Genesis Mission (National AI for Science)", institution: "U.S. Dept. of Energy / White House", url: "https://www.whitehouse.gov/presidential-actions/2025/11/launching-the-genesis-mission/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "AI Action Plan / AI.gov Programs", institution: "U.S. Federal Govt", url: "https://www.ai.gov/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Federal AI & Quantum R&D Priority Boost", institution: "NSF / DOE / Federal Agencies", url: "https://www.nature.com/articles/d41586-025-04108-y", category: 'government', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Albany Nanotech Complex (SUNY Poly)", institution: "Albany, NY (USA)", url: "https://sunypoly.edu/research/albany-nanotech-complex.html", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Acquillius", institution: "San Diego, CA (USA)", url: "https://www.aquillius.com/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Artisan’s Asylum", institution: "Somerville, MA (USA)", url: "https://www.artisansasylum.com/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Baltimore Underground Science Space (BUGSS)", institution: "Baltimore, MD (USA)", url: "https://bugssonline.org/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Berkeley Marvell Nanolab", institution: "Berkeley, CA (USA)", url: "https://nanolab.berkeley.edu/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "BioCurious", institution: "Santa Clara, CA (USA)", url: "https://biocurious.org/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "BioLabs – Tufts Launchpad", institution: "Boston, MA (USA)", url: "https://www.biolabs.io/locations", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "BioLabs – Watertown", institution: "Cambridge/Watertown, MA (USA)", url: "https://www.biolabs.io/locations", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "BioLabs – Lundquist", institution: "Los Angeles, CA (USA)", url: "https://www.biolabs.io/locations", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "BioLabs – New Haven", institution: "New Haven, CT (USA)", url: "https://www.biolabs.io/locations", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "BioLabs – NYU", institution: "New York, NY (USA)", url: "https://www.biolabs.io/locations", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "BioLabs – North Carolina", institution: "Durham, NC (USA)", url: "https://www.biolabs.io/locations", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "BioLabs – Pegasus Park", institution: "Dallas, TX (USA)", url: "https://www.biolabs.io/locations", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "BioLabs – Philadelphia", institution: "Philadelphia, PA (USA)", url: "https://www.biolabs.io/locations", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "BioLabs – Princeton Innovation Center", institution: "Princeton, NJ (USA)", url: "https://www.biolabs.io/locations", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "BioLabs – San Diego", institution: "San Diego, CA (USA)", url: "https://www.biolabs.io/locations", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Bolt – Boston", institution: "Boston, MA (USA)", url: "https://bolt.io/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Biodidact", institution: "Los Alamos, NM (USA)", url: "http://biodidact.net/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Biotech Without Borders", institution: "Long Island, NY (USA)", url: "https://biotechwithoutborders.org/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "BosLab", institution: "Cambridge, MA (USA)", url: "https://www.boslab.org/", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "bwtech @ UMBC (Biotech)", institution: "Baltimore, MD (USA)", url: "https://bwtech.umbc.edu/incubators/biotech/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Centech", institution: "Montreal, QC (Canada)", url: "https://centech.co/en/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Counter Culture Labs", institution: "Oakland, CA (USA)", url: "https://www.counterculturelabs.org/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Dallas Makerspace", institution: "Dallas, TX (USA)", url: "https://dallasmakerspace.org/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "District 3", institution: "Montreal, QC (Canada)", url: "https://district3.co/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Genspace", institution: "Brooklyn, NY (USA)", url: "https://www.genspace.org/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Halifax Makerspace", institution: "Halifax, NS (Canada)", url: "https://halifaxmakerspace.org/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Incubator Art Lab", institution: "Windsor, ON (Canada)", url: "https://incubatorartlab.com/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "IQC NanoFab Lab (Waterloo)", institution: "Waterloo, ON (Canada)", url: "https://uwaterloo.ca/institute-for-quantum-computing/about/facilities-and-labs", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "InterAccess", institution: "Toronto, ON (Canada)", url: "https://interaccess.org/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "JLABS @ LabCentral", institution: "Cambridge, MA (USA)", url: "https://jnjinnovation.com/locations/jlabs/jlabs-labcentral", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "JLABS @ NYC", institution: "New York, NY (USA)", url: "https://jnjinnovation.com/locations/jlabs/jlabs-nyc", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "JLABS @ MBC BioLabs", institution: "San Francisco, CA (USA)", url: "https://jnjinnovation.com/locations/jlabs/jlabs-mbc-biolabs", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "JLABS @ San Diego", institution: "San Diego, CA (USA)", url: "https://jnjinnovation.com/locations/jlabs/jlabs-san-diego", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "JLABS @ SSF", institution: "South San Francisco, CA (USA)", url: "https://jnjinnovation.com/locations/jlabs/jlabs-ssf", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "JLABS @ TMC", institution: "Houston, TX (USA)", url: "https://jnjinnovation.com/locations/jlabs/jlabs-tmc", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "JLABS @ Toronto", institution: "Toronto, ON (Canada)", url: "https://jnjinnovation.com/locations/jlabs/jlabs-toronto", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "JLABS @ Washington DC", institution: "Washington, DC (USA)", url: "https://jnjinnovation.com/locations/jlabs/jlabs-washington-dc", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "La Jolla Bio Lab (IDEA Lab)", institution: "La Jolla, CA (USA)", url: "https://www.lajollalibrary.org/idea-lab", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "LabCentral", institution: "Cambridge, MA (USA)", url: "https://labcentral.org/", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "London Biohackspace", institution: "London (UK)", url: "https://biohackspace.org/", category: 'university', focus: ['Research'], region: 'EU', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "MakerSpace Charlotte", institution: "Charlotte, NC (USA)", url: "https://www.makerspacecharlotte.org/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "MakerWorks", institution: "Ann Arbor, MI (USA)", url: "https://www.maker-works.com/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Molecular Foundry (LBNL)", institution: "Berkeley, CA (USA)", url: "https://foundry.lbl.gov/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "NewLab", institution: "Brooklyn, NY (USA)", url: "https://www.newlab.com/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Noisebridge", institution: "San Francisco, CA (USA)", url: "https://www.noisebridge.net/wiki/Noisebridge", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "North Forge Fabrication Lab", institution: "Winnipeg, MB (Canada)", url: "https://northforge.ca/support-services/fabrication-lab/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "NYC Resistor", institution: "New York, NY (USA)", url: "https://www.nycresistor.com/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Open Science Network", institution: "Vancouver, BC (Canada)", url: "http://www.opensciencenet.org/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Ottawa Bio Science", institution: "Ottawa, ON (Canada)", url: "http://specyal.com/diybio/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Protospace", institution: "Calgary, AB (Canada)", url: "https://protospace.ca/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Pumping Station: One", institution: "Chicago, IL (USA)", url: "https://pumpingstationone.org/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "QB3", institution: "San Francisco, CA (USA)", url: "https://qb3.org/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Rensselaer cMDIS", institution: "Troy, NY (USA)", url: "https://cmdis.rpi.edu/facilities-equipment", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Science Discovery Zone", institution: "Toronto, ON (Canada)", url: "https://decadeofdiscovery.torontomu.ca/community/the-business-of-innovation", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Scihouse", institution: "South Bend, IN (USA)", url: "https://www.scihouse.space/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "SoundBio Lab", institution: "Seattle, WA (USA)", url: "https://www.sound.bio/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Stanford Nanofabrication Facility", institution: "Palo Alto, CA (USA)", url: "https://snf.stanford.edu/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Teardown Library – San Francisco", institution: "San Francisco, CA (USA)", url: "https://teardownlibrary.com/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Teardown Library – Boston", institution: "Boston, MA (USA)", url: "https://teardownlibrary.com/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "The Makery", institution: "Brooklyn, NY (USA)", url: "https://www.nycmakery.com/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "TinkerMill", institution: "Longmont, CO (USA)", url: "https://tinkermill.org/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "UH Nanofabrication Facility (UHNF)", institution: "Houston, TX (USA)", url: "https://uhnf.egr.uh.edu/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Vancouver Hack Space", institution: "Vancouver, BC (Canada)", url: "https://vanhack.ca/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Velocity", institution: "Waterloo, ON (Canada)", url: "https://velocityincubator.com/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Badass Labs", institution: "San Francisco, CA (USA)", url: "https://badasslabs.org/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Daybreak Labs", institution: "Livermore, CA (USA)", url: "https://daybreaklabs.io/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Bonneville Labs", institution: "San Francisco, CA (USA)", url: "https://bonnevillelabs.com/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Spalding Lab (Kirsty Spalding)", institution: "Karolinska Inst. (Sweden)", url: "https://www.spaldinglab.org/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Kanold Lab", institution: "Johns Hopkins BME", url: "https://kanoldlab.com", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Allen Institute for Neural Dynamics", institution: "Allen Institute (Seattle)", url: "https://alleninstitute.org/division/neural-dynamics/", category: 'think-tank', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Orsborn Lab", institution: "Univ. of Washington (ECE/BioE)", url: "https://www.ece.uw.edu/people/amy-orsborn/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Noble‑Haeusslein (Noble) Lab", institution: "UT Austin / Dell Med", url: "https://sites.utexas.edu/noble-lab/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Cold Spring Harbor Laboratory – Neuroscience", institution: "CSHL (NY)", url: "https://www.cshl.edu/research/neuroscience/", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Svoboda Lab", institution: "Janelia Research Campus (HHMI) / Allen Inst.", url: "https://www.janelia.org/svoboda-lab", category: 'think-tank', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Laboratory of Evolutionary Design | Brian Hie", institution: "Stanford / Arc Institute", url: "https://evodesign.org", category: 'think-tank', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
  { name: "Valthos (AI Biodefense Startup)", institution: "Valthos (NYC)", url: "https://www.valthos.com", category: 'university', focus: ['Research'], region: 'NA', crawl: { enabled: true, maxDepth: 1, maxPagesPerRun: 10, minDelayMs: 1000 } },
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
    })),
  );
}

export function getCrawlSeeds() {
  return GLOBAL_SOURCES.filter((s) => s.crawl?.enabled);
}
