import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/Router';
import { useAuth, PRIMARY_ADMIN_EMAIL } from '../context/AuthContext';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Globe,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { navigate } = useRouter();
  const { currentUser, isAdmin, loading, loginWithGoogle, loginWithEmail, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  useEffect(() => {
    if (!loading && currentUser && isAdmin) {
      navigate('/admin');
    }
  }, [currentUser, isAdmin, loading, navigate]);

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseSettingsUrl = 'https://console.firebase.google.com/project/ecommerce-978b5/authentication/settings';

  const handleCopyDomain = async () => {
    if (!currentDomain) return;
    try {
      await navigator.clipboard.writeText(currentDomain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setLocalError(null);
    clearError();
    try {
      await loginWithGoogle();
      navigate('/admin');
    } catch (err: any) {
      const msg = err?.message || '';
      if (err?.code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        setLocalError(
          `Unauthorized Domain: The current domain "${currentDomain}" must be added to Authorized domains in your Firebase Console project (ecommerce-978b5).`
        );
      } else {
        setLocalError(msg || 'Google sign-in could not be completed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }
    setIsSubmitting(true);
    setLocalError(null);
    clearError();
    try {
      await loginWithEmail(email.trim(), password);
      navigate('/admin');
    } catch (err: any) {
      setLocalError(err?.message || 'Invalid administrator credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = localError || error;
  const isUnauthorizedDomain = Boolean(
    activeError &&
      (activeError.toLowerCase().includes('unauthorized-domain') ||
        activeError.toLowerCase().includes('unauthorized domain'))
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 bg-[#1E1B18] text-[#D4AF37] mx-auto rounded-sm border border-[#3A332C] flex items-center justify-center shadow-md mb-4">
          <Shield className="w-7 h-7" />
        </div>
        <span className="text-[11px] font-sans tracking-[0.25em] text-[#8C6D3B] uppercase font-semibold">
          KHAN&SON'S PRINTER & PACKAGES
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#1E1B18] mt-1">
          Administrator Portal
        </h1>
        <p className="text-xs text-[#6B6357] mt-2 max-w-xs mx-auto">
          Authorized management panel for products, categories, settings, and customer inquiries.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 border border-[#E8E2D8] shadow-sm rounded-sm">
          {/* Specific Domain Authorization Guide Banner */}
          {isUnauthorizedDomain ? (
            <div className="mb-6 p-4 bg-amber-50/80 border border-amber-300 rounded-xs text-xs text-[#5C4516] space-y-3">
              <div className="flex items-start gap-2.5">
                <Globe className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 text-sm">
                    Domain Authorization Required in Firebase Console
                  </h3>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Google Sign-In restricts logins to pre-approved domains for project{' '}
                    <code className="px-1 py-0.5 bg-amber-100 font-mono text-[11px] rounded text-amber-900">
                      ecommerce-978b5
                    </code>
                    . Add this domain to enable Google authentication:
                  </p>
                </div>
              </div>

              {/* Current Domain Box & Copy Button */}
              <div className="bg-white p-2.5 border border-amber-200 rounded flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-[#1E1B18] truncate select-all">
                  {currentDomain}
                </span>
                <button
                  type="button"
                  onClick={handleCopyDomain}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium text-xs rounded transition-colors shrink-0"
                >
                  {copiedDomain ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-700" />
                      <span className="text-green-800">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Domain</span>
                    </>
                  )}
                </button>
              </div>

              {/* Step-by-Step Instructions */}
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-900/90 pl-1 leading-relaxed">
                <li>
                  Go to{' '}
                  <a
                    href={firebaseSettingsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline text-amber-950 inline-flex items-center gap-0.5 hover:text-black"
                  >
                    <span>Firebase Console → Auth Settings</span>
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>Scroll down to <strong>Authorized domains</strong> and click <strong>Add domain</strong>.</li>
                <li>
                  Paste <code className="bg-amber-100 px-1 py-0.2 rounded font-mono text-[10px]">{currentDomain}</code> (also add <code>khanandsons.netlify.app</code>).
                </li>
                <li>Click <strong>Save</strong> and retry <strong>Sign In with Authorized Google Account</strong>.</li>
              </ol>

              <div className="pt-2 border-t border-amber-200/60 text-[11px] text-amber-800">
                💡 <em>Alternative:</em> You can also sign in below immediately using your Administrator Email and Password without waiting for domain authorization.
              </div>
            </div>
          ) : activeError ? (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 rounded-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{activeError}</span>
            </div>
          ) : null}

          {/* Primary Quick Sign In: Google Single Click */}
          <div className="space-y-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-[#C2B7A5] bg-[#FAF7F2] hover:bg-[#EFE9DF] text-xs font-semibold text-[#1E1B18] uppercase tracking-wider rounded-xs transition-colors shadow-2xs disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSubmitting ? 'Verifying...' : 'Sign In with Authorized Google Account'}</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8E2D8]"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-[#8A8275] tracking-widest text-[10px]">
                  Or Sign In with Email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A8275] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={PRIMARY_ADMIN_EMAIL}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A8275] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8275] hover:text-[#1E1B18]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#1E1B18] hover:bg-[#2C2723] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In as Administrator'}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F0ECE4] text-center">
            <span className="text-[11px] text-[#7A7266] block">
              Configured Authorized Email: <strong>{PRIMARY_ADMIN_EMAIL}</strong>
            </span>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1 text-xs text-[#8C6D3B] hover:text-[#1E1B18] font-medium mt-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Storefront</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
