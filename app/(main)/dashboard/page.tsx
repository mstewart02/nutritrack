import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDailyLogsGrouped } from '@/lib/queries/diary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.tdee == null) redirect('/onboarding');

  const today = new Date().toISOString().split('T')[0];
  const { totals } = await getDailyLogsGrouped(user.id, today);

  const rows = [
    { label: 'Calories', consumed: totals.calories, target: profile.tdee, unit: 'kcal' },
    { label: 'Protein', consumed: totals.protein, target: profile.target_protein_g, unit: 'g' },
    { label: 'Carbs', consumed: totals.carbs, target: profile.target_carbs_g, unit: 'g' },
    { label: 'Fat', consumed: totals.fat, target: profile.target_fat_g, unit: 'g' },
  ];

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {rows.map((row) => {
            const target = row.target || 1;
            return (
              <div key={row.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span>{row.label}</span>
                  <span className="text-muted-foreground">
                    {Math.round(row.consumed)} / {row.target ?? 0} {row.unit}
                  </span>
                </div>
                <Progress value={Math.min((row.consumed / target) * 100, 100)} />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}