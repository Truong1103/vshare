export const BRAND = {
  name: "VShare",
  fullName: "VShare – Ngân hàng Thời gian",
  slogan: "Ai cũng có thể cho đi và ai cũng được nhận lại",
  field: "Đổi mới sáng tạo xã hội · Cống hiến cộng đồng & Kết nối kỹ năng",
  model: "Ngân hàng Thời gian (Timebank)",
};

export const CONTACT = {
  org: "Ban điều hành VShare",
  email: "chunghoa37ytb@gmail.com",
  phone: "Liên hệ ưu tiên qua email trong giai đoạn thí điểm",
  hours: "8:00–17:00, Thứ Hai đến Thứ Sáu",
  pilots: ["Hà Nội", "Nghệ An"] as const,
  addressHn: "Hà Nội — điểm thí điểm cộng đồng & câu lạc bộ sinh viên",
  addressNa: "Nghệ An — điểm thí điểm cộng đồng địa phương",
};

export const AREAS = ["Hà Nội", "Nghệ An", "Trực tuyến"] as const;

export const SKILL_GROUPS = [
  {
    id: "giao-duc",
    name: "Giáo dục & Gia sư",
    blurb: "Tri thức được chia đều: kèm bài, ngoại ngữ, ôn thi.",
    online: ["Gia sư trực tuyến", "Ôn thi online", "Ngoại ngữ qua video"],
    offline: ["Kèm 1-1 tại chỗ", "Nhóm học Hà Nội / Nghệ An"],
    query: "Gia sư",
  },
  {
    id: "cong-nghe",
    name: "Công nghệ & Kỹ thuật",
    blurb: "Hỗ trợ số, lập trình, sửa thiết bị — không để rào cản chi phí cản đường.",
    online: ["Lập trình từ xa", "Hỗ trợ máy tính từ xa", "Cài đặt phần mềm"],
    offline: ["Sửa máy tại nhà", "Sửa điện / nước dân dụng"],
    query: "Lập trình",
  },
  {
    id: "truyen-thong",
    name: "Truyền thông & Thiết kế",
    blurb: "Cho đi năng lực sáng tạo: đồ họa, video, nội dung cộng đồng.",
    online: ["Thiết kế online", "Dựng video", "Viết nội dung"],
    offline: ["Chụp ảnh sự kiện", "Hỗ trợ truyền thông CLB"],
    query: "Thiết kế",
  },
  {
    id: "cham-soc",
    name: "Chăm sóc xã hội",
    blurb: "Thời gian dành cho người già, trẻ em, hàng xóm — giá trị ngang nhau.",
    online: ["Trò chuyện đồng hành", "Tư vấn kỹ năng sống"],
    offline: ["Thăm hỏi", "Hỗ trợ việc nhà nhẹ", "Đồng hành người cao tuổi"],
    query: "Lắng nghe",
  },
  {
    id: "doi-song",
    name: "Đời sống & Thủ công",
    blurb: "Kỹ năng đời thường: nấu ăn, thủ công, sửa chữa nhỏ.",
    online: ["Hướng dẫn nấu ăn", "Workshop handmade online"],
    offline: ["Sửa chữa nhỏ", "Làm đồ thủ công cùng nhau"],
    query: "Thủ công",
  },
  {
    id: "tinh-than",
    name: "Đồng hành tinh thần",
    blurb: "Lắng nghe và hiện diện — tín chỉ thời gian cũng đo được sự quan tâm.",
    online: ["Trò chuyện trực tuyến", "Đồng hành học tập"],
    offline: ["Đi cùng việc hành chính", "Gặp mặt cộng đồng"],
    query: "Lắng nghe",
  },
] as const;

export const GIFT_CATALOG = [
  {
    slug: "so-tay",
    title: "Sổ tay Ngân hàng Thời gian",
    description: "Ghi chép giờ cho đi và nhận lại — quà tri ân thành viên thí điểm.",
    cost: 2,
    stock: 40,
  },
  {
    slug: "tui-vai",
    title: "Túi vải cộng đồng VShare",
    description: "Quà phi tiền tệ, nhắc mỗi người đều có kỹ năng để chia sẻ.",
    cost: 3,
    stock: 30,
  },
  {
    slug: "workshop-hn",
    title: "Vé workshop kỹ năng tại Hà Nội",
    description: "Buổi học nhóm do thành viên tổ chức — đổi bằng Time Credit.",
    cost: 5,
    stock: 20,
  },
  {
    slug: "workshop-na",
    title: "Vé workshop cộng đồng tại Nghệ An",
    description: "Kết nối địa phương, lan tỏa mô hình timebank.",
    cost: 5,
    stock: 20,
  },
  {
    slug: "lang-nghe",
    title: "Phiên lắng nghe chuyên sâu 1 giờ",
    description: "Đổi tín chỉ để được một thành viên đồng hành trò chuyện.",
    cost: 4,
    stock: 25,
  },
  {
    slug: "cay-xanh",
    title: "Góp cây xanh vì cộng đồng",
    description: "1 Time Credit = lời cảm ơn; 6 TC = một cây được ghi nhận nhân danh bạn.",
    cost: 6,
    stock: 15,
  },
] as const;

export const POPULAR_SEARCHES = [
  "Gia sư",
  "Lập trình",
  "Dịch thuật",
  "Sửa máy tính",
  "Chụp ảnh",
  "Lắng nghe",
  "Thiết kế",
  "Chăm sóc",
] as const;
