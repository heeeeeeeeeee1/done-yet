// src/components/groups/GroupHeader.tsx
'use client';

import { useState } from 'react';
import BackButton from '@/components/common/BackButton';
import { UserPlus, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function GroupHeader({ group, isOwner, onUpdate, onDelete, onLeave }: any) {
  const [copied, setCopied] = useState(false);

  const handleCopyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(group.invite_code);
      setCopied(true);

      toast.success(`초대 코드(${group.invite_code})가 복사되었습니다!`, {
        icon: '🔗',
        style: { fontSize: '12px', fontWeight: 'bold' }
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  return (
    <div className="p-6 pb-0">
      {/* 상단 헤더 */}
      <header className="flex items-center gap-2 mb-6">
        <BackButton />
        <h1 className="text-lg font-black italic uppercase tracking-tighter text-gray-900">
          Group Details
        </h1>
      </header>

      {/* 그룹 정보 */}
      <div className="mb-6">
        <div className="flex justify-between items-start">

          {/* 👈 왼쪽 영역 (이게 핵심) */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-black text-gray-900 leading-tight truncate">
                {group.name}
              </h2>
            </div>

            <div className="flex gap-2 items-center min-w-0 py-2">
              <p
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black shrink-0 ${isOwner
                  ? 'bg-amber-100 text-amber-600 border border-amber-200'
                  : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}
              >
                {isOwner ? '👑 방장' : '👤 멤버'}
              </p>
              <p className="text-gray-500 text-sm font-medium truncate">
                {group.description || '함께 도전해요!'}
              </p>
            </div>
          </div>

          {/* 👉 오른쪽 버튼 영역 (절대 안 밀림) */}
          <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
            <div className="flex gap-1.5">
              {/* 초대 버튼 */}
              <button
                onClick={handleCopyInviteCode}
                className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-md border transition-all ${copied
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {copied ? <Check size={12} /> : <UserPlus size={12} />}
                {copied ? '코드 복사' : '친구 초대'}
              </button>

              {isOwner ? (
                <>
                  <button
                    onClick={onUpdate}
                    className="text-[10px] font-bold text-gray-400 border border-gray-200 px-2 py-1.5 rounded-md bg-white"
                  >
                    수정
                  </button>
                  <button
                    onClick={onDelete}
                    className="text-[10px] font-bold text-red-400 border border-red-100 px-2 py-1.5 rounded-md bg-red-50/30"
                  >
                    삭제
                  </button>
                </>
              ) : (
                <button
                  onClick={onLeave}
                  className="text-[10px] font-bold text-gray-400 border border-gray-200 px-2 py-1.5 rounded-md bg-white"
                >
                  탈퇴
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}