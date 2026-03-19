// src/hooks/useCreateGroup.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function useCreateGroup() {
  const router = useRouter();
  const supabase = createClient();
  const [groupName, setGroupName] = useState('');
  const [goal, setGoal] = useState('');
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

      const { data, error } = await supabase
        .from('groups')
        .insert([
          { 
            name: groupName, 
            goal: goal, 
            owner_id: user.id,
            invite_code: Math.random().toString(36).substring(2, 8).toUpperCase()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      alert('그룹이 성공적으로 생성되었습니다! 🎉');
      router.push(`/groups/${data.id}`); 
      
    } catch (error: any) {
      console.error('Error:', error.message);
      alert('그룹 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    groupName,
    setGroupName,
    goal,
    setGoal,
    isLoading,
    handleSubmit
  };
}