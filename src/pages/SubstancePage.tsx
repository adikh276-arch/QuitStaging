import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ClipboardList, Calculator, Dumbbell, BookOpen, Users, Trophy, TrendingUp, Calendar, Flame } from 'lucide-react';
import { getSubstance } from '@/data/substances';
import { getStreak, getEntries } from '@/data/storage';
import { useState } from 'react';
import TrackerDetail from '@/components/TrackerDetail';
import ToolModal from '@/components/ToolModal';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const SubstancePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const substance = getSubstance(slug || '');
  const [activeTracker, setActiveTracker] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  if (!substance) {
    navigate('/');
    return null;
  }

  const streak = getStreak(substance.slug);
  const accentColor = `hsl(var(${substance.accentVar}))`;
  const recoveryScore = Math.min(100, Math.round(50 + streak.days * 2.3));

  const activeTrackerConfig = substance.trackers.find(t => t.id === activeTracker);

  const tools = [
    { id: 'assessment', name: 'DSM-5 Assessment', icon: ClipboardList, desc: 'Self-evaluate' },
    { id: 'calculator', name: 'Calculator', icon: Calculator, desc: 'Health metrics' },
    { id: 'activities', name: 'Activities', icon: Dumbbell, desc: 'Healthy habits' },
    { id: 'learn', name: 'Learn', icon: BookOpen, desc: 'Education' },
    { id: 'community', name: 'Community', icon: Users, desc: 'Support' },
    { id: 'achievements', name: 'Milestones', icon: Trophy, desc: 'Your wins' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      {substance.banner && (
        <div className={`px-4 py-2.5 text-center text-xs font-medium ${
          substance.banner.type === 'warning' ? 'bg-accent/10 text-accent' :
          substance.banner.type === 'danger' ? 'bg-destructive/10 text-destructive' :
          'bg-primary/8 text-primary'
        }`}>
          {substance.banner.text}
        </div>
      )}

      <div className="mx-auto max-w-lg px-4 pb-10">
        {/* Back button */}
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 py-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl p-6 text-white"
          style={{ background: `linear-gradient(145deg, ${accentColor}, ${accentColor}cc)` }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20" />
            <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/10" />
          </div>

          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-4xl drop-shadow-sm">{substance.icon}</span>
                <h1 className="mt-2 font-display text-2xl text-white">{substance.name}</h1>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="text-5xl font-bold tracking-tight"
                  >
                    {streak.days}
                  </motion.span>
                </div>
                <p className="text-xs text-white/70 font-medium">days clean</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/10 backdrop-blur-sm px-3 py-2.5 text-center">
                <Flame className="h-4 w-4 mx-auto mb-1 text-white/80" />
                <p className="text-sm font-bold">{streak.days}</p>
                <p className="text-[10px] text-white/60">Streak</p>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm px-3 py-2.5 text-center">
                <TrendingUp className="h-4 w-4 mx-auto mb-1 text-white/80" />
                <p className="text-sm font-bold">{recoveryScore}%</p>
                <p className="text-[10px] text-white/60">Recovery</p>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm px-3 py-2.5 text-center">
                <Calendar className="h-4 w-4 mx-auto mb-1 text-white/80" />
                <p className="text-sm font-bold">{streak.startDate ? new Date(streak.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</p>
                <p className="text-[10px] text-white/60">Started</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-1.5 rounded-full bg-white/15">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${recoveryScore}%` }}
                  transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="h-1.5 rounded-full bg-white/70"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tracker Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-foreground">Daily Trackers</h2>
            <span className="text-xs text-muted-foreground">{substance.trackers.length} trackers</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {substance.trackers.map((tracker, i) => {
              const entries = getEntries(substance.slug, tracker.id, 7);
              const sparkData = entries.map(e => {
                const firstKey = Object.keys(e.values).find(k => typeof e.values[k] === 'number');
                return { v: firstKey ? Number(e.values[firstKey]) : 0 };
              });
              const todayEntry = entries.find(e => e.date === new Date().toISOString().split('T')[0]);

              return (
                <motion.button
                  key={tracker.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  onClick={() => setActiveTracker(tracker.id)}
                  className="group relative flex flex-col rounded-2xl border border-border/60 bg-card p-4 text-left transition-all duration-200 hover:shadow-md hover:border-border hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden"
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl transition-opacity"
                    style={{ backgroundColor: accentColor, opacity: todayEntry ? 1 : 0.2 }}
                  />
                  <div className="flex items-start justify-between w-full mb-2">
                    <p className="text-sm font-semibold text-foreground leading-tight pr-2">{tracker.name}</p>
                    {todayEntry ? (
                      <span className="shrink-0 flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        ✓ Done
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                        Log
                      </span>
                    )}
                  </div>
                  <div className="h-8 w-full mt-auto">
                    {sparkData.length > 1 && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparkData}>
                          <Line type="monotone" dataKey="v" stroke={accentColor} strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Tools Section */}
        <div className="mt-8">
          <h2 className="font-display text-lg text-foreground mb-4">Tools & Resources</h2>
          <div className="grid grid-cols-3 gap-3">
            {tools.map((tool, i) => (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.04 }}
                onClick={() => setActiveTool(tool.id)}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card p-4 text-center transition-all duration-200 hover:shadow-md hover:border-border hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                  <tool.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground block leading-tight">{tool.name}</span>
                  <span className="text-[10px] text-muted-foreground">{tool.desc}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeTrackerConfig && (
        <TrackerDetail
          tracker={activeTrackerConfig}
          substance={substance}
          onClose={() => setActiveTracker(null)}
        />
      )}
      {activeTool && (
        <ToolModal
          toolId={activeTool}
          substance={substance}
          onClose={() => setActiveTool(null)}
        />
      )}
    </div>
  );
};

export default SubstancePage;
