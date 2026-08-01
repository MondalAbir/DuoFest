import type { FaqItem } from "@/types/landing";

export const faqItems: FaqItem[] = [
  {
    question: "What is DuoFest?",
    answer:
      "DuoFest is an end-to-end event management platform built for college fests. Colleges create events, students register and pay online, and organisers manage check-ins, volunteers and analytics — all in one place.",
  },
  {
    question: "How much does it cost for colleges?",
    answer:
      "We offer a free Starter plan for small events, a Growth plan at ₹4,999/month for active fests, and an Enterprise plan with custom pricing for large campuses. Students never pay any platform fee.",
  },
  {
    question: "Can students really register in under a minute?",
    answer:
      "Yes. Registration is a single short form with one-time OTP verification. After that, students tap Register on any event and their QR ticket is generated instantly and stored in their wallet.",
  },
  {
    question: "Do you support online payments and refunds?",
    answer:
      "We support UPI, cards and net banking through secure gateways. Cancellations before the event cutoff are auto-refunded (minus gateway charges) straight back to the student.",
  },
  {
    question: "What happens at check-in?",
    answer:
      "Volunteers scan each student's QR with our mobile scanning app. Entry is verified in under two seconds, recorded in real time, and reflected live on the organisers' dashboard.",
  },
  {
    question: "Can we run events for multiple colleges?",
    answer:
      "Absolutely. Inter-college events are a core use case — event listing, cross-college registration and unified analytics all work out of the box.",
  },
  {
    question: "Is my college's data safe?",
    answer:
      "We encrypt data in transit and at rest, never sell student data, and give admins full control over exports and privacy settings. Payments are processed by PCI-DSS-compliant gateways.",
  },
  {
    question: "How fast can we go live?",
    answer:
      "Most colleges are live within a day. Create your college profile, add admins, publish your first event — no technical setup required.",
  },
];
