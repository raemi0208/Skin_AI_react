import React from 'react';

const NavBar = ({ onGoHome, onGoSkinNoteHistory, onUserIconClick, onGoContrast }) => {
    return (
        <header className="navbar-container">
            <div className="navbar-left" onClick={onGoHome}>
                <h1 className="logo-text">너의 피부는?</h1>
            </div>

            <nav className="navbar-right">
                <a
                    href="#home"
                    className="nav-link"
                    onClick={(e) => { e.preventDefault(); onGoHome(); }}
                >
                    HOME
                </a>

                <a
                    href="#skin-note-history"
                    className="nav-link"
                    onClick={(e) => { e.preventDefault(); onGoSkinNoteHistory(); }}
                >
                    SKIN NOTE
                </a>

                <a
                    href="#contrast"
                    className="nav-link"
                    onClick={(e) => { e.preventDefault(); onGoContrast(); }}
                >
                    CONTRAST
                </a>

                <div
                    className="user-icon"
                    onClick={onUserIconClick}
                    style={{ cursor: 'pointer' }}
                >
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
            </nav>
        </header>
    );
};

export default NavBar;
