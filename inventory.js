const { Redis } = require("@upstash/redis");

// Vercel เป็นแบบ serverless เก็บข้อมูลในหน่วยความจำไม่ได้ จึงใช้ Redis (Upstash) แทน
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

const TTL_SECONDS = 30; // ไม่มีข้อมูลใหม่เกิน 30 วินาที = ถือว่าออกจากเกมแล้ว (ลบเองอัตโนมัติ)

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  try {
    // Roblox ส่งข้อมูลมาที่นี่
    if (req.method === "POST") {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "ยังไม่ได้ตั้งค่า API_KEY บน Vercel" });
      }
      if (req.headers["x-api-key"] !== apiKey) {
        return res.status(401).json({ error: "รหัส x-api-key ไม่ถูกต้อง" });
      }

      let body = req.body;
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch { body = null; }
      }
      const { userId, name, items } = body || {};
      if (typeof userId !== "number" || typeof name !== "string" || typeof items !== "object" || items === null) {
        return res.status(400).json({ error: "ข้อมูลไม่ครบ ต้องมี userId, name, items" });
      }

      const clean = {};
      for (const [key, value] of Object.entries(items)) {
        if (typeof value === "number" && Number.isFinite(value)) {
          clean[String(key).slice(0, 60)] = value;
        }
      }

      await redis.set(`inv:${userId}`, { userId, name: name.slice(0, 50), items: clean, updatedAt: Date.now() }, { ex: TTL_SECONDS });
      return res.status(200).json({ ok: true });
    }

    // หน้าเว็บดึงข้อมูลจากที่นี่
    if (req.method === "GET") {
      const keys = await redis.keys("inv:*");
      if (keys.length === 0) return res.status(200).json([]);
      const values = await redis.mget(...keys);
      return res.status(200).json(values.filter(Boolean));
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "ใช้ได้เฉพาะ GET และ POST" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "เซิร์ฟเวอร์มีปัญหา ลองเช็กว่าเชื่อมฐานข้อมูล Upstash Redis กับโปรเจกต์แล้วหรือยัง" });
  }
};
