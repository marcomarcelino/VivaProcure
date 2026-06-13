export interface User {
  name: string;
  role: string;
  avatar: string;
  cooperative: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  tableData?: {
    headers: string[];
    rows: Array<Array<string | number>>;
    highlightIndex?: number;
  };
  insight?: string;
  chips?: string[];
}

export interface StockItem {
  id: string;
  name: string;
  sku: string;
  cooperative: string;
  stock: number;
  unit: string;
  threshold: number;
  capacityMax: number;
  status: 'KRITIS' | 'SELESAI' | 'PERINGATAN';
}

export interface StockLog {
  id: string;
  type: 'masuk' | 'keluar' | 'penyesuaian';
  title: string;
  description: string;
  amount: string;
  color: string;
  date: string;
}

export interface SupplierBid {
  id: string;
  name: string;
  encryptedId: string;
  bidStatus: string;
  isLocked: boolean;
  docVerified: boolean;
  quoteRange: string;
}

export interface ProcurementLog {
  time: string;
  activity: string;
  user: string;
  status: 'BERHASIL' | 'TERTUNDA' | 'GAGAL';
}

export interface SupplierHealth {
  code: string;
  name: string;
  product: string;
  percentage: number;
  status: 'SANGAT BAIK' | 'WASPADA' | 'BAIK';
}

export interface SmartContract {
  id: string;
  title: string;
  commodity: string;
  quantity: string;
  price: string;
  totalValue: string;
  firstParty: string;
  firstPartyTitle: string;
  secondParty: string;
  secondPartyTitle: string;
  hash: string;
  signedAt: string;
  deliveryMethod: string;
  documentText: string;
}

export interface OrderTrackingStep {
  status: 'dikemas' | 'dikirim' | 'sampai' | 'diterima';
  title: string;
  description: string;
  timestamp: string;
  isActive: boolean;
  isCompleted: boolean;
}

export interface Order {
  id: string;
  contractId: string;
  supplierName: string;
  commodity: string;
  quantity: string;
  totalValue: string;
  currentStatus: 'dikemas' | 'dikirim' | 'sampai' | 'diterima';
  courierName: string;
  courierPhone: string;
  lastPositionGPS: string;
  lastCheckedTime: string;
  timeline: OrderTrackingStep[];
  rating?: number;
  ratingDetails?: {
    timeliness: number;
    quality: number;
    service: number;
  };
  reviewComment?: string;
  createdAt: string;
}
