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
        let checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);

        const workoutDates = sorted.map(w => {
            const d = new Date(w.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        });

        while (workoutDates.includes(checkDate.getTime())) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
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
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('active');
        if (b.dataset.page === pageId) {
            b.classList.add('active');
        }
    });

    if (targetPage) {
        targetPage.scrollTop = 0;
    }

    if (pageId === 'dashboard') updateDashboard();
    if (pageId === 'history') updateHistory();
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        navigateTo(this.dataset.page);
    });
});

// ===== Dashboard =====
function updateDashboard() {
    const latestCheckin = DB.getLatestCheckin();
    document.getElementById('current-weight').textContent = latestCheckin ? latestCheckin.weight : '--';
    document.getElementById('current-waist').textContent = latestCheckin ? latestCheckin.waist : '--';
    document.getElementById('weekly-workouts').textContent = DB.getWeeklyWorkoutCount();
    document.getElementById('current-streak').textContent = DB.getCurrentStreak();

    const recentActivity = document.getElementById('recent-activity');
    const recentWorkouts = DB.getWorkouts().slice(0, 5);

    if (recentWorkouts.length === 0) {
        recentActivity.innerHTML = '<p class="empty-state">No workouts logged yet. Start today!</p>';
    } else {
        recentActivity.innerHTML = recentWorkouts.map(function(w) {
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
                <div class="activity-item" onclick="showWorkoutDetail(${w.id})">
                    <div class="activity-info">
                        <h4>${typeLabels[w.type] || w.type}</h4>
                        <p>${w.exercises.length} exercises${w.runDistance ? ' • ' + w.runDistance + 'km run' : ''}</p>
                    </div>
                    <div class="activity-date">${dateStr}</div>
                </div>
            `;
        }).join('');
    }
}

// ===== Workout Detail Modal =====
function showWorkoutDetail(id) {
    const workout = DB.getWorkouts().find(w => w.id === id);
    if (!workout) return;

    const typeLabels = {
        upper: 'Upper Body',
        lower: 'Lower Body',
        full: 'Full Body',
        'run-only': 'Run Only',
        custom: 'Custom'
    };

    const shiftLabels = {
        'day-off': 'Day Off',
        'day-shift': 'Day Shift',
        'night-shift': 'Night Shift',
        'post-night': 'Post Night Shift',
        'pre-night': 'Pre Night Shift'
    };

    const date = new Date(workout.date);
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    let exercisesHtml = '';
    if (workout.exercises && workout.exercises.length > 0) {
        exercisesHtml = workout.exercises.map(function(ex, i) {
            return `
                <div class="detail-exercise">
                    <div class="detail-exercise-num">${i + 1}</div>
                    <div class="detail-exercise-info">
                        <div class="detail-exercise-name">${ex.name}</div>
                        <div class="detail-exercise-stats">${ex.sets} sets × ${ex.reps} reps @ ${ex.weight || 'BW'}${ex.weight ? 'kg' : ''}</div>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        exercisesHtml = '<p class="detail-empty">No exercises logged</p>';
    }

    let runHtml = '';
    if (workout.runDistance) {
        runHtml = `
            <div class="detail-section">
                <h4>🏃 Run</h4>
                <div class="detail-run-grid">
                    <div class="detail-run-item">
                        <span class="detail-run-label">Distance</span>
                        <span class="detail-run-value">${workout.runDistance} km</span>
                    </div>
                    ${workout.runPace ? `
                    <div class="detail-run-item">
                        <span class="detail-run-label">Pace</span>
                        <span class="detail-run-value">${workout.runPace} /km</span>
                    </div>` : ''}
                    ${workout.runRpe ? `
                    <div class="detail-run-item">
                        <span class="detail-run-label">RPE</span>
                        <span class="detail-run-value">${workout.runRpe}/10</span>
                    </div>` : ''}
                </div>
            </div>
        `;
    }

    let notesHtml = '';
    if (workout.notes) {
        notesHtml = `
            <div class="detail-section">
                <h4>📝 Notes</h4>
                <p class="detail-notes">${workout.notes}</p>
            </div>
        `;
    }

    const modal = document.createElement('div');
    modal.className = 'detail-modal';
    modal.id = 'workout-detail-modal';
    modal.innerHTML = `
        <div class="detail-modal-overlay" onclick="closeWorkoutDetail()"></div>
        <div class="detail-modal-content">
            <div class="detail-modal-header">
                <div>
                    <h2>${typeLabels[workout.type] || workout.type}</h2>
                    <p class="detail-date">${dateStr} · ${shiftLabels[workout.shiftStatus] || workout.shiftStatus}</p>
                </div>
                <button class="detail-close" onclick="closeWorkoutDetail()">✕</button>
            </div>

            <div class="detail-body">
                ${workout.exercises && workout.exercises.length > 0 ? `
                <div class="detail-section">
                    <h4>💪 Exercises (${workout.exercises.length})</h4>
                    <div class="detail-exercises">
                        ${exercisesHtml}
                    </div>
                </div>
                ` : ''}

                ${runHtml}
                ${notesHtml}
            </div>

            <div class="detail-modal-footer">
                <button class="btn-secondary" onclick="closeWorkoutDetail()">Close</button>
                <button class="btn-danger" onclick="deleteWorkoutFromDetail(${workout.id})">🗑️ Delete</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closeWorkoutDetail() {
    const modal = document.getElementById('workout-detail-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function deleteWorkoutFromDetail(id) {
    if (confirm('Delete this workout?')) {
        DB.deleteWorkout(id);
        closeWorkoutDetail();
        updateHistory();
        updateDashboard();
    }
}

// ===== Workout Form =====
function addExercise(name, sets, reps, weight) {
    name = name || '';
    sets = sets || '';
    reps = reps || '';
    weight = weight || '';

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
    const row = document.querySelector('.exercise-row[data-id="' + id + '"]');
    if (row) row.remove();
}

function loadExerciseTemplate() {
    const type = document.getElementById('workout-type').value;
    const container = document.getElementById('exercises-container');
    container.innerHTML = '';

    const template = EXERCISE_TEMPLATES[type];
    if (template) {
        template.forEach(function(ex) {
            addExercise(ex.name, ex.sets, ex.reps, ex.weight);
        });
    }
}

const workoutForm = document.getElementById('workout-form');
if (workoutForm) {
    workoutForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const exercises = [];
        document.querySelectorAll('.exercise-row').forEach(function(row) {
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

        this.reset();
        document.getElementById('exercises-container').innerHTML = '';
        document.getElementById('workout-date').valueAsDate = new Date();

        alert('Workout saved!');
        navigateTo('dashboard');
    });
}

// ===== Check-In Form =====
function updateRangeLabel(labelId, value) {
    document.getElementById(labelId).textContent = value;
}

const checkinForm = document.getElementById('checkin-form');
if (checkinForm) {
    checkinForm.addEventListener('submit', function(e) {
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

        alert('Check-In saved!');
        navigateTo('dashboard');
    });
}

// ===== History =====
function showHistoryTab(tab) {
    document.querySelectorAll('.history-tabs .tab-btn').forEach(function(b) {
        b.classList.remove('active');
    });

    document.querySelectorAll('.history-tabs .tab-btn').forEach(function(btn) {
        if ((tab === 'workouts' && btn.textContent.includes('Workouts')) ||
            (tab === 'checkins' && btn.textContent.includes('Check-Ins'))) {
            btn.classList.add('active');
        }
    });

    document.getElementById('workouts-history').classList.toggle('hidden', tab !== 'workouts');
    document.getElementById('checkins-history').classList.toggle('hidden', tab !== 'checkins');
}

function updateHistory() {
    const workoutsList = document.getElementById('workouts-history');
    const workouts = DB.getWorkouts();

    if (workouts.length === 0) {
        workoutsList.innerHTML = '<p class="empty-state">No workouts yet</p>';
    } else {
        workoutsList.innerHTML = workouts.map(function(w) {
            const date = new Date(w.date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const typeLabels = { upper: 'Upper', lower: 'Lower', full: 'Full Body', 'run-only': 'Run', custom: 'Custom' };
            return `
                <div class="activity-item" onclick="showWorkoutDetail(${w.id})">
                    <div class="activity-info">
                        <h4>${typeLabels[w.type] || w.type} - ${dateStr}</h4>
                        <p>${w.exercises.length} exercises${w.runDistance ? ' • ' + w.runDistance + 'km' : ''}</p>
                    </div>
                    <span class="activity-chevron">›</span>
                </div>
            `;
        }).join('');
    }

    const checkinsList = document.getElementById('checkins-history');
    const checkins = DB.getCheckins();

    if (checkins.length === 0) {
        checkinsList.innerHTML = '<p class="empty-state">No check-ins yet</p>';
    } else {
        checkinsList.innerHTML = checkins.map(function(c) {
            const date = new Date(c.date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return `
                <div class="activity-item">
                    <div class="activity-info">
                        <h4>Check-In - ${dateStr}</h4>
                        <p>${c.weight}kg • ${c.waist}cm waist • Energy: ${c.energy}/10</p>
                    </div>
                    <button class="remove-btn" onclick="event.stopPropagation(); deleteCheckin(${c.id})">🗑️</button>
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
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js')
            .then(function(reg) { console.log('SW registered:', reg); })
            .catch(function(err) { console.log('SW registration failed:', err); });
    });
}

// ===== Install Prompt =====
let deferredPrompt;

window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;

    const prompt = document.createElement('div');
    prompt.className = 'install-prompt';
    prompt.id = 'install-prompt';
    prompt.innerHTML = '<span>📲 Install Hybrid Tracker for offline use</span><button onclick="installApp()">Install</button>';
    document.body.appendChild(prompt);
});

function installApp() {
    const prompt = document.getElementById('install-prompt');
    if (prompt) prompt.classList.add('hidden');

    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function(choice) {
            if (choice.outcome === 'accepted') {
                console.log('User installed the app');
            }
            deferredPrompt = null;
        });
    }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', function() {
    DB.init();

    const workoutDate = document.getElementById('workout-date');
    const checkinDate = document.getElementById('checkin-date');
    const today = new Date().toISOString().split('T')[0];

    if (workoutDate) workoutDate.value = today;
    if (checkinDate) checkinDate.value = today;

    updateDashboard();
});

// ===== Export/Import =====
function exportData() {
    const data = DB.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hybrid-tracker-backup-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
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
