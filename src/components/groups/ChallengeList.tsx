// 도전 목록 및 수정, 삭제 버튼
export default function ChallengeList({ challenges, isOwner, currentUserId, onUpdate, onDelete }: any) {
  return (
    <div className="space-y-3">
      {challenges.map((c: any) => (
        <div key={c.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
          <div className="flex-1">
            <h4 className="font-bold text-gray-800">{c.title}</h4>
            <div className="flex gap-3 mt-1 text-[10px] font-bold">
              <span className="text-gray-400">주 {c.weekly_target}회</span>
              {(isOwner || c.user_id === currentUserId) && (
                <div className="flex gap-2">
                  <button onClick={() => onUpdate(c)} className="text-blue-500 underline">수정</button>
                  <button onClick={() => onDelete(c.id)} className="text-red-400 underline">삭제</button>
                </div>
              )}
            </div>
          </div>
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">🔥</div>
        </div>
      ))}
    </div>
  );
}