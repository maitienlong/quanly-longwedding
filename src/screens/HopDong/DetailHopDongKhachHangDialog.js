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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileContract,
    faCamera,
    faWandMagicSparkles,
    faPrint,
    faCircleCheck
} from '@fortawesome/free-solid-svg-icons';

function DetailHopDongKhachHangDialog(props) {
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


    const convertDateToTimestamp = (dateString) => {
        const date = new Date(dateString);
        return Math.floor(date.getTime() / 1000);
    }

    const loaiHopDongOptions = [

    ]


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
    const [khachThanhToanTruoc, setKhachThanhToanTruoc] = useState(0);
    const [nhanVienSale, setNhanVienSale] = useState("0");

    // state cho giảm giá
    const [giamGia, setGiamGia] = useState(0);
    const [loaiGiamGia, setLoaiGiamGia] = useState(0); // "VND" hoặc "%"

    const commonHeight = 56;

    const handleListItemClick = (value) => {
        onClose(value);
    };

    useEffect(() => {
        console.log(data)
        showLoading("Đang tải các dịch vụ.");
        otherService.findDichVu()
            .then((response) => {
                setListDichVu(response.data.dichVu);
                toast.success("Hoàn thành!");
                hideLoading();
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                toast.error("Lỗi khi tải dữ liệu dịch vụ.");
                hideLoading();
            });
    }, [showLoading, hideLoading]);

    const formatTimestampToDateInput = (val) => {
        if (!val) return "";
        if (typeof val === 'number') {
            const date = new Date(val * 1000);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        if (typeof val === 'string' && val.includes('-') && val.length === 10) {
            return val;
        }
        const date = new Date(val);
        if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return "";
    };

    useEffect(() => {
        if (open && data && data.maHopDong) {
            setMaHopDong(data.maHopDong);
            setNgayHopDong(formatTimestampToDateInput(data.ngayHopDong) || getToday());

            if (data.khachHang1) {
                setIDKH1(data.khachHang1._id || "");
                setPhoneKH1(data.khachHang1.soDienThoai || "");
                setNameKH1(data.khachHang1.tenKhachHang || "");
                setAddressKH1(data.khachHang1.diaChi || "");
                setBtnAddKHShow1(false);
            } else {
                clearPhoneKH1();
            }

            if (data.khachHang2) {
                setIDKH2(data.khachHang2._id || "");
                setPhoneKH2(data.khachHang2.soDienThoai || "");
                setNameKH2(data.khachHang2.tenKhachHang || "");
                setAddressKH2(data.khachHang2.diaChi || "");
                setBtnAddKHShow2(false);
            } else {
                clearPhoneKH2();
            }

            setGioHang(data.gioHang || []);
            setGiamGia(data.thanhToan?.giamGia || 0);
            setLoaiGiamGia(data.thanhToan?.loaiGiamGia || 0);
            setKhachThanhToanTruoc(data.khachThanhToanTruoc || 0);

            if (data.cacNgay) {
                setNgayChup(formatTimestampToDateInput(data.cacNgay.ngayChup));
                setNgayAnHoi(formatTimestampToDateInput(data.cacNgay.ngayAnHoi));
                setNgayCuoi(formatTimestampToDateInput(data.cacNgay.ngayCuoi));
                setNgayChinhAnh(formatTimestampToDateInput(data.cacNgay.ngayChinhAnh));
                setNgayTraAnh(formatTimestampToDateInput(data.cacNgay.ngayTraAnh));
            }

            setNhanVienSale(data.nhanVienSale || "0");
            setGiaiDoan(data.giaiDoan || 1);
            setDichVuChinh(data.dichVuChinh || 0);
        } else if (open) {
            resetForm();
        }
    }, [open, data]);

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
            const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || 0);
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


    const clearPhoneKH1 = () => {
        setNameKH1("");
        setAddressKH1("");
        setShowSuggestionPhone1(false);
        setBtnAddKHShow1(true);
    }

    const clearPhoneKH2 = () => {
        setNameKH2("");
        setAddressKH2("");
        setShowSuggestionPhone2(false);
        setBtnAddKHShow2(true);
    }



    const onUpdateHopDong = () => {
        if (!data || !data._id) {
            toast.error("Không tìm thấy ID hợp đồng để cập nhật!");
            return;
        }

        showLoading("Đang cập nhật hợp đồng...");
        otherService.UPDATE_HOPDONG({
            _id: data._id,
            maHopDong,
            ngayHopDong,
            khachHang1: idKH1,
            khachHang2: idKH2,
            gioHang,
            thanhToan: {
                giamGia: giamGia,
                loaiGiamGia: loaiGiamGia,
            },
            cacNgay: {
                ngayChup: convertDateToTimestamp(ngayChup),
                ngayAnHoi: convertDateToTimestamp(ngayAnHoi),
                ngayCuoi: convertDateToTimestamp(ngayCuoi),
                ngayChinhAnh: convertDateToTimestamp(ngayChinhAnh),
                ngayTraAnh: convertDateToTimestamp(ngayTraAnh),
            },
            nhanVienSale: nhanVienSale,
            giaiDoan: giaiDoan,
            dichVuChinh: dichVuChinh,
            khachThanhToanTruoc: khachThanhToanTruoc
        }).then((response) => {
            toast.success("Cập nhật hợp đồng thành công!");
            hideLoading();
            onClose(true); // Close and refresh
        }).catch((error) => {
            console.error(error);
            toast.error("Có lỗi xảy ra khi cập nhật hợp đồng! " + error);
            hideLoading();
        });
    };

    const handleStepClick = (stepNumber) => {
        if (stepNumber === giaiDoan) return;

        const stepNames = {
            1: "Tạo hợp đồng",
            2: "Chụp hình",
            3: "Hậu kỳ",
            4: "In ảnh",
            5: "Hoàn thành"
        };

        if (window.confirm(`Bạn có muốn chuyển tiến trình hợp đồng sang "${stepNames[stepNumber]}" không?`)) {
            setGiaiDoan(stepNumber);

            if (data && data._id) {
                showLoading(`Đang chuyển tiến trình sang "${stepNames[stepNumber]}"...`);
                otherService.UPDATE_HOPDONG({
                    _id: data._id,
                    maHopDong,
                    ngayHopDong,
                    khachHang1: idKH1,
                    khachHang2: idKH2,
                    gioHang,
                    thanhToan: {
                        giamGia: giamGia,
                        loaiGiamGia: loaiGiamGia,
                    },
                    cacNgay: {
                        ngayChup: convertDateToTimestamp(ngayChup),
                        ngayAnHoi: convertDateToTimestamp(ngayAnHoi),
                        ngayCuoi: convertDateToTimestamp(ngayCuoi),
                        ngayChinhAnh: convertDateToTimestamp(ngayChinhAnh),
                        ngayTraAnh: convertDateToTimestamp(ngayTraAnh),
                    },
                    nhanVienSale: nhanVienSale,
                    giaiDoan: stepNumber,
                    dichVuChinh: dichVuChinh,
                    khachThanhToanTruoc: khachThanhToanTruoc
                }).then(() => {
                    toast.success(`Đã chuyển tiến trình sang "${stepNames[stepNumber]}" thành công!`);
                    hideLoading();
                }).catch((error) => {
                    toast.error("Lỗi khi cập nhật tiến trình: " + error);
                    setGiaiDoan(giaiDoan); // Rollback state
                    hideLoading();
                });
            }
        }
    };

    return (
        <Dialog onClose={handleClose} open={open}
            fullWidth={true}
            maxWidth="xl"
        >
            <div className="dialog-overlay">
                <div className="dialog large">

                    <button className="close-btn" onClick={onClose}>×</button>
                    <h3 className="dialog-title">CHI TIẾT HỢP ĐỒNG: <span style={{ color: '#d4af37' }}>{maHopDong}</span></h3>

                    <div className="dialog-progress">
                        <div className="stepper-wrapper">
                            {[
                                { number: 1, label: "Tạo hợp đồng", icon: faFileContract },
                                { number: 2, label: "Chụp hình", icon: faCamera },
                                { number: 3, label: "Hậu kỳ", icon: faWandMagicSparkles },
                                { number: 4, label: "In ảnh", icon: faPrint },
                                { number: 5, label: "Hoàn thành", icon: faCircleCheck }
                            ].map((step, idx, arr) => {
                                const isCompleted = step.number < giaiDoan;
                                const isActive = step.number === giaiDoan;
                                const isPending = step.number > giaiDoan;

                                return (
                                    <div key={step.number} className="step-container">
                                        <div
                                            className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isPending ? 'pending' : ''}`}
                                            onClick={() => handleStepClick(step.number)}
                                        >
                                            <div className="step-icon-wrap">
                                                <FontAwesomeIcon icon={step.icon} />
                                                {isCompleted && <span className="step-badge-check">✓</span>}
                                            </div>
                                            <span className="step-label">{step.label}</span>
                                        </div>
                                        {idx < arr.length - 1 && (
                                            <div className={`step-line ${step.number < giaiDoan ? 'filled' : ''}`}></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
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
                                            gioHang.map((item) => {
                                                // Lưu ý: Dùng giaChoThueDichVu cho đồng nhất với logic search
                                                const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || 0);
                                                const total = price * (item.soLuong || 0);

                                                return (
                                                    <tr key={item.maDichVu}>
                                                        <td>{item.tenDichVuSnapshot}</td>
                                                        <td style={{ textAlign: "center" }}>
                                                            {/* Nút giảm số lượng */}
                                                            <button className="btn-qty" onClick={() => handleDecreaseQuantity(item.maDichVu)}>-</button>
                                                            <span style={{ margin: "0 10px" }}>{item.soLuong}</span>
                                                            {/* Nút tăng số lượng (tận dụng lại logic thêm) */}
                                                            <button className="btn-qty" onClick={() => handleSelectProduct(item)}>+</button>
                                                        </td>
                                                        <td>{price.toLocaleString("vi-VN")}đ</td>
                                                        <td>{total.toLocaleString("vi-VN")}đ</td>
                                                        <td style={{ textAlign: "center" }}>
                                                            <Button
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDeleteProduct(item.maDichVu)}
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
                                        <input name="phoneKH1" value={phoneKH1} disabled />
                                        <label>Phone khách hàng 1</label>
                                    </div>

                                    <div className="floating-label">
                                        <input name="tenKhachHang" value={nameKH1} disabled />
                                        <label>Tên khách hàng</label>
                                    </div>

                                    <div className="floating-label">
                                        <input name="diaChiCodau" value={addressKH1} disabled />
                                        <label>Địa chỉ</label>
                                    </div>
                                </div>

                                <div className="dialog-section-khachhang-item">
                                    <h4>Thông tin khách hàng 2</h4>
                                    <div className="floating-label">
                                        <input name="phoneKH2" value={phoneKH2} disabled />
                                        <label>Phone khách hàng 2</label>
                                    </div>

                                    <div className="floating-label">
                                        <input name="tenKhachHang" value={nameKH2} disabled />
                                        <label>Tên khách hàng 2</label>
                                    </div>

                                    <div className="floating-label">
                                        <input name="diaChiCodau" value={addressKH2} disabled />
                                        <label>Địa chỉ khách hàng 2</label>
                                    </div>
                                </div>

                            </div>



                            <div className="dialog-section">
                                <h4>Thông tin hợp đồng</h4>

                                <div className="dialog-section-khachhang">
                                    <div className="dialog-section-khachhang-item">
                                        <div className="floating-label">
                                            <input name="maHopDong" value={maHopDong} disabled />
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
                                            <input type="text" name="nhanVienSale" value={nhanVienSale} disabled />
                                            <label>Nhân viên sale</label>
                                        </div>


                                    </div>

                                    <div className="dialog-section-khachhang-item">
                                        <div className="floating-label">
                                            <input type="date" name="ngayHopDong" value={ngayHopDong} disabled />
                                            <label>Ngày hợp đồng</label>
                                        </div>
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
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>

                    {/* === DƯỚI CÙNG: THANH TOÁN === */}
                    <div className="dialog-section payment">
                        <h4>Thông tin thanh toán</h4>
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            divider={<Divider orientation={{ xs: 'horizontal', md: 'vertical' }} flexItem />}
                            spacing={2}
                        >
                            <Stack
                                direction="column"
                                divider={<Divider orientation="horizontal" flexItem />}
                                spacing={2}
                            >
                                <p style={{ textAlign: 'left', fontWeight: 'inherit', fontSize: '1.2em', color: 'green' }}>Lịch sử thanh toán</p>

                            </Stack>

                            <Stack
                                direction="column"
                                divider={<Divider orientation="horizontal" flexItem />}
                                spacing={2}
                            >

                                <div style={{ display: 'flex', gap: '5px' }}>



                                </div>

                                <NumericFormat
                                    customInput={TextField}
                                    label="Thanh toán"
                                    value={khachThanhToanTruoc}
                                    onValueChange={(values) => {
                                        const { floatValue } = values;
                                        setKhachThanhToanTruoc(floatValue || 0);
                                    }}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    decimalScale={0}
                                    allowNegative={false}
                                    suffix=" đ"
                                    fullWidth
                                    variant="outlined"
                                    sx={{ height: commonHeight }} />


                            </Stack>

                            <Stack
                                direction="column"
                                divider={<Divider orientation="horizontal" flexItem />}
                                spacing={2}
                            >
                                <p style={{ textAlign: 'left', fontWeight: 'inherit', fontSize: '1em', color: 'green' }}>
                                    Tổng tiền đơn hàng: <b>{gioHang.reduce((sum, item) => {
                                        const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || 0);
                                        return sum + (price * (item.soLuong || 0));
                                    }, 0).toLocaleString("vi-VN") + " đ"} </b>
                                </p>
                                <p style={{ textAlign: 'left', fontWeight: 'inherit', fontSize: '1em', color: 'green' }}>
                                    Tổng tiền sau giảm giá: <b> {(data?.thanhToan?.tongGiaTriSauGiam || 0).toLocaleString("vi-VN")} đ</b>
                                </p>
                                <p style={{ textAlign: 'left', fontWeight: 'inherit', fontSize: '1em', color: 'green' }}>
                                    Tổng đã thanh toán: <b>{(data?.thanhToan?.khachHangDaThanhToan || 0).toLocaleString("vi-VN")} đ</b>
                                </p>

                                <p style={{ textAlign: 'left', fontWeight: 'inherit', fontSize: '1.2em', color: 'red' }}>
                                    Tổng tiền còn lại: <b>{((data?.thanhToan?.tongGiaTriSauGiam || 0) - (data?.thanhToan?.khachHangDaThanhToan || 0)).toLocaleString("vi-VN")} đ</b>
                                </p>


                            </Stack>


                        </Stack>

                    </div>

                    <div className="dialog-actions">
                        <Button
                            onClick={onClose}
                            variant="contained"
                            color="error"
                            sx={{

                                whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                            }}
                        >Thoát</Button>

                        <Button
                            onClick={() => onUpdateHopDong()}
                            variant="contained"
                            sx={{
                                whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                            }}
                        >Cập nhật hợp đồng</Button>
                    </div>
                </div>
            </div>

        </Dialog >
    );
}

export default DetailHopDongKhachHangDialog;
