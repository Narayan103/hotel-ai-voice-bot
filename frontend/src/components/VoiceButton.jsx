// VoiceButton.jsx
// Updated to work with the new RECORDER_STATES from useAudioRecorder.
// Displays recording duration and state-appropriate UI.

import React from 'react';
import { RECORDER_STATES } from '../hooks/useAudioRecorder';

function VoiceButton({ recorderState, onClick, recordingDuration }) {

  // Map each state to its visual configuration.
  // This is a lookup table pattern — cleaner than a chain of if/else.
  const config = {
    [RECORDER_STATES.IDLE]: {
      label:     'Tap to speak',
      icon:      '🎤',
      className: 'voice-btn idle',
      showPulse: false,
    },
    [RECORDER_STATES.REQUESTING]: {
      label:     'Requesting mic...',
      icon:      '⏳',
      className: 'voice-btn loading',
      showPulse: false,
    },
    [RECORDER_STATES.RECORDING]: {
      label:     `Recording ${recordingDuration}s — tap to stop`,
      icon:      '⏹',
      className: 'voice-btn listening',
      showPulse: true,
    },
    [RECORDER_STATES.PROCESSING]: {
      label:     'Processing...',
      icon:      '⏳',
      className: 'voice-btn loading',
      showPulse: false,
    },
    [RECORDER_STATES.ERROR]: {
      label:     'Tap to try again',
      icon:      '🎤',
      className: 'voice-btn idle',
      showPulse: false,
    },
  };

  const current = config[recorderState] || config[RECORDER_STATES.IDLE];

  // Button is disabled only during REQUESTING and PROCESSING states.
  // During RECORDING, clicking should stop the recording.
  const isDisabled =
    recorderState === RECORDER_STATES.REQUESTING ||
    recorderState === RECORDER_STATES.PROCESSING;

  return (
    <div className="voice-btn-wrapper">
      <button
        className={current.className}
        onClick={onClick}
        disabled={isDisabled}
        aria-label={current.label}
      >
        <span className="voice-btn-icon">{current.icon}</span>
        {current.showPulse && <span className="pulse-ring" />}
      </button>
      <p className="voice-btn-label">{current.label}</p>
    </div>
  );
}

export default VoiceButton;