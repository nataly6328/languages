import { useState, useEffect } from 'react';
import { Card } from '../types';
import { Check, X } from 'lucide-react';

interface AddCardFormProps {
  editingCard: Card | null;
  categories: string[];
  onAdd: (card: Omit<Card, 'id'>) => void;
  onUpdate: (id: string, card: Partial<Card>) => void;
  onCancelEdit: () => void;
}

export function AddCardForm({ editingCard, categories, onAdd, onUpdate, onCancelEdit }: AddCardFormProps) {
  const [english, setEnglish] = useState('');
  const [russian, setRussian] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingCard) {
      setEnglish(editingCard.english);
      setRussian(editingCard.russian);
      setCategory(editingCard.category || '');
      setImage(editingCard.image || '');
      setDescription(editingCard.description || '');
    } else {
      setEnglish('');
      setRussian('');
      setCategory('');
      setImage('');
      setDescription('');
    }
  }, [editingCard]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!english.trim() || !russian.trim()) return;

    const cardData = {
      english: english.trim(),
      russian: russian.trim(),
      category: category.trim() || undefined,
      image: image.trim() || undefined,
      description: description.trim() || undefined,
    };

    if (editingCard) {
      onUpdate(editingCard.id, cardData);
      onCancelEdit();
    } else {
      onAdd(cardData);
      setEnglish('');
      setRussian('');
      setCategory('');
      setImage('');
      setDescription('');
    }
  };

  return (
    <div className="bg-card border border-card-border p-6 rounded-2xl shadow-sm mb-8" data-testid="teacher-add-form">
      <h3 className="text-lg font-bold mb-4">{editingCard ? 'Edit Word' : 'Add New Word'}</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">English *</label>
            <input
              type="text"
              required
              data-testid="input-english"
              value={english}
              onChange={e => setEnglish(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="e.g. apple"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Russian *</label>
            <input
              type="text"
              required
              data-testid="input-russian"
              value={russian}
              onChange={e => setRussian(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="e.g. яблоко"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
            <input
              type="text"
              list="category-suggestions"
              data-testid="input-category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="e.g. Food"
            />
            <datalist id="category-suggestions">
              {categories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Image URL</label>
            <input
              type="url"
              data-testid="input-image"
              value={image}
              onChange={e => setImage(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
          <input
            type="text"
            data-testid="input-description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Optional context or usage..."
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            data-testid="btn-submit-card"
            className="flex-1 bg-primary text-primary-foreground font-bold rounded-xl px-6 py-3 hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {editingCard ? 'Save Changes' : 'Add Word'}
          </button>
          
          {editingCard && (
            <button
              type="button"
              onClick={onCancelEdit}
              data-testid="btn-cancel-edit"
              className="bg-muted text-foreground font-semibold rounded-xl px-6 py-3 hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
