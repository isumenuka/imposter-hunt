# Enhanced Word Randomization System

## Overview
The Imposter Hunt game now features a **highly robust anti-repetition system** that ensures maximum word variety and prevents similar words from appearing too close together.

## Key Features

### 1. **Shuffle Bag Algorithm**
- All word indices are shuffled using the Fisher-Yates algorithm
- Words are distributed sequentially from the shuffled list
- Ensures **every word is seen exactly once** before any repeats

### 2. **Global History Tracking**
- Tracks all words used across the entire session
- Maintains a sliding window of recently used words
- Provides real-time coverage statistics

### 3. **Minimum Coverage Rule**
- **At least 50% of all words** must be seen before allowing any repeats
- Warns when coverage is below the threshold
- Ensures fair distribution across the entire word pool

### 4. **Minimum Gap Between Reuse**
- **Minimum 10-word gap** before a word can appear again
- Validates new shuffles to prevent recent words from appearing first
- Extra safety checks during word selection

### 5. **Anti-Pattern Validation**
- When creating a new shuffle, validates that the first word isn't in recent history
- Up to 50 re-shuffle attempts to avoid patterns
- Logs validation results for debugging

## How It Works

### For Regular Categories
1. **First Selection**: Creates a shuffled bag of all word indices
2. **Sequential Distribution**: Returns words one by one from the shuffle
3. **History Tracking**: Records each word in global history
4. **Coverage Monitoring**: Tracks how many unique words have been seen
5. **New Shuffle**: When bag is empty, creates a new validated shuffle
6. **Gap Enforcement**: Ensures minimum 10-word gap before word reuse

### For "The Boys" Category (Special Handling)
- Divided into 15 sub-categories (Sri Lankan Animals, Foods, Brands, etc.)
- Each game round selects a **different sub-category** from the previous one
- Randomizes within the selected sub-category
- Also tracks history for this category

## Console Logging

The system provides detailed console logs for monitoring:

```
🎲 Created new shuffle for "Animals" - First word index: 42 (validated against 10 recent words)
📖 "Animals": index 42, 27 remaining in bag, 54.3% total coverage
⚠️ Only 35.2% coverage for "Foods" - enforcing minimum 50% rule
```

## Storage

All randomization state is persisted in localStorage:

1. **`imposter-hunt-shuffle-bags`**
   - Current shuffle state for each category
   - Position in current shuffle
   - Set of words used in current cycle

2. **`imposter-hunt-global-history`**
   - Recent word history (last 20 words)
   - Total unique words seen
   - Coverage statistics

## Developer Tools

### Reset Everything
```javascript
// Clear all shuffle bags and history
shuffleBagManager.clearAll();
```

### Check Category Status
```javascript
// Get status of a category
const status = shuffleBagManager.getBagStatus('Animals', 30);
console.log(status);
// { remaining: 12, total: 30, position: 18, isNew: false }
```

### View All Categories
```javascript
// Get all category statuses
const statuses = shuffleBagManager.getAllStatuses();
console.log(statuses);
```

## Configuration Constants

You can adjust these in `utils/shuffleBag.ts`:

```typescript
const MIN_COVERAGE_PERCENT = 0.5;  // 50% minimum coverage
const MIN_GAP_BETWEEN_REUSE = 10;  // 10-word minimum gap
```

## Benefits

✅ **No Immediate Repeats**: Guaranteed unique words in sequence  
✅ **Fair Distribution**: All words get equal representation  
✅ **Persistent State**: Continues across page refreshes  
✅ **Session Tracking**: Maintains history throughout gaming session  
✅ **Configurable**: Easy to adjust rules via constants  
✅ **Debuggable**: Detailed console logging and status methods  
✅ **Validated**: Anti-pattern checks prevent poor shuffle outcomes  

## Example Behavior

With a category of 100 words:

1. **Round 1-50**: 50 unique words (50% coverage reached)
2. **Round 51-100**: Remaining 50 words (100% coverage)
3. **Round 101**: New shuffle created, validated against last 10 words
4. **Round 102+**: Continues with new shuffle, maintaining 10-word gap

This ensures players experience **maximum word variety** with **minimal repetition**!
