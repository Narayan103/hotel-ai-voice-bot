import React from 'react';

function VoiceButton({ state, onclick, disabled }) {
    const config = {
        idle: {
            label: 'Tap to speak',
            icon: '🎤',
            className: 'voice-btn idle',
        },
        listenin: {
            label: 'listening... tap to stop',
            icon: '🎙️',
            className: 'voice-btn listening',
        },
        loading: {
            label: 'Processing...',
            icon: '⏳',
            className: 'voice-btn loading',
        },
    };
    const current = config[state] || config.idle;
    return(
        <div className="voice-button-wrapper">
            <button
                className={current.className}
                onclick={onclick}
                disabled={disabled || state === 'loading'}
                aria-label={current.label}
            >
                <span className="voice-btn-icon">{current.icon}</span>
                
                {state ==='listening' && <span className="pulse-ring" />}
            </button>
            <p className="voice-btn-label">{current.label}</p>
        </div>
    )
}
export default VoiceButton;