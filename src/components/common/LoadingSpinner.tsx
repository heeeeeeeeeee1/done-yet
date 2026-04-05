// src/components/common/LoadingSpinner.tsx
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-sm font-bold text-gray-500 animate-pulse">
          로딩 중...
        </p>
      </div>
    </div>
  );
}