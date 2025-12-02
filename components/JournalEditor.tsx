import React, { useState } from 'react';
import { JournalEntry, AIAnalysis } from '../types';
import { Button } from './Button';
import { ArrowLeft, Save, Trash2, Sparkles, X } from 'lucide-react';
import { analyzeEntry } from '../services/geminiService';

interface JournalEditorProps {
  entry?: JournalEntry;
  userId: string;
  onSave: (entry: JournalEntry) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
  onBack: () => void;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({ 
  entry, 
  userId, 
  onSave, 
  onDelete, 
  onBack 
}) => {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState<JournalEntry['mood']>(entry?.mood || 'neutral');
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    try {
        const newEntry: JournalEntry = {
            id: entry?.id || crypto.randomUUID(),
            userId,
            title: title.trim(),
            content: content.trim(),
            date: entry?.date ? Number(entry.date) : Date.now(),
            updatedAt: Date.now(),
            mood,
            tags
        };
        await onSave(newEntry);
    } catch (error: any) {
        alert(`Failed to save entry: ${error.message}`);
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async () => {
      if (!entry) return;
      if(window.confirm('Are you sure you want to delete this entry?')) {
          try {
              await onDelete(entry.id);
          } catch (error: any) {
              alert(`Failed to delete entry: ${error.message}`);
          }
      }
  };

  const handleAnalyze = async () => {
    if (!content || content.length < 10) return;
    setIsAnalyzing(true);
    try {
        const result = await analyzeEntry(content);
        setAnalysis(result);
        setShowAnalysis(true);
        if (result.sentiment) {
             const sentimentLower = result.sentiment.toLowerCase();
             if (sentimentLower.includes('happy') || sentimentLower.includes('joy')) setMood('happy');
             else if (sentimentLower.includes('sad')) setMood('sad');
             else if (sentimentLower.includes('anx')) setMood('anxious');
             else if (sentimentLower.includes('excit')) setMood('excited');
             else setMood('neutral');
        }
        if (result.keywords) {
            const newTags = Array.from(new Set([...tags, ...result.keywords]));
            setTags(newTags);
        }

    } catch (e) {
        alert("Could not analyze entry. Please check your network connection.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
            <button 
              onClick={onBack} 
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            >
                <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-2">
                <Button 
                    variant="ghost" 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing || !content}
                    className="hidden sm:flex"
                >
                    <Sparkles className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-pulse text-primary-500' : 'text-purple-500'}`} />
                    {isAnalyzing ? 'Analyzing...' : 'AI Reflect'}
                </Button>
                {/* Mobile Icon Only */}
                <button 
                     onClick={handleAnalyze}
                     disabled={isAnalyzing || !content}
                     className="sm:hidden p-2 text-purple-600 hover:bg-purple-50 rounded-full"
                >
                     <Sparkles className={`h-5 w-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                </button>

                {entry && (
                    <button 
                        onClick={handleDelete}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                )}
                <Button onClick={handleSave} isLoading={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                </Button>
            </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto p-6 space-y-6">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title (optional)"
                    className="w-full text-3xl font-serif font-bold text-slate-900 placeholder-slate-300 border-none focus:ring-0 p-0 bg-transparent"
                />
                
                <div className="flex items-center gap-4 text-sm text-slate-400 border-b border-slate-100 pb-4">
                    <span>{new Date(entry?.date ? Number(entry.date) : Date.now()).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span>|</span>
                    <select 
                        value={mood} 
                        onChange={(e) => setMood(e.target.value as any)}
                        className="bg-transparent border-none text-slate-500 focus:ring-0 p-0 text-sm cursor-pointer hover:text-primary-600"
                    >
                        <option value="neutral">Neutral 😐</option>
                        <option value="happy">Happy 😊</option>
                        <option value="excited">Excited 🤩</option>
                        <option value="sad">Sad 😔</option>
                        <option value="anxious">Anxious 😰</option>
                    </select>
                </div>

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind today?"
                    className="w-full h-[60vh] resize-none text-lg leading-relaxed text-slate-700 placeholder-slate-300 border-none focus:ring-0 p-0 bg-transparent font-sans"
                    autoFocus
                />
            </div>
        </div>

        {/* Analysis Modal/Panel */}
        {showAnalysis && analysis && (
            <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                             <Sparkles className="h-5 w-5 text-yellow-300" />
                             <h3 className="font-bold">AI Reflection</h3>
                        </div>
                        <button onClick={() => setShowAnalysis(false)} className="text-white/80 hover:text-white">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Summary</h4>
                            <p className="text-slate-800 leading-relaxed">{analysis.summary}</p>
                        </div>
                        
                        <div className="flex gap-4">
                             <div className="flex-1">
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Sentiment</h4>
                                <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                                    {analysis.sentiment}
                                </span>
                             </div>
                             <div className="flex-1">
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Keywords</h4>
                                <div className="flex flex-wrap gap-1">
                                    {analysis.keywords.slice(0, 3).map(k => (
                                        <span key={k} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">#{k}</span>
                                    ))}
                                </div>
                             </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                            <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">Thought for you</h4>
                            <p className="text-amber-900 italic font-serif">"{analysis.advice}"</p>
                        </div>

                        <Button onClick={() => setShowAnalysis(false)} className="w-full mt-2">
                            Back to Journal
                        </Button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
