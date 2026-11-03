const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('src/screens/QuanLyWebsite/QuanLyWebsite.js');
let code = fs.readFileSync(targetPath, 'utf8');

const newSectionGroups = `const SECTION_GROUPS = [
  {
    id: 'home_brand',
    title: 'Trang Chủ & Nhận Diện',
    icon: '🌟',
    badge: '3 mục',
    desc: 'Hiệu ứng mở đầu, Banner Hero & Chân trang',
    sections: [
      { id: 'intro', name: 'Màn Hình Intro', icon: '🎬', tag: 'Hiệu ứng mở đầu', previewLink: '/' },
      { id: 'banners', name: 'Slide Banner Hero', icon: '🖼️', tag: 'Banner Trang Chủ', previewLink: '/' },
      { id: 'footer', name: 'Thông Tin Footer', icon: '📌', tag: 'Chân trang & Liên hệ', previewLink: '/#footer' }
    ]
  },
  {
    id: 'services_media',
    title: 'Dịch Vụ & Bộ Sưu Tập',
    icon: '💼',
    badge: '6 mục',
    desc: 'Hệ sinh thái dịch vụ, Concept ảnh cưới & Bảng giá',
    sections: [
      { id: 'services', name: 'Dịch Vụ Của Tôi', icon: '💼', tag: 'Hệ sinh thái', previewLink: '/#services' },
      { id: 'collections', name: 'Concept Mẫu', icon: '🎨', tag: 'Ý tưởng & Bối cảnh', previewLink: '/new-concept' },
      { id: 'special_collections', name: 'Bộ Sưu Tập Thực Tế (3D)', icon: '✨', tag: 'Photobook Kéo Thả', previewLink: '/bo-suu-tap-an-tuong' },
      { id: 'dresses', name: 'Bộ Sưu Tập Váy Cưới', icon: '👗', tag: 'Váy Cưới & Trang Phục', previewLink: '/vay-cuoi-co-dau' },
      { id: 'makeup', name: 'Nghệ Thuật Makeup', icon: '💄', tag: 'Layout Cô Dâu', previewLink: '/trang-diem-co-dau' },
      { id: 'packages', name: 'Bảng Giá & Gói Chụp', icon: '💰', tag: 'Combo & Báo Giá', previewLink: '/packages' }
    ]
  },
  {
    id: 'crm_feedback',
    title: 'Khách Hàng & Tương Tác',
    icon: '👥',
    badge: '3 mục',
    desc: 'Lịch tư vấn từ website, Đánh giá & Mẫu thiệp',
    sections: [
      { id: 'bookings', name: 'Lịch Đặt Tư Vấn', icon: '📅', tag: 'Leads Web', directAppRoute: '/leads', directAppLabel: 'Mở CRM Quản Lý Lead' },
      { id: 'feedback', name: 'Feedback Khách Hàng', icon: '⭐', tag: 'Đánh giá chân thực', previewLink: '/#testimonials' },
      { id: 'invitations', name: 'Mẫu Thiệp Nổi Bật', icon: '💌', tag: 'Mẫu Thiệp', directAppRoute: '/quanlythiepmoi', directAppLabel: 'Mở Hệ Thống Thiệp Online 4.0' }
    ]
  },
  {
    id: 'campaigns',
    title: 'Chiến Dịch & Sự Kiện',
    icon: '🎯',
    badge: '2 mục',
    desc: 'Deal Khai Trương, Vòng Quay & Sự Kiện Quốc Khánh',
    sections: [
      { id: 'khai_truong', name: 'Deal Khai Trương', icon: '🎟️', tag: 'Vòng quay & Voucher', previewLink: '/khai-truong' },
      { id: 'event_management', name: 'Quản Lý Sự Kiện 2/9', icon: '🎉', tag: 'Thắp cờ & Lời tri ân', previewLink: '/quoc-khanh' }
    ]
  }
];

const SECTIONS = SECTION_GROUPS.flatMap(g => g.sections);`;

const startSec = code.indexOf('const SECTIONS = [');
const endSec = code.indexOf('const DEFAULT_INTRO_CONFIG = {');

if (startSec !== -1 && endSec !== -1) {
  code = code.slice(0, startSec) + newSectionGroups + '\r\n\r\n' + code.slice(endSec);
}

// Thêm state activeGroup và searchTerm
const oldState = `  const [activeTab, setActiveTab] = useState('banners');
  const [khaiTruongSubTab, setKhaiTruongSubTab] = useState('deals');`;

const newState = `  const [activeGroup, setActiveGroup] = useState('home_brand');
  const [activeTab, setActiveTab] = useState('banners');
  const [searchTerm, setSearchTerm] = useState('');
  const [khaiTruongSubTab, setKhaiTruongSubTab] = useState('deals');`;

if (code.includes(oldState.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldState.replace(/\n/g, '\r\n'), newState.replace(/\n/g, '\r\n'));
} else if (code.includes(oldState)) {
  code = code.replace(oldState, newState);
}

// Tự động đồng bộ activeGroup mỗi khi activeTab thay đổi hoặc ngược lại
const syncGroupHook = `
  useEffect(() => {
    const parentGroup = SECTION_GROUPS.find(g => g.sections.some(s => s.id === activeTab));
    if (parentGroup && parentGroup.id !== activeGroup) {
      setActiveGroup(parentGroup.id);
    }
  }, [activeTab]);
`;

code = code.replace('const section = getEffectiveSection();', 'const section = getEffectiveSection();' + syncGroupHook);

// Tối ưu hóa hàm getFilteredData để hỗ trợ search tức thì
const oldGetFilteredData = `  const getFilteredData = () => {
    if (section === 'collections') {
      return data.filter(item => !item.isSpecial);
    }
    if (section !== 'bookings') return data;`;

const newGetFilteredData = `  const getFilteredData = () => {
    let result = data;
    if (section === 'collections') {
      result = data.filter(item => !item.isSpecial);
    } else if (section === 'bookings') {
      const getLocalDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return \`\${year}-\${month}-\${day}\`;
      };

      const todayStr = getLocalDateString(new Date());

      const startOfWeek = new Date();
      const dayOfWeek = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const parseLocalDate = (dateStr) => {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
        return new Date(dateStr);
      };

      result = data.filter(item => {
        if (!item.date) return bookingFilter === 'all';
        const itemDate = parseLocalDate(item.date);
        itemDate.setHours(0, 0, 0, 0);
        if (bookingFilter === 'today') {
          return item.date === todayStr;
        } else if (bookingFilter === 'week') {
          return itemDate >= startOfWeek && itemDate <= endOfWeek;
        }
        return true;
      });
    }

    if (searchTerm && searchTerm.trim()) {
      const kw = searchTerm.trim().toLowerCase();
      result = result.filter(item => {
        const textToSearch = [
          item.title, item.name, item.calligraphy, item.subtitle, item.subTitle,
          item.phone, item.email, item.address, item.code, item.category,
          item.desc, item.content, item.coupleName, item.maHopDong
        ].filter(Boolean).join(' ').toLowerCase();
        return textToSearch.includes(kw);
      });
    }

    return result;
  };

  const old_getFilteredData_unused = () => {
    if (section === 'collections') {
      return data.filter(item => !item.isSpecial);
    }
    if (section !== 'bookings') return data;`;

if (code.includes(oldGetFilteredData.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldGetFilteredData.replace(/\n/g, '\r\n'), newGetFilteredData.replace(/\n/g, '\r\n'));
} else if (code.includes(oldGetFilteredData)) {
  code = code.replace(oldGetFilteredData, newGetFilteredData);
}

// Sửa localhost:3000
code = code.replace('href="http://localhost:3000/quoc-khanh"', 'href="/quoc-khanh"');

fs.writeFileSync(targetPath, code, 'utf8');
console.log('Step 1 applied successfully!');

