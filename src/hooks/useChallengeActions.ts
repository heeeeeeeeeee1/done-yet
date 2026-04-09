// src/hooks/useChallengeActions.ts
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { triggerStrongVibration } from '@/lib/native-bridge';
import type { RefObject } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const useChallengeActions = (
  nickname: string,
  // ✅ GroupDetailClient가 이미 구독 중인 채널 ref를 받아서 재사용
  channelRef?: RefObject<RealtimeChannel | null>
) => {
  const router = useRouter();
  const supabase = createClient();

  /**
   * 1. 챌린지 수정 페이지 이동
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
   * 2. 챌린지 삭제
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
   * 3. 재촉하기(Nudge)
   *
   * ✅ 핵심 변경:
   *    - 새 채널을 만들어 브로드캐스트하면 GroupDetailClient의 구독자가 수신 못 함
   *    - channelRef로 이미 SUBSCRIBED 상태인 채널을 받아서 그 채널로 send()
   *    - DB 저장(notifications)은 그대로 유지 → 오프라인 사용자도 나중에 확인 가능
   */
  const handleNudge = async (targetUserId: string, targetNickname: string, groupId: string) => {
    toast.dismiss();
    triggerStrongVibration();

    const channel = channelRef?.current;

    try {
      // ✅ 실시간: 이미 구독된 채널로 브로드캐스트 (채널 재생성 X)
      if (channel) {
        await channel.send({
          type: 'broadcast',
          event: 'nudge_event',
          payload: {
            senderNickname: nickname,
            targetUserId,
          },
        });
      } else {
        // 채널이 아직 준비 안 된 엣지케이스 — 콘솔 경고만, 실패 처리는 하지 않음
        console.warn('[handleNudge] 채널이 아직 준비되지 않았습니다. DB 알림만 저장합니다.');
      }

      // ✅ 오프라인 대비: notifications 테이블에 저장 (앱 재진입 시 팝업 표시)
      const { error: dbError } = await supabase.from('notifications').insert({
        user_id: targetUserId,
        group_id: groupId,
        type: 'nudge',
        message: `${nickname}님이 재촉했습니다! 🥊`,
        is_read: false,
      });

      if (dbError) {
        console.error('[handleNudge] DB 저장 실패:', dbError);
      }

      toast.success(`${targetNickname}님에게 재촉하기를 보냈어요! 🥊`, {
        duration: 1000,
        position: 'top-center',
      });
    } catch (error) {
      console.error('Nudge error:', error);
      toast.error('재촉하기에 실패했습니다.');
    }
  };

  return {
    handleUpdateChallenge,
    handleDeleteChallenge,
    handleNudge,
  };
};