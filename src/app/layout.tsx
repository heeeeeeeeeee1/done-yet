// src/app/layout.tsx
import './globals.css';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="ko">
      <body className="bg-gray-50"> {/* 전체 배경은 연한 회색으로 설정 */}
        {/* 모바일 뷰포트 제한 컨테이너 */}
        <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white shadow-2xl relative">
          <main className="flex-1 pb-24"> 
            {children}
          </main>

          {/* 로그인 시 하단 고정 푸터 */}
          {user && <Footer />}
        </div>
      </body>
    </html>
  );
}