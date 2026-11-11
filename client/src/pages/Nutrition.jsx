import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, MetricCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Utensils, Scale, Plus, Trash2, Droplet, Flame, Target } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const Nutrition = () => {
  const [meals, setMeals] = useState([]);
  const [weights, setWeights] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  // Meal form
  const [mealForm, setMealForm] = useState({
    mealCategory: 'Lunch',
    date: new Date().toISOString().split('T')[0],
    mealTime: '13:00',
    notes: '',
    foods: [
      { name: 'Grilled Chicken Breast', quantity: 200, unit: 'grams', calories: 330, protein: 62, carbs: 0, fat: 7 }
    ]
  });

  // Weight form
  const [weightForm, setWeightForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: 75.0,
    notes: 'Morning weigh-in'
  });

  const fetchData = async () => {
    try {
      const [mealsRes, weightsRes, analyticsRes] = await Promise.all([
        api.get('/meals'),
        api.get('/meals/weight'),
        api.get('/meals/analytics')
      ]);
      setMeals(mealsRes.data.data);
      setWeights(weightsRes.data.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to fetch nutrition data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddFoodItem = () => {
    setMealForm({
      ...mealForm,
      foods: [
        ...mealForm.foods,
        { name: '', quantity: 1, unit: 'serving', calories: 200, protein: 10, carbs: 25, fat: 5 }
      ]
    });
  };

  const handleRemoveFoodItem = (idx) => {
    const updated = [...mealForm.foods];
    updated.splice(idx, 1);
    setMealForm({ ...mealForm, foods: updated });
  };

  const handleFoodChange = (idx, field, value) => {
    const updated = [...mealForm.foods];
    updated[idx][field] = field === 'name' || field === 'unit' ? value : Number(value);
    setMealForm({ ...mealForm, foods: updated });
  };

  const handleCreateMeal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/meals', mealForm);
      setIsMealModalOpen(false);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save meal');
    }
  };

  const handleDeleteMeal = async (id) => {
    if (!window.confirm('Delete this meal log?')) return;
    try {
      await api.delete(`/meals/${id}`);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert('Failed to delete meal');
    }
  };

  const handleCreateWeight = async (e) => {
    e.preventDefault();
    try {
      await api.post('/meals/weight', weightForm);
      setIsWeightModalOpen(false);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log weight');
    }
  };

  const handleDeleteWeight = async (id) => {
    if (!window.confirm('Delete this weight entry?')) return;
    try {
      await api.delete(`/meals/weight/${id}`);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert('Failed to delete weight');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const today = analytics?.today || {};
  const targets = analytics?.targets || { calories: 2350, protein: 155, carbs: 260, fat: 70, waterMl: 3000 };
  const latestWeight = weights.length > 0 ? weights[weights.length - 1] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Nutrition & Weight Tracker</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor daily calories, macros, hydration and 7-day moving average weight trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Scale} onClick={() => setIsWeightModalOpen(true)}>
            Log Weight
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsMealModalOpen(true)}>
            Record Meal
          </Button>
        </div>
      </div>

      {/* Daily Progress Bars vs Targets */}
      <Card title="Today's Macro & Calorie Targets" subtitle="Progress towards your customized daily nutritional goals">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Calories */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600 dark:text-slate-300">Calories</span>
              <span className="text-slate-900 dark:text-white">{today.calories || 0} / {targets.calories} kcal</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round(((today.calories || 0) / targets.calories) * 100))}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600 dark:text-slate-300">Protein</span>
              <span className="text-slate-900 dark:text-white">{today.protein || 0} / {targets.protein} g</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round(((today.protein || 0) / targets.protein) * 100))}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600 dark:text-slate-300">Carbohydrates</span>
              <span className="text-slate-900 dark:text-white">{today.carbs || 0} / {targets.carbs} g</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round(((today.carbs || 0) / targets.carbs) * 100))}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600 dark:text-slate-300">Healthy Fats</span>
              <span className="text-slate-900 dark:text-white">{today.fat || 0} / {targets.fat} g</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round(((today.fat || 0) / targets.fat) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Progression & 7-Day Moving Average */}
        <Card title="Bodyweight & 7-Day Moving Average" subtitle="Smooth moving trend filtering out daily water fluctuations">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weights} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="weight" name="Daily Weight (kg)" stroke="#94a3b8" strokeWidth={1.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="movingAvg7Day" name="7-Day Moving Avg" stroke="#22c55e" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Daily Caloric Intake Trend */}
        <Card title="Calorie Intake Trend" subtitle="Daily calories consumed over the past 30 days">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.dailyTrends || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="calColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="calories" name="Calories (kcal)" stroke="#f59e0b" strokeWidth={2} fill="url(#calColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Meals History */}
      <Card title="Meal Log History" subtitle="Recent meals and nutrient breakdown">
        <div className="space-y-3">
          {meals.map((m) => (
            <div
              key={m._id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="brand">{m.mealCategory}</Badge>
                  <span className="text-xs text-slate-500">
                    {new Date(m.date).toLocaleDateString()} at {m.mealTime}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-700 dark:text-slate-300">
                  {m.foods?.map((f) => `${f.name} (${f.quantity} ${f.unit})`).join(', ')}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-amber-600 dark:text-amber-400">{m.totalCalories} kcal</span>
                <span className="text-brand-600 dark:text-brand-400">{m.totalProtein}g protein</span>
                <span className="text-blue-600 dark:text-blue-400">{m.totalCarbs}g carbs</span>
                <span className="text-rose-600 dark:text-rose-400">{m.totalFat}g fat</span>
                <button
                  onClick={() => handleDeleteMeal(m._id)}
                  className="p-1 text-slate-400 hover:text-rose-500"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* RECORD MEAL MODAL */}
      <Modal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        title="Record Meal"
        subtitle="Log foods, portion sizes, calories and macronutrients"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateMeal} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Meal Category</label>
              <select
                value={mealForm.mealCategory}
                onChange={(e) => setMealForm({ ...mealForm, mealCategory: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                {['Breakfast', 'Lunch', 'Dinner', 'Morning snack', 'Evening snack', 'Custom meal'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Date</label>
              <input
                type="date"
                required
                value={mealForm.date}
                onChange={(e) => setMealForm({ ...mealForm, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Time</label>
              <input
                type="time"
                required
                value={mealForm.mealTime}
                onChange={(e) => setMealForm({ ...mealForm, mealTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Food Items</span>
              <button
                type="button"
                onClick={handleAddFoodItem}
                className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                + Add Food Item
              </button>
            </div>

            {mealForm.foods.map((food, fIdx) => (
              <div key={fIdx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    required
                    placeholder="Food name (e.g. Scrambled Eggs)"
                    value={food.name}
                    onChange={(e) => handleFoodChange(fIdx, 'name', e.target.value)}
                    className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                  />
                  {mealForm.foods.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFoodItem(fIdx)}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400">Calories</label>
                    <input
                      type="number"
                      value={food.calories}
                      onChange={(e) => handleFoodChange(fIdx, 'calories', e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Protein (g)</label>
                    <input
                      type="number"
                      value={food.protein}
                      onChange={(e) => handleFoodChange(fIdx, 'protein', e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Carbs (g)</label>
                    <input
                      type="number"
                      value={food.carbs}
                      onChange={(e) => handleFoodChange(fIdx, 'carbs', e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Fat (g)</label>
                    <input
                      type="number"
                      value={food.fat}
                      onChange={(e) => handleFoodChange(fIdx, 'fat', e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsMealModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Meal</Button>
          </div>
        </form>
      </Modal>

      {/* LOG WEIGHT MODAL */}
      <Modal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        title="Log Bodyweight"
        subtitle="Record morning body mass in kilograms"
      >
        <form onSubmit={handleCreateWeight} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Date</label>
              <input
                type="date"
                required
                value={weightForm.date}
                onChange={(e) => setWeightForm({ ...weightForm, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={weightForm.weight}
                onChange={(e) => setWeightForm({ ...weightForm, weight: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Notes</label>
            <input
              type="text"
              value={weightForm.notes}
              onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })}
              placeholder="e.g. Weigh-in fasted before breakfast"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsWeightModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Weight</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

