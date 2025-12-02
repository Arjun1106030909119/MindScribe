import React from 'react';
import { JournalEntry } from '../types';
import { Plus, Search, Calendar, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface JournalListProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
}

export const JournalList: React.FC<JournalListProps> = ({ entries, onSelectEntry, onNewEntry }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDay = (timestamp: number) => {
    return new Date(timestamp).getDate();
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header / Search */}
      <div className="p-4 sm:p-6 bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-serif font-bold text-slate-900">My Journal</h1>
          <Button onClick={onNewEntry} className="hidden sm:flex">
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
           <button 
             onClick={onNewEntry}
             className="sm:hidden bg-primary-600 text-white p-2 rounded-full shadow-lg"
           >
             <Plus className="h-6 w-6" />
           </button>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Search your memories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 text-slate-300 mb-4">
                <Calendar className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No entries found</h3>
            <p className="mt-1 text-slate-500">
              {searchTerm ? 'Try a different search term.' : 'Start writing your first journal entry today.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                 <Button onClick={onNewEntry}>Create Entry</Button>
              </div>
            )}
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div 
              key={entry.id}
              onClick={() => onSelectEntry(entry)}
              className="group relative flex bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer"
            >
              {/* Date Block */}
              <div className="flex-shrink-0 mr-4 text-center">
                 <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                   {new Date(entry.date).toLocaleString('en-US', { month: 'short' })}
                 </div>
                 <div className="text-2xl font-bold text-slate-800 font-serif">
                   {getDay(entry.date)}
                 </div>
                 <div className="text-xs text-slate-400">
                    {new Date(entry.date).toLocaleString('en-US', { year: '2-digit' })}
                 </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-700 truncate font-serif">
                  {entry.title || 'Untitled Entry'}
                </h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {entry.content}
                </p>
                <div className="mt-2 flex items-center gap-2">
                    {entry.mood && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800 capitalize">
                           {entry.mood}
                        </span>
                    )}
                    {entry.tags?.map(tag => (
                        <span key={tag} className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                            #{tag}
                        </span>
                    ))}
                    <span className="text-xs text-slate-400 ml-auto">
                        {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
              </div>
              
              <div className="flex items-center pl-2 text-slate-300 group-hover:text-primary-400">
                  <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};