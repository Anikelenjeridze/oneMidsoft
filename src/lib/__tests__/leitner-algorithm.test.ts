
import {
  toBucketSets,
  getBucketRange,
  practice,
  update,
  getHint,
  computeProgress,
} from '../leitner-algorithm';
import { AnswerDifficulty } from '../../models/Flashcard';

describe('Leitner Algorithm', () => {
  describe('toBucketSets', () => {
    it('should convert an empty map to empty bucket sets', () => {
      const bucketMap = new Map<string, number>();
      const result = toBucketSets(bucketMap);
      expect(result).toEqual([new Set()]);
    });

    it('should correctly convert a map to bucket sets', () => {
      const bucketMap = new Map([
        ['card1', 0],
        ['card2', 1],
        ['card3', 1],
        ['card4', 2],
      ]);
      const result = toBucketSets(bucketMap);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(new Set(['card1']));
      expect(result[1]).toEqual(new Set(['card2', 'card3']));
      expect(result[2]).toEqual(new Set(['card4']));
    });
  });

  describe('getBucketRange', () => {
    it('should return [-1, -1] for empty bucket sets', () => {
      const bucketSets: Set<string>[] = [new Set<string>()];
      const result = getBucketRange(bucketSets);
      expect(result).toEqual([-1, -1]);
    });

    it('should find correct range with non-empty buckets', () => {
      const bucketSets: Set<string>[] = [
        new Set(['card1']),
        new Set<string>(),
        new Set(['card2']),
        new Set(['card3']),
      ];
      const result = getBucketRange(bucketSets);
      expect(result).toEqual([0, 3]);
    });
  });

  describe('practice', () => {
    it('should select cards from bucket 0 every day', () => {
      const bucketSets: Set<string>[] = [
        new Set(['card1']),
        new Set(['card2']),
        new Set(['card3']),
      ];
      const result = practice(bucketSets, 1);
      expect(result.has('card1')).toBe(true);
    });

    it('should select cards according to schedule', () => {
      const bucketSets: Set<string>[] = [
        new Set(['card0']),
        new Set(['card1']),
        new Set(['card2']),
      ];
      
      // Day 1: Should only get cards from bucket 0
      expect(practice(bucketSets, 1).size).toBe(1);
      
      // Day 2: Should get cards from buckets 0 and 1
      const day2Cards = practice(bucketSets, 2);
      expect(day2Cards.has('card0')).toBe(true);
      expect(day2Cards.has('card1')).toBe(true);
      expect(day2Cards.has('card2')).toBe(false);
      
      // Day 4: Should get cards from buckets 0 and 2
      const day4Cards = practice(bucketSets, 4);
      expect(day4Cards.has('card0')).toBe(true);
      expect(day4Cards.has('card1')).toBe(false);
      expect(day4Cards.has('card2')).toBe(true);
    });
  });

  describe('update', () => {
    const retiredBucket = 5;

    it('should reset to bucket 0 on wrong answer', () => {
      const result = update(2, AnswerDifficulty.WRONG, retiredBucket);
      expect(result).toBe(0);
    });

    it('should move down one bucket on hard answer', () => {
      const result = update(2, AnswerDifficulty.HARD, retiredBucket);
      expect(result).toBe(1);
    });

    it('should not go below bucket 0 on hard answer', () => {
      const result = update(0, AnswerDifficulty.HARD, retiredBucket);
      expect(result).toBe(0);
    });

    it('should move up one bucket on easy answer', () => {
      const result = update(2, AnswerDifficulty.EASY, retiredBucket);
      expect(result).toBe(3);
    });

    it('should not exceed retired bucket on easy answer', () => {
      const result = update(4, AnswerDifficulty.EASY, retiredBucket);
      expect(result).toBe(5);
    });

    it('should keep retired cards in retired bucket', () => {
      const result = update(5, AnswerDifficulty.EASY, retiredBucket);
      expect(result).toBe(5);
    });

    it('should throw error on invalid difficulty', () => {
      expect(() => {
        update(2, 'invalid' as AnswerDifficulty, retiredBucket);
      }).toThrow();
    });
  });

  describe('getHint', () => {
    it('should return empty string for empty input', () => {
      expect(getHint('')).toBe('');
    });

    it('should return empty string for null input', () => {
      expect(getHint(null as unknown as string)).toBe('');
    });

    it('should return first character + underscores', () => {
      expect(getHint('Hello')).toBe('H____');
      expect(getHint('A')).toBe('A');
      expect(getHint('Test')).toBe('T___');
    });
  });

  describe('computeProgress', () => {
    it('should throw error for invalid input types', () => {
      expect(() => {
        computeProgress(null as unknown as Map<string, number>, []);
      }).toThrow('Invalid input types');
    });

    it('should compute correct statistics for empty data', () => {
      const result = computeProgress(new Map(), []);
      expect(result).toEqual({
        totalCards: 0,
        cardsByBucket: [0, 0, 0, 0, 0, 0],
        retiredCards: 0,
        averageAttempts: 0,
        mostDifficultCards: [],
        recentImprovements: []
      });
    });

    it('should compute correct statistics with actual data', () => {
      const bucketMap = new Map([
        ['card1', 0],
        ['card2', 1],
        ['card3', 5]
      ]);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);

      const practiceHistory = [
        {
          flashcardId: 'card1',
          date: new Date(),
          difficulty: AnswerDifficulty.WRONG,
          bucket: 0
        },
        {
          flashcardId: 'card2',
          date: oneWeekAgo,
          difficulty: AnswerDifficulty.EASY,
          bucket: 1
        },
        {
          flashcardId: 'card3',
          date: new Date(),
          difficulty: AnswerDifficulty.EASY,
          bucket: 5
        }
      ];

      const result = computeProgress(bucketMap, practiceHistory);
      
      expect(result.totalCards).toBe(3);
      expect(result.cardsByBucket).toEqual([1, 1, 0, 0, 0, 1]);
      expect(result.retiredCards).toBe(1);
      expect(result.averageAttempts).toBe(1);
      expect(result.mostDifficultCards).toEqual(['card1']);
    });
  });
});
