// src/components/Footer.tsx
'use client';

import { Home, PlusSquare, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LogoutButton } from './LogoutButton';

export default function Footer() {
  const router = useRouter();

  return (
    /* fixed로 고정하되, 너비를 max-w-md로 제한하고 bottom-0으로 최하단 밀착 */
    <footer className="fixed bottom-0 w-full max-w-md border-t bg-white p-2 pb-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
      <nav className="flex justify-around items-center">
        <button 
          onClick={() => router.push('/')}
          className="cursor-pointer flex flex-col items-center p-2 text-gray-500 hover:text-black transition-colors"
        >
          <Home size={24} />
          <span className="text-[10px] mt-1">홈</span>
        </button>

        <button 
          onClick={() => router.push('/groups/new')}
          className="cursor-pointer flex flex-col items-center p-2 text-gray-500 hover:text-black transition-colors"
        >
          <PlusSquare size={28} />
          <span className="text-[10px] mt-1 font-bold">그룹 생성</span>
        </button>

        <button 
          onClick={() => router.push('/profile')}
          className="cursor-pointer flex flex-col items-center p-2 text-gray-500 hover:text-black transition-colors"
        >
          <User size={24} />
          <span className="text-[10px] mt-1">마이</span>
        </button>

        <LogoutButton />
      </nav>
    </footer>
  );
}