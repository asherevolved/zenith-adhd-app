'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Waves, CloudRain, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const modes = {
  '25/5': { focus: 25 * 60, break: 5 * 60 },
  '50/10': { focus: 50 * 60, break: 10 * 60 },
  'Custom': { focus: 1 * 60, break: 30 }, // for demo
};
type Mode = keyof typeof modes;

export function FocusTimer() {
  const [mode, setMode] = React.useState<Mode>('25/5');
  const [isBreak, setIsBreak] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(modes[mode].focus);
  const [isActive, setIsActive] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setTimeLeft(isBreak ? modes[mode].break : modes[mode].focus);
  }, [mode, isBreak]);

  React.useEffect(() => {
    if (!isActive) return;

    if (timeLeft === 0) {
      toast({
        title: isBreak ? 'Break over!' : 'Focus session complete!',
        description: isBreak ? 'Time to get back to it.' : 'Time for a short break.',
      });
      setIsBreak(!isBreak);
      // Play chime sound here
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isActive, timeLeft, isBreak, toast]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(modes[mode].focus);
  };
  
  const totalDuration = isBreak ? modes[mode].break : modes[mode].focus;
  const progress = (timeLeft / totalDuration) * 100;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8">
      <div className="flex gap-2 rounded-full bg-card p-1">
        {(Object.keys(modes) as Mode[]).map(m => (
          <Button
            key={m}
            variant={mode === m ? 'default' : 'ghost'}
            className="rounded-full"
            onClick={() => { setMode(m); setIsActive(false); setIsBreak(false); }}
          >
            {m}
          </Button>
        ))}
      </div>
      
      <div className="relative size-64 md:size-80">
        <svg className="size-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="hsl(var(--card))"
            strokeWidth="12"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="12"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - progress}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.span 
                    key={timeLeft}
                    initial={{ opacity: 0.5, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0.5, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="font-mono text-5xl font-bold tracking-tighter md:text-7xl"
                >
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </motion.span>
            </AnimatePresence>
          <p className="mt-2 text-lg text-muted-foreground">{isBreak ? 'Break' : 'Focus'}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="size-16 rounded-full" onClick={resetTimer}>
          <RotateCcw />
        </Button>
        <Button size="icon" className="size-20 rounded-full" onClick={toggleTimer}>
          {isActive ? <Pause className="size-8" /> : <Play className="size-8" />}
        </Button>
        <div className="flex flex-col gap-2">
            <Button variant="ghost" size="icon"><Music /></Button>
            <Button variant="ghost" size="icon"><CloudRain /></Button>
            <Button variant="ghost" size="icon"><Waves /></Button>
        </div>
      </div>
    </div>
  );
}
