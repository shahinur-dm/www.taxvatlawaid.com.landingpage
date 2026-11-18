export type AppointmentStatus =
  | "new"
  | "pending"
  | "confirmed"
  | "completed"
  | "rejected"
  | "cancelled";

export interface AppointmentRecord {
  id: string;
  inquiry_id: string;
  full_name: string;
  phone: string;
  whatsapp_number: string;
  email: string | null;
  client_type: string;
  service_category: string;
  consultation_type: "Chamber Visit" | "Video Call" | "Phone Call";
  preferred_date: string;
  preferred_time: string;
  description: string;
  privacy_consent: boolean;
  status: AppointmentStatus;
  is_new: boolean;
  internal_notes: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  lead_source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  fbclid: string | null;
  gclid: string | null;
  referrer_url: string | null;
  landing_page_url: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySlot {
  id?: string;
  day_of_week?: number;
  slot_time: string;
  slot_label: string;
  max_bookings: number;
  booked_count?: number;
  is_available: boolean;
  is_active?: boolean;
  blocked_reason?: string | null;
}

export interface BlockedDateRecord {
  id: string;
  blocked_date: string;
  reason: string;
  created_at: string;
}

export interface AdminNotificationRecord {
  id: string;
  appointment_id: string;
  inquiry_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
