import React from 'react';

interface AvatarProps {
  isTalking: boolean;
  isConnected: boolean;
  isBreathing?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ isTalking, isConnected, isBreathing = false }) => {
  return (
    <div className="relative w-72 h-72 flex items-center justify-center">
      
      {/* Dynamic Aura/Glow behind the bot */}
      <div 
        className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-1000
          ${isBreathing 
            ? 'bg-emerald-300/40 scale-150 animate-pulse' 
            : isTalking 
                ? 'bg-sky-400/40 scale-125' 
                : isConnected 
                    ? 'bg-purple-300/30 scale-100' 
                    : 'bg-slate-300/10 scale-90'
          }
        `}
      />

      {/* Main Body Container */}
      <div className={`
        relative w-48 h-44 transition-all duration-500 ease-out
        ${isBreathing 
            ? 'animate-breathe-deep' 
            : isTalking 
                ? 'animate-talk' 
                : 'animate-float'
        }
        ${!isConnected ? 'grayscale-[0.5] opacity-80' : ''}
      `}>
        
        {/* The Marshmallow Shape */}
        <div className={`
            absolute inset-0 mallow-body rounded-[3rem] z-10 border border-white/60 transition-colors duration-1000
            ${isBreathing ? 'shadow-emerald-200/50' : ''}
        `}></div>

        {/* Face Container */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pt-4">
          
          {/* Eyes */}
          <div className="flex gap-8 mb-3">
            <div className={`
              w-4 h-4 rounded-full bg-slate-800 transition-all duration-300
              ${isBreathing ? 'scale-100' : isTalking ? 'scale-110' : 'animate-blink'}
              ${!isBreathing && isConnected && !isTalking ? 'scale-100' : isBreathing ? '' : 'scale-95 opacity-80'}
            `}></div>
            <div className={`
              w-4 h-4 rounded-full bg-slate-800 transition-all duration-300
              ${isBreathing ? 'scale-100' : isTalking ? 'scale-110' : 'animate-blink'}
              ${!isBreathing && isConnected && !isTalking ? 'scale-100' : isBreathing ? '' : 'scale-95 opacity-80'}
            `}></div>
          </div>

          {/* Cheeks */}
          <div className={`
            absolute top-16 w-full flex justify-between px-8 transition-all duration-500
            ${isTalking ? 'opacity-70 scale-110' : 'opacity-40 scale-100'}
          `}>
            <div className={`w-5 h-3 rounded-full blur-[4px] transition-colors ${isBreathing ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
            <div className={`w-5 h-3 rounded-full blur-[4px] transition-colors ${isBreathing ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
          </div>

          {/* Mouth */}
          <div className={`
            transition-all duration-200 ease-in-out
            ${isBreathing
                ? 'w-4 h-2 bg-slate-800 rounded-full scale-110 mt-1 opacity-80' // Breathing 'o' mouth
                : isTalking 
                  ? 'w-6 h-4 bg-slate-800 rounded-[50%_50%_40%_40%] animate-mouth' // Talking mouth open with animation
                  : isConnected 
                    ? 'w-6 h-3 border-b-4 border-slate-800 rounded-[100%] mt-[-4px]' // Happy smile
                    : 'w-3 h-1 bg-slate-400 rounded-full mt-1' // Idle/Offline dot
            }
          `}></div>
        </div>

        {/* Hands / Gestures */}
        <div className={`absolute top-24 -left-4 z-0 transition-all duration-500 
            ${isBreathing 
                ? '-rotate-45 translate-y-2' // Arms out/relaxed for breathing
                : isTalking 
                    ? 'animate-wave-left' 
                    : 'rotate-12 translate-x-2'
            }`}>
           <div className="w-10 h-10 mallow-body rounded-full shadow-sm"></div>
        </div>
        <div className={`absolute top-24 -right-4 z-0 transition-all duration-500 
            ${isBreathing 
                ? 'rotate-45 translate-y-2' 
                : isTalking 
                    ? 'animate-wave-right' 
                    : '-rotate-12 -translate-x-2'
            }`}>
           <div className="w-10 h-10 mallow-body rounded-full shadow-sm"></div>
        </div>

        {/* Highlight Reflection */}
        <div className="absolute top-4 left-8 w-10 h-6 bg-white rounded-full opacity-60 blur-[2px] z-30 rotate-[-15deg]"></div>
      </div>

      {/* Shadow Grounding */}
      <div className={`
        absolute bottom-0 w-32 h-6 bg-slate-900/5 rounded-[100%] blur-md transition-all duration-300
        ${isBreathing ? 'scale-110 opacity-30' : isTalking ? 'scale-90 opacity-40' : 'scale-100 opacity-60'}
      `}></div>

    </div>
  );
};

export default Avatar;