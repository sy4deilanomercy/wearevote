'use client';

export default function TerimaKasihPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Success Icon */}
        <div className="mb-8 animate-bounce">
          <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
            <svg
              className="w-20 h-20 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Terima Kasih!
        </h1>
        <p className="text-xl text-gray-700 mb-10 leading-relaxed">
          Suara Anda telah berhasil dicatat. Partisipasi Anda sangat berarti untuk demokrasi organisasi kita.
        </p>

        {/* Decorative Elements */}
        <div className="flex justify-center gap-4 text-5xl mb-12">
          <span>🎉</span>
          <span>✨</span>
          <span>🎊</span>
        </div>

        {/* Info */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-900 leading-relaxed">
            Silakan tutup halaman ini. Hasil voting akan ditampilkan di layar proyektor setelah waktu pemungutan suara selesai.
          </p>
        </div>
      </div>
    </div>
  );
}
