// src/app/layout.tsx
import './globals.css';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast'; // ✅ 추가

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="ko">
      <body className="bg-gray-50">
        <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white shadow-2xl relative">
          <main className="flex-1 pb-24">
            {children}
          </main>
          {user && <Footer />}
        </div>
        {/* 토스트가 화면에 보일 수 있게 */}
        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}