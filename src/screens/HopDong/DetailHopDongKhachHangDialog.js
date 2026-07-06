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
import { formatDate } from '../utils/convertDate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileContract,
    faCamera,
    faWandMagicSparkles,
    faPrint,
    faCircleCheck
} from '@fortawesome/free-solid-svg-icons';

const getDichVuChinhLabel = (id) => {
    const options = {
        1: 'Pre-Wedding',
        2: 'Phóng Sự Ăn Hỏi',
        3: 'Phóng Sự Cưới',
        4: 'Beauty',
        5: 'Ảnh Thẻ',
        6: 'Bé',
        7: 'Gia Đình',
        8: 'Video Phóng Sự',
        9: 'Thiệp Mời',
        10: 'Livestream',
        11: 'Trang điểm',
        12: 'Cho thuê trang phục',
        13: 'Khác'
    };
    return options[Number(id)] || 'Khác';
};

function DetailHopDongKhachHangDialog(props) {
    const { onClose, data, selectedValue, open } = props;
    const handleClose = () => {
        onClose(hasUpdated);
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
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        return date.toISOString();
    };

    const [methodPayment, setMethodPayment] = useState("Tiền mặt");
    const [noiDungPayment, setNoiDungPayment] = useState("Thanh toán thêm");
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
    const [gioChup, setGioChup] = useState("");
    const [diaDiemChup, setDiaDiemChup] = useState("");
    const [thoChupHinh, setThoChupHinh] = useState("");
    const [thoMakeUp, setThoMakeUp] = useState("");
    const [thoChinhAnh, setThoChinhAnh] = useState("");
    const [chotLich, setChotLich] = useState("Chưa gọi điện");

    // Local progress states
    const [linkAnhGoc, setLinkAnhGoc] = useState("");
    const [linkAnhChinhSua, setLinkAnhChinhSua] = useState("");
    const [danhSachAnhIn, setDanhSachAnhIn] = useState([]);
    const [hasUpdated, setHasUpdated] = useState(false);

    // States for progress input dialog
    const [openProgressInput, setOpenProgressInput] = useState(false);
    const [targetStep, setTargetStep] = useState(null);
    const [inputLinkAnhGoc, setInputLinkAnhGoc] = useState("");
    const [inputLinkAnhChinhSua, setInputLinkAnhChinhSua] = useState("");
    const [inputDanhSachAnhIn, setInputDanhSachAnhIn] = useState([]);
    const [newKichThuoc, setNewKichThuoc] = useState("");
    const [newSoLuong, setNewSoLuong] = useState(1);

    // state cho giảm giá
    const [giamGia, setGiamGia] = useState(0);
    const [loaiGiamGia, setLoaiGiamGia] = useState(0); // "VND" hoặc "%"

    const isOldService = (productId) => {
        return data?.gioHang?.some(orig => {
            const origId = orig.dichVu?._id || orig.dichVu || orig._id;
            return origId === productId;
        });
    };

    const getOriginalQuantity = (productId) => {
        const origItem = data?.gioHang?.find(orig => {
            const origId = orig.dichVu?._id || orig.dichVu || orig._id;
            return origId === productId;
        });
        return origItem ? origItem.soLuong || 1 : 0;
    };

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
            setKhachThanhToanTruoc(0);
            setMethodPayment("Tiền mặt");
            setNoiDungPayment("Thanh toán thêm");

            if (data.cacNgay) {
                setNgayChup(formatTimestampToDateInput(data.cacNgay.ngayChup));
                setNgayAnHoi(formatTimestampToDateInput(data.cacNgay.ngayAnHoi));
                setNgayCuoi(formatTimestampToDateInput(data.cacNgay.ngayCuoi));
                setNgayChinhAnh(formatTimestampToDateInput(data.cacNgay.ngayChinhAnh));
                setNgayTraAnh(formatTimestampToDateInput(data.cacNgay.ngayTraAnh));
                setGioChup(data.cacNgay.gioChup || "");
                setDiaDiemChup(data.cacNgay.diaDiemChup || "");
                setChotLich(data.cacNgay.chotLich || "Chưa gọi điện");
            } else {
                setGioChup("");
                setDiaDiemChup("");
                setChotLich("Chưa gọi điện");
            }

            if (data.nguoiPhucVu) {
                setThoChupHinh(data.nguoiPhucVu.thoChupHinh || "");
                setThoMakeUp(data.nguoiPhucVu.thoMakeUp || "");
                setThoChinhAnh(data.nguoiPhucVu.thoChinhAnh || "");
            } else {
                setThoChupHinh("");
                setThoMakeUp("");
                setThoChinhAnh("");
            }

            setNhanVienSale(data.nhanVienSale || "0");
            setGiaiDoan(data.giaiDoan || 1);
            setDichVuChinh(data.dichVuChinh || 0);
            setLinkAnhGoc(data.linkAnhGoc || "");
            setLinkAnhChinhSua(data.linkAnhChinhSua || "");
            setDanhSachAnhIn(data.danhSachAnhIn || []);
            setHasUpdated(false);
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
        const productId = product.dichVu || product._id;
        const isExisting = gioHang.find(sp => (sp.dichVu || sp._id) === productId);

        let updatedGioHang;

        if (isExisting) {
            updatedGioHang = gioHang.map(sp =>
                (sp.dichVu || sp._id) === productId
                    ? {
                        ...sp,
                        soLuong: (sp.soLuong || 0) + 1
                    }
                    : sp
            );
        } else {
            updatedGioHang = [...gioHang, {
                dichVu: product._id,
                tenDichVuSnapshot: product.tenDichVu,
                donGia: Number(product.giaChoThueDichVu) || 0,
                soLuong: 1
            }];
        }

        updateCartAndTotal(updatedGioHang);
        setSearchTerm("");
        setShowSuggestions(false);
    };


    const updateCartAndTotal = (newCart) => {
        setGioHang(newCart);
        const newTotal = newCart.reduce((sum, item) => {
            const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || 0);
            return sum + (price * (item.soLuong || 0));
        }, 0);
        setTongTien(newTotal);
    };

    // Hàm xóa hoàn toàn sản phẩm khỏi giỏ
    const handleDeleteProduct = (dichVuId) => {
        if (isOldService(dichVuId)) {
            toast.error("Không được phép xóa dịch vụ cũ đã ký!");
            return;
        }
        const updatedCart = gioHang.filter(sp => (sp.dichVu || sp._id) !== dichVuId);
        updateCartAndTotal(updatedCart);
        toast.info("Đã xóa sản phẩm khỏi giỏ hàng");
    };

    // Hàm giảm số lượng sản phẩm
    const handleDecreaseQuantity = (dichVuId) => {
        const existingProduct = gioHang.find(sp => (sp.dichVu || sp._id) === dichVuId);
        if (!existingProduct) return;

        if (isOldService(dichVuId)) {
            const origQty = getOriginalQuantity(dichVuId);
            if (existingProduct.soLuong <= origQty) {
                toast.warning("Không thể giảm số lượng dịch vụ cũ dưới mức ban đầu!");
                return;
            }
        }

        if (existingProduct.soLuong > 1) {
            const updatedCart = gioHang.map(sp =>
                (sp.dichVu || sp._id) === dichVuId ? { ...sp, soLuong: sp.soLuong - 1 } : sp
            );
            updateCartAndTotal(updatedCart);
        } else {
            handleDeleteProduct(dichVuId);
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
            thanhToan: (() => {
                const cacLuotThanhToan = [...(data?.thanhToan?.cacLuotThanhToan || [])];
                if (khachThanhToanTruoc > 0) {
                    cacLuotThanhToan.push({
                        id: `TT-${maHopDong}-${Date.now()}`,
                        khachHang: nameKH1 || "Khách hàng 1",
                        amount: Number(khachThanhToanTruoc),
                        date: new Date().toISOString(),
                        method: methodPayment || "Tiền mặt",
                        noiDung: noiDungPayment || "Thanh toán thêm"
                    });
                }
                return {
                    giamGia: giamGia,
                    loaiGiamGia: loaiGiamGia,
                    cacLuotThanhToan: cacLuotThanhToan
                };
            })(),
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
                thoMakeUp,
                thoChinhAnh: thoChinhAnh,
                banHang: data?.nguoiPhucVu?.banHang || "",
                phucVu: data?.nguoiPhucVu?.phucVu || ""
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

    const submitProgressUpdate = (stepNumber, progressData) => {
        if (!data || !data._id) return;

        showLoading("Đang cập nhật tiến trình...");
        otherService.UPDATE_PROGRESS({
            maHopDong: maHopDong,
            giaiDoan: stepNumber,
            data: progressData
        }).then((response) => {
            const stepNames = {
                1: "Tạo hợp đồng",
                2: "Chụp hình",
                3: "Hậu kỳ",
                4: "In ảnh",
                5: "Hoàn thành"
            };
            toast.success(`Đã chuyển tiến trình sang "${stepNames[stepNumber]}" thành công!`);
            setGiaiDoan(stepNumber);
            setHasUpdated(true);

            // Cập nhật các state hiển thị cục bộ
            if (stepNumber === 2) {
                setLinkAnhGoc(progressData.linkAnhGoc);
            } else if (stepNumber === 3) {
                setLinkAnhChinhSua(progressData.linkAnhChinhSua);
            } else if (stepNumber === 4) {
                setDanhSachAnhIn(progressData.danhSachAnhIn);
            }

            hideLoading();
            setOpenProgressInput(false);
        }).catch((error) => {
            console.error(error);
            toast.error("Lỗi khi cập nhật tiến trình: " + (error.response?.data?.message || error.message || error));
            hideLoading();
        });
    };

    const handleStepClick = (stepNumber) => {
        if (stepNumber === giaiDoan) return;

        // Không được phép đi lùi
        if (stepNumber < giaiDoan) {
            toast.error("Không thể quay lại tiến trình trước đó!");
            return;
        }

        // Quy định chuyển đổi tiến trình hợp lệ
        const allowedTransitions = {
            1: [2],
            2: [3],
            3: [4, 5],
            4: [5],
            5: []
        };

        const allowedTargets = allowedTransitions[giaiDoan] || [];
        if (!allowedTargets.includes(stepNumber)) {
            const stepNames = {
                1: "Tạo hợp đồng (1)",
                2: "Chụp hình (2)",
                3: "Hậu kỳ (3)",
                4: "In ảnh (4)",
                5: "Hoàn thành (5)"
            };
            toast.error(`Không thể chuyển từ "${stepNames[giaiDoan]}" sang "${stepNames[stepNumber]}". Tiến trình phải đi theo thứ tự.`);
            return;
        }

        // Giai đoạn hợp lệ -> mở dialog tương ứng hoặc xác nhận trực tiếp
        setTargetStep(stepNumber);

        if (stepNumber === 2) {
            setInputLinkAnhGoc(linkAnhGoc || "");
            setOpenProgressInput(true);
        } else if (stepNumber === 3) {
            setInputLinkAnhChinhSua(linkAnhChinhSua || "");
            setOpenProgressInput(true);
        } else if (stepNumber === 4) {
            setInputDanhSachAnhIn(danhSachAnhIn || []);
            setNewKichThuoc("");
            setNewSoLuong(1);
            setOpenProgressInput(true);
        } else if (stepNumber === 5) {
            if (window.confirm("Bạn có muốn chuyển tiến trình hợp đồng sang \"Hoàn thành\" không?")) {
                submitProgressUpdate(5, {});
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

                    <button className="close-btn" onClick={handleClose}>×</button>
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
                                                const productId = item.dichVu || item._id;
                                                const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || 0);
                                                const total = price * (item.soLuong || 0);
                                                const origQty = getOriginalQuantity(productId);
                                                const canDecrease = !isOldService(productId) ? item.soLuong > 1 : item.soLuong > origQty;

                                                return (
                                                    <tr key={productId}>
                                                        <td>{item.tenDichVuSnapshot}</td>
                                                        <td style={{ textAlign: "center" }}>
                                                            {/* Nút giảm số lượng */}
                                                            <button
                                                                className="btn-qty"
                                                                onClick={() => handleDecreaseQuantity(productId)}
                                                                disabled={!canDecrease}
                                                                style={{ opacity: canDecrease ? 1 : 0.5, cursor: canDecrease ? 'pointer' : 'not-allowed' }}
                                                            >-</button>
                                                            <span style={{ margin: "0 10px" }}>{item.soLuong}</span>
                                                            {/* Nút tăng số lượng */}
                                                            <button className="btn-qty" onClick={() => handleSelectProduct(item)}>+</button>
                                                        </td>
                                                        <td>{price.toLocaleString("vi-VN")}đ</td>
                                                        <td>{total.toLocaleString("vi-VN")}đ</td>
                                                        <td style={{ textAlign: "center" }}>
                                                            {isOldService(productId) ? (
                                                                <span style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>Dịch vụ gốc</span>
                                                            ) : (
                                                                <Button
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleDeleteProduct(productId)}
                                                                >
                                                                    Xóa
                                                                </Button>
                                                            )}
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

                                        <div className="floating-label" style={{ marginTop: '20px' }}>
                                            <input type="text" name="dichVuChinh" value={getDichVuChinhLabel(dichVuChinh)} disabled />
                                            <label>Dịch vụ chính</label>
                                        </div>

                                        <div className="floating-label" style={{ marginTop: '20px' }}>
                                            <input type="text" name="nhanVienSale" value={nhanVienSale} disabled />
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

                                        <div className="floating-label" style={{ marginTop: '20px' }}>
                                            <input type="text" name="thoChinhAnh" value={thoChinhAnh} onChange={(e) => setThoChinhAnh(e.target.value)} />
                                            <label>Thợ chỉnh ảnh</label>
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

                                        <div className="floating-label" style={{ marginTop: '20px' }}>
                                            <input type="text" name="gioChup" value={gioChup} onChange={(e) => setGioChup(e.target.value)} placeholder="ví dụ: 9h30p" />
                                            <label>Giờ chụp ảnh</label>
                                        </div>

                                        <div className="floating-label" style={{ marginTop: '20px' }}>
                                            <input type="text" name="diaDiemChup" value={diaDiemChup} onChange={(e) => setDiaDiemChup(e.target.value)} />
                                            <label>Địa điểm chụp</label>
                                        </div>

                                        <div className="floating-label" style={{ marginTop: '20px' }}>
                                            <input type="date" name="ngayChinhAnh" value={ngayChinhAnh} onChange={(e) => setNgayChinhAnh(e.target.value)} />
                                            <label>Ngày bắt đầu hậu kỳ</label>
                                        </div>

                                        <div className="floating-label" style={{ marginTop: '20px' }}>
                                            <input type="date" name="ngayTraAnh" value={ngayTraAnh} onChange={(e) => setNgayTraAnh(e.target.value)} />
                                            <label>Ngày trả ảnh</label>
                                        </div>
                                    </div>
                                </div>


                            </div>

                            {(linkAnhGoc || linkAnhChinhSua || (danhSachAnhIn && danhSachAnhIn.length > 0)) && (
                                <div className="dialog-section" style={{ marginTop: '20px' }}>
                                    <h4>Thông tin tiến trình</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 15px', backgroundColor: '#fcfcfc', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                                        {linkAnhGoc && (
                                            <div>
                                                <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#666' }}>Đường dẫn ảnh gốc:</strong>
                                                <a href={linkAnhGoc} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all', color: '#1976d2', textDecoration: 'underline', fontSize: '0.9rem', fontWeight: '500' }}>
                                                    {linkAnhGoc}
                                                </a>
                                            </div>
                                        )}
                                        {linkAnhChinhSua && (
                                            <div style={{ marginTop: '4px' }}>
                                                <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#666' }}>Đường dẫn ảnh chỉnh sửa:</strong>
                                                <a href={linkAnhChinhSua} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all', color: '#1976d2', textDecoration: 'underline', fontSize: '0.9rem', fontWeight: '500' }}>
                                                    {linkAnhChinhSua}
                                                </a>
                                            </div>
                                        )}
                                        {danhSachAnhIn && danhSachAnhIn.length > 0 && (
                                            <div style={{ marginTop: '4px' }}>
                                                <strong style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#666' }}>Danh sách ảnh in:</strong>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left', color: '#666' }}>
                                                            <th style={{ padding: '6px 0' }}>Kích thước</th>
                                                            <th style={{ padding: '6px 0', textAlign: 'right' }}>Số lượng</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {danhSachAnhIn.map((item, index) => (
                                                            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                                                <td style={{ padding: '6px 0', color: '#333' }}>{item.kichThuoc}</td>
                                                                <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold', color: '#333' }}>{item.soLuong}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* === DƯỚI CÙNG: THANH TOÁN === */}
                    <div className="dialog-section payment">
                        <h4>Thông tin thanh toán</h4>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', flexWrap: 'wrap', width: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 2, minWidth: '350px' }}>
                                <p style={{ textAlign: 'left', fontWeight: 'inherit', fontSize: '1.2em', color: 'green', margin: '0 0 10px 0' }}>Lịch sử thanh toán</p>
                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {data?.thanhToan?.cacLuotThanhToan && data.thanhToan.cacLuotThanhToan.length > 0 ? (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left', color: '#666' }}>
                                                    <th style={{ padding: '6px' }}>Ngày</th>
                                                    <th style={{ padding: '6px' }}>Số tiền</th>
                                                    <th style={{ padding: '6px' }}>Hình thức</th>
                                                    <th style={{ padding: '6px' }}>Ghi chú</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.thanhToan.cacLuotThanhToan.map((payment, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ padding: '6px', whiteSpace: 'nowrap' }}>{formatDate(payment.date)}</td>
                                                        <td style={{ padding: '6px', fontWeight: '600', color: '#333' }}>{payment.amount?.toLocaleString("vi-VN")}đ</td>
                                                        <td style={{ padding: '6px' }}>{payment.method}</td>
                                                        <td style={{ padding: '6px', color: '#666', fontStyle: 'italic' }}>{payment.noiDung || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p style={{ fontSize: '0.9rem', color: '#999', textAlign: 'left', margin: '10px 0' }}>Chưa có lượt thanh toán nào.</p>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: '200px' }}>
                                <Autocomplete
                                    disablePortal
                                    options={[
                                        { label: 'Chuyển khoản', id: 0 },
                                        { label: 'Tiền mặt', id: 1 }
                                    ]}
                                    size="small"
                                    value={{ label: methodPayment }}
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
                                        setMethodPayment(newValue ? newValue.label : "Tiền mặt");
                                    }}
                                    sx={{
                                        '& .MuiAutocomplete-inputRoot': { padding: '0 8px' }
                                    }}
                                />

                                <TextField
                                    label="Ghi chú thanh toán"
                                    size="small"
                                    value={noiDungPayment}
                                    onChange={(e) => setNoiDungPayment(e.target.value)}
                                    sx={{
                                        '& .MuiInputBase-root': { fontSize: '0.8rem', height: '32px' },
                                        '& .MuiFormLabel-root': { fontSize: '0.8rem', transform: 'translate(14px, 8px) scale(1)' },
                                        '& .MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75) !important' }
                                    }}
                                />

                                <TextField
                                    label="Thanh toán"
                                    value={khachThanhToanTruoc === 0 ? "" : khachThanhToanTruoc.toLocaleString("vi-VN")}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/[^0-9]/g, "");
                                        setKhachThanhToanTruoc(Number(rawValue) || 0);
                                    }}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        '& .MuiInputBase-root': { fontSize: '0.8rem', height: '32px' },
                                        '& .MuiFormLabel-root': { fontSize: '0.8rem', transform: 'translate(14px, 8px) scale(1)' },
                                        '& .MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75) !important' }
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: '200px' }}>
                                <p style={{ textAlign: 'left', fontWeight: 'inherit', fontSize: '1em', color: 'green' }}>
                                    Tổng tiền đơn hàng: <b>{gioHang.reduce((sum, item) => {
                                        const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || 0);
                                        return sum + (price * (item.soLuong || 0));
                                    }, 0).toLocaleString("vi-VN") + " đ"} </b>
                                </p>
                                <p style={{ textAlign: 'left', fontWeight: 'inherit', fontSize: '1em', color: 'green' }}>
                                    Tổng tiền sau giảm giá: <b>{tongTien.toLocaleString("vi-VN")} đ</b>
                                </p>
                                <p style={{ textAlign: 'left', fontWeight: 'inherit', fontSize: '1em', color: 'green' }}>
                                    Tổng đã thanh toán: <b>{((data?.thanhToan?.khachHangDaThanhToan || 0) + (Number(khachThanhToanTruoc) || 0)).toLocaleString("vi-VN")} đ</b>
                                </p>

                                <p style={{ textAlign: 'left', fontWeight: 'inherit', fontSize: '1.2em', color: 'red' }}>
                                    Tổng tiền còn lại: <b>{Math.max(0, tongTien - ((data?.thanhToan?.khachHangDaThanhToan || 0) + (Number(khachThanhToanTruoc) || 0))).toLocaleString("vi-VN")} đ</b>
                                </p>
                            </div>
                        </div>

                    </div>

                    <div className="dialog-actions">
                        <Button
                            onClick={handleClose}
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

            {/* Dialog nhập liệu thông tin tiến trình */}
            <Dialog open={openProgressInput} onClose={() => setOpenProgressInput(false)} maxWidth="sm" fullWidth>
                <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#1976d2', borderBottom: '1px solid #eee', paddingBottom: '8px', fontWeight: 'bold' }}>
                        Cập nhật tiến trình: {targetStep === 2 ? "Chụp hình" : targetStep === 3 ? "Hậu kỳ" : "In ảnh"}
                    </h3>

                    {targetStep === 2 && (
                        <div style={{ marginTop: '12px' }}>
                            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '12px' }}>
                                Vui lòng nhập đường dẫn thư mục chứa ảnh gốc của khách hàng:
                            </p>
                            <TextField
                                label="Đường dẫn ảnh gốc (URL)"
                                fullWidth
                                variant="outlined"
                                value={inputLinkAnhGoc}
                                onChange={(e) => setInputLinkAnhGoc(e.target.value)}
                                placeholder="https://drive.google.com/drive/folders/..."
                                size="small"
                            />
                        </div>
                    )}

                    {targetStep === 3 && (
                        <div style={{ marginTop: '12px' }}>
                            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '12px' }}>
                                Vui lòng nhập đường dẫn thư mục chứa ảnh đã chỉnh sửa (ảnh hậu kỳ):
                            </p>
                            <TextField
                                label="Đường dẫn ảnh chỉnh sửa (URL)"
                                fullWidth
                                variant="outlined"
                                value={inputLinkAnhChinhSua}
                                onChange={(e) => setInputLinkAnhChinhSua(e.target.value)}
                                placeholder="https://drive.google.com/drive/folders/..."
                                size="small"
                            />
                        </div>
                    )}

                    {targetStep === 4 && (
                        <div style={{ marginTop: '12px' }}>
                            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '12px' }}>
                                Bổ sung danh sách ảnh in kích thước và số lượng:
                            </p>

                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <TextField
                                    label="Kích thước (ví dụ: 60x90, 30x45)"
                                    variant="outlined"
                                    value={newKichThuoc}
                                    onChange={(e) => setNewKichThuoc(e.target.value)}
                                    size="small"
                                    sx={{ flex: 2 }}
                                />
                                <TextField
                                    label="Số lượng"
                                    type="number"
                                    variant="outlined"
                                    value={newSoLuong}
                                    onChange={(e) => setNewSoLuong(Math.max(1, parseInt(e.target.value) || 1))}
                                    size="small"
                                    sx={{ flex: 1 }}
                                    inputProps={{ min: 1 }}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        if (!newKichThuoc.trim()) {
                                            toast.warning("Vui lòng nhập kích thước!");
                                            return;
                                        }
                                        setInputDanhSachAnhIn([
                                            ...inputDanhSachAnhIn,
                                            { kichThuoc: newKichThuoc.trim(), soLuong: newSoLuong }
                                        ]);
                                        setNewKichThuoc("");
                                        setNewSoLuong(1);
                                    }}
                                >
                                    Thêm
                                </Button>
                            </div>

                            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '8px' }}>
                                {inputDanhSachAnhIn.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#999', fontSize: '0.85rem', margin: '16px 0' }}>Chưa có ảnh in nào trong danh sách</p>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                                                <th style={{ padding: '6px' }}>STT</th>
                                                <th style={{ padding: '6px' }}>Kích thước</th>
                                                <th style={{ padding: '6px' }}>Số lượng</th>
                                                <th style={{ padding: '6px', textAlign: 'center' }}>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inputDanhSachAnhIn.map((item, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                                    <td style={{ padding: '6px' }}>{idx + 1}</td>
                                                    <td style={{ padding: '6px' }}>{item.kichThuoc}</td>
                                                    <td style={{ padding: '6px' }}>{item.soLuong}</td>
                                                    <td style={{ padding: '6px', textAlign: 'center' }}>
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            onClick={() => {
                                                                setInputDanhSachAnhIn(inputDanhSachAnhIn.filter((_, i) => i !== idx));
                                                            }}
                                                        >
                                                            Xóa
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                        <Button variant="outlined" color="inherit" onClick={() => setOpenProgressInput(false)}>
                            Hủy
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                if (targetStep === 2) {
                                    if (!inputLinkAnhGoc.trim()) {
                                        toast.warning("Vui lòng nhập đường dẫn ảnh gốc!");
                                        return;
                                    }
                                    submitProgressUpdate(2, { linkAnhGoc: inputLinkAnhGoc.trim() });
                                } else if (targetStep === 3) {
                                    if (!inputLinkAnhChinhSua.trim()) {
                                        toast.warning("Vui lòng nhập đường dẫn ảnh chỉnh sửa!");
                                        return;
                                    }
                                    submitProgressUpdate(3, { linkAnhChinhSua: inputLinkAnhChinhSua.trim() });
                                } else if (targetStep === 4) {
                                    if (inputDanhSachAnhIn.length === 0) {
                                        toast.warning("Vui lòng thêm ít nhất một ảnh in vào danh sách!");
                                        return;
                                    }
                                    submitProgressUpdate(4, { danhSachAnhIn: inputDanhSachAnhIn });
                                }
                            }}
                        >
                            Xác nhận chuyển bước
                        </Button>
                    </div>
                </div>
            </Dialog>

        </Dialog >
    );
}

export default DetailHopDongKhachHangDialog;
