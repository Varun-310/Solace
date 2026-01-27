/**
 * About Page
 * Information about EmpathyAI.
 */

import { ArrowLeft, Heart, Shield, Brain, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
            {/* Header */}
            <header className="px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-purple-100">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <Link
                        to="/"
                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <h1 className="font-semibold text-gray-800">About EmpathyAI</h1>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-2xl mx-auto px-4 py-8">
                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <Heart className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">EmpathyAI</h2>
                    <p className="text-gray-600">A compassionate mental health companion</p>
                </div>

                {/* Features */}
                <div className="grid gap-6 mb-12">
                    <FeatureCard
                        icon={Brain}
                        title="Emotion-Aware"
                        description="Understands your emotional state through advanced NLP and adapts responses accordingly."
                    />
                    <FeatureCard
                        icon={MessageCircle}
                        title="Contextual Memory"
                        description="Remembers your conversation history to provide coherent and personalized support."
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Privacy-First"
                        description="All processing happens locally on your device. Your conversations never leave your computer."
                    />
                </div>

                {/* Disclaimer */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
                    <h3 className="font-semibold text-amber-800 mb-2">⚠️ Important Notice</h3>
                    <p className="text-sm text-amber-700">
                        EmpathyAI is a supportive tool, not a replacement for professional mental health care.
                        If you're experiencing a crisis, please contact a mental health professional or helpline.
                    </p>
                </div>

                {/* Helplines */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-4">Crisis Helplines</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li><strong>iCall:</strong> 9152987821 (Mon-Sat, 8am-10pm)</li>
                        <li><strong>Vandrevala Foundation:</strong> 1860-2662-345 (24/7)</li>
                        <li><strong>NIMHANS:</strong> 080-46110007</li>
                    </ul>
                </div>
            </main>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex gap-4">
        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-purple-600" />
        </div>
        <div>
            <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    </div>
);

export default About;
