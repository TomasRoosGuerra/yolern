# Learning Tracker - React Edition

A modern, comprehensive learning management application that combines hierarchical knowledge tree visualization with spaced repetition flashcards. Built with React, TypeScript, and Framer Motion for a smooth, Apple-inspired user experience.

## 🚀 Features

### 🌳 **Tree Management**

- **Hierarchical Visualization**: Interactive tree structure with expand/collapse functionality
- **CRUD Operations**: Add, edit, delete, and move nodes with drag & drop support
- **Inline Editing**: Click any node name to edit it directly
- **Search Functionality**: Find topics quickly across your entire knowledge tree
- **Multi-Select Mode**: Select multiple nodes for bulk operations
- **Undo/Redo System**: 50-action history for safe experimentation
- **Status Progression**: Track learning progress (no-status → visited → learning → learnt)
- **Progress Visualization**: Real-time progress bars showing completion percentage
- **Visual Card Indicators**: See which topics have flashcards with status-based colors

### 🧠 **Spaced Repetition System**

- **SM-2 Algorithm**: Scientifically-proven spaced repetition for optimal learning
- **Quality Ratings**: 4-level rating system (Again, Hard, Good, Easy)
- **Automatic Scheduling**: Smart interval calculation based on performance
- **Due Date Tracking**: Never miss a review with intelligent scheduling
- **Performance Analytics**: Track review history and learning statistics
- **Difficulty Classification**: Automatic difficulty assessment (beginner/intermediate/advanced)

### 🎴 **Multiple Study Modes**

- **Study Session Mode**: Traditional Q&A interface with progress tracking
- **Card Deck Mode**: Tinder-like swipeable cards with gesture controls
- **Breadth-First Learning**: Learn foundational concepts before diving into details
- **Smart Filtering**: Filter by folder, status, difficulty, and study mode
- **Folder Organization**: Cards organized by main knowledge branches

### 🔄 **Intelligent Synchronization**

- **Bidirectional Sync**: Real-time synchronization between tree and cards
- **Visual Sync Indicator**: Always know when your data is up-to-date
- **Progress Preservation**: Learning progress maintained during tree updates
- **Manual Card Editing**: Customize any card with the ✏️ button
- **Customization Tracking**: Visual badges for manually edited cards

### 💾 **Data Management**

- **Local Storage**: All data stored securely in your browser
- **Data Validation**: Automatic migration and validation of corrupted data
- **Debug Tools**: Built-in tools for troubleshooting and data management
- **Regeneration System**: Fresh card generation while preserving progress

### 🎨 **Modern UI/UX**

- **Apple-Inspired Design**: Clean, modern interface with smooth animations
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Context Menus**: Right-click support for quick actions
- **Keyboard Shortcuts**: Power-user features for efficient navigation
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

## 🛠️ Technology Stack

- **React 18**: Latest React with concurrent features
- **TypeScript**: Full type safety and developer experience
- **Vite**: Lightning-fast build tool and dev server
- **Framer Motion**: Smooth animations and gestures
- **Lucide React**: Beautiful, consistent iconography
- **CSS Custom Properties**: Modern CSS with design system
- **Local Storage API**: Persistent data storage

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd learning-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📖 How to Use

### 1. **Building Your Knowledge Tree**

- Click **"New Topic"** to add root-level topics
- Click the **"+"** button next to any node to add subtopics
- Click node names to edit them inline
- Use drag & drop to reorganize your tree structure

### 2. **Learning with Spaced Repetition**

- Switch to the **"Spaced Repetition"** tab
- Choose your study mode:
  - **Breadth-First**: Learn foundational concepts first (recommended)
  - **Due Cards**: Focus on overdue reviews
  - **New Only**: Practice new concepts
  - **Review Only**: Reinforce learned concepts
- Start a study session or use the card deck interface

### 3. **Rating Your Performance**

- **😫 Again**: Complete failure - card will be shown again soon
- **😓 Hard**: Correct but difficult - slightly longer interval
- **😊 Good**: Correct with normal difficulty - standard interval
- **😎 Easy**: Very easy - longer interval

### 4. **Tracking Progress**

- Watch progress bars fill up as you learn
- See visual indicators on tree nodes showing card status
- Monitor your learning statistics in the cards view
- Use filters to focus on specific areas

## 🎯 Learning Strategy

The app implements a **breadth-first learning approach**:

1. **L0 (Root Topics)**: Start with main subject areas
2. **L1 (Subtopics)**: Learn the major components
3. **L2 (Details)**: Dive into specific concepts
4. **L3+ (Deep Concepts)**: Master advanced topics

This ensures you build a solid foundation before tackling complex details.

## 🔧 Advanced Features

### Keyboard Shortcuts

- `Ctrl/Cmd + N`: Add new topic
- `F2` or `Enter`: Edit selected node
- `Delete`: Delete selected node
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Y`: Redo
- `Ctrl/Cmd + Shift + M`: Toggle multi-select mode

### Multi-Select Operations

- Select multiple nodes for bulk operations
- Bulk edit names, status, or delete multiple topics
- Efficient tree restructuring

### Data Management

- **Regenerate Cards**: Fix any data issues by regenerating all cards
- **Export/Import**: Save and restore your knowledge trees
- **Debug Mode**: Built-in tools for troubleshooting

## 🏗️ Architecture

### Component Structure

```
App
├── AppProvider (Context)
├── TreeView
│   ├── TreeNode (recursive)
│   └── TreeToolbar
└── CardsView
    ├── StudySession
    ├── CardDeck
    └── CardsToolbar
```

### Data Flow

1. **Tree Changes** → Auto-generate cards
2. **Card Study** → Update learning progress
3. **Progress Updates** → Sync back to tree
4. **Local Storage** → Persist all changes

### State Management

- **React Context**: Global state management
- **useReducer**: Complex state updates
- **Local Storage**: Persistent data
- **Real-time Sync**: Bidirectional updates

## 🎨 Design System

### Colors

- **Primary**: Purple gradient (#6a11cb → #2575fc)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)

### Typography

- **System Fonts**: Native OS fonts for optimal performance
- **Weight Scale**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing

- **Consistent Scale**: 4px base unit with logical progression
- **Responsive**: Adapts to different screen sizes

## 🔮 Future Enhancements

- **Multi-device Sync**: Cloud synchronization
- **Import/Export**: CSV, Anki deck formats
- **Advanced Analytics**: Learning curves and retention rates
- **Collaborative Features**: Share trees with others
- **Card Templates**: Custom question/answer templates
- **Mobile App**: Native iOS/Android applications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **SM-2 Algorithm**: Based on SuperMemo research
- **Framer Motion**: Smooth animations and gestures
- **Lucide Icons**: Beautiful, consistent iconography
- **Apple Design Guidelines**: Inspiration for modern UI/UX

---

**Built with ❤️ for learners who want to master knowledge systematically.**
