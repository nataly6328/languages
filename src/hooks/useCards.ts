import { useState, useEffect, useCallback } from 'react';
import { Card } from '../types';

const STORAGE_KEY = 'englishCards_teacher';
const SEED_CARDS: Omit<Card, 'id'>[] = [
  { english: "cat", russian: "кошка", category: "Animals" },
  { english: "dog", russian: "собака", category: "Animals" },
  { english: "apple", russian: "яблоко", category: "Food" },
  { english: "bread", russian: "хлеб", category: "Food" },
  { english: "house", russian: "дом", category: "Places" },
  { english: "school", russian: "школа", category: "Places" }
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    const loadCards = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setCards(JSON.parse(stored));
        } else {
          const initialCards = SEED_CARDS.map(c => ({ ...c, id: generateId() }));
          setCards(initialCards);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCards));
        }
      } catch (e) {
        console.error("Failed to load cards from localStorage", e);
      }
    };
    loadCards();
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
    // Basic deduplication based on english word
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
