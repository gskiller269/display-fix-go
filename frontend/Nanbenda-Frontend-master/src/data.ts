import { RepairOrder, SupportTicket, Technician, AddressItem } from './types';

export const initialTechnicians: Technician[] = [
  {
    id: 'tech_elena',
    name: 'Elena Rodriguez',
    specialty: 'Mobile Specialist',
    rating: 4.9,
    status: 'Online',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAH_TyaVDmy-a7Z_ZWN_ODDeFHAUPEgTfBdUBY5DGR12vtO43KQ5q9V213cv9qSifDL6K9GVDtH3qRpX3HZpJWqxP1wcLRRjjmciHZTCx7m88JnAp8exzurfQPAtDk50JEUB6VVYLRZF7L6XlTOY5DM-6X5KcKgQKpMsNQ70aWaKiFpq_Iw-Ffk8UpxLAIS6c-KcMtnfCtwN2RbKkTcMhUEWc3ydpQ0vYJXFJvz-j2hAwEyhJLsJ_Jq78GE4PneOLJPcWYLBwFLMCmH',
    email: 'e.rodriguez@protech.com',
    phone: '+1 (555) 762-2981'
  },
  {
    id: 'tech_marcus',
    name: 'Marcus Chen',
    specialty: 'Laptop Architect',
    rating: 4.8,
    status: 'Busy',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjb5KR21b8PvZpXLtEaI1fCEwHq07_DbWZnOkmcXvdq8cFXdV9ZSFRtLNvxJrkFaDVpv1mwjqvaDlz-q1a7PSTO2U6O8Wpzc49lD95pp1G-Ud59h5qgHUyT2UbOFQe5fVIqvC2F9L5SUuTQuB30RC8L3dsCt-VJvO8zBbroqKvNTw165NoSsUtzY3Ak49um9dnj8-5BLarycntuhTW-ps6FPrq_df0T-ThfnuLebybWwSj-vuxCNYng-TgiCSkjh5byDQWyIjvG2k4',
    email: 'm.chen@protech.com',
    phone: '+1 (555) 234-9041'
  },
  {
    id: 'tech_david',
    name: 'David Wilson',
    specialty: 'Hardware Diagnostics',
    rating: 4.7,
    status: 'Offline',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnfYf8iEDmwnDiyOZIrl9x2X-s7dwZdPOMSmRw6TqWV6EQi8v_n4O8RTx0jMcnDlZD29_txyL9l7iovcJGvBI2BglRwlgkrp5tZm1qh1WAme1A55coJopUrCxhqhLIIV907CYU-k_GYG-amtHMd0Awggj2Yp96qhoFBQWoNS4ITQn1kNTxtTRoYkTv6r1WzG-Uk_xWWl79YnhaAmVIb1_aavYWwTK8Rh2hoq8N9T39QZ5j86YUeYUJqeHNGRy8cVTEVeP0UBZvt4__',
    email: 'd.wilson@protech.com',
    phone: '+1 (555) 891-3091'
  },
  {
    id: 'tech_sarah',
    name: 'Sarah Jenkins',
    specialty: 'Tablet Repair Pro',
    rating: 5.0,
    status: 'Online',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrIKcEhIUC90ymV_C6ocJ7CEjCbDpAmqKYCexenIkjIUCfovkF6F4ONoSkHButgihwD2PEnhS49uvbZo5r_kKbsV73vJZ-s5yBxjMXD7-uwQ8tpZgJBoN9e8u_P4id2p0XSAfuTlCFvl_2vSf67yAIbZR6QOrxg9_xSFXMbHGtpfTYTJPpyKj_3M-TFItFGVTI9qGdSm7czrizkEaJDdXyZDoNdKmAVczhL3qEQpolfsW8r2bCLDZSslw1blrF25I8us2UlcmRqAHF',
    email: 's.jenkins@protech.com',
    phone: '+1 (555) 450-9832'
  }
];

export const initialRepairs: RepairOrder[] = [
  {
    id: 'REP-28491',
    deviceType: 'Laptop',
    deviceBrand: 'Apple',
    deviceModel: 'MacBook Pro 14" (2021)',
    problemType: 'Keyboard Liquid Damage',
    problemDescription: 'Liquid damage on the keyboard area. Customer reported a small coffee spill. The device boots up, but several keys (ASDF row) are non-responsive or sticky. Battery health shows as "Service Recommended" following the incident.',
    location: 'Home (123 Tech Lane, Silicon Valley)',
    scheduledDate: 'Oct 24, 2023 at 10:45 AM',
    uploadedImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAX5kOM6QJG8qJmM197uwCf6eKew7dSA1lSIewi1IPsixBO4c-lQLZbeXYez6VSBet_dsvuvs3yahuUGQ4tKKzDbvPuauDb7rZf9oAGPN-JotO8Qhm9uOtbUJysnmbwGa3yH4aFivu2mX_cBtyBKqojSOosdD8h6MrXysCNIwJP-rqXZQjFYWuvz2AcuHBmU4XosUTyw_jSA15scZR7AEi0Wg12K8NMdkr7H5_oTGMr4vM3_pQTHsjhVFVwEogV_pmc1HmkgQFvaxyr',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB4V83HRJyZPRtjCEiJoOol7LaeO8lGR0IaHev7Vupbkmg_PuNU-8xJdOIdGBKDiFW-6HZmiieQA3U0x5suTzcOInQZlFzSfmh-eKIYOY4DyXpxHk6ar53njLb5Lbtrh-GlI7WEzA3hCeRDAXcFtNuxuZu2G9riLX2RnwcH8KFEfsI0_6IHMWvTpYfJq1r3Gu2wi8PkCHGHcnE3Z2qFtAO93jZT8HaflA2q2CcDTXQ93phRrY08kkCDVECs5FqEY6MlWCKwi16XbnX9',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAkwi0Qg7RWtFMFBYDZU7NybJYUiknVM3HM-waH11zmLSbITmhgDuejxBV6OhPI3vrKh_RFvjJMlLGXLMdam68m_BtM6QQfmScK4EBznTjOYqHnATG6-nZIJElJ1uC3KN-tsy_OC0wcDhVkhypc9tu0wqpys-rFZtO-jg6CdZvOEjBRLuAQOcJBvwu_usLsWkkCM7L4bP8BpmrewWEVHGTwGesV2vzn330o0ErDvYX5d31tILIznIb5BbNgR2DbHIlwIusEZOK9-q6Q'
    ],
    estimatedTotal: 129.00,
    status: 'In Progress',
    priority: 'High',
    customerName: 'Jonathan Miller',
    customerEmail: 'j.miller@example.com',
    customerPhone: '+1 (555) 012-3456',
    submittedAt: 'Oct 24, 2023 • 10:45 AM',
    warrantyStatus: '90-Day Warranty',
    serialNo: 'C02FX1ABC2D3',
    specs: 'M1 Pro / 16GB RAM / 512GB SSD',
    technicianId: 'tech_sarah',
    journey: {
      received: 'Oct 24, 10:45 AM • Front Desk',
      diagnosing: 'Oct 25, 09:15 AM • Tech: Sarah K.',
      inProgress: 'Started Oct 25, 02:30 PM • Parts Arrived'
    }
  },
  {
    id: 'REP-28495',
    deviceType: 'Laptop',
    deviceBrand: 'Apple',
    deviceModel: 'MacBook Pro M3',
    problemType: 'Liquid Damage',
    problemDescription: 'Slight water splashing on screen hinge, screen flickering occasionally.',
    location: 'Office (456 Innovation Way, San Francisco)',
    scheduledDate: 'Oct 26, 2023 at 01:00 PM',
    uploadedImages: [],
    estimatedTotal: 199.00,
    status: 'Pending',
    priority: 'Medium',
    customerName: 'Michael Chen',
    customerEmail: 'm.chen@example.com',
    customerPhone: '+1 (555) 998-8811',
    submittedAt: 'Oct 25, 2023 • 11:30 AM',
    warrantyStatus: '90-Day Warranty',
    serialNo: 'C02HX5M3XYZ2',
    specs: 'M3 Pro / 18GB RAM / 1TB SSD',
    journey: {
      received: 'Oct 25, 11:30 AM • Client Portal Submission'
    }
  },
  {
    id: 'REP-28499',
    deviceType: 'Other',
    deviceBrand: 'Apple',
    deviceModel: 'Apple Watch S9',
    problemType: 'Battery Swelling',
    problemDescription: 'Screen lifting due to swollen battery. Device still charges, but unsafe for continued wear.',
    location: 'Home (123 Tech Lane, Silicon Valley)',
    scheduledDate: 'Oct 26, 2023 at 11:00 AM',
    uploadedImages: [],
    estimatedTotal: 79.00,
    status: 'Pending',
    priority: 'Medium',
    customerName: 'Elena Rodriguez',
    customerEmail: 'elena.r@example.com',
    customerPhone: '+1 (555) 762-2981',
    submittedAt: 'Oct 25, 2023 • 03:15 PM',
    warrantyStatus: '90-Day Warranty',
    serialNo: 'WCH9S9ABCDE1',
    specs: '45px GPS + Cellular',
    journey: {
      received: 'Oct 25, 03:15 PM • Logged online'
    }
  }
];

export const initialTickets: SupportTicket[] = [
  {
    id: 'TK-8821',
    customerName: 'Marcus Thorne',
    customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD12Mb4lpcgxbibFBvHimzYc_eJk7v3JTgSMr6U9WOifxAuZcW8h0B2TQ9e4VR0GH9Xl0zMx9ocHrJWUSt3hLKw8yMRkDKPFGERTs8RTV-yi6fdY9pwXYhQjL1dhwNxwwiPYU8MsvkERuPGQeD29eGevFPCUYgTA6MVOuGWVi7_HGLI75KCEw0njA1vOmOwrxRMM3p-_eauYVWUsUa925hIsIGp6j3sqj9vCnpedCFnhqKkmldra4zCWGmnsdd3vN9N0cyGq4C1F56J',
    category: 'Technical',
    priority: 'High',
    title: 'MacBook Pro M2 - Kernel Panic on Boot',
    description: 'System crashed after latest Sonoma update. I see the Apple logo and then it loops indefinitely. Need urgent help for remote work...',
    receivedTime: '12m ago',
    status: 'Open'
  },
  {
    id: 'TK-8819',
    customerName: 'Elena Rodriguez',
    customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT6aL16BxMjJmQwg80UdgMYccXrVF_f2AvzX4uOohFxAFlnhnoVbJ7I3rsIBCxXj0yBAp0lTNXsRBC2EoJ0zrZh896cceFDaWMtgAxwDLpFBJcOYwM8oCfT4LbCEMbpAZ7sNhNFQHskheRZOb_GFdhDxqFTVEPS7fYD74nW_9EsRv54rFfrYtPWCdybkmDhQcvcG5PzuzZyMG_-aFW1sm1JVu1195rYj0N5MImtP53Nrcb4jKR2U3AxmLml6m2i9XxQWc6BosKW-D-',
    category: 'Billing',
    priority: 'Medium',
    title: 'Double charge for iPhone Battery Repair',
    description: 'I noticed two identical transactions on my credit card statement from yesterday. Please verify and refund the duplicate...',
    receivedTime: '2h ago',
    status: 'Open'
  },
  {
    id: 'TK-8790',
    customerName: 'James Wilson',
    category: 'General',
    priority: 'Low',
    title: 'Inquiry about Extended Warranty',
    description: 'Thinking of buying the Nanbenda Mart Shield for my new iPad. Does it cover accidental liquid spills or just manufacturing defects?',
    receivedTime: '5h ago',
    status: 'Open'
  }
];

export const initialAddresses: AddressItem[] = [
  {
    id: 'addr_1',
    label: 'Home',
    address: '123 Tech Lane, Silicon Valley, CA 94043',
    isDefault: true
  },
  {
    id: 'addr_2',
    label: 'Work',
    address: '456 Innovation Way, San Francisco, CA 94105',
    isDefault: false
  }
];
