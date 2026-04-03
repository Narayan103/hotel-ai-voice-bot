import React from 'react';
function TypingInicator() {
    return (
        <div className="message-wrapper bot">
            <div className="message-avatar">🏨</div>
            <div className="message-content">
                <div className="meaage-bubble bot-bubble typing-bubble">

                    <span className="dot" style={{ animationDelay: '0ms'}} />
                    <span className="dot" style={{ animationDelay: '150ms' }} />
                    <span className="dot" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}
export default TypingInicator;