/**
 * Forgot Password Page
 * Email OTP flow for password reset.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/auth';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('email'); // email | otp | newpass | done
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetToken, setResetToken] = useState('');

    const requestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Failed to send OTP');
            }
            setStep('otp');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Invalid OTP');
            }
            const data = await res.json();
            setResetToken(data.reset_token);
            setStep('newpass');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reset_token: resetToken, new_password: newPassword })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Reset failed');
            }
            setStep('done');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-shell relative" style={{ background: 'var(--color-bg)' }}>
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                {/* Back link */}
                <div className="absolute top-6 left-6">
                    <Link to="/auth" className="flex items-center gap-2 text-sm transition-colors"
                        style={{ color: 'var(--color-text-muted)' }}>
                        <ArrowLeft className="w-4 h-4" /> Back to login
                    </Link>
                </div>

                <div className="w-full max-w-md">
                    {step === 'email' && (
                        <form onSubmit={requestOtp} className="animate-slide-up">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                                style={{ background: 'var(--color-primary-light)' }}>
                                <Mail className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                                Reset your passphrase
                            </h1>
                            <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                                We'll send a code to your email address.
                            </p>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Your email address"
                                className="w-full px-0 py-3 bg-transparent border-b-2 outline-none text-lg mb-6"
                                style={{ borderColor: 'var(--color-primary)', fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}
                            />
                            {error && <p className="text-sm mb-4" style={{ color: 'var(--color-error)' }}>{error}</p>}
                            <button type="submit" disabled={loading}
                                className="w-full py-4 rounded-2xl text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                style={{ background: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Code'}
                            </button>
                        </form>
                    )}

                    {step === 'otp' && (
                        <form onSubmit={verifyOtp} className="animate-slide-up">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                                style={{ background: 'var(--color-primary-light)' }}>
                                <KeyRound className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                                Check your email
                            </h1>
                            <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                                Enter the 6-digit code we sent to <strong>{email}</strong>
                            </p>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                required
                                maxLength={6}
                                placeholder="000000"
                                className="w-full px-0 py-3 bg-transparent border-b-2 outline-none text-3xl text-center tracking-[0.5em] mb-6"
                                style={{ borderColor: 'var(--color-primary)', fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}
                            />
                            {error && <p className="text-sm mb-4" style={{ color: 'var(--color-error)' }}>{error}</p>}
                            <button type="submit" disabled={loading || otp.length < 6}
                                className="w-full py-4 rounded-2xl text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                style={{ background: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                            </button>
                        </form>
                    )}

                    {step === 'newpass' && (
                        <form onSubmit={resetPassword} className="animate-slide-up">
                            <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                                Create new passphrase
                            </h1>
                            <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                                Choose something you'll remember.
                            </p>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="New passphrase"
                                className="w-full px-0 py-3 bg-transparent border-b-2 outline-none text-lg mb-6"
                                style={{ borderColor: 'var(--color-primary)', fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}
                            />
                            {error && <p className="text-sm mb-4" style={{ color: 'var(--color-error)' }}>{error}</p>}
                            <button type="submit" disabled={loading}
                                className="w-full py-4 rounded-2xl text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                style={{ background: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Passphrase'}
                            </button>
                        </form>
                    )}

                    {step === 'done' && (
                        <div className="text-center animate-slide-up">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                                style={{ background: 'var(--color-primary-light)' }}>
                                <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                                All set!
                            </h1>
                            <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                                Your passphrase has been reset. You can now sign in.
                            </p>
                            <button
                                onClick={() => navigate('/auth')}
                                className="px-8 py-3 rounded-2xl text-white font-medium transition-all"
                                style={{ background: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}
                            >
                                Back to Sign In
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
