import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { getLoaiDichVuLabel, getServiceTypesCache } from './serviceTypesHelper';

/**
 * Danh sách ánh xạ tên loại dịch vụ
 */
export const SERVICE_TYPE_MAP = {
    1: 'Trang Phục',
    2: 'Gói Dịch Vụ',
    3: 'Ảnh',
    4: 'Trang Điểm',
    5: 'Thiệp Cưới Online'
};

export const REVERSE_SERVICE_TYPE_MAP = {
    'trang phục': 1,
    'trang phuc': 1,
    'clothing': 1,
    '1': 1,
    'gói dịch vụ': 2,
    'goi dich vu': 2,
    'service': 2,
    'gói': 2,
    'goi': 2,
    '2': 2,
    'ảnh': 3,
    'anh': 3,
    'lab': 3,
    'ảnh lab': 3,
    'in ấn': 3,
    'in an': 3,
    '3': 3,
    'trang điểm': 4,
    'trang diem': 4,
    'makeup': 4,
    'make up': 4,
    '4': 4
};

/**
 * Hàm phân giải loại dịch vụ từ chuỗi hoặc số
 */
export const resolveLoaiDichVu = (val) => {
    if (!val) return 1;
    if (typeof val === 'number') {
        return [1, 2, 3, 4].includes(val) ? val : 1;
    }
    const cleanStr = String(val).trim().toLowerCase();
    if (REVERSE_SERVICE_TYPE_MAP[cleanStr]) return REVERSE_SERVICE_TYPE_MAP[cleanStr];
    try {
        const cached = getServiceTypesCache();
        const found = cached.find(t => t.name.toLowerCase() === cleanStr || String(t.id) === cleanStr);
        if (found) return found.id;
    } catch (e) {}
    return 1;
};

/**
 * Xuất danh sách sản phẩm / dịch vụ ra file Excel (.xlsx)
 */
export const exportServicesToExcel = (services = [], customFilename = '') => {
    try {
        if (!services || services.length === 0) {
            toast.error("Không có dữ liệu dịch vụ để xuất Excel!");
            return false;
        }

        // Định dạng dữ liệu cho từng dòng
        const excelRows = services.map((s, index) => {
            const loaiDichVuNum = Number(s.loaiDichVu) || 1;
            const loaiDichVuText = getLoaiDichVuLabel(loaiDichVuNum) || SERVICE_TYPE_MAP[loaiDichVuNum] || 'Khác';

            return {
                "STT": index + 1,
                "Mã Dịch Vụ (*)": s.maDichVu || '',
                "Tên Dịch Vụ (*)": s.tenDichVu || '',
                "Loại Dịch Vụ (*)": loaiDichVuText,
                "Mã Loại (1:Trang Phục, 2:Gói, 3:Ảnh, 4:Makeup)": loaiDichVuNum,
                "Giá Bán / Gói (VNĐ) (*)": Number(s.giaTriDichVu) || 0,
                "Giá Cho Thuê (VNĐ)": Number(s.giaChoThueDichVu) || 0,
                "Số Lượng Tồn Kho": s.tonKhoDichVu !== undefined ? Number(s.tonKhoDichVu) : 0,
                "Mô Tả Dịch Vụ": s.moTaDichVu || '',
                "SL Ảnh Chỉnh Sửa": s.soLuongAnhChinhSua || 0,
                "SL Ảnh 16x21": s.soLuongAnh16x21 || 0,
                "SL Ảnh 20x30": s.soLuongAnh20x30 || 0,
                "SL Ảnh 60x90": s.soLuongAnh60x90 || 0,
                "Trang Điểm Ăn Hỏi": s.trangDiemNgayAnHoi || '',
                "Trang Điểm Ngày Cưới": s.trangDiemNgayCuoi || '',
                "Trang Phục Bê Lễ": s.trangPhucChoDoiBeLe || '',
                "TP Cô Dâu Ăn Hỏi": s.trangPhucCoDauNgayAnHoi || '',
                "TP Chú Rể Ăn Hỏi": s.trangPhucChuReNgayAnHoi || '',
                "Váy Cưới Ngày Cưới": s.trangPhucVayCuoiNgayCuoi || '',
                "Vest Chú Rể Ngày Cưới": s.trangPhucVestChuReNgayCuoi || '',
                "Hoa Cầm Tay": s.hoaCamTay || ''
            };
        });

        // Tạo worksheet
        const ws = XLSX.utils.json_to_sheet(excelRows);

        // Thiết lập độ rộng cột cho đẹp mắt
        ws['!cols'] = [
            { wch: 6 },   // STT
            { wch: 18 },  // Mã Dịch Vụ
            { wch: 32 },  // Tên Dịch Vụ
            { wch: 16 },  // Loại Dịch Vụ
            { wch: 10 },  // Mã Loại
            { wch: 22 },  // Giá Bán
            { wch: 20 },  // Giá Cho Thuê
            { wch: 16 },  // Tồn Kho
            { wch: 36 },  // Mô Tả
            { wch: 16 },  // SL Ảnh CS
            { wch: 14 },  // SL 16x21
            { wch: 14 },  // SL 20x30
            { wch: 14 },  // SL 60x90
            { wch: 24 },  // Makeup Ăn hỏi
            { wch: 24 },  // Makeup Cưới
            { wch: 24 },  // TP Bê Lễ
            { wch: 22 },  // TP Cô Dâu AH
            { wch: 22 },  // TP Chú Rể AH
            { wch: 24 },  // Váy Cưới
            { wch: 24 },  // Vest Cưới
            { wch: 20 }   // Hoa Cầm Tay
        ];

        // Tạo workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Danh Sách Dịch Vụ");

        // Tạo tên file
        const now = new Date();
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        const fileName = customFilename || `Danh_Sach_Dich_Vu_LongWedding_${timestamp}.xlsx`;

        // Tải xuống file
        XLSX.writeFile(wb, fileName);
        toast.success(`Đã xuất thành công ${services.length} dịch vụ ra file Excel!`);
        return true;
    } catch (err) {
        console.error("Lỗi khi xuất file Excel:", err);
        toast.error("Lỗi khi xuất file Excel: " + err.message);
        return false;
    }
};

/**
 * Tải file Excel mẫu để người dùng nhập liệu
 */
export const downloadServiceExcelTemplate = () => {
    try {
        const sampleData = [
            {
                "Mã Dịch Vụ (*)": "CLOTHING_001",
                "Tên Dịch Vụ (*)": "Váy Cưới Luxury Hoàng Gia Đính Đá",
                "Loại Dịch Vụ (*)": "Trang Phục",
                "Mã Loại (1:Trang Phục, 2:Gói, 3:Ảnh, 4:Makeup)": 1,
                "Giá Bán / Gói (VNĐ) (*)": 15000000,
                "Giá Cho Thuê (VNĐ)": 5000000,
                "Số Lượng Tồn Kho": 3,
                "Mô Tả Dịch Vụ": "Váy cưới thiết kế cao cấp tay dài đính pha lê Swarovski",
                "SL Ảnh Chỉnh Sửa": 0,
                "SL Ảnh 16x21": 0,
                "SL Ảnh 20x30": 0,
                "SL Ảnh 60x90": 0,
                "Trang Điểm Ăn Hỏi": "",
                "Trang Điểm Ngày Cưới": "",
                "Trang Phục Bê Lễ": "",
                "TP Cô Dâu Ăn Hỏi": "",
                "TP Chú Rể Ăn Hỏi": "",
                "Váy Cưới Ngày Cưới": "",
                "Vest Chú Rể Ngày Cưới": "",
                "Hoa Cầm Tay": ""
            },
            {
                "Mã Dịch Vụ (*)": "SERVICE_001",
                "Tên Dịch Vụ (*)": "Gói Chụp Ảnh Cưới Studio Diamond",
                "Loại Dịch Vụ (*)": "Gói Dịch Vụ",
                "Mã Loại (1:Trang Phục, 2:Gói, 3:Ảnh, 4:Makeup)": 2,
                "Giá Bán / Gói (VNĐ) (*)": 9500000,
                "Giá Cho Thuê (VNĐ)": 0,
                "Số Lượng Tồn Kho": 999,
                "Mô Tả Dịch Vụ": "Gói chụp trọn gói tại Studio Long Wedding kèm trang điểm và váy cưới cao cấp",
                "SL Ảnh Chỉnh Sửa": 30,
                "SL Ảnh 16x21": 10,
                "SL Ảnh 20x30": 2,
                "SL Ảnh 60x90": 2,
                "Trang Điểm Ăn Hỏi": "01 Lần makeup cô dâu",
                "Trang Điểm Ngày Cưới": "01 Lần makeup cô dâu + 1 mẹ",
                "Trang Phục Bê Lễ": "5 Áo dài nam, 5 áo dài nữ",
                "TP Cô Dâu Ăn Hỏi": "01 Áo dài lụa thêu hoa",
                "TP Chú Rể Ăn Hỏi": "01 Áo dài truyền thống",
                "Váy Cưới Ngày Cưới": "01 Váy Luxury 10.000.000đ",
                "Vest Chú Rể Ngày Cưới": "01 Bộ vest đen cao cấp",
                "Hoa Cầm Tay": "01 Bó hoa hồng tươi cao cấp"
            },
            {
                "Mã Dịch Vụ (*)": "LAB_001",
                "Tên Dịch Vụ (*)": "Ảnh Phóng 60x90 Tráng Gương Cao Cấp",
                "Loại Dịch Vụ (*)": "Ảnh",
                "Mã Loại (1:Trang Phục, 2:Gói, 3:Ảnh, 4:Makeup)": 3,
                "Giá Bán / Gói (VNĐ) (*)": 850000,
                "Giá Cho Thuê (VNĐ)": 0,
                "Số Lượng Tồn Kho": 50,
                "Mô Tả Dịch Vụ": "Ảnh ép gỗ pha lê bóng, độ bền màu trên 20 năm",
                "SL Ảnh Chỉnh Sửa": 0,
                "SL Ảnh 16x21": 0,
                "SL Ảnh 20x30": 0,
                "SL Ảnh 60x90": 1,
                "Trang Điểm Ăn Hỏi": "",
                "Trang Điểm Ngày Cưới": "",
                "Trang Phục Bê Lễ": "",
                "TP Cô Dâu Ăn Hỏi": "",
                "TP Chú Rể Ăn Hỏi": "",
                "Váy Cưới Ngày Cưới": "",
                "Vest Chú Rể Ngày Cưới": "",
                "Hoa Cầm Tay": ""
            },
            {
                "Mã Dịch Vụ (*)": "MAKEUP_001",
                "Tên Dịch Vụ (*)": "Gói Makeup Cô Dâu Ngày Cưới Tại Nhà",
                "Loại Dịch Vụ (*)": "Trang Điểm",
                "Mã Loại (1:Trang Phục, 2:Gói, 3:Ảnh, 4:Makeup)": 4,
                "Giá Bán / Gói (VNĐ) (*)": 2000000,
                "Giá Cho Thuê (VNĐ)": 0,
                "Số Lượng Tồn Kho": 100,
                "Mô Tả Dịch Vụ": "Makeup phong cách tone trong trẻo Hàn Quốc kèm làm tóc cô dâu",
                "SL Ảnh Chỉnh Sửa": 0,
                "SL Ảnh 16x21": 0,
                "SL Ảnh 20x30": 0,
                "SL Ảnh 60x90": 0,
                "Trang Điểm Ăn Hỏi": "",
                "Trang Điểm Ngày Cưới": "01 Lần makeup tại nhà",
                "Trang Phục Bê Lễ": "",
                "TP Cô Dâu Ăn Hỏi": "",
                "TP Chú Rể Ăn Hỏi": "",
                "Váy Cưới Ngày Cưới": "",
                "Vest Chú Rể Ngày Cưới": "",
                "Hoa Cầm Tay": ""
            }
        ];

        // Sheet 1: Mẫu nhập liệu
        const wsTemplate = XLSX.utils.json_to_sheet(sampleData);
        wsTemplate['!cols'] = [
            { wch: 18 },  // Mã Dịch Vụ
            { wch: 34 },  // Tên Dịch Vụ
            { wch: 16 },  // Loại Dịch Vụ
            { wch: 12 },  // Mã Loại
            { wch: 22 },  // Giá Bán
            { wch: 20 },  // Giá Cho Thuê
            { wch: 16 },  // Tồn Kho
            { wch: 38 },  // Mô Tả
            { wch: 16 },  // SL Ảnh CS
            { wch: 14 },  // SL 16x21
            { wch: 14 },  // SL 20x30
            { wch: 14 },  // SL 60x90
            { wch: 24 },  // Makeup Ăn hỏi
            { wch: 24 },  // Makeup Cưới
            { wch: 24 },  // TP Bê Lễ
            { wch: 22 },  // TP Cô Dâu AH
            { wch: 22 },  // TP Chú Rể AH
            { wch: 24 },  // Váy Cưới
            { wch: 24 },  // Vest Cưới
            { wch: 20 }   // Hoa Cầm Tay
        ];

        // Sheet 2: Hướng dẫn
        const guideData = [
            ["HƯỚNG DẪN NHẬP LIỆU FILE EXCEL SẢN PHẨM / DỊCH VỤ - LONG WEDDING"],
            [""],
            ["1. CÁC TRƯỜNG BẮT BUỘC (*) :"],
            ["   - Mã Dịch Vụ: Mã duy nhất không trùng lặp (Khuyên dùng tiền tố: CLOTHING_ cho Trang Phục, SERVICE_ cho Gói Dịch Vụ, LAB_ cho Ảnh, MAKEUP_ cho Trang Điểm)"],
            ["   - Tên Dịch Vụ: Tên sản phẩm hoặc dịch vụ"],
            ["   - Loại Dịch Vụ: Có thể ghi chữ (Trang Phục, Gói Dịch Vụ, Ảnh, Trang Điểm) hoặc điền số mã loại (1: Trang Phục, 2: Gói Dịch Vụ, 3: Ảnh, 4: Trang Điểm)"],
            ["   - Giá Bán / Gói: Số tiền (VNĐ), chỉ nhập số (VD: 5000000)"],
            [""],
            ["2. QUY ĐỊNH LOẠI DỊCH VỤ:"],
            ["   - 1 hoặc 'Trang Phục': Trang phục cưới, áo dài, vest, phụ kiện"],
            ["   - 2 hoặc 'Gói Dịch Vụ': Gói chụp studio, phóng sự cưới, trọn gói (hỗ trợ nhập thêm các thông số chi tiết ở các cột sau)"],
            ["   - 3 hoặc 'Ảnh': Ảnh in ấn, ảnh phóng, album photobook, khung ảnh"],
            ["   - 4 hoặc 'Trang Điểm': Dịch vụ makeup cô dâu, tiệc, ăn hỏi"],
            [""],
            ["3. LƯU Ý:"],
            ["   - Không đổi tên tiêu đề cột ở dòng 1 của Sheet 'Mẫu Nhập Liệu'."],
            ["   - Khi nhập nếu mã dịch vụ đã tồn tại, hệ thống sẽ tự động cập nhật thông tin mới nhất theo lựa chọn của bạn."]
        ];

        const wsGuide = XLSX.utils.aoa_to_sheet(guideData);
        wsGuide['!cols'] = [{ wch: 100 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsTemplate, "Mẫu Nhập Liệu");
        XLSX.utils.book_append_sheet(wb, wsGuide, "Hướng Dẫn");

        XLSX.writeFile(wb, "Mau_Nhap_Dich_Vu_LongWedding.xlsx");
        toast.success("Đã tải xuống file mẫu Excel!");
    } catch (err) {
        console.error("Lỗi khi tải file mẫu Excel:", err);
        toast.error("Lỗi khi tạo file mẫu Excel: " + err.message);
    }
};

/**
 * Đọc và phân tích dữ liệu file Excel tải lên từ người dùng
 */
export const parseServicesFromExcel = async (file) => {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    // Lấy sheet đầu tiên
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    // Chuyển đổi thành mảng JSON
                    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                    if (!rawRows || rawRows.length === 0) {
                        return resolve({
                            validItems: [],
                            invalidItems: [],
                            total: 0,
                            error: "File Excel rỗng hoặc không chứa dữ liệu!"
                        });
                    }

                    const validItems = [];
                    const invalidItems = [];

                    rawRows.forEach((row, index) => {
                        const rowNum = index + 2; // +2 vì có dòng tiêu đề và index từ 0

                        // Tìm các giá trị linh hoạt theo nhiều kiểu đặt tên cột
                        const maDichVu = String(
                            row["Mã Dịch Vụ (*)"] || 
                            row["Mã Dịch Vụ"] || 
                            row["Mã dịch vụ"] || 
                            row["maDichVu"] || 
                            row["MaDichVu"] || 
                            row["Mã"] || ''
                        ).trim();

                        const tenDichVu = String(
                            row["Tên Dịch Vụ (*)"] || 
                            row["Tên Dịch Vụ"] || 
                            row["Tên dịch vụ"] || 
                            row["tenDichVu"] || 
                            row["TenDichVu"] || 
                            row["Tên"] || ''
                        ).trim();

                        const loaiDichVuRaw = 
                            row["Mã Loại (1:Trang Phục, 2:Gói, 3:Ảnh, 4:Makeup)"] || 
                            row["Loại Dịch Vụ (*)"] || 
                            row["Loại Dịch Vụ"] || 
                            row["Loại dịch vụ"] || 
                            row["loaiDichVu"] || 
                            row["LoaiDichVu"] || 1;

                        const loaiDichVu = resolveLoaiDichVu(loaiDichVuRaw);

                        // Parse tiền & số lượng
                        const parseNumber = (val) => {
                            if (val === undefined || val === null || val === '') return 0;
                            if (typeof val === 'number') return val;
                            const cleaned = String(val).replace(/[^0-9.-]+/g, "");
                            return Number(cleaned) || 0;
                        };

                        const giaTriDichVu = parseNumber(
                            row["Giá Bán / Gói (VNĐ) (*)"] || 
                            row["Giá Bán / Gói (VNĐ)"] || 
                            row["Giá Bán"] || 
                            row["Giá bán"] || 
                            row["giaTriDichVu"] || 
                            row["Giá"]
                        );

                        const giaChoThueDichVu = parseNumber(
                            row["Giá Cho Thuê (VNĐ)"] || 
                            row["Giá Cho Thuê"] || 
                            row["Giá cho thuê"] || 
                            row["giaChoThueDichVu"] || 
                            row["Giá thuê"]
                        );

                        const tonKhoDichVu = parseNumber(
                            row["Số Lượng Tồn Kho"] || 
                            row["Tồn Kho"] || 
                            row["Tồn kho"] || 
                            row["tonKhoDichVu"] || 0
                        );

                        const moTaDichVu = String(
                            row["Mô Tả Dịch Vụ"] || 
                            row["Mô Tả"] || 
                            row["Mô tả"] || 
                            row["moTaDichVu"] || ''
                        ).trim();

                        // Package parameters
                        const soLuongAnhChinhSua = parseNumber(row["SL Ảnh Chỉnh Sửa"] || row["soLuongAnhChinhSua"]);
                        const soLuongAnh16x21 = parseNumber(row["SL Ảnh 16x21"] || row["soLuongAnh16x21"]);
                        const soLuongAnh20x30 = parseNumber(row["SL Ảnh 20x30"] || row["soLuongAnh20x30"]);
                        const soLuongAnh60x90 = parseNumber(row["SL Ảnh 60x90"] || row["soLuongAnh60x90"]);
                        const trangDiemNgayAnHoi = String(row["Trang Điểm Ăn Hỏi"] || row["trangDiemNgayAnHoi"] || '').trim();
                        const trangDiemNgayCuoi = String(row["Trang Điểm Ngày Cưới"] || row["trangDiemNgayCuoi"] || '').trim();
                        const trangPhucChoDoiBeLe = String(row["Trang Phục Bê Lễ"] || row["trangPhucChoDoiBeLe"] || '').trim();
                        const trangPhucCoDauNgayAnHoi = String(row["TP Cô Dâu Ăn Hỏi"] || row["trangPhucCoDauNgayAnHoi"] || '').trim();
                        const trangPhucChuReNgayAnHoi = String(row["TP Chú Rể Ăn Hỏi"] || row["trangPhucChuReNgayAnHoi"] || '').trim();
                        const trangPhucVayCuoiNgayCuoi = String(row["Váy Cưới Ngày Cưới"] || row["trangPhucVayCuoiNgayCuoi"] || '').trim();
                        const trangPhucVestChuReNgayCuoi = String(row["Vest Chú Rể Ngày Cưới"] || row["trangPhucVestChuReNgayCuoi"] || '').trim();
                        const hoaCamTay = String(row["Hoa Cầm Tay"] || row["hoaCamTay"] || '').trim();

                        // Kiểm tra hợp lệ
                        if (!maDichVu && !tenDichVu) {
                            // Dòng rỗng, bỏ qua
                            return;
                        }

                        const errors = [];
                        if (!maDichVu) errors.push("Thiếu mã dịch vụ");
                        if (!tenDichVu) errors.push("Thiếu tên dịch vụ");

                        const parsedItem = {
                            rowNum,
                            maDichVu,
                            tenDichVu,
                            loaiDichVu,
                            loaiDichVuText: SERVICE_TYPE_MAP[loaiDichVu] || 'Trang Phục',
                            giaTriDichVu,
                            giaChoThueDichVu,
                            tonKhoDichVu,
                            moTaDichVu,
                            imageDichVu: '',
                            soLuongAnhChinhSua,
                            soLuongAnh16x21,
                            soLuongAnh20x30,
                            soLuongAnh60x90,
                            trangDiemNgayAnHoi,
                            trangDiemNgayCuoi,
                            trangPhucChoDoiBeLe,
                            trangPhucCoDauNgayAnHoi,
                            trangPhucChuReNgayAnHoi,
                            trangPhucVayCuoiNgayCuoi,
                            trangPhucVestChuReNgayCuoi,
                            hoaCamTay
                        };

                        if (errors.length > 0) {
                            invalidItems.push({
                                ...parsedItem,
                                errors: errors.join(", ")
                            });
                        } else {
                            validItems.push(parsedItem);
                        }
                    });

                    resolve({
                        validItems,
                        invalidItems,
                        total: validItems.length + invalidItems.length
                    });
                } catch (err) {
                    console.error("Lỗi khi phân tích file Excel:", err);
                    reject(err);
                }
            };

            reader.onerror = (err) => reject(err);
            reader.readAsArrayBuffer(file);
        } catch (err) {
            reject(err);
        }
    });
};
