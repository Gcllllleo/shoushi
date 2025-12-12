import React from 'react';
import { ParticleShape } from '../types';

interface ControlsProps {
  currentShape: ParticleShape;
  setShape: (s: ParticleShape) => void;
  currentColor: string;
  setColor: (c: string) => void;
  isLive: boolean;
  toggleLive: () => void;
  toggleFullscreen: () => void;
  status: string;
}

const Controls: React.FC<ControlsProps> = ({
  currentShape,
  setShape,
  currentColor,
  setColor,
  isLive,
  toggleLive,
  toggleFullscreen,
  status
}) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-6">
      
      {/* Header / Status */}
      <div className="pointer-events-auto flex justify-between items-start">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl max-w-sm">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Gemini Particles
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            {status}
          </p>
          <div className="mt-2 flex items-center space-x-2 text-xs text-gray-400">
             <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
             <span>Vision AI: {isLive ? 'Active' : 'Offline'}</span>
          </div>
        </div>

        <button 
          onClick={toggleFullscreen}
          className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all border border-white/10 backdrop-blur-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        </button>
      </div>

      {/* Control Panel */}
      <div className="pointer-events-auto self-center md:self-end bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl w-full max-w-xs transition-all">
        
        {/* API Key Start Button (if not live) */}
        {!isLive && (
             <button
             onClick={toggleLive}
             className="w-full mb-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg transform hover:scale-[1.02]"
           >
             Start Camera & AI
           </button>
        )}
       
        {/* Shape Selector */}
        <div className="mb-6">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Model</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(ParticleShape).map((shape) => (
              <button
                key={shape}
                onClick={() => setShape(shape)}
                className={`text-xs py-2 rounded-lg border transition-all ${
                  currentShape === shape
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-transparent text-gray-300 border-white/20 hover:border-white/50'
                }`}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div className="mb-4">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Color</label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
            />
            <span className="text-sm font-mono text-gray-300">{currentColor}</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5">
            <p className="text-[10px] text-gray-400 leading-relaxed">
                <strong className="text-white">Gestures:</strong><br/>
                👋 Wave to rotate<br/>
                👐 Spread hands to expand<br/>
                🤏 Pinch hands to shrink<br/>
                🫶 Heart gesture for Heart Mode
            </p>
        </div>

      </div>
    </div>
  );
};

export default Controls;