// src/components/groups/ChallengeList.tsx
'use client';

export default function ChallengeList({
  challenges,
  isOwner,
  currentUserId,
  onUpdate,
  onDelete,
  onNudge,
  groupId
}: any) {
  return (
    <div className="space-y-3">
      {challenges.map((c: any) => {
        // ✅ 수정: 조인된 users 객체에서 nickname을 가져옵니다.
        const displayName = c.users?.nickname || '멤버';
        const progressPercent = Math.min(Math.round((c.current_count / c.weekly_target) * 100), 100);

        return (
          <div key={c.id} className="p-5 bg-white rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {displayName}
                </span>
                <h4 className="font-bold text-gray-800 truncate">{c.title}</h4>
              </div>

              <div className="mt-2 mb-3">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-black text-blue-600">
                    {c.current_count} <span className="text-gray-300 font-normal">/ {c.weekly_target}회</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-bold">
                {(isOwner || c.user_id === currentUserId) && (
                  <div className="flex gap-2">
                    <button onClick={() => onUpdate(c, groupId)} className="text-gray-400 underline decoration-gray-200">수정</button>
                    <button onClick={() => onDelete(c.id, groupId, c.title)} className="text-red-300 underline decoration-red-100">삭제</button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {c.user_id !== currentUserId && (
                <button
                  onClick={() => onNudge(c.user_id, displayName, groupId)}
                  className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 shadow-sm text-lg hover:scale-110 active:scale-95 transition-all"
                >
                  👀
                </button>
              )}
              <div className="w-10 h-10 bg-white rounded-xl flex flex-col items-center justify-center border border-gray-100 shadow-sm">
                <span className={`text-lg ${c.current_count >= c.weekly_target ? 'grayscale-0' : 'grayscale opacity-30'}`}>🔥</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}