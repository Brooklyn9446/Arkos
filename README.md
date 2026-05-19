<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Sentinel AI Security Analyzer v2

Sentinel AI Security Analyzer is an enterprise-grade Continuous Security Intelligence Platform. Emitting from our robust multi-agent LangGraph architecture, Sentinel provides a distributed analysis pipeline powered by `gemini-2.0-flash` to execute deep source code analysis, automate remediation through AI patch generation, and present intelligence comprehensively across a fully responsive, data-rich React dashboard.

## 🚀 Core Functionalities

- **Asynchronous Execution:** Scans are pushed linearly to a BullMQ worker via Redis, enabling parallel processing without degrading the API gateway.
- **Fingerprint Deduplication:** Generates `SHA256` hashing on identified vulnerabilities to drastically reduce noisy scans and false positives.
- **Live SSE Streaming:** Client views auto-update securely over Server-Sent Events to map Agent progression visually using Framer Motion. 
- **Automated Fix Generation:** An independent lazy agent endpoint auto-generates unified Diff patches and deployment explanations for immediate vulnerability remediation.
- **Role-based Authentication Sharing:** Supports creating cryptographically signed JWTs to dispense read-only access to C-Suite Executive Reports.

---

## 🧭 Application Paths & Components

The Frontend leverages **React-Router v6**, rendering specific intelligence segments dynamically:

- **`/` (Dashboard):** High-level aggregate statistics overview. Mounts `recharts` to render Risk Trend gradients, OWASP Radar charts, and Severity Pies.
- **`/projects/:id` (Project Detail):** Deep dive into a specific codebase tracking its historical scans, webhooks, and mean time to resolve (MTTR).
- **`/scan/:id` (Live Scan View):** The Action Canvas. Animates actively pulsing agents in real-time. Uncovers vulnerabilities in a `framer-motion` sliding feed matching exact pipeline completion states!
- **`/findings` (Global Findings Explorer):** Endless virtualized scrolling via `@tanstack/react-virtual` allowing instant text, status, and category filtering across millions of bugs.
- **`/findings/:id` (Finding Detail Desk):** Two-column detailed workspace. Parses CVSS severity algorithms and provides access to the powerful **AI Auto-Fix Generator** which returns interactive diff-view code blocks.
- **`/report/:scanId` (Executive Report):** Printable UI rendering compliance gaps, risk telemetry, and AI summarized remediation strategies. (Can be utilized via public Read-Only JWT links!)
- **`/settings/policies` (Policy Management):** Enables logic thresholding for CI/CD pipeline blocking (e.g. Failure on High/Critical vulnerabilities).

---

## 🧠 The Agentic Security Pipeline

Our orchestration architecture leverages `@langchain/langgraph` to process distinct threat vectors asynchronously:

### Primary Inspection Agents (Parallel Fan-Out)
1. **OWASP Top 10 Agent:** Analyzes classic exploitation avenues (Injection, XSS, Broken Access Control).
2. **Secrets Engine Agent:** Identifies hardcoded cryptographic keys, AWS secrets, and hardcoded JWTs.
3. **IaC Analyzer Agent:** Reviews Docker, Kubernetes, and Terraform models for misconfigurations.
4. **Taint Tracker Agent:** Tracks data flow vulnerabilities where unsanitized user inputs flow into dangerous sinks (sql queries, evals).
5. **Auth & Sessions Agent:** Scrutinizes token expiry handling, fixation risks, and MFA requirements.
6. **Attack Surface Agent:** Isolates unbounded HTTP endpoints, exposed administrative routers, and missing rate limits.

### Post-Processing Agents (Aggregation)
7. **Compliance Mapping Agent:** Cross-references the aggregated findings dynamically against PCI-DSS, GDPR, and SOC 2 frameworks.
8. **Trend Analyst Agent:** Analyzes finding risks and identifies the primary attack surface vulnerability logic.
9. **Executive Reporter:** Synthesizes the exact parameters into a professionally written markdown report for management review.
10. **Fix Generator Agent:** (Isolated) Fired manually by the user to ingest a specific finding and emit a drop-in Diff patch replacement to fix the bug.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Framer Motion, Recharts, TanStack Virtual, React-Router-DOM
- **Backend:** Node.js, Express, BullMQ
- **Database / Cache:** Prisma ORM (PostgreSQL), Redis & IORedis
- **AI Core:** Google GenAI SDK (`gemini-2.0-flash`), LangChain / LangGraph

## 🏃‍♂️‍➡️ Run Locally

**Prerequisites:** Node.js v20+, Docker (for Postgres/Redis)

1. **Start Services:**
   Ensure Docker is running, then spin up the database and cache utilizing the provided compose setup:
   ```bash
   docker-compose up -d
   ```

2. **Install core applications:**
   ```bash
   npm install
   ```

3. **Environment Setup (`.env`):**
   Ensure database URLs map to your Docker exposed ports. Ensure you've provided the `GEMINI_API_KEY`.
   ```bash
   npx prisma db push
   ```

4. **Launch Application Suites:**
   Since we're running an asynchronous system, we boot 3 processes (Server, Worker, Frontend):
   
   *Window 1:*
   ```bash
   npm run dev
   ```
   *Window 2:*
   ```bash
   npm run server
   ```
   *Window 3:* 
   ```bash
   npm run worker
   ```
