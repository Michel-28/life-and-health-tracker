import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, MetricCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Target, Plus, CheckCircle, Clock, Trash2, Edit3 } from 'lucide-react';

const categories = ['All', 'Fitness', 'Weight', 'Strength', 'Sleep', 'Nutrition', 'Physical activity', 'Mental wellness', 'Habits'];

export const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Fitness',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targetValue: 100,
    currentValue: 0,
    unit: 'kg',
    status: 'active'
  });

  const fetchData = async () => {
    try {
      const res = await api.get(`/goals?category=${categoryFilter}&status=${statusFilter}`);
      setGoals(res.data.data);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await api.put(`/goals/${editingGoal._id}`, form);
      } else {
        await api.post('/goals', form);
      }
      setIsModalOpen(false);
      setEditingGoal(null);
      setForm({
        title: '',
        description: '',
        category: 'Fitness',
        startDate: new Date().toISOString().split('T')[0],
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        targetValue: 100,
        currentValue: 0,
        unit: 'kg',
        status: 'active'
      });
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save goal');
    }
  };

  const handleOpenEdit = (goal) => {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      startDate: goal.startDate ? new Date(goal.startDate).toISOString().split('T')[0] : '',
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      unit: goal.unit,
      status: goal.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert('Failed to delete goal');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Goals & Personal Targets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set, measure and accomplish quantifiable health, strength and lifestyle objectives
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
        >
          Create Goal
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Active Goals"
          value={activeGoals.length}
          unit="targets"
          icon={Target}
          color="brand"
        />
        <MetricCard
          title="Completed"
          value={completedGoals.length}
          unit="achieved"
          icon={CheckCircle}
          color="blue"
        />
        <MetricCard
          title="Top Category"
          value={goals.length > 0 ? goals[0].category : '--'}
          icon={Clock}
          color="purple"
        />
        <MetricCard
          title="Overall Progress"
          value={goals.length > 0 ? `${Math.round(goals.reduce((s, g) => s + (g.progressPercentage || 0), 0) / goals.length)}%` : '--'}
          icon={Target}
          color="amber"
          subtext="Average across goals"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === c
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Status:</span>
          {['All', 'active', 'completed', 'paused'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`capitalize px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((g) => (
          <Card key={g._id} className="hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant={g.status === 'completed' ? 'success' : g.status === 'active' ? 'brand' : 'warning'}>
                  {g.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenEdit(g)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                    <Edit3 size={15} />
                  </button>
                  <button onClick={() => handleDelete(g._id)} className="p-1 text-slate-400 hover:text-rose-500">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-base text-slate-900 dark:text-white">{g.title}</h3>
              {g.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{g.description}</p>}

              {/* Progress bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">
                    {g.currentValue} / {g.targetValue} {g.unit}
                  </span>
                  <span className="text-brand-600 dark:text-brand-400">{g.progressPercentage}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      g.progressPercentage >= 100 ? 'bg-emerald-500' : 'bg-brand-500'
                    }`}
                    style={{ width: `${Math.min(100, g.progressPercentage || 0)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Target: {new Date(g.targetDate).toLocaleDateString()}</span>
              <span className="capitalize font-medium text-slate-600 dark:text-slate-300">{g.status}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? 'Edit Goal' : 'Create New Target'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Goal Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Bench Press 90kg"
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
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Target Date</label>
              <input
                type="date"
                required
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Target Value</label>
              <input
                type="number"
                step="any"
                required
                value={form.targetValue}
                onChange={(e) => setForm({ ...form, targetValue: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Current Value</label>
              <input
                type="number"
                step="any"
                value={form.currentValue}
                onChange={(e) => setForm({ ...form, currentValue: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Unit</label>
              <input
                type="text"
                required
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="kg, hrs, steps"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          {editingGoal && (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                {['active', 'completed', 'paused', 'abandoned'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Goal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

