/**
 * Auth Page — Conversational Onboarding
 * An animated, conversation-style login/register experience.
 * Default mode: Register (Create Account). Users with existing accounts toggle to Login.
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const AuthPage = () => {
    const { login, register, googleLogin, error, clearError } = useAuth();
    const navigate = useNavigate();

    // Default to REGISTER mode
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(0);
    const [greeting, setGreeting] = useState('');
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        displayName: ''
    });

    const inputRefs = {
        username: useRef(null),
        email: useRef(null),
        password: useRef(null),
        displayName: useRef(null)
    };

    // Warm up the backend on page load (Render free tier sleeps after 15 min)
    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        fetch(`${apiUrl}/health`).catch(() => {});
    }, []);

    // Typewriter greeting animation
    useEffect(() => {
        const greetingText = "Welcome to Solace";
        let i = 0;
        const timer = setTimeout(() => {
            const interval = setInterval(() => {
                if (i <= greetingText.length) {
                    setGreeting(greetingText.slice(0, i));
                    i++;
                } else {
                    clearInterval(interval);
                    setTimeout(() => {
                        setStep(1);
                        setShowForm(true);
                    }, 400);
                }
            }, 50);
            return () => clearInterval(interval);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    // Focus input when step changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (step === 1) {
            setTimeout(() => inputRefs.username.current?.focus(), 300);
        } else if (step === 2 && !isLogin) {
            setTimeout(() => inputRefs.email.current?.focus(), 300);
        } else if ((step === 2 && isLogin) || step === 3) {
            setTimeout(() => inputRefs.password.current?.focus(), 300);
        }
    }, [step, isLogin]);

    const goHome = () => navigate('/');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        clearError();

        try {
            if (isLogin) {
                await login(formData.username, formData.password);
            } else {
                await register(
                    formData.username,
                    formData.email,
                    formData.password,
                    formData.displayName || formData.username
                );
            }
            navigate('/');
        } catch {
            // Error handled by auth hook
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleKeyDown = (e, nextStep) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            if (nextStep === 'submit') {
                handleSubmit(e);
            } else {
                setStep(nextStep);
            }
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setStep(1);
        clearError();
        setFormData({ username: '', email: '', password: '', displayName: '' });
    };

    const prompts = isLogin
        ? ["What's your username?", "Your secret passphrase?"]
        : ["Choose a username", "Your email address?", "Create a passphrase"];

    return (
        <div className="app-shell relative" style={{ background: 'var(--color-bg)' }}>
            {/* Ambient background shapes */}
            <div className="ambient-shape animate-float" style={{
                width: '300px', height: '300px', background: '#D8F3DC',
                top: '-50px', right: '-80px'
            }} />
            <div className="ambient-shape animate-float" style={{
                width: '250px', height: '250px', background: '#FFDDD2',
                bottom: '-60px', left: '-60px', animationDelay: '2s'
            }} />
            <div className="ambient-shape animate-float" style={{
                width: '200px', height: '200px', background: '#E9EDC9',
                top: '40%', left: '60%', animationDelay: '4s'
            }} />

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 overflow-y-auto">
                {/* Greeting */}
                <div className="text-center mb-8">
                    <p className="text-sm tracking-widest uppercase mb-4 animate-fade-in-slow"
                        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                        ✦ your compassionate companion
                    </p>
                    <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight"
                        style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                        {greeting}
                        {greeting.length < 17 && <span className="typewriter-cursor" />}
                    </h1>
                </div>

                {/* Conversational form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 animate-slide-up">
                        {/* Step 1: Username */}
                        {step >= 1 && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-medium mb-2"
                                    style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-heading)' }}>
                                    {prompts[0]}
                                </label>
                                <input
                                    ref={inputRefs.username}
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    onKeyDown={(e) => handleKeyDown(e, 2)}
                                    required
                                    autoComplete="username"
                                    className="w-full px-0 py-3 bg-transparent border-b-2 outline-none transition-colors text-lg"
                                    style={{
                                        borderColor: step === 1 ? 'var(--color-primary)' : 'var(--color-border)',
                                        fontFamily: 'var(--font-body)',
                                        color: 'var(--color-text)'
                                    }}
                                    placeholder="Type here..."
                                />
                            </div>
                        )}

                        {/* Step 2: Email (register only) or Password (login) */}
                        {step >= 2 && !isLogin && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-medium mb-2"
                                    style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-heading)' }}>
                                    {prompts[1]}
                                </label>
                                <input
                                    ref={inputRefs.email}
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onKeyDown={(e) => handleKeyDown(e, 3)}
                                    required
                                    autoComplete="email"
                                    className="w-full px-0 py-3 bg-transparent border-b-2 outline-none transition-colors text-lg"
                                    style={{
                                        borderColor: step === 2 ? 'var(--color-primary)' : 'var(--color-border)',
                                        fontFamily: 'var(--font-body)',
                                        color: 'var(--color-text)'
                                    }}
                                    placeholder="you@email.com"
                                />
                            </div>
                        )}

                        {/* Password step */}
                        {((isLogin && step >= 2) || (!isLogin && step >= 3)) && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-medium mb-2"
                                    style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-heading)' }}>
                                    {isLogin ? prompts[1] : prompts[2]}
                                </label>
                                <div className="relative">
                                    <input
                                        ref={inputRefs.password}
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onKeyDown={(e) => handleKeyDown(e, 'submit')}
                                        required
                                        minLength={6}
                                        autoComplete={isLogin ? "current-password" : "new-password"}
                                        className="w-full px-0 py-3 pr-10 bg-transparent border-b-2 outline-none transition-colors text-lg"
                                        style={{
                                            borderColor: 'var(--color-primary)',
                                            fontFamily: 'var(--font-body)',
                                            color: 'var(--color-text)'
                                        }}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 p-1"
                                        style={{ color: 'var(--color-text-muted)' }}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="px-4 py-3 rounded-lg text-sm animate-fade-in"
                                style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        {((isLogin && step >= 2) || (!isLogin && step >= 3)) && formData.password && (
                            <div className="animate-fade-in pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-2xl text-white font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: 'var(--color-primary)',
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '1.05rem'
                                    }}
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            {isLogin ? 'Enter Solace' : 'Begin Your Journey'}
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Google Sign-In — always visible */}
                        <div className="pt-2 animate-fade-in">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>or</span>
                                <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                            </div>

                            {GOOGLE_CLIENT_ID ? (
                                <GoogleSignInButton googleLogin={googleLogin} navigate={navigate} />
                            ) : (
                                <CustomGoogleButton googleLogin={googleLogin} navigate={navigate} />
                            )}
                        </div>

                        {/* Footer links */}
                        <div className="text-center space-y-3 pt-2">
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="text-sm transition-colors"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                {isLogin ? (
                                    <>First time here? <span style={{ color: 'var(--color-primary)' }} className="font-medium">Create an account</span></>
                                ) : (
                                    <>Already have an account? <span style={{ color: 'var(--color-primary)' }} className="font-medium">Sign in</span></>
                                )}
                            </button>

                            {isLogin && (
                                <div>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm transition-colors"
                                        style={{ color: 'var(--color-text-muted)' }}
                                    >
                                        Forgot your passphrase?
                                    </Link>
                                </div>
                            )}

                            <div>
                                <button
                                    type="button"
                                    onClick={goHome}
                                    className="text-xs transition-colors"
                                    style={{ color: 'var(--color-text-muted)' }}
                                >
                                    Continue as guest
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

/**
 * Google Sign-In Button (with GIS library)
 */
const GoogleSignInButton = ({ googleLogin, navigate }) => {
    const buttonRef = useRef(null);

    useEffect(() => {
        if (!window.google || !GOOGLE_CLIENT_ID) return;

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
                try {
                    await googleLogin(response.credential);
                    navigate('/');
                } catch (err) {
                    console.error('Google login failed:', err);
                }
            },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "pill",
            width: "400",
        });
    }, [googleLogin, navigate]);

    return <div ref={buttonRef} className="flex justify-center" />;
};

/**
 * Custom styled Google button (when GIS client ID is not set)
 * Shows a styled button that looks like Google Sign-In
 */
const CustomGoogleButton = ({ navigate }) => {
    const handleClick = () => {
        alert('Google Sign-In will be available once deployed.\nFor now, please create an account or sign in.');
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="w-full py-3.5 rounded-2xl border-2 font-medium flex items-center justify-center gap-3 transition-all hover:shadow-sm hover:bg-black/[0.02]"
            style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem'
            }}
        >
            {/* Google "G" logo */}
            <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
        </button>
    );
};

export default AuthPage;
