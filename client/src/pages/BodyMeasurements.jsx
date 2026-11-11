import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, MetricCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Ruler, Plus, Trash2, Scale, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const BodyMeasurements = () => {
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: 75.0,
    chest: 105,
    waist: 82,
    shoulder: 121,
    arm: 37.5,
    thigh: 59,
    calf: 37,
    bodyFatPercentage: 15.0,
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [listRes, analyticsRes] = await Promise.all([
        api.get('/measurements'),
        api.get('/measurements/analytics')
      ]);
      setRecords(listRes.data.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to fetch body measurements:', err);
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
      await api.post('/measurements', form);
      setIsModalOpen(false);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save measurement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this measurement entry?')) return;
    try {
      await api.delete(`/measurements/${id}`);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert('Failed to delete measurement');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initial = analytics?.initial;
  const latest = analytics?.latest;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Body Measurements & Composition</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track muscular hypertrophy, waist reduction, circumferences (cm) and body fat
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Record Measurements
        </Button>
      </div>

      {/* Before & After Comparison Card */}
      {initial && latest && initial._id !== latest._id && (
        <Card title="Before & After Transformation Check" subtitle={`From ${new Date(initial.date).toLocaleDateString()} to ${new Date(latest.date).toLocaleDateString()}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-400 block font-medium uppercase">Waist</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-base font-bold text-slate-900 dark:text-white">{latest.waist} cm</span>
                <span className="text-xs text-brand-500 font-semibold">
                  {(latest.waist - initial.waist).toFixed(1)} cm
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Initial: {initial.waist} cm</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-400 block font-medium uppercase">Arms</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-base font-bold text-slate-900 dark:text-white">{latest.arm} cm</span>
                <span className="text-xs text-emerald-500 font-semibold">
                  +{(latest.arm - initial.arm).toFixed(1)} cm
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Initial: {initial.arm} cm</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-400 block font-medium uppercase">Chest</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-base font-bold text-slate-900 dark:text-white">{latest.chest} cm</span>
                <span className="text-xs text-emerald-500 font-semibold">
                  +{(latest.chest - initial.chest).toFixed(1)} cm
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Initial: {initial.chest} cm</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-400 block font-medium uppercase">Thighs</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-base font-bold text-slate-900 dark:text-white">{latest.thigh} cm</span>
                <span className="text-xs text-emerald-500 font-semibold">
                  +{(latest.thigh - initial.thigh).toFixed(1)} cm
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Initial: {initial.thigh} cm</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-400 block font-medium uppercase">Body Fat %</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-base font-bold text-slate-900 dark:text-white">{latest.bodyFatPercentage}%</span>
                <span className="text-xs text-brand-500 font-semibold">
                  {(latest.bodyFatPercentage - initial.bodyFatPercentage).toFixed(1)}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Initial: {initial.bodyFatPercentage}%</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-400 block font-medium uppercase">Weight</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-base font-bold text-slate-900 dark:text-white">{latest.weight} kg</span>
                <span className="text-xs text-blue-500 font-semibold">
                  {(latest.weight - initial.weight).toFixed(1)} kg
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Initial: {initial.weight} kg</span>
            </div>
          </div>
        </Card>
      )}

      {/* Measurement Progression Chart */}
      <Card title="Circumference & Composition Trends (cm)" subtitle="Progress across key anatomical muscle measurements">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics?.timeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="chest" name="Chest (cm)" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="waist" name="Waist (cm)" stroke="#f43f5e" strokeWidth={2} />
              <Line type="monotone" dataKey="arms" name="Arms (cm)" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="thighs" name="Thighs (cm)" stroke="#a855f7" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* History Table */}
      <Card title="Measurement History" subtitle="All recorded anthropometric logs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Weight</th>
                <th className="py-3 px-4">Chest</th>
                <th className="py-3 px-4">Waist</th>
                <th className="py-3 px-4">Arms</th>
                <th className="py-3 px-4">Thighs</th>
                <th className="py-3 px-4">Body Fat</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-medium">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{r.weight} kg</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.chest} cm</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.waist} cm</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.arm} cm</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.thigh} cm</td>
                  <td className="py-3 px-4 font-semibold text-brand-600 dark:text-brand-400">{r.bodyFatPercentage}%</td>
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Body Measurements" maxWidth="max-w-2xl">
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
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Chest (cm)</label>
              <input
                type="number"
                step="0.5"
                value={form.chest}
                onChange={(e) => setForm({ ...form, chest: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Waist (cm)</label>
              <input
                type="number"
                step="0.5"
                value={form.waist}
                onChange={(e) => setForm({ ...form, waist: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Shoulders (cm)</label>
              <input
                type="number"
                step="0.5"
                value={form.shoulder}
                onChange={(e) => setForm({ ...form, shoulder: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Arm (cm)</label>
              <input
                type="number"
                step="0.1"
                value={form.arm}
                onChange={(e) => setForm({ ...form, arm: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Thigh (cm)</label>
              <input
                type="number"
                step="0.1"
                value={form.thigh}
                onChange={(e) => setForm({ ...form, thigh: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Body Fat %</label>
              <input
                type="number"
                step="0.1"
                value={form.bodyFatPercentage}
                onChange={(e) => setForm({ ...form, bodyFatPercentage: parseFloat(e.target.value) })}
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
            <Button variant="primary" type="submit">Save Measurements</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

