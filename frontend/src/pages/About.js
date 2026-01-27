/**
 * About Page
 * Rich information about Solace with features, technology, and privacy info.
 */

import { ArrowLeft, Heart, Shield, Brain, MessageCircle, Sparkles, Cpu, Zap, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
            {/* Header */}
            <header className="px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-purple-100">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <Link
                        to="/"
                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <h1 className="font-semibold text-gray-800">About Solace</h1>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-4 py-8">
                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-200">
                        <Heart className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                        Solace
                    </h2>
                    <p className="text-xl text-gray-600 max-w-md mx-auto">
                        A compassionate mental health companion that truly understands how you feel
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-12">
                    <FeatureCard
                        icon={Brain}
                        title="Emotion Detection"
                        description="Recognizes 27 different emotions using advanced NLP to understand your emotional state."
                        color="from-purple-500 to-indigo-500"
                    />
                    <FeatureCard
                        icon={MessageCircle}
                        title="Contextual Memory"
                        description="Remembers your conversation history to provide coherent, personalized support."
                        color="from-pink-500 to-rose-500"
                    />
                    <FeatureCard
                        icon={Sparkles}
                        title="Empathetic Responses"
                        description="Powered by local AI models that generate warm, understanding responses."
                        color="from-amber-500 to-orange-500"
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Privacy First"
                        description="All processing happens locally. Your conversations never leave your device."
                        color="from-emerald-500 to-teal-500"
                    />
                </div>

                {/* Technology Section */}
                <section className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-purple-500" />
                        Technology
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <TechBadge icon="🧠" name="Gemma 3" desc="Local LLM" />
                        <TechBadge icon="💜" name="RoBERTa" desc="Emotion AI" />
                        <TechBadge icon="⚡" name="FastAPI" desc="Backend" />
                        <TechBadge icon="⚛️" name="React" desc="Frontend" />
                    </div>
                </section>

                {/* How It Works */}
                <section className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-500" />
                        How It Works
                    </h3>

                    <div className="space-y-4">
                        <Step number="1" title="Share Your Thoughts" desc="Type a message about how you're feeling" />
                        <Step number="2" title="Emotion Analysis" desc="AI detects your emotional state (hidden from view)" />
                        <Step number="3" title="Context Building" desc="Your message is added to conversation memory" />
                        <Step number="4" title="Empathetic Response" desc="AI generates a warm, understanding reply" />
                    </div>
                </section>

                {/* Privacy Section */}
                <section className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white mb-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Your Privacy Matters
                    </h3>
                    <ul className="space-y-2 text-emerald-50">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                            100% local processing - no cloud services
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                            No API keys or external data sharing
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                            Sessions auto-expire after 24 hours
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                            Open source and auditable
                        </li>
                    </ul>
                </section>

                {/* Disclaimer */}
                <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
                    <h3 className="font-semibold text-amber-800 mb-2">⚠️ Important Notice</h3>
                    <p className="text-amber-700 mb-4">
                        Solace is a supportive tool, not a replacement for professional mental health care.
                        If you're experiencing a crisis, please contact a professional.
                    </p>

                    <div className="bg-white rounded-xl p-4">
                        <h4 className="font-medium text-gray-800 mb-2">Crisis Helplines (India)</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                            <li><strong>iCall:</strong> 9152987821 (Mon-Sat, 8am-10pm)</li>
                            <li><strong>Vandrevala Foundation:</strong> 1860-2662-345 (24/7)</li>
                            <li><strong>NIMHANS:</strong> 080-46110007</li>
                        </ul>
                    </div>
                </section>

                {/* Footer */}
                <div className="text-center text-gray-500 text-sm">
                    <p>Built with ❤️ for mental health awareness</p>
                    <p className="mt-1">Version 2.0.0</p>
                </div>
            </main>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, description, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
    </div>
);

const TechBadge = ({ icon, name, desc }) => (
    <div className="text-center p-3 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors">
        <span className="text-2xl">{icon}</span>
        <p className="font-medium text-gray-800 text-sm mt-1">{name}</p>
        <p className="text-xs text-gray-500">{desc}</p>
    </div>
);

const Step = ({ number, title, desc }) => (
    <div className="flex gap-4">
        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {number}
        </div>
        <div>
            <h4 className="font-medium text-gray-800">{title}</h4>
            <p className="text-sm text-gray-500">{desc}</p>
        </div>
    </div>
);

export default About;
