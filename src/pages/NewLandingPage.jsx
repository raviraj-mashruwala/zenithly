import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet, TrendingUp, PieChart, Shield, BarChart3,
    Target, Zap, ArrowRight, Sparkles, CreditCard,
    Layers, ChevronRight, Check, LineChart, FolderKanban
} from 'lucide-react';
import AuthModal from '../components/auth/AuthModal';
import './NewLandingPage.css';

export default function NewLandingPage() {
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

    // Feature cards data
    const features = [
        {
            icon: CreditCard,
            title: 'Transaction Tracking',
            description: 'Every transaction logged with search, filters, and AI-powered auto-categorization for effortless organization.',
            visual: 'chat'
        },
        {
            icon: Layers,
            title: 'Multi-Wallet Dashboard',
            description: 'Connect all accounts—banks, cards, cash, investments—into one unified, elegant command center.',
            visual: 'orbit'
        },
        {
            icon: BarChart3,
            title: 'Financial Reports',
            description: 'Beautiful charts and analytics that transform complex data into clear, actionable insights.',
            visual: 'dashboard'
        }
    ];

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    return (
        <div className="new-landing-page">
            {/* Background Grid */}
            <div className="grid-bg" />

            {/* Ambient Orbs */}
            <div className="ambient-bg">
                <div className="ambient-orb orb-1" />
                <div className="ambient-orb orb-2" />
                <div className="ambient-orb orb-3" />
            </div>

            {/* Floating Navigation */}
            <motion.nav
                className="floating-nav"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className="nav-brand">
                    <div className="brand-icon-wrapper">
                        <Sparkles className="brand-icon" size={20} />
                    </div>
                    <span className="brand-name">Zenithly</span>
                </div>

                <div className="nav-links">
                    <a href="#features" className="nav-link">Features</a>
                    <a href="#testimonial" className="nav-link">Testimonials</a>
                </div>

                <button className="nav-cta" onClick={openSignup}>
                    Get Started
                    <ArrowRight size={14} />
                </button>
            </motion.nav>

            {/* Hero Section */}
            <main className="hero-main">
                {/* Left Column: Copy */}
                <motion.div
                    className="hero-copy"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    <motion.div className="status-badge" variants={fadeInUp}>
                        <span className="status-dot">
                            <span className="status-ping" />
                            <span className="status-core" />
                        </span>
                        <span className="status-text">System Operational</span>
                    </motion.div>

                    <motion.h1 className="hero-title" variants={fadeInUp}>
                        <span className="title-accent">Architect your wealth</span>
                        <br />
                        <span className="title-secondary">with absolute clarity.</span>
                    </motion.h1>

                    <motion.p className="hero-description" variants={fadeInUp}>
                        Advanced personal finance tools merged with intuitive design.
                        Track expenses, manage wallets, and gain insights to elevate your financial health.
                    </motion.p>

                    <motion.div className="hero-ctas" variants={fadeInUp}>
                        <button className="shiny-cta" onClick={openSignup}>
                            <span>Start Free Today</span>
                        </button>
                        <button className="secondary-cta" onClick={openLogin}>
                            <span>View Dashboard</span>
                            <ArrowRight size={14} />
                        </button>
                    </motion.div>
                </motion.div>

                {/* Right Column: Abstract Visualization */}
                <motion.div
                    className="hero-visual"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
                >
                    <svg className="beam-svg" viewBox="0 0 600 600">
                        <defs>
                            <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0" />
                                <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="1" />
                                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                            </linearGradient>
                            <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                            </radialGradient>
                        </defs>

                        {/* Connecting Beams */}
                        <g className="beam-group">
                            <path d="M -50 150 C 100 150, 100 300, 300 300" fill="none" stroke="var(--color-border-default)" strokeWidth="1" />
                            <path d="M -50 150 C 100 150, 100 300, 300 300" fill="none" stroke="url(#beam-gradient)" strokeWidth="1.5" className="beam-line beam-1" />
                        </g>
                        <g className="beam-group">
                            <path d="M -50 450 C 100 450, 100 300, 300 300" fill="none" stroke="var(--color-border-default)" strokeWidth="1" />
                            <path d="M -50 450 C 100 450, 100 300, 300 300" fill="none" stroke="url(#beam-gradient)" strokeWidth="1.5" className="beam-line beam-2" />
                        </g>
                        <g className="beam-group">
                            <path d="M 650 100 C 500 100, 500 300, 300 300" fill="none" stroke="var(--color-border-default)" strokeWidth="1" />
                            <path d="M 650 100 C 500 100, 500 300, 300 300" fill="none" stroke="url(#beam-gradient)" strokeWidth="1.5" className="beam-line beam-3" />
                        </g>
                        <g className="beam-group">
                            <path d="M 650 500 C 500 500, 500 300, 300 300" fill="none" stroke="var(--color-border-default)" strokeWidth="1" />
                            <path d="M 650 500 C 500 500, 500 300, 300 300" fill="none" stroke="url(#beam-gradient)" strokeWidth="1.5" className="beam-line beam-4" />
                        </g>

                        {/* Central Node */}
                        <g transform="translate(300, 300)">
                            <circle r="120" fill="url(#center-glow)" className="pulse-slow" />

                            {/* Sonar Waves */}
                            <circle r="20" fill="none" stroke="var(--color-accent)" strokeWidth="1" opacity="0.5" className="sonar-wave sonar-1" />
                            <circle r="20" fill="none" stroke="var(--color-accent)" strokeWidth="1" opacity="0.5" className="sonar-wave sonar-2" />
                            <circle r="20" fill="none" stroke="var(--color-accent)" strokeWidth="1" opacity="0.5" className="sonar-wave sonar-3" />

                            {/* Technical Rings */}
                            <circle r="65" fill="none" stroke="var(--color-text-muted)" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="10 20" className="spin-slow" />
                            <circle r="45" fill="none" stroke="var(--color-accent)" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="4 6" className="spin-slow-reverse" />

                            {/* Crosshair Markers */}
                            <g className="spin-very-slow">
                                <path d="M -80 0 L -70 0" stroke="var(--color-text-muted)" strokeOpacity="0.3" />
                                <path d="M 80 0 L 70 0" stroke="var(--color-text-muted)" strokeOpacity="0.3" />
                                <path d="M 0 -80 L 0 -70" stroke="var(--color-text-muted)" strokeOpacity="0.3" />
                                <path d="M 0 80 L 0 70" stroke="var(--color-text-muted)" strokeOpacity="0.3" />
                            </g>

                            {/* Core */}
                            <circle r="8" fill="var(--color-bg-base)" stroke="var(--color-accent)" strokeWidth="2" />
                            <circle r="4" fill="var(--color-accent)" className="pulse-fast" />
                        </g>
                    </svg>

                    {/* Floating Labels */}
                    <div className="floating-label label-top-left">
                        <span className="label-text">ZERO FRICTION</span>
                        <div className="label-line" />
                    </div>
                    <div className="floating-label label-bottom-right">
                        <span className="label-text">INSIGHTS DRIVEN</span>
                        <div className="label-line" />
                    </div>

                    {/* Data Decoration */}
                    <div className="data-dots">
                        <div className="dot" />
                        <div className="dot" />
                        <div className="dot accent pulse-fast" />
                    </div>
                </motion.div>

                {/* Social Proof */}
                <motion.section
                    className="social-proof"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <div className="marquee-container">
                        <div className="marquee-track">
                            {/* Stats instead of logos */}
                            <div className="proof-item">
                                <span className="proof-value">100%</span>
                                <span className="proof-label">Free Forever</span>
                            </div>
                            <div className="proof-item">
                                <span className="proof-value">∞</span>
                                <span className="proof-label">Unlimited Wallets</span>
                            </div>
                            <div className="proof-item">
                                <span className="proof-value">256-bit</span>
                                <span className="proof-label">Encryption</span>
                            </div>
                            <div className="proof-item">
                                <span className="proof-value">24/7</span>
                                <span className="proof-label">Cloud Sync</span>
                            </div>
                            {/* Duplicate for seamless loop */}
                            <div className="proof-item">
                                <span className="proof-value">100%</span>
                                <span className="proof-label">Free Forever</span>
                            </div>
                            <div className="proof-item">
                                <span className="proof-value">∞</span>
                                <span className="proof-label">Unlimited Wallets</span>
                            </div>
                            <div className="proof-item">
                                <span className="proof-value">256-bit</span>
                                <span className="proof-label">Encryption</span>
                            </div>
                            <div className="proof-item">
                                <span className="proof-value">24/7</span>
                                <span className="proof-label">Cloud Sync</span>
                            </div>
                        </div>
                    </div>
                    <div className="trusted-badge">
                        <span className="check-icon"><Check size={12} /></span>
                        <span>TRUSTED BY SMART SAVERS</span>
                    </div>
                </motion.section>
            </main>

            {/* Features Section */}
            <section className="features-section" id="features">
                <div className="section-line" />

                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="header-beam" />
                    <div className="section-badge">
                        <span className="badge-dot">
                            <span className="status-ping" />
                            <span className="status-core" />
                        </span>
                        <span>System Capabilities</span>
                    </div>
                    <h2 className="section-title">
                        Personal finance
                        <span className="title-muted"> made effortless.</span>
                    </h2>
                    <p className="section-description">
                        Streamline your money management with tools designed to simplify, automate, and enhance your financial clarity.
                    </p>
                </motion.div>

                <motion.div
                    className="features-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className={`feature-card spotlight-card ${index === 1 ? 'featured' : ''}`}
                            variants={fadeInUp}
                        >
                            <div className="spotlight-bg" />
                            <div className="spotlight-border" />

                            <div className="feature-header">
                                <div className="feature-icon-wrapper">
                                    <feature.icon size={20} />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                            </div>
                            <p className="feature-description">{feature.description}</p>

                            {/* Visual Preview */}
                            <div className="feature-visual">
                                {feature.visual === 'chat' && (
                                    <div className="visual-chat">
                                        <div className="chat-header">
                                            <div className="chat-dots">
                                                <span /><span />
                                            </div>
                                            <span className="chat-label">ZENITHLY_AI</span>
                                        </div>
                                        <div className="chat-body">
                                            <div className="chat-message user">
                                                <p>Categorize this as <span className="highlight">Groceries</span></p>
                                            </div>
                                            <div className="chat-message system">
                                                <div className="system-label">
                                                    <Sparkles size={12} />
                                                    <span>Auto-Categorized</span>
                                                </div>
                                                <p>Transaction linked to <span className="highlight-accent">Whole Foods • $127.50</span></p>
                                                <div className="progress-bar">
                                                    <div className="progress-fill" />
                                                </div>
                                                <div className="progress-meta">
                                                    <span>COMPLETED</span>
                                                    <span>GROCERIES</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {feature.visual === 'orbit' && (
                                    <div className="visual-orbit">
                                        <div className="orbit-ring ring-1" />
                                        <div className="orbit-ring ring-2" />
                                        <div className="orbit-ring ring-3 dashed" />
                                        <div className="orbit-ring ring-4 glow" />

                                        <div className="orbit-nodes">
                                            <div className="orbit-node node-1">
                                                <Wallet size={14} />
                                            </div>
                                            <div className="orbit-node node-2">
                                                <CreditCard size={14} />
                                            </div>
                                        </div>

                                        <div className="orbit-center">
                                            <Layers size={24} />
                                            <div className="scanner-sweep" />
                                            <div className="grid-pattern" />
                                        </div>

                                        <div className="network-status">
                                            <span className="status-dot">
                                                <span className="status-ping" />
                                                <span className="status-core" />
                                            </span>
                                            <span>4 Wallets Connected</span>
                                        </div>
                                    </div>
                                )}

                                {feature.visual === 'dashboard' && (
                                    <div className="visual-dashboard">
                                        <div className="dash-header">
                                            <div className="dash-status">
                                                <span className="status-indicator" />
                                                <span>Treasury_Main</span>
                                            </div>
                                            <div className="dash-avatars">
                                                <div className="avatar">JD</div>
                                                <div className="avatar accent">AS</div>
                                                <div className="avatar more">+3</div>
                                            </div>
                                        </div>

                                        <div className="dash-slider">
                                            <div className="slider-meta">
                                                <span>Monthly Budget</span>
                                                <span className="slider-value">75% Used</span>
                                            </div>
                                            <div className="slider-track">
                                                <div className="slider-fill" />
                                                <div className="slider-knob">
                                                    <div className="knob-tooltip">On Track</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="dash-actions">
                                            <div className="dash-action">
                                                <LineChart size={14} />
                                                <span>View Trends</span>
                                            </div>
                                            <div className="dash-action primary">
                                                <PieChart size={14} />
                                                <span>Reports</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Features CTA */}
                <motion.div
                    className="features-cta"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <button className="white-cta" onClick={openSignup}>
                        <span>Explore All Features</span>
                        <ArrowRight size={16} />
                    </button>
                </motion.div>
            </section>

            {/* Testimonial Section */}
            <section className="testimonial-section" id="testimonial">
                <div className="testimonial-grid">
                    <motion.div
                        className="testimonial-image"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="image-frame">
                            <div className="image-placeholder">
                                <Wallet size={48} />
                            </div>
                            <div className="image-overlay" />
                            <div className="image-ui">
                                <div className="ui-dots"><span /><span /></div>
                                <div className="ui-badge">LIVE</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="testimonial-content"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="quote-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017Z" />
                            </svg>
                        </div>
                        <blockquote className="testimonial-quote">
                            "I used to track my spending in spreadsheets, my investments in another app, and my budget nowhere.
                            Zenithly keeps it simple—I see the full picture without the cognitive load."
                        </blockquote>
                        <div className="testimonial-author">
                            <div className="author-line" />
                            <span>— A satisfied user</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="final-cta-section">
                <motion.div
                    className="final-cta-content"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="final-title">Ready to take control?</h2>
                    <p className="final-description">
                        Join those who've transformed their relationship with money.
                    </p>
                    <button className="shiny-cta large" onClick={openSignup}>
                        <span>Get Started Free</span>
                    </button>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Sparkles size={18} />
                        <span>Zenithly</span>
                    </div>
                    <div className="footer-info">
                        <span>© 2025</span>
                        <span className="divider">•</span>
                        <span>Made with purpose</span>
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
