# Discussion Timer Update - Start Voting Button

## Changes Made

### Problem
Previously, the "Start Voting" button was always visible during the Discussion phase, allowing players to skip the discussion time and start voting immediately.

### Solution
Modified the Discussion component to only show the "Start Voting" button **after the countdown timer reaches 0**.

## Implementation Details

### 1. **Button Visibility Logic**
- The button now checks `timeLeft === 0` before appearing
- Added smooth animation when button appears (`animate-in fade-in zoom-in duration-300`)

### 2. **Enhanced User Experience**
When the timer is still counting down, players now see:
```
┌─────────────────────────┐
│  Voting Available In    │
│        2:35             │
└─────────────────────────┘
```

When timer reaches 0, the button appears:
```
┌─────────────────────────┐
│    Start Voting  →      │
└─────────────────────────┘
```

### 3. **Works for Both Modes**
- ✅ **Admin/Host**: Shows countdown + "Re-Randomize" button, then "Start Voting" when ready
- ✅ **Regular Players**: Shows countdown, then "Start Voting" when ready

## Code Changes

### File: `components/Discussion.tsx`

**Before:**
```tsx
{isAdmin && (
  <div className="space-y-3">
    <Button>Re-Randomize Secret Word</Button>
    <Button>Start Voting</Button>  {/* Always visible */}
  </div>
)}

{!isAdmin && (
  <Button>Start Voting</Button>  {/* Always visible */}
)}
```

**After:**
```tsx
{isAdmin && (
  <div className="space-y-3">
    <Button>Re-Randomize Secret Word</Button>
    
    {timeLeft > 0 ? (
      <div>Voting Available In {formatTime(timeLeft)}</div>
    ) : (
      <Button>Start Voting</Button>  {/* Only when timer = 0 */}
    )}
  </div>
)}

{!isAdmin && (
  <div>
    {timeLeft > 0 ? (
      <div>Voting Available In {formatTime(timeLeft)}</div>
    ) : (
      <Button>Start Voting</Button>  {/* Only when timer = 0 */}
    )}
  </div>
)}
```

## Benefits

✅ **Fair Gameplay**: Ensures all players get the full discussion time  
✅ **Clear Feedback**: Players know exactly when voting will be available  
✅ **Smooth Transition**: Animated button appearance feels polished  
✅ **Auto-Advance**: Timer still auto-starts voting at 0 (existing behavior)  
✅ **Consistent**: Works the same for online and offline modes  

## Testing Checklist

To verify this works correctly:

1. ✅ Start a new game (offline or online)
2. ✅ Reach the Discussion phase
3. ✅ Verify "Start Voting" button is NOT visible initially
4. ✅ Verify countdown message shows "Voting Available In X:XX"
5. ✅ Wait for timer to reach 0:00
6. ✅ Verify "Start Voting" button appears with animation
7. ✅ Verify button works when clicked
8. ✅ Verify auto-transition still works (game auto-starts voting at 0)

## Visual Preview

### During Discussion (Timer at 2:30)
```
┌──────────────────────────────────┐
│        Discussion Phase          │
│                                  │
│         ⏱️ 2:30                  │
│         TIME LEFT                │
│                                  │
│    ┌──────────────────────┐     │
│    │ Re-Randomize Word    │     │
│    └──────────────────────┘     │
│                                  │
│    ┌──────────────────────┐     │
│    │ Voting Available In  │     │
│    │       2:30           │     │
│    └──────────────────────┘     │
└──────────────────────────────────┘
```

### When Timer Reaches 0:00
```
┌──────────────────────────────────┐
│        Discussion Phase          │
│                                  │
│         ⏱️ 0:00                  │
│         TIME LEFT                │
│                                  │
│    ┌──────────────────────┐     │
│    │ Re-Randomize Word    │     │
│    └──────────────────────┘     │
│                                  │
│    ┌──────────────────────┐     │
│    │   START VOTING  →    │  ← Appears!
│    └──────────────────────┘     │
└──────────────────────────────────┘
```

## Notes

- The automatic transition to voting (when timer reaches 0) still works via the existing `useEffect` hook
- Players can manually click "Start Voting" once it appears
- The countdown message uses the same styling as other game UI elements for consistency
