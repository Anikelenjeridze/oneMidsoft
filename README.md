# Gesture Flashcards

A modern flashcard application that combines spaced repetition learning with gesture controls for an interactive study experience.

## Overview

Gesture Flashcards is a web application that helps users learn and memorize information using the Leitner system, enhanced with hand gesture recognition for a more engaging learning experience.

## Features

### Core Functionality

- **Spaced Repetition**: Implements the Leitner system for efficient learning
- **Gesture Controls**: Use hand gestures to interact with flashcards:
  - 👍 Thumbs Up: Mark card as "Easy"
  - ✋ Open Palm: Mark card as "Hard"
  - 👎 Thumbs Down: Mark card as "Wrong"
- **Progress Tracking**: Visual feedback on learning progress
- **Smart Scheduling**: Cards are presented based on your performance

### User Interface

- **Interactive Flashcards**: Flip cards to reveal answers
- **Progress Statistics**: Track your learning journey with detailed stats
- **Category Support**: Organize cards by topics
- **Hint System**: Get help when stuck on a card
- **Responsive Design**: Works on all device sizes

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Gesture Recognition**: MediaPipe for hand gesture detection
- **State Management**: React Hooks and Context
- **Testing**: Jest for unit testing

## Getting Started

1. **Installation**

   ```bash
   # Clone the repository
   git clone <your-repo-url>

   # Navigate to project directory
   cd gesture-flashcards

   # Install dependencies
   npm install

   # Start the development server
   npm run dev
   ```

2. **Using the Application**
   - Create new flashcards using the "Add New Card" button
   - Enable gesture controls using the toggle in the top right
   - Practice your cards and track your progress
   - Use hand gestures or buttons to rate your knowledge

## Project Structure

```
src/
├── components/          # React components
│   ├── FlashcardView/  # Flashcard display component
│   ├── FlashcardDeck/  # Main flashcard management
│   └── GestureRecognizer/ # Gesture detection
├── lib/                # Utility functions
│   └── leitner-algorithm.ts  # Spaced repetition logic
├── models/             # TypeScript interfaces
└── hooks/             # Custom React hooks
```

## Core Components

### Flashcard System

- Implements the Leitner spaced repetition system
- Cards move between buckets based on user performance
- Automatic scheduling of reviews

### Gesture Recognition

- Real-time hand gesture detection
- Camera feed processing with MediaPipe
- Gesture classification and response system

### Progress Tracking

- Detailed statistics on learning progress
- Visual progress indicators
- Bucket distribution analytics
