require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const cors = require("cors");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
app.use(cors());
app.use(express.json());

// ID або @username твого каналу
const CHANNEL_ID = "@live_fakultet_bot";

// функція перевірки підписки
async function checkSubscription(userId) {
  try {
    const member = await bot.telegram.getChatMember(CHANNEL_ID, userId);
    // статуси: creator, administrator, member = підписаний
    if (["creator", "administrator", "member"].includes(member.status)) {
      return true;
    }
    return false;
  } catch (err) {
    console.error("Помилка перевірки підписки:", err.message);
    return false;
  }
}

// стартова команда
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
      "❌ Для доступу підпишись на канал:\n👉 https://t.me/твій_канал",
      Markup.inlineKeyboard([
        [Markup.button.url("🔗 Підписатись", "https://t.me/твій_канал")],
        [Markup.button.callback("✅ Я підписався", "check_subscribe")]
      ])
    );
  }
});

// кнопка "Я підписався"
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
    ctx.reply("❌ Ти ще не підписався! 👉 https://t.me/твій_канал");
  }
});

// прийом даних із Mini App
bot.on("web_app_data", async (ctx) => {
  const isSubscribed = await checkSubscription(ctx.from.id);

  if (!isSubscribed) {
    return ctx.reply("❌ Доступ заборонено! Підпишись на канал 👉 https://t.me/твій_канал");
  }

  const data = JSON.parse(ctx.message.web_app_data.data);
  ctx.reply(`Отримав від тебе: ${JSON.stringify(data)}`);
});

// запускаємо бота
bot.launch();
