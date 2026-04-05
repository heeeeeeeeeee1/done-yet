// src/hooks/useChallengeActions.ts
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { triggerStrongVibration } from '@/lib/native-bridge';

export const useChallengeActions = (nickname: string) => {
  const router = useRouter();
  const supabase = createClient();

  // 1. 챌린지 업데이트 로직
  // 에러 해결 포인트: 호출부에서 (challenge, groupId) 형태로 보낸다면, 
  // 내부에서 challenge.id를 추출하고 updates 객체를 구성하도록 유연하게 대응합니다.
  const handleUpdateChallenge = async (challenge: any, updatesOrGroupId: any) => {
    try {
      // 인자 처리: updatesOrGroupId가 문자열(groupId)이면 객체로 변환, 객체면 그대로 사용
      const finalUpdates = typeof updatesOrGroupId === 'string'
        ? { group_id: updatesOrGroupId }
        : updatesOrGroupId;

      const challengeId = typeof challenge === 'object' ? challenge.id : challenge;

      const { error } = await supabase
        .from('challenges')
        .update(finalUpdates)
        .eq('id', challengeId);

      if (error) throw error;
      toast.success('챌린지가 업데이트되었습니다!');
      router.refresh();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('업데이트에 실패했습니다.');
    }
  };

  // 2. 챌린지 삭제 로직
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

  // 3. 재촉하기(Nudge) 기능
  const handleNudge = async (targetUserId: string, targetNickname: string, groupId: string) => {
    toast.dismiss();
    triggerStrongVibration();

    // 단발성 메시지 전송을 위한 채널 생성
    const channel = supabase.channel(`nudge-${groupId}-${Date.now()}`);

    try {
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // 브로드캐스트와 DB 저장을 병렬로 처리하여 성능 최적화
          await Promise.all([
            channel.send({
              type: 'broadcast',
              event: 'nudge_event',
              payload: {
                senderNickname: nickname,
                targetUserId
              },
            }),
            supabase.from('notifications').insert({
              user_id: targetUserId,
              type: 'nudge',
              content: `${nickname}님이 재촉했습니다! 🥊`,
              group_id: groupId
            })
          ]);

          // 전송 완료 후 채널 구독 해제 (메모리 관리)
          supabase.removeChannel(channel);
        }
      });

      toast.success(`${targetNickname}님에게 재촉하기를 보냈어요! 🥊`, {
        duration: 1000,
        position: 'top-center'
      });

    } catch (error) {
      console.error('Nudge error:', error);
      toast.error('재촉하기에 실패했습니다.');
      supabase.removeChannel(channel);
    }
  };

  return {
    handleUpdateChallenge,
    handleDeleteChallenge,
    handleNudge
  };
};