import { useState, useEffect, useRef } from 'react';
import { LogIn, Download, RefreshCw, Trash2, X, Upload, CheckCircle } from 'lucide-react';
import { Card } from '../types';

interface TeacherPanelProps {
  isTeacher: boolean;
  setIsTeacher: (val: boolean) => void;
  cards: Card[];
  importCards: (cards: Card[]) => void;
  deleteAllCards: () => void;
}

export function TeacherPanel({ isTeacher, setIsTeacher, cards, importCards, deleteAllCards }: TeacherPanelProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setError('Неверный пароль / Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsTeacher(false);
    sessionStorage.removeItem('isTeacher');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(cards, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'words.json');
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

  // Student file import — no password required
  const handleStudentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed)) throw new Error('Not an array');
        importCards(parsed);
        setImportSuccess(`Загружено ${parsed.length} слов / ${parsed.length} words loaded`);
        setTimeout(() => setImportSuccess(null), 4000);
      } catch {
        alert('Не удалось прочитать файл. Убедитесь, что это правильный файл words.json.\nCould not read the file — make sure it is the correct words.json file.');
      }
    };
    reader.readAsText(file);
    // reset so the same file can be re-imported if needed
    e.target.value = '';
  };

  // ── Teacher view ──────────────────────────────────────────────────────────
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

  // ── Student view ──────────────────────────────────────────────────────────
  return (
    <div className="mt-20 border-t border-border/50 pt-8 pb-12 flex flex-col items-center gap-6" data-testid="teacher-login-area">

      {/* Student import button — always visible */}
      <div className="flex flex-col items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleStudentFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl font-semibold hover:bg-primary/20 transition-colors text-sm"
        >
          <Upload className="w-4 h-4" />
          Загрузить список слов / Load word list
        </button>
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Получи файл words.json от учителя и загрузи его здесь.<br />
          <span className="opacity-70">Get the words.json file from your teacher and load it here.</span>
        </p>
        {importSuccess && (
          <div className="flex items-center gap-2 text-green-600 font-medium text-sm animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            {importSuccess}
          </div>
        )}
      </div>

      {/* Teacher login — subtle, below */}
      <div className="flex flex-col items-center">
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

    </div>
  );
}
