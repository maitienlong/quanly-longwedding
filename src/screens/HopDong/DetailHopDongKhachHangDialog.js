import { useState, useEffect, useRef, Fragment } from "react";
import "./ThemHopDongDialog.css";
import AppSearchInput from "../../components/AppSearchInput";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import otherService from '../../API/services/otherService';
import TextField from '@mui/material/TextField';
import { toast } from 'sonner';
import { useLoading } from "../../context/LoadingContext";
import { useContractTypes } from '../../hooks/useContractTypes';
import Autocomplete from '@mui/material/Autocomplete';
import { Box, Switch, FormControlLabel, Tabs, Tab, IconButton } from '@mui/material';
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
    faCircleCheck,
    faHeart,
    faDownload
} from '@fortawesome/free-solid-svg-icons';
import MobileAccordion from '../../components/MobileAccordion';
import LocAnhMayTinhDialog from './LocAnhMayTinhDialog';
import { downloadPhoto } from '../../utils/downloadHelper';
// getDichVuChinhLabel is now retrieved dynamically from useContractTypes hook

function DetailHopDongKhachHangDialog(props) {
    const { onClose, data, selectedValue, open } = props;
    const { getDichVuChinhLabel } = useContractTypes();
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

    const getClientLoginUrl = (userVal) => {
        if (!userVal) return '';
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
        const baseUrl = process.env.REACT_APP_CLIENT_WEBSITE_URL || (isLocal ? 'http://localhost:3000' : 'https://longwedding.vn');
        return `${baseUrl}/khach-hang?user=${encodeURIComponent(userVal)}`;
    };

    const getSharedAlbumUrl = (shareLinkCode) => {
        if (!shareLinkCode) return '';
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
        const baseUrl = process.env.REACT_APP_CLIENT_WEBSITE_URL || (isLocal ? 'http://localhost:3000' : 'https://longwedding.vn');
        return `${baseUrl}/shared-album/${shareLinkCode}`;
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
    const [facebookKH1, setFacebookKH1] = useState("");
    const [facebookKH2, setFacebookKH2] = useState("");

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
    const [listStaff, setListStaff] = useState([]);

    useEffect(() => {
        otherService.findUsers({})
            .then((res) => {
                if (res.data && res.data.status === 'success') {
                    setListStaff(res.data.data.users || []);
                } else if (res.status === 'success') {
                    setListStaff(res.data.users || []);
                } else {
                    setListStaff(res.data?.users || []);
                }
            })
            .catch((err) => {
                console.error("Lỗi khi tải danh sách nhân viên:", err);
            });
    }, []);

    // Local progress states
    const [linkAnhGoc, setLinkAnhGoc] = useState("");
    const [linkAnhChinhSua, setLinkAnhChinhSua] = useState("");
    const [danhSachAnhIn, setDanhSachAnhIn] = useState([]);
    const [albumData, setAlbumData] = useState(null);
    const [isLoadingAlbum, setIsLoadingAlbum] = useState(false);
    const [isSyncingAlbum, setIsSyncingAlbum] = useState(false);
    const [isSyncingAlbumChinhSua, setIsSyncingAlbumChinhSua] = useState(false);
    const [openAlbumDetailDialog, setOpenAlbumDetailDialog] = useState(false);
    const [albumDetailTab, setAlbumDetailTab] = useState(0);
    const [openAllPhotosDialog, setOpenAllPhotosDialog] = useState(false);
    const [hasUpdated, setHasUpdated] = useState(false);
    const [coGioiHanAnh, setCoGioiHanAnh] = useState(false);
    const [soLuongAnhGioiHan, setSoLuongAnhGioiHan] = useState(0);
    const [khachHangXacNhan, setKhachHangXacNhan] = useState(false);
    const [isSpecialCollection, setIsSpecialCollection] = useState(false);
    const [chuDe, setChuDe] = useState("");
    const [openLocAnhDialog, setOpenLocAnhDialog] = useState(false);
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
                setFacebookKH1(data.khachHang1.facebookId || "");
            } else {
                clearPhoneKH1();
            }

            if (data.khachHang2) {
                setIDKH2(data.khachHang2._id || "");
                setPhoneKH2(data.khachHang2.soDienThoai || "");
                setNameKH2(data.khachHang2.tenKhachHang || "");
                setAddressKH2(data.khachHang2.diaChi || "");
                setFacebookKH2(data.khachHang2.facebookId || "");
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
            setIsSpecialCollection(data.isSpecialCollection || false);
            setLinkAnhGoc(data.linkAnhGoc || "");
            setLinkAnhChinhSua(data.linkAnhChinhSua || "");
            if (data.maHopDong) {
                fetchAlbumData(data.maHopDong);
            }
        } else if (open) {
            setGiaiDoan(1);
            setDichVuChinh(0);
            setGioHang([]);
            setGiamGia(0);
            setKhachThanhToanTruoc(0);
            setAlbumData(null);
            setLinkAnhGoc("");
            setLinkAnhChinhSua("");
            resetForm();
        }
    }, [open, data]);

    const fetchAlbumData = (maHD) => {
        setIsLoadingAlbum(true);
        otherService.getAlbumDetail(maHD)
            .then(res => {
                if (res && res.album) {
                    setAlbumData(res.album);
                    setCoGioiHanAnh(res.album.coGioiHanAnh || false);
                    setSoLuongAnhGioiHan(res.album.soLuongAnhGioiHan || 0);
                    setKhachHangXacNhan(res.album.khachHangXacNhan || false);
                    setChuDe(res.album.chuDe || "");
                } else {
                    setAlbumData(null);
                }
            })
            .catch(err => {
                console.error("Lỗi khi lấy thông tin album:", err);
                setAlbumData(null);
            })
            .finally(() => {
                setIsLoadingAlbum(false);
            });
    };

    const handleSyncAlbum = (link, loaiAnh = 'goc') => {
        if (!link) {
            toast.warning("Chưa có đường dẫn ảnh. Vui lòng nhập link Google Drive.");
            return;
        }
        if (loaiAnh === 'goc') setIsSyncingAlbum(true);
        else setIsSyncingAlbumChinhSua(true);

        otherService.syncAlbum({ maHopDong: data.maHopDong, driveLink: link.trim(), loaiAnh })
            .then(res => {
                toast.success(res.message || "Đồng bộ album thành công!");
                if (loaiAnh === 'goc') {
                    setLinkAnhGoc(link.trim());
                } else {
                    setLinkAnhChinhSua(link.trim());
                }
                if (res.album) {
                    setAlbumData(res.album);
                    setCoGioiHanAnh(res.album.coGioiHanAnh || false);
                    setSoLuongAnhGioiHan(res.album.soLuongAnhGioiHan || 0);
                    setKhachHangXacNhan(res.album.khachHangXacNhan || false);
                    setChuDe(res.album.chuDe || "");
                }
            })
            .catch(err => {
                console.error(err);
                toast.error(err.response?.data?.message || "Lỗi đồng bộ album!");
            })
            .finally(() => {
                if (loaiAnh === 'goc') setIsSyncingAlbum(false);
                else setIsSyncingAlbumChinhSua(false);
            });
    };

    const handleSaveAlbumSettings = () => {
        otherService.updateAlbumSettings(data?.maHopDong, { coGioiHanAnh, soLuongAnhGioiHan, khachHangXacNhan, isSpecialCollection, chuDe })
            .then(res => {
                toast.success(res.message || "Đã lưu cài đặt album!");
                setHasUpdated(true);
                if (res.album) {
                    setAlbumData(res.album);
                }
            })
            .catch(err => {
                toast.error(err.response?.data?.message || "Lỗi lưu cài đặt!");
            });
    };

    useEffect(() => {
        setTongTien(tinhTongThanhToan());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gioHang, giamGia, loaiGiamGia]);

    const [searchTerm, setSearchTerm] = useState("");

    const [showSuggestions, setShowSuggestions] = useState(false);

    const searchRef = useRef(null);

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


    const handleDiscountItemChange = (dichVuId, value) => {
        const discountVal = Math.max(0, parseFloat(value) || 0);
        const updatedCart = gioHang.map(sp => {
            const spId = sp.dichVu?._id || sp.dichVu || sp._id;
            if (spId === dichVuId) {
                return { ...sp, giamGiaDichVu: discountVal };
            }
            return sp;
        });
        updateCartAndTotal(updatedCart);
    };

    const updateCartAndTotal = (newCart) => {
        setGioHang(newCart);
        const newTotal = newCart.reduce((sum, item) => {
            const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
            const discountItem = parseFloat(item.giamGiaDichVu || 0);
            return sum + Math.max(0, (price * (item.soLuong || 0)) - discountItem);
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
        // Tính tổng tiền gốc từ giỏ hàng (đã trừ giảm giá từng dịch vụ)
        const tongGoc = gioHang.reduce((sum, item) => {
            const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
            const discountItem = parseFloat(item.giamGiaDichVu || 0);
            return sum + Math.max(0, (price * (item.soLuong || 0)) - discountItem);
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

        // 3. Thông tin khách hàng 2
        setIDKH2("");
        setPhoneKH2("");
        setNameKH2("");
        setAddressKH2("");

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
    }

    const clearPhoneKH2 = () => {
        setNameKH2("");
        setAddressKH2("");
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
            khachThanhToanTruoc: khachThanhToanTruoc,
            linkAnhGoc: linkAnhGoc,
            linkAnhChinhSua: linkAnhChinhSua
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

        // Nếu bước cập nhật thuộc tiến trình trước giai đoạn hiện tại (ví dụ đã Hoàn thành), cập nhật thông tin dữ liệu mà giữ nguyên giai đoạn
        if (stepNumber < giaiDoan) {
            showLoading("Đang cập nhật thông tin...");
            const updatePayload = {
                _id: data._id,
                maHopDong: maHopDong
            };
            if (stepNumber === 2 && progressData.linkAnhGoc) {
                updatePayload.linkAnhGoc = progressData.linkAnhGoc;
                setLinkAnhGoc(progressData.linkAnhGoc);
            }
            if (stepNumber === 3 && progressData.linkAnhChinhSua) {
                updatePayload.linkAnhChinhSua = progressData.linkAnhChinhSua;
                setLinkAnhChinhSua(progressData.linkAnhChinhSua);
            }
            if (stepNumber === 4 && progressData.danhSachAnhIn) {
                updatePayload.danhSachAnhIn = progressData.danhSachAnhIn;
                setDanhSachAnhIn(progressData.danhSachAnhIn);
            }

            otherService.UPDATE_HOPDONG(updatePayload)
                .then(() => {
                    toast.success("Cập nhật thông tin thành công!");
                    setHasUpdated(true);
                    hideLoading();
                    setOpenProgressInput(false);
                })
                .catch((error) => {
                    console.error(error);
                    toast.error("Lỗi khi cập nhật: " + (error.response?.data?.message || error.message || error));
                    hideLoading();
                });
            return;
        }

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

        // Nếu xem/sửa thông tin ở bước đã qua (ví dụ xem/sửa link ở bước Chụp hình hoặc Hậu kỳ khi HĐ đã hoàn thành)
        if (stepNumber < giaiDoan) {
            setTargetStep(stepNumber);
            if (stepNumber === 2) {
                setInputLinkAnhGoc(linkAnhGoc || "");
                setOpenProgressInput(true);
                return;
            }
            if (stepNumber === 3) {
                setInputLinkAnhChinhSua(linkAnhChinhSua || "");
                setOpenProgressInput(true);
                return;
            }
            if (stepNumber === 4) {
                setInputDanhSachAnhIn(danhSachAnhIn || []);
                setNewKichThuoc("");
                setNewSoLuong(1);
                setOpenProgressInput(true);
                return;
            }
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
            if (!linkAnhGoc || !linkAnhChinhSua) {
                toast.error("Không thể hoàn thành hợp đồng. Vui lòng bổ sung đầy đủ đường dẫn ảnh gốc và ảnh chỉnh sửa!");
                return;
            }
            if (window.confirm("Bạn có muốn chuyển tiến trình hợp đồng sang \"Hoàn thành\" không?")) {
                submitProgressUpdate(5, {});
            }
        }
    };



    const updateGioHangParam = (fieldName, value) => {
        if (!Array.isArray(gioHang) || gioHang.length === 0) return;
        const newGioHang = [...gioHang];
        newGioHang[0] = {
            ...newGioHang[0],
            [fieldName]: value
        };
        setGioHang(newGioHang);
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
                    @page {
                        size: A4;
                        margin: 6mm 10mm;
                    }
                    body { font-family: "Arial", "Helvetica", sans-serif; padding: 0; margin: 0; line-height: 1.25; color: #333; font-size: 11px; }
                    .header-sec { display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1.5px solid #333; padding-bottom: 6px; }
                    .company-logo { font-size: 20px; font-weight: bold; color: #111; }
                    .company-info { text-align: right; font-size: 11px; color: #555; }
                    .contract-title-sec { text-align: center; margin: 8px 0; }
                    .title { font-size: 18px; font-weight: bold; margin: 0; text-transform: uppercase; color: #000; letter-spacing: 0.5px; }
                    .date-line { font-style: italic; font-size: 11px; margin-top: 3px; color: #555; }
                    .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; margin-top: 8px; margin-bottom: 4px; border-left: 3px solid #333; padding-left: 6px; }
                    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
                    .info-table td { padding: 3px 0; vertical-align: top; border: none; font-size: 11px; }
                    .items-table { width: 100%; border-collapse: collapse; margin-top: 4px; margin-bottom: 6px; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 5px; text-align: left; font-size: 11px; }
                    .items-table th { background-color: #f5f5f5; font-weight: bold; }
                    .items-table td.number, .items-table th.number { text-align: right; }
                    .items-table td.center, .items-table th.center { text-align: center; }
                    
                    /* Grid parameters style */
                    .params-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr;
                        gap: 6px 12px;
                        background: #f9f9f9;
                        padding: 8px 12px;
                        border: 1px solid #e0e0e0;
                        border-radius: 4px;
                        margin-top: 4px;
                        margin-bottom: 8px;
                    }
                    .param-item {
                        font-size: 10.5px;
                    }
                    .param-item strong {
                        color: #111;
                    }
                    
                    .summary-container { display: flex; justify-content: flex-end; margin-bottom: 8px; }
                    .summary-table { width: 300px; border-collapse: collapse; }
                    .summary-table td { padding: 3px 0; font-size: 11px; }
                    .summary-table td.label { text-align: left; color: #555; }
                    .summary-table td.value { text-align: right; font-weight: 500; }
                    .summary-table tr.total td { font-weight: bold; font-size: 13px; border-top: 1px solid #333; padding-top: 4px; }
                    .signatures { display: flex; justify-content: space-between; margin-top: 15px; font-size: 11px; text-align: center; page-break-inside: avoid; }
                    .sig-box { width: 220px; }
                    .sig-title { font-weight: bold; margin-bottom: 45px; }
                    .sig-name { font-weight: bold; }
                    .terms { font-size: 9.5px; color: #666; margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 6px; }
                    .terms-title { font-weight: bold; margin-bottom: 3px; color: #444; }
                    .terms p { margin: 1px 0; }
                </style>
            </head>
            <body>
                <div class="header-sec" style="align-items: center;">
                    <div class="company-logo-sec">
                        <img src="${window.location.origin}${logoVang}" alt="LONG WEDDING" style="height: 50px; object-fit: contain;" />
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
                            <th style="width: 40px; text-align: center;">STT</th>
                            <th>Tên Dịch Vụ / Sản Phẩm</th>
                            <th style="width: 60px; text-align: center;">Số lượng</th>
                            <th style="width: 110px; text-align: right;">Đơn giá</th>
                            <th style="width: 110px; text-align: right;">Giảm giá</th>
                            <th style="width: 130px; text-align: right;">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${gioHang.length === 0 ? `<tr><td colspan="6" style="text-align: center; color: #999;">Chưa đăng ký dịch vụ nào</td></tr>` :
                gioHang.map((item, index) => {
                    const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
                    const discountItem = parseFloat(item.giamGiaDichVu || 0);
                    const total = Math.max(0, (price * (item.soLuong || 0)) - discountItem);
                    return `
                                <tr>
                                    <td style="text-align: center;">${index + 1}</td>
                                    <td>${item.tenDichVuSnapshot || item.tenDichVu}</td>
                                    <td style="text-align: center;">${item.soLuong}</td>
                                    <td style="text-align: right;">${price.toLocaleString('vi-VN')} đ</td>
                                    <td style="text-align: right; color: ${discountItem > 0 ? '#dc2626' : '#666'};">${discountItem > 0 ? `-${discountItem.toLocaleString('vi-VN')} đ` : '0 đ'}</td>
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
                        ${gioHang.some(i => Number(i.giamGiaDichVu) > 0) ? `
                        <tr>
                            <td class="label" style="color: #dc2626;">Tổng giảm giá dịch vụ:</td>
                            <td class="value" style="color: #dc2626;">-${gioHang.reduce((s, i) => s + (Number(i.giamGiaDichVu) || 0), 0).toLocaleString('vi-VN')} đ</td>
                        </tr>
                        ` : ''}
                        ${giamGia > 0 ? `
                        <tr>
                            <td class="label" style="color: #dc2626;">Giảm giá hợp đồng:</td>
                            <td class="value" style="color: #dc2626;">-${giamGia.toLocaleString('vi-VN')}${loaiGiamGia === 1 ? '%' : ' đ'}</td>
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
                    <p>4. Trang phục không được để rượu vang đổ lên váy, nếu bị sẽ phải mua luôn váy.</p>
                    <p>5. Tiền cọc không được hoàn trả bất kỳ hình thức nào.</p>
                    <p>6. Hợp đồng được đồng bộ hóa trên đám mây, Quý khách có thể tra cứu trên website longwedding.vn.</p>
                    <p>7. Mọi thắc mắc xin quý khách liên hệ về số hotline: 0868 66 3637</p>
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
        <Fragment>
            <Dialog onClose={handleClose} open={open}
                fullWidth={true}
                maxWidth="xl"
            >
                <div className="dialog-overlay">
                    <div className="mobile-dark-theme dialog large">

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
                                    <MobileAccordion title="Thông tin khách hàng 1" className="dialog-section-khachhang-item">
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

                                        <div className="floating-label">
                                            <input
                                                name="facebookKH1"
                                                value={facebookKH1}
                                                readOnly
                                                style={facebookKH1 ? { cursor: 'pointer', color: '#1976d2', textDecoration: 'underline', backgroundColor: '#f5f5f5' } : { backgroundColor: '#f5f5f5' }}
                                                onClick={() => {
                                                    if (facebookKH1) {
                                                        const url = facebookKH1.startsWith('http') ? facebookKH1 : `https://facebook.com/${facebookKH1}`;
                                                        window.open(url, '_blank');
                                                    }
                                                }}
                                            />
                                            <label>Link / ID Facebook 1</label>
                                        </div>
                                        {(phoneKH1 || facebookKH1) && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => {
                                                    const targetUser = phoneKH1 || facebookKH1;
                                                    const link = getClientLoginUrl(targetUser);
                                                    navigator.clipboard.writeText(link);
                                                    toast.success("Đã sao chép link đăng nhập KH 1!");
                                                }}
                                                style={{ textTransform: 'none', fontSize: '0.73rem', color: '#2563eb', borderColor: '#bfdbfe', marginTop: '6px', width: '100%', borderRadius: '6px' }}
                                            >
                                                🔗 Copy link đăng nhập KH 1
                                            </Button>
                                        )}
                                    </MobileAccordion>

                                    <MobileAccordion title="Thông tin khách hàng 2" className="dialog-section-khachhang-item" defaultExpanded={false}>
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

                                        <div className="floating-label">
                                            <input
                                                name="facebookKH2"
                                                value={facebookKH2}
                                                readOnly
                                                style={facebookKH2 ? { cursor: 'pointer', color: '#1976d2', textDecoration: 'underline', backgroundColor: '#f5f5f5' } : { backgroundColor: '#f5f5f5' }}
                                                onClick={() => {
                                                    if (facebookKH2) {
                                                        const url = facebookKH2.startsWith('http') ? facebookKH2 : `https://facebook.com/${facebookKH2}`;
                                                        window.open(url, '_blank');
                                                    }
                                                }}
                                            />
                                            <label>Link / ID Facebook 2</label>
                                        </div>
                                        {(phoneKH2 || facebookKH2) && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => {
                                                    const targetUser = phoneKH2 || facebookKH2;
                                                    const link = getClientLoginUrl(targetUser);
                                                    navigator.clipboard.writeText(link);
                                                    toast.success("Đã sao chép link đăng nhập KH 2!");
                                                }}
                                                style={{ textTransform: 'none', fontSize: '0.73rem', color: '#2563eb', borderColor: '#bfdbfe', marginTop: '6px', width: '100%', borderRadius: '6px' }}
                                            >
                                                🔗 Copy link đăng nhập KH 2
                                            </Button>
                                        )}
                                    </MobileAccordion>

                                </div>



                                <MobileAccordion title="Thông tin hợp đồng" className="dialog-section">
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
                                            <select name="nhanVienSale" value={nhanVienSale} onChange={(e) => setNhanVienSale(e.target.value)}>
                                                <option value="0">Chưa phân công</option>
                                                {(() => {
                                                    const staff = listStaff.filter(s => s.positon === 'Nhân viên Sale');
                                                    const names = staff.map(s => s.fullname || s.username);
                                                    if (nhanVienSale && nhanVienSale !== "0" && !names.includes(nhanVienSale)) {
                                                        names.push(nhanVienSale);
                                                    }
                                                    return names.map((name, i) => (
                                                        <option key={i} value={name}>{name}</option>
                                                    ));
                                                })()}
                                            </select>
                                            <label>Nhân viên sale</label>
                                        </div>

                                        <div className="floating-label">
                                            <select name="thoChupHinh" value={thoChupHinh} onChange={(e) => setThoChupHinh(e.target.value)}>
                                                <option value="">Chưa phân công</option>
                                                {(() => {
                                                    const staff = listStaff.filter(s => s.positon === 'Thợ chụp hình');
                                                    const names = staff.map(s => s.fullname || s.username);
                                                    if (thoChupHinh && !names.includes(thoChupHinh)) {
                                                        names.push(thoChupHinh);
                                                    }
                                                    return names.map((name, i) => (
                                                        <option key={i} value={name}>{name}</option>
                                                    ));
                                                })()}
                                            </select>
                                            <label>Thợ chụp hình</label>
                                        </div>

                                        <div className="floating-label">
                                            <select name="thoMakeUp" value={thoMakeUp} onChange={(e) => setThoMakeUp(e.target.value)}>
                                                <option value="">Chưa phân công</option>
                                                {(() => {
                                                    const staff = listStaff.filter(s => s.positon === 'Thợ trang điểm');
                                                    const names = staff.map(s => s.fullname || s.username);
                                                    if (thoMakeUp && !names.includes(thoMakeUp)) {
                                                        names.push(thoMakeUp);
                                                    }
                                                    return names.map((name, i) => (
                                                        <option key={i} value={name}>{name}</option>
                                                    ));
                                                })()}
                                            </select>
                                            <label>Thợ Make-up</label>
                                        </div>

                                        <div className="floating-label">
                                            <select name="chotLich" value={chotLich} onChange={(e) => setChotLich(e.target.value)}>
                                                <option value="Chưa gọi điện">Chưa gọi điện</option>
                                                <option value="Đã gọi điện xác nhận">Đã gọi điện xác nhận</option>
                                                <option value="Đã chốt lịch">Đã chốt lịch</option>
                                            </select>
                                            <label>Chốt lịch</label>
                                        </div>

                                        <div className="floating-label">
                                            <select name="thoChinhAnh" value={thoChinhAnh} onChange={(e) => setThoChinhAnh(e.target.value)}>
                                                <option value="">Chưa phân công</option>
                                                {(() => {
                                                    const staff = listStaff.filter(s => s.positon === 'Thợ chỉnh ảnh');
                                                    const names = staff.map(s => s.fullname || s.username);
                                                    if (thoChinhAnh && !names.includes(thoChinhAnh)) {
                                                        names.push(thoChinhAnh);
                                                    }
                                                    return names.map((name, i) => (
                                                        <option key={i} value={name}>{name}</option>
                                                    ));
                                                })()}
                                            </select>
                                            <label>Thợ chỉnh ảnh</label>
                                        </div>
                                    </div>
                                </MobileAccordion>

                                <MobileAccordion title="Thông tin chung & Lịch trình" className="dialog-section" style={{ marginTop: '20px' }}>
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
                                </MobileAccordion>

                                    <MobileAccordion title="THÔNG TIN ALBUM & ĐỒNG BỘ ẢNH" className="dialog-section" style={{ marginTop: '20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 15px', backgroundColor: '#fcfcfc', border: '1px solid #e0e0e0', borderRadius: '4px' }}>

                                            {/* Ô nhập đường dẫn & nút Đồng bộ trực tiếp */}
                                            <Box p={2} border="1px solid #e2e8f0" borderRadius="10px" bgcolor="#ffffff">
                                                <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#1e293b', marginBottom: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    🔗 Đường dẫn Drive & Đồng bộ hình ảnh (Hỗ trợ cả khi HĐ Hoàn thành)
                                                </Typography>
                                                <Box display="flex" flexDirection="column" gap={1.5}>
                                                    <Box display="flex" gap={1} alignItems="center">
                                                        <TextField
                                                            label="Đường dẫn ảnh gốc (Google Drive / Photos)"
                                                            variant="outlined"
                                                            fullWidth
                                                            size="small"
                                                            value={linkAnhGoc}
                                                            onChange={(e) => setLinkAnhGoc(e.target.value)}
                                                            placeholder="https://drive.google.com/drive/folders/..."
                                                            inputProps={{ style: { fontSize: '0.82rem' } }}
                                                        />
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            disabled={isSyncingAlbum || !linkAnhGoc}
                                                            onClick={() => handleSyncAlbum(linkAnhGoc, 'goc')}
                                                            style={{ whiteSpace: 'nowrap', textTransform: 'none', fontWeight: 600, minWidth: '130px' }}
                                                        >
                                                            {isSyncingAlbum ? "Đang đồng bộ..." : "Đồng bộ ảnh gốc"}
                                                        </Button>
                                                    </Box>

                                                    <Box display="flex" gap={1} alignItems="center">
                                                        <TextField
                                                            label="Đường dẫn ảnh chỉnh sửa (Google Drive / Photos)"
                                                            variant="outlined"
                                                            fullWidth
                                                            size="small"
                                                            value={linkAnhChinhSua}
                                                            onChange={(e) => setLinkAnhChinhSua(e.target.value)}
                                                            placeholder="https://drive.google.com/drive/folders/..."
                                                            inputProps={{ style: { fontSize: '0.82rem' } }}
                                                        />
                                                        <Button
                                                            variant="contained"
                                                            color="secondary"
                                                            size="small"
                                                            disabled={isSyncingAlbumChinhSua || !linkAnhChinhSua}
                                                            onClick={() => handleSyncAlbum(linkAnhChinhSua, 'chinhSua')}
                                                            style={{ whiteSpace: 'nowrap', textTransform: 'none', fontWeight: 600, minWidth: '130px' }}
                                                        >
                                                            {isSyncingAlbumChinhSua ? "Đang đồng bộ..." : "Đồng bộ ảnh C.Sửa"}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Box>


                                            {albumData && (
                                                <Box mt={3} p={2.5} borderRadius="12px" border="1px solid #e2e8f0" bgcolor="#f8fafc" boxShadow="0 2px 8px rgba(0,0,0,0.03)">
                                                    {/* Title & Filter Button */}
                                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} pb={1.5} borderBottom="1px solid #e2e8f0">
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <span style={{ fontSize: '1.1rem' }}>📷</span>
                                                            <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                                                                Album Khách Hàng Chọn Ảnh
                                                            </Typography>
                                                        </Box>
                                                        <Button
                                                            variant="outlined"
                                                            color="secondary"
                                                            size="small"
                                                            startIcon={<span>💻</span>}
                                                            style={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', borderColor: '#7c3aed', color: '#7c3aed' }}
                                                            onClick={() => setOpenLocAnhDialog(true)}
                                                        >
                                                            Lọc ảnh trên máy tính
                                                        </Button>
                                                    </Box>

                                                    {/* Info Grid */}
                                                    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(130px, 1fr))" gap={1.5} mb={2.5}>
                                                        {/* Box 1: Stats */}
                                                        <Box p={1.5} bgcolor="#ffffff" border="1px solid #e2e8f0" borderRadius="8px" display="flex" flexDirection="column" gap={0.5}>
                                                            <Typography variant="caption" style={{ color: '#64748b', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.5px' }}>ẢNH GỐC & TIM</Typography>
                                                            <Box display="flex" alignItems="baseline" gap={1}>
                                                                <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f172a' }}>
                                                                    {albumData.danhSachAnh?.length || 0}
                                                                </Typography>
                                                                <Typography variant="caption" style={{ color: '#ef4444', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                                                    ❤️ {albumData.danhSachAnh?.filter(a => a.isHearted).length || 0}
                                                                </Typography>
                                                            </Box>
                                                        </Box>

                                                        {/* Box 2: Photos edited */}
                                                        <Box p={1.5} bgcolor="#ffffff" border="1px solid #e2e8f0" borderRadius="8px" display="flex" flexDirection="column" gap={0.5}>
                                                            <Typography variant="caption" style={{ color: '#64748b', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.5px' }}>ẢNH CHỈNH SỬA</Typography>
                                                            <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f172a' }}>
                                                                {albumData.danhSachAnhChinhSua?.length || 0}
                                                            </Typography>
                                                        </Box>

                                                        {/* Box 3: Sync stats (Original) */}
                                                        <Box
                                                            p={1.5}
                                                            bgcolor="#ffffff"
                                                            border="1px solid #e2e8f0"
                                                            borderRadius="8px"
                                                            display="flex"
                                                            flexDirection="column"
                                                            gap={0.5}
                                                            onClick={() => {
                                                                if (linkAnhGoc) {
                                                                    window.open(linkAnhGoc, '_blank');
                                                                } else {
                                                                    toast.warning("Hợp đồng chưa có đường dẫn ảnh gốc.");
                                                                }
                                                            }}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <Typography variant="caption" style={{ color: '#64748b', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.5px' }}>ĐỒNG BỘ ẢNH GỐC</Typography>
                                                            <Box mt={0.5}>
                                                                <span style={{
                                                                    display: 'inline-block',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '20px',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 700,
                                                                    backgroundColor: albumData.trangThai === 'Hoàn thành' ? '#d1fae5' : '#fef3c7',
                                                                    color: albumData.trangThai === 'Hoàn thành' ? '#065f46' : '#92400e'
                                                                }}>
                                                                    {albumData.trangThai}
                                                                </span>
                                                            </Box>
                                                        </Box>

                                                        {/* Box 4: Sync stats (Edited) */}
                                                        <Box
                                                            p={1.5}
                                                            bgcolor="#ffffff"
                                                            border="1px solid #e2e8f0"
                                                            borderRadius="8px"
                                                            display="flex"
                                                            flexDirection="column"
                                                            gap={0.5}
                                                            onClick={() => {
                                                                if (linkAnhChinhSua) {
                                                                    window.open(linkAnhChinhSua, '_blank');
                                                                } else {
                                                                    toast.warning("Hợp đồng chưa có đường dẫn ảnh chỉnh sửa.");
                                                                }
                                                            }}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <Typography variant="caption" style={{ color: '#64748b', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.5px' }}>ĐỒNG BỘ ẢNH C.SỬA</Typography>
                                                            <Box mt={0.5}>
                                                                <span style={{
                                                                    display: 'inline-block',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '20px',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 700,
                                                                    backgroundColor: albumData.trangThaiChinhSua === 'Hoàn thành' ? '#d1fae5' : '#fee2e2',
                                                                    color: albumData.trangThaiChinhSua === 'Hoàn thành' ? '#065f46' : '#991b1b'
                                                                }}>
                                                                    {albumData.trangThaiChinhSua || 'Chưa đồng bộ'}
                                                                </span>
                                                            </Box>
                                                        </Box>
                                                    </Box>

                                                    {/* Sub-section Settings */}
                                                    <Box p={2} border="1px solid #e2e8f0" borderRadius="10px" bgcolor="#ffffff" textAlign="left">
                                                        <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#0f172a', marginBottom: '14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', textAlign: 'left' }}>
                                                            ⚙️ Cài đặt chọn ảnh cho khách hàng
                                                        </Typography>

                                                        <Box display="flex" flexDirection="column" gap={1.5} textAlign="left">
                                                            {/* Setting 0: Customer Quick Login Link & Shared Album Link Box */}
                                                            {(() => {
                                                                const customerUser = phoneKH1 || facebookKH1 || phoneKH2 || facebookKH2 || "";
                                                                const loginUrl = getClientLoginUrl(customerUser);
                                                                const shareCode = albumData?.shareLink;
                                                                const sharedWebUrl = getSharedAlbumUrl(shareCode);

                                                                return (
                                                                    <Box display="flex" flexDirection="column" gap={1.5} mb={1}>
                                                                        {/* Link 1: Login & Photo Selection Link */}
                                                                        <Box p={1.5} bgcolor="#f8fafc" borderRadius="8px" display="flex" flexDirection="column" gap={1} style={{ border: '1px solid #e2e8f0' }}>
                                                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                                <Typography variant="body2" style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.82rem', textAlign: 'left' }}>
                                                                                    🔑 Link đăng nhập khách hàng (Điền sẵn tài khoản)
                                                                                </Typography>
                                                                                {customerUser && (
                                                                                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                                                                        Tài khoản: <strong>{customerUser}</strong>
                                                                                    </span>
                                                                                )}
                                                                            </Box>
                                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                                <TextField
                                                                                    size="small"
                                                                                    fullWidth
                                                                                    readOnly
                                                                                    value={customerUser ? loginUrl : "Chưa có SĐT/FB khách hàng để tạo link"}
                                                                                    inputProps={{ style: { fontSize: '0.78rem', color: customerUser ? '#2563eb' : '#94a3b8', backgroundColor: '#ffffff' } }}
                                                                                    variant="outlined"
                                                                                    style={{ flex: 1 }}
                                                                                />
                                                                                <Button
                                                                                    variant="contained"
                                                                                    size="small"
                                                                                    disabled={!customerUser}
                                                                                    onClick={() => {
                                                                                        navigator.clipboard.writeText(loginUrl);
                                                                                        toast.success("Đã sao chép link đăng nhập khách hàng!");
                                                                                    }}
                                                                                    style={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', padding: '6px 14px', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '6px', whiteSpace: 'nowrap' }}
                                                                                >
                                                                                    📋 Sao chép
                                                                                </Button>
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    size="small"
                                                                                    disabled={!customerUser}
                                                                                    onClick={() => {
                                                                                        window.open(loginUrl, '_blank');
                                                                                    }}
                                                                                    style={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', padding: '5px 14px', borderColor: '#2563eb', color: '#2563eb', borderRadius: '6px', whiteSpace: 'nowrap' }}
                                                                                >
                                                                                    🌐 Mở link
                                                                                </Button>
                                                                            </Box>
                                                                        </Box>

                                                                        {/* Link 2: Shared Edited Album Web Link */}
                                                                        <Box p={1.5} bgcolor="#f0fdf4" borderRadius="8px" display="flex" flexDirection="column" gap={1} style={{ border: '1px solid #bbf7d0' }}>
                                                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                                <Typography variant="body2" style={{ fontWeight: 700, color: '#166534', fontSize: '0.82rem', textAlign: 'left' }}>
                                                                                    ✨ Link chia sẻ Album ảnh chỉnh sửa trên Web
                                                                                </Typography>
                                                                                {shareCode && (
                                                                                    <span style={{ fontSize: '0.72rem', color: '#15803d' }}>
                                                                                        Mã chia sẻ: <strong>{shareCode}</strong>
                                                                                    </span>
                                                                                )}
                                                                            </Box>
                                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                                <TextField
                                                                                    size="small"
                                                                                    fullWidth
                                                                                    readOnly
                                                                                    value={shareCode ? sharedWebUrl : (albumData ? "Đang khởi tạo mã chia sẻ..." : "Cần đồng bộ album để lấy link chia sẻ")}
                                                                                    inputProps={{ style: { fontSize: '0.78rem', color: shareCode ? '#16a34a' : '#94a3b8', backgroundColor: '#ffffff' } }}
                                                                                    variant="outlined"
                                                                                    style={{ flex: 1 }}
                                                                                />
                                                                                <Button
                                                                                    variant="contained"
                                                                                    size="small"
                                                                                    disabled={!shareCode}
                                                                                    onClick={() => {
                                                                                        navigator.clipboard.writeText(sharedWebUrl);
                                                                                        toast.success("Đã sao chép link chia sẻ album ảnh chỉnh sửa!");
                                                                                    }}
                                                                                    style={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', padding: '6px 14px', backgroundColor: '#16a34a', color: '#ffffff', borderRadius: '6px', whiteSpace: 'nowrap' }}
                                                                                >
                                                                                    📋 Sao chép
                                                                                </Button>
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    size="small"
                                                                                    disabled={!shareCode}
                                                                                    onClick={() => {
                                                                                        window.open(sharedWebUrl, '_blank');
                                                                                    }}
                                                                                    style={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', padding: '5px 14px', borderColor: '#16a34a', color: '#16a34a', borderRadius: '6px', whiteSpace: 'nowrap' }}
                                                                                >
                                                                                    🌐 Mở link
                                                                                </Button>
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                );
                                                            })()}

                                                            {/* Setting 1: Limit Photo limit */}
                                                            <Box display="flex" alignItems="center" justifyContent="space-between" pb={1.5} borderBottom="1px solid #f1f5f9">
                                                                <Box textAlign="left">
                                                                    <Typography variant="body2" style={{ fontWeight: 600, color: '#334155', fontSize: '0.82rem', textAlign: 'left' }}>Giới hạn số lượng ảnh</Typography>
                                                                    <Typography variant="caption" style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textAlign: 'left' }}>Yêu cầu khách hàng chọn tối đa số ảnh quy định</Typography>
                                                                </Box>
                                                                <Box display="flex" alignItems="center" gap={1.5}>
                                                                    {coGioiHanAnh && (
                                                                        <TextField
                                                                            label="Số lượng ảnh"
                                                                            type="number"
                                                                            size="small"
                                                                            value={soLuongAnhGioiHan}
                                                                            onChange={(e) => setSoLuongAnhGioiHan(e.target.value)}
                                                                            InputProps={{ inputProps: { min: 1 } }}
                                                                            style={{ width: '110px' }}
                                                                            variant="outlined"
                                                                        />
                                                                    )}
                                                                    <Switch
                                                                        checked={coGioiHanAnh}
                                                                        onChange={(e) => setCoGioiHanAnh(e.target.checked)}
                                                                        color="primary"
                                                                        size="small"
                                                                    />
                                                                </Box>
                                                            </Box>

                                                            {/* Setting 2: Lock Album */}
                                                            <Box display="flex" alignItems="center" justifyContent="space-between" pb={1.5} borderBottom="1px solid #f1f5f9">
                                                                <Box textAlign="left">
                                                                    <Typography variant="body2" style={{ fontWeight: 600, color: '#334155', fontSize: '0.82rem', textAlign: 'left' }}>Khóa album</Typography>
                                                                    <Typography variant="caption" style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textAlign: 'left' }}>Đánh dấu khách hàng đã hoàn thành việc chọn ảnh</Typography>
                                                                </Box>
                                                                <Switch
                                                                    checked={khachHangXacNhan}
                                                                    onChange={(e) => setKhachHangXacNhan(e.target.checked)}
                                                                    color="success"
                                                                    size="small"
                                                                />
                                                            </Box>

                                                            {/* Setting 3: Special Collection */}
                                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                                <Box textAlign="left">
                                                                    <Typography variant="body2" style={{ fontWeight: 600, color: '#334155', fontSize: '0.82rem', textAlign: 'left' }}>Bộ sưu tập đặc biệt</Typography>
                                                                    <Typography variant="caption" style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textAlign: 'left' }}>Hiển thị hình ảnh album này lên trang chủ & trang bộ sưu tập</Typography>
                                                                </Box>
                                                                <Switch
                                                                    checked={isSpecialCollection}
                                                                    onChange={(e) => {
                                                                        const checked = e.target.checked;
                                                                        if (checked && !linkAnhChinhSua) {
                                                                            toast.warning("Hợp đồng chưa có đường dẫn ảnh chỉnh sửa. Vui lòng bổ sung trước.");
                                                                            return;
                                                                        }
                                                                        setIsSpecialCollection(checked);
                                                                    }}
                                                                    color="info"
                                                                    size="small"
                                                                />
                                                            </Box>

                                                            {/* Setting 4: Theme / Concept */}
                                                            <Box display="flex" flexDirection="column" gap={1} mt={1.5} pt={1.5} borderTop="1px solid #f1f5f9" textAlign="left">
                                                                <Typography variant="body2" style={{ fontWeight: 600, color: '#334155', fontSize: '0.82rem', textAlign: 'left' }}>Chủ đề / Concept của Album</Typography>
                                                                <TextField
                                                                    placeholder="Ví dụ: Concept Studio nhẹ nhàng, Concept Cổ phục Hàn Quốc, ..."
                                                                    fullWidth
                                                                    size="small"
                                                                    variant="outlined"
                                                                    value={chuDe}
                                                                    onChange={(e) => setChuDe(e.target.value)}
                                                                    inputProps={{ style: { fontSize: '0.82rem' } }}
                                                                />
                                                            </Box>
                                                        </Box>

                                                        {/* Action Save Buttons */}
                                                        <Box display="flex" justifyContent="flex-end" mt={2.5}>
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                color="primary"
                                                                onClick={handleSaveAlbumSettings}
                                                                style={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', padding: '6px 16px', borderRadius: '6px', backgroundColor: '#b78752' }}
                                                            >
                                                                Lưu cài đặt
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                </Box>
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
                                    </MobileAccordion>
                            </div>

                            <div className="left-column">
                                <MobileAccordion title="Sản phẩm & Dịch vụ" className="dialog-section-sanpham">

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
                                    <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch', maxHeight: '250px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px', marginBottom: '15px' }}>
                                        <table className="product-table">
                                            <thead>
                                                <tr>
                                                    <th>Tên SP</th>
                                                    <th style={{ textAlign: "center" }}>Số lượng</th>
                                                    <th>Đơn giá</th>
                                                    <th style={{ width: '130px' }}>Giảm giá (đ)</th>
                                                    <th>Thành tiền</th>
                                                    <th>Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Array.isArray(gioHang) && gioHang.length > 0 ? (
                                                    gioHang.map((item, index) => {
                                                        const productId = item.dichVu?._id || item.dichVu || item._id;
                                                        const price = item.donGia || item.giaChoThueDichVu || 0;
                                                        const discountItem = parseFloat(item.giamGiaDichVu || 0);
                                                        const total = Math.max(0, (price * (item.soLuong || 0)) - discountItem);
                                                        const loaiDichVuVal = item.loaiDichVu ?? item.dichVu?.loaiDichVu;

                                                        return (
                                                            <Fragment key={productId || index}>
                                                                <tr style={{ backgroundColor: Number(loaiDichVuVal) !== 1 ? '#f5f8fc' : 'transparent' }}>
                                                                    <td style={{ fontWeight: Number(loaiDichVuVal) !== 1 ? '600' : 'normal' }}>{item.tenDichVuSnapshot || item.tenDichVu}</td>
                                                                    <td style={{ textAlign: "center" }}>
                                                                        <button className="btn-qty" onClick={() => handleDecreaseQuantity(productId)}>-</button>
                                                                        <span style={{ margin: "0 10px" }}>{item.soLuong}</span>
                                                                        <button className="btn-qty" onClick={() => handleSelectProduct(item)}>+</button>
                                                                    </td>
                                                                    <td>{price.toLocaleString("vi-VN")}đ</td>
                                                                    <td>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            placeholder="0"
                                                                            value={item.giamGiaDichVu !== undefined && item.giamGiaDichVu !== null ? item.giamGiaDichVu : ''}
                                                                            onChange={(e) => handleDiscountItemChange(productId, e.target.value)}
                                                                            style={{
                                                                                width: '100px',
                                                                                padding: '4px 8px',
                                                                                borderRadius: '6px',
                                                                                border: '1px solid #cbd5e1',
                                                                                fontSize: '0.85rem'
                                                                            }}
                                                                        />
                                                                    </td>
                                                                    <td style={{ fontWeight: 'bold', color: discountItem > 0 ? '#059669' : 'inherit' }}>
                                                                        {total.toLocaleString("vi-VN")}đ
                                                                        {discountItem > 0 && (
                                                                            <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '500' }}>
                                                                                (Giảm: -{discountItem.toLocaleString("vi-VN")}đ)
                                                                            </div>
                                                                        )}
                                                                    </td>
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
                                                        <td colSpan={6} style={{ textAlign: "center", color: "#999" }}>
                                                            Chưa sử dụng dịch vụ
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {(() => {
                                        const hasItems = Array.isArray(gioHang) && gioHang.length > 0;
                                        const firstItem = hasItems ? gioHang[0] : {};

                                        return (
                                            <>
                                                <div className="package-parameters-title" style={{ marginTop: '25px' }}>Tổng hợp dịch vụ trong hợp đồng</div>
                                                <div className="summary-parameters-grid">
                                                    <div className="form-group-summary">
                                                        <label>SL ảnh chỉnh sửa</label>
                                                        <input
                                                            type="number"
                                                            className="summary-value-input"
                                                            value={firstItem.soLuongAnhChinhSua ?? 0}
                                                            onChange={(e) => updateGioHangParam("soLuongAnhChinhSua", Number(e.target.value) || 0)}
                                                            disabled={!hasItems}
                                                        />
                                                    </div>
                                                    <div className="form-group-summary">
                                                        <label>SL ảnh 16x21</label>
                                                        <input
                                                            type="number"
                                                            className="summary-value-input"
                                                            value={firstItem.soLuongAnh16x21 ?? 0}
                                                            onChange={(e) => updateGioHangParam("soLuongAnh16x21", Number(e.target.value) || 0)}
                                                            disabled={!hasItems}
                                                        />
                                                    </div>
                                                    <div className="form-group-summary">
                                                        <label>SL ảnh 20x30</label>
                                                        <input
                                                            type="number"
                                                            className="summary-value-input"
                                                            value={firstItem.soLuongAnh20x30 ?? 0}
                                                            onChange={(e) => updateGioHangParam("soLuongAnh20x30", Number(e.target.value) || 0)}
                                                            disabled={!hasItems}
                                                        />
                                                    </div>
                                                    <div className="form-group-summary">
                                                        <label>SL ảnh 60x90</label>
                                                        <input
                                                            type="number"
                                                            className="summary-value-input"
                                                            value={firstItem.soLuongAnh60x90 ?? 0}
                                                            onChange={(e) => updateGioHangParam("soLuongAnh60x90", Number(e.target.value) || 0)}
                                                            disabled={!hasItems}
                                                        />
                                                    </div>
                                                    <div className="form-group-summary">
                                                        <label>Trang điểm ngày ăn hỏi</label>
                                                        <input
                                                            type="text"
                                                            className="summary-value-input"
                                                            value={firstItem.trangDiemNgayAnHoi ?? ""}
                                                            onChange={(e) => updateGioHangParam("trangDiemNgayAnHoi", e.target.value)}
                                                            disabled={!hasItems}
                                                            placeholder="Không có"
                                                        />
                                                    </div>
                                                    <div className="form-group-summary">
                                                        <label>Trang điểm ngày cưới</label>
                                                        <input
                                                            type="text"
                                                            className="summary-value-input"
                                                            value={firstItem.trangDiemNgayCuoi ?? ""}
                                                            onChange={(e) => updateGioHangParam("trangDiemNgayCuoi", e.target.value)}
                                                            disabled={!hasItems}
                                                            placeholder="Không có"
                                                        />
                                                    </div>
                                                    <div className="form-group-summary">
                                                        <label>Trang phục bê lễ</label>
                                                        <input
                                                            type="text"
                                                            className="summary-value-input"
                                                            value={firstItem.trangPhucChoDoiBeLe ?? ""}
                                                            onChange={(e) => updateGioHangParam("trangPhucChoDoiBeLe", e.target.value)}
                                                            disabled={!hasItems}
                                                            placeholder="Không có"
                                                        />
                                                    </div>
                                                    <div className="form-group-summary">
                                                        <label>TP cô dâu ngày ăn hỏi</label>
                                                        <input
                                                            type="text"
                                                            className="summary-value-input"
                                                            value={firstItem.trangPhucCoDauNgayAnHoi ?? ""}
                                                            onChange={(e) => updateGioHangParam("trangPhucCoDauNgayAnHoi", e.target.value)}
                                                            disabled={!hasItems}
                                                            placeholder="Không có"
                                                        />
                                                    </div>
                                                    <div className="form-group-summary">
                                                        <label>TP chú rể ngày ăn hỏi</label>
                                                        <input
                                                            type="text"
                                                            className="summary-value-input"
                                                            value={firstItem.trangPhucChuReNgayAnHoi ?? ""}
                                                            onChange={(e) => updateGioHangParam("trangPhucChuReNgayAnHoi", e.target.value)}
                                                            disabled={!hasItems}
                                                            placeholder="Không có"
                                                        />
                                                    </div>
                                                    <div className="form-group-summary">
                                                        <label>Váy cưới ngày cưới (giá trị)</label>
                                                        <input
                                                            type="text"
                                                            className="summary-value-input"
                                                            value={firstItem.trangPhucVayCuoiNgayCuoi ?? ""}
                                                            onChange={(e) => updateGioHangParam("trangPhucVayCuoiNgayCuoi", e.target.value)}
                                                            disabled={!hasItems}
                                                            placeholder="Không có"
                                                        />
                                                    </div>
                                                    <div className="form-group-summary">
                                                        <label>Vest chú rể ngày cưới</label>
                                                        <input
                                                            type="text"
                                                            className="summary-value-input"
                                                            value={firstItem.trangPhucVestChuReNgayCuoi ?? ""}
                                                            onChange={(e) => updateGioHangParam("trangPhucVestChuReNgayCuoi", e.target.value)}
                                                            disabled={!hasItems}
                                                            placeholder="Không có"
                                                        />
                                                    </div>
                                                    <div className="form-group-summary">
                                                        <label>Hoa cầm tay</label>
                                                        <input
                                                            type="text"
                                                            className="summary-value-input"
                                                            value={firstItem.hoaCamTay ?? ""}
                                                            onChange={(e) => updateGioHangParam("hoaCamTay", e.target.value)}
                                                            disabled={!hasItems}
                                                            placeholder="Không có"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </MobileAccordion>
                            </div>
                        </div>

                        {/* === DƯỚI CÙNG: THANH TOÁN === */}
                        <MobileAccordion title="Thông tin thanh toán" className="dialog-section payment">
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
                        </MobileAccordion>

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
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                <Button
                                    onClick={handleClose}
                                    variant="contained"
                                    color="error"
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                        padding: { xs: '4px 8px', sm: '6px 16px' }
                                    }}
                                >Thoát</Button>

                                <Button
                                    onClick={handlePrintHopDong}
                                    variant="contained"
                                    color="success"
                                    startIcon={<FontAwesomeIcon icon={faPrint} />}
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                        padding: { xs: '4px 8px', sm: '6px 16px' }
                                    }}
                                >In hợp đồng</Button>

                                {(linkAnhGoc || linkAnhChinhSua || albumData || isLoadingAlbum) && (
                                    <Button
                                        variant="contained"
                                        color="info"
                                        disabled={isLoadingAlbum}
                                        onClick={() => setOpenAlbumDetailDialog(true)}
                                        sx={{
                                            whiteSpace: 'nowrap',
                                            fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                            padding: { xs: '4px 8px', sm: '6px 16px' }
                                        }}
                                    >
                                        {isLoadingAlbum ? "Đang Tải Ảnh..." : "Xem Ảnh Khách Hàng"}
                                    </Button>
                                )}

                                <Button
                                    onClick={() => onUpdateHopDong()}
                                    variant="contained"
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                        padding: { xs: '4px 8px', sm: '6px 16px' }
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
                    <div style={{ padding: '24px', textAlign: 'center' }}>
                        <h2 style={{ color: '#d32f2f', marginBottom: '16px' }}>Xác nhận xóa hợp đồng</h2>
                        <p style={{ marginBottom: '16px', color: '#555' }}>
                            Hành động này <b>không thể hoàn tác</b>. Tất cả dữ liệu liên quan đến hợp đồng <b>{data?.maHopDong}</b> sẽ bị xóa vĩnh viễn.
                        </p>
                        <p style={{ marginBottom: '16px', fontSize: '0.9rem' }}>
                            Vui lòng nhập <b>{data?.maHopDong}</b> để xác nhận:
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



            {/* Dialog Xem Chi Tiết Ảnh Khách Chọn */}
            <Dialog open={openAlbumDetailDialog} onClose={() => setOpenAlbumDetailDialog(false)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                        <Typography variant="h6" style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem' }}>
                            Chi Tiết Ảnh Khách Hàng - {data?.maHopDong}
                        </Typography>
                        <Box display="flex" gap={1}>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                disabled={isSyncingAlbum || !linkAnhGoc}
                                onClick={() => handleSyncAlbum(linkAnhGoc, 'goc')}
                                style={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                            >
                                {isSyncingAlbum ? "Đang đồng bộ ảnh gốc..." : "🔄 Đồng bộ ảnh gốc"}
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                size="small"
                                disabled={isSyncingAlbumChinhSua || !linkAnhChinhSua}
                                onClick={() => handleSyncAlbum(linkAnhChinhSua, 'chinhSua')}
                                style={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                            >
                                {isSyncingAlbumChinhSua ? "Đang đồng bộ ảnh C.Sửa..." : "🔄 Đồng bộ ảnh C.Sửa"}
                            </Button>
                        </Box>
                    </Box>
                    {albumData && (
                        <Tabs value={albumDetailTab} onChange={(e, newValue) => setAlbumDetailTab(newValue)} style={{ marginTop: '10px' }}>
                            <Tab label="Tất Cả Ảnh Gốc" />
                            <Tab label="Ảnh Khách Chọn" />
                            <Tab label="Ảnh Đã Chỉnh Sửa" />
                        </Tabs>
                    )}
                </DialogTitle>
                <DialogContent dividers>
                    {(!albumData || (!albumData.danhSachAnh?.length && !albumData.danhSachAnhChinhSua?.length)) && (
                        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                            <Typography variant="h6" color="textSecondary" style={{ marginBottom: '16px' }}>
                                {albumData?.trangThai === 'Đang xử lý' || isSyncingAlbum || isSyncingAlbumChinhSua
                                    ? 'Đang đồng bộ danh sách ảnh từ Google Drive, vui lòng chờ giây lát...'
                                    : 'Chưa có dữ liệu ảnh nào trong album này.'}
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="primary"
                                disabled={isSyncingAlbum || isSyncingAlbumChinhSua}
                                onClick={() => handleSyncAlbum(linkAnhGoc || linkAnhChinhSua, linkAnhChinhSua ? 'chinhSua' : 'goc')}
                            >
                                {isSyncingAlbum || isSyncingAlbumChinhSua ? 'Đang đồng bộ...' : 'Đồng bộ ảnh ngay'}
                            </Button>
                        </div>
                    )}
                    {albumData && albumDetailTab === 0 && (
                        <div className="admin-masonry-grid">
                            {albumData.danhSachAnh?.map((item) => (
                                <div key={item.idDrive} style={{ marginBottom: '16px', breakInside: 'avoid' }}>
                                    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadPhoto(item, {
                                                    onStart: () => toast.info('Đang chuẩn bị tải ảnh...'),
                                                    onSuccess: (msg) => toast.success(msg || 'Tải ảnh thành công!'),
                                                    onError: (err) => toast.error(err || 'Có lỗi khi tải ảnh.')
                                                });
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: 10,
                                                left: 10,
                                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                                color: '#fff',
                                                zIndex: 5
                                            }}
                                            title="Tải ảnh này về máy"
                                        >
                                            <FontAwesomeIcon icon={faDownload} size="xs" />
                                        </IconButton>
                                        <img
                                            src={`${item.urlNen}`}
                                            alt={item.tenFile}
                                            loading="lazy"
                                            style={{ width: '100%', display: 'block' }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '20px 12px 10px',
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                                            color: 'white',
                                            fontSize: '0.8rem',
                                            fontWeight: '500',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {item.tenFile}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {albumData && albumDetailTab === 1 && (
                        <div className="admin-masonry-grid">
                            {albumData.danhSachAnh?.filter(a => a.isHearted || (a.comments && a.comments.length > 0)).map((anh, index) => (
                                <div key={index} style={{ marginBottom: '16px', breakInside: 'avoid' }}>
                                    <Card style={{ borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                        <div style={{ position: 'relative' }}>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadPhoto(anh, {
                                                        onStart: () => toast.info('Đang chuẩn bị tải ảnh...'),
                                                        onSuccess: (msg) => toast.success(msg || 'Tải ảnh thành công!'),
                                                        onError: (err) => toast.error(err || 'Có lỗi khi tải ảnh.')
                                                    });
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 10,
                                                    left: 10,
                                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                                    color: '#fff',
                                                    zIndex: 5
                                                }}
                                                title="Tải ảnh này về máy"
                                            >
                                                <FontAwesomeIcon icon={faDownload} size="xs" />
                                            </IconButton>
                                            <img
                                                src={`${anh.urlNen}`}
                                                alt={anh.tenFile}
                                                loading="lazy"
                                                style={{ width: '100%', display: 'block' }}
                                            />
                                            {anh.isHearted && (
                                                <div style={{ position: 'absolute', top: 10, right: 10, color: 'red', fontSize: '24px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                                                    <FontAwesomeIcon icon={faHeart} />
                                                </div>
                                            )}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                padding: '20px 12px 10px',
                                                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                                                color: 'white',
                                                fontSize: '0.8rem',
                                                fontWeight: '500',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {anh.tenFile}
                                            </div>
                                        </div>
                                        {anh.comments && anh.comments.length > 0 && (
                                            <CardContent style={{ padding: '12px' }}>
                                                <div style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                                                    <Typography variant="caption" fontWeight="bold" style={{ color: '#1976d2' }}>Bình luận KH:</Typography>
                                                    {anh.comments.map((cmt, idx) => (
                                                        <Typography key={idx} variant="body2" style={{ marginTop: '4px', fontStyle: 'italic' }}>- {cmt.noiDung}</Typography>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                </div>
                            ))}
                            {albumData.danhSachAnh?.filter(a => a.isHearted || (a.comments && a.comments.length > 0)).length === 0 && (
                                <Typography variant="body1" style={{ padding: '20px', gridColumn: '1 / -1' }}>Khách hàng chưa chọn hoặc bình luận ảnh nào.</Typography>
                            )}
                        </div>
                    )}
                    {albumData && albumDetailTab === 2 && (
                        <div className="admin-masonry-grid">
                            {albumData.danhSachAnhChinhSua?.map((anh, index) => (
                                <div key={index} style={{ marginBottom: '16px', breakInside: 'avoid' }}>
                                    <Card style={{ borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                        <div style={{ position: 'relative' }}>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadPhoto(anh, {
                                                        onStart: () => toast.info('Đang chuẩn bị tải ảnh...'),
                                                        onSuccess: (msg) => toast.success(msg || 'Tải ảnh thành công!'),
                                                        onError: (err) => toast.error(err || 'Có lỗi khi tải ảnh.')
                                                    });
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 10,
                                                    left: 10,
                                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                                    color: '#fff',
                                                    zIndex: 5
                                                }}
                                                title="Tải ảnh này về máy"
                                            >
                                                <FontAwesomeIcon icon={faDownload} size="xs" />
                                            </IconButton>
                                            <img
                                                src={`${anh.urlNen}`}
                                                alt={anh.tenFile}
                                                loading="lazy"
                                                style={{ width: '100%', display: 'block' }}
                                            />
                                            {anh.isHearted && (
                                                <div style={{ position: 'absolute', top: 10, right: 10, color: 'red', fontSize: '24px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                                                    <FontAwesomeIcon icon={faHeart} />
                                                </div>
                                            )}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                padding: '20px 12px 10px',
                                                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                                                color: 'white',
                                                fontSize: '0.8rem',
                                                fontWeight: '500',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {anh.tenFile}
                                            </div>
                                        </div>
                                        {anh.comments && anh.comments.length > 0 && (
                                            <CardContent style={{ padding: '12px' }}>
                                                <div style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                                                    <Typography variant="caption" fontWeight="bold" style={{ color: '#1976d2' }}>Bình luận KH:</Typography>
                                                    {anh.comments.map((cmt, idx) => (
                                                        <Typography key={idx} variant="body2" style={{ marginTop: '4px', fontStyle: 'italic' }}>- {cmt.noiDung}</Typography>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                </div>
                            ))}
                            {(!albumData.danhSachAnhChinhSua || albumData.danhSachAnhChinhSua.length === 0) && (
                                <Typography variant="body1" style={{ padding: '20px', gridColumn: '1 / -1' }}>Chưa có ảnh chỉnh sửa nào.</Typography>
                            )}
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAlbumDetailDialog(false)} variant="contained" color="primary">Đóng</Button>
                </DialogActions>
            </Dialog>

            <LocAnhMayTinhDialog
                open={openLocAnhDialog}
                onClose={() => setOpenLocAnhDialog(false)}
                albumData={albumData}
            />

        </Fragment>
    );
}

export default DetailHopDongKhachHangDialog;
