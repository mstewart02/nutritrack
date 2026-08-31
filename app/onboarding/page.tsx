'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { calculateTDEE, calculateMacros, type UserStats } from '@/lib/tdee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    gender: 'male',
    age: 25,
    weightKg: 70,
    heightCm: 175,
    activityLevel: 'moderate',
    goal: 'maintain',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const tdee = calculateTDEE(stats);
    const macros = calculateMacros(tdee);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      gender: stats.gender,
      age: stats.age,
      weight_kg: stats.weightKg,
      height_cm: stats.heightCm,
      activity_level: stats.activityLevel,
      goal: stats.goal,
      tdee,
      target_protein_g: macros.proteinG,
      target_carbs_g: macros.carbsG,
      target_fat_g: macros.fatG,
    });

    if (error) {
      alert(`Error saving profile: ${error.message}`);
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Set Up Your Target</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select
                value={stats.gender}
                onValueChange={(val) => setStats({ ...stats, gender: val as UserStats['gender'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={stats.age}
                  onChange={(e) => setStats({ ...stats, age: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="any"
                  value={stats.weightKg}
                  onChange={(e) => setStats({ ...stats, weightKg: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={stats.heightCm}
                  onChange={(e) => setStats({ ...stats, heightCm: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Activity Level</Label>
              <Select
                value={stats.activityLevel}
                onValueChange={(val) =>
                  setStats({ ...stats, activityLevel: val as UserStats['activityLevel'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (Little/no exercise)</SelectItem>
                  <SelectItem value="light">Lightly Active (1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderately Active (3-5 days/week)</SelectItem>
                  <SelectItem value="active">Very Active (6-7 days/week)</SelectItem>
                  <SelectItem value="very_active">Extra Active (Hard exercise/job)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Goal</Label>
              <Select
                value={stats.goal}
                onValueChange={(val) => setStats({ ...stats, goal: val as UserStats['goal'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose">Weight Loss (-500 kcal)</SelectItem>
                  <SelectItem value="maintain">Maintenance</SelectItem>
                  <SelectItem value="gain">Muscle Gain (+500 kcal)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Calculating...' : 'Calculate & Save Goal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}