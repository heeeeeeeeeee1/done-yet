// src/hooks/useChallengeActions.ts
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { triggerStrongVibration } from '@/lib/native-bridge'; // ✅ 진동 유틸 추가

export const useChallengeActions = (nickname: string) => {
  const router = useRouter();
  const supabase = createClient();

  // 1. 챌린지 업데이트 로직 (복구)
  const handleUpdateChallenge = async (challengeId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('challenges')
        .update(updates)
        .eq('id', challengeId);

      if (error) throw error;
      toast.success('챌린지가 업데이트되었습니다!');
      router.refresh();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('업데이트에 실패했습니다.');
    }
  };

  // 2. 챌린지 삭제 로직 (복구)
  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId);

      if (error) throw error;
      toast.success('챌린지가 삭제되었습니다.');
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  // 3. ✅ 재촉하기(Nudge) 기능 수정 (진동 추가)
  const handleNudge = async (targetUserId: string, targetNickname: string, groupId: string) => {
    // 네이티브 앱에 진동 신호 전송 (본인 폰 피드백)
    triggerStrongVibration();

    const channel = supabase.channel(`group-changes-${groupId}`);

    try {
      // 실시간 브로드캐스트 전송
      await channel.send({
        type: 'broadcast',
        event: 'nudge_event',
        payload: {
          senderNickname: nickname,
          targetUserId
        },
      });

      // DB 알림 저장
      await supabase.from('notifications').insert({
        user_id: targetUserId,
        group_id: groupId,
        type: 'nudge',
        message: `${nickname}님이 당신을 지켜보고 있습니다... 👀`,
      });

      toast.success(`${targetNickname}님에게 눈치를 줬습니다! 👀`, { icon: '👀' });
    } catch (error) {
      console.error('Nudge error:', error);
    }
  };

  return { handleUpdateChallenge, handleDeleteChallenge, handleNudge };
};