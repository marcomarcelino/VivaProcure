import { StockItem, StockLog, SupplierBid, ProcurementLog, SupplierHealth, SmartContract, Order } from './types';

export const INITIAL_STOCK_ITEMS: StockItem[] = [
  {
    id: '1',
    name: 'Pupuk Urea Subsidi',
    sku: 'UR-2024-001',
    cooperative: 'Tani Makmur',
    stock: 450,
    unit: 'Ton',
    threshold: 1000,
    capacityMax: 2000,
    status: 'KRITIS'
  },
  {
    id: '2',
    name: 'NPK Phonska',
    sku: 'NP-2024-055',
    cooperative: 'Suka Maju',
    stock: 2400,
    unit: 'Ton',
    threshold: 800,
    capacityMax: 3000,
    status: 'SELESAI'
  },
  {
    id: '3',
    name: 'Pestisida Cair (5L)',
    sku: 'PC-2024-012',
    cooperative: 'Tani Makmur',
    stock: 850,
    unit: 'Liter',
    threshold: 1200,
    capacityMax: 4000,
    status: 'PERINGATAN'
  }
];

export const INITIAL_STOCK_LOGS: StockLog[] = [
  {
    id: 'log-1',
    type: 'masuk',
    title: 'Stok Masuk: Pupuk NPK',
    description: 'Diterima oleh: Admin Budi • Gudang Utama A',
    amount: '+1.200 Ton',
    color: 'text-emerald-600',
    date: '12 Okt 2023, 09:45'
  },
  {
    id: 'log-2',
    type: 'keluar',
    title: 'Stok Keluar: Pupuk Urea',
    description: 'Distribusi: Kelompok Tani B • Gudang B',
    amount: '-300 Ton',
    color: 'text-rose-600',
    date: '12 Okt 2023, 14:20'
  },
  {
    id: 'log-3',
    type: 'penyesuaian',
    title: 'Penyesuaian Stok: Pestisida',
    description: 'Audit Tahunan • Gudang Utama A',
    amount: '-12 Liter',
    color: 'text-amber-600',
    date: '11 Okt 2023, 16:00'
  }
];

export const INITIAL_BIDS: SupplierBid[] = [
  {
    id: 'bid-1',
    name: 'Supplier Anonim #1',
    encryptedId: 'Identitas Terenkripsi',
    bidStatus: 'SUDAH SUBMIT - TERKUNCI',
    isLocked: true,
    docVerified: true,
    quoteRange: 'TERKUNCI'
  },
  {
    id: 'bid-2',
    name: 'Supplier Anonim #2',
    encryptedId: 'Identitas Terenkripsi',
    bidStatus: 'SUDAH SUBMIT - TERKUNCI',
    isLocked: true,
    docVerified: true,
    quoteRange: 'TERKUNCI'
  },
  {
    id: 'bid-3',
    name: 'Supplier Anonim #3',
    encryptedId: 'Identitas Terenkripsi',
    bidStatus: 'SEDANG MENINJAU DOKUMEN',
    isLocked: false,
    docVerified: false,
    quoteRange: '-'
  }
];

export const INITIAL_PROCUREMENT_LOGS: ProcurementLog[] = [
  {
    time: '09:42 WIB',
    activity: 'Update Penawaran PT. Agrotama',
    user: 'Sistem AI',
    status: 'BERHASIL'
  },
  {
    time: '08:15 WIB',
    activity: 'Persetujuan Kuota Koperasi Makmur Jaya',
    user: 'Budi S.',
    status: 'BERHASIL'
  },
  {
    time: 'Kemarin',
    activity: 'Pengajuan Revisi Harga NPK',
    user: 'CV. Subur Jaya',
    status: 'TERTUNDA'
  },
  {
    time: 'Kemarin',
    activity: 'Input Stok Bulanan',
    user: 'Admin Gudang',
    status: 'BERHASIL'
  }
];

export const INITIAL_SUPPLIER_HEALTHS: SupplierHealth[] = [
  {
    code: 'PA',
    name: 'PT. Agrotama',
    product: 'Pupuk Utama',
    percentage: 98,
    status: 'SANGAT BAIK'
  },
  {
    code: 'SJ',
    name: 'CV. Subur Jaya',
    product: 'Benih & Nutrisi',
    percentage: 75,
    status: 'WASPADA'
  },
  {
    code: 'BF',
    name: 'Bina Flora Ltd',
    product: 'Pestisida',
    percentage: 92,
    status: 'BAIK'
  }
];

export const TRANSLATIONS = {
  id: {
    // Menu
    dasbor: 'Dasbor',
    detailSesi: 'Detail Sesi',
    asistenAI: 'Asisten AI',
    stokInventaris: 'Stok Inventaris',
    contracts: 'Kontrak Pintar',
    lacakOrder: 'Lacak Pesanan',
    matriksPemasok: 'Matriks Pemasok',
    pengaturan: 'Pengaturan',
    bantuan: 'Bantuan',
    logout: 'Keluar',
    taniMakmur: 'Koperasi Tani Makmur',
    sumberMakmur: 'Koperasi Sumber Makmur',
    brandTitle: 'VivaProcure',
    
    // Login Screen
    welcomeBack: 'Selamat Datang Kembali',
    pleaseLogin: 'Silakan masukkan kredensial akun Anda.',
    email: 'Alamat Email',
    password: 'Kata Sandi',
    forgotPassword: 'Lupa Sandi?',
    rememberMe: 'Ingat saya di perangkat ini',
    loginButton: 'Masuk Sekarang',
    aiTip: 'Info AI:',
    aiTipLogin: 'Gunakan otentikasi dua faktor untuk mengamankan data inventaris koperasi Anda.',
    subTextBrand: 'Empowering sustainable agriculture through data-driven procurement and cooperative management.',
    agroIntel: 'Agro-Intelligence',

    // Dashboard Screen
    summaryProcurement: 'Berikut ringkasan pengadaan kolektif hari ini.',
    totalSavings: 'TOTAL PENGHEMATAN (BULAN INI)',
    lowStockWarning: 'PERINGATAN STOK RENDAH',
    aiInsightTitle: 'WAWASAN AI',
    aiInsightOptim: 'Optimasi Pengadaan',
    aiInsightDesc: "Bergabunglah dengan pengadaan 'NPK' untuk diskon tambahan 5%.",
    viewAnalysis: 'Lihat Analisis',
    restockSoon: 'Segera lakukan restock kolektif',
    activeSessions: 'Pengadaan Bersama Aktif',
    targetVolume: 'Target Volume',
    partisipan: 'Partisipan',
    totalVolume: 'Total Volume',
    pantauSesi: 'Pantau Sesi',
    tambahKuota: 'Tambah Kuota',
    kesehatanPemasok: 'Kesehatan Pemasok',
    lihatPemasokDirektori: 'Lihat Direktori Pemasok',
    logAktivitas: 'Log Aktivitas Pengadaan',
    waktu: 'WAKTU',
    aktivitas: 'AKTIVITAS',
    user: 'USER',
    status: 'STATUS',

    // Asisten AI Screen
    assistantTitle: 'VivaProcure AI',
    assistantSubtitle: 'Gemini-powered Insights. Data real-time diperbarui 5 menit yang lalu.',
    weatherAlert: 'PERINGATAN CUACA',
    weatherAlertDesc: 'Curah hujan tinggi diprediksi di Jawa Tengah (Area A2) dalam 48 jam. Rekomendasi: Percepat pengiriman logistik pupuk.',
    marketTrend: 'Tren Harga Pasar',
    quickActions: 'Aksi Cepat',
    createReport: 'Buat Laporan PDF',
    remindSupplier: 'Ingatkan Pemasok',
    logistikJateng: 'LOGISTIK JAWA TENGAH',
    typePlaceholder: "Tanya VivaAI (contoh: 'Cek stok gudang B')...",

    // Warehouse Stocks
    warehouseTitle: 'Manajemen Stok & Gudang',
    warehouseStockBreadcrumb: 'Inventaris / Tampilan Gudang',
    allCoops: 'Semua Koperasi',
    stockReport: 'Laporan Stok',
    criticalStock: 'STOK KRITIS',
    itemsBelowThreshold: 'Item di bawah ambang batas minimum.',
    aiStockTitle: 'Wawasan AI: Optimasi Stok',
    aiStockDesc: 'Berdasarkan prediksi cuaca dan musim tanam, kebutuhan Pupuk Urea akan melonjak 25% dalam 14 hari ke depan. Disarankan melakukan restock segera.',
    totalWarehouseCap: 'Kapasitas Total Gudang',
    occupiedPercent: 'Terisi',
    productList: 'Daftar Produk Inventaris',
    produkColumn: 'Produk',
    coopColumn: 'Koperasi',
    currentStockColumn: 'Stok Saat Ini',
    minThresholdColumn: 'Min. Ambang',
    warehouseCapColumn: 'Kapasitas Gudang',
    stockLogsTitle: 'Log Aktivitas Inventaris',
    viewAllLogs: 'Lihat Semua Log',
    inputNewStock: 'Input Stok Baru',

    // Contract View
    mutualApprovalTracker: 'MUTUAL APPROVAL TRACKER',
    pihakPertama: 'Pihak Pertama',
    pihakKedua: 'Pihak Kedua (Anda)',
    firstPartyCoopName: 'Koperasi Tani Makmur',
    secondPartySupplierName: 'Winner Supplier (PT Pupuk AgriNusa)',
    approvedStatus: 'SUDAH DISETUJUI',
    pendingStatus: 'MENUNGGU',
    reviewingDocs: 'Sedang Meninjau Dokumen...',
    docNumber: 'Nomor Dokumen',
    contractDocTitle: 'Surat Persetujuan Pengadaan Bersama',
    contractIntro: 'Pada hari ini, Jumat tanggal Dua Puluh Empat bulan Mei tahun Dua Ribu Dua Puluh Empat (24-05-2024), yang bertanda tangan di bawah ini sepakat untuk menjalin kerjasama pengadaan komoditas pertanian dengan rincian sebagai berikut:',
    komoditas: 'Komoditas',
    kuantitasTotal: 'Kuantitas Total',
    hargaSatuan: 'Harga Satuan',
    totalNilaiKontrak: 'Total Nilai Kontrak',
    metodePengiriman: 'Metode Pengiriman',
    contractFooterText: 'Dokumen ini merupakan bagian yang tidak terpisahkan dari kontrak pintar (smart contract) nomor #JP-2026-004 yang tercatat pada sistem VivaProcure. Segala bentuk persetujuan yang dilakukan secara elektronik melalui platform ini memiliki kekuatan hukum yang sah dan mengikat kedua belah pihak.',
    firstPartySignText: 'H. Ahmad Subarjo',
    firstPartyTitle: 'Ketua Koperasi Tani Makmur',
    secondPartyPrompt: 'Klik tombol Tanda Tangani di bawah untuk menyetujui secara digital',
    secondPartyPlaceholderName: 'Bapak/Ibu Pemenang',
    secondPartyPlaceholderTitle: 'Direktur Operasional PT Pupuk AgriNusa',
    riskAssessment: 'Risk Assessment',
    blockchainLedgerHeader: 'Blockchain Ledger',
    pendingHash: 'Pending Hash',
    protocolVersion: 'Protocol Version',
    awaitingSignature: 'Awaiting final signature',
    activityLogHeader: 'Activity Log',
    batal: 'Batal',
    signApproveBtn: 'Tanda Tangani & Approve',
    blockchainActive: 'Blockchain Active',

    // Stepper Verifikasi
    koleksi: 'Koleksi',
    verifikasi: 'Verifikasi',
    analisis: 'Analisis',
    konfirmasi: 'Konfirmasi',
    prosedurKerja: 'Tinjau dan konfirmasi hasil koleksi data sebelum melanjutkan ke analisis pemasok.',
    validationHeader: 'STATUS VERIFIKASI',
    validationList1: 'Validasi Identitas Koperasi',
    validationList2: 'Pengecekan Kapasitas Gudang',
    validationList3: 'Verifikasi Rekening Bank',
    auditFinding: 'Temuan Audit AI',
    warningCapacityTitle: 'Peringatan Kapasitas: Koperasi Maju Bersama',
    warningCapacityDesc: 'Berdasarkan data historis dan laporan saat ini, Koperasi Maju Bersama mendekati batas maksimal kapasitas penyimpanan (92% penuh). Disarankan untuk menjadwalkan pengambilan lebih awal.',
    reviewLogistics: 'Tinjau Detail Logistik',
    backToKoleksi: 'Kembali ke Koleksi',
    confirmNext: 'Konfirmasi & Lanjut',

    // Data Collection List
    biddingDeadline: 'Sisa Waktu Bidding: 02 Hari : 14 Jam : 30 Menit',
    coopListDesc: 'Monitor and manage supplier bids and document verification.',
    supplierName: 'Supplier Name',
    bidStatusLabel: 'Bid Status',
    docVerificationLabel: 'Doc Verification',
    quoteRangeLabel: 'Quote Range',
    financialSummaryTitle: 'Ringkasan Finansial VivaAI',
    financialSummaryDesc: 'Total akumulasi volume 100 Ton berhasil mengunci Tier Diskon Massal. Analisis keuntungan riil untuk masing-masing koperasi akan dikalkulasi otomatis oleh VivaAI setelah jendela bidding ditutup.',

    // Final Confirmation Tab
    finalReviewTitle: 'Tinjauan Akhir',
    finalReviewSubtitle: 'Silakan periksa detail perjanjian di bawah ini sebelum mengeksekusi kontrak pintar.',
    systemAnalysisTitle: 'ANALISIS SISTEM',
    systemAnalysisDesc: 'Perjanjian ini selaras dengan tujuan keberlanjutan koperasi dan diproyeksikan menghemat biaya logistik sebesar 12% dibandingkan kuartal sebelumnya.',
    pemasokTerpilih: 'Pemasok Terpilih',
    nilaiKontrak: 'Nilai Kontrak',
    ringkasanAlokasi: 'Ringkasan Alokasi',
    checkboxConsent: 'Saya mengonfirmasi bahwa rincian di atas sudah benar dan menyetujui persyaratan kerangka kerja Koperasi serta eksekusi kontrak pintar otomatis.',
    buttonSignExec: 'Tanda Tangani & Eksekusi Kontrak Pintar',
    securedSecured: 'Transaksi ini dilindungi oleh enkripsi SSL 256-bit dan tercatat pada Ledger Koperasi.'
  },
  en: {
    // Menu
    dasbor: 'Dashboard',
    detailSesi: 'Session Details',
    asistenAI: 'AI Assistant',
    stokInventaris: 'Stock Inventory',
    contracts: 'Smart Contracts',
    lacakOrder: 'Order Tracking',
    matriksPemasok: 'Supplier Matrix',
    pengaturan: 'Settings',
    bantuan: 'Help',
    logout: 'Logout',
    taniMakmur: 'Tani Makmur Cooperative',
    sumberMakmur: 'Sumber Makmur Cooperative',
    brandTitle: 'VivaProcure',

    // Login Screen
    welcomeBack: 'Welcome Back',
    pleaseLogin: 'Please enter your account credentials.',
    email: 'Email Address',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember me on this device',
    loginButton: 'Login Now',
    aiTip: 'AI Info:',
    aiTipLogin: 'Use two-factor authentication to secure your cooperative inventory data.',
    subTextBrand: 'Empowering sustainable agriculture through data-driven procurement and cooperative management.',
    agroIntel: 'Agro-Intelligence',

    // Dashboard Screen
    summaryProcurement: "Here is today's collective procurement summary.",
    totalSavings: 'TOTAL SAVINGS (THIS MONTH)',
    lowStockWarning: 'LOW STOCK WARNING',
    aiInsightTitle: 'AI INSIGHT',
    aiInsightOptim: 'Procurement Optimization',
    aiInsightDesc: "Join the 'NPK' procurement session for an additional 5% discount.",
    viewAnalysis: 'View Analysis',
    restockSoon: 'Perform collective restocking immediately',
    activeSessions: 'Active Collective Procurements',
    targetVolume: 'Target Volume',
    partisipan: 'Participants',
    totalVolume: 'Total Volume',
    pantauSesi: 'Monitor Session',
    tambahKuota: 'Add Quota',
    kesehatanPemasok: 'Supplier Health',
    lihatPemasokDirektori: 'View Supplier Directory',
    logAktivitas: 'Procurement Activity Log',
    waktu: 'TIME',
    aktivitas: 'ACTIVITY',
    user: 'USER',
    status: 'STATUS',

    // Asisten AI Screen
    assistantTitle: 'VivaProcure AI',
    assistantSubtitle: 'Gemini-powered Insights. Real-time data updated 5 minutes ago.',
    weatherAlert: 'WEATHER WARNING',
    weatherAlertDesc: 'High rainfall predicted in Central Java (Area A2) within 48 hours. Recommendation: Accelerate fertilizer logistical deliveries.',
    marketTrend: 'Market Price Trends',
    quickActions: 'Quick Actions',
    createReport: 'Generate PDF Report',
    remindSupplier: 'Remind Supplier',
    logistikJateng: 'CENTRAL JAVA LOGISTICS',
    typePlaceholder: "Ask VivaAI (e.g. 'Check stock warehouse B')...",

    // Warehouse Stocks
    warehouseTitle: 'Stock & Warehouse Management',
    warehouseStockBreadcrumb: 'Inventory / Warehouse View',
    allCoops: 'All Cooperatives',
    stockReport: 'Stock Report',
    criticalStock: 'CRITICAL STOCK',
    itemsBelowThreshold: 'Items below minimum threshold.',
    aiStockTitle: 'AI Insight: Stock Optimization',
    aiStockDesc: 'Based on weather and planting season predictions, Urea Fertilizer requirement will jump 25% in the next 14 days. Immediate restocking is advised.',
    totalWarehouseCap: 'Total Warehouse Capacity',
    occupiedPercent: 'Filled',
    productList: 'Inventory Product List',
    produkColumn: 'Product',
    coopColumn: 'Cooperative',
    currentStockColumn: 'Current Stock',
    minThresholdColumn: 'Min. Threshold',
    warehouseCapColumn: 'Warehouse Capacity',
    stockLogsTitle: 'Inventory Activity Logs',
    viewAllLogs: 'View All Logs',
    inputNewStock: 'Input New Stock',

    // Contract View
    mutualApprovalTracker: 'MUTUAL APPROVAL TRACKER',
    pihakPertama: 'First Party',
    pihakKedua: 'Second Party (You)',
    firstPartyCoopName: 'Tani Makmur Cooperative',
    secondPartySupplierName: 'Winning Supplier (PT Pupuk AgriNusa)',
    approvedStatus: 'APPROVED',
    pendingStatus: 'PENDING',
    reviewingDocs: 'Reviewing Documents...',
    docNumber: 'Document Number',
    contractDocTitle: 'Cooperative Procurement Joint Agreement',
    contractIntro: 'On this day, Friday May Twenty-Fourth in the year Two Thousand and Twenty-Four (24-05-2024), the undersigned agree to establish a agricultural procurement joint partnership with the following details:',
    komoditas: 'Commodity',
    kuantitasTotal: 'Total Quantity',
    hargaSatuan: 'Unit Price',
    totalNilaiKontrak: 'Total Contract Value',
    metodePengiriman: 'Delivery Method',
    contractFooterText: 'This document constitutes an inseparable part of smart contract number #JP-2026-004 recorded on the VivaProcure system. All forms of electronic consent performed via this platform hold full legal binding power for both parties.',
    firstPartySignText: 'H. Ahmad Subarjo',
    firstPartyTitle: 'Chairman of Tani Makmur Cooperative',
    secondPartyPrompt: "Click the 'Sign & Approve' button below to sign digitally",
    secondPartyPlaceholderName: 'Dear Winner',
    secondPartyPlaceholderTitle: 'Director of Operations at PT Pupuk AgriNusa',
    riskAssessment: 'Risk Assessment',
    blockchainLedgerHeader: 'Blockchain Ledger',
    pendingHash: 'Pending Hash',
    protocolVersion: 'Protocol Version',
    awaitingSignature: 'Awaiting final signature',
    activityLogHeader: 'Activity Log',
    batal: 'Cancel',
    signApproveBtn: 'Sign & Approve',
    blockchainActive: 'Blockchain Active',

    // Stepper Verifikasi
    koleksi: 'Collection',
    verifikasi: 'Verification',
    analisis: 'Analysis',
    konfirmasi: 'Confirmation',
    prosedurKerja: 'Review and confirm data collection results before proceeding to supplier analysis.',
    validationHeader: 'VERIFICATION STATUS',
    validationList1: 'Cooperative Identity Validation',
    validationList2: 'Warehouse Capacity Double-Check',
    validationList3: 'Bank Account Verification',
    auditFinding: 'AI Audit Finding',
    warningCapacityTitle: 'Capacity Alert: Koperasi Maju Bersama',
    warningCapacityDesc: 'Based on historical data and current records, Koperasi Maju Bersama is reaching maximum storage limits (92% full). Early transport scheduled is advised.',
    reviewLogistics: 'Review Logistics Detail',
    backToKoleksi: 'Back to Collection',
    confirmNext: 'Confirm & Continue',

    // Data Collection List
    biddingDeadline: 'Remaining Bidding Time: 02 Days : 14 Hours : 30 Mins',
    coopListDesc: 'Monitor and manage supplier bids and document verification.',
    supplierName: 'Supplier Name',
    bidStatusLabel: 'Bid Status',
    docVerificationLabel: 'Doc Verification',
    quoteRangeLabel: 'Quote Range',
    financialSummaryTitle: 'VivaAI Financial Summary',
    financialSummaryDesc: 'Total accumulated volume of 100 Tons successfully locked Bulk Discount Tier. Real profit analysis for each coop will be calculated automatically by VivaAI after the bidding window closes.',

    // Final Confirmation Tab
    finalReviewTitle: 'Final Review',
    finalReviewSubtitle: 'Please review agreement details below before executing the smart contract.',
    systemAnalysisTitle: 'SYSTEM ANALYSIS',
    systemAnalysisDesc: 'This agreement aligns with cooperative sustainability targets and is projected to save logistics costs by 12% compared to last quarter.',
    pemasokTerpilih: 'Selected Supplier',
    nilaiKontrak: 'Contract Value',
    ringkasanAlokasi: 'Allocation Summary',
    checkboxConsent: 'I confirm that the above details are correct and agree to the Cooperative framework requirements and automatic smart contract execution.',
    buttonSignExec: 'Sign & Execute Smart Contract',
    securedSecured: 'This transaction is protected by SSL 256-bit encryption and recorded on the Cooperative Ledger.'
  }
};

export const INITIAL_SMART_CONTRACTS: SmartContract[] = [
  {
    id: 'PRC/VI/2026-JP-001',
    title: 'Surat Persetujuan Pengadaan Bersama - Pupuk Urea Subsidi',
    commodity: 'Pupuk Urea Subsidi',
    quantity: '450 Ton',
    price: 'Rp 6.200 / kg',
    totalValue: 'Rp 2.790.000.000',
    firstParty: 'H. Ahmad Subarjo',
    firstPartyTitle: 'Ketua Koperasi Tani Makmur',
    secondParty: 'Ir. Sugeng Riyadi',
    secondPartyTitle: 'Manajer Distribusi PT Pupuk Indonesia',
    hash: '0x3a4b92c4cd88e3e4a5bf4d2bb0a07c3ea4ff82ccbf6a20d43f07a21f7c32',
    signedAt: '12 Mei 2026, 11:20 WIB',
    deliveryMethod: 'Pelabuhan Tanjung Emas, Semarang (FOB)',
    documentText: 'Menyepakati penyediaan komoditas Pupuk Urea Subsidi sebanyak 450 Ton untuk didistribusikan kepada seluruh kelompok tani binaan Koperasi Tani Makmur guna mendukung musim tanam gadu.'
  },
  {
    id: 'PRC/VI/2026-JP-002',
    title: 'Perjanjian Pengadaan Nutrisi Tanaman Tambahan - NPK Phonska',
    commodity: 'NPK Phonska',
    quantity: '250 Ton',
    price: 'Rp 7.500 / kg',
    totalValue: 'Rp 1.875.000.000',
    firstParty: 'H. Ahmad Subarjo',
    firstPartyTitle: 'Ketua Koperasi Tani Makmur',
    secondParty: 'Drs. Herman Santoso',
    secondPartyTitle: 'Direktur Komersial CV Subur Jaya',
    hash: '0x9d2e1b8a5fc7c3a4f8d2bb0a0cfb2e6a4fd2e8ea6a32cbfa9121a71f021c',
    signedAt: '25 Mei 2026, 14:45 WIB',
    deliveryMethod: 'Gudang Utama A - Koperasi Tani Makmur (DDP)',
    documentText: 'Kerjasama pengadaan NPK Phonska non-subsidi guna memenuhi kekurangan alokasi pupuk bersubsidi pada wilayah kerja Koperasi Tani Makmur.'
  },
  {
    id: 'PRC/VI/2026-JP-003',
    title: 'Kerjasama Penyediaan Pestisida Cair Organik',
    commodity: 'Pestisida Cair (5L)',
    quantity: '500 Liter',
    price: 'Rp 120.000 / Liter',
    totalValue: 'Rp 60.000.000',
    firstParty: 'H. Ahmad Subarjo',
    firstPartyTitle: 'Ketua Koperasi Tani Makmur',
    secondParty: 'Yusuf Habibi, M.Si.',
    secondPartyTitle: 'Direktur Operasional Bina Flora Ltd',
    hash: '0x4f2b93a0dc881cb30129fbb63d2bb0a07c58ee71fa0c31ee39aa112f43bb',
    signedAt: '02 Juni 2026, 09:15 WIB',
    deliveryMethod: 'Gudang Logistik B (DAP)',
    documentText: 'Penyediaan dan pengiriman cairan pengendali hama hayati (pestisida organik) bersertifikasi untuk menjaga kelestarian ekosistem sawah anggota koperasi.'
  }
];

export const INITIAL_ORDERS: Order[] = [
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
    lastPositionGPS: 'Gudang Utama A - Koperasi Tani Makmur (Selesai Diterima)',
    lastCheckedTime: '15 Mei 2026, 14:30 WIB',
    createdAt: '12 Mei 2026',
    rating: 5,
    ratingDetails: {
      timeliness: 5,
      quality: 5,
      service: 5
    },
    reviewComment: 'Sangat puas dengan pupuk urea bersubsidi ini. Pengiriman sangat cepat, dikawal berkas lengkap, dan segel karung semuanya utuh dalam kondisi kering di gudang kami.',
    timeline: [
      {
        status: 'dikemas',
        title: 'Pesanan Diproses',
        description: 'Barang sedang disiapkan dan dikemas oleh PT. Agrotama di gudang sentral pabrik.',
        timestamp: '12 Mei 2026, 13:00 WIB',
        isActive: false,
        isCompleted: true
      },
      {
        status: 'dikirim',
        title: 'Dalam Perjalanan (In Transit)',
        description: 'Truk pengangkut berangkat menuju Pelabuhan Transit Semarang via rute Pantura.',
        timestamp: '13 Mei 2026, 08:30 WIB',
        isActive: false,
        isCompleted: true
      },
      {
        status: 'sampai',
        title: 'Tiba di Lokasi Tujuan',
        description: 'Logistik tiba di Gudang Utama Koperasi Tani Makmur dan siap dilakukan bongkar muat.',
        timestamp: '15 Mei 2026, 10:15 WIB',
        isActive: false,
        isCompleted: true
      },
      {
        status: 'diterima',
        title: 'Telah Diterima & Diverifikasi',
        description: 'Ketua Koperasi telah meninjau fisik pupuk dan merilis konfirmasi penerimaan di rantai Ledger.',
        timestamp: '15 Mei 2026, 14:30 WIB',
        isActive: true,
        isCompleted: true
      }
    ]
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
    timeline: [
      {
        status: 'dikemas',
        title: 'Pesanan Diproses',
        description: 'CV. Subur Jaya memverifikasi pembayaran ledger dan menyiapkan alokasi muatan NPK.',
        timestamp: '11 Juni 2026, 15:20 WIB',
        isActive: false,
        isCompleted: true
      },
      {
        status: 'dikirim',
        title: 'Dalam Perjalanan Luar Kota',
        description: 'Armada logistik truk tronton ganda menyusuri rute darat trans-jawa Jawa Tengah.',
        timestamp: '12 Juni 2026, 09:10 WIB',
        isActive: true,
        isCompleted: true
      },
      {
        status: 'sampai',
        title: 'Sampai di Tujuan',
        description: 'Menunggu konfirmasi kedatangan logistik fisik oleh kurir resmi.',
        timestamp: '',
        isActive: false,
        isCompleted: false
      },
      {
        status: 'diterima',
        title: 'Konfirmasi Penerimaan Koperasi',
        description: 'Proses serah terima fisik komoditas pupuk oleh Kepala Logistik Koperasi.',
        timestamp: '',
        isActive: false,
        isCompleted: false
      }
    ]
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
    lastPositionGPS: 'Gudang Logistik B - Koperasi Tani Makmur (Tiba di Area Parkir Bongkar Muat)',
    lastCheckedTime: '12 Juni 2026, 20:15 WIB',
    createdAt: '10 Juni 2026',
    timeline: [
      {
        status: 'dikemas',
        title: 'Pesanan Diproses',
        description: 'Bina Flora Ltd mengemas 100 karton Pestisida Organik Cair (kemasan 5 liter) ke palet anti-guncang.',
        timestamp: '10 Juni 2026, 11:15 WIB',
        isActive: false,
        isCompleted: true
      },
      {
        status: 'dikirim',
        title: 'Pengiriman Kurir Khusus Cairan',
        description: 'Menggunakan armada berizin khusus transportasi bahan agro-kimia hayati.',
        timestamp: '11 Juni 2026, 08:00 WIB',
        isActive: false,
        isCompleted: true
      },
      {
        status: 'sampai',
        title: 'Kurir Tiba di Pos Logistik',
        description: 'Armada logistik menyelesaikan navigasi. Kurir telah menekan konfirmasi ketibaan logistik.',
        timestamp: '12 Juni 2026, 20:15 WIB',
        isActive: true,
        isCompleted: true
      },
      {
        status: 'diterima',
        title: 'Konfirmasi Penerimaan Koperasi',
        description: 'Menunggu penandatanganan berita acara serah terima langsung di sistem oleh tim koperasi.',
        timestamp: '',
        isActive: false,
        isCompleted: false
      }
    ]
  }
];

