// src/hooks/useCreateGroup.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function useCreateGroup() {
  const router = useRouter();
  const supabase = createClient();
  const [groupName, setGroupName] = useState('');
  const [goal, setGoal] = useState(''); // challenges 테이블의 title로 활용 가능
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

      // 3. (선택사항) 입력한 '목표'를 challenges 테이블에 첫 번째 챌린지로 등록
      // 이 단계는 나중에 챌린지 관리 기능을 만들 때 분리해도 됩니다.
      const { error: challengeError } = await supabase
        .from('challenges')
        .insert([
          {
            group_id: groupData.id,
            title: goal,
            weekly_target: 7, // 기본값 예시
            start_date: new Date().toISOString().split('T')[0]
          }
        ]);

      if (challengeError) throw challengeError;

      alert('그룹과 첫 챌린지가 생성되었습니다! 🎉');
      router.push(`/groups/${groupData.id}`); 
      
    } catch (error: any) {
      console.error('Error:', error.message);
      alert('생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return { groupName, setGroupName, goal, setGoal, isLoading, handleSubmit };
}