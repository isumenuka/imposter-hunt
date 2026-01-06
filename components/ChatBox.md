# ChatBox Component Documentation

## Overview

The `ChatBox` component is a fully responsive real-time chat interface designed for the Imposter Hunt multiplayer game. It enables players to communicate during online gameplay sessions.

## Features

### 🎯 Core Functionality
- **Real-time Messaging**: Send and receive messages instantly during online gameplay
- **Simple Message Format**: Displays messages in a clean `{playername} : {message}` format
- **Auto-scroll**: Automatically scrolls to the latest message when new messages arrive
- **Message Limit**: Maximum 500 characters per message with character counter
- **Expandable/Collapsible**: Minimize the chat to save screen space when not needed

### 📱 Responsive Design

#### Mobile Devices (< 768px)
- **Full-width layout** that slides up from the bottom of the screen
- **70% viewport height** for optimal screen usage
- **Compact UI elements**:
  - Smaller text sizes (text-xs)
  - Reduced padding and spacing
  - Touch-friendly buttons with active states
- **Floating minimized button** in the bottom-right corner
- **Optimized keyboard support** for mobile input

#### Tablet & Desktop (≥ 768px)
- **Fixed sidebar layout** on the right side (384px width)
- **Up to 80% viewport height** with maximum of 600px
- **Larger comfortable spacing** and text sizes
- **Rounded top-left corner** for visual appeal
- **Hover effects** for better interactivity

## Component Structure

### Props
```typescript
interface Props {
    roomState: RoomState;
    currentPlayer: Player;
}
```

- `roomState`: Contains the current game state including messages array
- `currentPlayer`: Information about the current user

### State Management
- `message`: Current input text being typed
- `isExpanded`: Controls whether chat is expanded or minimized
- `messagesEndRef`: Reference for auto-scrolling to latest message

## UI Components

### 1. Minimized View
When collapsed, shows a floating button with:
- Chat icon
- "Chat" label
- Message count badge (if messages exist)

### 2. Expanded View

#### Header
- Chat icon and title
- Message count display (abbreviated on mobile)
- Minimize button

#### Messages Area
- Scrollable message list
- Each message shows: `PlayerName : Message text`
- Empty state with helpful prompt
- Auto-scroll to newest messages

#### Input Area
- Text input field with placeholder
- Send button (icon only on mobile, with text on desktop)
- Character counter (appears when > 450 characters)
- Form submission on Enter key

## Visual Design

### Color Scheme
- **Background**: Dark slate with transparency and blur effect (`bg-slate-900/95 backdrop-blur-md`)
- **Player Names**: White with semibold weight
- **Messages**: Light slate (`text-slate-200`)
- **Accents**: Purple theme (`purple-600`, `purple-400`)
- **Borders**: Semi-transparent white (`border-white/10`)

### Typography
- **Messages**: 12px (mobile) / 14px (desktop)
- **Header**: 12px (mobile) / 14px (desktop)
- **Input**: 12px (mobile) / 14px (desktop)

### Layout
- **Mobile**: Full-width, bottom-anchored
- **Desktop**: Right-aligned sidebar
- **Transitions**: Smooth 300ms animations

## Usage

The ChatBox automatically renders for online game modes only. It will not display in offline mode.

```tsx
import { ChatBox } from './components/ChatBox';

<ChatBox 
    roomState={currentRoomState} 
    currentPlayer={player} 
/>
```

## Integration

### Message Flow
1. User types message in input field
2. On submit, `gameService.sendChatMessage()` is called
3. Message is sent to the server via WebSocket
4. Server broadcasts message to all players in the room
5. All clients receive the message and update their `roomState.messages`
6. ChatBox re-renders with the new message

### Data Structure
```typescript
interface ChatMessage {
    id: string;
    playerId: string;
    playerName: string;
    avatar: string;
    message: string;
    timestamp: number;
}
```

## Accessibility

- **ARIA labels**: Minimize button includes `aria-label="Minimize chat"`
- **Keyboard support**: Full form submission with Enter key
- **Focus management**: Input field refocuses after sending message
- **Visual feedback**: Disabled state for empty messages

## Performance Optimizations

- **Conditional rendering**: Only renders in online mode
- **Auto-scroll optimization**: Only scrolls when expanded
- **Message length limit**: Prevents excessive data transmission
- **Overscroll containment**: Better scroll performance on mobile

## Future Enhancements

Potential improvements for future versions:
- Message timestamps display
- Player role indicators (imposter/innocent)
- Emoji support
- Message reactions
- Typing indicators
- Read receipts
- Message search/filter
- Chat history persistence

## Technical Notes

- Built with **React** and **TypeScript**
- Styled with **Tailwind CSS**
- Uses **Lucide React** for icons
- Real-time updates via **WebSocket** connection through `gameService`
