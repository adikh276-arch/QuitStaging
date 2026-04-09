import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ClipboardList, Calculator, Dumbbell, BookOpen, TrendingUp, Calendar, Flame, ChevronRight, Zap, Lightbulb } from 'lucide-react';
import { getSubstance } from '@/data/substances';
import { getStreak, getEntries } from '@/data/storage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TrackerDetail from '@/components/TrackerDetail';
import ToolModal from '@/components/ToolModal';
import SubstanceIcon from '@/components/SubstanceIcon';
import SubstanceOnboarding from '@/components/SubstanceOnboarding';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const heroGradients: Record<string, string> = {
  alcohol: 'from-red-600 via-rose-500 to-red-700',
  tobacco: 'from-amber-600 via-orange-500 to-amber-700',
  opioids: 'from-purple-600 via-violet-500 to-purple-700',
  cannabis: 'from-emerald-600 via-green-500 to-emerald-700',
  stimulants: 'from-yellow-500 via-amber-500 to-yellow-600',
  benzodiazepines: 'from-blue-600 via-indigo-500 to-blue-700',
  kratom: 'from-teal-600 via-cyan-500 to-teal-700',
  mdma: 'from-pink-600 via-fuchsia-500 to-pink-700',
};

const cardAccents: Record<string, string> = {
  alcohol: 'border-red-200 dark:border-red-900/40 hover:border-red-300',
  tobacco: 'border-amber-200 dark:border-amber-900/40 hover:border-amber-300',
  opioids: 'border-purple-200 dark:border-purple-900/40 hover:border-purple-300',
  cannabis: 'border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-300',
  stimulants: 'border-yellow-200 dark:border-yellow-900/40 hover:border-yellow-300',
  benzodiazepines: 'border-blue-200 dark:border-blue-900/40 hover:border-blue-300',
  kratom: 'border-teal-200 dark:border-teal-900/40 hover:border-teal-300',
  mdma: 'border-pink-200 dark:border-pink-900/40 hover:border-pink-300',
};

const sparkColors: Record<string, string> = {
  alcohol: '#ef4444', tobacco: '#d97706', opioids: '#8b5cf6', cannabis: '#10b981',
  stimulants: '#eab308', benzodiazepines: '#3b82f6', kratom: '#14b8a6', mdma: '#ec4899',
};

const SubstancePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const substance = getSubstance(slug || '');
  const [activeTracker, setActiveTracker] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [onboarded, setOnboarded] = useState(() => {
    if (!slug) return false;
    return localStorage.getItem(`quitmantra_onboarded_${slug}`) === 'true';
  });

  if (!substance) {
    navigate('/');
    return null;
  }

  if (!onboarded) {
    return (
      <SubstanceOnboarding
        substance={substance}
        onComplete={() => setOnboarded(true)}
      />
    );
  }

  const streak = getStreak(substance.slug);
  const recoveryScore = Math.min(100, Math.round(50 + streak.days * 2.3));
  const gradientClass = heroGradients[substance.slug] || 'from-primary to-primary/80';
  const sparkColor = sparkColors[substance.slug] || '#10b981';
  const cardAccent = cardAccents[substance.slug] || 'border-border';

  const activeTrackerConfig = substance.trackers.find(t => t.id === activeTracker);

  const tools = [
    { id: 'assessment', name: t('app.assessment'), icon: ClipboardList, desc: t('app.assessment_desc') },
    { id: 'calculator', name: t('app.calculator'), icon: Calculator, desc: t('app.calculator_desc') },
    { id: 'activities', name: t('app.activities'), icon: Dumbbell, desc: t('app.activities_desc') },
    { id: 'learn', name: t('app.learn'), icon: BookOpen, desc: t('app.learn_desc') },
  ];

  const severityScore = (val: unknown): number => {
    if (typeof val === 'number') return val;
    if (val === 'Severe') return 4;
    if (val === 'Moderate') return 3;
    if (val === 'Mild') return 2;
    if (val === 'None') return 0;
    if (val === 'Yes') return 1;
    if (val === 'No') return 0;
    if (val === 'Hard') return 3;
    if (val === 'Easy') return 1;
    if (val === 'Resisted all') return 0;
    if (val === 'Partial') return 1;
    if (val === 'Gave in') return 2;
    if (val === 'Perfect') return 1;
    if (val === 'Normal') return 3;
    if (val === 'Difficult') return 2;
    if (val === 'Minimal') return 1;
    if (val === "Can't") return 0;
    if (val === 'Isolated') return 0;
    if (val === 'Brief') return 1;
    if (Array.isArray(val)) return val.filter(v => v !== 'None').length;
    if (typeof val === 'boolean') return val ? 1 : 0;
    return 0;
  };

  const getSparkData = (trackerId: string) => {
    const entries = getEntries(substance.slug, trackerId, 21);
    return entries.map(e => {
      const keys = Object.keys(e.values).filter(k => k !== 'notes' && k !== 'date');
      if (keys.length === 0) return { v: 0 };
      // Prefer first numeric key
      const numKey = keys.find(k => typeof e.values[k] === 'number');
      if (numKey) return { v: Number(e.values[numKey]) };
      // Fall back to aggregate score from all categorical fields
      let total = 0;
      let count = 0;
      for (const k of keys) {
        const s = severityScore(e.values[k]);
        if (s !== 0 || e.values[k] === 'None' || e.values[k] === 'No' || e.values[k] === 0) {
          total += s;
          count++;
        }
      }
      return { v: count > 0 ? Math.round((total / count) * 10) / 10 : 0 };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Banner */}
      {substance.banner && (
        <div className={`px-4 py-2.5 text-center text-xs font-semibold ${
          substance.banner.type === 'warning' ? 'bg-accent/10 text-accent' :
          substance.banner.type === 'danger' ? 'bg-destructive/10 text-destructive' :
          'bg-primary/8 text-primary'
        }`}>
          {substance.banner.text}
        </div>
      )}

      <div className="mx-auto max-w-lg px-5 pb-12">
        {/* Back button */}
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 py-5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" /> {t('app.back')}
        </button>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradientClass} p-[2px] shadow-2xl`}
        >
          {/* Outer glow border via gradient wrapper */}
          <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-white/[0.12] to-white/[0.04] backdrop-blur-xl p-6">
            {/* Decorative orbs */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/[0.08] blur-2xl" />
            <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/[0.05] blur-2xl" />
            <div className="absolute right-1/4 top-1/3 h-24 w-24 rounded-full bg-white/[0.04] blur-xl" />
            <div className="absolute left-1/3 bottom-8 h-16 w-16 rounded-full bg-white/[0.06] blur-lg" />

            <div className="relative z-10">
              {/* Top row: icon + name | days counter */}
              <div className="flex items-start justify-between mb-7">
                <div className="flex items-center gap-3.5">
                  <motion.div
                    initial={{ rotate: -15, scale: 0.7, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.1)] border border-white/20"
                  >
                    <SubstanceIcon slug={substance.slug} className="h-7 w-7 text-white drop-shadow-sm" />
                  </motion.div>
                  <div>
                    <h1 className="font-display text-2xl text-white drop-shadow-sm tracking-tight">{t(`substances.${substance.slug}.name`)}</h1>
                    <p className="text-[11px] text-white/50 font-medium mt-0.5 italic">{t(`substances.${substance.slug}.descriptor`)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <motion.span
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 160, delay: 0.25 }}
                    className="block text-[52px] font-bold tracking-tighter text-white leading-none"
                    style={{ textShadow: '0 2px 20px rgba(255,255,255,0.25)' }}
                  >
                    {streak.days}
                  </motion.span>
                  <p className="text-[10px] text-white/50 font-bold tracking-[0.15em] uppercase mt-1">{t('app.days_clean')}</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { icon: Flame, value: `${streak.days}`, label: 'Streak', suffix: 'd' },
                  { icon: TrendingUp, value: `${recoveryScore}`, label: 'Recovery', suffix: '%' },
                  { icon: Calendar, value: streak.startDate ? new Date(streak.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '—', label: 'Started', suffix: '' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.08 }}
                    className="group rounded-2xl bg-white/[0.08] backdrop-blur-md px-3 py-3.5 text-center border border-white/[0.12] hover:bg-white/[0.14] transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                  >
                    <stat.icon className="h-4 w-4 mx-auto mb-2 text-white/60 group-hover:text-white/80 transition-colors" />
                    <p className="text-[15px] font-bold text-white leading-none">{stat.value}{stat.suffix}</p>
                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.12em] mt-1.5">{t(`app.${stat.label.toLowerCase()}`)}</p>
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex justify-between text-[10px] font-semibold mb-2">
                  <span className="text-white/45 tracking-wide">{t('app.recovery_progress')}</span>
                  <span className="text-white/70">{recoveryScore}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/[0.1] overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${recoveryScore}%` }}
                    transition={{ duration: 1.4, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="h-full rounded-full bg-gradient-to-r from-white/60 via-white/80 to-white/90 shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tracker Section */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-5 px-1">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h2 className="font-display text-xl text-foreground">{t('app.daily_trackers')}</h2>
            </div>
            <span className="text-xs text-muted-foreground font-medium bg-muted rounded-full px-3 py-1">{substance.trackers.length} {t('app.trackers')}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {substance.trackers.map((tracker, i) => {
              const sparkData = getSparkData(tracker.id);
              const todayEntry = getEntries(substance.slug, tracker.id, 1);
              const hasToday = todayEntry.length > 0 && todayEntry[0].date === new Date().toISOString().split('T')[0];

              return (
                <motion.button
                  key={tracker.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.06 }}
                  onClick={() => setActiveTracker(tracker.id)}
                  className={`group relative flex flex-col rounded-2xl border-2 bg-card p-4 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-[0.97] ${cardAccent}`}
                >
                    {hasToday ? (
                      <span className="shrink-0 flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                        {t('app.done')}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-lg bg-accent/10 px-2.5 py-1 text-[10px] font-bold text-accent">
                        {t('app.log')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-start justify-between w-full mb-3">
                    <p className="text-sm font-bold text-foreground leading-tight pr-2">{t(`substances.${substance.slug}.trackers.${tracker.id}.name`)}</p>
                  <div className="h-10 w-full mt-auto opacity-60 group-hover:opacity-100 transition-opacity">
                    {sparkData.length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparkData}>
                          <Line type="monotone" dataKey="v" stroke={sparkColor} strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <p className="text-[10px] text-muted-foreground">{t('app.no_data')}</p>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="absolute bottom-3 right-3 h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Tools Section */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-5 px-1">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h2 className="font-display text-xl text-foreground">{t('app.tools_resources')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {tools.map((tool, i) => (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.05 }}
                onClick={() => setActiveTool(tool.id)}
                className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 active:scale-[0.97]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 group-hover:bg-primary/15 transition-colors">
                  <tool.icon className="h-5 w-5 text-primary/70 group-hover:text-primary transition-colors" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-bold text-foreground block leading-tight">{tool.name}</span>
                  <span className="text-[11px] text-muted-foreground leading-snug mt-0.5 block">{tool.desc}</span>
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
