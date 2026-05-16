import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { config } from './config.js';

const useWebhook = Boolean(config.webhookUrl);
const bot = new TelegramBot(config.telegramToken, { polling: !useWebhook });
const sessions = new Map();

const translations = {
  ru: {
    start: 'Здравствуйте! Я помогу быстро оформить заявку для администратора.',
    orderButton: 'Оставить заявку',
    doneButton: 'Готово',
    skipPhotoButton: 'Пропустить фото',
    askName: 'Как вас зовут?',
    askCountry: 'В какой вы стране?',
    askProductType: 'Какой тип изделия нужен? Например: панно, вешалка, подвеска, подарочный набор, другое.',
    askSizes: 'Укажите размеры. Если не знаете точно, напишите примерно или “не знаю”.',
    askPhoto: 'Пришлите фото или референсы. Можно отправить несколько фото, затем нажать “Готово”.',
    askPhotoAgain: 'Пожалуйста, отправьте фото или нажмите “Готово” / “Пропустить фото”.',
    askWishesAndDeadline: 'Напишите пожелания и сроки. Например: материал, цвет, стиль, бюджет, к какой дате нужно.',
    thanks: 'Спасибо! Заявка отправлена администратору. С вами свяжутся в Telegram.',
    adminOnly: 'Эта команда доступна только администратору.',
    adminActive: 'Админка активна. Новые заявки будут приходить сюда.',
    adminButton: 'Админка активна',
    photoOutsideFlow: 'Чтобы прикрепить фото к заявке, сначала нажмите “Оставить заявку”.',
    photoAccepted: (count) => `Фото принято. Всего фото: ${count}.`
  },
  en: {
    start: 'Hello! I will help you quickly send a request to the administrator.',
    orderButton: 'Submit a request',
    doneButton: 'Done',
    skipPhotoButton: 'Skip photos',
    askName: 'What is your name?',
    askCountry: 'Which country are you in?',
    askProductType: 'What type of item do you need? For example: wall panel, hanger, pendant, gift set, other.',
    askSizes: 'Please specify the sizes. If you are not sure, write an approximate size or “I don’t know”.',
    askPhoto: 'Please send photos or references. You can send several photos, then tap “Done”.',
    askPhotoAgain: 'Please send a photo or tap “Done” / “Skip photos”.',
    askWishesAndDeadline: 'Write your wishes and deadline. For example: material, color, style, budget, needed date.',
    thanks: 'Thank you! Your request has been sent to the administrator. They will contact you in Telegram.',
    adminOnly: 'This command is available only to the administrator.',
    adminActive: 'Admin mode is active. New requests will arrive here.',
    adminButton: 'Admin active',
    photoOutsideFlow: 'To attach photos to a request, please tap “Submit a request” first.',
    photoAccepted: (count) => `Photo received. Total photos: ${count}.`
  },
  he: {
    start: 'שלום! אעזור לך לשלוח בקשה למנהל בצורה מהירה.',
    orderButton: 'שליחת בקשה',
    doneButton: 'סיימתי',
    skipPhotoButton: 'דלג על תמונות',
    askName: 'מה השם שלך?',
    askCountry: 'באיזו מדינה את/ה נמצא/ת?',
    askProductType: 'איזה סוג מוצר צריך? למשל: פאנל קיר, מתלה, תליון, ערכת מתנה, אחר.',
    askSizes: 'נא לציין מידות. אם לא יודעים בדיוק, אפשר לכתוב בערך או “לא יודע/ת”.',
    askPhoto: 'אפשר לשלוח תמונות או רפרנסים. ניתן לשלוח כמה תמונות ואז ללחוץ “סיימתי”.',
    askPhotoAgain: 'נא לשלוח תמונה או ללחוץ “סיימתי” / “דלג על תמונות”.',
    askWishesAndDeadline: 'נא לכתוב בקשות מיוחדות ומועד רצוי. למשל: חומר, צבע, סגנון, תקציב, תאריך יעד.',
    thanks: 'תודה! הבקשה נשלחה למנהל. יצרו איתך קשר בטלגרם.',
    adminOnly: 'הפקודה זמינה רק למנהל.',
    adminActive: 'מצב מנהל פעיל. בקשות חדשות יגיעו לכאן.',
    adminButton: 'מנהל פעיל',
    photoOutsideFlow: 'כדי לצרף תמונה לבקשה, יש ללחוץ קודם על “שליחת בקשה”.',
    photoAccepted: (count) => `התמונה התקבלה. סך הכל תמונות: ${count}.`
  },
  uk: {
    start: 'Вітаю! Я допоможу швидко оформити заявку для адміністратора.',
    orderButton: 'Залишити заявку',
    doneButton: 'Готово',
    skipPhotoButton: 'Пропустити фото',
    askName: 'Як вас звати?',
    askCountry: 'У якій ви країні?',
    askProductType: 'Який тип виробу потрібен? Наприклад: панно, вішалка, підвіска, подарунковий набір, інше.',
    askSizes: 'Вкажіть розміри. Якщо точно не знаєте, напишіть приблизно або “не знаю”.',
    askPhoto: 'Надішліть фото або референси. Можна надіслати кілька фото, потім натиснути “Готово”.',
    askPhotoAgain: 'Будь ласка, надішліть фото або натисніть “Готово” / “Пропустити фото”.',
    askWishesAndDeadline: 'Напишіть побажання і терміни. Наприклад: матеріал, колір, стиль, бюджет, потрібна дата.',
    thanks: 'Дякую! Заявку надіслано адміністратору. З вами зв’яжуться в Telegram.',
    adminOnly: 'Ця команда доступна лише адміністратору.',
    adminActive: 'Адмінка активна. Нові заявки надходитимуть сюди.',
    adminButton: 'Адмінка активна',
    photoOutsideFlow: 'Щоб прикріпити фото до заявки, спочатку натисніть “Залишити заявку”.',
    photoAccepted: (count) => `Фото прийнято. Усього фото: ${count}.`
  },
  es: {
    start: 'Hola. Te ayudaré a enviar rápidamente una solicitud al administrador.',
    orderButton: 'Enviar solicitud',
    doneButton: 'Listo',
    skipPhotoButton: 'Omitir fotos',
    askName: '¿Cómo te llamas?',
    askCountry: '¿En qué país estás?',
    askProductType: '¿Qué tipo de producto necesitas? Por ejemplo: panel decorativo, perchero, colgante, set de regalo, otro.',
    askSizes: 'Indica las medidas. Si no las sabes exactamente, escribe una medida aproximada o “no sé”.',
    askPhoto: 'Envía fotos o referencias. Puedes enviar varias fotos y luego pulsar “Listo”.',
    askPhotoAgain: 'Por favor, envía una foto o pulsa “Listo” / “Omitir fotos”.',
    askWishesAndDeadline: 'Escribe tus deseos y plazos. Por ejemplo: material, color, estilo, presupuesto, fecha necesaria.',
    thanks: '¡Gracias! Tu solicitud fue enviada al administrador. Se pondrán en contacto contigo por Telegram.',
    adminOnly: 'Este comando está disponible solo para el administrador.',
    adminActive: 'El modo administrador está activo. Las nuevas solicitudes llegarán aquí.',
    adminButton: 'Admin activo',
    photoOutsideFlow: 'Para adjuntar fotos a una solicitud, primero pulsa “Enviar solicitud”.',
    photoAccepted: (count) => `Foto recibida. Total de fotos: ${count}.`
  },
  it: {
    start: 'Ciao. Ti aiuterò a inviare rapidamente una richiesta all’amministratore.',
    orderButton: 'Invia richiesta',
    doneButton: 'Fatto',
    skipPhotoButton: 'Salta foto',
    askName: 'Come ti chiami?',
    askCountry: 'In quale paese ti trovi?',
    askProductType: 'Che tipo di prodotto ti serve? Per esempio: pannello decorativo, appendiabiti, ciondolo, set regalo, altro.',
    askSizes: 'Indica le misure. Se non le sai esattamente, scrivi una misura approssimativa o “non lo so”.',
    askPhoto: 'Invia foto o riferimenti. Puoi inviare più foto e poi premere “Fatto”.',
    askPhotoAgain: 'Per favore, invia una foto oppure premi “Fatto” / “Salta foto”.',
    askWishesAndDeadline: 'Scrivi preferenze e tempi. Per esempio: materiale, colore, stile, budget, data desiderata.',
    thanks: 'Grazie! La tua richiesta è stata inviata all’amministratore. Ti contatteranno su Telegram.',
    adminOnly: 'Questo comando è disponibile solo per l’amministratore.',
    adminActive: 'Modalità amministratore attiva. Le nuove richieste arriveranno qui.',
    adminButton: 'Admin attivo',
    photoOutsideFlow: 'Per allegare foto a una richiesta, premi prima “Invia richiesta”.',
    photoAccepted: (count) => `Foto ricevuta. Totale foto: ${count}.`
  }
};

const languageNames = {
  ru: 'русский',
  en: 'английский',
  he: 'иврит',
  uk: 'украинский',
  es: 'испанский',
  it: 'итальянский'
};

function normalizeLanguage(languageCode) {
  const language = String(languageCode || '').toLowerCase().split('-')[0];
  if (language === 'iw') return 'he';
  if (language === 'ua') return 'uk';
  return translations[language] ? language : 'ru';
}

function t(language) {
  return translations[language] || translations.ru;
}

function mainMenu(language) {
  return {
    reply_markup: {
      resize_keyboard: true,
      keyboard: [[t(language).orderButton]]
    }
  };
}

function photoMenu(language) {
  return {
    reply_markup: {
      resize_keyboard: true,
      keyboard: [[t(language).doneButton], [t(language).skipPhotoButton]]
    }
  };
}

function adminMenu(language) {
  return {
    reply_markup: {
      resize_keyboard: true,
      keyboard: [[t(language).adminButton]]
    }
  };
}

function isAdmin(userId) {
  return config.adminIds.includes(String(userId));
}

function getSession(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, { step: null, draft: {} });
  }

  return sessions.get(chatId);
}

function resetSession(chatId) {
  sessions.set(chatId, { step: null, draft: {} });
}

function getLanguage(from) {
  return normalizeLanguage(from?.language_code);
}

function requestId() {
  return `REQ-${Date.now().toString(36).toUpperCase()}`;
}

function userLabel(from) {
  const username = from.username ? `@${from.username}` : 'username не указан';
  const name = `${from.first_name || 'Клиент'} ${from.last_name || ''}`.trim();
  return `${name}, ${username}, ID ${from.id}`;
}

function formatAdminMessage(request, from) {
  return [
    `Новая заявка: ${request.id}`,
    '',
    `Язык клиента: ${languageNames[request.language] || request.language}`,
    `Telegram: ${userLabel(from)}`,
    `Имя: ${request.name}`,
    `Страна: ${request.country}`,
    `Тип изделия: ${request.productType}`,
    `Размеры: ${request.sizes}`,
    `Пожелания и сроки: ${request.wishesAndDeadline}`,
    `Фото: ${request.photoFileIds.length || 'нет'}`
  ].join('\n');
}

async function notifyAdmins(request, from) {
  if (!config.adminIds.length) {
    console.warn('ADMIN_IDS is empty. Admin notification was not sent.');
    return;
  }

  const text = formatAdminMessage(request, from);

  for (const adminId of config.adminIds) {
    await bot.sendMessage(adminId, text).catch(() => null);

    for (let index = 0; index < request.photoFileIds.length; index += 1) {
      const caption = index === 0 ? `Фото к заявке ${request.id}` : undefined;
      await bot.sendPhoto(adminId, request.photoFileIds[index], { caption }).catch(() => null);
    }
  }
}

async function startRequestFlow(chatId, from) {
  const language = getLanguage(from);
  const session = getSession(chatId);
  session.step = 'name';
  session.draft = { language, photoFileIds: [] };

  await bot.sendMessage(chatId, t(language).askName);
}

async function finishRequest(chatId, from) {
  const session = getSession(chatId);
  const request = {
    id: requestId(),
    language: session.draft.language || getLanguage(from),
    name: session.draft.name,
    country: session.draft.country,
    productType: session.draft.productType,
    sizes: session.draft.sizes,
    photoFileIds: session.draft.photoFileIds || [],
    wishesAndDeadline: session.draft.wishesAndDeadline
  };

  await notifyAdmins(request, from);
  resetSession(chatId);

  await bot.sendMessage(
    chatId,
    t(request.language).thanks,
    mainMenu(request.language)
  );
}

async function handleRequestText(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  const session = getSession(chatId);
  const language = session.draft.language || getLanguage(msg.from);
  const texts = t(language);

  if (session.step === 'name') {
    session.draft.name = text;
    session.step = 'country';
    await bot.sendMessage(chatId, texts.askCountry);
    return true;
  }

  if (session.step === 'country') {
    session.draft.country = text;
    session.step = 'productType';
    await bot.sendMessage(chatId, texts.askProductType);
    return true;
  }

  if (session.step === 'productType') {
    session.draft.productType = text;
    session.step = 'sizes';
    await bot.sendMessage(chatId, texts.askSizes);
    return true;
  }

  if (session.step === 'sizes') {
    session.draft.sizes = text;
    session.step = 'photo';
    await bot.sendMessage(chatId, texts.askPhoto, photoMenu(language));
    return true;
  }

  if (session.step === 'photo') {
    if (text === texts.doneButton || text === texts.skipPhotoButton) {
      session.step = 'wishesAndDeadline';
      await bot.sendMessage(chatId, texts.askWishesAndDeadline);
      return true;
    }

    await bot.sendMessage(chatId, texts.askPhotoAgain, photoMenu(language));
    return true;
  }

  if (session.step === 'wishesAndDeadline') {
    session.draft.wishesAndDeadline = text;
    await finishRequest(chatId, msg.from);
    return true;
  }

  return false;
}

bot.onText(/\/start/, async (msg) => {
  const language = getLanguage(msg.from);
  resetSession(msg.chat.id);
  await bot.sendMessage(msg.chat.id, t(language).start, mainMenu(language));
});

bot.onText(/\/admin/, async (msg) => {
  const language = getLanguage(msg.from);
  if (!isAdmin(msg.from.id)) {
    await bot.sendMessage(msg.chat.id, t(language).adminOnly);
    return;
  }

  await bot.sendMessage(msg.chat.id, t(language).adminActive, adminMenu(language));
});

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const session = getSession(chatId);
  const language = session.draft.language || getLanguage(msg.from);

  if (session.step !== 'photo') {
    await bot.sendMessage(chatId, t(language).photoOutsideFlow, mainMenu(language));
    return;
  }

  const largestPhoto = msg.photo.at(-1);
  session.draft.photoFileIds.push(largestPhoto.file_id);
  await bot.sendMessage(
    chatId,
    t(language).photoAccepted(session.draft.photoFileIds.length),
    photoMenu(language)
  );
});

bot.on('message', async (msg) => {
  if (!msg.text) return;

  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const language = getLanguage(msg.from);
  const texts = t(language);

  if (text.startsWith('/')) return;

  const session = getSession(chatId);
  if (session.step && (await handleRequestText(msg))) return;

  if (text === texts.orderButton || isOrderButtonText(text)) {
    await startRequestFlow(chatId, msg.from);
    return;
  }

  await startRequestFlow(chatId, msg.from);
});

function isOrderButtonText(text) {
  return Object.values(translations).some((translation) => translation.orderButton === text);
}

async function startWebhookServer() {
  const app = express();
  const webhookPath = `/telegram-webhook/${encodeURIComponent(config.webhookSecret)}`;
  const webhookUrl = `${config.webhookUrl.replace(/\/$/, '')}${webhookPath}`;

  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('Telegram bot is running.');
  });

  app.get('/health', (req, res) => {
    res.json({ ok: true });
  });

  app.post(webhookPath, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  await bot.setWebHook(webhookUrl);

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`Telegram bot webhook is running on port ${config.port}.`);
  });
}

if (useWebhook) {
  startWebhookServer().catch((error) => {
    console.error('Failed to start webhook server:', error);
    process.exit(1);
  });
} else {
  console.log('Simple multilingual Telegram request bot is running with polling.');
}
