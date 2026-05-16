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

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`Telegram bot webhook is running on port ${config.port}.`);
    console.log(`Health check: ${config.webhookUrl.replace(/\/$/, '')}/health`);
    console.log(`Telegram webhook URL: ${webhookUrl}`);

    bot.setWebHook(webhookUrl)
      .then(() => console.log('Telegram webhook is set.'))
      .catch((error) => console.error('Failed to set Telegram webhook:', error.message));
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
