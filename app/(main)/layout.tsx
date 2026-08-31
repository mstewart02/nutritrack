import { BottomNav } from '@/components/nav/BottomNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh pb-20">
      {children}
      <BottomNav />
    </div>
  );
}