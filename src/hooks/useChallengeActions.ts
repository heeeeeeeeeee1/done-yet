// src/hooks/useChallengeActions.ts
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { triggerStrongVibration } from '@/lib/native-bridge';

export const useChallengeActions = (nickname: string) => {
  const router = useRouter();
  const supabase = createClient();

  /**
   * 1. 챌린지 수정 페이지 이동
   * 기존: DB를 직접 update 하려 함
   * 변경: 수정 버튼 클릭 시 해당 챌린지의 수정 페이지로 이동시킵니다.
   */
  const handleUpdateChallenge = (challenge: any, groupId: string) => {
    const challengeId = typeof challenge === 'object' ? challenge.id : challenge;
    if (!challengeId || !groupId) {
      toast.error('정보를 불러올 수 없습니다.');
      return;
    }
    router.push(`/groups/${groupId}/challenges/${challengeId}/edit`);
  };

  /**
   * 2. 챌린지 삭제 로직
   * ChallengeList.tsx에서 (c.id, groupId, c.title) 순으로 인자를 보내므로
   * 그에 맞춰 매개변수를 구성합니다.
   */
  const handleDeleteChallenge = async (challengeId: string, groupId?: string, title?: string) => {
    const displayTitle = title ? `'${title}' ` : '';
    if (!confirm(`${displayTitle}도전을 정말 삭제하시겠습니까?`)) return;

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
      toast.error('삭제 권한이 없거나 오류가 발생했습니다.');
    }
  };

  /**
   * 3. 재촉하기(Nudge) 기능
   * DB 스키마에 컬럼명이 'content'가 아니라 'message'임을 반영했습니다.
   */
  const handleNudge = async (targetUserId: string, targetNickname: string, groupId: string) => {
    toast.dismiss();
    triggerStrongVibration();

    // 단발성 메시지 전송을 위한 채널 생성
    const channel = supabase.channel(`nudge-${groupId}-${Date.now()}`);

    try {
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await Promise.all([
            // 실시간 브로드캐스트 전송
            channel.send({
              type: 'broadcast',
              event: 'nudge_event',
              payload: {
                senderNickname: nickname,
                targetUserId
              },
            }),
            // 알림 테이블 저장 (스키마의 message 컬럼 사용)
            supabase.from('notifications').insert({
              user_id: targetUserId,
              group_id: groupId,
              type: 'nudge',
              message: `${nickname}님이 재촉했습니다! 🥊`, // 👈 content 대신 message 사용
              is_read: false
            })
          ]);

          // 전송 완료 후 채널 구독 해제
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
      if (channel) supabase.removeChannel(channel);
    }
  };

  return {
    handleUpdateChallenge,
    handleDeleteChallenge,
    handleNudge
  };
};