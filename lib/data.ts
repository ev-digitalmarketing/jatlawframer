import { Building2, Gavel, Scale, Briefcase, ScrollText, HeartHandshake, type LucideIcon } from "lucide-react";

export const biz = {
  phone: "(647) 748-3279",
  tel: "tel:+16477483279",
  email: "info@jatlawpc.com",
  address: "West Tower, 90 Burnhamthorpe Rd W, Ste 1400 (14th Floor), Mississauga, ON L5B 3C3",
  map: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("90 Burnhamthorpe Rd W Ste 1400 Mississauga ON L5B 3C3"),
  hours: [
    ["Monday", "10 a.m.–6 p.m."], ["Tuesday", "9 a.m.–6 p.m."], ["Wednesday", "9 a.m.–6 p.m."],
    ["Thursday", "9 a.m.–6 p.m."], ["Friday", "10 a.m.–6 p.m."], ["Saturday", "Closed"], ["Sunday", "Closed"],
  ],
};

export type Service = { slug: string; title: string; tag: string; icon: LucideIcon; intro: string; points: string[] };

export const services: Service[] = [
  { slug: "real-estate-transactions", title: "Real Estate Transactions", tag: "Residential & Corporate", icon: Building2,
    intro: "Buying, selling, refinancing or renewing? We manage every document, deadline and closing detail so your transaction stays smooth and hassle-free, for homeowners and corporate clients alike.",
    points: ["Residential purchases & sales", "Mortgage renewals & refinancing", "Commercial & corporate transactions", "Title review & closing coordination"] },
  { slug: "real-estate-litigation", title: "Real Estate Litigation", tag: "Disputes & Enforcement", icon: Gavel,
    intro: "When a property deal goes wrong, we step in to protect your interests, advising on and litigating disputes arising from agreements of purchase and sale, closings and ownership.",
    points: ["Failed or delayed closings", "Breach of purchase agreements", "Property & co-ownership disputes", "Deposit & damages claims"] },
  { slug: "general-litigation", title: "General Litigation", tag: "Plaintiff or Defendant", icon: Scale,
    intro: "Whether you are bringing a claim or defending one, we build a clear strategy, keep you informed, and pursue the best practical outcome, in negotiation or in court.",
    points: ["Civil claims & defences", "Contract & business disputes", "Negotiation & settlement", "Court & tribunal representation"] },
  { slug: "corporate-law", title: "Corporate Law", tag: "Start. Structure. Grow.", icon: Briefcase,
    intro: "From incorporation to day-to-day contracts, we give business owners the sound legal footing they need to operate with confidence and grow with fewer surprises.",
    points: ["Incorporation & set-up", "Shareholder & partnership agreements", "Commercial contracts", "Corporate records & compliance"] },
  { slug: "wills-estates", title: "Wills & Estates", tag: "Including Probate", icon: ScrollText,
    intro: "Protect the people you love with a clear plan, and get steady guidance when you are administering the estate of someone who has passed away.",
    points: ["Wills & powers of attorney", "Estate planning", "Probate applications", "Estate administration"] },
  { slug: "simple-divorce", title: "Simple Divorce", tag: "Uncontested & Separations", icon: HeartHandshake,
    intro: "When both sides agree, ending a marriage should be respectful and straightforward. We prepare the paperwork correctly and guide you through each step.",
    points: ["Uncontested divorce applications", "Separation agreements", "Accurate paperwork & filing", "Calm, low-conflict process"] },
];

export const reviews = [
  { name: "Nihar Raval", text: "Rizwan Jat is a fantastic lawyer—professional, knowledgeable, and incredibly dedicated. From our first interaction, it was very clear that he genuinely cares about his clients, he took the time to explain everything clearly, always made himself available, and handled every detail with care and precision. His attention to detail and commitment to achieving the best outcome is truly commendable. Rizwan’s professionalism, responsiveness, and calm demeanor provided a great sense of confidence and reassurance during a stressful time. I highly recommend him to anyone seeking expert legal support, you'll be in the best hands!" },
  { name: "Ranchan Bhardwaj", text: "The best legal services in around all of GTA. I had the closing of my house done through Jat law corporation in 2024. My whole experience was smooth and hassle free. Mr Rizwan dealt with the whole matter so professionally and accurately and till date it’s been 2 years and still If have any enquiries or questions or any legal issues, Mr Rizwan goes out of his way and help me out even with such busy routines. I would give 10 stars if there was option. I would recommend Jat Law for any sort of legal services at very reasonable cost and more importantly the reliability." },
  { name: "Khalid Elkhazeen", text: "We had an excellent experience working with Mr. Jat. He is extremely detail-oriented and took the time to meet with us in person, which made a big difference. He walked us through every step of the process with care and patience, even bringing up important points we hadn’t thought about. We truly felt supported and well-informed throughout. We were so lucky to have him on our side, and we will definitely continue working with him in the future. We highly recommend him to all our family and friends." },
  { name: "Tamara Shephard", text: "Recently, I secured Jat Law through a friend's referral for the closings of my house sale and new home purchase. I'm incredibly grateful to lawyer Rizwan Jat. He is hardworking, dedicated, and professional. He explains legal processes and documents in layman's language. He is accessible directly by phone and email. I felt confident I was in great hands with Rizwan as my lawyer. I'll be highly recommending Rizwan to any of my family and friends selling or buying a home." },
  { name: "Jara Mae", text: "We worked with Rizwan on our mortgage renewal/refinance process that needed a quick turnaround for processing. The two main things you hope for in a lawyer is knowledgeable and responsive and Rizwan did both exceptionally. From the moment I called, I felt reassured that he understood the process matched against my circumstances. His quoted pricing was accurate for the final costs. He provided many updates along the way and kept up communication (both phone and email) with my constant request for updates. We were more than pleased with his support. We will certainly reach out in the future for legal needs." },
];
