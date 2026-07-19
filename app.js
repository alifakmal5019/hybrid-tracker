// ===== Hybrid Training Tracker - PWA =====
// Uses localStorage for data persistence (works offline)

// ===== Data Management =====
const DB = {
    workouts: [],
    checkins: [],

    init() {
        const savedWorkouts = localStorage.getItem('ht_workouts');
        const savedCheckins = localStorage.getItem('ht_checkins');
        if (savedWorkouts) this.workouts = JSON.parse(savedWorkouts);
        if (savedCheckins) this.checkins = JSON.parse(savedCheckins);
    },

    saveWorkout(workout) {
        workout.id = Date.now();
        workout.createdAt = new Date().toISOString();
        this.workouts.unshift(workout);
        localStorage.setItem('ht_workouts', JSON.stringify(this.workouts));
    },

    saveCheckin(checkin) {
        checkin.id = Date.now();
        checkin.createdAt = new Date().toISOString();
        // Remove any existing checkin for the same week
        this.checkins = this.checkins.filter(c => c.date !== checkin.date);
        this.checkins.unshift(checkin);
        localStorage.setItem('ht_checkins', JSON.stringify(this.checkins));
    },

    getWorkouts() {
        return this.workouts;
    },

    getCheckins() {
        return this.checkins;
    },

    deleteWorkout(id) {
        this.workouts = this.workouts.filter(w => w.id !== id);
        localStorage.setItem('ht_workouts', JSON.stringify(this.workouts));
    },

    deleteCheckin(id) {
        this.checkins = this.checkins.filter(c => c.id !== id);
        localStorage.setItem('ht_checkins', JSON.stringify(this.checkins));
    },

    getWeeklyWorkoutCount() {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return this.workouts.filter(w => new Date(w.date) >= oneWeekAgo).length;
    },

    getCurrentStreak() {
        if (this.workouts.length === 0) return 0;

        const sorted = [...this.workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const workout of sorted) {
            const workoutDate = new Date(workout.date);
            workoutDate.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));

            if (diffDays === streak) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (diffDays < streak) {
                continue;
            } else {
                break;
            }
        }
        return streak;
    },

    getLatestCheckin() {
        return this.checkins.length > 0 ? this.checkins[0] : null;
    },

    exportData() {
        return {
            workouts: this.workouts,
            checkins: this.checkins,
            exportedAt: new Date().toISOString()
        };
    },

    importData(data) {
        if (data.workouts) {
            this.workouts = data.workouts;
            localStorage.setItem('ht_workouts', JSON.stringify(this.workouts));
        }
        if (data.checkins) {
            this.checkins = data.checkins;
            localStorage.setItem('ht_checkins', JSON.stringify(this.checkins));
        }
    }
};

// ===== Exercise Templates =====
const EXERCISE_TEMPLATES = {
    upper: [
        { name: 'Pull-ups / Lat Pulldown', sets: '3', reps: '8-10', weight: '' },
        { name: 'Incline Dumbbell Press', sets: '3', reps: '10', weight: '' },
        { name: 'Cable / Barbell Row', sets: '3', reps: '10', weight: '' },
        { name: 'Overhead Press (DB)', sets: '3', reps: '10', weight: '' },
        { name: 'Face Pulls', sets: '3', reps: '15', weight: '' }
    ],
    lower: [
        { name: 'Romanian Deadlift', sets: '3', reps: '10', weight: '' },
        { name: 'Bulgarian Split Squat', sets: '3', reps: '8', weight: '' },
        { name: 'Goblet Squat / Leg Press', sets: '3', reps: '10', weight: '' },
        { name: 'Calf Raises', sets: '3', reps: '15', weight: '' },
        { name: 'Hanging Leg Raises', sets: '3', reps: '10', weight: '' }
    ],
    full: [
        { name: 'Dumbbell Bench Press', sets: '3', reps: '10', weight: '' },
        { name: 'Bent Over Rows', sets: '3', reps: '10', weight: '' },
        { name: 'Bulgarian Split Squats', sets: '3', reps: '8', weight: '' },
        { name: 'Lateral Raises', sets: '3', reps: '12', weight: '' },
        { name: 'Bicep Curls', sets: '2', reps: '12', weight: '' },
        { name: 'Tricep Pushdowns', sets: '2', reps: '12', weight: '' }
    ],
    'run-only': [],
    custom: []
};

// ===== Navigation =====
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(pageId).classList.add('active');
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

    if (pageId === 'dashboard') updateDashboard();
    if (pageId === 'history') updateHistory();
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

// ===== Dashboard =====
function updateDashboard() {
    const latestCheckin = DB.getLatestCheckin();
    document.getElementById('current-weight').textContent = latestCheckin ? latestCheckin.weight : '--';
    document.getElementById('current-waist').textContent = latestCheckin ? latestCheckin.waist : '--';
    document.getElementById('weekly-workouts').textContent = DB.getWeeklyWorkoutCount();
    document.getElementById('current-streak').textContent = DB.getCurrentStreak();

    // Update recent activity
    const recentActivity = document.getElementById('recent-activity');
    const recentWorkouts = DB.getWorkouts().slice(0, 5);

    if (recentWorkouts.length === 0) {
        recentActivity.innerHTML = '<p class="empty-state">No workouts logged yet. Start today!</p>';
    } else {
        recentActivity.innerHTML = recentWorkouts.map(w => {
            const date = new Date(w.date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const typeLabels = {
                upper: 'Upper Body',
                lower: 'Lower Body',
                full: 'Full Body',
                'run-only': 'Run Only',
                custom: 'Custom'
            };
            return `
                <div class="activity-item">
                    <div class="activity-info">
                        <h4>${typeLabels[w.type] || w.type}</h4>
                        <p>${w.exercises.length} exercises${w.runDistance ? ` • ${w.runDistance}km run` : ''}</p>
                    </div>
                    <div class="activity-date">${dateStr}</div>
                </div>
            `;
        }).join('');
    }
}

// ===== Workout Form =====
function addExercise(name = '', sets = '', reps = '', weight = '') {
    const container = document.getElementById('exercises-container');
    const id = Date.now() + Math.random();

    const row = document.createElement('div');
    row.className = 'exercise-row';
    row.dataset.id = id;
    row.innerHTML = `
        <div class="exercise-row-header">
            <input type="text" placeholder="Exercise name" value="${name}" class="ex-name">
            <button type="button" class="remove-btn" onclick="removeExercise(${id})">✕</button>
        </div>
        <div class="exercise-fields">
            <input type="text" placeholder="Sets" value="${sets}" class="ex-sets">
            <input type="text" placeholder="Reps" value="${reps}" class="ex-reps">
            <input type="text" placeholder="Weight (kg)" value="${weight}" class="ex-weight">
        </div>
    `;
    container.appendChild(row);
}

function removeExercise(id) {
    const row = document.querySelector(`[data-id="${id}"]`);
    if (row) row.remove();
}

function loadExerciseTemplate() {
    const type = document.getElementById('workout-type').value;
    const container = document.getElementById('exercises-container');
    container.innerHTML = '';

    const template = EXERCISE_TEMPLATES[type];
    if (template) {
        template.forEach(ex => addExercise(ex.name, ex.sets, ex.reps, ex.weight));
    }
}

document.getElementById('workout-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const exercises = [];
    document.querySelectorAll('.exercise-row').forEach(row => {
        const name = row.querySelector('.ex-name').value.trim();
        if (name) {
            exercises.push({
                name: name,
                sets: row.querySelector('.ex-sets').value,
                reps: row.querySelector('.ex-reps').value,
                weight: row.querySelector('.ex-weight').value
            });
        }
    });

    const workout = {
        date: document.getElementById('workout-date').value,
        shiftStatus: document.getElementById('shift-status').value,
        type: document.getElementById('workout-type').value,
        exercises: exercises,
        runDistance: document.getElementById('run-distance').value,
        runPace: document.getElementById('run-pace').value,
        runRpe: document.getElementById('run-rpe').value,
        notes: document.getElementById('session-notes').value
    };

    DB.saveWorkout(workout);

    // Reset form
    this.reset();
    document.getElementById('exercises-container').innerHTML = '';
    document.getElementById('workout-date').valueAsDate = new Date();

    alert('Workout saved!');
    navigateTo('dashboard');
});

// ===== Check-In Form =====
function updateRangeLabel(labelId, value) {
    document.getElementById(labelId).textContent = value;
}

document.getElementById('checkin-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const checkin = {
        date: document.getElementById('checkin-date').value,
        weight: document.getElementById('checkin-weight').value,
        waist: document.getElementById('checkin-waist').value,
        energy: document.getElementById('checkin-energy').value,
        sleep: document.getElementById('checkin-sleep').value,
        shifts: document.getElementById('checkin-shifts').value,
        notes: document.getElementById('checkin-notes').value
    };

    DB.saveCheckin(checkin);

    this.reset();
    document.getElementById('checkin-date').valueAsDate = new Date();
    updateRangeLabel('energy-label', '5');
    updateRangeLabel('sleep-label', '5');

    alert('Check-in saved!');
    navigateTo('dashboard');
});

// ===== History =====
function showHistoryTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    document.getElementById('workouts-history').classList.toggle('hidden', tab !== 'workouts');
    document.getElementById('checkins-history').classList.toggle('hidden', tab !== 'checkins');
}

function updateHistory() {
    // Workouts
    const workoutsList = document.getElementById('workouts-history');
    const workouts = DB.getWorkouts();

    if (workouts.length === 0) {
        workoutsList.innerHTML = '<p class="empty-state">No workouts yet</p>';
    } else {
        workoutsList.innerHTML = workouts.map(w => {
            const date = new Date(w.date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const typeLabels = { upper: 'Upper', lower: 'Lower', full: 'Full Body', 'run-only': 'Run', custom: 'Custom' };
            return `
                <div class="activity-item">
                    <div class="activity-info">
                        <h4>${typeLabels[w.type] || w.type} - ${dateStr}</h4>
                        <p>${w.exercises.length} exercises${w.runDistance ? ` • ${w.runDistance}km` : ''}</p>
                    </div>
                    <button class="remove-btn" onclick="deleteWorkout(${w.id})">🗑️</button>
                </div>
            `;
        }).join('');
    }

    // Check-ins
    const checkinsList = document.getElementById('checkins-history');
    const checkins = DB.getCheckins();

    if (checkins.length === 0) {
        checkinsList.innerHTML = '<p class="empty-state">No check-ins yet</p>';
    } else {
        checkinsList.innerHTML = checkins.map(c => {
            const date = new Date(c.date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return `
                <div class="activity-item">
                    <div class="activity-info">
                        <h4>Check-In - ${dateStr}</h4>
                        <p>${c.weight}kg • ${c.waist}cm waist • Energy: ${c.energy}/10</p>
                    </div>
                    <button class="remove-btn" onclick="deleteCheckin(${c.id})">🗑️</button>
                </div>
            `;
        }).join('');
    }
}

function deleteWorkout(id) {
    if (confirm('Delete this workout?')) {
        DB.deleteWorkout(id);
        updateHistory();
        updateDashboard();
    }
}

function deleteCheckin(id) {
    if (confirm('Delete this check-in?')) {
        DB.deleteCheckin(id);
        updateHistory();
        updateDashboard();
    }
}

// ===== Service Worker Registration =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registered:', reg))
            .catch(err => console.log('SW registration failed:', err));
    });
}

// ===== Install Prompt =====
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Show custom install prompt
    const prompt = document.createElement('div');
    prompt.className = 'install-prompt';
    prompt.id = 'install-prompt';
    prompt.innerHTML = `
        <span>📲 Install Hybrid Tracker for offline use</span>
        <button onclick="installApp()">Install</button>
    `;
    document.body.appendChild(prompt);
});

function installApp() {
    const prompt = document.getElementById('install-prompt');
    if (prompt) prompt.classList.add('hidden');

    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choice => {
            if (choice.outcome === 'accepted') {
                console.log('User installed the app');
            }
            deferredPrompt = null;
        });
    }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    DB.init();

    // Set default dates
    document.getElementById('workout-date').valueAsDate = new Date();
    document.getElementById('checkin-date').valueAsDate = new Date();

    updateDashboard();
});

// ===== Export/Import (for backup) =====
function exportData() {
    const data = DB.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hybrid-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            DB.importData(data);
            alert('Data imported successfully!');
            updateDashboard();
        } catch (err) {
            alert('Error importing data: ' + err.message);
        }
    };
    reader.readAsText(file);
}
