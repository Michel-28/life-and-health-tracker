import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, MetricCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Smile, Plus, Trash2, Heart, Zap, Sparkles, AlertCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const standardEmotions = [
  'Happy', 'Calm', 'Excited', 'Neutral', 'Sad', 'Frustrated', 'Anxious', 'Irritated', 'Tired', 'Motivated'
];

export const MentalWellness = () => {
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: 7,
    stress: 4,
    mentalEnergy: 7,
    mentalFatigue: 3,
    focus: 8,
    emotions: ['Calm', 'Motivated'],
    socialInteractionLevel: 'Moderate',
    timeSpentAloneMinutes: 120,
    reflection: {
      good: '',
      difficult: '',
      affectedMood: '',
      gratefulFor: '',
      improveTomorrow: ''
    }
  });

  const fetchData = async () => {
    try {
      const [listRes, analyticsRes] = await Promise.all([
        api.get('/wellness'),
        api.get('/wellness/analytics')
      ]);
      setRecords(listRes.data.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to fetch wellness data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleEmotion = (emo) => {
    if (form.emotions.includes(emo)) {
      setForm({ ...form, emotions: form.emotions.filter((e) => e !== emo) });
    } else {
      setForm({ ...form, emotions: [...form.emotions, emo] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/wellness', form);
      setIsModalOpen(false);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save reflection');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this mental wellness entry?')) return;
    try {
      await api.delete(`/wellness/${id}`);
      fetchData();
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert('Failed to delete wellness record');
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Mental Wellness & Reflections</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Understand emotional patterns, stress levels, mental clarity and private daily gratitude
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Record Daily Reflection
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Mood"
          value={latest?.mood ? `${latest.mood}/10` : '--'}
          icon={Smile}
          color="brand"
          subtext={latest ? `Stress: ${latest.stress}/10` : 'No entry'}
        />
        <MetricCard
          title="Average Mood"
          value={analytics?.averageMood ? `${analytics.averageMood}/10` : '--'}
          icon={Heart}
          color="blue"
          subtext="Past 30 days"
        />
        <MetricCard
          title="Average Stress"
          value={analytics?.averageStress ? `${analytics.averageStress}/10` : '--'}
          icon={AlertCircle}
          color="amber"
          subtext="Lower is better"
        />
        <MetricCard
          title="Mental Energy"
          value={analytics?.averageMentalEnergy ? `${analytics.averageMentalEnergy}/10` : '--'}
          icon={Zap}
          color="purple"
          subtext="Cognitive vitality"
        />
      </div>

      {/* Charts */}
      <Card title="Mood & Stress Trends" subtitle="Daily mood ratings versus perceived stress over the last 30 days">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics?.trends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="mood" name="Mood (1-10)" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="stress" name="Stress (1-10)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="mentalEnergy" name="Mental Energy" stroke="#6366f1" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Reflections Journal Feed */}
      <Card title="Private Reflections & Journal" subtitle="Chronological journal entries and emotional awareness">
        <div className="space-y-4">
          {records.map((r) => (
            <div
              key={r._id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">
                    {new Date(r.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <Badge variant={r.mood >= 8 ? 'success' : r.mood >= 6 ? 'brand' : 'warning'}>
                    Mood: {r.mood}/10
                  </Badge>
                  <Badge variant="neutral">Stress: {r.stress}/10</Badge>
                  <Badge variant="info">Focus: {r.focus}/10</Badge>
                </div>
                <button onClick={() => handleDelete(r._id)} className="p-1 text-slate-400 hover:text-rose-500 self-start sm:self-auto">
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Emotions chips */}
              {r.emotions && r.emotions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {r.emotions.map((emo, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {emo}
                    </span>
                  ))}
                </div>
              )}

              {/* Reflection Questions */}
              {r.reflection && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  {r.reflection.good && (
                    <div>
                      <span className="font-semibold text-slate-500 block mb-0.5">What made today good:</span>
                      <p className="text-slate-700 dark:text-slate-300">{r.reflection.good}</p>
                    </div>
                  )}
                  {r.reflection.gratefulFor && (
                    <div>
                      <span className="font-semibold text-slate-500 block mb-0.5">Grateful for:</span>
                      <p className="text-slate-700 dark:text-slate-300">{r.reflection.gratefulFor}</p>
                    </div>
                  )}
                  {r.reflection.difficult && (
                    <div>
                      <span className="font-semibold text-slate-500 block mb-0.5">Difficulties faced:</span>
                      <p className="text-slate-700 dark:text-slate-300">{r.reflection.difficult}</p>
                    </div>
                  )}
                  {r.reflection.improveTomorrow && (
                    <div>
                      <span className="font-semibold text-slate-500 block mb-0.5">Improvement for tomorrow:</span>
                      <p className="text-slate-700 dark:text-slate-300">{r.reflection.improveTomorrow}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* RECORD REFLECTION MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Daily Mental Reflection"
        subtitle="Log emotional state and thoughtful daily reflections"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Mood (1-10): {form.mood}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.mood}
                onChange={(e) => setForm({ ...form, mood: Number(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Stress (1-10): {form.stress}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.stress}
                onChange={(e) => setForm({ ...form, stress: Number(e.target.value) })}
                className="w-full accent-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Mental Energy: {form.mentalEnergy}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.mentalEnergy}
                onChange={(e) => setForm({ ...form, mentalEnergy: Number(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Emotions Felt Today</label>
            <div className="flex flex-wrap gap-2">
              {standardEmotions.map((emo) => {
                const selected = form.emotions.includes(emo);
                return (
                  <button
                    key={emo}
                    type="button"
                    onClick={() => toggleEmotion(emo)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                      selected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {emo}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">What made today good?</label>
              <input
                type="text"
                value={form.reflection.good}
                onChange={(e) => setForm({ ...form, reflection: { ...form.reflection, good: e.target.value } })}
                placeholder="Productive workout, sunny afternoon walk"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">What am I grateful for?</label>
              <input
                type="text"
                value={form.reflection.gratefulFor}
                onChange={(e) => setForm({ ...form, reflection: { ...form.reflection, gratefulFor: e.target.value } })}
                placeholder="Good health, supportive friends, peace of mind"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">What would I like to improve tomorrow?</label>
              <input
                type="text"
                value={form.reflection.improveTomorrow}
                onChange={(e) => setForm({ ...form, reflection: { ...form.reflection, improveTomorrow: e.target.value } })}
                placeholder="Put away screens earlier before bed"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Reflection</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

