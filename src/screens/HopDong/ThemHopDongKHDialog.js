import { useState, useEffect, useRef } from "react";
import "./ThemHopDongDialog.css";
import AppSearchInput from "../../components/AppSearchInput";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import otherService from '../../API/services/otherService';
import TextField from '@mui/material/TextField';
import { toast } from 'sonner';
import { useLoading } from "../../context/LoadingContext";
import { NumericFormat } from 'react-number-format';

function ThemHopDongKHDialog(props) {
    const { onClose, data, selectedValue, open } = props;
    const handleClose = () => {
        onClose(selectedValue);
    };
    const { showLoading, hideLoading } = useLoading();
    const [listDichVu, setListDichVu] = useState([]);

    const [phoneKH1, setPhoneKH1] = useState("");
    const [phoneKH2, setPhoneKH2] = useState("");
    const [nameKH1, setNameKH1] = useState("");
    const [nameKH2, setNameKH2] = useState("");
    const [addressKH1, setAddressKH1] = useState("");
    const [addressKH2, setAddressKH2] = useState("");

    const commonHeight = 56;

    const handleListItemClick = (value) => {
        onClose(value);
    };

    const getToday = () => {
        const d = new Date();
        return d.toISOString().split("T")[0];
    };
    const nameRef = useRef(null);
    useEffect(() => {
        nameRef.current?.focus();
        showLoading("Đang tải các dịch vụ.");
        otherService.findDichVu()
            .then((response) => {
                setListDichVu(response.data.dichVu);
                toast.success("Tải dữ liệu dịch vụ thành công!");
                hideLoading();
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                toast.error("Lỗi khi tải dữ liệu dịch vụ.");
                hideLoading();
            });
    }, [showLoading, hideLoading]);


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
        trangPhucChup: "",
        trangPhucAnHoi: "",
        trangPhucCuoi: "",
        thanhToan1: "",
        thanhToan2: "",
        sanPham: []
    });

    const [khachHang1, setKhachHang1] = useState('');

    const [searchTerm, setSearchTerm] = useState("");
    const [searchTermTPC, setSearchTermTPC] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showSuggestionsTPC, setShowSuggestionsTPC] = useState(false);
    const searchRef = useRef(null);
    const [dataIsDialog, setDataIsDialog] = useState(data);

    const suggestions = listDichVu.filter(p =>
        searchTerm.trim() &&
        p.tenDichVu.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const SearchSuggestApp = ({ searchTermTPC, setShowSuggestionsTPC, suggestions, handleSelectProduct }) => {
        return (
            <div>
                <AppSearchInput
                    value={searchTermTPC}
                    placeholder="Tìm tên hoặc mã trang phục"
                    width="100%"
                    onFocus={() => setShowSuggestionsTPC(true)}
                    onChange={(e) => {
                        const value = e.target ? e.target.value : e;
                        setSearchTermTPC(value);
                        setShowSuggestionsTPC(true);
                    }}
                />
                {showSuggestionsTPC && suggestions.length > 0 && (
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
        );
    }


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
                    ),
                    tongTien: prev.sanPham.reduce((total, sp) => total + (sp.giaDichVu * (sp.soLuong || 0)), 0)
                };
            }
            return {
                ...prev,
                sanPham: [...prev.sanPham, { ...product, soLuong: 1 }],
                tongTien: prev.sanPham.reduce((total, sp) => total + (sp.giaDichVu * (sp.soLuong || 0)), 0) + product.giaDichVu
            };

        });
        setSearchTerm("");
        setShowSuggestions(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    const onChangePhoneKH1 = (e) => {
        const { name, value } = e.target;
      
        setPhoneKH1(value);
        otherService.findKhachHang({ soDienThoai: value })
            .then((response) => {
                console.log(response);
                toast.success("Tìm kiếm khách hàng thành công!");
            })
            .catch((error) => {
                toast.error("Lỗi khi tìm kiếm khách hàng.");
            });
    };

    return (
        <Dialog onClose={handleClose} open={open}
            fullWidth
            maxWidth="lg"
        >
            <div className="dialog-overlay">
                <div className="dialog large">
                    <button className="close-btn" onClick={onClose}>×</button>
                    <h3 className="dialog-title">TẠO HỢP ĐỒNG MỚI</h3>

                    <div className="dialog-content">
                        <div className="left-column">
                            <h4>Sản phẩm</h4>

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
                                            const price = parseFloat(sp.giaDichVu.toString().replace(/[^0-9.-]+/g, ""));
                                            const total = price * (sp.soLuong || 0);
                                            return (
                                                <tr key={sp.maDichVu}>
                                                    <td>{sp.tenDichVu}</td>
                                                    <td style={{ textAlign: "center" }}>{sp.soLuong}</td>
                                                    <td>{sp.giaDichVu.toLocaleString("vi-VN")}đ</td>
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
                                <h4>Thông tin khách hàng 1</h4>
                                <div className="floating-label">
                                    <input name="phoneKH1" value={phoneKH1} onChange={onChangePhoneKH1} maxLength={10} required />
                                    <label>Phone khách hàng 1</label>
                                </div>

                                <div className="floating-label">
                                    <input name="tenKhachHang" value={nameKH1} onChange={(e) => { setNameKH1(e.value) }} required />
                                    <label>Tên khách hàng</label>
                                </div>

                                <div className="floating-label">
                                    <input name="diaChiCodau" value={addressKH1} onChange={(e) => { setAddressKH1(e.value) }} required />
                                    <label>Địa chỉ</label>
                                </div>

                                <Button
                                    onClick={() => { }}
                                    color="success"
                                    variant="contained"
                                    sx={{
                                        whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                                    }}
                                >Tạo khách hàng mới</Button>
                            </div>

                            <div className="dialog-section">
                                <h4>Thông tin khách hàng 2</h4>
                                <div className="floating-label">
                                    <input name="phoneKH2" value={phoneKH2} maxLength={10} required />
                                    <label>Phone khách hàng 2</label>
                                </div>

                                <div className="floating-label">
                                    <input name="tenKhachHang" value={nameKH2} onChange={(e) => { setNameKH2(e.value) }} required />
                                    <label>Tên khách hàng 2</label>
                                </div>

                                <div className="floating-label">
                                    <input name="diaChiCodau" value={addressKH2} onChange={(e) => { setAddressKH2(e.value) }} required />
                                    <label>Địa chỉ khách hàng 2</label>
                                </div>

                                <Button
                                    onClick={() => { }}
                                    color="success"
                                    variant="contained"
                                    sx={{
                                        whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                                    }}
                                >Tạo khách hàng mới</Button>
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

                    {/* <div className="dialog-section payment">
                        <h4>Thông tin chuyên viên phục vụ</h4>
                        <div className="colorthing-grid">
                            <div className="floating-label">
                                <input name="maHopDong" value={formData.trangPhucChup} onChange={handleChange} required />
                                <label>Trang điểm</label>
                            </div>

                            <div className="floating-label">
                                <input name="maHopDong" value={formData.trangPhucAnHoi} onChange={handleChange} required />
                                <label>Chụp ảnh</label>
                            </div>

                            <div className="floating-label">
                                <input name="maHopDong" value={formData.trangPhucCuoi} onChange={handleChange} required />
                                <label>Photoshop</label>
                            </div>
                        </div>
                    </div> */}

                    {/* === DƯỚI CÙNG: THANH TOÁN === */}
                    <div className="dialog-section payment">
                        <h4>Thông tin thanh toán</h4>
                        <div className="payment-grid">
                            <TextField
                                id="outlined-read-only-input"
                                label="Tổng tiền cần thanh toán"
                                type="text"
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                                value={formData.tongTien.toLocaleString("vi-VN") + "đ"}
                                sx={{
                                    height: commonHeight, // Ép chiều cao bằng với 2 input trên
                                    whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                                }}
                            />
                            <TextField
                                required
                                id="outlined-required"
                                label="Sô tiền thanh toán"
                                defaultValue={0}
                                sx={{
                                    height: commonHeight, // Ép chiều cao bằng với 2 input trên
                                    whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                                }}
                            />

                        </div>
                    </div>

                    <div className="dialog-actions">
                        <Button
                            onClick={onClose}
                            variant="contained"
                            color="error"
                            sx={{
                                height: commonHeight, // Ép chiều cao bằng với 2 input trên
                                whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                            }}
                        >Thoát</Button>
                        <Button
                            onClick={() => { }}
                            variant="contained"
                            color="success"
                            sx={{
                                height: commonHeight, // Ép chiều cao bằng với 2 input trên
                                whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                            }}
                        >Lưu và thanh toán</Button>
                        <Button
                            onClick={() => { }}
                            variant="contained"
                            sx={{
                                height: commonHeight, // Ép chiều cao bằng với 2 input trên
                                whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                            }}
                        >Lưu</Button>
                    </div>
                </div>
            </div>

        </Dialog>
    );
}

export default ThemHopDongKHDialog;
