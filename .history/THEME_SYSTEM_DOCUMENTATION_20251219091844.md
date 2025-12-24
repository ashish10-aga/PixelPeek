# PixelPeek Multi-Theme System Documentation

## Overview

A complete theme system has been implemented for PixelPeek, featuring three distinct visual identities (Retro, Minimal, Sci-Fi) with first-run theme selection, persistent storage, and in-game switching capabilities.

## Key Features

✅ **Three Unique Themes**
- **Retro**: Classic pixel-art with neon yellow borders (#ffd700) and animated starfield background
- **Minimal**: Modern clean interface with soft green accent (#00ff9a) and glassmorphism effects
- **Sci-Fi**: Futuristic cyan scanner HUD (#00e5ff) with animated scanlines and grid overlay

✅ **Smart Initialization**
- First-run modal prompts users to select theme
- Modal only shown once per device (localStorage tracked)
- Default theme is Retro if no selection made

✅ **In-Game Theme Switcher**
- Palette icon button in app header
- Dropdown menu with all theme options
- Current theme highlighted with indicator
- NO page reloads on theme switch
- NO new Unsplash API calls during switching

✅ **Persistent Storage**
- Theme choice saved to localStorage under key: `pixelpeekTheme`
- Theme automatically loads on next visit
- Modal shown key stored under: `pixelpeekThemeModalShown`

✅ **Theme-Aware Starfield**
- Starfield canvas automatically attaches for Retro theme
- Automatically detaches for Minimal/Sci-Fi themes
- Canvas management handled by ThemeManager

## File Structure

### CSS Files
```
src/styles/
├── base.css                    # Core layout + CSS variables + modal/switcher UI styles
└── themes/
    ├── retro.css              # Yellow borders, pixelated fonts, starfield integration
    ├── minimal.css            # Green accent, glassmorphism, modern typography
    └── scifi.css              # Cyan accent, scanner effects, grid overlay
```

### JavaScript Modules
```
src/js/
├── theme-manager.js           # Core theme system logic
│   ├── init()                 # Load saved theme or default
│   ├── applyTheme(name)       # Apply theme by name
│   ├── getTheme()             # Get current theme
│   ├── reset()                # Reset to default
│   ├── onThemeChange(cb)      # Register change callbacks
│   └── _manageStarfield()     # Handle starfield attach/detach
│
└── theme-ui.js                # UI components
    ├── showSelection()        # Show first-run modal
    ├── buildInGameSwitcher()  # Build palette button + dropdown
    └── Internal methods for modal/dropdown rendering
```

### Integration
```
src/main.jsx                    # Theme system initialized here
src/App.jsx                     # Theme switcher button inserted in header useEffect
```

## CSS Custom Properties (Variables)

All themes use CSS custom properties defined in `:root` and overridden per theme:

```css
/* Layout & Dimensions */
--panel-radius: 12px|6px
--panel-border-width: 1px|2px
--image-frame-padding: 8px
--image-rendering: auto|pixelated

/* Colors */
--bg: gradient or solid color
--panel-bg: rgba with transparency
--accent: theme-specific color
--muted: muted accent variant
--panel-border-color: border color
--panel-glow: box-shadow effects

/* Typography */
--font-family: 'Press Start 2P'|'Inter'|'Orbitron'
--score-font: monospace variant

/* Effects */
--image-blur: 12px blur amount
--panel-glow: 0 0 Xpx rgba(...)
--transition-speed: 0.2s or 0.3s
```

## How It Works

### On Page Load

1. **main.jsx** initializes:
   ```javascript
   ThemeManager.init()      // Loads saved theme or default
   ThemeUI.showSelection()  // Shows modal if first-time user
   ```

2. **ThemeManager.init()**:
   - Checks localStorage for saved theme
   - If found and valid, applies it
   - If not found, applies default (Retro)
   - Preloads all theme CSS files
   - Preloads all theme-specific fonts

3. **ThemeUI.showSelection()**:
   - Checks if user has seen modal before
   - If not, displays full-screen theme selection modal
   - Modal shows all three themes with preview
   - Clicking a theme applies it and marks modal as shown

### Theme Switching

1. User clicks palette icon in header
2. Dropdown menu appears with theme options
3. Current theme is highlighted
4. Clicking new theme:
   - `ThemeManager.applyTheme(name)` is called
   - Sets `html[data-theme="name"]`
   - Triggers _postApply() which:
     - Loads theme fonts
     - Manages starfield canvas (attach/detach)
     - Notifies change callbacks
   - CSS cascade applies new variable values
   - All components instantly update

## Theme Defaults

### CSS Variables by Theme

**Retro**:
- Accent: #ffd700 (bright yellow)
- Font: 'Press Start 2P' (pixelated)
- Border width: 1px
- Panel radius: 0-6px (sharp)
- Special: Starfield canvas enabled

**Minimal**:
- Accent: #00ff9a (soft green)
- Font: 'Inter' (modern sans-serif)
- Border width: 1px
- Panel radius: 12px (rounded)
- Special: Glassmorphism effects

**Sci-Fi**:
- Accent: #00e5ff (bright cyan)
- Font: 'Orbitron' (futuristic monospace)
- Border width: 2px
- Panel radius: 6px
- Special: Grid overlay, scanline animation

## Responsive Design

All three themes are responsive with breakpoints:
- **Desktop**: 1024px+ (all features)
- **Tablet**: 640px - 1023px (optimized layout)
- **Mobile**: < 640px (compact, single column)

Theme selection modal adapts:
- Desktop: 3 columns
- Tablet: 2 columns
- Mobile: 1 column

## Accessibility Features

✅ **Reduced Motion Support**:
- Starfield animation respects `prefers-reduced-motion: reduce`
- Scanline animation in Sci-Fi theme respects preference
- All transitions are gentle (0.2s - 0.3s)

✅ **Color Contrast**:
- All themes maintain WCAG AA contrast ratios
- Text shadow used for readability over backgrounds

✅ **Keyboard Navigation**:
- All buttons keyboard accessible
- Focus states clearly visible
- Escape key closes dropdowns

## No Disruptions

✅ **Game Logic Untouched**:
- Theme system is purely visual
- No changes to game scoring or validation
- No changes to API logic

✅ **Performance**:
- CSS changes only (instant)
- No JavaScript re-renders required
- Font preloading prevents FOUT (Flash of Unstyled Text)

✅ **API Integrity**:
- No new Unsplash API calls during theme switching
- Image caching unaffected
- Gemini API calls unaffected

## Implementation Details

### CSS Scoping Pattern

```css
/* Base variables (all themes) */
:root { --accent: #00ff9a; }

/* Theme override (Retro) */
html[data-theme="retro"] { --accent: #ffd700; }

/* Theme-scoped components */
html[data-theme="retro"] .panel { color: var(--accent); }
```

### Starfield Management

```javascript
// Retro theme only
if (themeName === 'retro') {
  // Create/show canvas and run animation
  canvas.style.display = 'block';
  _initStarfield(canvas);
} else {
  // Hide canvas for other themes
  canvas.style.display = 'none';
}
```

### Font Lazy-Loading

```javascript
// Theme-specific fonts loaded dynamically
const fontMap = {
  retro: ['https://fonts.googleapis.com/...Press+Start+2P...'],
  minimal: ['https://fonts.googleapis.com/...Inter...'],
  scifi: ['https://fonts.googleapis.com/...Orbitron...']
};
```

## Testing Checklist

- [x] First-run modal displays correctly
- [x] Modal only shown once (localStorage working)
- [x] Theme selector button visible in header
- [x] All three themes apply without page reload
- [x] Starfield shows only for Retro theme
- [x] Persistent storage works across page reloads
- [x] No Unsplash API calls during theme switch
- [x] Game logic remains unchanged
- [x] Responsive layout on all screen sizes
- [x] Accessibility features working
- [x] No console errors
- [x] Webkit backdrop-filter prefixes for Safari

## Future Enhancements

Potential improvements:
- Custom theme builder (user-defined colors)
- Theme transitions with animation
- More theme options (Dark, Neon, etc.)
- Per-component theme overrides
- System theme detection (auto dark/light)
- Export/import theme presets

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Tested |
| Firefox | ✅ Full | Tested |
| Safari | ✅ Full | Requires -webkit-backdrop-filter prefix |
| Edge | ✅ Full | Chromium-based |
| Mobile Safari | ✅ Full | Requires -webkit-backdrop-filter prefix |
| Android Chrome | ✅ Full | Tested |

## Troubleshooting

**Modal not showing on first load?**
- Check browser localStorage is enabled
- Clear `pixelpeekThemeModalShown` from localStorage
- Refresh page

**Theme not persisting across reloads?**
- Check browser localStorage is enabled
- Verify `pixelpeekTheme` key in localStorage
- Clear cache and reload

**Starfield not showing?**
- Only appears in Retro theme
- Check browser console for JavaScript errors
- Verify canvas support in browser

**Wrong fonts showing?**
- Check Network tab for Google Fonts requests
- Clear browser cache
- Try incognito mode

## Code Examples

### Manual Theme Switching
```javascript
// In any JavaScript code
import ThemeManager from './js/theme-manager';

ThemeManager.applyTheme('minimal');  // Switch to Minimal
ThemeManager.reset();                 // Back to Retro
```

### Listening to Theme Changes
```javascript
ThemeManager.onThemeChange((newTheme) => {
  console.log('Theme changed to:', newTheme);
  // React to theme change
});
```

### Getting Current Theme
```javascript
const current = ThemeManager.getTheme();  // Returns 'retro'|'minimal'|'scifi'
```

---

**System Version**: 1.0
**Last Updated**: 2024
**Status**: Production Ready
