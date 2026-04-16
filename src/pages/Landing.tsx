import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { substances } from '@/data/substances';
import { getStreak, syncGlobalDataFromCloud } from '@/data/storage';
import { Shield, Sparkles, ArrowRight, Flame, Heart } from 'lucide-react';
import SubstanceIcon from '@/components/SubstanceIcon';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

const substanceGradients: Record<string, string> = {
  alcohol: 'from-red-500/90 to-rose-600/90',
  tobacco: 'from-amber-600/90 to-orange-700/90',
  opioids: 'from-purple-500/90 to-violet-600/90',
  cannabis: 'from-emerald-500/90 to-green-600/90',
  stimulants: 'from-yellow-500/90 to-amber-500/90',
  benzodiazepines: 'from-blue-500/90 to-indigo-600/90',
  kratom: 'from-teal-500/90 to-cyan-600/90',
  mdma: 'from-pink-500/90 to-fuchsia-600/90',
};

const substanceBgs: Record<string, string> = {
  alcohol: 'bg-red-50 dark:bg-red-950/30',
  tobacco: 'bg-amber-50 dark:bg-amber-950/30',
  opioids: 'bg-purple-50 dark:bg-purple-950/30',
  cannabis: 'bg-emerald-50 dark:bg-emerald-950/30',
  stimulants: 'bg-yellow-50 dark:bg-yellow-950/30',
  benzodiazepines: 'bg-blue-50 dark:bg-blue-950/30',
  kratom: 'bg-teal-50 dark:bg-teal-950/30',
  mdma: 'bg-pink-50 dark:bg-pink-950/30',
};

const PLATFORM_HOST = "platform.mantracare.com";

const SubstanceCard = ({ substance, index }: { substance: typeof substances[0]; index: number }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const streak = getStreak(substance.slug);

  const handleClick = () => {
    // If we're running on the marketing/web domain, do a hard cross-domain
    // redirect to the platform so React Router doesn't get confused.
    if (window.location.hostname !== PLATFORM_HOST) {
      window.location.href = `https://${PLATFORM_HOST}/quit/${substance.slug}`;
      return;
    }
    navigate(`/${substance.slug}`);
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={handleClick}
      className={`group relative flex items-center gap-4 rounded-2xl p-4 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] ${substanceBgs[substance.slug] || 'bg-card'}`}
    >
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${substanceGradients[substance.slug] || 'from-primary to-primary/80'} shadow-lg`}>
        <SubstanceIcon slug={substance.slug} className="h-7 w-7 text-white drop-shadow-sm" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-display text-[17px] text-foreground leading-tight">{t(`quit.substances.${substance.slug}.name`)}</h3>
        <p className="text-xs text-muted-foreground mt-1">{t(`quit.substances.${substance.slug}.descriptor`)}</p>
      </div>

      <div className="shrink-0">
        {streak.days > 0 ? (
          <div className={`flex items-center gap-1.5 rounded-xl bg-gradient-to-r ${substanceGradients[substance.slug]} px-3.5 py-2 text-xs font-bold text-white shadow-md`}>
            <Flame className="h-3.5 w-3.5" />
            {streak.days}d
          </div>
        ) : (
          <div className="flex items-center gap-1 rounded-xl bg-muted px-3 py-2 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {t('quit.app.start')} <ArrowRight className="h-3 w-3" />
          </div>
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="mx-auto max-w-lg px-5 pb-16 pt-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8 text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 shadow-sm">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary tracking-wide">{t('quit.app.private_note')}</span>
          </div>
          <h1 className="font-display text-5xl tracking-tight text-foreground leading-[1.1]">
            Quit<span className="text-primary">Mantra</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
            {t('quit.app.tagline')}
          </p>
        </motion.div>

        {/* Stats Card */}
        {activeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.5 }}
            className="mb-8 rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-white shadow-xl shadow-primary/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="text-center">
                  <p className="text-3xl font-bold tracking-tight">{activeCount}</p>
                  <p className="text-[11px] text-white/70 font-medium mt-0.5">{t('quit.app.active')}</p>
                </div>
                <div className="h-10 w-px bg-white/20 rounded-full" />
                <div className="text-center">
                  <p className="text-3xl font-bold tracking-tight">{totalDays}</p>
                  <p className="text-[11px] text-white/70 font-medium mt-0.5">{t('quit.app.total_days')}</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/15 backdrop-blur-sm px-4 py-3">
                <Sparkles className="h-5 w-5 text-white/90" />
                <p className="text-[10px] text-white/70 font-semibold">{t('quit.app.strong')}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Section title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="flex items-center gap-2 mb-4 px-1"
        >
          <Heart className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg text-foreground">{t('quit.app.your_journey')}</h2>
        </motion.div>

        {/* Substance List */}
        <div className="flex flex-col gap-3">
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
          <p className="text-xs text-muted-foreground/60 flex items-center justify-center gap-1.5">
            <Shield className="h-3 w-3" />
            {t('quit.app.privacy_footer')}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
