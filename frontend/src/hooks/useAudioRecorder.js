// useAudioRecorder.js
//
// Custom hook that captures audio from the user's microphone
// using the browser's MediaRecorder API.
//
// Real-world concept: Hardware abstraction layer.
// This hook is the ONLY place in the entire codebase that
// touches microphone hardware. Everything above it works with
// clean data (audio blobs, state strings). This is called
// "separation of concerns" — a core software engineering principle.
//
// Companies like Zoom, Google Meet, Amazon all have a similar
// audio capture layer that is completely separate from their
// processing and UI layers.

import { useState, useRef, useCallback } from 'react';

// Define all possible states as constants.
// Never use raw strings like 'idle' scattered across files.
// If you rename a state, you change it here — nowhere else.
export const RECORDER_STATES = {
  IDLE:       'idle',       // Ready, waiting for user to click
  REQUESTING: 'requesting', // Asking browser for mic permission
  RECORDING:  'recording',  // Actively capturing audio
  PROCESSING: 'processing', // Audio sent to backend, waiting for response
  ERROR:      'error',      // Something went wrong
};

function useAudioRecorder({ onAudioReady }) {
  // onAudioReady(blob) — callback fired when recording stops
  // and audio blob is ready to send to the backend

  // Current state of the recorder
  const [recorderState, setRecorderState] = useState(RECORDER_STATES.IDLE);

  // Human-friendly error message — null when no error
  const [error, setError] = useState(null);

  // Duration of current recording in seconds (for UI display)
  const [recordingDuration, setRecordingDuration] = useState(0);

  // --- Refs ---
  // These are internal implementation details.
  // They should NEVER trigger re-renders when they change.
  // Rule: if a variable is infrastructure (timers, streams, instances),
  // use useRef. If it affects what the user sees, use useState.

  // The MediaRecorder instance
  const mediaRecorderRef = useRef(null);

  // The MediaStream (microphone stream) — needed to stop the mic light
  const mediaStreamRef = useRef(null);

  // Collected audio chunks — MediaRecorder gives data in pieces
  const audioChunksRef = useRef([]);

  // Timer ref for recording duration counter
  const timerRef = useRef(null);

  // --- stopRecording ---
  // Defined before startRecording because startRecording references it
  // (auto-stop after max duration).
  // useCallback ensures this function reference is stable across renders.
  const stopRecording = useCallback(() => {
    // Guard clause — if not recording, do nothing
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state === 'inactive'
    ) {
      return;
    }

    // Stop the MediaRecorder — this triggers the 'stop' event handler
    // which assembles the audio blob and calls onAudioReady
    mediaRecorderRef.current.stop();

    // Stop the microphone stream.
    // CRITICAL: Without this, the browser mic indicator light stays on
    // even after recording stops. Users find this alarming.
    // Always release hardware resources when done with them.
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Clear the duration timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setRecordingDuration(0);
    setRecorderState(RECORDER_STATES.PROCESSING);
  }, []);

  // --- startRecording ---
  const startRecording = useCallback(async () => {
    // Clear any previous errors
    setError(null);
    setRecorderState(RECORDER_STATES.REQUESTING);

    try {
      // Ask the browser for microphone access.
      // This is what triggers the "Allow microphone" popup.
      // getUserMedia returns a Promise — we await it.
      //
      // The constraints object tells the browser what we need.
      // audio: true — we want audio (not video).
      // These specific constraints optimize for voice (not music):
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,   // Remove echo from speakers
          noiseSuppression: true,   // Filter background noise
          sampleRate: 16000,        // 16kHz — optimal for speech recognition
                                    // Amazon Transcribe works best at this rate
        },
      });

      // Save stream reference so we can stop it later
      mediaStreamRef.current = stream;

      // Determine the best audio format this browser supports.
      // Different browsers support different formats:
      //   Chrome supports: audio/webm, audio/ogg
      //   Safari supports: audio/mp4
      // We pick the best available in priority order.
      const mimeType = getSupportedMimeType();

      // Create the MediaRecorder with our stream and format
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // Reset the chunks array for this new recording
      audioChunksRef.current = [];

      // --- MediaRecorder event handlers ---

      // ondataavailable fires periodically with audio data.
      // We collect all chunks — they will be assembled at the end.
      // Why chunks? Because audio data can be large.
      // Getting it in pieces is more memory-efficient than one giant blob.
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // onstop fires when recording ends (after .stop() is called).
      // This is where we assemble the final audio blob.
      mediaRecorder.onstop = () => {
        // Combine all chunks into a single Blob
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType,
        });

        // Only call the callback if we actually have audio data.
        // A blob smaller than 1000 bytes is essentially silence — skip it.
        if (audioBlob.size > 1000) {
          onAudioReady(audioBlob);
        } else {
          setError('No audio detected. Please try speaking again.');
          setRecorderState(RECORDER_STATES.IDLE);
        }

        // Clean up chunks for next recording
        audioChunksRef.current = [];
      };

      // onerror — MediaRecorder encountered an error while recording
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setError('Recording failed. Please try again.');
        setRecorderState(RECORDER_STATES.ERROR);
      };

      // Start recording.
      // The number (250) is the timeslice in milliseconds —
      // ondataavailable fires every 250ms with a chunk of audio.
      // Smaller = more chunks, less memory at once. 250ms is a good balance.
      mediaRecorder.start(250);
      setRecorderState(RECORDER_STATES.RECORDING);

      // Start the duration counter for UI display
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          // Auto-stop after 30 seconds — prevent accidental huge recordings
          // Amazon Transcribe free tier charges by the minute — be careful
          if (prev >= 30) {
            stopRecording();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      // Handle specific error types with friendly messages.
      // err.name gives us the standardized error type.
      const errorMessages = {
        'NotAllowedError':  'Microphone access denied. Please click the lock icon in your browser address bar and allow microphone access.',
        'NotFoundError':    'No microphone found. Please connect a microphone and try again.',
        'NotReadableError': 'Microphone is already in use by another application.',
        'OverconstrainedError': 'Microphone does not meet requirements. Please try a different microphone.',
        'AbortError':       'Microphone access was aborted. Please try again.',
      };

      const message = errorMessages[err.name] || `Microphone error: ${err.message}`;
      setError(message);
      setRecorderState(RECORDER_STATES.ERROR);
      console.error('getUserMedia error:', err.name, err.message);
    }
  }, [onAudioReady, stopRecording]);

  // --- cancelRecording ---
  // Stops recording and DISCARDS the audio.
  // Used when user changes their mind mid-recording.
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      // Remove the onstop handler BEFORE stopping
      // so it doesn't fire onAudioReady with unwanted data
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    audioChunksRef.current = [];
    setRecordingDuration(0);
    setRecorderState(RECORDER_STATES.IDLE);
    setError(null);
  }, []);

  // --- reset ---
  // Returns hook to clean idle state after processing is done
  const reset = useCallback(() => {
    setRecorderState(RECORDER_STATES.IDLE);
    setError(null);
    setRecordingDuration(0);
  }, []);

  return {
    recorderState,
    error,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
    RECORDER_STATES,
  };
}

// --- Helper: getSupportedMimeType ---
// Returns the best supported audio MIME type for this browser.
// Defined outside the hook — it's a pure utility function
// that doesn't need access to state or refs.
function getSupportedMimeType() {
  // Priority order: prefer webm/opus (best quality + compression for voice)
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  // Fallback — let the browser decide
  return '';
}

export default useAudioRecorder;