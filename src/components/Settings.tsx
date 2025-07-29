'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export function Settings() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="font-headline text-3xl font-bold tracking-tight">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle>Focus Timer</CardTitle>
          <CardDescription>Customize your focus and break intervals.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label>Default Focus Timer Mode</Label>
            <RadioGroup defaultValue="25/5">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="25/5" id="r1" />
                <Label htmlFor="r1">25 min focus / 5 min break</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="50/10" id="r2" />
                <Label htmlFor="r2">50 min focus / 10 min break</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="r3" />
                <Label htmlFor="r3">Custom</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Preferences</CardTitle>
          <CardDescription>Adjust the behavior of the AI assistant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="gemini-voice">Gemini Voice Tone</Label>
            <Select defaultValue="friendly">
              <SelectTrigger id="gemini-voice">
                <SelectValue placeholder="Select a voice tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calm">Calm</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="mentor">Mentor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>Manage your data and notification settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="journal-retention">Journal Retention Policy</Label>
            <Select defaultValue="30">
              <SelectTrigger id="journal-retention">
                <SelectValue placeholder="Select retention period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="forever">Forever</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>Adjust the user interface to your preference.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
                <Label htmlFor="motion-toggle">UI Motion (Zen Mode)</Label>
                <p className="text-sm text-muted-foreground">Reduce animations and motion effects.</p>
            </div>
            <Switch id="motion-toggle" />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
          <Button>Save Preferences</Button>
      </div>
    </div>
  );
}
