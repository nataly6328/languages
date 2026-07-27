import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'selectedVoiceName';

// Words that have a bundled MP3 in public/audio/
const LOCAL_AUDIO_WORDS = new Set([
  'twentieth', 'twenty-first', 'twenty-second', 'twenty-third',
  'twenty-fourth', 'thirtieth', 'fortieth', 'hundredth',
]);

// Cache word -> audio URL so we only fetch once per session
const audioUrlCache = new Map<string, string | null>();

async function fetchDictionaryAudio(word: string): Promise<string | null> {
  if (audioUrlCache.has(word)) return audioUrlCache.get(word)!;

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`
    );
    if (!res.ok) { audioUrlCache.set(word, null); return null; }

    const data = await res.json();
    for (const entry of data) {
      for (const phonetic of (entry.phonetics ?? [])) {
        if (phonetic.audio) {
          audioUrlCache.set(word, phonetic.audio);
          return phonetic.audio;
        }
      }
    }
  } catch {
    // network error
  }

  audioUrlCache.set(word, null);
  return null;
}

// Silently pre-fetch audio URLs for a list of words in small parallel batches.
// Results go into the cache so playback is instant when the user taps.
export async function preloadWords(words: string[]) {
  const uncached = words.filter(w => !audioUrlCache.has(w));
  const BATCH = 4;
  for (let i = 0; i < uncached.length; i += BATCH) {
    await Promise.all(uncached.slice(i, i + BATCH).map(fetchDictionaryAudio));
  }
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

    window.speechSynthesis.cancel();
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current = null;
    }

    // 0. Bundled local MP3 (highest priority — no network needed)
    if (LOCAL_AUDIO_WORDS.has(word.toLowerCase())) {
      const localUrl = `${import.meta.env.BASE_URL}audio/${word.toLowerCase()}.mp3`;
      const audio = new Audio(localUrl);
      currentAudio.current = audio;
      setIsSpeaking(true);
      audio.onended = () => { setIsSpeaking(false); currentAudio.current = null; };
      audio.onerror = () => { setIsSpeaking(false); currentAudio.current = null; };
      audio.play().catch(() => { setIsSpeaking(false); });
      return;
    }

    // 1. Try real human audio from Free Dictionary (will be instant if pre-loaded)
    const audioUrl = await fetchDictionaryAudio(word);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      currentAudio.current = audio;
      setIsSpeaking(true);
      audio.onended = () => { setIsSpeaking(false); currentAudio.current = null; };
      audio.onerror = () => {
        setIsSpeaking(false);
        currentAudio.current = null;
        fallbackSpeak(word);
      };
      audio.play().catch(() => fallbackSpeak(word));
      return;
    }

    googleTtsSpeak(word);

    // Google Translate TTS — good quality for any word, instant (no fetch needed)
    function googleTtsSpeak(w: string) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(w)}&tl=en&client=tw-ob`;
      const audio = new Audio(url);
      currentAudio.current = audio;
      setIsSpeaking(true);
      audio.onended = () => { setIsSpeaking(false); currentAudio.current = null; };
      audio.onerror = () => {
        setIsSpeaking(false);
        currentAudio.current = null;
        // Last resort: device speech synthesis
        const utterance = new SpeechSynthesisUtterance(w);
        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.rate = 0.9;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend   = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      };
      audio.play().catch(() => {
        // If autoplay blocked, fall through to speech synthesis
        setIsSpeaking(false);
        currentAudio.current = null;
      });
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
