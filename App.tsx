
import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthState } from './types';
import { LoginView, SignupView } from './components/AuthForms';
import Avatar from './components/Avatar';
import { useLiveGemini } from './hooks/useLiveGemini';
import EmergencyPanel from './components/EmergencyPanel';
import RemindersPanel from './components/RemindersPanel';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { isConnected, isTalking, isBreathing, connect, disconnect, error, sendText, currentResponse } = useLiveGemini();
  const [showEmergency, setShowEmergency] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // Logic to handle actions triggered while disconnected
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && pendingAction) {
        // Small delay to ensure session is fully ready/greeting is queued
        const timer = setTimeout(() => {
            sendText(pendingAction);
            setPendingAction(null);
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [isConnected, pendingAction, sendText]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && isConnected) {
      sendText(inputText);
      setInputText('');
    }
  };

  const handleQuickAction = (actionText: string) => {
      if (!isConnected) {
          setPendingAction(actionText);
          connect();
      } else {
          sendText(actionText);
      }
  };

  return (
    <div className="h-full relative flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-200 via-purple-100 to-pink-100 overflow-hidden">
      
      {/* Ambient Background Globs - Enhanced */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-blue-400/20 rounded-full blur-[90px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vh] h-[60vh] bg-purple-400/20 rounded-full blur-[110px]"></div>
          <div className="absolute top-[40%] left-[30%] w-[40vh] h-[40vh] bg-rose-300/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full px-8 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/80 backdrop-blur rounded-2xl shadow-sm flex items-center justify-center border border-white overflow-hidden">
               {/* Mini Avatar for Logo */}
               <div className="scale-[0.25] w-full h-full flex items-center justify-center transform translate-y-1">
                 <Avatar isConnected={true} isTalking={false} />
               </div>
            </div>
            <span className="font-bold text-slate-700 tracking-tight text-lg">Mallow</span>
        </div>
        <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm font-semibold text-slate-500 bg-white/40 px-4 py-1.5 rounded-full">
                Hi, {user?.name}
            </span>
            
            <button 
                onClick={() => setShowReminders(true)}
                className="w-9 h-9 flex items-center justify-center bg-white/60 hover:bg-white rounded-full text-slate-400 hover:text-amber-500 transition-colors shadow-sm"
                title="Reminders"
            >
                {user?.reminders && user.reminders.length > 0 && (
                    <span className="absolute top-3 right-[74px] w-2.5 h-2.5 bg-amber-500 rounded-full border border-white"></span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9c.465 1.494 1.622 2.751 3.248 2.751 1.626 0 2.783-1.257 3.248-2.751 3.248.87-.29 1.614-.868 2.373-2.185a3.09 3.09 0 00-.916-1.566 24.641 24.641 0 01-3.636 0c-.57.34-1.2.668-1.901 1.002z" clipRule="evenodd" />
                </svg>
            </button>

            <button 
                onClick={logout}
                className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
                Log out
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-lg mx-auto px-6 pb-28 md:pb-24">
        
        {/* Chat Bubble (AI Response) */}
        {isConnected && currentResponse && (
          <div className="absolute top-2 md:top-8 w-full flex justify-center z-20 animate-fade-in-up">
             <div className="glass-card px-6 py-4 rounded-3xl rounded-tl-sm max-w-[95%] md:max-w-md shadow-lg border-white/60">
                <p className="text-slate-700 font-medium leading-relaxed text-sm md:text-base line-clamp-4">
                   {currentResponse}
                </p>
             </div>
          </div>
        )}

        {/* Avatar Container */}
        <div className="mb-8 scale-110 md:scale-125 transition-transform duration-500 mt-4">
            <Avatar isTalking={isTalking} isConnected={isConnected} isBreathing={isBreathing} />
        </div>

        {/* Status Indicator / Error Message */}
        <div className="h-6 mb-6 flex items-center justify-center">
             {error ? (
                <span className="bg-rose-100 text-rose-600 px-4 py-1.5 rounded-full text-xs font-bold animate-shake">
                    {error}
                </span>
             ) : (
                <span className={`text-sm font-bold tracking-wide transition-colors duration-300 ${isBreathing ? 'text-emerald-500' : isConnected ? 'text-sky-500' : 'text-slate-400'}`}>
                    {isConnected 
                        ? (isBreathing 
                            ? "BREATHING EXERCISE..." 
                            : isTalking 
                                ? "MALLOW IS SPEAKING..." 
                                : "LISTENING...") 
                        : "OFFLINE - TAP MALLOW TO WAKE UP"}
                </span>
             )}
        </div>

        {/* Big Interaction Button */}
        <div className="relative group mb-8">
            {/* Ripples when active */}
            {isConnected && !isBreathing && (
                <>
                    <div className="absolute inset-0 bg-sky-400/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-[-10px] bg-sky-400/10 rounded-full animate-pulse"></div>
                </>
            )}
             {/* Breathing Ripples */}
             {isBreathing && (
                <>
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-[-10px] bg-emerald-400/10 rounded-full animate-pulse"></div>
                </>
            )}

            <button 
                onClick={isConnected ? disconnect : connect}
                className={`
                    relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300
                    ${isConnected 
                        ? 'bg-white text-rose-500 rotate-180 hover:bg-rose-50 hover:shadow-rose-200/50' 
                        : 'bg-gradient-to-tr from-sky-400 to-indigo-500 text-white hover:scale-110 hover:shadow-sky-300/50'
                    }
                `}
            >
                {isConnected ? (
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10 ml-0.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                )}
            </button>
        </div>

        {/* Quick Actions Grid */}
        <div className="w-full grid grid-cols-3 gap-3">
             <button 
                onClick={() => handleQuickAction("Start the breathing exercise now.")}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/40 hover:bg-white/70 border border-white/50 shadow-sm transition-all hover:scale-105 active:scale-95 gap-2 group"
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
                    </svg>
                </div>
                <span className="text-xs font-bold text-slate-600">Breathing Space</span>
             </button>

             <button 
                onClick={() => handleQuickAction("I want to describe my symptoms to you for advice.")}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/40 hover:bg-white/70 border border-white/50 shadow-sm transition-all hover:scale-105 active:scale-95 gap-2 group"
             >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                         <path fillRule="evenodd" d="M11.484 2.17a.75.75 0 011.032 0 11.209 11.209 0 007.877 3.08.75.75 0 01.722.515 12.74 12.74 0 01.635 3.985c0 5.942-4.064 10.933-9.563 12.348a.749.749 0 01-.374 0C6.314 20.683 2.25 15.692 2.25 9.75c0-1.39.223-2.73.635-3.985a.75.75 0 01.722-.516 11.209 11.209 0 007.877-3.08zM12 9.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                    </svg>
                </div>
                <span className="text-xs font-bold text-slate-600">Symptom Check</span>
             </button>

             <button 
                onClick={() => handleQuickAction("I need help finding care or medical resources.")}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/40 hover:bg-white/70 border border-white/50 shadow-sm transition-all hover:scale-105 active:scale-95 gap-2 group"
             >
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 group-hover:bg-rose-200 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                </div>
                <span className="text-xs font-bold text-slate-600">Find Care</span>
             </button>
        </div>

      </main>

      {/* Footer Area: Text Input (Condensed) */}
      <div className="absolute bottom-6 w-full px-6 z-30 flex flex-col gap-4 items-center">
        
        {/* Text Input Bar (Only when connected) */}
        {isConnected && (
           <form onSubmit={handleSendMessage} className="w-full max-w-md relative animate-fade-in-up">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe your symptoms..."
                className="w-full pl-5 pr-12 py-3.5 rounded-full bg-white/80 backdrop-blur-md border border-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 shadow-lg text-slate-700 placeholder:text-slate-400 font-semibold"
              />
              <button 
                type="submit" 
                disabled={!inputText.trim()}
                className="absolute right-2 top-1.5 w-9 h-9 bg-sky-500 rounded-full flex items-center justify-center text-white hover:bg-sky-600 disabled:opacity-50 disabled:hover:bg-sky-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 translate-x-0.5">
                    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                </svg>
              </button>
           </form>
        )}
      </div>

      {showEmergency && <EmergencyPanel onClose={() => setShowEmergency(false)} />}
      {showReminders && <RemindersPanel onClose={() => setShowReminders(false)} />}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { authState } = useAuth();

  // Common wrapper for auth screens
  const AuthWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-sky-100 to-pink-100 relative overflow-hidden">
        {/* Shared Background for consistency */}
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-purple-300 rounded-full blur-[130px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-sky-300 rounded-full blur-[130px] opacity-30"></div>
        
        <div className="relative z-10 w-full max-w-md animate-fade-in-up">
            <div className="flex flex-col items-center mb-4">
                {/* Replaced Candy Emoji with Mallow Avatar */}
                <div className="scale-[0.55] h-40 flex items-center justify-center -mb-6 mt-[-30px]">
                    <Avatar isConnected={true} isTalking={false} />
                </div>
                <h1 className="text-4xl font-bold text-slate-700 tracking-tight z-10 relative">Mallow</h1>
            </div>
            {children}
        </div>
    </div>
  );

  if (authState === AuthState.AUTHENTICATED) {
    return <Dashboard />;
  }

  if (authState === AuthState.SIGNUP) {
      return (
        <AuthWrapper>
            <SignupView />
        </AuthWrapper>
      );
  }

  // Default to Login or Unauthenticated
  return (
    <AuthWrapper>
        <LoginView />
    </AuthWrapper>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
