import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { Card, MetricCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Scale,
  Moon,
  Dumbbell,
  Footprints,
  Droplet,
  Zap,
  Smile,
  CheckCircle2,
  Clock,
  Sparkles,
  PlusCircle,
  TrendingUp,
  Activity,
  Utensils
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

export const Dashboard = () => {
  const { openQuickLog } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const handleDataChanged = () => fetchDashboard();
    window.addEventListener('lifetracker:datachanged', handleDataChanged);
    return () => window.removeEventListener('lifetracker:datachanged', handleDataChanged);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading lifestyle metrics...</p>
        </div>
      </div>
    );
  }

  const today = data?.today || {};
  const trends = data?.trends || [];
  const observations = data?.observations || [];
  const recent = data?.recentActivity || {};

  return (
    <div className="space-y-8">
      {/* Top Banner / Date & Quick Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daily Lifestyle Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={openQuickLog}
            className="shadow-sm"
          >
            Quick Action Log
          </Button>
        </div>
      </div>

      {/* Today's Overview Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Body Weight"
          value={today.weight ? `${today.weight}` : '--'}
          unit="kg"
          icon={Scale}
          color="blue"
          subtext="Latest record"
        />

        <MetricCard
          title="Last Night Sleep"
          value={today.sleepDuration ? `${today.sleepDuration}` : '--'}
          unit="hrs"
          icon={Moon}
          color="purple"
          subtext={today.sleepQuality ? `Quality: ${today.sleepQuality}/10` : 'No entry'}
        />

        <MetricCard
          title="Today's Workout"
          value={today.workoutDone ? 'Completed' : 'Rest / Planned'}
          icon={Dumbbell}
          color={today.workoutDone ? 'brand' : 'amber'}
          subtext={today.workoutDetails ? `${today.workoutDetails.name} (${today.workoutDetails.totalDurationMinutes}m)` : 'Tap quick log to record'}
        />

        <MetricCard
          title="Daily Steps"
          value={today.steps?.toLocaleString() || 0}
          unit="steps"
          icon={Footprints}
          color="brand"
          subtext={`${today.activeMinutes || 0} active mins`}
        />

        <MetricCard
          title="Water Intake"
          value={today.waterMl ? `${today.waterMl}` : 0}
          unit="ml"
          icon={Droplet}
          color="blue"
          subtext={today.waterMl >= 2500 ? 'Target achieved!' : 'Keep hydrating'}
        />

        <MetricCard
          title="Physical Energy"
          value={today.physicalEnergy ? `${today.physicalEnergy}/10` : '--'}
          icon={Zap}
          color="amber"
          subtext="Recorded check-in"
        />

        <MetricCard
          title="Mental Energy"
          value={today.mentalEnergy ? `${today.mentalEnergy}/10` : '--'}
          icon={Zap}
          color="indigo"
          subtext={today.mood ? `Mood: ${today.mood}/10` : 'Daily focus'}
        />

        <MetricCard
          title="Habits Done"
          value={`${today.habitCompletedCount || 0}/${today.habitTotalCount || 0}`}
          unit={`(${today.habitPercentage || 0}%)`}
          icon={CheckCircle2}
          color="brand"
          subtext="Active daily routines"
        />
      </div>

      {/* Personalized Observations Banner */}
      <Card className="bg-gradient-to-r from-brand-500/10 via-emerald-500/5 to-teal-500/10 border-brand-500/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-brand-500/20 text-brand-600 dark:text-brand-400 shrink-0">
            <Sparkles size={22} />
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Personalized Lifestyle Observations
              <Badge variant="success">Derived from real data</Badge>
            </h4>
            <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1 pt-1">
              {observations.map((obs, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sleep & Energy 7-Day Trend */}
        <Card title="7-Day Sleep & Energy Trend" subtitle="Sleep duration (hrs) compared with physical energy ratings">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="sleepHours" name="Sleep (Hours)" stroke="#8b5cf6" strokeWidth={2} fill="url(#sleepGrad)" />
                <Area type="monotone" dataKey="physicalEnergy" name="Physical Energy (1-10)" stroke="#22c55e" strokeWidth={2} fill="url(#energyGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 7-Day Steps & Activity */}
        <Card title="7-Day Activity & Steps" subtitle="Daily movement and active exercise duration">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="steps" name="Steps" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card title="Recent Activity & Logs" subtitle="Latest recorded entries across all modules">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Workouts */}
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase text-slate-500">
              <Dumbbell size={15} />
              <span>Latest Workouts</span>
            </div>
            {recent.workouts && recent.workouts.length > 0 ? (
              <div className="space-y-2">
                {recent.workouts.map((w) => (
                  <div key={w._id} className="text-xs">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{w.name}</p>
                    <p className="text-slate-500">{new Date(w.date).toLocaleDateString()} • {w.totalDurationMinutes} mins</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No workout records yet.</p>
            )}
          </div>

          {/* Sleep */}
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase text-slate-500">
              <Moon size={15} />
              <span>Recent Sleep</span>
            </div>
            {recent.sleep && recent.sleep.length > 0 ? (
              <div className="space-y-2">
                {recent.sleep.map((s) => (
                  <div key={s._id} className="text-xs">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{s.durationHours} hrs ({s.bedtime} - {s.wakeTime})</p>
                    <p className="text-slate-500">{new Date(s.date).toLocaleDateString()} • Quality: {s.sleepQuality}/10</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No sleep records yet.</p>
            )}
          </div>

          {/* Meals */}
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase text-slate-500">
              <Utensils size={15} />
              <span>Recent Meals</span>
            </div>
            {recent.meals && recent.meals.length > 0 ? (
              <div className="space-y-2">
                {recent.meals.map((m) => (
                  <div key={m._id} className="text-xs">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{m.mealCategory} ({m.totalCalories} kcal)</p>
                    <p className="text-slate-500">{new Date(m.date).toLocaleDateString()} • {m.totalProtein}g protein</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No meal records yet.</p>
            )}
          </div>

          {/* Weights */}
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase text-slate-500">
              <Scale size={15} />
              <span>Latest Weigh-ins</span>
            </div>
            {recent.weights && recent.weights.length > 0 ? (
              <div className="space-y-2">
                {recent.weights.map((wt) => (
                  <div key={wt._id} className="text-xs">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{wt.weight} kg</p>
                    <p className="text-slate-500">{new Date(wt.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No weight records yet.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

