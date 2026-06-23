export interface RepairOrder {
  id: string; // e.g. ORD-28491
  deviceType: string;
  deviceModel: string; // e.g. iPhone 15 Pro
  deviceBrand: string; // e.g. Apple
  problemType: string; // e.g. Cracked Screen
  problemDescription: string;
  location: string; // e.g. Home (123 Tech Lane, Silicon Valley, CA 94043)
  scheduledDate: string; // e.g. Oct 24, 2023 at 10:00 AM
  uploadedImages: string[];
  estimatedTotal: number;
  status: 'Pending' | 'Received' | 'Diagnosing' | 'In Progress' | 'Repaired' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  technicianId?: string; // Elena, Marcus, etc.
  submittedAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  warrantyStatus: string; // e.g. "90-Day Warranty"
  serialNo?: string;
  specs?: string;
  journey: {
    received?: string;
    diagnosing?: string;
    inProgress?: string;
    repaired?: string;
    completed?: string;
  };
}

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  status: 'Online' | 'Busy' | 'Offline';
  avatar: string;
  email: string;
  phone: string;
}

export interface SupportTicket {
  id: string; // #TK-8821
  customerName: string;
  customerAvatar?: string;
  category: 'Technical' | 'Billing' | 'General';
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  receivedTime: string;
  status: 'Open' | 'Assigned' | 'Resolved';
  assignedTechId?: string;
}

export interface AddressItem {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
