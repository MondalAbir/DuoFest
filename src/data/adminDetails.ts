export interface AdminDetails {
  phone: string;
  managedEvents: number;
  registrations: number;
}

export const adminDetails: Record<string, AdminDetails> = {
  "adm-001": {
    phone: "+91 98201 23456",
    managedEvents: 24,
    registrations: 12840,
  },
  "adm-002": {
    phone: "+91 98410 99871",
    managedEvents: 31,
    registrations: 19350,
  },
  "adm-003": {
    phone: "+91 98110 45872",
    managedEvents: 18,
    registrations: 9640,
  },
  "adm-004": {
    phone: "+91 99001 12765",
    managedEvents: 27,
    registrations: 14210,
  },
  "adm-005": {
    phone: "+91 98860 34491",
    managedEvents: 15,
    registrations: 8210,
  },
  "adm-006": {
    phone: "+91 99400 78235",
    managedEvents: 22,
    registrations: 11630,
  },
  "adm-007": {
    phone: "+91 98225 66108",
    managedEvents: 19,
    registrations: 10480,
  },
  "adm-008": {
    phone: "+91 98301 55437",
    managedEvents: 11,
    registrations: 5270,
  },
  "adm-009": {
    phone: "+91 98990 22143",
    managedEvents: 26,
    registrations: 13680,
  },
  "adm-010": {
    phone: "+91 97410 88902",
    managedEvents: 20,
    registrations: 11920,
  },
  "adm-011": {
    phone: "+91 98450 67319",
    managedEvents: 33,
    registrations: 20170,
  },
  "adm-012": {
    phone: "+91 97690 41562",
    managedEvents: 8,
    registrations: 3910,
  },
};

export function getAdminDetails(adminId: string): AdminDetails | undefined {
  return adminDetails[adminId];
}
