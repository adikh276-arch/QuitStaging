import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ClipboardList, Calculator, Dumbbell, BookOpen, TrendingUp, Calendar, Flame, ChevronRight, Zap, Lightbulb, RefreshCw, Trophy, Heart } from 'lucide-react';
import { getSubstance } from '@/data/substances';
import { getStreak, getEntries, getPrefix, fetchOnboarded, saveOnboarded, resetOnboarded, syncUserDataFromCloud } from '@/data/storage';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TrackerDetail from '@/components/TrackerDetail';
import ToolModal from '@/components/ToolModal';
import SubstanceIcon from '@/components/SubstanceIcon';
import SubstanceOnboarding from '@/components/SubstanceOnboarding';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/ConfirmModal';

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const substance = getSubstance(slug || '');
  const [activeTracker, setActiveTracker] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Start as null = loading. True/false = resolved
  const [onboarded, setOnboarded] = useState<boolean | null>(() => {
    if (!slug) return false;
    return localStorage.getItem(`${getPrefix()}_onboarded_${slug}`) === 'true' ? true : null;
  });

  const handleReset = async () => {
    if (!slug) return;
    await resetOnboarded(slug);
    window.location.reload();
  };

  useEffect(() => {
    if (!slug) return;
    const resolveCloudData = async () => {
      const isStillOnboarded = await fetchOnboarded(slug);
      if (isStillOnboarded) {
        await syncUserDataFromCloud(slug);
      }
      setOnboarded(isStillOnboarded);
    };
    resolveCloudData();
  }, [slug]);

  if (!substance) {
    navigate('/');
    return null;
  }

  if (onboarded === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!onboarded) {
    return (
      <SubstanceOnboarding
        substance={substance}
        onComplete={async (motivation?: string, triggers?: string[]) => {
          await saveOnboarded(slug!, { motivation, triggers });
          setOnboarded(true);
        }}
      />
    );
  }

  const streak = getStreak(substance.slug);
  const recoveryScore = Math.min(100, Math.round((streak.days / 90) * 100));
  const gradientClass = heroGradients[substance.slug] || 'from-primary to-primary/80';
  const sparkColor = sparkColors[substance.slug] || '#10b981';
  const cardAccent = cardAccents[substance.slug] || 'border-border';

  const activeTrackerConfig = substance.trackers.find(t => t.id === activeTracker);

  const tools = [
    { id: 'assessment', name: t('quit.app.assessment'), icon: ClipboardList, desc: t('quit.app.assessment_desc') },
    { id: 'calculator', name: t('quit.app.calculator'), icon: Calculator, desc: t('quit.app.calculator_desc') },
    { id: 'activities', name: t('quit.app.activities'), icon: Dumbbell, desc: t('quit.app.activities_desc') },
    { id: 'learn', name: t('quit.app.learn'), icon: BookOpen, desc: t('quit.app.learn_desc') },
    { id: 'sync', name: t('quit.app.sync_data', 'Sync Data'), icon: RefreshCw, desc: t('quit.app.sync_desc', 'Force pull your latest progress from the cloud.') },
  ];

  const handleToolClick = async (id: string) => {
    if (id === 'sync') {
      const toastId = toast({ title: t('quit.app.syncing', 'Syncing...'), description: t('quit.app.syncing_desc', 'Connecting to secure cloud...') });
      try {
        await syncUserDataFromCloud(slug!);
        setLastUpdate(Date.now());
        toast({ title: t('quit.app.sync_success', 'Success'), description: t('quit.app.sync_success_desc', 'Your data is now up to date.') });
      } catch (e) {
        toast({ variant: 'destructive', title: t('quit.app.sync_error', 'Sync Failed'), description: t('quit.app.sync_error_desc', 'Please check your connection.') });
      }
      return;
    }
    setActiveTool(id);
  };

  const getSparkData = (trackerId: string) => {
    const entries = getEntries(substance.slug, trackerId, 21);
    const data = entries.map(e => ({ value: e.value }));
    if (data.length < 2) return [{ value: 0 }, { value: 0 }];
    return data;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ConfirmModal 
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title={t('quit.app.reset_progress')}
        message={t('quit.app.reset_confirm')}
      />
      
      {/* Hero section with glassmorphism */}
      <div className={`relative h-[340px] w-full bg-gradient-to-br ${gradientClass} px-6 pt-8 overflow-hidden`}>
        {/* Navigation row */}
        <div className="relative z-20 flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 transition-all hover:bg-white/20 active:scale-95 shadow-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-10 px-4 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 text-xs font-bold tracking-wide shadow-lg">
            {t('quit.app.recovery_zone')}
          </div>
        </div>

        {/* Hero Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
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
                    <h1 className="font-display text-2xl text-white drop-shadow-sm tracking-tight flex items-center gap-2">
                      {t(`quit.substances.${substance.slug}.name`)}
                      <button 
                        onClick={() => setShowResetConfirm(true)}
                        title={t('quit.app.reset_progress')}
                        className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-white/40" />
                      </button>
                    </h1>
                    <p className="text-[11px] text-white/50 font-medium mt-0.5 italic">{t(`quit.substances.${substance.slug}.descriptor`)}</p>
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
                  <p className="text-[10px] text-white/50 font-bold tracking-[0.15em] uppercase mt-1">{t('quit.app.days_clean')}</p>
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
                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.12em] mt-1.5">{t(`quit.app.${stat.label.toLowerCase()}`)}</p>
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex justify-between text-[10px] font-semibold mb-2">
                  <span className="text-white/45 tracking-wide">{t('quit.app.recovery_progress')}</span>
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
      </div>

      <div className="mx-auto max-w-lg px-6 mt-[60px]">
        {/* Tools Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">{t('quit.app.power_ups')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {tools.map((tool, i) => (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                onClick={() => handleToolClick(tool.id)}
                className="group relative flex flex-col items-center justify-center gap-3 rounded-[28px] bg-card p-6 text-center border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 shadow-sm active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary transition-colors duration-300 group-hover:text-primary-foreground">
                  <tool.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-tight">{tool.name}</h3>
                  <p className="mt-1 text-[10px] text-muted-foreground/80 leading-snug">{tool.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Community / Social Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => setActiveTool('community')}
          className="mb-10 w-full group relative overflow-hidden rounded-[28px] bg-accent p-6 text-left border border-white/20 shadow-md active:scale-[0.99] transition-transform"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display leading-tight">{t('quit.app.community_board')}</h3>
                <p className="mt-0.5 text-xs text-white/70 font-medium">{t('quit.app.community_desc')}</p>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md">
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-40 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        </motion.button>

        {/* Trackers Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">{t('quit.app.daily_check_ins')}</h2>
          </div>
          <div className="space-y-3.5">
            {substance.trackers.map((tracker, i) => (
              <motion.button
                key={tracker.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                onClick={() => setActiveTracker(tracker.id)}
                className={`group flex w-full items-center justify-between rounded-[24px] border border-border/60 bg-card p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors">
                    <SubstanceIcon slug={substance.slug} className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{t(`quit.substances.${substance.slug}.trackers.${tracker.id}.name`)}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{t(`quit.substances.${substance.slug}.trackers.${tracker.id}.desc`)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden h-8 w-24 sm:block">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getSparkData(tracker.id)}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={sparkColor}
                          strokeWidth={2.5}
                          dot={false}
                          animationDuration={1500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* View Milestones Link */}
        <button 
          onClick={() => setActiveTool('achievements')}
          className="w-full flex items-center justify-center gap-2 py-6 text-sm font-bold text-primary/60 hover:text-primary transition-colors"
        >
          <Trophy className="h-4 w-4" /> {t('quit.app.view_all_milestones')}
        </button>
      </div>

      <AnimatePresence>
        {activeTracker && activeTrackerConfig && (
          <TrackerDetail
            tracker={activeTrackerConfig}
            substance={substance}
            onClose={() => {
              setActiveTracker(null);
              setLastUpdate(Date.now());
            }}
          />
        )}
        {activeTool && (
          <ToolModal
            toolId={activeTool}
            substance={substance}
            onClose={() => {
              setActiveTool(null);
              setLastUpdate(Date.now());
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubstancePage;
