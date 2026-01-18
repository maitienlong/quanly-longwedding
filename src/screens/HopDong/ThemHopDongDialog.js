import { useState, useEffect, useRef } from "react";
import "./ThemHopDongDialog.css";
import AppSearchInput from "../../components/AppSearchInput";

function ThemHopDongDialog({ mode = "add", data, onClose }) {


    const getToday = () => {
        const d = new Date();
        return d.toISOString().split("T")[0];
    };

    const MASTER_PRODUCTS = [
        { maDichVu: 1, tenDichVu: "Gói chụp ảnh cưới STUDIO VIP 1", giaDichVu: "8.000.000đ", tonKho: 10 },
        { maDichVu: 2, tenDichVu: "Nâng cấp váy cưới lên VIP", giaDichVu: "6.000.000đ", tonKho: 5 },
        { maDichVu: 3, tenDichVu: "Nâng cấp ảnh để bàn", giaDichVu: "1.000.000đ", tonKho: 20 },
        { maDichVu: 4, tenDichVu: "Gói quay phim cưới trọn gói", giaDichVu: "10.000.000đ", tonKho: 8 },
        { maDichVu: 5, tenDichVu: "Album ảnh cưới cao cấp", giaDichVu: "5.000.000đ", tonKho: 15 },
        { maDichVu: 6, tenDichVu: "Phụ kiện chụp ảnh cưới", giaDichVu: "2.000.000đ", tonKho: 30 }
    ];

    const generateMaHopDong = () => {
        const year = new Date().getFullYear();
        return `HD-${year}-${Math.floor(100 + Math.random() * 900)}`;
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
        tongTien: 0,
        datCoc: "",
        thanhToan1: "",
        thanhToan2: "",
        sanPham: []
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);
    const [dataIsDialog, setDataIsDialog] = useState(data);

    useEffect(() => {
        console.log("DATA IN DIALOG:", data);

        if (mode === "view" && data) {
            setFormData({
                maHopDong: data.maHopDong,
                tenKhachHang: data.khachHang.chuRe.tenKhachHang,
                soDTCodau: data.khachHang.coDau.soDienThoai,
                soDTChure: data.khachHang.chuRe.soDienThoai,
                ngayHopDong: data.ngayKy,
                diaChiCodau: data.khachHang.coDau.diaChi,
                diaChiChure: data.khachHang.chuRe.diaChi,
                ngayChup: data.ngayChup,
                ngayCuoi: data.ngayCuoi
            });
        }
    }, [mode, data]);


    const suggestions = MASTER_PRODUCTS.filter(p =>
        searchTerm.trim() &&
        p.tenDichVu.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectProduct = (product) => {
        setFormData(prev => {
            const exists = prev.sanPham.find(sp => sp.maDichVu === product.maDichVu);
            if (exists) {
                return {
                    ...prev,
                    sanPham: prev.sanPham.map(sp =>
                        sp.maDichVu === product.maDichVu
                            ? { ...sp, soLuong: sp.soLuong + 1 }
                            : sp
                    )
                };
            }
            return {
                ...prev,
                sanPham: [...prev.sanPham, { ...product, soLuong: 1 }]
            };
        });
        setSearchTerm("");
        setShowSuggestions(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };



    return (
        <div className="dialog-overlay">
            <div className="dialog large">
                <button className="close-btn" onClick={onClose}>×</button>
                <h3 className="dialog-title">{mode === "add" ? "TẠO MỚI HỢP ĐỒNG" : "THÔNG TIN HỢP ĐỒNG"}</h3>

                <div className="dialog-content">
                    <div className="left-column">
                        <h4>Sản phẩm</h4>

                        {/* ===== SEARCH ===== */}
                        <div className="product-search-container" ref={searchRef}>
                            <AppSearchInput
                                value={searchTerm}
                                placeholder="Tìm tên sản phẩm"
                                width="100%"
                                onFocus={() => setShowSuggestions(true)}
                                onChange={(e) => {
                                    const value = e.target ? e.target.value : e;
                                    setSearchTerm(value);
                                    setShowSuggestions(true);
                                }}
                            />

                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="search-suggestions-pop">
                                    {suggestions.map(p => (
                                        <li key={p.maDichVu} onClick={() => handleSelectProduct(p)}>
                                            <span className="p-name">{p.tenDichVu}</span>
                                            <span className="p-price">{p.giaDichVu}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* ===== TABLE ===== */}
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
                                {Array.isArray(formData.sanPham) && formData.sanPham.length > 0 ? (
                                    formData.sanPham.map((sp) => {
                                        const price =
                                            parseInt((sp.giaDichVu || "0").replace(/[^\d]/g, "")) || 0;
                                        const total = price * (sp.soLuong || 0);

                                        return (
                                            <tr key={sp.maDichVu}>
                                                <td>{sp.tenDichVu}</td>
                                                <td style={{ textAlign: "center" }}>{sp.soLuong}</td>
                                                <td>{sp.giaDichVu}</td>
                                                <td>{total.toLocaleString("vi-VN")}đ</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: "center", color: "#999" }}>
                                            Chưa sử dụng dịch vụ
                                        </td>
                                    </tr>
                                )}
                            </tbody>


                        </table>
                    </div>

                    {/* CỘT PHẢI */}
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
                    <button className="btn-save" onClick={() => { }}>Lưu hợp đồng</button>
                </div>
            </div>
        </div>
    );
}

export default ThemHopDongDialog;
