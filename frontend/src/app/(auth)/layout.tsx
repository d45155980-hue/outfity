import { Suspense } from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-12">
      <Suspense fallback={<div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />}>
        {children}
      </Suspense>
    </div>
  );
}
