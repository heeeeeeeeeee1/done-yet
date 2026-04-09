// src/components/groups/ChallengeList.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { sendPushNotification, triggerFeedbackVibration } from '@/lib/native-bridge';

interface ChallengeListProps {
  challenges: any[];
  isOwner: boolean;
  currentUserId: string;
  // ✅ challengeOwnerId, currentUserId 추가 (2차 방어용)
  onDelete: (id: string, groupId: string, title: string, challengeOwnerId: string, currentUserId: string) => void;
  onNudge: (targetUserId: string, senderNickname: string, groupId: string) => void;
  groupId: string;
}

export default function ChallengeList({
  challenges,
  isOwner,
  currentUserId,
  onDelete,
  onNudge,
  groupId,
}: ChallengeListProps) {
  return (
    <div className="space-y-3">
      {challenges.map((c: any) => {
        const displayName = c.users?.nickname || '멤버';
        const progressPercent = Math.min(Math.round((c.current_count / c.weekly_target) * 100), 100);
        const isCompleted = c.current_count >= c.weekly_target;

        // ✅ 수정/삭제 버튼은 본인 도전에만 표시 (방장 포함 타인 도전 불가)
        const isMyChallenge = c.user_id === currentUserId;

        const handleNudgeClick = () => {
          onNudge(c.user_id, displayName, groupId);
          sendPushNotification(
            c.user_id,
            '🥊 빨리 하라고!!',
            `${displayName}님, 팀원이 당신의 인증을 기다리고 있어요!`
          );
          triggerFeedbackVibration();
        };

        return (
          <div
            key={c.id}
            className="p-5 bg-white rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm"
          >
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 shrink-0">
                  {displayName}
                </span>
                <h4 className="font-bold text-gray-800 truncate">{c.title}</h4>
              </div>

              {/* 진행 바 */}
              <div className="mt-2 mb-3">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-black text-blue-600">
                    {c.current_count}{' '}
                    <span className="text-gray-300 font-normal">/ {c.weekly_target}회</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                  />
                </div>
              </div>

              {/* ✅ 수정/삭제: 본인 도전만 표시 */}
              {isMyChallenge && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                  <Link
                    href={`/groups/${groupId}/challenges/${c.id}/edit`}
                    className="hover:text-blue-500 transition-colors"
                  >
                    수정
                  </Link>
                  <span className="text-gray-200">|</span>
                  <button
                    onClick={() => onDelete(c.id, groupId, c.title, c.user_id, currentUserId)}
                    className="hover:text-red-400 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* 재촉하기: 타인 도전에만 표시 */}
              {!isMyChallenge && (
                <button
                  onClick={handleNudgeClick}
                  className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 shadow-sm text-lg hover:scale-110 active:scale-90 transition-all"
                >
                  👀
                </button>
              )}
              <div
                className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center border shadow-sm transition-all ${isCompleted ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'
                  }`}
              >
                <span className={`text-lg ${isCompleted ? 'grayscale-0' : 'grayscale opacity-30'}`}>
                  🔥
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}