import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Calendar, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SubstanceConfig } from '@/data/types';
import { setStreak, getPrefix } from '@/data/storage';
import SubstanceIcon from './SubstanceIcon';

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

const triggersBySubstance: Record<string, string[]> = {
  alcohol: ['Stress', 'Social events', 'Evenings', 'Boredom', 'Loneliness', 'Celebrations'],
  tobacco: ['Morning routine', 'After meals', 'Stress', 'Social smoking', 'Driving', 'Coffee'],
  opioids: ['Physical pain', 'Emotional pain', 'Stress', 'Certain people', 'Locations', 'Boredom'],
  cannabis: ['Evening routine', 'Boredom', 'Stress', 'Social pressure', 'Sleep issues', 'Anxiety'],
  stimulants: ['Work pressure', 'Nightlife', 'Social settings', 'Depression', 'Fatigue', 'Deadlines'],
  benzodiazepines: ['Anxiety', 'Panic attacks', 'Insomnia', 'Social situations', 'Stress', 'Travel'],
  kratom: ['Morning routine', 'Pain', 'Low energy', 'Anxiety', 'Online forums', 'Boredom'],
  mdma: ['Festivals', 'Clubs', 'Social pressure', 'Depression', 'FOMO', 'Music events'],
};

const motivations = ['Better health', 'Family & relationships', 'Financial freedom', 'Mental clarity', 'Self-respect', 'Career goals'];

interface Props {
  substance: SubstanceConfig;
  onComplete: (motivation?: string, triggers?: string[]) => void;
}

const SubstanceOnboarding = ({ substance, onComplete }: Props) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [quitOption, setQuitOption] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState('');
  const [motivation, setMotivation] = useState<string | null>(null);
  const [triggers, setTriggers] = useState<string[]>([]);

  const gradient = heroGradients[substance.slug] || 'from-primary to-primary/80';
  const substanceTriggers = triggersBySubstance[substance.slug] || triggersBySubstance.alcohol;

  const getQuitDaysAgo = (): number => {
    if (quitOption === 'today') return 0;
    if (quitOption === 'yesterday') return 1;
    if (quitOption === '3days') return 3;
    if (quitOption === 'week') return 7;
    if (quitOption === 'custom' && customDate) {
      const diff = Math.floor((Date.now() - new Date(customDate).getTime()) / 86400000);
      return Math.max(0, diff);
    }
    return 0;
  };

  const handleComplete = () => {
    const daysAgo = getQuitDaysAgo();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    const startStr = startDate.toISOString().split('T')[0]; // fixed quit.T string split bug
    setStreak(substance.slug, daysAgo, startStr);
    localStorage.setItem(`${getPrefix()}_onboarded_${substance.slug}`, 'true');
    localStorage.setItem(`${getPrefix()}_motivation_${substance.slug}`, motivation || '');
    localStorage.setItem(`${getPrefix()}_triggers_${substance.slug}`, JSON.stringify(triggers));
    onComplete(motivation || undefined, triggers);
  };

  const canNext = () => {
    if (step === 0) return !!quitOption && (quitOption !== 'custom' || !!customDate);
    if (step === 1) return !!motivation;
    if (step === 2) return triggers.length > 0;
    return true;
  };

  const steps = [
    { icon: Calendar, title: t('quit.app.onboarding.quit_date'), subtitle: t('quit.app.onboarding.quit_subtitle', { substance: t(`quit.substances.${substance.slug}.name`).toLowerCase() }) },
    { icon: Target, title: t('quit.app.onboarding.your_why'), subtitle: t('quit.app.onboarding.motivation_subtitle') },
    { icon: AlertTriangle, title: t('quit.app.onboarding.triggers_title'), subtitle: t('quit.app.onboarding.triggers_subtitle') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 flex flex-col">
      <div className="mx-auto max-w-lg w-full px-5 pb-16 pt-8 flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${gradient} shadow-xl`}>
            <SubstanceIcon slug={substance.slug} className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-display text-3xl text-foreground">{t(`quit.substances.${substance.slug}.name`)}</h1>
          <p className="text-sm text-muted-foreground mt-1.5">{t(`quit.substances.${substance.slug}.descriptor`)}</p>
        </motion.div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-500 ${
              i === step ? 'w-8 bg-primary' : i < step ? 'w-2 bg-primary/60' : 'w-2 bg-muted'
            }`} />
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                {(() => { const StepIcon = steps[step].icon; return <StepIcon className="h-5 w-5 text-primary" />; })()}
                <div>
                  <h2 className="font-display text-xl text-foreground">{steps[step].title}</h2>
                  <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
                </div>
              </div>

              {step === 0 && (
                <div className="space-y-3">
                  {[
                    { id: 'today', label: t('quit.app.onboarding.today'), desc: t('quit.app.onboarding.today_desc') },
                    { id: 'yesterday', label: t('quit.app.onboarding.yesterday'), desc: t('quit.app.onboarding.yesterday_desc') },
                    { id: '3days', label: t('quit.app.onboarding.3days'), desc: t('quit.app.onboarding.3days_desc') },
                    { id: 'week', label: t('quit.app.onboarding.week'), desc: t('quit.app.onboarding.week_desc') },
                    { id: 'custom', label: t('quit.app.onboarding.custom'), desc: t('quit.app.onboarding.custom_desc') },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setQuitOption(opt.id)}
                      className={`w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                        quitOption === opt.id
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border/60 bg-card hover:border-primary/30'
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        quitOption === opt.id ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                      }`}>
                        {quitOption === opt.id && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                  {quitOption === 'custom' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <input
                        type="date"
                        value={customDate}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={e => setCustomDate(e.target.value)}
                        className="w-full rounded-2xl border-2 border-border/60 bg-background px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                      />
                    </motion.div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <button
                      key={i}
                      onClick={() => setMotivation(t(`quit.app.onboarding.motivations.${i}`))}
                      className={`rounded-2xl border-2 p-4 text-left transition-all ${
                        motivation === t(`quit.app.onboarding.motivations.${i}`)
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border/60 bg-card hover:border-primary/30'
                      }`}
                    >
                      <p className="text-sm font-bold text-foreground">{t(`quit.app.onboarding.motivations.${i}`)}</p>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-wrap gap-2.5">
                  {substanceTriggers.map((_, i) => {
                    const trigKey = `quit.substances.${substance.slug}.triggers.${i}`;
                    const val = t(trigKey);
                    const selected = triggers.includes(val);
                    return (
                      <button
                        key={i}
                        onClick={() => setTriggers(prev => selected ? prev.filter(x => x !== val) : [...prev, val])}
                        className={`rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                          selected
                            ? 'border-primary bg-primary text-primary-foreground shadow-md'
                            : 'border-border/60 bg-card text-foreground hover:border-primary/30'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : window.location.href = 'https://web.mantracare.com/quit'}
            className="flex items-center gap-1.5 rounded-2xl border-2 border-border/60 px-5 py-3.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {t('quit.app.back')}
          </button>
          <button
            onClick={() => step < 2 ? setStep(s => s + 1) : handleComplete()}
            disabled={!canNext()}
            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all shadow-lg ${
              canNext()
                ? 'bg-primary hover:opacity-90 shadow-primary/25'
                : 'bg-muted text-muted-foreground shadow-none cursor-not-allowed'
            }`}
          >
            {step < 2 ? (
              <>{t('quit.app.onboarding.continue')} <ArrowRight className="h-4 w-4" /></>
            ) : (
              <>{t('quit.app.onboarding.start_tracking')} <CheckCircle2 className="h-4 w-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubstanceOnboarding;
