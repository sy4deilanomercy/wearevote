'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase, type Vote } from '@/lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';
import { CANDIDATE_DATA } from '@/lib/candidate-data';
import confetti from 'canvas-confetti';

interface VoteStats {
  approve: number;
  disapprove: number;
  total: number;
  approvePercentage: number;
  disapprovePercentage: number;
}

export default function Home() {
  const [stats, setStats] = useState<VoteStats>({
    approve: 0,
    disapprove: 0,
    total: 0,
    approvePercentage: 0,
    disapprovePercentage: 0,
  });
  const [showResults, setShowResults] = useState(false);
  const [rejectedVotes, setRejectedVotes] = useState<Vote[]>([]);

  const showResultsRef = useRef(false);
  const statsRef = useRef({ approvePercentage: 0 });

  const candidateName = CANDIDATE_DATA.name;

  const voteUrl = 'https://wearevote.netlify.app/vote';

  const fetchStats = async () => {
    const { data: votes } = await supabase
      .from('votes')
      .select('*');

    if (votes) {
      const approvedVotes = votes.filter(
        (v) => v.is_approved || v.comment_status === 'approved'
      );
      const approve = approvedVotes.filter((v) => v.is_approved).length;
      const disapprove = approvedVotes.filter((v) => !v.is_approved).length;
      const total = approvedVotes.length;

      setStats({
        approve,
        disapprove,
        total,
        approvePercentage: total > 0 ? (approve / total) * 100 : 0,
        disapprovePercentage: total > 0 ? (disapprove / total) * 100 : 0,
      });

      const disapproveVotes = votes.filter(
        (v) => !v.is_approved && v.comment_status === 'approved'
      );
      setRejectedVotes(disapproveVotes);
    }
  };

  useEffect(() => {
    showResultsRef.current = showResults;
  }, [showResults]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    const channel = supabase
      .channel('votes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
        fetchStats();
      })
      .subscribe();

    queueMicrotask(() => fetchStats());

    const handleStorageChange = () => {
      const showResultsValue = localStorage.getItem('showResults');
      const wasShowingResults = showResultsRef.current;

      if (showResultsValue === 'true') {
        setShowResults(true);
        if (!wasShowingResults && statsRef.current.approvePercentage > 50) {
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }, 500);
        }
      } else if (showResultsValue === 'false') {
        setShowResults(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('storage', handleStorageChange);
    };
   
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
             PEMILIHAN KETUA UMUM GENBI WILAYAH BENGKULU 2026/2027
          </h1>
          <p className="text-gray-600 text-center">Scan QR Code untuk memberikan suara Anda</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Side - QR Code */}
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Scan untuk Vote</h2>
              <div className="inline-block bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
                <QRCodeCanvas value={voteUrl} size={280} level="H" />
              </div>
              <p className="mt-8 text-gray-600 leading-relaxed max-w-md mx-auto">
                Arahkan kamera HP Anda ke QR Code di atas untuk mengakses form voting
              </p>
            </div>
          </div>

          {/* Right Side - Results Chart */}
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Hasil Voting</h2>
              <p className="text-gray-500 mt-1">Real-time counting</p>
            </div>

            {!showResults ? (
              <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                  <div className="text-7xl mb-6">🔒</div>
                  <p className="text-xl text-gray-700 mb-6 font-medium">
                    Hasil akan ditampilkan setelah voting selesai
                  </p>
                  <div className="inline-block bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">Total Vote Masuk</p>
                    <p className="text-5xl font-bold text-blue-600">{stats.total}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                    <div className="text-xs text-green-700 mb-1 font-medium">Setuju</div>
                    <div className="text-4xl font-bold text-green-600">{stats.approve}</div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                    <div className="text-xs text-red-700 mb-1 font-medium">Tidak Setuju</div>
                    <div className="text-4xl font-bold text-red-600">{stats.disapprove}</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                    <div className="text-xs text-blue-700 mb-1 font-medium">Total</div>
                    <div className="text-4xl font-bold text-blue-600">{stats.total}</div>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="space-y-5 mt-8">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-gray-700">Setuju</span>
                      <span className="font-bold text-xl text-green-600">
                        {stats.approvePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-10 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                        style={{ width: `${stats.approvePercentage}%` }}
                      >
                        {stats.approvePercentage > 15 && (
                          <span className="font-bold text-white text-sm">✓</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-gray-700">Tidak Setuju</span>
                      <span className="font-bold text-xl text-red-600">
                        {stats.disapprovePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-10 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                        style={{ width: `${stats.disapprovePercentage}%` }}
                      >
                        {stats.disapprovePercentage > 15 && (
                          <span className="font-bold text-white text-sm">✗</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Winner Declaration */}
                {stats.total > 0 && (
                  <div className="mt-8 text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-2xl font-bold">
                      {stats.approvePercentage > 50 ? (
                        <span className="text-green-600">
                          ✓ {candidateName} Disetujui ({stats.approvePercentage.toFixed(1)}%)
                        </span>
                      ) : stats.disapprovePercentage > 50 ? (
                        <span className="text-red-600">
                          ✗ Tidak Disetujui ({stats.disapprovePercentage.toFixed(1)}%)
                        </span>
                      ) : (
                        <span className="text-gray-600">⚖️ Hasil Berimbang</span>
                      )}
                    </p>
                  </div>
                )}

                {/* Rejected Votes Comments */}
                {rejectedVotes.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">
                      Komentar Tidak Setuju ({rejectedVotes.length})
                    </h3>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {rejectedVotes.map((vote) => (
                        <div
                          key={vote.id}
                          className="flex items-start gap-2 text-xs py-1.5 px-2.5 bg-red-50 rounded-lg border border-red-100"
                        >
                          <span className="text-red-400 mt-0.5">✗</span>
                          <div className="flex-1 min-w-0">
                            {vote.reason && (
                              <span className="inline-block bg-red-100 px-1.5 py-0.5 rounded text-[10px] text-red-600 mr-1.5">
                                {vote.reason}
                              </span>
                            )}
                            {vote.custom_reason && (
                              <span className="text-gray-700">{vote.custom_reason}</span>
                            )}
                            {!vote.reason && !vote.custom_reason && (
                              <span className="text-gray-400 italic">-</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
