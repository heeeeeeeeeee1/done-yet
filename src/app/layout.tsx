// src/app/layout.tsx
import './globals.css';
import Footer from '@/components/Footer';
import GlobalNotification from '@/components/common/GlobalNotification';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: '오늘했어? | 나만의 도전 관리',
  description: '매일의 도전을 기록하고 성장을 눈으로 확인하세요.',
  openGraph: {
    title: '오늘했어? - 오늘의 도전을 완료하셨나요?',
    description: '챌린지 달력으로 나의 성실도를 체크해보세요!',
    url: 'https://done-yet.vercel.app',
    siteName: 'Done Yet',
    images: [
      {
        url: 'https://done-yet.vercel.app/logo.png',
        width: 1200,
        height: 630,
        alt: 'Done Yet 서비스 썸네일',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {/* 로그인 상태일 때만 전역 알림 리스너 활성화 */}
        {user && <GlobalNotification />}

        <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white shadow-2xl relative">
          <main className="flex-1 pb-24">
            {children}
          </main>

          {user && <Footer />}
        </div>

        {/* 토스트 컨테이너 */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            // 전역 토스트 기본 스타일 설정
            className: 'font-bold text-sm',
          }}
        />
      </body>
    </html>
  );
}