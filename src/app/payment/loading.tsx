import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Skeleton className="h-[500px] w-full max-w-sm" />
    </div>
  );
}
