import React, { useState, useEffect } from "react";
import "./ThemHopDongDialog.css";

function ThemHopDongDialog({ onClose, onSave }) {
    const getToday = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };

    const addDays = (dateStr, days) => {
        const date = new Date(dateStr);
        date.setDate(date.getDate() + days);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };

    // Hàm sinh mã hợp đồng ngẫu nhiên (theo năm)
    const generateMaHopDong = () => {
        const year = new Date().getFullYear();
        const random = Math.floor(100 + Math.random() * 900); // ví dụ: 123, 458
        return `HD-${year}-${random}`;
    };

    const [formData, setFormData] = useState({
        tenKhachHang: "",
        soDTCodau: "",
        soDTChure: "",
        ngayHopDong: getToday(),
        diaChiCodau: "",
        diaChiChure: "",
        maHopDong: generateMaHopDong(),
        ngayChup: "",
        ngayDuyet: "",
        ngayTra: "",
        ngayAnHoi: "",
        ngayCuoi: "",
        tongTien: "",
        datCoc: "",
        thanhToan1: "",
        thanhToan2: "",
        sanPham: [
            {
                ten: "Gói chụp ảnh cưới STUDIO VIP 1",
                soLuong: 1,
                gia: "8.000.000đ"
            },
            {
                ten: "Nâng cấp váy cưới lên VIP",
                soLuong: 1,
                gia: "6.000.000đ"
            },
            {
                ten: "Nâng cấp ảnh để bàn",
                soLuong: 5,
                gia: "1.000.000đ"
            }
        ]
    });

    // 1. THÊM STATE CHO TỪ KHÓA TÌM KIẾM
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const tong = formData.sanPham.reduce((sum, sp) => {
            const giaNumber = parseInt((sp.gia || "0").toString().replace(/[^\d]/g, "")) || 0;
            return sum + giaNumber * (sp.soLuong || 0);
        }, 0);

        // Cập nhật tongTien trong formData
        setFormData((prev) => ({ ...prev, tongTien: tong }));
    }, [formData.sanPham]);

    // Lọc danh sách sản phẩm dựa trên từ khóa tìm kiếm
    const filteredSanPham = formData.sanPham.filter(sp =>
        sp.ten.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSave = () => {
        onSave(formData);
    };

    const handleSoLuongChange = (index, value) => {
        const soLuong = parseInt(value) || 0;

        setFormData((prev) => {
            const updated = [...prev.sanPham];
            // Lưu ý: index này là index trong mảng formData.sanPham, không phải trong filteredSanPham
            updated[index].soLuong = soLuong;
            return { ...prev, sanPham: updated };
        });
    };

    // Hàm này sẽ dùng để cập nhật số lượng cho sản phẩm được lọc
    // Để giữ state đồng bộ, ta tìm index gốc của sản phẩm trong formData.sanPham
    const handleFilteredSoLuongChange = (filteredIndex, value) => {
        const soLuong = parseInt(value) || 0;
        const tenSanPham = filteredSanPham[filteredIndex].ten;

        setFormData((prev) => {
            const updated = prev.sanPham.map(sp => {
                if (sp.ten === tenSanPham) {
                    return { ...sp, soLuong: soLuong };
                }
                return sp;
            });
            return { ...prev, sanPham: updated };
        });
    };


    return (
        <div className="dialog-overlay">
            <div className="dialog large">
                <button className="close-btn" onClick={onClose}>×</button>
                <h3 className="dialog-title">THÊM HỢP ĐỒNG MỚI</h3>

                <div className="dialog-content">
                    {/* === CỘT TRÁI: SẢN PHẨM === */}
                    <div className="left-column">
                        <h4>Sản phẩm</h4>
                        <div className="product-controls">
                            {/* 2. THÊM INPUT TÌM KIẾM */}
                            <input
                                type="text"
                                placeholder="🔍 Tìm tên sản phẩm..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="search-input"
                            />
                            {/* <button className="btn-search">🔍 Tìm</button> */}
                            <button className="btn-add">➕ Thêm</button>
                        </div>
                        <table className="product-table">
                            <thead>
                                <tr>
                                    <th>Tên SP</th>
                                    <th>Số lượng</th>
                                    <th>Giá</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* 3. SỬ DỤNG filteredSanPham THAY VÌ formData.sanPham */}
                                {filteredSanPham.length === 0 ? (
                                    <tr><td colSpan="4">Không tìm thấy sản phẩm</td></tr>
                                ) : (
                                    filteredSanPham.map((sp, idx) => {
                                        const giaNumber = parseInt((sp.gia || "0").toString().replace(/[^\d]/g, "")) || 0;
                                        const thanhTien = giaNumber * (sp.soLuong || 0);
                                        const formatCurrency = (num) => num.toLocaleString("vi-VN") + "đ";

                                        return (
                                            <tr key={sp.ten}> {/* Dùng sp.ten làm key thay vì idx để tránh lỗi khi lọc */}
                                                <td>{sp.ten}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={sp.soLuong}
                                                        onChange={(e) => handleFilteredSoLuongChange(idx, e.target.value)}
                                                        style={{
                                                            width: "60px",
                                                            textAlign: "center",
                                                            border: "1px solid #ccc",
                                                            borderRadius: "4px",
                                                        }}
                                                    />
                                                </td>
                                                <td>{sp.gia}</td>
                                                <td>{formatCurrency(thanhTien)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>

                            {/* Tổng cộng - Vẫn tính trên toàn bộ formData.sanPham */}
                            <tfoot>
                                <tr>
                                    <td colSpan="3" style={{ textAlign: "right", fontWeight: "600" }}>
                                        Tổng cộng:
                                    </td>
                                    <td style={{ fontWeight: "700", color: "#d4af37", textAlign: "center" }}>
                                        {
                                            formData.sanPham
                                                .reduce((sum, sp) => {
                                                    const giaNumber = parseInt((sp.gia || "0").toString().replace(/[^\d]/g, "")) || 0;
                                                    return sum + giaNumber * (sp.soLuong || 0);
                                                }, 0)
                                                .toLocaleString("vi-VN") + "đ"
                                        }
                                    </td>
                                </tr>
                            </tfoot>
                        </table>


                        


                    </div>

                    

                    {/* === CỘT PHẢI: KHÁCH HÀNG + HỢP ĐỒNG === */}
                    <div className="right-column">
                        <div className="dialog-section">
                            <h4>Thông tin khách hàng</h4>

                            <div className="floating-label">
                                <input name="tenKhachHang" value={formData.tenKhachHang} onChange={handleChange} required />
                                <label>Tên khách hàng</label>
                            </div>

                            <div className="floating-label">
                                <input name="soDTCodau" value={formData.soDTCodau} onChange={handleChange} required />
                                <label>Số điện thoại cô dâu</label>
                            </div>

                            <div className="floating-label">
                                <input name="soDTChure" value={formData.soDTChure} onChange={handleChange} required />
                                <label>Số điện thoại chú rể</label>
                            </div>

                            <div className="floating-label">
                                <input name="diaChiCodau" value={formData.diaChiCodau} onChange={handleChange} required />
                                <label>Địa chỉ cô dâu</label>
                            </div>

                            <div className="floating-label">
                                <input name="diaChiChure" value={formData.diaChiChure} onChange={handleChange} required />
                                <label>Địa chỉ chú rể</label>
                            </div>
                        </div>

                        <div className="dialog-section">
                            <h4>Thông tin hợp đồng</h4>

                            <div className="floating-label">
                                <input name="maHopDong" value={formData.maHopDong} onChange={handleChange} required />
                                <label>Mã hợp đồng</label>
                            </div>

                            <div className="floating-label">
                                <input type="date" name="ngayHopDong" value={formData.ngayHopDong} onChange={handleChange} required />
                                <label>Ngày hợp đồng</label>
                            </div>

                            <div className="floating-label">
                                <input type="date" name="ngayChup" value={formData.ngayChup} onChange={handleChange} required />
                                <label>Ngày chụp ảnh</label>
                            </div>

                            <div className="floating-label">
                                <input type="date" name="ngayDuyet" value={formData.ngayDuyet} onChange={handleChange} required />
                                <label>Ngày duyệt ảnh</label>
                            </div>

                            <div className="floating-label">
                                <input type="date" name="ngayTra" value={formData.ngayTra} onChange={handleChange} required />
                                <label>Ngày trả ảnh</label>
                            </div>

                            <div className="floating-label">
                                <input type="date" name="ngayAnHoi" value={formData.ngayAnHoi} onChange={handleChange} required />
                                <label>Ngày ăn hỏi</label>
                            </div>

                            <div className="floating-label">
                                <input type="date" name="ngayCuoi" value={formData.ngayCuoi} onChange={handleChange} required />
                                <label>Ngày cưới</label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === DƯỚI CÙNG: THANH TOÁN === */}
                <div className="dialog-section payment">
                    <h4>Thông tin thanh toán</h4>
                    <div className="payment-grid">
                        <div className="floating-label">
                            <input type="number" name="tongTien" value={formData.tongTien} onChange={handleChange} required />
                            <label>Tổng số tiền cần thanh toán</label>
                        </div>

                        <div className="floating-label">
                            <input type="number" name="datCoc" value={formData.datCoc} onChange={handleChange} required />
                            <label>Đặt cọc</label>
                        </div>

                        <div className="floating-label">
                            <input type="number" name="thanhToan1" value={formData.thanhToan1} onChange={handleChange} required />
                            <label>Thanh toán lần 1</label>
                        </div>

                        <div className="floating-label">
                            <input type="number" name="thanhToan2" value={formData.thanhToan2} onChange={handleChange} required />
                            <label>Thanh toán lần 2</label>
                        </div>
                    </div>
                </div>

                <div className="dialog-actions">
                    <button className="btn-cancel" onClick={onClose}>Hủy</button>
                    <button className="btn-save" onClick={handleSave}>Lưu hợp đồng</button>
                </div>
            </div>
        </div>
    );
}

export default ThemHopDongDialog;