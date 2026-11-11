import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Dumbbell, Moon, Utensils, Scale, Droplet, Zap } from 'lucide-react';
import api from '../../services/api';

export const QuickLogModal = ({ isOpen, onClose, onSaved }) => {
  const [activeTab, setActiveTab] = useState('workout');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Workout state
  const [workoutData, setWorkoutData] = useState({
    name: 'Strength Training',
    category: 'Full body',
    totalDurationMinutes: 60,
    generalNotes: ''
  });

  // Sleep state
  const [sleepData, setSleepData] = useState({
    bedtime: '23:00',
    wakeTime: '07:00',
    sleepQuality: 8,
    morningFreshness: 8,
    notes: ''
  });

  // Meal state
  const [mealData, setMealData] = useState({
    mealCategory: 'Lunch',
    foodName: '',
    calories: 500,
    protein: 30,
    carbs: 50,
    fat: 15
  });

  // Weight state
  const [weightData, setWeightData] = useState({
    weight: 75.0,
    notes: 'Morning weigh-in'
  });

  // Water state
  const [waterAmount, setWaterAmount] = useState(500);

  // Energy state
  const [energyData, setEnergyData] = useState({
    timeOfDay: 'Afternoon',
    physicalEnergy: 7,
    mentalEnergy: 7,
    notes: ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (activeTab === 'workout') {
        await api.post('/workouts', workoutData);
      } else if (activeTab === 'sleep') {
        await api.post('/sleep', sleepData);
      } else if (activeTab === 'meal') {
        await api.post('/meals', {
          mealCategory: mealData.mealCategory,
          foods: [
            {
              name: mealData.foodName || `${mealData.mealCategory} item`,
              calories: Number(mealData.calories) || 0,
              protein: Number(mealData.protein) || 0,
              carbs: Number(mealData.carbs) || 0,
              fat: Number(mealData.fat) || 0
            }
          ]
        });
      } else if (activeTab === 'weight') {
        await api.post('/meals/weight', {
          weight: Number(weightData.weight),
          notes: weightData.notes
        });
      } else if (activeTab === 'water') {
        await api.post('/activity', {
          waterIntakeMl: Number(waterAmount)
        });
      } else if (activeTab === 'energy') {
        await api.post('/energy', energyData);
      }

      setSuccessMsg('Record saved successfully!');
      onSaved?.();
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save record.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'sleep', label: 'Sleep', icon: Moon },
    { id: 'meal', label: 'Meal', icon: Utensils },
    { id: 'weight', label: 'Weight', icon: Scale },
    { id: 'water', label: 'Water', icon: Droplet },
    { id: 'energy', label: 'Energy', icon: Zap }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Action Logger" subtitle="Fast 1-click recording for daily metrics">
      {/* Category selector */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-medium transition-all ${
                active
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Icon size={20} className="mb-1" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-sm border border-emerald-200 dark:border-emerald-800">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm border border-rose-200 dark:border-rose-800">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Workout Form */}
        {activeTab === 'workout' && (
          <>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Workout Name</label>
              <input
                type="text"
                value={workoutData.name}
                onChange={(e) => setWorkoutData({ ...workoutData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Category</label>
                <select
                  value={workoutData.category}
                  onChange={(e) => setWorkoutData({ ...workoutData, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  {['Upper body', 'Lower body', 'Push', 'Pull', 'Legs', 'Full body', 'Core', 'Cardio', 'Running', 'Mobility'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Duration (Mins)</label>
                <input
                  type="number"
                  value={workoutData.totalDurationMinutes}
                  onChange={(e) => setWorkoutData({ ...workoutData, totalDurationMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  min="1"
                  required
                />
              </div>
            </div>
          </>
        )}

        {/* Sleep Form */}
        {activeTab === 'sleep' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Bedtime</label>
                <input
                  type="time"
                  value={sleepData.bedtime}
                  onChange={(e) => setSleepData({ ...sleepData, bedtime: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Wake Time</label>
                <input
                  type="time"
                  value={sleepData.wakeTime}
                  onChange={(e) => setSleepData({ ...sleepData, wakeTime: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Quality (1-10): {sleepData.sleepQuality}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sleepData.sleepQuality}
                  onChange={(e) => setSleepData({ ...sleepData, sleepQuality: Number(e.target.value) })}
                  className="w-full accent-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Morning Freshness: {sleepData.morningFreshness}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sleepData.morningFreshness}
                  onChange={(e) => setSleepData({ ...sleepData, morningFreshness: Number(e.target.value) })}
                  className="w-full accent-brand-500"
                />
              </div>
            </div>
          </>
        )}

        {/* Meal Form */}
        {activeTab === 'meal' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Meal Category</label>
                <select
                  value={mealData.mealCategory}
                  onChange={(e) => setMealData({ ...mealData, mealCategory: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  {['Breakfast', 'Lunch', 'Dinner', 'Morning snack', 'Evening snack', 'Custom meal'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Food / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Chicken Rice Bowl"
                  value={mealData.foodName}
                  onChange={(e) => setMealData({ ...mealData, foodName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-500">Calories</label>
                <input
                  type="number"
                  value={mealData.calories}
                  onChange={(e) => setMealData({ ...mealData, calories: Number(e.target.value) })}
                  className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500">Protein (g)</label>
                <input
                  type="number"
                  value={mealData.protein}
                  onChange={(e) => setMealData({ ...mealData, protein: Number(e.target.value) })}
                  className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500">Carbs (g)</label>
                <input
                  type="number"
                  value={mealData.carbs}
                  onChange={(e) => setMealData({ ...mealData, carbs: Number(e.target.value) })}
                  className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500">Fat (g)</label>
                <input
                  type="number"
                  value={mealData.fat}
                  onChange={(e) => setMealData({ ...mealData, fat: Number(e.target.value) })}
                  className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>
            </div>
          </>
        )}

        {/* Weight Form */}
        {activeTab === 'weight' && (
          <>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Body Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weightData.weight}
                onChange={(e) => setWeightData({ ...weightData, weight: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Notes</label>
              <input
                type="text"
                value={weightData.notes}
                onChange={(e) => setWeightData({ ...weightData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </>
        )}

        {/* Water Form */}
        {activeTab === 'water' && (
          <div className="space-y-4">
            <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Add Water Intake</label>
            <div className="grid grid-cols-4 gap-2">
              {[250, 500, 750, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setWaterAmount(amt)}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                    waterAmount === amt
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-300 ring-2 ring-sky-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  +{amt} ml
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Custom Amount (ml)</label>
              <input
                type="number"
                value={waterAmount}
                onChange={(e) => setWaterAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>
        )}

        {/* Energy Form */}
        {activeTab === 'energy' && (
          <>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Time of Day</label>
              <select
                value={energyData.timeOfDay}
                onChange={(e) => setEnergyData({ ...energyData, timeOfDay: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              >
                {['Morning', 'Afternoon', 'Evening', 'Custom'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Physical Energy (1-10): {energyData.physicalEnergy}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyData.physicalEnergy}
                  onChange={(e) => setEnergyData({ ...energyData, physicalEnergy: Number(e.target.value) })}
                  className="w-full accent-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Mental Energy (1-10): {energyData.mentalEnergy}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyData.mentalEnergy}
                  onChange={(e) => setEnergyData({ ...energyData, mentalEnergy: Number(e.target.value) })}
                  className="w-full accent-brand-500"
                />
              </div>
            </div>
          </>
        )}

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

