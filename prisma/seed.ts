import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database tables...');
  await prisma.chatMessage.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.smartContract.deleteMany({});
  await prisma.stockLog.deleteMany({});
  await prisma.stockItem.deleteMany({});
  await prisma.supplierHealth.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.cooperative.deleteMany({});

  console.log('Seeding Cooperatives...');
  await prisma.cooperative.createMany({
    data: [
      { id: 'coop-sm', name: 'Koperasi Sumber Makmur', location: 'Demak, Jawa Tengah' },
      { id: 'coop-pw', name: 'Koperasi Padiwangi', location: 'Sragen, Jawa Tengah' },
      { id: 'coop-mj', name: 'Koperasi Melati Jaya', location: 'Kendal, Jawa Tengah' }
    ]
  });

  console.log('Seeding Users...');
  await prisma.user.createMany({
    data: [
      {
        id: 'user-superadmin',
        email: 'superadmin@vivaprocure.com',
        name: 'Dewi Lestari',
        role: 'super_admin',
        password: 'password123',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
        cooperativeId: null
      },
      {
        id: 'user-budi',
        email: 'budi@koperasi.com',
        name: 'Budi Santoso',
        role: 'cooperative_admin',
        password: 'password123',
        status: 'active',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXu-JfLwcBnjLPADNXE7w_78XNXdvEUZJw33ZlZkbuqQZJ8EGsu3AY-G1wix4E8lRcjBOUR_qgIT1h9410OY3xnH7NvJlyFM9sFQrOpS9WoE8yuj3U2ktwKJ74kwVkzKDa31zlWuzxqJDsSFP0LR-gFzL0USEuLHn5X_V4FV5t36bgiHPUKT07Sd0DDgOHzxnVcsAXTSBzm3IfKMyhIjVtjHDRz48rBSYi8euUVSU5uMAA8tF4PdJbZrWuzT9cnqURGYx9PxEC-epYSQ',
        cooperativeId: 'coop-sm'
      },
      {
        id: 'user-andi',
        email: 'andi@koperasi.com',
        name: 'Andi Wijaya',
        role: 'cooperative_admin',
        password: 'password123',
        status: 'active',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuGYGrvONT812oostw41O-2JFaaaQncdcabxcoH7RAenjMFSrYeO0PtWu9B3EPv73iK29ULBcZsr-xR9trYTFupWwDdzdqgcFJ-y34RZ5fl_tqtCU-LH8DDNiqH1Jj1KSYRA8tRiP9zSNJR5mVyrZKDtpKQd7pTZB5N04UWknYsW7_yO9nkBxI-g4ZbC3bnVlRB4sMmJVPnrE1DefhU2t1AYA5li_sMtWEK8kl5vN8gKbfI4ZSg1osK_BEfoHdSTz6sSLE2GCyC5ku',
        cooperativeId: 'coop-pw'
      },
      {
        id: 'user-supplier',
        email: 'supplier@vivaprocure.com',
        name: 'Herman Santoso',
        role: 'supplier',
        password: 'password123',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop',
        cooperativeId: null
      }
    ]
  });

  console.log('Seeding Stock Items...');
  await prisma.stockItem.createMany({
    data: [
      {
        id: '1',
        name: 'Pupuk Urea Subsidi',
        sku: 'UR-2024-001',
        cooperative: 'Sumber Makmur',
        stock: 450,
        unit: 'Ton',
        threshold: 1000,
        capacityMax: 2000,
        status: 'KRITIS',
      },
      {
        id: '2',
        name: 'NPK Phonska',
        sku: 'NP-2024-055',
        cooperative: 'Padiwangi',
        stock: 2400,
        unit: 'Ton',
        threshold: 800,
        capacityMax: 3000,
        status: 'SELESAI',
      },
      {
        id: '3',
        name: 'Pestisida Cair (5L)',
        sku: 'PC-2024-012',
        cooperative: 'Sumber Makmur',
        stock: 850,
        unit: 'Liter',
        threshold: 1200,
        capacityMax: 4000,
        status: 'PERINGATAN',
      },
    ],
  });

  console.log('Seeding Stock Logs...');
  await prisma.stockLog.createMany({
    data: [
      {
        id: 'log-1',
        type: 'masuk',
        title: 'Stok Masuk: Pupuk NPK',
        description: 'Diterima oleh: Admin Budi • Gudang Utama A',
        amount: '+1.200 Ton',
        color: 'text-emerald-600',
        date: '12 Okt 2023, 09:45',
      },
      {
        id: 'log-2',
        type: 'keluar',
        title: 'Stok Keluar: Pupuk Urea',
        description: 'Distribusi: Kelompok Tani B • Gudang B',
        amount: '-300 Ton',
        color: 'text-rose-600',
        date: '12 Okt 2023, 14:20',
      },
      {
        id: 'log-3',
        type: 'penyesuaian',
        title: 'Penyesuaian Stok: Pestisida',
        description: 'Audit Tahunan • Gudang Utama A',
        amount: '-12 Liter',
        color: 'text-amber-600',
        date: '11 Okt 2023, 16:00',
      },
    ],
  });

  console.log('Seeding Supplier Health...');
  await prisma.supplierHealth.createMany({
    data: [
      {
        code: 'PA',
        name: 'PT. Agrotama',
        product: 'Pupuk Utama',
        percentage: 98,
        status: 'SANGAT BAIK',
      },
      {
        code: 'SJ',
        name: 'CV. Subur Jaya',
        product: 'Benih & Nutrisi',
        percentage: 75,
        status: 'WASPADA',
      },
      {
        code: 'BF',
        name: 'Bina Flora Ltd',
        product: 'Pestisida',
        percentage: 92,
        status: 'BAIK',
      },
    ],
  });

  console.log('Seeding Smart Contracts...');
  await prisma.smartContract.createMany({
    data: [
      {
        id: 'PRC/VI/2026-JP-001',
        title: 'Surat Persetujuan Pengadaan Bersama - Pupuk Urea Subsidi',
        commodity: 'Pupuk Urea Subsidi',
        quantity: '450 Ton',
        price: 'Rp 6.200 / kg',
        totalValue: 'Rp 2.790.000.000',
        firstParty: 'H. Ahmad Subarjo',
        firstPartyTitle: 'Ketua Koperasi Sumber Makmur',
        secondParty: 'Ir. Sugeng Riyadi',
        secondPartyTitle: 'Manajer Distribusi PT Pupuk Indonesia',
        hash: '0x3a4b92c4cd88e3e4a5bf4d2bb0a07c3ea4ff82ccbf6a20d43f07a21f7c32',
        signedAt: '12 Mei 2026, 11:20 WIB',
        deliveryMethod: 'Pelabuhan Tanjung Emas, Semarang (FOB)',
        documentText: 'Menyepakati penyediaan komoditas Pupuk Urea Subsidi sebanyak 450 Ton untuk didistribusikan kepada seluruh kelompok tani binaan Koperasi Sumber Makmur guna mendukung musim tanam gadu.',
      },
      {
        id: 'PRC/VI/2026-JP-002',
        title: 'Perjanjian Pengadaan Nutrisi Tanaman Tambahan - NPK Phonska',
        commodity: 'NPK Phonska',
        quantity: '250 Ton',
        price: 'Rp 7.500 / kg',
        totalValue: 'Rp 1.875.000.000',
        firstParty: 'H. Ahmad Subarjo',
        firstPartyTitle: 'Ketua Koperasi Sumber Makmur',
        secondParty: 'Drs. Herman Santoso',
        secondPartyTitle: 'Direktur Komersial CV Subur Jaya',
        hash: '0x9d2e1b8a5fc7c3a4f8d2bb0a0cfb2e6a4fd2e8ea6a32cbfa9121a71f021c',
        signedAt: '25 Mei 2026, 14:45 WIB',
        deliveryMethod: 'Gudang Utama A - Koperasi Sumber Makmur (DDP)',
        documentText: 'Kerjasama pengadaan NPK Phonska non-subsidi guna memenuhi kekurangan alokasi pupuk bersubsidi pada wilayah kerja Koperasi Sumber Makmur.',
      },
      {
        id: 'PRC/VI/2026-JP-003',
        title: 'Kerjasama Penyediaan Pestisida Cair Organik',
        commodity: 'Pestisida Cair (5L)',
        quantity: '500 Liter',
        price: 'Rp 120.000 / Liter',
        totalValue: 'Rp 60.000.000',
        firstParty: 'H. Ahmad Subarjo',
        firstPartyTitle: 'Ketua Koperasi Sumber Makmur',
        secondParty: 'Yusuf Habibi, M.Si.',
        secondPartyTitle: 'Direktur Operasional Bina Flora Ltd',
        hash: '0x4f2b93a0dc881cb30129fbb63d2bb0a07c58ee71fa0c31ee39aa112f43bb',
        signedAt: '02 Juni 2026, 09:15 WIB',
        deliveryMethod: 'Gudang Logistik B (DAP)',
        documentText: 'Penyediaan dan pengiriman cairan pengendali hama hayati (pestisida organik) bersertifikasi untuk menjaga kelestarian ekosistem sawah anggota koperasi.',
      },
    ],
  });

  console.log('Seeding Orders...');
  await prisma.order.createMany({
    data: [
      {
        id: 'ORD/2026-JP-001',
        contractId: 'PRC/VI/2026-JP-001',
        supplierName: 'PT. Agrotama',
        commodity: 'Pupuk Urea Subsidi',
        quantity: '450 Ton',
        totalValue: 'Rp 2.790.000.000',
        currentStatus: 'diterima',
        courierName: 'Budi Hartono',
        courierPhone: '0812-7489-3281',
        lastPositionGPS: 'Gudang Utama A - Koperasi Sumber Makmur (Selesai Diterima)',
        lastCheckedTime: '15 Mei 2026, 14:30 WIB',
        createdAt: '12 Mei 2026',
        rating: 5,
        ratingDetails: {
          timeliness: 5,
          quality: 5,
          service: 5,
        },
        reviewComment: 'Sangat puas dengan pupuk urea bersubsidi ini. Pengiriman sangat cepat, dikawal berkas lengkap, dan segel karung semuanya utuh dalam kondisi kering di gudang kami.',
        allocation: { "Sumber Makmur": 450 },
        timeline: [
          {
            status: 'dikemas',
            title: 'Pesanan Diproses',
            description: 'Barang sedang disiapkan dan dikemas oleh PT. Agrotama di gudang sentral pabrik.',
            timestamp: '12 Mei 2026, 13:00 WIB',
            isActive: false,
            isCompleted: true,
          },
          {
            status: 'dikirim',
            title: 'Dalam Perjalanan (In Transit)',
            description: 'Truk pengangkut berangkat menuju Pelabuhan Transit Semarang via rute Pantura.',
            timestamp: '13 Mei 2026, 08:30 WIB',
            isActive: false,
            isCompleted: true,
          },
          {
            status: 'sampai',
            title: 'Tiba di Lokasi Tujuan',
            description: 'Logistik tiba di Gudang Utama Koperasi Sumber Makmur and siap dilakukan bongkar muat.',
            timestamp: '15 Mei 2026, 10:15 WIB',
            isActive: false,
            isCompleted: true,
          },
          {
            status: 'diterima',
            title: 'Telah Diterima & Diverifikasi',
            description: 'Ketua Koperasi telah meninjau fisik pupuk dan merilis konfirmasi penerimaan di rantai Ledger.',
            timestamp: '15 Mei 2026, 14:30 WIB',
            isActive: true,
            isCompleted: true,
          },
        ],
      },
      {
        id: 'ORD/2026-JP-002',
        contractId: 'PRC/VI/2026-JP-002',
        supplierName: 'CV. Subur Jaya',
        commodity: 'NPK Phonska',
        quantity: '250 Ton',
        totalValue: 'Rp 1.875.000.000',
        currentStatus: 'dikirim',
        courierName: 'Supriyanto',
        courierPhone: '0852-1928-8422',
        lastPositionGPS: 'Interchange Cikampek KM 72 - Menuju Jalur Utama Pantura',
        lastCheckedTime: '12 Juni 2026, 19:40 WIB',
        createdAt: '11 Juni 2026',
        allocation: { "Sumber Makmur": 250 },
        timeline: [
          {
            status: 'dikemas',
            title: 'Pesanan Diproses',
            description: 'CV. Subur Jaya memverifikasi pembayaran ledger and menyiapkan alokasi muatan NPK.',
            timestamp: '11 Juni 2026, 15:20 WIB',
            isActive: false,
            isCompleted: true,
          },
          {
            status: 'dikirim',
            title: 'Dalam Perjalanan Luar Kota',
            description: 'Armada logistik truk tronton ganda menyusuri rute darat trans-jawa Jawa Tengah.',
            timestamp: '12 Juni 2026, 09:10 WIB',
            isActive: true,
            isCompleted: true,
          },
          {
            status: 'sampai',
            title: 'Sampai di Tujuan',
            description: 'Menunggu konfirmasi kedatangan logistik fisik oleh kurir resmi.',
            timestamp: '',
            isActive: false,
            isCompleted: false,
          },
          {
            status: 'diterima',
            title: 'Konfirmasi Penerimaan Koperasi',
            description: 'Proses serah terima fisik komoditas pupuk oleh Kepala Logistik Koperasi.',
            timestamp: '',
            isActive: false,
            isCompleted: false,
          },
        ],
      },
      {
        id: 'ORD/2026-JP-003',
        contractId: 'PRC/VI/2026-JP-003',
        supplierName: 'Bina Flora Ltd',
        commodity: 'Pestisida Cair (5L)',
        quantity: '500 Liter',
        totalValue: 'Rp 60.000.000',
        currentStatus: 'sampai',
        courierName: 'Anwar Suhendra',
        courierPhone: '0877-3844-9911',
        lastPositionGPS: 'Gudang Logistik B - Koperasi Sumber Makmur (Tiba di Area Parkir Bongkar Muat)',
        lastCheckedTime: '12 Juni 2026, 20:15 WIB',
        createdAt: '10 Juni 2026',
        allocation: { "Sumber Makmur": 500 },
        timeline: [
          {
            status: 'dikemas',
            title: 'Pesanan Diproses',
            description: 'Bina Flora Ltd mengemas 100 karton Pestisida Organik Cair (kemasan 5 liter) ke palet anti-guncang.',
            timestamp: '10 Juni 2026, 11:15 WIB',
            isActive: false,
            isCompleted: true,
          },
          {
            status: 'dikirim',
            title: 'Pengiriman Kurir Khusus Cairan',
            description: 'Menggunakan armada berizin khusus transportasi bahan agro-kimia hayati.',
            timestamp: '11 Juni 2026, 08:00 WIB',
            isActive: false,
            isCompleted: true,
          },
          {
            status: 'sampai',
            title: 'Kurir Tiba di Pos Logistik',
            description: 'Armada logistik menyelesaikan navigasi. Kurir telah menekan konfirmasi ketibaan logistik.',
            timestamp: '12 Juni 2026, 20:15 WIB',
            isActive: true,
            isCompleted: true,
          },
          {
            status: 'diterima',
            title: 'Konfirmasi Penerimaan Koperasi',
            description: 'Menunggu penandatanganan berita acara serah terima langsung di sistem oleh tim koperasi.',
            timestamp: '',
            isActive: false,
            isCompleted: false,
          },
        ],
      },
    ],
  });

  console.log('Seeding Chat Messages welcome...');
  await prisma.chatMessage.create({
    data: {
      id: 'welcome-message',
      sender: 'ai',
      text: 'Halo Budi S.! Saya asisten VivaAI milik koperasi Anda. Saya dapat menganalisis penawaran harga, status stok, tren cuaca mitigasi risiko logistik, atau mempersiapkan draf restock otomatis ke supplier utama. Ajukan pertanyaan Anda sekarang.',
      timestamp: new Date(),
      chips: ['Bandingkan Harga Urea', 'Cek Stok Gudang', 'Bagaimana Cuaca Jawa Tengah?'],
    },
  });

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
