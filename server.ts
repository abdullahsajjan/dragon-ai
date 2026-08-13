import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Initialize Gemini Client Lazily / Safe Check
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({ status: "ok", geminiConfigured: hasKey });
});

// Models list endpoint
app.get("/api/models", (_req, res) => {
  res.json({
    models: [
      {
        id: "gemini-3.6-flash",
        name: "Dragon 3.6 Flash",
        description: "Ultra-fast, highly intelligent model for code, reasoning & fast chat.",
        recommended: true,
      },
      {
        id: "gemini-3.1-pro-preview",
        name: "Dragon 3.1 Pro (Deep Thinker)",
        description: "Advanced reasoning, complex STEM, intricate coding & architectural design.",
        recommended: false,
      },
      {
        id: "gemini-3.1-flash-lite",
        name: "Dragon 3.1 Flash-Lite",
        description: "Lightweight, ultra-responsive model for quick responses.",
        recommended: false,
      },
    ],
  });
});

// SSE Streaming Chat Endpoint
app.post("/api/chat/stream", async (req, res) => {
  const {
    messages = [],
    model = "gemini-3.6-flash",
    systemInstruction,
    thinkingLevel = model === "gemini-3.1-pro-preview" ? "LOW" : "MINIMAL",
    useSearch = false,
  } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const ai = getGeminiClient();
  if (!ai) {
    res.write(
      `data: ${JSON.stringify({
        error:
          "GEMINI_API_KEY environment variable is missing. Please ensure GEMINI_API_KEY is configured in AI Studio Secrets.",
      })}\n\n`
    );
    res.write(`data: [DONE]\n\n`);
    res.end();
    return;
  }

  try {
    // Format conversation history for Gemini SDK safely
    const rawFormatted = messages.map((m: any) => {
      const parts: any[] = [];
      
      // If image attachments exist
      if (m.images && Array.isArray(m.images) && m.images.length > 0) {
        for (const img of m.images) {
          if (img.data && img.mimeType) {
            const cleanBase64 = img.data.includes(",")
              ? img.data.split(",")[1]
              : img.data;
            parts.push({
              inlineData: {
                mimeType: img.mimeType,
                data: cleanBase64,
              },
            });
          }
        }
      }

      // If document attachments exist
      if (m.documents && Array.isArray(m.documents) && m.documents.length > 0) {
        for (const doc of m.documents) {
          if (doc.mimeType === "application/pdf" && doc.base64) {
            const cleanBase64 = doc.base64.includes(",")
              ? doc.base64.split(",")[1]
              : doc.base64;
            parts.push({
              inlineData: {
                mimeType: "application/pdf",
                data: cleanBase64,
              },
            });
          }
          if (doc.content) {
            parts.push({
              text: `\n\n📄 [ATTACHED DOCUMENT: ${doc.name}] (Type: ${doc.mimeType || "document"}, Size: ${Math.round((doc.size || 0) / 1024)} KB)\n--- BEGIN DOCUMENT CONTENT ---\n${doc.content}\n--- END DOCUMENT CONTENT ---\n\n`,
            });
          }
        }
      }

      if (m.content && m.content.trim()) {
        parts.push({ text: m.content });
      }

      return {
        role: m.role === "assistant" ? "model" : "user",
        parts,
      };
    }).filter((m: any) => m.parts.length > 0);

    // Merge consecutive roles and handle empty content fallback
    const formattedContents: any[] = [];
    for (const item of rawFormatted) {
      if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === item.role) {
        formattedContents[formattedContents.length - 1].parts.push(...item.parts);
      } else {
        formattedContents.push(item);
      }
    }

    if (formattedContents.length === 0) {
      formattedContents.push({
        role: "user",
        parts: [{ text: "Hello" }],
      });
    }

    // Build configuration
    const config: any = {};

    const universalBaseInstruction = `You are Dragon AI, a high-precision, versatile universal AI assistant capable of accurately answering ANY question across all knowledge domains (science, mathematics, programming, documents, business, arts, health, legal, creative writing, and general advice). When documents are attached (PDF, TXT, DOCX, Code, CSV, JSON, Markdown), analyze them thoroughly, cite key sections, answer user questions precisely based on document content, summarize accurately, and extract insights. Always provide factually accurate, clear, well-structured, and complete answers. For technical topics, provide clean code/artifacts. For calculations, show step-by-step reasoning. Keep voice responses natural and easy to listen to.`;

    if (systemInstruction && systemInstruction.trim()) {
      config.systemInstruction = `${universalBaseInstruction}\n\n${systemInstruction.trim()}`;
    } else {
      config.systemInstruction = universalBaseInstruction;
    }

    // Tools
    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    // Thinking config (only valid for gemini-3 series)
    if (model.startsWith("gemini-3")) {
      if (thinkingLevel === "HIGH") {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      } else if (thinkingLevel === "LOW") {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
      } else if (thinkingLevel === "MINIMAL" && model !== "gemini-3.1-pro-preview") {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.MINIMAL };
      }
    }

    // Helper function to invoke generateContentStream with retry & model fallback
    async function streamWithFallback(primaryModel: string, config: any) {
      const fallbackChain = [
        primaryModel,
        primaryModel === "gemini-3.6-flash" ? "gemini-3.1-flash-lite" : "gemini-3.6-flash",
        "gemini-3.1-pro-preview",
      ];
      // Deduplicate fallback list while maintaining priority
      const modelsToTry = Array.from(new Set(fallbackChain));

      let lastError: any = null;

      for (const currentModel of modelsToTry) {
        // Attempt up to 3 retries per model for transient 503 or 429 rate limit errors
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const currentConfig = { ...config };
            // Strip thinkingConfig if not supported on fallback model
            if (!currentModel.startsWith("gemini-3")) {
              delete currentConfig.thinkingConfig;
            }

            const stream = await ai.models.generateContentStream({
              model: currentModel,
              contents: formattedContents,
              config: currentConfig,
            });

            // Return successful stream along with metadata if fallback occurred
            return {
              stream,
              usedModel: currentModel,
              isFallback: currentModel !== primaryModel,
            };
          } catch (err: any) {
            lastError = err;
            const errStr = String(err?.message || "") + String(err?.status || "") + String(err?.code || "");
            const isTransient =
              err?.status === "UNAVAILABLE" ||
              err?.status === "RESOURCE_EXHAUSTED" ||
              err?.code === 503 ||
              err?.code === 429 ||
              errStr.includes("503") ||
              errStr.includes("429") ||
              errStr.includes("UNAVAILABLE") ||
              errStr.includes("RESOURCE_EXHAUSTED") ||
              errStr.includes("high demand") ||
              errStr.includes("quota") ||
              errStr.includes("rate limit") ||
              errStr.includes("Too Many Requests");

            if (isTransient && attempt < 2) {
              // Exponential backoff delay (600ms, 1200ms)
              await new Promise((r) => setTimeout(r, 600 * Math.pow(2, attempt)));
              continue;
            } else if (isTransient) {
              // Move to next model in fallback chain
              break;
            } else {
              // Non-transient error, rethrow immediately
              throw err;
            }
          }
        }
      }

      throw lastError;
    }

    const { stream: responseStream, usedModel, isFallback } = await streamWithFallback(model, config);

    if (isFallback) {
      res.write(
        `data: ${JSON.stringify({
          text: `> *⚡ Dragon AI Notice: Automatically routed request to ${usedModel} to ensure uninterrupted service.*\n\n`,
        })}\n\n`
      );
    }

    let groundingSources: any[] = [];

    for await (const chunk of responseStream) {
      const text = chunk.text || "";
      
      // Check for grounding metadata
      const chunksMeta = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunksMeta && Array.isArray(chunksMeta)) {
        groundingSources = chunksMeta
          .filter((c: any) => c.web?.uri)
          .map((c: any) => ({
            title: c.web.title || c.web.uri,
            url: c.web.uri,
          }));
      }

      const payload = {
        text,
        sources: groundingSources.length > 0 ? groundingSources : undefined,
      };

      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err: any) {
    console.error("Dragon AI stream error:", err);
    let friendlyMsg = err.message || "An error occurred while communicating with Dragon AI engine.";
    const rawStr = String(err.message || "") + String(err.status || "") + String(err.code || "");

    if (rawStr.includes("429") || rawStr.includes("RESOURCE_EXHAUSTED") || rawStr.includes("quota") || rawStr.includes("rate limit") || rawStr.includes("Too Many Requests")) {
      friendlyMsg = "The AI server is currently experiencing temporary high demand / rate limits. Please wait a few seconds and send your message again, or switch to another model in the top bar.";
    } else if (rawStr.includes("503") || rawStr.includes("UNAVAILABLE")) {
      friendlyMsg = "The primary AI model is temporarily unavailable due to server load. Please try again in a moment.";
    }

    res.write(
      `data: ${JSON.stringify({
        error: friendlyMsg,
      })}\n\n`
    );
    res.write(`data: [DONE]\n\n`);
    res.end();
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(
      express.static(distPath, {
        maxAge: "1d",
        etag: true,
      })
    );
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dragon AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
