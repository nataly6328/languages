import { Volume2, Pencil, Trash2 } from 'lucide-react';
import { Card, DirectionMode } from '../types';
import { cn } from '../lib/utils';

interface CardItemProps {
  card: Card;
  mode: DirectionMode;
  isTeacher: boolean;
  onEdit?: (card: Card) => void;
  onDelete?: (id: string) => void;
  speakWord: (word: string) => void;
  isSpeaking: boolean;
}

export function CardItem({ card, mode, isTeacher, onEdit, onDelete, speakWord, isSpeaking }: CardItemProps) {
  const isEnToRu = mode === 'EN_TO_RU';

  const primaryWord = isEnToRu ? card.english : card.russian;
  const translation = isEnToRu ? card.russian : card.english;
  
  // Only speak English word
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakWord(card.english);
  };

  return (
    <div className="group relative flex flex-col bg-card border border-card-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300" data-testid={`card-${card.id}`}>
      {card.image && (
        <div className="w-full h-32 mb-4 rounded-xl overflow-hidden bg-muted">
          <img src={card.image} alt={card.english} className="w-full h-full object-cover" />
        </div>
      )}
      
      <div className="flex-1 flex flex-col items-center text-center justify-center min-h-[100px] mb-2 relative">
        <h3 className="text-[40px] font-extrabold leading-tight tracking-tight text-foreground mb-1 break-words w-full">
          {primaryWord}
        </h3>
        <p className="text-xl text-muted-foreground font-medium">
          {translation}
        </p>
      </div>
      
      {card.description && (
        <p className="text-sm text-center text-muted-foreground mb-4">
          {card.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
        <div className="flex-1">
          {card.category && (
            <span className="inline-flex px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
              {card.category}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handleSpeak}
            data-testid={`btn-speak-${card.id}`}
            className={cn(
              "p-2 rounded-full transition-colors",
              isSpeaking ? "bg-primary/20 text-primary animate-pulse" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title="Listen to English pronunciation"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          
          {isTeacher && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit?.(card); }}
                data-testid={`btn-edit-${card.id}`}
                className="p-2 text-muted-foreground hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors dark:hover:bg-blue-900/30"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(card.id); }}
                data-testid={`btn-delete-${card.id}`}
                className="p-2 text-muted-foreground hover:bg-red-50 hover:text-destructive rounded-full transition-colors dark:hover:bg-red-900/30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
