// Helper quản lý và lưu trữ cấu hình mẫu in hợp đồng & mẫu in phiếu mượn/trả đồ
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import logoVang from '../assets/logo/logo-vang.png';
import LOGO_LONG_WEDDING_BASE64 from '../assets/logo/logoBase64';

if (typeof window !== 'undefined') {
    window.html2canvas = html2canvas;
    window.jspdf = { jsPDF };
    window.jsPDF = jsPDF;
}

export const getSafePrintLogo = () => {
    if (LOGO_LONG_WEDDING_BASE64) {
        return LOGO_LONG_WEDDING_BASE64;
    }
    if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        if (logoVang) {
            const cleanPath = logoVang.startsWith('/') ? logoVang : `/${logoVang}`;
            return `${origin}${cleanPath}`;
        }
        return `${origin}/logo-vang.png`;
    }
    return logoVang || '/logo-vang.png';
};

const CONTRACT_PRINT_CONFIG_KEY = 'longwedding_contract_print_config_v3';
const LOAN_RECEIPT_PRINT_CONFIG_KEY = 'longwedding_loan_receipt_print_config_v3';

// Danh sách tham số động (@parameter) dùng trong mẫu hợp đồng
export const AVAILABLE_CONTRACT_PARAMS = [
    {
        category: "Khách hàng (Bên A)",
        icon: "fa-user",
        color: "#0284c7",
        params: [
            { key: "@tenKhachHang", label: "Tên Cô Dâu / Đại diện", sample: "Nguyễn Thị Hoa", desc: "Họ và tên của cô dâu hoặc khách hàng đại diện ký hợp đồng" },
            { key: "@tenChuRe", label: "Tên Chú Rể", sample: "Trần Văn Long", desc: "Họ và tên của chú rể" },
            { key: "@soDienThoai", label: "SĐT Cô dâu / Khách hàng", sample: "0988.123.456", desc: "Số điện thoại liên hệ chính của Bên A" },
            { key: "@soDienThoai2", label: "SĐT Chú rể", sample: "0977.654.321", desc: "Số điện thoại của chú rể" },
            { key: "@diaChiKhachHang", label: "Địa chỉ Khách hàng", sample: "Nghĩa Đàn, Nghệ An", desc: "Địa chỉ thường trú của khách hàng" },
        ]
    },
    {
        category: "Lịch trình & Phân công",
        icon: "fa-calendar-days",
        color: "#8b5cf6",
        params: [
            { key: "@ngayCuoi", label: "Ngày tổ chức Lễ Cưới", sample: "20/10/2025", desc: "Ngày diễn ra lễ cưới chính thức" },
            { key: "@ngayAnHoi", label: "Ngày Lễ Ăn Hỏi", sample: "15/10/2025", desc: "Ngày tổ chức lễ đính hôn / ăn hỏi" },
            { key: "@ngayChup", label: "Ngày chụp ảnh cưới", sample: "20/09/2025", desc: "Ngày chụp thực tế tại studio hoặc ngoại cảnh" },
            { key: "@ngayTraAnh", label: "Ngày hẹn trả ảnh", sample: "05/10/2025", desc: "Ngày studio bàn giao trả ảnh hoàn thiện" },
            { key: "@thoChupHinh", label: "Thợ chụp ảnh chính", sample: "Long Photographer", desc: "Nhân sự thợ chụp được phân công" },
            { key: "@thoMakeUp", label: "Thợ trang điểm", sample: "Lan Makeup", desc: "Nhân sự makeup được phân công" },
            { key: "@thoChinhAnh", label: "Thợ chỉnh sửa ảnh", sample: "Tuấn Photoshop", desc: "Nhân sự phụ trách hậu kỳ Photoshop" },
            { key: "@nhanVienSale", label: "Nhân viên tư vấn (Sale)", sample: "Hà Wedding", desc: "Nhân viên phụ trách hợp đồng" },
            { key: "@ngayLapHopDong", label: "Ngày ký hợp đồng", sample: "18/08/2025", desc: "Ngày lập và ký kết hợp đồng dịch vụ" },
            { key: "@ngayHienTai", label: "Ngày xuất in hiện tại", sample: "20/10/2026", desc: "Ngày giờ in hợp đồng thực tế từ hệ thống" },
            { key: "@trangDiemNgayAnHoi", label: "Trang điểm ngày ăn hỏi", sample: "Có", desc: "Trạng thái trang điểm ăn hỏi trong gói (Có/Không)" },
            { key: "@trangDiemNgayCuoi", label: "Trang điểm ngày cưới", sample: "Có", desc: "Trạng thái trang điểm ngày cưới trong gói (Có/Không)" },
        ]
    },
    {
        category: "Tài chính & Thanh toán",
        icon: "fa-money-bill-wave",
        color: "#16a34a",
        params: [
            { key: "@tongGiaTri", label: "Tổng giá trị hợp đồng (gốc)", sample: "25.000.000 đ", desc: "Tổng tiền dịch vụ ban đầu trước giảm giá" },
            { key: "@tongGiamGia", label: "Tổng tiền được giảm bớt", sample: "2.000.000 đ", desc: "Tổng các khoản ưu đãi, voucher và giảm giá" },
            { key: "@tongTien", label: "Tổng thanh toán sau giảm", sample: "23.000.000 đ", desc: "Tổng số tiền dịch vụ theo hợp đồng cần thanh toán" },
            { key: "@datCoc", label: "Tiền đặt cọc lần 1", sample: "5.000.000 đ", desc: "Khoản tiền cọc ban đầu đảm bảo dịch vụ" },
            { key: "@daThanhToan", label: "Tổng tiền đã thanh toán", sample: "15.000.000 đ", desc: "Tổng các khoản khách hàng đã thanh toán" },
            { key: "@conLai", label: "Số tiền còn lại", sample: "8.000.000 đ", desc: "Số tiền còn thiếu cần thanh toán trước bàn giao" },
        ]
    },
    {
        category: "Thông tin Studio (Bên B)",
        icon: "fa-store",
        color: "#ea580c",
        params: [
            { key: "@tenStudio", label: "Tên thương hiệu Studio", sample: "LONG WEDDING", desc: "Tên ảnh viện áo cưới Bên B" },
            { key: "@hotlineStudio", label: "Hotline hỗ trợ", sample: "0868 66 3637", desc: "Số điện thoại hotline studio giải đáp khách hàng" },
            { key: "@diaChiStudio", label: "Địa chỉ Studio", sample: "số 129 đường 1/5, xóm Tân Hồng, Xã Nghĩa Đàn, Nghệ An", desc: "Địa chỉ cơ sở studio" },
            { key: "@maHopDong", label: "Mã số hợp đồng", sample: "HD-2025-DEMO", desc: "Mã định danh của bản hợp đồng" },
            { key: "@websiteStudio", label: "Website Studio", sample: "longwedding.vn", desc: "Địa chỉ website hoặc fanpage" }
        ]
    }
];

// Helper chuẩn hóa hiển thị Có/Không cho dịch vụ trang điểm
export const formatMakeupStatus = (val) => {
    if (val === undefined || val === null) return 'Không';
    if (typeof val === 'boolean') return val ? 'Có' : 'Không';
    const str = String(val).trim();
    if (!str) return 'Không';
    const lower = str.toLowerCase();
    if (
        lower === 'không có' ||
        lower === 'không' ||
        lower === 'khong co' ||
        lower === 'khong' ||
        lower === 'false' ||
        lower === '0' ||
        lower === 'none' ||
        lower === 'k' ||
        lower === 'kc'
    ) {
        return 'Không';
    }
    if (
        lower === 'có' ||
        lower === 'co' ||
        lower === 'true' ||
        lower === '1' ||
        lower === 'yes'
    ) {
        return 'Có';
    }
    if (lower.startsWith('có') || lower.startsWith('co')) {
        return str;
    }
    return `Có (${str})`;
};

// Helper thay thế các tham số @param bằng dữ liệu thực tế
export const replaceTemplateParams = (text, data = {}, config = {}) => {
    if (!text || typeof text !== 'string') return text || '';
    
    const paramsMap = {
        '@tenKhachHang': data.nameKH1 || data.khachHang1?.tenKhachHang || 'Nguyễn Thị Hoa',
        '@tenCoDau': data.nameKH1 || data.khachHang1?.tenKhachHang || 'Nguyễn Thị Hoa',
        '@tenChuRe': data.nameKH2 || data.khachHang2?.tenKhachHang || 'Trần Văn Long',
        '@soDienThoai': data.phoneKH1 || data.khachHang1?.soDienThoai || '0988.123.456',
        '@soDienThoai2': data.phoneKH2 || data.khachHang2?.soDienThoai || '0977.654.321',
        '@diaChiKhachHang': data.addressKH1 || data.khachHang1?.diaChi || 'Nghĩa Đàn, Nghệ An',
        '@ngayCuoi': data.ngayCuoiFormatted || data.ngayCuoi || '20/10/2025',
        '@ngayAnHoi': data.ngayAnHoiFormatted || data.ngayAnHoi || '15/10/2025',
        '@ngayChup': data.ngayChupFormatted || data.ngayChup || '20/09/2025',
        '@ngayTraAnh': data.ngayTraAnhFormatted || data.ngayTraAnh || '05/10/2025',
        '@thoChupHinh': data.thoChupHinh || 'Chưa phân công',
        '@thoMakeUp': data.thoMakeUp || 'Chưa phân công',
        '@thoChinhAnh': data.thoChinhAnh || 'Chưa phân công',
        '@nhanVienSale': data.nhanVienSale || 'Chưa phân công',
        '@ngayLapHopDong': data.ngayLapHopDongFormatted || data.ngayHDFormatted || '18/08/2025',
        '@ngayHienTai': new Date().toLocaleDateString('vi-VN'),
        '@trangDiemNgayAnHoi': data.trangDiemNgayAnHoi ? formatMakeupStatus(data.trangDiemNgayAnHoi) : (data.totals?.trangDiemNgayAnHoi ? formatMakeupStatus(data.totals.trangDiemNgayAnHoi) : 'Có'),
        '@trangDiemNgayCuoi': data.trangDiemNgayCuoi ? formatMakeupStatus(data.trangDiemNgayCuoi) : (data.totals?.trangDiemNgayCuoi ? formatMakeupStatus(data.totals.trangDiemNgayCuoi) : 'Có'),
        '@tongGiaTri': data.tongGiaTri ? (typeof data.tongGiaTri === 'number' ? `${data.tongGiaTri.toLocaleString('vi-VN')} đ` : data.tongGiaTri) : '25.000.000 đ',
        '@tongGiamGia': data.tongGiamGia ? (typeof data.tongGiamGia === 'number' ? `${data.tongGiamGia.toLocaleString('vi-VN')} đ` : data.tongGiamGia) : '2.000.000 đ',
        '@tongTien': data.tongTien ? (typeof data.tongTien === 'number' ? `${data.tongTien.toLocaleString('vi-VN')} đ` : data.tongTien) : '23.000.000 đ',
        '@datCoc': data.datCoc ? (typeof data.datCoc === 'number' ? `${data.datCoc.toLocaleString('vi-VN')} đ` : data.datCoc) : '5.000.000 đ',
        '@daThanhToan': data.daThanhToan ? (typeof data.daThanhToan === 'number' ? `${data.daThanhToan.toLocaleString('vi-VN')} đ` : data.daThanhToan) : '15.000.000 đ',
        '@conLai': data.conLai ? (typeof data.conLai === 'number' ? `${data.conLai.toLocaleString('vi-VN')} đ` : data.conLai) : '8.000.000 đ',
        '@tenStudio': config?.studioName || 'LONG WEDDING',
        '@hotlineStudio': config?.studioHotline || '0868 66 3637',
        '@diaChiStudio': config?.studioAddress || 'số 129 đường 1/5, xóm Tân Hồng, Xã Nghĩa Đàn, Nghệ An',
        '@websiteStudio': config?.studioWebsite || 'longwedding.vn',
        '@maHopDong': data.maHopDong || 'HD-2025-DEMO'
    };

    let result = text;
    for (const [key, val] of Object.entries(paramsMap)) {
        result = result.split(key).join(val !== undefined && val !== null ? val : '');
    }
    return result;
};

// Helper định dạng ngày giờ hiển thị cho lịch phân công
export const formatScheduleDateTime = (val) => {
    if (!val) return '';
    try {
        const str = String(val).trim();
        if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) {
            return str;
        }
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            if (hours !== '00' || minutes !== '00') {
                return `${hours}:${minutes} - ${day}/${month}/${year}`;
            }
            return `${day}/${month}/${year}`;
        }
    } catch (e) { }
    return String(val);
};

// Helper định dạng ngày tháng hiển thị cho các lượt thanh toán
export const formatPaymentDate = (val) => {
    if (!val) return '';
    try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            if (hours !== '00' || minutes !== '00') {
                return `${hours}:${minutes} ${day}/${month}/${year}`;
            }
            return `${day}/${month}/${year}`;
        }
    } catch (e) { }
    return String(val);
};

export const getDefaultContractPrintConfig = () => ({
    studioName: "LONG WEDDING",
    studioAddress: "số 129 đường 1/5, xóm Tân Hồng, Xã Nghĩa Đàn, Nghệ An",
    studioHotline: "0868 66 3637",
    studioWebsite: "longwedding.vn",
    contractTitle: "HỢP ĐỒNG CUNG CẤP DỊCH VỤ CƯỚI",
    contractSubtitle: "Tại Long Wedding, số 129 đường 1/5, xóm Tân Hồng, Xã Nghĩa Đàn, Nghệ An",
    primaryColor: "#c28e2b",
    clientSignTitle: "KHÁCH HÀNG",
    clientSignSubtitle: "(Ký và ghi rõ Họ và Tên)",
    studioSignTitle: "ĐẠI DIỆN LONGWEDDING",
    studioSignSubtitle: "(Ký và ghi rõ Họ và Tên)",
    footerNote: "Trân trọng cảm ơn Quý khách hàng đã tin tưởng và đồng hành cùng Long Wedding!",
    showTeamStaff: false,
    terms: [
        "Những sản phẩm không sử dụng không quy đổi thành tiền mặt hoặc hiện vật.",
        "Trang phục được mượn 5 ngày, quá thời hạn sẽ phát sinh thêm chi phí thuê, khách ở tỉnh xa sẽ tạo điều kiện trả muộn.",
        "Đền 100% giá trị Váy Cưới nếu như làm rách, cháy, đổ rượu vang lên váy.",
        "CDCR làm việc với nhà rạp nếu có bật đèn LAZE, cửa hàng sẽ dừng làm việc vì laze quét sẽ hỏng luôn máy.",
        "Nếu như có thắc mắc hoặc chưa hiểu, khách hàng nhắn tin hoặc gọi điện vào hotline: @hotlineStudio",
        "Cửa hàng sẽ không trả lại tiền đặt cọc khi khách hàng hủy hợp đồng."
    ]
});

export const getDefaultLoanReceiptPrintConfig = () => ({
    studioName: "LONG WEDDING",
    studioAddress: "số 129 đường 1/5, xóm Tân Hồng, Xã Nghĩa Đàn, Nghệ An",
    studioHotline: "0868 66 3637",
    studioWebsite: "longwedding.vn",
    loanTitle: "PHIẾU BÀN GIAO & MƯỢN TRANG PHỤC",
    returnTitle: "PHIẾU TIẾP NHẬN & TRẢ TRANG PHỤC",
    primaryColor: "#c28e2b",
    showItemCode: true,
    showUpgradePrice: true,
    showNoteColumn: true,
    loanClientSignTitle: "KHÁCH HÀNG",
    loanClientSignSubtitle: "(Ký và ghi rõ Họ và Tên)",
    loanStaffSignTitle: "ĐẠI DIỆN LONGWEDDING",
    loanStaffSignSubtitle: "(Ký và ghi rõ Họ và Tên)",
    returnClientSignTitle: "KHÁCH HÀNG",
    returnClientSignSubtitle: "(Ký và ghi rõ Họ và Tên)",
    returnStaffSignTitle: "ĐẠI DIỆN LONGWEDDING",
    returnStaffSignSubtitle: "(Ký và ghi rõ Họ và Tên)",
    loanTerms: [
        "Khách hàng vui lòng kiểm tra kỹ hiện trạng số lượng trang phục, phụ kiện đính kèm trước khi nhận bàn giao.",
        "Trang phục được mượn 5 ngày, quá thời hạn sẽ phát sinh thêm chi phí thuê theo quy định (khách ở tỉnh xa sẽ tạo điều kiện trả muộn).",
        "Đền 100% giá trị Váy Cưới / Trang phục nếu làm hư hỏng, rách, cháy hoặc đổ rượu vang lên đồ.",
        "Vui lòng bảo quản đồ cẩn thận, không tự ý giặt sấy bằng hóa chất tẩy mạnh làm hỏng form dáng trang phục.",
        "Nếu có thắc mắc hoặc cần hỗ trợ trả đồ muộn, vui lòng liên hệ hotline: 0868.66.3637."
    ],
    returnTerms: [
        "Nhân viên studio đã tiến hành kiểm tra đầy đủ số lượng và hiện trạng trang phục, phụ kiện bàn giao lại.",
        "Khách hàng đã hoàn tất nghĩa vụ bàn giao và thanh toán các khoản phụ phí phát sinh (nếu có).",
        "Cửa hàng tiến hành hoàn trả tiền đặt cọc giữ đồ cho khách hàng theo đúng quy định cam kết."
    ],
    footerNote: "Trân trọng cảm ơn Quý khách hàng đã tin tưởng lựa chọn Long Wedding!"
});

// Lấy cấu hình Hợp đồng
export const getContractPrintConfig = () => {
    try {
        const saved = localStorage.getItem(CONTRACT_PRINT_CONFIG_KEY);
        if (saved) {
            return { ...getDefaultContractPrintConfig(), ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error("Lỗi đọc cấu hình in hợp đồng:", e);
    }
    return getDefaultContractPrintConfig();
};

// Lưu cấu hình Hợp đồng
export const saveContractPrintConfig = (config) => {
    try {
        localStorage.setItem(CONTRACT_PRINT_CONFIG_KEY, JSON.stringify(config));
        return true;
    } catch (e) {
        console.error("Lỗi lưu cấu hình in hợp đồng:", e);
        return false;
    }
};

// Khôi phục mặc định Hợp đồng
export const resetContractPrintConfig = () => {
    try {
        localStorage.removeItem(CONTRACT_PRINT_CONFIG_KEY);
    } catch (e) { }
    return getDefaultContractPrintConfig();
};

// Lấy cấu hình Phiếu mượn / trả đồ
export const getLoanReceiptPrintConfig = () => {
    try {
        const saved = localStorage.getItem(LOAN_RECEIPT_PRINT_CONFIG_KEY);
        if (saved) {
            return { ...getDefaultLoanReceiptPrintConfig(), ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error("Lỗi đọc cấu hình in phiếu mượn/trả:", e);
    }
    return getDefaultLoanReceiptPrintConfig();
};

// Lưu cấu hình Phiếu mượn / trả đồ
export const saveLoanReceiptPrintConfig = (config) => {
    try {
        localStorage.setItem(LOAN_RECEIPT_PRINT_CONFIG_KEY, JSON.stringify(config));
        return true;
    } catch (e) {
        console.error("Lỗi lưu cấu hình in phiếu mượn/trả:", e);
        return false;
    }
};

// Khôi phục mặc định Phiếu mượn / trả đồ
export const resetLoanReceiptPrintConfig = () => {
    try {
        localStorage.removeItem(LOAN_RECEIPT_PRINT_CONFIG_KEY);
    } catch (e) { }
    return getDefaultLoanReceiptPrintConfig();
};

/**
 * Helper trích xuất thông tin hợp đồng thực tế từ Cart (Giỏ hàng) và các trường dữ liệu
 * để đưa vào bản in chuẩn 100% khớp với mẫu thiết kế
 */
export const extractContractPrintData = (rawContract = {}, cart = [], totals = {}) => {
    let goiPreWedding = '';
    let giaPreWedding = '';
    let goiPhongSu = '';
    let giaPhongSu = '';
    let goiQuayPhim = '';
    let giaQuayPhim = '';
    let trangDiemLuot = '';
    let ngayTrangDiem = '';
    let trangDiemThem = '';
    const otherServices = [];

    // 1. Chuẩn hóa danh sách giỏ hàng chi tiết cho mục 2.1
    let sourceCart = [];
    if (Array.isArray(cart) && cart.length > 0) {
        sourceCart = cart;
    } else if (Array.isArray(rawContract.gioHang) && rawContract.gioHang.length > 0) {
        sourceCart = rawContract.gioHang;
    } else if (Array.isArray(rawContract.danhSachDichVu) && rawContract.danhSachDichVu.length > 0) {
        sourceCart = rawContract.danhSachDichVu;
    } else if (Array.isArray(rawContract.cartItems) && rawContract.cartItems.length > 0) {
        sourceCart = rawContract.cartItems;
    }
    const cartItems = sourceCart;

    const processedCartItems = sourceCart.map((item, idx) => {
        const name = (item.tenDichVuSnapshot || item.tenDichVu || item.dichVu?.tenDichVu || item.name || `Dịch vụ ${idx + 1}`).trim();
        const soLuong = Number(item.soLuong || 1);

        let donGia = 0;
        if (item.donGia !== undefined && item.donGia !== null && item.donGia !== '') {
            donGia = parseFloat(String(item.donGia).replace(/[^0-9.-]+/g, "")) || 0;
        } else if (item.giaChoThueDichVu !== undefined && item.giaChoThueDichVu !== null && item.giaChoThueDichVu !== '') {
            donGia = parseFloat(String(item.giaChoThueDichVu).replace(/[^0-9.-]+/g, "")) || 0;
        } else if (item.dichVu?.giaChoThueDichVu !== undefined) {
            donGia = parseFloat(String(item.dichVu.giaChoThueDichVu).replace(/[^0-9.-]+/g, "")) || 0;
        } else if (item.gia !== undefined) {
            donGia = parseFloat(String(item.gia).replace(/[^0-9.-]+/g, "")) || 0;
        }

        let giamGia = 0;
        if (item.giamGiaDichVu !== undefined && item.giamGiaDichVu !== null) {
            giamGia = parseFloat(String(item.giamGiaDichVu).replace(/[^0-9.-]+/g, "")) || 0;
        } else if (item.giamGia !== undefined && item.giamGia !== null) {
            giamGia = parseFloat(String(item.giamGia).replace(/[^0-9.-]+/g, "")) || 0;
        }

        let thanhTien = 0;
        if (item.thanhTien !== undefined && item.thanhTien !== null && item.thanhTien !== '') {
            thanhTien = parseFloat(String(item.thanhTien).replace(/[^0-9.-]+/g, "")) || 0;
        } else {
            thanhTien = Math.max(0, (donGia * soLuong) - giamGia);
        }

        return {
            tenDichVu: name,
            soLuong,
            donGia,
            giamGia,
            thanhTien,
            donGiaFormatted: donGia ? `${donGia.toLocaleString('vi-VN')} đ` : '0 đ',
            giamGiaFormatted: giamGia > 0 ? `${giamGia.toLocaleString('vi-VN')} đ` : '0 đ',
            thanhTienFormatted: thanhTien ? `${thanhTien.toLocaleString('vi-VN')} đ` : '0 đ'
        };
    });

    // Trích xuất các gói chụp/phóng sự/quay phim phục vụ thông tin bổ trợ nếu cần
    sourceCart.forEach(item => {
        const name = (item.tenDichVuSnapshot || item.tenDichVu || '').trim();
        const lower = name.toLowerCase();
        const price = Number(item.thanhTien ?? (item.donGia ?? item.giaChoThueDichVu ?? 0));
        const priceStr = price ? `${price.toLocaleString('vi-VN')} đ` : '';

        if (!goiPreWedding && (lower.includes('pre-wedding') || lower.includes('chụp ảnh cưới') || lower.includes('chụp cưới') || lower.includes('studio') || lower.includes('ngoại cảnh') || lower.includes('gói'))) {
            goiPreWedding = name;
            giaPreWedding = priceStr;
        } else if (!goiPhongSu && (lower.includes('phóng sự') || lower.includes('ps') || lower.includes('ảnh cưới'))) {
            goiPhongSu = name;
            giaPhongSu = priceStr;
        } else if (!goiQuayPhim && (lower.includes('quay phim') || lower.includes('quay') || lower.includes('highlight') || lower.includes('video'))) {
            goiQuayPhim = name;
            giaQuayPhim = priceStr;
        } else if (lower.includes('trang điểm') || lower.includes('makeup') || item.loaiDichVu === 4) {
            trangDiemLuot = item.soLuot || item.soLuong || '02';
            ngayTrangDiem = item.ngayTrangDiem || 'Ngày cưới & Ăn hỏi';
            trangDiemThem = item.ghiChuTrangDiem || name;
        } else {
            otherServices.push({
                name,
                soLuong: item.soLuong || 1,
                gia: priceStr
            });
        }
    });

    // Fallback: nếu không có giỏ hàng, tái hiện từ các gói hoặc otherServices
    if (processedCartItems.length === 0) {
        if (rawContract.goiPreWedding) {
            const p = parseFloat(String(rawContract.giaPreWedding || 0).replace(/[^0-9.-]+/g, "")) || 0;
            processedCartItems.push({
                tenDichVu: `Chụp ảnh Pre-Wedding: ${rawContract.goiPreWedding}`,
                soLuong: 1,
                donGia: p,
                giamGia: 0,
                thanhTien: p,
                donGiaFormatted: p ? `${p.toLocaleString('vi-VN')} đ` : '0 đ',
                giamGiaFormatted: '0 đ',
                thanhTienFormatted: p ? `${p.toLocaleString('vi-VN')} đ` : '0 đ'
            });
        }
        if (rawContract.goiPhongSu) {
            const p = parseFloat(String(rawContract.giaPhongSu || 0).replace(/[^0-9.-]+/g, "")) || 0;
            processedCartItems.push({
                tenDichVu: `Chụp ảnh Phóng sự Cưới: ${rawContract.goiPhongSu}`,
                soLuong: 1,
                donGia: p,
                giamGia: 0,
                thanhTien: p,
                donGiaFormatted: p ? `${p.toLocaleString('vi-VN')} đ` : '0 đ',
                giamGiaFormatted: '0 đ',
                thanhTienFormatted: p ? `${p.toLocaleString('vi-VN')} đ` : '0 đ'
            });
        }
        if (rawContract.goiQuayPhim) {
            const p = parseFloat(String(rawContract.giaQuayPhim || 0).replace(/[^0-9.-]+/g, "")) || 0;
            processedCartItems.push({
                tenDichVu: `Quay phim Phóng sự Cưới: ${rawContract.goiQuayPhim}`,
                soLuong: 1,
                donGia: p,
                giamGia: 0,
                thanhTien: p,
                donGiaFormatted: p ? `${p.toLocaleString('vi-VN')} đ` : '0 đ',
                giamGiaFormatted: '0 đ',
                thanhTienFormatted: p ? `${p.toLocaleString('vi-VN')} đ` : '0 đ'
            });
        }
        if (Array.isArray(rawContract.otherServices)) {
            rawContract.otherServices.forEach(os => {
                const sl = Number(os.soLuong || 1);
                const p = parseFloat(String(os.gia || 0).replace(/[^0-9.-]+/g, "")) || 0;
                processedCartItems.push({
                    tenDichVu: os.name || 'Dịch vụ bổ sung',
                    soLuong: sl,
                    donGia: p,
                    giamGia: 0,
                    thanhTien: p * sl,
                    donGiaFormatted: p ? `${p.toLocaleString('vi-VN')} đ` : '0 đ',
                    giamGiaFormatted: '0 đ',
                    thanhTienFormatted: (p * sl) ? `${(p * sl).toLocaleString('vi-VN')} đ` : '0 đ'
                });
            });
        }
    }

    const tongTienDichVu = processedCartItems.reduce((sum, item) => sum + (item.thanhTien || 0), 0);
    const tongTienDichVuFormatted = tongTienDichVu ? `${tongTienDichVu.toLocaleString('vi-VN')} đ` : '0 đ';

    // Nếu không tìm thấy gói riêng lẻ nhưng giỏ hàng có dịch vụ, dùng dịch vụ đầu tiên làm Pre-Wedding
    if (!goiPreWedding && sourceCart.length > 0) {
        goiPreWedding = sourceCart[0].tenDichVuSnapshot || sourceCart[0].tenDichVu || '';
        const price = Number(sourceCart[0].thanhTien ?? (sourceCart[0].donGia ?? sourceCart[0].giaChoThueDichVu ?? 0));
        giaPreWedding = price ? `${price.toLocaleString('vi-VN')} đ` : '';
    }

    // Xác định trạng thái trang điểm trong gói: Ngày ăn hỏi: (có/không), Trang điểm ngày cưới: (có/không)
    let rawAnHoi = rawContract.trangDiemNgayAnHoi || totals.trangDiemNgayAnHoi;
    let rawCuoi = rawContract.trangDiemNgayCuoi || totals.trangDiemNgayCuoi;

    if (!rawAnHoi && cartItems.length > 0) {
        const found = cartItems.find(i => i.trangDiemNgayAnHoi && i.trangDiemNgayAnHoi !== 'Không có');
        if (found) rawAnHoi = found.trangDiemNgayAnHoi;
    }
    if (!rawCuoi && cartItems.length > 0) {
        const found = cartItems.find(i => i.trangDiemNgayCuoi && i.trangDiemNgayCuoi !== 'Không có');
        if (found) rawCuoi = found.trangDiemNgayCuoi;
    }

    let trangDiemNgayAnHoi = formatMakeupStatus(rawAnHoi);
    let trangDiemNgayCuoi = formatMakeupStatus(rawCuoi);

    // Kiểm tra thêm các dịch vụ trang điểm độc lập trong giỏ hàng nếu chưa có
    if (trangDiemNgayAnHoi === 'Không') {
        const hasAnHoiMakeup = cartItems.some(item => {
            const n = (item.tenDichVuSnapshot || item.tenDichVu || '').toLowerCase();
            return (n.includes('trang điểm') || n.includes('makeup')) && (n.includes('ăn hỏi') || n.includes('an hoi'));
        });
        if (hasAnHoiMakeup) trangDiemNgayAnHoi = 'Có';
    }
    if (trangDiemNgayCuoi === 'Không') {
        const hasCuoiMakeup = cartItems.some(item => {
            const n = (item.tenDichVuSnapshot || item.tenDichVu || '').toLowerCase();
            return (n.includes('trang điểm') || n.includes('makeup')) && (n.includes('cưới') || n.includes('cuoi'));
        });
        if (hasCuoiMakeup) trangDiemNgayCuoi = 'Có';
    }

    // Trang điểm mặc định nếu có ghi nhận trong totals
    if (!trangDiemLuot && (totals.trangDiemNgayAnHoi || totals.trangDiemNgayCuoi)) {
        trangDiemLuot = '02';
        ngayTrangDiem = 'Ngày cưới & Ăn hỏi';
        trangDiemThem = [totals.trangDiemNgayAnHoi, totals.trangDiemNgayCuoi].filter(Boolean).join(', ');
    }

    // Tính toán tài chính đầy đủ
    const cartItemsList = processedCartItems;
    let sumCartGoc = 0;
    let sumCartGiam = 0;
    cartItemsList.forEach(item => {
        const sl = Number(item.soLuong || 1);
        const dg = Number(item.donGia || 0);
        const gg = Number(item.giamGia || 0);
        sumCartGoc += dg * sl;
        sumCartGiam += gg;
    });

    const tongTien = Number(rawContract.tongTien ?? (rawContract.thanhToan?.tongGiaTriSauGiam ?? rawContract.thanhToan?.tongGiaTri ?? Math.max(0, sumCartGoc - sumCartGiam)));

    let tongGiaTri = Number(rawContract.tongGiaTriDonHang ?? rawContract.tongGocDonHang ?? rawContract.thanhToan?.tongGiaTri ?? sumCartGoc);
    if (!tongGiaTri || tongGiaTri < tongTien) {
        tongGiaTri = tongTien;
    }

    const voucherGiamGia = Number(rawContract.voucherGiamGia ?? rawContract.thanhToan?.voucherGiamGia ?? 0);
    const giamGiaDonHang = Number(rawContract.giamGiaDonHang ?? rawContract.giamGia ?? rawContract.thanhToan?.giamGia ?? 0);
    let tongGiamGia = Math.max(0, tongGiaTri - tongTien);
    if (tongGiamGia === 0 && (voucherGiamGia > 0 || giamGiaDonHang > 0 || sumCartGiam > 0)) {
        tongGiamGia = voucherGiamGia + giamGiaDonHang + sumCartGiam;
        if (tongGiaTri === tongTien && tongGiamGia > 0) {
            tongGiaTri = tongTien + tongGiamGia;
        }
    }

    let cacLuotThanhToan = [];
    if (Array.isArray(rawContract.cacLuotThanhToan) && rawContract.cacLuotThanhToan.length > 0) {
        cacLuotThanhToan = [...rawContract.cacLuotThanhToan];
    } else if (Array.isArray(rawContract.thanhToan?.cacLuotThanhToan) && rawContract.thanhToan.cacLuotThanhToan.length > 0) {
        cacLuotThanhToan = [...rawContract.thanhToan.cacLuotThanhToan];
    }

    const sumPayments = cacLuotThanhToan.reduce((s, p) => s + (Number(p.amount ?? p.soTien) || 0), 0);
    let daThanhToan = Number(rawContract.daThanhToan ?? (rawContract.thanhToan?.khachHangDaThanhToan ?? rawContract.khachThanhToan ?? sumPayments));
    if (sumPayments > 0 && daThanhToan < sumPayments) {
        daThanhToan = sumPayments;
    }

    if (cacLuotThanhToan.length === 0 && daThanhToan > 0) {
        cacLuotThanhToan = [{
            date: rawContract.ngayLapHopDongFormatted || new Date().toISOString(),
            amount: daThanhToan,
            method: rawContract.hinhThucThanhToan || rawContract.methodPayment || 'Tiền mặt',
            noiDung: 'Đặt cọc / Thanh toán hợp đồng'
        }];
    }

    const conLai = Math.max(0, tongTien - daThanhToan);
    const datCoc = Number(rawContract.datCoc ?? (cacLuotThanhToan[0]?.amount ?? daThanhToan ?? 0));

    const tongGiaTriFormatted = tongGiaTri ? `${tongGiaTri.toLocaleString('vi-VN')} đ` : (tongTien ? `${tongTien.toLocaleString('vi-VN')} đ` : '.................... đ');
    const tongGiamGiaFormatted = tongGiamGia > 0 ? `${tongGiamGia.toLocaleString('vi-VN')} đ` : '0 đ';
    const daThanhToanFormatted = daThanhToan > 0 ? `${daThanhToan.toLocaleString('vi-VN')} đ` : '0 đ';
    const conLaiFormatted = conLai > 0 ? `${conLai.toLocaleString('vi-VN')} đ` : '0 đ';

    // 2. Chuẩn bị danh sách lịch trình & phân công cho mục 2.3
    let rawSchedules = [];
    if (Array.isArray(rawContract.serviceSchedules) && rawContract.serviceSchedules.length > 0) {
        rawSchedules = rawContract.serviceSchedules;
    } else if (Array.isArray(rawContract.lichTrangDiem) || Array.isArray(rawContract.lichChup)) {
        const combined = [];
        if (Array.isArray(rawContract.lichChup)) {
            rawContract.lichChup.forEach((lc, idx) => {
                combined.push({
                    serviceName: lc.tenDichVu || 'Lịch Chụp Ảnh',
                    serviceType: 'photo',
                    luot: idx + 1,
                    ngayGio: lc.ngayGio || lc.ngayChup,
                    diaDiem: lc.diaDiem || lc.diaDiemChup || rawContract.diaDiemChup || rawContract.cacNgay?.diaDiemChup || 'Tại Studio',
                    nhanVien: lc.nhanVien || lc.thoChupHinh || rawContract.thoChupHinh || rawContract.nguoiPhucVu?.thoChupHinh || '',
                    ghiChu: lc.ghiChu || ''
                });
            });
        }
        if (Array.isArray(rawContract.lichTrangDiem)) {
            rawContract.lichTrangDiem.forEach((lt, idx) => {
                combined.push({
                    serviceName: lt.tenDichVu || 'Lịch Trang Điểm',
                    serviceType: 'makeup',
                    luot: idx + 1,
                    ngayGio: lt.ngayGio || lt.ngayTrangDiem,
                    diaDiem: lt.diaDiem || lt.diaDiemTrangDiem || rawContract.cacNgay?.diaDiemTrangDiem || 'Tại Studio',
                    nhanVien: lt.nhanVien || lt.thoMakeUp || rawContract.thoMakeUp || rawContract.nguoiPhucVu?.thoMakeUp || '',
                    ghiChu: lt.ghiChu || ''
                });
            });
        }
        rawSchedules = combined;
    }

    // Nếu chưa có lịch phân công chi tiết, fallback xây dựng từ mốc ngày & thợ phân công trên hợp đồng
    if (rawSchedules.length === 0) {
        const fallbackList = [];
        const ngayChupVal = rawContract.ngayChupFormatted || rawContract.cacNgay?.ngayChup || rawContract.ngayChup;
        const thoChup = rawContract.thoChupHinh || rawContract.nguoiPhucVu?.thoChupHinh || '';
        if (ngayChupVal || thoChup) {
            fallbackList.push({
                serviceName: 'Lịch Chụp Ảnh Cưới',
                serviceType: 'photo',
                luot: 1,
                ngayGio: ngayChupVal,
                diaDiem: rawContract.diaDiemChup || rawContract.cacNgay?.diaDiemChup || 'Tại Studio',
                nhanVien: thoChup,
                ghiChu: ''
            });
        }

        const ngayAnHoiVal = rawContract.ngayAnHoiFormatted || rawContract.cacNgay?.ngayAnHoi || rawContract.ngayAnHoi;
        const thoMake = rawContract.thoMakeUp || rawContract.nguoiPhucVu?.thoMakeUp || '';
        if (ngayAnHoiVal || trangDiemNgayAnHoi === 'Có') {
            fallbackList.push({
                serviceName: 'Lịch Trang Điểm / Lễ Ăn Hỏi',
                serviceType: 'makeup',
                luot: 1,
                ngayGio: ngayAnHoiVal,
                diaDiem: 'Nhà gái / Studio',
                nhanVien: thoMake,
                ghiChu: trangDiemNgayAnHoi === 'Có' ? 'Có trang điểm' : ''
            });
        }

        const ngayCuoiVal = rawContract.ngayCuoiFormatted || rawContract.cacNgay?.ngayCuoi || rawContract.ngayCuoi;
        if (ngayCuoiVal || trangDiemNgayCuoi === 'Có') {
            fallbackList.push({
                serviceName: 'Lịch Trang Điểm / Lễ Cưới Chính',
                serviceType: 'makeup',
                luot: 2,
                ngayGio: ngayCuoiVal,
                diaDiem: 'Nhà gái / Studio',
                nhanVien: thoMake,
                ghiChu: trangDiemNgayCuoi === 'Có' ? 'Có trang điểm' : ''
            });
        }

        const ngayTraAnhVal = rawContract.ngayTraAnhFormatted || rawContract.cacNgay?.ngayTraAnh || rawContract.ngayTraAnh;
        const thoChinh = rawContract.thoChinhAnh || rawContract.nguoiPhucVu?.thoChinhAnh || '';
        if (ngayTraAnhVal || thoChinh) {
            fallbackList.push({
                serviceName: 'Hậu kỳ & Bàn Giao Trả Ảnh',
                serviceType: 'photo',
                luot: 1,
                ngayGio: ngayTraAnhVal,
                diaDiem: 'Tại Studio / Online',
                nhanVien: thoChinh,
                ghiChu: 'Hoàn thiện file in & album'
            });
        }

        rawSchedules = fallbackList;
    }

    const processedSchedules = rawSchedules.map((sch, idx) => {
        let nhanVien = sch.nhanVien || '';
        if (!nhanVien || nhanVien === '0') {
            if (sch.serviceType === 'photo') {
                nhanVien = rawContract.thoChupHinh || rawContract.nguoiPhucVu?.thoChupHinh || '';
            } else if (sch.serviceType === 'makeup') {
                nhanVien = rawContract.thoMakeUp || rawContract.nguoiPhucVu?.thoMakeUp || '';
            }
        }
        if (!nhanVien || nhanVien === '0') {
            nhanVien = 'Chưa phân công';
        }

        return {
            stt: idx + 1,
            serviceName: sch.serviceName || `Lịch trình ca ${idx + 1}`,
            serviceType: sch.serviceType || 'other',
            luot: sch.luot || (idx + 1),
            ngayGio: sch.ngayGio ? formatScheduleDateTime(sch.ngayGio) : 'Chưa xếp lịch',
            diaDiem: sch.diaDiem || 'Tại Studio',
            nhanVien,
            ghiChu: sch.ghiChu || '-'
        };
    });

    const ngayTraAnhFormatted = rawContract.ngayTraAnhFormatted || 
        (rawContract.ngayTraAnh ? formatScheduleDateTime(rawContract.ngayTraAnh) : 
        (rawContract.cacNgay?.ngayTraAnh ? formatScheduleDateTime(rawContract.cacNgay.ngayTraAnh) : ''));

    const thoChupHinh = rawContract.thoChupHinh || rawContract.nguoiPhucVu?.thoChupHinh || '';
    const thoMakeUp = rawContract.thoMakeUp || rawContract.nguoiPhucVu?.thoMakeUp || '';
    const thoChinhAnh = rawContract.thoChinhAnh || rawContract.nguoiPhucVu?.thoChinhAnh || '';
    const nhanVienSale = (rawContract.nhanVienSale && rawContract.nhanVienSale !== '0') ? rawContract.nhanVienSale : (rawContract.nguoiPhucVu?.banHang || '');

    return {
        maHopDong: rawContract.maHopDong,
        ngayLapHopDongFormatted: rawContract.ngayLapHopDongFormatted || rawContract.ngayHDFormatted,
        nameKH1: rawContract.nameKH1 || rawContract.khachHang1?.tenKhachHang || '',
        nameKH2: rawContract.nameKH2 || rawContract.khachHang2?.tenKhachHang || '',
        phoneKH1: rawContract.phoneKH1 || rawContract.khachHang1?.soDienThoai || '',
        phoneKH2: rawContract.phoneKH2 || rawContract.khachHang2?.soDienThoai || '',
        addressKH1: rawContract.addressKH1 || rawContract.khachHang1?.diaChi || '',
        addressKH2: rawContract.addressKH2 || rawContract.khachHang2?.diaChi || '',

        goiPreWedding,
        giaPreWedding,
        goiPhongSu,
        giaPhongSu,
        goiQuayPhim,
        giaQuayPhim,
        trangDiemLuot,
        ngayTrangDiem,
        trangDiemThem,
        trangDiemNgayAnHoi,
        trangDiemNgayCuoi,
        otherServices,

        ngayChupFormatted: rawContract.ngayChupFormatted,
        ngayAnHoiFormatted: rawContract.ngayAnHoiFormatted,
        ngayCuoiFormatted: rawContract.ngayCuoiFormatted,
        ngayTraAnhFormatted,
        diaDiemChup: rawContract.diaDiemChup || rawContract.cacNgay?.diaDiemChup || '',
        thoChupHinh,
        thoMakeUp,
        thoChinhAnh,
        nhanVienSale,
        chotLich: rawContract.chotLich || rawContract.cacNgay?.chotLich || '',
        serviceSchedules: processedSchedules,

        totals,
        soLuongAnh60x90: totals.soLuongAnh60x90 || rawContract.soLuongAnh60x90,
        soLuongAnh20x30: totals.soLuongAnh20x30 || rawContract.soLuongAnh20x30,
        soLuongAnh16x21: totals.soLuongAnh16x21 || rawContract.soLuongAnh16x21,
        soLuongAnhChinhSua: totals.soLuongAnhChinhSua || rawContract.soLuongAnhChinhSua,
        albumTrang: totals.albumTrang || rawContract.albumTrang || 0,
        aoDaiAnHoi: rawContract.aoDaiAnHoi || totals.trangPhucCoDauNgayAnHoi,
        trangPhucChuReNgayAnHoi: rawContract.trangPhucChuReNgayAnHoi || totals.trangPhucChuReNgayAnHoi,
        vayCuoi: rawContract.vayCuoi || totals.trangPhucVayCuoiNgayCuoi,
        beTrap: rawContract.beTrap || totals.trangPhucChoDoiBeLe,
        vestNgayCuoi: rawContract.vestNgayCuoi || totals.trangPhucVestChuReNgayCuoi,
        hoaCamTay: rawContract.hoaCamTay || totals.hoaCamTay,
        cartItems: processedCartItems,
        tongTienDichVu,
        tongTienDichVuFormatted,

        tongGiaTri,
        tongGiaTriFormatted,
        tongGiamGia,
        tongGiamGiaFormatted,
        tongTien,
        datCoc,
        daThanhToan,
        daThanhToanFormatted,
        conLai,
        conLaiFormatted,
        cacLuotThanhToan
    };
};

/**
 * Hàm sinh HTML in hợp đồng chuẩn 100% theo mẫu thiết kế có Logo, Section I, II, III, IV
 */
export const generateContractPrintHtml = (data = {}, customConfig = null) => {
    const config = customConfig || getContractPrintConfig();
    const logoSrc = getSafePrintLogo();

    const maHopDong = data.maHopDong || '................................';
    const ngayHDFormatted = data.ngayLapHopDongFormatted || data.ngayHDFormatted || '......./......../ 2025';

    const rawCoDau = data.nameKH1 || data.khachHang1?.tenKhachHang || '';
    const rawChuRe = data.nameKH2 || data.khachHang2?.tenKhachHang || '';
    const coDau = rawCoDau ? (rawCoDau.includes('(') ? rawCoDau : `${rawCoDau} (Cô Dâu)`) : '...................................................';
    const chuRe = rawChuRe ? (rawChuRe.includes('(') ? rawChuRe : `${rawChuRe} (Chú Rể)`) : '...................................................';
    const sdtCoDau = data.phoneKH1 || data.khachHang1?.soDienThoai || '...................................................';
    const sdtChuRe = data.phoneKH2 || data.khachHang2?.soDienThoai || '...................................................';
    const dcCoDau = data.addressKH1 || data.khachHang1?.diaChi || '...................................................';
    const dcChuRe = data.addressKH2 || data.khachHang2?.diaChi || '...................................................';

    const ngayChup = data.ngayChupFormatted || '';
    const ngayAnHoi = data.ngayAnHoiFormatted || '';
    const ngayCuoi = data.ngayCuoiFormatted || '';
    const ngayTraAnh = data.ngayTraAnhFormatted || '';
    const diaDiemChup = data.diaDiemChup || '';
    const thoChupHinh = data.thoChupHinh || '';
    const thoMakeUp = data.thoMakeUp || '';
    const thoChinhAnh = data.thoChinhAnh || '';
    const nhanVienSale = data.nhanVienSale || '';
    const serviceSchedules = Array.isArray(data.serviceSchedules) ? data.serviceSchedules : [];

    const totals = data.totals || {};

    // Trích xuất các mục quy cách chi tiết đính kèm hợp đồng (Phần nào Có thì hiện, không thì không hiển thị)
    const isMeaningful = (val) => {
        if (val === undefined || val === null) return false;
        if (typeof val === 'number') return val > 0;
        const s = String(val).trim().toLowerCase();
        return s !== '' && s !== 'không có' && s !== 'khong co' && s !== 'không' && s !== 'khong' && s !== 'null' && s !== 'undefined' && s !== '0' && s !== 'false' && s !== 'k' && s !== 'kc';
    };

    const packageItems = [];

    // 1. Ảnh phóng & để bàn
    const slChinhSua = Number(totals.soLuongAnhChinhSua ?? data.soLuongAnhChinhSua ?? 0);
    if (slChinhSua > 0) {
        packageItems.push({
            label: 'SL ảnh chỉnh sửa',
            value: `${slChinhSua} ảnh hoàn thiện`
        });
    }

    // Trích xuất sản phẩm bàn giao (Deliverables động hoặc legacy)
    const dynamicDeliverables = [];
    const sourceCart = Array.isArray(data.cartItems) ? data.cartItems : (Array.isArray(data.gioHang) ? data.gioHang : []);
    sourceCart.forEach(item => {
        const rawItem = item._raw || item;
        const dels = rawItem.detailsSnapshot?.deliverables || rawItem.details?.deliverables;
        if (Array.isArray(dels)) {
            dels.forEach(d => {
                const qty = (Number(d.quantity) || 0) * (Number(item.soLuong) || 1);
                // AC-05: Số lượng = 0 không xuất hiện trên hợp đồng
                if (qty > 0) {
                    const kindName = d.kind === 'photo_table' ? 'Ảnh để bàn' : (d.kind === 'album' ? 'Album Photobook' : (d.kind === 'frame' ? 'Khung ảnh' : 'Ảnh'));
                    const title = d.name || `${kindName} ${d.widthCm}x${d.heightCm}`;
                    dynamicDeliverables.push({
                        label: title,
                        value: `${qty} cái ${d.material ? `(${d.material})` : ''}`.trim()
                    });
                }
            });
        }
    });

    if (dynamicDeliverables.length > 0) {
        packageItems.push(...dynamicDeliverables);
    } else {
        const sl16 = Number(totals.soLuongAnh16x21 ?? data.soLuongAnh16x21 ?? 0);
        if (sl16 > 0) {
            packageItems.push({
                label: 'Ảnh 16x21',
                value: `${sl16} cái`
            });
        }

        const sl20 = Number(totals.soLuongAnh20x30 ?? data.soLuongAnh20x30 ?? 0);
        if (sl20 > 0) {
            packageItems.push({
                label: 'Ảnh để bàn 20x30',
                value: `${sl20} cái`
            });
        }

        const sl60 = Number(totals.soLuongAnh60x90 ?? data.soLuongAnh60x90 ?? 0);
        if (sl60 > 0) {
            packageItems.push({
                label: 'Ảnh 60x90',
                value: `${sl60} cái (Mika HD bo viền Hàn Quốc)`
            });
        }
    }

    // 2. Trang điểm & làm đẹp
    const tdAnHoi = totals.trangDiemNgayAnHoi || data.trangDiemNgayAnHoi;
    if (isMeaningful(tdAnHoi)) {
        packageItems.push({
            label: 'Trang điểm ăn hỏi',
            value: String(tdAnHoi).trim()
        });
    }

    const tdCuoi = totals.trangDiemNgayCuoi || data.trangDiemNgayCuoi;
    if (isMeaningful(tdCuoi)) {
        packageItems.push({
            label: 'Trang điểm ngày cưới',
            value: String(tdCuoi).trim()
        });
    }

    // 3. Trang phục & phụ kiện
    const beLe = totals.trangPhucChoDoiBeLe || data.beTrap;
    if (isMeaningful(beLe)) {
        packageItems.push({
            label: 'Trang phục bê lễ',
            value: String(beLe).trim()
        });
    }

    const cdAnHoi = totals.trangPhucCoDauNgayAnHoi || data.aoDaiAnHoi;
    if (isMeaningful(cdAnHoi)) {
        packageItems.push({
            label: 'TP cô dâu ăn hỏi',
            value: String(cdAnHoi).trim()
        });
    }

    const crAnHoi = totals.trangPhucChuReNgayAnHoi || data.trangPhucChuReNgayAnHoi;
    if (isMeaningful(crAnHoi)) {
        packageItems.push({
            label: 'TP chú rể ăn hỏi',
            value: String(crAnHoi).trim()
        });
    }

    const vayCuoi = totals.trangPhucVayCuoiNgayCuoi || data.vayCuoi;
    if (isMeaningful(vayCuoi)) {
        packageItems.push({
            label: 'Váy cưới ngày cưới',
            value: String(vayCuoi).trim()
        });
    }

    const vestCuoi = totals.trangPhucVestChuReNgayCuoi || data.vestNgayCuoi;
    if (isMeaningful(vestCuoi)) {
        packageItems.push({
            label: 'Vest chú rể ngày cưới',
            value: String(vestCuoi).trim()
        });
    }

    const hoa = totals.hoaCamTay || data.hoaCamTay;
    if (isMeaningful(hoa)) {
        packageItems.push({
            label: 'Hoa cầm tay',
            value: String(hoa).trim()
        });
    }

    // Nếu hợp đồng thực sự có album được lưu
    const album = Number(totals.albumTrang ?? data.albumTrang ?? 0);
    if (album > 0) {
        packageItems.push({
            label: 'Album photobook',
            value: `${album} trang (kèm ảnh bìa)`
        });
    }

    // Chuẩn bị danh sách dịch vụ cho mục 2.1
    const cartItemsList = Array.isArray(data.cartItems) ? data.cartItems : [];
    let cartRowsHtml = '';
    let sumThanhTien = 0;

    if (cartItemsList.length > 0) {
        cartRowsHtml = cartItemsList.map((item, idx) => {
            const tenDichVu = item.tenDichVu || item.tenDichVuSnapshot || item.name || `Dịch vụ ${idx + 1}`;
            const soLuong = Number(item.soLuong || 1);
            const donGia = Number(item.donGia || 0);
            const giamGia = Number(item.giamGia || item.giamGiaDichVu || 0);
            const thanhTien = Number(item.thanhTien ?? Math.max(0, (donGia * soLuong) - giamGia));
            sumThanhTien += thanhTien;

            const donGiaStr = item.donGiaFormatted || (donGia ? `${donGia.toLocaleString('vi-VN')} đ` : '0 đ');
            const giamGiaStr = item.giamGiaFormatted || (giamGia > 0 ? `${giamGia.toLocaleString('vi-VN')} đ` : '0 đ');
            const thanhTienStr = item.thanhTienFormatted || (thanhTien ? `${thanhTien.toLocaleString('vi-VN')} đ` : '0 đ');

            return `
                <tr>
                    <td style="text-align: center;">${idx + 1}</td>
                    <td style="text-align: left;"><strong>${tenDichVu}</strong></td>
                    <td style="text-align: center;">${soLuong}</td>
                    <td style="text-align: right;">${donGiaStr}</td>
                    <td style="text-align: right;">${giamGiaStr}</td>
                    <td style="text-align: right; font-weight: bold;">${thanhTienStr}</td>
                </tr>
            `;
        }).join('');
    } else {
        cartRowsHtml = `
            <tr>
                <td style="text-align: center;">1</td>
                <td>.........................................................................................</td>
                <td style="text-align: center;">.....</td>
                <td style="text-align: right;">....................</td>
                <td style="text-align: right;">....................</td>
                <td style="text-align: right;">....................</td>
            </tr>
            <tr>
                <td style="text-align: center;">2</td>
                <td>.........................................................................................</td>
                <td style="text-align: center;">.....</td>
                <td style="text-align: right;">....................</td>
                <td style="text-align: right;">....................</td>
                <td style="text-align: right;">....................</td>
            </tr>
        `;
    }

    const tongTienDichVuFormatted = data.tongTienDichVuFormatted || (sumThanhTien > 0 ? `${sumThanhTien.toLocaleString('vi-VN')} đ` : (data.tongTien ? `${Number(data.tongTien).toLocaleString('vi-VN')} đ` : '.................... đ'));

    const tongGiaTriFormatted = data.tongGiaTriFormatted || (data.tongGiaTri ? `${Number(data.tongGiaTri).toLocaleString('vi-VN')} đ` : (data.tongTien ? `${Number(data.tongTien).toLocaleString('vi-VN')} đ` : '.................... đ'));
    const tongGiamGiaFormatted = data.tongGiamGiaFormatted || (Number(data.tongGiamGia) > 0 ? `${Number(data.tongGiamGia).toLocaleString('vi-VN')} đ` : '0 đ');
    const daThanhToanFormatted = data.daThanhToanFormatted || (Number(data.daThanhToan) > 0 ? `${Number(data.daThanhToan).toLocaleString('vi-VN')} đ` : '0 đ');
    const conLaiFormatted = data.conLaiFormatted || (Number(data.conLai) > 0 ? `${Number(data.conLai).toLocaleString('vi-VN')} đ` : '0 đ');

    // Chuẩn bị các dòng lượt thanh toán
    let paymentList = [];
    if (Array.isArray(data.cacLuotThanhToan) && data.cacLuotThanhToan.length > 0) {
        paymentList = data.cacLuotThanhToan;
    } else if (Array.isArray(data.thanhToan?.cacLuotThanhToan) && data.thanhToan.cacLuotThanhToan.length > 0) {
        paymentList = data.thanhToan.cacLuotThanhToan;
    } else if (Number(data.daThanhToan) > 0) {
        paymentList = [{
            date: data.ngayLapHopDongFormatted || '',
            amount: Number(data.daThanhToan),
            method: data.methodPayment || data.hinhThucThanhToan || '',
            noiDung: data.noiDungPayment || ''
        }];
    }

    let paymentRowsHtml = '';
    if (paymentList.length > 0) {
        paymentRowsHtml = paymentList.map((p, idx) => {
            const dateStr = formatPaymentDate(p.date || p.thoiGian || p.createdAt);
            const amount = Number(p.amount ?? p.soTien ?? 0);
            const amountStr = amount ? `${amount.toLocaleString('vi-VN')} đ` : '0 đ';
            const methodStr = p.method || p.hinhThuc || p.phuongThuc || '';
            const noiDungStr = p.noiDung || p.note || p.ghiChu || '';
            return `
                <tr>
                    <td style="text-align: center; font-weight: bold;">Đợt ${idx + 1}</td>
                    <td style="text-align: center;">${dateStr || ''}</td>
                    <td style="text-align: right; font-weight: bold; color: #16a34a;">${amountStr}</td>
                    <td style="text-align: center;">${methodStr}</td>
                    <td style="text-align: left;">${noiDungStr}</td>
                </tr>
            `;
        }).join('');
    } else {
        paymentRowsHtml = `
            <tr>
                <td style="text-align: center; font-weight: bold;">Đợt 1</td>
                <td style="text-align: center;">..... / ..... / 20....</td>
                <td style="text-align: right;">.................... đ</td>
                <td style="text-align: center;">....................</td>
                <td style="text-align: left;">....................................................</td>
            </tr>
            <tr>
                <td style="text-align: center; font-weight: bold;">Đợt 2</td>
                <td style="text-align: center;">..... / ..... / 20....</td>
                <td style="text-align: right;">.................... đ</td>
                <td style="text-align: center;">....................</td>
                <td style="text-align: left;">....................................................</td>
            </tr>
        `;
    }

    // Chuẩn bị các dòng lịch trình và phân công nhân sự cho mục 2.3
    let scheduleRowsHtml = '';
    if (serviceSchedules.length > 0) {
        scheduleRowsHtml = serviceSchedules.map((sch, idx) => `
            <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td style="text-align: left;"><strong>${sch.serviceName}</strong></td>
                <td style="text-align: center;">${sch.ngayGio || 'Chưa xếp lịch'}</td>
                <td style="text-align: left;">${sch.diaDiem || 'Tại Studio'}</td>
                <td style="text-align: left; font-weight: bold; color: ${sch.nhanVien === 'Chưa phân công' ? '#64748b' : '#000'};">${sch.nhanVien || 'Chưa phân công'}</td>
                <td style="text-align: left;">${sch.ghiChu || '-'}</td>
            </tr>
        `).join('');
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${config.contractTitle || 'HỢP ĐỒNG CUNG CẤP DỊCH VỤ CƯỚI'} - ${maHopDong}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 8mm 12mm 8mm 12mm;
        }
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        html, body {
            margin: 0;
            padding: 0;
            background: #cbd5e1;
            font-family: 'Times New Roman', Times, serif;
            color: #000;
            line-height: 1.35;
            font-size: 13px;
        }
        .print-actions-bar {
            position: fixed;
            top: 12px;
            right: 20px;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.95);
            padding: 8px 12px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(4px);
        }
        .print-btn-primary {
            background: #0284c7;
            color: #ffffff;
            border: none;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(2, 132, 199, 0.35);
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.18s ease;
            white-space: nowrap;
        }
        .print-btn-primary:hover {
            background: #0369a1;
            transform: translateY(-1px);
        }
        .print-btn-image {
            background: #059669;
            color: #ffffff;
            border: none;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(5, 150, 105, 0.35);
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.18s ease;
            white-space: nowrap;
        }
        .print-btn-image:hover {
            background: #047857;
            transform: translateY(-1px);
        }
        .print-btn-pdf {
            background: #dc2626;
            color: #ffffff;
            border: none;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(220, 38, 38, 0.35);
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.18s ease;
            white-space: nowrap;
        }
        .print-btn-pdf:hover {
            background: #b91c1c;
            transform: translateY(-1px);
        }
        .print-btn-secondary {
            background: #f1f5f9;
            color: #475569;
            border: 1px solid #cbd5e1;
            padding: 8px 14px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.18s ease;
            white-space: nowrap;
        }
        .print-btn-secondary:hover {
            background: #e2e8f0;
            color: #1e293b;
        }
        .print-btn-primary:disabled, .print-btn-image:disabled, .print-btn-pdf:disabled {
            opacity: 0.65;
            cursor: not-allowed;
            transform: none !important;
            box-shadow: none !important;
        }
        .contract-wrapper {
            width: 210mm;
            max-width: 800px;
            min-height: 297mm;
            background: #ffffff;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
            border-radius: 2px;
            padding: 34px 42px;
            margin: 25px auto;
            position: relative;
        }
        @media print {
            body {
                background: #ffffff !important;
                padding: 0 !important;
            }
            .print-actions-bar {
                display: none !important;
            }
            .contract-wrapper {
                width: 100% !important;
                max-width: 100% !important;
                min-height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border: none !important;
                background: #ffffff !important;
            }
        }
        .top-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 6px;
        }
        .logo-box {
            text-align: center;
            width: 150px;
        }
        .logo-img {
            max-height: 64px;
            width: auto;
            object-fit: contain;
            display: block;
            margin: 0 auto;
        }
        .contract-meta {
            text-align: right;
            font-size: 12.5px;
            line-height: 1.4;
        }
        .main-heading {
            text-align: center;
            margin: 2px 0 10px 0;
            padding: 4px;
        }
        .main-heading h1 {
            color: #c28e2b;
            font-size: 20px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0 0 2px 0;
            letter-spacing: 0.5px;
        }
        .main-heading p {
            font-size: 12px;
            font-weight: bold;
            font-style: italic;
            margin: 0;
            color: #111;
        }
        .sec-title {
            font-size: 13.5px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 8px 0 4px 0;
        }
        .party-grid {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            gap: 15px;
        }
        .party-a {
            flex: 1.3;
        }
        .party-b {
            flex: 0.9;
        }
        .party-b-card {
            text-align: center;
            padding: 0 4px;
        }
        .party-b-address {
            font-size: 11.5px;
            margin-top: 2px;
            line-height: 1.3;
        }
        .party-header-title {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 2px;
        }
        .party-a-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
            font-size: 12.5px;
        }
        .party-a-col {
            width: 48%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .party-b-title {
            font-weight: bold;
            font-size: 12.5px;
            text-transform: uppercase;
            line-height: 1.3;
        }
        .party-b-hotline {
            font-weight: bold;
            font-size: 13px;
            margin-top: 3px;
        }
        .content-block {
            font-size: 12.5px;
            line-height: 1.4;
        }
        .sec-subtitle {
            font-size: 12.5px;
            font-weight: bold;
            margin: 6px 0 3px 0;
            color: #000;
        }
        .services-table, .schedule-table {
            width: 100%;
            border-collapse: collapse;
            margin: 3px 0 6px 0;
            border: 1px solid #000;
        }
        .services-table th, .services-table td,
        .schedule-table th, .schedule-table td {
            border: 1px solid #000;
            padding: 3px 5px;
            vertical-align: middle;
            font-size: 11.5px;
            line-height: 1.3;
        }
        .services-table th, .schedule-table th {
            font-weight: bold;
            background: #f8fafc;
            color: #000;
        }
        .services-total-row td {
            font-weight: bold;
            background: #fff;
        }
        .content-line {
            margin-bottom: 2px;
            display: flex;
            justify-content: space-between;
            align-items: baseline;
        }
        .content-line-full {
            margin-bottom: 2px;
        }
        .dates-highlight {
            margin: 5px 0;
            font-size: 12.5px;
        }
        .chk-box {
            display: inline-block;
            width: 11px;
            height: 11px;
            border: 1.2px solid #000;
            margin-right: 3px;
            vertical-align: middle;
            text-align: center;
            line-height: 10px;
            font-size: 10px;
        }
        .package-items-container {
            margin: 4px 0 6px 0;
            padding: 4px 0;
            border-top: 1px dashed #cbd5e1;
            border-bottom: 1px dashed #cbd5e1;
        }
        .package-items-title {
            font-size: 11.5px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 3px;
        }
        .package-items-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2.5px 14px;
            font-size: 12px;
            line-height: 1.35;
        }
        .package-item-row {
            display: flex;
            align-items: baseline;
            gap: 4px;
        }
        .package-items-blank {
            font-size: 12px;
            line-height: 1.8;
            padding: 2px 0;
        }
        .blank-line {
            margin: 2px 0;
        }
        .payment-summary-table, .payment-history-table {
            width: 100%;
            border-collapse: collapse;
            margin: 3px 0 5px 0;
            border: 1px solid #000;
        }
        .payment-summary-table th, .payment-summary-table td,
        .payment-history-table th, .payment-history-table td {
            border: 1px solid #000;
            padding: 3px 5px;
            vertical-align: middle;
            font-size: 11.5px;
            line-height: 1.3;
        }
        .payment-summary-table th, .payment-history-table th {
            font-weight: bold;
            background: #f8fafc;
            color: #000;
        }
        .terms-block {
            font-size: 11.5px;
            line-height: 1.35;
            margin-top: 2px;
            padding: 2px 0;
        }
        .term-item {
            margin: 2px 0;
            display: flex;
            align-items: flex-start;
            gap: 4px;
        }
        .signatures-grid {
            display: flex;
            justify-content: space-between;
            margin-top: 14px;
            text-align: center;
            page-break-inside: avoid;
        }
        .sig-column {
            width: 45%;
        }
        .sig-title {
            font-weight: bold;
            font-size: 12.5px;
            text-transform: uppercase;
        }
        .sig-guide {
            font-size: 11px;
            font-style: italic;
            margin-top: 1px;
        }
        .sig-blank {
            height: 48px;
        }
        .sig-name {
            font-weight: bold;
            font-size: 12.5px;
        }
        .footer-note {
            text-align: center;
            margin-top: 16px;
            font-style: italic;
            font-size: 11.5px;
            color: #475569;
            border-top: 1px dashed #cbd5e1;
            padding-top: 8px;
        }
    </style>
</head>
<body>
    <div class="print-actions-bar no-print">
        <button class="print-btn-primary" onclick="window.print()">🖨️ In Hợp Đồng</button>
        <button id="btn-save-img" class="print-btn-image" onclick="saveContractAsImage()">📸 Lưu Ảnh HĐ</button>
        <button id="btn-save-pdf" class="print-btn-pdf" onclick="saveContractAsPdf()">📥 Tải File PDF</button>
        <button class="print-btn-secondary" onclick="window.close()">Đóng Cửa Sổ</button>
    </div>

    <div class="contract-wrapper">
        <div class="top-header">
            <div class="logo-box">
                <img src="${logoSrc}" alt="Long Wedding Logo" class="logo-img" />
            </div>
            <div class="contract-meta">
                <div>Mã số hợp đồng: <strong>${maHopDong}</strong></div>
                <div>Ngày ký HĐ: <strong>${ngayHDFormatted}</strong></div>
            </div>
        </div>

        <div class="main-heading">
            <h1>${replaceTemplateParams(config.contractTitle || 'HỢP ĐỒNG CUNG CẤP DỊCH VỤ CƯỚI', data, config)}</h1>
            <p>${replaceTemplateParams(config.contractSubtitle || 'Tại Long Wedding, số 129 đường 1/5, xóm Tân Hồng, Xã Nghĩa Đàn, Nghệ An', data, config)}</p>
        </div>

        <div class="sec-title">I. CÁC BÊN BAO GỒM</div>
        <div class="party-grid">
            <div class="party-a">
                <div class="party-header-title">BÊN A (KHÁCH HÀNG)</div>
                <div class="party-a-row">
                    <div class="party-a-col"><strong>Cô Dâu:</strong> ${coDau}</div>
                    <div class="party-a-col"><strong>Chú Rể:</strong> ${chuRe}</div>
                </div>
                <div class="party-a-row">
                    <div class="party-a-col"><strong>SĐT:</strong> ${sdtCoDau}</div>
                    <div class="party-a-col"><strong>SĐT:</strong> ${sdtChuRe}</div>
                </div>
                <div class="party-a-row">
                    <div class="party-a-col"><strong>Đ/C:</strong> ${dcCoDau}</div>
                    <div class="party-a-col"><strong>Đ/C:</strong> ${dcChuRe}</div>
                </div>
            </div>
            <div class="party-b">
                <div class="party-b-card">
                    <div class="party-header-title">BÊN B (STUDIO)</div>
                    <div class="party-b-title">ẢNH VIỆN ÁO CƯỚI<br/><strong>${replaceTemplateParams(config.studioName || 'LONG WEDDING', data, config)}</strong></div>
                    <div class="party-b-hotline">Hotline: ${replaceTemplateParams(config.studioHotline || '0868 66 3637', data, config)}</div>
                    <div class="party-b-address">Đ/C: ${replaceTemplateParams(config.studioAddress || 'số 129 đường 1/5, xóm Tân Hồng, Xã Nghĩa Đàn, Nghệ An', data, config)}</div>
                </div>
            </div>
        </div>

        <div class="sec-title">II. NỘI DUNG HỢP ĐỒNG</div>
        <div class="content-block">
            <!-- 2.1 Dịch vụ sử dụng -->
            <div class="sec-subtitle"><strong>2.1 Dịch vụ sử dụng:</strong></div>
            <table class="services-table">
                <thead>
                    <tr>
                        <th style="width: 32px; text-align: center;">STT</th>
                        <th style="text-align: left;">Dịch vụ sử dụng</th>
                        <th style="width: 55px; text-align: center;">Số lượng</th>
                        <th style="width: 90px; text-align: right;">Đơn giá</th>
                        <th style="width: 80px; text-align: right;">Giảm giá</th>
                        <th style="width: 95px; text-align: right;">Tổng tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${cartRowsHtml}
                </tbody>
                <tfoot>
                    <tr class="services-total-row">
                        <td colspan="5" style="text-align: right; font-weight: bold;">Tổng tiền dịch vụ:</td>
                        <td style="text-align: right; font-weight: bold;">${tongTienDichVuFormatted}</td>
                    </tr>
                </tfoot>
            </table>

            <!-- 2.2 Chi tiết sản phẩm & dịch vụ theo hợp đồng -->
            <div class="sec-subtitle" style="margin-top: 6px;"><strong>2.2 Chi tiết sản phẩm & dịch vụ theo hợp đồng:</strong></div>
            ${packageItems.length > 0 ? `
                <div class="package-items-container">
                    <div class="package-items-grid">
                        ${packageItems.map(item => `
                            <div class="package-item-row">
                                <span class="chk-box">✓</span> <span><strong>${item.label}:</strong> ${item.value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : `
                <div class="package-items-container">
                    <div class="package-items-blank">
                        <div class="blank-line">- Ảnh phóng & để bàn: ....................................................................................................................................................</div>
                        <div class="blank-line">- Trang phục ngày cưới & ăn hỏi: .................................................................................................................................</div>
                        <div class="blank-line">- Dịch vụ trang điểm: ....................................................................................................................................................</div>
                        <div class="blank-line">- Dịch vụ khác: ................................................................................................................................................</div>
                    </div>
                </div>
            `}

            <!-- 2.3 Lịch và Phân Công -->
            <div class="sec-subtitle" style="margin-top: 6px;"><strong>2.3 Lịch và Phân Công:</strong></div>
            <div class="dates-highlight">
                <strong>Ngày chụp ảnh:</strong> ${ngayChup || '..... / ..... / 20....'} , 
                <strong>Ăn hỏi:</strong> ${ngayAnHoi || '..... / ..... / 20....'} , 
                <strong>Lễ cưới:</strong> ${ngayCuoi || '..... / ..... / 20....'}
                ${ngayTraAnh ? ` , <strong>Hẹn trả ảnh:</strong> ${ngayTraAnh}` : ''}
            </div>

            <table class="schedule-table">
                <thead>
                    <tr>
                        <th style="width: 32px; text-align: center;">STT</th>
                        <th style="text-align: left;">Lịch trình / Hạng mục</th>
                        <th style="width: 140px; text-align: center;">Thời gian</th>
                        <th style="width: 110px; text-align: left;">Địa điểm</th>
                        <th style="width: 130px; text-align: left;">Nhân sự phân công</th>
                        <th style="width: 100px; text-align: left;">Ghi chú</th>
                    </tr>
                </thead>
                <tbody>
                    ${scheduleRowsHtml || `
                        <tr>
                            <td style="text-align: center;">1</td>
                            <td style="text-align: left;"><strong>Lịch chụp ảnh</strong></td>
                            <td style="text-align: center;">${ngayChup || '................................'}</td>
                            <td style="text-align: left;">${diaDiemChup || 'Tại Studio'}</td>
                            <td style="text-align: left; font-weight: bold; color: ${thoChupHinh ? '#000' : '#64748b'};">${thoChupHinh || 'Chưa phân công'}</td>
                            <td style="text-align: left;">-</td>
                        </tr>
                        <tr>
                            <td style="text-align: center;">2</td>
                            <td style="text-align: left;"><strong>Lịch trang điểm ăn hỏi & cưới</strong></td>
                            <td style="text-align: center;">${ngayCuoi || ngayAnHoi || '................................'}</td>
                            <td style="text-align: left;">Tại Studio / Nhà gái</td>
                            <td style="text-align: left; font-weight: bold; color: ${thoMakeUp ? '#000' : '#64748b'};">${thoMakeUp || 'Chưa phân công'}</td>
                            <td style="text-align: left;">-</td>
                        </tr>
                    `}
                </tbody>
            </table>
            ${(thoChinhAnh || nhanVienSale) ? `
                <div style="font-size: 11px; margin-top: 2px; display: flex; gap: 15px; color: #334155;">
                    ${thoChinhAnh ? `<span>• <strong>Thợ chỉnh ảnh:</strong> ${thoChinhAnh}</span>` : ''}
                    ${nhanVienSale ? `<span>• <strong>Tư vấn (Sale):</strong> ${nhanVienSale}</span>` : ''}
                </div>
            ` : ''}
        </div>

        <div class="sec-title">III. THANH TOÁN DỊCH VỤ</div>
        <div style="font-weight: bold; font-size: 12px; margin: 3px 0 2px 0;">• Chi tiết các lượt thanh toán:</div>
        <table class="payment-history-table">
            <thead>
                <tr>
                    <th style="width: 55px; text-align: center;">Đợt</th>
                    <th style="width: 130px; text-align: center;">Thời gian</th>
                    <th style="width: 105px; text-align: right;">Số tiền</th>
                    <th style="width: 95px; text-align: center;">Hình thức</th>
                    <th style="text-align: left;">Nội dung</th>
                </tr>
            </thead>
            <tbody>
                ${paymentRowsHtml}
            </tbody>
        </table>

        <table class="payment-summary-table" style="margin-top: 5px;">
            <thead>
                <tr>
                    <th style="width: 25%; text-align: center;">Tổng giá trị hợp đồng</th>
                    <th style="width: 25%; text-align: center;">Tổng tiền được giảm bớt</th>
                    <th style="width: 25%; text-align: center;">Đã thanh toán</th>
                    <th style="width: 25%; text-align: center;">Số tiền còn lại</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: center; font-weight: bold; font-size: 12px;">${tongGiaTriFormatted}</td>
                    <td style="text-align: center; font-weight: bold; color: #16a34a; font-size: 12px;">${tongGiamGiaFormatted}</td>
                    <td style="text-align: center; font-weight: bold; color: #0284c7; font-size: 12px;">${daThanhToanFormatted}</td>
                    <td style="text-align: center; font-weight: bold; color: #dc2626; font-size: 12px;">${conLaiFormatted}</td>
                </tr>
            </tbody>
        </table>

        <div class="sec-title">IV. LƯU Ý & ĐIỀU KHOẢN HỢP ĐỒNG</div>
        <div class="terms-block">
            ${(config.terms || []).map((t, index) => `
                <div class="term-item">
                    <span style="font-weight: bold; white-space: nowrap;">- Điều ${index + 1}:</span>
                    <span>${replaceTemplateParams(t, data, config)}</span>
                </div>
            `).join('')}
        </div>

        <div class="signatures-grid">
            <div class="sig-column">
                <div class="sig-title">${replaceTemplateParams(config.clientSignTitle || 'KHÁCH HÀNG', data, config)}</div>
                <div class="sig-guide">${replaceTemplateParams(config.clientSignSubtitle || '(Ký và ghi rõ Họ và Tên)', data, config)}</div>
                <div class="sig-blank"></div>
                <div class="sig-name">${coDau !== '...................................................' ? coDau.replace(' (Cô Dâu)', '') : ''}</div>
            </div>
            <div class="sig-column">
                <div class="sig-title">${replaceTemplateParams(config.studioSignTitle || 'ĐẠI DIỆN LONGWEDDING', data, config)}</div>
                <div class="sig-guide">${replaceTemplateParams(config.studioSignSubtitle || '(Ký và ghi rõ Họ và Tên)', data, config)}</div>
                <div class="sig-blank"></div>
                <div class="sig-name">${replaceTemplateParams(config.studioName || 'LONG WEDDING', data, config)}</div>
            </div>
        </div>

        ${config.footerNote ? `
        <div class="footer-note">
            ${replaceTemplateParams(config.footerNote, data, config)}
        </div>` : ''}
    </div>

    <script>
        function getHtml2Canvas() {
            if (typeof window.html2canvas !== 'undefined') {
                return Promise.resolve(window.html2canvas);
            }
            if (window.opener && typeof window.opener.html2canvas !== 'undefined') {
                return Promise.resolve(window.opener.html2canvas);
            }
            return new Promise(function(resolve, reject) {
                var s = document.createElement('script');
                s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                s.onload = function() { resolve(window.html2canvas); };
                s.onerror = function() { reject(new Error('Không thể tải thư viện html2canvas từ CDN')); };
                document.head.appendChild(s);
            });
        }

        function getJsPdf() {
            if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
                return Promise.resolve(window.jspdf.jsPDF);
            }
            if (typeof window.jsPDF !== 'undefined') {
                return Promise.resolve(window.jsPDF);
            }
            if (window.opener && typeof window.opener.jspdf !== 'undefined' && window.opener.jspdf.jsPDF) {
                return Promise.resolve(window.opener.jspdf.jsPDF);
            }
            if (window.opener && typeof window.opener.jsPDF !== 'undefined') {
                return Promise.resolve(window.opener.jsPDF);
            }
            return new Promise(function(resolve, reject) {
                var s = document.createElement('script');
                s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                s.onload = function() {
                    var cls = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : window.jsPDF;
                    resolve(cls);
                };
                s.onerror = function() { reject(new Error('Không thể tải thư viện jsPDF từ CDN')); };
                document.head.appendChild(s);
            });
        }

        var contractCode = "${(data.maHopDong || 'HD').toString().replace(/[^a-zA-Z0-9_-]/g, '_')}";

        async function saveContractAsImage() {
            var btn = document.getElementById('btn-save-img');
            if (!btn) return;
            var originalHtml = btn.innerHTML;
            try {
                btn.disabled = true;
                btn.innerHTML = '⏳ Đang tạo ảnh...';

                var h2c = await getHtml2Canvas();
                var target = document.querySelector('.contract-wrapper');
                if (!target) throw new Error('Không tìm thấy nội dung hợp đồng');

                window.scrollTo(0, 0);

                var canvas = await h2c(target, {
                    scale: 2.5,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    windowWidth: target.scrollWidth,
                    windowHeight: target.scrollHeight
                });

                var link = document.createElement('a');
                link.download = 'HopDong_' + contractCode + '.png';
                link.href = canvas.toDataURL('image/png', 1.0);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                btn.innerHTML = '✅ Đã tải ảnh!';
                setTimeout(function() {
                    btn.innerHTML = originalHtml;
                    btn.disabled = false;
                }, 2000);
            } catch (err) {
                console.error('Lỗi khi lưu ảnh hợp đồng:', err);
                alert('Có lỗi khi lưu ảnh hợp đồng: ' + (err.message || err));
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        }

        async function saveContractAsPdf() {
            var btn = document.getElementById('btn-save-pdf');
            if (!btn) return;
            var originalHtml = btn.innerHTML;
            try {
                btn.disabled = true;
                btn.innerHTML = '⏳ Đang tạo PDF...';

                var h2c = await getHtml2Canvas();
                var jsPDFClass = await getJsPdf();
                var target = document.querySelector('.contract-wrapper');
                if (!target) throw new Error('Không tìm thấy nội dung hợp đồng');

                window.scrollTo(0, 0);

                var canvas = await h2c(target, {
                    scale: 2.5,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    windowWidth: target.scrollWidth,
                    windowHeight: target.scrollHeight
                });

                var pdf = new jsPDFClass('p', 'mm', 'a4');
                var a4Ratio = 297 / 210;
                var pageCanvasHeight = Math.floor(canvas.width * a4Ratio);

                if (canvas.height <= pageCanvasHeight + 25) {
                    var mmHeight = (canvas.height * 210) / canvas.width;
                    pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, 210, Math.min(mmHeight, 297));
                } else {
                    var renderedHeight = 0;
                    var pageIndex = 0;

                    while (renderedHeight < canvas.height) {
                        var sliceHeight = Math.min(pageCanvasHeight, canvas.height - renderedHeight);
                        var pageCanvas = document.createElement('canvas');
                        pageCanvas.width = canvas.width;
                        pageCanvas.height = sliceHeight;
                        var ctx = pageCanvas.getContext('2d');
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
                        ctx.drawImage(
                            canvas,
                            0, renderedHeight, canvas.width, sliceHeight,
                            0, 0, canvas.width, sliceHeight
                        );

                        var pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
                        var currentSliceMmHeight = (sliceHeight * 210) / canvas.width;

                        if (pageIndex > 0) {
                            pdf.addPage();
                        }
                        pdf.addImage(pageImgData, 'JPEG', 0, 0, 210, currentSliceMmHeight);

                        renderedHeight += sliceHeight;
                        pageIndex++;
                    }
                }

                pdf.save('HopDong_' + contractCode + '.pdf');

                btn.innerHTML = '✅ Đã tải PDF!';
                setTimeout(function() {
                    btn.innerHTML = originalHtml;
                    btn.disabled = false;
                }, 2000);
            } catch (err) {
                console.error('Lỗi khi tạo file PDF:', err);
                alert('Có lỗi khi tạo file PDF: ' + (err.message || err));
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        }

        window.addEventListener('load', function() {
            setTimeout(function() {
                window.print();
            }, 350);
        });
    </script>
</body>
</html>
    `;
};

/**
 * Hàm sinh HTML in Phiếu Mượn Đồ / Phiếu Trả Đồ chuẩn phong cách đồng bộ với Hợp Đồng
 */
export const generateLoanReceiptPrintHtml = (data = {}, isReturn = false, customConfig = null) => {
    const config = customConfig || getLoanReceiptPrintConfig();
    const logoSrc = getSafePrintLogo();

    const maHopDong = data.maHopDong || '................................';
    const ngayLapFormatted = data.ngayLapFormatted || new Date().toLocaleDateString('vi-VN');

    const tenKH1 = data.tenKhachHang1 || data.khachHang1?.tenKhachHang || '...................................................';
    const tenKH2 = data.tenKhachHang2 || data.khachHang2?.tenKhachHang || '...................................................';
    const sdt1 = data.soDienThoai1 || data.khachHang1?.soDienThoai || '...................................................';
    const sdt2 = data.soDienThoai2 || data.khachHang2?.soDienThoai || '...................................................';

    const ngayMuon = data.ngayMuonFormatted || '';
    const ngayTra = data.ngayTraFormatted || '';
    const nguoiKiem = data.nguoiKiem || data.nguoiBanGiao || '';
    const datCoc = data.datCoc ? `${Number(data.datCoc).toLocaleString('vi-VN')} đ` : '0 đ';
    const ghiChu = data.noiDung || data.ghiChu || '';

    const items = data.items || [];
    const title = isReturn ? config.returnTitle : config.loanTitle;
    const terms = isReturn ? config.returnTerms : config.loanTerms;
    const clientSign = isReturn ? config.returnClientSignTitle : config.loanClientSignTitle;
    const clientSignSub = isReturn ? config.returnClientSignSubtitle : config.loanClientSignSubtitle;
    const staffSign = isReturn ? config.returnStaffSignTitle : config.loanStaffSignTitle;
    const staffSignSub = isReturn ? config.returnStaffSignSubtitle : config.loanStaffSignSubtitle;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title} - ${maHopDong}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 10mm 14mm 10mm 14mm;
        }
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            color: #000;
            line-height: 1.35;
            font-size: 13px;
            margin: 0;
            padding: 0;
            background: #fff;
        }
        .wrapper {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
        }
        .top-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 4px;
        }
        .logo-box {
            text-align: center;
            width: 140px;
        }
        .logo-img {
            max-height: 60px;
            width: auto;
            object-fit: contain;
            display: block;
            margin: 0 auto;
        }
        .receipt-meta {
            text-align: right;
            font-size: 12.5px;
            line-height: 1.4;
        }
        .main-heading {
            text-align: center;
            margin: 2px 0 10px 0;
        }
        .main-heading h1 {
            color: #c28e2b;
            font-size: 20px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0 0 2px 0;
            letter-spacing: 0.5px;
        }
        .main-heading p {
            font-size: 12px;
            font-weight: bold;
            font-style: italic;
            margin: 0;
            color: #111;
        }
        .sec-title {
            font-size: 13.5px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 6px 0 3px 0;
        }
        .party-grid {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            gap: 15px;
        }
        .party-a {
            flex: 1.3;
        }
        .party-b {
            flex: 0.9;
            text-align: center;
            padding-top: 2px;
        }
        .party-header-title {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 2px;
        }
        .party-a-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
            font-size: 12.5px;
        }
        .party-a-col {
            width: 48%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .party-b-title {
            font-weight: bold;
            font-size: 12.5px;
            text-transform: uppercase;
            line-height: 1.3;
        }
        .party-b-hotline {
            font-weight: bold;
            font-size: 13px;
            margin-top: 3px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 6px 0 8px 0;
            border: 1.5px solid #000;
        }
        .items-table th, .items-table td {
            border: 1px solid #000;
            padding: 4px 6px;
            font-size: 12px;
        }
        .items-table th {
            background-color: #fff;
            font-weight: bold;
            font-style: italic;
            text-align: center;
        }
        .terms-block {
            font-size: 11.5px;
            line-height: 1.35;
            margin-top: 2px;
        }
        .terms-block p {
            margin: 1.5px 0;
        }
        .signatures-grid {
            display: flex;
            justify-content: space-between;
            margin-top: 12px;
            text-align: center;
            page-break-inside: avoid;
        }
        .sig-column {
            width: 45%;
        }
        .sig-title {
            font-weight: bold;
            font-size: 12.5px;
            text-transform: uppercase;
        }
        .sig-guide {
            font-size: 11px;
            font-style: italic;
            margin-top: 1px;
        }
        .sig-blank {
            height: 48px;
        }
        .sig-name {
            font-weight: bold;
            font-size: 12.5px;
        }
        @media print {
            .print-actions-bar {
                display: none !important;
            }
        }
        .print-actions-bar {
            position: fixed;
            top: 12px;
            right: 20px;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.95);
            padding: 8px 12px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(4px);
        }
        .print-btn-primary {
            background: #0284c7;
            color: #ffffff;
            border: none;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(2, 132, 199, 0.35);
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.18s ease;
            white-space: nowrap;
        }
        .print-btn-primary:hover {
            background: #0369a1;
            transform: translateY(-1px);
        }
        .print-btn-image {
            background: #059669;
            color: #ffffff;
            border: none;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(5, 150, 105, 0.35);
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.18s ease;
            white-space: nowrap;
        }
        .print-btn-image:hover {
            background: #047857;
            transform: translateY(-1px);
        }
        .print-btn-pdf {
            background: #dc2626;
            color: #ffffff;
            border: none;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(220, 38, 38, 0.35);
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.18s ease;
            white-space: nowrap;
        }
        .print-btn-pdf:hover {
            background: #b91c1c;
            transform: translateY(-1px);
        }
        .print-btn-secondary {
            background: #f1f5f9;
            color: #475569;
            border: 1px solid #cbd5e1;
            padding: 8px 14px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.18s ease;
            white-space: nowrap;
        }
        .print-btn-secondary:hover {
            background: #e2e8f0;
            color: #1e293b;
        }
        .print-btn-primary:disabled, .print-btn-image:disabled, .print-btn-pdf:disabled {
            opacity: 0.65;
            cursor: not-allowed;
            transform: none !important;
            box-shadow: none !important;
        }
    </style>
</head>
<body>
    <div class="print-actions-bar no-print">
        <button class="print-btn-primary" onclick="window.print()">🖨️ In Phiếu</button>
        <button id="btn-save-loan-img" class="print-btn-image" onclick="saveLoanAsImage()">📸 Lưu Ảnh Phiếu</button>
        <button id="btn-save-loan-pdf" class="print-btn-pdf" onclick="saveLoanAsPdf()">📥 Tải File PDF</button>
        <button class="print-btn-secondary" onclick="window.close()">Đóng Cửa Sổ</button>
    </div>
    <div class="wrapper">
        <!-- 1. Header Logo & Meta -->
        <div class="top-header">
            <div class="logo-box">
                <img src="${logoSrc}" alt="Long Wedding Logo" class="logo-img" />
            </div>
            <div class="receipt-meta">
                <div>Mã số hợp đồng: <strong>${maHopDong}</strong></div>
                <div>Ngày lập phiếu: <strong>${ngayLapFormatted}</strong></div>
            </div>
        </div>

        <!-- 2. Tiêu đề Phiếu -->
        <div class="main-heading">
            <h1>${title}</h1>
            <p>${config.studioSubtitle || 'Tại Long Wedding, số 129 đường 1/5, xóm Tân Hồng, Xã Nghĩa Đàn, Nghệ An'}</p>
        </div>

        <!-- 3. Section I: Thông tin giao nhận -->
        <div class="sec-title">I. THÔNG TIN BÀN GIAO & KHÁCH HÀNG</div>
        <div class="party-grid">
            <div class="party-a">
                <div class="party-header-title">BÊN A (KHÁCH HÀNG)</div>
                <div class="party-a-row">
                    <div class="party-a-col"><strong>Khách hàng 1:</strong> ${tenKH1}</div>
                    <div class="party-a-col"><strong>SĐT:</strong> ${sdt1}</div>
                </div>
                <div class="party-a-row">
                    <div class="party-a-col"><strong>Khách hàng 2:</strong> ${tenKH2}</div>
                    <div class="party-a-col"><strong>SĐT:</strong> ${sdt2}</div>
                </div>
                <div class="party-a-row">
                    <div class="party-a-col"><strong>Ngày mượn đồ:</strong> ${ngayMuon || '................................'}</div>
                    <div class="party-a-col"><strong>${isReturn ? 'Ngày trả thực tế:' : 'Hạn trả cam kết:'}</strong> ${ngayTra || '................................'}</div>
                </div>
            </div>
            <div class="party-b">
                <div class="party-header-title">BÊN B (STUDIO)</div>
                <div class="party-b-title">ẢNH VIỆN ÁO CƯỚI<br/><strong>${config.studioName}</strong></div>
                <div class="party-b-hotline">Hotline: ${config.studioHotline}</div>
                <div style="font-size: 11.5px; margin-top: 2px;">Đ/C: ${config.studioAddress}</div>
                <div style="font-size: 12px; margin-top: 2px;"><strong>${isReturn ? 'Người nhận đồ:' : 'Người bàn giao:'}</strong> ${nguoiKiem || 'Nhân viên Long Wedding'}</div>
            </div>
        </div>

        <!-- 4. Section II: Bảng danh sách đồ mượn / trả -->
        <div class="sec-title">II. DANH SÁCH TRANG PHỤC & PHỤ KIỆN BÀN GIAO</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 35px;">STT</th>
                    ${config.showItemCode ? '<th style="width: 85px;">Mã Đồ</th>' : ''}
                    <th>Tên Trang Phục & Phụ Kiện</th>
                    <th style="width: 105px;">Phân loại</th>
                    ${config.showUpgradePrice ? '<th style="width: 100px;">Nâng cấp / Thuê</th>' : ''}
                    <th style="width: 50px;">SL</th>
                    ${config.showNoteColumn ? '<th>Tình trạng & Phụ kiện kèm</th>' : ''}
                </tr>
            </thead>
            <tbody>
                ${items.length === 0 ? `<tr><td colspan="7" style="text-align: center; color: #666; padding: 12px;">Chưa có đồ nào trong danh sách</td></tr>` :
                items.map((item, index) => `
                    <tr>
                        <td style="text-align: center;">${index + 1}</td>
                        ${config.showItemCode ? `<td><strong>${item.maDichVu || '-'}</strong></td>` : ''}
                        <td><strong>${item.tenDichVu || ''}</strong></td>
                        <td style="text-align: center;">${item.isThueThem ? `Thuê thêm (${Number(item.donGiaThue || 0).toLocaleString('vi-VN')} đ)` : 'Trong gói'}</td>
                        ${config.showUpgradePrice ? `<td style="text-align: right;">${item.tienNangCap ? Number(item.tienNangCap).toLocaleString('vi-VN') + ' đ' : '-'}</td>` : ''}
                        <td style="text-align: center; font-weight: bold;">${item.soLuong || 1}</td>
                        ${config.showNoteColumn ? `<td>${item.ghiChu || item.trangThaiDo || item.ghiChuTra || 'Đầy đủ phụ kiện'}</td>` : ''}
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- 5. Section III: Đặt cọc & Ghi chú -->
        <div class="sec-title">III. ĐẶT CỌC & BÀN GIAO</div>
        <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px;">
            <div>• <strong>Tiền đặt cọc giữ đồ:</strong> <strong>${datCoc}</strong> ${isReturn ? '(Đã làm thủ tục hoàn trả)' : ''}</div>
            <div>• <strong>Ghi chú bổ sung:</strong> ${ghiChu || 'Không có'}</div>
        </div>

        <!-- 6. Section IV: Lưu ý & Quy định -->
        <div class="sec-title">IV. LƯU Ý & QUY ĐỊNH MƯỢN TRẢ ĐỒ</div>
        <div class="terms-block">
            ${terms.map(t => `<p>- ${t}</p>`).join('')}
        </div>

        <!-- 7. Chữ ký xác nhận -->
        <div class="signatures-grid">
            <div class="sig-column">
                <div class="sig-title">${clientSign}</div>
                <div class="sig-guide">${clientSignSub}</div>
                <div class="sig-blank"></div>
                <div class="sig-name">${tenKH1 !== '...................................................' ? tenKH1 : ''}</div>
            </div>
            <div class="sig-column">
                <div class="sig-title">${staffSign}</div>
                <div class="sig-guide">${staffSignSub}</div>
                <div class="sig-blank"></div>
                <div class="sig-name">${nguoiKiem || config.studioName}</div>
            </div>
        </div>
    </div>

    <script>
        function getHtml2Canvas() {
            if (typeof window.html2canvas !== 'undefined') {
                return Promise.resolve(window.html2canvas);
            }
            if (window.opener && typeof window.opener.html2canvas !== 'undefined') {
                return Promise.resolve(window.opener.html2canvas);
            }
            return new Promise(function(resolve, reject) {
                var s = document.createElement('script');
                s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                s.onload = function() { resolve(window.html2canvas); };
                s.onerror = function() { reject(new Error('Không thể tải thư viện html2canvas từ CDN')); };
                document.head.appendChild(s);
            });
        }

        function getJsPdf() {
            if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
                return Promise.resolve(window.jspdf.jsPDF);
            }
            if (typeof window.jsPDF !== 'undefined') {
                return Promise.resolve(window.jsPDF);
            }
            if (window.opener && typeof window.opener.jspdf !== 'undefined' && window.opener.jspdf.jsPDF) {
                return Promise.resolve(window.opener.jspdf.jsPDF);
            }
            if (window.opener && typeof window.opener.jsPDF !== 'undefined') {
                return Promise.resolve(window.opener.jsPDF);
            }
            return new Promise(function(resolve, reject) {
                var s = document.createElement('script');
                s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                s.onload = function() {
                    var cls = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : window.jsPDF;
                    resolve(cls);
                };
                s.onerror = function() { reject(new Error('Không thể tải thư viện jsPDF từ CDN')); };
                document.head.appendChild(s);
            });
        }

        var receiptCode = "${(data.maHopDong || 'Phieu').toString().replace(/[^a-zA-Z0-9_-]/g, '_')}";
        var filePrefix = "${isReturn ? 'PhieuTraDo_' : 'PhieuMuonDo_'}";

        async function saveLoanAsImage() {
            var btn = document.getElementById('btn-save-loan-img');
            if (!btn) return;
            var originalHtml = btn.innerHTML;
            try {
                btn.disabled = true;
                btn.innerHTML = '⏳ Đang tạo ảnh...';

                var h2c = await getHtml2Canvas();
                var target = document.querySelector('.wrapper');
                if (!target) throw new Error('Không tìm thấy nội dung phiếu');

                window.scrollTo(0, 0);

                var canvas = await h2c(target, {
                    scale: 2.5,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    windowWidth: target.scrollWidth,
                    windowHeight: target.scrollHeight
                });

                var link = document.createElement('a');
                link.download = filePrefix + receiptCode + '.png';
                link.href = canvas.toDataURL('image/png', 1.0);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                btn.innerHTML = '✅ Đã tải ảnh!';
                setTimeout(function() {
                    btn.innerHTML = originalHtml;
                    btn.disabled = false;
                }, 2000);
            } catch (err) {
                console.error('Lỗi khi lưu ảnh phiếu:', err);
                alert('Có lỗi khi lưu ảnh phiếu: ' + (err.message || err));
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        }

        async function saveLoanAsPdf() {
            var btn = document.getElementById('btn-save-loan-pdf');
            if (!btn) return;
            var originalHtml = btn.innerHTML;
            try {
                btn.disabled = true;
                btn.innerHTML = '⏳ Đang tạo PDF...';

                var h2c = await getHtml2Canvas();
                var jsPDFClass = await getJsPdf();
                var target = document.querySelector('.wrapper');
                if (!target) throw new Error('Không tìm thấy nội dung phiếu');

                window.scrollTo(0, 0);

                var canvas = await h2c(target, {
                    scale: 2.5,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    windowWidth: target.scrollWidth,
                    windowHeight: target.scrollHeight
                });

                var pdf = new jsPDFClass('p', 'mm', 'a4');
                var a4Ratio = 297 / 210;
                var pageCanvasHeight = Math.floor(canvas.width * a4Ratio);

                if (canvas.height <= pageCanvasHeight + 25) {
                    var mmHeight = (canvas.height * 210) / canvas.width;
                    pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, 210, Math.min(mmHeight, 297));
                } else {
                    var renderedHeight = 0;
                    var pageIndex = 0;

                    while (renderedHeight < canvas.height) {
                        var sliceHeight = Math.min(pageCanvasHeight, canvas.height - renderedHeight);
                        var pageCanvas = document.createElement('canvas');
                        pageCanvas.width = canvas.width;
                        pageCanvas.height = sliceHeight;
                        var ctx = pageCanvas.getContext('2d');
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
                        ctx.drawImage(
                            canvas,
                            0, renderedHeight, canvas.width, sliceHeight,
                            0, 0, canvas.width, sliceHeight
                        );

                        var pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
                        var currentSliceMmHeight = (sliceHeight * 210) / canvas.width;

                        if (pageIndex > 0) {
                            pdf.addPage();
                        }
                        pdf.addImage(pageImgData, 'JPEG', 0, 0, 210, currentSliceMmHeight);

                        renderedHeight += sliceHeight;
                        pageIndex++;
                    }
                }

                pdf.save(filePrefix + receiptCode + '.pdf');

                btn.innerHTML = '✅ Đã tải PDF!';
                setTimeout(function() {
                    btn.innerHTML = originalHtml;
                    btn.disabled = false;
                }, 2000);
            } catch (err) {
                console.error('Lỗi khi tạo file PDF:', err);
                alert('Có lỗi khi tạo file PDF: ' + (err.message || err));
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        }

        window.addEventListener('load', function() {
            setTimeout(function() {
                window.print();
            }, 350);
        });
    </script>
</body>
</html>
    `;
};
