import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, MetricCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { HeartPulse, Plus, Trash2, BatteryCharging, Moon, Activity, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const Recovery = () => {
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    muscleSoreness: 3,
    generalFatigue: 3,
    sleepRecovery: 8,
    workoutDifficulty: 6,
    jointDiscomfort: 1,
    isRestDay: false,
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [listRes, analyticsRes] = await Promise.all([
        api.get('/recovery'),
        api.get('/recovery/analytics')
      ]);
      setRecords(listRes.data.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to fetch recovery data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recovery', form);
      setIsModalOpen(false);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save recovery record');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recovery record?')) return;
    try {
      await api.delete(`/recovery/${id}`);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert('Failed to delete record');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const latest = records[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Physical Recovery & Readiness</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor central nervous system recovery, muscle soreness, fatigue and training readiness
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Record Recovery Check-in
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Readiness Score"
          value={latest?.readinessScore ? `${latest.readinessScore}%` : '--'}
          icon={BatteryCharging}
          color="brand"
          subtext={latest?.readinessScore >= 80 ? 'Optimal training day' : 'Moderate recovery'}
        />
        <MetricCard
          title="Average Readiness"
          value={analytics?.averageReadiness ? `${analytics.averageReadiness}%` : '--'}
          icon={ShieldCheck}
          color="blue"
          subtext="Past 30 days"
        />
        <MetricCard
          title="Muscle Soreness"
          value={latest?.muscleSoreness ? `${latest.muscleSoreness}/10` : '--'}
          icon={Activity}
          color="rose"
          subtext={`Avg: ${analytics?.averageSoreness || 0}/10`}
        />
        <MetricCard
          title="Rest Days Logged"
          value={analytics?.restDaysCount || 0}
          unit="days"
          icon={Moon}
          color="purple"
          subtext="Active recovery"
        />
      </div>

      {/* Readiness Progression Chart */}
      <Card title="Training Readiness Score Trend (%)" subtitle="Computed biological readiness based on sleep, fatigue and joint comfort">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.trends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="readinessScore" name="Readiness (%)" stroke="#22c55e" strokeWidth={2.5} fill="url(#readinessGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* History */}
      <Card title="Recovery Log History" subtitle="Daily records of fatigue, soreness and rest status">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Readiness</th>
                <th className="py-3 px-4">Soreness</th>
                <th className="py-3 px-4">Fatigue</th>
                <th className="py-3 px-4">Sleep Recovery</th>
                <th className="py-3 px-4">Rest Day?</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-medium">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 font-bold text-brand-600 dark:text-brand-400">{r.readinessScore}%</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.muscleSoreness}/10</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.generalFatigue}/10</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.sleepRecovery}/10</td>
                  <td className="py-3 px-4">
                    <Badge variant={r.isRestDay ? 'info' : 'neutral'}>
                      {r.isRestDay ? 'Rest Day' : 'Training'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">{r.notes || '--'}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleDelete(r._id)} className="p-1 text-slate-400 hover:text-rose-500">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Recovery Status">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isRestDay"
                checked={form.isRestDay}
                onChange={(e) => setForm({ ...form, isRestDay: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="isRestDay" className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Is this a designated Rest Day?
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Muscle Soreness (1-10): {form.muscleSoreness}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.muscleSoreness}
                onChange={(e) => setForm({ ...form, muscleSoreness: Number(e.target.value) })}
                className="w-full accent-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">General Fatigue (1-10): {form.generalFatigue}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.generalFatigue}
                onChange={(e) => setForm({ ...form, generalFatigue: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Sleep Recovery (1-10): {form.sleepRecovery}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.sleepRecovery}
                onChange={(e) => setForm({ ...form, sleepRecovery: Number(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Joint Discomfort (1-10): {form.jointDiscomfort}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.jointDiscomfort}
                onChange={(e) => setForm({ ...form, jointDiscomfort: Number(e.target.value) })}
                className="w-full accent-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Foam rolled legs, joints feeling supple"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Recovery</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

