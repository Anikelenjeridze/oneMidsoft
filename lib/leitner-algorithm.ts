
import { Flashcard, AnswerDifficulty, PracticeHistory } from "../models/Flashcard";

/**
 * Converts a Map representation of learning buckets into an Array-of-Set representation
 */
export function toBucketSets(bucketMap: Map<string, number>): Set<string>[] {
  // Find the highest bucket number
  let maxBucket = 0;
  for (const bucketNum of bucketMap.values()) {
    if (bucketNum > maxBucket) {
      maxBucket = bucketNum;
    }
  }
  
  // Create an array of sets for each bucket
  const bucketSets: Set<string>[] = [];
  for (let i = 0; i <= maxBucket; i++) {
    bucketSets.push(new Set<string>());
  }
  
  // Populate the sets
  for (const [flashcardId, bucketNum] of bucketMap.entries()) {
    bucketSets[bucketNum].add(flashcardId);
  }
  
  return bucketSets;
}

/**
 * Finds the range of buckets that contain flashcards
 */
export function getBucketRange(bucketSets: Set<string>[]): [number, number] {
  let minBucket = -1;
  let maxBucket = -1;
  
  // Find the min and max non-empty buckets
  for (let i = 0; i < bucketSets.length; i++) {
    if (bucketSets[i].size > 0) {
      if (minBucket === -1) {
        minBucket = i;
      }
      maxBucket = i;
    }
  }
  
  return [minBucket, maxBucket];
}

/**
 * Selects cards to practice on a particular day
 */
export function practice(bucketSets: Set<string>[], day: number): Set<string> {
  const todaysPractice = new Set<string>();
  
  // Add cards from each bucket based on the schedule
  for (let i = 0; i < bucketSets.length; i++) {
    // Bucket 0 practices every day
    // Bucket i practices every 2^i days
    if (i === 0 || day % Math.pow(2, i) === 0) {
      for (const flashcardId of bucketSets[i]) {
        todaysPractice.add(flashcardId);
      }
    }
  }
  
  return todaysPractice;
}

/**
 * Updates a card's bucket number after a practice trial
 */
export function update(
  currentBucket: number,
  difficulty: AnswerDifficulty,
  retiredBucket: number
): number {
  // Already retired, stay retired
  if (currentBucket >= retiredBucket) {
    return retiredBucket;
  }
  
  // Update based on difficulty
  switch (difficulty) {
    case AnswerDifficulty.WRONG:
      return 0; // Reset to bucket 0
    case AnswerDifficulty.HARD:
      return Math.max(0, currentBucket - 1); // Move down one bucket, but not below 0
    case AnswerDifficulty.EASY:
      const newBucket = currentBucket + 1;
      return Math.min(newBucket, retiredBucket); // Move up one bucket, but not above retired
    default:
      throw new Error(`Unexpected difficulty level: ${difficulty}`);
  }
}

/**
 * Generates a hint for a flashcard
 */
export function getHint(back: string): string {
  // Simple hint: first character + number of remaining characters as underscores
  if (!back || typeof back !== "string" || back.length === 0) {
    return "";
  }
  
  const firstChar = back.charAt(0);
  const restAsUnderscores = "_".repeat(back.length - 1);
  return firstChar + restAsUnderscores;
}

/**
 * Computes statistics about the user's learning progress
 * @param bucketMap - Map of flashcard IDs to their current bucket numbers
 * @param practiceHistory - Array of practice history records
 * @returns Statistics about learning progress
 */
export function computeProgress(
  bucketMap: Map<string, number>,
  practiceHistory: PracticeHistory[],
  retiredBucket = 5
): {
  totalCards: number;
  cardsByBucket: number[];
  retiredCards: number;
  averageAttempts: number;
  mostDifficultCards: string[];
  recentImprovements: string[];
} {
  // Verify that bucketMap and practiceHistory are valid
  if (!(bucketMap instanceof Map) || !Array.isArray(practiceHistory)) {
    throw new Error("Invalid input types");
  }
  
  // Initialize statistics
  const totalCards = bucketMap.size;
  const cardsByBucket: number[] = Array(retiredBucket + 1).fill(0);
  
  // Count cards in each bucket
  for (const bucketNum of bucketMap.values()) {
    if (bucketNum >= 0 && bucketNum <= retiredBucket) {
      cardsByBucket[bucketNum]++;
    }
  }
  
  // Count retired cards
  const retiredCards = cardsByBucket[retiredBucket];
  
  // Calculate average attempts per card
  const attemptsByCard = new Map<string, number>();
  for (const record of practiceHistory) {
    const currentCount = attemptsByCard.get(record.flashcardId) || 0;
    attemptsByCard.set(record.flashcardId, currentCount + 1);
  }
  
  let totalAttempts = 0;
  for (const attempts of attemptsByCard.values()) {
    totalAttempts += attempts;
  }
  
  const averageAttempts = attemptsByCard.size > 0 ? 
    totalAttempts / attemptsByCard.size : 0;
  
  // Find the most difficult cards (most wrong answers)
  const wrongAnswersByCard = new Map<string, number>();
  for (const record of practiceHistory) {
    if (record.difficulty === AnswerDifficulty.WRONG) {
      const currentWrong = wrongAnswersByCard.get(record.flashcardId) || 0;
      wrongAnswersByCard.set(record.flashcardId, currentWrong + 1);
    }
  }
  
  // Sort cards by wrong answers count
  const sortedByDifficulty = [...wrongAnswersByCard.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  const mostDifficultCards = sortedByDifficulty.slice(0, 5);
  
  // Find cards that recently improved (moved up at least one bucket in the last week)
  const cardBucketHistory = new Map<string, { date: Date, bucket: number }[]>();
  
  // Group practice history by card
  for (const record of practiceHistory) {
    if (!cardBucketHistory.has(record.flashcardId)) {
      cardBucketHistory.set(record.flashcardId, []);
    }
    cardBucketHistory.get(record.flashcardId)?.push({
      date: record.date,
      bucket: record.bucket
    });
  }
  
  const recentImprovements: string[] = [];
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  // Check each card for improvement
  for (const [cardId, history] of cardBucketHistory.entries()) {
    // Sort history by date
    const sortedHistory = history.sort((a, b) => 
      a.date.getTime() - b.date.getTime());
    
    if (sortedHistory.length < 2) continue;
    
    // Get the most recent practice
    const mostRecent = sortedHistory[sortedHistory.length - 1];
    
    // Only consider recent improvements
    if (mostRecent.date < oneWeekAgo) continue;
    
    // Find the previous practice before the most recent
    let previousIdx = sortedHistory.length - 2;
    while (previousIdx >= 0) {
      const previous = sortedHistory[previousIdx];
      // If we moved up at least one bucket
      if (mostRecent.bucket > previous.bucket) {
        recentImprovements.push(cardId);
        break;
      }
      previousIdx--;
    }
  }
  
  return {
    totalCards,
    cardsByBucket,
    retiredCards,
    averageAttempts,
    mostDifficultCards,
    recentImprovements
  };
}
