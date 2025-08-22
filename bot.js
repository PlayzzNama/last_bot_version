require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const cors = require("cors");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
app.use(cors());
app.use(express.json());

// стартова команда
bot.start((ctx) => {
  ctx.reply(
    "Привіт 👋 Відкрий Mini App:",
    Markup.inlineKeyboard([
      [Markup.button.webApp("⚽ Відкрити", "https://твій-деплой.vercel.app")]
    ])
  );
});

// прийом даних із Mini App
bot.on("web_app_data", (ctx) => {
  const data = JSON.parse(ctx.message.web_app_data.data);
  ctx.reply(`Отримав від тебе: ${JSON.stringify(data)}`);
});

// запускаємо бота
bot.launch();
