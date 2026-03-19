// src/app/groups/new/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, Users, Target, Calendar } from 'lucide-react';
import { useCreateGroup } from '@/hooks/useCreateGroup'; // 훅 불러오기

export default function NewGroupPage() {
  const router = useRouter();
  const { groupName, setGroupName, goal, setGoal, isLoading, handleSubmit } = useCreateGroup();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="flex items-center p-4 border-b">
        <button onClick={() => router.back()} className="cursor-pointer p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg mr-8">새 그룹 만들기</h1>
      </header>

      <main className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Users size={18} /> 그룹 이름
            </label>
            <input
              type="text" required value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="예: 고딩 친구들"
              className="w-full p-3 border-b-2 border-gray-200 focus:border-blue-500 outline-none transition-colors text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Target size={18} /> 우리의 목표
            </label>
            <input
              type="text" required value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="예: 매일 영양제 먹기"
              className="w-full p-3 border-b-2 border-gray-200 focus:border-blue-500 outline-none transition-colors text-lg"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-sm text-blue-700">
            <Calendar size={20} className="shrink-0" />
            <p>그룹을 만들면 친구들을 초대할 수 있는 고유 링크가 생성됩니다.</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg cursor-pointer hover:bg-gray-800 disabled:bg-gray-400 transition-all shadow-lg"
          >
            {isLoading ? '생성 중...' : '그룹 만들기 완료'}
          </button>
        </form>
      </main>
    </div>
  );
}