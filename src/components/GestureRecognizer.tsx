
import React, { useRef, useEffect, useState } from 'react';
import { FilesetResolver, GestureRecognizer as MediaPipeGestureRecognizer } from '@mediapipe/tasks-vision';
import { AnswerDifficulty } from '../models/Flashcard';

interface GestureRecognizerProps {
  onGestureDetected: (difficulty: AnswerDifficulty) => void;
  isActive: boolean;
}

export default function GestureRecognizer({ onGestureDetected, isActive }: GestureRecognizerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [recognizer, setRecognizer] = useState<MediaPipeGestureRecognizer | null>(null);
  const [lastGesture, setLastGesture] = useState<string>("");
  const [indicatorColor, setIndicatorColor] = useState<string>("");
  const [isIndicatorActive, setIsIndicatorActive] = useState<boolean>(false);
  const gestureTimeout = useRef<NodeJS.Timeout | null>(null);

  // Gesture detection cooldown to prevent multiple rapid detections
  const [inCooldown, setInCooldown] = useState(false);
  
  useEffect(() => {
    // Load the gesture recognizer
    const loadRecognizer = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      const gestureRecognizer = await MediaPipeGestureRecognizer.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        }
      );
      
      setRecognizer(gestureRecognizer);
    };
    
    loadRecognizer();
    
    return () => {
      if (recognizer) {
        recognizer.close();
      }
    };
  }, []);
  
  useEffect(() => {
    let animationFrameId: number;
    
    // Setup webcam
    const setupCamera = async () => {
      if (!videoRef.current) return;
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              resolve(true);
            };
          }
        });
        
        if (videoRef.current) {
          videoRef.current.play();
        }
        
        // Start detecting gestures
        animationFrameId = requestAnimationFrame(detectGestures);
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };
    
    // Detect gestures in video frames
    const detectGestures = async () => {
      if (!videoRef.current || !recognizer || !isActive) {
        animationFrameId = requestAnimationFrame(detectGestures);
        return;
      }
      
      const video = videoRef.current;
      
      if (video.readyState === 4) { // HAVE_ENOUGH_DATA
        // Run detection on current frame
        const startTimeMs = performance.now();
        const results = recognizer.recognizeForVideo(video, startTimeMs);
        
        if (results.gestures.length > 0) {
          const gesture = results.gestures[0][0].categoryName;
          
          // Only process if not in cooldown
          if (!inCooldown) {
            setLastGesture(gesture);
            
            // Map gesture to difficulty and send to parent
            if (gesture === "Thumb Up") {
              setIndicatorColor("bg-flashcard-green");
              setIsIndicatorActive(true);
              onGestureDetected(AnswerDifficulty.EASY);
              setCooldown();
            } else if (gesture === "Open_Palm") {
              setIndicatorColor("bg-flashcard-yellow");
              setIsIndicatorActive(true);
              onGestureDetected(AnswerDifficulty.HARD);
              setCooldown();
            } else if (gesture === "Thumb Down") {
              setIndicatorColor("bg-flashcard-red");
              setIsIndicatorActive(true);
              onGestureDetected(AnswerDifficulty.WRONG);
              setCooldown();
            }
            
            if (isIndicatorActive) {
              if (gestureTimeout.current) {
                clearTimeout(gestureTimeout.current);
              }
              
              gestureTimeout.current = setTimeout(() => {
                setIsIndicatorActive(false);
              }, 1000);
            }
          }
        }
        
        // Draw hand landmarks on canvas for visualization
        if (canvasRef.current && results.landmarks.length > 0) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            
            // Draw connections between landmarks
            for (const landmarks of results.landmarks) {
              for (let i = 0; i < landmarks.length; i++) {
                const landmark = landmarks[i];
                
                // Draw circles at landmark positions
                ctx.fillStyle = "#3498db";
                ctx.beginPath();
                ctx.arc(
                  landmark.x * canvasRef.current.width,
                  landmark.y * canvasRef.current.height,
                  5,
                  0,
                  2 * Math.PI
                );
                ctx.fill();
              }
            }
          }
        } else if (canvasRef.current) {
          // Clear canvas if no landmarks
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(detectGestures);
    };
    
    if (isActive) {
      setupCamera();
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Stop webcam stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [recognizer, isActive, onGestureDetected, inCooldown]);
  
  // Helper function to set cooldown
  const setCooldown = () => {
    setInCooldown(true);
    setTimeout(() => {
      setInCooldown(false);
    }, 1500); // 1.5 second cooldown
  };
  
  return (
    <div className="webcam-container">
      <div className={`gesture-indicator ${isIndicatorActive ? 'active' : ''} ${indicatorColor}`}></div>
      <video 
        ref={videoRef} 
        className="w-full h-auto rounded-lg" 
        playsInline
      />
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full pointer-events-none" 
        width={640}
        height={480}
      />
      <div className="mt-2 text-sm text-center text-muted-foreground">
        {lastGesture ? `Last detected gesture: ${lastGesture}` : "No gesture detected"}
      </div>
    </div>
  );
}
