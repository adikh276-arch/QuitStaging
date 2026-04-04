import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, History } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrackerConfig, SubstanceConfig } from '@/data/types';
import { getEntries, saveEntry, todayStr, getEntry } from '@/data/storage';

interface Props {
  tracker: TrackerConfig;
  substance: SubstanceConfig;
  onClose: () => void;
}

const TrackerDetail = ({ tracker, substance, onClose }: Props) => {
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const [showHistory, setShowHistory] = useState(false);
  const todayEntry = getEntry(substance.slug, tracker.id, todayStr());
  const accentColor = `hsl(var(${substance.accentVar}))`;

  // Check-in state
  const [values, setValues] = useState<Record<string, any>>(todayEntry?.values || {});
  const updateField = (key: string, val: any) => setValues(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    saveEntry(substance.slug, tracker.id, todayStr(), { date: todayStr(), values, notes: values.notes || '' });
    onClose();
  };

  // Chart data
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
    const chartH = 160;
    switch (tracker.chartType) {
      case 'bar':
      case 'stacked-bar':
        return <ResponsiveContainer width="100%" height={chartH}><BarChart {...common}><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} width={30} /><Tooltip /><Bar dataKey={firstNumKey} fill={accentColor} radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>;
      case 'line':
        return <ResponsiveContainer width="100%" height={chartH}><LineChart {...common}><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} width={30} /><Tooltip /><Line type="monotone" dataKey={firstNumKey} stroke={accentColor} strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>;
      case 'area':
      default:
        return <ResponsiveContainer width="100%" height={chartH}><AreaChart {...common}><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} width={30} /><Tooltip /><Area type="monotone" dataKey={firstNumKey} stroke={accentColor} fill={`${accentColor}33`} strokeWidth={2} /></AreaChart></ResponsiveContainer>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="mx-auto max-w-lg px-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between py-4 sticky top-0 bg-background z-10">
          <h2 className="font-display text-xl text-foreground">{tracker.name}</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted transition-colors"><X className="h-5 w-5" /></button>
        </div>

        {/* PRIMARY: Log / Check-in Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 p-5 mb-6"
          style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}05` }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base text-foreground">
              {todayEntry ? '✏️ Edit Today\'s Entry' : '📝 Log Today'}
            </h3>
            <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-1">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>

          <div className="space-y-4">
            {tracker.fields.map(field => (
              <div key={field.key}>
                <label className="mb-2 block text-xs font-semibold text-foreground">{field.label}</label>
                {field.type === 'slider' && (
                  <div className="space-y-1">
                    <input type="range" min={field.min || 0} max={field.max || 10} step={field.step || 1} value={values[field.key] ?? field.min ?? 0} onChange={e => updateField(field.key, Number(e.target.value))} className="w-full accent-primary" />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{field.min || 0}</span>
                      <span className="text-sm font-bold text-foreground">{values[field.key] ?? field.min ?? 0}</span>
                      <span>{field.max || 10}</span>
                    </div>
                  </div>
                )}
                {field.type === 'number' && (
                  <input type="number" min={field.min} max={field.max} value={values[field.key] ?? ''} onChange={e => updateField(field.key, Number(e.target.value))} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                )}
                {(field.type === 'chips' || field.type === 'single-select' || field.type === 'icon-picker') && field.options && (
                  <div className="flex flex-wrap gap-2">
                    {field.options.map(opt => {
                      const isSelected = field.multiSelect
                        ? (Array.isArray(values[field.key]) && values[field.key].includes(opt))
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
                        }} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${isSelected ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-border bg-card text-foreground hover:border-primary/40'}`}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}
                {field.type === 'textarea' && (
                  <textarea value={values[field.key] ?? ''} onChange={e => updateField(field.key, e.target.value)} placeholder={field.placeholder || 'Write here...'} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none" rows={3} />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="mt-5 w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-lg"
            style={{ backgroundColor: accentColor }}
          >
            {todayEntry ? 'Update Entry' : 'Save Entry'}
          </button>
        </motion.div>

        {/* Insight */}
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 mb-6">
          <p className="text-sm text-foreground">💡 {tracker.insight}</p>
        </div>

        {/* SECONDARY: Chart + History (collapsible) */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">History & Trends</span>
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
                <div className="px-4 pb-4">
                  {/* Range tabs */}
                  <div className="mb-4 flex gap-2">
                    {([7, 30, 90] as const).map(r => (
                      <button key={r} onClick={() => setRange(r)} className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${range === r ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                        {r === 90 ? 'All' : `${r}D`}
                      </button>
                    ))}
                  </div>

                  {/* Chart */}
                  <div className="rounded-xl bg-muted/30 p-3">
                    {renderChart()}
                  </div>

                  {/* Recent entries */}
                  <h4 className="mt-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Entries</h4>
                  <div className="space-y-2">
                    {entries.slice(-5).reverse().map(e => (
                      <div key={e.date} className="rounded-xl bg-muted/30 p-3">
                        <p className="text-xs font-medium text-muted-foreground">{e.date}</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {Object.entries(e.values).filter(([k]) => k !== 'notes').slice(0, 3).map(([k, v]) => (
                            <span key={k} className="rounded-full bg-background px-2 py-0.5 text-[11px] text-foreground border border-border/50">
                              {k}: {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                            </span>
                          ))}
                        </div>
                        {e.notes && <p className="mt-1 text-xs text-muted-foreground italic">{e.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default TrackerDetail;
