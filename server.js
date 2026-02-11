import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

/* ===== المتغيرات ===== */
const REAL_PASS = process.env.VIP_PASS;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

/* ===== تحقق من الإعدادات ===== */
if (!REAL_PASS || !BOT_TOKEN || !CHAT_ID) {
  console.error("❌ ENV variables missing");
  process.exit(1);
}

/* ===== إرسال تلغرام عند الخطأ ===== */
async function sendFailAlert(pass, ip) {
  const text =
`🚨 محاولة فاشلة

🔑 كلمة السر: ${pass}
🌐 IP: ${ip}`;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text
    })
  });
}

/* ===== التحقق من كلمة السر ===== */
app.post("/check", async (req, res) => {
  const { password } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (password === REAL_PASS) {
    return res.json({ ok: true });
  }

  await sendFailAlert(password, ip);
  return res.status(401).json({ ok: false });
});

/* ===== إرسال الوصف أو ✓ ===== */
app.post("/send-to-bot", async (req, res) => {
  const { message } = req.body;

  const text = message && message.length
    ? `📩 وصف جديد:\n${message}`
    : "✅ تم الضغط على زر ✓ بدون كتابة وصف";

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text
    })
  });

  res.json({ ok: true });
});

/* ===== تشغيل السيرفر ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
