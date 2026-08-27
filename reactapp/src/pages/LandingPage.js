import React from 'react';
import FoldText from '../components/FoldText';
import './LandingPage.css';

const LandingPage = ({ onGetStarted, onLogin }) => {
    return (
        <div className="landing-page">

            {/* Background decoration */}
            <div className="landing-glow landing-glow-one" />
            <div className="landing-glow landing-glow-two" />

            {/* Navigation */}
            <header className="landing-navbar">

                <div
                    className="landing-brand"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    }}
                >
                    <div className="landing-brand-icon">
                        <span>V</span>
                    </div>

                    <div>
                        <div className="landing-brand-name">
                            Vault
                        </div>

                        <div className="landing-brand-subtitle">
                            DIGITAL DOCUMENT VAULT
                        </div>
                    </div>
                </div>

                <button
                    className="landing-login-button"
                    onClick={onLogin}
                >
                    Sign In
                    <span>→</span>
                </button>

            </header>


            {/* Hero */}
            <main className="landing-hero">

                <div className="landing-eyebrow">
                    <span className="eyebrow-dot" />
                    SECURE • PRIVATE • ORGANIZED
                </div>


                <div className="landing-title">

                    <FoldText
                        text="Your Documents."
                        splitBy="char"
                        hinge="top"
                        trigger="mount"
                        duration={0.65}
                        stagger={0.045}
                        ease="power3.out"
                        perspective={700}
                        creaseShading={0.7}
                        fontSize="clamp(3rem, 8vw, 7rem)"
                        fontWeight={650}
                        color="#f7f2e8"
                    />

                    <br />

                    <span className="landing-title-accent">

                        <FoldText
                            text="Your Vault."
                            splitBy="char"
                            hinge="top"
                            trigger="mount"
                            duration={0.65}
                            stagger={0.06}
                            ease="power3.out"
                            perspective={700}
                            creaseShading={0.7}
                            fontSize="clamp(3rem, 8vw, 7rem)"
                            fontWeight={650}
                            color="#8fe3cf"
                        />

                    </span>

                </div>


                <p className="landing-description">
                    Store, protect, organize and access your important
                    documents from one secure digital vault.
                </p>


                {/* Actions */}
                <div className="landing-actions">

                    <button
                        className="landing-primary-button"
                        onClick={onGetStarted}
                    >
                        Create Your Vault
                        <span>↗</span>
                    </button>

                    <button
                        className="landing-secondary-button"
                        onClick={onLogin}
                    >
                        Sign In
                    </button>

                </div>


                {/* Feature indicators */}
                <div className="landing-features">

                    <div className="landing-feature">

                        <div className="feature-icon">
                            ⌁
                        </div>

                        <div>
                            <strong>Secure Storage</strong>
                            <span>Protected documents</span>
                        </div>

                    </div>


                    <div className="landing-feature">

                        <div className="feature-icon">
                            ⌕
                        </div>

                        <div>
                            <strong>Smart Search</strong>
                            <span>Find documents instantly</span>
                        </div>

                    </div>


                    <div className="landing-feature">

                        <div className="feature-icon">
                            ◈
                        </div>

                        <div>
                            <strong>Access Control</strong>
                            <span>Control who sees what</span>
                        </div>

                    </div>

                </div>

            </main>


            {/* Bottom status */}
            <footer className="landing-footer">

                <div>
                    <span className="status-dot" />
                    Your private document space
                </div>

                <div>
                    DIGITAL DOCUMENT VAULT
                </div>

            </footer>

        </div>
    );
};

export default LandingPage;