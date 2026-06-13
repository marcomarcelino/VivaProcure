import { GoogleGenAI } from "@google/genai";
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

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
    const systemInstruction = `You are VivaAI, an expert agricultural procurement assistant at VivaProcure, supporting agricultural cooperatives (Koperasi Pertanian, e.g., Koperasi Sumber Makmur) in Indonesia.
    You help Budi Santoso (Ketua Koperasi) manage fertilizers (Urea, NPK), pesticide stocks, logistics, and supplier bids.
    Always reply in a professional, warm, cooperative-appropriate tone, primarily in Indonesian unless asked in English.
    Keep replies succinct, structured, and include agricultural wisdom (Optimasi Pengadaan, weather risks, price trends).`;

    if (aiInstance) {
      try {
        // Assemble structured conversation history
        const contents = messages.map((m: any) => ({
          role: m.sender === "ai" ? "model" : "user",
          parts: [{ text: m.text }]
        }));

        const response = await aiInstance.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        const replyText = response.text || "VivaAI sedang memproses data...";
        res.json({ text: replyText });
        return;
      } catch (geminiErr) {
        console.warn("Gemini chat failed, falling back to offline logic:", geminiErr);
      }
    }

    // Fully-featured offline simulation when GEMINI_API_KEY is not defined or fails
    setTimeout(() => {
      let responseText = "";
      const query = userMessage.toLowerCase();

      if (query.includes("urea") || query.includes("pupuk")) {
        responseText = "Berdasarkan rilis logistik terbaru, harga Pupuk Urea Subsidi saat ini stabil di level Rp 6.800/Kg. Namun, stok di gudang Anda tersisa 450 Ton (di bawah batas aman 1.000 Ton). Saya menyarankan untuk melakukan pengesahan sesi pengadaan #PRC-2024-089 dengan PT Pupuk Indonesia untuk mengamankan 100 Ton pasokan tambahan dengan diskon kolektif sebesar 12%.";
      } else if (query.includes("cuaca") || query.includes("hujan")) {
        responseText = "Sistem deteksi cuaca memperingatkan curah hujan tinggi di wilayah Jawa Tengah dalam 48 jam ke depan. Disarankan untuk memprioritaskan pengiriman dari PT. Agrotama dan mempercepat bongkar muat di Koperasi Melati Jaya yang kapasitas gudangnya saat ini sudah mencapai 92%.";
      } else if (query.includes("stok") || query.includes("gudang")) {
        responseText = "Berikut draf analisis inventaris Anda:\n\n1. **Urea Subsidi**: 450 Ton (Status: KRITIS - di bawah batas aman)\n2. **NPK Phonska**: 2.400 Ton (Status: SELESAI/AMAN)\n3. **Pestisida Cair**: 850 Liter (Status: PERINGATAN)\n\nApakah Anda ingin saya membuat draf 'Pesan Siaga' restock otomatis ke supplier utama?";
      } else if (query.includes("kontrak") || query.includes("blockchain")) {
        responseText = "Smart contract terbaru #JP-2026-004 telah ditandatangani oleh Koperasi Sumber Makmur (Pihak Pertama) dan sedang menunggu persetujuan digital Anda sebagai Pihak Kedua. Seluruh catatan tersimpan terenkripsi di Ledger bersama dengan tingkat risiko: SANGAT RENDAH (LOW RISK).";
      } else {
        responseText = `Terima kasih atas pesan Anda: "${userMessage}". Sebagai asisten VivaAI, saya dapat membantu Anda menganalisis penawaran pupuk, memantau batas aman stok gudang, dan memverifikasi kontrak pintar pengadaan bersama. Silakan jelaskan kebutuhan analisis logistik Anda hari ini.`;
      }

      res.json({ text: responseText });
    }, 700);
  } catch (error: any) {
    console.error("Gemini GenAI Error:", error);
    res.status(500).json({ error: error?.message || "Internal server generative error" });
  }
});

app.post("/api/ai/evaluate-suppliers", async (req, res) => {
  const { volume } = req.body;
  const volNum = parseFloat(volume) || 0;

  try {
    const aiInstance = getGenAIInstance();
    const supplierHealths = await prisma.supplierHealth.findMany();
    
    const ptAgrotamaHealth = supplierHealths.find(s => s.code === 'PA')?.percentage || 98;
    const cvSuburJayaHealth = supplierHealths.find(s => s.code === 'SJ')?.percentage || 75;
    const binaFloraHealth = supplierHealths.find(s => s.code === 'BF')?.percentage || 92;

    const suppliersData = [
      {
        name: "PT. Agrotama",
        price: 9800,
        rating: ptAgrotamaHealth,
        deliveryTime: "7 Hari",
        minOrder: 150,
        pros: ["Harga paling kompetitif (Rp 9.800/kg)", "Rating reputasi tinggi (Sangat Baik)"],
        cons: ["Waktu pengiriman relatif lama (7 hari)", "Risiko cuaca tinggi di jalur darat Pantura"]
      },
      {
        name: "Bina Flora Ltd",
        price: 10500,
        rating: binaFloraHealth,
        deliveryTime: "3 Hari",
        minOrder: 100,
        pros: ["Pengiriman sangat cepat (3 hari)", "Rating keandalan tinggi (Baik)"],
        cons: ["Harga sedang (Rp 10.500/kg)"]
      },
      {
        name: "CV. Subur Jaya",
        price: 11200,
        rating: cvSuburJayaHealth,
        deliveryTime: "5 Hari",
        minOrder: 50,
        pros: ["Volume minimum order kecil (50 Ton)"],
        cons: ["Harga termahal (Rp 11.200/kg)", "Status kesehatan pemasok WASPADA (Rating rendah: " + cvSuburJayaHealth + "%)", "Sering terjadi keterlambatan dalam pengiriman logistik baru-baru ini"]
      }
    ];

    const prompt = `Lakukan evaluasi pemilihan supplier pupuk untuk pesanan sebesar ${volNum} Ton.
Berikut adalah data penawaran dan performance metric supplier yang valid dari database kami:
${JSON.stringify(suppliersData, null, 2)}

Analisis dan rekomendasikan supplier terbaik. Rekomendasi harus mempertimbangkan:
1. Kesesuaian volume pesanan (${volNum} Ton) dengan syarat minimum order (minOrder).
2. Efisiensi biaya total (harga * volume).
3. Rating kepercayaan dan kecepatan pengiriman (deliveryTime).

Format respon harus berupa JSON murni tanpa markdown, dengan skema berikut:
{
  "recommendedSupplier": "Nama Supplier",
  "reasoningId": "Analisis detail dalam Bahasa Indonesia (maksimal 3 kalimat)...",
  "reasoningEn": "Detailed analysis in English (max 3 sentences)...",
  "comparison": [
    {
      "supplierName": "Nama Supplier",
      "score": 85,
      "prosId": ["Pro 1", "Pro 2"],
      "consId": ["Con 1"],
      "prosEn": ["Pro 1 (EN)"],
      "consEn": ["Con 1 (EN)"]
    }
  ]
}`;

    if (aiInstance) {
      try {
        const response = await aiInstance.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        });

        const text = response.text || "";
        try {
          const result = JSON.parse(text);
          res.json(result);
          return;
        } catch (parseErr) {
          console.error("Error parsing Gemini response, falling back to structured fallback:", text);
        }
      } catch (geminiErr) {
        console.warn("Gemini supplier evaluation failed, falling back to offline logic:", geminiErr);
      }
    }

    // Dynamic offline fallback generator
    let recommended = "Bina Flora Ltd";
    let reasoningId = `Berdasarkan volume pesanan sebesar ${volNum} Ton, Bina Flora Ltd direkomendasikan karena menawarkan kombinasi terbaik antara harga sedang (Rp 10.500/kg) dan pengiriman cepat (3 hari).`;
    let reasoningEn = `Based on the order volume of ${volNum} Tons, Bina Flora Ltd is recommended as it offers the best combination of moderate pricing (Rp 10,500/kg) and fast delivery (3 days).`;

    if (volNum >= 150) {
      recommended = "PT. Agrotama";
      reasoningId = `PT. Agrotama direkomendasikan karena volume pesanan memenuhi batas minimum order (150 Ton) dan menawarkan harga paling murah (Rp 9.800/kg), meskipun pengiriman membutuhkan waktu 7 hari.`;
      reasoningEn = `PT. Agrotama is recommended because the order meets the minimum threshold (150 Tons) and offers the most cost-effective pricing (Rp 9,800/kg), despite a 7-day delivery timeline.`;
    } else if (volNum < 100) {
      recommended = "CV. Subur Jaya";
      reasoningId = `CV. Subur Jaya direkomendasikan karena merupakan satu-satunya supplier yang menerima pesanan di bawah 100 Ton (min. 50 Ton), meskipun harganya lebih mahal dan status kesehatannya Waspada (${cvSuburJayaHealth}%).`;
      reasoningEn = `CV. Subur Jaya is recommended as it is the only supplier accepting orders below 100 Tons (min. 50 Tons), despite higher pricing and a Warning health status (${cvSuburJayaHealth}%).`;
    }

    const comparison = [
      {
        supplierName: "PT. Agrotama",
        score: volNum >= 150 ? 95 : 0,
        prosId: ["Harga paling kompetitif (Rp 9.800/kg)", `Rating reputasi tinggi (${ptAgrotamaHealth}%)`],
        consId: ["Waktu pengiriman relatif lama (7 hari)", volNum < 150 ? "Tidak memenuhi batas minimum order 150 Ton" : "Risiko cuaca Pantura"],
        prosEn: ["Most competitive price (Rp 9,800/kg)", `High reputation rating (${ptAgrotamaHealth}%)`],
        consEn: ["Relatively long delivery time (7 days)", volNum < 150 ? "Does not meet the minimum order limit of 150 Tons" : "Pantura weather risk"]
      },
      {
        supplierName: "Bina Flora Ltd",
        score: (volNum >= 100 && volNum < 150) ? 92 : 80,
        prosId: ["Pengiriman sangat cepat (3 hari)", `Rating keandalan tinggi (${binaFloraHealth}%)`],
        consId: ["Harga sedang (Rp 10.500/kg)", volNum < 100 ? "Tidak memenuhi batas minimum order 100 Ton" : "Biaya lebih tinggi dari Agrotama"],
        prosEn: ["Very fast delivery (3 days)", `High reliability rating (${binaFloraHealth}%)`],
        consEn: ["Moderate price (Rp 10,500/kg)", volNum < 100 ? "Does not meet the minimum order limit of 100 Tons" : "Higher cost than Agrotama"]
      },
      {
        supplierName: "CV. Subur Jaya",
        score: volNum < 100 ? 85 : 60,
        prosId: ["Volume minimum order kecil (50 Ton)"],
        consId: ["Harga termahal (Rp 11.200/kg)", `Status kesehatan WASPADA (${cvSuburJayaHealth}%)`, "Pengiriman sedang (5 hari)"],
        prosEn: ["Low minimum order quantity (50 Tons)"],
        consEn: ["Highest price (Rp 11,200/kg)", `WARNING health status (${cvSuburJayaHealth}%)`, "Moderate delivery (5 days)"]
      }
    ];

    res.json({
      recommendedSupplier: recommended,
      reasoningId,
      reasoningEn,
      comparison
    });
  } catch (error: any) {
    console.error("Error evaluating suppliers:", error);
    res.status(500).json({ error: error?.message || "Internal supplier evaluation error" });
  }
});

app.post("/api/ai/forecast-recommendation", async (req, res) => {
  const { currentStock, capacityMax, threshold, commodityName } = req.body;
  const stockNum = parseFloat(currentStock) || 0;
  const capMaxNum = parseFloat(capacityMax) || 2000;
  const thresholdNum = parseFloat(threshold) || 1000;

  // Local fallback forecast data
  const fallbackForecast = {
    provinsi: "Jawa Tengah",
    kabupaten: "Demak (Koperasi Sumber Makmur)",
    daysForecast: [
      { day: "Hari 1-3", weather: "Hujan Lebat & Petir", temp: "26°C", humidity: "95%", windSpeed: "22 km/h", risk: "Tinggi - Potensi Banjir & Kelembapan Tinggi" },
      { day: "Hari 4-7", weather: "Hujan Sedang", temp: "27°C", humidity: "90%", windSpeed: "18 km/h", risk: "Sedang - Tanah Basah & Udara Lembap" },
      { day: "Hari 8-14", weather: "Berawan", temp: "29°C", humidity: "80%", windSpeed: "12 km/h", risk: "Rendah - Kondisi Membaik" }
    ]
  };

  // Attempt live fetch to the BMKG public API endpoint
  let bmkgForecast: any = null;
  try {
    const response = await fetch("https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=31.71.03.1001");
    if (response.ok) {
      const json: any = await response.json();
      if (json && json.data && json.data[0] && Array.isArray(json.data[0].cuaca)) {
        const flatCuaca = json.data[0].cuaca.flat();
        bmkgForecast = {
          provinsi: json.lokasi?.provinsi || "DKI Jakarta",
          kotkab: json.lokasi?.kotkab || "Jakarta Pusat",
          kecamatan: json.lokasi?.kecamatan || "Kemayoran",
          daysForecast: flatCuaca.slice(0, 12).map((item: any) => ({
            day: item.local_datetime,
            weather: item.weather_desc,
            temp: `${item.t}°C`,
            humidity: `${item.hu}%`,
            precipitation: `${item.tp || 0} mm`,
            risk: (parseFloat(item.tp) > 1 || item.weather_desc.toLowerCase().includes("hujan"))
              ? "Potensi Kelembapan Tinggi & Basah"
              : "Kondisi Aman"
          }))
        };
      }
    }
  } catch (err) {
    console.warn("Failed to fetch live BMKG weather data, using fallback.", err);
  }

  const finalForecast = bmkgForecast || fallbackForecast;
  const maxAllowedGap = Math.max(0, capMaxNum - stockNum);

  const prompt = `Lakukan kalkulasi rekomendasi volume pengadaan pupuk/pestisida yang paling realistis berdasarkan prakiraan cuaca dari BMKG dan status inventaris saat ini.
Tujuannya BUKAN sekadar memenuhi kapasitas gudang (capacityMax), melainkan menentukan jumlah yang paling cocok/aman agar:
1. Menghindari penumpukan stok berlebih di gudang yang lembap selama curah hujan tinggi (risiko pupuk menggumpal/rusak).
2. Menyesuaikan dengan jadwal aplikasi pupuk oleh petani yang tertunda akibat curah hujan ekstrem atau banjir.
3. Menjaga stok di atas batas kritis (threshold).

BATAS MAKSIMUM MUTLAK (ABSOLUTE CAP):
Volume rekomendasi ("recommendedVolume") WAJIB lebih kecil atau sama dengan sisa kapasitas kosong gudang (yaitu: ${maxAllowedGap} Ton/Liter). TOTAL STOK SETELAH PEMBELIAN (${stockNum} + recommendedVolume) TIDAK BOLEH melebihi kapasitas maksimum (${capMaxNum} Ton/Liter).

Data Inventaris:
- Nama Komoditas: ${commodityName}
- Stok Saat Ini: ${stockNum} Ton/Liter
- Batas Minimum (Threshold): ${thresholdNum} Ton/Liter
- Kapasitas Maksimum Gudang: ${capMaxNum} Ton/Liter

Data Prakiraan Cuaca BMKG:
${JSON.stringify(finalForecast, null, 2)}

Format respon harus berupa JSON murni tanpa markdown, dengan skema berikut:
{
  "recommendedVolume": 150,
  "weatherSummary": "Penjelasan singkat prakiraan cuaca BMKG Jawa Tengah 14 hari ke depan (maksimal 2 kalimat)...",
  "reasoningId": "Rekomendasi volume & alasan pengoptimalan dalam Bahasa Indonesia terkait risiko cuaca (maksimal 3 kalimat)...",
  "reasoningEn": "Volume recommendation & optimization reasons in English related to weather risks (maximum 3 sentences)..."
}`;

  try {
    const aiInstance = getGenAIInstance();
    if (aiInstance) {
      try {
        const response = await aiInstance.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        });

        const text = response.text || "";
        try {
          const result = JSON.parse(text);
          
          // Strict boundary check on the backend
          if (result.recommendedVolume > maxAllowedGap) {
            result.recommendedVolume = maxAllowedGap;
          }
          
          res.json(result);
          return;
        } catch (parseErr) {
          console.error("Error parsing Gemini response, falling back to offline logic:", text);
        }
      } catch (geminiErr) {
        console.warn("Gemini forecast recommendation failed, falling back to offline logic:", geminiErr);
      }
    }

    // Dynamic offline fallback generator if GEMINI_API_KEY is not defined or parsing fails
    const weatherSummary = finalForecast.daysForecast && finalForecast.daysForecast[0]
      ? `BMKG memantau cuaca di ${finalForecast.kecamatan} adalah ${finalForecast.daysForecast[0].weather} dengan kelembapan rata-rata ${finalForecast.daysForecast[0].humidity}.`
      : "BMKG memprediksi curah hujan tinggi disertai petir di wilayah Jawa Tengah dalam 7 hari ke depan dengan tingkat kelembapan udara mencapai 95%.";

    let recommendedVolume = Math.round(maxAllowedGap * 0.4); // 40% of the available gap under wet weather conditions
    if (recommendedVolume > maxAllowedGap) {
      recommendedVolume = maxAllowedGap;
    }

    let reasoningId = `Volume pembelian direkomendasikan sebanyak ${recommendedVolume} Ton/Liter (dibatasi oleh sisa kapasitas gudang ${maxAllowedGap} Ton/Liter). Hal ini untuk menghindari risiko kerusakan pupuk akibat kelembapan udara yang tinggi (${finalForecast.daysForecast?.[0]?.humidity || "90%"}) serta potensi penundaan pemupukan.`;
    let reasoningEn = `Purchase volume recommended at ${recommendedVolume} Tons/Liters (constrained by remaining storage space of ${maxAllowedGap} Tons/Liters). This avoids fertilizer degradation due to high humidity levels (${finalForecast.daysForecast?.[0]?.humidity || "90%"}) and potentially delayed crop application.`;

    if (commodityName.toLowerCase().includes("pestisida")) {
      recommendedVolume = Math.round(thresholdNum * 1.2 - stockNum); // Reorder just enough for immediate safety
      if (recommendedVolume < 0) recommendedVolume = 50;
      if (recommendedVolume > maxAllowedGap) recommendedVolume = maxAllowedGap;
      reasoningId = `Untuk pestisida, disarankan pengadaan ${recommendedVolume} Liter untuk memenuhi ambang aman. Aplikasi pestisida sebaiknya dibatasi selama hujan lebat karena risiko larutan tercuci air hujan tinggi.`;
      reasoningEn = `For pesticides, purchasing ${recommendedVolume} Liters is advised to meet the safety limit. Pesticide application should be minimized during heavy rains due to high wash-off risks.`;
    }

    res.json({
      recommendedVolume,
      weatherSummary,
      reasoningId,
      reasoningEn
    });
  } catch (error: any) {
    console.error("Error calculating weather recommendation:", error);
    res.status(500).json({ error: error?.message || "Internal weather recommendation error" });
  }
});

// Database API Routes
app.get("/api/user", async (req, res) => {
  const { email } = req.query;
  try {
    const user = email 
      ? await prisma.user.findUnique({
          where: { email: String(email) },
          include: { cooperative: true }
        })
      : await prisma.user.findFirst({
          include: { cooperative: true }
        });

    if (!user) {
      res.json(null);
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      cooperative: user.cooperative 
        ? user.cooperative.name 
        : (user.role === 'super_admin' ? 'Super Admin' : (user.role === 'supplier' ? 'Supplier Partner' : '-'))
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }
  if (!password) {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { cooperative: true }
    });

    if (!user) {
      res.status(401).json({ error: "Email atau password salah." });
      return;
    }

    if (user.password !== password) {
      res.status(401).json({ error: "Email atau password salah." });
      return;
    }

    if (user.status !== "active" && user.status !== "aktif") {
      res.status(403).json({ error: "Akun Anda dinonaktifkan. Silakan hubungi admin." });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      cooperative: user.cooperative 
        ? user.cooperative.name 
        : (user.role === 'super_admin' ? 'Super Admin' : (user.role === 'supplier' ? 'Supplier Partner' : '-'))
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/stocks", async (req, res) => {
  try {
    const stocks = await prisma.stockItem.findMany();
    res.json(stocks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/stocks", async (req, res) => {
  try {
    const stock = await prisma.stockItem.create({ data: req.body });
    res.json(stock);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/stocks/receive", async (req, res) => {
  const { sku, quantity, orderId } = req.body;
  if (!sku || !quantity) {
    res.status(400).json({ error: "Missing sku or quantity" });
    return;
  }

  try {
    const qtyFloat = parseFloat(quantity);
    if (isNaN(qtyFloat)) {
      res.status(400).json({ error: "Invalid quantity" });
      return;
    }

    // Find stock item
    const stockItem = await prisma.stockItem.findUnique({
      where: { sku }
    });

    if (!stockItem) {
      res.status(404).json({ error: "Stock item not found" });
      return;
    }

    const newStockVal = stockItem.stock + qtyFloat;

    // Calculate new status
    let calStatus: 'KRITIS' | 'SELESAI' | 'PERINGATAN' = 'SELESAI';
    if (newStockVal < 0.3 * stockItem.capacityMax) {
      calStatus = 'KRITIS';
    } else if (newStockVal < 0.5 * stockItem.capacityMax) {
      calStatus = 'PERINGATAN';
    }

    // Update stock item
    const updatedStock = await prisma.stockItem.update({
      where: { sku },
      data: {
        stock: newStockVal,
        status: calStatus
      }
    });

    // Create log date formatting
    const dateStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    // Create log
    await prisma.stockLog.create({
      data: {
        type: 'masuk',
        title: `Stok Masuk: ${stockItem.name}`,
        description: `Diterima otomatis via Order ${orderId || ''}`,
        amount: `+${qtyFloat} ${stockItem.unit}`,
        color: 'text-emerald-600',
        date: dateStr
      }
    });

    res.json({ success: true, updatedStock });
  } catch (err: any) {
    console.error("Error receiving stock:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/stock-logs", async (req, res) => {
  try {
    const logs = await prisma.stockLog.findMany();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/contracts", async (req, res) => {
  try {
    const contracts = await prisma.smartContract.findMany();
    res.json(contracts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/contracts", async (req, res) => {
  try {
    const contract = await prisma.smartContract.create({ data: req.body });
    res.json(contract);
  } catch (err: any) {
    console.error("[POST /api/contracts Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany();
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const order = await prisma.order.create({ data: req.body });
    res.json(order);
  } catch (err: any) {
    console.error("[POST /api/orders Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    const order = await prisma.order.update({
      where: { id: orderId },
      data: req.body,
    });

    // If order is transitioned to 'diterima', run the stock allocation update
    if (existingOrder && existingOrder.currentStatus !== 'diterima' && req.body.currentStatus === 'diterima') {
      let allocation = order.allocation as Record<string, number> | null;
      if (!allocation || typeof allocation !== 'object' || Object.keys(allocation).length === 0) {
        const orderQtyVal = parseFloat(order.quantity) || 100;
        allocation = { "Sumber Makmur": orderQtyVal };
      }
      if (allocation && typeof allocation === 'object') {
        const commodity = order.commodity; // e.g. "Pupuk Urea Subsidi" or "Urea N46 (Premium)" or "NPK Phonska"
        const entries = Object.entries(allocation);

        for (const [coopName, qty] of entries) {
          const qtyFloat = parseFloat(String(qty)) || 0;
          if (qtyFloat <= 0) continue;

          // Normalize cooperative name matching (e.g. check "Sumber Makmur" in "Koperasi Sumber Makmur")
          // Let's search by name
          const coopStocks = await prisma.stockItem.findMany({
            where: {
              OR: [
                { cooperative: { contains: coopName, mode: 'insensitive' } },
                { cooperative: { equals: coopName, mode: 'insensitive' } }
              ]
            }
          });

          // Look for a stock item where name contains keywords from commodity
          let matchedStock = coopStocks.find(item => {
            const nameLower = item.name.toLowerCase();
            const commodityLower = commodity.toLowerCase();
            return nameLower.includes(commodityLower) || commodityLower.includes(nameLower);
          });

          // Generic keyword fallback matching
          if (!matchedStock) {
            const keywords = ["urea", "npk", "pestisida", "phonska", "cair"];
            const matchedKeyword = keywords.find(k => commodity.toLowerCase().includes(k));
            if (matchedKeyword) {
              matchedStock = coopStocks.find(item => item.name.toLowerCase().includes(matchedKeyword));
            }
          }

          let updatedStock;
          if (matchedStock) {
            // Update existing stock
            const newStockVal = matchedStock.stock + qtyFloat;

            let calStatus: 'KRITIS' | 'SELESAI' | 'PERINGATAN' = 'SELESAI';
            if (newStockVal < matchedStock.threshold / 2) {
              calStatus = 'KRITIS';
            } else if (newStockVal < matchedStock.threshold) {
              calStatus = 'PERINGATAN';
            }

            updatedStock = await prisma.stockItem.update({
              where: { id: matchedStock.id },
              data: {
                stock: newStockVal,
                status: calStatus
              }
            });
          } else {
            // Create a new stock item dynamically
            const rawCommInitials = commodity.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'PROD';
            const rawCoopInitials = coopName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'COOP';
            const randomSuffix = Math.floor(100 + Math.random() * 900);
            const generatedSku = `${rawCommInitials}-${rawCoopInitials}-${new Date().getFullYear()}-${randomSuffix}`;
            
            const defaultThreshold = commodity.toLowerCase().includes("pestisida") ? 500 : 1000;
            const defaultCapacityMax = commodity.toLowerCase().includes("pestisida") ? 2000 : 3000;
            const unit = commodity.toLowerCase().includes("pestisida") || commodity.toLowerCase().includes("cair") ? "Liter" : "Ton";

            let calStatus: 'KRITIS' | 'SELESAI' | 'PERINGATAN' = 'SELESAI';
            if (qtyFloat < defaultThreshold / 2) {
              calStatus = 'KRITIS';
            } else if (qtyFloat < defaultThreshold) {
              calStatus = 'PERINGATAN';
            }

            // Normalize coop name for display: if it's "Sumber Makmur", check if we should keep it short or make it "Koperasi Sumber Makmur"
            // Let's use the name supplied in the allocation directly
            updatedStock = await prisma.stockItem.create({
              data: {
                name: commodity,
                sku: generatedSku,
                cooperative: coopName,
                stock: qtyFloat,
                unit: unit,
                threshold: defaultThreshold,
                capacityMax: defaultCapacityMax,
                status: calStatus
              }
            });
          }

          // Create stock log
          const dateStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
          await prisma.stockLog.create({
            data: {
              type: 'masuk',
              title: `Stok Masuk: ${commodity}`,
              description: `Diterima otomatis via Order ${orderId} (${coopName})`,
              amount: `+${qtyFloat} ${updatedStock.unit}`,
              color: 'text-emerald-600',
              date: dateStr
            }
          });
        }
      }
    }

    res.json(order);
  } catch (err: any) {
    console.error("[PATCH /api/orders Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/supplier-health", async (req, res) => {
  try {
    const health = await prisma.supplierHealth.findMany();
    res.json(health);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/supplier-health/:name", async (req, res) => {
  try {
    const health = await prisma.supplierHealth.findFirst({
      where: { name: { equals: req.params.name, mode: 'insensitive' } }
    });
    if (!health) {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }
    const updated = await prisma.supplierHealth.update({
      where: { code: health.code },
      data: req.body
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/chat-messages", async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      orderBy: { timestamp: 'asc' }
    });
    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/chat-messages", async (req, res) => {
  try {
    const msg = await prisma.chatMessage.create({ data: req.body });
    res.json(msg);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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
