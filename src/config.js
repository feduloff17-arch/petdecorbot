import dotenv from 'dotenv';

dotenv.config();

const required = ['TELEGRAM_BOT_TOKEN'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
}

export const config = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  adminIds: (process.env.ADMIN_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),
  port: Number(process.env.PORT || 10000),
  webhookUrl: process.env.BOT_WEBHOOK_URL || process.env.RENDER_EXTERNAL_URL || '',
  webhookSecret: process.env.BOT_WEBHOOK_SECRET || process.env.TELEGRAM_BOT_TOKEN
};
