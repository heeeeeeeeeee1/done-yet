// 초대 코드를 입력해서 기존 그룹에 멤버로 들어가는 페이지
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/common/BackButton';

export default function JoinGroupPage() {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. 초대 코드로 그룹 찾기
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('invite_code', inviteCode.trim())
        .single();

      if (groupError || !group) throw new Error('유효하지 않은 초대 코드입니다.');

      // 2. 현재 로그인한 유저 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      // 3. group_members에 추가
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({ group_id: group.id, user_id: user.id, role: 'member' });

      if (joinError) {
        if (joinError.code === '23505') throw new Error('이미 가입된 그룹입니다.');
        throw joinError;
      }

      router.push(`/groups/${group.id}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <header className="flex items-center gap-2 mb-10">
        <BackButton />
        <h1 className="text-xl font-bold">그룹 참여하기</h1>
      </header>
      
      <form onSubmit={handleJoin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">초대 코드 입력</label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="예: CODE123"
            className="w-full p-4 border rounded-xl text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <button
          disabled={isLoading}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold disabled:bg-gray-400"
        >
          {isLoading ? '가입 중...' : '그룹 입장하기 🥊'}
        </button>
      </form>
    </div>
  );
}