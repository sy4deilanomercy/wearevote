[Layar Utama/Proyektor] 
  └── Menampilkan QR Code besar (sebelah kiri) + Chart Hasil (Masih kosong/hidden sebelum mulai (sebelah kanan)).

[HP Peserta - Scan QR]
  └── Surat Suara Digital
        ├── Foto Kandidat + Visi Misi singkat (biar estetik).
        └── Dua Tombol Besar: [SETUJU] atau [TIDAK SETUJU]

[Logika Percabangan di HP Peserta]
  ├── Jika klik [SETUJU]:
  │     └── Langsung muncul pop-up konfirmasi -> Submit -> Tampilkan halaman "Terima Kasih".
  └── Jika klik [TIDAK SETUJU]:
        └── Form meluas ke bawah (Slide down animasi):
              ├── Pilih Alasan (Checkbox: Visi Misi kurang jelas, Masalah Track Record, lainnya).
              └── Kolom Teks (muncul ketika pilih alasan lainnya): "Berikan kritik/masukan konstruktif Anda".
              └── Submit -> Tampilkan halaman "Terima Kasih".


fitur: 
1. Fitur "Sensor" (Moderasi Komentar): Ini WAJIB. Jangan biarkan komentar penolakan langsung muncul di layar proyektor tanpa disaring. Buat satu halaman admin sederhana di HP kamu/panitia lain untuk Approve atau Reject komentar yang masuk. Takutnya ada yang menulis kata-kata kasar atau tidak pantas.

2. Tombol "Freeze" / "Show Result": Jangan buka grafik persentase dari awal vote dimulai. Kenapa? Karena kalau di awal-awal yang masuk adalah "Tidak Setuju", itu bisa menggiring opini peserta lain yang belum vote (efek psikologis bandwagon). Sembunyikan chart-nya dulu, lalu setelah panitia menyatakan "Waktu vote habis", kamu klik tombol di admin untuk memunculkan hasilnya secara dramatis di proyektor. ketika hasil vote banyak yang setuju munculkan efek petasan dan terompet animasi beserta foto kandidatnya. jika banyak yang tidak setuju, maka tidak terjadi apa apa.