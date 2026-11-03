/**
 * Tiện ích hỗ trợ nhận diện và xử lý lịch trình trang điểm (Makeup)
 * Long Wedding Management System
 */


/**
 * Kiểm tra xem một sản phẩm / dịch vụ trong giỏ hàng có phải là dịch vụ trang điểm hay không
 */
export const isMakeupItem = (item) => {
    if (!item) return false;
    const loai = Number(item.loaiDichVu);
    if (loai === 4) return true;

    const code = String(item.maDichVu || '').toUpperCase();
    if (code.startsWith('MAKEUP_') || code.startsWith('MK_')) return true;

    const name = String(item.tenDichVuSnapshot || item.tenDichVu || '').toLowerCase();
    if (
        name.includes('trang điểm') ||
        name.includes('makeup') ||
        name.includes('make up') ||
        name.includes('make-up')
    ) {
        return true;
    }

    return false;
};

/**
 * Định dạng Date object sang input type="datetime-local" (YYYY-MM-DDTHH:mm)
 */
export const formatTimestampToDateTimeInput = (val) => {
    if (!val) return "";
    const date = new Date(val);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Định dạng Date object sang chuỗi giờ (HH:mm)
 */
export const getTimeStringFromDate = (val) => {
    if (!val) return "";
    const date = new Date(val);
    if (isNaN(date.getTime())) return "";
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

/**
 * Trích xuất toàn bộ lịch trình trang điểm từ một hợp đồng
 * Đảm bảo lấy đầy đủ: các dịch vụ trang điểm phát sinh trong giỏ hàng,
 * lịch trang điểm riêng trong lichTrangDiem, và các lịch chụp/ăn hỏi/cưới có makeup.
 */
export const extractContractMakeupSchedules = (hd) => {
    if (!hd) return [];
    const list = [];
    const cart = Array.isArray(hd.gioHang) ? hd.gioHang : [];

    // 1. Dịch vụ makeup phát sinh từ mảng lichTrangDiem (ưu tiên dữ liệu mới)
    if (Array.isArray(hd.lichTrangDiem) && hd.lichTrangDiem.length > 0) {
        hd.lichTrangDiem.forEach((mk, idx) => {
            if (mk && (mk.ngayTrangDiem || mk.ngay)) {
                const date = new Date(mk.ngayTrangDiem || mk.ngay);
                if (!isNaN(date.getTime())) {
                    list.push({
                        id: mk.id || `mk-item-${hd._id}-${idx}`,
                        source: 'lichTrangDiem',
                        dichVuId: mk.dichVuId,
                        tenDichVu: mk.tenDichVu || 'Dịch vụ Trang Điểm',
                        date,
                        timeStr: mk.gioTrangDiem || mk.gio || getTimeStringFromDate(date) || '07:00',
                        diaDiem: mk.diaDiem || hd.cacNgay?.diaDiemTrangDiem || 'Tại nhà riêng / Theo yêu cầu',
                        thoMakeUp: mk.thoMakeUp || hd.nguoiPhucVu?.thoMakeUp || 'Chưa phân công',
                        ghiChu: mk.ghiChu || ''
                    });
                }
            }
        });
    }

    // 2. Dịch vụ makeup từ từng item trong giỏ hàng (gioHang) nếu chưa có trong list
    cart.forEach((sp, idx) => {
        if (isMakeupItem(sp) && sp.ngayTrangDiem) {
            const date = new Date(sp.ngayTrangDiem);
            if (!isNaN(date.getTime())) {
                const alreadyExists = list.some(item => 
                    item.tenDichVu === (sp.tenDichVuSnapshot || sp.tenDichVu) &&
                    item.date.getTime() === date.getTime()
                );
                if (!alreadyExists) {
                    list.push({
                        id: `mk-cart-${hd._id}-${sp.maDichVu || idx}`,
                        source: 'gioHang',
                        dichVuId: sp.dichVu?._id || sp.dichVu || sp.maDichVu,
                        tenDichVu: sp.tenDichVuSnapshot || sp.tenDichVu || 'Trang điểm',
                        date,
                        timeStr: sp.gioTrangDiem || getTimeStringFromDate(date) || '07:00',
                        diaDiem: sp.diaDiemTrangDiem || 'Tại nhà riêng / Theo yêu cầu',
                        thoMakeUp: sp.thoMakeUp || hd.nguoiPhucVu?.thoMakeUp || 'Chưa phân công',
                        ghiChu: sp.ghiChuTrangDiem || ''
                    });
                }
            }
        }
    });

    // 3. Nếu trong cacNgay có ngayTrangDiem riêng biệt
    if (hd.cacNgay?.ngayTrangDiem) {
        const date = new Date(hd.cacNgay.ngayTrangDiem);
        if (!isNaN(date.getTime())) {
            const alreadyExists = list.some(item => item.date.getTime() === date.getTime());
            if (!alreadyExists) {
                list.push({
                    id: `mk-cacngay-${hd._id}`,
                    source: 'cacNgay',
                    tenDichVu: 'Lịch Trang Điểm Hẹn Riêng',
                    date,
                    timeStr: hd.cacNgay.gioTrangDiem || getTimeStringFromDate(date) || '07:00',
                    diaDiem: hd.cacNgay.diaDiemTrangDiem || 'Tại Studio / Theo yêu cầu',
                    thoMakeUp: hd.nguoiPhucVu?.thoMakeUp || 'Chưa phân công',
                    ghiChu: ''
                });
            }
        }
    }

    return list;
};
