export type MepCategory = 
  | 'Mechanical (HVAC)'
  | 'Electrical'
  | 'Plumbing & Drainage'
  | 'Fire Fighting'
  | 'ELV & Telecom'
  | 'Coordination & Blocks'
  | 'All';

export interface CadLayer {
  name: string;
  color: string;
  lineType: string;
  visible: boolean;
  elementCount: number;
}

export interface CadItem {
  id: string;
  title: string;
  subtitle?: string;
  category: MepCategory;
  subCategory: string;
  description: string;
  price: number; // in USD
  originalPrice?: number;
  pricePkr?: number;
  isFree?: boolean;
  featured?: boolean;
  fileFormat: string; // e.g. "DWG, DXF, PDF"
  fileSize: string; // e.g. "42.8 MB"
  dwgVersion: string; // e.g. "AutoCAD 2018 - 2024"
  layersCount: number;
  rating: number;
  reviewsCount: number;
  downloadsCount: number;
  tags: string[];
  software: string[];
  author: string;
  authorId?: string;
  previewType: 'hvac' | 'electrical' | 'plumbing' | 'fire' | 'elv' | 'block';
  layers: CadLayer[];
  specs: {
    units: string;
    scale: string;
    standards: string;
    ctbIncluded: boolean;
    sheetsCount: number;
  };
  createdAt?: string;
}

export interface CartItem {
  item: CadItem;
  quantity: number;
}

export interface PurchasedDownload {
  id: string;
  userId: string;
  itemId: string;
  itemTitle: string;
  category: string;
  dwgVersion: string;
  fileFormat: string;
  fileSize: string;
  licenseKey: string;
  orderId: string;
  downloadCount: number;
  lastDownloadedAt?: string;
  createdAt: string;
}

export interface OrderRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: {
    id: string;
    title: string;
    price: number;
    category: string;
  }[];
  totalAmount: number;
  currency: 'USD' | 'PKR';
  paymentMethod: string;
  status: 'completed' | 'processing' | 'refunded';
  licenseKey: string;
  createdAt: string;
}

export interface CustomDrawingRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  projectType: string;
  scope: string;
  urgency: 'Standard (3-5 days)' | 'Urgent (24-48 hours)' | 'Immediate';
  phone?: string;
  status: 'Pending Review' | 'In Progress' | 'Completed';
  createdAt: string;
}
