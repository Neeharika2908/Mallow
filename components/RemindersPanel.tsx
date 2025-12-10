
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RemindersPanelProps {
  onClose: () => void;
}

const RemindersPanel: React.FC<RemindersPanelProps> = ({ onClose }) => {
  const { user, removeReminder } = useAuth();
  const reminders = user?.reminders || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-amber-50 p-6 pb-8 flex justify-between items-start border-b border-amber-100">
          <div>
            <h2 className="text-2xl font-bold text-amber-600 flex items-center gap-2">
              My Health Plan
            </h2>
            <p className="text-amber-400 text-sm font-semibold mt-1">Reminders & Follow-ups</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-amber-100 text-amber-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto bg-slate-50 flex-1 -mt-4 rounded-t-[2rem] relative z-10">
          
          {reminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">No reminders yet.</p>
              <p className="text-slate-400 text-sm mt-2">Mallow will suggest reminders during your conversations if you need follow-up care.</p>
            </div>
          ) : (
            <div className="space-y-3 pt-4 pb-8">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{reminder.title}</h3>
                    <button 
                        onClick={() => removeReminder(reminder.id)}
                        className="text-slate-300 hover:text-rose-400 p-1"
                        title="Remove"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wide mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                        </svg>
                      {reminder.timeframe}
                  </div>
                  
                  <p className="text-slate-500 text-sm bg-slate-50 p-3 rounded-xl">
                    {reminder.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemindersPanel;
