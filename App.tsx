import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ParticleSystem from './components/ParticleSystem';
import Controls from './components/Controls';
import { ParticleShape, GeminiControlPayload, ParticleState } from './types';
import { COLORS } from './constants';
import { GeminiLiveService } from './services/geminiService';

const FRAME_RATE = 2; // Frames per second to send to Gemini (limit bandwidth)

const App: React.FC = () => {
  // Application State
  const [state, setState] = useState<ParticleState>({
    shape: ParticleShape.GALAXY,
    color: COLORS[ParticleShape.GALAXY],
    scale: 1,
    rotationSpeed: 0.2,
    count: 8000
  });
  
  const [isLive, setIsLive] = useState(false);
  const [status, setStatus] = useState("Ready to start");
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const geminiServiceRef = useRef<GeminiLiveService | null>(null);
  const intervalRef = useRef<number | null>(null);

  // --- Handlers ---

  const handleShapeChange = (shape: ParticleShape) => {
    setState(prev => ({ ...prev, shape, color: COLORS[shape] }));
  };

  const handleColorChange = (color: string) => {
    setState(prev => ({ ...prev, color }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // --- Gemini Integration ---

  // Callback when Gemini sends a command
  const onGeminiControl = useCallback((payload: GeminiControlPayload) => {
    setState(prev => {
      let newState = { ...prev };

      if (payload.scaleDelta) {
        // Smooth clamp scale
        const targetScale = prev.scale + payload.scaleDelta;
        newState.scale = Math.max(0.1, Math.min(3.0, targetScale));
      }

      if (payload.rotationDelta) {
        newState.rotationSpeed = Math.max(0.1, Math.min(2.0, prev.rotationSpeed + payload.rotationDelta));
      } else {
        // Decay rotation if no wave
        newState.rotationSpeed = Math.max(0.1, prev.rotationSpeed * 0.95);
      }

      if (payload.detectedShape) {
        // Map detected string to Enum if valid
        const shapeKey = payload.detectedShape.toUpperCase() as keyof typeof ParticleShape;
        if (ParticleShape[shapeKey]) {
           newState.shape = ParticleShape[shapeKey];
           newState.color = COLORS[ParticleShape[shapeKey]];
        }
      }

      return newState;
    });
    
    // Visual feedback of command
    setStatus(`AI Action: Scale ${payload.scaleDelta?.toFixed(1) || 0} | Shape: ${payload.detectedShape || 'None'}`);
    setTimeout(() => setStatus("Watching..."), 1000);
  }, []);

  const startGeminiLive = async () => {
    if (!process.env.API_KEY) {
      // Check for user provided key flow (Mocking the window.aistudio flow check or env check)
      // Since we can't pop a dialog easily in this strict code structure without more files,
      // We assume the environment variable is injected as per instructions.
      // If not, we'll try to use a standard prompt (conceptually).
      console.warn("No API Key found in env.");
    }

    try {
      setStatus("Initializing Camera...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus("Connecting to Gemini...");
      const service = new GeminiLiveService(process.env.API_KEY || '', onGeminiControl);
      await service.connect();
      geminiServiceRef.current = service;
      setIsLive(true);
      setStatus("Connected! Show gestures.");

      // Start Frame Loop
      startFrameStreaming();

    } catch (error) {
      console.error(error);
      setStatus("Error: " + (error as Error).message);
      setIsLive(false);
    }
  };

  const startFrameStreaming = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      if (!videoRef.current || !canvasRef.current || !geminiServiceRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx && video.videoWidth > 0) {
        // Downscale for performance/bandwidth
        canvas.width = 640; 
        canvas.height = 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        geminiServiceRef.current.sendFrame(base64);
      }
    }, 1000 / FRAME_RATE);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Stop tracks
      if (videoRef.current && videoRef.current.srcObject) {
         (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);


  return (
    <div className="relative w-full h-screen bg-neutral-900 overflow-hidden">
      
      {/* Hidden elements for processing */}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        
        <ParticleSystem 
          shape={state.shape}
          color={state.color}
          scale={state.scale}
          rotationSpeed={state.rotationSpeed}
        />
        
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>

      {/* UI Overlay */}
      <Controls 
        currentShape={state.shape}
        setShape={handleShapeChange}
        currentColor={state.color}
        setColor={handleColorChange}
        isLive={isLive}
        toggleLive={startGeminiLive}
        toggleFullscreen={toggleFullscreen}
        status={status}
      />
    </div>
  );
};

export default App;