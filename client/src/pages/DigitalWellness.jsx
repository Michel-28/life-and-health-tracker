import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, MetricCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Smartphone, Plus, Trash2, Clock, Moon, ShieldAlert } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const COLORS = ['#f43f5e', '#f59e0b', '#3b82f6', '#64748b'];

export const DigitalWellness = () => {
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    totalScreenTimeMinutes: 280,
    socialMediaMinutes: 40,
    entertainmentMinutes: 60,
    educationalMinutes: 140,
    phonePickups: 35,
    screenTimeBeforeBedMinutes: 15,
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [listRes, analyticsRes] = await Promise.all([
        api.get('/digital'),
        api.get('/digital/analytics')
      ]);
      setRecords(listRes.data.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to fetch digital wellness data:', err);
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
      await api.post('/digital', form);
      setIsModalOpen(false);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save digital log');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this digital wellness log?')) return;
    try {
      await api.delete(`/digital/${id}`);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Digital Wellness & Screen Time</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Understand screen exposure, social media consumption, pickups and pre-bed digital habits
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Record Screen Time
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Daily Screen Time"
          value={latest?.totalScreenTimeMinutes ? `${((latest.totalScreenTimeMinutes) / 60).toFixed(1)}` : '--'}
          unit="hours"
          icon={Smartphone}
          color="blue"
          subtext={`Avg: ${analytics?.averageScreenTimeHours || 0} hrs/day`}
        />
        <MetricCard
          title="Pre-Bed Screen Time"
          value={latest?.screenTimeBeforeBedMinutes !== undefined ? `${latest.screenTimeBeforeBedMinutes}` : '--'}
          unit="mins"
          icon={Moon}
          color={latest?.screenTimeBeforeBedMinutes > 30 ? 'rose' : 'brand'}
          subtext="Target: < 30 mins"
        />
        <MetricCard
          title="Phone Pickups"
          value={latest?.phonePickups || 0}
          unit="times / day"
          icon={Clock}
          color="amber"
          subtext="Daily activations"
        />
        <MetricCard
          title="Educational Focus"
          value={latest?.educationalMinutes ? `${latest.educationalMinutes}` : 0}
          unit="mins"
          icon={ShieldAlert}
          color="purple"
          subtext="Deep work & reading"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Screen Time Trend (Hours / Day)" subtitle="Daily total screen hours over the last 30 days">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.trends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="totalHours" name="Total Screen Time (hrs)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Screen Time Category Breakdown" subtitle="Proportion of social media, entertainment and work">
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.categoryDistribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                >
                  {(analytics?.categoryDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* History */}
      <Card title="Digital Wellness Log History" subtitle="Chronological screen time records">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Total Screen Time</th>
                <th className="py-3 px-4">Social Media</th>
                <th className="py-3 px-4">Entertainment</th>
                <th className="py-3 px-4">Educational</th>
                <th className="py-3 px-4">Pickups</th>
                <th className="py-3 px-4">Pre-Bed Mins</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-medium">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                    {((r.totalScreenTimeMinutes || 0) / 60).toFixed(1)} hrs
                  </td>
                  <td className="py-3 px-4 text-rose-500 font-medium">{r.socialMediaMinutes || 0} m</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.entertainmentMinutes || 0} m</td>
                  <td className="py-3 px-4 text-brand-600 dark:text-brand-400 font-medium">{r.educationalMinutes || 0} m</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.phonePickups || 0}</td>
                  <td className="py-3 px-4">
                    <Badge variant={(r.screenTimeBeforeBedMinutes || 0) <= 20 ? 'success' : 'warning'}>
                      {r.screenTimeBeforeBedMinutes || 0} m
                    </Badge>
                  </td>
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Screen Time">
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
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Total Screen Mins</label>
              <input
                type="number"
                min="0"
                required
                value={form.totalScreenTimeMinutes}
                onChange={(e) => setForm({ ...form, totalScreenTimeMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Social (mins)</label>
              <input
                type="number"
                min="0"
                value={form.socialMediaMinutes}
                onChange={(e) => setForm({ ...form, socialMediaMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Entertainment</label>
              <input
                type="number"
                min="0"
                value={form.entertainmentMinutes}
                onChange={(e) => setForm({ ...form, entertainmentMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Educational</label>
              <input
                type="number"
                min="0"
                value={form.educationalMinutes}
                onChange={(e) => setForm({ ...form, educationalMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Phone Pickups</label>
              <input
                type="number"
                min="0"
                value={form.phonePickups}
                onChange={(e) => setForm({ ...form, phonePickups: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Screen Time Pre-Bed (mins)</label>
              <input
                type="number"
                min="0"
                value={form.screenTimeBeforeBedMinutes}
                onChange={(e) => setForm({ ...form, screenTimeBeforeBedMinutes: Number(e.target.value) })}
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
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Digital Log</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

