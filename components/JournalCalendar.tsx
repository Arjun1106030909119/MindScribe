import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface JournalCalendarProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
}

export const JournalCalendar: React.FC<JournalCalendarProps> = ({ entries, onSelectEntry }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEntriesForDay = (day: number) => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getDate() === day &&
        entryDate.getMonth() === month &&
        entryDate.getFullYear() === year
      );
    });
  };

  const moodColors: Record<string, string> = {
    happy: 'bg-yellow-400',
    excited: 'bg-orange-400',
    neutral: 'bg-slate-400',
    sad: 'bg-blue-400',
    anxious: 'bg-purple-400',
  };

  const renderDays = () => {
    const days = [];
    
    // Empty cells for days before start of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 sm:h-32 bg-slate-50/50 border border-slate-100/50" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEntries = getEntriesForDay(day);
      const isToday = 
        day === new Date().getDate() && 
        month === new Date().getMonth() && 
        year === new Date().getFullYear();

      days.push(
        <div 
          key={day} 
          onClick={() => dayEntries.length > 0 && onSelectEntry(dayEntries[0])}
          className={`
            h-24 sm:h-32 border border-slate-100 p-2 relative transition-all
            ${dayEntries.length > 0 ? 'bg-white hover:bg-primary-50 cursor-pointer hover:shadow-md z-10' : 'bg-slate-50/30'}
            ${isToday ? 'ring-2 ring-inset ring-primary-400' : ''}
          `}
        >
          <span className={`
            inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
            ${isToday ? 'bg-primary-600 text-white' : 'text-slate-700'}
          `}>
            {day}
          </span>

          <div className="mt-2 flex flex-wrap gap-1 content-start">
            {dayEntries.map((entry) => (
              <div key={entry.id} className="w-full">
                {/* Desktop View: Title */}
                <div className="hidden sm:block text-xs truncate px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 shadow-sm mb-1">
                  {entry.mood && (
                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${moodColors[entry.mood] || 'bg-slate-300'}`}></span>
                  )}
                  {entry.title || 'Untitled'}
                </div>
                {/* Mobile View: Dot only */}
                <div className="sm:hidden flex justify-center">
                    <span className={`inline-block w-3 h-3 rounded-full ${entry.mood ? moodColors[entry.mood] : 'bg-primary-400'}`}></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white">
        <h2 className="text-2xl font-serif font-bold text-slate-900">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={prevMonth} className="!px-3">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="secondary" onClick={nextMonth} className="!px-3">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px border-b border-slate-200">
          {renderDays()}
        </div>
        
        {/* Legend */}
        <div className="p-4 flex flex-wrap gap-4 justify-center text-xs text-slate-500 border-t border-slate-100">
           <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Happy</div>
           <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span> Excited</div>
           <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Neutral</div>
           <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Sad</div>
           <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400"></span> Anxious</div>
        </div>
      </div>
    </div>
  );
};