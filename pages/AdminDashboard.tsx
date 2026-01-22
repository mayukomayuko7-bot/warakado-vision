
import React, { useState, useEffect } from 'react';
import { PageId, MemberInfo, TarotKey, RecipePost, PointRequest } from '../types';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

interface AdminDashboardProps {
  onNavigate: (page: PageId) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [tarotKeys, setTarotKeys] = useState<TarotKey[]>([]);
  const [pointRequests, setPointRequests] = useState<PointRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [creditInput, setCreditInput] = useState<{ [email: string]: number }>({});

  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.warn("Firebase is not configured. Falling back to empty state.");
      setLoading(false);
      return;
    }

    setLoading(true);

    // 会員リストのリアルタイム監視
    const qMembers = query(collection(db, "members"), orderBy("registeredAt", "desc"));
    const unsubscribeMembers = onSnapshot(qMembers, (snap) => {
      const data = snap.docs.map(doc => doc.data() as MemberInfo);
      setMembers(data);
      setLoading(false);
    }, (err) => {
      console.error("Members fetch error:", err);
      setLoading(false);
    });

    // キーリストのリアルタイム監視
    const qKeys = query(collection(db, "tarot_keys"), orderBy("issuedAt", "desc"));
    const unsubscribeKeys = onSnapshot(qKeys, (snap) => {
      const data = snap.docs.map(doc => doc.data() as TarotKey);
      setTarotKeys(data);
    }, (err) => {
      console.error("Keys fetch error:", err);
    });

    /**
     * ポイント申請のリアルタイム監視
     * 修正ポイント: インデックスエラーを避けるため、クエリではorderByのみを行い、
     * 取得後にstatus === 'pending' でフィルタリングします。
     */
    const qPoints = query(collection(db, "point_requests"), orderBy("requestedAt", "desc"));
    const unsubscribePoints = onSnapshot(qPoints, (snap) => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as PointRequest))
        .filter(req => req.status === 'pending'); // アプリ側でフィルタリング
      setPointRequests(data);
    }, (err) => {
      console.error("Point requests fetch error:", err);
    });

    return () => {
      unsubscribeMembers();
      unsubscribeKeys();
      unsubscribePoints();
    };
  }, []);

  const handleUpdateCredits = async (email: string) => {
    const credits = creditInput[email] || 0;
    if (credits === 0) return;
    try {
      const q = query(collection(db, "members"), where("email", "==", email));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const memberDoc = snap.docs[0];
        const currentData = memberDoc.data() as MemberInfo;
        await updateDoc(memberDoc.ref, { tarotCredits: (currentData.tarotCredits || 0) + credits });
        alert(`${email} に ${credits}クレジット付与完了しました。`);
      }
    } catch (e) { 
      console.error(e);
      alert('付与中にエラーが発生しました'); 
    }
  };

  const handleApprovePoint = async (request: PointRequest) => {
    try {
      // 1. 会員のポイントを更新
      const q = query(collection(db, "members"), where("email", "==", request.memberEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const memberDoc = snap.docs[0];
        const currentData = memberDoc.data() as MemberInfo;
        await updateDoc(memberDoc.ref, { points: (currentData.points || 0) + 1 });
        
        // 2. 申請ステータスを更新
        const requestRef = doc(db, "point_requests", request.id);
        await updateDoc(requestRef, { status: 'approved' });
        
        alert(`${request.nickname} 様に1ポイント付与しました。`);
      }
    } catch (e) {
      console.error(e);
      alert('承認処理中にエラーが発生しました。');
    }
  };

  const handleRejectPoint = async (requestId: string) => {
    if (!confirm('この申請を却下しますか？')) return;
    try {
      const requestRef = doc(db, "point_requests", requestId);
      await updateDoc(requestRef, { status: 'rejected' });
      alert('却下しました。');
    } catch (e) { console.error(e); }
  };

  return (
    <div className="animate-fade-in text-slate-900 pb-20 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic">OWNER DASHBOARD</h2>
        <button onClick={() => onNavigate('home')} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg transition-transform active:scale-95">ホームに戻る</button>
      </div>

      {/* ポイント申請管理セクション */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden">
        <h3 className="font-black mb-6 flex items-center gap-2 text-xl text-orange-600">
          <i className="fa-solid fa-bell animate-pulse"></i>
          ポイント申請管理 (Instagram)
        </h3>
        
        {pointRequests.length === 0 ? (
          <div className="py-12 text-center text-slate-300 italic font-bold border-2 border-dashed border-slate-100 rounded-3xl">未処理の申請はありません</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-orange-50 border-b">
                  <th className="p-4 font-black text-orange-900/40 uppercase text-[10px]">申請者</th>
                  <th className="p-4 font-black text-orange-900/40 uppercase text-[10px]">申請日時</th>
                  <th className="p-4 font-black text-orange-900/40 uppercase text-[10px] text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {pointRequests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-orange-50/30 transition-colors">
                    <td className="p-4">
                      <div className="font-black text-slate-900">{req.nickname}</div>
                      <div className="text-[10px] text-slate-500 font-bold">{req.memberEmail}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-[10px] text-slate-400 font-mono">{new Date(req.requestedAt).toLocaleString('ja-JP')}</div>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleRejectPoint(req.id)}
                        className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-slate-200"
                      >
                        却下
                      </button>
                      <button 
                        onClick={() => handleApprovePoint(req)}
                        className="bg-orange-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black hover:bg-orange-700 shadow-md active:scale-95"
                      >
                        承認・付与
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 会員一覧セクション */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black flex items-center gap-2 text-xl">
            <i className="fa-solid fa-users text-orange-500"></i>
            会員管理・クレジット操作
          </h3>
          {!loading && <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Total: {members.length}</span>}
        </div>
        
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-400 font-bold">データを同期中...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-bold italic border-2 border-dashed border-slate-100 rounded-3xl">登録会員がいません</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="p-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">会員詳細</th>
                  <th className="p-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">登録属性</th>
                  <th className="p-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">保有残高</th>
                  <th className="p-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-right">付与操作</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-black text-slate-900 text-base">{m.nickname}</div>
                      <div className="text-[10px] text-slate-500 font-bold">{m.email}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 tracking-tighter">{m.serialNumber}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full inline-block">
                        {m.ageGroup || '未設定'} / {m.gender || '未設定'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          <span className="font-black text-orange-600 text-xs">Points: {m.points} pt</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          <span className="font-black text-indigo-600 text-xs">Tarot: {m.tarotCredits} pt</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <input 
                          type="number" 
                          placeholder="個数" 
                          className="w-16 px-2 py-1.5 text-center font-black text-sm border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-400 transition-all bg-white" 
                          onChange={(e) => setCreditInput({ ...creditInput, [m.email]: parseInt(e.target.value) || 0 })} 
                        />
                        <button 
                          onClick={() => handleUpdateCredits(m.email)} 
                          className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-colors shadow-md active:scale-95"
                        >
                          付与
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* キー管理セクション */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black flex items-center gap-2 text-xl text-indigo-900">
            <i className="fa-solid fa-key text-indigo-500"></i>
            タロット購入キー履歴
          </h3>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mb-6">
          <p className="text-[10px] text-indigo-900 font-bold leading-relaxed">
            <i className="fa-solid fa-circle-info mr-1"></i>
            決済ページへ移動した瞬間に発行されます。Squareで決済を確認後、該当するキーをコピーして会員へメールしてください。<br/>
            会員が有効化すると「使用済」ステータスに切り替わります。
          </p>
        </div>
        
        {tarotKeys.length === 0 ? (
          <div className="py-16 text-center text-slate-300 italic font-bold border-2 border-dashed border-slate-100 rounded-3xl">発行履歴なし</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-indigo-50 border-b">
                  <th className="p-4 font-black text-indigo-900/40 uppercase text-[10px] tracking-widest">キー</th>
                  <th className="p-4 font-black text-indigo-900/40 uppercase text-[10px] tracking-widest">対象会員</th>
                  <th className="p-4 font-black text-indigo-900/40 uppercase text-[10px] tracking-widest">発行日時</th>
                  <th className="p-4 font-black text-indigo-900/40 uppercase text-[10px] tracking-widest">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {tarotKeys.map((k, i) => (
                  <tr key={i} className={`border-b hover:bg-slate-50 transition-colors ${k.isUsed ? 'bg-slate-50/50 grayscale opacity-40' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-indigo-600 text-lg tracking-[0.2em] bg-white border-2 border-indigo-100 px-4 py-1 rounded-xl shadow-sm">{k.key}</span>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(k.key); alert('キーをコピーしました'); }} 
                          className="text-slate-400 hover:text-indigo-600 transition-colors p-2 bg-white rounded-full border border-slate-100 shadow-sm"
                          title="コピー"
                        >
                          <i className="fa-solid fa-copy"></i>
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-bold text-slate-800">{k.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-[10px] text-slate-400 font-mono">{new Date(k.issuedAt).toLocaleString('ja-JP')}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black shadow-sm inline-block ${k.isUsed ? 'bg-slate-200 text-slate-500' : 'bg-green-500 text-white animate-pulse-slow'}`}>
                        {k.isUsed ? '使用済' : '未使用'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
