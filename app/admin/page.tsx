'use client';

import { useState, useEffect } from 'react';
import { supabase, type Vote } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface VoteWithComment extends Vote {
  display_reason: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [pendingVotes, setPendingVotes] = useState<VoteWithComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteStats, setVoteStats] = useState({
    approve: 0,
    disapprove: 0,
    total: 0,
    pending: 0
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const fetchPendingVotes = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('comment_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching pending votes:', error);
        setPendingVotes([]);
      } else {
        console.log('✅ Fetched pending votes:', data?.length || 0);
        const votesWithDisplay = (data || []).map((vote) => ({
          ...vote,
          display_reason: vote.custom_reason || vote.reason || 'Tidak ada alasan',
        }));
        setPendingVotes(votesWithDisplay);
      }

      const { data: allVotes, error: statsError } = await supabase
        .from('votes')
        .select('is_approved, comment_status');

      if (statsError) {
        console.error('❌ Error fetching stats:', statsError);
      } else if (allVotes) {
        const approvedVotes = allVotes.filter(
          (v) => v.comment_status === 'approved'
        );
        const approve = approvedVotes.filter((v) => v.is_approved).length;
        const disapprove = approvedVotes.filter((v) => !v.is_approved).length;
        const pending = allVotes.filter((v) => v.comment_status === 'pending').length;

        console.log('📊 Vote Stats:', { approve, disapprove, total: approve + disapprove, pending });

        setVoteStats({
          approve,
          disapprove,
          total: approve + disapprove,
          pending
        });
      }
    } catch (err) {
      console.error('❌ Unexpected error in fetchPendingVotes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth') === 'true';
    queueMicrotask(() => {
      setIsAuthenticated(auth);
      setLoading(!auth);
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      queueMicrotask(() => fetchPendingVotes());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('admin-votes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => {
          fetchPendingVotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
   
  }, [isAuthenticated]);

  const handleLogin = async () => {
    setLoginError('');

    if (!username.trim() || !password.trim()) {
      setLoginError('Username dan password harus diisi');
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('verify_admin_login', {
          p_username: username,
          p_password: password
        });

      if (error || !data) {
        setLoginError('Username atau password salah');
        return;
      }

      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setUsername('');
      setPassword('');
    } catch (err) {
      setLoginError('Terjadi kesalahan saat login');
      console.error(err);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    router.push('/');
  };

  const handleApprove = async (voteId: string) => {
    console.log('✅ Approving vote:', voteId);

    const { error } = await supabase
      .from('votes')
      .update({ comment_status: 'approved' })
      .eq('id', voteId);

    if (error) {
      console.error('❌ Error approving vote:', error);
      alert('Error approving vote: ' + error.message);
    } else {
      console.log('✅ Vote approved successfully');
      fetchPendingVotes();
    }
  };

  const handleReject = async (voteId: string) => {
    console.log('❌ Rejecting vote:', voteId);

    const { error } = await supabase
      .from('votes')
      .update({ comment_status: 'rejected' })
      .eq('id', voteId);

    if (error) {
      console.error('❌ Error rejecting vote:', error);
      alert('Error rejecting vote: ' + error.message);
    } else {
      console.log('✅ Vote rejected successfully');
      fetchPendingVotes();
    }
  };

  const handleShowResults = () => {
    localStorage.setItem('showResults', 'true');
    localStorage.setItem('showResultsTimestamp', Date.now().toString());
    window.dispatchEvent(new Event('storage'));
    setNotificationMessage('Hasil voting telah berhasil ditampilkan di layar utama! 🎉');
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleHideResults = () => {
    localStorage.setItem('showResults', 'false');
    localStorage.setItem('showResultsTimestamp', Date.now().toString());
    window.dispatchEvent(new Event('storage'));
    setNotificationMessage('Hasil voting telah disembunyikan dari layar utama 👁️');
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full shadow-lg border border-gray-200">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600">Masuk untuk mengakses dashboard</p>
          </div>

          {loginError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {loginError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 focus:border-blue-500 focus:outline-none text-gray-900"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Masukkan password..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 focus:border-blue-500 focus:outline-none text-gray-900"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg text-white"
          >
            Masuk
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full mt-3 bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-xl font-semibold transition-colors border border-gray-200 text-gray-700"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel Admin</h1>
              <p className="text-gray-600 mt-1">Moderasi komentar dan kontrol tampilan</p>
            </div>
            <div className="flex items-center gap-6">
              {/* Vote Statistics */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{voteStats.approve}</div>
                  <div className="text-xs text-gray-600">Setuju</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{voteStats.disapprove}</div>
                  <div className="text-xs text-gray-600">Tidak Setuju</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{voteStats.total}</div>
                  <div className="text-xs text-gray-600">Total Approved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{voteStats.pending}</div>
                  <div className="text-xs text-gray-600">Menunggu Review</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleShowResults}
                  className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg text-white whitespace-nowrap"
                >
                  📊 Tampilkan Hasil
                </button>
                <button
                  onClick={handleHideResults}
                  className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg text-white whitespace-nowrap"
                >
                  🙈 Sembunyikan
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg text-white"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Info Box */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 mb-6 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0 text-2xl mr-3">⚠️</div>
            <div>
              <p className="text-sm text-yellow-800 leading-relaxed">
                <strong>Penting:</strong> Review setiap komentar sebelum disetujui. Komentar yang
                disetujui akan dihitung dalam hasil voting dan dapat ditampilkan di layar proyektor.
              </p>
            </div>
          </div>
        </div>

        {/* Pending Votes List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 text-lg">Memuat data...</p>
          </div>
        ) : pendingVotes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-200">
            <div className="text-7xl mb-6">✅</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Semua komentar sudah direview
            </h3>
            <p className="text-gray-600">Tidak ada komentar yang menunggu moderasi</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingVotes.map((vote) => (
              <div
                key={vote.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Timestamp */}
                    <div className="text-xs text-gray-500 mb-3">
                      {new Date(vote.created_at).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>

                    {/* Reason */}
                    {vote.reason && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700">Alasan:</span>
                        <div className="mt-2">
                          <span className="inline-block bg-red-50 px-3 py-1 rounded-full text-xs border border-red-200 text-red-700">
                            {vote.reason}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Custom Comment */}
                    {vote.custom_reason && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <span className="text-sm font-medium text-gray-700 block mb-2">
                          Komentar:
                        </span>
                        <p className="text-gray-900">{vote.custom_reason}</p>
                      </div>
                    )}

                    {/* No reason/comment */}
                    {!vote.reason && !vote.custom_reason && (
                      <p className="text-gray-500 italic">Tidak ada alasan diberikan</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-6 flex flex-col gap-3">
                    <button
                      onClick={() => handleApprove(vote.id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors shadow-md flex items-center gap-2 whitespace-nowrap"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Setujui
                    </button>
                    <button
                      onClick={() => handleReject(vote.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors shadow-md flex items-center gap-2 whitespace-nowrap"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Tolak
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Success Notification Modal */}
      {showNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-[fadeInScale_0.3s_ease-out]">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="text-xl font-bold text-white">Berhasil!</h3>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {notificationMessage}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNotification(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setShowNotification(false);
                    window.open('/', '_blank');
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Lihat Layar Utama
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
