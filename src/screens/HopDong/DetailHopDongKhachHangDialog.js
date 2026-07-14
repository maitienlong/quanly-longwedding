import { useState, useEffect, useRef, Fragment } from "react";
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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { formatDate } from '../utils/convertDate';
import logoVang from '../../assets/logo/BETA-1 VANG@4x.png';
import { formatLunarDateFull } from '../../utils/lunarDateUtils';
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

    const [diaDiemChup, setDiaDiemChup] = useState("");
    const [thoChupHinh, setThoChupHinh] = useState("");
    const [thoMakeUp, setThoMakeUp] = useState("");
    const [thoChinhAnh, setThoChinhAnh] = useState("");
    const [chotLich, setChotLich] = useState("Chưa gọi điện");
    const [listHopDong, setListHopDong] = useState([]);

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
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

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

    const formatTimestampToDateTimeInput = (val) => {
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

    useEffect(() => {
        if (open && data && data.maHopDong) {
            otherService.LIST_HOPDONG({})
                .then(response => {
                    setListHopDong(response.data.hopDong || []);
                })
                .catch(error => {
                    console.error("Lỗi khi tải danh sách hợp đồng để kiểm tra trùng lịch chụp:", error);
                });

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
                setNgayChup(formatTimestampToDateTimeInput(data.cacNgay.ngayChup));
                setNgayAnHoi(formatTimestampToDateTimeInput(data.cacNgay.ngayAnHoi));
                setNgayCuoi(formatTimestampToDateTimeInput(data.cacNgay.ngayCuoi));
                setNgayChinhAnh(formatTimestampToDateInput(data.cacNgay.ngayChinhAnh));
                setNgayTraAnh(formatTimestampToDateInput(data.cacNgay.ngayTraAnh));

                setDiaDiemChup(data.cacNgay.diaDiemChup || "");
                setChotLich(data.cacNgay.chotLich || "Chưa gọi điện");
            } else {

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
        (p.tenDichVu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.maDichVu?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSelectProduct = (product) => {
        const productId = product.dichVu || product._id;
        const isNewPreW = product.maDichVu?.toUpperCase().startsWith("PRE-W");

        // Tìm xem trong giỏ đã có dịch vụ PRE-W nào chưa
        const existingPreW = isNewPreW ? gioHang.find(item => {
            const serviceId = item.dichVu?._id || item.dichVu || item._id;
            const matchingService = listDichVu.find(p => p._id === serviceId);
            const code = matchingService?.maDichVu || item.maDichVu || "";
            return code.toUpperCase().startsWith("PRE-W");
        }) : null;

        let updatedGioHang;

        if (existingPreW) {
            // Thay thế hoàn toàn dịch vụ PRE-W cũ bằng dịch vụ PRE-W mới
            const targetId = existingPreW.dichVu?._id || existingPreW.dichVu || existingPreW._id;
            updatedGioHang = gioHang.map(item => {
                const itemId = item.dichVu?._id || item.dichVu || item._id;
                if (itemId === targetId) {
                    return {
                        dichVu: product._id,
                        tenDichVuSnapshot: product.tenDichVu,
                        maDichVu: product.maDichVu,
                        donGia: Number(product.giaChoThueDichVu) || 0,
                        soLuong: 1,
                        loaiDichVu: product.loaiDichVu,
                        soLuongAnhChinhSua: Number(product.soLuongAnhChinhSua) || 0,
                        soLuongAnh16x21: Number(product.soLuongAnh16x21) || 0,
                        soLuongAnh20x30: Number(product.soLuongAnh20x30) || 0,
                        soLuongAnh60x90: Number(product.soLuongAnh60x90) || 0,
                        trangDiemNgayAnHoi: product.trangDiemNgayAnHoi || "",
                        trangDiemNgayCuoi: product.trangDiemNgayCuoi || "",
                        trangPhucChoDoiBeLe: product.trangPhucChoDoiBeLe || "",
                        trangPhucCoDauNgayAnHoi: product.trangPhucCoDauNgayAnHoi || "",
                        trangPhucChuReNgayAnHoi: product.trangPhucChuReNgayAnHoi || "",
                        trangPhucVayCuoiNgayCuoi: product.trangPhucVayCuoiNgayCuoi || "",
                        trangPhucVestChuReNgayCuoi: product.trangPhucVestChuReNgayCuoi || "",
                        hoaCamTay: product.hoaCamTay || ""
                    };
                }
                return item;
            });
        } else {
            const isExisting = gioHang.find(sp => (sp.dichVu || sp._id) === productId);
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
                    maDichVu: product.maDichVu,
                    donGia: Number(product.giaChoThueDichVu) || 0,
                    soLuong: 1,
                    loaiDichVu: product.loaiDichVu,
                    soLuongAnhChinhSua: Number(product.soLuongAnhChinhSua) || 0,
                    soLuongAnh16x21: Number(product.soLuongAnh16x21) || 0,
                    soLuongAnh20x30: Number(product.soLuongAnh20x30) || 0,
                    soLuongAnh60x90: Number(product.soLuongAnh60x90) || 0,
                    trangDiemNgayAnHoi: product.trangDiemNgayAnHoi || "",
                    trangDiemNgayCuoi: product.trangDiemNgayCuoi || "",
                    trangPhucChoDoiBeLe: product.trangPhucChoDoiBeLe || "",
                    trangPhucCoDauNgayAnHoi: product.trangPhucCoDauNgayAnHoi || "",
                    trangPhucChuReNgayAnHoi: product.trangPhucChuReNgayAnHoi || "",
                    trangPhucVayCuoiNgayCuoi: product.trangPhucVayCuoiNgayCuoi || "",
                    trangPhucVestChuReNgayCuoi: product.trangPhucVestChuReNgayCuoi || "",
                    hoaCamTay: product.hoaCamTay || ""
                }];
            }
        }

        updateCartAndTotal(updatedGioHang);
        setSearchTerm("");
        setShowSuggestions(false);
    };

    const handleParamChange = (dichVuId, field, value) => {
        const updatedCart = gioHang.map(sp => {
            const spId = sp.dichVu?._id || sp.dichVu || sp._id;
            if (spId === dichVuId) {
                return { ...sp, [field]: value };
            }
            return sp;
        });
        updateCartAndTotal(updatedCart);
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



    const checkNgayChupConflict = (selectedDateTimeStr, currentContractId = null) => {
        if (!selectedDateTimeStr) return null;
        const selectedTime = new Date(selectedDateTimeStr).getTime();
        if (isNaN(selectedTime)) return null;

        const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

        for (const hd of listHopDong) {
            if (currentContractId && hd._id === currentContractId) continue;
            if (Number(hd.giaiDoan) !== 1) continue;
            if (!hd.cacNgay?.ngayChup) continue;

            const existingTime = new Date(hd.cacNgay.ngayChup).getTime();
            if (isNaN(existingTime)) continue;

            const diff = Math.abs(selectedTime - existingTime);
            if (diff <= THREE_HOURS_MS) {
                return hd;
            }
        }
        return null;
    };

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
                gioChup: (() => {
                    if (!ngayChup) return "";
                    const date = new Date(ngayChup);
                    if (isNaN(date.getTime())) return "";
                    const hh = String(date.getHours()).padStart(2, '0');
                    const mm = String(date.getMinutes()).padStart(2, '0');
                    return `${hh}:${mm}`;
                })(),
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

    const handleDeleteHopDong = () => {
        if (deleteConfirmInput !== maHopDong) {
            toast.error("Mã hợp đồng không chính xác!");
            return;
        }

        showLoading("Đang xóa hợp đồng...");
        otherService.deleteHopDong({ maHopDong })
            .then((response) => {
                toast.success("Xóa hợp đồng thành công!");
                hideLoading();
                setOpenDeleteDialog(false);
                onClose(true); // Đóng dialog và tải lại danh sách
            })
            .catch((error) => {
                console.error(error);
                toast.error("Có lỗi xảy ra khi xóa hợp đồng!");
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



    const getAggregatedParams = () => {
        const totals = {
            soLuongAnhChinhSua: 0,
            soLuongAnh16x21: 0,
            soLuongAnh20x30: 0,
            soLuongAnh60x90: 0,
            trangDiemNgayAnHoi: [],
            trangDiemNgayCuoi: [],
            trangPhucChoDoiBeLe: [],
            trangPhucCoDauNgayAnHoi: [],
            trangPhucChuReNgayAnHoi: [],
            trangPhucVayCuoiNgayCuoi: [],
            trangPhucVestChuReNgayCuoi: [],
            hoaCamTay: []
        };

        if (Array.isArray(gioHang)) {
            gioHang.forEach(item => {
                const qty = item.soLuong || 1;
                totals.soLuongAnhChinhSua += (Number(item.soLuongAnhChinhSua) || 0) * qty;
                totals.soLuongAnh16x21 += (Number(item.soLuongAnh16x21) || 0) * qty;
                totals.soLuongAnh20x30 += (Number(item.soLuongAnh20x30) || 0) * qty;
                totals.soLuongAnh60x90 += (Number(item.soLuongAnh60x90) || 0) * qty;

                if (item.trangDiemNgayAnHoi) totals.trangDiemNgayAnHoi.push(item.trangDiemNgayAnHoi);
                if (item.trangDiemNgayCuoi) totals.trangDiemNgayCuoi.push(item.trangDiemNgayCuoi);
                if (item.trangPhucChoDoiBeLe) totals.trangPhucChoDoiBeLe.push(item.trangPhucChoDoiBeLe);
                if (item.trangPhucCoDauNgayAnHoi) totals.trangPhucCoDauNgayAnHoi.push(item.trangPhucCoDauNgayAnHoi);
                if (item.trangPhucChuReNgayAnHoi) totals.trangPhucChuReNgayAnHoi.push(item.trangPhucChuReNgayAnHoi);
                if (item.trangPhucVayCuoiNgayCuoi) totals.trangPhucVayCuoiNgayCuoi.push(item.trangPhucVayCuoiNgayCuoi);
                if (item.trangPhucVestChuReNgayCuoi) totals.trangPhucVestChuReNgayCuoi.push(item.trangPhucVestChuReNgayCuoi);
                if (item.hoaCamTay) totals.hoaCamTay.push(item.hoaCamTay);
            });
        }

        return {
            soLuongAnhChinhSua: totals.soLuongAnhChinhSua,
            soLuongAnh16x21: totals.soLuongAnh16x21,
            soLuongAnh20x30: totals.soLuongAnh20x30,
            soLuongAnh60x90: totals.soLuongAnh60x90,
            trangDiemNgayAnHoi: totals.trangDiemNgayAnHoi.join(", ") || "Không có",
            trangDiemNgayCuoi: totals.trangDiemNgayCuoi.join(", ") || "Không có",
            trangPhucChoDoiBeLe: totals.trangPhucChoDoiBeLe.join(", ") || "Không có",
            trangPhucCoDauNgayAnHoi: totals.trangPhucCoDauNgayAnHoi.join(", ") || "Không có",
            trangPhucChuReNgayAnHoi: totals.trangPhucChuReNgayAnHoi.join(", ") || "Không có",
            trangPhucVayCuoiNgayCuoi: totals.trangPhucVayCuoiNgayCuoi.join(", ") || "Không có",
            trangPhucVestChuReNgayCuoi: totals.trangPhucVestChuReNgayCuoi.join(", ") || "Không có",
            hoaCamTay: totals.hoaCamTay.join(", ") || "Không có"
        };
    };

    const handlePrintHopDong = () => {
        const printWindow = window.open("", "_blank");
        const ngayHDFormatted = dayjs(ngayHopDong).format('DD/MM/YYYY');
        const ngayChupFormatted = ngayChup ? dayjs(ngayChup).format('DD/MM/YYYY HH:mm') : 'Chưa xếp lịch';
        const ngayAnHoiFormatted = ngayAnHoi ? dayjs(ngayAnHoi).format('DD/MM/YYYY HH:mm') : '';
        const ngayCuoiFormatted = ngayCuoi ? dayjs(ngayCuoi).format('DD/MM/YYYY HH:mm') : '';
        
        const tongGoc = gioHang.reduce((sum, item) => {
            const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || 0);
            return sum + (price * (item.soLuong || 0));
        }, 0);
        
        const conLai = Math.max(0, tongTien - ((data?.thanhToan?.khachHangDaThanhToan || 0) + (Number(khachThanhToanTruoc) || 0)));
        const totals = getAggregatedParams();
        
        printWindow.document.write(`
            <html>
            <head>
                <title>Hợp Đồng Dịch Vụ - ${maHopDong}</title>
                <style>
                    body { font-family: "Arial", "Helvetica", sans-serif; padding: 30px; line-height: 1.5; color: #333; }
                    .header-sec { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
                    .company-logo { font-size: 26px; font-weight: bold; letter-spacing: 1px; color: #111; }
                    .company-info { text-align: right; font-size: 13px; color: #555; }
                    .contract-title-sec { text-align: center; margin: 30px 0; }
                    .title { font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; color: #000; letter-spacing: 0.5px; }
                    .date-line { font-style: italic; font-size: 14px; margin-top: 5px; color: #555; }
                    .section-title { font-size: 16px; font-weight: bold; text-transform: uppercase; margin-top: 25px; margin-bottom: 12px; border-left: 3px solid #333; padding-left: 8px; }
                    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                    .info-table td { padding: 6px 0; vertical-align: top; border: none; font-size: 14px; }
                    .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
                    .items-table th { background-color: #f5f5f5; font-weight: bold; }
                    .items-table td.number, .items-table th.number { text-align: right; }
                    .items-table td.center, .items-table th.center { text-align: center; }
                    
                    /* Grid parameters style */
                    .params-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr;
                        gap: 15px;
                        background: #f9f9f9;
                        padding: 15px;
                        border: 1px solid #e0e0e0;
                        border-radius: 6px;
                        margin-top: 10px;
                        margin-bottom: 20px;
                    }
                    .param-item {
                        font-size: 13px;
                    }
                    .param-item strong {
                        color: #111;
                    }
                    
                    .summary-container { display: flex; justify-content: flex-end; margin-bottom: 25px; }
                    .summary-table { width: 380px; border-collapse: collapse; }
                    .summary-table td { padding: 6px 0; font-size: 14px; }
                    .summary-table td.label { text-align: left; color: #555; }
                    .summary-table td.value { text-align: right; font-weight: 500; }
                    .summary-table tr.total td { font-weight: bold; font-size: 16px; border-top: 1px solid #333; padding-top: 8px; }
                    .signatures { display: flex; justify-content: space-between; margin-top: 50px; font-size: 14px; text-align: center; page-break-inside: avoid; }
                    .sig-box { width: 250px; }
                    .sig-title { font-weight: bold; margin-bottom: 80px; }
                    .sig-name { font-weight: bold; }
                    .terms { font-size: 12px; color: #666; margin-top: 40px; border-top: 1px dashed #ccc; padding-top: 15px; }
                    .terms-title { font-weight: bold; margin-bottom: 5px; color: #444; }
                    .terms p { margin: 4px 0; }
                </style>
            </head>
            <body>
                <div class="header-sec" style="align-items: center;">
                    <div class="company-logo-sec">
                        <img src="${window.location.origin}${logoVang}" alt="LONG WEDDING" style="height: 70px; object-fit: contain;" />
                    </div>
                    <div class="company-info" style="text-align: right;">
                        <div>Website: <strong>longwedding.vn</strong></div>
                        <div>Hotline: <strong>0868.66.3637</strong></div>
                        <div>Địa chỉ: <strong>Số 129 đường 1/5, xóm Tân Hồng, xã Nghĩa Đàn, tỉnh Nghệ An</strong></div>
                    </div>
                </div>
                
                <div class="contract-title-sec">
                    <div class="title">HỢP ĐỒNG DỊCH VỤ</div>
                    <div class="date-line">Mã số HĐ: <strong>${maHopDong}</strong> - Ngày lập: ${ngayHDFormatted}</div>
                </div>

                <div class="section-title">Thông tin khách hàng</div>
                <table class="info-table">
                    <tr>
                        <td style="width: 50%;"><strong>Khách hàng A:</strong> ${nameKH1 || 'Chưa cập nhật'}</td>
                        <td style="width: 50%;"><strong>Khách hàng B:</strong> ${nameKH2 || 'Chưa cập nhật'}</td>
                    </tr>
                    <tr>
                        <td><strong>Số điện thoại:</strong> ${phoneKH1 || 'Chưa cập nhật'}</td>
                        <td><strong>Số điện thoại:</strong> ${phoneKH2 || 'Chưa cập nhật'}</td>
                    </tr>
                    <tr>
                        <td><strong>Địa chỉ:</strong> ${addressKH1 || 'Chưa cập nhật'}</td>
                        <td><strong>Địa chỉ:</strong> ${addressKH2 || 'Chưa cập nhật'}</td>
                    </tr>
                </table>

                <div class="section-title">Nội dung dịch vụ đăng ký</div>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 50px; text-align: center;">STT</th>
                            <th>Tên Dịch Vụ / Sản Phẩm</th>
                            <th style="width: 80px; text-align: center;">Số lượng</th>
                            <th style="width: 130px; text-align: right;">Đơn giá</th>
                            <th style="width: 150px; text-align: right;">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${gioHang.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: #999;">Chưa đăng ký dịch vụ nào</td></tr>` : 
                          gioHang.map((item, index) => {
                            const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || 0);
                            const total = price * (item.soLuong || 0);
                            return `
                                <tr>
                                    <td style="text-align: center;">${index + 1}</td>
                                    <td>${item.tenDichVuSnapshot || item.tenDichVu}</td>
                                    <td style="text-align: center;">${item.soLuong}</td>
                                    <td style="text-align: right;">${price.toLocaleString('vi-VN')} đ</td>
                                    <td style="text-align: right; font-weight: bold;">${total.toLocaleString('vi-VN')} đ</td>
                                </tr>
                            `;
                          }).join('')}
                    </tbody>
                </table>

                <div class="section-title">Chi tiết tham số dịch vụ</div>
                <div class="params-grid">
                    <div class="param-item"><strong>SL ảnh chỉnh sửa:</strong> ${totals.soLuongAnhChinhSua}</div>
                    <div class="param-item"><strong>SL ảnh 16x21:</strong> ${totals.soLuongAnh16x21}</div>
                    <div class="param-item"><strong>SL ảnh 20x30:</strong> ${totals.soLuongAnh20x30}</div>
                    <div class="param-item"><strong>SL ảnh 60x90:</strong> ${totals.soLuongAnh60x90}</div>
                    <div class="param-item"><strong>Trang điểm ngày ăn hỏi:</strong> ${totals.trangDiemNgayAnHoi}</div>
                    <div class="param-item"><strong>Trang điểm ngày cưới:</strong> ${totals.trangDiemNgayCuoi}</div>
                    <div class="param-item"><strong>Trang phục bê lễ:</strong> ${totals.trangPhucChoDoiBeLe}</div>
                    <div class="param-item"><strong>TP cô dâu ngày ăn hỏi:</strong> ${totals.trangPhucCoDauNgayAnHoi}</div>
                    <div class="param-item"><strong>TP chú rể ngày ăn hỏi:</strong> ${totals.trangPhucChuReNgayAnHoi}</div>
                    <div class="param-item"><strong>Váy cưới ngày cưới (giá trị):</strong> ${totals.trangPhucVayCuoiNgayCuoi}</div>
                    <div class="param-item"><strong>Vest chú rể ngày cưới:</strong> ${totals.trangPhucVestChuReNgayCuoi}</div>
                    <div class="param-item"><strong>Hoa cầm tay:</strong> ${totals.hoaCamTay}</div>
                </div>

                <div class="summary-container">
                    <table class="summary-table">
                        <tr>
                            <td class="label">Tổng giá trị dịch vụ:</td>
                            <td class="value">${tongGoc.toLocaleString('vi-VN')} đ</td>
                        </tr>
                        ${giamGia > 0 ? `
                        <tr>
                            <td class="label">Giảm giá:</td>
                            <td class="value">-${giamGia.toLocaleString('vi-VN')}${loaiGiamGia === 1 ? '%' : ' đ'}</td>
                        </tr>
                        ` : ''}
                        <tr class="total">
                            <td class="label">Tổng cộng thanh toán:</td>
                            <td class="value">${tongTien.toLocaleString('vi-VN')} đ</td>
                        </tr>
                        <tr>
                            <td class="label" style="color: green; font-weight: bold;">Đã thanh toán:</td>
                            <td class="value" style="color: green; font-weight: bold;">${((data?.thanhToan?.khachHangDaThanhToan || 0) + (Number(khachThanhToanTruoc) || 0)).toLocaleString('vi-VN')} đ</td>
                        </tr>
                        <tr style="border-top: 1px dashed #ddd;">
                            <td class="label" style="color: red; font-weight: bold; padding-top: 8px;">Còn lại phải thanh toán:</td>
                            <td class="value" style="color: red; font-weight: bold; padding-top: 8px;">${conLai.toLocaleString('vi-VN')} đ</td>
                        </tr>
                    </table>
                </div>

                <div class="section-title">Lịch trình & Nhân sự</div>
                <table class="info-table">
                    <tr>
                        <td style="width: 50%;"><strong>Ngày chụp ảnh:</strong> ${ngayChupFormatted}</td>
                        <td style="width: 50%;"><strong>Địa điểm chụp:</strong> ${diaDiemChup || 'Chưa cập nhật'}</td>
                    </tr>
                    ${ngayAnHoiFormatted ? `
                    <tr>
                        <td><strong>Ngày ăn hỏi:</strong> ${ngayAnHoiFormatted}</td>
                        <td></td>
                    </tr>
                    ` : ''}
                    ${ngayCuoiFormatted ? `
                    <tr>
                        <td><strong>Ngày cưới:</strong> ${ngayCuoiFormatted}</td>
                        <td></td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td><strong>Thợ chụp hình:</strong> ${thoChupHinh || 'Chưa phân công'}</td>
                        <td><strong>Thợ Make-up:</strong> ${thoMakeUp || 'Chưa phân công'}</td>
                    </tr>
                    <tr>
                        <td><strong>Thợ chỉnh ảnh:</strong> ${thoChinhAnh || 'Chưa phân công'}</td>
                        <td></td>
                    </tr>
                </table>

                <div class="signatures">
                    <div class="sig-box">
                        <div class="sig-title">ĐẠI DIỆN KHÁCH HÀNG (BÊN A)</div>
                        <div class="sig-name">${nameKH1 || ''}</div>
                    </div>
                    <div class="sig-box">
                        <div class="sig-title">ĐẠI DIỆN CỬA HÀNG (BÊN B)</div>
                        <div class="sig-name">LONG WEDDING</div>
                    </div>
                </div>

                <div class="terms">
                    <div class="terms-title">Điều khoản chung & Cam kết dịch vụ:</div>
                    <p>1. Bên A cam kết thanh toán đầy đủ các khoản chi phí theo tiến độ đã thoả thuận trong hợp đồng.</p>
                    <p>2. Bên B cam kết thực hiện đúng, đầy đủ các dịch vụ chất lượng đã ký kết với khách hàng.</p>
                    <p>3. Mọi thay đổi về lịch trình hoặc dịch vụ cần được thông báo trước ít nhất 3 ngày.</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 300);
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="floating-label">
                                        <input name="maHopDong" value={maHopDong} disabled />
                                        <label>Mã hợp đồng</label>
                                    </div>

                                    <div className="floating-label">
                                        <input type="text" name="dichVuChinh" value={getDichVuChinhLabel(dichVuChinh)} disabled />
                                        <label>Dịch vụ chính</label>
                                    </div>

                                    <div className="floating-label">
                                        <input type="text" name="nhanVienSale" value={nhanVienSale} disabled />
                                        <label>Nhân viên sale</label>
                                    </div>

                                    <div className="floating-label">
                                        <input type="text" name="thoChupHinh" value={thoChupHinh} onChange={(e) => setThoChupHinh(e.target.value)} />
                                        <label>Thợ chụp hình</label>
                                    </div>

                                    <div className="floating-label">
                                        <input type="text" name="thoMakeUp" value={thoMakeUp} onChange={(e) => setThoMakeUp(e.target.value)} />
                                        <label>Thợ Make-up</label>
                                    </div>

                                    <div className="floating-label">
                                        <select name="chotLich" value={chotLich} onChange={(e) => setChotLich(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '4px', border: '1px solid #ccc', padding: '0 8px', fontSize: '0.85rem' }}>
                                            <option value="Chưa gọi điện">Chưa gọi điện</option>
                                            <option value="Đã gọi điện xác nhận">Đã gọi điện xác nhận</option>
                                            <option value="Đã chốt lịch">Đã chốt lịch</option>
                                        </select>
                                        <label style={{ top: '-10px', fontSize: '0.8rem', color: '#1976d2' }}>Chốt lịch</label>
                                    </div>

                                    <div className="floating-label">
                                        <input type="text" name="thoChinhAnh" value={thoChinhAnh} onChange={(e) => setThoChinhAnh(e.target.value)} />
                                        <label>Thợ chỉnh ảnh</label>
                                    </div>
                                </div>
                            </div>

                            <div className="dialog-section" style={{ marginTop: '20px' }}>
                                <h4>Thông tin chung & Lịch trình</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                                            <DateTimePicker
                                                label="Ngày chụp ảnh"
                                                value={ngayChup ? dayjs(ngayChup) : null}
                                                onChange={(newValue) => {
                                                    const formatted = newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '';
                                                    setNgayChup(formatted);
                                                    if (formatted) {
                                                        const conflict = checkNgayChupConflict(formatted, data?._id);
                                                        if (conflict) {
                                                            const conflictTime = new Date(conflict.cacNgay.ngayChup);
                                                            const timeStr = `${String(conflictTime.getHours()).padStart(2, '0')}:${String(conflictTime.getMinutes()).padStart(2, '0')} ngày ${conflictTime.getDate()}/${conflictTime.getMonth() + 1}/${conflictTime.getFullYear()}`;
                                                            toast.warning(`Cảnh báo: Trùng hoặc quá gần lịch chụp với HĐ ${conflict.maHopDong} (${conflict.khachHang1?.tenKhachHang || ''}) vào lúc ${timeStr} (khoảng cách dưới 3 tiếng).`);
                                                        }
                                                    }
                                                }}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        required: true,
                                                        size: 'small',
                                                    }
                                                }}
                                                format="DD/MM/YYYY HH:mm"
                                            />
                                        </LocalizationProvider>
                                        {ngayChup && (
                                            <div style={{ fontSize: '0.78rem', color: '#e67e22', marginTop: '-10px', marginLeft: '4px', fontWeight: '500', marginBottom: '10px' }}>
                                                Âm lịch: {formatLunarDateFull(ngayChup)}
                                            </div>
                                        )}

                                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                                            <DateTimePicker
                                                label="Ngày ăn hỏi"
                                                value={ngayAnHoi ? dayjs(ngayAnHoi) : null}
                                                onChange={(newValue) => setNgayAnHoi(newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '')}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        required: true,
                                                        size: 'small',
                                                    }
                                                }}
                                                format="DD/MM/YYYY HH:mm"
                                            />
                                        </LocalizationProvider>
                                        {ngayAnHoi && (
                                            <div style={{ fontSize: '0.78rem', color: '#e67e22', marginTop: '-10px', marginLeft: '4px', fontWeight: '500', marginBottom: '10px' }}>
                                                Âm lịch: {formatLunarDateFull(ngayAnHoi)}
                                            </div>
                                        )}

                                        <div className="floating-label" style={{ marginTop: '5px' }}>
                                            <input type="date" name="ngayChinhAnh" value={ngayChinhAnh} onChange={(e) => setNgayChinhAnh(e.target.value)} />
                                            <label>Ngày bắt đầu hậu kỳ</label>
                                        </div>
                                        {ngayChinhAnh && (
                                            <div style={{ fontSize: '0.78rem', color: '#e67e22', marginTop: '-10px', marginLeft: '4px', fontWeight: '500', marginBottom: '10px' }}>
                                                Âm lịch: {formatLunarDateFull(ngayChinhAnh)}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                                            <DateTimePicker
                                                label="Ngày cưới"
                                                value={ngayCuoi ? dayjs(ngayCuoi) : null}
                                                onChange={(newValue) => setNgayCuoi(newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '')}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        required: true,
                                                        size: 'small',
                                                    }
                                                }}
                                                format="DD/MM/YYYY HH:mm"
                                            />
                                        </LocalizationProvider>
                                        {ngayCuoi && (
                                            <div style={{ fontSize: '0.78rem', color: '#e67e22', marginTop: '-10px', marginLeft: '4px', fontWeight: '500', marginBottom: '10px' }}>
                                                Âm lịch: {formatLunarDateFull(ngayCuoi)}
                                            </div>
                                        )}

                                        <div className="floating-label" style={{ marginTop: '0px' }}>
                                            <input type="text" name="diaDiemChup" value={diaDiemChup} onChange={(e) => setDiaDiemChup(e.target.value)} />
                                            <label>Địa điểm chụp</label>
                                        </div>

                                        <div className="floating-label" style={{ marginTop: '5px' }}>
                                            <input type="date" name="ngayTraAnh" value={ngayTraAnh} onChange={(e) => setNgayTraAnh(e.target.value)} />
                                            <label>Ngày trả ảnh</label>
                                        </div>
                                        {ngayTraAnh && (
                                            <div style={{ fontSize: '0.78rem', color: '#e67e22', marginTop: '-10px', marginLeft: '4px', fontWeight: '500', marginBottom: '10px' }}>
                                                Âm lịch: {formatLunarDateFull(ngayTraAnh)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {(() => {
                                    const totals = getAggregatedParams();
                                    return (
                                        <>
                                            <div className="package-parameters-title" style={{ marginTop: '25px' }}>Tổng hợp dịch vụ trong hợp đồng</div>
                                            <div className="summary-parameters-grid">
                                                <div className="form-group-summary">
                                                    <label>SL ảnh chỉnh sửa</label>
                                                    <div className="summary-value-box">{totals.soLuongAnhChinhSua}</div>
                                                </div>
                                                <div className="form-group-summary">
                                                    <label>SL ảnh 16x21</label>
                                                    <div className="summary-value-box">{totals.soLuongAnh16x21}</div>
                                                </div>
                                                <div className="form-group-summary">
                                                    <label>SL ảnh 20x30</label>
                                                    <div className="summary-value-box">{totals.soLuongAnh20x30}</div>
                                                </div>
                                                <div className="form-group-summary">
                                                    <label>SL ảnh 60x90</label>
                                                    <div className="summary-value-box">{totals.soLuongAnh60x90}</div>
                                                </div>
                                                <div className="form-group-summary">
                                                    <label>Trang điểm ngày ăn hỏi</label>
                                                    <div className="summary-value-box">{totals.trangDiemNgayAnHoi}</div>
                                                </div>
                                                <div className="form-group-summary">
                                                    <label>Trang điểm ngày cưới</label>
                                                    <div className="summary-value-box">{totals.trangDiemNgayCuoi}</div>
                                                </div>
                                                <div className="form-group-summary">
                                                    <label>Trang phục bê lễ</label>
                                                    <div className="summary-value-box">{totals.trangPhucChoDoiBeLe}</div>
                                                </div>
                                                <div className="form-group-summary">
                                                    <label>TP cô dâu ngày ăn hỏi</label>
                                                    <div className="summary-value-box">{totals.trangPhucCoDauNgayAnHoi}</div>
                                                </div>
                                                <div className="form-group-summary">
                                                    <label>TP chú rể ngày ăn hỏi</label>
                                                    <div className="summary-value-box">{totals.trangPhucChuReNgayAnHoi}</div>
                                                </div>
                                                <div className="form-group-summary">
                                                    <label>Váy cưới ngày cưới (giá trị)</label>
                                                    <div className="summary-value-box">{totals.trangPhucVayCuoiNgayCuoi}</div>
                                                </div>
                                                <div className="form-group-summary">
                                                    <label>Vest chú rể ngày cưới</label>
                                                    <div className="summary-value-box">{totals.trangPhucVestChuReNgayCuoi}</div>
                                                </div>
                                                <div className="form-group-summary">
                                                    <label>Hoa cầm tay</label>
                                                    <div className="summary-value-box">{totals.hoaCamTay}</div>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
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

                        <div className="left-column">
                            <h4>Sản phẩm</h4>

                            <div className="product-search-container" ref={searchRef}>
                                <AppSearchInput
                                    value={searchTerm}
                                    placeholder="Tìm tên hoặc mã sản phẩm"
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
                                                <span className="p-name">{p.tenDichVu} <small style={{ color: '#888', marginLeft: '5px' }}>({p.maDichVu})</small></span>
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
                                            gioHang.map((item, index) => {
                                                const productId = item.dichVu?._id || item.dichVu || item._id;
                                                const price = item.donGia || item.giaChoThueDichVu || 0;
                                                const total = price * (item.soLuong || 0);
                                                const loaiDichVuVal = item.loaiDichVu ?? item.dichVu?.loaiDichVu;

                                                return (
                                                    <Fragment key={productId}>
                                                        <tr style={{ backgroundColor: Number(loaiDichVuVal) !== 1 ? '#f5f8fc' : 'transparent' }}>
                                                            <td style={{ fontWeight: Number(loaiDichVuVal) !== 1 ? '600' : 'normal' }}>{item.tenDichVuSnapshot || item.tenDichVu}</td>
                                                            <td style={{ textAlign: "center" }}>
                                                                <button className="btn-qty" onClick={() => handleDecreaseQuantity(productId)}>-</button>
                                                                <span style={{ margin: "0 10px" }}>{item.soLuong}</span>
                                                                <button className="btn-qty" onClick={() => handleSelectProduct(item)}>+</button>
                                                            </td>
                                                            <td>{price.toLocaleString("vi-VN")}đ</td>
                                                            <td>{total.toLocaleString("vi-VN")}đ</td>
                                                            <td style={{ textAlign: "center" }}>
                                                                <Button
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleDeleteProduct(productId)}
                                                                >
                                                                    Xóa
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    </Fragment>
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

                    <div className="dialog-actions" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Button
                            onClick={() => {
                                setDeleteConfirmInput("");
                                setOpenDeleteDialog(true);
                            }}
                            variant="outlined"
                            color="error"
                            sx={{
                                whiteSpace: 'nowrap'
                            }}
                        >Xóa hợp đồng</Button>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button
                                onClick={handleClose}
                                variant="contained"
                                color="error"
                                sx={{
                                    whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                                }}
                            >Thoát</Button>

                            <Button
                                onClick={handlePrintHopDong}
                                variant="contained"
                                color="success"
                                startIcon={<FontAwesomeIcon icon={faPrint} />}
                                sx={{
                                    whiteSpace: 'nowrap'
                                }}
                            >In hợp đồng</Button>

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

            {/* Dialog xác nhận xóa hợp đồng */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
                <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#d32f2f', borderBottom: '1px solid #eee', paddingBottom: '8px', fontWeight: 'bold' }}>
                        Xác nhận xóa hợp đồng
                    </h3>
                    <p style={{ fontSize: '0.95rem', color: '#333', lineHeight: '1.6', marginBottom: '16px' }}>
                        Hành động này sẽ xóa hoàn toàn hợp đồng <strong>{maHopDong}</strong> cùng với lịch soạn đồ liên quan (nếu có). 
                        Đây là hành động <strong>không thể hoàn tác</strong>.
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '12px' }}>
                        Vui lòng nhập chính xác mã hợp đồng <strong>{maHopDong}</strong> để xác nhận:
                    </p>
                    <TextField
                        label="Nhập mã hợp đồng"
                        fullWidth
                        variant="outlined"
                        value={deleteConfirmInput}
                        onChange={(e) => setDeleteConfirmInput(e.target.value)}
                        placeholder={maHopDong}
                        size="small"
                        error={deleteConfirmInput !== "" && deleteConfirmInput !== maHopDong}
                        helperText={deleteConfirmInput !== "" && deleteConfirmInput !== maHopDong ? "Mã hợp đồng nhập vào không chính xác" : ""}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                        <Button variant="outlined" color="inherit" onClick={() => setOpenDeleteDialog(false)}>
                            Hủy bỏ
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            disabled={deleteConfirmInput !== maHopDong}
                            onClick={handleDeleteHopDong}
                        >
                            Xác nhận xóa
                        </Button>
                    </div>
                </div>
            </Dialog>

        </Dialog >
    );
}

export default DetailHopDongKhachHangDialog;
