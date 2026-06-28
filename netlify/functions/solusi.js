const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { Groq } = require('groq-sdk');

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// ==========================================
// DATA BASE KONDISI UMUM BIROKRASI INDONESIA
// ==========================================
const databaseSolusi = [
    // --- Bagian 1: KTP ---
    {
        "Id": 1,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["ktp hilang", "cara urus ktp hilang", "syarat ktp hilang", "ktp hilang urus dimana"],
        "prosedur": [
            "Minta surat pengantar kehilangan dari RT/RW setempat.",
            "Bawa pengantar ke Polsek untuk menerbitkan Surat Keterangan Kehilangan.",
            "Siapkan fotokopi Kartu Keluarga (KK).",
            "Bawa berkas ke Kantor Kecamatan atau Dukcapil untuk mengajukan cetak ulang KTP-el."
        ],
        "lembaga": [
            "RT/RW",
            "Polsek",
            "Kantor Kecamatan / Dinas Dukcapil"
        ]
    },
    {
        "Id": 2,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["ktp rusak", "ktp patah", "ktp ngelupas", "cara ganti ktp rusak"],
        "prosedur": [
            "Bawa KTP-el asli yang fisiknya sudah rusak.",
            "Siapkan fotokopi Kartu Keluarga (KK).",
            "Datang langsung ke Kantor Kecamatan atau Dinas Dukcapil terdekat.",
            "Serahkan KTP lama dan ajukan permohonan pencetakan ulang KTP-el."
        ],
        "lembaga": [
            "Kantor Kecamatan / Dinas Dukcapil"
        ]
    },
    {
        "Id": 3,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["bikin ktp baru", "syarat buat ktp umur 17", "buat ktp pertama kali", "rekam ktp"],
        "prosedur": [
            "Pastikan pemohon sudah berusia 17 tahun atau sudah menikah.",
            "Siapkan fotokopi Kartu Keluarga (KK).",
            "Datang ke Kantor Kecamatan membawa fotokopi KK.",
            "Melakukan proses perekaman biometrik (foto wajah, sidik jari, iris mata, dan tanda tangan).",
            "Menunggu resi untuk pengambilan KTP-el yang sudah dicetak."
        ],
        "lembaga": [
            "Kantor Kecamatan / Dinas Dukcapil"
        ]
    },
    {
        "Id": 4,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["revisi data ktp", "ganti nama di ktp", "ubah status kawin", "salah ketik di ktp"],
        "prosedur": [
            "Siapkan KTP asli dan Kartu Keluarga (KK) asli.",
            "Siapkan dokumen otentik pendukung perubahan data (misal: Fotokopi Ijazah untuk ubah nama, Buku Nikah untuk status perkawinan, dsb).",
            "Datang ke Dinas Dukcapil atau Kantor Kecamatan.",
            "Isi formulir perubahan data kependudukan dan serahkan berkas.",
            "Tunggu pencetakan KTP-el dengan data yang baru."
        ],
        "lembaga": [
            "Kantor Kecamatan / Dinas Dukcapil"
        ]
    },
    {
        "Id": 5,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["pindah alamat ktp", "ktp pindah domisili", "cabut berkas ktp", "ganti alamat ktp"],
        "prosedur": [
            "Minta Surat Keterangan Pindah Warga Negara Indonesia (SKPWNI) dari Dukcapil daerah asal.",
            "Bawa SKPWNI dan KTP asli lama ke Kantor Dukcapil daerah tujuan.",
            "Siapkan fotokopi Kartu Keluarga (KK) tujuan jika menumpang KK, atau buat KK baru jika membuat keluarga sendiri.",
            "Ajukan permohonan penerbitan KTP-el baru dengan alamat domisili yang sudah diperbarui."
        ],
        "lembaga": [
            "Dinas Dukcapil Asal",
            "Dinas Dukcapil Tujuan"
        ]
    },
    {
        "Id": 6,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["ktp digital", "cara daftar ikd", "aplikasi ktp online", "aktivasi ktp di hp"],
        "prosedur": [
            "Unduh aplikasi Identitas Kependudukan Digital (IKD) di Google Play Store atau App Store.",
            "Masukkan NIK, alamat email aktif, dan nomor ponsel yang terdaftar.",
            "Lakukan swafoto (face recognition) untuk verifikasi wajah.",
            "Datang ke Kantor Kecamatan atau Dinas Dukcapil untuk memindai (scan) QR Code aktivasi petugas.",
            "Buka email untuk menyalin PIN aktivasi dan masukkan ke aplikasi untuk mengaktifkan KTP digital."
        ],
        "lembaga": [
            "Kantor Kecamatan / Dinas Dukcapil"
        ]
    },
    {
        "Id": 7,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["nik tidak terdaftar", "nik tidak aktif di bank/bpjs", "sinkronisasi nik", "update data dukcapil"],
        "prosedur": [
            "Siapkan nomor NIK dan nomor Kartu Keluarga (KK) yang bermasalah (tidak terbaca di BPJS/Bank/Lembaga lain).",
            "Hubungi nomor WhatsApp/Call Center resmi pengaduan Dinas Dukcapil setempat atau pusat.",
            "Jika respon lambat, datang langsung ke loket pengaduan data di Kantor Dinas Dukcapil.",
            "Serahkan dokumen untuk dilakukan konsolidasi data ke server pusat.",
            "Tunggu waktu sinkronisasi maksimal 1x24 jam sebelum mencoba kembali di instansi terkait."
        ],
        "lembaga": [
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 8,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["cetak ktp luar kota", "urus ktp beda domisili", "bikin ktp di perantauan"],
        "prosedur": [
            "Datang ke Kantor Dinas Dukcapil di kota perantauan (luar domisili asal).",
            "Bawa KTP-el asli yang lama atau fotokopi Kartu Keluarga (KK) asal.",
            "Pastikan tidak ada perubahan elemen data (nama, status, dll) pada KTP yang akan dicetak.",
            "Petugas akan memverifikasi data dan memeriksa ketersediaan blangko luar domisili.",
            "Tunggu antrean pencetakan KTP-el baru tanpa perlu pulang ke kampung halaman."
        ],
        "lembaga": [
            "Dinas Dukcapil Tujuan / Perantauan"
        ]
    },
    {
        "Id": 9,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["rekam ktp di rumah", "bikin ktp orang sakit", "rekam ktp lansia", "dukcapil jemput bola"],
        "prosedur": [
            "Pihak keluarga atau pengurus RT/RW membuat surat permohonan layanan perekaman KTP-el di rumah bagi lansia/sakit/disabilitas.",
            "Serahkan surat permohonan beserta fotokopi KK ke Kantor Dinas Dukcapil setempat.",
            "Petugas Dukcapil akan memverifikasi dan menjadwalkan waktu kunjungan.",
            "Tim mobile Dukcapil datang ke lokasi rumah warga untuk melakukan perekaman biometrik (foto, sidik jari, iris mata).",
            "KTP-el yang sudah dicetak akan diantarkan kembali oleh petugas atau melalui pihak kelurahan/RT."
        ],
        "lembaga": [
            "RT/RW",
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 10,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["nik ganda", "data ktp ganda", "punya 2 nik", "hapus nik ganda"],
        "prosedur": [
            "Datang langsung ke Kantor Dinas Dukcapil pusat kabupaten/kota (tidak bisa diwakilkan).",
            "Bawa dokumen otentik asli seperti KK, Akta Kelahiran, atau Ijazah sekolah.",
            "Lakukan pengecekan biometrik ulang (sidik jari dan iris mata) di loket pengaduan untuk mendeteksi data yang ganda.",
            "Pilih salah satu data NIK yang sah dan sering digunakan untuk dipertahankan.",
            "Petugas akan menghapus data ganda yang tidak valid dan mengaktifkan kembali NIK tunggal Anda."
        ],
        "lembaga": [
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 11,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["ktp wna", "ktp untuk orang asing", "syarat wna punya ktp"],
        "prosedur": [
            "Pastikan Warga Negara Asing (WNA) sudah memiliki Kartu Izin Tinggal Tetap (KITAP) yang dikeluarkan Imigrasi.",
            "Siapkan Paspor asli, KITAP asli, dan Surat Keterangan Tempat Tinggal (SKTT).",
            "Datang ke Kantor Dinas Dukcapil setempat membawa seluruh berkas persyaratan.",
            "Isi formulir permohonan KTP-el bagi orang asing.",
            "Lakukan proses perekaman data biometrik dan tunggu hingga KTP-el khusus WNA diterbitkan."
        ],
        "lembaga": [
            "Ditjen Imigrasi",
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 12,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["ambil ktp diwakilkan", "surat kuasa ambil ktp", "syarat ambil ktp orang lain"],
        "prosedur": [
            "Buat Surat Kuasa resmi di atas meterai Rp10.000 yang ditandatangani oleh pemilik KTP asli.",
            "Tuliskan alasan logis pada surat kuasa mengapa pengambilan fisik KTP harus diwakilkan (misal: sakit, bekerja di luar kota).",
            "Bawa fotokopi KK pemilik KTP dan KTP asli pihak penerima kuasa.",
            "Datang ke loket pengambilan KTP di Kantor Kecamatan atau Dinas Dukcapil.",
            "Serahkan berkas surat kuasa beserta kelengkapannya ke petugas untuk mengambil fisik KTP-el."
        ],
        "lembaga": [
            "Kantor Kecamatan / Dinas Dukcapil"
        ]
    },
    {
        "Id": 13,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["bikin ktp di luar negeri", "urus ktp di kbri", "perekaman ktp luar negeri"],
        "prosedur": [
            "Kunjungi Kantor KBRI atau KJRI di negara tempat Anda berdomisili saat ini.",
            "Bawa Paspor RI yang masih berlaku dan kartu izin tinggal di luar negeri.",
            "Bawa fotokopi KK atau KTP lama jika dokumen tersebut masih Anda miliki.",
            "Lakukan pendaftaran pada portal Peduli WNI dan ajukan permohonan pembaruan data/perekaman KTP-el.",
            "Lakukan perekaman biometrik di loket layanan KBRI/KJRI yang sudah terintegrasi dengan sistem Dukcapil pusat."
        ],
        "lembaga": [
            "KBRI / KJRI",
            "Ditjen Dukcapil Kemendagri"
        ]
    },
    {
        "Id": 14,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["cek status ktp", "cek ktp sudah dicetak atau belum", "lacak e-ktp"],
        "prosedur": [
            "Akses kanal layanan online resmi Dukcapil daerah (website, aplikasi, atau nomor WhatsApp SIAK).",
            "Masukkan 16 digit Nomor Induk Kependudukan (NIK) Anda pada kolom pencarian atau format pesan.",
            "Periksa hasil status KTP-el yang tertera (contoh: PRR / Print Ready Record, Sent for Enrollment, atau Suket).",
            "Jika status sudah menunjukkan 'PRR' atau 'Siap Cetak', Anda bisa langsung datang ke tempat perekaman untuk mengambil fisik KTP."
        ],
        "lembaga": [
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 15,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["ganti ktp lama", "ubah ktp kertas ke e-ktp", "ktp belum elektronik"],
        "prosedur": [
            "Bawa fisik KTP non-elektronik (KTP lama / KTP SIAK) yang asli.",
            "Siapkan fotokopi Kartu Keluarga (KK) terbaru yang sudah menggunakan barcode.",
            "Datang ke Kantor Kecamatan atau Dinas Dukcapil terdekat.",
            "Serahkan dokumen ke petugas loket untuk proses pengalihan data menjadi KTP-el.",
            "Lakukan perekaman data biometrik baru (foto wajah, sidik jari, iris mata) karena KTP lama belum memuat data tersebut."
        ],
        "lembaga": [
            "Kantor Kecamatan / Dinas Dukcapil"
        ]
    },

    // --- Bagian 2: KK ---
    {
        "Id": 16,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["buat kk baru setelah menikah", "bikin kk pasangan baru", "syarat kk baru pengantin baru"],
        "prosedur": [
            "Siapkan KK asli orang tua dari pihak suami dan istri.",
            "Siapkan Buku Nikah atau Akta Perkawinan asli beserta fotokopi.",
            "Datang ke Kantor Kecamatan atau Dinas Dukcapil setempat.",
            "Isi formulir permohonan pembuatan KK baru (F-1.01) untuk pasangan yang baru menikah.",
            "Petugas akan memproses penerbitan KK baru terpisah dari orang tua."
        ],
        "lembaga": [
            "Kantor Kecamatan / Dinas Dukcapil"
        ]
    },
    {
        "Id": 17,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["kk hilang", "cara urus kartu keluarga hilang", "syarat cetak ulang kk hilang"],
        "prosedur": [
            "Minta surat pengantar kehilangan KK dari RT/RW setempat.",
            "Bawa surat pengantar ke Polsek untuk dibuatkan Surat Keterangan Kehilangan KK.",
            "Siapkan fotokopi KK yang hilang (jika ada) atau KTP elektronik salah satu anggota keluarga.",
            "Bawa dokumen tersebut ke loket pelayanan Dinas Dukcapil atau Kecamatan untuk mengajukan cetak ulang."
        ],
        "lembaga": [
            "RT/RW",
            "Polsek",
            "Kantor Kecamatan / Dinas Dukcapil"
        ]
    },
    {
        "Id": 18,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["kk rusak", "kartu keluarga robek", "ganti kk pudar", "cetak ulang kk rusak"],
        "prosedur": [
            "Bawa fisik dokumen KK asli yang sudah rusak, robek, atau tulisannya pudar.",
            "Siapkan fotokopi KTP-el dari kepala keluarga atau salah satu anggota keluarga.",
            "Datang ke Kantor Kecamatan atau Dinas Dukcapil.",
            "Isi formulir permohonan penggantian KK karena rusak tanpa adanya perubahan data.",
            "Serahkan KK yang rusak ke petugas untuk diganti dengan lembar KK baru."
        ],
        "lembaga": [
            "Kantor Kecamatan / Dinas Dukcapil"
        ]
    },
    {
        "Id": 19,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["tambah anak di kk", "masukin bayi ke kartu keluarga", "syarat kk setelah melahirkan"],
        "prosedur": [
            "Siapkan dokumen KK asli yang berlaku saat ini.",
            "Bawa Surat Keterangan Kelahiran asli dari Rumah Sakit, Puskesmas, atau Bidan.",
            "Siapkan fotokopi Buku Nikah atau Akta Perkawinan orang tua.",
            "Isi formulir penambahan anggota keluarga di Kantor Kecamatan atau Dukcapil.",
            "Petugas akan memproses update data KK sekaligus menerbitkan Akta Kelahiran anak."
        ],
        "lembaga": [
            "Kantor Kecamatan / Dinas Dukcapil"
        ]
    },
    {
        "Id": 20,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["hapus nama anggota kk meninggal", "syarat urus kk kematian", "kurangi anggota kk"],
        "prosedur": [
            "Siapkan dokumen KK asli keluarga.",
            "Bawa Surat Keterangan Kematian dari Dokter/Rumah Sakit atau dari pihak Kelurahan.",
            "Bawa KTP-el asli milik anggota keluarga yang meninggal dunia untuk dinonaktifkan.",
            "Isi formulir pengurangan anggota keluarga di Kantor Dinas Dukcapil.",
            "Tunggu petugas mencetak KK baru yang sudah menghapus nama anggota yang meninggal dunia."
        ],
        "lembaga": [
            "Kantor Kelurahan",
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 21,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["pindah alamat kartu keluarga", "pindah kk antar daerah", "cabut berkas kk"],
        "prosedur": [
            "Urus Surat Keterangan Pindah Warga Negara Indonesia (SKPWNI) dari Dinas Dukcapil daerah asal.",
            "Serahkan KK asli lama ke Dukcapil asal untuk ditarik dari peredaran.",
            "Bawa dokumen SKPWNI tersebut ke Dinas Dukcapil atau Kecamatan daerah tujuan.",
            "Isi formulir permohonan pembuatan KK baru dengan alamat domisili yang baru."
        ],
        "lembaga": [
            "Dinas Dukcapil Asal",
            "Dinas Dukcapil Tujuan"
        ]
    },
    {
        "Id": 22,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["pisah kk mandiri", "bikin kk sendiri belum menikah", "cara memisahkan diri dari kk orang tua"],
        "prosedur": [
            "Pastikan pemohon sudah berusia dewasa dan mandiri (meskipun belum menikah).",
            "Bawa KK asli orang tua yang di dalamnya masih tercantum nama pemohon.",
            "Siapkan KTP-el asli milik pemohon.",
            "Datang ke loket Dinas Dukcapil dan isi formulir permohonan pisah KK mandiri.",
            "Petugas akan menerbitkan KK baru untuk pemohon dan mengedit KK lama orang tua."
        ],
        "lembaga": [
            "Dinas Dukcapil / Kantor Kecamatan"
        ]
    },
    {
        "Id": 23,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["pisah kk setelah cerai", "ganti status kk cerai hidup", "urus kk pasca perceraian"],
        "prosedur": [
            "Siapkan KK asli lama yang masih menggabungkan data suami dan istri.",
            "Bawa Akta Cerai asli dari Pengadilan Agama atau Pengadilan Negeri beserta fotokopinya.",
            "Sepakati siapa yang akan tetap memegang nomor KK lama dan siapa yang membuat nomor KK baru.",
            "Isi formulir perubahan KK akibat perceraian di Dinas Dukcapil.",
            "Petugas akan memproses pencetakan menjadi dua lembar KK yang terpisah."
        ],
        "lembaga": [
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 24,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["kk barcode", "ganti kartu keluarga tte", "ubah kk lama ke qr code"],
        "prosedur": [
            "Bawa fisik KK asli lama yang masih ditandatangani manual (tanda tangan basah) dan menggunakan stempel dinas.",
            "Siapkan fotokopi KTP-el seluruh anggota keluarga yang terdaftar di KK.",
            "Datang ke Kecamatan atau ajukan secara daring melalui aplikasi pelayanan Dukcapil mandiri.",
            "Petugas melakukan digitalisasi data ke sistem SIAK terpusat.",
            "Unduh atau terima lembar KK baru yang sudah dilengkapi Tanda Tangan Elektronik (TTE) berupa QR Code/Barcode."
        ],
        "lembaga": [
            "Kantor Kecamatan / Dinas Dukcapil"
        ]
    },
    {
        "Id": 25,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["salah nama di kk", "koreksi tanggal lahir di kk", "perbaikan data kartu keluarga"],
        "prosedur": [
            "Siapkan dokumen KK asli yang terdapat kesalahan tulis (misal: salah ejaan nama, salah tanggal lahir, atau salah nama orang tua).",
            "Bawa dokumen dasar hukum pendukung yang datanya valid dan benar (seperti Akta Kelahiran atau Ijazah sekolah).",
            "Isi formulir perubahan elemen data kependudukan di Dinas Dukcapil.",
            "Serahkan seluruh berkas ke petugas loket untuk dilakukan pembetulan data pada sistem.",
            "Tunggu pencetakan KK baru yang datanya sudah sesuai dengan dokumen pendukung."
        ],
        "lembaga": [
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 26,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["memasukkan wna ke kk", "kk campuran wni wna", "syarat suami istri asing masuk kartu keluarga"],
        "prosedur": [
            "Pastikan Warga Negara Asing (WNA) yang menikah dengan WNI sudah memiliki Kartu Izin Tinggal Tetap (KITAP).",
            "Siapkan Paspor asli, KITAP asli, dan Akta Perkawinan.",
            "Bawa KK asli milik pasangan yang berstatus Warga Negara Indonesia (WNI).",
            "Datang ke loket khusus di Kantor Dinas Dukcapil kabupaten/kota.",
            "Isi formulir untuk memasukkan data WNA ke dalam KK WNI sebagai anggota keluarga (status kewarganegaraan tetap WNA)."
        ],
        "lembaga": [
            "Ditjen Imigrasi",
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 27,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["numpang kk", "pindah alamat numpang kartu keluarga", "syarat masuk kk saudara"],
        "prosedur": [
            "Minta surat persetujuan/izin tertulis bermeterai dari kepala keluarga yang akan ditumpangi alamatnya.",
            "Bawa dokumen KK asli dari keluarga yang akan ditumpangi.",
            "Bawa KK asli asal atau Surat Keterangan Pindah (SKPWNI) jika warga yang menumpang berasal dari luar daerah.",
            "Datang bersama-sama atau membawa surat kuasa ke loket pelayanan Kantor Kecamatan.",
            "Isi formulir F-1.01 untuk proses penggabungan anggota keluarga ke dalam KK tersebut."
        ],
        "lembaga": [
            "Kantor Kecamatan / Dinas Dukcapil"
        ]
    },
    {
        "Id": 28,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["cetak kk mandiri online", "download pdf kk", "cara cetak kartu keluarga sendiri di rumah"],
        "prosedur": [
            "Lakukan registrasi dan ajukan permohonan layanan cetak KK mandiri melalui aplikasi atau website resmi Dukcapil daerah setempat.",
            "Pastikan KK Anda sudah berstatus Tanda Tangan Elektronik (menggunakan QR Code).",
            "Setelah pengajuan diverifikasi dan disetujui, periksa pesan masuk pada email terdaftar yang dikirim oleh Ditjen Dukcapil.",
            "Unduh file dokumen KK yang berformat PDF.",
            "Cetak dokumen KK tersebut secara mandiri menggunakan kertas HVS putih ukuran A4 80 gram (sah secara hukum tanpa legalisir)."
        ],
        "lembaga": [
            "Dinas Dukcapil (Layanan Daring)"
        ]
    },
    {
        "Id": 29,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["ubah status pekerjaan di kk", "update status pendidikan kartu keluarga", "ganti status kk"],
        "prosedur": [
            "Siapkan lembar KK asli yang ingin diperbarui kolom statusnya (pendidikan atau pekerjaan).",
            "Bawa dokumen otentik bukti perubahan (contoh: Ijazah kelulusan terbaru jika status sekolah berubah, atau SK PNS/Surat Keterangan Kerja).",
            "Isi formulir perubahan data kependudukan di Kantor Kecamatan atau loket Dukcapil.",
            "Serahkan berkas agar petugas memperbarui data pekerjaan/pendidikan di server SIAK.",
            "Terima lembar KK baru yang sudah menampilkan status terbaru anggota keluarga."
        ],
        "lembaga": [
            "Kantor Kecamatan / Dinas Dukcapil"
        ]
    },
    {
        "Id": 30,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["kk ganda", "nomor kartu keluarga tidak terdaftar", "nik kk tidak sinkron", "pengaduan data kk"],
        "prosedur": [
            "Bawa semua fisik dokumen KK yang terindikasi ganda atau bermasalah (tidak sinkron saat mendaftar BPJS/Bank).",
            "Siapkan dokumen dasar pendukung berupa Akta Kelahiran dan Ijazah asli milik seluruh anggota keluarga.",
            "Laporkan permasalahan tersebut secara tatap muka ke loket Pengaduan Data di Dinas Dukcapil pusat kabupaten/kota.",
            "Petugas akan melacak riwayat data di sistem pusat untuk menghapus salah satu nomor KK/NIK yang tidak valid.",
            "Tunggu proses konsolidasi data agar status KK kembali menjadi tunggal dan aktif secara nasional."
        ],
        "lembaga": [
            "Dinas Dukcapil"
        ]
    },

    // --- Bagian 3: AKTE KELAHIRAN ---
    {
        "Id": 31,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["bikin akta kelahiran baru", "cara buat akta lahir anak", "syarat buat akta kelahiran"],
        "prosedur": [
            "Siapkan Surat Keterangan Kelahiran asli dari Rumah Sakit, Puskesmas, atau Bidan.",
            "Siapkan Buku Nikah atau Akta Perkawinan orang tua asli dan fotokopi.",
            "Siapkan Kartu Keluarga (KK) asli tempat anak akan dimasukkan.",
            "Bawa berkas ke Kantor Kecamatan atau Dinas Dukcapil.",
            "Isi formulir permohonan Akta Kelahiran (F-2.01) untuk memproses pencetakan akta."
        ],
        "lembaga": [
            "Kantor Kecamatan / Dinas Dukcapil"
        ]
    },
    {
        "Id": 32,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["akta kelahiran hilang", "cara urus akta lahir hilang", "syarat cetak ulang akta kelahiran hilang"],
        "prosedur": [
            "Datang ke Polsek setempat untuk membuat Surat Keterangan Kehilangan Akta Kelahiran.",
            "Siapkan fotokopi Kartu Keluarga (KK) dan KTP-el pemilik akta atau orang tua.",
            "Bawa fotokopi Akta Kelahiran yang hilang jika dokumen tersebut masih dimiliki.",
            "Kunjungi Kantor Dinas Dukcapil tempat akta tersebut dahulu diterbitkan.",
            "Serahkan dokumen ke loket pelayanan untuk penerbitan kutipan akta kedua karena hilang."
        ],
        "lembaga": [
            "Polsek",
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 33,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["akta kelahiran rusak", "ganti akta lahir robek", "cetak ulang akta kelahiran rusak"],
        "prosedur": [
            "Bawa fisik Akta Kelahiran asli yang mengalami kerusakan (robek, terbakar, atau luntur).",
            "Siapkan fotokopi Kartu Keluarga (KK) terbaru.",
            "Datang langsung ke loket pelayanan Dinas Dukcapil kabupaten/kota.",
            "Isi formulir permohonan penggantian dokumen karena rusak.",
            "Serahkan dokumen lama yang rusak untuk ditukar dengan Akta Kelahiran baru."
        ],
        "lembaga": [
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 34,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["telat bikin akta kelahiran", "denda keterlambatan akta lahir", "cara buat akta kelahiran yang terlambat"],
        "prosedur": [
            "Siapkan dokumen persyaratan dasar (Surat Kelahiran, Buku Nikah, KK, dan KTP orang tua).",
            "Jika pelaporan lewat dari 60 hari sejak kelahiran, datangi Dinas Dukcapil setempat.",
            "Isi formulir pernyataan terlambat melapor (beberapa daerah menerapkan denda administratif sesuai perda setempat).",
            "Jika tidak memiliki Surat Keterangan Kelahiran dari medis, buat Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) Kebenaran Data Kelahiran.",
            "Petugas memproses verifikasi berkas dan menerbitkan Akta Kelahiran anak."
        ],
        "lembaga": [
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 35,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["salah ketik akta kelahiran", "koreksi nama di akta lahir", "perbaikan tanggal lahir di akta"],
        "prosedur": [
            "Siapkan Akta Kelahiran asli yang terdapat kesalahan redaksional (salah ketik huruf nama atau tanggal lahir).",
            "Bawa dokumen pembanding yang valid (seperti Kartu Keluarga, Ijazah sekolah, atau Buku Nikah orang tua).",
            "Datang ke Kantor Dinas Dukcapil yang menerbitkan akta tersebut.",
            "Isi formulir permohonan pembetulan akta tanpa penetapan pengadilan (jika kesalahan murni dari petugas).",
            "Tunggu petugas melakukan pembetulan data pada sistem SIAK dan mencetak akta yang benar."
        ],
        "lembaga": [
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 36,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["ganti nama di akta kelahiran", "cara ubah nama di akta lahir", "syarat ganti nama lewat pengadilan"],
        "prosedur": [
            "Ajukan permohonan penggantian/perubahan nama ke Pengadilan Negeri setempat sesuai domisili.",
            "Tunggu proses persidangan hingga mendapatkan Salinan Penetapan Pengadilan Negeri yang berkekuatan hukum tetap.",
            "Bawa Salinan Penetapan Pengadilan tersebut ke Kantor Dinas Dukcapil.",
            "Bawa Akta Kelahiran asli yang lama, KK, dan KTP-el.",
            "Petugas akan memberikan catatan pinggir pada akta lama atau menerbitkan Akta Kelahiran baru dengan nama yang diubah."
        ],
        "lembaga": [
            "Pengadilan Negeri",
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 37,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["akta kelahiran anak nikah siri", "bikin akta lahir perkawinan belum tercatat", "sptjm akta kelahiran nikah siri"],
        "prosedur": [
            "Siapkan Surat Keterangan Kelahiran anak dari medis dan Kartu Keluarga (KK) orang tua.",
            "Buat Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) Kebenaran Pasangan Suami Istri dengan saksi-saksi.",
            "Datang ke Kantor Dinas Dukcapil membawa dokumen persyaratan.",
            "Ajukan pembuatan Akta Kelahiran anak dari perkawinan belum tercatat negara.",
            "Petugas akan menerbitkan akta dengan frasa khusus yang menjelaskan status perkawinan orang tua belum tercatat."
        ],
        "lembaga": [
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 38,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["akta kelahiran anak tanpa nama ayah", "bikin akta lahir hanya nama ibu", "akta kelahiran orang tua tunggal"],
        "prosedur": [
            "Siapkan KK Ibu dan KTP-el asli milik Ibu kandung.",
            "Bawa Surat Keterangan Kelahiran asli dari RS/Bidan yang mencantumkan nama ibu.",
            "Jika tidak ada surat medis, isi formulir SPTJM Asal Usul Anak dengan dua orang saksi.",
            "Datang ke loket pelayanan Dinas Dukcapil kabupaten/kota.",
            "Petugas akan memproses Akta Kelahiran anak yang hanya mencantumkan nama Ibu kandung saja."
        ],
        "lembaga": [
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 39,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["bikin akta kelahiran orang dewasa", "buat akta lahir sudah besar", "cara mengurus akta kelahiran dewasa"],
        "prosedur": [
            "Siapkan KTP-el mandiri dan Kartu Keluarga (KK) pendaftar.",
            "Bawa Ijazah sekolah dasar/menengah/akhir sebagai dokumen acuan kebenaran data diri.",
            "Siapkan Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) Kelahiran jika surat lahir dari bidan/RS sudah hilang.",
            "Datang ke Kantor Dinas Dukcapil setempat sesuai alamat KTP saat ini.",
            "Isi formulir pendaftaran akta untuk orang dewasa dan serahkan berkas ke petugas."
        ],
        "lembaga": [
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 40,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["bikin akta kelahiran online", "cara buat akta lahir lewat aplikasi", "daftar akta kelahiran daring"],
        "prosedur": [
            "Buka situs web resmi layanan online Dukcapil daerah atau unduh aplikasi android resmi setempat.",
            "Lakukan registrasi akun menggunakan NIK Kepala Keluarga dan alamat email aktif.",
            "Pilih menu 'Layanan Akta Kelahiran' pada beranda aplikasi.",
            "Unggah hasil pindai (scan) dokumen persyaratan (Surat Lahir, Buku Nikah, KK) dalam format JPG atau PDF.",
            "Pantau status pengajuan hingga mendapatkan notifikasi persetujuan dari petugas digital."
        ],
        "lembaga": [
            "Dinas Dukcapil (Layanan Elektronik)"
        ]
    },
    {
        "Id": 41,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["cara cetak akta kelahiran sendiri", "download pdf akta kelahiran", "cetak akta lahir hvs a4"],
        "prosedur": [
            "Pastikan pengajuan akta (baru atau hilang) secara online telah disetujui oleh Dukcapil.",
            "Buka tautan unduhan dokumen yang dikirimkan oleh sistem Ditjen Dukcapil Kemendagri ke email Anda.",
            "Unduh file dokumen Akta Kelahiran dalam format PDF yang memiliki tanda tangan elektronik (QR Code).",
            "Siapkan kertas HVS putih polos ukuran A4 dengan berat minimal 80 gram.",
            "Cetak file PDF tersebut menggunakan printer secara mandiri (sah tanpa memerlukan cap/legalisir basah)."
        ],
        "lembaga": [
            "Ditjen Dukcapil (Sistem Pusat)"
        ]
    },
    {
        "Id": 42,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["akta kelahiran anak temuan", "bikin akta lahir bayi telantar", "urus akta lahir anak angkat dari kepolisian"],
        "prosedur": [
            "Pihak penemu bayi/anak segera melaporkan kejadian penemuan anak ke Polsek terdekat.",
            "Dapatkan dokumen Berita Acara Pemeriksaan (BAP) penemuan anak dari kepolisian.",
            "Minta surat keterangan dari Dinas Sosial atau lembaga pengasuhan anak resmi.",
            "Bawa berkas BAP dan surat keterangan tersebut ke Kantor Dinas Dukcapil.",
            "Petugas akan menerbitkan Akta Kelahiran anak telantar dengan nama yang ditentukan oleh instansi penemu."
        ],
        "lembaga": [
            "Polsek",
            "Dinas Sosial",
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 43,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["akta kelahiran anak angkat", "adopsi anak di akta kelahiran", "catatan pinggir akta lahir adopsi"],
        "prosedur": [
            "Dapatkan Salinan Penetapan Pengadilan tentang Pengangkatan Anak (Adopsi) yang sah.",
            "Bawa Akta Kelahiran asli anak (nama orang tua kandung) yang diterbitkan sebelumnya.",
            "Bawa KK dan KTP-el orang tua angkat ke Kantor Dinas Dukcapil.",
            "Serahkan dokumen ke petugas untuk proses pembuatan Catatan Pinggir pengangkatan anak.",
            "Petugas akan memperbarui akta kelahiran lama dengan menambahkan keterangan formal mengenai status adopsi tersebut."
        ],
        "lembaga": [
            "Pengadilan Negeri",
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 44,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["akta kelahiran anak lahir di luar negeri", "pelaporan kelahiran luar negeri", "bikin akta lahir anak dari luar negeri"],
        "prosedur": [
            "Pastikan kelahiran anak WNI sudah dilaporkan ke KBRI atau KJRI di negara tempat anak lahir.",
            "Bawa Surat Keterangan Lahir dari KBRI/KJRI, Paspor anak, dan dokumen kelahiran asing ke Indonesia.",
            "Datang ke Kantor Dinas Dukcapil tempat domisili orang tua di Indonesia (maksimal 30 hari setelah tiba).",
            "Serahkan berkas beserta KK dan Akta Perkawinan orang tua.",
            "Petugas akan menerbitkan Surat Keterangan Pelaporan Kelahiran Luar Negeri (bukan akta baru, melainkan register pencatatan)."
        ],
        "lembaga": [
            "KBRI / KJRI",
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 45,
        "kategori": "Administrasi Kependudukan",
        "kata_kunci": ["akta kelahiran anak wna", "buat akta lahir orang asing", "syarat akta kelahiran untuk wna"],
        "prosedur": [
            "Siapkan Surat Keterangan Kelahiran anak dari Rumah Sakit di Indonesia.",
            "Bawa fotokopi Paspor kedua orang tua yang berstatus Warga Negara Asing (WNA).",
            "Sertakan fotokopi KITAS atau KITAP orang tua yang masih berlaku dari Imigrasi.",
            "Bawa Akta Perkawinan atau dokumen pernikahan orang tua yang sah beserta terjemahan resminya.",
            "Datang ke Dinas Dukcapil untuk mendaftarkan dan menerbitkan Akta Kelahiran khusus anak asing."
        ],
        "lembaga": [
            "Ditjen Imigrasi",
            "Dinas Dukcapil"
        ]
    },
// --- Bagian 4: SURAT TANAH ---
    {
        "Id": 46,
        "kategori": "Administrasi Pertanahan",
        "kata_kunci": ["cara membuat sertifikat tanah", "bikin sertifikat tanah pertama kali", "syarat pendaftaran tanah pertama kali"],
        "prosedur": [
            "Siapkan dokumen bukti kepemilikan tanah (Girik/Letter C/Akta) dan fotokopi KTP/KK.",
            "Datang ke loket pelayanan Kantor Pertanahan (BPN) sesuai lokasi tanah.",
            "Isi formulir permohonan hak dan bayar biaya Penerimaan Negara Bukan Pajak (PNBP) untuk pengukuran.",
            "Tunggu petugas BPN melakukan pengukuran tanah dan pemasangan tanda batas di lokasi.",
            "Penerbitan Surat Keputusan (SK) Hak, dilanjutkan dengan pembukuan dan penerbitan sertifikat tanah baru."
        ],
        "lembaga": [
            "Kantor Pertanahan (BPN)"
        ]
    },
    {
        "Id": 47,
        "kategori": "Administrasi Pertanahan",
        "kata_kunci": ["sertifikat tanah hilang", "cara urus sertifikat tanah hilang", "syarat ganti sertifikat tanah hilang"],
        "prosedur": [
            "Laporkan kehilangan sertifikat ke Kepolisian (Polsek/Polres) untuk mendapatkan Surat Tanda Penerimaan Laporan Kehilangan.",
            "Ajukan permohonan sertifikat pengganti ke BPN dengan membawa KTP, KK, dan bukti pengumuman kehilangan.",
            "Lakukan pengambilan sumpah di hadapan Kepala Kantor Pertanahan mengenai hilangnya sertifikat tersebut.",
            "BPN akan memasang pengumuman kehilangan di media massa (koran) selama 30 hari untuk memastikan tidak ada sanggahan dari pihak lain.",
            "Jika dalam waktu 30 hari tidak ada klaim/sanggahan, BPN akan mencetak dan menerbitkan sertifikat pengganti."
        ],
        "lembaga": [
            "Kepolisian",
            "Media Massa (Koran)",
            "Kantor Pertanahan (BPN)"
        ]
    },
    {
        "Id": 48,
        "kategori": "Administrasi Pertanahan",
        "kata_kunci": ["sertifikat tanah rusak", "ganti sertifikat tanah robek", "cetak ulang sertifikat tanah pudar"],
        "prosedur": [
            "Bawa fisik sertifikat tanah asli yang mengalami kerusakan (misal: robek, pudar, atau terkena banjir).",
            "Siapkan fotokopi KTP-el dan Kartu Keluarga (KK) pemilik hak atas tanah.",
            "Datang ke Kantor Pertanahan (BPN) setempat dan isi formulir permohonan penggantian sertifikat karena rusak.",
            "Petugas BPN akan melakukan verifikasi dan mencocokkan fisik sertifikat yang rusak dengan Buku Tanah yang tersimpan di arsip.",
            "Sertifikat lama yang rusak ditarik/dimusnahkan, lalu petugas menerbitkan fisik sertifikat baru yang bersih."
        ],
        "lembaga": [
            "Kantor Pertanahan (BPN)"
        ]
    },
    {
        "Id": 49,
        "kategori": "Administrasi Pertanahan",
        "kata_kunci": ["balik nama sertifikat tanah warisan", "turun waris sertifikat tanah", "cara mengurus tanah warisan"],
        "prosedur": [
            "Buat Surat Tanda Bukti Ahli Waris yang disahkan oleh pejabat berwenang (Kelurahan/Kecamatan atau Notaris).",
            "Lakukan perhitungan dan pembayaran Bea Perolehan Hak atas Tanah dan Bangunan karena Waris (BPHTB Waris).",
            "Siapkan sertifikat tanah asli, KTP seluruh ahli waris, serta Surat Kematian pemilik tanah awal.",
            "Datang ke Kantor Pertanahan (BPN) untuk mendaftarkan peralihan hak karena pewarisan.",
            "Petugas akan mencoret nama pemilik lama pada sertifikat dan menggantinya dengan nama-nama ahli waris yang sah."
        ],
        "lembaga": [
            "Kantor Kelurahan / Kecamatan",
            "Kantor Pertanahan (BPN)"
        ]
    },
    {
        "Id": 50,
        "kategori": "Administrasi Pertanahan",
        "kata_kunci": ["balik nama sertifikat tanah jual beli", "cara mengurus ajb ke sertifikat", "biaya balik nama sertifikat tanah"],
        "prosedur": [
            "Datang bersama penjual/pembeli ke Pejabat Pembuat Akta Tanah (PPAT) dengan membawa sertifikat asli dan KTP/KK.",
            "Lakukan validasi dan pembayaran Pajak Penghasilan (PPh) oleh penjual serta BPHTB oleh pembeli.",
            "PPAT akan membuat dan menandatangani Akta Jual Beli (AJB) resmi setelah seluruh berkas dinyatakan lengkap.",
            "PPAT menyerahkan berkas AJB beserta sertifikat asli ke Kantor Pertanahan (BPN) untuk proses balik nama.",
            "BPN memproses perubahan data kepemilikan menjadi atas nama pembeli baru pada buku tanah dan sertifikat."
        ],
        "lembaga": [
            "Pejabat Pembuat Akta Tanah (PPAT)",
            "Kantor Pelayanan Pajak (KPP)",
            "Kantor Pertanahan (BPN)"
        ]
    },
    {
        "Id": 51,
        "kategori": "Administrasi Pertanahan",
        "kata_kunci": ["cara membuat akta hibah tanah", "balik nama sertifikat tanah hibah", "syarat hibah tanah ke anak"],
        "prosedur": [
            "Kunjungi Kantor PPAT setempat membawa sertifikat asli, KTP, KK, serta Akta Kelahiran (untuk membuktikan hubungan keluarga).",
            "PPAT menyusun dan mengesahkan Akta Hibah tanah yang ditandatangani oleh pemberi hibah, penerima hibah, dan saksi-saksi.",
            "Bayar pajak BPHTB Hibah sesuai ketentuan nilai jual objek pajak (NJOP) yang berlaku.",
            "Serahkan berkas Akta Hibah dan sertifikat asli ke BPN untuk didaftarkan peralihan haknya.",
            "Tunggu petugas BPN memperbarui kolom nama pemegang hak pada sertifikat tanah menjadi nama penerima hibah."
        ],
        "lembaga": [
            "Pejabat Pembuat Akta Tanah (PPAT)",
            "Kantor Pertanahan (BPN)"
        ]
    },
    {
        "Id": 52,
        "kategori": "Administrasi Pertanahan",
        "kata_kunci": ["mengubah girik menjadi sertifikat", "cara urus tanah letter c ke shm", "bikin sertifikat tanah adat"],
        "prosedur": [
            "Urus Surat Keterangan Riwayat Tanah dan Surat Keterangan Tidak Sengketa di Kantor Kelurahan/Desa asal tanah.",
            "Siapkan bukti asli Girik, Letter C, atau Petuk Pajak Bumi tempo dulu beserta bukti pembayaran PBB tahun terakhir.",
            "Bawa seluruh dokumen tersebut ke Kantor Pertanahan (BPN) untuk mendaftarkan konversi tanah adat menjadi sertifikat.",
            "Petugas BPN akan melakukan verifikasi lapangan, pengukuran fisik tanah, dan pengumuman data yuridis selama 60 hari.",
            "Apabila tidak ada sanggahan dari pihak lain, BPN akan secara resmi menerbitkan Sertifikat Hak Milik (SHM)."
        ],
        "lembaga": [
            "Kantor Kelurahan / Desa",
            "Kantor Pertanahan (BPN)"
        ]
    },
    {
        "Id": 53,
        "kategori": "Administrasi Pertanahan",
        "kata_kunci": ["cara melaporkan sengketa tanah", "pengaduan tanah tumpang tindih", "sertifikat tanah bermasalah"],
        "prosedur": [
            "Ajukan surat pengaduan atau keberatan tertulis mengenai sengketa pertanahan (misal: klaim tumpang tindih) ke loket pengaduan BPN.",
            "Lampirkan bukti-bukti kepemilikan dokumen tanah yang sah serta kronologis kasus secara jelas.",
            "BPN akan mempelajari berkas dan memanggil kedua belah pihak yang bersengketa untuk melakukan mediasi.",
            "Jika mediasi mencapai mufakat, dibuatkan Berita Acara Perdamaian untuk penyesuaian data sertifikat.",
            "Jika mediasi gagal, pihak BPN menyarankan penyelesaian sengketa dilanjutkan melalui jalur gugatan di Pengadilan Negeri atau PTUN."
        ],
        "lembaga": [
            "Kantor Pertanahan (BPN)",
            "Pengadilan Negeri / PTUN"
        ]
    },
    {
        "Id": 54,
        "kategori": "Administrasi Pertanahan",
        "kata_kunci": ["cara memblokir sertifikat tanah", "syarat pengajuan blokir tanah di bpn", "pencegahan sengketa tanah bpn"],
        "prosedur": [
            "Ajukan surat permohonan pencatatan blokir ke Kantor Pertanahan (BPN) untuk mencegah pemindahtanganan sepihak.",
            "Lampirkan dokumen bukti hubungan hukum yang kuat (seperti surat gugatan pengadilan yang teregistrasi atau laporan polisi).",
            "Isi formulir resmi permohonan blokir dan bayar biaya PNBP sesuai ketentuan.",
            "Petugas BPN meninjau berkas dan membukukan catatan blokir pada Buku Tanah jika syarat terpenuhi.",
            "Catatan blokir ini berlaku selama 30 hari kalender dan dapat diperpanjang atas perintah resmi dari penetapan pengadilan."
        ],
        "lembaga": [
            "Kantor Pertanahan (BPN)"
        ]
    },
    {
        "Id": 55,
        "kategori": "Administrasi Pertanahan",
        "kata_kunci": ["cara mengurus roya sertifikat tanah", "cara menghapus hak tanggungan bpn", "syarat roya setelah kpr lunas"],
        "prosedur": [
            "Mintalah Surat Keterangan Lunas (Konsol) dan Sertifikat Hak Tanggungan (SHT) asli dari pihak Bank atau Kreditur setelah cicilan KPR lunas.",
            "Akses aplikasi atau portal online BPN jika ingin mengurus secara digital, atau datang langsung ke loket BPN membawa sertifikat tanah asli.",
            "Isi formulir permohonan pencoretan Hak Tanggungan (Roya) dan serahkan berkas beserta SHT asli.",
            "Petugas BPN memverifikasi dokumen dan melakukan proses penghapusan catatan utang/agunan pada Buku Tanah.",
            "Terima kembali sertifikat tanah asli yang sudah bersih dari catatan beban Hak Tanggungan."
        ],
        "lembaga": [
            "Bank / Lembaga Keuangan",
            "Kantor Pertanahan (BPN)"
        ]
    },
    {
        "Id": 56,
        "kategori": "Administrasi Pertanahan",
        "kata_kunci": ["cara memecah sertifikat tanah", "biaya pemecahan sertifikat tanah induk", "bagi kavling sertifikat tanah"],
        "prosedur": [
            "Pastikan sertifikat tanah induk asli tidak sedang dijaminkan/digadaikan di bank dan bebas dari sengketa.",
            "Siapkan KTP/KK pemilik tanah serta draf rencana tapak/site plan pembagian bidang tanah yang baru.",
            "Ajukan permohonan pemecahan sertifikat ke Kantor Pertanahan (BPN).",
            "Petugas ukur BPN mendatangi lokasi untuk melakukan pengukuran ulang batas-batas pecahan tanah.",
            "BPN menerbitkan sertifikat-sertifikat baru hasil pecahan, sementara sertifikat induk lama akan disesuaikan atau dimatikan."
        ],
        "lembaga": [
            "Kantor Pertanahan (BPN)"
        ]
    },
    {
        "Id": 57,
        "kategori": "Administrasi Pertanahan",
        "kata_kunci": ["cara menggabungkan sertifikat tanah", "syarat penyatuan sertifikat tanah", "gabung dua sertifikat tanah bpn"],
        "prosedur": [
            "Pastikan beberapa bidang tanah yang berdampingan berada di bawah satu nama pemilik tunggal yang sama.",
            "Bawa seluruh fisik sertifikat asli yang ingin digabungkan beserta fotokopi KTP/KK ke BPN.",
            "Isi formulir permohonan penggabungan sertifikat di loket pelayanan.",
            "Petugas akan melakukan pemeriksaan lapangan dan pemetaan ulang untuk menyatukan batas-batas tanah.",
            "BPN menerbitkan satu sertifikat tunggal baru yang memuat total luas akumulasi tanah, serta mematikan sertifikat-sertifikat lama."
        ],
        "lembaga": [
            "Kantor Pertanahan (BPN)"
        ]
    },
    {
        "Id": 58,
        "kategori": "Administrasi Pertanahan",
        "kata_kunci": ["cara cek sertifikat tanah asli", "pengecekan sertifikat tanah di bpn", "mengetahui status sertifikat tanah"],
        "prosedur": [
            "Bawa sertifikat asli yang ingin dicek validitasnya ke Kantor Pertanahan atau mintalah bantuan PPAT.",
            "Lampirkan fotokopi KTP pemilik tanah serta isi formulir permohonan pengecekan sertifikat.",
            "Petugas BPN mencocokkan nomor hak dan data fisik sertifikat dengan daftar Buku Tanah digital di komputer BPN.",
            "Proses ini bertujuan mendeteksi apakah sertifikat tersebut asli, palsu, terblokir, atau memiliki catatan sengketa.",
            "Jika statusnya bersih dan valid, petugas memberikan cap atau tanda resmi 'Telah Diperiksa' pada lembar sertifikat."
        ],
        "lembaga": [
            "Kantor Pertanahan (BPN)",
            "Pejabat Pembuat Akta Tanah (PPAT)"
        ]
    },
    {
        "Id": 59,
        "kategori": "Administrasi Pertanahan",
        "kata_kunci": ["cara mengubah hgb menjadi shm", "syarat peningkatan hak tanah hgb", "perpanjang hgb perumahan"],
        "prosedur": [
            "Pastikan luas tanah dengan status Hak Guna Bangunan (HGB) untuk rumah tinggal berukuran maksimal 600 meter persegi.",
            "Siapkan sertifikat HGB asli yang masih berlaku, fotokopi KTP/KK, dan fotokopi Izin Mendirikan Bangunan (IMB/PBG).",
            "Bawa berkas tersebut ke loket BPN and ajukan permohonan peningkatan hak menjadi Sertifikat Hak Milik (SHM).",
            "Bayar biaya PNBP dan pemasukan ke kas negara atas perubahan status hak tanah tersebut.",
            "Petugas memproses pembaruan status hak pada Buku Tanah dan mencetak sertifikat yang telah berubah menjadi Hak Milik."
        ],
        "lembaga": [
            "Kantor Pertanahan (BPN)"
        ]
    },
    {
        "Id": 60,
        "kategori": "Administrasi Pertanahan",
        "kata_kunci": ["cara ganti sertifikat tanah elektronik", "sertifikat tanah digital bpn", "cara cetak sertifikat el bpn"],
        "prosedur": [
            "Pastikan data spasial sertifikat analog/lama Anda sudah tervalidasi melalui aplikasi Sentuh Tanahku.",
            "Datang ke Kantor Pertanahan (BPN) membawa dokumen sertifikat fisik asli konvensional.",
            "Serahkan berkas ke petugas untuk proses alih media (digitalisasi) ke dalam sistem basis data pertanahan.",
            "Petugas menarik fisik sertifikat analog lama Anda untuk disimpan di gudang arsip negara (dinyatakan tidak berlaku lagi).",
            "BPN mengaktifkan Sertifikat Elektronik (Sertifikat-el) yang dokumen PDF-nya dapat diakses secara mandiri melalui akun digital pemohon."
        ],
        "lembaga": [
            "Kantor Pertanahan (BPN)"
        ]
    },
// --- Bagian 5: TINDAK KEKERASAN ---
    {
        "Id": 61,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melapor kdrt ke polisi", "bantuan hukum korban kekerasan dalam rumah tangga", "prosedur visum kdrt"],
        "prosedur": [
            "Amankan diri dan anak-anak ke tempat yang jauh dari jangkauan pelaku kekerasan.",
            "Kumpulkan bukti-bukti pendukung seperti foto luka fisik, rekaman suara, atau pesan ancaman.",
            "Segera lakukan visum di Rumah Sakit umum terdekat untuk mengamankan bukti medis.",
            "Laporkan kejadian ke Unit Pelayanan Perempuan dan Anak (PPA) di Polres setempat.",
            "Hubungi UPTD PPA atau Lembaga Bantuan Hukum (LBH) untuk mendapatkan pendampingan hukum gratis."
        ],
        "lembaga": [
            "Polres (Unit PPA)",
            "UPTD PPA / DP3A",
            "Lembaga Bantuan Hukum (LBH)"
        ]
    },
    {
        "Id": 62,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan pelecehan seksual", "bukti hukum pelecehan di tempat umum", "layanan aduan korban pelecehan"],
        "prosedur": [
            "Tegur atau beri tindakan tegas kepada pelaku jika situasi aman, atau segera cari pertolongan saksi sekitar.",
            "Simpan semua bukti rekaman CCTV, rekaman suara, pesan teks, atau pakaian yang digunakan saat kejadian.",
            "Laporkan tindak pelecehan seksual ke pihak berwajib atau pos pengaduan resmi di instansi terkait.",
            "Hubungi Komnas Perempuan atau lembaga penyedia layanan psikologis untuk memulihkan kondisi mental.",
            "Gunakan Undang-Undang Tindak Pidana Kekerasan Seksual (UU TPKS) sebagai dasar hukum pelaporan."
        ],
        "lembaga": [
            "Kepolisian",
            "Komnas Perempuan",
            "UPTD PPA"
        ]
    },
    {
        "Id": 63,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["melaporkan penganiayaan fisik", "syarat laporan polisi pemukulan", "cara mengurus visum penganiayaan"],
        "prosedur": [
            "Segera datangi fasilitas kesehatan atau Rumah Sakit terdekat untuk mendapatkan pertolongan medis darurat.",
            "Mintalah dokter yang menangani untuk menerbitkan berkas Rekam Medis awal sebagai acuan.",
            "Datang ke Polsek atau Polres setempat untuk membuat Laporan Polisi (LP) atas tindak penganiayaan fisik.",
            "Mintalah Surat Permintaan Visum (SPV) dari penyidik kepolisian agar pemeriksaan visum dapat diproses hukum.",
            "Sampaikan kronologi kejadian dan serahkan nama-nama saksi yang melihat peristiwa tersebut ke penyidik."
        ],
        "lembaga": [
            "Rumah Sakit",
            "Kepolisian (Polsek/Polres)"
        ]
    },
    {
        "Id": 64,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["prosedur penanganan korban pemerkosaan", "visum et repertum kekerasan seksual", "laporan polisi unit ppa pemerkosaan"],
        "prosedur": [
            "Jangan membersihkan diri, mandi, atau mengganti pakaian terlebih dahulu agar bukti DNA pelaku tidak hilang.",
            "Segera datangi Polres (Unit PPA) atau Rumah Sakit Bhayangkara untuk melaporkan kejadian.",
            "Jalani pemeriksaan medis khusus (visum et repertum obgyn) yang diarahkan oleh penyidik kepolisian.",
            "Minta pendampingan dari psikolog dan penasihat hukum sejak awal proses pembuatan BAP.",
            "Pastikan identitas korban dirahasiakan oleh aparat penegak hukum selama proses peradilan berjalan."
        ],
        "lembaga": [
            "Polres (Unit PPA)",
            "Rumah Sakit Bhayangkara",
            "Lembaga Pendamping Korban"
        ]
    },
    {
        "Id": 65,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["pasal pengeroyokan kuhp", "cara melaporkan pengeroyokan ke polsek", "bukti hukum kasus pengeroyokan"],
        "prosedur": [
            "Segera selamatkan diri ke tempat ramai, pos keamanan, atau kantor polisi terdekat untuk menghindari luka lebih parah.",
            "Lakukan pemeriksaan medis ke fasilitas kesehatan untuk mengobati luka dan membuat visum.",
            "Ingat atau catat ciri-ciri fisik para pelaku, pakaian, kendaraan, serta arah pelarian mereka.",
            "Datang ke Polsek atau Polres setempat untuk membuat laporan tindak pidana pengeroyokan (Pasal 170 KUHP).",
            "Bawa saksi-saksi yang berada di lokasi kejadian (TKP) untuk memperkuat laporan awal."
        ],
        "lembaga": [
            "Kepolisian"
        ]
    },
    {
        "Id": 66,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara mengatasi intimidasi dan ancaman", "melaporkan pengancaman ke polisi", "minta perlindungan lpsk dari intimidasi"],
        "prosedur": [
            "Dokumentasikan secara detail semua bentuk intimidasi, baik berupa pesan teks, video, maupun rekaman suara.",
            "Jangan merespons atau membalas ancaman tersebut dengan kekerasan balik.",
            "Laporkan perbuatan pengancaman tersebut ke pihak kepolisian dengan membawa bukti-bukti digital yang valid.",
            "Jika intimidasi menimbulkan ancaman nyata terhadap keselamatan nyawa, ajukan permohonan perlindungan ke LPSK.",
            "Pasang alat pengaman tambahan seperti CCTV di sekitar rumah jika diperlukan."
        ],
        "lembaga": [
            "Kepolisian",
            "LPSK (Lembaga Perlindungan Saksi dan Korban)"
        ]
    },
    {
        "Id": 67,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan kekerasan pada anak", "hotline pengaduan anak sapa 129", "pendampingan psikologis anak korban kekerasan"],
        "prosedur": [
            "Pisahkan dan amankan anak segera dari lingkungan atau orang yang menjadi pelaku kekerasan.",
            "Bawa anak ke dokter anak atau psikolog untuk memeriksa dampak fisik serta psikologisnya.",
            "Laporkan kasus kekerasan anak ke Unit PPA Polres atau hubungi layanan SAPA 129.",
            "Lakukan koordinasi dengan Komisi Perlindungan Anak Indonesia (KPAI) untuk pengawasan eksternal kasus.",
            "Pastikan anak mendapatkan rehabilitasi mental jangka panjang untuk mengatasi trauma."
        ],
        "lembaga": [
            "Polres (Unit PPA)",
            "Kementerian PPPA (Hotline 129)",
            "KPAI"
        ]
    },
    {
        "Id": 68,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara membuat surat permintaan visum", "prosedur visum di rumah sakit untuk bukti polisi", "biaya visum kekerasan fisik"],
        "prosedur": [
            "Datang langsung ke kantor polisi terdekat (Polsek/Polres) untuk membuat Laporan Polisi (LP) terlebih dahulu.",
            "Mintalah Surat Permintaan Visum (SPV) resmi yang ditandatangani oleh penyidik kepolisian.",
            "Bawa SPV tersebut ke Rumah Sakit pemerintah atau Rumah Sakit Bhayangkara yang ditunjuk.",
            "Jalani pemeriksaan fisik menyeluruh oleh dokter forensik untuk mencatat semua luka akibat kekerasan.",
            "Tunggu dokter menyerahkan hasil Visum et Repertum langsung kepada penyidik polisi sebagai alat bukti sah."
        ],
        "lembaga": [
            "Kepolisian",
            "Rumah Sakit (Instalasi Kedokteran Forensik)"
        ]
    },
    {
        "Id": 69,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara mengajukan perlindungan saksi ke lpsk", "hak perlindungan saksi kasus kriminal", "syarat masuk rumah aman lpsk"],
        "prosedur": [
            "Pastikan saksi tindak kekerasan menerima ancaman atau intimidasi nyata dari pihak pelaku.",
            "Ajukan permohonan perlindungan saksi secara tertulis atau online ke kantor LPSK.",
            "Lampirkan salinan Laporan Polisi, identitas diri, serta bukti adanya ancaman terhadap saksi.",
            "Tim LPSK akan melakukan investigasi lapangan dan penilaian tingkat risiko keamanan.",
            "Saksi yang disetujui akan mendapatkan perlindungan fisik, pengawalan, atau penempatan di rumah aman."
        ],
        "lembaga": [
            "LPSK"
        ]
    },
    {
        "Id": 70,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara mengajukan surat perintah perlindungan pengadilan", "perlindungan korban kdrt hukum", "prosedur hukum menjauhkan pelaku dari korban"],
        "prosedur": [
            "Korban kekerasan (khususnya KDRT) dapat mengajukan permohonan Surat Perintah Perlindungan kepada Pengadilan Negeri.",
            "Permohonan bisa diajukan secara langsung oleh korban, keluarga, atau melalui kuasa hukum/penyidik polisi.",
            "Pengadilan akan menggelar sidang kilat untuk memeriksa urgensi ancaman terhadap korban.",
            "Hakim menerbitkan Surat Penetapan Perintah Perlindungan yang melarang pelaku mendekati korban dalam jarak tertentu.",
            "Serahkan salinan surat penetapan pengadilan tersebut ke kepolisian setempat untuk pengawasan berkala."
        ],
        "lembaga": [
            "Pengadilan Negeri",
            "Kepolisian"
        ]
    },
    {
        "Id": 71,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan bullying di sekolah", "mengatasi perundungan fisik anak", "sanksi hukum pelaku bully sekolah"],
        "prosedur": [
            "Catat secara kronologis setiap tindakan perundungan, termasuk waktu, tempat, dan nama pelaku.",
            "Kumpulkan bukti fisik berupa video kejadian, foto luka memar, atau tangkapan layar di media sosial.",
            "Laporkan kasus ke otoritas tertinggi di lingkungan tempat kejadian (Kepala Sekolah, Dekan Kampus, atau HRD Kantor).",
            "Jika perundungan melibatkan kekerasan fisik atau pemerasan, segera lakukan visum medis.",
            "Bawa bukti dan hasil visum ke kantor polisi setempat untuk memproses pelaku secara pidana."
        ],
        "lembaga": [
            "Manajemen Institusi / Sekolah",
            "Kepolisian"
        ]
    },
    {
        "Id": 72,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["melaporkan cyber bullying ke polda", "cara lapor unit cyber crime polri", "bukti hukum ancaman lewat media sosial"],
        "prosedur": [
            "Ambil tangkapan layar (screenshot) penuh termasuk nama akun, ID, pesan ancaman, atau konten kekerasan.",
            "Simpan tautan (URL) akun pelaku dengan baik sebelum akun tersebut dihapus atau diubah namanya.",
            "Laporkan akun pelaku ke sistem moderasi platform media sosial agar ditangguhkan.",
            "Datang ke Unit Cyber Crime Ditreskrimsus Polda atau Satreskrim Polres setempat.",
            "Ajukan laporan atas dugaan tindak pidana pengancaman kekerasan melalui media elektronik berdasarkan UU ITE."
        ],
        "lembaga": [
            "Kepolisian (Unit Cyber Crime)"
        ]
    },
    {
        "Id": 73,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["layanan psikolog gratis korban kekerasan", "visum et repertum psychiatricum", "pemulihan trauma ptsd pasca kekerasan"],
        "prosedur": [
            "Datang atau hubungi layanan psikolog klinis di UPTD PPA kabupaten/kota atau Poli Psikologi Rumah Sakit.",
            "Ikuti sesi asesmen awal untuk mengukur tingkat trauma psikis (seperti PTSD) pasca-tindak kekerasan.",
            "Jalani terapi pemulihan psikologis secara terjadwal bersama konselor profesional.",
            "Mintalah psikolog/psikiater menerbitkan dokumen hasil pemeriksaan kesehatan jiwa (Visum et Repertum Psychiatricum).",
            "Gunakan dokumen rekam medis psikologis tersebut sebagai alat bukti tambahan kekerasan psikis di pengadilan."
        ],
        "lembaga": [
            "UPTD PPA",
            "Rumah Sakit (Poli Psikologi / Psikiatri)"
        ]
    },
    {
        "Id": 74,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara dapat bantuan hukum gratis lbh", "syarat posbakum pengadilan negeri", "pendampingan pengacara gratis untuk korban"],
        "prosedur": [
            "Siapkan dokumen identitas diri (KTP/KK) beserta bukti awal tindak kekerasan yang dialami.",
            "Urus Surat Keterangan Tidak Mampu (SKTM) di kantor Kelurahan jika ingin mengakses layanan gratis.",
            "Datangi kantor Lembaga Bantuan Hukum (LBH) terakreditasi atau Posbakum di Pengadilan Negeri.",
            "Ajukan permohonan pendampingan hukum terhitung sejak proses penyelidikan di kepolisian.",
            "Advokat LBH akan mendampingi penyusunan berkas, BAP, hingga pembelaan hak korban di persidangan."
        ],
        "lembaga": [
            "Lembaga Bantuan Hukum (LBH)",
            "Pos Bantuan Hukum (Posbakum) Pengadilan"
        ]
    },
    {
        "Id": 75,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara membuat laporan polisi di spkt", "syarat mendapatkan stpl polsek", "cara cek perkembangan kasus sp2hp"],
        "prosedur": [
            "Datang langsung ke Sentra Pelayanan Kepolisian Terpadu (SPKT) di Polsek atau Polres terdekat.",
            "Jelaskan kronologi kejadian tindak kekerasan secara jelas dan jujur kepada petugas piket.",
            "Serahkan bukti pendukung awal (seperti foto luka, senjata yang digunakan pelaku, atau saksi).",
            "Terima berkas resmi Surat Tanda Penerimaan Laporan (STPL) dari petugas SPKT.",
            "Tunggu surat pemberitahuan perkembangan hasil penyelidikan (SP2HP) yang akan dikirim oleh penyidik."
        ],
        "lembaga": [
            "Kepolisian (SPKT)"
        ]
    },
    {
        "Id": 76,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan kasus penyekapan", "evakuasi korban penyekapan polisi", "pasal perampasan kemerdekaan orang"],
        "prosedur": [
            "Keluarga atau saksi mata yang mengetahui penyekapan segera melapor ke nomor darurat polisi atau Polres setempat.",
            "Berikan informasi akurat mengenai lokasi penyekapan, perkiraan jumlah pelaku, dan kondisi korban.",
            "Aparat kepolisian (Tim Jatanras/Resmob) akan melakukan tindakan penggerebekan dan penyelamatan darurat.",
            "Setelah dievakuasi, korban segera dibawa ke Rumah Sakit untuk pemeriksaan kesehatan total dan visum.",
            "Penyidik mengamankan lokasi kejadian (TKP) untuk mencari barang bukti tambahan."
        ],
        "lembaga": [
            "Kepolisian (Satreskrim)"
        ]
    },
    {
        "Id": 77,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["melaporkan kekerasan di tempat kerja", "cara lapor hrd kena kekerasan fisik", "pengaduan kekerasan kerja ke disnaker"],
        "prosedur": [
            "Tulis rincian kejadian mencakup tanggal, jam, lokasi, tindakan kekerasan, dan rekan kerja yang melihat.",
            "Laporkan tindakan kekerasan fisik atau verbal tersebut secara tertulis kepada divisi HRD atau Serikat Pekerja.",
            "Apabila pihak manajemen perusahaan abai, bawa kasus ini ke Dinas Tenaga Kerja (Disnaker) setempat.",
            "Jika kekerasan mengakibatkan cedera fisik atau trauma berat, buat Laporan Polisi atas dugaan tindak pidana.",
            "Gunakan perlindungan hukum ketenagakerjaan dan UU TPKS jika kekerasan mengarah pada area seksual."
        ],
        "lembaga": [
            "HRD Perusahaan / Serikat Pekerja",
            "Dinas Tenaga Kerja",
            "Kepolisian"
        ]
    },
    {
        "Id": 78,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara lapor kekerasan guru ke murid", "pengaduan kekerasan di lingkungan sekolah", "melaporkan kekerasan fisik antar siswa"],
        "prosedur": [
            "Orang tua atau siswa segera melaporkan tindakan kekerasan (guru ke murid atau antar-murid) ke Guru BK atau Kepala Sekolah.",
            "Minta pihak sekolah mengadakan pertemuan resmi dan menjatuhkan sanksi disiplin kepada pelaku.",
            "Jika sekolah menutupi kasus, laporkan ke Dinas Pendidikan tingkat kabupaten/kota atau Komnas Perlindungan Anak.",
            "Bawa korban ke fasilitas medis apabila terdapat luka fisik untuk membuat laporan visum resmi.",
            "Laporkan tindak penganiayaan anak di sekolah ke Unit PPA Polres terdekat."
        ],
        "lembaga": [
            "Pihak Sekolah",
            "Dinas Pendidikan",
            "Polres (Unit PPA)"
        ]
    },
    {
        "Id": 79,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan penelantaran lansia", "perlindungan lansia korban kekerasan dinas sosial", "panti rehabilitasi sosial lansia"],
        "prosedur": [
            "Keluarga dekat, tetangga, atau pendamping mengamankan lansia dari pelaku kekerasan fisik/penelantaran.",
            "Laporkan kasus kekerasan terhadap lansia ke Dinas Sosial atau Lembaga Perlindungan Lanjut Usia setempat.",
            "Bawa lansia ke fasilitas kesehatan untuk memeriksa luka fisik dan kondisi kesehatan mentalnya.",
            "Ajukan laporan pidana penganiayaan atau penelantaran orang yang wajib dilindungi ke kepolisian.",
            "Koordinasikan dengan panti sosial rehabilitasi milik pemerintah jika lansia membutuhkan tempat tinggal aman jangka panjang."
        ],
        "lembaga": [
            "Dinas Sosial",
            "Kepolisian",
            "Lembaga Perlindungan Lansia"
        ]
    },
    {
        "Id": 80,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara lapor ancaman pembunuhan", "pasal pengancaman 368 kuhp", "melindungi diri dari ancaman kriminal"],
        "prosedur": [
            "Simpan bukti ancaman pembunuhan atau kekerasan fisik secara aman (rekaman suara, tulisan, pesan digital).",
            "Hindari pertemuan berdua dengan pelaku tanpa adanya pendamping atau di tempat sepi.",
            "Laporkan ancaman tersebut ke Polsek/Polres dengan mengacu pada Pasal 368 KUHP atau pasal pengancaman.",
            "Beritahukan situasi keamanan Anda kepada Bhabinkamtibmas atau pengurus RT/RW domisili setempat.",
            "Ajukan permintaan perlindungan khusus jika pelaku memiliki rekam jejak kriminal yang berbahaya."
        ],
        "lembaga": [
            "Kepolisian",
            "Bhabinkamtibmas / Pengurus RT/RW"
        ]
    },
    {
        "Id": 81,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan penculikan anak", "laporan polisi orang hilang diculik", "prosedur darurat kasus penculikan resmob"],
        "prosedur": [
            "Keluarga segera melapor ke Polres atau Polda terdekat begitu mendeteksi indikasi penculikan, tanpa perlu menunggu 24 jam.",
            "Serahkan data pribadi korban, foto terbaru, pakaian terakhir yang dikenakan, serta nomor ponsel aktif.",
            "Berikan informasi kepada penyidik mengenai konflik terakhir, riwayat ancaman, atau tuntutan tebusan dari pelaku.",
            "Patuhi instruksi tim siber kepolisian untuk memantau panggilan masuk dari nomor tidak dikenal.",
            "Biarkan tim Opsnal Kepolisian melakukan pelacakan posisi dan penindakan hukum."
        ],
        "lembaga": [
            "Kepolisian (Satreskrim)"
        ]
    },
    {
        "Id": 82,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan penguntit fisik", "hukum menguntit stoking uu tpks", "mengatasi tindakan penguntitan berbahaya"],
        "prosedur": [
            "Catat setiap pola penguntitan, termasuk waktu, tempat, frekuensi, dan tindakan yang dilakukan pelaku.",
            "Ambil foto atau video keberadaan pelaku secara tersembunyi sebagai bukti kuat tindakan penguntitan fisik.",
            "Beri tahu tim keamanan lingkungan rumah/kantor dan keluarga dekat perihal identitas pelaku penguntit.",
            "Datang ke kantor polisi untuk melaporkan perbuatan tidak menyenangkan atau intimidasi psikologis yang mengancam keselamatan.",
            "Gunakan jalur hukum UU TPKS jika penguntitan mengandung unsur obsesi seksual yang merugikan korban."
        ],
        "lembaga": [
            "Kepolisian",
            "Keamanan Lingkungan (Satpam / RT)"
        ]
    },
    {
        "Id": 83,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan kbgo sby", "ancaman sebar foto intim non konsensual", "bantuan hukum safenet korban kbgo"],
        "prosedur": [
            "Jangan menghapus chat, foto, atau video ancaman penyebaran konten intim non-konsensual (balas dendam pornografi).",
            "Putus semua kontak komunikasi dengan pelaku dan ubah pengaturan privasi seluruh akun media sosial Anda.",
            "Hubungi lembaga swadaya masyarakat bidang siber seperti SAFEnet atau Komnas Perempuan untuk mitigasi digital.",
            "Minta bantuan hukum guna menyusun laporan pidana berdasarkan pasal penjeratan UU ITE dan UU TPKS.",
            "Laporkan kasus ke Unit Siber Kepolisian untuk melacak keberadaan pelaku dan memblokir sebaran konten."
        ],
        "lembaga": [
            "SAFEnet",
            "Komnas Perempuan",
            "Kepolisian (Siber)"
        ]
    },
    {
        "Id": 84,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara masuk rumah perlindungan trauma center", "program rehabilitasi sosial korban kekerasan", "bantuan dinas sosial untuk pemulihan korban"],
        "prosedur": [
            "Korban kekerasan mengajukan permohonan rehabilitasi sosial ke Dinas Sosial atau lembaga penampungan resmi.",
            "Petugas pekerja sosial akan melakukan pemetaan kebutuhan intervensi pemulihan bagi korban.",
            "Masuk ke Rumah Perlindungan dan Trauma Center (RPTC) untuk mendapatkan pemulihan fisik dan psikososial.",
            "Ikuti program pelatihan keterampilan hidup (life skills) gratis yang disediakan oleh lembaga negara.",
            "Proses ini berjalan paralel dengan penanganan kasus hukum pelaku di pengadilan."
        ],
        "lembaga": [
            "Dinas Sosial",
            "Rumah Perlindungan dan Trauma Center (RPTC)"
        ]
    },
    {
        "Id": 85,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara mengajukan restitusi korban kekerasan", "ganti kerugian korban tindak pidana lpsk", "syarat permohonan restitusi pengadilan"],
        "prosedur": [
            "Korban melalui penasihat hukum mengajukan permohonan ganti kerugian (restitusi) secara tertulis ke LPSK.",
            "Lampirkan perincian biaya medis, kerugian kehilangan kekayaan/penghasilan, serta penderitaan psikis akibat kekerasan.",
            "Tim ahli LPSK melakukan analisis dan menetapkan nilai nominal restitusi yang wajar secara hukum.",
            "LPSK menyerahkan surat rekomendasi nilai restitusi kepada Jaksa Penuntut Umum (JPU) sebelum sidang tuntutan.",
            "Jaksa memasukkan angka restitusi ke dalam surat tuntutan pidana agar diputuskan oleh Majelis Hakim Pengadilan."
        ],
        "lembaga": [
            "LPSK",
            "Kejaksaan Negeri",
            "Pengadilan Negeri"
        ]
    },
    {
        "Id": 86,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["nomor telepon darurat polisi 110", "hotline aduan kekerasan sapa 129", "cara melaporkan kejadian darurat kriminal"],
        "prosedur": [
            "Apabila sedang mengalami atau melihat tindak kekerasan aktif, segera hubungi nomor darurat Kepolisian di 110.",
            "Sebutkan titik lokasi kejadian secara spesifik, nama korban, serta keberadaan senjata tajam/api jika ada.",
            "Jika kasus melibatkan perempuan/anak, hubungi hotline Sahabat Perempuan dan Anak (SAPA) di nomor 129.",
            "Tetap berada di tempat aman yang terkunci hingga tim reaksi cepat atau patroli polisi tiba di lokasi.",
            "Petugas lapangan akan mengamankan pelaku dan mengevakuasi korban ke tempat perlindungan terdekat."
        ],
        "lembaga": [
            "Kepolisian (Hotline 110)",
            "Kementerian PPPA (Hotline 129)"
        ]
    },
    {
        "Id": 87,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan pemerasan dan pengancaman", "bukti hukum tindakan premanisme", "lapor polisi diperas orang"],
        "prosedur": [
            "Tolak dengan tegas permintaan uang atau barang yang disertai dengan ancaman kekerasan fisik.",
            "Rekam tindakan pemerasan secara sembunyi-sembunyi menggunakan ponsel (audio atau video) jika situasi memungkinkan.",
            "Cari saksi mata di sekitar lokasi kejadian yang melihat tindak premanisme atau pemerasan tersebut.",
            "Datang ke Polsek atau Polres terdekat untuk menyerahkan bukti rekaman dan data saksi pendukung.",
            "Minta kepolisian melakukan penangkapan atau operasi tangkap tangan (OTT) terhadap kelompok preman tersebut."
        ],
        "lembaga": [
            "Kepolisian"
        ]
    },
    {
        "Id": 88,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["perlindungan hukum korban kekerasan disabilitas", "pendampingan hukum inklusif lhb", "cara lapor kekerasan anak disabilitas"],
        "prosedur": [
            "Keluarga atau pendamping mengamankan penyandang disabilitas yang menjadi korban kekerasan ke lingkungan kondusif.",
            "Laporkan kasus ke Unit PPA Polres dengan meminta pendampingan dari penerjemah bahasa isyarat atau ahli perilaku.",
            "Hubungi Komnas Disabilitas atau LBH inklusif untuk memantau pemenuhan hak aksesibilitas korban di peradilan.",
            "Jalani pemeriksaan medis forensik dengan metode interaksi khusus yang ramah disabilitas.",
            "Pastikan seluruh proses pemeriksaan BAP menyesuaikan dengan kapasitas komunikasi dan kondisi fisik korban."
        ],
        "lembaga": [
            "Polres (Unit PPA)",
            "Komnas Disabilitas",
            "LBH Inklusif"
        ]
    },
    {
        "Id": 89,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan tppo perdagangan orang", "satgas tppo kepolisian rumah aman", "bantuan hukum korban penyalur kerja ilegal"],
        "prosedur": [
            "Jika mencurigai atau terjebak dalam sindikat perdagangan orang (TPPO), amankan paspor dan dokumen pribadi secara mandiri.",
            "Hubungi Satgas TPPO Kepolisian atau BP2MI jika kasus terjadi pada skema Pekerja Migran Indonesia (PMI).",
            "Aparat akan melakukan penjemputan perlindungan dan menempatkan korban di rumah aman (safe house) rahasia.",
            "Jalani proses pemeriksaan hukum untuk membongkar jaringan agen penyalur ilegal atau pelaku utama.",
            "Dapatkan bantuan pemulihan fisik, psikis, serta pemulangan ke daerah asal dari Kementerian Sosial."
        ],
        "lembaga": [
            "Kepolisian (Satgas TPPO)",
            "BP2MI",
            "Kementerian Sosial"
        ]
    },
    {
        "Id": 90,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan kekerasan psikis teror mental", "bukti hukum trauma depresi akibat makian", "pasal kekerasan psikis dalam rumah tangga"],
        "prosedur": [
            "Kumpulkan bukti dampak kekerasan psikis berupa rekam medis dari psikolog atau psikiater berwenang.",
            "Simpan bukti verbal tertulis berupa ejekan, makian, atau teror mental yang dikirimkan oleh pelaku secara berulang.",
            "Bawa hasil diagnosis medis yang menyatakan korban mengalami depresi, kecemasan akut, atau trauma mental ke polisi.",
            "Laporkan pelaku ke Unit PPA Polres atas dasar pelanggaran pasal kekerasan psikis (terutama dalam UU KDRT).",
            "Gunakan saksi ahli (psikolog forensik) dalam proses pembuktian perkara di persidangan."
        ],
        "lembaga": [
            "Rumah Sakit (Poli Jiwa)",
            "UPTD PPA",
            "Kepolisian"
        ]
    },
// --- Bagian 6: PENIPUAN ---
    {
        "Id": 91,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan penipuan online shop", "melaporkan rekening penipu ke kemkominfo", "bukti chat penipuan belanja online"],
        "prosedur": [
            "Kumpulkan bukti transfer bank, tangkapan layar percakapan, nomor ponsel, dan link akun media sosial/toko online penipu.",
            "Laporkan nomor rekening penipu ke situs resmi Pemerintah (cekrekening.id) milik Kemkominfo agar masuk daftar hitam.",
            "Datang ke bank Anda untuk melaporkan transaksi penipuan dan meminta pembekuan sementara rekening tujuan.",
            "Buat Laporan Polisi (LP) di SPKT Polres/Polda setempat dengan membawa semua barang bukti fisik dan digital."
        ],
        "lembaga": [
            "Kemkominfo",
            "Bank",
            "Kepolisian"
        ]
    },
    {
        "Id": 92,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan investasi bodong", "satgas pasti ojk pengaduan investasi", "gugatan perdata aset investasi penipuan"],
        "prosedur": [
            "Kumpulkan dokumen perjanjian kontrak, bukti transfer modal, brosur penawaran, serta riwayat keuntungan yang dijanjikan.",
            "Laporkan entitas atau perusahaan tersebut ke Satgas PASTI (Pemberantasan Aktivitas Keuangan Ilegal) OJK untuk pemblokiran.",
            "Buat laporan kelompok bersama korban lain ke Polda/Polres guna memperkuat delik pidana pencucian uang (TPPU).",
            "Hubungi Lembaga Bantuan Hukum (LBH) untuk mendampingi proses gugatan perdata jika ingin mengejar aset pelaku."
        ],
        "lembaga": [
            "Otoritas Jasa Keuangan (OJK)",
            "Kepolisian",
            "Lembaga Bantuan Hukum (LBH)"
        ]
    },
    {
        "Id": 93,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["lowongan kerja palsu dimintai uang", "cara melaporkan penipuan loker ke disnaker", "pasal penipuan kerja 378 kuhp"],
        "prosedur": [
            "Tolak dengan tegas jika dimintai uang untuk biaya akomodasi, travel, atau pelatihan di awal proses seleksi kerja.",
            "Simpan bukti surat undangan wawancara palsu, pesan elektronik, serta alamat lokasi kantor operasional mereka.",
            "Laporkan nama perusahaan atau oknum perekrut tersebut ke Dinas Tenaga Kerja (Disnaker) setempat.",
            "Datang ke Polsek/Polres untuk membuat laporan atas dugaan tindak pidana penipuan lowongan kerja (Pasal 378 KUHP)."
        ],
        "lembaga": [
            "Dinas Tenaga Kerja",
            "Kepolisian"
        ]
    },
    {
        "Id": 94,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan bandar arisan kabur", "rekap kerugian arisan bodong polisi", "sita jaminan aset pengadilan arisan"],
        "prosedur": [
            "Buat tabel rekapitulasi total kerugian riil seluruh anggota beserta daftar nama-nama korban yang dirugikan.",
            "Kumpulkan bukti riwayat percakapan grup, catatan mutasi setoran uang, dan data identitas bandar arisan.",
            "Laporkan bandar arisan ke kantor polisi terdekat atas dugaan penggelapan modal dan penipuan massal.",
            "Ajukan permohonan sita jaminan terhadap aset milik bandar arisan melalui pengadilan untuk mengamankan uang korban."
        ],
        "lembaga": [
            "Kepolisian",
            "Pengadilan Negeri"
        ]
    },
    {
        "Id": 95,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["agen travel umrah bodong dilaporkan", "pengaduan travel haji palsu kemenag", "advokasi konsumen ylki travel gelap"],
        "prosedur": [
            "Kumpulkan kuitansi pembayaran asli, bukti janji jadwal keberangkatan, dan paspor yang ditahan (jika ada).",
            "Laporkan agen perjalanan tersebut ke Kementerian Agama (Kemenag) jika kasus terkait ibadah umrah atau haji khusus.",
            "Buat Laporan Polisi atas dugaan penipuan penggelapan dana jemaah oleh pengurus atau pemilik agen travel.",
            "Adukan kasus ke Yayasan Lembaga Konsumen Indonesia (YLKI) untuk mendapatkan advokasi perlindungan konsumen."
        ],
        "lembaga": [
            "Kementerian Agama",
            "Kepolisian",
            "Yayasan Lembaga Konsumen Indonesia (YLKI)"
        ]
    },
    {
        "Id": 96,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan pinjol ilegal sebar data", "aduan teror pinjaman online ojk", "lapor polisi ancaman kekerasan pinjol"],
        "prosedur": [
            "Jangan pernah mentransfer biaya administrasi di muka untuk pencairan dana pinjaman online.",
            "Apabila terjebak pinjol ilegal dan mendapatkan teror, amankan kontak ponsel serta jangan merespons ancaman pelaku.",
            "Laporkan nomor telepon penagih dan aplikasi pinjol tersebut ke pihak OJK serta Kemkominfo.",
            "Buat laporan pidana ke kepolisian atas dasar penyebaran data pribadi tanpa izin dan pengancaman kekerasan."
        ],
        "lembaga": [
            "Otoritas Jasa Keuangan (OJK)",
            "Kemkominfo",
            "Kepolisian"
        ]
    },
    {
        "Id": 97,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["pajak pemenang undian palsu sms", "cek undian berhadiah kementerian sosial", "cara blokir rekening penipuan undian"],
        "prosedur": [
            "Jangan mentransfer uang sepeser pun untuk alasan biaya administrasi atau pajak pemenang undian berhadiah.",
            "Konfirmasi keaslian undian ke perusahaan terkait atau cek ke Kementerian Sosial (Kemsos) yang mengawasi undian nasional.",
            "Simpan bukti SMS/pesan singkat, nomor telepon penipu, serta tangkapan layar situs palsu yang digunakan pelaku.",
            "Laporkan nomor rekening penipu ke bank terkait dan ajukan pengaduan ke unit siber kepolisian."
        ],
        "lembaga": [
            "Kementerian Sosial",
            "Bank",
            "Kepolisian"
        ]
    },
    {
        "Id": 98,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["penyalahgunaan ktp untuk pinjol orang lain", "cek slik ojk data disalahgunakan", "pelanggaran uu perlindungan data pribadi"],
        "prosedur": [
            "Cek riwayat kredit Anda secara mandiri melalui sistem SLIK OJK jika mencurigai data KTP disalahgunakan untuk pinjaman.",
            "Mintalah surat keterangan resmi dari OJK yang menyatakan bahwa Anda bukan debitur asli atas pinjaman bermasalah tersebut.",
            "Laporkan penyalahgunaan dokumen kependudukan ke Ditjen Dukcapil untuk memulihkan validitas data.",
            "Laporkan oknum pemalsu data ke polisi dengan dasar pelanggaran UU Pelindungan Data Pribadi (PDP)."
        ],
        "lembaga": [
            "Otoritas Jasa Keuangan (OJK)",
            "Ditjen Dukcapil",
            "Kepolisian"
        ]
    },
    {
        "Id": 99,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["sanggahan transaksi tidak dikenal atm", "cara mengatasi kartu atm kena skimming", "surat sanggahan bank untuk bukti polisi"],
        "prosedur": [
            "Segera hubungi call center resmi bank untuk memblokir kartu ATM, mobile banking, dan rekening tabungan Anda.",
            "Datang ke kantor cabang bank terdekat untuk mengisi formulir sanggahan transaksi tidak dikenal (fraud transaksi).",
            "Minta pihak bank melacak aliran dana keluar atau memeriksa rekaman CCTV jika kasus berupa skimming di mesin ATM.",
            "Bawa Surat Sanggahan resmi dari bank ke kantor polisi sebagai bukti penguat laporan tindak pidana perbankan."
        ],
        "lembaga": [
            "Bank",
            "Kepolisian"
        ]
    },
    {
        "Id": 100,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["developer perumahan kabur lapor polisi", "cek legalitas pengembang perumahan pupr", "verifikasi sertifikat induk tanah bpn"],
        "prosedur": [
            "Cek legalitas pengembang perumahan di sistem registrasi Kementerian PUPR atau asosiasi pengembang resmi.",
            "Lakukan verifikasi keaslian sertifikat induk tanah ke Kantor Pertanahan (BPN) sebelum menyerahkan uang muka (DP).",
            "Kumpulkan dokumen Perjanjian Pengikatan Jual Beli (PPJB) dan seluruh kuitansi bukti pembayaran jika developer kabur.",
            "Laporkan pihak developer ke kepolisian atas dugaan penipuan jual beli properti bodong."
        ],
        "lembaga": [
            "Kementerian PUPR",
            "Kantor Pertanahan (BPN)",
            "Kepolisian"
        ]
    },
    {
        "Id": 101,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["penipuan asmara romance scam online", "pencarian gambar terbalik foto akun palsu", "bukti transfer uang kenalan internet"],
        "prosedur": [
            "Hentikan pengiriman uang dengan alasan apa pun (biaya bea cukai paket hadiah, biaya medis darurat, dll) dari kenalan online.",
            "Lakukan penelusuran foto profil pelaku menggunakan sistem pencarian gambar terbalik untuk mendeteksi akun palsu.",
            "Simpan seluruh riwayat percakapan teks, rekaman panggilan, dan kuitansi transfer uang tunai.",
            "Laporkan kasus penipuan bermodus manipulasi hubungan asmara (romance scam) ini ke kantor polisi terdekat."
        ],
        "lembaga": [
            "Kepolisian"
        ]
    },
    {
        "Id": 102,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara memblokir rekening bank penipu", "surat rekomendasi pemblokiran rekening spkt", "pembekuan darurat dana fraud transaksi"],
        "prosedur": [
            "Hubungi call center bank yang digunakan penipu sesegera mungkin setelah menyadari terjadinya transaksi penipuan.",
            "Sebutkan kronologi singkat, nomor rekening Anda, nomor rekening pelaku, serta nominal uang yang terkirim.",
            "Mintalah pihak bank melakukan pemblokiran darurat (freeze) terhadap dana yang ada di rekening tujuan tersebut.",
            "Datang ke kantor polisi untuk meminta Surat Rekomendasi Pemblokiran Rekening guna diserahkan ke bank dalam waktu 3x24 jam."
        ],
        "lembaga": [
            "Bank",
            "Kepolisian"
        ]
    },
    {
        "Id": 103,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["investasi kripto ilegal bappebti", "lapor cyber crime penipuan token crypto", "bukti mutasi wallet address fraud"],
        "prosedur": [
            "Pastikan platform atau token aset kripto yang ditawarkan terdaftar resmi di badan pengawas komoditas pemerintah.",
            "Unduh dan simpan bukti transaksi dompet digital (wallet address) beserta riwayat mutasi pengiriman dana.",
            "Laporkan platform investasi ilegal atau pengembang token bodong ke Bappebti untuk tindakan administratif.",
            "Ajukan laporan ke Unit Cyber Crime kepolisian atas dugaan penipuan berbasis manipulasi teknologi informasi."
        ],
        "lembaga": [
            "Bappebti (Kementerian Perdagangan)",
            "Kepolisian (Unit Cyber Crime)"
        ]
    },
    {
        "Id": 104,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["penggabungan gugatan ganti kerugian pidana", "cara pengembalian aset sitaan penipuan", "gugatan perdata perbuatan melawan hukum"],
        "prosedur": [
            "Ajukan permohonan penggabungan gugatan ganti kerugian bersamaan dengan proses sidang perkara pidana penipu di pengadilan.",
            "Siapkan perincian mutasi rekening koran dan dokumen otentik yang membuktikan nilai kerugian materiil akibat penipuan.",
            "Minta bantuan Jaksa Penuntut Umum (JPU) agar memasukkan tuntutan pengembalian aset sitaan kepada para korban dalam tuntutannya.",
            "Jika putusan pidana inkrah namun aset belum kembali, ajukan Gugatan Perdata Perbuatan Melawan Hukum (PMH) ke pengadilan."
        ],
        "lembaga": [
            "Kejaksaan Negeri",
            "Pengadilan Negeri",
            "Lembaga Bantuan Hukum (LBH)"
        ]
    },
    {
        "Id": 105,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["posbakum pengadilan negeri gratis penipuan", "pendampingan hukum pro bono lbh terakreditasi", "syarat sktm bantuan hukum kelurahan"],
        "prosedur": [
            "Siapkan dokumen KTP, KK, serta Surat Keterangan Tidak Mampu (SKTM) dari Kelurahan jika memiliki kendala finansial.",
            "Tulis kronologi kejadian penipuan secara berurutan lengkap dengan salinan seluruh barang bukti dokumen pendukung.",
            "Datangi loket Pos Bantuan Hukum (Posbakum) di Pengadilan Negeri atau kantor Lembaga Bantuan Hukum (LBH) terakreditasi.",
            "Ajukan permohonan pendampingan hukum pro bono (gratis) mulai dari tahap pelaporan di polisi hingga persidangan selesai."
        ],
        "lembaga": [
            "Kantor Kelurahan",
            "Posbakum Pengadilan Negeri",
            "Lembaga Bantuan Hukum (LBH)"
        ]
    },
// --- Bagian 7: PERLINDUNGAN ANAK & PEREMPUAN ---
    {
        "Id": 106,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan kdrt ke polres", "bukti kekerasan dalam rumah tangga", "pendampingan hukum korban kdrt"],
        "prosedur": [
            "Amankan diri dan anak-anak ke tempat aman (kerabat atau rumah aman) jauh dari jangkauan pelaku.",
            "Dokumentasikan semua bukti kekerasan seperti foto luka fisik, video, atau rekaman suara ancaman.",
            "Segera lakukan pemeriksaan medis dan visum di Puskesmas atau Rumah Sakit umum terdekat.",
            "Laporkan tindak kekerasan tersebut ke Unit Pelayanan Perempuan dan Anak (PPA) di Polres setempat.",
            "Hubungi UPTD PPA atau Lembaga Bantuan Hukum (LBH) untuk mendapatkan pendampingan hukum dan pengawalan kasus."
        ],
        "lembaga": [
            "Polres (Unit PPA)",
            "UPTD PPA",
            "Lembaga Bantuan Hukum (LBH)"
        ]
    },
    {
        "Id": 107,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["gugatan hak asuh anak setelah cerai", "syarat mengurus hak asuh anak di pengadilan", "hak asuh anak hadhanah pengadilan agama"],
        "prosedur": [
            "Siapkan dokumen dasar berupa Akta Cerai, Akta Kelahiran Anak, Kartu Keluarga, dan bukti kemampuan finansial/moral.",
            "Ajukan gugatan hak asuh anak (hadhanah) ke Pengadilan Agama (untuk Muslim) atau Pengadilan Negeri (untuk Non-Muslim).",
            "Jalani proses mediasi yang dijadwalkan oleh pengadilan untuk mengupayakan kesepakatan terbaik.",
            "Sampaikan bukti-bukti di persidangan yang menunjukkan bahwa kepentingan terbaik anak berada di bawah pengasuhan Anda.",
            "Tunggu putusan hakim berkekuatan hukum tetap mengenai hak asuh dan batasan hak kunjungan mantan pasangan."
        ],
        "lembaga": [
            "Pengadilan Agama / Pengadilan Negeri",
            "Komisi Perlindungan Anak Indonesia (KPAI)"
        ]
    },
    {
        "Id": 108,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara menuntut nafkah anak yang tidak dibayar mantan suami", "permohonan eksekusi putusan nafkah pengadilan", "sanksi hukum mantan suami mangkir nafkah"],
        "prosedur": [
            "Siapkan salinan Putusan Pengadilan resmi yang memuat kewajiban mantan suami memberikan nominal nafkah anak/istri.",
            "Kumpulkan bukti-bukti bahwa mantan suami dengan sengaja melalaikan atau menolak membayar nafkah tersebut.",
            "Ajukan permohonan eksekusi putusan nafkah ke Pengadilan Agama atau Pengadilan Negeri yang memutus perkara awal.",
            "Pengadilan akan memanggil mantan suami (aanmaning) dan menegurnya untuk segera memenuhi kewajibannya.",
            "Jika tetap mangkir, pengadilan dapat melakukan penyitaan terhadap aset atau inventaris pendapatan milik mantan suami."
        ],
        "lembaga": [
            "Pengadilan Agama / Pengadilan Negeri",
            "Lembaga Bantuan Hukum (LBH)"
        ]
    },
    {
        "Id": 109,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan pelecehan seksual uu tpks", "bukti hukum tindak kekerasan seksual", "pendampingan psikolog korban pelecehan polres"],
        "prosedur": [
            "Simpan semua barang bukti berupa tangkapan layar pesan instan, rekaman CCTV, atau pakaian yang dikenakan saat kejadian.",
            "Jangan bersihkan diri atau membuang pakaian jika pelecehan melibatkan kontak fisik seksual yang intens.",
            "Laporkan kejadian ke Unit PPA Polres dengan menggunakan landasan Undang-Undang Tindak Pidana Kekerasan Seksual (UU TPKS).",
            "Minta pendampingan psikolog atau pekerja sosial dari UPTD PPA sejak tahap awal pembuatan Berita Acara Pemeriksaan (BAP).",
            "Pastikan penyidik kepolisian merahasiakan identitas Anda selaku korban selama seluruh proses hukum berjalan."
        ],
        "lembaga": [
            "Polres (Unit PPA)",
            "UPTD PPA / P2TP2A",
            "Komnas Perempuan"
        ]
    },
    {
        "Id": 110,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan eksploitasi anak jalanan", "sanksi hukum memaksa anak mengemis", "rehabilitasi sosial anak korban eksploitasi ekonomi"],
        "prosedur": [
            "Dokumentasikan bukti-bukti anak dipekerjakan secara ilegal, dipaksa mengemis, atau dieksploitasi secara seksual/ekonomi.",
            "Laporkan temuan tersebut secara langsung ke Dinas Sosial atau Komnas Perlindungan Anak.",
            "Bawa kasus ini ke Polres setempat untuk memproses pidana para pelaku/sindikat berdasarkan UU Perlindungan Anak.",
            "Koordinasikan dengan Pekerja Sosial untuk melakukan evakuasi dan menempatkan anak di rumah rehabilitasi sosial.",
            "Pastikan anak mendapatkan hak pemulihan trauma serta pemenuhan hak pendidikan kembali."
        ],
        "lembaga": [
            "Dinas Sosial",
            "Komnas Perlindungan Anak / KPAI",
            "Kepolisian"
        ]
    },
    {
        "Id": 111,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["tindak pidana penelantaran rumah tangga", "cara lapor suami tidak memberi nafkah lahir", "mediasi penelantaran anak dan istri kelurahan"],
        "prosedur": [
            "Kumpulkan bukti penelantaran ekonomi, medis, atau psikis (seperti ditinggalkan tanpa kabar atau tidak diberi biaya hidup dasar).",
            "Lakukan mediasi awal tingkat Kelurahan atau RT/RW untuk menegur pihak penelantar.",
            "Jika mediasi buntu, datangi Unit PPA Polres untuk membuat Laporan Polisi atas dugaan tindak pidana penelantaran rumah tangga.",
            "Sertakan saksi-saksi dari lingkungan tetangga atau keluarga yang mengetahui kondisi penelantaran tersebut.",
            "Gunakan layanan bantuan Dinas Sosial jika korban (anak/istri) membutuhkan bantuan logistik darurat."
        ],
        "lembaga": [
            "Kantor Kelurahan",
            "Polres (Unit PPA)",
            "Dinas Sosial"
        ]
    },
    {
        "Id": 112,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["layanan pemulihan psikologis korban kekerasan", "visum et repertum psychiatricum psikolog forensik", "cara mengatasi trauma pasca kekerasan uptd ppa"],
        "prosedur": [
            "Ajukan permohonan layanan pemulihan psikologis ke kantor UPTD PPA atau P2TP2A kabupaten/kota domisili.",
            "Jalani sesi asesmen awal bersama psikolog klinis untuk mengukur tingkat trauma pasca-kekerasan.",
            "Ikuti rangkaian terapi psikologis secara rutin sesuai jadwal yang disusun oleh tim konselor resmi.",
            "Mintalah psikolog menerbitkan dokumen tertulis hasil pemeriksaan kesehatan jiwa (Visum et Repertum Psychiatricum).",
            "Serahkan dokumen hasil pemeriksaan psikis tersebut ke penyidik kepolisian sebagai alat bukti penguat di persidangan."
        ],
        "lembaga": [
            "UPTD PPA / P2TP2A",
            "Rumah Sakit (Poli Jiwa / Poli Psikologi)"
        ]
    },
    {
        "Id": 113,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara mengajukan permohonan perwalian anak yatim piatu", "syarat menjadi wali anak di bawah umur pengadilan", "surat penetapan perwalian hak keperdataan anak"],
        "prosedur": [
            "Siapkan Surat Kematian kedua orang tua atau dokumen bukti sah bahwa orang tua kandung tidak cakap hukum.",
            "Lengkapi dokumen identitas calon wali (KTP, KK, SKCK, dan Surat Keterangan Sehat Fisik/Mental).",
            "Ajukan permohonan ketetapan perwalian anak di bawah umur ke Pengadilan Agama (Muslim) atau Pengadilan Negeri (Non-Muslim).",
            "Jalani persidangan dan terima kunjungan pemeriksaan lapangan (home visit) dari Pekerja Sosial/Balai Harta Peninggalan.",
            "Pengadilan menerbitkan Surat Penetapan Perwalian yang sah agar wali dapat mewakili hak keperdataan anak."
        ],
        "lembaga": [
            "Pengadilan Agama / Pengadilan Negeri",
            "Balai Harta Peninggalan (BHP) / Dinas Sosial"
        ]
    },
    {
        "Id": 114,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["prosedur resmi adopsi anak dinas sosial", "syarat calon orang tua angkat cota", "sidang penetapan pengangkatan anak pengadilan"],
        "prosedur": [
            "Ajukan permohonan izin pengasuhan anak sementara ke Dinas Sosial Provinsi/Kabupaten.",
            "Penuhi kualifikasi Calon Orang Tua Angkat (COTA), termasuk masa pernikahan minimal 5 tahun dan kelayakan ekonomi.",
            "Terima tim Pekerja Sosial untuk melakukan uji kelayakan (home visit) guna menilai kondisi lingkungan rumah.",
            "Setelah mendapat Surat Rekomendasi dari Tim Pertimbangan Perizinan Pengangkatan Anak, ajukan permohonan ke Pengadilan.",
            "Jalani sidang penetapan adopsi dan bawa salinan putusan pengadilan ke Dukcapil untuk dicatatkan pada akta kelahiran."
        ],
        "lembaga": [
            "Dinas Sosial",
            "Pengadilan Negeri / Pengadilan Agama",
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 115,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara mengajukan restitusi korban kekerasan lpsk", "ganti kerugian korban tindak pidana anak", "surat rekomendasi penilaian restitusi pengadilan"],
        "prosedur": [
            "Kumpulkan rincian biaya pengobatan, kerugian kehilangan penghasilan, dan biaya pemulihan psikis akibat tindak kekerasan.",
            "Ajukan permohonan ganti kerugian (restitusi) secara tertulis ke kantor Lembaga Perlindungan Saksi dan Korban (LPSK).",
            "Tim LPSK akan memverifikasi bukti, menghitung nilai wajar, dan mengeluarkan Surat Rekomendasi Penilaian Restitusi.",
            "LPSK menyerahkan rekomendasi tersebut kepada Jaksa Penuntut Umum (JPU) sebelum berkas tuntutan dibacakan di sidang.",
            "Majelis Hakim akan memasukkan klausul kewajiban pembayaran restitusi oleh pelaku di dalam vonis putusan pidana."
        ],
        "lembaga": [
            "LPSK",
            "Kejaksaan Negeri",
            "Pengadilan Negeri"
        ]
    },
    {
        "Id": 116,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["nomor darurat sapa 129 kekerasan perempuan", "layanan rumah aman shelter safe house korban", "tim reaksi cepat evakuasi kekerasan anak"],
        "prosedur": [
            "Jika berada dalam ancaman kekerasan fisik aktif, hubungi layanan panggilan darurat SAPA di nomor 129 atau Polisi di 110.",
            "Tim Reaksi Cepat (TRC) dari pemerintah atau kepolisian terdekat akan mendatangi lokasi untuk melakukan evakuasi.",
            "Korban segera dilarikan dan ditempatkan di Rumah Aman (Safe House) yang lokasinya dirahasiakan demi keamanan.",
            "Di dalam Rumah Aman, korban mendapatkan jaminan logistik, perlindungan fisik 24 jam, serta perawatan medis awal.",
            "Korban menetap di Rumah Aman hingga situasi dinyatakan kondusif dan ancaman dari pelaku berhasil dimitigasi."
        ],
        "lembaga": [
            "Kementerian PPPA (Hotline 129)",
            "Kepolisian (Hotline 110)",
            "UPTD PPA (Pengelola Shelter)"
        ]
    },
    {
        "Id": 117,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara meminta surat permintaan visum spv polisi", "pemeriksaan medis forensik bukti penganiayaan", "visum et repertum alat bukti persidangan rsud"],
        "prosedur": [
            "Datang ke kantor Polsek atau Polres terdekat untuk membuat Laporan Polisi (LP) atas dugaan tindak penganiayaan/pelecehan.",
            "Mintalah lembar Surat Permintaan Visum (SPV) resmi yang ditandatangani oleh penyidik kepolisian yang bertugas.",
            "Bawa SPV tersebut ke instansi medis, seperti Rumah Sakit Umum Daerah (RSUD) atau Rumah Sakit Bhayangkara.",
            "Jalani pemeriksaan medis menyeluruh oleh dokter ahli forensik untuk mencatat seluruh bekas luka atau sisa biologis.",
            "Hasil Visum et Repertum akan dikirimkan secara langsung oleh pihak rumah sakit kepada penyidik sebagai alat bukti sah."
        ],
        "lembaga": [
            "Kepolisian (SPKT)",
            "Rumah Sakit (Instalasi Kedokteran Forensik)"
        ]
    },
    {
        "Id": 118,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["perlindungan hukum perempuan disabilitas korban kekerasan", "pendampingan juru bahasa isyarat bap polres", "aksesibilitas peradilan inklusif komnas disabilitas"],
        "prosedur": [
            "Evakuasi anak atau perempuan penyandang disabilitas yang menjadi korban kekerasan ke lingkungan yang ramah dan tenang.",
            "Laporkan kasus ke Unit PPA Polres dengan meminta penyediaan juru bahasa isyarat atau psikolog pendamping khusus.",
            "Pastikan seluruh proses BAP dan persidangan menggunakan metode akomodasi yang layak sesuai undang-undang penyandang disabilitas.",
            "Hubungi Komisi Nasional Disabilitas (KND) untuk memantau berjalannya pemenuhan hak korban di sistem peradilan.",
            "Gunakan bantuan LBH inklusif untuk menyusun strategi pembelaan hukum yang peka terhadap kondisi kebutuhan khusus korban."
        ],
        "lembaga": [
            "Polres (Unit PPA)",
            "Komisi Nasional Disabilitas (KND)",
            "LBH Inklusif"
        ]
    },
    {
        "Id": 119,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara mengajukan dispensasi kawin anak bawah umur", "konseling kesiapan reproduksi bkkbn dispensasi nikah", "sidang permohonan dispensasi pernikahan pengadilan"],
        "prosedur": [
            "If anak di bawah usia 19 tahun terpaksa menikah karena keadaan mendesak, orang tua wajib mengajukan permohonan Dispensasi Kawin.",
            "Daftarkan berkas permohonan ke Pengadilan Agama (bagi Muslim) atau Pengadilan Negeri (bagi Non-Muslim).",
            "Jalani konseling terpadu di Dinas PPKBP3A setempat untuk mendapatkan pembekalan psikis dan kesiapan reproduksi anak.",
            "Sampaikan Surat Rekomendasi dari hasil konseling tersebut kepada Hakim sebagai bahan pertimbangan persidangan.",
            "Hakim akan memeriksa langsung anak yang bersangkutan dalam sidang untuk mengabulkan atau menolak dispensasi tersebut."
        ],
        "lembaga": [
            "Pengadilan Agama / Pengadilan Negeri",
            "Dinas PPKBP3A / BKKBN"
        ]
    },
    {
        "Id": 120,
        "kategori": "Bantuan Hukum",
        "kata_kunci": ["cara melaporkan kekerasan berbasis gender online kbgo", "mitigasi penyebaran konten intim tanpa izin safenet", "takedown konten ilegal aduankonten kemkominfo"],
        "prosedur": [
            "Simpan tangkapan layar penuh (screenshot) dan tautan URL akun pelaku Kekerasan Berbasis Gender Online (KBGO).",
            "Jangan merespons intimidasi pelaku, jangan mentransfer uang, dan jangan menghapus riwayat chat yang memuat ancaman.",
            "Hubungi lembaga swadaya perlindungan digital seperti LBH APIK atau SAFEnet untuk mitigasi penyebaran konten intim.",
            "Datang ke Unit Cyber Crime kepolisian untuk membuat Laporan Polisi atas dugaan pelanggaran UU ITE dan UU TPKS.",
            "Ajukan permohonan takedown konten ilegal tersebut ke aduankonten.id milik Kemkominfo agar sebarannya dapat dihentikan."
        ],
        "lembaga": [
            "Kepolisian (Unit Cyber)",
            "LBH APIK / SAFEnet",
            "Kemkominfo"
        ]
    },
// --- Bagian 8: BPJS (Badan Penyelenggara Jaminan Sosial) ---
    {
        "Id": 121,
        "kategori": "Kesehatan dan Medis (BPJS)",
        "kata_kunci": ["cara daftar bpjs gratis pbi", "pendaftaran dtks untuk kartu kis baru", "syarat mendaftar bpjs kesehatan dinkes"],
        "prosedur": [
            "Datang ke Kantor Kelurahan atau Desa dengan membawa KTP dan KK.",
            "Ajukan permohonan masuk DTKS untuk kepesertaan gratis (PBI).",
            "Dinas Sosial akan memverifikasi tingkat kemiskinan dan kelayakan.",
            "Dinas Kesehatan mendaftarkan data ke BPJS Kesehatan untuk penerbitan kartu."
        ],
        "lembaga": [
            "Kantor Kelurahan / Desa",
            "Dinas Sosial",
            "Dinas Kesehatan",
            "BPJS Kesehatan"
        ]
    },
    {
        "Id": 122,
        "kategori": "Kesehatan dan Medis (BPJS)",
        "kata_kunci": ["cara cek status bpjs kesehatan aktif atau tidak", "cek kartu jkn kis online mobile jkn", "layanan chika whatsapp bpjs nomor resmi"],
        "prosedur": [
            "Unduh dan buka aplikasi Mobile JKN di ponsel pintar.",
            "Pilih menu Cek Peserta atau manfaatkan fitur layanan CHIKA via WhatsApp.",
            "Masukkan nomor kartu JKN-KIS atau NIK KTP secara benar.",
            "Lihat status keaktifan kepesertaan dan jenis segmen bantuan di layar."
        ],
        "lembaga": [
            "BPJS Kesehatan"
        ]
    },
    {
        "Id": 123,
        "kategori": "Kesehatan dan Medis (BPJS)",
        "kata_kunci": ["cara mengaktifkan kembali bpjs pbi dinonaktifkan", "surat rekomendasi reaktivasi bpjs dinas sosial", "reaktivasi jkn kis care center 165"],
        "prosedur": [
            "Hubungi BPJS Kesehatan Care Center 165 untuk memastikan penyebab penonaktifan.",
            "Datang ke Dinas Sosial membawa KTP, KK, dan kartu BPJS yang tidak aktif.",
            "Minta surat rekomendasi reaktivasi kartu PBI dari Dinas Sosial.",
            "Bawa surat rekomendasi tersebut ke Kantor BPJS Kesehatan agar diaktifkan kembali."
        ],
        "lembaga": [
            "BPJS Kesehatan",
            "Dinas Sosial"
        ]
    },
    {
        "Id": 124,
        "kategori": "Kesehatan dan Medis (BPJS)",
        "kata_kunci": ["cara pindah bpjs mandiri ke pbi gratis", "pengalihan kepesertaan jkn faktor ekonomi dms", "pindah segmen bpjs kesehatan bantuan pemda"],
        "prosedur": [
            "Pastikan tidak ada tunggakan iuran pada kepesertaan mandiri sebelumnya.",
            "Datang ke Dinas Sosial membawa dokumen identitas diri lengkap.",
            "Ajukan pengalihan kepesertaan menjadi PBI APBD/APBN karena faktor ekonomi.",
            "Tunggu proses verifikasi lapangan hingga status berubah otomatis di sistem."
        ],
        "lembaga": [
            "Dinas Sosial",
            "BPJS Kesehatan"
        ]
    },
    {
        "Id": 125,
        "kategori": "Kesehatan dan Medis (BPJS)",
        "kata_kunci": ["cara pindah faskes tingkat pertama online", "ubah klinik puskesmas bpjs mobile jkn", "faskes tumpuan jkn aktif bulan berikutnya"],
        "prosedur": [
            "Buka aplikasi Mobile JKN dan masuk ke akun kepesertaan Anda.",
            "Pilih menu 'Ubah Data Peserta' lalu pilih opsi 'Fasilitas Kesehatan Tingkat Pertama'.",
            "Tentukan provinsi, kabupaten, dan faskes baru (Puskesmas/Klinik) yang diinginkan.",
            "Simpan perubahan data dan faskes baru akan aktif pada tanggal 1 bulan berikutnya."
        ],
        "lembaga": [
            "BPJS Kesehatan"
        ]
    },
    {
        "Id": 126,
        "kategori": "Kesehatan dan Medis (BPJS)",
        "kata_kunci": ["kartu bpjs kesehatan fisik hilang cetak ulang", "surat kehilangan bpjs polsek syarat cetak", "fitur kis digital pengganti kartu fisik hilang"],
        "prosedur": [
            "Unduh aplikasi Mobile JKN untuk menggunakan fitur kartu digital sebagai pengganti.",
            "Jika butuh fisik, buat Surat Tanda Penerimaan Laporan Kehilangan di Polsek.",
            "Bawa surat kehilangan kepolisian, KTP, dan KK ke Kantor Cabang BPJS.",
            "Ajukan permohonan cetak ulang kartu fisik BPJS Kesehatan yang baru."
        ],
        "lembaga": [
            "Polsek",
            "BPJS Kesehatan"
        ]
    },
    {
        "Id": 127,
        "kategori": "Kesehatan dan Medis (BPJS)",
        "kata_kunci": ["cara merubah data identitas salah di bpjs", "layanan whatsapp pandawa ubah data jkn", "perbaikan ejaan nama nik tidak sinkron bpjs"],
        "prosedur": [
            "Siapkan dokumen pendukung asli berupa KTP, Kartu Keluarga, dan kartu BPJS.",
            "Hubungi layanan WhatsApp PANDAWA BPJS Kesehatan di nomor resmi.",
            "Pilih menu perubahan data identitas dan unggah foto dokumen yang diminta.",
            "Tunggu konfirmasi dari petugas bahwa ejaan nama atau tanggal lahir sudah diperbaiki."
        ],
        "lembaga": [
            "BPJS Kesehatan"
        ]
    },
    {
        "Id": 128,
        "kategori": "Kesehatan dan Medis (BPJS)",
        "kata_kunci": ["cara mendaftarkan bayi baru lahir ke bpjs", "syarat jkn kis bayi pbi otomatis aktif", "batas waktu lapor kelahiran anak pandawa"],
        "prosedur": [
            "Siapkan Surat Keterangan Lahir dari faskes dan kartu BPJS milik ibu kandung.",
            "Laporkan kelahiran ke BPJS Kesehatan via PANDAWA maksimal 28 hari sejak lahir.",
            "Bayi dari peserta PBI otomatis terdaftar sementara mengikuti status ibunya.",
            "Segera urus akta kelahiran dan KK baru ke Dukcapil agar data terintegrasi permanen."
        ],
        "lembaga": [
            "Faskes",
            "BPJS Kesehatan",
            "Dinas Dukcapil"
        ]
    },
    {
        "Id": 129,
        "kategori": "Kesehatan dan Medis (BPJS)",
        "kata_kunci": ["cara mendapatkan surat rujukan online puskesmas", "prosedur berobat ke rumah sakit pakai bpjs", "rujukan fktp untuk dokter spesialis rs"],
        "prosedur": [
            "Datang ke Faskes Tingkat Pertama (FKTP) tempat kartu Anda terdaftar.",
            "Lakukan pemeriksaan medis oleh dokter umum di faskes tersebut.",
            "Jika pasien butuh penanganan spesialis, dokter akan menerbitkan rujukan online.",
            "Datang ke Rumah Sakit tujuan dengan membawa KTP dan bukti rujukan digital."
        ],
        "lembaga": [
            "Puskesmas / Klinik",
            "Rumah Sakit"
        ]
    },
    {
        "Id": 130,
        "kategori": "Kesehatan dan Medis (BPJS)",
        "kata_kunci": ["prosedur bpjs darurat masuk igd rumah sakit", "berobat emergency tanpa rujukan puskesmas bpjs", "klaim administrasi bpjs gawat darurat rs"],
        "prosedur": [
            "Datang langsung ke Instalasi Gawat Darurat (IGD) Rumah Sakit terdekat.",
            "Tunjukkan kartu BPJS Kesehatan atau NIK KTP kepada petugas pendaftaran.",
            "Pasien berhak mendapatkan penanganan medis darurat segera tanpa surat rujukan FKTP.",
            "Selesaikan proses administrasi klaim di rumah sakit sebelum pasien pulang."
        ],
        "lembaga": [
            "Rumah Sakit"
        ]
    },
    {
        "Id": 131,
        "kategori": "Kesehatan dan Medis (BPJS)",
        "kata_kunci": ["cara mencicil tunggakan iuran bpjs mandiri", "program rehab rencana pembayaran bertahap jkn", "cek tagihan bpjs mandiri menunggak aktif kembali"],
        "prosedur": [
            "Cek jumlah tagihan iuran mandiri Anda melalui aplikasi Mobile JKN.",
            "Pilih program REHAB (Rencana Pembayaran Bertahap) jika tidak bisa bayar sekaligus.",
            "Tentukan jangka waktu (tenor) cicilan sesuai kemampuan finansial Anda.",
            "Lakukan pembayaran rutin hingga lunas agar status kepesertaan aktif kembali."
        ],
        "lembaga": [
            "BPJS Kesehatan",
            "Bank / Agen Pembayaran"
        ]
    },
    {
        "Id": 132,
        "kategori": "Kesehatan dan Medis (BPJS)",
        "kata_kunci": ["cara cek nama terdaftar di dtks kelurahan", "sinkronisasi data kemiskinan subsidi iuran bpjs", "perbaikan variabel kemiskinan dinas sosial dtks"],
        "prosedur": [
            "Kunjungi Kantor Kelurahan membawa KTP dan KK asli pemilik kartu.",
            "Minta petugas mengecek status integrasi nama Anda dalam master data DTKS.",
            "Jika data tidak sinkron, lakukan pengusulan perbaikan variabel kemiskinan di tingkat desa.",
            "Data DTKS yang valid akan otomatis terhubung dengan subsidi iuran BPJS pusat."
        ],
        "lembaga": [
            "Kantor Kelurahan / Desa",
            "Dinas Sosial"
        ]
    },
    {
        "Id": 133,
        "kategori": "Kesehatan dan Medis (BPJS)",
        "kata_kunci": ["cara menonaktifkan bpjs anggota keluarga meninggal", "syarat lapor kematian peserta jkn kis pandawa", "akta kematian dukcapil untuk hapus iuran bpjs"],
        "prosedur": [
            "Urus Akta Kematian resmi anggota keluarga di Kantor Dinas Dukcapil.",
            "Siapkan KK terbaru serta nomor kartu BPJS Kesehatan milik almarhum.",
            "Laporkan penonaktifan peserta melalui aplikasi PANDAWA atau ke Kantor Cabang.",
            "Pastikan nama telah dihapus agar menghentikan tagihan iuran atau subsidi negara."
        ],
        "lembaga": [
            "Dinas Dukcapil",
            "BPJS Kesehatan"
        ]
    },
    {
        "Id": 134,
        "kategori": "Kesehatan dan Medis (BPJS)",
        "kata_kunci": ["cara turun kelas perawatan bpjs kesehatan mandiri", "syarat pindah kelas jkn kis minimal 1 tahun", "ubah nominal iuran bpjs kelas 1 2 3"],
        "prosedur": [
            "Pastikan kepesertaan mandiri Anda telah aktif minimal selama 1 tahun.",
            "Akses aplikasi Mobile JKN dan klik pada menu 'Ubah Data Peserta'.",
            "Pilih opsi perubahan kelas perawatan (Kelas 1, 2, atau 3) sesuai kemampuan.",
            "Mulai bulan berikutnya, bayar nominal iuran baru berdasarkan kelas yang dipilih."
        ],
        "lembaga": [
            "BPJS Kesehatan"
        ]
    },
    {
        "Id": 135,
        "kategori": "Kesehatan dan Medis (BPJS)",
        "kata_kunci": ["cara melaporkan pungli faskes bpjs kesehatan", "call center 165 pengaduan pasien ditolak rs", "laporan diskriminasi jkn kis kemenkes terintegrasi"],
        "prosedur": [
            "Hubungi pusat layanan pengaduan BPJS Kesehatan di nomor Call Center 165.",
            "Laporkan kasus diskriminasi, penolakan pasien, atau pungutan liar oleh faskes.",
            "Sebutkan nama instansi medis, kronologi kejadian, dan identitas pasien.",
            "Tunggu proses investigasi dari tim kendali mutu dan biaya BPJS."
        ],
        "lembaga": [
            "BPJS Kesehatan",
            "Kemenkes"
        ]
    },
// --- Bagian 9: Darurat Medis ---
    {
        "Id": 136,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["pertolongan pertama korban kecelakaan lalu lintas", "cara penanganan darurat patah tulang leher", "nomor darurat ambulans kecelakaan jalan raya"],
        "prosedur": [
            "Amankan area sekitar korban dan pastikan keselamatan penolong.",
            "Jangan pindahkan korban secara asal jika dicurigai ada cedera leher atau tulang belakang.",
            "Hubungi layanan darurat 119 atau ambulan setempat.",
            "Bawa korban segera ke Instalasi Gawat Darurat (IGD) terdekat."
        ],
        "lembaga": [
            "Call Center 119",
            "Polisi",
            "Rumah Sakit"
        ]
    },
    {
        "Id": 137,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["cara mengatasi orang pingsan mendadak", "pertolongan pertama kehilangan kesadaran darurat", "posisi kaki saat menolong orang pingsan"],
        "prosedur": [
            "Baringkan korban di tempat yang datar, aman, dan berudara segar.",
            "Tinggikan posisi kaki sedikit di atas dada untuk melancarkan aliran darah ke otak.",
            "Longgarkan pakaian, sabuk, atau kerah yang ketat.",
            "Jika tidak sadar lebih dari 1 menit atau kesulitan napas, segera bawa ke faskes terdekat."
        ],
        "lembaga": [
            "Klinik",
            "Puskesmas",
            "Rumah Sakit"
        ]
    },
    {
        "Id": 138,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["gejala serangan jantung dan penanganan darurat", "obat nitrogliserin bawah lidah nyeri dada", "pertolongan pertama sakit jantung igd"],
        "prosedur": [
            "Bantu pasien duduk, istirahat, dan longgarkan pakaiannya.",
            "Berikan obat nitrogliserin di bawah lidah jika pasien sudah punya resep dokter.",
            "Jangan berikan makanan atau minuman apa pun.",
            "Segera panggil ambulan atau bawa ke IGD jika nyeri dada menjalar ke lengan kiri atau rahang."
        ],
        "lembaga": [
            "Call Center 119",
            "Rumah Sakit"
        ]
    },
    {
        "Id": 139,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["cara deteksi gejala stroke fast", "golden hour penanganan pasien stroke rs", "pertolongan pertama serangan stroke darurat"],
        "prosedur": [
            "Lakukan deteksi FAST (Wajah turun, Lengan lemah, Bicara cadel/tidak jelas).",
            "Catat waktu pertama kali gejala muncul secara tepat (Golden Hour).",
            "Jangan beri makan, minum, atau obat sembarangan untuk menghindari tersedak.",
            "Segera bawa pasien ke IGD Rumah Sakit terdekat untuk penanganan darurat saraf."
        ],
        "lembaga": [
            "Rumah Sakit",
            "Call Center 119"
        ]
    },
    {
        "Id": 140,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["pertolongan pertama korban keracunan makanan", "cara mengatasi anak minum cairan kimia berbahaya", "sentra informasi keracunan rumah sakit igd"],
        "prosedur": [
            "Jauhkan korban dari sumber paparan bahan beracun.",
            "Jangan paksa korban untuk muntah kecuali atas instruksi tenaga medis.",
            "Amankan botol, kemasan, atau sisa makanan yang diduga menjadi penyebab keracunan.",
            "Segera bawa korban dan sampel racun ke IGD atau hubungi sentra informasi keracunan."
        ],
        "lembaga": [
            "Rumah Sakit",
            "Puskesmas"
        ]
    },
    {
        "Id": 141,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["cara menghentikan pendarahan luka terbuka", "penggunaan kain kasa steril tekan luka", "posisi tubuh mengurangi pendarahan hebat"],
        "prosedur": [
            "Gunakan sarung tangan medis atau plastik pelindung sebelum menyentuh luka.",
            "Tekan kuat pada area luka yang berdarah menggunakan kain bersih atau kassa steril.",
            "Tinggikan area tubuh yang luka agar posisinya berada di atas jantung.",
            "Jangan lepas kain jika darah tembus, tumpuk dengan kain baru lalu bawa ke IGD."
        ],
        "lembaga": [
            "Rumah Sakit",
            "Puskesmas",
            "Klinik"
        ]
    },
    {
        "Id": 142,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["pertolongan pertama sesak napas asma", "gejala anafilaksis bibir wajah membiru", "posisi duduk meredakan sesak napas darurat"],
        "prosedur": [
            "Pindahkan pasien ke tempat dengan ventilasi udara yang baik.",
            "Bantu pasien duduk setengah tegak atau bersandar untuk melonggarkan paru-paru.",
            "Bantu berikan obat inhaler atau pereda asma jika pasien memilikinya.",
            "Bawa ke IGD segera jika bibir/wajah membiru, napas berbunyi (mengi), atau kehilangan kesadaran."
        ],
        "lembaga": [
            "Rumah Sakit",
            "Puskesmas"
        ]
    },
    {
        "Id": 143,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["cara menolong orang kejang epilepsi", "posisi miring saat kejang jalan napas", "bahaya memasukkan sendok ke mulut kejang"],
        "prosedur": [
            "Amankan area sekitar dengan menjauhkan benda tajam atau keras dari korban.",
            "Miringkan tubuh korban perlahan agar jalan napas terbuka dan cairan tidak tertelan.",
            "Jangan memasukkan benda apa pun (sendok/jari) ke dalam mulut korban.",
            "Tunggu hingga kejang berhenti dengan sendirinya, lalu segera bawa ke fasilitas kesehatan."
        ],
        "lembaga": [
            "Rumah Sakit",
            "Klinik"
        ]
    },
    {
        "Id": 144,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["pertolongan pertama patah tulang patah terka", "cara memasang bidai darurat penyangga", "penanganan cedera tulang fraktur rumah sakit"],
        "prosedur": [
            "Jangan pernah mencoba untuk mengembalikan atau meluruskan tulang yang terlihat patah.",
            "Gunting pakaian yang menutupi area cedera agar luka mudah dipantau.",
            "Pasang bidai (penyangga) darurat menggunakan kayu, papan, atau kardus kaku yang dibalut kain.",
            "Kurangi pergerakan pada area yang cedera dan bawa segera ke rumah sakit."
        ],
        "lembaga": [
            "Rumah Sakit",
            "Puskesmas"
        ]
    },
    {
        "Id": 145,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["cara memanggil ambulans call center 119", "nomor darurat medis nasional indonesia gratis", "prosedur melaporkan lokasi kejadian gawat darurat"],
        "prosedur": [
            "Hubungi nomor darurat medis Nasional 119 dari telepon genggam atau telepon rumah.",
            "Sebutkan nama Anda, nomor yang bisa dihubungi, dan lokasi kejadian dengan sangat spesifik.",
            "Jelaskan kondisi korban (sadar/tidak, pendarahan, dll) dan jumlah korban.",
            "Jangan tutup telepon sebelum diinstruksikan oleh operator medis."
        ],
        "lembaga": [
            "Call Center 119",
            "Rumah Sakit",
            "Puskesmas"
        ]
    },
    {
        "Id": 146,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["cara membersihkan luka terbuka air mengalir", "suntik anti tetanus luka robek dalam", "perawatan luka infeksi puskesmas klinik"],
        "prosedur": [
            "Bersihkan luka terbuka dari kotoran di bawah air mengalir.",
            "Berikan tekanan pada luka jika terjadi pendarahan ringan hingga sedang.",
            "Tutup luka dengan perban, kassa steril, atau kain bersih.",
            "Bawa ke puskesmas atau klinik untuk pembersihan lanjutan, penjahitan, atau suntik tetanus."
        ],
        "lembaga": [
            "Puskesmas",
            "Klinik / Rumah Sakit"
        ]
    },
    {
        "Id": 147,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["pertolongan pertama luka bakar tersiram air panas", "bahaya odol pasta gigi luka bakar", "cara kompres luka bakar kassa steril basah"],
        "prosedur": [
            "Alirkan air bersuhu ruang (bukan air es) pada area luka bakar selama 15-20 menit.",
            "Jangan mengoleskan pasta gigi, mentega, atau kecap pada luka bakar.",
            "Lepaskan perhiasan atau pakaian di sekitar luka sebelum area tersebut membengkak.",
            "Tutup luka menggunakan kassa steril basah atau plastik wrap, lalu bawa ke fasilitas medis."
        ],
        "lembaga": [
            "Rumah Sakit",
            "Puskesmas"
        ]
    },
    {
        "Id": 148,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["cara melakukan cpr rjp korban tenggelam", "pertolongan pertama orang tenggelam tidak bernapas", "evakuasi darurat korban tenggelam di air"],
        "prosedur": [
            "Segera evakuasi korban dari dalam air ke tempat yang aman.",
            "Periksa respons kesadaran dan pernapasan korban.",
            "Jika korban tidak bernapas, segera lakukan Resusitasi Jantung Paru (RJP/CPR).",
            "Panggil bantuan darurat 119 and bawa ke rumah sakit meskipun korban sudah sadar sepenuhnya."
        ],
        "lembaga": [
            "Call Center 119",
            "Rumah Sakit"
        ]
    },
    {
        "Id": 149,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["cara menangani gigitan ular berbisa sabu", "vaksin anti rabies var gigitan anjing", "pertolongan pertama digigit hewan liar puskesmas"],
        "prosedur": [
            "Cuci area gigitan (anjing/kucing/monyet) dengan air dan sabun selama 15 menit.",
            "Jika digigit ular, jangan dihisap, diikat terlalu kencang, atau dipotong lukanya.",
            "Imobilisasi (kurangi pergerakan) area tubuh yang digigit, posisikan lebih rendah dari jantung.",
            "Bawa secepatnya ke IGD untuk mendapatkan Serum Anti Bisa Ular (SABU) atau Vaksin Anti Rabies (VAR)."
        ],
        "lembaga": [
            "Rumah Sakit",
            "Puskesmas"
        ]
    },
    {
        "Id": 150,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["cara melakukan heimlich maneuver orang tersedak", "pertolongan pertama anak tersedak benda asing", "hentakan perut penanganan tersedak darurat"],
        "prosedur": [
            "Tanyakan apakah korban bisa batuk keras atau berbicara.",
            "Jika tidak bisa napas, berdiri di belakang korban dan lakukan Heimlich Maneuver (hentakan perut).",
            "Lakukan hingga benda asing yang menyumbat jalan napas keluar.",
            "Jika korban pingsan, lakukan RJP dan segera minta bantuan ambulan."
        ],
        "lembaga": [
            "Call Center 119",
            "Rumah Sakit"
        ]
    },
    {
        "Id": 151,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["pertolongan pertama tersengat aliran listrik", "cara memutus saklar meteran kontak listrik", "bahaya menyentuh korban kesetrum tangan kosong"],
        "prosedur": [
            "Putuskan sumber aliran listrik (turunkan saklar meteran) terlebih dahulu.",
            "Jangan sentuh korban dengan tangan kosong jika masih kontak dengan arus listrik.",
            "Gunakan alat isolator (kayu kering, karet) untuk menjauhkan korban dari kabel.",
            "Cek napas dan nadi, lakukan CPR jika berhenti napas, dan segera bawa ke IGD untuk cek luka bakar dalam."
        ],
        "lembaga": [
            "PLN",
            "Call Center 119",
            "Rumah Sakit"
        ]
    },
    {
        "Id": 152,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["cara mengatasi syok hipovolemik medis", "posisi kaki mencegah hipotermia pasien syok", "pertolongan pertama keringat dingin pucat napas cepat"],
        "prosedur": [
            "Baringkan korban yang terlihat pucat, berkeringat dingin, dan bernapas cepat.",
            "Tinggikan kaki sekitar 30 cm di atas posisi kepala (kecuali curiga cedera punggung/kaki).",
            "Selimuti tubuh korban untuk mencegah hipotermia.",
            "Jangan memberikan makanan atau minuman, dan segera hubungi bantuan medis darurat."
        ],
        "lembaga": [
            "Call Center 119",
            "Rumah Sakit"
        ]
    },
    {
        "Id": 153,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["prosedur darurat melahirkan di rumah jalan", "cara memandu napas ibu melahirkan mendadak", "perawatan bayi baru lahir handuk kain bersih"],
        "prosedur": [
            "Segera hubungi bidan terdekat atau panggil ambulan untuk rujukan ke faskes.",
            "Tenangkan ibu dan atur posisi senyaman mungkin sambil memandu mengatur napas.",
            "Siapkan kain atau handuk bersih dan kering untuk menampung bayi jika persalinan terjadi mendadak.",
            "Jaga kehangatan bayi setelah lahir dan jangan menarik tali pusar sambil menunggu tenaga medis datang."
        ],
        "lembaga": [
            "Bidan",
            "Puskesmas",
            "Rumah Sakit"
        ]
    },
    {
        "Id": 154,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["penanganan syok anafilaktik alergi parah", "cara menggunakan injeksi epinefrin epipen", "pertolongan pertama bengkak tenggorokan sesak napas"],
        "prosedur": [
            "Jauhkan korban dari pemicu alergi (makanan, sengatan serangga, debu).",
            "Perhatikan gejala anafilaksis seperti sesak napas bengkak di wajah, bibir, atau tenggorokan.",
            "Gunakan injeksi Epinefrin (EpiPen) jika korban sudah memiliki resep khusus alergi.",
            "Segera panggil bantuan 119 atau larikan ke IGD karena kondisi bisa mengancam nyawa dalam hitungan menit."
        ],
        "lembaga": [
            "Call Center 119",
            "Rumah Sakit"
        ]
    },
    {
        "Id": 155,
        "kategori": "Kesehatan dan Medis (Darurat Medis)",
        "kata_kunci": ["cara bilas mata terkena cairan kimia", "pertolongan pertama cedera bola mata kassa", "irigasi cairan saline mengalir mata perih"],
        "prosedur": [
            "Cegah korban dari menggosok atau mengucek mata yang cedera.",
            "Jika terkena bahan kimia, bilas mata menggunakan air bersih atau cairan saline mengalir selama 15-20 menit.",
            "Tutup mata dengan kassa steril atau pelindung tanpa menekan bola mata.",
            "Segera bawa ke klinik mata atau IGD rumah sakit untuk penanganan lebih lanjut."
        ],
        "lembaga": [
            "Klinik Mata",
            "Rumah Sakit",
            "Puskesmas"
        ]
    },
// --- Bagian 10: KIP (Kartu Indonesia Pintar) ---
    {
        "Id": 156,
        "kategori": "Bantuan Sosial (KIP)",
        "kata_kunci": ["cara daftar pip kip gratis untuk sekolah", "pendaftaran kip kuliah dengan sktm kelurahan", "syarat mengajukan bansos pendidikan kemendikbud"],
        "prosedur": [
            "Minta Surat Keterangan Tidak Mampu (SKTM) dari Kelurahan.",
            "Bawa SKTM, Kartu Keluarga, dan Akta Kelahiran ke pihak sekolah/kampus.",
            "Pihak operator menginput data penerima ke sistem Dapodik atau siPINTAR.",
            "Tunggu proses verifikasi dan validasi kelayakan dari Kemendikbudristek."
        ],
        "lembaga": [
            "Kelurahan",
            "Sekolah / Kampus",
            "Kemendikbudristek"
        ]
    },
    {
        "Id": 157,
        "kategori": "Bantuan Sosial (KIP)",
        "kata_kunci": ["kartu kip atm bantuan sekolah hilang cetak ulang", "surat kehilangan kip polsek syarat bank", "cara mengurus kartu indonesia pintar hilang"],
        "prosedur": [
            "Buat Surat Keterangan Kehilangan di Polsek terdekat.",
            "Minta surat keterangan aktif penerima KIP dari Kepala Sekolah atau Dekan.",
            "Bawa kartu identitas (KTP/KK) beserta kedua surat tersebut ke bank penyalur.",
            "Ajukan cetak ulang kartu KIP/ATM baru ke petugas Customer Service bank."
        ],
        "lembaga": [
            "Polsek",
            "Sekolah / Kampus",
            "Bank Penyalur"
        ]
    },
    {
        "Id": 158,
        "kategori": "Bantuan Sosial (KIP)",
        "kata_kunci": ["cara cek status pencairan dana pip online", "syarat mencairkan uang bantuan kip di bank", "surat pengantar sekolah pencairan dana bansos"],
        "prosedur": [
            "Cek status penerima di situs resmi untuk memastikan dana sudah masuk SK Pemberian.",
            "Minta surat pengantar pencairan dana dari pihak sekolah atau kampus.",
            "Bawa KTP orang tua/mahasiswa, KK, dan Kartu KIP/Buku Tabungan ke bank penyalur.",
            "Ambil nomor antrean khusus bansos di bank untuk penarikan tunai."
        ],
        "lembaga": [
            "Sekolah / Kampus",
            "Bank Penyalur"
        ]
    },
    {
        "Id": 159,
        "kategori": "Bantuan Sosial (KIP)",
        "kata_kunci": ["cara aktivasi rekening simpel pip kemendikbud", "syarat aktivasi buku tabungan kip atm sekolah", "sk nominasi penerima bantuan aktivasi bank"],
        "prosedur": [
            "Cek pengumuman SK Nominasi penerima di sekolah atau laman PIP/KIP.",
            "Minta surat keterangan aktivasi rekening resmi dari kepala sekolah atau kampus.",
            "Siapkan fotokopi KTP orang tua/mandiri serta Kartu Keluarga.",
            "Datang ke bank penyalur yang ditunjuk untuk mengaktifkan rekening simpanan."
        ],
        "lembaga": [
            "Sekolah / Kampus",
            "Bank Penyalur"
        ]
    },
    {
        "Id": 160,
        "kategori": "Bantuan Sosial (KIP)",
        "kata_kunci": ["cara cek nisn nik penerima pip si pintar", "cek status kepesertaan kip kuliah online", "link resmi mengecek bantuan indonesia pintar"],
        "prosedur": [
            "Buka situs resmi pip.kemdikbud.go.id atau kip-kuliah.kemdikbud.go.id.",
            "Masukkan NISN atau NIK siswa/mahasiswa pada kolom pencarian.",
            "Isi kode pengaman atau captcha yang muncul dengan benar.",
            "Klik tombol cari data untuk melihat status kepesertaan dan info pencairan."
        ],
        "lembaga": [
            "Kemendikbudristek"
        ]
    },
    {
        "Id": 161,
        "kategori": "Bantuan Sosial (KIP)",
        "kata_kunci": ["cara daftar dtks kelurahan untuk dapat kip", "sinkronisasi id dtks dinas sosial sekolah", "pendaftaran data kemiskinan bansos pendidikan"],
        "prosedur": [
            "Datang ke Kantor Kelurahan atau Dinas Sosial setempat bawa KTP dan KK.",
            "Ajukan pendaftaran nama keluarga ke dalam data DTKS.",
            "Tunggu proses verifikasi lapangan oleh petugas kelurahan.",
            "Setelah data sinkron dan masuk DTKS, laporkan ID DTKS tersebut ke operator sekolah/kampus."
        ],
        "lembaga": [
            "Kelurahan",
            "Dinas Sosial",
            "Sekolah / Kampus"
        ]
    },
    {
        "Id": 162,
        "kategori": "Bantuan Sosial (KIP)",
        "kata_kunci": ["prosedur pindah sekolah penerima kip pip", "pencabutan data dapodik pddikti kampus lama", "cara mengurus bantuan kip di sekolah baru"],
        "prosedur": [
            "Minta surat keterangan pindah sekolah atau kampus dari instansi asal.",
            "Pastikan operator instansi lama sudah mengeluarkan data dari sistem Dapodik/PDDikti.",
            "Serahkan kartu KIP lama beserta surat pindah ke instansi yang baru.",
            "Operator baru akan menarik data agar bantuan KIP tetap berjalan di tempat baru."
        ],
        "lembaga": [
            "Sekolah / Kampus Asal",
            "Sekolah / Kampus Baru"
        ]
    },
    {
        "Id": 163,
        "kategori": "Bantuan Sosial (KIP)",
        "kata_kunci": ["kartu fisik kip rusak ganti baru bank", "syarat mengganti kartu atm pip yang patah", "buku tabungan penerima bantuan cs bank cabang"],
        "prosedur": [
            "Siapkan kartu KIP yang rusak fisik beserta buku tabungan.",
            "Bawa fotokopi KK dan KTP orang tua/mahasiswa sebagai pemilik rekening.",
            "Datang ke kantor cabang bank penyalur tempat pembukaan rekening pertama kali.",
            "Laporkan ke petugas Customer Service untuk penggantian fisik kartu yang baru."
        ],
        "lembaga": [
            "Bank Penyalur"
        ]
    },
    {
        "Id": 164,
        "kategori": "Bantuan Sosial (KIP)",
        "kata_kunci": ["cara mengatasi rekening kip kuliah terblokir", "mengaktifkan kembali rekening pip pasif", "buka blokir tabungan bansos customer service"],
        "prosedur": [
            "Siapkan dokumen identitas lengkap (KTP, KK, dan Buku Tabungan).",
            "Datang langsung ke kantor cabang bank penyalur terdekat.",
            "Sampaikan kendala status rekening KIP yang pasif atau terblokir.",
            "Ikuti instruksi petugas untuk proses buka blokir atau verifikasi ulang data diri."
        ],
        "lembaga": [
            "Bank Penyalur"
        ]
    },
    {
        "Id": 165,
        "kategori": "Bantuan Sosial (KIP)",
        "kata_kunci": ["cara reset pin atm kip lupa sandi", "ganti password kartu pip salah input angka", "bikin pin baru mesin edc bank penyalur"],
        "prosedur": [
            "Bawa buku tabungan, kartu ATM KIP, dan KTP asli pemilik rekening.",
            "Datang ke bagian Customer Service bank penyalur resmi.",
            "Sampaikan permohonan reset PIN kartu ATM karena lupa atau salah input.",
            "Buat PIN baru yang terdiri dari 6 digit angka aman melalui mesin EDC bank."
        ],
        "lembaga": [
            "Bank Penyalur"
        ]
    },
    {
        "Id": 166,
        "kategori": "Bantuan Sosial (KIP)",
        "kata_kunci": ["nik tidak valid online dukcapil data pip", "cara sinkronisasi data kk untuk kip kuliah", "konsolidasi server data kependudukan sekolah"],
        "prosedur": [
            "Kunjungi Kantor Dinas Dukcapil terdekat dengan membawa KK asli.",
            "Mintalah petugas melakukan pembaruan konsolidasi agar NIK berstatus online.",
            "Tunggu server pusat memperbarui status data kependudukan dalam 24 jam.",
            "Laporkan kembali ke pihak operator sekolah atau kampus agar sistem kartu melakukan sinkronisasi ulang."
        ],
        "lembaga": [
            "Dinas Dukcapil",
            "Sekolah / Kampus"
        ]
    },
    {
        "Id": 167,
        "kategori": "Bantuan Sosial (KIP)",
        "kata_kunci": ["cara lapor pemotongan dana pip sekolah", "aduan bansos salah sasaran kemdikbud lapor", "kanal pengaduan online kip kuliah pungli"],
        "prosedur": [
            "Akses kanal pengaduan resmi di kemdikbud.lapor.go.id atau ult.kemdikbud.go.id.",
            "Pilih menu pengaduan Program Indonesia Pintar atau KIP Kuliah.",
            "Tulis kronologi masalah pemotongan dana atau salah sasaran secara jelas.",
            "Unggah bukti pendukung seperti foto atau tangkapan layar, lalu kirim laporan."
        ],
        "lembaga": [
            "Kemendikbudristek",
            "Lapor.go.id"
        ]
    },
    {
        "Id": 168,
        "kategori": "Bantuan Sosial (KIP)",
        "kata_kunci": ["kuota kip kuliah perguruan tinggi swasta", "cara daftar jalur mandiri pts pakai kip", "seleksi wawancara akademik kampus swasta"],
        "prosedur": [
            "Cari daftar Perguruan Tinggi Swasta (PTS) yang mengalokasikan kuota KIP Kuliah.",
            "Lakukan pendaftaran akun di laman resmi KIP Kuliah Kemendikbud.",
            "Pilih jalur seleksi Mandiri PTS dan masukkan nama kampus tujuan.",
            "Ikuti proses seleksi akademik dan wawancara internal yang diadakan oleh pihak PTS."
        ],
        "lembaga": [
            "Kemendikbudristek",
            "Perguruan Tinggi Swasta"
        ]
    },
    {
        "Id": 169,
        "kategori": "Bantuan Sosial (KIP)",
        "kata_kunci": ["buku tabungan kip hilang urus baru", "surat pengantar cetak rekening pip sekolah", "laporan kehilangan tabungan bansos polisi"],
        "prosedur": [
            "Minta Surat Keterangan Kehilangan dari kantor kepolisian terdekat.",
            "Minta surat pengantar cetak buku tabungan dari pihak sekolah atau kampus.",
            "Bawa KTP asli, KK, dan kedua surat pengantar tersebut ke bank penyalur.",
            "Temui Customer Service untuk proses pembuatan buku tabungan KIP yang baru."
        ],
        "lembaga": [
            "Polsek",
            "Sekolah / Kampus",
            "Bank Penyalur"
        ]
    },
    {
        "Id": 170,
        "kategori": "Bantuan Sosial (KIP)",
        "kata_kunci": ["cara update kartu keluarga baru di dapodik", "perubahan data wali orang tua kip pddikti", "sinkronisasi berkas kk dukcapil bansos sekolah"],
        "prosedur": [
            "Siapkan Kartu Keluarga terbaru yang datanya sudah diperbarui di Dukcapil.",
            "Serahkan fotokopi KK baru ke operator Dapodik (sekolah) atau PDDikti (kampus).",
            "Operator mengunggah perubahan data wali/orang tua ke sistem pusat.",
            "Pastikan status data berubah di web guna kelancaran pencairan dana tahap berikutnya."
        ],
        "lembaga": [
            "Sekolah / Kampus",
            "Dinas Dukcapil"
        ]
    },
// --- Bagian 11: PIP (Program Indonesia Pintar) ---
    {
        "Id": 171,
        "kategori": "Bantuan Sosial (PIP)",
        "kata_kunci": ["cara daftar pip lewat sekolah", "pendaftaran bantuan kartu indonesia pintar", "syarat mengajukan pip gratis dapodik"],
        "prosedur": [
            "Laporkan diri ke pihak sekolah dengan membawa Kartu Keluarga (KK) dan KKS/SKTM.",
            "Sekolah mengusulkan nama siswa sebagai calon penerima melalui aplikasi Dapodik.",
            "Tunggu proses verifikasi, validasi, dan pemeringkatan kemiskinan oleh Kemendikbudristek.",
            "Cek berkala hasil usulan atau SK Nominasi di situs resmi PIP."
        ],
        "lembaga": [
            "Sekolah",
            "Kemendikbudristek"
        ]
    },
    {
        "Id": 172,
        "kategori": "Bantuan Sosial (PIP)",
        "kata_kunci": ["cara aktivasi rekening simpel pip bri bni", "syarat aktivasi buku tabungan simpanan pelajar", "surat pengantar kepala sekolah untuk aktivasi"],
        "prosedur": [
            "Cek apakah siswa masuk dalam daftar Surat Keputusan (SK) Nominasi PIP.",
            "Minta surat pengantar aktivasi rekening SimPel resmi dari kepala sekolah.",
            "Bawa KTP orang tua/wali, KK, dan surat pengantar ke bank penyalur (BRI/BNI/BSI).",
            "Isi formulir pembukaan dan aktivasi rekening Simpanan Pelajar di teller bank."
        ],
        "lembaga": [
            "Sekolah",
            "Bank Penyalur"
        ]
    },
    {
        "Id": 173,
        "kategori": "Bantuan Sosial (PIP)",
        "kata_kunci": ["cara mencicil tunggakan iuran bpjs mandiri", "program rehab rencana pembayaran bertahap jkn", "cek tagihan bpjs mandiri menunggak aktif kembali"],
        "prosedur": [
            "Pastikan status dana sudah masuk dalam SK Pemberian di portal resmi PIP.",
            "Minta surat pengantar pencairan dana ke pihak tata usaha sekolah.",
            "Datang ke bank penyalur dengan membawa Buku Tabungan SimPel dan kartu debet.",
            "Lakukan penarikan dana tunai di teller bank atau melalui mesin ATM."
        ],
        "lembaga": [
            "Sekolah",
            "Bank Penyalur"
        ]
    },
    {
        "Id": 174,
        "kategori": "Bantuan Sosial (PIP)",
        "kata_kunci": ["cara cek nisn nik penerima pip", "link resmi mengecek status bantuan pip", "cara melihat daftar penerima dana pip"],
        "prosedur": [
            "Akses situs resmi pip.kemdikbud.go.id melalui browser.",
            "Masukkan Nomor Induk Siswa Nasional (NISN) pada kolom yang tersedia.",
            "Masukkan Nomor Induk Kependudukan (NIK) siswa secara akurat.",
            "Isi hasil perhitungan kode keamanan (captcha) lalu klik tombol Cari Data."
        ],
        "lembaga": [
            "Kemendikbudristek"
        ]
    },
    {
        "Id": 175,
        "kategori": "Bantuan Sosial (PIP)",
        "kata_kunci": ["kartu pip atm simpel hilang cetak ulang", "surat kehilangan atm sekolah ke polsek", "cara mengurus buku tabungan pip hilang"],
        "prosedur": [
            "Laporkan kehilangan kartu PIP atau kartu ATM SimPel ke Polsek terdekat.",
            "Minta surat keterangan bukti penerima PIP aktif dari pihak sekolah.",
            "Bawa surat kehilangan, surat sekolah, KK, dan KTP orang tua ke bank penyalur.",
            "Ajukan permohonan cetak ulang kartu ATM atau buku tabungan yang baru."
        ],
        "lembaga": [
            "Polsek",
            "Sekolah",
            "Bank Penyalur"
        ]
    },
    {
        "Id": 176,
        "kategori": "Bantuan Sosial (PIP)",
        "kata_kunci": ["nominal dana bantuan pip sd smp sma", "besaran uang pip per jenjang pendidikan", "cek mutasi saldo simpanan pelajar bank"],
        "prosedur": [
            "Pastikan jenjang pendidikan aktif siswa saat ini (SD, SMP, atau SMA/SMK).",
            "Periksa apakah pencairan berada di semester gasal atau genap untuk siswa kelas awal/akhir.",
            "Cetak mutasi buku tabungan SimPel untuk melihat nominal dana yang masuk.",
            "Laporkan ke sekolah jika nominal tidak sesuai dengan ketentuan standar per jenjang."
        ],
        "lembaga": [
            "Bank Penyalur",
            "Kemendikbudristek"
        ]
    },
    {
        "Id": 177,
        "kategori": "Bantuan Sosial (PIP)",
        "kata_kunci": ["pendaftaran nama keluarga masuk dtks", "sinkronisasi data kemiskinan bansos dapodik", "cara urus dtks kelurahan dinas sosial"],
        "prosedur": [
            "Datang ke kantor desa atau kelurahan setempat dengan membawa KTP dan KK.",
            "Ajukan pendaftaran nama keluarga ke dalam sistem DTKS Kemensos.",
            "Tunggu proses verifikasi kelayakan oleh petugas dinas sosial daerah.",
            "Pastikan data DTKS yang berhasil terbit disinkronkan ke sistem Dapodik sekolah."
        ],
        "lembaga": [
            "Kantor Desa / Kelurahan",
            "Dinas Sosial",
            "Sekolah"
        ]
    },
    {
        "Id": 178,
        "kategori": "Bantuan Sosial (PIP)",
        "kata_kunci": ["prosedur pindah sekolah penerima bantuan pip", "mutasi dapodik sekolah asal kesiswaan baru", "melanjutkan bantuan pip di sekolah pindahan"],
        "prosedur": [
            "Urus surat mutasi atau pindah sekolah dari instansi asal secara resmi.",
            "Pastikan operator sekolah asal sudah meloloskan data siswa dari Dapodik lokal.",
            "Serahkan bukti tanda penerima PIP lama ke pihak sekolah yang baru.",
            "Operator sekolah baru akan menarik data siswa agar status bansos PIP berlanjut."
        ],
        "lembaga": [
            "Sekolah Asal",
            "Sekolah Baru"
        ]
    },
    {
        "Id": 179,
        "kategori": "Bantuan Sosial (PIP)",
        "kata_kunci": ["dana pip hangus kembali ke kas negara", "batas akhir deadline aktivasi rekening pip", "cara usul ulang siswa layak mendapat pip"],
        "prosedur": [
            "Periksa batas waktu (deadline) aktivasi rekening yang tertera pada SK Nominasi.",
            "Laporkan ke operator sekolah untuk mengecek apakah dana telanjur kembali ke kas negara.",
            "Ajukan pengusulan ulang melalui Dapodik jika nama siswa masih tergolong layak.",
            "Tunggu penetapan SK gelombang berikutnya dari pihak kementerian."
        ],
        "lembaga": [
            "Sekolah",
            "Kemendikbudristek"
        ]
    },
    {
        "Id": 180,
        "kategori": "Bantuan Sosial (PIP)",
        "kata_kunci": ["lapor potong dana pip pungutan liar", "aduan pungli bantuan sekolah lapor go id", "iuran resmi rapat komite sekolah potongan"],
        "prosedur": [
            "Cetak buku tabungan secara berkala untuk memantau histori transaksi keuangan.",
            "Konfirmasi ke pihak sekolah jika potongan berupa iuran resmi hasil rapat komite.",
            "Jika terindikasi pungutan liar (pungli), catat nama oknum dan total potongannya.",
            "Adukan tindakan pungli ke Dinas Pendidikan atau melalui portal kemdikbud.lapor.go.id."
        ],
        "lembaga": [
            "Bank Penyalur",
            "Sekolah",
            "Dinas Pendidikan",
            "Lapor.go.id"
        ]
    },
    {
        "Id": 181,
        "kategori": "Bantuan Sosial (PIP)",
        "kata_kunci": ["cara perbaiki salah nama nik di dapodik", "sinkronisasi identitas kk akta anak sekolah", "operator data sekolah edit profil siswa"],
        "prosedur": [
            "Bawa KTP orang tua, Kartu Keluarga, dan Akta Kelahiran siswa ke sekolah.",
            "Temui operator Dapodik sekolah untuk mencocokkan data identitas anak.",
            "Perbaiki kesalahan ejaan nama, tanggal lahir, atau NIK di sistem sekolah.",
            "Tunggu proses sinkronisasi Dapodik lokal ke server pusat Kemendikbudristek."
        ],
        "lembaga": [
            "Sekolah"
        ]
    },
    {
        "Id": 182,
        "kategori": "Bantuan Sosial (PIP)",
        "kata_kunci": ["cara cek keaktifan nomor nisn online", "mengatasi nisn ganda tidak ditemukan sekolah", "aplikasi vervalpd perbaikan data kemendikbud"],
        "prosedur": [
            "Cek status keaktifan NISN siswa melalui laman referensi data Kemendikbud.",
            "Laporkan ke operator sekolah jika nomor NISN tidak ditemukan atau ganda.",
            "Operator sekolah akan mengajukan perbaikan data NISN melalui aplikasi VervalPD.",
            "Pastikan NISN sudah valid dan terhubung dengan benar ke database PIP."
        ],
        "lembaga": [
            "Sekolah",
            "Kemendikbudristek"
        ]
    },
    {
        "Id": 183,
        "kategori": "Bantuan Sosial (PIP)",
        "kata_kunci": ["atm simpel pip rusak salah input pin", "cara urus kartu atm pip tertelan mesin bank", "customer service bank buka blokir atm sekolah"],
        "prosedur": [
            "Siapkan buku tabungan SimPel, KK asli, dan KTP orang tua/wali siswa.",
            "Datang langsung ke kantor cabang bank penyalur terdekat yang menerbitkan kartu.",
            "Laporkan kendala kartu ATM SimPel yang rusak, tertelan, atau salah PIN.",
            "Ikuti instruksi Customer Service untuk proses reset atau pembuatan kartu baru."
        ],
        "lembaga": [
            "Bank Penyalur"
        ]
    },
    {
        "Id": 184,
        "kategori": "Bantuan Sosial (PIP)",
        "kata_kunci": ["cara buat sktm kelurahan untuk sekolah", "surat pengantar rt rw dinas kesiswaan pip", "tanda status layak mendapat bantuan sekolah"],
        "prosedur": [
            "Minta surat pengantar pembuatan SKTM dari Ketua RT dan RW setempat.",
            "Bawa surat pengantar tersebut ke kantor kelurahan untuk menerbitkan SKTM resmi.",
            "Serahkan lembar SKTM asli beserta fotokopi KK ke bagian kesiswaan sekolah.",
            "Sekolah akan menandai status layak mendapat bantuan PIP di aplikasi Dapodik."
        ],
        "lembaga": [
            "RT/RW",
            "Kantor Kelurahan",
            "Sekolah"
        ]
    },
    {
        "Id": 185,
        "kategori": "Bantuan Sosial (PIP)",
        "kata_kunci": ["cara melanjutkan pip saat lulus jenjang baru", "update data alumni sekolah asal ke sekolah baru", "rekening simpel jembatan bantuan pip aktif"],
        "prosedur": [
            "Pastikan rekening SimPel di jenjang sebelumnya tidak ditutup secara mandiri.",
            "Minta sekolah asal mengeluarkan data siswa dari Dapodik karena telah lulus.",
            "Serahkan kartu PIP atau nomor rekening SimPel lama saat mendaftar di sekolah baru.",
            "Operator sekolah baru akan memperbarui data untuk melanjutkan PIP ke jenjang berikutnya."
        ],
        "lembaga": [
            "Sekolah Asal",
            "Sekolah Baru"
        ]
    },
// --- Bagian 12: PKH (Program Keluarga Harapan) ---
    {
        "Id": 186,
        "kategori": "Bantuan Sosial (PKH)",
        "kata_kunci": ["cara daftar pkh lewat balai desa", "pendaftaran dtks kemensos musyawarah kelurahan", "syarat pengajuan keluarga penerima manfaat baru"],
        "prosedur": [
            "Bawa KTP dan KK ke Balai Desa atau Kelurahan setempat.",
            "Ajukan pendaftaran DTKS melalui Musyawarah Desa/Kelurahan (Musdes/Muskel).",
            "Tunggu proses verifikasi lapangan oleh petugas Dinas Sosial.",
            "Cek status penetapan sebagai Keluarga Penerima Manfaat (KPM) secara berkala."
        ],
        "lembaga": [
            "Kantor Desa / Kelurahan",
            "Dinas Sosial"
        ]
    },
    {
        "Id": 187,
        "kategori": "Bantuan Sosial (PKH)",
        "kata_kunci": ["cara cek nama penerima bansos pkh", "link resmi cekbansos kemensos go id", "cara melihat status bantuan pkh pakai ktp"],
        "prosedur": [
            "Buka situs web resmi cekbansos.kemensos.go.id.",
            "Masukkan data wilayah (Provinsi, Kabupaten, Kecamatan, Desa) sesuai KTP.",
            "Ketik nama lengkap penerima manfaat sesuai yang tertera di KTP.",
            "Masukkan kode captcha yang muncul dan klik tombol 'Cari Data'."
        ],
        "lembaga": [
            "Kemensos"
        ]
    },
    {
        "Id": 188,
        "kategori": "Bantuan Sosial (PKH)",
        "kata_kunci": ["jadwal pencairan dana pkh tahap berjalan", "cara mencairkan bansos pkh di atm bni bri", "tarik tunai kartu kks merah putih agen"],
        "prosedur": [
            "Tunggu informasi jadwal pencairan per tahap dari Pendamping PKH.",
            "Bawa Kartu Keluarga Sejahtera (KKS) merah putih.",
            "Datang ke mesin ATM bank Himbara atau Agen BRILink/e-Warong terdekat.",
            "Lakukan penarikan tunai dana bantuan sesuai nominal komponen yang dimiliki."
        ],
        "lembaga": [
            "Pendamping PKH",
            "Bank Himbara / E-Warong"
        ]
    },
    {
        "Id": 189,
        "kategori": "Bantuan Sosial (PKH)",
        "kata_kunci": ["cara daftar usulan aplikasi cek bansos", "membuat akun dtks online pakai hp", "validasi data kemiskinan dinas sosial daerah"],
        "prosedur": [
            "Unduh aplikasi 'Cek Bansos' resmi dari Kemensos di ponsel pintar.",
            "Buat akun baru menggunakan KTP, KK, dan foto swafoto.",
            "Pilih menu 'Daftar Usulan' untuk mendaftarkan diri sendiri atau keluarga.",
            "Tunggu proses validasi dan persetujuan dari pihak Dinas Sosial daerah."
        ],
        "lembaga": [
            "Kemensos",
            "Dinas Sosial"
        ]
    },
    {
        "Id": 190,
        "kategori": "Bantuan Sosial (PKH)",
        "kata_kunci": ["kartu kks merah putih pkh hilang", "surat kehilangan kks polsek bank himbara", "cara mengurus kartu bansos pkh hilang"],
        "prosedur": [
            "Minta Surat Keterangan Kehilangan KKS dari Polsek terdekat.",
            "Laporkan kehilangan tersebut kepada Pendamping PKH di wilayah Anda.",
            "Bawa surat kehilangan kepolisian, KTP, dan KK ke bank penyalur.",
            "Ajukan proses pencetakan ulang Kartu Keluarga Sejahtera (KKS) yang baru."
        ],
        "lembaga": [
            "Polsek",
            "Pendamping PKH",
            "Bank Himbara"
        ]
    },
    {
        "Id": 191,
        "kategori": "Bantuan Sosial (PKH)",
        "kata_kunci": ["mengatasi kartu kks terblokir atm bank", "cara buka rekening pkh pasif dinonaktifkan", "status kepesertaan pkh tidak aktif cs bank"],
        "prosedur": [
            "Siapkan dokumen identitas lengkap (KTP, KK, dan KKS).",
            "Hubungi Pendamping PKH untuk memastikan status kepesertaan masih aktif.",
            "Datang ke kantor cabang bank Himbara penyalur sesuai logo di KKS.",
            "Sampaikan ke bagian Customer Service untuk pembukaan blokir rekening/kartu."
        ],
        "lembaga": [
            "Pendamping PKH",
            "Bank Himbara"
        ]
    },
    {
        "Id": 192,
        "kategori": "Bantuan Sosial (PKH)",
        "kata_kunci": ["kartu kks patah rusak ganti baru", "syarat ganti chip kks tidak terbaca mesin", "kunjungi cs bank himbara urus bansos pkh"],
        "prosedur": [
            "Siapkan fisik Kartu Keluarga Sejahtera (KKS) yang patah, terkelupas, atau rusak.",
            "Bawa fotokopi KTP dan Kartu Keluarga asli milik pengurus PKH.",
            "Kunjungi kantor cabang bank Himbara terdekat pada jam kerja.",
            "Serahkan kartu lama ke Customer Service untuk diganti dengan kartu KKS baru."
        ],
        "lembaga": [
            "Bank Himbara"
        ]
    },
    {
        "Id": 193,
        "kategori": "Bantuan Sosial (PKH)",
        "kata_kunci": ["cara tambah komponen anak sekolah di pkh", "buku kia ibu hamil balita aplikasi epkh", "pemutakhiran data nominal bansos pendamping"],
        "prosedur": [
            "Siapkan dokumen pendukung baru (Buku KIA untuk hamil/balita, rapor untuk anak sekolah).",
            "Serahkan salinan dokumen tersebut kepada Pendamping PKH setempat.",
            "Pendamping akan melakukan pemutakhiran data komponen di aplikasi e-PKH.",
            "Tunggu proses sinkronisasi pusat agar nominal bansos menyesuaikan komponen terbaru."
        ],
        "lembaga": [
            "Pendamping PKH",
            "Faskes / Sekolah"
        ]
    },
    {
        "Id": 194,
        "kategori": "Bantuan Sosial (PKH)",
        "kata_kunci": ["prosedur mutasi data pkh pindah domisili", "surat pindah dukcapil kpm pkh desa baru", "cara agar pkh tetap cair setelah pindah rumah"],
        "prosedur": [
            "Urus administrasi surat pindah domisili di Dinas Dukcapil setempat.",
            "Laporkan rencana kepindahan kepada Pendamping PKH asal.",
            "Bawa dokumen kependudukan yang baru ke kantor Desa/Kelurahan tujuan.",
            "Lapor ke Pendamping PKH di wilayah baru untuk memproses mutasi data KPM e-PKH."
        ],
        "lembaga": [
            "Dinas Dukcapil",
            "Pendamping PKH",
            "Kantor Desa / Kelurahan"
        ]
    },
    {
        "Id": 195,
        "kategori": "Bantuan Sosial (PKH)",
        "kata_kunci": ["cara mencari nomor wa pendamping pkh", "jadwal pertemuan p2k2 pkh desa kelurahan", "konsultasi kendala bansos pkh aparat desa"],
        "prosedur": [
            "Kunjungi kantor Desa atau Kelurahan domisili Anda.",
            "Tanyakan informasi jadwal Pertemuan Peningkatan Kemampuan Keluarga (P2K2) PKH.",
            "Minta kontak atau nomor WhatsApp Pendamping Sosial PKH yang bertugas di desa tersebut.",
            "Hubungi pendamping secara langsung untuk berkonsultasi mengenai kendala bansos."
        ],
        "lembaga": [
            "Kantor Desa / Kelurahan",
            "Pendamping PKH"
        ]
    },
    {
        "Id": 196,
        "kategori": "Bantuan Sosial (PKH)",
        "kata_kunci": ["mengapa saldo pkh kosong rp0 atm", "cek sp2d surat perintah pencairan dana pkh", "lapor pendamping saldo bansos belum masuk"],
        "prosedur": [
            "Pastikan Anda sudah menerima info resmi bahwa pencairan tahap berjalan sudah dimulai.",
            "Lakukan cek saldo melalui mesin ATM, agen bank, atau aplikasi m-banking.",
            "Jika saldo masih kosong (Rp0), laporkan segera kepada Pendamping PKH.",
            "Pendamping akan mengecek status SP2D (Surat Perintah Pencairan Dana) Anda di sistem."
        ],
        "lembaga": [
            "Bank Himbara",
            "Pendamping PKH"
        ]
    },
    {
        "Id": 197,
        "kategori": "Bantuan Sosial (PKH)",
        "kata_kunci": ["cara mengundurkan diri pkh graduasi mandiri", "pahlawan ekonomi nusantara pena kemensos", "verifikasi lapangan kpm pkh sudah mampu"],
        "prosedur": [
            "KPM melapor secara sukarela jika kondisi ekonomi sudah mandiri dan sejahtera.",
            "Pendamping PKH melakukan kunjungan untuk memverifikasi kelayakan lapangan.",
            "Pendamping mengubah status KPM menjadi 'Graduasi Mandiri' di dalam sistem e-PKH.",
            "KPM menerima sertifikat graduasi dan berpotensi diarahkan ke program kewirausahaan Pahlawan Ekonomi Nusantara (PENA)."
        ],
        "lembaga": [
            "Pendamping PKH",
            "Dinas Sosial"
        ]
    },
    {
        "Id": 198,
        "kategori": "Bantuan Sosial (PKH)",
        "kata_kunci": ["cara ganti pengurus pkh anggota meninggal", "akta kematian dukcapil ahli waris bansos", "proses gurustu ganti pengurus satu kartu keluarga"],
        "prosedur": [
            "Ahli waris mengurus akta kematian pengurus PKH di Dinas Dukcapil.",
            "Serahkan akta kematian dan Kartu Keluarga terbaru ke Pendamping PKH.",
            "Ajukan proses pergantian pengurus (Gurus) kepada anggota keluarga lain dalam satu KK.",
            "Jika tidak ada lagi komponen PKH yang tersisa di KK tersebut, kepesertaan akan otomatis dihentikan."
        ],
        "lembaga": [
            "Dinas Dukcapil",
            "Pendamping PKH"
        ]
    },
    {
        "Id": 199,
        "kategori": "Bantuan Sosial (PKH)",
        "kata_kunci": ["lupa sandi pin kks pkh reset baru", "salah input pin kartu kks teller bank", "syarat urus pin kks atm bri bni mandiri"],
        "prosedur": [
            "Siapkan KTP asli pengurus, KK, dan Kartu Keluarga Sejahtera (KKS).",
            "Datang langsung ke kantor cabang bank Himbara (BRI/BNI/Mandiri/BSI) penyalur.",
            "Ambil nomor antrean untuk layanan Customer Service bank.",
            "Minta bantuan petugas untuk mereset PIN KKS karena lupa atau terblokir akibat salah PIN."
        ],
        "lembaga": [
            "Bank Himbara"
        ]
    },
    {
        "Id": 200,
        "kategori": "Bantuan Sosial (PKH)",
        "kata_kunci": ["cara lapor pemotongan bansos pkh pungli", "call center kemensos nomor 171 aduan", "laporkan bansos tidak tepat sasaran online"],
        "prosedur": [
            "Kumpulkan bukti akurat jika terjadi pemotongan liar atau bansos salah sasaran.",
            "Akses layanan Call Center Kemensos di nomor 171 atau situs lapor.go.id.",
            "Sampaikan kronologi aduan secara lengkap beserta data diri dan lokasi kejadian.",
            "Tunggu proses investigasi dari pihak Dinas Sosial atau aparat pengawas terkait."
        ],
        "lembaga": [
            "Kemensos",
            "Lapor.go.id",
            "Dinas Sosial"
        ]
    }
]

// 2. ENDPOINT UTAMA UNTUK NETLIFY
app.post('*', async (req, res) => {
    try {
        const { pesan } = req.body;

        if (!pesan) {
            return res.status(400).json({ error: "Pesan tidak boleh kosong." });
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `Berikan analisis solusi teknis dan lembaga berwenang untuk keluhan ini: ${pesan}`
                }
            ],
            model: "llama3-8b-8192"
        });

        const jawabanAI = chatCompletion.choices[0]?.message?.content || "AI tidak memberikan jawaban.";

        // Anda juga bisa mengirimkan dataSubKategori ini ke frontend jika diperlukan
        res.json({ 
            jawaban: jawabanAI,
            dataKategori: dataSubKategori // Data Anda aman dan ikut terkirim
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Terjadi gangguan pada koneksi server backend." });
    }
});

// 3. PASANG ADAPTER SERVERLESS (GANTIKAN app.listen)
module.exports.handler = serverless(app);