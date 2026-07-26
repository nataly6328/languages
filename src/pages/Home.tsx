import { useState, useEffect, useMemo } from 'react';
import { Card, DirectionMode } from '../types';
import { useCards } from '../hooks/useCards';
import { useVoice } from '../hooks/useVoice';
import { Sidebar } from '../components/Sidebar';
import { CardGrid } from '../components/CardGrid';
import { QuizArea } from '../components/QuizArea';
import { AddCardForm } from '../components/AddCardForm';
import { TeacherPanel } from '../components/TeacherPanel';
import { Play, Settings2, Award, ChevronRight, GraduationCap } from 'lucide-react';
import { cn } from '../lib/utils';
import { preloadWords } from '../hooks/useVoice';

export function Home() {
  const { cards, categories, addCard, updateCard, deleteCard } = useCards();
  const { voices, selectedVoice, selectVoice, speakWord, isSpeaking, voicesLoaded } = useVoice();
  
  const [activeCategory, setActiveCategory] = useState<string>('All words');
  const [mode, setMode] = useState<DirectionMode>('EN_TO_RU');
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    const storedScore = localStorage.getItem('bestScore');
    if (storedScore) setBestScore(parseInt(storedScore, 10));
  }, []);

  // Pre-load dictionary audio for all English words as soon as cards arrive
  useEffect(() => {
    if (cards.length > 0) {
      preloadWords(cards.map(c => c.english));
    }
  }, [cards]);

  const handleScoreUpdate = (score: number) => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('bestScore', score.toString());
    }
  };

  const filteredCards = useMemo(
    () => activeCategory === 'All words' ? cards : cards.filter(c => c.category === activeCategory),
    [cards, activeCategory]
  );

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      {!isQuizMode && (
        <aside className="w-full md:w-64 md:border-r border-border bg-card/50 backdrop-blur-sm md:sticky md:top-0 md:h-screen shadow-sm z-10">
          <Sidebar 
            categories={categories} 
            activeCategory={activeCategory} 
            onSelectCategory={setActiveCategory} 
          />
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        {!isQuizMode && (
          <header className="mb-10 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
                  <GraduationCap className="w-10 h-10 text-primary" />
                  Learn English
                </h1>
                <p className="text-muted-foreground font-medium mt-1">Study tool for Russian speakers</p>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 bg-card p-3 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-xl">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  <select 
                    value={selectedVoice?.name || ''} 
                    onChange={e => selectVoice(e.target.value)}
                    className="bg-transparent border-none text-sm font-medium outline-none text-foreground w-40 cursor-pointer"
                    title="Select Voice"
                  >
                    {!voicesLoaded ? (
                      <option>Loading voices...</option>
                    ) : voices.length === 0 ? (
                      <option>No English voices</option>
                    ) : (
                      voices.map(v => (
                        <option key={v.name} value={v.name}>{v.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="flex bg-muted rounded-xl p-1 relative">
                  <button
                    onClick={() => setMode('EN_TO_RU')}
                    className={cn(
                      "px-4 py-1.5 text-sm font-bold rounded-lg transition-all z-10",
                      mode === 'EN_TO_RU' ? "bg-white dark:bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    EN → RU
                  </button>
                  <button
                    onClick={() => setMode('RU_TO_EN')}
                    className={cn(
                      "px-4 py-1.5 text-sm font-bold rounded-lg transition-all z-10",
                      mode === 'RU_TO_EN' ? "bg-white dark:bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    RU → EN
                  </button>
                </div>
              </div>
            </div>

            {/* Stats & Start Quiz */}
            <div className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-2xl p-4">
              <div className="flex gap-6">
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Cards</div>
                  <div className="text-2xl font-black text-foreground">{filteredCards.length}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Best Score
                  </div>
                  <div className="text-2xl font-black text-primary">{bestScore}</div>
                </div>
              </div>
              
              <button
                onClick={() => setIsQuizMode(true)}
                disabled={filteredCards.length === 0}
                className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
                data-testid="btn-start-quiz"
              >
                <Play className="w-5 h-5 fill-current" />
                Start Quiz
              </button>
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <div className="flex-1">
          {isQuizMode ? (
            <div className="py-10 animate-in fade-in zoom-in duration-300">
              <QuizArea 
                cards={filteredCards} 
                mode={mode} 
                onEnd={() => setIsQuizMode(false)}
                onScoreUpdate={handleScoreUpdate}
                speakWord={speakWord}
              />
            </div>
          ) : (
            <>
              {isTeacher && (
                <AddCardForm 
                  editingCard={editingCard}
                  onAdd={addCard}
                  onUpdate={updateCard}
                  onCancelEdit={() => setEditingCard(null)}
                />
              )}
              
              <CardGrid 
                cards={filteredCards} 
                mode={mode} 
                isTeacher={isTeacher}
                onEdit={setEditingCard}
                onDelete={deleteCard}
                speakWord={speakWord}
                isSpeaking={isSpeaking}
              />
            </>
          )}
        </div>

        {/* Footer / Teacher Panel */}
        {!isQuizMode && (
          <TeacherPanel isTeacher={isTeacher} setIsTeacher={setIsTeacher} />
        )}

      </main>
    </div>
  );
}
