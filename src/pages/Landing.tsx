import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { substances } from '@/data/substances';
import { getStreak, syncGlobalDataFromCloud } from '@/data/storage';
import { Shield, Sparkles, Flame, TrendingUp, ChevronRight } from 'lucide-react';
import SubstanceIcon from '@/components/SubstanceIcon';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

const substanceColors: Record<string, { gradient: string; bg: string; ring: string; orb: string }> = {
  alcohol:         { gradient: 'from-red-500 to-rose-600',       bg: 'bg-red-50 dark:bg-red-950/40',    ring: 'ring-red-200 dark:ring-red-800/40',    orb: 'bg-red-300/20' },
  tobacco:         { gradient: 'from-amber-500 to-orange-600',   bg: 'bg-amber-50 dark:bg-amber-950/40', ring: 'ring-amber-200 dark:ring-amber-800/40', orb: 'bg-amber-300/20' },
  opioids:         { gradient: 'from-purple-500 to-violet-600',  bg: 'bg-purple-50 dark:bg-purple-950/40',ring: 'ring-purple-200 dark:ring-purple-800/40',orb: 'bg-purple-300/20' },
  cannabis:        { gradient: 'from-emerald-500 to-green-600',  bg: 'bg-emerald-50 dark:bg-emerald-950/40',ring: 'ring-emerald-200 dark:ring-emerald-800/40',orb: 'bg-emerald-300/20' },
  stimulants:      { gradient: 'from-yellow-400 to-amber-500',   bg: 'bg-yellow-50 dark:bg-yellow-950/40', ring: 'ring-yellow-200 dark:ring-yellow-800/40', orb: 'bg-yellow-300/20' },
  benzodiazepines: { gradient: 'from-blue-500 to-indigo-600',    bg: 'bg-blue-50 dark:bg-blue-950/40',    ring: 'ring-blue-200 dark:ring-blue-800/40',    orb: 'bg-blue-300/20' },
  kratom:          { gradient: 'from-teal-500 to-cyan-600',      bg: 'bg-teal-50 dark:bg-teal-950/40',    ring: 'ring-teal-200 dark:ring-teal-800/40',    orb: 'bg-teal-300/20' },
  mdma:            { gradient: 'from-pink-500 to-fuchsia-600',   bg: 'bg-pink-50 dark:bg-pink-950/40',    ring: 'ring-pink-200 dark:ring-pink-800/40',    orb: 'bg-pink-300/20' },
};

const PLATFORM_HOST = "platform.mantracare.com";

const SubstanceCard = ({ substance, index }: { substance: typeof substances[0]; index: number }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const streak = getStreak(substance.slug);
  const colors = substanceColors[substance.slug] || { gradient: 'from-primary to-primary/80', bg: 'bg-card', ring: 'ring-border', orb: 'bg-primary/10' };

  const handleClick = () => {
    if (window.location.hostname !== PLATFORM_HOST) {
      window.location.href = `https://${PLATFORM_HOST}/quit/${substance.slug}`;
      return;
    }
    navigate(`/${substance.slug}`);
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.15 + index * 0.05, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={handleClick}
      className={`group relative flex flex-col items-start rounded-3xl ${colors.bg} ring-1 ${colors.ring} p-5 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:ring-2 active:scale-[0.97] overflow-hidden cursor-pointer`}
    >
      {/* Decorative orb */}
      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${colors.orb} blur-2xl pointer-events-none`} />

      {/* Icon */}
      <div className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${colors.gradient} shadow-lg mb-4`}>
        <SubstanceIcon slug={substance.slug} className="h-7 w-7 text-white drop-shadow-sm" />
      </div>

      {/* Name & descriptor */}
      <div className="relative z-10 flex-1">
        <h3 className="font-display text-[16px] font-bold text-foreground leading-tight">
          {t(`quit.substances.${substance.slug}.name`)}
        </h3>
        <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
          {t(`quit.substances.${substance.slug}.descriptor`)}
        </p>
      </div>

      {/* Streak / CTA */}
      <div className="relative z-10 mt-3 self-end">
        {streak.days > 0 ? (
          <span className={`inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r ${colors.gradient} px-3 py-1.5 text-[11px] font-bold text-white shadow-md`}>
            <Flame className="h-3 w-3" />
            {streak.days}d streak
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-xl bg-foreground/8 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground group-hover:text-foreground group-hover:bg-foreground/12 transition-colors">
            {t('quit.app.start')} <ChevronRight className="h-3 w-3" />
          </span>
        )}
      </div>
    </motion.button>
  );
};

const Landing = () => {
  const { t } = useTranslation();
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    const bootstrap = async () => {
      await syncGlobalDataFromCloud();
      setLastUpdate(Date.now());
    };
    bootstrap();
  }, []);

  const totalDays = substances.reduce((acc, s) => acc + getStreak(s.slug).days, 0);
  const activeCount = substances.filter(s => getStreak(s.slug).days > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40">
      <div className="mx-auto max-w-2xl px-5 pb-16 pt-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="mb-10 text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 shadow-sm">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary tracking-wide">{t('quit.app.private_note')}</span>
          </div>
          <h1 className="font-display text-5xl tracking-tight text-foreground leading-[1.1]">
            Quit<span className="text-primary">Mantra</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            {t('quit.app.tagline')}
          </p>
        </motion.div>

        {/* Stats Banner */}
        {activeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-10 rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-white shadow-2xl shadow-primary/25 relative overflow-hidden"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/8 blur-xl" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold tracking-tight">{activeCount}</p>
                  <p className="text-[11px] text-white/65 font-medium mt-0.5">{t('quit.app.active')}</p>
                </div>
                <div className="h-10 w-px bg-white/20 rounded-full" />
                <div className="text-center">
                  <p className="text-3xl font-bold tracking-tight">{totalDays}</p>
                  <p className="text-[11px] text-white/65 font-medium mt-0.5">{t('quit.app.total_days')}</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/15 backdrop-blur-sm px-5 py-3">
                <TrendingUp className="h-5 w-5 text-white/85" />
                <p className="text-[10px] text-white/65 font-semibold">{t('quit.app.strong')}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="flex items-center gap-2.5 mb-5 px-1"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg text-foreground">{t('quit.app.your_journey')}</h2>
        </motion.div>

        {/* 2-column substance grid */}
        <div className="grid grid-cols-2 gap-4">
          {substances.map((substance, i) => (
            <SubstanceCard key={substance.slug} substance={substance} index={i} />
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-muted-foreground/55 flex items-center justify-center gap-1.5">
            <Shield className="h-3 w-3" />
            {t('quit.app.privacy_footer')}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
