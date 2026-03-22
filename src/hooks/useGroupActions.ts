// 그룹 수정/삭제/탈퇴 로직
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export const useGroupActions = (group: any, currentUserId?: string) => {
  const router = useRouter();
  const supabase = createClient();

  const handleUpdateGroup = async () => {
    const newName = prompt("새로운 그룹 이름을 입력하세요", group.name);
    if (!newName || newName === group.name) return;
    const { error } = await supabase.from('groups').update({ name: newName }).eq('id', group.id);
    if (!error) { alert("변경되었습니다."); router.refresh(); }
  };

  const handleDeleteGroup = async () => {
    if (!confirm("그룹을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from('groups').delete().eq('id', group.id);
    if (!error) { alert("삭제되었습니다."); router.push('/profile'); }
  };

  const handleLeaveGroup = async () => {
    if (!confirm("그룹에서 탈퇴하시겠습니까?")) return;
    const { error } = await supabase.from('group_members').delete().eq('group_id', group.id).eq('user_id', currentUserId);
    if (!error) { alert("탈퇴되었습니다."); router.push('/groups'); }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm("이 목표를 삭제하시겠습니까?")) return;
    const { error } = await supabase.from('challenges').delete().eq('id', challengeId);
    if (!error) router.refresh();
    else alert(`삭제실패: ${error.message}`);
  };

  return { handleUpdateGroup, handleDeleteGroup, handleLeaveGroup, handleDeleteChallenge };
};