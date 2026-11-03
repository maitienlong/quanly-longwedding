const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('src/screens/QuanLyWebsite/QuanLyWebsite.js');
let code = fs.readFileSync(targetPath, 'utf8');

// 1. Thêm import QuanLyThiepMoi
if (!code.includes("import QuanLyThiepMoi from '../QuanLyThiepMoi/QuanLyThiepMoi';")) {
  code = code.replace(
    "import otherService from '../../API/services/otherService';",
    "import otherService from '../../API/services/otherService';\r\nimport QuanLyThiepMoi from '../QuanLyThiepMoi/QuanLyThiepMoi';"
  );
}

// 2. Cập nhật SECTION_GROUPS để thay invitations thành thiep_moi_online
const oldCrmFeedbackGroup = `  {
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
  },`;

const newCrmFeedbackGroup = `  {
    id: 'crm_feedback',
    title: 'Khách Hàng & Tương Tác',
    icon: '👥',
    badge: '3 mục',
    desc: 'Lịch tư vấn từ website, Đánh giá & Thiệp mời Online',
    sections: [
      { id: 'thiep_moi_online', name: 'Thiệp Cưới Online 4.0', icon: '💌', tag: 'Mẫu thiệp & Tạo thiệp', previewLink: '/thiep-online' },
      { id: 'bookings', name: 'Lịch Đặt Tư Vấn', icon: '📅', tag: 'Leads Web', directAppRoute: '/leads', directAppLabel: 'Mở CRM Quản Lý Lead' },
      { id: 'feedback', name: 'Feedback Khách Hàng', icon: '⭐', tag: 'Đánh giá chân thực', previewLink: '/#testimonials' }
    ]
  },`;

if (code.includes(oldCrmFeedbackGroup.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldCrmFeedbackGroup.replace(/\n/g, '\r\n'), newCrmFeedbackGroup.replace(/\n/g, '\r\n'));
} else if (code.includes(oldCrmFeedbackGroup)) {
  code = code.replace(oldCrmFeedbackGroup, newCrmFeedbackGroup);
}

// 3. Xử lý trong fetchData và kiểm tra tab
// Không gọi websiteService.getSection('thiep_moi_online') vì QuanLyThiepMoi tự quản lý dữ liệu
const oldFetchDataStart = `    if (section === 'intro') {
      await fetchIntroConfig();
      setLoading(false);
      return;
    }
    if (section === 'event_management') {
      await fetchEventManagementData();
      return;
    }`;

const newFetchDataStart = `    if (section === 'intro') {
      await fetchIntroConfig();
      setLoading(false);
      return;
    }
    if (section === 'thiep_moi_online') {
      setLoading(false);
      return;
    }
    if (section === 'event_management') {
      await fetchEventManagementData();
      return;
    }`;

if (code.includes(oldFetchDataStart.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldFetchDataStart.replace(/\n/g, '\r\n'), newFetchDataStart.replace(/\n/g, '\r\n'));
} else if (code.includes(oldFetchDataStart)) {
  code = code.replace(oldFetchDataStart, newFetchDataStart);
}

// 4. Trong panel header nút "+ Thêm mục mới" và badge
// Ẩn nút thêm mục mới nếu là thiep_moi_online (vì QuanLyThiepMoi đã có nút thêm/tạo mẫu riêng của nó)
code = code.replace(
  "section !== 'intro' && section !== 'bookings' && section !== 'voucher_claims' && section !== 'special_collections' && activeTab !== 'event_management'",
  "section !== 'intro' && section !== 'thiep_moi_online' && section !== 'bookings' && section !== 'voucher_claims' && section !== 'special_collections' && activeTab !== 'event_management'"
);

// Badge số lượng mục
code = code.replace(
  "activeTab === 'intro' ? `${INTRO_THEMES.length} chủ đề` : `${getFilteredData().length} mục`",
  "activeTab === 'intro' ? `${INTRO_THEMES.length} chủ đề` : (activeTab === 'thiep_moi_online' ? 'Nền tảng 4.0' : `${getFilteredData().length} mục`)"
);

// 5. Render nội dung panel
const oldPanelRender = `{activeTab === 'intro' ? (
          renderIntroPanel()
        ) : activeTab === 'event_management' ? (
          renderEventManagement()
        ) : loading ? (`;

const newPanelRender = `{activeTab === 'intro' ? (
          renderIntroPanel()
        ) : activeTab === 'thiep_moi_online' ? (
          <div className="embedded-thiepmoi-wrapper" style={{ marginTop: '5px' }}>
            <QuanLyThiepMoi isEmbedded={true} />
          </div>
        ) : activeTab === 'event_management' ? (
          renderEventManagement()
        ) : loading ? (`;

if (code.includes(oldPanelRender.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldPanelRender.replace(/\n/g, '\r\n'), newPanelRender.replace(/\n/g, '\r\n'));
} else if (code.includes(oldPanelRender)) {
  code = code.replace(oldPanelRender, newPanelRender);
}

// 6. Xóa shortcut thừa của invitations cũ
code = code.replace(
  `            {activeTab === 'invitations' && (
              <a href="/quanlythiepmoi" className="cms-shortcut-pill pink">
                <span>💌 Mở Hệ Thống Thiệp Online 4.0 ➔</span>
              </a>
            )}`,
  ''
);

fs.writeFileSync(targetPath, code, 'utf8');
console.log('Successfully integrated QuanLyThiepMoi into QuanLyWebsite!');

