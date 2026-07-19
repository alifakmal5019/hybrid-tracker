# Hybrid Training Tracker - PWA

A Progressive Web App for tracking hybrid training (lifting + running) with a focus on building a lean, athletic physique.

## Features

- **Dashboard** - Quick stats: weight, waist, weekly workouts, streak
- **Log Workout** - Track exercises with sets/reps/weight, RPE, and run details
- **Weekly Check-In** - Log weight, waist, energy, sleep quality
- **History** - View and manage past workouts and check-ins
- **Exercise Guide** - Reference for must-do exercises with progression targets
- **Offline Support** - Works without internet after first load
- **Installable** - Add to home screen like a native app

## File Structure

```
hybrid-tracker-pwa/
├── index.html          # Main app
├── manifest.json       # PWA manifest
├── sw.js              # Service worker (offline support)
├── css/
│   └── style.css      # App styles
├── js/
│   └── app.js         # App logic & data management
└── icons/
    ├── icon-192x192.png   # App icon (192px)
    └── icon-512x512.png   # App icon (512px)
```

## Step-by-Step: Deploy to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** button (top right) → **New repository**
3. Name it: `hybrid-tracker` (or any name you like)
4. Make it **Public**
5. Click **Create repository**

### Step 2: Upload Files

**Option A: Using GitHub Web Interface (Easiest)**

1. In your new repo, click **"uploading an existing file"**
2. Drag and drop ALL files from the `hybrid-tracker-pwa` folder:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `css/style.css`
   - `js/app.js`
   - `icons/icon-192x192.png`
   - `icons/icon-512x512.png`
3. Add a commit message: `Initial commit`
4. Click **Commit changes**

**Option B: Using Git (If you have Git installed)**

```bash
# Navigate to the project folder
cd hybrid-tracker-pwa

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/hybrid-tracker.git

# Push
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. In your repo, click **Settings** (top tab)
2. Scroll down to **Pages** (left sidebar)
3. Under **Source**, select **Deploy from a branch**
4. Select **main** branch and **/(root)** folder
5. Click **Save**
6. Wait 1-2 minutes, then visit the URL shown (e.g., `https://yourusername.github.io/hybrid-tracker`)

### Step 4: Install on Your Phone

**iPhone (Safari):**
1. Open the GitHub Pages URL in Safari
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add**

**Android (Chrome):**
1. Open the GitHub Pages URL in Chrome
2. Tap the **menu** (three dots)
3. Tap **"Add to Home screen"** or **"Install app"**
4. Tap **Install**

**Note:** You may see an install banner at the bottom of the screen - tap it!

## How to Use

### First Time Setup
1. Open the app (from home screen or browser)
2. The app will work offline after the first load
3. All data is stored locally on your device

### Logging a Workout
1. Tap **Workout** tab
2. Select workout type (Upper, Lower, Full Body, etc.)
3. Exercises auto-fill based on type
4. Fill in sets, reps, weight for each exercise
5. Add run details if applicable
6. Tap **Save Workout**

### Weekly Check-In
1. Tap **Check-In** tab
2. Enter weight and waist measurement
3. Slide energy and sleep quality (1-10)
4. Note night shifts this week
5. Tap **Save Check-In**

### Viewing Progress
- **Dashboard** shows current stats and recent activity
- **History** shows all past workouts and check-ins
- **Guide** has your exercise reference

## Data Backup

All data is stored in your browser's localStorage. To backup:

1. Open the app in Chrome on desktop
2. Open DevTools (F12) → Console
3. Type: `exportData()`
4. A JSON file will download

To restore:
1. Open the app
2. In Console, use: `importData()` (you'll need to modify this function to accept a file)

Or manually backup localStorage:
- Chrome: DevTools → Application → Local Storage

## Customization

### Changing Colors
Edit `css/style.css` and modify the CSS variables at the top:

```css
:root {
    --bg-primary: #0f0f1a;    /* Main background */
    --accent: #e94560;         /* Primary color (buttons, highlights) */
    --success: #4ecca3;        /* Success/good indicators */
}
```

### Adding Exercises
Edit `js/app.js` and modify the `EXERCISE_TEMPLATES` object:

```javascript
const EXERCISE_TEMPLATES = {
    upper: [
        { name: 'Your Exercise', sets: '3', reps: '10', weight: '' },
        // ...
    ]
};
```

## Troubleshooting

**App not installing?**
- Make sure you're using HTTPS (GitHub Pages does this automatically)
- Check that manifest.json and sw.js are in the root
- Icons must be PNG format for install prompt

**Data not saving?**
- Check browser permissions for localStorage
- Make sure you're not in private/incognito mode
- Some browsers clear localStorage in private mode

**App looks weird on phone?**
- The app is designed for mobile first
- On desktop, it centers with max-width: 480px
- Make sure viewport meta tag is present (it is in index.html)

## Tech Stack

- **Pure HTML/CSS/JS** - No frameworks needed
- **localStorage** - Client-side data persistence
- **Service Worker** - Offline functionality
- **Web App Manifest** - Installable app experience

## License

Free to use and modify for personal use.
