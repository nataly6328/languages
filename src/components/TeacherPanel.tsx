import { useState, useEffect } from 'react';
import { LogIn, Download, RefreshCw, Trash2, X } from 'lucide-react';
import { useCards } from '../hooks/useCards';

interface TeacherPanelProps {
  isTeacher: boolean;
  setIsTeacher: (val: boolean) => void;
}

export function TeacherPanel({ isTeacher, setIsTeacher }: TeacherPanelProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { cards, deleteAllCards, importCards } = useCards();

  useEffect(() => {
    const session = sessionStorage.getItem('isTeacher');
    if (session === 'true') {
      setIsTeacher(true);
    }
  }, [setIsTeacher]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'teacher123') {
      setIsTeacher(true);
      sessionStorage.setItem('isTeacher', 'true');
      setShowLogin(false);
      setPassword('');
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsTeacher(false);
    sessionStorage.removeItem('isTeacher');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(cards, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'words.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleRecover = () => {
    let recoveredCards: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('Card') || key.includes('english'))) {
        try {
          const val = localStorage.getItem(key);
          if (val) {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
              recoveredCards = [...recoveredCards, ...parsed];
            }
          }
        } catch (e) {
          // ignore parsing errors
        }
      }
    }
    if (recoveredCards.length > 0) {
      importCards(recoveredCards);
      alert(`Recovered and merged ${recoveredCards.length} cards from other keys.`);
    } else {
      alert('No extra cards found.');
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to delete ALL cards? This cannot be undone.')) {
      deleteAllCards();
      // clean up other potential keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('englishCards')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }
  };

  if (isTeacher) {
    return (
      <div className="mt-20 border-t border-border/50 pt-8 pb-12 flex flex-col items-center gap-4" data-testid="teacher-panel">
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>
          <button 
            onClick={handleRecover}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Scan & Recover
          </button>
          <button 
            onClick={handleDeleteAll}
            className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg font-medium hover:bg-destructive/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete All
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20 border-t border-border/50 pt-8 pb-12 flex flex-col items-center" data-testid="teacher-login-area">
      {!showLogin ? (
        <button 
          onClick={() => setShowLogin(true)}
          className="text-xs text-muted-foreground hover:text-foreground opacity-50 hover:opacity-100 transition-all font-medium flex items-center gap-2"
        >
          <LogIn className="w-3 h-3" />
          I am a teacher
        </button>
      ) : (
        <form onSubmit={handleLogin} className="flex gap-2 items-center bg-card p-2 rounded-xl shadow-sm border border-border">
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="bg-transparent border-none outline-none px-3 text-sm w-32"
            autoFocus
          />
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-bold">
            Login
          </button>
          <button type="button" onClick={() => setShowLogin(false)} className="px-2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </form>
      )}
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}
