
import React from 'react';
import FlashcardDeck from '@/components/FlashcardDeck';

const Index = () => {
  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-2">Gesture Flashcards</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn efficiently with spaced repetition and gesture-based controls
          </p>
        </header>
        
        <main>
          <FlashcardDeck />
        </main>
        
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Gesture Flashcards - A modern approach to learning</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
