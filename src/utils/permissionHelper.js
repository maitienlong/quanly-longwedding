/**
 * Hệ thống định nghĩa & kiểm tra phân quyền chức năng - Long Wedding Studio
 */

// 1. Danh mục các nhóm chức năng
export const PERMISSION_GROUPS = [
    {
        id: 'operation',
        name: 'Vận hành & Lịch trình',
        icon: 'fa-solid fa-calendar-check',
        color: '#0284c7'
    },
    {
        id: 'inventory',
        name: 'Kho & Dịch vụ',
        icon: 'fa-solid fa-boxes-stacked',
        color: '#f97316'
    },
    {
        id: 'crm_marketing',
        name: 'Khách hàng & Marketing',
        icon: 'fa-solid fa-users',
        color: '#8b5cf6'
    },
    {
        id: 'finance',
        name: 'Tài chính & Thi đua',
        icon: 'fa-solid fa-chart-line',
        color: '#10b981'
    },
    {
        id: 'system',
        name: 'Quản trị & Cấu hình',
        icon: 'fa-solid fa-shield-halved',
        color: '#ec4899'
    }
];

// 2. Danh mục chi tiết 16 quyền chức năng
export const ALL_PERMISSIONS = [
    // Nhóm 1: Vận hành & Lịch trình
    {
        id: 'tongquan',
        group: 'operation',
        label: 'Tổng quan hệ thống',
        desc: 'Xem dashboard tổng quan, doanh số và hoạt động studio trong tháng',
        icon: 'fa-solid fa-chart-pie',
        color: '#38bdf8'
    },
    {
        id: 'banhang',
        group: 'operation',
        label: 'Bán hàng & Hợp đồng',
        desc: 'Lập hợp đồng, quản lý các giai đoạn, thanh toán và in phiếu',
        icon: 'fa-solid fa-file-invoice-dollar',
        color: '#f59e0b'
    },
    {
        id: 'lichcuahang',
        group: 'operation',
        label: 'Lịch Cửa Hàng',
        desc: 'Quản lý lịch chụp ảnh, makeup, hậu kỳ, in ấn và lịch tổng hợp',
        icon: 'fa-solid fa-calendar-check',
        color: '#0ea5e9'
    },
    {
        id: 'lichSoanDo',
        group: 'operation',
        label: 'Lịch Soạn Đồ',
        desc: 'Quản lý lịch hẹn thử đồ, chuẩn bị và thu hồi trang phục cưới',
        icon: 'fa-solid fa-shirt',
        color: '#ec4899'
    },
    {
        id: 'phan-cong-tho',
        group: 'operation',
        label: 'Phân công Thợ & Ekip (Photo / Make / Quay phim / Hậu trường)',
        desc: 'Quyền lựa chọn, phân công hoặc đổi thợ chụp hình, makeup, quay phim, hậu trường, hậu kỳ trong hợp đồng & lịch trình',
        icon: 'fa-solid fa-user-tag',
        color: '#f43f5e'
    },

    // Nhóm 2: Kho & Dịch vụ
    {
        id: 'quanlykho',
        group: 'inventory',
        label: 'Bảng giá & Dịch vụ',
        desc: 'Quản lý bảng giá các gói chụp, phụ kiện, in ảnh và dịch vụ lẻ',
        icon: 'fa-solid fa-boxes-stacked',
        color: '#fb923c'
    },
    {
        id: 'quanlytrangphuc',
        group: 'inventory',
        label: 'Kho Váy & Vest',
        desc: 'Quản lý tủ trang phục cưới, tình trạng và lịch giữ váy',
        icon: 'fa-solid fa-vest',
        color: '#ec4899'
    },

    // Nhóm 3: Khách hàng & Marketing
    {
        id: 'quanlykhachhang',
        group: 'crm_marketing',
        label: 'CRM Khách Hàng',
        desc: 'Hồ sơ khách hàng, số điện thoại, mạng xã hội và công nợ',
        icon: 'fa-solid fa-address-book',
        color: '#a855f7'
    },
    {
        id: 'leads',
        group: 'crm_marketing',
        label: 'Lead Tư Vấn',
        desc: 'Tiếp nhận và quản lý khách hàng tiềm năng từ mạng xã hội/chat',
        icon: 'fa-solid fa-comments',
        color: '#06b6d4'
    },
    {
        id: 'quanlywebsite',
        group: 'crm_marketing',
        label: 'Quản lý Website & CMS',
        desc: 'Chỉnh sửa bài viết, bộ sưu tập, banner và bảng giá website',
        icon: 'fa-solid fa-globe',
        color: '#10b981'
    },
    {
        id: 'quanlyvoucher',
        group: 'crm_marketing',
        label: 'Quản lý Voucher',
        desc: 'Tạo mã giảm giá, chiến dịch ưu đãi và theo dõi lượt sử dụng',
        icon: 'fa-solid fa-ticket',
        color: '#f59e0b'
    },

    // Nhóm 4: Tài chính & Thi đua
    {
        id: 'doanhthu',
        group: 'finance',
        label: 'Báo cáo Doanh thu',
        desc: 'Thống kê doanh số, dòng tiền thu, chiết khấu và biểu đồ tài chính',
        icon: 'fa-solid fa-chart-pie',
        color: '#38bdf8'
    },
    {
        id: 'quanlychitieu',
        group: 'finance',
        label: 'Quản lý Chi tiêu',
        desc: 'Lập phiếu chi, theo dõi quỹ tiền mặt và ngân hàng studio',
        icon: 'fa-solid fa-wallet',
        color: '#f87171'
    },
    {
        id: 'thi-dua',
        group: 'finance',
        label: 'Thi đua & KPI',
        desc: 'Xem bảng vàng vinh danh, chỉ số KPI cá nhân và hệ thống',
        icon: 'fa-solid fa-trophy',
        color: '#fbbf24'
    },

    // Nhóm 5: Quản trị & Cấu hình
    {
        id: 'quanlynhanvien',
        group: 'system',
        label: 'Quản lý Nhân sự & Phân quyền',
        desc: 'Quản lý tài khoản nhân viên, cấu hình lương hoa hồng và phân quyền',
        icon: 'fa-solid fa-users-gear',
        color: '#2563eb'
    },
    {
        id: 'cauhinh',
        group: 'system',
        label: 'Cấu hình & Mẫu in',
        desc: 'Thiết lập thông tin studio, điều khoản hợp đồng và mẫu in',
        icon: 'fa-solid fa-gear',
        color: '#64748b'
    },
    {
        id: 'system-logs',
        group: 'system',
        label: 'Nhật ký hệ thống',
        desc: 'Theo dõi lịch sử hoạt động, chỉnh sửa dữ liệu của nhân viên',
        icon: 'fa-solid fa-shield-halved',
        color: '#e11d48'
    }
];

// 3. Các mẫu phân quyền thiết lập nhanh (Presets)
export const PERMISSION_PRESETS = [
    {
        id: 'full_admin',
        name: 'Toàn quyền (Quản trị viên)',
        icon: 'fa-solid fa-crown',
        color: '#dc2626',
        desc: 'Cấp toàn quyền truy cập tất cả tính năng trong hệ thống',
        permissions: ALL_PERMISSIONS.map(p => p.id)
    },
    {
        id: 'sale_reception',
        name: 'Nhân viên Sale / Lễ tân',
        icon: 'fa-solid fa-headset',
        color: '#0284c7',
        desc: 'Bán hàng, quản lý lịch, xem váy cưới, chăm sóc khách hàng & tư vấn',
        permissions: ['tongquan', 'banhang', 'lichcuahang', 'lichSoanDo', 'quanlytrangphuc', 'quanlykhachhang', 'leads', 'thi-dua', 'quanlyvoucher']
    },
    {
        id: 'photo_makeup',
        name: 'Thợ Chụp / Makeup / Hậu kỳ',
        icon: 'fa-solid fa-camera',
        color: '#d946ef',
        desc: 'Xem lịch cửa hàng, lịch soạn đồ, báo cáo thi đua và nhận ca làm việc',
        permissions: ['tongquan', 'lichcuahang', 'lichSoanDo', 'thi-dua']
    },
    {
        id: 'wardrobe_staff',
        name: 'Quản lý Kho Váy & Trang phục',
        icon: 'fa-solid fa-vest',
        color: '#ec4899',
        desc: 'Quản lý tủ đồ, lịch giữ váy, chuẩn bị đồ cưới và phụ kiện',
        permissions: ['tongquan', 'lichSoanDo', 'quanlytrangphuc', 'quanlykho', 'thi-dua']
    },
    {
        id: 'accountant',
        name: 'Kế toán / Thu ngân',
        icon: 'fa-solid fa-calculator',
        color: '#10b981',
        desc: 'Quản lý chi tiêu, doanh thu tài chính, thanh toán hợp đồng và CRM',
        permissions: ['tongquan', 'banhang', 'quanlychitieu', 'doanhthu', 'quanlykhachhang', 'thi-dua']
    },
    {
        id: 'marketing',
        name: 'Marketing & Website',
        icon: 'fa-solid fa-bullhorn',
        color: '#f59e0b',
        desc: 'Quản lý website CMS, voucher khuyến mãi, lead tư vấn và khách hàng',
        permissions: ['tongquan', 'quanlywebsite', 'quanlyvoucher', 'leads', 'quanlykhachhang']
    }
];

// 4. Hàm kiểm tra quyền của tài khoản người dùng
export const hasPermission = (user, permissionKey) => {
    if (!user) return false;

    // 1. Quản trị viên tối cao (along) hoặc chức vụ Quản lý luôn có toàn quyền tuyệt đối
    if (
        user.username === 'along' ||
        user.positon === 'Quản lý' ||
        user.positon === 'Quản trị viên' ||
        user.role === 'ADMIN'
    ) {
        return true;
    }

    // 2. Nếu người dùng có mảng permissions do Quản trị viên thiết lập:
    // Tuân thủ CHÍNH XÁC theo mảng permissions này!
    if (Array.isArray(user.permissions)) {
        if (user.permissions.includes('*') || user.permissions.includes('all')) {
            return true;
        }
        return user.permissions.includes(permissionKey);
    }

    // 3. Nếu là tài khoản Admin cũ (permission === 1) mà chưa có cấu hình permissions riêng
    if (user.permission === 1 && user.positon === 'Admin') {
        return true;
    }

    // 4. Trường hợp tài khoản nhân viên cũ chưa được cấu hình mảng permissions:
    // Cấp các quyền cơ bản mặc định (Lưu ý: KHÔNG bao gồm 'phan-cong-tho')
    const defaultStaffPermissions = ['tongquan', 'banhang', 'lichcuahang', 'lichSoanDo'];
    return defaultStaffPermissions.includes(permissionKey);
};

// 5. Helper kiểm tra nhanh quyền phân công thợ
export const canAssignCrew = (user) => {
    return hasPermission(user, 'phan-cong-tho');
};

// 6. Bản đồ đường dẫn tương ứng với quyền chức năng
export const PERMISSION_ROUTE_MAP = [
    { perm: 'tongquan', path: '/tongquan', label: 'Tổng quan hệ thống', icon: 'fa-solid fa-chart-pie' },
    { perm: 'banhang', path: '/banhang', label: 'Bán hàng & Hợp đồng', icon: 'fa-solid fa-file-invoice-dollar' },
    { perm: 'lichcuahang', path: '/lichcuahang', label: 'Lịch Cửa Hàng', icon: 'fa-solid fa-calendar-check' },
    { perm: 'lichSoanDo', path: '/lichSoanDo', label: 'Lịch Soạn Đồ', icon: 'fa-solid fa-shirt' },
    { perm: 'quanlykho', path: '/quanlykho', label: 'Bảng giá & Dịch vụ', icon: 'fa-solid fa-boxes-stacked' },
    { perm: 'quanlytrangphuc', path: '/quanlytrangphuc', label: 'Kho Váy & Vest', icon: 'fa-solid fa-vest' },
    { perm: 'quanlykhachhang', path: '/quanlykhachhang', label: 'CRM Khách Hàng', icon: 'fa-solid fa-address-book' },
    { perm: 'leads', path: '/leads', label: 'Lead Tư Vấn', icon: 'fa-solid fa-comments' },
    { perm: 'quanlywebsite', path: '/quanlywebsite', label: 'Quản lý Website & CMS', icon: 'fa-solid fa-globe' },
    { perm: 'quanlyvoucher', path: '/quanlyvoucher', label: 'Quản lý Voucher', icon: 'fa-solid fa-ticket' },
    { perm: 'doanhthu', path: '/doanhthu', label: 'Báo cáo Doanh thu', icon: 'fa-solid fa-chart-pie' },
    { perm: 'quanlychitieu', path: '/quanlychitieu', label: 'Quản lý Chi tiêu', icon: 'fa-solid fa-wallet' },
    { perm: 'thi-dua', path: '/thi-dua', label: 'Thi đua & Vinh danh', icon: 'fa-solid fa-trophy' },
    { perm: 'quanlynhanvien', path: '/quanlynhanvien', label: 'Quản lý Nhân sự & Phân quyền', icon: 'fa-solid fa-users-gear' },
    { perm: 'cauhinh', path: '/cauhinh', label: 'Cấu hình & Mẫu in', icon: 'fa-solid fa-gear' },
    { perm: 'system-logs', path: '/system-logs', label: 'Nhật ký hệ thống', icon: 'fa-solid fa-shield-halved' }
];

// Lấy đường dẫn đầu tiên mà người dùng được phép truy cập
export const getFirstAllowedPath = (user) => {
    if (!user) return '/login';
    for (const item of PERMISSION_ROUTE_MAP) {
        if (hasPermission(user, item.perm)) {
            return item.path;
        }
    }
    return '/tongquan';
};



