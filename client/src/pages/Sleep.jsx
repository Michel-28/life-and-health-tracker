import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, MetricCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Moon, Plus, Trash2, Clock, Sparkles, Activity, Bed, SunMedium } from 'lucide-react';
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

export const Sleep = () => {
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    bedtime: '23:15',
    wakeTime: '07:15',
    timeToFallAsleepMinutes: 15,
    awakenings: 0,
    sleepQuality: 8,
    morningFreshness: 8,
    napDurationMinutes: 0,
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [listRes, analyticsRes] = await Promise.all([
        api.get('/sleep'),
        api.get('/sleep/analytics')
      ]);
      setRecords(listRes.data.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to fetch sleep data:', err);
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
      await api.post('/sleep', form);
      setIsModalOpen(false);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save sleep record.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sleep record?')) return;
    try {
      await api.delete(`/sleep/${id}`);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert('Failed to delete sleep record.');
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sleep & Circadian Tracker</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor duration, sleep quality, consistency and recovery correlation
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Record Sleep Session
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Last Night Sleep"
          value={latest ? `${latest.durationHours}` : '--'}
          unit="hrs"
          icon={Moon}
          color="purple"
          subtext={latest ? `${latest.bedtime} → ${latest.wakeTime}` : 'No entry'}
        />
        <MetricCard
          title="Average Duration"
          value={analytics?.averageDuration || 0}
          unit="hrs / night"
          icon={Clock}
          color="blue"
          subtext="Past 30 days"
        />
        <MetricCard
          title="Average Quality"
          value={analytics?.averageQuality ? `${analytics.averageQuality}/10` : '--'}
          icon={Sparkles}
          color="amber"
          subtext="Perceived deep sleep"
        />
        <MetricCard
          title="Morning Freshness"
          value={analytics?.averageFreshness ? `${analytics.averageFreshness}/10` : '--'}
          icon={SunMedium}
          color="brand"
          subtext="Waking alertness"
        />
      </div>

      {/* Sleep Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Sleep Duration Trends (Hours)" subtitle="Nightly duration with 8-hour target line">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.trends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sleepColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[4, 12]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="duration" name="Duration (hrs)" stroke="#8b5cf6" strokeWidth={2} fill="url(#sleepColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Sleep vs Next-Day Physical Energy" subtitle="Cross-module correlation between sleep hours and energy scores">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.correlation || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="sleepDuration" name="Sleep (hrs)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="physicalEnergy" name="Physical Energy" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Sleep Log History */}
      <Card title="Sleep History" subtitle="Chronological list of all logged nights">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Bedtime</th>
                <th className="py-3 px-4">Wake Time</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Sleep Quality</th>
                <th className="py-3 px-4">Freshness</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{r.bedtime}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{r.wakeTime}</td>
                  <td className="py-3.5 px-4 font-semibold text-brand-600 dark:text-brand-400">
                    {r.durationHours} hrs
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={r.sleepQuality >= 8 ? 'success' : r.sleepQuality >= 6 ? 'brand' : 'warning'}>
                      {r.sleepQuality}/10
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={r.morningFreshness >= 8 ? 'success' : 'neutral'}>
                      {r.morningFreshness}/10
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs max-w-xs truncate">
                    {r.notes || '--'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Sleep Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Sleep Session"
        subtitle="Bedtime, waking time, quality and morning freshness"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Morning Date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Bedtime</label>
              <input
                type="time"
                required
                value={form.bedtime}
                onChange={(e) => setForm({ ...form, bedtime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Wake-Up Time</label>
              <input
                type="time"
                required
                value={form.wakeTime}
                onChange={(e) => setForm({ ...form, wakeTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Sleep Quality (1-10): {form.sleepQuality}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.sleepQuality}
                onChange={(e) => setForm({ ...form, sleepQuality: Number(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Morning Freshness (1-10): {form.morningFreshness}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.morningFreshness}
                onChange={(e) => setForm({ ...form, morningFreshness: Number(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Time to Fall Asleep (mins)</label>
              <input
                type="number"
                min="0"
                value={form.timeToFallAsleepMinutes}
                onChange={(e) => setForm({ ...form, timeToFallAsleepMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Awakenings during night</label>
              <input
                type="number"
                min="0"
                value={form.awakenings}
                onChange={(e) => setForm({ ...form, awakenings: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Slept in cooler room, woke up naturally without alarm"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Sleep Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

