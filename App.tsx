import React, { useEffect, useState } from 'react';
import { User, JournalEntry } from './types';
import { getCurrentUser, getEntries, logout, saveEntry, deleteEntry } from './services/storage';
import { Auth } from './components/Auth';
import { JournalList } from './components/JournalList';
import { JournalEditor } from './components/JournalEditor';
import { JournalCalendar } from './components/JournalCalendar';
import { LogOut, BookHeart, AlertCircle, RefreshCw, Calendar, List } from 'lucide-react';
import { Button } from './components/Button';

type View = 'auth' | 'list' | 'editor' | 'calendar';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('auth');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Auth
  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          await loadEntries(currentUser.id);
          setView('list');
        } else {
          setView('auth');
        }
      } catch (error) {
        console.error("Failed to initialize auth", error);
        setView('auth');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadEntries = async (userId: string) => {
    setError(null);
    try {
      const data = await getEntries(userId);
      setEntries(data);
    } catch (err: any) {
      console.error("Failed to load entries:", err);
      setError(err.message || "Failed to load journal entries");
    }
  };

  const handleLogin = async (loggedInUser: User) => {
    setLoading(true);
    try {
      setUser(loggedInUser);
      await loadEntries(loggedInUser.id);
      setView('list');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setEntries([]);
    setView('auth');
  };

  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setView('editor');
  };

  const handleNewEntry = () => {
    setSelectedEntry(undefined);
    setView('editor');
  };

  const handleSaveEntry = async (entry: JournalEntry) => {
    if (!user) return;
    await saveEntry(entry);
    await loadEntries(user.id);
    setView('list');
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;
    await deleteEntry(entryId);
    await loadEntries(user.id);
    setView('list');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-slate-50">
      
      {/* Sidebar (Desktop) */}
      {view !== 'auth' && (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                <BookHeart className="h-6 w-6 text-primary-600" />
                <span className="font-serif font-bold text-lg text-slate-800">MindScribe</span>
            </div>
            
            <div className="flex-1 p-4">
                <div className="mb-8">
                     <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">User</p>
                     <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                         <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                             {user?.name.charAt(0).toUpperCase()}
                         </div>
                         <div className="flex-1 min-w-0">
                             <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                             <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                         </div>
                     </div>
                </div>

                <nav className="space-y-1">
                    <button 
                        onClick={() => {
                            setView('list');
                            setSelectedEntry(undefined);
                        }}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${view === 'list' ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                        <List className="h-4 w-4 mr-3" />
                        All Entries
                    </button>
                    <button 
                        onClick={() => setView('calendar')}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${view === 'calendar' ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                        <Calendar className="h-4 w-4 mr-3" />
                        Calendar View
                    </button>
                </nav>
            </div>

            <div className="p-4 border-t border-slate-100">
                <button 
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden relative">
        {view === 'auth' && <Auth onLogin={handleLogin} />}
        
        {view !== 'auth' && user && (
            <div className="h-full flex flex-col">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <BookHeart className="h-6 w-6 text-primary-600" />
                        <span className="font-serif font-bold text-lg">MindScribe</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setView(view === 'calendar' ? 'list' : 'calendar')}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-full"
                      >
                         {view === 'calendar' ? <List className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                      </button>
                      <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-600">
                          <LogOut className="h-5 w-5" />
                      </button>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="bg-red-50 p-4 border-b border-red-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => user && loadEntries(user.id)}
                      className="text-red-700 hover:bg-red-100 hover:text-red-800"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                )}

                <div className="flex-1 overflow-hidden relative">
                    {view === 'list' && (
                       <JournalList 
                           entries={entries} 
                           onSelectEntry={handleSelectEntry} 
                           onNewEntry={handleNewEntry} 
                       />
                    )}

                    {view === 'calendar' && (
                        <JournalCalendar
                           entries={entries}
                           onSelectEntry={handleSelectEntry}
                        />
                    )}

                    {view === 'editor' && (
                        <div className="absolute inset-0 bg-white z-10">
                            <JournalEditor 
                                entry={selectedEntry}
                                userId={user.id}
                                onSave={handleSaveEntry}
                                onDelete={handleDeleteEntry}
                                onBack={() => setView('list')}
                            />
                        </div>
                    )}
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

export default App;