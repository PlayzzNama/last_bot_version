require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const cors = require("cors");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
app.use(cors());
app.use(express.json());

// 🔗 Канал (публічний)
const CHANNEL_ID = "@streets_wont_forget";

// функція перевірки підписки
async function checkSubscription(userId) {
  try {
    const member = await bot.telegram.getChatMember(CHANNEL_ID, userId);
    if (["creator", "administrator", "member"].includes(member.status)) {
      return true;
    }
    return false;
  } catch (err) {
    console.error("Помилка перевірки підписки:", err.message);
    return false;
  }
}

// 📌 команда /start
bot.start(async (ctx) => {
  const isSubscribed = await checkSubscription(ctx.from.id);

  if (isSubscribed) {
    ctx.reply(
      "Привіт 👋 Ти підписаний ✅\nВідкрий Mini App:",
      Markup.inlineKeyboard([
        [Markup.button.webApp("⚽ Відкрити", "https://твій-деплой.vercel.app")]
      ])
    );
  } else {
    ctx.reply(
      "❌ Для доступу підпишись на канал:\n👉 https://t.me/streets_wont_forget",
      Markup.inlineKeyboard([
        [Markup.button.url("🔗 Підписатись", "https://t.me/streets_wont_forget")],
        [Markup.button.callback("✅ Я підписався", "check_subscribe")]
      ])
    );
  }
});

// 📌 кнопка "Я підписався"
bot.action("check_subscribe", async (ctx) => {
  const isSubscribed = await checkSubscription(ctx.from.id);

  if (isSubscribed) {
    ctx.reply(
      "✅ Доступ відкрито! Відкрий Mini App:",
      Markup.inlineKeyboard([
        [Markup.button.webApp("⚽ Відкрити", "https://твій-деплой.vercel.app")]
      ])
    );
  } else {
    ctx.reply("❌ Ти ще не підписався! 👉 https://t.me/streets_wont_forget");
  }
});

// 📌 прийом даних через tg.sendData (якщо ти все ж таки будеш його юзати)
bot.on("web_app_data", async (ctx) => {
  const isSubscribed = await checkSubscription(ctx.from.id);
  if (!isSubscribed) {
    return ctx.reply("❌ Доступ заборонено! Підпишись 👉 https://t.me/streets_wont_forget");
  }

  const data = JSON.parse(ctx.message.web_app_data.data);
  ctx.reply(`Отримав від тебе: ${JSON.stringify(data)}`);
});

// 📌 API для Mini App (через fetch)
app.post("/api/sendData", async (req, res) => {
  const { userId, league, match } = req.body;

  try {
    const isSubscribed = await checkSubscription(userId);
    if (!isSubscribed) {
      return res.status(403).json({ ok: false, error: "Користувач не підписаний" });
    }

    await bot.telegram.sendMessage(
      userId,
      `📡 Нова заявка!\nЛіга: ${league}\nМатч: ${match}`
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Помилка надсилання:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 📌 запуск
bot.launch();
app.listen(3000, () => console.log("✅ Server running on port 3000"));
