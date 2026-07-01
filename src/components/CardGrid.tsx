import { Card, DirectionMode } from '../types';
import { CardItem } from './CardItem';
import { BookOpen } from 'lucide-react';

interface CardGridProps {
  cards: Card[];
  mode: DirectionMode;
  isTeacher: boolean;
  onEdit?: (card: Card) => void;
  onDelete?: (id: string) => void;
}

export function CardGrid({ cards, mode, isTeacher, onEdit, onDelete }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4" data-testid="empty-cards">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">No cards found</h3>
        <p className="text-muted-foreground max-w-sm">
          There are no words in this category yet. {isTeacher ? "Add some using the form below." : "Check back later!"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4" data-testid="card-grid">
      {cards.map(card => (
        <CardItem
          key={card.id}
          card={card}
          mode={mode}
          isTeacher={isTeacher}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
