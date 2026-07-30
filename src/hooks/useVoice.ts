import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'selectedVoiceName';

// Words that have a bundled MP3 in public/audio/
const LOCAL_AUDIO_WORDS = new Set([
  'twentieth', 'twenty-first', 'twenty-second', 'twenty-third',
  'twenty-fourth', 'thirtieth', 'fortieth', 'hundredth',
]);

// Pre-built Audio elements — created once at module load, reused on every tap.
// Using import.meta.env.BASE_URL so the path is correct on GitHub Pages (/languages/).
const preloadedAudio = new Map<string, HTMLAudioElement>();
LOCAL_AUDIO_WORDS.forEach(word => {
  const el = new Audio(`${import.meta.env.BASE_URL}audio/${word}.mp3`);
  el.preload = 'auto';
  preloadedAudio.set(word, el);
});

export function useVoice() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const currentAudio = useRef<HTMLAudioElement | null>(null);

  const loadVoices = useCallback(() => {
    const availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length > 0) {
      const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
      setVoices(englishVoices);
      setVoicesLoaded(true);

      const savedVoiceName = localStorage.getItem(STORAGE_KEY);
      let defaultVoice = englishVoices.find(v => v.name === savedVoiceName);

      if (!defaultVoice) {
        defaultVoice =
          englishVoices.find(v => v.name.includes('Google') && v.name.includes('Female')) ||
          englishVoices.find(v => v.name.includes('Samantha')) ||
          englishVoices.find(v => v.name.includes('Zira')) ||
          englishVoices[0];
      }

      setSelectedVoice(defaultVoice || null);
    }
  }, []);

  useEffect(() => {
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    const timeout = setTimeout(loadVoices, 500);
    return () => clearTimeout(timeout);
  }, [loadVoices]);

  const selectVoice = useCallback((voiceName: string) => {
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
      localStorage.setItem(STORAGE_KEY, voice.name);
    }
  }, [voices]);

  const speakWord = useCallback((word: string) => {
    if (!word) return;

    window.speechSynthesis.cancel();
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
      currentAudio.current = null;
    }

    const key = word.toLowerCase();

    // Use preloaded MP3 for the 8 words that sound bad through speech synthesis
    if (LOCAL_AUDIO_WORDS.has(key)) {
      const audio = preloadedAudio.get(key)!;
      audio.currentTime = 0;
      currentAudio.current = audio;
      setIsSpeaking(true);
      audio.onended = () => { setIsSpeaking(false); currentAudio.current = null; };
      audio.onerror = () => {
        setIsSpeaking(false);
        currentAudio.current = null;
        deviceSpeak(word);
      };
      audio.play().catch(() => {
        setIsSpeaking(false);
        currentAudio.current = null;
        deviceSpeak(word);
      });
      return;
    }

    // All other words: device speech synthesis (honours the voice the user selected)
    deviceSpeak(word);

    function deviceSpeak(w: string) {
      const utterance = new SpeechSynthesisUtterance(w);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.lang = selectedVoice?.lang ?? 'en-US';
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend   = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, [selectedVoice]);

  const speakRussian = useCallback((word: string) => {
    if (!word) return;
    window.speechSynthesis.cancel();
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current = null;
    }
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend   = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  return {
    voices,
    selectedVoice,
    selectVoice,
    speakWord,
    speakRussian,
    isSpeaking,
    voicesLoaded
  };
}
