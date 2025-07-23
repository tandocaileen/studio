import { Loader2 } from 'lucide-react';

export function AppLoader() {
  return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
