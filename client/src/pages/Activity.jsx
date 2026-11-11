import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, MetricCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Footprints, Plus, Trash2, Clock, Droplet, Armchair, Flame } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const Activity = () => {
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    steps: 10000,
    walkingDistanceKm: 7.5,
    runningDistanceKm: 0,
    activeMinutes: 60,
    sittingDurationMinutes: 360,
    standingDurationMinutes: 120,
    stretchingDurationMinutes: 15,
    waterIntakeMl: 3000,
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [listRes, analyticsRes] = await Promise.all([
        api.get('/activity'),
        api.get('/activity/analytics')
      ]);
      setRecords(listRes.data.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to fetch activity data:', err);
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
      await api.post('/activity', form);
      setIsModalOpen(false);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save activity record');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this activity entry?')) return;
    try {
      await api.delete(`/activity/${id}`);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert('Failed to delete activity record');
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Physical Activity & Movement</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track daily steps, walking, active exercise and sedentary sitting time
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Record Daily Activity
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Steps"
          value={latest?.steps?.toLocaleString() || 0}
          unit="steps"
          icon={Footprints}
          color="brand"
          subtext={`${latest?.walkingDistanceKm || 0} km walked`}
        />
        <MetricCard
          title="Average Steps"
          value={analytics?.averageSteps?.toLocaleString() || 0}
          unit="steps / day"
          icon={Flame}
          color="amber"
          subtext="Past 30 days"
        />
        <MetricCard
          title="Average Active Time"
          value={analytics?.averageActiveMinutes || 0}
          unit="mins / day"
          icon={Clock}
          color="blue"
          subtext={`${analytics?.activeDaysCount || 0} active days`}
        />
        <MetricCard
          title="Average Sitting"
          value={analytics?.averageSittingHours || 0}
          unit="hours / day"
          icon={Armchair}
          color="rose"
          subtext="Sedentary duration"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Daily Step Count Trend" subtitle="Daily step progression over the last 30 days">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.trends || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="steps" name="Steps" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Sitting vs Active Time (Hours)" subtitle="Comparison between active movement and desk sitting time">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.trends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="sittingHours" name="Sitting (hrs)" stroke="#f43f5e" strokeWidth={2} fill="url(#sitColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* History */}
      <Card title="Activity Log History" subtitle="Daily records of movement and hydration">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Steps</th>
                <th className="py-3 px-4">Walk Dist</th>
                <th className="py-3 px-4">Active Mins</th>
                <th className="py-3 px-4">Sitting</th>
                <th className="py-3 px-4">Water Intake</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-medium">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 font-semibold text-brand-600 dark:text-brand-400">{r.steps?.toLocaleString() || 0}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.walkingDistanceKm} km</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.activeMinutes} m</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{((r.sittingDurationMinutes || 0) / 60).toFixed(1)} hrs</td>
                  <td className="py-3 px-4 text-sky-600 dark:text-sky-400 font-medium">{r.waterIntakeMl || 0} ml</td>
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

      {/* Activity Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Physical Activity">
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
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Total Steps</label>
              <input
                type="number"
                min="0"
                required
                value={form.steps}
                onChange={(e) => setForm({ ...form, steps: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Active Mins</label>
              <input
                type="number"
                value={form.activeMinutes}
                onChange={(e) => setForm({ ...form, activeMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Sitting Mins</label>
              <input
                type="number"
                value={form.sittingDurationMinutes}
                onChange={(e) => setForm({ ...form, sittingDurationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Water (ml)</label>
              <input
                type="number"
                value={form.waterIntakeMl}
                onChange={(e) => setForm({ ...form, waterIntakeMl: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Activity</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

