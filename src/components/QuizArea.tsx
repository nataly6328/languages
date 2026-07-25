import { useState, useEffect, useRef } from 'react';
import { Card, DirectionMode } from '../types';
import { Volume2, ChevronRight, X } from 'lucide-react';
import { cn } from '../lib/utils';

// Web Audio API helpers
function playCorrectSound() {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sine';
  
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(523, now); // C5
  osc.frequency.setValueAtTime(659, now + 0.1); // E5
  osc.frequency.setValueAtTime(784, now + 0.2); // G5
  
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  
  osc.start(now);
  osc.stop(now + 0.5);
}

function playWrongSound() {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'triangle';
  
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(250, now);
  osc.frequency.setValueAtTime(200, now + 0.15);
  
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
  
  osc.start(now);
  osc.stop(now + 0.35);
}

interface QuizAreaProps {
  cards: Card[];
  mode: DirectionMode;
  onEnd: () => void;
  onScoreUpdate: (score: number) => void;
  speakWord: (word: string) => void;
}

export function QuizArea({ cards, mode, onEnd, onScoreUpdate, speakWord }: QuizAreaProps) {
  const [queue, setQueue] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isEnToRu = mode === 'EN_TO_RU';

  useEffect(() => {
    // Shuffle cards
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setCurrentIndex(0);
    setCorrectCount(0);
    setTotalAttempted(0);
  }, [cards]);

  const currentCard = queue[currentIndex];

  useEffect(() => {
    if (currentCard && status === 'idle') {
      if (isEnToRu) {
        speakWord(currentCard.english);
      }
      inputRef.current?.focus();
    }
  }, [currentIndex, currentCard, isEnToRu, speakWord, status]);

  if (!currentCard) return null;

  const expectedAnswer = isEnToRu ? currentCard.russian : currentCard.english;
  const questionWord = isEnToRu ? currentCard.english : currentCard.russian;

  const handleCheck = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (status !== 'idle' || !input.trim()) return;

    const isCorrect = input.trim().toLowerCase() === expectedAnswer.toLowerCase();
    
    setStatus(isCorrect ? 'correct' : 'wrong');
    setTotalAttempted(prev => prev + 1);
    
    if (isCorrect) {
      setCorrectCount(prev => {
        const newScore = prev + 1;
        onScoreUpdate(newScore);
        return newScore;
      });
      playCorrectSound();
    } else {
      playWrongSound();
    }

    setTimeout(() => {
      setStatus('idle');
      setInput('');
      if (currentIndex + 1 < queue.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Reshuffle if out of cards
        const reshuffled = [...cards].sort(() => Math.random() - 0.5);
        setQueue(reshuffled);
        setCurrentIndex(0);
      }
    }, 1800);
  };

  return (
    <div className="bg-[#FEFCE8] border border-[#FEF08A] dark:bg-yellow-900/10 dark:border-yellow-900/30 rounded-3xl p-6 md:p-10 shadow-lg relative max-w-3xl mx-auto w-full" data-testid="quiz-area">
      <button 
        onClick={onEnd}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
        data-testid="btn-end-quiz"
        title="End Quiz"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex justify-between items-center mb-8 text-sm font-bold text-muted-foreground tracking-wide">
        <div>Score: <span className="text-primary">{correctCount} / {totalAttempted}</span></div>
        <div>Card: {currentIndex + 1}</div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[300px] mb-8">
        {currentCard.image && (
          <img src={currentCard.image} alt={questionWord} className="w-48 h-48 object-cover rounded-2xl mb-8 shadow-sm" />
        )}
        
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-6xl font-black text-foreground break-words text-center" data-testid="quiz-question">
            {questionWord}
          </h2>
          {isEnToRu && (
            <button
              onClick={() => speakWord(currentCard.english)}
              className="p-3 text-primary hover:bg-primary/10 rounded-full transition-colors"
            >
              <Volume2 className="w-8 h-8" />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleCheck} className="flex flex-col gap-4 max-w-md mx-auto">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={status !== 'idle'}
          className={cn(
            "w-full text-2xl text-center font-bold px-6 py-4 rounded-2xl border-2 transition-all outline-none",
            status === 'idle' ? "bg-white border-border focus:border-primary focus:ring-4 focus:ring-primary/20 dark:bg-card" :
            status === 'correct' ? "bg-green-50 border-green-500 text-green-700" :
            "bg-red-50 border-red-500 text-red-700"
          )}
          placeholder={isEnToRu ? "Translate to Russian..." : "Translate to English..."}
          data-testid="quiz-input"
        />

        <button
          type="submit"
          disabled={status !== 'idle' || !input.trim()}
          className="w-full bg-primary text-primary-foreground font-bold text-xl rounded-2xl px-6 py-4 hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
          data-testid="btn-check-quiz"
        >
          Check <ChevronRight className="w-6 h-6" />
        </button>

        <div className="h-8 flex items-center justify-center text-lg font-bold">
          {status === 'correct' && <span className="text-green-600 animate-in fade-in slide-in-from-bottom-2">Correct! 🎉</span>}
          {status === 'wrong' && (
            <span className="text-red-600 animate-in fade-in slide-in-from-bottom-2">
              Wrong. Correct: <span className="underline">{expectedAnswer}</span>
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
