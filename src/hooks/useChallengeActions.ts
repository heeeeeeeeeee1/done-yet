// src/hooks/useChallengeActions.ts
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

export const useChallengeActions = (nickname: string) => { // 닉네임 주입
  const router = useRouter();
  const supabase = createClient();

  const handleUpdateChallenge = async (challenge: any, groupId: string) => {
    const newTitle = prompt("수정할 도전 제목", challenge.title);
    if (!newTitle) return;

    const { error } = await supabase
      .from('challenges')
      .update({ title: newTitle })
      .eq('id', challenge.id);

    if (!error) {
      // 수정 성공 후 브로드캐스트 전송
      await supabase.channel(`group-changes-${groupId}`).send({
        type: 'broadcast',
        event: 'challenge_event',
        payload: { nickname, action: '수정', title: newTitle },
      });
      router.refresh();
      toast.success("수정되었습니다.");
    }
  };

  const handleDeleteChallenge = async (challengeId: string, groupId: string, title: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    
    const { error } = await supabase.from('challenges').delete().eq('id', challengeId);

    if (!error) {
      // 삭제 성공 후 브로드캐스트 전송
      await supabase.channel(`group-changes-${groupId}`).send({
        type: 'broadcast',
        event: 'challenge_event',
        payload: { nickname, action: '삭제', title },
      });
      router.refresh();
      toast.error("삭제되었습니다.");
    }
  };

  return { handleUpdateChallenge, handleDeleteChallenge };
};