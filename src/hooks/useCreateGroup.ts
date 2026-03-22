// src/hooks/useCreateGroup.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function useCreateGroup() {
  const router = useRouter();
  const supabase = createClient();
  const [groupName, setGroupName] = useState('');
  const [goal, setGoal] = useState(''); // 입력받은 목표 제목
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('로그인이 필요합니다!');
        return;
      }

      // 1. groups 테이블에 그룹 생성
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert([
          { 
            name: groupName, 
            owner_id: user.id,
            invite_code: Math.random().toString(36).substring(2, 8).toUpperCase()
          }
        ])
        .select()
        .single();

      if (groupError) throw groupError;

      // 2. group_members 테이블에 생성자를 'leader'로 추가
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([
          {
            group_id: groupData.id,
            user_id: user.id,
            role: 'leader'
          }
        ]);

      if (memberError) throw memberError;

      // ✅ 핵심 수정: 여기서 7회로 자동 저장하던 로직을 완전히 제거했습니다.
      // 대신 사용자를 '주간 목표 설정(슬라이더)' 페이지로 보냅니다.
      
      alert('그룹이 생성되었습니다! 이제 목표 횟수를 정해볼까요? 🥊');
      
      // ✅ goal(제목)을 쿼리 스트링으로 들고 이동합니다.
      router.push(`/groups/${groupData.id}/challenges/new?title=${encodeURIComponent(goal)}`); 
      
    } catch (error: any) {
      console.error('Error:', error.message);
      alert('그룹 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return { groupName, setGroupName, goal, setGoal, isLoading, handleSubmit };
}