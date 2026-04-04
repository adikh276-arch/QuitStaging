import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ArrowUp, Lock, Check, Play, Pause } from 'lucide-react';
import { SubstanceConfig } from '@/data/types';
import { getAssessment, saveAssessment, toggleCommunityUpvote, getCommunityUpvotes, addUserPost, getUserPosts } from '@/data/storage';
import { useEffect, useRef } from 'react';

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

const Assessment = ({ substance }: { substance: SubstanceConfig }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const prev = getAssessment(substance.slug);

  const answer = (yes: boolean) => {
    const newAnswers = [...answers, yes];
    setAnswers(newAnswers);
    if (step < 10) setStep(step + 1);
    else {
      const score = newAnswers.filter(Boolean).length;
      saveAssessment(substance.slug, { score, date: new Date().toISOString(), answers: newAnswers });
      setDone(true);
    }
  };

  if (done) {
    const score = answers.filter(Boolean).length;
    const severity = score <= 1 ? 'No indication' : score <= 3 ? 'Mild' : score <= 5 ? 'Moderate' : 'Severe';
    const color = score <= 1 ? 'text-primary' : score <= 3 ? 'text-accent' : score <= 5 ? 'text-accent' : 'text-destructive';
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <h2 className="font-display text-2xl text-foreground">Results</h2>
        <p className={`mt-4 font-display text-4xl font-bold ${color}`}>{score}/11</p>
        <p className={`mt-2 text-lg font-semibold ${color}`}>{severity} Substance Use Disorder</p>
        {prev && <p className="mt-3 text-xs text-muted-foreground">Previous: {prev.score}/11</p>}
        <div className="mt-4 h-3 rounded-full bg-muted">
          <div className={`h-3 rounded-full ${score <= 1 ? 'bg-primary' : score <= 3 ? 'bg-accent' : score <= 5 ? 'bg-accent' : 'bg-destructive'}`} style={{ width: `${(score / 11) * 100}%` }} />
        </div>
        <button onClick={() => { setStep(0); setAnswers([]); setDone(false); }} className="mt-6 rounded-xl bg-muted px-6 py-2 text-sm font-medium">Retake</button>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-4 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${((step + 1) / 11) * 100}%` }} /></div>
      <p className="mb-2 text-xs text-muted-foreground">Question {step + 1} of 11</p>
      <motion.p key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-6 text-base font-medium text-foreground">
        {dsmQuestions[step].replace('[S]', substance.name.toLowerCase())}
      </motion.p>
      <div className="flex gap-3">
        <button onClick={() => answer(true)} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground">Yes, in the past year</button>
        <button onClick={() => answer(false)} className="flex-1 rounded-xl bg-muted py-3 text-sm font-semibold text-foreground">No</button>
      </div>
      {step > 0 && <button onClick={() => { setStep(step - 1); setAnswers(answers.slice(0, -1)); }} className="mt-3 text-xs text-muted-foreground">← Back</button>}
    </div>
  );
};

// ===== CALCULATOR =====
const CalculatorView = ({ substance }: { substance: SubstanceConfig }) => {
  const calc = substance.calculator;
  const [inputs, setInputs] = useState<Record<string, number>>(
    Object.fromEntries(calc.inputs.map(i => [i.key, i.defaultValue]))
  );
  const results = calc.compute(inputs);

  return (
    <div>
      <h2 className="mb-4 font-display text-xl text-foreground">{calc.title}</h2>
      <div className="space-y-4">
        {calc.inputs.map(input => (
          <div key={input.key}>
            <div className="flex justify-between text-xs"><span className="text-foreground font-medium">{input.label}</span><span className="text-primary font-bold">{inputs[input.key]}{input.unit || ''}</span></div>
            <input type="range" min={input.min} max={input.max} step={input.step} value={inputs[input.key]} onChange={e => setInputs(prev => ({ ...prev, [input.key]: Number(e.target.value) }))} className="mt-1 w-full accent-primary" />
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-2">
        {results.map((r, i) => (
          <div key={i} className="flex justify-between rounded-lg border border-border bg-card p-3">
            <span className="text-xs text-muted-foreground">{r.label}</span>
            <span className={`text-sm font-semibold ${r.color === 'destructive' ? 'text-destructive' : r.color === 'accent' ? 'text-accent' : 'text-foreground'}`}>{r.value}</span>
          </div>
        ))}
      </div>
      {calc.note && <p className="mt-4 rounded-lg bg-primary/5 p-3 text-xs text-foreground">{calc.note}</p>}
    </div>
  );
};

// ===== ACTIVITIES =====
const ActivitiesView = ({ substance }: { substance: SubstanceConfig }) => {
  const [active, setActive] = useState<string | null>(null);
  const activeActivity = substance.activities.find(a => a.id === active);

  if (activeActivity) {
    return <ActivityRunner activity={activeActivity} onBack={() => setActive(null)} />;
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-xl text-foreground">Activities</h2>
      <div className="space-y-3">
        {substance.activities.map(act => (
          <button key={act.id} onClick={() => setActive(act.id)} className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-semibold text-foreground">{act.name}</p>
              <p className="text-xs text-muted-foreground">{act.duration} · {act.type}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
};

const ActivityRunner = ({ activity, onBack }: { activity: any; onBack: () => void }) => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const currentPhase = activity.phases ? [...activity.phases].reverse().find((p: any) => seconds >= p.time) : null;
  const totalSeconds = activity.type === 'timer' || activity.type === 'breathing' ? (activity.phases ? Math.max(...activity.phases.map((p: any) => p.time)) + 60 : 300) : 0;

  if (activity.type === 'checklist') {
    const allDone = activity.items && checkedItems.size === activity.items.length;
    return (
      <div>
        <button onClick={onBack} className="mb-4 text-xs text-muted-foreground">← Back</button>
        <h2 className="mb-4 font-display text-xl text-foreground">{activity.name}</h2>
        {activity.description && <p className="mb-4 text-sm text-muted-foreground">{activity.description}</p>}
        <div className="space-y-3">
          {activity.items?.map((item: any, i: number) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <button onClick={() => setCheckedItems(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; })} className="flex w-full items-center gap-3 p-4 text-left">
                <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${checkedItems.has(i) ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                  {checkedItems.has(i) && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
                <span className="text-sm font-medium text-foreground">{item.title}</span>
              </button>
              <AnimatePresence>
                {checkedItems.has(i) && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <p className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">{item.content}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        {allDone && <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 rounded-xl bg-primary/10 p-4 text-center"><p className="text-sm font-semibold text-primary">✨ Complete! Well done.</p></motion.div>}
      </div>
    );
  }

  // Timer / Breathing
  return (
    <div className="text-center">
      <button onClick={onBack} className="mb-4 self-start text-xs text-muted-foreground">← Back</button>
      <h2 className="mb-2 font-display text-xl text-foreground">{activity.name}</h2>
      {activity.description && <p className="mb-6 text-xs text-muted-foreground">{activity.description}</p>}

      {activity.type === 'breathing' && (
        <motion.div
          animate={{ scale: running ? [1, 1.4, 1.4, 1, 1] : 1 }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary/20"
        >
          <div className="h-20 w-20 rounded-full bg-primary/40" />
        </motion.div>
      )}

      <p className="mb-4 text-4xl font-bold text-foreground font-body">
        {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
      </p>

      {currentPhase && (
        <motion.p key={currentPhase.text} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 text-sm text-foreground leading-relaxed">
          {currentPhase.text}
        </motion.p>
      )}

      <button onClick={() => setRunning(!running)} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
        {running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> {seconds > 0 ? 'Resume' : 'Start'}</>}
      </button>
    </div>
  );
};

// ===== LEARN =====
const LearnView = ({ substance }: { substance: SubstanceConfig }) => {
  const [active, setActive] = useState<string | null>(null);
  const article = substance.articles.find(a => a.id === active);

  if (article) {
    return (
      <div>
        <button onClick={() => setActive(null)} className="mb-4 text-xs text-muted-foreground">← Back</button>
        <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{article.tag}</span>
        <h2 className="mb-4 font-display text-xl text-foreground">{article.title}</h2>
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">{article.content}</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-xl text-foreground">Learn</h2>
      <div className="space-y-3">
        {substance.articles.map(art => (
          <button key={art.id} onClick={() => setActive(art.id)} className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left hover:shadow-md">
            <div className="flex-1">
              <span className="mb-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{art.tag}</span>
              <p className="text-sm font-semibold text-foreground">{art.title}</p>
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
        <button onClick={() => setActivePost(null)} className="mb-4 text-xs text-muted-foreground">← Back</button>
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
        <h2 className="font-display text-xl text-foreground">Community</h2>
        <button onClick={() => setShowComposer(true)} className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">+ Post</button>
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
              <span className="text-xs text-muted-foreground">{p.comments} comments</span>
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
        <div className="mb-4 flex justify-between"><h3 className="font-display text-lg">New Post</h3><button onClick={onClose}><X className="h-5 w-5" /></button></div>
        <div className="mb-3 flex gap-2">
          {['Story', 'Question', 'Tip', 'Milestone', 'Support'].map(t => (
            <button key={t} onClick={() => setType(t)} className={`rounded-full px-3 py-1 text-xs font-medium ${type === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t}</button>
          ))}
        </div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="mb-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Share your thoughts..." className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" rows={4} />
        <button onClick={handlePost} className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground">Post</button>
      </div>
    </motion.div>
  );
};

// ===== ACHIEVEMENTS =====
const AchievementsView = ({ substance }: { substance: SubstanceConfig }) => (
  <div>
    <h2 className="mb-4 font-display text-xl text-foreground">Achievements</h2>
    <div className="grid grid-cols-2 gap-3">
      {substance.achievements.map(ach => {
        const result = ach.condition({});
        return (
          <div key={ach.id} className={`rounded-xl border p-4 text-center ${result.unlocked ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/50 opacity-60'}`}>
            <span className="text-3xl">{result.unlocked ? ach.icon : '🔒'}</span>
            <p className="mt-2 text-xs font-semibold text-foreground">{ach.name}</p>
            <p className="text-[10px] text-muted-foreground">{ach.description}</p>
            {result.unlocked && <p className="mt-1 text-[10px] text-primary font-medium">✓ Unlocked</p>}
            {!result.unlocked && result.progress && <p className="mt-1 text-[10px] text-muted-foreground">{result.progress}</p>}
          </div>
        );
      })}
    </div>
  </div>
);

export default ToolModal;
