import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { substances } from '@/data/substances';
import { getStreak } from '@/data/storage';
import { Shield, Sparkles, ArrowRight } from 'lucide-react';

const SubstanceCard = ({ substance, index }: { substance: typeof substances[0]; index: number }) => {
  const navigate = useNavigate();
  const streak = getStreak(substance.slug);
  const accentColor = `hsl(var(${substance.accentVar}))`;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.05, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => navigate(`/${substance.slug}`)}
      className="group relative flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 text-left transition-all duration-300 hover:shadow-lg hover:border-border hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden"
    >
      {/* Subtle accent gradient overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300 rounded-2xl"
        style={{ background: `linear-gradient(135deg, ${accentColor}, transparent 70%)` }}
      />

      {/* Icon */}
      <div
        className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        {substance.icon}
      </div>

      {/* Text */}
      <div className="relative flex-1 min-w-0">
        <h3 className="font-display text-base text-foreground leading-tight">{substance.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{substance.descriptor}</p>
      </div>

      {/* Streak badge or arrow */}
      <div className="relative shrink-0">
        {streak.days > 0 ? (
          <div
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-white"
            style={{ backgroundColor: accentColor }}
          >
            🔥 {streak.days}d
          </div>
        ) : (
          <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
        )}
      </div>
    </motion.button>
  );
};

const Landing = () => {
  const totalDays = substances.reduce((acc, s) => acc + getStreak(s.slug).days, 0);
  const activeCount = substances.filter(s => getStreak(s.slug).days > 0).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 pb-12 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">100% Private · On-Device</span>
          </div>
          <h1 className="font-display text-4xl tracking-tight text-foreground">
            Quit<span className="text-primary">Mantra</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
            Track your recovery journey with clarity and compassion.
          </p>
        </motion.div>

        {/* Stats row */}
        {activeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-6 flex items-center justify-center gap-6 rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/5 via-primary/8 to-primary/5 px-6 py-4"
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{activeCount}</p>
              <p className="text-[11px] text-muted-foreground font-medium">Active</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{totalDays}</p>
              <p className="text-[11px] text-muted-foreground font-medium">Total Days</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center flex flex-col items-center">
              <Sparkles className="h-5 w-5 text-accent mb-0.5" />
              <p className="text-[11px] text-muted-foreground font-medium">Going Strong</p>
            </div>
          </motion.div>
        )}

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
          transition={{ delay: 0.8 }}
          className="mt-10 text-center"
        >
          <p className="text-xs text-muted-foreground/70">
            🔒 All data stays on your device. Nothing is ever shared.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
