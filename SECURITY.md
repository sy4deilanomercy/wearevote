Sistem Kunci Perangkat (Client-Side Protection)
Ini adalah lapisan tambahan yang dipasang di HP peserta untuk mencegah mereka menekan tombol Back atau Refresh lalu memilih lagi.

Cara Kerja:
Begitu peserta mengeklik tombol "Submit Vote", sistem kamu langsung menyuntikkan tanda di memori browser mereka.

Logika Frontend:

JavaScript
// Saat sukses submit vote
localStorage.setItem('sudah_vote', 'true');
Lalu, di bagian paling atas script halaman utama/form kamu, pasang pengecekan:

JavaScript
if (localStorage.getItem('sudah_vote') === 'true') {
    window.location.href = '/halaman-terima-kasih.html'; 
    // Langsung tendang ke halaman sukses, tidak bisa masuk form lagi
}