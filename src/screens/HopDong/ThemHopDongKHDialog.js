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
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';

function ThemHopDongKHDialog(props) {
    const { onClose, data, selectedValue, open } = props;
    const handleClose = () => {
        onClose(selectedValue);
    };

    const generateMaHopDong = () => {
        const year = new Date().getFullYear();
        return `HD-${year}-${Math.floor(100 + Math.random() * 900)}`;
    };

    const getToday = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };


    const convertDateToISOString = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date.toISOString();
    }

    const loaiHopDongOptions = [
        { label: 'Pre-Wedding', id: 1 },
        { label: 'Phóng Sự Ăn Hỏi', id: 2 },
        { label: 'Phóng Sự Cưới', id: 3 },
        { label: 'Beauty', id: 4 },
        { label: 'Ảnh Thẻ', id: 5 },
        { label: 'Bé', id: 6 },
        { label: 'Gia Đình', id: 7 },
        { label: 'Video Phóng Sự', id: 8 },
        { label: 'Thiệp Mời', id: 9 },
        { label: 'Livestream', id: 10 },
        { label: 'Trang điểm', id: 11 },
        { label: 'Cho thuê trang phục', id: 12 },
        { label: 'Khác', id: 13 }
    ]

    const itemMethodPayment = [
        { label: 'Chuyển khoản', id: 0 },
        { label: 'Tiền mặt', id: 1 }]


    const { showLoading, hideLoading } = useLoading();
    const [listDichVu, setListDichVu] = useState([]);

    const [phoneKH1, setPhoneKH1] = useState("");
    const [phoneKH2, setPhoneKH2] = useState("");


    const [nameKH1, setNameKH1] = useState("");
    const [nameKH2, setNameKH2] = useState("");
    const [addressKH1, setAddressKH1] = useState("");
    const [addressKH2, setAddressKH2] = useState("");


    // DU LIEU BAN DAU CHO HOP DONG
    const [maHopDong, setMaHopDong] = useState(generateMaHopDong());
    const [ngayHopDong, setNgayHopDong] = useState(getToday());
    const [idKH1, setIDKH1] = useState("");
    const [idKH2, setIDKH2] = useState("");
    const [gioHang, setGioHang] = useState([]);
    const [thanhToan, setThanhToan] = useState("");
    const [tongTien, setTongTien] = useState(0);
    const [ngayChup, setNgayChup] = useState(getToday());
    const [ngayAnHoi, setNgayAnHoi] = useState("");
    const [ngayCuoi, setNgayCuoi] = useState("");
    const [ngayChinhAnh, setNgayChinhAnh] = useState(getToday());
    const [ngayTraAnh, setNgayTraAnh] = useState("");
    const [giaiDoan, setGiaiDoan] = useState(1);
    const [dichVuChinh, setDichVuChinh] = useState(0);
    const [khachThanhToan, setKhachThanhToan] = useState(0);
    const [methodPayment, setMethodPayment] = useState(0);
    const [nhanVienSale, setNhanVienSale] = useState("0");
    const [gioChup, setGioChup] = useState("");
    const [diaDiemChup, setDiaDiemChup] = useState("");
    const [thoChupHinh, setThoChupHinh] = useState("");
    const [thoMakeUp, setThoMakeUp] = useState("");
    const [chotLich, setChotLich] = useState("Chưa gọi điện");

    // state cho giảm giá
    const [giamGia, setGiamGia] = useState(0);
    const [loaiGiamGia, setLoaiGiamGia] = useState(0); // "VND" hoặc "%"

    const commonHeight = 56;

    const handleListItemClick = (value) => {
        onClose(value);
    };

    useEffect(() => {
        showLoading("Đang tải các dịch vụ.");
        otherService.findDichVu()
            .then((response) => {
                setListDichVu(response.data.dichVu);
                hideLoading();
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                toast.error("Lỗi khi tải dữ liệu dịch vụ.");
                hideLoading();
            });
    }, [showLoading, hideLoading]);

    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open]);

    useEffect(() => {
        setTongTien(tinhTongThanhToan());
    }, [, gioHang, giamGia, loaiGiamGia]);

    const [searchTerm, setSearchTerm] = useState("");

    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showSuggestionPhone1, setShowSuggestionPhone1] = useState(false);
    const [showSuggestionPhone2, setShowSuggestionPhone2] = useState(false);
    const [suggestionPhone1, setSuggestionPhone1] = useState([]);
    const [suggestionPhone2, setSuggestionPhone2] = useState([]);
    const [btnAddKHShow1, setBtnAddKHShow1] = useState(true);
    const [btnAddKHShow2, setBtnAddKHShow2] = useState(true);

    const searchRef = useRef(null);
    const [dataIsDialog, setDataIsDialog] = useState(data);

    const suggestions = listDichVu.filter(p =>
        searchTerm.trim() &&
        p.tenDichVu.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectProduct = (product) => {
        const isExisting = gioHang.find(sp => sp.maDichVu === product.maDichVu);

        let updatedGioHang;

        if (isExisting) {
            // Nếu đã có: Map qua mảng để tăng số lượng của sản phẩm đó
            updatedGioHang = gioHang.map(sp =>
                sp.maDichVu === product.maDichVu
                    ? {
                        ...sp, soLuong: (sp.soLuong || 0) + 1,
                        dichVu: product._id
                    }
                    : sp
            );
        } else {
            // Nếu chưa có: Thêm sản phẩm mới vào mảng với số lượng là 1
            // Lưu ý: Đảm bảo lấy đúng trường giá (giaChoThueDichVu) từ dữ liệu API
            updatedGioHang = [...gioHang, { ...product, soLuong: 1, dichVu: product._id }];
        }

        // 2. Cập nhật state giỏ hàng (giữ đúng định dạng mảng)
        setGioHang(updatedGioHang);

        // 3. Tính toán tổng tiền
        const newTotal = updatedGioHang.reduce((sum, item) => {
            // Chuyển đổi giá về dạng số để tính toán (đề phòng giá là chuỗi)
            const price = parseFloat(item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
            return sum + (price * (item.soLuong || 0));
        }, 0);

        // 4. Cập nhật state tổng tiền
        setTongTien(newTotal);

        // 5. Reset các ô search
        setSearchTerm("");
        setShowSuggestions(false);
    };


    const updateCartAndTotal = (newCart) => {
        setGioHang(newCart);
        const newTotal = newCart.reduce((sum, item) => {
            const price = parseFloat(item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
            return sum + (price * (item.soLuong || 0));
        }, 0);
        setTongTien(newTotal);
    };

    // Hàm xóa hoàn toàn sản phẩm khỏi giỏ
    const handleDeleteProduct = (maDichVu) => {
        const updatedCart = gioHang.filter(sp => sp.maDichVu !== maDichVu);
        updateCartAndTotal(updatedCart);
        toast.info(" Đã xóa sản phẩm khỏi giỏ hàng");
    };

    // Hàm giảm số lượng sản phẩm
    const handleDecreaseQuantity = (maDichVu) => {
        const existingProduct = gioHang.find(sp => sp.maDichVu === maDichVu);

        if (existingProduct.soLuong > 1) {
            // Nếu số lượng > 1 thì giảm đi 1
            const updatedCart = gioHang.map(sp =>
                sp.maDichVu === maDichVu ? { ...sp, soLuong: sp.soLuong - 1 } : sp
            );
            updateCartAndTotal(updatedCart);
        } else {
            // Nếu số lượng bằng 1 thì hỏi người dùng có muốn xóa không (hoặc xóa luôn)
            handleDeleteProduct(maDichVu);
        }
    };

    const tinhTongThanhToan = () => {
        // Tính tổng tiền gốc từ giỏ hàng
        const tongGoc = gioHang.reduce((sum, item) => {
            const price = parseFloat(item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
            return sum + (price * (item.soLuong || 0));
        }, 0);

        let tongSauGiam = tongGoc;
        if (loaiGiamGia === 1) {
            tongSauGiam = tongGoc - (tongGoc * (giamGia / 100));
        } else {
            tongSauGiam = tongGoc - giamGia;
        }

        return tongSauGiam < 0 ? 0 : tongSauGiam; // Đảm bảo không âm
    };


    const resetForm = () => {
        // 1. Thông tin hợp đồng cơ bản
        setMaHopDong(generateMaHopDong());
        setNgayHopDong(getToday());
        setNgayChup("");
        setNgayAnHoi("");
        setNgayCuoi("");
        setGioChup("");
        setDiaDiemChup("");
        setThoChupHinh("");
        setThoMakeUp("");
        setChotLich("Chưa gọi điện");

        // 2. Thông tin khách hàng 1
        setIDKH1("");
        setPhoneKH1("");
        setNameKH1("");
        setAddressKH1("");
        setBtnAddKHShow1(true);
        setShowSuggestionPhone1(false);

        // 3. Thông tin khách hàng 2
        setIDKH2("");
        setPhoneKH2("");
        setNameKH2("");
        setAddressKH2("");
        setBtnAddKHShow2(true);
        setShowSuggestionPhone2(false);

        // 4. Giỏ hàng và tiền bạc
        setGioHang([]);
        setTongTien(0);
        setSearchTerm("");
        setShowSuggestions(false);

        // Nếu bạn đã thêm logic giảm giá ở bước trước
        if (typeof setGiamGia === "function") setGiamGia(0);
    };

    const onChangePhoneKH1 = (e) => {

        if (e.target.value.length > 10) {
            return;
        }
        setPhoneKH1(e.target.value);
        if (e.target.value.length === 0) {
            clearPhoneKH1();
            return
        }

        otherService.findKhachHang({ soDienThoai: e.target.value })
            .then((response) => {
                setShowSuggestionPhone1(true);
                setSuggestionPhone1(response.data);
                setBtnAddKHShow1(false);
            })
            .catch((error) => {
                clearPhoneKH1();
            });


    };

    const handleSelectProductPhone1 = (product) => {
        setIDKH1(product._id);
        setPhoneKH1(product.soDienThoai);
        setNameKH1(product.tenKhachHang);
        setAddressKH1(product.diaChi);
        setShowSuggestionPhone1(false);
        setBtnAddKHShow1(false);
    }
    const clearPhoneKH1 = () => {
        setNameKH1("");
        setAddressKH1("");
        setShowSuggestionPhone1(false);
        setBtnAddKHShow1(true);
    }

    const handleSelectProductPhone2 = (product) => {
        setIDKH2(product._id);
        setPhoneKH2(product.soDienThoai);
        setNameKH2(product.tenKhachHang);
        setAddressKH2(product.diaChi);
        setShowSuggestionPhone2(false);
        setBtnAddKHShow2(false);
    }

    const clearPhoneKH2 = () => {
        setNameKH2("");
        setAddressKH2("");
        setShowSuggestionPhone2(false);
        setBtnAddKHShow2(true);
    }

    const onChangePhoneKH2 = (e) => {
        if (e.target.value.length > 10) {
            return;
        }
        setPhoneKH2(e.target.value);
        if (e.target.value.length === 0) {
            clearPhoneKH2();
            return
        }
        otherService.findKhachHang({ soDienThoai: e.target.value })
            .then((response) => {
                setShowSuggestionPhone2(true);
                setSuggestionPhone2(response.data);
                setBtnAddKHShow2(false);
            })
            .catch((error) => {
                clearPhoneKH2();
            });
    };

    const onCreateNewCustomer = (index, soDienThoai, ten, diaChi) => {
        otherService.createKhachHang({
            soDienThoai: soDienThoai,
            tenKhachHang: ten,
            diaChi: diaChi
        })
            .then((response) => {
                toast.success("Tạo khách hàng mới thành công!");
                if (index === 1) {
                    setIDKH1(response.data._id);
                    setPhoneKH1(response.data.soDienThoai);
                    setNameKH1(response.data.tenKhachHang);
                    setAddressKH1(response.data.diaChi);
                    setShowSuggestionPhone1(false);
                    setBtnAddKHShow1(false);
                } else {
                    setIDKH2(response.data._id);
                    setPhoneKH2(response.data.soDienThoai);
                    setNameKH2(response.data.tenKhachHang);
                    setAddressKH2(response.data.diaChi);
                    setShowSuggestionPhone2(false);
                    setBtnAddKHShow2(false);
                }
            })
            .catch((error) => {
                toast.error("Có lỗi xảy ra khi tạo khách hàng mới!" + error);
            });
    }

    const onSaveHopDong = () => {
        otherService.CREATE_HOPDONG({
            maHopDong,
            ngayHopDong,
            khachHang1: idKH1,
            khachHang2: idKH2,
            gioHang,
            thanhToan: {
                giamGia: giamGia,
                loaiGiamGia: loaiGiamGia,
                nhanVien: nhanVienSale,
                khachThanhToan: {
                    amount: khachThanhToan,
                    method: methodPayment
                }
            },
            cacNgay: {
                ngayChup: convertDateToISOString(ngayChup),
                ngayAnHoi: convertDateToISOString(ngayAnHoi),
                ngayCuoi: convertDateToISOString(ngayCuoi),
                ngayChinhAnh: convertDateToISOString(ngayChinhAnh),
                ngayTraAnh: convertDateToISOString(ngayTraAnh),
                gioChup,
                diaDiemChup,
                chotLich
            },
            nguoiPhucVu: {
                thoChupHinh,
                thoMakeUp
            },
            nhanVienSale: nhanVienSale,
            giaiDoan: 1,
            dichVuChinh: dichVuChinh

        }).then((response) => {
            onClose(true);
            toast.success("Tạo hợp đồng mới thành công!");
            resetForm();
        }).catch((error) => {
            toast.error("Có lỗi xảy ra khi tạo hợp đồng mới!" + error);
        });

    }

    return (
        <Dialog onClose={handleClose} open={open}
            fullWidth={true}
            maxWidth="xl"
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
                                    autoComplete="off"
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
                                                <span className="p-price">{p.giaChoThueDichVu.toLocaleString("vi-VN")}đ</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* ===== TABLE ===== */}
                            <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                                <table className="product-table">
                                    <thead>
                                        <tr>
                                            <th>Tên SP</th>
                                            <th style={{ textAlign: "center" }}>Số lượng</th>
                                            <th>Giá</th>
                                            <th>Thành tiền</th>
                                            <th>Hành động</th> {/* Thêm cột mới */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(gioHang) && gioHang.length > 0 ? (
                                            gioHang.map((sp) => {
                                                // Lưu ý: Dùng giaChoThueDichVu cho đồng nhất với logic search
                                                const price = parseFloat(sp.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
                                                const total = price * (sp.soLuong || 0);

                                                return (
                                                    <tr key={sp.maDichVu}>
                                                        <td>{sp.tenDichVu}</td>
                                                        <td style={{ textAlign: "center" }}>
                                                            {/* Nút giảm số lượng */}
                                                            <button className="btn-qty" onClick={() => handleDecreaseQuantity(sp.maDichVu)}>-</button>
                                                            <span style={{ margin: "0 10px" }}>{sp.soLuong}</span>
                                                            {/* Nút tăng số lượng (tận dụng lại logic thêm) */}
                                                            <button className="btn-qty" onClick={() => handleSelectProduct(sp)}>+</button>
                                                        </td>
                                                        <td>{price.toLocaleString("vi-VN")}đ</td>
                                                        <td>{total.toLocaleString("vi-VN")}đ</td>
                                                        <td style={{ textAlign: "center" }}>
                                                            <Button
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDeleteProduct(sp.maDichVu)}
                                                            >
                                                                Xóa
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={5} style={{ textAlign: "center", color: "#999" }}>
                                                    Chưa sử dụng dịch vụ
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* CỘT PHẢI */}
                        <div className="right-column">
                            <div className="dialog-section-khachhang">
                                <div className="dialog-section-khachhang-item">
                                    <h4>Thông tin khách hàng 1</h4>
                                    <div className="floating-label">
                                        <input name="phoneKH1" value={phoneKH1} onChange={onChangePhoneKH1} type="Number" maxLength={10} autoComplete="off" required />
                                        <label>Phone khách hàng 1</label>
                                    </div>

                                    <div className="floating-label">
                                        {showSuggestionPhone1 && suggestionPhone1.length > 0 && (
                                            <ul className="search-suggestions-pop">
                                                {suggestionPhone1.map(p => (
                                                    <li key={p.soDienThoai} onClick={() => handleSelectProductPhone1(p)}>
                                                        <span className="p-name">{p.tenKhachHang || "Đang cập nhật ..."}</span>
                                                        <span className="p-price">{p.soDienThoai || "Đang cập nhật ..."}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="floating-label">
                                        <input name="tenKhachHang" value={nameKH1} onChange={(e) => { setNameKH1(e.target.value) }} required />
                                        <label>Tên khách hàng</label>
                                    </div>

                                    <div className="floating-label">
                                        <input name="diaChiCodau" value={addressKH1} onChange={(e) => { setAddressKH1(e.target.value) }} autoComplete="off" required />
                                        <label>Địa chỉ</label>
                                    </div>

                                    {btnAddKHShow1 && (
                                        <Button
                                            onClick={() => onCreateNewCustomer(1, phoneKH1, nameKH1, addressKH1)}
                                            color="success"
                                            variant="contained"
                                            sx={{
                                                whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                                            }}
                                        >Tạo khách hàng mới</Button>
                                    )}
                                </div>

                                <div className="dialog-section-khachhang-item">
                                    <h4>Thông tin khách hàng 2</h4>
                                    <div className="floating-label">
                                        <input name="phoneKH2" value={phoneKH2} onChange={onChangePhoneKH2} type="Number" maxLength={10} required />
                                        <label>Phone khách hàng 2</label>
                                    </div>

                                    <div className="floating-label">
                                        {showSuggestionPhone2 && suggestionPhone2.length > 0 && (
                                            <ul className="search-suggestions-pop">
                                                {suggestionPhone2.map(p => (
                                                    <li key={p.soDienThoai} onClick={() => handleSelectProductPhone2(p)}>
                                                        <span className="p-name">{p.tenKhachHang || "Đang cập nhật ..."}</span>
                                                        <span className="p-price">{p.soDienThoai || "Đang cập nhật ..."}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="floating-label">
                                        <input name="tenKhachHang" value={nameKH2} onChange={(e) => { setNameKH2(e.target.value) }} required />
                                        <label>Tên khách hàng 2</label>
                                    </div>

                                    <div className="floating-label">
                                        <input name="diaChiCodau" value={addressKH2} onChange={(e) => { setAddressKH2(e.target.value) }} required />
                                        <label>Địa chỉ khách hàng 2</label>
                                    </div>
                                    {btnAddKHShow2 && (
                                        <Button
                                            onClick={() => onCreateNewCustomer(2, phoneKH2, nameKH2, addressKH2)}
                                            color="success"
                                            variant="contained"
                                            sx={{
                                                whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                                            }}
                                        >Tạo khách hàng mới</Button>
                                    )}

                                </div>

                            </div>



                            <div className="dialog-section">
                                <h4>Thông tin hợp đồng</h4>

                                <div className="dialog-section-khachhang">
                                    <div className="dialog-section-khachhang-item">
                                        <div className="floating-label">
                                            <input name="maHopDong" value={maHopDong} onChange={(e) => setMaHopDong(e.target.value)} required />
                                            <label>Mã hợp đồng</label>
                                        </div>

                                        <Autocomplete
                                            disablePortal
                                            options={loaiHopDongOptions}
                                            renderInput={(params) => <TextField {...params} label="Loại hợp đồng" />}
                                            onChange={(event, newValue) => {
                                                setDichVuChinh(newValue ? newValue.id : 0);
                                            }
                                            }
                                        />

                                        <div className="floating-label" style={{ marginTop: '20px' }}>
                                            <input type="text" name="nhanVienSale" value={nhanVienSale} onChange={(e) => setNhanVienSale(e.target.value)} />
                                            <label>Nhân viên sale</label>
                                        </div>

                                        <div className="floating-label" style={{ marginTop: '20px' }}>
                                            <input type="text" name="thoChupHinh" value={thoChupHinh} onChange={(e) => setThoChupHinh(e.target.value)} />
                                            <label>Thợ chụp hình</label>
                                        </div>

                                        <div className="floating-label" style={{ marginTop: '20px' }}>
                                            <input type="text" name="thoMakeUp" value={thoMakeUp} onChange={(e) => setThoMakeUp(e.target.value)} />
                                            <label>Thợ Make-up</label>
                                        </div>

                                        <div className="floating-label" style={{ marginTop: '20px' }}>
                                            <select name="chotLich" value={chotLich} onChange={(e) => setChotLich(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '4px', border: '1px solid #ccc', padding: '0 8px', fontSize: '0.85rem' }}>
                                                <option value="Chưa gọi điện">Chưa gọi điện</option>
                                                <option value="Đã gọi điện xác nhận">Đã gọi điện xác nhận</option>
                                                <option value="Đã chốt lịch">Đã chốt lịch</option>
                                            </select>
                                            <label style={{ top: '-10px', fontSize: '0.8rem', color: '#1976d2' }}>Chốt lịch</label>
                                        </div>
                                    </div>

                                    <div className="dialog-section-khachhang-item">
                                        <div className="floating-label">
                                            <input type="date" name="ngayChup" value={ngayChup} onChange={(e) => setNgayChup(e.target.value)} required />
                                            <label>Ngày chụp ảnh</label>
                                        </div>

                                        <div className="floating-label">
                                            <input type="date" name="ngayAnHoi" value={ngayAnHoi} onChange={(e) => setNgayAnHoi(e.target.value)} required />
                                            <label>Ngày ăn hỏi</label>
                                        </div>

                                        <div className="floating-label">
                                            <input type="date" name="ngayCuoi" value={ngayCuoi} onChange={(e) => setNgayCuoi(e.target.value)} required />
                                            <label>Ngày cưới</label>
                                        </div>

                                        <div className="floating-label" style={{ marginTop: '20px' }}>
                                            <input type="text" name="gioChup" value={gioChup} onChange={(e) => setGioChup(e.target.value)} placeholder="ví dụ: 9h30p" />
                                            <label>Giờ chụp ảnh</label>
                                        </div>

                                        <div className="floating-label" style={{ marginTop: '20px' }}>
                                            <input type="text" name="diaDiemChup" value={diaDiemChup} onChange={(e) => setDiaDiemChup(e.target.value)} />
                                            <label>Địa điểm chụp</label>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* === DƯỚI CÙNG: THANH TOÁN === */}
                    <div className="dialog-section payment" style={{ padding: '8px 15px', borderTop: '2px dashed #ccc' }}>
                        <h4 style={{ fontSize: '0.85rem', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Thông tin thanh toán</h4>
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            divider={<Divider orientation={{ xs: 'horizontal', md: 'vertical' }} flexItem />}
                            spacing={2}
                        >

                            <Stack
                                direction="column"
                                spacing={1}
                                style={{ flex: 1, minWidth: '220px', margin: '0 2rem' }}
                            >

                                <div style={{ display: 'flex', gap: '5px' }}>

                                    <NumericFormat
                                        customInput={TextField}
                                        label="Giảm giá"
                                        value={giamGia}
                                        onValueChange={(e) => setGiamGia(e.floatValue)}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        decimalScale={2}
                                        allowNegative={false}
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            '& .MuiInputBase-root': { fontSize: '0.8rem', height: '32px' },
                                            '& .MuiFormLabel-root': { fontSize: '0.8rem', transform: 'translate(14px, 8px) scale(1)' },
                                            '& .MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75) !important' }
                                        }}
                                    />

                                    <select
                                        value={loaiGiamGia}
                                        onChange={(e) => setLoaiGiamGia(Number(e.target.value))}
                                        style={{ borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center', padding: '0 5px', width: '80px', backgroundColor: '#fff', fontSize: '0.8rem', height: '32px' }}
                                    >
                                        <option defaultChecked value={0}>VNĐ</option>
                                        <option value={1}>%</option>
                                    </select>
                                </div>

                                <NumericFormat
                                    customInput={TextField} // Sử dụng TextField của MUI làm giao diện
                                    label="Khách thanh toán"
                                    value={khachThanhToan}
                                    onValueChange={(e) => setKhachThanhToan(e.floatValue)}
                                    thousandSeparator="." // Phân cách hàng nghìn bằng dấu chấm
                                    decimalSeparator=","   // Phân cách thập phân bằng dấu phẩy
                                    decimalScale={2}       // Tối đa 2 chữ số sau dấu phẩy
                                    allowNegative={false}  // Không cho phép số âm
                                    suffix=" đ"            // Thêm đơn vị phía sau
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        '& .MuiInputBase-root': { fontSize: '0.8rem', height: '32px' },
                                        '& .MuiFormLabel-root': { fontSize: '0.8rem', transform: 'translate(14px, 8px) scale(1)' },
                                        '& .MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75) !important' }
                                    }}
                                />

                                <Autocomplete
                                    disablePortal
                                    options={itemMethodPayment}
                                    size="small"
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Hình thức thanh toán"
                                            sx={{
                                                '& .MuiInputBase-root': { fontSize: '0.8rem', height: '32px', padding: '0 8px' },
                                                '& .MuiFormLabel-root': { fontSize: '0.8rem', transform: 'translate(14px, 8px) scale(1)' },
                                                '& .MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75) !important' }
                                            }}
                                        />
                                    )}
                                    onChange={(event, newValue) => {
                                        setMethodPayment(newValue.label);
                                    }}
                                    sx={{
                                        '& .MuiAutocomplete-inputRoot': { padding: '0 8px' }
                                    }}
                                />

                            </Stack>

                            <Stack
                                direction="column"
                                spacing={0.5}
                                style={{ justifyContent: 'center', flex: 2 }}
                            >
                                <p style={{ textAlign: 'left', fontWeight: 'inherit', fontSize: '0.85rem', color: 'green', margin: '2px 0' }}>
                                    Tổng tiền đơn hàng: <b>{gioHang.reduce((sum, item) => {
                                        const price = parseFloat(item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
                                        return sum + (price * (item.soLuong || 0));
                                    }, 0).toLocaleString("vi-VN") + " đ"} </b>
                                </p>

                                <p style={{ textAlign: 'left', fontWeight: 'inherit', fontSize: '0.85rem', color: 'green', margin: '2px 0' }}>
                                    Tổng tiền sau giảm giá: <b>{tongTien.toLocaleString("vi-VN") + " đ"}</b>
                                </p>


                                <p style={{ textAlign: 'left', fontWeight: 'inherit', fontSize: '0.85rem', color: 'red', margin: '2px 0' }}>
                                    Tổng tiền còn lại: <b> {(tongTien - khachThanhToan).toLocaleString("vi-VN")} đ</b>
                                </p>

                            </Stack>


                        </Stack>

                    </div>

                    <div className="dialog-actions payment">
                        <Button
                            onClick={onClose}
                            variant="contained"
                            color="error"
                            sx={{

                                whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                            }}
                        >Thoát</Button>

                        <Button
                            onClick={() => onSaveHopDong()}
                            variant="contained"
                            sx={{
                                whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                            }}
                        >Tạo hợp đồng</Button>
                    </div>
                </div>
            </div>

        </Dialog >
    );
}

export default ThemHopDongKHDialog;
