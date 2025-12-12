import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { GeminiControlPayload } from '../types';

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private sessionPromise: Promise<any> | null = null;
  private onControlUpdate: (payload: GeminiControlPayload) => void;

  constructor(apiKey: string, onUpdate: (payload: GeminiControlPayload) => void) {
    this.ai = new GoogleGenAI({ apiKey });
    this.onControlUpdate = onUpdate;
  }

  public async connect() {
    // Define the tool for the model to use to control the particles
    const controlParticlesTool: FunctionDeclaration = {
      name: 'controlParticles',
      parameters: {
        type: Type.OBJECT,
        description: 'Update the 3D particle system based on user hand gestures.',
        properties: {
          scaleDelta: {
            type: Type.NUMBER,
            description: 'Change in size. Positive (0.1 to 0.5) to expand (hands moving apart), negative (-0.1 to -0.5) to shrink (hands closing).',
          },
          rotationDelta: {
            type: Type.NUMBER,
            description: 'Change in rotation speed. Positive value (e.g., 0.5) if user is waving.',
          },
          detectedShape: {
            type: Type.STRING,
            description: 'Name of shape if user mimics a shape (e.g., "HEART").',
          },
        },
      },
    };

    const config = {
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO], // We need audio out for confirmation, but mainly tool use
        systemInstruction: `
          You are a visual gesture controller for a 3D particle system. 
          Continuously analyze the video stream.
          1. If you see two hands moving APART, call controlParticles with a positive scaleDelta (e.g. 0.2).
          2. If you see two hands moving TOGETHER/PINCHING, call controlParticles with a negative scaleDelta (e.g. -0.2).
          3. If you see a hand WAVING, call controlParticles with rotationDelta (e.g. 0.5).
          4. If hands form a HEART shape, call controlParticles with detectedShape="HEART".
          5. If hands show a THUMBS UP, call controlParticles with detectedShape="GALAXY".
          
          Be responsive. React immediately to motion.
        `,
        tools: [{ functionDeclarations: [controlParticlesTool] }],
      },
      callbacks: {
        onopen: () => console.log('Gemini Live Connected'),
        onclose: () => console.log('Gemini Live Closed'),
        onerror: (e: any) => console.error('Gemini Live Error', e),
        onmessage: (msg: LiveServerMessage) => this.handleMessage(msg),
      },
    };

    this.sessionPromise = this.ai.live.connect(config);
    await this.sessionPromise;
  }

  private handleMessage(message: LiveServerMessage) {
    if (message.toolCall) {
      for (const fc of message.toolCall.functionCalls) {
        if (fc.name === 'controlParticles') {
          const args = fc.args as GeminiControlPayload;
          this.onControlUpdate(args);
          
          // Send response back
          this.sessionPromise?.then(session => {
            session.sendToolResponse({
              functionResponses: {
                id: fc.id,
                name: fc.name,
                response: { result: 'updated' }
              }
            });
          });
        }
      }
    }
  }

  public async sendFrame(base64Image: string) {
    if (!this.sessionPromise) return;
    
    const session = await this.sessionPromise;
    session.sendRealtimeInput({
      media: {
        mimeType: 'image/jpeg',
        data: base64Image
      }
    });
  }

  public async disconnect() {
      // No direct disconnect method exposed in the easy SDK, usually just stop sending or let connection timeout/close
      // In a real app we might close the websocket manually if exposed, but for now we stop sending frames.
  }
}
