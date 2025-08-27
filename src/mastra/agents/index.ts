import { Agent } from "@mastra/core/agent";
import { weatherTool } from "@/mastra/tools";
import { LibSQLStore } from "@mastra/libsql";
import { z } from "zod";
import { Memory } from "@mastra/memory";
import { createGemini25Provider } from "../config/googleProvider";

export const AgentState = z.object({
  proverbs: z.array(z.string()).default([]),
});

export const weatherAgent = new Agent({
  name: "Weather Agent",
  tools: { weatherTool },
  instructions: "You are a helpful assistant.",
  model: createGemini25Provider('gemini-2.5-flash-lite-preview-06-17', {
      // Response modalities - what types of content the model can generate
      responseModalities: ["TEXT"], // Can also include "IMAGE" for image generation
      // Thinking configuration for enhanced reasoning
      thinkingConfig: {
        thinkingBudget: 0, // -1 = dynamic budget, 0 = disabled, 1-24576 = fixed budget
        includeThoughts: false, // Include reasoning process in response for debugging
      },
      // Search grounding for real-time information access
      useSearchGrounding: true, // Enable Google Search integration for current events
      // Dynamic retrieval configuration
      dynamicRetrieval: true, // Let model decide when to use search grounding
      // Safety settings level
      safetyLevel: 'OFF', // Options: 'STRICT', 'MODERATE', 'PERMISSIVE', 'OFF'
      // Structured outputs for better tool integration
      structuredOutputs: true, // Enable structured JSON responses
      // Cached content for cost optimization (if you have cached content)
      // cachedContent: 'your-cache-id', // Uncomment if using explicit caching
      // Langfuse tracing configuration
    }),
  memory: new Memory({
    storage: new LibSQLStore({ url: "file::memory:" }),
    options: {
      workingMemory: {
        enabled: true,
        schema: AgentState,
      },
    },
  }),
});
