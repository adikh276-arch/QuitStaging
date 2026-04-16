import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Check, Twitter, Facebook, MessageCircle, Link as LinkIcon, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DynamicIcon } from './DynamicIcon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activityName: string;
  activityType: string;
  substanceName: string;
  icon?: string;
}

export const ShareModal = ({ isOpen, onClose, activityName, activityType, substanceName, icon = 'Sparkles' }: Props) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  // Esc listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const url = "https://web.mantracare.com/quit";
  const shareText = `I have been doing the ${activityName} ${activityType} at QuitMantra. It really helped me with dealing with my ${substanceName} addiction. You should try it too! 🌟`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QuitMantra ${activityType}`,
          text: shareText,
          url: url,
        });
      } catch (err) {
        console.error('Native share failed', err);
      }
    } else {
      handleCopy();
    }
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] text-white hover:bg-[#20bd5a]',
      href: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + url)}`
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2] text-white hover:bg-[#166fe5]',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm rounded-[32px] bg-card p-6 shadow-2xl border border-border/50 text-center my-auto"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors z-20"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-2 relative">
             <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
             <div className="relative mx-auto mt-2 flex h-24 w-24 items-center justify-center rounded-[24px] bg-gradient-to-br from-primary to-accent shadow-xl rotate-3">
               <div className="absolute inset-0 bg-white/20 rounded-[24px] backdrop-blur-md" />
               <DynamicIcon name={icon} className="h-12 w-12 text-white relative z-10 drop-shadow-md" />
             </div>
          </div>

          <h3 className="mt-6 font-display text-2xl font-bold text-foreground">Share the Journey</h3>
          <p className="mt-2 text-sm text-muted-foreground px-4">
            Inspire others by sharing your progress with the <strong>{activityName}</strong>.
          </p>

          <div className="mt-5 rounded-2xl bg-muted/50 p-4 border border-border/50 text-left relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-2xl" />
            <p className="text-sm font-medium leading-relaxed text-foreground italic">"{shareText}"</p>
            <p className="mt-2 text-xs font-semibold text-primary">{url}</p>
          </div>

          <div className="mt-8 space-y-3">
            {typeof navigator !== 'undefined' && navigator.share && (
               <button
                 onClick={handleNativeShare}
                 className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
               >
                 <Share2 className="h-4 w-4" /> Share to App
               </button>
            )}

            <div className="grid grid-cols-2 gap-3">
               {socialLinks.map(link => (
                 <a
                   key={link.name}
                   href={link.href}
                   target="_blank"
                   rel="noopener noreferrer"
                   className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold shadow-sm transition-all active:scale-[0.98] ${link.color}`}
                 >
                   <link.icon className="h-4 w-4" /> {link.name.split(' ')[0]}
                 </a>
               ))}
               <button
                 onClick={handleCopy}
                 className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold shadow-sm transition-all active:scale-[0.98] ${
                   copied ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-foreground hover:bg-muted/80'
                 }`}
               >
                 {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                 {copied ? 'Copied!' : 'Copy Link'}
               </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
