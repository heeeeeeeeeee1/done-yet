// src/hooks/useGroupActions.ts
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export const useGroupActions = (group: any, currentUserId?: string) => {
  const router = useRouter();
  const supabase = createClient();

  const handleUpdateGroup = async () => {
    const newName = prompt("새로운 그룹 이름을 입력하세요", group.name);
    if (!newName || newName === group.name) return;
    const { error } = await supabase.from('groups').update({ name: newName }).eq('id', group.id);
    if (!error) router.refresh();
  };

  const handleDeleteGroup = async () => {
    if (!confirm("그룹을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from('groups').delete().eq('id', group.id);
    if (!error) router.push('/profile');
  };

  const handleLeaveGroup = async () => {
    if (!confirm("그룹에서 탈퇴하시겠습니까?")) return;
    const { error } = await supabase.from('group_members').delete().eq('group_id', group.id).eq('user_id', currentUserId);
    if (!error) router.push('/groups');
  };

  return { handleUpdateGroup, handleDeleteGroup, handleLeaveGroup };
};