import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDailyLogsGrouped, MEAL_ORDER } from '@/lib/queries/diary';
import { deleteLogEntry } from '@/lib/actions/diary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

const MEAL_LABELS: Record<(typeof MEAL_ORDER)[number], string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

export default async function DiaryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const today = new Date().toISOString().split('T')[0];
  const { grouped, totals } = await getDailyLogsGrouped(user.id, today);

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Today's total</p>
        <p className="text-2xl font-bold">{Math.round(totals.calories)} kcal</p>
      </div>

      {MEAL_ORDER.map((meal) => (
        <Card key={meal}>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-base">{MEAL_LABELS[meal]}</CardTitle>
            <Link href={`/diary/add?meal=${meal}`}>
              <Button size="sm" variant="ghost" className="h-8 gap-1 px-2">
                <Plus size={16} /> Add
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {grouped[meal].length === 0 ? (
              <p className="text-sm text-muted-foreground">No entries yet</p>
            ) : (
              grouped[meal].map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{log.food_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.quantity} {log.unit} · {log.calories} kcal
                    </p>
                  </div>
                  <form action={deleteLogEntry.bind(null, log.id)}>
                    <Button size="icon" variant="ghost" className="h-7 w-7" type="submit">
                      <X size={14} />
                    </Button>
                  </form>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}