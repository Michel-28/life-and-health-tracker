import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, MetricCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  BarChart3,
  Download,
  Calendar,
  Dumbbell,
  Moon,
  Utensils,
  Footprints,
  CheckSquare,
  Zap,
  TrendingUp,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
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

export const Analytics = () => {
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weekly');

  const fetchReports = async () => {
    try {
      const [wRes, mRes] = await Promise.all([
        api.get('/analytics/weekly'),
        api.get('/analytics/monthly')
      ]);
      setWeeklyReport(wRes.data);
      setMonthlyReport(mRes.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportJSON = async () => {
    try {
      const res = await api.get('/analytics/export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `life_health_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (err) {
      alert('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const wStats = weeklyReport?.stats || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Central Analytics & Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Holistic cross-module health summaries, weekly review cards and complete data backups
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Download} onClick={handleExportJSON}>
            Export Full JSON Backup
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'weekly'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Comprehensive Weekly Report
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'monthly'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Long-Term 30-Day Report
        </button>
      </div>

      {/* WEEKLY REPORT VIEW */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          <Card title="7-Day Executive Lifestyle Summary" subtitle={`Period: ${weeklyReport?.dateRange?.start} to ${weeklyReport?.dateRange?.end}`}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400 mb-1">
                  <Dumbbell size={15} />
                  <span>Workouts</span>
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">{wStats.workoutCount || 0} sessions</div>
                <span className="text-[11px] text-slate-500">{wStats.totalWorkoutDuration || 0} mins ({wStats.totalWorkoutVolume?.toLocaleString() || 0} kg)</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400 mb-1">
                  <Moon size={15} />
                  <span>Sleep Average</span>
                </div>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{wStats.avgSleep || 0} hrs</div>
                <span className="text-[11px] text-slate-500">Per night</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400 mb-1">
                  <TrendingUp size={15} />
                  <span>Weight Change</span>
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {wStats.weightChange > 0 ? `+${wStats.weightChange}` : wStats.weightChange} kg
                </div>
                <span className="text-[11px] text-slate-500">{wStats.startWeight || '--'} → {wStats.endWeight || '--'} kg</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400 mb-1">
                  <Utensils size={15} />
                  <span>Nutrition Avg</span>
                </div>
                <div className="text-xl font-bold text-amber-500">{wStats.avgCalories || 0} kcal</div>
                <span className="text-[11px] text-slate-500">{wStats.avgProtein || 0}g protein/day</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400 mb-1">
                  <Footprints size={15} />
                  <span>Activity</span>
                </div>
                <div className="text-xl font-bold text-brand-600 dark:text-brand-400">{wStats.avgSteps?.toLocaleString() || 0}</div>
                <span className="text-[11px] text-slate-500">Avg steps/day</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400 mb-1">
                  <CheckSquare size={15} />
                  <span>Habit Adherence</span>
                </div>
                <div className="text-xl font-bold text-brand-500">{wStats.habitConsistencyPct || 0}%</div>
                <span className="text-[11px] text-slate-500">Scheduled consistency</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400 mb-1">
                  <Zap size={15} />
                  <span>Physical Energy</span>
                </div>
                <div className="text-xl font-bold text-amber-500">{wStats.avgPhysicalEnergy || 0}/10</div>
                <span className="text-[11px] text-slate-500">Weekly baseline</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400 mb-1">
                  <Zap size={15} />
                  <span>Mental Energy</span>
                </div>
                <div className="text-xl font-bold text-indigo-500">{wStats.avgMentalEnergy || 0}/10</div>
                <span className="text-[11px] text-slate-500">Cognitive stamina</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400 mb-1">
                  <Zap size={15} />
                  <span>Mood Average</span>
                </div>
                <div className="text-xl font-bold text-emerald-500">{wStats.avgMood || 0}/10</div>
                <span className="text-[11px] text-slate-500">Emotional wellbeing</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* MONTHLY REPORT VIEW */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="30-Day Workouts"
              value={monthlyReport?.totalWorkouts || 0}
              unit="sessions"
              icon={Dumbbell}
              color="brand"
            />
            <MetricCard
              title="30-Day Volume"
              value={monthlyReport?.totalVolume ? `${(monthlyReport.totalVolume / 1000).toFixed(1)}` : 0}
              unit="tonnes"
              icon={TrendingUp}
              color="amber"
            />
            <MetricCard
              title="Monthly Sleep Avg"
              value={monthlyReport?.avgSleep ? `${monthlyReport.avgSleep}` : 0}
              unit="hrs / night"
              icon={Moon}
              color="purple"
            />
            <MetricCard
              title="Monthly Activity"
              value={monthlyReport?.avgSteps?.toLocaleString() || 0}
              unit="steps / day"
              icon={Footprints}
              color="blue"
            />
          </div>

          <Card title="30-Day Weight Progression Curve" subtitle="Weight points logged over the past month">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyReport?.weightPoints || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

