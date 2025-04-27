
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flashcard, AnswerDifficulty, PracticeHistory, createFlashcard } from '../models/Flashcard';
import { update, practice, getBucketRange, toBucketSets, computeProgress } from '../lib/leitner-algorithm';
import FlashcardView from './FlashcardView';
import GestureRecognizer from './GestureRecognizer';
import { useToast } from '@/components/ui/use-toast';

// Default cards for demonstration
const defaultCards: Flashcard[] = [
  createFlashcard("What is TypeScript?", "A statically typed superset of JavaScript", "Programming"),
  createFlashcard("What is React?", "A JavaScript library for building user interfaces", "Programming"),
  createFlashcard("What is a closure in JavaScript?", "A function that has access to variables from its outer lexical scope", "Programming"),
  createFlashcard("What's the capital of France?", "Paris", "Geography"),
  createFlashcard("What's the capital of Japan?", "Tokyo", "Geography"),
];

// Number of buckets in our system (including bucket 0)
const NUM_BUCKETS = 6;
const RETIRED_BUCKET = 5;

export default function FlashcardDeck() {
  const [cards, setCards] = useState<Flashcard[]>(defaultCards);
  const [bucketMap, setBucketMap] = useState<Map<string, number>>(new Map());
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [todaysPractice, setTodaysPractice] = useState<string[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [practiceHistory, setPracticeHistory] = useState<PracticeHistory[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [newCardFront, setNewCardFront] = useState<string>('');
  const [newCardBack, setNewCardBack] = useState<string>('');
  const [newCardCategory, setNewCardCategory] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [useGestures, setUseGestures] = useState<boolean>(false);
  
  const { toast } = useToast();
  
  // Initialize bucket map when cards change
  useEffect(() => {
    const newBucketMap = new Map<string, number>();
    cards.forEach(card => {
      if (!bucketMap.has(card.id)) {
        newBucketMap.set(card.id, 0); // New cards start in bucket 0
      } else {
        newBucketMap.set(card.id, bucketMap.get(card.id)!);
      }
    });
    
    setBucketMap(newBucketMap);
  }, [cards]);
  
  // Update practice schedule when day or bucketMap changes
  useEffect(() => {
    const bucketSets = toBucketSets(bucketMap);
    const cardsToStudy = practice(bucketSets, currentDay);
    setTodaysPractice(Array.from(cardsToStudy));
  }, [bucketMap, currentDay]);
  
  // Update stats when practice history or bucket map changes
  useEffect(() => {
    try {
      const stats = computeProgress(bucketMap, practiceHistory, RETIRED_BUCKET);
      setStats(stats);
    } catch (e) {
      console.error("Error computing progress:", e);
    }
  }, [bucketMap, practiceHistory]);
  
  const handleAddCard = () => {
    if (!newCardFront.trim() || !newCardBack.trim()) {
      toast({
        title: "Cannot add card",
        description: "Both front and back must have content",
        variant: "destructive"
      });
      return;
    }
    
    const newCard = createFlashcard(
      newCardFront.trim(), 
      newCardBack.trim(), 
      newCardCategory.trim() || undefined
    );
    
    setCards([...cards, newCard]);
    setBucketMap(new Map(bucketMap.set(newCard.id, 0)));
    
    setNewCardFront('');
    setNewCardBack('');
    setNewCardCategory('');
    setShowDialog(false);
    
    toast({
      title: "Card added",
      description: "New flashcard has been added to your deck"
    });
  };
  
  const handleCardAnswered = (difficulty: AnswerDifficulty) => {
    if (todaysPractice.length === 0) return;
    
    const currentCardId = todaysPractice[currentCardIndex];
    const currentCard = cards.find(card => card.id === currentCardId);
    
    if (!currentCard) return;
    
    // Get current bucket
    const currentBucket = bucketMap.get(currentCardId) || 0;
    
    // Update the bucket
    const newBucket = update(currentBucket, difficulty, RETIRED_BUCKET);
    
    // Update the bucket map
    const newBucketMap = new Map(bucketMap);
    newBucketMap.set(currentCardId, newBucket);
    setBucketMap(newBucketMap);
    
    // Update practice history
    const historyEntry: PracticeHistory = {
      flashcardId: currentCardId,
      date: new Date(),
      difficulty,
      bucket: newBucket
    };
    setPracticeHistory([...practiceHistory, historyEntry]);
    
    // Update the current card's last practiced date
    const updatedCards = cards.map(card => 
      card.id === currentCardId 
        ? { ...card, lastPracticed: new Date() }
        : card
    );
    setCards(updatedCards);
    
    // Show feedback toast
    const feedbackMessages = {
      [AnswerDifficulty.WRONG]: "Card moved to bucket 0",
      [AnswerDifficulty.HARD]: `Card moved to bucket ${newBucket}`,
      [AnswerDifficulty.EASY]: `Card moved to bucket ${newBucket}`
    };
    
    toast({
      title: `Answered ${difficulty}`,
      description: feedbackMessages[difficulty],
      variant: difficulty === AnswerDifficulty.WRONG ? "destructive" : 
               difficulty === AnswerDifficulty.HARD ? "default" : "default"
    });
    
    // Go to next card or end practice
    if (currentCardIndex < todaysPractice.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      toast({
        title: "Practice complete!",
        description: "You've completed all cards for today"
      });
      // Optionally reset or go to a completion screen
    }
  };
  
  const advanceToNextDay = () => {
    setCurrentDay(currentDay + 1);
    setCurrentCardIndex(0);
    
    toast({
      title: "Advanced to next day",
      description: `Now practicing day ${currentDay + 1}`
    });
  };
  
  const handleGestureDetected = (difficulty: AnswerDifficulty) => {
    if (useGestures && todaysPractice.length > 0) {
      handleCardAnswered(difficulty);
    }
  };
  
  const getCurrentCard = (): Flashcard | undefined => {
    if (todaysPractice.length === 0) return undefined;
    if (currentCardIndex >= todaysPractice.length) return undefined;
    
    const currentCardId = todaysPractice[currentCardIndex];
    return cards.find(card => card.id === currentCardId);
  };
  
  const currentCard = getCurrentCard();
  const practiceComplete = currentCardIndex >= todaysPractice.length;
  
  // Calculate bucket distribution percentages
  const bucketDistribution = stats?.cardsByBucket.map((count: number) => 
    (count / stats.totalCards) * 100
  ) || Array(NUM_BUCKETS).fill(0);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-12 gap-8">
        {/* Left sidebar with stats */}
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Deck Stats</CardTitle>
              <CardDescription>Day {currentDay} of your learning journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Card Distribution</h3>
                <div className="space-y-2">
                  {stats && Array.from({ length: NUM_BUCKETS }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Bucket {i} {i === RETIRED_BUCKET ? "(Retired)" : ""}</span>
                        <span>{stats.cardsByBucket[i]} cards</span>
                      </div>
                      <Progress value={bucketDistribution[i]} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Progress</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted rounded p-2">
                    <div className="text-sm text-muted-foreground">Total Cards</div>
                    <div className="text-xl font-semibold">{stats?.totalCards || 0}</div>
                  </div>
                  <div className="bg-muted rounded p-2">
                    <div className="text-sm text-muted-foreground">Mastered</div>
                    <div className="text-xl font-semibold">{stats?.retiredCards || 0}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Today's Practice</h3>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{currentCardIndex}/{todaysPractice.length}</div>
                  <div className="text-sm text-muted-foreground">cards completed</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-4">
              <Button onClick={advanceToNextDay}>Advance to Next Day</Button>
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">Add New Card</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a New Flashcard</DialogTitle>
                    <DialogDescription>
                      Create a new flashcard for your deck.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="front">Front (Question)</Label>
                      <Textarea 
                        id="front" 
                        value={newCardFront}
                        onChange={(e) => setNewCardFront(e.target.value)}
                        placeholder="Enter the question or prompt"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="back">Back (Answer)</Label>
                      <Textarea 
                        id="back" 
                        value={newCardBack}
                        onChange={(e) => setNewCardBack(e.target.value)}
                        placeholder="Enter the answer"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category (Optional)</Label>
                      <Input 
                        id="category" 
                        value={newCardCategory}
                        onChange={(e) => setNewCardCategory(e.target.value)}
                        placeholder="e.g. Mathematics, History, etc."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddCard}>Add Card</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-9">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Flashcard Practice</h1>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground">Use gesture controls</div>
              <Button
                variant={useGestures ? "default" : "outline"}
                onClick={() => setUseGestures(!useGestures)}
                className={useGestures ? "bg-primary" : ""}
              >
                {useGestures ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>
          
          {todaysPractice.length === 0 ? (
            <Card className="p-8 text-center">
              <CardContent className="pt-8">
                <h2 className="text-2xl font-bold mb-4">No cards to practice today!</h2>
                <p className="text-muted-foreground mb-6">
                  You've completed all your scheduled cards for the day.
                  Add more cards or advance to the next day.
                </p>
                <div className="flex flex-col gap-4 items-center">
                  <Button onClick={() => setShowDialog(true)}>Add New Card</Button>
                  <Button variant="outline" onClick={advanceToNextDay}>Advance to Next Day</Button>
                </div>
              </CardContent>
            </Card>
          ) : practiceComplete ? (
            <Card className="p-8 text-center">
              <CardContent className="pt-8">
                <h2 className="text-2xl font-bold mb-4">Practice Complete!</h2>
                <p className="text-muted-foreground mb-6">
                  You've completed all your scheduled cards for today.
                  Come back tomorrow or advance to the next day.
                </p>
                <div className="flex flex-col gap-4 items-center">
                  <Button onClick={advanceToNextDay}>Advance to Next Day</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentCardIndex(0)}
                  >
                    Practice Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {currentCard && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{`Card ${currentCardIndex + 1} of ${todaysPractice.length}`}</Badge>
                      {currentCard.category && (
                        <Badge>{currentCard.category}</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Bucket: {bucketMap.get(currentCard.id) || 0}
                    </div>
                  </div>
                  
                  <FlashcardView 
                    flashcard={currentCard} 
                    onAnswered={handleCardAnswered}
                    canUseGestures={useGestures}
                  />
                </>
              )}
              
              {useGestures && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Gesture Controls</h3>
                  <GestureRecognizer 
                    onGestureDetected={handleGestureDetected}
                    isActive={useGestures && !practiceComplete} 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
