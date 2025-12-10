
import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { API_KEY, MODEL_NAME, SYSTEM_INSTRUCTION_TEMPLATE } from '../constants';
import { createBlob, decodeAudioData, decode } from '../services/audioUtils';
import { useAuth } from '../contexts/AuthContext';

const reminderTool: FunctionDeclaration = {
  name: "scheduleReminder",
  description: "Schedule a reminder for a medical appointment, check-up, or to take medication.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "The title of the reminder, e.g., 'Cardiologist Appointment' or 'Take Ibuprofen'.",
      },
      reason: {
        type: Type.STRING,
        description: "The reason for the reminder based on symptoms.",
      },
      timeframe: {
        type: Type.STRING,
        description: "When the user should do this, e.g., 'tomorrow', 'next week', 'in 4 hours'.",
      },
    },
    required: ["title", "reason", "timeframe"],
  },
};

const startBreathingTool: FunctionDeclaration = {
  name: "startBreathingExercise",
  description: "Starts the visual breathing guide on the screen. Use this when the user needs to calm down.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const stopBreathingTool: FunctionDeclaration = {
  name: "stopBreathingExercise",
  description: "Stops the visual breathing guide.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

export const useLiveGemini = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  
  // Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const { user, addReminder } = useAuth();
  // We need a ref to addReminder to use it inside the callback without dependency issues
  const addReminderRef = useRef(addReminder);
  
  useEffect(() => {
    addReminderRef.current = addReminder;
  }, [addReminder]);

  const disconnect = useCallback(() => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        try {
          session.close();
        } catch (e) {
          console.error("Error closing session", e);
        }
      });
      sessionPromiseRef.current = null;
    }
    
    sourcesRef.current.forEach(source => {
        try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();

    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    setIsConnected(false);
    setIsTalking(false);
    setIsBreathing(false);
    setCurrentResponse('');
  }, []);

  const sendText = useCallback((text: string) => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        // Safe check for send method
        if (typeof session.send === 'function') {
             session.send({ parts: [{ text }], turnComplete: true });
        } else {
            console.warn("session.send is not available");
        }
      });
    }
  }, []);

  const connect = useCallback(async () => {
    if (isConnected) return;
    setError(null);
    setCurrentResponse('');

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      
      // Setup Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Personalize System Instruction
      let systemInstruction = SYSTEM_INSTRUCTION_TEMPLATE;
      
      // Construct Detailed Medical Summary
      let medicalSummary = "None";
      if (user) {
        const details = [
            user.medicalInfo ? `Note: ${user.medicalInfo}` : null,
            user.chronicConditions ? `Conditions: ${user.chronicConditions}` : null,
            user.allergies ? `Allergies: ${user.allergies}` : null,
            user.pastIllnesses ? `History: ${user.pastIllnesses}` : null,
            user.familyHistory ? `Family: ${user.familyHistory}` : null,
        ].filter(Boolean);
        
        if (details.length > 0) {
            medicalSummary = details.join('; ');
        }
      }

      if (user) {
        systemInstruction = systemInstruction
          .replace('{{NAME}}', user.name)
          .replace('{{AGE}}', user.age?.toString() || 'Unknown')
          .replace('{{MEDICAL}}', medicalSummary)
          .replace('{{CONTACT}}', user.emergencyContact || 'None');
      } else {
         systemInstruction = systemInstruction
          .replace('{{NAME}}', 'Friend')
          .replace('{{AGE}}', 'Unknown')
          .replace('{{MEDICAL}}', 'None')
          .replace('{{CONTACT}}', 'None');
      }

      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            console.log("Session opened");
            setIsConnected(true);
            
            // Trigger the greeting immediately
            const greeting = "Hello, I am Mallow, your personal healthcare companion. How may I ease your pain?";
            
            sessionPromise.then(session => {
                if (typeof session.send === 'function') {
                    session.send({ parts: [{ text: `Please say exactly this to greet the user: "${greeting}"` }], turnComplete: true });
                }
            });

            // Setup Input Stream
            if (!inputAudioContextRef.current) return;
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
               const inputData = e.inputBuffer.getChannelData(0);
               const pcmBlob = createBlob(inputData);
               
               if (sessionPromiseRef.current) {
                 sessionPromiseRef.current.then(session => {
                    session.sendRealtimeInput({ media: pcmBlob });
                 });
               }
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Tool Calls
            if (message.toolCall) {
                const responses = [];
                for (const fc of message.toolCall.functionCalls) {
                    if (fc.name === 'scheduleReminder') {
                        const { title, reason, timeframe } = fc.args as any;
                        addReminderRef.current({ title, reason, timeframe });
                        responses.push({
                            id: fc.id,
                            name: fc.name,
                            response: { result: "Reminder scheduled successfully." }
                        });
                    } else if (fc.name === 'startBreathingExercise') {
                        setIsBreathing(true);
                        responses.push({
                            id: fc.id,
                            name: fc.name,
                            response: { result: "Visual breathing guide activated." }
                        });
                    } else if (fc.name === 'stopBreathingExercise') {
                        setIsBreathing(false);
                        responses.push({
                            id: fc.id,
                            name: fc.name,
                            response: { result: "Visual breathing guide deactivated." }
                        });
                    }
                }
                
                if (responses.length > 0) {
                     sessionPromise.then(session => {
                        session.sendToolResponse({
                             functionResponses: responses
                        });
                     });
                }
            }

            // Handle Text Transcription (Model Output)
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
                setCurrentResponse(prev => prev + message.serverContent?.modelTurn?.parts?.[0]?.text);
            }
            
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
                setIsTalking(true);
                const ctx = outputAudioContextRef.current;
                
                if (nextStartTimeRef.current < ctx.currentTime) {
                    nextStartTimeRef.current = ctx.currentTime;
                }
                
                try {
                    const audioBuffer = await decodeAudioData(
                        decode(base64Audio),
                        ctx,
                        24000,
                        1
                    );
                    
                    const source = ctx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(ctx.destination);
                    
                    source.onended = () => {
                        sourcesRef.current.delete(source);
                        if (sourcesRef.current.size === 0) {
                            setIsTalking(false);
                        }
                    };
                    
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    sourcesRef.current.add(source);
                } catch (e) {
                    console.error("Error decoding audio", e);
                }
            }
            
            // Handle Interruption or Turn Completion
            if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setIsTalking(false);
                setCurrentResponse(''); // Clear text on interruption
            }
            
            if (message.serverContent?.turnComplete) {
                // Optional: mark done
            }
          },
          onclose: () => {
            console.log("Session closed");
            setIsConnected(false);
            setIsTalking(false);
            setIsBreathing(false);
          },
          onerror: (e) => {
            console.error("Session error", e);
            setError("Connection error. Please try again.");
            disconnect();
          }
        },
        config: {
            responseModalities: [Modality.AUDIO],
            outputAudioTranscription: {},
            tools: [{ functionDeclarations: [reminderTool, startBreathingTool, stopBreathingTool] }],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
            },
            systemInstruction: systemInstruction,
        }
      });
      
      sessionPromiseRef.current = sessionPromise;
      
    } catch (err: any) {
        console.error("Failed to connect", err);
        setError(err.message || "Failed to start conversation");
        setIsConnected(false);
    }
  }, [isConnected, user, disconnect]);

  useEffect(() => {
      return () => {
          disconnect();
      };
  }, [disconnect]);

  return { isConnected, isTalking, isBreathing, error, connect, disconnect, sendText, currentResponse };
};
