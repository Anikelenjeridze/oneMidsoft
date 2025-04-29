
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flashcard, AnswerDifficulty } from '../models/Flashcard';
import { getHint } from '../lib/leitner-algorithm';
import { Check, X, ThumbsUp, ThumbsDown } from 'lucide-react';

interface FlashcardViewProps {
  flashcard: Flashcard;
  onAnswered: (difficulty: AnswerDifficulty) => void;
  canUseGestures?: boolean;
}

export default function FlashcardView({ 
  flashcard, 
  onAnswered, 
  canUseGestures = false 
}: FlashcardViewProps) {
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState("");
  
  // Generate hint when card is first shown or card changes
  useEffect(() => {
    setHint(getHint(flashcard.back));
    // Reset state when card changes
    setFlipped(false);
    setShowHint(false);
  }, [flashcard]);
  
  const handleFlip = () => {
    setFlipped(!flipped);
  };
  
  const handleShowHint = () => {
    setShowHint(true);
  };
  
  const handleAnswer = (difficulty: AnswerDifficulty) => {
    // Make sure user has seen the back of the card before answering
    if (!flipped) {
      setFlipped(true);
      return;
    }
    onAnswered(difficulty);
  };
  
  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        className={`flashcard relative w-full aspect-[3/2] cursor-pointer ${flipped ? 'flipped' : ''}`} 
        onClick={handleFlip}
      >
        {/* Front of card */}
        <Card className="flashcard-front flex flex-col justify-center items-center p-8 shadow-lg">
          <div className="text-2xl font-bold">{flashcard.front}</div>
          {!flipped && (
            <div className="absolute bottom-4 right-4 text-sm text-muted-foreground">
              Click to flip
            </div>
          )}
        </Card>
        
        {/* Back of card */}
        <Card className="flashcard-back flex flex-col justify-center items-center p-8 shadow-lg">
          <div className="text-2xl font-bold">{flashcard.back}</div>
          {flashcard.category && (
            <div className="mt-4 text-sm text-muted-foreground">
              Category: {flashcard.category}
            </div>
          )}
        </Card>
      </div>
      
      <div className="mt-8 flex flex-col gap-4">
        {/* Hint section */}
        {!flipped && (
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              className="text-flashcard-blue hover:text-flashcard-blue-dark"
              onClick={handleShowHint}
              disabled={showHint}
            >
              Show Hint
            </Button>
          </div>
        )}
        
        {showHint && !flipped && (
          <div className="text-center p-4 bg-muted rounded-md">
            <p className="font-medium">Hint: {hint}</p>
          </div>
        )}
        
        {/* Answer buttons - only show after card is flipped */}
        {flipped && (
          <div className="grid grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 border-flashcard-red hover:bg-flashcard-red/10"
              onClick={() => handleAnswer(AnswerDifficulty.WRONG)}
            >
              <X className="h-5 w-5" />
              Wrong
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 border-flashcard-yellow hover:bg-flashcard-yellow/10"
              onClick={() => handleAnswer(AnswerDifficulty.HARD)}
            >
              <ThumbsDown className="h-5 w-5" />
              Hard
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 border-flashcard-green hover:bg-flashcard-green/10"
              onClick={() => handleAnswer(AnswerDifficulty.EASY)}
            >
              <ThumbsUp className="h-5 w-5" />
              Easy
            </Button>
          </div>
        )}
        
        {/* Gesture control explanation */}
        {canUseGestures && (
          <div className="mt-2 text-center text-sm text-muted-foreground">
            {flipped ? "Use hand gestures to answer: Thumbs up (Easy), Open Palm (Hard), Thumbs down (Wrong)" 
                     : "Flip the card first to answer"}
          </div>
        )}
      </div>
    </div>
  );
}
