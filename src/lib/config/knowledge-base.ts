// ============================================================================
// FILE: src/lib/config/knowledge-base.ts
// ============================================================================

export type SourceCategory = 'university' | 'industry' | 'government' | 'startup' | 'github' | 'think-tank' | 'media' | 'archive';

export interface ResearchSource {
  name: string;
  institution?: string;
  url: string;
  category: SourceCategory;
  focus: string[];
  region: 'NA' | 'EU' | 'ASIA' | 'GLOBAL' | 'ME' | 'LATAM' | 'AFRICA';
}

export const GLOBAL_SOURCES: ResearchSource[] = [
  // =================================================================
  // 1. NORTH AMERICAN UNIVERSITIES (The Heavy Hitters)
  // =================================================================
  { name: "Stanford AI Lab", institution: "Stanford", url: "https://ai.stanford.edu", category: 'university', focus: ["ML", "AI"], region: 'NA' },
  { name: "Stanford HAI", institution: "Stanford", url: "https://hai.stanford.edu", category: 'university', focus: ["Human-AI"], region: 'NA' },
  { name: "Stanford Bio-X", institution: "Stanford", url: "https://biox.stanford.edu", category: 'university', focus: ["Biomedical"], region: 'NA' },
  { name: "SLAC Accelerator", institution: "Stanford", url: "https://www6.slac.stanford.edu", category: 'university', focus: ["Physics"], region: 'NA' },
  
  { name: "MIT CSAIL", institution: "MIT", url: "https://csail.mit.edu", category: 'university', focus: ["AI", "Robotics"], region: 'NA' },
  { name: "MIT Media Lab", institution: "MIT", url: "https://media.mit.edu", category: 'university', focus: ["Digital Media"], region: 'NA' },
  { name: "MIT Quest for Intelligence", institution: "MIT", url: "https://quest.mit.edu", category: 'university', focus: ["AI Foundations"], region: 'NA' },
  { name: "MIT Lincoln Lab", institution: "MIT", url: "https://www.ll.mit.edu", category: 'university', focus: ["Defense", "Cybersecurity"], region: 'NA' },

  { name: "Berkeley AI Research (BAIR)", institution: "UC Berkeley", url: "https://bair.berkeley.edu", category: 'university', focus: ["AI", "Robotics"], region: 'NA' },
  { name: "Berkeley RISE Lab", institution: "UC Berkeley", url: "https://rise.cs.berkeley.edu", category: 'university', focus: ["Systems"], region: 'NA' },
  { name: "Berkeley SkyDeck", institution: "UC Berkeley", url: "https://skydeck.berkeley.edu", category: 'university', focus: ["Startups"], region: 'NA' },

  { name: "CMU Robotics Institute", institution: "Carnegie Mellon", url: "https://www.ri.cmu.edu", category: 'university', focus: ["Robotics"], region: 'NA' },
  { name: "CMU Language Tech", institution: "Carnegie Mellon", url: "https://www.lti.cs.cmu.edu", category: 'university', focus: ["NLP", "Speech"], region: 'NA' },

  { name: "Harvard SEAS AI", institution: "Harvard", url: "https://cse-lab.seas.harvard.edu", category: 'university', focus: ["ML"], region: 'NA' },
  { name: "Harvard Data Science", institution: "Harvard", url: "https://datascience.harvard.edu", category: 'university', focus: ["Data Science"], region: 'NA' },

  { name: "Columbia Vision Lab", institution: "Columbia", url: "https://www1.cs.columbia.edu/CAVE/", category: 'university', focus: ["Computer Vision"], region: 'NA' },
  { name: "Yale AI Lab", institution: "Yale", url: "https://cpsc.yale.edu/research", category: 'university', focus: ["AI"], region: 'NA' },
  { name: "Princeton ML Group", institution: "Princeton", url: "https://www.cs.princeton.edu/research", category: 'university', focus: ["ML", "Optimization"], region: 'NA' },
  
  { name: "Caltech Neuroscience", institution: "Caltech", url: "https://neuroscience.caltech.edu", category: 'university', focus: ["Neuroscience"], region: 'NA' },
  { name: "Georgia Tech GVU", institution: "Georgia Tech", url: "https://www.gvu.gatech.edu", category: 'university', focus: ["HCI", "Graphics"], region: 'NA' },
  { name: "Purdue Quantum Lab", institution: "Purdue", url: "https://engineering.purdue.edu/QCL", category: 'university', focus: ["Quantum"], region: 'NA' },
  { name: "Vector Institute", institution: "U of Toronto", url: "https://www.vectorinstitute.ai", category: 'university', focus: ["AI"], region: 'NA' },

  // =================================================================
  // 2. INTERNATIONAL UNIVERSITIES (Asia & Europe)
  // =================================================================
  { name: "Tsinghua AIR", institution: "Tsinghua", url: "https://air.tsinghua.edu.cn/en/", category: 'university', focus: ["Industrial AI"], region: 'ASIA' },
  { name: "Tsinghua Brain & Cognition", institution: "Tsinghua", url: "https://brain.tsinghua.edu.cn/en/", category: 'university', focus: ["Cognitive AI"], region: 'ASIA' },
  { name: "Peking U CS", institution: "Peking U", url: "https://cs.pku.edu.cn", category: 'university', focus: ["CS Research"], region: 'ASIA' },
  { name: "NTU MARS Lab", institution: "NTU Singapore", url: "http://marslab.tech", category: 'university', focus: ["Robotics"], region: 'ASIA' },
  { name: "NUS Computing", institution: "NUS", url: "https://www.comp.nus.edu.sg", category: 'university', focus: ["Systems"], region: 'ASIA' },

  { name: "Cambridge Cavendish", institution: "Cambridge", url: "https://www.phy.cam.ac.uk", category: 'university', focus: ["Physics"], region: 'EU' },
  { name: "Oxford CS", institution: "Oxford", url: "https://www.cs.ox.ac.uk", category: 'university', focus: ["Verification", "AI"], region: 'EU' },
  { name: "ETH Zurich CS", institution: "ETH Zurich", url: "https://www.inf.ethz.ch", category: 'university', focus: ["Systems"], region: 'EU' },
  { name: "TUM CS", institution: "TU Munich", url: "https://www.cs.tum.de", category: 'university', focus: ["AI", "Systems"], region: 'EU' },

  // =================================================================
  // 3. TECH INDUSTRY GIANTS
  // =================================================================
  { name: "Google AI", url: "https://ai.google", category: 'industry', focus: ["Deep Learning"], region: 'NA' },
  { name: "DeepMind", url: "https://www.deepmind.com", category: 'industry', focus: ["AGI", "AlphaFold"], region: 'GLOBAL' },
  { name: "Microsoft Research", url: "https://www.microsoft.com/en-us/research/", category: 'industry', focus: ["General AI"], region: 'GLOBAL' },
  { name: "IBM Research", url: "https://www.research.ibm.com", category: 'industry', focus: ["Quantum"], region: 'NA' },
  { name: "Intel Labs", url: "https://www.intel.com/content/www/us/en/research/research-overview.html", category: 'industry', focus: ["Hardware"], region: 'NA' },
  { name: "NVIDIA Research", url: "https://www.nvidia.com/en-us/research/", category: 'industry', focus: ["GPU", "AI"], region: 'NA' },
  { name: "Meta AI (FAIR)", url: "https://ai.meta.com/research/", category: 'industry', focus: ["Vision", "LLMs"], region: 'NA' },
  { name: "OpenAI", url: "https://openai.com/research", category: 'industry', focus: ["LLMs", "AGI"], region: 'NA' },
  { name: "Anthropic", url: "https://www.anthropic.com/research", category: 'industry', focus: ["Safety"], region: 'NA' },

  // =================================================================
  // 4. CHINESE AI LABS
  // =================================================================
  { name: "DeepSeek", url: "https://www.deepseek.com", category: 'industry', focus: ["Reasoning", "LLMs"], region: 'ASIA' },
  { name: "Alibaba DAMO", url: "https://damo.alibaba.com", category: 'industry', focus: ["Enterprise AI"], region: 'ASIA' },
  { name: "Baidu Research", url: "https://www.baidu.com/research/ernie", category: 'industry', focus: ["Autonomous Driving"], region: 'ASIA' },
  { name: "Tencent AI", url: "https://ai.tencent.com", category: 'industry', focus: ["Multimodal"], region: 'ASIA' },
  { name: "Zhipu AI", url: "https://www.zhipuai.cn", category: 'industry', focus: ["GLM Models"], region: 'ASIA' },
  { name: "Moonshot AI", url: "https://www.moonshot.cn", category: 'industry', focus: ["Kimi Model"], region: 'ASIA' },

  // =================================================================
  // 5. GOVERNMENT & RESEARCH ORGS (Science)
  // =================================================================
  { name: "CERN LHC", url: "https://home.cern", category: 'government', focus: ["Particle Physics"], region: 'EU' },
  { name: "NASA JPL", url: "https://www.jpl.nasa.gov", category: 'government', focus: ["Space AI"], region: 'NA' },
  { name: "Lawrence Berkeley Lab", url: "https://newscenter.lbl.gov", category: 'government', focus: ["Materials"], region: 'NA' },
  { name: "Oak Ridge Lab", url: "https://www.ornl.gov", category: 'government', focus: ["HPC"], region: 'NA' },
  { name: "NOAA Ocean AI", url: "https://oceanobservatories.org", category: 'government', focus: ["Climate"], region: 'NA' },

  // =================================================================
  // 6. STARTUPS & GITHUB
  // =================================================================
  { name: "Perplexity", url: "https://www.perplexity.ai/blog", category: 'startup', focus: ["Search"], region: 'NA' },
  { name: "LangChain", url: "https://blog.langchain.dev", category: 'startup', focus: ["Agents"], region: 'NA' },
  { name: "Hugging Face", url: "https://huggingface.co/blog", category: 'startup', focus: ["Open Source"], region: 'GLOBAL' },
  { name: "Mistral", url: "https://mistral.ai/news", category: 'startup', focus: ["LLMs"], region: 'EU' },
  { name: "AutoGPT Repo", url: "https://github.com/Significant-Gravitas/Auto-GPT", category: 'github', focus: ["Agents"], region: 'GLOBAL' },
  { name: "PyTorch Repo", url: "https://github.com/pytorch/pytorch", category: 'github', focus: ["Framework"], region: 'GLOBAL' },
  { name: "Vercel AI SDK", url: "https://sdk.vercel.ai", category: 'github', focus: ["Web AI"], region: 'NA' },

  // =================================================================
  // 7. MEDICAL UNIVERSITIES & RESEARCH CENTERS - NORTH AMERICA
  // =================================================================
  { name: "Harvard Medical School", institution: "Harvard", url: "https://hms.harvard.edu/research", category: 'university', focus: ["Clinical Research", "Biomedical"], region: 'NA' },
  { name: "Johns Hopkins Medicine", institution: "Johns Hopkins", url: "https://www.hopkinsmedicine.org/research", category: 'university', focus: ["Neuroscience", "Cancer"], region: 'NA' },
  { name: "Stanford Medicine", institution: "Stanford", url: "https://med.stanford.edu/research.html", category: 'university', focus: ["Precision Health", "Genomics"], region: 'NA' },
  { name: "UCSF Medical Center", institution: "UC San Francisco", url: "https://www.ucsf.edu/research", category: 'university', focus: ["Neurology", "Immunology"], region: 'NA' },
  { name: "Mayo Clinic Research", institution: "Mayo Clinic", url: "https://www.mayo.edu/research", category: 'university', focus: ["Regenerative Medicine", "Clinical Trials"], region: 'NA' },
  { name: "Cleveland Clinic Lerner", institution: "Cleveland Clinic", url: "https://www.lerner.ccf.org", category: 'university', focus: ["Cardiovascular", "Cancer"], region: 'NA' },
  { name: "Penn Medicine", institution: "UPenn", url: "https://www.pennmedicine.org/research", category: 'university', focus: ["Gene Therapy", "Cancer"], region: 'NA' },
  { name: "UCSF Helen Diller Cancer Center", institution: "UCSF", url: "https://cancer.ucsf.edu", category: 'university', focus: ["Oncology"], region: 'NA' },
  { name: "Duke Health Research", institution: "Duke", url: "https://research.duke.edu/health-medicine", category: 'university', focus: ["Clinical Trials", "Genomics"], region: 'NA' },
  { name: "Washington U Medicine", institution: "WashU", url: "https://medicine.wustl.edu/research/", category: 'university', focus: ["Neuroscience", "Diabetes"], region: 'NA' },
  { name: "Columbia Medical Center", institution: "Columbia", url: "https://www.cuimc.columbia.edu/research", category: 'university', focus: ["Cardiology", "Cancer"], region: 'NA' },
  { name: "Yale School of Medicine", institution: "Yale", url: "https://medicine.yale.edu/research/", category: 'university', focus: ["Immunobiology", "Cancer"], region: 'NA' },
  { name: "Northwestern Medicine", institution: "Northwestern", url: "https://www.feinberg.northwestern.edu/research/", category: 'university', focus: ["Neurology", "Cardiology"], region: 'NA' },
  { name: "Vanderbilt Medical Center", institution: "Vanderbilt", url: "https://www.vumc.org/research/", category: 'university', focus: ["Precision Medicine"], region: 'NA' },
  { name: "Baylor College of Medicine", institution: "Baylor", url: "https://www.bcm.edu/research", category: 'university', focus: ["Genetics", "Neuroscience"], region: 'NA' },
  { name: "UCSD Health Sciences", institution: "UC San Diego", url: "https://health.ucsd.edu/research", category: 'university', focus: ["Stem Cells", "Immunology"], region: 'NA' },
  { name: "UCLA Health Research", institution: "UCLA", url: "https://www.uclahealth.org/research", category: 'university', focus: ["Cancer", "Neuroscience"], region: 'NA' },
  { name: "UW Medicine Research", institution: "U Washington", url: "https://www.uwmedicine.org/research", category: 'university', focus: ["Global Health", "Infectious Disease"], region: 'NA' },
  { name: "U Michigan Medicine", institution: "Michigan", url: "https://research.medicine.umich.edu", category: 'university', focus: ["Precision Health"], region: 'NA' },
  { name: "Emory Health Sciences", institution: "Emory", url: "https://www.emoryhealthsciences.org/research/", category: 'university', focus: ["Infectious Disease", "Vaccines"], region: 'NA' },
  { name: "U Toronto Medicine", institution: "U Toronto", url: "https://medicine.utoronto.ca/research", category: 'university', focus: ["Regenerative Medicine"], region: 'NA' },

  // NCI-DESIGNATED CANCER CENTERS
  { name: "MD Anderson Cancer Center", institution: "UT MD Anderson", url: "https://www.mdanderson.org/research.html", category: 'university', focus: ["Oncology", "Cancer"], region: 'NA' },
  { name: "Memorial Sloan Kettering", institution: "MSK", url: "https://www.mskcc.org/research", category: 'university', focus: ["Cancer", "Immunotherapy"], region: 'NA' },
  { name: "Dana-Farber Cancer Institute", institution: "Harvard", url: "https://www.dana-farber.org/research/", category: 'university', focus: ["Cancer", "Genomics"], region: 'NA' },
  { name: "Fred Hutchinson Cancer Center", institution: "Fred Hutch", url: "https://www.fredhutch.org/en/research.html", category: 'university', focus: ["Cancer", "Immunotherapy"], region: 'NA' },
  { name: "Roswell Park Cancer Institute", institution: "Roswell Park", url: "https://www.roswellpark.org/research", category: 'university', focus: ["Oncology"], region: 'NA' },

  // =================================================================
  // 8. MEDICAL UNIVERSITIES & RESEARCH CENTERS - INTERNATIONAL
  // =================================================================
  { name: "Karolinska Institutet", institution: "Karolinska", url: "https://ki.se/en/research", category: 'university', focus: ["Neuroscience", "Immunology", "Cancer"], region: 'EU' },
  { name: "Oxford Medical Sciences", institution: "Oxford", url: "https://www.medsci.ox.ac.uk/research", category: 'university', focus: ["Vaccines", "Clinical Trials"], region: 'EU' },
  { name: "Cambridge Medicine", institution: "Cambridge", url: "https://www.cam.ac.uk/research/research-at-cambridge/medicine", category: 'university', focus: ["Cancer", "Genomics"], region: 'EU' },
  { name: "Imperial College Medicine", institution: "Imperial", url: "https://www.imperial.ac.uk/medicine/research/", category: 'university', focus: ["Infectious Disease"], region: 'EU' },
  { name: "UCL Medical School", institution: "UCL", url: "https://www.ucl.ac.uk/medical-school/research", category: 'university', focus: ["Neuroscience", "Cancer"], region: 'EU' },
  { name: "Charité Berlin", institution: "Charité", url: "https://www.charite.de/en/research/", category: 'university', focus: ["Neurology", "Immunology"], region: 'EU' },
  { name: "Singapore General Hospital", institution: "SGH", url: "https://www.sgh.com.sg/research-innovation/", category: 'university', focus: ["Clinical Trials", "CART-T", "AI"], region: 'ASIA' },
  { name: "National University Hospital Singapore", institution: "NUS", url: "https://www.nuh.com.sg/research", category: 'university', focus: ["Cancer", "Precision Medicine"], region: 'ASIA' },
  { name: "U Tokyo Medicine", institution: "U Tokyo", url: "https://www.u-tokyo.ac.jp/en/research/", category: 'university', focus: ["Regenerative Medicine"], region: 'ASIA' },

  // =================================================================
  // 9. NIH INSTITUTES & CENTERS
  // =================================================================
  { name: "National Cancer Institute", institution: "NIH", url: "https://www.cancer.gov", category: 'government', focus: ["Cancer Research"], region: 'NA' },
  { name: "NIAID", institution: "NIH", url: "https://www.niaid.nih.gov", category: 'government', focus: ["Infectious Disease", "Immunology"], region: 'NA' },
  { name: "NIMH", institution: "NIH", url: "https://www.nimh.nih.gov", category: 'government', focus: ["Mental Health"], region: 'NA' },
  { name: "NINDS", institution: "NIH", url: "https://www.ninds.nih.gov", category: 'government', focus: ["Neurology", "Stroke"], region: 'NA' },
  { name: "NHLBI", institution: "NIH", url: "https://www.nhlbi.nih.gov", category: 'government', focus: ["Cardiology", "Lung Disease"], region: 'NA' },
  { name: "NIDDK", institution: "NIH", url: "https://www.niddk.nih.gov", category: 'government', focus: ["Diabetes", "Kidney"], region: 'NA' },
  { name: "NHGRI", institution: "NIH", url: "https://www.genome.gov", category: 'government', focus: ["Genomics"], region: 'NA' },
  { name: "National Eye Institute", institution: "NIH", url: "https://www.nei.nih.gov", category: 'government', focus: ["Ophthalmology"], region: 'NA' },
  { name: "NIBIB", institution: "NIH", url: "https://www.nibib.nih.gov", category: 'government', focus: ["Biomedical Imaging"], region: 'NA' },
  { name: "NICHD", institution: "NIH", url: "https://www.nichd.nih.gov", category: 'government', focus: ["Child Health"], region: 'NA' },
  { name: "NIA", institution: "NIH", url: "https://www.nia.nih.gov", category: 'government', focus: ["Aging"], region: 'NA' },
  { name: "National Library of Medicine", institution: "NIH", url: "https://www.nlm.nih.gov", category: 'government', focus: ["Medical Informatics"], region: 'NA' },

  // =================================================================
  // 10. GOVERNMENT & INTERNATIONAL HEALTH ORGS
  // =================================================================
  { name: "CDC", url: "https://www.cdc.gov", category: 'government', focus: ["Infectious Disease", "Public Health"], region: 'NA' },
  { name: "FDA CDER", url: "https://www.fda.gov/about-fda/center-drug-evaluation-and-research-cder", category: 'government', focus: ["Drug Approval"], region: 'NA' },
  { name: "FDA CBER", url: "https://www.fda.gov/about-fda/fda-organization/center-biologics-evaluation-and-research-cber", category: 'government', focus: ["Biologics", "Vaccines"], region: 'NA' },
  { name: "WHO", url: "https://www.who.int/health-topics", category: 'government', focus: ["Global Health"], region: 'GLOBAL' },
  { name: "EMA", url: "https://www.ema.europa.eu/en", category: 'government', focus: ["Drug Regulation"], region: 'EU' },
  { name: "Wellcome Trust", url: "https://wellcome.org/what-we-do/our-work", category: 'government', focus: ["Global Health", "Biomedical"], region: 'GLOBAL' },

  // =================================================================
  // 11. PHARMA & BIOTECH
  // =================================================================
  { name: "Pfizer Research", url: "https://www.pfizer.com/science/research-development", category: 'industry', focus: ["Drug Discovery", "Vaccines"], region: 'NA' },
  { name: "Moderna", url: "https://www.modernatx.com/research", category: 'industry', focus: ["mRNA", "Vaccines"], region: 'NA' },
  { name: "Roche Research", url: "https://www.roche.com/research_and_development", category: 'industry', focus: ["Oncology", "Diagnostics"], region: 'EU' },
  { name: "Novartis Research", url: "https://www.novartis.com/research-development", category: 'industry', focus: ["Gene Therapy", "CAR-T"], region: 'EU' },
  { name: "Johnson & Johnson Innovation", url: "https://www.jnjinnovation.com", category: 'industry', focus: ["MedTech", "Pharma"], region: 'NA' },
  { name: "Merck Research Labs", url: "https://www.merck.com/research/", category: 'industry', focus: ["Oncology", "Vaccines"], region: 'NA' },
  { name: "AstraZeneca R&D", url: "https://www.astrazeneca.com/r-d.html", category: 'industry', focus: ["Oncology", "Respiratory"], region: 'EU' },
  { name: "Sanofi R&D", url: "https://www.sanofi.com/en/science-and-innovation", category: 'industry', focus: ["Immunology", "Rare Diseases"], region: 'EU' },
  { name: "Genentech Research", url: "https://www.gene.com/research", category: 'industry', focus: ["Biologics", "Oncology"], region: 'NA' },
  { name: "Gilead Sciences", url: "https://www.gilead.com/science-and-medicine/research", category: 'industry', focus: ["Antivirals", "Oncology"], region: 'NA' },
  { name: "BioNTech", url: "https://www.biontech.com/int/en/home/research-development.html", category: 'industry', focus: ["mRNA", "Cancer Vaccines"], region: 'EU' },
  { name: "Regeneron", url: "https://www.regeneron.com/science", category: 'industry', focus: ["Antibodies", "Genomics"], region: 'NA' },
  { name: "Vertex Pharmaceuticals", url: "https://www.vrtx.com/research-development/", category: 'industry', focus: ["Cystic Fibrosis", "Gene Editing"], region: 'NA' },
  { name: "Illumina", url: "https://www.illumina.com/science.html", category: 'industry', focus: ["Genomic Sequencing"], region: 'NA' },
  { name: "Amgen Research", url: "https://www.amgen.com/science", category: 'industry', focus: ["Oncology", "Biosimilars"], region: 'NA' },
  { name: "Bristol Myers Squibb", url: "https://www.bms.com/researchers-and-partners.html", category: 'industry', focus: ["Immuno-Oncology"], region: 'NA' },
  { name: "Eli Lilly Research", url: "https://www.lilly.com/discovery", category: 'industry', focus: ["Neuroscience", "Diabetes"], region: 'NA' },
  { name: "Takeda Research", url: "https://www.takeda.com/what-we-do/research-and-development/", category: 'industry', focus: ["Rare Diseases", "Oncology"], region: 'ASIA' },

  // =================================================================
  // 12. MEDICAL AI STARTUPS & GITHUB PROJECTS
  // =================================================================
  { name: "Hippocratic AI", url: "https://www.hippocratic.ai", category: 'startup', focus: ["Healthcare LLMs", "Clinical AI"], region: 'NA' },
  { name: "Abridge", url: "https://www.abridge.com", category: 'startup', focus: ["Clinical Documentation", "NLP"], region: 'NA' },
  { name: "PathAI", url: "https://www.pathai.com", category: 'startup', focus: ["Pathology", "Cancer Detection"], region: 'NA' },
  { name: "Tempus", url: "https://www.tempus.com", category: 'startup', focus: ["Precision Medicine", "Genomics"], region: 'NA' },
  { name: "Paige AI", url: "https://paige.ai", category: 'startup', focus: ["Digital Pathology"], region: 'NA' },
  { name: "Project MONAI", url: "https://github.com/Project-MONAI/MONAI", category: 'github', focus: ["Medical Imaging", "PyTorch"], region: 'GLOBAL' },
  { name: "NVIDIA Clara", url: "https://github.com/NVIDIA/clara-train-examples", category: 'github', focus: ["Healthcare Imaging", "GPU"], region: 'GLOBAL' },
  { name: "Microsoft InnerEye", url: "https://github.com/microsoft/InnerEye-DeepLearning", category: 'github', focus: ["Radiotherapy", "Medical Imaging"], region: 'GLOBAL' },
  { name: "FastAI Medical", url: "https://github.com/fastai/medical-imaging", category: 'github', focus: ["Medical Imaging"], region: 'GLOBAL' },
  { name: "MedCAT", url: "https://github.com/CogStack/MedCAT", category: 'github', focus: ["Clinical NLP"], region: 'GLOBAL' },
  { name: "BioGPT", url: "https://github.com/microsoft/BioGPT", category: 'github', focus: ["Biomedical NLP"], region: 'GLOBAL' },

  // =================================================================
  // 13. AUTHORITATIVE POLITICAL & GEOPOLITICAL (Think Tanks & Institutes)
  // =================================================================
  { name: "Brookings Institution", url: "https://www.brookings.edu", category: 'think-tank', focus: ["Policy", "Economics"], region: 'NA' },
  { name: "CSIS (Strategic & Int. Studies)", url: "https://www.csis.org", category: 'think-tank', focus: ["Defense", "Geopolitics"], region: 'NA' },
  { name: "Council on Foreign Relations", url: "https://www.cfr.org", category: 'think-tank', focus: ["Foreign Policy"], region: 'NA' },
  { name: "Carnegie Endowment", url: "https://carnegieendowment.org", category: 'think-tank', focus: ["Peace", "Diplomacy"], region: 'GLOBAL' },
  { name: "RAND Corporation", url: "https://www.rand.org", category: 'think-tank', focus: ["Security", "Policy Analysis"], region: 'NA' },
  { name: "Chatham House", url: "https://www.chathamhouse.org", category: 'think-tank', focus: ["International Affairs"], region: 'EU' },
  { name: "RUSI (Royal United Services)", url: "https://rusi.org", category: 'think-tank', focus: ["Defense", "Security"], region: 'EU' },
  { name: "Atlantic Council", url: "https://www.atlanticcouncil.org", category: 'think-tank', focus: ["NATO", "Transatlantic"], region: 'GLOBAL' },
  { name: "Heritage Foundation", url: "https://www.heritage.org", category: 'think-tank', focus: ["Conservative Policy"], region: 'NA' },
  { name: "Center for American Progress", url: "https://www.americanprogress.org", category: 'think-tank', focus: ["Progressive Policy"], region: 'NA' },
  { name: "Hudson Institute", url: "https://www.hudson.org", category: 'think-tank', focus: ["National Security"], region: 'NA' },
  { name: "Stimson Center", url: "https://www.stimson.org", category: 'think-tank', focus: ["Global Security"], region: 'NA' },
  { name: "Wilson Center", url: "https://www.wilsoncenter.org", category: 'think-tank', focus: ["Global Policy"], region: 'NA' },
  { name: "IISS (Int. Inst. Strategic Studies)", url: "https://www.iiss.org", category: 'think-tank', focus: ["Military Balance"], region: 'GLOBAL' },
  { name: "SIPRI (Stockholm Peace Research)", url: "https://www.sipri.org", category: 'think-tank', focus: ["Arms Control"], region: 'EU' },
  { name: "ECFR (European Council Foreign Relations)", url: "https://ecfr.eu", category: 'think-tank', focus: ["EU Policy"], region: 'EU' },
  { name: "MERICS (China Studies)", url: "https://merics.org/en", category: 'think-tank', focus: ["China Policy"], region: 'EU' },
  { name: "ASPI (Aust. Strategic Policy)", url: "https://www.aspi.org.au", category: 'think-tank', focus: ["Indo-Pacific"], region: 'ASIA' },
  { name: "ORF (Observer Research Foundation)", url: "https://www.orfonline.org", category: 'think-tank', focus: ["India Policy"], region: 'ASIA' },
  { name: "Lowy Institute", url: "https://www.lowyinstitute.org", category: 'think-tank', focus: ["International Policy"], region: 'ASIA' },

  // =================================================================
  // 14. GOVERNMENT & INTERNATIONAL ORGANIZATIONS (Political)
  // =================================================================
  { name: "United Nations (UN)", url: "https://www.un.org", category: 'government', focus: ["International Law"], region: 'GLOBAL' },
  { name: "UN Security Council", url: "https://www.un.org/securitycouncil/", category: 'government', focus: ["Resolutions"], region: 'GLOBAL' },
  { name: "NATO", url: "https://www.nato.int", category: 'government', focus: ["Defense Alliance"], region: 'EU' },
  { name: "European Commission", url: "https://commission.europa.eu", category: 'government', focus: ["EU Law"], region: 'EU' },
  { name: "World Bank", url: "https://www.worldbank.org", category: 'government', focus: ["Development"], region: 'GLOBAL' },
  { name: "IMF", url: "https://www.imf.org", category: 'government', focus: ["Economics"], region: 'GLOBAL' },
  { name: "OECD", url: "https://www.oecd.org", category: 'government', focus: ["Economic Policy"], region: 'GLOBAL' },
  { name: "WTO", url: "https://www.wto.org", category: 'government', focus: ["Trade"], region: 'GLOBAL' },
  { name: "White House", url: "https://www.whitehouse.gov", category: 'government', focus: ["US Executive"], region: 'NA' },
  { name: "US State Department", url: "https://www.state.gov", category: 'government', focus: ["Diplomacy"], region: 'NA' },
  { name: "US Congress", url: "https://www.congress.gov", category: 'government', focus: ["Legislation"], region: 'NA' },
  { name: "UK Parliament", url: "https://www.parliament.uk", category: 'government', focus: ["Legislation"], region: 'EU' },
  
  // =================================================================
  // 15. MEDIA & JOURNALISM (High Integrity / Wire Services)
  // =================================================================
  { name: "Reuters", url: "https://www.reuters.com", category: 'media', focus: ["Global News"], region: 'GLOBAL' },
  { name: "Associated Press (AP)", url: "https://apnews.com", category: 'media', focus: ["Wire Service"], region: 'NA' },
  { name: "BBC News", url: "https://www.bbc.com/news", category: 'media', focus: ["Global News"], region: 'EU' },
  { name: "Financial Times", url: "https://www.ft.com", category: 'media', focus: ["Finance", "Economics"], region: 'EU' },
  { name: "The Economist", url: "https://www.economist.com", category: 'media', focus: ["Geopolitics", "Economics"], region: 'EU' },
  { name: "Foreign Affairs", url: "https://www.foreignaffairs.com", category: 'media', focus: ["Geopolitics"], region: 'NA' },
  { name: "Foreign Policy", url: "https://foreignpolicy.com", category: 'media', focus: ["Global Politics"], region: 'NA' },
  { name: "Politico", url: "https://www.politico.com", category: 'media', focus: ["US/EU Politics"], region: 'NA' },
  { name: "Al Jazeera English", url: "https://www.aljazeera.com", category: 'media', focus: ["Middle East"], region: 'ME' },
  { name: "Kyodo News", url: "https://english.kyodonews.net", category: 'media', focus: ["Japan/Asia"], region: 'ASIA' },
  
  // =================================================================
  // 16. HISTORICAL ARCHIVES & PRIMARY SOURCES
  // =================================================================
  { name: "Library of Congress", url: "https://www.loc.gov", category: 'archive', focus: ["Primary Sources"], region: 'NA' },
  { name: "National Archives (US)", url: "https://www.archives.gov", category: 'archive', focus: ["US History"], region: 'NA' },
  { name: "National Archives (UK)", url: "https://www.nationalarchives.gov.uk", category: 'archive', focus: ["UK History"], region: 'EU' },
  { name: "CIA FOIA Reading Room", url: "https://www.cia.gov/readingroom/", category: 'archive', focus: ["Declassified Intel"], region: 'NA' },
  { name: "Wilson Center Digital Archive", url: "https://digitalarchive.wilsoncenter.org", category: 'archive', focus: ["Cold War History"], region: 'GLOBAL' },
  { name: "Marxists Internet Archive", url: "https://www.marxists.org", category: 'archive', focus: ["Political Theory"], region: 'GLOBAL' },
  { name: "Project Gutenberg", url: "https://www.gutenberg.org", category: 'archive', focus: ["Classic Literature"], region: 'GLOBAL' },
  { name: "Internet Archive", url: "https://archive.org", category: 'archive', focus: ["Web History"], region: 'GLOBAL' },
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
  // Check strict match or if the source URL is contained within
  return GLOBAL_SOURCES.some(source => url.includes(source.url) || domain.includes(getDomain(source.url)));
}
