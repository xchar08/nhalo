***

# 😇 Halo Research Engine

**Halo** is an autonomous, AI-powered research engine. It performs deep web research, extracts empirical claims, builds interactive knowledge graphs, and synthesizes comprehensive reports with verifiable citations.

It employs a **hybrid architecture** where a Next.js application handles the UI and API, while a decoupled Node.js background worker executes long-running AI agents.

***

## ⚡ Features

*   **Autonomous Research:** Scrapes, reads, and synthesizes 20+ sources per query using multi-step agents.
*   **Deep Dives:** Recursively investigates specific claims or nodes within a graph to unlimited depth.
*   **Knowledge Graph:** 3D/2D visualization of claims, evidence, and documents using Force-Directed Graphs.
*   **Smart Feed:** Aggregates and analyzes RSS feeds to answer questions about current events.
*   **Public API:** REST endpoints to integrate research capabilities into third-party apps.
*   **Robust Queue:** Postgres-backed job queue for handling heavy AI workloads.

***

## 📂 Project Structure

```text
src/
├── app/
│   ├── actions/          # Server Actions (Core Logic)
│   │   ├── analyze-pdr.ts   # Main AI Logic (Research & Deep Dives)
│   │   ├── api-keys.ts      # Auth Management
│   │   └── feed.ts          # RSS Intelligence
│   ├── api/v1/research/  # Public REST API
│   │   ├── route.ts         # POST /research (Start Job)
│   │   ├── [jobId]/         # GET /research/:id (Check Status)
│   │   └── deep/            # Deep Dive Endpoints
│   ├── feed/             # RSS Route Handlers
│   ├── settings/         # API Key Management UI
│   └── ClientHome.tsx    # Main Dashboard UI
├── components/           # React Components
│   ├── pdr/              # Report Viewers
│   ├── visualizer/       # D3/Cosmograph Force Graphs
│   └── settings/         # Key Manager Components
├── lib/                  # Shared Utilities
│   ├── agents/           # AI Agent Logic (Research, Tagging)
│   ├── crawlers/         # Web Scrapers
│   ├── ai/               # LLM Wrappers
│   ├── supabase/         # Database Clients
│   └── workers/          # Background Process Logic
└── workers/
    └── process-queue.ts  # The "Brain" (Polls DB & Runs Agents)
```

***

## 🛠️ Tech Stack

*   **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS
*   **Visualization:** React Force Graph, Cosmograph
*   **Database:** Supabase (PostgreSQL + pgvector)
*   **AI Inference:**
    *   **Cerebras:** Ultra-fast inference for reasoning loops.
    *   **Nebius:** High-performance model hosting.
*   **Search Engine:** **Serper.dev** (Google Search API)
*   **Runtime:** Node.js (via `tsx` for workers)

***

## 🚀 Getting Started

### 1. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Database & Auth
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" # CRITICAL for Worker/API

# AI Providers
CEREBRAS_API_KEY="csk-..."
NEBIUS_API_KEY="neb-..."

# Search
SERPER_API_KEY="your-serper-key"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Database Migration
Run the `schema.sql` file (provided in docs) in your Supabase SQL Editor. This sets up the `research_jobs`, `research_branches`, `api_keys`, and `documents` tables with Vector support.

### 3. Installation
```bash
npm install
```

***

## 🏃‍♂️ Running the Application

Because Halo handles long-running AI jobs, **you must run two terminal processes**.

### Terminal 1: The Web Server
Runs the UI (`http://localhost:3000`) and the API endpoints.
```bash
npm run dev
```

### Terminal 2: The Background Worker
Runs the polling script that picks up jobs from the database and executes the AI logic.
```bash
npm run worker
```

> **⚠️ Important:** If the worker is not running, API requests will hang in `"status": "queued"` indefinitely.

***

## 📡 API Documentation

Developers can access Halo programmatically via the `v1` REST API.

**Base URL:** `http://localhost:3000/api/v1`
**Auth:** Bearer Token (Generate in `/settings`)

### 1. Standard Research

**Start a Job** (`POST /research`)
```bash
curl -X POST http://nhalo.vercel.app/api/v1/research \
  -H "Authorization: Bearer sk_halo_..." \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Impact of AI on software engineering jobs",
    "breadth": 4,
    "deepMode": true
  }'
```

**Get Results** (`GET /research/:jobId`)
```bash
curl -X GET http://nhalo.vercel.app/api/v1/research/JOB_ID_HERE \
  -H "Authorization: Bearer sk_halo_..."
```
*Returns `status: "succeeded"` and a full Markdown report when done.*

***

### 2. Deep Dives (Recursive Research)

Investigate a specific node, claim, or sub-topic from an existing research session.

**Start Deep Dive** (`POST /research/deep`)
```bash
curl -X POST http://nhalo.vercel.app/api/v1/research/deep \
  -H "Authorization: Bearer sk_halo_..." \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "ORIGINAL_SESSION_UUID",
    "parentNodeId": "claim-id-123",
    "seedText": "AI agents lack common sense reasoning",
    "seedType": "claim",
    "breadth": 2,
    "depth": 1
  }'
```

**Get Branch Report** (`GET /research/deep/:branchId`)
```bash
curl -X GET http://nhalo.vercel.app/api/v1/research/deep/BRANCH_ID_HERE \
  -H "Authorization: Bearer sk_halo_..."
```

***

## 🧩 Architecture Notes

### The Worker Pattern
Halo avoids server timeouts by decoupling submission from execution.
1.  **Submission:** API/UI inserts a row into `research_jobs` with `status: 'queued'`.
2.  **Polling:** `src/workers/process-queue.ts` polls Postgres every 2 seconds.
3.  **Locking:** The worker marks the job as `running`.
4.  **Execution:** The worker calls logic in `src/app/actions/analyze-pdr.ts` (via Admin Client).
5.  **Completion:** The worker updates the row with `status: 'succeeded'` and the JSON result.

### Authentication
*   **UI:** Uses Supabase Auth (Cookies/Session).
*   **API:** Uses Custom API Keys (Bearer Token) validated against the `api_keys` table.
*   **Worker:** Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS and act as Admin.