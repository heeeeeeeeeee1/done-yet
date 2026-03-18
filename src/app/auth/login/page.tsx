import KakaoLogin from '@/components/LoginButton';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-md space-y-10 text-center">
        
        {/* 로고 또는 서비스 타이틀 */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-black">
            오늘했어?
          </h1>
          <p className="text-gray-500">
            거짓말 금지! 확실한 목표 달성 인증 서비스
          </p>
        </div>

        {/* 지켜보는 눈빛 아이콘 (심플 버전) */}
        <div className="flex justify-center py-4">
          <div className="text-6xl animate-bounce">🤔</div>
        </div>

        {/* 로그인 섹션 */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                SNS 계정으로 간편 시작
              </span>
            </div>
          </div>

          {/* 기존에 만드신 카카오 로그인 버튼 컴포넌트 */}
          <div className="flex justify-center">
            <KakaoLogin />
          </div>
        </div>

        {/* 하단 안내 */}
        <p className="text-xs text-gray-400">
          로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}