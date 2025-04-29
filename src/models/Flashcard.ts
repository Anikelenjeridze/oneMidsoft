
/**
 * Represents a flashcard with a front and back side
 */
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
  dateCreated: Date;
  lastPracticed?: Date;
}

/**
 * Represents difficulty levels for answering a flashcard
 */
export enum AnswerDifficulty {
  WRONG = "wrong",
  HARD = "hard", 
  EASY = "easy"
}

/**
 * Maintains the history of practice sessions for analytics
 */
export interface PracticeHistory {
  flashcardId: string;
  date: Date;
  difficulty: AnswerDifficulty;
  bucket: number;
}

/**
 * Creates a new flashcard with a unique ID
 */
export function createFlashcard(front: string, back: string, category?: string): Flashcard {
  return {
    id: generateId(),
    front,
    back,
    category,
    dateCreated: new Date()
  };
}

/**
 * Generate a unique ID for flashcards
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
