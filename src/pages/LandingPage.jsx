import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet, TrendingUp, PieChart, Shield, BarChart3,
    Target, Zap, Lock, ArrowRight, Terminal, Database,
    Layers, RefreshCw, MessageSquare, Settings
} from 'lucide-react';
import AuthModal from '../components/auth/AuthModal';
import './LandingPage.css';

export default function LandingPage() {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalTab, setAuthModalTab] = useState('login');

    const openLogin = () => {
        setAuthModalTab('login');
        setAuthModalOpen(true);
    };

    const openSignup = () => {
        setAuthModalTab('signup');
        setAuthModalOpen(true);
    };

    const features = [
        {
            icon: Wallet,
            title: 'Multi-Wallet System',
            description: 'Manage unlimited accounts: bank, credit, cash, UPI, investments. Track everything in one place.',
            status: 'ACTIVE'
        },
        {
            icon: Target,
            title: 'Smart Categories',
            description: 'Organize expenses and income with customizable categories and intelligent auto-classification.',
            status: 'ACTIVE'
        },
        {
            icon: Database,
            title: 'Transaction Log',
            description: 'Detailed tracking with search, filters, and export. Never lose sight of your money flow.',
            status: 'ACTIVE'
        },
        {
            icon: BarChart3,
            title: 'Visual Reports',
            description: 'Income analysis, expense breakdowns, and trend visualization with interactive charts.',
            status: 'ACTIVE'
        },
        {
            icon: TrendingUp,
            title: 'Dashboard Control',
            description: 'Real-time financial health overview with key metrics and actionable insights.',
            status: 'ACTIVE'
        },
        {
            icon: Shield,
            title: 'Secure Auth',
            description: 'Email/password + Google OAuth. Your data encrypted and protected with industry standards.',
            status: 'ACTIVE'
        }
    ];

    const capabilities = [
        { feature: 'User Authentication', spec: 'Email/Password + OAuth2', status: '✓' },
        { feature: 'Wallet Management', spec: 'CRUD + Balance Tracking', status: '✓' },
        { feature: 'Category System', spec: 'Custom + Icons', status: '✓' },
        { feature: 'Transaction Engine', spec: 'Real-time Logging', status: '✓' },
        { feature: 'Report Generation', spec: 'Charts + Analytics', status: '✓' },
        { feature: 'Data Persistence', spec: 'PostgreSQL + Supabase', status: '✓' },
        { feature: 'State Management', spec: 'Zustand Store', status: '✓' },
        { feature: 'UI Components', spec: 'Custom Design System', status: '✓' },
    ];

    return (
        <div className="landing-page">
            {/* Background Elements */}
            <div className="landing-bg-grid" />
            <div className="landing-bg-scanlines" />
            <div className="landing-bg-glow" />

            {/* Hero Section */}
            <motion.section
                className="hero-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="container">
                    <motion.div
                        className="hero-content"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        {/* Terminal Header */}
                        <div className="terminal-header">
                            <div className="terminal-dots">
                                <span className="dot red" />
                                <span className="dot amber" />
                                <span className="dot green" />
                            </div>
                            <div className="terminal-title">zenithly.sh</div>
                        </div>

                        {/* Logo */}
                        <h1 className="hero-logo">
                            <span className="logo-bracket">{'>'}</span>
                            ZENITH<span className="logo-accent">LY</span>
                            <span className="logo-cursor">_</span>
                        </h1>

                        {/* Headline */}
                        <h2 className="hero-headline">
                            Your Financial<br />
                            <span className="headline-highlight">Command Center</span>
                        </h2>

                        {/* Subheadline */}
                        <p className="hero-subheadline">
                            Track, analyze, and optimize your money with a modern personal finance
                            management system built for precision and clarity.
                        </p>

                        {/* CTA Buttons */}
                        <div className="hero-ctas">
                            <button className="cta-primary" onClick={openLogin}>
                                <Terminal size={18} />
                                <span>Launch Terminal</span>
                                <ArrowRight size={16} />
                            </button>
                            <button className="cta-secondary" onClick={openSignup}>
                                <Zap size={18} />
                                <span>Initialize System</span>
                            </button>
                        </div>

                        {/* Status Line */}
                        <div className="hero-status">
                            <span className="status-indicator" />
                            <span className="status-text">SYSTEM ONLINE</span>
                            <span className="status-divider">|</span>
                            <span className="status-text">v1.0.0</span>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Features Grid */}
            <section className="features-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="section-title">
                            <span className="title-bracket">[[</span>
                            CAPABILITIES
                            <span className="title-bracket">]]</span>
                        </h2>
                        <p className="section-subtitle">
                            Enterprise-grade features for personal finance management
                        </p>
                    </motion.div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="feature-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                whileHover={{ y: -4 }}
                            >
                                <div className="feature-header">
                                    <div className="feature-icon">
                                        <feature.icon size={24} />
                                    </div>
                                    <span className="feature-status">{feature.status}</span>
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                                <div className="feature-border" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Capabilities Matrix */}
            <section className="capabilities-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="section-title">
                            <span className="title-bracket">[[</span>
                            SYSTEM SPEC
                            <span className="title-bracket">]]</span>
                        </h2>
                    </motion.div>

                    <motion.div
                        className="capabilities-matrix"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="matrix-header">
                            <div className="matrix-col">MODULE</div>
                            <div className="matrix-col">SPECIFICATION</div>
                            <div className="matrix-col">STATUS</div>
                        </div>
                        {capabilities.map((cap, index) => (
                            <motion.div
                                key={index}
                                className="matrix-row"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05, duration: 0.4 }}
                            >
                                <div className="matrix-cell">{cap.feature}</div>
                                <div className="matrix-cell">{cap.spec}</div>
                                <div className="matrix-cell status-cell">
                                    <span className="status-check">{cap.status}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="cta-section">
                <div className="container">
                    <motion.div
                        className="cta-box"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="cta-content">
                            <h2 className="cta-title">Ready to take control?</h2>
                            <p className="cta-description">
                                Join users who've streamlined their financial management with Zenithly
                            </p>
                            <div className="cta-buttons">
                                <button className="cta-primary" onClick={openSignup}>
                                    <Zap size={18} />
                                    <span>Get Started</span>
                                    <ArrowRight size={16} />
                                </button>
                                <button className="cta-secondary" onClick={openLogin}>
                                    <Terminal size={18} />
                                    <span>Sign In</span>
                                </button>
                            </div>
                        </div>
                        <div className="cta-decoration" />
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="footer-logo">ZENITHLY</span>
                            <span className="footer-tagline">Financial Command Center</span>
                        </div>
                        <div className="footer-info">
                            <span>Built with React + Vite + Supabase</span>
                            <span className="footer-divider">•</span>
                            <span>MIT License</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Auth Modal */}
            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialTab={authModalTab}
            />
        </div>
    );
}
