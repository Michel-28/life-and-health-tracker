import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, MetricCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Dumbbell,
  Plus,
  Trash2,
  Trophy,
  Flame,
  Calendar,
  Layers,
  Activity,
  Search,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

export const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [exercisesLib, setExercisesLib] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isNewExerciseModalOpen, setIsNewExerciseModalOpen] = useState(false);

  // New Workout Form state
  const [workoutForm, setWorkoutForm] = useState({
    name: 'Full Body Session',
    category: 'Full body',
    date: new Date().toISOString().split('T')[0],
    startTime: '07:30',
    endTime: '08:30',
    totalDurationMinutes: 60,
    generalNotes: '',
    exercises: [
      {
        exerciseName: 'Barbell Bench Press',
        muscleGroup: 'Chest',
        equipment: 'Barbell',
        isCardio: false,
        sets: [
          { setNumber: 1, reps: 10, weight: 60, rpe: 7, restSeconds: 90 },
          { setNumber: 2, reps: 8, weight: 70, rpe: 8, restSeconds: 90 }
        ]
      }
    ]
  });

  // New Exercise Form state
  const [newExerciseForm, setNewExerciseForm] = useState({
    name: '',
    muscleGroup: 'Chest',
    equipment: 'Barbell',
    category: 'Strength',
    instructions: ''
  });

  const fetchData = async () => {
    try {
      const [workoutsRes, analyticsRes, exercisesRes] = await Promise.all([
        api.get(`/workouts?category=${categoryFilter}`),
        api.get('/workouts/analytics'),
        api.get('/workouts/exercises')
      ]);
      setWorkouts(workoutsRes.data.data);
      setAnalytics(analyticsRes.data);
      setExercisesLib(exercisesRes.data.data);
    } catch (err) {
      console.error('Failed to fetch workout data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter]);

  const handleAddExerciseToForm = (exercise) => {
    setWorkoutForm({
      ...workoutForm,
      exercises: [
        ...workoutForm.exercises,
        {
          exerciseName: exercise.name,
          muscleGroup: exercise.muscleGroup,
          equipment: exercise.equipment,
          isCardio: exercise.category === 'Cardio',
          sets: [
            { setNumber: 1, reps: 10, weight: 40, distance: 0, durationMinutes: 0, rpe: 7, restSeconds: 90 }
          ]
        }
      ]
    });
    setIsLibraryModalOpen(false);
  };

  const handleAddSet = (exerciseIdx) => {
    const updated = [...workoutForm.exercises];
    const currentSets = updated[exerciseIdx].sets;
    const lastSet = currentSets[currentSets.length - 1] || { reps: 10, weight: 40, rpe: 7, restSeconds: 90 };
    currentSets.push({
      setNumber: currentSets.length + 1,
      reps: lastSet.reps,
      weight: lastSet.weight,
      distance: lastSet.distance || 0,
      durationMinutes: lastSet.durationMinutes || 0,
      rpe: lastSet.rpe,
      restSeconds: lastSet.restSeconds
    });
    setWorkoutForm({ ...workoutForm, exercises: updated });
  };

  const handleRemoveSet = (exerciseIdx, setIdx) => {
    const updated = [...workoutForm.exercises];
    updated[exerciseIdx].sets.splice(setIdx, 1);
    // renumber
    updated[exerciseIdx].sets.forEach((s, idx) => { s.setNumber = idx + 1; });
    setWorkoutForm({ ...workoutForm, exercises: updated });
  };

  const handleRemoveExercise = (exerciseIdx) => {
    const updated = [...workoutForm.exercises];
    updated.splice(exerciseIdx, 1);
    setWorkoutForm({ ...workoutForm, exercises: updated });
  };

  const handleSetChange = (exerciseIdx, setIdx, field, value) => {
    const updated = [...workoutForm.exercises];
    updated[exerciseIdx].sets[setIdx][field] = Number(value);
    setWorkoutForm({ ...workoutForm, exercises: updated });
  };

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    try {
      await api.post('/workouts', workoutForm);
      setIsCreateModalOpen(false);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save workout.');
    }
  };

  const handleCreateCustomExercise = async (e) => {
    e.preventDefault();
    try {
      await api.post('/workouts/exercises', newExerciseForm);
      setIsNewExerciseModalOpen(false);
      const res = await api.get('/workouts/exercises');
      setExercisesLib(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create exercise');
    }
  };

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workout log?')) return;
    try {
      await api.delete(`/workouts/${id}`);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert('Failed to delete workout.');
    }
  };

  const categories = ['All', 'Upper body', 'Lower body', 'Push', 'Pull', 'Legs', 'Full body', 'Core', 'Cardio', 'Running', 'Mobility'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Workout & Strength Tracker</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log exercises, progressive overload, training volume and personal records
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={BookOpen} onClick={() => setIsLibraryModalOpen(true)}>
            Exercise Library
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
            Record Workout
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Workouts"
          value={analytics?.totalWorkouts || 0}
          unit="sessions"
          icon={Dumbbell}
          color="brand"
        />
        <MetricCard
          title="Lifetime Volume"
          value={analytics?.totalLifetimeVolume ? (analytics.totalLifetimeVolume / 1000).toFixed(1) : 0}
          unit="tonnes"
          icon={Flame}
          color="amber"
          subtext="Sum of weight × reps"
        />
        <MetricCard
          title="Training Duration"
          value={analytics?.totalLifetimeDuration ? (analytics.totalLifetimeDuration / 60).toFixed(1) : 0}
          unit="hours"
          icon={Activity}
          color="blue"
        />
        <MetricCard
          title="Tracked PRs"
          value={analytics?.personalRecords ? Object.keys(analytics.personalRecords).length : 0}
          unit="exercises"
          icon={Trophy}
          color="purple"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Training Volume Progression (kg)" subtitle="Total load over recent workout sessions">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.volumeTimeline || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="volume" name="Volume (kg)" stroke="#22c55e" strokeWidth={2} fill="url(#volGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Muscle Group Distribution" subtitle="Distribution of exercises per anatomical muscle group">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.muscleGroupDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="count" name="Exercises" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Personal Records Highlight */}
      {analytics?.personalRecords && Object.keys(analytics.personalRecords).length > 0 && (
        <Card title="Personal Records & Estimated 1RM" subtitle="Heaviest weight and estimated single-rep maximums (Epley formula)">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(analytics.personalRecords).slice(0, 8).map(([name, pr]) => (
              <div key={name} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-xs font-semibold text-slate-500 uppercase">{name}</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">{pr.maxWeight} kg</span>
                  <span className="text-xs text-brand-500 font-semibold">1RM ~ {pr.estimated1RM} kg</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Max session vol: {pr.maxVolume} kg</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Workout History with Category Filter */}
      <Card
        title="Workout Log History"
        subtitle="Complete chronological workout archive"
        action={
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-sm">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        }
      >
        <div className="space-y-4">
          {workouts.length > 0 ? (
            workouts.map((w) => (
              <div
                key={w._id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-base text-slate-900 dark:text-white">{w.name}</h4>
                      <Badge variant="brand">{w.category}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                      <span>{new Date(w.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>{w.totalDurationMinutes} mins ({w.startTime} - {w.endTime})</span>
                      <span>•</span>
                      <span className="font-medium text-emerald-500">Volume: {w.totalVolume?.toLocaleString() || 0} kg</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteWorkout(w._id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-colors self-start sm:self-auto"
                    title="Delete log"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Exercises in workout */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {w.exercises?.map((ex, exIdx) => (
                    <div key={exIdx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between font-medium text-slate-800 dark:text-slate-200 mb-2">
                        <span>{ex.exerciseName}</span>
                        <span className="text-[10px] text-slate-400">{ex.muscleGroup}</span>
                      </div>
                      <div className="space-y-1">
                        {ex.sets?.map((s, sIdx) => (
                          <div key={sIdx} className="flex items-center justify-between text-slate-500 text-[11px]">
                            <span>Set {s.setNumber}:</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {s.weight} kg × {s.reps} reps {s.rpe ? `(RPE ${s.rpe})` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {w.generalNotes && (
                  <p className="text-xs text-slate-500 italic mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    "{w.generalNotes}"
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              No workouts logged in this category. Click "Record Workout" above to begin.
            </div>
          )}
        </div>
      </Card>

      {/* CREATE WORKOUT MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Record Workout Session"
        subtitle="Log exercises, weights, reps, sets and difficulty"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateWorkout} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Workout Name</label>
              <input
                type="text"
                required
                value={workoutForm.name}
                onChange={(e) => setWorkoutForm({ ...workoutForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Category</label>
              <select
                value={workoutForm.category}
                onChange={(e) => setWorkoutForm({ ...workoutForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Duration (Mins)</label>
              <input
                type="number"
                min="1"
                required
                value={workoutForm.totalDurationMinutes}
                onChange={(e) => setWorkoutForm({ ...workoutForm, totalDurationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          {/* Exercise Sets Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Exercises & Sets</h4>
              <Button size="sm" variant="outline" icon={Plus} onClick={() => setIsLibraryModalOpen(true)}>
                Add Exercise from Library
              </Button>
            </div>

            {workoutForm.exercises.map((ex, exIdx) => (
              <div key={exIdx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">{ex.exerciseName}</span>
                    <Badge variant="neutral">{ex.muscleGroup}</Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(exIdx)}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Remove Exercise
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-6 gap-2 text-[11px] font-semibold text-slate-400 uppercase px-1">
                    <span>Set</span>
                    <span>Reps</span>
                    <span>Weight (kg)</span>
                    <span>RPE (1-10)</span>
                    <span>Rest (sec)</span>
                    <span>Action</span>
                  </div>
                  {ex.sets.map((s, sIdx) => (
                    <div key={sIdx} className="grid grid-cols-6 gap-2 items-center">
                      <span className="text-xs font-semibold text-slate-500 px-1">Set {s.setNumber}</span>
                      <input
                        type="number"
                        min="1"
                        value={s.reps}
                        onChange={(e) => handleSetChange(exIdx, sIdx, 'reps', e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      />
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={s.weight}
                        onChange={(e) => handleSetChange(exIdx, sIdx, 'weight', e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      />
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={s.rpe}
                        onChange={(e) => handleSetChange(exIdx, sIdx, 'rpe', e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      />
                      <input
                        type="number"
                        step="15"
                        value={s.restSeconds}
                        onChange={(e) => handleSetChange(exIdx, sIdx, 'restSeconds', e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSet(exIdx, sIdx)}
                        className="text-xs text-rose-500 hover:text-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddSet(exIdx)}
                    className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline mt-1"
                  >
                    + Add Set
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Session Notes</label>
            <textarea
              rows={2}
              value={workoutForm.generalNotes}
              onChange={(e) => setWorkoutForm({ ...workoutForm, generalNotes: e.target.value })}
              placeholder="Felt great, pushed bench press PR, solid pump"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Workout</Button>
          </div>
        </form>
      </Modal>

      {/* EXERCISE LIBRARY MODAL */}
      <Modal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
        title="Exercise Library"
        subtitle="Select an exercise or create custom movement"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{exercisesLib.length} movements available</span>
            <Button size="sm" variant="outline" icon={Plus} onClick={() => { setIsLibraryModalOpen(false); setIsNewExerciseModalOpen(true); }}>
              Add Custom Exercise
            </Button>
          </div>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {exercisesLib.map((ex) => (
              <div
                key={ex._id}
                onClick={() => handleAddExerciseToForm(ex)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 cursor-pointer flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 transition-all"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{ex.name}</p>
                  <p className="text-xs text-slate-500">{ex.muscleGroup} • {ex.equipment}</p>
                </div>
                <Badge variant="brand">{ex.category}</Badge>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* NEW CUSTOM EXERCISE MODAL */}
      <Modal
        isOpen={isNewExerciseModalOpen}
        onClose={() => setIsNewExerciseModalOpen(false)}
        title="Add Custom Exercise"
        subtitle="Create a custom movement for your routine"
      >
        <form onSubmit={handleCreateCustomExercise} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Exercise Name</label>
            <input
              type="text"
              required
              value={newExerciseForm.name}
              onChange={(e) => setNewExerciseForm({ ...newExerciseForm, name: e.target.value })}
              placeholder="e.g. Incline Cable Flyes"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Muscle Group</label>
              <select
                value={newExerciseForm.muscleGroup}
                onChange={(e) => setNewExerciseForm({ ...newExerciseForm, muscleGroup: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                {['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Full Body', 'Cardio'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Equipment</label>
              <select
                value={newExerciseForm.equipment}
                onChange={(e) => setNewExerciseForm({ ...newExerciseForm, equipment: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                {['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'None'].map((eq) => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Instructions</label>
            <textarea
              rows={2}
              value={newExerciseForm.instructions}
              onChange={(e) => setNewExerciseForm({ ...newExerciseForm, instructions: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsNewExerciseModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Exercise</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

