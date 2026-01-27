/**
 * Login/Register Component
 * Beautiful authentication form with smooth transitions.
 */

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

const AuthPage = ({ onSuccess }) => {
    const { login, register, error, clearError } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        displayName: ''
    });

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
            onSuccess?.();
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

    const toggleMode = () => {
        setIsLogin(!isLogin);
        clearError();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Solace</h1>
                    <p className="text-white/80">Your compassionate companion</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder={isLogin ? "Username or email" : "Username"}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 
                                         focus:border-purple-400 focus:ring-2 focus:ring-purple-100 
                                         outline-none transition-all"
                            />
                        </div>

                        {/* Email (Register only) */}
                        {!isLogin && (
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email address"
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 
                                             focus:border-purple-400 focus:ring-2 focus:ring-purple-100 
                                             outline-none transition-all"
                                />
                            </div>
                        )}

                        {/* Display Name (Register only) */}
                        {!isLogin && (
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    placeholder="Display name (optional)"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 
                                             focus:border-purple-400 focus:ring-2 focus:ring-purple-100 
                                             outline-none transition-all"
                                />
                            </div>
                        )}

                        {/* Password */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                required
                                minLength={6}
                                className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50 border border-gray-200 
                                         focus:border-purple-400 focus:ring-2 focus:ring-purple-100 
                                         outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 
                                     text-white font-medium flex items-center justify-center gap-2
                                     hover:shadow-lg hover:shadow-purple-200 transition-all
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={toggleMode}
                            className="text-gray-600 hover:text-purple-600 transition-colors"
                        >
                            {isLogin ? (
                                <>Don't have an account? <span className="font-medium">Sign up</span></>
                            ) : (
                                <>Already have an account? <span className="font-medium">Sign in</span></>
                            )}
                        </button>
                    </div>

                    {/* Skip for now */}
                    <div className="mt-4 text-center">
                        <button
                            onClick={onSuccess}
                            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Continue as guest
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
