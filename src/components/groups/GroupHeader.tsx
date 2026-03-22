// 그룹 상단 제목 관리
import BackButton from '@/components/common/BackButton';

export default function GroupHeader({ group, isOwner, onUpdate, onDelete, onLeave }: any) {
  return (
    <div className="p-6 pb-0">
      <header className="flex items-center gap-2 mb-6">
        <BackButton />
        <h1 className="text-xl font-black italic uppercase tracking-tighter">Group Details</h1>
      </header>
      <div className="mb-8">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-3xl font-black text-gray-900 leading-tight">{group.name}</h2>
          <div className="flex gap-2">
            {isOwner ? (
              <>
                <button onClick={onUpdate} className="text-[10px] font-bold text-gray-400 border border-gray-100 px-2 py-1 rounded-md">수정</button>
                <button onClick={onDelete} className="text-[10px] font-bold text-red-400 border border-red-50 px-2 py-1 rounded-md bg-red-50/30">삭제</button>
              </>
            ) : (
              <button onClick={onLeave} className="text-[10px] font-bold text-gray-400 border border-gray-100 px-2 py-1 rounded-md">탈퇴</button>
            )}
          </div>
        </div>
        <p className="text-gray-500 text-sm font-medium">{group.description || "함께 도전해요!"}</p>
      </div>
    </div>
  );
}
