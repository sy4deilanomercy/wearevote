'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CANDIDATE_DATA } from '@/lib/candidate-data';
import Image from 'next/image';

export default function VotePage() {
  const [hasVoted, setHasVoted] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVisiMisi, setShowVisiMisi] = useState(false);
  const [confirmVote, setConfirmVote] = useState<'approve' | 'reject' | null>(null);
  const [imgError, setImgError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const candidate = CANDIDATE_DATA;

  useEffect(() => {
    queueMicrotask(() => {
      if (localStorage.getItem('sudah_vote') === 'true') {
        setHasVoted(true);
      }
    });
  }, []);

  const submitVote = async (type: 'approve' | 'reject') => {
    setConfirmVote(null);
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      console.log('🗳️ Submitting vote:', { type, selectedReason, feedback });
      
      const voteData = {
        is_approved: type === 'approve',
        reason: type === 'reject' && selectedReason ? selectedReason : null,
        custom_reason: type === 'reject' && feedback ? feedback : null,
        // Auto-approve reject votes except "Lainnya" reason
        comment_status: type === 'approve' ? 'approved' : (selectedReason === 'Lainnya' ? 'pending' : 'approved'),
      };

      const { data, error } = await supabase
        .from('votes')
        .insert(voteData)
        .select();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Vote submitted successfully:', data);

      // Set voted status and force UI update
      localStorage.setItem('sudah_vote', 'true');
      setHasVoted(true);
      
      // Reset form state
      setSelectedReason('');
      setFeedback('');
      setShowRejectForm(false);
      
    } catch (error: unknown) {
      console.error('❌ Error submitting vote:', error);
      const errorMsg = error instanceof Error ? error.message : 'Gagal mengirim vote. Silakan coba lagi.';
      setErrorMessage(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thank you screen
  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 md:p-12 shadow-lg text-center max-w-md w-full border border-gray-200">
          <div className="text-5xl md:text-6xl mb-6 text-gray-400">✓</div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Terima Kasih</h1>
          <p className="text-gray-600 text-sm md:text-base">Suara Anda telah tercatat.</p>
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs md:text-sm text-gray-600">
              Anda tidak dapat voting lagi dari perangkat ini.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full border border-gray-200">
        {/* Header */}
        <div className="bg-gray-900 p-6 text-white text-center rounded-t-xl">
          <h1 className="text-xl md:text-2xl font-bold mb-1">Surat Suara Digital</h1>
          <p className="text-gray-300 text-xs md:text-sm">
            Pemilihan Ketua Umum GenBI Wilayah Bengkulu 2026/2027
          </p>
        </div>

        {/* Candidate Info */}
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 p-4 md:p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center overflow-hidden bg-white border-4 border-gray-200 flex-shrink-0 shadow-md relative">
              {imgError ? (
                <span className="text-5xl md:text-6xl text-gray-600">👤</span>
              ) : (
                <Image
                  src={candidate.photo_url}
                  alt={candidate.name}
                  fill
                  sizes="(max-width: 768px) 128px, 160px"
                  className="object-cover"
                  onError={() => setImgError(true)}
                />
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 break-words">
                {candidate.name}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mb-3">
                {candidate.komisariat}
              </p>

              <button
                onClick={() => setShowVisiMisi(!showVisiMisi)}
                className="w-full bg-white rounded-xl p-3 md:p-4 border border-gray-200 shadow-sm flex items-center justify-between gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 text-xs md:text-sm">Visi & Misi</span>
                <span className={`text-gray-500 transition-transform duration-300 ${showVisiMisi ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${showVisiMisi ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-200 shadow-sm">
                  <p className="font-semibold text-gray-900 mb-1 text-xs md:text-sm">Visi:</p>
                  <p className="text-gray-700 text-xs md:text-sm mb-3 leading-relaxed">
                    &ldquo;{candidate.vision_mission.vision}&rdquo;
                  </p>
                  <p className="font-semibold text-gray-900 mb-1 text-xs md:text-sm">Misi:</p>
                  <ul className="text-gray-700 space-y-1 text-xs md:text-sm leading-relaxed">
                    {candidate.vision_mission.mission.map((item, index) => (
                      <li key={index}>- {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Voting Buttons */}
          {!showRejectForm && (
            <div className="space-y-3 md:space-y-4">
              <button
                onClick={() => setConfirmVote('approve')}
                disabled={isSubmitting}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 md:py-5 px-8 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                Setuju
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={isSubmitting}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 md:py-5 px-8 rounded-xl border-2 border-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tidak Setuju
              </button>
            </div>
          )}

          {/* Reject Form */}
          {showRejectForm && (
            <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
                Alasan Anda? (Pilih salah satu)
              </h3>

              <div className="space-y-2 mb-6">
                {[
                  'Visi Misi kurang jelas',
                  'Masalah Track Record',
                  'Kurang pengalaman',
                  'Tidak sesuai harapan',
                  'Lainnya',
                ].map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700 text-sm">{reason}</span>
                  </label>
                ))}
              </div>

              {selectedReason === 'Lainnya' && (
                <div className="mb-6">
                  <label className="block text-gray-900 font-semibold mb-2 text-sm">
                    Masukan Anda:
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 focus:border-gray-900 focus:outline-none text-sm resize-none"
                    rows={4}
                    placeholder="Tuliskan masukan Anda..."
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setSelectedReason('');
                    setFeedback('');
                    setErrorMessage(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 md:px-6 rounded-xl transition-colors text-sm md:text-base"
                >
                  Batal
                </button>
                <button
                  onClick={() => setConfirmVote('reject')}
                  disabled={isSubmitting || !selectedReason}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 md:px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmVote && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmVote(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 md:p-8 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="text-4xl md:text-5xl mb-4 text-gray-400">🗳️</div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Konfirmasi</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Yakin memilih <strong>{confirmVote === 'approve' ? 'SETUJU' : 'TIDAK SETUJU'}</strong>?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmVote(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-xl transition-colors text-sm md:text-base"
              >
                Batal
              </button>
              <button
                onClick={() => submitVote(confirmVote)}
                disabled={isSubmitting}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {isSubmitting ? 'Mengirim...' : 'Ya, Kirim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}