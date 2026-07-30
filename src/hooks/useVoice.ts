import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'selectedVoiceName';

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
      currentAudio.current = null;
    }
    const utterance = new SpeechSynthesisUtterance(word);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.lang = selectedVoice?.lang ?? 'en-US';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend   = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
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
