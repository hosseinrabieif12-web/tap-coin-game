// Telegram Bot API Integration & Automated Webhook/Mini App Configurator

export interface TelegramBotInfo {
  id: number;
  first_name: string;
  username: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
}

export interface WebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  last_error_date?: number;
  last_error_message?: string;
}

export interface SetupBotResult {
  bot: TelegramBotInfo;
  menuButtonConfigured: boolean;
  commandsConfigured: boolean;
  descriptionConfigured: boolean;
  webhookConfigured: boolean;
  webhookInfo?: WebhookInfo;
  botLink: string;
}

export const cleanBotToken = (token: string): string => {
  return token.trim().replace(/^bot/i, '');
};

export const validateTelegramToken = async (token: string): Promise<TelegramBotInfo> => {
  const clean = cleanBotToken(token);
  if (!clean) {
    throw new Error('لطفاً توکن بات تلگرام را وارد کنید.');
  }

  if (!/^[0-9]+:[a-zA-Z0-9_-]+$/.test(clean)) {
    throw new Error('فرمت توکن نامعتبر است. فرمت صحیح: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ');
  }

  const res = await fetch(`https://api.telegram.org/bot${clean}/getMe`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.ok) {
    throw new Error(data.description || 'توکن بات تلگرام نامعتبر است یا توسط تلگرام تایید نشد.');
  }

  return data.result as TelegramBotInfo;
};

export interface SetupBotParams {
  token: string;
  gameUrl: string;
  webhookUrl?: string;
  configureMenuButton?: boolean;
  configureCommands?: boolean;
  configureDescription?: boolean;
  configureWebhook?: boolean;
  onProgress?: (step: string, percent: number) => void;
}

export const setupTelegramBot = async ({
  token,
  gameUrl,
  webhookUrl,
  configureMenuButton = true,
  configureCommands = true,
  configureDescription = true,
  configureWebhook = false,
  onProgress,
}: SetupBotParams): Promise<SetupBotResult> => {
  const clean = cleanBotToken(token);
  const cleanGameUrl = gameUrl.trim();

  if (!cleanGameUrl.startsWith('https://')) {
    throw new Error('آدرس وب‌اپلیکیشن (Game URL) باید حتماً با پروتکل امن https:// آغاز شود.');
  }

  // 1. Verify Bot Token
  onProgress?.('در حال اعتبارسنجی بات تلگرام...', 20);
  const bot = await validateTelegramToken(clean);

  let menuButtonConfigured = false;
  let commandsConfigured = false;
  let descriptionConfigured = false;
  let webhookConfigured = false;
  let webhookInfoResult: WebhookInfo | undefined = undefined;

  // 2. Configure Web App Menu Button (Allows launching game with 1 click in Telegram)
  if (configureMenuButton) {
    onProgress?.('در حال تنظیم دکمه منوی وب‌اپلیکیشن (Menu Button)...', 40);
    const menuRes = await fetch(`https://api.telegram.org/bot${clean}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: '🪙 Play TAP COIN',
          web_app: {
            url: cleanGameUrl,
          },
        },
      }),
    });
    const menuData = await menuRes.json().catch(() => ({}));
    if (menuData.ok) {
      menuButtonConfigured = true;
    }
  }

  // 3. Configure Bot Commands (/start and /play)
  if (configureCommands) {
    onProgress?.('در حال ثبت دستورات بات (/play و /start)...', 60);
    const cmdRes = await fetch(`https://api.telegram.org/bot${clean}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: [
          { command: 'play', description: '🪙 Play TAP COIN Web Game' },
          { command: 'start', description: 'Launch TAP COIN Miner' },
        ],
      }),
    });
    const cmdData = await cmdRes.json().catch(() => ({}));
    if (cmdData.ok) {
      commandsConfigured = true;
    }
  }

  // 4. Configure Bot Description
  if (configureDescription) {
    onProgress?.('در حال تنظیم توضیحات بات در تلگرام...', 75);
    await fetch(`https://api.telegram.org/bot${clean}/setMyDescription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description:
          '🪙 Welcome to TAP COIN!\n\nMine gold coins, upgrade your multi-tap power, unlock autonomous bots, and compete for top ranks.\n\nTap "Play TAP COIN" button below to start mining!',
      }),
    }).catch(() => {});

    await fetch(`https://api.telegram.org/bot${clean}/setMyShortDescription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        short_description: '🪙 Play TAP COIN - Mine gold and earn passive income!',
      }),
    }).catch(() => {});
    descriptionConfigured = true;
  }

  // 5. Configure Webhook if requested
  if (configureWebhook && webhookUrl?.trim()) {
    const cleanWebhook = webhookUrl.trim();
    if (!cleanWebhook.startsWith('https://')) {
      throw new Error('آدرس وب‌هوک باید با https:// آغاز شود.');
    }

    onProgress?.('در حال تنظیم وب‌هوک اتوماتیک...', 90);
    const webhookRes = await fetch(`https://api.telegram.org/bot${clean}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: cleanWebhook,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true,
      }),
    });

    const webhookData = await webhookRes.json().catch(() => ({}));
    if (!webhookData.ok) {
      throw new Error(webhookData.description || 'تنظیم وب‌هوک تلگرام با خطا مواجه شد.');
    }
    webhookConfigured = true;

    // Check webhook info
    const infoRes = await fetch(`https://api.telegram.org/bot${clean}/getWebhookInfo`);
    const infoData = await infoRes.json().catch(() => ({}));
    if (infoData.ok) {
      webhookInfoResult = infoData.result;
    }
  }

  onProgress?.('بات با موفقیت به بازی متصل شد!', 100);

  return {
    bot,
    menuButtonConfigured,
    commandsConfigured,
    descriptionConfigured,
    webhookConfigured,
    webhookInfo: webhookInfoResult,
    botLink: `https://t.me/${bot.username}`,
  };
};

export const getWebhookInfo = async (token: string): Promise<WebhookInfo> => {
  const clean = cleanBotToken(token);
  const res = await fetch(`https://api.telegram.org/bot${clean}/getWebhookInfo`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.description || 'خطا در دریافت اطلاعات وب‌هوک');
  }
  return data.result as WebhookInfo;
};

export const deleteWebhook = async (token: string): Promise<boolean> => {
  const clean = cleanBotToken(token);
  const res = await fetch(`https://api.telegram.org/bot${clean}/deleteWebhook?drop_pending_updates=true`);
  const data = await res.json().catch(() => ({}));
  return !!data.ok;
};
