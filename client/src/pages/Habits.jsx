import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, MetricCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { CheckSquare, Plus, Check, Trash2, Calendar, Target, Flame } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category: 'Lifestyle',
    frequency: 'daily',
    targetCount: 1,
    unit: 'times',
    description: ''
  });

  const fetchData = async () => {
    try {
      const [habitsRes, analyticsRes] = await Promise.all([
        api.get('/habits'),
        api.get('/habits/analytics')
      ]);
      setHabits(habitsRes.data.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to fetch habit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (habitId, currentStatus) => {
    try {
      await api.post(`/habits/${habitId}/toggle`, { completed: !currentStatus });
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert('Failed to update habit');
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/habits', form);
      setIsModalOpen(false);
      setForm({ name: '', category: 'Lifestyle', frequency: 'daily', targetCount: 1, unit: 'times', description: '' });
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create habit');
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!window.confirm('Delete this habit and all its logs?')) return;
    try {
      await api.delete(`/habits/${id}`);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert('Failed to delete habit');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completedTodayCount = habits.filter((h) => h.completedToday).length;
  const overallRate = habits.length > 0 ? Math.round((completedTodayCount / habits.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Personal Habit Tracker</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build sustainable daily routines and measure consistency over scheduled opportunities
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Create New Habit
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Active Habits"
          value={habits.length}
          unit="routines"
          icon={CheckSquare}
          color="brand"
        />
        <MetricCard
          title="Completed Today"
          value={`${completedTodayCount} / ${habits.length}`}
          unit={`(${overallRate}%)`}
          icon={Check}
          color="blue"
        />
        <MetricCard
          title="30-Day Consistency"
          value={analytics?.habitStats?.length ? `${Math.round(analytics.habitStats.reduce((s, h) => s + h.consistencyPct, 0) / analytics.habitStats.length)}%` : '--'}
          icon={Flame}
          color="amber"
          subtext="Scheduled adherence"
        />
        <MetricCard
          title="Top Category"
          value={habits.length > 0 ? habits[0].category : '--'}
          icon={Target}
          color="purple"
        />
      </div>

      {/* Today's Habits Checklist */}
      <Card title="Today's Habit Checklist" subtitle="Tap to complete or uncheck routines for today">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((h) => (
            <div
              key={h._id}
              onClick={() => handleToggle(h._id, h.completedToday)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                h.completedToday
                  ? 'border-brand-500/40 bg-brand-50/50 dark:bg-brand-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    h.completedToday
                      ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                      : 'border-2 border-slate-300 dark:border-slate-700 text-transparent'
                  }`}
                >
                  <Check size={16} strokeWidth={3} />
                </div>
                <div>
                  <h4 className={`text-sm font-semibold ${h.completedToday ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {h.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {h.category} • Target: {h.targetCount} {h.unit}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={h.completedToday ? 'success' : 'neutral'}>
                  {h.completedToday ? 'Done' : 'Pending'}
                </Badge>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDeleteHabit(h._id); }}
                  className="p-1 text-slate-400 hover:text-rose-500"
                  title="Delete habit"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Consistency Chart & Habit Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="30-Day Habit Completion Matrix" subtitle="Daily completion percentage across scheduled habits">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.history || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="completionRate" name="Completion Rate (%)" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Habit-Wise Consistency" subtitle="Long-term adherence per individual habit">
          <div className="space-y-4">
            {analytics?.habitStats?.map((st) => (
              <div key={st.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">{st.name}</span>
                  <span className="text-brand-600 dark:text-brand-400">{st.consistencyPct}% ({st.totalCompletions} logs)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${st.consistencyPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* CREATE HABIT MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Lifestyle Habit">
        <form onSubmit={handleCreateHabit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Habit Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Read 20 Mins"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                {['Fitness', 'Nutrition', 'Sleep', 'Personal care', 'Mental wellness', 'Lifestyle'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option value="daily">Every Day</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Target Count</label>
              <input
                type="number"
                min="1"
                required
                value={form.targetCount}
                onChange={(e) => setForm({ ...form, targetCount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Unit</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="times, minutes, ml"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Habit</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

