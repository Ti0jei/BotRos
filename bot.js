import { Telegraf } from 'telegraf';

const bot = new Telegraf('7863771715:AAHAmYE17-8yefTNGX4rvJo5a1qrdgZ2_RQ'); // ← подставь сюда токен от BotFather

const WEB_APP_URL = 'https://bot-ros-frontend.vercel.app/';

bot.on('message', (ctx) => {
  ctx.reply('Нажми кнопку ниже, чтобы открыть фитнес-приложение 💪', {
    reply_markup: {
      keyboard: [
        [{ text: 'Открыть приложение', web_app: { url: WEB_APP_URL } }]
      ],
      resize_keyboard: true,
      is_persistent: true,
    },
  });
});

bot.launch();
console.log('🤖 Бот запущен');
