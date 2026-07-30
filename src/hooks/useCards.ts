import { useState, useEffect, useCallback } from 'react';
import { Card } from '../types';

const STORAGE_KEY = 'englishCards_teacher';

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    // Fetch the authoritative word list published on the site.
    // BASE_URL is "/" in Replit dev and "/languages/" on GitHub Pages.
    const url = `${import.meta.env.BASE_URL}words.json`;

    fetch(url, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Card[]>;
      })
      .then(remoteCards => {
        // Merge: keep server cards, but also keep any words the teacher
        // added locally that haven't been pushed to words.json yet.
        const stored = localStorage.getItem(STORAGE_KEY);
        const localCards: Card[] = stored ? JSON.parse(stored) : [];
        const remoteEnglish = new Set(remoteCards.map(c => c.english.toLowerCase()));
        const localOnly = localCards.filter(c => !remoteEnglish.has(c.english.toLowerCase()));
        const merged = [...remoteCards, ...localOnly];
        setCards(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      })
      .catch(() => {
        // Offline or local dev without the file — fall back to localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            setCards(JSON.parse(stored));
          }
        } catch (e) {
          console.error('Failed to load cards from localStorage', e);
        }
      });
  }, []);

  const saveCards = useCallback((newCards: Card[]) => {
    setCards(newCards);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCards));
  }, []);

  const addCard = useCallback((cardData: Omit<Card, 'id'>) => {
    const newCard: Card = { ...cardData, id: generateId() };
    saveCards([...cards, newCard]);
  }, [cards, saveCards]);

  const updateCard = useCallback((id: string, cardData: Partial<Omit<Card, 'id'>>) => {
    saveCards(cards.map(c => c.id === id ? { ...c, ...cardData } : c));
  }, [cards, saveCards]);

  const deleteCard = useCallback((id: string) => {
    saveCards(cards.filter(c => c.id !== id));
  }, [cards, saveCards]);

  const importCards = useCallback((importedCards: Card[]) => {
    const existingEnglish = new Set(cards.map(c => c.english.toLowerCase()));
    const newUnique = importedCards.filter(c => !existingEnglish.has(c.english.toLowerCase()));
    const merged = [...cards, ...newUnique.map(c => ({ ...c, id: c.id || generateId() }))];
    saveCards(merged);
  }, [cards, saveCards]);

  const deleteAllCards = useCallback(() => {
    saveCards([]);
  }, [saveCards]);

  const categories = ['All words', ...Array.from(new Set(cards.map(c => c.category).filter(Boolean) as string[]))].sort();

  return {
    cards,
    categories,
    addCard,
    updateCard,
    deleteCard,
    importCards,
    deleteAllCards
  };
}
