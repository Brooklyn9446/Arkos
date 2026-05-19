-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations
CREATE TABLE "Organization" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Users
CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT DEFAULT 'member' NOT NULL,
  "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Projects
CREATE TABLE "Project" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "repoUrl" TEXT,
  "language" TEXT,
  "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Scans
CREATE TABLE "Scan" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "status" TEXT DEFAULT 'pending' NOT NULL,
  "triggeredBy" TEXT DEFAULT 'manual' NOT NULL,
  "branch" TEXT,
  "commitHash" TEXT,
  "riskScore" REAL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "completedAt" TIMESTAMP WITH TIME ZONE
);

-- Findings
CREATE TABLE "Finding" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "scanId" UUID NOT NULL REFERENCES "Scan"("id") ON DELETE CASCADE,
  "fingerprint" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "cvssScore" REAL,
  "cvssVector" TEXT,
  "category" TEXT NOT NULL,
  "owaspCategory" TEXT,
  "agent" TEXT NOT NULL,
  "filePath" TEXT,
  "lineStart" INTEGER,
  "lineEnd" INTEGER,
  "codeSnippet" TEXT,
  "remediation" TEXT,
  "remediationDiff" TEXT,
  "status" TEXT DEFAULT 'open' NOT NULL,
  "acceptedReason" TEXT,
  "cveIds" TEXT[],
  "firstSeenAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "lastSeenAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "resolvedAt" TIMESTAMP WITH TIME ZONE
);

-- Policies
CREATE TABLE "Policy" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "rules" JSONB NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- AuditLogs
CREATE TABLE "AuditLog" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "action" TEXT NOT NULL,
  "target" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime for Scans and Findings
alter publication supabase_realtime add table "Scan";
alter publication supabase_realtime add table "Finding";

-- Code Analysis (for standalone code vulnerability scanning)
CREATE TABLE "CodeAnalysis" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" TEXT NOT NULL,
  "language" TEXT DEFAULT 'javascript' NOT NULL,
  "status" TEXT DEFAULT 'pending' NOT NULL,
  "findings" JSONB DEFAULT '[]',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "completedAt" TIMESTAMP WITH TIME ZONE,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_code_analysis_status ON "CodeAnalysis"("status");
CREATE INDEX idx_code_analysis_created ON "CodeAnalysis"("createdAt" DESC);

-- Enable Realtime for CodeAnalysis
alter publication supabase_realtime add table "CodeAnalysis";
