// src/components/common/BackButton.tsx
'use client'; // 클라이언트 컴포넌트 설정

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    // 브라우저의 뒤로가기 기능을 수행합니다.
    router.back();
  };

  return (
    <button 
      onClick={handleBack}
      className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
      aria-label="뒤로가기"
    >
      {/* 간단한 '<' 모양 아이콘 (SVG) */}
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-gray-600"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}