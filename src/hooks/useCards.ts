import { useState, useEffect, useCallback } from 'react';
import { Card } from '../types';

const STORAGE_KEY = 'englishCards_teacher';
const SEED_VERSION_KEY = 'englishCards_seedVersion';
const CURRENT_SEED_VERSION = 2;

const SEED_CARDS: Card[] = [
  { id: "ga9nshh", english: "cat",      russian: "кот",            category: "Animals" },
  { id: "rfzeaz3", english: "dog",      russian: "собака",         category: "Animals" },
  { id: "fqda1ex", english: "apple",    russian: "яблоко",         category: "Food" },
  { id: "ue57kr8", english: "bread",    russian: "хлеб",           category: "Food" },
  { id: "5t9txri", english: "house",    russian: "дом",            category: "Places" },
  { id: "jtcd5y2", english: "school",   russian: "школа",          category: "Places" },
  { id: "tjl4wqt", english: "first",    russian: "первый",         category: "Ordinal numbers" },
  { id: "1zcphgg", english: "second",   russian: "второй",         category: "Ordinal numbers" },
  { id: "yy51h64", english: "third",    russian: "третий",         category: "Ordinal numbers" },
  { id: "uu8wuz2", english: "fourth",   russian: "четвертый",      category: "Ordinal numbers" },
  { id: "zo941vv", english: "fifth",    russian: "пятый",          category: "Ordinal numbers" },
  { id: "a9kacq6", english: "sixth",    russian: "шестой",         category: "Ordinal numbers" },
  { id: "6fk1mg8", english: "seventh",  russian: "седьмой",        category: "Ordinal numbers" },
  { id: "o5r2o6v", english: "eighth",   russian: "восьмой",        category: "Ordinal numbers" },
  { id: "8v7vxbp", english: "ninth",    russian: "девятый",        category: "Ordinal numbers" },
  { id: "cxvpbt1", english: "tenth",    russian: "десятый",        category: "Ordinal numbers" },
  { id: "tnqlok4", english: "eleventh", russian: "одиннадцатый",   category: "Ordinal numbers" },
  { id: "5v6onm3", english: "twelfth",  russian: "двенадцатый",    category: "Ordinal numbers" },
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedVersion = parseInt(localStorage.getItem(SEED_VERSION_KEY) || '0', 10);

      if (!stored) {
        // Brand-new visitor — load all seed cards
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CARDS));
        localStorage.setItem(SEED_VERSION_KEY, String(CURRENT_SEED_VERSION));
        setCards(SEED_CARDS);
      } else {
        let existing: Card[] = JSON.parse(stored);

        if (storedVersion < CURRENT_SEED_VERSION) {
          // Returning visitor whose seed is outdated — merge in any new seed words
          const existingWords = new Set(existing.map(c => c.english.toLowerCase()));
          const toAdd = SEED_CARDS.filter(c => !existingWords.has(c.english.toLowerCase()));
          if (toAdd.length > 0) {
            existing = [...existing, ...toAdd];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
          }
          localStorage.setItem(SEED_VERSION_KEY, String(CURRENT_SEED_VERSION));
        }

        setCards(existing);
      }
    } catch (e) {
      console.error("Failed to load cards from localStorage", e);
    }
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
