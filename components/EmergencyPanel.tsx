import React, { useState, useEffect } from 'react';
import { findNearbyHospitals } from '../services/geminiService';
import { Hospital } from '../types';

interface EmergencyPanelProps {
  onClose: () => void;
}

const EmergencyPanel: React.FC<EmergencyPanelProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const result = await findNearbyHospitals(position.coords.latitude, position.coords.longitude);
          setHospitals(result.places);
          setLoading(false);
        } catch (err) {
          setError("Could not fetch hospital data.");
          setLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4 animate-fade-in">
      <div className="w-full sm:max-w-md bg-white sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden border border-white/50 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-rose-50 p-6 pb-8 flex justify-between items-start border-b border-rose-100">
          <div>
            <h2 className="text-2xl font-bold text-rose-600 flex items-center gap-2">
              Nearest Help
            </h2>
            <p className="text-rose-400 text-sm font-semibold mt-1">Medical Centers Nearby</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-rose-200 text-rose-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-2 sm:p-4 overflow-y-auto bg-slate-50 flex-1 -mt-4 rounded-t-[2rem] relative z-10">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-400 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold text-sm tracking-wide uppercase">Locating...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-10 px-6">
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">!</div>
              <p className="text-slate-700 font-bold text-lg mb-2">Connection Issue</p>
              <p className="text-slate-500 text-sm mb-6">{error}</p>
              <a href="tel:911" className="inline-block bg-rose-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-rose-200">Call Emergency Services</a>
            </div>
          )}

          {!loading && !error && hospitals.length === 0 && (
             <div className="text-center py-12 px-6">
               <p className="text-slate-500 font-medium">We couldn't find specific hospital data from the AI provider right now.</p>
               <a 
                 href="https://www.google.com/maps/search/hospitals+near+me" 
                 target="_blank"
                 className="mt-6 inline-block text-sky-500 font-bold hover:underline"
               >
                 Open Google Maps
               </a>
             </div>
          )}

          {!loading && !error && hospitals.length > 0 && (
            <div className="space-y-3 pt-4 px-2 pb-8">
              {hospitals.map((hospital, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{hospital.title}</h3>
                    <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Medical</span>
                  </div>
                  
                  <p className="text-slate-500 text-sm">{hospital.address}</p>
                  
                  {hospital.uri && (
                      <a 
                        href={hospital.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center justify-center w-full py-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors text-sm border border-slate-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2 text-slate-400">
                           <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        View Map
                      </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyPanel;