import express from "express";
import fetch from "node-fetch";

const app = express();

// مهم جدًا
app.use(express.json());
app.use(express.static("public"));

const REAL_PASS = process.env.VIP_PASS;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function sendAlert(pass, ip) {
  if (!BOT_TOKEN || !CHAT_ID) return;

  const text = `🚨 محاولة فاشلة\n\n🔑 كلمة السر: ${pass}\n🌐 IP: ${ip}`;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text })
  });
}

app.post("/VIP_PASS", async (req, res) => {
  const password = (req.body.password || "").trim();
  const real = (REAL_PASS || "").trim();

  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress;

  if (password === real && real !== "") {
    return res.json({ ok: true });
  } else {
    await sendAlert(password, ip);
    return res.status(401).json({ ok: false });
  }
});

app.listen(3000, () => {
  console.log("✅ Server running on port 3000");
});
