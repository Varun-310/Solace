/**
 * About Page
 * Immersive storytelling layout — light only.
 */

import { ArrowLeft, Heart, Shield, Brain, MessageCircle, Sparkles, Cpu, Zap, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
    return (
        <div className="app-shell" style={{ background: 'var(--color-bg)', overflowY: 'auto' }}>
            {/* Header */}
            <header className="glass shrink-0 px-4 sm:px-6 flex items-center gap-3"
                style={{ height: '56px', borderBottom: '1px solid var(--color-border-light)' }}>
                <Link to="/" className="p-2 rounded-xl transition-colors hover:bg-black/5">
                    <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                </Link>
                <h1 className="font-medium" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                    About Solace
                </h1>
            </header>

            {/* Content */}
            <main className="px-4 sm:px-8 lg:px-16 py-8">
                {/* Hero */}
                <div className="text-center mb-14 animate-fade-in">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                        style={{ background: 'var(--color-primary-light)' }}>
                        <Heart className="w-10 h-10" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-semibold mb-3"
                        style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                        Solace
                    </h2>
                    <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
                        A compassionate mental health companion that truly understands how you feel
                    </p>
                </div>

                {/* Features */}
                <div className="grid sm:grid-cols-2 gap-4 mb-12">
                    <FeatureCard icon={Brain} title="Emotion Detection"
                        description="Recognizes 27 different emotions using advanced NLP to understand your emotional state."
                        bg="var(--color-primary-light)" fg="var(--color-primary)" />
                    <FeatureCard icon={MessageCircle} title="Contextual Memory"
                        description="Remembers your conversation history to provide coherent, personalized support."
                        bg="#FAECD5" fg="var(--color-user-msg)" />
                    <FeatureCard icon={Sparkles} title="Empathetic Responses"
                        description="Powered by local AI models that generate warm, understanding responses."
                        bg="#E0F2FE" fg="#0284C7" />
                    <FeatureCard icon={Shield} title="Privacy First"
                        description="Your conversations are encrypted. Even the admin cannot read your messages."
                        bg="#CCFBF1" fg="#0D9488" />
                </div>

                {/* Technology */}
                <section className="rounded-2xl p-5 sm:p-6 mb-8"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}>
                    <h3 className="text-base font-medium mb-4 flex items-center gap-2"
                        style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                        <Cpu className="w-4.5 h-4.5" style={{ color: 'var(--color-primary)' }} />
                        Technology
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <TechBadge icon="🧠" name="Gemma 3" desc="Local LLM" />
                        <TechBadge icon="💚" name="RoBERTa" desc="Emotion AI" />
                        <TechBadge icon="⚡" name="FastAPI" desc="Backend" />
                        <TechBadge icon="⚛️" name="React" desc="Frontend" />
                    </div>
                </section>

                {/* How It Works */}
                <section className="rounded-2xl p-5 sm:p-6 mb-8"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}>
                    <h3 className="text-base font-medium mb-4 flex items-center gap-2"
                        style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                        <Zap className="w-4.5 h-4.5" style={{ color: 'var(--color-primary)' }} />
                        How It Works
                    </h3>
                    <div className="space-y-4">
                        <Step number="1" title="Share Your Thoughts" desc="Type a message about how you're feeling" />
                        <Step number="2" title="Emotion Analysis" desc="AI detects your emotional state (hidden from view)" />
                        <Step number="3" title="Context Building" desc="Your message is added to conversation memory" />
                        <Step number="4" title="Empathetic Response" desc="AI generates a warm, understanding reply" />
                    </div>
                </section>

                {/* Privacy */}
                <section className="rounded-2xl p-5 sm:p-6 mb-8"
                    style={{ background: 'var(--color-primary-light)', border: '1px solid #B7E4C7' }}>
                    <h3 className="text-base font-medium mb-3 flex items-center gap-2"
                        style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary-hover)' }}>
                        <Lock className="w-4.5 h-4.5" />
                        Your Privacy Matters
                    </h3>
                    <ul className="space-y-2 text-sm" style={{ color: '#1B4332' }}>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
                            End-to-end encryption — messages unreadable in database
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
                            Even the admin cannot read your conversations
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
                            Sessions auto-expire after 24 hours
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
                            Open source and auditable
                        </li>
                    </ul>
                </section>

                {/* Disclaimer */}
                <section className="rounded-2xl p-5 sm:p-6 mb-8"
                    style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                    <h3 className="font-medium text-sm mb-2" style={{ color: '#92400E', fontFamily: 'var(--font-heading)' }}>
                        ⚠️ Important Notice
                    </h3>
                    <p className="text-sm mb-4" style={{ color: '#A16207' }}>
                        Solace is a supportive tool, not a replacement for professional mental health care.
                    </p>
                    <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)' }}>
                        <h4 className="font-medium text-xs mb-2" style={{ color: 'var(--color-text)' }}>Crisis Helplines (India)</h4>
                        <ul className="space-y-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            <li><strong>iCall:</strong> 9152987821 (Mon-Sat, 8am-10pm)</li>
                            <li><strong>Vandrevala Foundation:</strong> 1860-2662-345 (24/7)</li>
                            <li><strong>NIMHANS:</strong> 080-46110007</li>
                        </ul>
                    </div>
                </section>

                {/* Footer */}
                <div className="text-center text-xs pb-8" style={{ color: 'var(--color-text-muted)' }}>
                    <p>Built with ❤️ for mental health awareness</p>
                    <p className="mt-1">Version 2.0.0</p>
                </div>
            </main>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, description, bg, fg }) => (
    <div className="rounded-2xl p-5 transition-shadow hover:shadow-sm"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            style={{ background: bg, color: fg }}>
            <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-medium text-sm mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>{title}</h3>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
    </div>
);

const TechBadge = ({ icon, name, desc }) => (
    <div className="text-center p-3 rounded-xl transition-colors"
        style={{ background: 'var(--color-bg)' }}>
        <span className="text-xl">{icon}</span>
        <p className="font-medium text-xs mt-1" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>{name}</p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
    </div>
);

const Step = ({ number, title, desc }) => (
    <div className="flex gap-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center font-medium text-xs shrink-0"
            style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
            {number}
        </div>
        <div>
            <h4 className="font-medium text-sm" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>{title}</h4>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
        </div>
    </div>
);

export default About;
