import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ArrowUp, Lock, Check, Play, Pause, Trophy, Sparkles, Heart, BookmarkCheck, Bookmark, Target, Zap } from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';
import { SubstanceConfig } from '@/data/types';
import { getAssessment, saveAssessment, toggleCommunityUpvote, getCommunityUpvotes, addUserPost, getUserPosts } from '@/data/storage';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  toolId: string;
  substance: SubstanceConfig;
  onClose: () => void;
}

const ToolModal = ({ toolId, substance, onClose }: Props) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="mx-auto max-w-lg px-4 pb-8">
        <div className="flex items-center justify-between py-4">
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        {toolId === 'assessment' && <Assessment substance={substance} />}
        {toolId === 'calculator' && <CalculatorView substance={substance} />}
        {toolId === 'activities' && <ActivitiesView substance={substance} />}
        {toolId === 'learn' && <LearnView substance={substance} />}
        {toolId === 'community' && <CommunityView substance={substance} />}
        {toolId === 'achievements' && <AchievementsView substance={substance} />}
      </div>
    </motion.div>
  );
};

// ===== DSM-5 ASSESSMENT =====
const dsmQuestions = [
  'Have you used [S] more often or in larger amounts than intended?',
  'Have you wanted to cut down or stop using [S] but couldn\'t?',
  'Have you spent significant time obtaining, using, or recovering from [S]?',
  'Have you experienced cravings or a strong desire to use [S]?',
  'Has your use resulted in failure to fulfill obligations at work, school, or home?',
  'Have you continued using [S] despite relationship problems?',
  'Have you given up important activities because of [S]?',
  'Have you used [S] in physically hazardous situations?',
  'Have you continued using [S] despite knowing it caused problems?',
  'Have you experienced tolerance — needing more [S]?',
  'Have you experienced withdrawal symptoms when stopping [S]?',
];

const likertOptions = [
  { label: 'Definitely Yes', value: 4 },
  { label: 'Somewhat Yes', value: 3 },
  { label: 'Not Sure', value: 2 },
  { label: 'Probably Not', value: 1 },
  { label: 'Not at All', value: 0 },
];

const Assessment = ({ substance }: { substance: SubstanceConfig }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const prev = getAssessment(substance.slug);

  const confirmAnswer = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);
    if (step < 10) setStep(step + 1);
    else {
      const score = Math.round(newAnswers.reduce((a, b) => a + b, 0) / (11 * 4) * 11);
      saveAssessment(substance.slug, { score, date: new Date().toISOString(), answers: newAnswers });
      setDone(true);
    }
  };

  if (done) {
    const rawTotal = answers.reduce((a, b) => a + b, 0);
    const maxTotal = 11 * 4;
    const normalizedScore = Math.round((rawTotal / maxTotal) * 11);
    
    const { label: severity, color } = normalizedScore <= 1 
      ? { label: t('quit.app.severity_none'), color: 'text-primary' }
      : normalizedScore <= 3 
        ? { label: t('quit.app.severity_mild'), color: 'text-accent' }
        : normalizedScore <= 5 
          ? { label: t('quit.app.severity_moderate'), color: 'text-accent' }
          : { label: t('quit.app.severity_severe'), color: 'text-destructive' };

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <h2 className="font-display text-2xl text-foreground">{t('quit.app.results')}</h2>
        <p className={`mt-4 font-display text-4xl font-bold ${color}`}>{normalizedScore}/11</p>
        <p className={`mt-2 text-lg font-semibold ${color}`}>{severity} {t('quit.app.substance_use_disorder')}</p>
        {prev && <p className="mt-3 text-xs text-muted-foreground">{t('quit.app.previous')}: {prev.score}/11</p>}
        <div className="mt-4 h-3 rounded-full bg-muted">
          <div className={`h-3 rounded-full ${normalizedScore <= 1 ? 'bg-primary' : normalizedScore <= 3 ? 'bg-accent' : normalizedScore <= 5 ? 'bg-accent' : 'bg-destructive'}`} style={{ width: `${(normalizedScore / 11) * 100}%` }} />
        </div>
        <button onClick={() => { setStep(0); setAnswers([]); setSelected(null); setDone(false); }} className="mt-6 rounded-xl bg-muted px-6 py-2 text-sm font-medium">{t('quit.app.retake')}</button>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-4 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${((step + 1) / 11) * 100}%` }} /></div>
      <p className="mb-2 text-xs text-muted-foreground">{t('quit.app.question_x_of_y', { current: step + 1, total: 11 })}</p>
      <motion.p key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-5 text-base font-medium text-foreground">
        {t(`quit.app.dsm.q${step}`, { substance: t(`quit.substances.${substance.slug}.name`) })}
      </motion.p>
      <div className="flex flex-col gap-2">
        {likertOptions.map((opt) => (
          <motion.button
            key={opt.value}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelected(opt.value)}
            className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
              selected === opt.value
                ? 'border-primary bg-primary/15 text-primary ring-1 ring-primary/30'
                : 'border-border bg-muted/50 text-foreground hover:bg-muted'
            }`}
          >
            {t(`quit.app.dsm.opt${opt.value}`)}
          </motion.button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        {step > 0 ? <button onClick={() => { setStep(step - 1); setAnswers(answers.slice(0, -1)); setSelected(answers[answers.length - 1] ?? null); }} className="text-xs text-muted-foreground">← {t('quit.app.back')}</button> : <span />}
        <button
          onClick={confirmAnswer}
          disabled={selected === null}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
        >
          {step < 10 ? (t('quit.app.next', 'Next')) : (t('quit.app.see_results', 'See Results'))}
        </button>
      </div>
    </div>
  );
};
// ===== CALCULATOR =====
const CalculatorView = ({ substance }: { substance: SubstanceConfig }) => {
  const { t } = useTranslation();
  const calc = substance.calculator;
  const [inputs, setInputs] = useState<Record<string, number>>(
    Object.fromEntries(calc.inputs.map(i => [i.key, i.defaultValue]))
  );
  const results = calc.compute(inputs);

  return (
    <div>
      <h2 className="mb-4 font-display text-xl text-foreground">{t(`quit.substances.${substance.slug}.calculator.title`)}</h2>
      <div className="space-y-4">
        {calc.inputs.map(input => (
          <div key={input.key}>
            <div className="flex justify-between text-xs"><span className="text-foreground font-medium">{t(`quit.substances.${substance.slug}.calculator.inputs.${input.key}.label`)}</span><span className="text-primary font-bold">{inputs[input.key]}{input.unit || ''}</span></div>
            <input type="range" min={input.min} max={input.max} step={input.step} value={inputs[input.key]} onChange={e => setInputs(prev => ({ ...prev, [input.key]: Number(e.target.value) }))} className="mt-1 w-full accent-primary" />
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-2">
        {results.map((r, i) => (
          <div key={i} className="flex justify-between rounded-lg border border-border bg-card p-3">
            <span className="text-xs text-muted-foreground">{t(`quit.substances.${substance.slug}.calculator.results.${i}.label`, r.label)}</span>
            <span className={`text-sm font-semibold ${r.color === 'destructive' ? 'text-destructive' : r.color === 'accent' ? 'text-accent' : 'text-foreground'}`}>
              {/* Check if value matches common translatable patterns */}
              {r.value.includes('units/week') ? t('quit.app.units_per_week', { count: r.value.split(' ')[0] }) :
               r.value.includes('units') ? t('quit.app.units_count', { count: r.value.split(' ')[0] }) :
               r.value.includes('mg/week') ? t('quit.app.mg_per_week', { count: r.value.split(' ')[0] }) :
               r.value.includes('mg') ? t('quit.app.mg_count', { count: r.value.split(' ')[0] }) :
               t(`quit.app.status.${r.value.toLowerCase().replace(/ /g, '_')}`, r.value)}
            </span>
          </div>
        ))}
      </div>
      {calc.note && (
        <p className="mt-4 rounded-lg bg-primary/5 p-3 text-xs text-foreground leading-relaxed">
          {t(`quit.substances.${substance.slug}.calculator.note`, calc.note)}
        </p>
      )}
    </div>
  );
};

// ===== ACTIVITIES =====
const ActivitiesView = ({ substance }: { substance: SubstanceConfig }) => {
  const { t } = useTranslation();
  const [active, setActive] = useState<string | null>(null);
  const activeActivity = substance.activities.find(a => a.id === active);

  if (activeActivity) {
    return <ActivityRunner activity={activeActivity} substance={substance} onBack={() => setActive(null)} />;
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-xl text-foreground">{t('quit.app.activities_title')}</h2>
      <div className="space-y-3">
        {substance.activities.map(act => (
          <button key={act.id} onClick={() => setActive(act.id)} className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-semibold text-foreground">{t(`quit.substances.${substance.slug}.activities.${act.id}.name`)}</p>
              <p className="text-xs text-muted-foreground">{act.duration} · {act.type}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
};

const ActivityRunner = ({ activity, substance, onBack }: { activity: any; substance: SubstanceConfig; onBack: () => void }) => {
  const { t } = useTranslation();
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([]);
  const [quizRevealed, setQuizRevealed] = useState(false);
  // Visualization state
  const [vizIndex, setVizIndex] = useState(0);
  // Tap game state
  const [taps, setTaps] = useState(0);
  const [tapDone, setTapDone] = useState(false);
  // Affirmation state
  const [affIndex, setAffIndex] = useState(0);
  const [affSaved, setAffSaved] = useState<Set<number>>(new Set());
  // Body scan state
  const [bodyIndex, setBodyIndex] = useState(-1);
  const [bodyDone, setBodyDone] = useState(false);
  // Sorting state
  const [sortAnswers, setSortAnswers] = useState<Record<number, string>>({});
  const [sortRevealed, setSortRevealed] = useState(false);
  // Journal state
  const [journalValues, setJournalValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // Auto-advance visualization
  useEffect(() => {
    if (activity.type !== 'visualization' || !running || !activity.scenes) return;
    const scene = activity.scenes[vizIndex];
    if (!scene) return;
    const timer = setTimeout(() => {
      if (vizIndex < activity.scenes.length - 1) setVizIndex(v => v + 1);
      else setRunning(false);
    }, scene.duration * 1000);
    return () => clearTimeout(timer);
  }, [running, vizIndex, activity]);

  const currentPhase = activity.phases ? [...activity.phases].reverse().find((p: any) => seconds >= p.time) : null;

  const backBtn = <button onClick={onBack} className="mb-4 text-xs text-muted-foreground hover:text-foreground transition-colors">← {t('quit.app.back', 'Back')}</button>;

  // ===== QUIZ =====
  if (activity.type === 'quiz' && activity.questions) {
    const q = activity.questions[quizIndex];
    const totalCorrect = quizAnswers.filter((a, i) => a === activity.questions![i]?.correctIndex).length;
    if (quizIndex >= activity.questions.length) {
      return (
        <div className="text-center">
          {backBtn}
          <h2 className="mb-2 font-display text-xl text-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.name`, { defaultValue: activity.name })}</h2>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="my-8">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-primary/15">
              <span className="text-4xl font-bold text-primary">{totalCorrect}/{activity.questions.length}</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {totalCorrect === activity.questions.length ? t('quit.app.activities.quiz.perfect', 'Perfect! You really know your stuff.') : totalCorrect > activity.questions.length / 2 ? t('quit.app.activities.quiz.good', 'Great knowledge! Review the ones you missed.') : t('quit.app.activities.quiz.learn', 'Good effort — learning is part of recovery.')}
            </p>
          </motion.div>
          <button onClick={() => { setQuizIndex(0); setQuizAnswers([]); setQuizRevealed(false); }} className="rounded-xl bg-muted px-6 py-2 text-sm font-medium">{t('quit.app.retake', 'Retake')}</button>
        </div>
      );
    }
    return (
      <div>
        {backBtn}
        <div className="mb-4 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${((quizIndex + 1) / activity.questions.length) * 100}%` }} /></div>
        <p className="mb-1 text-xs text-muted-foreground">{t('quit.app.question_x_of_y', { current: quizIndex + 1, total: activity.questions.length })}</p>
        <motion.p key={quizIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-6 text-base font-semibold text-foreground">
          {t(`quit.substances.${substance.slug}.activities.${activity.id}.questions.${quizIndex}.question`, q.question)}
        </motion.p>
        <div className="space-y-2">
          {q.options.map((opt: string, i: number) => {
            const selected = quizAnswers[quizIndex] === i;
            const isCorrect = i === q.correctIndex;
            const revealed = quizRevealed;
            return (
              <button key={i} disabled={revealed} onClick={() => { setQuizAnswers(prev => { const n = [...prev]; n[quizIndex] = i; return n; }); setQuizRevealed(true); }}
                className={`w-full rounded-xl border-2 p-3.5 text-left text-sm font-medium transition-all ${revealed ? (isCorrect ? 'border-primary bg-primary/10 text-primary' : selected ? 'border-destructive bg-destructive/10 text-destructive' : 'border-border text-muted-foreground') : 'border-border hover:border-primary/50 text-foreground'}`}>
                <span className="mr-2 font-bold text-muted-foreground">{String.fromCharCode(65 + i)}.</span> {t(`quit.substances.${substance.slug}.activities.${activity.id}.questions.${quizIndex}.options.${i}`, opt)}
              </button>
            );
          })}
        </div>
        {quizRevealed && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <p className="text-xs text-muted-foreground leading-relaxed rounded-lg bg-muted p-3">
              {t(`quit.substances.${substance.slug}.activities.${activity.id}.questions.${quizIndex}.explanation`, q.explanation)}
            </p>
            <button onClick={() => { setQuizIndex(quizIndex + 1); setQuizRevealed(false); }} className="mt-3 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
              {quizIndex < activity.questions.length - 1 ? t('quit.app.next', 'Next') : t('quit.app.see_results', 'See Results')}
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  // ===== VISUALIZATION =====
  if (activity.type === 'visualization' && activity.scenes) {
    const scene = activity.scenes[vizIndex];
    return (
      <div className="text-center">
        {backBtn}
        <h2 className="mb-2 font-display text-xl text-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.name`, { defaultValue: activity.name })}</h2>
        {activity.description && <p className="mb-6 text-xs text-muted-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.description`, { defaultValue: activity.description })}</p>}
        <motion.div key={vizIndex} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto my-8">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/10 shadow-lg">
            <DynamicIcon name={scene?.emoji || "sparkle"} className="h-16 w-16 text-primary" />
          </motion.div>
          <motion.p key={scene?.text} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-8 text-sm text-foreground leading-relaxed max-w-xs mx-auto">
            {t(`quit.substances.${substance.slug}.activities.${activity.id}.scenes.${vizIndex}.text`, scene?.text)}
          </motion.p>
        </motion.div>
        <div className="flex items-center justify-center gap-2 mb-4">
          {activity.scenes.map((_: any, i: number) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === vizIndex ? 'w-6 bg-primary' : i < vizIndex ? 'w-2 bg-primary/40' : 'w-2 bg-muted'}`} />
          ))}
        </div>
        <button onClick={() => { if (!running) { setRunning(true); setVizIndex(0); } else { setRunning(false); } }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          {running ? <><Pause className="h-4 w-4" /> {t('quit.app.pause', 'Pause')}</> : <><Play className="h-4 w-4" /> {vizIndex > 0 ? t('quit.app.continue', 'Continue') : t('quit.app.begin_journey', 'Begin Journey')}</>}
        </button>
      </div>
    );
  }

  // ===== TAP GAME =====
  if (activity.type === 'tap-game') {
    const goal = activity.tapGoal || 30;
    const progress = Math.min(100, (taps / goal) * 100);
    if (tapDone) {
      return (
        <div className="text-center">
          {backBtn}
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
            <div className="flex justify-center mb-4"><Trophy className="h-16 w-16 text-yellow-500" /></div>
            <h2 className="font-display text-2xl text-foreground mb-2">{t('quit.app.activities.tap.success', 'Craving Crushed!')}</h2>
            <p className="text-sm text-muted-foreground">{t('quit.app.activities.tap.success_desc', { count: taps })}</p>
            <button onClick={() => { setTaps(0); setTapDone(false); }} className="mt-6 rounded-xl bg-muted px-6 py-2 text-sm font-medium">{t('quit.app.activities.tap.again', 'Go Again')}</button>
          </motion.div>
        </div>
      );
    }
    return (
      <div className="text-center">
        {backBtn}
        <h2 className="mb-2 font-display text-xl text-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.name`, { defaultValue: activity.name })}</h2>
        <p className="mb-6 text-xs text-muted-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.tapPrompt`, { defaultValue: activity.tapPrompt }) || t(`quit.substances.${substance.slug}.activities.${activity.id}.description`, { defaultValue: activity.description })}</p>
        <div className="relative mx-auto mb-6">
          <svg viewBox="0 0 120 120" className="w-40 h-40 mx-auto">
            <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <motion.circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
              strokeDasharray={339.3} strokeDashoffset={339.3 * (1 - progress / 100)} strokeLinecap="round"
              transform="rotate(-90 60 60)" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-foreground">{taps}</span>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { const next = taps + 1; setTaps(next); if (next >= goal) setTapDone(true); }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-lg active:shadow-sm transition-shadow">
          <Zap className="h-10 w-10 text-primary-foreground fill-primary-foreground" />
        </motion.button>
        <p className="mt-3 text-xs text-muted-foreground">{t('quit.app.activities.tap.remaining', { count: goal - taps })}</p>
      </div>
    );
  }

  // ===== AFFIRMATION =====
  if (activity.type === 'affirmation' && activity.affirmations) {
    const aff = activity.affirmations[affIndex];
    return (
      <div className="text-center">
        {backBtn}
        <h2 className="mb-2 font-display text-xl text-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.name`, { defaultValue: activity.name })}</h2>
        <p className="mb-8 text-xs text-muted-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.description`, { defaultValue: activity.description })}</p>
        <AnimatePresence mode="wait">
          <motion.div key={affIndex} initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-sm rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-8 shadow-lg min-h-[180px] flex flex-col items-center justify-center">
            <div className="flex justify-center mb-4">{affSaved.has(affIndex) ? <Heart className="h-10 w-10 text-primary fill-primary" /> : <Sparkles className="h-10 w-10 text-primary/40" />}</div>
            <p className="text-lg font-semibold text-foreground leading-relaxed italic">
              "{t(`quit.substances.${substance.slug}.activities.${activity.id}.affirmations.${affIndex}`, aff)}"
            </p>
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-center gap-4 mt-8">
          <button disabled={affIndex === 0} onClick={() => setAffIndex(affIndex - 1)}
            className="rounded-full bg-muted px-4 py-2 text-sm font-medium disabled:opacity-30">← {t('quit.app.prev', 'Prev')}</button>
          <button onClick={() => setAffSaved(prev => { const n = new Set(prev); if (n.has(affIndex)) n.delete(affIndex); else n.add(affIndex); return n; })}
            className={`rounded-full px-4 py-2 text-sm font-medium ${affSaved.has(affIndex) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            {affSaved.has(affIndex) ? <span className="flex items-center gap-2"><BookmarkCheck className="h-4 w-4" /> {t('quit.app.activities.affirmation.saved')}</span> : <span className="flex items-center gap-2"><Bookmark className="h-4 w-4" /> {t('quit.app.activities.affirmation.save')}</span>}
          </button>
          <button disabled={affIndex >= activity.affirmations.length - 1} onClick={() => setAffIndex(affIndex + 1)}
            className="rounded-full bg-muted px-4 py-2 text-sm font-medium disabled:opacity-30">{t('quit.app.next', 'Next')} →</button>
        </div>
        <p className="mt-4 text-[10px] text-muted-foreground">{t('quit.app.affirmation_x_of_y', { current: affIndex + 1, total: activity.affirmations.length })} · {affSaved.size} {t('quit.app.saved', 'saved')}</p>
      </div>
    );
  }

  // ===== BODY SCAN =====
  if (activity.type === 'body-scan' && activity.bodyZones) {
    if (bodyDone) {
      return (
        <div className="text-center">
          {backBtn}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-center mb-4"><Target className="h-16 w-16 text-primary" /></div>
            <h2 className="font-display text-xl text-foreground mb-2">{t('quit.app.activities.bodyscan.complete', 'Scan Complete')}</h2>
            <p className="text-sm text-muted-foreground mb-6">{t('quit.app.activities.bodyscan.complete_desc', { count: activity.bodyZones.length })}</p>
            <button onClick={() => { setBodyIndex(-1); setBodyDone(false); }} className="rounded-xl bg-muted px-6 py-2 text-sm font-medium">{t('quit.app.activities.repeat', 'Repeat')}</button>
          </motion.div>
        </div>
      );
    }
    if (bodyIndex === -1) {
      return (
        <div className="text-center">
          {backBtn}
          <h2 className="mb-2 font-display text-xl text-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.name`, { defaultValue: activity.name })}</h2>
          <p className="mb-6 text-xs text-muted-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.description`, { defaultValue: activity.description })}</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {activity.bodyZones.map((zone: any, i: number) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="flex justify-center mb-1"><DynamicIcon name={zone.emoji} className="h-6 w-6 text-primary" /></div>
                <p className="text-xs font-medium text-foreground mt-1">
                  {t(`quit.substances.${substance.slug}.activities.${activity.id}.bodyZones.${i}.name`, zone.name)}
                </p>
              </div>
            ))}
          </div>
          <button onClick={() => setBodyIndex(0)} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
            {t('quit.app.activities.bodyscan.begin', 'Begin Body Scan')}
          </button>
        </div>
      );
    }
    const zone = activity.bodyZones[bodyIndex];
    return (
      <div className="text-center">
        {backBtn}
        <div className="mb-4 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${((bodyIndex + 1) / activity.bodyZones.length) * 100}%` }} /></div>
        <p className="text-xs text-muted-foreground mb-6">{t('quit.app.activities.bodyscan.zone_x_of_y', { current: bodyIndex + 1, total: activity.bodyZones.length })}</p>
        <motion.div key={bodyIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity }}
            className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 mb-6">
            <div className="flex justify-center mb-1"><DynamicIcon name={zone.emoji} className="h-12 w-12 text-primary" /></div>
          </motion.div>
          <h3 className="font-display text-lg text-foreground mb-3">
            {t(`quit.substances.${substance.slug}.activities.${activity.id}.bodyZones.${bodyIndex}.name`, zone.name)}
          </h3>
          <p className="text-sm text-foreground leading-relaxed max-w-xs mx-auto mb-8">
            {t(`quit.substances.${substance.slug}.activities.${activity.id}.bodyZones.${bodyIndex}.prompt`, zone.prompt)}
          </p>
        </motion.div>
        <button onClick={() => { if (bodyIndex < activity.bodyZones.length - 1) setBodyIndex(bodyIndex + 1); else setBodyDone(true); }}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          {bodyIndex < activity.bodyZones.length - 1 ? `${t('quit.app.activities.bodyscan.next_zone', 'Next Zone')} →` : `${t('quit.app.activities.complete', 'Complete')} ✓`}
        </button>
      </div>
    );
  }

  // ===== SORTING =====
  if (activity.type === 'sorting' && activity.sortItems && activity.sortCategories) {
    const allAnswered = Object.keys(sortAnswers).length === activity.sortItems.length;
    const correctCount = activity.sortItems.filter((item: any, i: number) => sortAnswers[i] === item.correct).length;
    return (
      <div>
        {backBtn}
        <h2 className="mb-2 font-display text-xl text-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.name`, { defaultValue: activity.name })}</h2>
        <p className="mb-6 text-xs text-muted-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.description`, { defaultValue: activity.description })}</p>
        <div className="space-y-3">
          {activity.sortItems.map((item: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={`rounded-xl border-2 p-3.5 transition-all ${sortRevealed ? (sortAnswers[i] === item.correct ? 'border-primary bg-primary/5' : 'border-destructive bg-destructive/5') : 'border-border'}`}>
              <p className="text-sm font-medium text-foreground mb-2">
                {t(`quit.substances.${substance.slug}.activities.${activity.id}.sortItems.${i}.text`, item.text)}
              </p>
              <div className="flex gap-2 flex-wrap">
                {activity.sortCategories.map((cat: string) => (
                    <button key={cat} disabled={revealed}
                      onClick={() => setSortAnswers(prev => ({ ...prev, [i]: cat }))}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${sortAnswers[i] === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      {t(`quit.substances.${substance.slug}.activities.${activity.id}.sortCategories.${activity.sortCategories.indexOf(cat)}`, cat)}
                    </button>
                ))}
              </div>
              {sortRevealed && sortAnswers[i] !== item.correct && (
                <p className="mt-1 text-[10px] text-muted-foreground">{t('quit.app.correct', 'Correct')}: {t(`quit.substances.${substance.slug}.activities.${activity.id}.sortCategories.${activity.sortCategories.indexOf(item.correct)}`, item.correct)}</p>
              )}
            </motion.div>
          ))}
        </div>
        {allAnswered && !sortRevealed && (
          <button onClick={() => setSortRevealed(true)} className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground">{t('quit.app.activities.sorting.check', 'Check Answers')}</button>
        )}
        {sortRevealed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-xl bg-primary/10 p-4 text-center">
            <p className="text-sm font-semibold text-primary flex items-center justify-center gap-2">
              {correctCount}/{activity.sortItems.length} correct 
              {correctCount === activity.sortItems.length ? <Trophy className="h-4 w-4" /> : '— keep learning!'}
            </p>
          </motion.div>
        )}
      </div>
    );
  }

  // ===== JOURNAL =====
  if (activity.type === 'journal') {
    return (
      <div>
        {backBtn}
        <h2 className="mb-2 font-display text-xl text-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.name`, { defaultValue: activity.name })}</h2>
        {activity.description && <p className="mb-6 text-xs text-muted-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.description`, { defaultValue: activity.description })}</p>}
        <div className="space-y-4">
          {activity.fields?.map((field: any) => (
            <div key={field.key}>
              <label className="text-xs font-medium text-foreground mb-1 block">
                {t(`quit.substances.${substance.slug}.activities.${activity.id}.fields.${field.key}.label`, field.label)}
              </label>
              {field.type === 'textarea' ? (
                <textarea value={journalValues[field.key] || ''} onChange={e => setJournalValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={t(`quit.substances.${substance.slug}.activities.${activity.id}.fields.${field.key}.placeholder`, field.placeholder)} className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground min-h-[80px] resize-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              ) : field.type === 'slider' ? (
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{field.min}</span><span className="text-primary font-bold">{journalValues[field.key] ?? field.min}</span><span className="text-muted-foreground">{field.max}</span></div>
                  <input type="range" min={field.min} max={field.max} step={field.step || 1} value={journalValues[field.key] ?? field.min} onChange={e => setJournalValues(prev => ({ ...prev, [field.key]: Number(e.target.value) }))} className="w-full accent-primary" />
                </div>
              ) : field.type === 'chips' ? (
                <div className="flex flex-wrap gap-2">
                  {field.options?.map((opt: string, k: number) => (
                    <button key={opt} onClick={() => setJournalValues(prev => ({ ...prev, [field.key]: opt }))}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${journalValues[field.key] === opt ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {t(`quit.substances.${substance.slug}.activities.${activity.id}.fields.${field.key}.options.${k}`, opt)}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
        {Object.keys(journalValues).length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 rounded-xl bg-primary/10 p-4 text-center">
            <p className="text-sm font-semibold text-primary">{t('quit.app.activities.journal.captured', 'Reflection captured. Awareness is progress.')}</p>
          </motion.div>
        )}
      </div>
    );
  }

  // ===== CHECKLIST =====
  if (activity.type === 'checklist') {
    const allDone = activity.items && checkedItems.size === activity.items.length;
    return (
      <div>
        {backBtn}
        <h2 className="mb-4 font-display text-xl text-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.name`, { defaultValue: activity.name })}</h2>
        {activity.description && <p className="mb-4 text-sm text-muted-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.description`, { defaultValue: activity.description })}</p>}
        <div className="space-y-3">
          {activity.items?.map((item: any, i: number) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <button onClick={() => setCheckedItems(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; })} className="flex w-full items-center gap-3 p-4 text-left">
                <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${checkedItems.has(i) ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                  {checkedItems.has(i) && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
                <span className="text-sm font-medium text-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.items.${i}.title`, item.title)}</span>
              </button>
              <AnimatePresence>
                {checkedItems.has(i) && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <p className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">{t(`quit.substances.${substance.slug}.activities.${activity.id}.items.${i}.content`, item.content)}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        {allDone && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 rounded-xl bg-primary/10 p-4 text-center">
            <p className="text-sm font-semibold text-primary flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" /> {t('quit.app.activities.complete_well_done', 'Complete! Well done.')}
            </p>
          </motion.div>
        )}
      </div>
    );
  }

  // ===== TIMER / BREATHING (default) =====
  const totalSeconds = activity.phases ? Math.max(...activity.phases.map((p: any) => p.time)) + 60 : 300;
  return (
    <div className="text-center">
      {backBtn}
      <h2 className="mb-2 font-display text-xl text-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.name`, { defaultValue: activity.name })}</h2>
      {activity.description && <p className="mb-6 text-xs text-muted-foreground">{t(`quit.substances.${substance.slug}.activities.${activity.id}.description`, { defaultValue: activity.description })}</p>}
      {activity.type === 'breathing' && (
        <motion.div animate={{ scale: running ? [1, 1.4, 1.4, 1, 1] : 1 }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary/20">
          <div className="h-20 w-20 rounded-full bg-primary/40" />
        </motion.div>
      )}
      <p className="mb-4 text-4xl font-bold text-foreground font-body">{Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}</p>
      {currentPhase && (
        <motion.p key={currentPhase.text} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 text-sm text-foreground leading-relaxed">{t(`quit.substances.${substance.slug}.activities.${activity.id}.phases.${activity.phases.indexOf(currentPhase)}.text`, currentPhase.text)}</motion.p>
      )}
      <button onClick={() => setRunning(!running)} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
        {running ? <><Pause className="h-4 w-4" /> {t('quit.app.pause', 'Pause')}</> : <><Play className="h-4 w-4" /> {seconds > 0 ? t('quit.app.resume', 'Resume') : t('quit.app.start', 'Start')}</>}
      </button>
    </div>
  );
};

// ===== LEARN =====
const LearnView = ({ substance }: { substance: SubstanceConfig }) => {
  const { t } = useTranslation();
  const [active, setActive] = useState<string | null>(null);
  const article = substance.articles.find(a => a.id === active);

  if (article) {
    return (
      <div>
        <button onClick={() => setActive(null)} className="mb-4 text-xs text-muted-foreground">← {t('quit.app.back')}</button>
        <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{t(`quit.substances.${substance.slug}.articles.${article.id}.tag`, article.tag)}</span>
        <h2 className="mb-4 font-display text-xl text-foreground">{t(`quit.substances.${substance.slug}.articles.${article.id}.title`)}</h2>
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">{t(`quit.substances.${substance.slug}.articles.${article.id}.content`)}</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-xl text-foreground">{t('quit.app.learn')}</h2>
      <div className="space-y-3">
        {substance.articles.map(art => (
          <button key={art.id} onClick={() => setActive(art.id)} className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left hover:shadow-md">
            <div className="flex-1">
              <span className="mb-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{t(`quit.substances.${substance.slug}.articles.${art.id}.tag`, art.tag)}</span>
              <p className="text-sm font-semibold text-foreground">{t(`quit.substances.${substance.slug}.articles.${art.id}.title`)}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

// ===== COMMUNITY =====
const CommunityView = ({ substance }: { substance: SubstanceConfig }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('All');
  const [activePost, setActivePost] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const upvotes = getCommunityUpvotes(substance.slug);
  const userPosts = getUserPosts(substance.slug);
  const allPosts = [...userPosts, ...substance.communityPosts];
  const filters = ['All', 'Stories', 'Questions', 'Tips', 'Milestones', 'Support'];
  const filtered = filter === 'All' ? allPosts : allPosts.filter(p => p.type === filter.slice(0, -1) || p.type === filter);

  const post = allPosts.find(p => p.id === activePost);

  if (post) {
    return (
      <div>
        <button onClick={() => setActivePost(null)} className="mb-4 text-xs text-muted-foreground">← {t('quit.app.back', 'Back')}</button>
        <span className="mb-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{post.type}</span>
        <h2 className="mb-2 font-display text-lg text-foreground">{post.title}</h2>
        <p className="text-xs text-muted-foreground mb-4">{post.username} · {post.timeAgo}</p>
        <p className="text-sm text-foreground leading-relaxed mb-6">{post.body}</p>
        {post.replies?.map((r: any, i: number) => (
          <div key={i} className="mb-3 rounded-lg bg-muted p-3">
            <p className="text-xs font-medium text-foreground">{r.username} · {r.timeAgo}</p>
            <p className="mt-1 text-xs text-muted-foreground">{r.text}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl text-foreground">{t('quit.app.community')}</h2>
        <button onClick={() => setShowComposer(true)} className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">+ {t('quit.app.post')}</button>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{f}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(p => (
          <button key={p.id} onClick={() => setActivePost(p.id)} className="w-full rounded-xl border border-border bg-card p-4 text-left hover:shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{p.type}</span>
              <span className="text-[10px] text-muted-foreground">{p.timeAgo}</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{p.title}</p>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.body}</p>
            <div className="mt-2 flex items-center gap-3">
              <button onClick={e => { e.stopPropagation(); toggleCommunityUpvote(substance.slug, p.id); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                <ArrowUp className="h-3 w-3" /> {p.upvotes + (upvotes[p.id] ? 1 : 0)}
              </button>
              <span className="text-xs text-muted-foreground">{p.comments} {t('quit.app.community.comments', 'comments')}</span>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showComposer && <PostComposer substance={substance} onClose={() => setShowComposer(false)} />}
      </AnimatePresence>
    </div>
  );
};

const PostComposer = ({ substance, onClose }: { substance: SubstanceConfig; onClose: () => void }) => {
  const { t } = useTranslation();
  const [type, setType] = useState<string>('Story');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handlePost = () => {
    if (!title.trim()) return;
    addUserPost(substance.slug, {
      id: `user-${Date.now()}`, type, title, body, upvotes: 0, comments: 0,
      timeAgo: 'Just now', username: 'anonymous_user',
    });
    onClose();
  };

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-[60] flex flex-col">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="rounded-t-2xl bg-card px-4 pb-8 pt-4">
        <div className="mb-4 flex justify-between"><h3 className="font-display text-lg">{t('quit.app.new_post')}</h3><button onClick={onClose}><X className="h-5 w-5" /></button></div>
        <div className="mb-3 flex gap-2">
          {['Story', 'Question', 'Tip', 'Milestone', 'Support'].map(t => (
            <button key={t} onClick={() => setType(t)} className={`rounded-full px-3 py-1 text-xs font-medium ${type === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t}</button>
          ))}
        </div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('quit.app.community.title', 'Title')} className="mb-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder={t('quit.app.share_thoughts')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" rows={4} />
        <button onClick={handlePost} className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground">{t('quit.app.post')}</button>
      </div>
    </motion.div>
  );
};

// ===== ACHIEVEMENTS =====
const AchievementsView = ({ substance }: { substance: SubstanceConfig }) => {
  const { t } = useTranslation();
  return (
    <div>
      <h2 className="mb-4 font-display text-xl text-foreground">{t('quit.app.achievements')}</h2>
    <div className="grid grid-cols-2 gap-3">
      {substance.achievements.map(ach => {
        const result = ach.condition({});
        return (
          <div key={ach.id} className={`rounded-xl border p-4 text-center ${result.unlocked ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/50 opacity-60'}`}>
            <div className="flex justify-center mb-2">
              <DynamicIcon name={result.unlocked ? ach.icon : 'Lock'} className={`h-10 w-10 ${result.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <p className="mt-2 text-xs font-semibold text-foreground">{ach.name}</p>
            <p className="text-[10px] text-muted-foreground">{ach.description}</p>
            {result.unlocked && <p className="mt-1 text-[10px] text-primary font-medium">✓ {t('quit.app.unlocked')}</p>}
            {!result.unlocked && result.progress && <p className="mt-1 text-[10px] text-muted-foreground">{result.progress}</p>}
          </div>
        );
      })}
    </div>
    </div>
  );
};

export default ToolModal;
