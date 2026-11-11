import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, MetricCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Zap, Plus, Trash2, Sun, Moon, Activity, Sparkles, Brain } from 'lucide-react';
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

export const Energy = () => {
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    timeOfDay: 'Morning',
    entryTime: '08:00',
    physicalEnergy: 8,
    mentalEnergy: 8,
    freshness: 8,
    focus: 8,
    motivation: 8,
    muscleSoreness: 2,
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [listRes, analyticsRes] = await Promise.all([
        api.get('/energy'),
        api.get('/energy/analytics')
      ]);
      setRecords(listRes.data.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to fetch energy data:', err);
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
      await api.post('/energy', form);
      setIsModalOpen(false);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save energy record');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this energy log?')) return;
    try {
      await api.delete(`/energy/${id}`);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert('Failed to delete energy log');
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Daily Energy & Vitality Tracker</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Understand physical vs mental stamina, morning vs evening patterns, and lifestyle drivers
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Check In Energy
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Physical Energy"
          value={latest?.physicalEnergy ? `${latest.physicalEnergy}/10` : '--'}
          icon={Zap}
          color="amber"
          subtext={`Avg: ${analytics?.averagePhysical || 0}/10`}
        />
        <MetricCard
          title="Mental Clarity"
          value={latest?.mentalEnergy ? `${latest.mentalEnergy}/10` : '--'}
          icon={Brain}
          color="indigo"
          subtext={`Avg: ${analytics?.averageMental || 0}/10`}
        />
        <MetricCard
          title="Morning Vitality"
          value={analytics?.morningVsEvening?.morning ? `${analytics.morningVsEvening.morning}/10` : '--'}
          icon={Sun}
          color="brand"
          subtext="Early day baseline"
        />
        <MetricCard
          title="Evening Stamina"
          value={analytics?.morningVsEvening?.evening ? `${analytics.morningVsEvening.evening}/10` : '--'}
          icon={Moon}
          color="purple"
          subtext="End of day reserve"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Physical vs Mental Energy Timeline */}
        <Card title="Physical vs Mental Energy Progression" subtitle="Chronological rating timeline across recorded check-ins">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.timeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="physicalEnergy" name="Physical (1-10)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="mentalEnergy" name="Mental (1-10)" stroke="#6366f1" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="muscleSoreness" name="Soreness (1-10)" stroke="#f43f5e" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Cross-Module Analysis: Sleep vs Energy */}
        <Card title="Cross-Module: Sleep Duration vs Daily Energy" subtitle="Correlation between sleep duration (hrs) and reported vitality">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.correlations || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

      {/* Energy Check-In History */}
      <Card title="Energy Check-in Log History" subtitle="Entries across Morning, Afternoon and Evening">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Time of Day</th>
                <th className="py-3 px-4">Physical</th>
                <th className="py-3 px-4">Mental</th>
                <th className="py-3 px-4">Freshness</th>
                <th className="py-3 px-4">Focus</th>
                <th className="py-3 px-4">Soreness</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-medium">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <Badge variant={r.timeOfDay === 'Morning' ? 'brand' : r.timeOfDay === 'Afternoon' ? 'info' : 'neutral'}>
                      {r.timeOfDay} ({r.entryTime})
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-semibold text-amber-500">{r.physicalEnergy}/10</td>
                  <td className="py-3 px-4 font-semibold text-indigo-500">{r.mentalEnergy}/10</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.freshness}/10</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.focus}/10</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.muscleSoreness}/10</td>
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

      {/* CHECK IN MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Energy & Vitality Check-in"
        subtitle="Record your physical and cognitive battery level"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
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
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Period</label>
              <select
                value={form.timeOfDay}
                onChange={(e) => setForm({ ...form, timeOfDay: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                {['Morning', 'Afternoon', 'Evening', 'Custom'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Time</label>
              <input
                type="time"
                value={form.entryTime}
                onChange={(e) => setForm({ ...form, entryTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Physical Energy (1-10): {form.physicalEnergy}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.physicalEnergy}
                onChange={(e) => setForm({ ...form, physicalEnergy: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Mental Energy (1-10): {form.mentalEnergy}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.mentalEnergy}
                onChange={(e) => setForm({ ...form, mentalEnergy: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Freshness (1-10): {form.freshness}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.freshness}
                onChange={(e) => setForm({ ...form, freshness: Number(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Focus (1-10): {form.focus}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.focus}
                onChange={(e) => setForm({ ...form, focus: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Soreness (1-10): {form.muscleSoreness}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.muscleSoreness}
                onChange={(e) => setForm({ ...form, muscleSoreness: Number(e.target.value) })}
                className="w-full accent-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Felt great post-workout, sustained focus throughout morning"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Check-in</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

