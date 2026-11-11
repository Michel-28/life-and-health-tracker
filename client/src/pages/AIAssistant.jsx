import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Bot, Send, Sparkles, Check, HelpCircle, ArrowRight, ShieldCheck, Database } from 'lucide-react';

export const AIAssistant = () => {
  // NL Logging state
  const [nlText, setNlText] = useState('I slept at 11 PM, woke up at 7 AM, did an upper-body workout for 50 mins and drank 2.5 litres of water.');
  const [parseLoading, setParseLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Q&A state
  const [question, setQuestion] = useState('How much did I sleep last week and what is my average?');
  const [qaLoading, setQaLoading] = useState(false);
  const [answerData, setAnswerData] = useState(null);

  // Insights state
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await api.get('/ai/insights');
      setInsights(res.data.insights || []);
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleParse = async (e) => {
    e.preventDefault();
    if (!nlText.trim()) return;
    setParseLoading(true);
    setSaveSuccess('');
    try {
      const res = await api.post('/ai/parse-log', { text: nlText });
      setPreview(res.data.preview);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to parse natural language log');
    } finally {
      setParseLoading(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!preview) return;
    setSaveLoading(true);
    try {
      await api.post('/ai/confirm-log', { preview });
      setSaveSuccess('Records successfully saved to MongoDB database!');
      setPreview(null);
      window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save confirmed records');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAsk = async (e) => {
    e?.preventDefault();
    if (!question.trim()) return;
    setQaLoading(true);
    try {
      const res = await api.post('/ai/ask', { question });
      setAnswerData(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to answer question');
    } finally {
      setQaLoading(false);
    }
  };

  const quickQuestions = [
    'How much did I sleep last week and what is my average?',
    'What was my average weight this month?',
    'How consistent was my exercise routine and training volume?',
    'What patterns exist between my sleep and energy?'
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">AI Personal Lifestyle Assistant</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Natural language logging parser with preview confirmation & database-backed Q&A
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: NATURAL LANGUAGE LOGGING */}
      <Card
        title="1. Natural Language Logging"
        subtitle="Speak or type your day in plain English — review extracted metrics before committing"
      >
        <form onSubmit={handleParse} className="space-y-4">
          <div>
            <textarea
              rows={3}
              value={nlText}
              onChange={(e) => setNlText(e.target.value)}
              placeholder="e.g. Slept at 11 PM, woke up at 7 AM, did an upper-body workout and drank 2 litres of water."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              * The assistant extracts structured metrics without inventing missing information.
            </span>
            <Button variant="primary" type="submit" disabled={parseLoading} icon={Sparkles}>
              {parseLoading ? 'Extracting...' : 'Extract & Preview'}
            </Button>
          </div>
        </form>

        {saveSuccess && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
            <Check size={18} />
            <span>{saveSuccess}</span>
          </div>
        )}

        {/* PREVIEW CONFIRMATION CARD */}
        {preview && (
          <div className="mt-6 p-5 rounded-2xl border border-brand-500/30 bg-brand-50/30 dark:bg-brand-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-brand-500" />
                Structured Preview (Confirm to Save)
              </h4>
              <Badge variant="brand">Ready for DB</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {preview.sleep && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-purple-600 dark:text-purple-400 block mb-1">Sleep Detected</span>
                  <p>Bedtime: {preview.sleep.bedtime} → Wake: {preview.sleep.wakeTime}</p>
                  <p>Duration: {preview.sleep.durationHours} hrs</p>
                </div>
              )}

              {preview.workout && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-brand-600 dark:text-brand-400 block mb-1">Workout Detected</span>
                  <p>{preview.workout.name}</p>
                  <p>Category: {preview.workout.category} ({preview.workout.totalDurationMinutes} mins)</p>
                </div>
              )}

              {preview.activity && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 block mb-1">Activity Detected</span>
                  {preview.activity.waterIntakeMl > 0 && <p>Water: {preview.activity.waterIntakeMl} ml</p>}
                  {preview.activity.steps > 0 && <p>Steps: {preview.activity.steps}</p>}
                </div>
              )}

              {preview.weight && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-amber-600 dark:text-amber-400 block mb-1">Weight Detected</span>
                  <p>{preview.weight.weight} kg</p>
                </div>
              )}

              {preview.energy && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-amber-600 dark:text-amber-400 block mb-1">Energy Detected</span>
                  <p>Rating: {preview.energy.physicalEnergy}/10</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setPreview(null)}>Discard</Button>
              <Button variant="primary" icon={Database} disabled={saveLoading} onClick={handleConfirmSave}>
                {saveLoading ? 'Saving...' : 'Confirm & Save Records'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* SECTION 2: DATA-BASED QUESTIONS */}
      <Card
        title="2. Lifestyle Q&A"
        subtitle="Ask questions about your sleep, workouts, energy and weight — answers computed directly from your records"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setQuestion(q); }}
                className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-brand-500 text-slate-700 dark:text-slate-300 transition-all text-left"
              >
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={handleAsk} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about your stored health data..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button variant="primary" type="submit" disabled={qaLoading} icon={Send}>
              {qaLoading ? 'Thinking...' : 'Ask'}
            </Button>
          </form>

          {answerData && (
            <div className="mt-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-brand-600 dark:text-brand-400">
                <Database size={15} />
                <span>Verified Data Answer</span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                {answerData.answer}
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                {answerData.disclaimer}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* SECTION 3: WEEKLY AI INSIGHTS */}
      <Card
        title="3. Weekly Lifestyle Observations & Patterns"
        subtitle="Automatic observations generated from your real stored logs"
      >
        <div className="space-y-4">
          {insights.map((ins, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-2"
            >
              <div className="flex items-center justify-between">
                <Badge variant="brand">{ins.module}</Badge>
                <span className="text-[11px] text-slate-400">{ins.supportingData}</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                {ins.observation}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <strong>Suggestion:</strong> {ins.suggestion}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

