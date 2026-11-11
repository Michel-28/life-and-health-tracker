import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Settings as SettingsIcon, Save, Moon, Sun, Download, User, Check } from 'lucide-react';

export const Settings = () => {
  const { user, settings, updateSettings } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [units, setUnits] = useState({
    weight: 'kg',
    distance: 'km',
    measurements: 'cm'
  });

  const [dailyTargets, setDailyTargets] = useState({
    calories: 2350,
    protein: 155,
    carbs: 260,
    fat: 70,
    waterMl: 3000,
    steps: 10000,
    sleepDurationHours: 8.0,
    targetWeight: 74.0
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (settings) {
      if (settings.units) setUnits(settings.units);
      if (settings.dailyTargets) setDailyTargets(settings.dailyTargets);
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await updateSettings({ units, dailyTargets, theme });
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const res = await api.get('/analytics/export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `life_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (err) {
      alert('Failed to export data');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings & Preferences</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize measurement units, daily nutrition targets, display theme and account backups
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Account Profile */}
        <Card title="Account Profile" subtitle="Your personal authenticated details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-sm opacity-80"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-sm opacity-80"
              />
            </div>
          </div>
        </Card>

        {/* Units Configuration */}
        <Card title="Measurement Units" subtitle="Choose your preferred measurement standards">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Weight Unit</label>
              <select
                value={units.weight}
                onChange={(e) => setUnits({ ...units, weight: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Distance Unit</label>
              <select
                value={units.distance}
                onChange={(e) => setUnits({ ...units, distance: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option value="km">Kilometers (km)</option>
                <option value="miles">Miles (mi)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Body Circumference</label>
              <select
                value={units.measurements}
                onChange={(e) => setUnits({ ...units, measurements: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option value="cm">Centimeters (cm)</option>
                <option value="inches">Inches (in)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Daily Goals & Targets */}
        <Card title="Daily Targets & Lifestyle Goals" subtitle="Configure daily benchmarks for progress bars and analytics">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Calories (kcal)</label>
              <input
                type="number"
                value={dailyTargets.calories}
                onChange={(e) => setDailyTargets({ ...dailyTargets, calories: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Protein (g)</label>
              <input
                type="number"
                value={dailyTargets.protein}
                onChange={(e) => setDailyTargets({ ...dailyTargets, protein: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Carbs (g)</label>
              <input
                type="number"
                value={dailyTargets.carbs}
                onChange={(e) => setDailyTargets({ ...dailyTargets, carbs: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Fat (g)</label>
              <input
                type="number"
                value={dailyTargets.fat}
                onChange={(e) => setDailyTargets({ ...dailyTargets, fat: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Water Target (ml)</label>
              <input
                type="number"
                value={dailyTargets.waterMl}
                onChange={(e) => setDailyTargets({ ...dailyTargets, waterMl: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Daily Steps</label>
              <input
                type="number"
                value={dailyTargets.steps}
                onChange={(e) => setDailyTargets({ ...dailyTargets, steps: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Sleep Target (hrs)</label>
              <input
                type="number"
                step="0.5"
                value={dailyTargets.sleepDurationHours}
                onChange={(e) => setDailyTargets({ ...dailyTargets, sleepDurationHours: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Goal Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                value={dailyTargets.targetWeight}
                onChange={(e) => setDailyTargets({ ...dailyTargets, targetWeight: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>
        </Card>

        {/* Display Theme */}
        <Card title="Interface Theme" subtitle="Switch between dark and light appearance">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium hover:border-brand-500 transition-all"
            >
              {theme === 'dark' ? <Moon size={18} className="text-purple-400" /> : <Sun size={18} className="text-amber-500" />}
              <span>Currently in <strong>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong> (Click to toggle)</span>
            </button>
          </div>
        </Card>

        {/* Export Data */}
        <Card title="Data Backup & Portability" subtitle="Export your entire health and lifestyle history">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Download your complete records (workouts, sleep, nutrition, weight, habits, reflections, energy) as a JSON file.
            </span>
            <Button type="button" variant="outline" icon={Download} onClick={handleExportJSON}>
              Download JSON Backup
            </Button>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button variant="primary" type="submit" disabled={saving} icon={Save} className="px-6 py-2.5">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

