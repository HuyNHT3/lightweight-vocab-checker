/**
 * AudioService handles Text-to-Speech (TTS) using Web Speech API
 * and local audio playback for the Vocabulary Quiz app.
 */
class AudioService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.selectedVoice = null;

    // Initialize voices
    this._loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this._loadVoices();
    }
  }

  /**
   * Loads available voices and attempts to find a high-quality English voice.
   */
  _loadVoices() {
    this.voices = this.synth.getVoices();
    // Priority: Google US English > Any en-US > Any English
    this.selectedVoice = 
      this.voices.find(v => v.name === 'Google US English') ||
      this.voices.find(v => v.lang === 'en-US' || v.lang === 'en_US') ||
      this.voices.find(v => v.lang.startsWith('en'));
  }

  /**
   * Speaks the provided text.
   * @param {string} text - The text to speak.
   * @param {number} rate - Speed of speech (0.1 to 10).
   * @param {number} pitch - Pitch of speech (0 to 2).
   */
  speak(text, rate = 0.9, pitch = 1) {
    // Stop any current speech before starting new one
    this.stop();

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = 'en-US';

    utterance.onerror = (event) => {
      console.error('SpeechSynthesis error:', event.error);
    };

    this.synth.speak(utterance);
  }

  /**
   * Stops the current speech synthesis.
   */
  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
  }

  /**
   * Plays local audio file if available (Requirement from Phase 5).
   * @param {string} src - Path to the local audio file.
   * @param {Function} onError - Callback if file is missing.
   */
  playLocalFile(src, onError) {
    const audio = new Audio(src);
    audio.onerror = () => {
      if (onError) onError();
    };
    audio.play().catch(() => {
      if (onError) onError();
    });
  }
}

// Global instance for the app
const vocabAudioService = new AudioService();