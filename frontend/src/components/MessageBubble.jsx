// MessageBubble.jsx
// Renders ONE message in the conversation.
// Real-world concept: This is a "presentational" (or "dumb") component.
// It receives data via props and only renders UI.
// It has ZERO business logic — no API calls, no state changes.
// This separation makes components reusable and testable in isolation.

import React from 'react';

// Each message object has this shape:
// {
//   id: string,          — unique identifier (crypto.randomUUID())
//   role: 'user'|'bot',  — who sent it
//   text: string,        — the message content
//   timestamp: Date,     — when it was sent
//   intent: string|null  — what intent was detected (bot messages only)
// }

function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  // Format timestamp — e.g. "10:42 AM"
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    // The outer wrapper aligns the bubble left or right
    <div className={`message-wrapper ${isUser ? 'user' : 'bot'}`}>

      {/* Avatar — shows U for user, a hotel icon for bot */}
      <div className="message-avatar">
        {isUser ? '👤' : '🏨'}
      </div>

      <div className="message-content">
        {/* The actual chat bubble */}
        <div className={`message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
          <p className="message-text">{message.text}</p>
        </div>

        {/* Metadata row: timestamp + intent tag (for bot messages) */}
        <div className="message-meta">
          <span className="message-time">{time}</span>

          {/* 
            Intent tag — only shown on bot messages when intent is detected.
            Real-world concept: This is "explainability" — 
            showing users WHY the bot said what it said.
            Enterprise chatbots always surface this for debugging.
          */}
          {!isUser && message.intent && (
            <span className="intent-tag">
              {intentLabel(message.intent)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Maps internal intent keys to human-readable labels.
// Keeps display logic OUT of the data layer.
function intentLabel(intent) {
  const labels = {
    book_room:          '📅 Booking',
    check_availability: '🔍 Availability',
    ask_price:          '💰 Pricing',
    check_amenities:    '🏊 Amenities',
    general_query:      '💬 General',
    greeting:           '👋 Greeting',
    unknown:            '❓ Unknown',
  };
  return labels[intent] || intent;
}

export default MessageBubble;