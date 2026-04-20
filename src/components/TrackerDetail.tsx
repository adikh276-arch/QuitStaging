import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, History, Save, CheckCircle2, Lightbulb } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrackerConfig, SubstanceConfig } from '@/data/types';
import { getEntries, saveEntry, todayStr, getEntry } from '@/data/storage';
import { useTranslation } from 'react-i18next';

interface Props {
  tracker: TrackerConfig;
  substance: SubstanceConfig;
  onClose: () => void;
}

const sparkColors: Record<string, string> = {
  alcohol: '#ef4444', tobacco: '#d97706', opioids: '#8b5cf6', cannabis: '#10b981',
  stimulants: '#eab308', benzodiazepines: '#3b82f6', kratom: '#14b8a6', mdma: '#ec4899',
};

const TrackerDetail = ({ tracker, substance, onClose }: Props) => {
  const { t } = useTranslation();
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const [showHistory, setShowHistory] = useState(false);
  const [saved, setSaved] = useState(false);
  const todayEntry = getEntry(substance.slug, tracker.id, todayStr());
  const accentColor = sparkColors[substance.slug] || '#10b981';

  const [values, setValues] = useState<Record<string, any>>(todayEntry?.values || {});
  const updateField = (key: string, val: any) => setValues(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    saveEntry(substance.slug, tracker.id, todayStr(), { date: todayStr(), values, notes: values.notes || '' });
    setSaved(true);
    setTimeout(() => onClose(), 800);
  };

  const entries = getEntries(substance.slug, tracker.id, range);
  const chartData = entries.map(e => {
    const numericKeys = Object.keys(e.values).filter(k => typeof e.values[k] === 'number');
    const obj: any = { date: e.date.slice(5) };
    numericKeys.forEach(k => { obj[k] = e.values[k]; });
    if (numericKeys.length === 0) obj.value = 0;
    return obj;
  });
  const firstNumKey = chartData.length > 0 ? Object.keys(chartData[0]).find(k => k !== 'date') || 'value' : 'value';

  const renderChart = () => {
    const common = { data: chartData };
    const chartH = 180;
    switch (tracker.chartType) {
      case 'bar':
      case 'stacked-bar':
        return <ResponsiveContainer width="100%" height={chartH}><BarChart {...common}><XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={30} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} /><Bar dataKey={firstNumKey} fill={accentColor} radius={[6,6,0,0]} /></BarChart></ResponsiveContainer>;
      case 'line':
        return <ResponsiveContainer width="100%" height={chartH}><LineChart {...common}><XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={30} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} /><Line type="monotone" dataKey={firstNumKey} stroke={accentColor} strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer>;
      case 'area':
      default:
        return <ResponsiveContainer width="100%" height={chartH}><AreaChart {...common}><XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={30} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} /><Area type="monotone" dataKey={firstNumKey} stroke={accentColor} fill={`${accentColor}20`} strokeWidth={2.5} /></AreaChart></ResponsiveContainer>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="mx-auto max-w-lg px-5 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between py-5 sticky top-0 bg-background/90 backdrop-blur-md z-10 border-b border-border/40">
          <div>
            <h2 className="font-display text-xl text-foreground">{t(`quit.substances.${substance.slug}.trackers.${tracker.id}.name`)}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{t(`quit.substances.${substance.slug}.name`)}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="rounded-xl p-2 hover:bg-muted transition-colors">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Log Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 rounded-3xl border-2 border-border/60 bg-card p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
              <h3 className="font-display text-lg text-foreground">
                {todayEntry ? t('quit.app.edit_today') : t('quit.app.log_today')}
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground bg-muted rounded-lg px-3 py-1.5">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>

          <div className="space-y-5">
            {tracker.fields.map(field => {
              if (field.showIf) {
                const depValue = values[field.showIf.field];
                const targetValue = field.showIf.value;
                const op = field.showIf.op || '===';
                
                let matches = false;
                if (op === '===') matches = depValue === targetValue;
                else if (op === '!==') matches = depValue !== targetValue;
                else if (op === '>') matches = depValue > targetValue;
                else if (op === '<') matches = depValue < targetValue;
                
                if (!matches) return null;
              }
              return (
                <div key={field.key}>
                  <label className="mb-2.5 block text-xs font-bold text-foreground uppercase tracking-wider">{t(`quit.substances.${substance.slug}.trackers.${tracker.id}.fields.${field.key}.label`)}</label>
                  {field.type === 'slider' && (
                    <div className="space-y-2">
                      <input type="range" min={field.min || 0} max={field.max || 10} step={field.step || 1} value={values[field.key] ?? field.min ?? 0} onChange={e => updateField(field.key, Number(e.target.value))} className="w-full h-6 bg-transparent" style={{ '--slider-accent': accentColor } as any} />
                      <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                        <span>{field.min || 0}</span>
                        <span className="text-lg font-bold text-foreground -mt-1">{values[field.key] ?? field.min ?? 0}</span>
                        <span>{field.max || 10}</span>
                      </div>
                    </div>
                  )}
                  {field.type === 'number' && (
                    <input type="number" min={field.min} max={field.max} value={values[field.key] ?? ''} onChange={e => updateField(field.key, Number(e.target.value))} className="w-full rounded-xl border-2 border-border/60 bg-background px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all" />
                  )}
                  {(field.type === 'chips' || field.type === 'single-select' || field.type === 'icon-picker') && field.options && (
                    <div className="flex flex-wrap gap-2">
                      {field.options.map(opt => {
                        const isSelected = field.multiSelect
                          ? Array.isArray(values[field.key]) && values[field.key].includes(opt)
                          : values[field.key] === opt;
                        return (
                          <button key={opt} onClick={() => {
                            if (field.multiSelect) {
                              const arr = Array.isArray(values[field.key]) ? [...values[field.key]] : [];
                              if (arr.includes(opt)) arr.splice(arr.indexOf(opt), 1); else arr.push(opt);
                              updateField(field.key, arr);
                            } else {
                              updateField(field.key, opt);
                            }
                          }} className={`rounded-xl border-2 px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                              : 'border-border/60 bg-card text-foreground hover:border-primary/30 hover:bg-primary/5'
                          }`}>
                            {t(`quit.substances.${substance.slug}.trackers.${tracker.id}.fields.${field.key}.options.${field.options.indexOf(opt)}`)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {field.type === 'textarea' && (
                    <textarea value={values[field.key] ?? ''} onChange={e => updateField(field.key, e.target.value)} placeholder={t('quit.app.placeholder_notes')} className="w-full rounded-xl border-2 border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all resize-none" rows={3} />
                  )}
                </div>
              );
            })}
          </div>

          <motion.button
            onClick={handleSave}
            disabled={saved}
            whileTap={{ scale: 0.97 }}
            className={`mt-6 w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white transition-all shadow-xl ${
              saved ? 'bg-primary' : 'hover:opacity-90 hover:shadow-2xl'
            }`}
            style={!saved ? { backgroundColor: accentColor, boxShadow: `0 8px 32px ${accentColor}40` } : {}}
          >
            {saved ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                {t('quit.app.saved')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {todayEntry ? t('quit.app.update_entry') : t('quit.app.save_entry')}
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Insight */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5 rounded-2xl bg-primary/5 border border-primary/15 p-4"
        >
          <div className="flex items-start gap-2.5">
            <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">{t(`quit.substances.${substance.slug}.trackers.${tracker.id}.insight`)}</p>
          </div>
        </motion.div>

        {/* History */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-5 rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm"
        >
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-bold text-foreground">{t('quit.app.history_trends')}</span>
            </div>
            {showHistory ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5">
                  <div className="mb-4 flex gap-2">
                    {([7, 30, 90] as const).map(r => (
                      <button key={r} onClick={() => setRange(r)} className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${range === r ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                        {r === 90 ? 'All' : `${r}D`}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-muted/30 p-4">
                    {renderChart()}
                  </div>

                    <h4 className="mt-5 mb-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('quit.app.recent_entries')}</h4>
                  <div className="space-y-2.5">
                    {entries.slice(-5).reverse().map(e => (
                      <div key={e.date} className="rounded-xl bg-muted/30 p-3.5 border border-border/30">
                        <p className="text-xs font-semibold text-muted-foreground">{e.date}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {Object.entries(e.values).filter(([k]) => k !== 'notes').slice(0, 3).map(([k, v]) => (
                            <span key={k} className="rounded-lg bg-background px-2.5 py-1 text-[11px] font-medium text-foreground border border-border/40">
                              {k}: {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                            </span>
                          ))}
                        </div>
                        {e.notes && <p className="mt-1.5 text-xs text-muted-foreground italic">{e.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TrackerDetail;
