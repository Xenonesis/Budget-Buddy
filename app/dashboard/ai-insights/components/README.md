# AI Insights Components

This directory contains the refactored components for the AI Insights page, breaking down the monolithic page into focused, reusable components.

## Component Architecture

### Core Components

#### `QuotaStatusCard.tsx`
- **Purpose**: Displays API quota status and warnings
- **Features**: 
  - Shows quota usage and reset time
  - Warning styling for exceeded quotas
  - Refresh button for status updates
- **Props**: `quotaError`, `quotaStatus`, `onRefreshStatus`

#### `PageHeader.tsx`
- **Purpose**: Enhanced page header with navigation and quick stats
- **Features**:
  - Layout toggle buttons
  - Quick action buttons (refresh, settings)
  - Status badges and help section
  - Responsive design
- **Props**: `layoutMode`, `insightLoading`, `quotaStatus`, event handlers

#### `LayoutToggle.tsx`
- **Purpose**: View mode switcher (default, chat-focus, insights-focus)
- **Features**:
  - Icon-based toggle buttons
  - Active state indication
  - Tooltips for accessibility
- **Props**: `layoutMode`, `onLayoutChange`

### AI Components

#### `InsightsPanel.tsx`
- **Purpose**: Displays financial insights with enhanced UI
- **Features**:
  - Categorized insight cards with icons
  - Empty state with call-to-action
  - Loading states and refresh functionality
  - Amount highlighting and category badges
- **Props**: `insights`, `loading`, `onRefresh`, `className`

#### `ChatPanel.tsx`
- **Purpose**: Interactive AI chat interface
- **Features**:
  - Message bubbles with user/assistant distinction
  - Model selector integration
  - Auto-scroll to latest messages
  - Typing indicators and loading states
  - Keyboard shortcuts (Enter to send)
- **Props**: `messages`, `loading`, `currentModelConfig`, model data, event handlers

#### `ConversationHistory.tsx`
- **Purpose**: Manages chat conversation history
- **Features**:
  - Conversation list with metadata
  - Title editing functionality
  - Delete conversations
  - Active conversation highlighting
  - Date formatting and message counts
- **Props**: conversation data, active state, event handlers


### Utility Components

#### `ModelSelector.tsx`
- **Purpose**: Dropdown for AI model selection
- **Features**:
  - Provider-specific model lists
  - Loading states for model fetching
  - Fallback to default models
  - Comprehensive provider support
- **Props**: `provider`, `model`, `availableModels`, `loadingModels`, `onChange`

#### `EmptyState.tsx`
- **Purpose**: Onboarding screen when AI is not configured
- **Features**:
  - Feature showcase
  - Setup guide with steps
  - Provider comparison
  - Benefits highlighting
  - Call-to-action buttons
- **Props**: `onConfigureSettings`

#### `LoadingState.tsx`
- **Purpose**: Loading screen with progress indication
- **Features**:
  - Animated loading steps
  - Skeleton placeholders
  - Retry functionality
  - Professional loading experience
- **Props**: `onRetry`

## Layout Modes

### Default Mode
- Split view with insights on left, chat on right
- Conversation history below chat
- Balanced layout for both features

### Chat Focus Mode
- Chat takes 3/4 of the screen width
- Conversation history in sidebar
- Optimized for extended conversations

### Insights Focus Mode
- Full-width insights panel
- Centered layout with maximum space for insights
- Ideal for reviewing financial analysis

## Key Improvements

### User Experience
- **Enhanced Visual Design**: Modern card-based layout with proper spacing
- **Better Navigation**: Clear layout modes and quick actions
- **Improved Feedback**: Loading states, error handling, and success messages
- **Accessibility**: Proper ARIA labels, keyboard navigation, and tooltips

### Developer Experience
- **Component Separation**: Each component has a single responsibility
- **Type Safety**: Full TypeScript support with proper interfaces
- **Reusability**: Components can be used independently
- **Maintainability**: Clear prop interfaces and documentation

### Performance
- **Optimized Rendering**: Components only re-render when necessary
- **Lazy Loading**: Models loaded on demand
- **Efficient State Management**: Focused state in each component

## Usage Example

```tsx
import {
  QuotaStatusCard,
  InsightsPanel,
  ChatPanel,
  PageHeader
} from "./components";

// Use components with proper props
<PageHeader
  layoutMode={layoutMode}
  onLayoutChange={setLayoutMode}
  onRefreshInsights={handleRefresh}
/>

<QuotaStatusCard
  quotaError={quotaError}
  quotaStatus={quotaStatus}
  onRefreshStatus={fetchQuotaStatus}
/>
```

## Future Enhancements

- Add component testing
- Implement component storybook
- Add animation transitions
- Enhance mobile responsiveness
- Add keyboard shortcuts
- Implement drag-and-drop for layout customization