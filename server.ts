import { GoogleGenAI } from "@google/genai";
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy load Google GenAI
let aiClient: any = null;
function getGenAIInstance() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return aiClient;
}

// REST route for chatting with VivaAI
app.post("/api/chat", async (req: express.Request, res: express.Response) => {
  const { messages, lang } = req.body;
  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Invalid messages format" });
    return;
  }

  const latestMessageObj = messages[messages.length - 1];
  const userMessage = latestMessageObj.text || "";

  try {
    const aiInstance = getGenAIInstance();
    const systemInstruction = `You are VivaAI, an expert agricultural procurement assistant at VivaProcure, supporting agricultural cooperatives (Koperasi Pertanian, e.g., Koperasi Tani Makmur) in Indonesia.
    You help Budi Santoso (Ketua Koperasi) manage fertilizers (Urea, NPK), pesticide stocks, logistics, and supplier bids.
    Always reply in a professional, warm, cooperative-appropriate tone, primarily in Indonesian unless asked in English.
    Keep replies succinct, structured, and include agricultural wisdom (Optimasi Pengadaan, weather risks, price trends).`;

    if (aiInstance) {
      // Assemble structured conversation history
      const contents = messages.map((m: any) => ({
        role: m.sender === "ai" ? "model" : "user",
        parts: [{ text: m.text }]
      }));

      const response = await aiInstance.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "VivaAI sedang memproses data...";
      res.json({ text: replyText });
    } else {
      // Fully-featured offline simulation when GEMINI_API_KEY is not defined
      setTimeout(() => {
        let responseText = "";
        const query = userMessage.toLowerCase();

        if (query.includes("urea") || query.includes("pupuk")) {
          responseText = "Berdasarkan rilis logistik terbaru, harga Pupuk Urea Subsidi saat ini stabil di level Rp 6.800/Kg. Namun, stok di gudang Anda tersisa 450 Ton (di bawah batas aman 1.000 Ton). Saya menyarankan untuk melakukan pengesahan sesi pengadaan #PRC-2024-089 dengan PT Pupuk Indonesia untuk mengamankan 100 Ton pasokan tambahan dengan diskon kolektif sebesar 12%.";
        } else if (query.includes("cuaca") || query.includes("hujan")) {
          responseText = "Sistem deteksi cuaca memperingatkan curah hujan tinggi di wilayah Jawa Tengah dalam 48 jam ke depan. Disarankan untuk memprioritaskan pengiriman dari PT. Agrotama dan mempercepat bongkar muat di Koperasi Maju Bersama yang kapasitas gudangnya saat ini sudah mencapai 92%.";
        } else if (query.includes("stok") || query.includes("gudang")) {
          responseText = "Berikut draf analisis inventaris Anda:\n\n1. **Urea Subsidi**: 450 Ton (Status: KRITIS - di bawah batas aman)\n2. **NPK Phonska**: 2.400 Ton (Status: SELESAI/AMAN)\n3. **Pestisida Cair**: 850 Liter (Status: PERINGATAN)\n\nApakah Anda ingin saya membuat draf 'Pesan Siaga' restock otomatis ke supplier utama?";
        } else if (query.includes("kontrak") || query.includes("blockchain")) {
          responseText = "Smart contract terbaru #JP-2026-004 telah ditandatangani oleh Koperasi Tani Makmur (Pihak Pertama) dan sedang menunggu persetujuan digital Anda sebagai Pihak Kedua. Seluruh catatan tersimpan terenkripsi di Ledger bersama dengan tingkat risiko: SANGAT RENDAH (LOW RISK).";
        } else {
          responseText = `Terima kasih atas pesan Anda: "${userMessage}". Sebagai asisten VivaAI, saya dapat membantu Anda menganalisis penawaran pupuk, memantau batas aman stok gudang, dan memverifikasi kontrak pintar pengadaan bersama. Silakan jelaskan kebutuhan analisis logistik Anda hari ini.`;
        }

        res.json({ text: responseText });
      }, 700);
    }
  } catch (error: any) {
    console.error("Gemini GenAI Error:", error);
    res.status(500).json({ error: error?.message || "Internal server generative error" });
  }
});

// Serve assets and build frontend in dev vs prod
const startExpressViteServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
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
    console.log(`[VivaProcure Backend] Server online on http://0.0.0.0:${PORT}`);
  });
};

startExpressViteServer();
