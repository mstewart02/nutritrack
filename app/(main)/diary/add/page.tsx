import { addLogEntry } from '@/lib/actions/diary';
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

const MEAL_OPTIONS = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

export default async function AddLogEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ meal?: string }>;
}) {
  const { meal } = await searchParams;
  const defaultMeal = meal && MEAL_OPTIONS.some((m) => m.value === meal) ? meal : 'breakfast';

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Food</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addLogEntry} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Meal</Label>
              <Select name="meal" defaultValue={defaultMeal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="foodName">Food name</Label>
              <Input id="foodName" name="foodName" required placeholder="e.g. Grilled chicken breast" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" name="quantity" type="number" step="any" defaultValue={1} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" name="unit" defaultValue="serving" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="calories">Calories</Label>
              <Input id="calories" name="calories" type="number" required min={0} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="proteinG">Protein (g)</Label>
                <Input id="proteinG" name="proteinG" type="number" step="any" defaultValue={0} min={0} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="carbsG">Carbs (g)</Label>
                <Input id="carbsG" name="carbsG" type="number" step="any" defaultValue={0} min={0} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fatG">Fat (g)</Label>
                <Input id="fatG" name="fatG" type="number" step="any" defaultValue={0} min={0} />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Save Entry
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}