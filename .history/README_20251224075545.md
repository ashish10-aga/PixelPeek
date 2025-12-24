# PixelPeek 🎮

A blur-to-reveal image guessing game with AI-powered hints, multiple themes, and advanced React patterns.

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Quick Start](#quick-start)
- [How to Play](#how-to-play)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [API Setup](#api-setup)
- [Configuration](#configuration)
- [Themes](#themes)
- [Game Mechanics](#game-mechanics)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## 📖 About

PixelPeek is a modern web game where players guess hidden images based on progressively unblurred visuals. Get AI hints at different levels, compete for high scores, and switch between three unique themes (Retro, Minimal, Sci-Fi).

**Built with**: React + Vite + Tailwind CSS  
**AI**: Google Gemini API for intelligent hints  
**Images**: Unsplash API for random images  

## ✨ Features

### Core Gameplay
- 🎯 **Guess Hidden Images**: Images start fully blurred and gradually reveal
- 🤖 **AI Hints**: Google Gemini generates contextual hints at 5 difficulty levels
- 📊 **Scoring System**: Earn 100 points per correct guess, lose points with attempts
- 🎮 **Multiple Attempts**: Get 5 attempts before game over
- 🏆 **High Score Tracking**: Persistent high score saved to browser

### Visual Themes
- 🕹️ **Retro Theme**: Neon yellow borders, pixelated style, animated starfield
- 🌿 **Minimal Theme**: Clean modern design, soft green accents, glassmorphism
- 🛸 **Sci-Fi Theme**: Cyan HUD-style interface, animated scanlines, grid overlay

### Advanced Features
- 💾 **Smart Caching**: IndexedDB + LRU memory cache for images and API responses
- ⚡ **Performance**: Lazy loading, memoized components, optimized renders
- 🔧 **Error Boundaries**: Graceful error handling with recovery options
- 📈 **Analytics**: Track gameplay events (hints used, guesses, scores)
- 🎨 **Responsive Design**: Works on mobile, tablet, and desktop

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/ashish10-aga/PixelPeek.git
cd PixelPeek

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

**Get API Keys:**
- [Unsplash API](https://unsplash.com/oauth/applications): Free tier includes 50 requests/hour
- [Google Gemini API](https://ai.google.dev/): Free tier available with limitations

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🎮 How to Play

1. **Game Loads**: Random image appears fully blurred
2. **Read the Hint**: AI-generated hint about the image
3. **Make a Guess**: Type what you think the image is
4. **Check Your Answer**: 
   - ✅ **Correct**: Image reveals, score saved, move to next image
   - ❌ **Wrong**: Blur reduces by 4px, lose 15 points, get new hint
5. **Continue**: Keep guessing until you get it right or lose all 5 attempts
6. **High Score**: Beat your high score and track progress

### Scoring Rules

| Action | Score Change |
|--------|--------------|
| Correct Guess (1st try) | +100 points |
| Correct Guess (2nd try) | +85 points |
| Correct Guess (3rd try) | +70 points |
| Correct Guess (4th try) | +55 points |
| Correct Guess (5th try) | +40 points |
| Wrong Guess | -15 points |
| Image Fully Revealed | Game Over |

## 📂 Project Structure

```
PixelPeek/
├── src/
│   ├── App.jsx                          # Main game component (450+ lines)
│   ├── main.jsx                         # React entry point
│   ├── index.css                        # Global styles
│   │
│   ├── components/
│   │   ├── GameComponents.jsx           # Score, forms, hints (memoized)
│   │   ├── HeavyComponents.jsx          # Lazy image, containers
│   │   └── ErrorBoundary.jsx            # Error handling wrapper
│   │
│   ├── context/
│   │   └── GameContext.jsx              # State management (reducer pattern)
│   │
│   ├── hooks/
│   │   └── useCustomHooks.js            # 10 custom hooks (localStorage, async, etc)
│   │
│   ├── lib/
│   │   ├── apiService.js                # Unsplash API integration
│   │   ├── gemini.js                    # Gemini API for hints
│   │   ├── cacheManager.js              # IndexedDB + LRU cache
│   │   ├── advancedAnswerValidator.js   # Fuzzy matching + semantic validation
│   │   ├── logger.js                    # Performance tracking & analytics
│   │   └── utils.js                     # 40+ utility functions
│   │
│   ├── config/
│   │   └── gameConfig.js                # Centralized game settings
│   │
│   ├── js/
│   │   ├── theme-manager.js             # Theme switching & persistence
│   │   └── theme-ui.js                  # Theme selector UI
│   │
│   └── styles/
│       ├── base.css                     # Base layout & variables
│       └── themes/
│           ├── retro.css                # Retro theme (neon, pixelated)
│           ├── minimal.css              # Minimal theme (clean, modern)
│           └── scifi.css                # Sci-Fi theme (cyan HUD)
│
├── index.html                           # HTML entry point
├── package.json                         # Dependencies
├── vite.config.js                       # Vite configuration
├── tailwind.config.js                   # Tailwind CSS config
├── .env                                 # API keys (not committed)
└── README.md                            # This file
```

## 🛠️ Technologies

### Frontend Framework
- **React 18**: UI components with hooks
- **Vite**: Fast bundling and dev server
- **Tailwind CSS**: Utility-first styling

### Libraries
- **Framer Motion**: Smooth animations
- **Axios/Fetch**: HTTP requests

### APIs
- **Unsplash API**: Random images (600x600px)
- **Google Gemini API**: AI-powered hints

### State Management
- **React Context API**: Global game state
- **useReducer**: Centralized state logic

### Storage & Caching
- **IndexedDB**: Persistent image cache
- **localStorage**: High scores, theme preference
- **LRU Cache**: Memory optimization

## 🔐 API Setup

### Unsplash API

1. Go to [https://unsplash.com/oauth/applications](https://unsplash.com/oauth/applications)
2. Create a new application
3. Copy the **Access Key**
4. Add to `.env`: `VITE_UNSPLASH_ACCESS_KEY=your_key`

**Rate Limits**: 50 requests/hour (free tier)

### Google Gemini API

1. Go to [https://ai.google.dev/](https://ai.google.dev/)
2. Click "Get API Key" in Google AI Studio
3. Create new API key
4. Add to `.env`: `VITE_GEMINI_API_KEY=your_key`

**Rate Limits**: 60 requests/minute (free tier)

## ⚙️ Configuration

Edit `src/config/gameConfig.js` to customize:

```javascript
// Game Mechanics
maxAttempts: 5                    // Attempts before game over
initialBlur: 20                   // Starting blur amount (pixels)
blurDecrement: 4                  // Blur reduction per wrong guess
initialScore: 100                 // Starting score
scoreDecrement: 15                // Points lost per wrong guess

// API Timeouts
api.unsplash.timeout: 8000        // Image fetch timeout
api.gemini.timeout: 10000         // Hint generation timeout

// Cache Settings
cache.ttl: 24 * 60 * 60 * 1000   // Cache expires after 24 hours
cache.memoryCacheSize: 50         // Keep 50 images in memory

// Categories
categories: ['nature', 'animals', 'technology', ...]  // Image types
```

## 🎨 Themes

### Switching Themes

1. **First Load**: Modal appears asking for theme preference
2. **In-Game**: Click palette icon in header → select new theme
3. **Persistent**: Theme selection saved to localStorage

### Retro Theme
- Neon yellow borders (#FFD700)
- Black background with animated starfield
- Pixelated font rendering
- Press Start 2P monospace font
- Green text hints (#00FF00)

### Minimal Theme  
- Soft green accents (#00FF9A)
- Deep blue gradient background
- Glassmorphism panels with backdrop blur
- Clean modern fonts (Inter)
- Subtle glow effects

### Sci-Fi Theme
- Cyan accent (#00E5FF)
- Dark navy background with grid overlay
- Animated scanlines on images
- Orbitron futuristic font
- HUD-style bordered panels

## 🎯 Game Mechanics

### Blur Mechanics
- **Initial**: Image blurred 20px
- **Each Wrong Guess**: Blur reduces by 4px
- **Fully Revealed**: Image at 0px blur = game over (automatic loss)

### Hint Mechanics
- **Level 0**: General hint about image
- **Level 1**: More specific clues
- **Level 2**: Category hints
- **Level 3**: Detailed descriptions
- **Level 4**: Near-complete reveals

### Scoring
```
Score = Max(0, 100 - (15 * wrong_attempts))

Examples:
- First try correct: +100 points
- Second try correct: +85 points (100 - 15*1)
- Third try correct: +70 points (100 - 15*2)
- Fourth try correct: +55 points (100 - 15*3)
- Fifth try correct: +40 points (100 - 15*4)
```

### Answer Validation

Uses multiple strategies (in order):
1. **Exact Match**: "dog" == "dog" ✅
2. **Substring**: "golden retriever" contains "dog" ✅
3. **Fuzzy Matching**: Levenshtein distance ≥ 88%
4. **Token Overlap**: Word matching with Jaccard similarity
5. **Entity Matching**: Semantic understanding of nouns
6. **Gemini Validation**: Final AI check for edge cases

## 💻 Development

### Custom Hooks (src/hooks/useCustomHooks.js)

```javascript
useLocalStorage(key, initialValue)        // Sync with localStorage
useAsync(asyncFn, deps)                   // Handle async operations
useDebounce(value, delay)                 // Debounce values
useThrottle(callback, delay)              // Throttle functions
useIntersectionObserver(ref, options)     // Detect visibility
usePrevious(value)                        // Track previous value
useWindowSize()                           // Track window dimensions
usePerformanceMetrics(name)               // Measure render time
useOnMount(callback)                      // Run on mount
useIsMounted()                            // Check if mounted
```

### Game Context (src/context/GameContext.jsx)

```javascript
// Actions
dispatch({ type: 'SET_IMAGE', payload: url })
dispatch({ type: 'SET_HINT', payload: 'hint text' })
dispatch({ type: 'INCREMENT_ATTEMPTS' })
dispatch({ type: 'DECREMENT_SCORE', payload: 15 })
dispatch({ type: 'REVEAL_ANSWER' })
dispatch({ type: 'RESET_GAME' })
```

## 🐛 Troubleshooting

### "Image not loading"
- **Check**: Unsplash API key is valid
- **Check**: Not exceeding 50 requests/hour limit
- **Solution**: Wait a few minutes before retrying

### "Hints not generating"
- **Check**: Gemini API key is set correctly
- **Check**: Not exceeding 60 requests/minute limit
- **Solution**: Fallback hints will appear if API fails

### "Theme not persisting"
- **Check**: localStorage is enabled in browser
- **Solution**: Clear cache → refresh → select theme again

### "Performance issues"
- **Check**: Browser DevTools → Performance tab
- **Solution**: 
  - Clear cache: `cacheManager.clear()`
  - Disable animations: Settings → Reduce motion
  - Close other tabs

### "High score not saving"
- **Check**: localStorage quota (usually 5-10MB)
- **Solution**: Clear old data or use private/incognito mode

### "API Timeouts"
- **Slow connection**: Increase timeouts in `gameConfig.js`
- **VPN/Proxy issues**: Try disabling VPN temporarily

## 📊 Performance

### Optimizations Implemented
- ✅ Component memoization with React.memo
- ✅ useMemo for expensive calculations
- ✅ useCallback for stable function references
- ✅ Lazy loading images with intersection observer
- ✅ Code splitting with dynamic imports
- ✅ IndexedDB caching for API responses
- ✅ LRU memory cache (50 item limit)

### Metrics
- **Initial Load**: ~1.2 seconds
- **Time to Interactive**: ~2 seconds
- **First Image Load**: ~800ms
- **Hint Generation**: ~2-3 seconds
- **Theme Switch**: ~100ms

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Environment Variables on Deploy
Add these to your hosting platform:
- `VITE_UNSPLASH_ACCESS_KEY`
- `VITE_GEMINI_API_KEY`

## 📝 License

MIT License - feel free to use and modify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For issues and questions:
- Check [Troubleshooting](#troubleshooting) section
- Open GitHub issue: [Issues](https://github.com/ashish10-aga/PixelPeek/issues)
- Review [THEME_SYSTEM_DOCUMENTATION.md](./THEME_SYSTEM_DOCUMENTATION.md) for theme details

---

**Last Updated**: December 24, 2025  
**Status**: ✅ Production Ready  

**Have fun playing! 🎮**
