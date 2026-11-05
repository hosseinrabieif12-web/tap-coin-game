import React, { useState, useEffect } from 'react';
import {
  Github,
  X,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Globe,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  Cloud,
} from 'lucide-react';
import { publishRepository, PublishResult, validateGitHubToken } from '../utils/githubPublisher';
import { triggerParticleBurst } from './ParticleCanvas';

interface GitHubPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GITHUB_TOKEN_STORAGE_KEY = 'tap_coin_github_token_cache';

export const GitHubPublishModal: React.FC<GitHubPublishModalProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState<string>('');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [rememberToken, setRememberToken] = useState<boolean>(true);
  const [repoName, setRepoName] = useState<string>('tap-coin-game');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);

  // Load saved token if user requested remembering
  useEffect(() => {
    if (isOpen) {
      const cached = localStorage.getItem(GITHUB_TOKEN_STORAGE_KEY);
      if (cached) {
        setToken(cached);
      }
      setError(null);
      setPublishResult(null);
      setIsLoading(false);
      setProgressPercent(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('لطفاً توکن گیت‌هاب (Personal Access Token) خود را وارد کنید.');
      return;
    }
    if (!repoName.trim()) {
      setError('لطفاً نام مخزن (Repository Name) را مشخص کنید.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPublishResult(null);
    setProgressPercent(10);
    setStatusMessage('در حال اتصال به گیت‌هاب...');

    try {
      if (rememberToken) {
        localStorage.setItem(GITHUB_TOKEN_STORAGE_KEY, token.trim());
      } else {
        localStorage.removeItem(GITHUB_TOKEN_STORAGE_KEY);
      }

      const result = await publishRepository(
        token,
        repoName,
        isPrivate,
        (msg, pct) => {
          setStatusMessage(msg);
          setProgressPercent(pct);
        }
      );

      setPublishResult(result);
      triggerParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 60, 'celebration');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطایی در انتشار به گیت‌هاب رخ داد.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0F141E] border border-amber-500/40 p-6 shadow-2xl gold-glow text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-slate-100">
                انتشار خودکار روی گیت‌هاب
              </h3>
              <p className="text-[11px] text-slate-400">
                Publish repository automatically to GitHub
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
        {publishResult ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-100">
                پروژه با موفقیت روی گیت‌هاب منتشر شد!
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                تمام فایل‌های پروژه، کانفیگ Vite، تصاویر و ریدمی روی مخزن شما آپلود شدند.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-amber-400 break-all">
              {publishResult.repoUrl}
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={publishResult.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
              >
                <Github className="w-4 h-4" />
                <span>مشاهده مخزن در گیت‌هاب (Open Repository)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://dash.cloudflare.com/?to=/:account/pages/new"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Cloud className="w-4 h-4 text-amber-400" />
                <span>اتصال به Cloudflare Pages (Deploy to Pages)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
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
          <form onSubmit={handlePublish} className="space-y-4 pt-4">
            {/* Error Alert */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Token Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>توکن گیت‌هاب (Personal Access Token)</span>
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=Tap+Coin+Publisher"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>ساخت توکن جدید</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 pr-10 text-xs font-mono rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-slate-100 placeholder:text-slate-600 disabled:opacity-50"
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
                توکن نیازمند دسترسی <code className="text-amber-300 font-mono">repo</code> جهت ایجاد مخزن و ارسال فایل‌ها است.
              </p>
            </div>

            {/* Repository Name & Visibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">
                  نام مخزن (Repository Name)
                </label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="tap-coin-game"
                  disabled={isLoading}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-slate-100 disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">
                  حالت مخزن (Visibility)
                </label>
                <div className="grid grid-cols-2 gap-2 h-[38px]">
                  <button
                    type="button"
                    onClick={() => setIsPrivate(false)}
                    disabled={isLoading}
                    className={`rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      !isPrivate
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>عمومی</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(true)}
                    disabled={isLoading}
                    className={`rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isPrivate
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>خصوصی</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-2.5 text-[11px] text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                توکن شما کاملاً امن و محلی است و مستقیماً توسط مرورگر به API رسمی گیت‌هاب (api.github.com) ارسال می‌شود. هیچ سرور واسطه‌ای وجود ندارد.
              </span>
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

            {/* Progress Bar (during publication) */}
            {isLoading && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-amber-300">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{statusMessage}</span>
                  </span>
                  <span className="font-mono text-slate-400">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>در حال انتشار روی گیت‌هاب...</span>
                </>
              ) : (
                <>
                  <Github className="w-4 h-4" />
                  <span>انتشار خودکار روی گیت‌هاب (Publish to GitHub)</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
