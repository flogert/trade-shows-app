'use client';

import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CircleUserRound, Eye, EyeOff, KeyRound, LockKeyhole, Mail, User } from 'lucide-react';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '../lib/supabase';
import { TEAM_MEMBERS } from '../types';
import { useFormStore } from '../store/formStore';

export default function AuthScreen() {
  const {
    authError,
    authMode,
    authNotice,
    completePasswordSetup,
    enterPasswordSetupMode,
    signInWithPassword,
    signUpWithPassword,
  } = useFormStore();
  const [salespersonId, setSalespersonId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [recoveryEmail, setRecoveryEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      if (authMode !== 'setup-password' || !isSupabaseConfigured()) {
        if (active) {
          setRecoveryEmail(null);
        }
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const sessionEmail = data.session?.user.email?.trim().toLowerCase() ?? null;

      if (!active) {
        return;
      }

      setRecoveryEmail(sessionEmail);

      if (!sessionEmail) {
        return;
      }

      setEmail((currentEmail) => currentEmail || sessionEmail);

      const selectedMember = TEAM_MEMBERS.find((member) => member.email.toLowerCase() === sessionEmail);
      if (selectedMember) {
        setSalespersonId((currentId) => currentId || selectedMember.id);
      }
    })();

    return () => {
      active = false;
    };
  }, [authMode]);

  const validateSelectedMember = () => {
    const normalizedEmail = email.trim().toLowerCase();
    const selectedMember = TEAM_MEMBERS.find((member) => member.id === salespersonId);

    if (!selectedMember) {
      return { error: 'Choose your name before continuing.' };
    }

    if (selectedMember.email.toLowerCase() !== normalizedEmail) {
      return { error: `The email for ${selectedMember.name} must be ${selectedMember.email}.` };
    }

    return { normalizedEmail };
  };

  const handlePasswordMode = () => {
    setNotice(null);
    setLocalError(null);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    enterPasswordSetupMode(email || null);
  };

  const handleSignInMode = () => {
    setNotice(null);
    setLocalError(null);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    useFormStore.setState({
      authMode: 'sign-in',
      authError: null,
      authNotice: null,
      authStatus: 'unauthenticated',
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setNotice(null);
    setLocalError(null);

    const { error: memberError, normalizedEmail } = validateSelectedMember();

    if (memberError || !normalizedEmail) {
      setLocalError(memberError ?? 'Choose a valid authorized email before continuing.');
      setSubmitting(false);
      return;
    }

    if (!password.trim()) {
      setLocalError('Enter your password to continue.');
      setSubmitting(false);
      return;
    }

    if (authMode === 'setup-password') {
      if (password.length < 8) {
        setLocalError('Use at least 8 characters for your password.');
        setSubmitting(false);
        return;
      }

      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        setSubmitting(false);
        return;
      }
    }

    let result: { ok: boolean; error?: string };

    if (authMode === 'setup-password') {
      if (recoveryEmail) {
        if (recoveryEmail !== normalizedEmail) {
          setLocalError(`Finish password setup for ${recoveryEmail} or restart the recovery flow.`);
          setSubmitting(false);
          return;
        }

        result = await completePasswordSetup(password);
      } else {
        result = await signUpWithPassword(normalizedEmail, password);
      }
    } else {
      result = await signInWithPassword(normalizedEmail, password);
    }

    if (result.ok) {
      if (authMode === 'setup-password') {
        setNotice(recoveryEmail ? 'Password updated. Loading your workspace...' : `Password created for ${normalizedEmail}.`);
      } else {
        setNotice(`Signed in as ${normalizedEmail}.`);
      }
    }

    setSubmitting(false);
  };

  const setupMode = authMode === 'setup-password';

  return (
    <main className="min-h-dvh bg-linear-to-br from-slate-950 via-indigo-950 to-fuchsia-900 px-3 py-4 text-white sm:px-4 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-sm items-center justify-center sm:min-h-[calc(100dvh-4rem)] sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="w-full rounded-[1.4rem] border border-white/12 bg-white p-3.5 text-slate-900 shadow-xl sm:rounded-[1.75rem] sm:p-6"
        >
          <div className="mb-3 flex items-start justify-between gap-3 sm:mb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600">Trade Shows Hub</p>
              <h1 id="auth-title" className="mt-1 text-base font-semibold sm:text-xl">{setupMode ? 'Set your password' : 'Sign in'}</h1>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg sm:h-12 sm:w-12">
              <CircleUserRound className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3" aria-labelledby="auth-title">
              <label className="block text-sm font-medium text-slate-700" htmlFor="signin-name">
                Your name
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                <User className="h-4.5 w-4.5 text-slate-400" />
                <select
                  id="signin-name"
                  required
                  value={salespersonId}
                  onChange={(event) => {
                    const nextId = event.target.value;
                    const selectedMember = TEAM_MEMBERS.find((member) => member.id === nextId);
                    setSalespersonId(nextId);
                    setEmail(selectedMember?.email ?? '');
                  }}
                  className="w-full border-0 bg-transparent text-sm outline-none"
                >
                  <option value="">Select your name...</option>
                  {TEAM_MEMBERS.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className="block text-sm font-medium text-slate-700" htmlFor="signin-email">
                Work email
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                <Mail className="h-4.5 w-4.5 text-slate-400" />
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="amanda.s@safagoods.com"
                  aria-describedby={localError || authError ? 'auth-feedback' : undefined}
                  className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="signin-password">
                {setupMode ? 'Password' : 'Supabase password'}
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                <LockKeyhole className="h-4.5 w-4.5 text-slate-400" />
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={setupMode ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={setupMode ? 'Create a password' : 'Enter your password'}
                  aria-describedby={localError || authError ? 'auth-feedback' : undefined}
                  className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="text-slate-400 transition hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {setupMode && (
                <>
                  <label className="block text-sm font-medium text-slate-700" htmlFor="signin-confirm-password">
                    Confirm password
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                    <KeyRound className="h-4.5 w-4.5 text-slate-400" />
                    <input
                      id="signin-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Re-enter your password"
                      aria-describedby={localError || authError ? 'auth-feedback' : undefined}
                      className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="text-slate-400 transition hover:text-slate-600"
                      aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                      aria-pressed={showConfirmPassword}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </>
              )}

              {(notice || authNotice) && (
                <div id="auth-notice" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" aria-live="polite">
                  {notice ?? authNotice}
                </div>
              )}

              {(localError || authError) && (
                <div id="auth-feedback" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" aria-live="assertive">
                  {localError ?? authError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? setupMode
                    ? 'Saving password...'
                    : 'Signing in...'
                  : setupMode
                    ? 'Create password'
                    : 'Sign in'}
              </button>

              <button
                type="button"
                onClick={setupMode ? handleSignInMode : handlePasswordMode}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {setupMode ? 'Back to sign in' : 'Set up password'}
              </button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}