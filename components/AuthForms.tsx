
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthState } from '../types';

export const LoginView: React.FC = () => {
  const { login, setAuthState } = useAuth();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(email) login(email);
  };

  return (
    <div className="glass-card p-10 rounded-3xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">Welcome Back</h2>
      <p className="text-center text-slate-500 mb-8 font-medium text-sm">Your AI companion is waiting.</p>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
          <input 
            type="email" 
            required
            className="w-full px-5 py-4 rounded-xl bg-white/50 border border-white focus:bg-white focus:ring-2 focus:ring-sky-200 focus:outline-none transition-all placeholder:text-slate-300 font-semibold text-slate-700"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <button 
          type="submit"
          className="w-full py-4 rounded-xl bg-slate-800 text-white font-bold shadow-lg shadow-slate-300 hover:bg-slate-700 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
        >
          Wake up Mallow
        </button>
      </form>
      
      <div className="mt-8 text-center border-t border-slate-100 pt-6">
        <p className="text-sm text-slate-500 font-medium">
          New here? {' '}
          <button 
            onClick={() => setAuthState(AuthState.SIGNUP)}
            className="text-sky-500 font-bold hover:underline decoration-2 underline-offset-2"
          >
            Create profile
          </button>
        </p>
      </div>
    </div>
  );
};

export const SignupView: React.FC = () => {
  const { signup, setAuthState } = useAuth();
  const [step, setStep] = useState(1);
  
  // Basic Info
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  
  // Medical Info
  const [chronicConditions, setChronicConditions] = useState('');
  const [pastIllnesses, setPastIllnesses] = useState('');
  const [allergies, setAllergies] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(email && name) {
        signup(email, { 
            name, 
            age: parseInt(age) || undefined, 
            chronicConditions,
            pastIllnesses,
            allergies,
            familyHistory
        });
    }
  };

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  return (
    <div className="glass-card p-8 rounded-3xl max-h-[70vh] overflow-y-auto custom-scrollbar relative">
      <div className="flex justify-center mb-6">
        <div className="flex gap-2">
            <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 1 ? 'bg-indigo-500' : 'bg-indigo-100'}`}></div>
            <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 2 ? 'bg-indigo-500' : 'bg-indigo-100'}`}></div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-1 text-center">
        {step === 1 ? 'Say Hello!' : 'Medical Profile'}
      </h2>
      <p className="text-center text-slate-500 mb-6 text-sm font-medium">
        {step === 1 ? 'Create your profile to get started.' : 'Help Mallow understand your health.'}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {step === 1 && (
            <div className="space-y-4 animate-fade-in-up">
                <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1 ml-1">Your Name</label>
                <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white focus:bg-white focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all font-semibold text-slate-700"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="What should Mallow call you?"
                />
                </div>
                <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1 ml-1">Email</label>
                <input 
                    type="email" 
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white focus:bg-white focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all font-semibold text-slate-700"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1 ml-1">Age</label>
                    <input 
                        type="number" 
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white focus:bg-white focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all font-semibold text-slate-700"
                        value={age}
                        onChange={e => setAge(e.target.value)}
                    />
                </div>
                
                <button 
                    type="button"
                    onClick={nextStep}
                    disabled={!name || !email}
                    className="w-full mt-4 py-4 rounded-xl bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-600 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                    Next: Medical History
                </button>
            </div>
        )}

        {step === 2 && (
             <div className="space-y-4 animate-fade-in-up">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1 ml-1">Chronic Conditions</label>
                  <textarea 
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white focus:bg-white focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all font-semibold text-slate-700 resize-none text-sm"
                    rows={2}
                    value={chronicConditions}
                    onChange={e => setChronicConditions(e.target.value)}
                    placeholder="e.g. Diabetes, Asthma..."
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1 ml-1">Allergies</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white focus:bg-white focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all font-semibold text-slate-700 text-sm"
                    value={allergies}
                    onChange={e => setAllergies(e.target.value)}
                    placeholder="e.g. Peanuts, Penicillin..."
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1 ml-1">Past Illnesses</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white focus:bg-white focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all font-semibold text-slate-700 text-sm"
                            value={pastIllnesses}
                            onChange={e => setPastIllnesses(e.target.value)}
                            placeholder="e.g. Surgery in 2019"
                        />
                    </div>
                </div>
                 <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1 ml-1">Family Medical History</label>
                  <textarea 
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white focus:bg-white focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all font-semibold text-slate-700 resize-none text-sm"
                    rows={2}
                    value={familyHistory}
                    onChange={e => setFamilyHistory(e.target.value)}
                    placeholder="e.g. Heart disease on father's side"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                    <button 
                        type="button"
                        onClick={prevStep}
                        className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-all"
                    >
                        Back
                    </button>
                    <button 
                        type="submit"
                        className="flex-[2] py-4 rounded-xl bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-600 hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        Start Friendship
                    </button>
                </div>
            </div>
        )}

      </form>
      <div className="mt-6 text-center pt-4 border-t border-slate-100">
        <p className="text-sm text-slate-500 font-medium">
          Already friends? {' '}
          <button 
            onClick={() => setAuthState(AuthState.LOGIN)}
            className="text-indigo-500 font-bold hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};
