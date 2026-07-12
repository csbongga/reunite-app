// Mock data for the Reunite app prototype (Thai lost & found).
// No backend wired yet — all reads are static.

export type PostType = "lost" | "found";
export type PostStatus = "searching" | "arranging" | "closed";

export type Category =
  | "electronics"
  | "wallet"
  | "keys"
  | "documents"
  | "bag"
  | "jewelry"
  | "pet"
  | "clothing"
  | "other";

export const CATEGORY_LABEL: Record<Category, string> = {
  electronics: "อุปกรณ์อิเล็กทรอนิกส์",
  wallet: "กระเป๋าสตางค์",
  keys: "กุญแจ",
  documents: "เอกสาร / บัตร",
  bag: "กระเป๋า",
  jewelry: "เครื่องประดับ",
  pet: "สัตว์เลี้ยง",
  clothing: "เสื้อผ้า",
  other: "อื่น ๆ",
};

export const CATEGORY_EMOJI: Record<Category, string> = {
  electronics: "📱",
  wallet: "👛",
  keys: "🔑",
  documents: "🪪",
  bag: "🎒",
  jewelry: "💍",
  pet: "🐾",
  clothing: "🧥",
  other: "📦",
};

export const STATUS_LABEL: Record<PostStatus, string> = {
  searching: "กำลังตามหา",
  arranging: "อยู่ระหว่างนัดรับ",
  closed: "ปิดเคสแล้ว",
};

export interface User {
  id: string;
  name: string;
  initials: string;
  reputation: number; // 0–5
  verified: boolean;
  joined: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  message: string;
  createdAt: string; // ISO
}

export interface Post {
  id: string;
  type: PostType;
  status: PostStatus;
  title: string;
  category: Category;
  description: string;
  marks: string; // ตำหนิ
  location: string;
  distanceKm: number;
  happenedAt: string;
  postedAt: string;
  image: string; // emoji used as visual placeholder
  imageHue: number; // 0-360 for backdrop
  userId: string;
  comments: Comment[];
}

export const CURRENT_USER: User = {
  id: "u-me",
  name: "ภูริช ใจดี",
  initials: "ภจ",
  reputation: 4.8,
  verified: true,
  joined: "มี.ค. 2025",
};

export const USERS: Record<string, User> = {
  [CURRENT_USER.id]: CURRENT_USER,
  "u-1": { id: "u-1", name: "ณัฐริกา ส.", initials: "ณส", reputation: 4.9, verified: true, joined: "ม.ค. 2024" },
  "u-2": { id: "u-2", name: "สมชาย พ.", initials: "สพ", reputation: 4.5, verified: true, joined: "ก.พ. 2024" },
  "u-3": { id: "u-3", name: "พิมพ์ชนก ก.", initials: "พก", reputation: 5.0, verified: true, joined: "ส.ค. 2023" },
  "u-4": { id: "u-4", name: "ธีรภัทร อ.", initials: "ธอ", reputation: 4.2, verified: false, joined: "พ.ค. 2025" },
};

export const POSTS: Post[] = [
  {
    id: "p-1",
    type: "found",
    status: "searching",
    title: "พบ AirPods Pro สีขาว",
    category: "electronics",
    description: "เจอวางอยู่บนโต๊ะร้านกาแฟชั้น 2 ตอนเย็นวันศุกร์ กล่องยังสะอาด",
    marks: "เคสมีรอยขีดเล็ก ๆ ที่มุมล่างซ้าย และมีสติกเกอร์รูปแมวที่ฝา",
    location: "Siam Paragon, กรุงเทพ",
    distanceKm: 1.2,
    happenedAt: "2026-06-20T17:30:00+07:00",
    postedAt: "2026-06-20T19:02:00+07:00",
    image: "🎧",
    imageHue: 195,
    userId: "u-1",
    comments: [
      {
        id: "c-1",
        postId: "p-1",
        userId: "u-2",
        message: "ของผมเลยครับ! ขอถามตำหนิเพิ่มได้ไหมครับ",
        createdAt: "2026-06-20T20:11:00+07:00",
      },
      {
        id: "c-2",
        postId: "p-1",
        userId: "u-1",
        message: "ได้ครับ ลองบอกสติกเกอร์ที่ฝามาได้เลย",
        createdAt: "2026-06-20T20:14:00+07:00",
      },
    ],
  },
  {
    id: "p-2",
    type: "lost",
    status: "arranging",
    title: "ทำกระเป๋าสตางค์หาย สีน้ำตาล",
    category: "wallet",
    description: "หล่นที่ไหนสักแห่งระหว่างทางจาก BTS อโศก ไปอาคารสำนักงาน",
    marks: "หนังแท้สีน้ำตาล มีตัวอักษร P สลักทอง ข้างในมีรูปลูก 2 คน",
    location: "BTS อโศก, กรุงเทพ",
    distanceKm: 0.4,
    happenedAt: "2026-06-22T08:15:00+07:00",
    postedAt: "2026-06-22T09:40:00+07:00",
    image: "👛",
    imageHue: 30,
    userId: "u-2",
    comments: [],
  },
  {
    id: "p-3",
    type: "found",
    status: "closed",
    title: "เจอกุญแจรถพร้อมพวงห้อยกระต่าย",
    category: "keys",
    description: "ส่งคืนเจ้าของเรียบร้อยแล้ว ขอบคุณทุกคนที่ช่วยกระจายข่าวครับ",
    marks: "กุญแจ Honda พร้อมพวงห้อยรูปกระต่ายสีชมพู",
    location: "สวนลุมพินี, กรุงเทพ",
    distanceKm: 3.6,
    happenedAt: "2026-06-15T06:50:00+07:00",
    postedAt: "2026-06-15T07:20:00+07:00",
    image: "🔑",
    imageHue: 340,
    userId: "u-3",
    comments: [],
  },
  {
    id: "p-4",
    type: "lost",
    status: "searching",
    title: "แมวส้มหายแถวลาดพร้าว 71",
    category: "pet",
    description: "ชื่อ 'ส้มจี๊ด' หายตั้งแต่เย็นวานนี้ มีปลอกคอสีฟ้า กลัวคนแปลกหน้า",
    marks: "ขนสีส้มลายเสือ ปลายหางขาด ปลอกคอสีฟ้ามีกระดิ่ง",
    location: "ลาดพร้าว 71, กรุงเทพ",
    distanceKm: 5.8,
    happenedAt: "2026-06-23T18:00:00+07:00",
    postedAt: "2026-06-23T22:10:00+07:00",
    image: "🐈",
    imageHue: 25,
    userId: "u-4",
    comments: [
      {
        id: "c-3",
        postId: "p-4",
        userId: "u-1",
        message: "เมื่อเช้าเห็นแมวลักษณะคล้าย ๆ กันแถวซอย 65 ลองไปดูได้นะคะ",
        createdAt: "2026-06-24T07:02:00+07:00",
      },
    ],
  },
  {
    id: "p-5",
    type: "found",
    status: "searching",
    title: "เจอบัตรนักศึกษา ม.เกษตร",
    category: "documents",
    description: "เก็บได้ที่ร้านสะดวกซื้อใกล้ประตู 3 ฝากแอดมินช่วยกระจายให้เจ้าของหน่อยครับ",
    marks: "บัตรนักศึกษาออกปี 2025 ชื่อเริ่มต้นด้วย 'ปร'",
    location: "ม.เกษตรศาสตร์ บางเขน",
    distanceKm: 8.1,
    happenedAt: "2026-06-23T12:30:00+07:00",
    postedAt: "2026-06-23T13:10:00+07:00",
    image: "🪪",
    imageHue: 210,
    userId: "u-me",
    comments: [],
  },
  {
    id: "p-6",
    type: "lost",
    status: "searching",
    title: "ทำสร้อยคอทองคำหาย",
    category: "jewelry",
    description: "ของแม่ ทำหายระหว่างเดินตลาดนัด เสียดายมาก ๆ",
    marks: "สร้อยคอทองหนัก 1 สลึง จี้รูปพระ มีรอยบุบเล็ก ๆ ด้านหลัง",
    location: "ตลาดนัด JJ Green, กรุงเทพ",
    distanceKm: 2.3,
    happenedAt: "2026-06-21T20:00:00+07:00",
    postedAt: "2026-06-21T22:50:00+07:00",
    image: "📿",
    imageHue: 50,
    userId: "u-me",
    comments: [],
  },
];

export function getPost(id: string): Post | undefined {
  return POSTS.find((p) => p.id === id);
}

export function getUser(id: string): User {
  return USERS[id] ?? { ...CURRENT_USER, id, name: "ผู้ใช้งาน" };
}

export function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "เมื่อสักครู่";
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} วันที่แล้ว`;
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
