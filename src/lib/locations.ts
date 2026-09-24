export const PROVINCES = ["Hà Nội", "Nghệ An", "Trực tuyến"] as const;

export const LOCATION_TREE: Record<string, Record<string, string[]>> = {
  "Hà Nội": {
    "Ba Đình": ["Phúc Xá", "Trúc Bạch", "Vĩnh Phúc", "Cống Vị", "Liễu Giai", "Quán Thánh", "Ngọc Hà", "Điện Biên", "Đội Cấn", "Ngọc Khánh", "Kim Mã", "Giảng Võ", "Thành Công"],
    "Hoàn Kiếm": ["Phúc Tân", "Đồng Xuân", "Hàng Mã", "Hàng Buồm", "Hàng Đào", "Hàng Bạc", "Hàng Bồ", "Lý Thái Tổ", "Hàng Trống", "Cửa Nam", "Nguyễn Du", "Phan Chu Trinh", "Tràng Tiền", "Trần Hưng Đạo"],
    "Hai Bà Trưng": ["Nguyễn Du", "Bùi Thị Xuân", "Ngô Thì Nhậm", "Đồng Nhân", "Bạch Đằng", "Thanh Lương", "Thanh Nhàn", "Cầu Dền", "Bách Khoa", "Quỳnh Lôi", "Bạch Mai", "Quỳnh Mai", "Vĩnh Tuy", "Minh Khai"],
    "Đống Đa": ["Cát Linh", "Văn Miếu", "Quốc Tử Giám", "Láng Thượng", "Ô Chợ Dừa", "Văn Chương", "Hàng Bột", "Láng Hạ", "Khâm Thiên", "Thổ Quan", "Nam Đồng", "Trung Liệt", "Phương Liên", "Thịnh Quang", "Trung Tự", "Kim Liên", "Phương Mai", "Ngã Tư Sở", "Khương Thượng"],
    "Tây Hồ": ["Phú Thượng", "Nhật Tân", "Tứ Liên", "Quảng An", "Xuân La", "Yên Phụ", "Bưởi", "Thụy Khuê"],
    "Cầu Giấy": ["Nghĩa Đô", "Nghĩa Tân", "Mai Dịch", "Dịch Vọng", "Dịch Vọng Hậu", "Quan Hoa", "Yên Hòa", "Trung Hòa"],
    "Thanh Xuân": ["Nhân Chính", "Thượng Đình", "Khương Trung", "Khương Mai", "Thanh Xuân Trung", "Phương Liệt", "Hạ Đình", "Khương Đình", "Thanh Xuân Bắc", "Thanh Xuân Nam", "Kim Giang"],
    "Hoàng Mai": ["Giáp Bát", "Định Công", "Mai Động", "Tương Mai", "Đại Kim", "Tân Mai", "Hoàng Văn Thụ", "Giảng Võ", "Vĩnh Hưng", "Thanh Trì", "Thịnh Liệt", "Trần Phú", "Hoàng Liệt", "Yên Sở"],
    "Long Biên": ["Thượng Thanh", "Ngọc Thụy", "Giang Biên", "Đức Giang", "Việt Hưng", "Gia Thụy", "Ngọc Lâm", "Phúc Lợi", "Bồ Đề", "Sài Đồng", "Long Biên", "Thạch Bàn", "Phúc Đồng", "Cự Khối"],
    "Nam Từ Liêm": ["Cầu Diễn", "Xuân Phương", "Phương Canh", "Mỹ Đình 1", "Mỹ Đình 2", "Tây Mỗ", "Mễ Trì", "Phú Đô", "Đại Mỗ", "Trung Văn"],
    "Bắc Từ Liêm": ["Thượng Cát", "Liên Mạc", "Đông Ngạc", "Đức Thắng", "Thụy Phương", "Tây Tựu", "Xuân Đỉnh", "Xuân Tảo", "Minh Khai", "Cổ Nhuế 1", "Cổ Nhuế 2", "Phú Diễn", "Phúc Diễn"],
    "Hà Đông": ["Nguyễn Trãi", "Mộ Lao", "Văn Quán", "Vạn Phúc", "Yết Kiêu", "Quang Trung", "La Khê", "Phú La", "Phúc La", "Hà Cầu", "Yên Nghĩa", "Kiến Hưng", "Phú Lãm", "Phú Lương", "Dương Nội", "Đồng Mai", "Biên Giang"],
    "Đông Anh": ["Đông Anh", "Xuân Nộn", "Thuỵ Lâm", "Bắc Hồng", "Nguyên Khê", "Nam Hồng", "Tiên Dương", "Vân Hà", "Uy Nỗ", "Vân Nội", "Liên Hà", "Việt Hùng", "Kim Nỗ", "Kim Chung", "Dục Tú", "Đại Mạch", "Vĩnh Ngọc", "Cổ Loa", "Hải Bối", "Xuân Canh", "Võng La", "Tàm Xá", "Mai Lâm", "Đông Hội"],
    "Gia Lâm": ["Yên Viên", "Yên Thường", "Yên Viên (xã)", "Ninh Hiệp", "Đình Xuyên", "Dương Hà", "Phù Đổng", "Thiên Đức", "Lệ Chi", "Cổ Bi", "Đặng Xá", "Phú Thị", "Kim Sơn", "Dương Xá", "Đông Dư", "Dương Quang", "Bát Tràng", "Kim Lan", "Văn Đức", "Trâu Quỳ", "Kiêu Kỵ"],
    "Thanh Trì": ["Văn Điển", "Tân Triều", "Thanh Liệt", "Tả Thanh Oai", "Hữu Hòa", "Tam Hiệp", "Tứ Hiệp", "Yên Mỹ", "Vĩnh Quỳnh", "Ngũ Hiệp", "Duyên Hà", "Ngọc Hồi", "Vạn Phúc", "Đại áng", "Liên Ninh", "Đông Mỹ"],
    "Sóc Sơn": ["Sóc Sơn", "Bắc Sơn", "Minh Trí", "Hồng Kỳ", "Nam Sơn", "Trung Giã", "Tân Hưng", "Minh Phú", "Phù Linh", "Bắc Phú", "Tân Minh", "Quang Tiến", "Hiền Ninh", "Tân Dân", "Tiên Dược", "Việt Long", "Xuân Giang", "Mai Đình", "Đức Hòa", "Thanh Xuân", "Đông Xuân", "Kim Lũ", "Phú Cường", "Phú Minh", "Phù Loãn", "Xuân Thu"],
  },
  "Nghệ An": {
    "TP. Vinh": ["Bến Thủy", "Cửa Nam", "Đội Cung", "Đông Vĩnh", "Hà Huy Tập", "Hưng Bình", "Hưng Dũng", "Hưng Phúc", "Lê Lợi", "Lê Mao", "Quán Bàu", "Quang Trung", "Trung Đô", "Trường Thi", "Vinh Tân", "Hưng Đông", "Hưng Hòa", "Hưng Lộc", "Nghi Ân", "Nghi Đức", "Nghi Kim", "Nghi Liên", "Nghi Phú"],
    "TX. Cửa Lò": ["Nghi Hải", "Nghi Hòa", "Nghi Hương", "Nghi Tân", "Nghi Thu", "Nghi Thủy", "Thu Thủy"],
    "TX. Thái Hòa": ["Hòa Hiếu", "Long Sơn", "Quang Phong", "Quang Tiến", "Đông Hiếu", "Tây Hiếu", "Nghĩa Mỹ", "Nghĩa Thuận", "Nghĩa Tiến"],
    "TX. Hoàng Mai": ["Quỳnh Dị", "Quỳnh Phương", "Quỳnh Thiện", "Quỳnh Xuân", "Mai Hùng", "Quỳnh Lập", "Quỳnh Lộc", "Quỳnh Trang", "Quỳnh Vinh"],
    "Huyện Nghi Lộc": ["Quán Hành", "Nghi Thái", "Nghi Thiết", "Nghi Thuận", "Nghi Trường", "Nghi Văn", "Nghi Xá", "Nghi Yên", "Phúc Thọ", "Nghi Công Bắc", "Nghi Công Nam", "Nghi Đồng", "Nghi Hưng", "Nghi Kiều", "Nghi Lâm", "Nghi Long", "Nghi Mỹ", "Nghi Phong", "Nghi Phương", "Nghi Quang"],
    "Huyện Hưng Nguyên": ["Hưng Nguyên", "Hưng Đạo", "Hưng Lĩnh", "Hưng Thông", "Hưng Tân", "Hưng Yên", "Hưng Yên Bắc", "Hưng Trung", "Hưng Tây", "Hưng Chính", "Hưng Thành", "Hưng Tiến", "Hưng Thắng", "Hưng Phúc", "Hưng Long", "Hưng Xuân", "Hưng Nhân", "Hưng Châu", "Hưng Nghĩa", "Hưng Lợi"],
    "Huyện Nam Đàn": ["Nam Đàn", "Nam Giang", "Nam Hưng", "Nam Kim", "Nam Lĩnh", "Nam Nghĩa", "Nam Thái", "Nam Thanh", "Nam Xuân", "Nam Anh", "Nam Cát", "Vân Diên", "Xuân Hòa", "Xuân Lâm", "Kim Liên", "Hồng Long", "Khánh Sơn", "Trung Phúc Cường", "Hùng Tiến"],
    "Huyện Diễn Châu": ["Diễn Châu", "Diễn An", "Diễn Bích", "Diễn Cát", "Diễn Đoài", "Diễn Đồng", "Diễn Hải", "Diễn Hoa", "Diễn Hoàng", "Diễn Hồng", "Diễn Hùng", "Diễn Kim", "Diễn Kỷ", "Diễn Lâm", "Diễn Liên", "Diễn Lộc", "Diễn Lợi", "Diễn Minh", "Diễn Mỹ", "Diễn Ngọc", "Diễn Nguyên", "Diễn Phong", "Diễn Phú", "Diễn Phúc", "Diễn Quảng", "Diễn Tân", "Diễn Thái", "Diễn Tháp", "Diễn Thịnh", "Diễn Thọ", "Diễn Trung", "Diễn Trường", "Diễn Vạn", "Diễn Xuân", "Diễn Yên"],
    "Huyện Yên Thành": ["Yên Thành", "Bắc Thành", "Đô Thành", "Đồng Thành", "Hậu Thành", "Hoa Thành", "Hùng Thành", "Khánh Thành", "Kim Thành", "Lăng Thành", "Liên Thành", "Long Thành", "Lý Thành", "Mã Thành", "Minh Thành", "Nam Thành", "Nhân Thành", "Phú Thành", "Quang Thành", "Sơn Thành", "Tân Thành", "Tăng Thành", "Tây Thành", "Thịnh Thành", "Thọ Thành", "Tiến Thành", "Trung Thành", "Văn Thành", "Viên Thành", "Vĩnh Thành", "Xuân Thành"],
    "Huyện Đô Lương": ["Đô Lương", "Bắc Sơn", "Bồi Sơn", "Đà Sơn", "Đặng Sơn", "Đông Sơn", "Giang Sơn Đông", "Giang Sơn Tây", "Hiến Sơn", "Hòa Sơn", "Hồng Sơn", "Lam Sơn", "Lưu Sơn", "Minh Sơn", "Mỹ Sơn", "Nam Sơn", "Ngọc Sơn", "Nhân Sơn", "Quang Sơn", "Tân Sơn", "Thái Sơn", "Thịnh Sơn", "Thuận Sơn", "Thượng Sơn", "Tràng Sơn", "Trung Sơn", "Trù Sơn", "Văn Sơn", "Xuân Sơn", "Yên Sơn"],
    "Huyện Quỳnh Lưu": ["Cầu Giát", "Quỳnh Bá", "Quỳnh Bảng", "Quỳnh Châu", "Quỳnh Diện", "Quỳnh Đôi", "Quỳnh Giang", "Quỳnh Hậu", "Quỳnh Hoa", "Quỳnh Hồng", "Quỳnh Hưng", "Quỳnh Lâm", "Quỳnh Long", "Quỳnh Lương", "Quỳnh Minh", "Quỳnh Mỹ", "Quỳnh Nghĩa", "Quỳnh Ngọc", "Quỳnh Tam", "Quỳnh Tân", "Quỳnh Thạch", "Quỳnh Thanh", "Quỳnh Thọ", "Quỳnh Thuận", "Quỳnh Văn", "Quỳnh Yên", "Sơn Hải", "Tân Sơn", "Tiến Thủy", "Quỳnh Liên", "An Hòa", "Ngọc Sơn"],
    "Huyện Thanh Chương": ["Thanh Chương", "Cát Văn", "Đồng Văn", "Hạnh Lâm", "Ngọc Lâm", "Ngọc Sơn", "Phong Thịnh", "Thanh An", "Thanh Chi", "Thanh Đồng", "Thanh Đức", "Thanh Dương", "Thanh Giang", "Thanh Hà", "Thanh Hòa", "Thanh Hưng", "Thanh Hương", "Thanh Khai", "Thanh Lâm", "Thanh Liên", "Thanh Lĩnh", "Thanh Long", "Thanh Lương", "Thanh Mai", "Thanh Mỹ", "Thanh Ngọc", "Thanh Nho", "Thanh Phong", "Thanh Sơn", "Thanh Thịnh", "Thanh Thủy", "Thanh Tiên", "Thanh Tùng", "Thanh Tường", "Thanh Văn", "Thanh Xuân", "Thanh Yên", "Võ Liệt", "Xuân Tường"],
  },
};

export function parseArea(value?: string | null) {
  const parts = (value || "")
    .split(" · ")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    province: parts[0] || "",
    district: parts[1] || "",
    ward: parts[2] || "",
  };
}

export function formatArea(province: string, district?: string, ward?: string) {
  if (!province) return "";
  if (province === "Trực tuyến") return "Trực tuyến";
  return [province, district, ward].filter(Boolean).join(" · ");
}

export function districtsOf(province: string) {
  return Object.keys(LOCATION_TREE[province] || {});
}

export function wardsOf(province: string, district: string) {
  return LOCATION_TREE[province]?.[district] || [];
}
