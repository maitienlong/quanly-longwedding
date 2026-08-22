// Helper quản lý và lưu trữ cấu hình mẫu in hợp đồng & mẫu in phiếu mượn/trả đồ
import logoVang from '../assets/logo/logo-vang.png';

const CONTRACT_PRINT_CONFIG_KEY = 'longwedding_contract_print_config_v3';
const LOAN_RECEIPT_PRINT_CONFIG_KEY = 'longwedding_loan_receipt_print_config_v3';

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
    terms: [
        "Những sản phẩm không sử dụng không quy đổi thành tiền mặt hoặc hiện vật.",
        "Trang phục được mượn 5 ngày, quá thời hạn sẽ phát sinh thêm chi phí thuê, khách ở tỉnh xa sẽ tạo điều kiện trả muộn.",
        "Đền 100% giá trị Váy Cưới nếu như làm rách, cháy, đổ rượu vang lên váy.",
        "CDCR làm việc với nhà rạp nếu có bật đèn LAZE, cửa hàng sẽ dừng làm việc vì laze quét sẽ hỏng luôn máy.",
        "Nếu như có thắc mắc hoặc chưa hiểu, khách hàng nhắn tin hoặc gọi điện vào hotline: 0868.66.3637",
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
 * Hàm sinh HTML in hợp đồng chuẩn 100% theo mẫu thiết kế có Logo, Section I, II, III, IV
 */
export const generateContractPrintHtml = (data = {}, customConfig = null) => {
    const config = customConfig || getContractPrintConfig();
    const logoSrc = typeof window !== 'undefined' ? `${window.location.origin}${logoVang}` : logoVang;

    const maHopDong = data.maHopDong || '................................';
    const ngayHDFormatted = data.ngayLapHopDongFormatted || data.ngayHDFormatted || '......./......../ 2025';

    const coDau = data.nameKH1 || data.khachHang1?.tenKhachHang || '...................................................';
    const chuRe = data.nameKH2 || data.khachHang2?.tenKhachHang || '...................................................';
    const sdtCoDau = data.phoneKH1 || data.khachHang1?.soDienThoai || '...................................................';
    const sdtChuRe = data.phoneKH2 || data.khachHang2?.soDienThoai || '...................................................';
    const dcCoDau = data.addressKH1 || data.khachHang1?.diaChi || '...................................................';
    const dcChuRe = data.addressKH2 || data.khachHang2?.diaChi || '...................................................';

    const goiPreWedding = data.goiPreWedding || data.tenGoiChup || '';
    const giaPreWedding = data.giaPreWedding || '';
    const goiPhongSu = data.goiPhongSu || '';
    const giaPhongSu = data.giaPhongSu || '';
    const goiQuayPhim = data.goiQuayPhim || '';
    const giaQuayPhim = data.giaQuayPhim || '';

    const trangDiemLuot = data.trangDiemLuot || '';
    const ngayTrangDiem = data.ngayTrangDiem || '';
    const trangDiemThem = data.trangDiemThem || '';

    const ngayChup = data.ngayChupFormatted || '';
    const ngayAnHoi = data.ngayAnHoiFormatted || '';
    const ngayCuoi = data.ngayCuoiFormatted || '';

    const totals = data.totals || {};
    const sl60x90 = totals.soLuongAnh60x90 || data.soLuongAnh60x90 || '';
    const sl20x30 = totals.soLuongAnh20x30 || data.soLuongAnh20x30 || '';
    const albumTrang = totals.albumTrang || data.albumTrang || '';
    const aoDaiAnHoi = data.aoDaiAnHoi || totals.trangPhucCoDauNgayAnHoi || '';
    const vayCuoi = data.vayCuoi || totals.trangPhucVayCuoiNgayCuoi || '';
    const beTrap = data.beTrap || totals.trangPhucChoDoiBeLe || '';
    const vestNgayCuoi = data.vestNgayCuoi || totals.trangPhucVestChuReNgayCuoi || '';

    const tongTien = data.tongTien ? `${Number(data.tongTien).toLocaleString('vi-VN')} VNĐ` : '...................................................................................................................................';
    const datCoc = data.datCoc ? `${Number(data.datCoc).toLocaleString('vi-VN')} đ` : '';
    const daThanhToan = data.daThanhToan ? `${Number(data.daThanhToan).toLocaleString('vi-VN')} đ` : '';
    const conLai = data.conLai ? `${Number(data.conLai).toLocaleString('vi-VN')} đ` : '';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${config.contractTitle} - ${maHopDong}</title>
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
        .contract-wrapper {
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
            width: 130px;
        }
        .logo-img {
            max-height: 48px;
            width: auto;
            object-fit: contain;
        }
        .logo-subtext {
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 1px;
            color: #936f1c;
            margin-top: 1px;
            text-transform: uppercase;
        }
        .contract-meta {
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
        .content-block {
            font-size: 12.5px;
            line-height: 1.4;
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
        .photo-materials {
            margin: 3px 0 4px 0;
        }
        .photo-materials-title {
            font-style: italic;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .check-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2px 15px;
            margin-bottom: 3px;
        }
        .check-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
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
        .items-2col-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2px 15px;
            margin: 3px 0;
            font-size: 12.5px;
        }
        .payment-table {
            width: 100%;
            border-collapse: collapse;
            margin: 3px 0 5px 0;
            text-align: center;
            border: 1.5px solid #000;
        }
        .payment-table th, .payment-table td {
            border: 1px solid #000;
            padding: 3px 5px;
            vertical-align: middle;
            font-size: 12px;
        }
        .payment-table th {
            font-weight: bold;
            font-style: italic;
            background: #fff;
        }
        .payment-table td {
            line-height: 1.2;
        }
        .terms-block {
            font-size: 11.5px;
            line-height: 1.3;
            margin-top: 2px;
        }
        .terms-block p {
            margin: 1px 0;
        }
        .signatures-grid {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
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
            height: 44px;
        }
        .sig-name {
            font-weight: bold;
            font-size: 12.5px;
        }
    </style>
</head>
<body>
    <div class="contract-wrapper">
        <div class="top-header">
            <div class="logo-box">
                <img src="${logoSrc}" alt="Long Wedding Logo" class="logo-img" />
                <div class="logo-subtext">LONG WEDDING</div>
            </div>
            <div class="contract-meta">
                <div>Mã số hợp đồng: <strong>${maHopDong}</strong></div>
                <div>Ngày ký HĐ: <strong>${ngayHDFormatted}</strong></div>
            </div>
        </div>

        <div class="main-heading">
            <h1>${config.contractTitle}</h1>
            <p>${config.contractSubtitle}</p>
        </div>

        <div class="sec-title">I. CÁC BÊN BAO GỒM</div>
        <div class="party-grid">
            <div class="party-a">
                <div class="party-header-title">BÊN A</div>
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
                <div class="party-header-title">BÊN B</div>
                <div class="party-b-title">ẢNH VIỆN ÁO CƯỚI<br/><strong>${config.studioName}</strong></div>
                <div class="party-b-hotline">Hotline: ${config.studioHotline}</div>
            </div>
        </div>

        <div class="sec-title">II. NỘI DUNG HỢP ĐỒNG</div>
        <div class="content-block">
            <div class="content-line">
                <span>- <strong>Chụp ảnh Pre-Wedding</strong></span>
                <span>Gói: ${goiPreWedding || '...................................................'}</span>
                <span>Giá: ${giaPreWedding || '...................................................'}</span>
            </div>
            <div class="content-line">
                <span>- <strong>Chụp ảnh Phóng sự Cưới</strong></span>
                <span>Gói: ${goiPhongSu || '...................................................'}</span>
                <span>Giá: ${giaPhongSu || '...................................................'}</span>
            </div>
            <div class="content-line">
                <span>- <strong>Quay phim Phóng sự Cưới</strong></span>
                <span>Gói: ${goiQuayPhim || '...................................................'}</span>
                <span>Giá: ${giaQuayPhim || '...................................................'}</span>
            </div>
            <div class="content-line-full">
                - <strong>Trang điểm trong gói:</strong> ${trangDiemLuot || '......'} lượt, vào ngày ${ngayTrangDiem || '...............'}, thêm: ${trangDiemThem || '....................................................'}
            </div>

            <div class="dates-highlight">
                <strong>Ngày chụp ảnh:</strong> ${ngayChup || '..... tháng ..... năm 2025'} , 
                <strong>Ăn hỏi:</strong> ${ngayAnHoi || '...... tháng ..... năm 2025'} , 
                <strong>Lễ cưới:</strong> ${ngayCuoi || '...... tháng ..... năm 2025'}
            </div>

            <div class="photo-materials">
                <div class="photo-materials-title">Ảnh phóng 60x90 chất liệu:</div>
                <div class="check-grid">
                    <div class="check-item"><span class="chk-box">${sl60x90 ? '✓' : ''}</span> Ảnh Mika HD bo viền Hàn Quốc: (sl) ${sl60x90 || '......'} cái</div>
                    <div class="check-item"><span class="chk-box"></span> Ảnh Kính cường lực 8K: (sl) ............ cái</div>
                    <div class="check-item"><span class="chk-box"></span> Ảnh 8K siêu trong, siêu phẳng: (sl) .......... cái</div>
                    <div class="check-item"><span class="chk-box"></span> Ảnh Kính LED cường lực 8K: (sl) ......... cái</div>
                </div>
            </div>

            <div class="items-2col-grid">
                <div><strong>Ảnh để bàn 20x30:</strong> ${sl20x30 ? `${sl20x30} cái` : '.......... cái'}</div>
                <div><strong>Ảnh khung treo tường:</strong> ...... bộ .......... cái</div>
                <div><strong>Album kích thước 25x30:</strong> ${albumTrang ? `${albumTrang} trang` : '....... trang'} <span class="chk-box"></span> ảnh bìa</div>
                <div><strong>Ảnh kích thước khác:</strong> ....................................</div>
                <div><strong>Áo dài ăn hỏi:</strong> ${aoDaiAnHoi || '.................................................'}</div>
                <div><strong>Váy cưới:</strong> ${vayCuoi || '....................................................'}</div>
                <div><strong>Đồ bê tráp ăn hỏi:</strong> ${beTrap || '.......... cặp, màu .................'}</div>
                <div><strong>Vest ngày cưới:</strong> ${vestNgayCuoi || '............................................'}</div>
            </div>
        </div>

        <div class="sec-title">III. THANH TOÁN DỊCH VỤ VÀ PHƯƠNG THỨC THANH TOÁN</div>
        <div style="font-size: 12.5px; margin-bottom: 2px;">
            • <strong>Giá dịch vụ:</strong> <strong>${tongTien}</strong>
        </div>
        <div style="font-style: italic; font-size: 12px; margin-bottom: 3px;">
            Bên A thanh toán cho bên B theo các lần sau:
        </div>

        <table class="payment-table">
            <thead>
                <tr>
                    <th style="width: 33.3%;">Lần 1</th>
                    <th style="width: 33.3%;">Lần 2</th>
                    <th style="width: 33.3%;">Lần 3</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>Đặt cọc đảm bảo thực hiện dịch vụ</strong><br/>
                        <span style="font-size: 10.5px; color: #333;">(tối thiểu 500K)</span>
                        ${datCoc ? `<div style="font-weight: bold; color: #16a34a; margin-top: 1px;">${datCoc}</div>` : ''}
                    </td>
                    <td>
                        <strong>Thanh toán trước khi chụp hình</strong><br/>
                        <span style="font-size: 10.5px; color: #333;">(80%)</span>
                        ${daThanhToan ? `<div style="font-weight: bold; color: #0284c7; margin-top: 1px;">${daThanhToan}</div>` : ''}
                    </td>
                    <td>
                        <strong>Thanh toán trước khi bàn giao ảnh</strong><br/>
                        <span style="font-size: 10.5px; color: #333;">(còn lại)</span>
                        ${conLai ? `<div style="font-weight: bold; color: #dc2626; margin-top: 1px;">${conLai}</div>` : ''}
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="sec-title">IV. LƯU Ý</div>
        <div class="terms-block">
            ${config.terms.map(t => `<p>- ${t}</p>`).join('')}
        </div>

        <div class="signatures-grid">
            <div class="sig-column">
                <div class="sig-title">${config.clientSignTitle}</div>
                <div class="sig-guide">${config.clientSignSubtitle}</div>
                <div class="sig-blank"></div>
                <div class="sig-name">${coDau !== '...................................................' ? coDau : ''}</div>
            </div>
            <div class="sig-column">
                <div class="sig-title">${config.studioSignTitle}</div>
                <div class="sig-guide">${config.studioSignSubtitle}</div>
                <div class="sig-blank"></div>
                <div class="sig-name">${config.studioName}</div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

/**
 * Hàm sinh HTML in Phiếu Mượn Đồ / Phiếu Trả Đồ chuẩn phong cách đồng bộ với Hợp Đồng
 */
export const generateLoanReceiptPrintHtml = (data = {}, isReturn = false, customConfig = null) => {
    const config = customConfig || getLoanReceiptPrintConfig();
    const logoSrc = typeof window !== 'undefined' ? `${window.location.origin}${logoVang}` : logoVang;

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
            width: 130px;
        }
        .logo-img {
            max-height: 48px;
            width: auto;
            object-fit: contain;
        }
        .logo-subtext {
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 1px;
            color: #936f1c;
            margin-top: 1px;
            text-transform: uppercase;
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
    </style>
</head>
<body>
    <div class="wrapper">
        <!-- 1. Header Logo & Meta -->
        <div class="top-header">
            <div class="logo-box">
                <img src="${logoSrc}" alt="Long Wedding Logo" class="logo-img" />
                <div class="logo-subtext">LONG WEDDING</div>
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
</body>
</html>
    `;
};
