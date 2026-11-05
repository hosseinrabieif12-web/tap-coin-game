import React, { useState, useEffect } from 'react';
import {
  Send,
  X,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Key,
  Globe,
  Radio,
  Sparkles,
  Bot,
  HelpCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';
import { setupTelegramBot, SetupBotResult, getWebhookInfo, deleteWebhook } from '../utils/telegramApi';
import { triggerParticleBurst } from './ParticleCanvas';

interface TelegramBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TELEGRAM_TOKEN_STORAGE_KEY = 'tap_coin_telegram_token_cache';

export const TelegramBotModal: React.FC<TelegramBotModalProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState<string>('');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [rememberToken, setRememberToken] = useState<boolean>(true);
  const [gameUrl, setGameUrl] = useState<string>('');
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [enableWebhook, setEnableWebhook] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [setupResult, setSetupResult] = useState<SetupBotResult | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Auto-fill current origin or known domain
  useEffect(() => {
    if (isOpen) {
      const cached = localStorage.getItem(TELEGRAM_TOKEN_STORAGE_KEY);
      if (cached) {
        setToken(cached);
      }

      // Default game URL to current origin if https, or cloudflare pages
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      if (currentOrigin.startsWith('https://')) {
        setGameUrl(currentOrigin);
        setWebhookUrl(`${currentOrigin}/api/webhook`);
      } else {
        setGameUrl('https://tap-coin-game.pages.dev');
        setWebhookUrl('https://tap-coin-game.pages.dev/api/webhook');
      }

      setError(null);
      setSetupResult(null);
      setIsLoading(false);
      setProgressPercent(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('لطفاً توکن بات تلگرام خود را وارد کنید.');
      return;
    }
    if (!gameUrl.trim()) {
      setError('لطفاً آدرس اجرای بازی (Game URL) را وارد کنید.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSetupResult(null);
    setProgressPercent(10);
    setStatusMessage('در حال اتصال به تلگرام...');

    try {
      if (rememberToken) {
        localStorage.setItem(TELEGRAM_TOKEN_STORAGE_KEY, token.trim());
      } else {
        localStorage.removeItem(TELEGRAM_TOKEN_STORAGE_KEY);
      }

      const result = await setupTelegramBot({
        token,
        gameUrl,
        webhookUrl: enableWebhook ? webhookUrl : undefined,
        configureMenuButton: true,
        configureCommands: true,
        configureDescription: true,
        configureWebhook: enableWebhook,
        onProgress: (step, percent) => {
          setStatusMessage(step);
          setProgressPercent(percent);
        },
      });

      setSetupResult(result);
      triggerParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 60, 'celebration');
    } catch (err: unknown) {
      console.error('Telegram Bot Setup Error:', err);
      const message = err instanceof Error ? err.message : 'خطایی در اتصال به تلگرام رخ داد.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = (url: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0F141E] border border-amber-500/40 p-6 shadow-2xl gold-glow text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 border border-sky-400/40 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-slate-100">
                اتصال خودکار به بات تلگرام
              </h3>
              <p className="text-[11px] text-slate-400">
                Telegram Mini App & Webhook Auto-Configurator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {setupResult ? (
          <div className="py-5 text-center space-y-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-100">
                بازی با موفقیت به بات تلگرام متصل شد!
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                دکمه منوی بازی (Play TAP COIN) و دستورات روی بات <strong>@{setupResult.bot.username}</strong> فعال شدند.
              </p>
            </div>

            {/* Bot Details Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">نام بات:</span>
                <span className="font-bold text-slate-200">{setupResult.bot.first_name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">آیدی بات:</span>
                <span className="font-mono text-amber-400 font-bold">@{setupResult.bot.username}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">دکمه منوی تلگرام:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> فعال شد
                </span>
              </div>
              {setupResult.webhookConfigured && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">وضعیت وب‌هوک:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> فعال
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <a
                href={setupResult.botLink}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-98 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>اجرای بازی در تلگرام (Open in Telegram)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => handleCopyLink(setupResult.botLink)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                <span>{copiedLink ? 'لینک کپی شد!' : 'کپی لینک بات تلگرام'}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-200 underline pt-2 block mx-auto cursor-pointer"
            >
              بستن پنجره (Close)
            </button>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleConnect} className="space-y-4 pt-4">
            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Telegram Bot Token Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-sky-400" />
                  <span>توکن بات تلگرام (Bot Token)</span>
                </label>
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                >
                  <span>دریافت از @BotFather</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 pr-10 text-xs font-mono rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-slate-100 placeholder:text-slate-600 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                توکنی که توسط <strong>@BotFather</strong> پس از ساخت بات به شما داده شده است را اینجا وارد کنید.
              </p>
            </div>

            {/* Game Web App URL Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>آدرس وب‌اپلیکیشن بازی (Game Web App URL)</span>
              </label>
              <input
                type="url"
                value={gameUrl}
                onChange={(e) => setGameUrl(e.target.value)}
                placeholder="https://tap-coin-game.pages.dev"
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-slate-100 placeholder:text-slate-600 disabled:opacity-50"
              />
              <p className="text-[11px] text-slate-400">
                آدرس دامنه‌ای که بازی روی آن دیپلوی شده است (حتماً با <code>https://</code> شروع شود).
              </p>
            </div>

            {/* Optional Webhook Section */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableWebhook}
                  onChange={(e) => setEnableWebhook(e.target.checked)}
                  disabled={isLoading}
                  className="rounded border-slate-700 text-sky-500 focus:ring-sky-400 bg-slate-900"
                />
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-sky-400" />
                  <span>ثبت وب‌هوک اتوماتیک برای سرور (Set Webhook)</span>
                </span>
              </label>

              {enableWebhook && (
                <div className="pt-1.5 space-y-1 animate-[fadeIn_0.15s_ease-out]">
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-domain.com/api/webhook"
                    disabled={isLoading}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-700 focus:border-sky-400 text-slate-100"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    پیام‌های ورودی بات تلگرام به این آدرس وب‌هوک ارسال می‌شوند.
                  </span>
                </div>
              )}
            </div>

            {/* Remember Token Checkbox */}
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberToken}
                onChange={(e) => setRememberToken(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-900"
              />
              <span>ذخیره توکن در مرورگر برای دفعات بعد (Save in local storage)</span>
            </label>

            {/* Progress Bar (during setup) */}
            {isLoading && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-sky-300">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{statusMessage}</span>
                  </span>
                  <span className="font-mono text-slate-400">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-sky-400 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>در حال اتصال و تنظیم وب‌هوک...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>اتصال خودکار به بات تلگرام و ثبت وب‌هوک</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
