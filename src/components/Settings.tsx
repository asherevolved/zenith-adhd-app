
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import type { UserSettings } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
  },
};


export function Settings() {
  const { settings, updateSettings, isLoadingSettings } = useAppContext();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = React.useState<UserSettings | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!localSettings) return;
    setIsSaving(true);
    await updateSettings(localSettings);
    setIsSaving(false);
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated.',
    });
  };

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    if (localSettings) {
      setLocalSettings({ ...localSettings, [key]: value });
    }
  };
  
  if (isLoadingSettings || !localSettings) {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="font-headline text-3xl font-bold tracking-tight">Settings</h2>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48 mt-1" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48 mt-1" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <motion.div 
      className="max-w-2xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2 
        className="font-headline text-3xl font-bold tracking-tight"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Settings
      </motion.h2>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Focus Timer</CardTitle>
            <CardDescription>Customize your focus and break intervals.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label>Default Focus Timer Mode</Label>
              <RadioGroup 
                  value={localSettings.default_timer_mode}
                  onValueChange={(value) => handleSettingChange('default_timer_mode', value)}
                  disabled={isSaving}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="25/5" id="r1" />
                  <Label htmlFor="r1">25 min focus / 5 min break</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="50/10" id="r2" />
                  <Label htmlFor="r2">50 min focus / 10 min break</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Custom" id="r3" />
                  <Label htmlFor="r3">Custom</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>AI Preferences</CardTitle>
            <CardDescription>Adjust the behavior of the AI assistant.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="gemini-voice">Gemini Voice Tone</Label>
              <Select 
                  value={localSettings.gemini_voice}
                  onValueChange={(value) => handleSettingChange('gemini_voice', value)}
                  disabled={isSaving}
              >
                <SelectTrigger id="gemini-voice">
                  <SelectValue placeholder="Select a voice tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Calm">Calm</SelectItem>
                  <SelectItem value="Friendly">Friendly</SelectItem>
                  <SelectItem value="Mentor">Mentor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>Manage your data and notification settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="journal-retention">Journal Retention Policy</Label>
              <Select 
                  value={localSettings.journal_retention}
                  onValueChange={(value) => handleSettingChange('journal_retention', value)}
                  disabled={isSaving}
              >
                <SelectTrigger id="journal-retention">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="Forever">Forever</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Accessibility</CardTitle>
            <CardDescription>Adjust the user interface to your preference.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                  <Label htmlFor="motion-toggle">UI Motion</Label>
                  <p className="text-sm text-muted-foreground">Reduce animations and motion effects.</p>
              </div>
              <Switch 
                  id="motion-toggle" 
                  checked={localSettings.enable_motion}
                  onCheckedChange={(checked) => handleSettingChange('enable_motion', checked)}
                  disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div className="flex justify-end" variants={itemVariants}>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
      </motion.div>
    </motion.div>
  );
}
