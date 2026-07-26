import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'selectedVoiceName';

// Cache word -> audio URL so we only fetch once per word per session
const audioUrlCache = new Map<string, string | null>();

async function fetchDictionaryAudio(word: string): Promise<string | null> {
  if (audioUrlCache.has(word)) return audioUrlCache.get(word)!;

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`
    );
    if (!res.ok) { audioUrlCache.set(word, null); return null; }

    const data = await res.json();
    // Walk through phonetics arrays to find the first non-empty audio URL
    for (const entry of data) {
      for (const phonetic of (entry.phonetics ?? [])) {
        if (phonetic.audio) {
          audioUrlCache.set(word, phonetic.audio);
          return phonetic.audio;
        }
      }
    }
  } catch {
    // network error — fall through to null
  }

  audioUrlCache.set(word, null);
  return null;
}

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

  const speakWord = useCallback(async (word: string) => {
    if (!word) return;

    // Stop anything currently playing
    window.speechSynthesis.cancel();
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current = null;
    }

    // 1. Try real human audio from the Free Dictionary API
    const audioUrl = await fetchDictionaryAudio(word);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      currentAudio.current = audio;
      setIsSpeaking(true);
      audio.onended = () => { setIsSpeaking(false); currentAudio.current = null; };
      audio.onerror = () => {
        // Audio failed to load — fall back to speech synthesis
        setIsSpeaking(false);
        currentAudio.current = null;
        fallbackSpeak(word);
      };
      audio.play().catch(() => fallbackSpeak(word));
      return;
    }

    // 2. Fall back to speech synthesis
    fallbackSpeak(word);

    function fallbackSpeak(w: string) {
      const utterance = new SpeechSynthesisUtterance(w);
      if (selectedVoice) utterance.voice = selectedVoice;
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
