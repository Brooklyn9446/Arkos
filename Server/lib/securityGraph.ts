import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { GoogleGenAI, Type } from "@google/genai";

export interface Finding {
  vulnerability_type: string;
  description: string;
  file: string;
  line_range: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  category?: string;
  agent?: string;
  reasoning: string;
  suggested_fix: string;
  codeSnippet?: string;
}

const GraphState = Annotation.Root({
  code: Annotation<string>(),
  findings: Annotation<Finding[]>({
    reducer: (left = [], right = []) => [...left, ...right],
    default: () => [],
  }),
  report: Annotation<string | null>(),
  trendSummary: Annotation<string | null>(),
  complianceGaps: Annotation<any[]>({
    reducer: (left = [], right = []) => [...left, ...right],
    default: () => []
  })
});

type State = typeof GraphState.State;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function analyzeWithLLM(code: string, focus: string, agentName: string, customSchema?: any): Promise<Finding[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `You are a Senior Security Engineer. Analyze the following code specifically for ${focus}.
Return ONLY a JSON array of objects following the schema.

Code:
${code}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: customSchema || {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              vulnerability_type: { type: Type.STRING },
              description: { type: Type.STRING },
              file: { type: Type.STRING },
              line_range: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ["Critical", "High", "Medium", "Low"] },
              reasoning: { type: Type.STRING },
              suggested_fix: { type: Type.STRING },
              codeSnippet: { type: Type.STRING }
            },
            required: ["vulnerability_type", "description", "severity", "reasoning", "suggested_fix"]
          }
        }
      }
    });

    const text = response.text || "[]";
    const results: Finding[] = JSON.parse(text);
    return results.map(f => ({ ...f, agent: agentName, category: getCategoryForAgent(agentName) }));
  } catch (error) {
    console.error(`Error in LLM ${agentName} analysis:`, error);
    return [];
  }
}

function getCategoryForAgent(agent: string) {
  if (agent.includes('OWASP')) return 'owasp';
  if (agent.includes('Secrets')) return 'secret';
  if (agent.includes('IaC')) return 'iac';
  if (agent.includes('Dependency')) return 'dependency';
  if (agent.includes('Auth')) return 'auth';
  if (agent.includes('Flow')) return 'flow';
  return 'general';
}

const owaspAgent = async (state: State) => {
  const findings = await analyzeWithLLM(state.code, "OWASP Top 10 vulnerabilities (Injection, XSS, Broken Auth, etc.)", "owaspAgent");
  return { findings };
};

const secretsAgent = async (state: State) => {
  const findings = await analyzeWithLLM(state.code, "Hardcoded Secrets, API Keys, Passwords and Credentials", "secretsAgent");
  return { findings };
};

const iacAgent = async (state: State) => {
  const findings = await analyzeWithLLM(state.code, "Infrastructure as Code (Terraform, Docker, K8s) misconfigurations", "iacAgent");
  return { findings };
};

const taintFlowAgent = async (state: State) => {
  const findings = await analyzeWithLLM(state.code, "Data flow vulnerabilities where unsanitized user input flows to dangerous sinks (like eval, DB queries). Note source and sink explicitly in description.", "taintFlowAgent");
  return { findings };
};

const authSessionAgent = async (state: State) => {
  const findings = await analyzeWithLLM(state.code, "Authentication and Session management issues (JWT weak secrets, missing expiry, insecure cookies, fixation risks, missing MFA)", "authSessionAgent");
  return { findings };
};

const attackSurfaceAgent = async (state: State) => {
  const findings = await analyzeWithLLM(state.code, "Exposed HTTP endpoints, Unauthenticated routes for sensitive operations, missing rate limiting.", "attackSurfaceAgent");
  return { findings };
};

const complianceAgent = async (state: State) => {
  // Receives aggregated findings from upstream agents
  if (!state.findings || state.findings.length === 0) return { complianceGaps: [] };

  const prompt = `Map these findings to compliance framework controls (GDPR, SOC 2, PCI-DSS, OWASP ASVS).
Findings: ${JSON.stringify(state.findings)}
Return JSON Array containing objects with { findingId (use index or short desc), frameworks: [{ name, control, description }] }`;

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return { complianceGaps: JSON.parse(res.text || "[]") };
  } catch (e) {
    return { complianceGaps: [] };
  }
};

const trendAnalystAgent = async (state: State) => {
  // In a real run, this would fetch historical scans from prisma. 
  // For the graph, we analyze trends vs simulated past data or just summarize current risks.
  const summary = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Analyze finding risks across: ${JSON.stringify(state.findings)}. Write a 2-3 sentence trend summary identifying the primary risk surface.`,
  });
  return { trendSummary: summary.text };
};

const reportWriter = async (state: State) => {
  const summary = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `You are the Sentinel Security Chief. Based on the following findings, write a professional executive security report.
Use Markdown. Include sections for:
1. Executive Summary
2. Key Risks & Trend Recap (${state.trendSummary || 'N/A'})
3. Recommendations
4. Conclusion

Findings:
${JSON.stringify(state.findings, null, 2)}
`,
  });

  return { report: summary.text };
};

const workflow = new StateGraph(GraphState)
  // Fan out
  .addNode("owasp", owaspAgent)
  .addNode("secrets", secretsAgent)
  .addNode("iac", iacAgent)
  .addNode("flow", taintFlowAgent)
  .addNode("auth", authSessionAgent)
  .addNode("surface", attackSurfaceAgent)
  // Aggregation/Processing
  .addNode("compliance", complianceAgent)
  .addNode("trend", trendAnalystAgent)
  .addNode("reporter", reportWriter)

  .addEdge(START, "owasp")
  .addEdge(START, "secrets")
  .addEdge(START, "iac")
  .addEdge(START, "flow")
  .addEdge(START, "auth")
  .addEdge(START, "surface")

  .addEdge("owasp", "compliance")
  .addEdge("secrets", "compliance")
  .addEdge("iac", "compliance")
  .addEdge("flow", "compliance")
  .addEdge("auth", "compliance")
  .addEdge("surface", "compliance")

  .addEdge("owasp", "trend")
  .addEdge("secrets", "trend")
  .addEdge("iac", "trend")
  .addEdge("flow", "trend")
  .addEdge("auth", "trend")
  .addEdge("surface", "trend")

  .addEdge("compliance", "reporter")
  .addEdge("trend", "reporter")
  .addEdge("reporter", END);

export const securityPipeline = workflow.compile();

// Independent Tool Route
export const fixGeneratorAgent = {
  invoke: async ({ finding }: { finding: any }) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Given this vulnerability: ${JSON.stringify(finding)}
        Provide a unified diff patch to fix it, and a plain-English explanation of the fix.
        Respond ONLY in JSON format: { diff: string, explanation: string, confidence: 'high'|'medium'|'low' }`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    } catch {
      return { diff: "", explanation: "Failed to generate fix.", confidence: "low" };
    }
  }
};
