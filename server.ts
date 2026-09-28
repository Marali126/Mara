import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Diretório de cache persistente de áudio para evitar estourar cotas e garantir reprodução instantânea
const CACHE_DIR = path.join(process.cwd(), ".cache_audio");
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("Não foi possível criar pasta de cache local:", e);
}

const memoryCache = new Map<string, { audioBase64: string; mimeType: string; voiceUsed: string }>();

function getCacheKey(voice: string, text: string): string {
  return crypto.createHash("sha256").update(`${voice}:${text.trim()}`).digest("hex");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API de verificação de status e chave de IA
  app.get("/api/ai-status", (req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
    res.json({ hasKey });
  });

  // API de Síntese de Voz Ultra-Natural com IA (Gemini 3.8 Flash TTS com Caching Persistente)
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voiceName } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Texto obrigatório para síntese" });
      }

      const cleanText = text.trim();
      let validVoice = voiceName || "Kore";
      if (validVoice === "Aoede") validVoice = "Kore";

      const cacheKey = getCacheKey(validVoice, cleanText);

      // 1. Verifica no cache em memória
      if (memoryCache.has(cacheKey)) {
        const cached = memoryCache.get(cacheKey)!;
        return res.json({ ...cached, fromCache: true });
      }

      // 2. Verifica no cache em disco
      const diskFilePath = path.join(CACHE_DIR, `${cacheKey}.json`);
      if (fs.existsSync(diskFilePath)) {
        try {
          const fileData = JSON.parse(fs.readFileSync(diskFilePath, "utf-8"));
          if (fileData && fileData.audioBase64) {
            memoryCache.set(cacheKey, fileData);
            return res.json({ ...fileData, fromCache: true });
          }
        } catch (readErr) {
          console.warn("Erro ao ler cache em disco:", readErr);
        }
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: "GEMINI_API_KEY não configurada" });
      }

      const ai = getAI();

      // Tentativa primária com gemini-3.8-flash-tts (modelo de máxima expressividade)
      let response: any = null;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash-tts",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: cleanText,
                  speechMetadata: {
                    style: "Voz calorosa humana, pedagógica, dicção clara e ritmo expressivo em português do Brasil com pausas nítidas na pontuação.",
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: validVoice,
                },
              },
            },
          },
        });
      } catch (primaryErr: any) {
        console.warn("Tentativa gemini-3.8-flash-tts falhou, tentando flash-lite-tts:", primaryErr?.message || primaryErr);
        // Fallback secundário com gemini-3.8-flash-lite-tts
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash-lite-tts",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: cleanText,
                  speechMetadata: {
                    style: "Voz calorosa humana, pedagógica, dicção clara e ritmo expressivo em português do Brasil com pausas nítidas na pontuação.",
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: validVoice,
                },
              },
            },
          },
        });
      }

      const part = response?.candidates?.[0]?.content?.parts?.[0];
      if (part && part.inlineData && part.inlineData.data) {
        const payload = {
          audioBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType || "audio/wav",
          voiceUsed: validVoice,
        };

        // Salva nos caches de memória e disco
        memoryCache.set(cacheKey, payload);
        try {
          fs.writeFileSync(diskFilePath, JSON.stringify(payload), "utf-8");
        } catch (writeErr) {
          console.warn("Erro ao salvar cache em disco:", writeErr);
        }

        return res.json({ ...payload, fromCache: false });
      } else {
        return res.status(500).json({ error: "Nenhum áudio gerado pelo modelo de IA" });
      }
    } catch (err: any) {
      console.error("Erro no endpoint /api/tts:", err?.message || err);
      const isQuota = String(err?.message || "").includes("429") || String(err?.message || "").includes("RESOURCE_EXHAUSTED");
      return res.status(isQuota ? 429 : 500).json({
        error: err?.message || "Erro na geração de voz por IA",
        isQuota
      });
    }
  });

  // Vite middleware no modo desenvolvimento
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor de fluência rodando na porta ${PORT}`);
  });
}

startServer();
