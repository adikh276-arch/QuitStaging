import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
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
  const [showCheckin, setShowCheckin] = useState(false);
  const entries = getEntries(substance.slug, tracker.id, range);
  const todayEntry = getEntry(substance.slug, tracker.id, todayStr());
  const accentColor = `hsl(var(${substance.accentVar}))`;

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
    const chartH = 200;
    switch (tracker.chartType) {
      case 'bar':
      case 'stacked-bar':
        return <ResponsiveContainer width="100%" height={chartH}><BarChart {...common}><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey={firstNumKey} fill={accentColor} radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>;
      case 'line':
        return <ResponsiveContainer width="100%" height={chartH}><LineChart {...common}><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Line type="monotone" dataKey={firstNumKey} stroke={accentColor} strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>;
      case 'area':
      default:
        return <ResponsiveContainer width="100%" height={chartH}><AreaChart {...common}><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Area type="monotone" dataKey={firstNumKey} stroke={accentColor} fill={`${accentColor}33`} strokeWidth={2} /></AreaChart></ResponsiveContainer>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="mx-auto max-w-lg px-4 pb-8">
        <div className="flex items-center justify-between py-4">
          <h2 className="font-display text-xl text-foreground">{tracker.name}</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>

        {/* Range tabs */}
        <div className="mb-4 flex gap-2">
          {([7, 30, 90] as const).map(r => (
            <button key={r} onClick={() => setRange(r)} className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${range === r ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {r === 90 ? 'All' : `${r}D`}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-border bg-card p-4">{renderChart()}</div>

        {/* Insight */}
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-foreground">💡 {tracker.insight}</p>
        </div>

        {/* History */}
        <h3 className="mb-2 mt-6 font-display text-base text-foreground">Recent Entries</h3>
        <div className="space-y-2">
          {entries.slice(-5).reverse().map(e => (
            <div key={e.date} className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs font-medium text-muted-foreground">{e.date}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {Object.entries(e.values).filter(([k]) => k !== 'notes').slice(0, 3).map(([k, v]) => (
                  <span key={k} className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
                    {k}: {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                  </span>
                ))}
              </div>
              {e.notes && <p className="mt-1 text-xs text-muted-foreground italic">{e.notes}</p>}
            </div>
          ))}
        </div>

        {/* Log button */}
        <button
          onClick={() => setShowCheckin(true)}
          className="mt-6 w-full rounded-xl py-3 text-center text-sm font-semibold text-primary-foreground transition-colors"
          style={{ backgroundColor: accentColor }}
        >
          {todayEntry ? '✏️ Edit Today\'s Entry' : '📝 Log Today'}
        </button>

        {/* Check-in Drawer */}
        <AnimatePresence>
          {showCheckin && (
            <CheckinDrawer tracker={tracker} substance={substance} onClose={() => setShowCheckin(false)} existing={todayEntry} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const CheckinDrawer = ({ tracker, substance, onClose, existing }: { tracker: TrackerConfig; substance: SubstanceConfig; onClose: () => void; existing: any }) => {
  const [values, setValues] = useState<Record<string, any>>(existing?.values || {});

  const handleSave = () => {
    saveEntry(substance.slug, tracker.id, todayStr(), { date: todayStr(), values, notes: values.notes || '' });
    onClose();
  };

  const updateField = (key: string, val: any) => setValues(prev => ({ ...prev, [key]: val }));

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-0 z-[60] flex flex-col">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="max-h-[85vh] overflow-y-auto rounded-t-2xl bg-card px-4 pb-8 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg">{existing ? 'Edit Entry' : 'Log Today'}</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>

        <div className="space-y-4">
          {tracker.fields.map(field => (
            <div key={field.key}>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{field.label}</label>
              {field.type === 'slider' && (
                <div>
                  <input type="range" min={field.min || 0} max={field.max || 10} step={field.step || 1} value={values[field.key] ?? field.min ?? 0} onChange={e => updateField(field.key, Number(e.target.value))} className="w-full accent-primary" />
                  <span className="text-xs text-muted-foreground">{values[field.key] ?? field.min ?? 0}</span>
                </div>
              )}
              {field.type === 'number' && (
                <input type="number" min={field.min} max={field.max} value={values[field.key] ?? ''} onChange={e => updateField(field.key, Number(e.target.value))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
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
                      }} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-foreground'}`}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
              {field.type === 'textarea' && (
                <textarea value={values[field.key] ?? ''} onChange={e => updateField(field.key, e.target.value)} placeholder={field.placeholder || 'Write here...'} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" rows={3} />
              )}
            </div>
          ))}
        </div>

        <button onClick={handleSave} className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground">
          Save Entry
        </button>
      </div>
    </motion.div>
  );
};

export default TrackerDetail;
