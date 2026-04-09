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
   * 공통 헬퍼: 수정/삭제 시 같은 그룹원에게 실시간 토스트 브로드캐스트
   */
  const broadcastChallengeEvent = async (
    action: '수정' | '삭제',
    groupId: string,
    challengeTitle: string
  ) => {
    const channel = channelRef?.current;
    if (!channel) {
      console.warn('[broadcastChallengeEvent] 채널이 아직 준비되지 않았습니다.');
      return;
    }
    await channel.send({
      type: 'broadcast',
      event: 'challenge_event',
      payload: { nickname, action, title: challengeTitle },
    });
  };

  /**
   * 1. 챌린지 수정 페이지 이동
   *    수정 완료 브로드캐스트는 edit 페이지 저장 후 호출 권장
   *    (현재 구조상 페이지 이동 전 브로드캐스트 불가)
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
   *    - ✅ challengeOwnerId !== currentUserId 이면 2차 방어로 차단
   *    - ✅ 삭제 성공 시 그룹원에게 브로드캐스트
   */
  const handleDeleteChallenge = async (
    challengeId: string,
    groupId?: string,
    title?: string,
    challengeOwnerId?: string,
    currentUserId?: string
  ) => {
    // 본인 도전이 아니면 거부 (ChallengeList에서 버튼 노출 조건이 1차, 여기가 2차)
    if (challengeOwnerId && currentUserId && challengeOwnerId !== currentUserId) {
      toast.error('본인의 도전만 삭제할 수 있습니다.');
      return;
    }

    const displayTitle = title ? `'${title}' ` : '';
    if (!confirm(`${displayTitle}도전을 정말 삭제하시겠습니까?`)) return;

    try {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId);

      if (error) throw error;

      toast.success('챌린지가 삭제되었습니다.');

      // ✅ 그룹원 실시간 토스트
      if (groupId && title) {
        await broadcastChallengeEvent('삭제', groupId, title);
      }

      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('삭제 권한이 없거나 오류가 발생했습니다.');
    }
  };

  /**
   * 3. 재촉하기(Nudge)
   *    - ✅ 새 채널 생성 없이 channelRef의 기존 구독 채널로 send()
   *    - ✅ DB 저장으로 오프라인 사용자도 재진입 시 팝업 확인 가능
   */
  const handleNudge = async (targetUserId: string, targetNickname: string, groupId: string) => {
    toast.dismiss();
    triggerStrongVibration();

    const channel = channelRef?.current;

    try {
      if (channel) {
        await channel.send({
          type: 'broadcast',
          event: 'nudge_event',
          payload: { senderNickname: nickname, targetUserId },
        });
      } else {
        console.warn('[handleNudge] 채널 미준비 — DB 알림만 저장합니다.');
      }

      const { error: dbError } = await supabase.from('notifications').insert({
        user_id: targetUserId,
        group_id: groupId,
        type: 'nudge',
        message: `${nickname}님이 재촉했습니다! 🥊`,
        is_read: false,
      });

      if (dbError) console.error('[handleNudge] DB 저장 실패:', dbError);

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
    broadcastChallengeEvent,
  };
};