import { useState, useEffect, useRef, Fragment, useCallback, useMemo } from "react";
import "./ThemHopDongDialog.css";
import "./DetailHopDongModern.css";
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
import logoVang from '../../assets/logo/logo-vang.png';
import { formatLunarDateFull } from '../../utils/lunarDateUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileContract,
    faCamera,
    faWandMagicSparkles,
    faPrint,
    faCircleCheck,
    faHeart,
    faDownload,
    faCreditCard
} from '@fortawesome/free-solid-svg-icons';
import MobileAccordion from '../../components/MobileAccordion';
import LocAnhMayTinhDialog from './LocAnhMayTinhDialog';
import { downloadPhoto } from '../../utils/downloadHelper';
import { getContractPrintConfig } from '../../utils/printConfigHelper';
import SePayDialog from './SePayDialog';
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
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
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
    const [openSepayDialog, setOpenSepayDialog] = useState(false);

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

    const removeVietnameseTones = (str) => {
        if (!str) return "";
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase()
            .trim();
    };

    const loadDichVu = useCallback(() => {
        otherService.findDichVu()
            .then((response) => {
                const list = response?.data?.dichVu || 
                             response?.data?.data?.dichVu || 
                             response?.dichVu || 
                             (Array.isArray(response?.data) ? response.data : []) || 
                             (Array.isArray(response) ? response : []) || 
                             [];
                setListDichVu(Array.isArray(list) ? list : []);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, []);

    useEffect(() => {
        loadDichVu();
    }, [loadDichVu]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
            loadDichVu();
            otherService.LIST_HOPDONG({})
                .then(response => {
                    setListHopDong(response.data?.hopDong || response.data || []);
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

    const suggestions = useMemo(() => {
        const term = searchTerm?.trim();
        if (!term) return [];
        const cleanTerm = term.toLowerCase();
        const cleanTermNoTone = removeVietnameseTones(term);

        return (listDichVu || []).filter(p => {
            const name = (p.tenDichVu || '').toLowerCase();
            const code = (p.maDichVu || '').toLowerCase();
            const nameNoTone = removeVietnameseTones(p.tenDichVu);
            const codeNoTone = removeVietnameseTones(p.maDichVu);

            return name.includes(cleanTerm) || 
                   code.includes(cleanTerm) ||
                   nameNoTone.includes(cleanTermNoTone) ||
                   codeNoTone.includes(cleanTermNoTone);
        });
    }, [listDichVu, searchTerm]);

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
            const targetProductId = (product.dichVu?._id || product.dichVu || product._id)?.toString();
            const isExisting = gioHang.find(sp => getCartItemId(sp) === targetProductId);
            if (isExisting) {
                updatedGioHang = gioHang.map(sp =>
                    getCartItemId(sp) === targetProductId
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

    // Helper to get consistent cart item ID string
    const getCartItemId = (item) => {
        if (!item) return '';
        const rawId = item.dichVu?._id || item.dichVu || item._id;
        return rawId ? rawId.toString() : (item.maDichVu || '');
    };

    const handleParamChange = (dichVuId, field, value) => {
        const targetIdStr = dichVuId?.toString();
        const updatedCart = gioHang.map(sp => {
            if (getCartItemId(sp) === targetIdStr) {
                return { ...sp, [field]: value };
            }
            return sp;
        });
        updateCartAndTotal(updatedCart);
    };


    const handleDiscountItemChange = (dichVuId, value) => {
        const targetIdStr = dichVuId?.toString();
        const discountVal = Math.max(0, parseFloat(value) || 0);
        const updatedCart = gioHang.map(sp => {
            if (getCartItemId(sp) === targetIdStr) {
                return { ...sp, giamGiaDichVu: discountVal };
            }
            return sp;
        });

        const newTotalSauGiam = calculateTotalWithCart(updatedCart);
        const daThanhToan = getDaThanhToan();
        if (daThanhToan > 0 && newTotalSauGiam < daThanhToan) {
            toast.error(`Không thể tăng giảm giá vì tổng tiền hợp đồng (${newTotalSauGiam.toLocaleString('vi-VN')} đ) sẽ thấp hơn số tiền khách đã thanh toán (${daThanhToan.toLocaleString('vi-VN')} đ)!`);
            return;
        }

        updateCartAndTotal(updatedCart);
    };

    const calculateTotalWithCart = (cart) => {
        const tongGoc = cart.reduce((sum, item) => {
            const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
            const discountItem = parseFloat(item.giamGiaDichVu || 0);
            return sum + Math.max(0, (price * (item.soLuong || 0)) - discountItem);
        }, 0);

        let tongSauGiam = tongGoc;
        if (Number(loaiGiamGia) === 1) {
            tongSauGiam = tongGoc - (tongGoc * (giamGia / 100));
        } else {
            tongSauGiam = tongGoc - giamGia;
        }

        return tongSauGiam < 0 ? 0 : tongSauGiam;
    };

    const getDaThanhToan = () => {
        const cacLuot = data?.thanhToan?.cacLuotThanhToan;
        if (Array.isArray(cacLuot) && cacLuot.length > 0) {
            return cacLuot.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        }
        return Number(data?.thanhToan?.khachHangDaThanhToan) || 0;
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

    // Hàm xóa hoàn toàn sản phẩm khỏi giỏ: Cho phép xóa nếu giá trị giảm đi <= số tiền còn lại chưa thanh toán
    const handleDeleteProduct = (dichVuId, targetIndex) => {
        if (!Array.isArray(gioHang) || gioHang.length <= 1) {
            toast.error("Không thể xóa sản phẩm cuối cùng trong hợp đồng! Hợp đồng phải có ít nhất 1 dịch vụ/sản phẩm.");
            return;
        }

        let updatedCart;
        if (targetIndex !== undefined && targetIndex >= 0) {
            updatedCart = gioHang.filter((_, i) => i !== targetIndex);
        } else {
            const targetIdStr = dichVuId?.toString();
            updatedCart = gioHang.filter(sp => getCartItemId(sp) !== targetIdStr);
        }

        const newTotalSauGiam = calculateTotalWithCart(updatedCart);
        const daThanhToan = getDaThanhToan();

        if (daThanhToan > 0 && newTotalSauGiam < daThanhToan) {
            const currentTotalSauGiam = calculateTotalWithCart(gioHang);
            const conLai = Math.max(0, currentTotalSauGiam - daThanhToan);
            toast.error(`Không thể xóa sản phẩm này vì giá trị sản phẩm lớn hơn số tiền còn lại chưa thanh toán (${conLai.toLocaleString('vi-VN')} đ). Tổng tiền hợp đồng không thể nhỏ hơn số tiền khách đã thanh toán (${daThanhToan.toLocaleString('vi-VN')} đ)!`);
            return;
        }

        updateCartAndTotal(updatedCart);
        toast.info("Đã xóa sản phẩm khỏi giỏ hàng");
    };

    // Hàm giảm số lượng sản phẩm: Cho phép giảm nếu đơn giá giảm đi <= số tiền còn lại chưa thanh toán
    const handleDecreaseQuantity = (dichVuId, targetIndex) => {
        const itemIdx = (targetIndex !== undefined && targetIndex >= 0)
            ? targetIndex
            : gioHang.findIndex(sp => getCartItemId(sp) === dichVuId?.toString());

        if (itemIdx < 0 || !gioHang[itemIdx]) return;
        const existingProduct = gioHang[itemIdx];

        if (existingProduct.soLuong <= 1 && (!Array.isArray(gioHang) || gioHang.length <= 1)) {
            toast.error("Không thể xóa sản phẩm cuối cùng trong hợp đồng! Hợp đồng phải có ít nhất 1 dịch vụ/sản phẩm.");
            return;
        }

        let updatedCart;
        if (existingProduct.soLuong > 1) {
            updatedCart = gioHang.map((sp, idx) =>
                idx === itemIdx ? { ...sp, soLuong: sp.soLuong - 1 } : sp
            );
        } else {
            updatedCart = gioHang.filter((_, idx) => idx !== itemIdx);
        }

        const newTotalSauGiam = calculateTotalWithCart(updatedCart);
        const daThanhToan = getDaThanhToan();

        if (daThanhToan > 0 && newTotalSauGiam < daThanhToan) {
            const currentTotalSauGiam = calculateTotalWithCart(gioHang);
            const conLai = Math.max(0, currentTotalSauGiam - daThanhToan);
            toast.error(`Không thể giảm số lượng vì đơn giá sản phẩm lớn hơn số tiền còn lại chưa thanh toán (${conLai.toLocaleString('vi-VN')} đ). Tổng tiền hợp đồng không thể nhỏ hơn số tiền khách đã thanh toán (${daThanhToan.toLocaleString('vi-VN')} đ)!`);
            return;
        }

        updateCartAndTotal(updatedCart);
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

        // Kiểm tra trước giỏ hàng so với số tiền đã thanh toán
        const daThanhToan = getDaThanhToan();
        const currentTotalSauGiam = calculateTotalWithCart(gioHang);
        if (daThanhToan > 0 && currentTotalSauGiam < daThanhToan) {
            const conLai = Math.max(0, currentTotalSauGiam - daThanhToan);
            toast.error(`Không thể cập nhật hợp đồng vì tổng tiền giỏ hàng sau giảm (${currentTotalSauGiam.toLocaleString('vi-VN')} đ) nhỏ hơn số tiền khách đã thanh toán (${daThanhToan.toLocaleString('vi-VN')} đ)!`);
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
            if (response?.success === false) {
                toast.error(response?.message || "Có lỗi xảy ra khi cập nhật hợp đồng!");
                hideLoading();
                return;
            }
            toast.success("Cập nhật hợp đồng thành công!");
            hideLoading();
            onClose(true); // Close and refresh
        }).catch((error) => {
            console.error(error);
            const errorMsg = error?.message || error?.response?.data?.message || (typeof error === 'string' ? error : "Có lỗi xảy ra khi cập nhật hợp đồng!");
            toast.error(errorMsg);
            hideLoading();
        });
    };

    const handleDeleteHopDong = () => {
        if (deleteConfirmInput !== maHopDong) {
            toast.error("Mã hợp đồng không chính xác!");
            return;
        }

        // 1. Kiểm tra hợp đồng đã có thanh toán
        const daThanhToan = Number(data?.thanhToan?.khachHangDaThanhToan) || 0;
        const cacLuotThanhToan = data?.thanhToan?.cacLuotThanhToan || [];
        if (daThanhToan > 0 || (Array.isArray(cacLuotThanhToan) && cacLuotThanhToan.length > 0)) {
            toast.error(`Không thể xóa hợp đồng vì đã có phát sinh thanh toán (${daThanhToan > 0 ? daThanhToan.toLocaleString("vi-VN") + " đ" : "có lịch sử thanh toán"})!`);
            return;
        }

        // 2. Kiểm tra phiếu thuê đồ đang cho thuê / đang mượn
        const trangThaiSoanDo = data?.soanDo?.trangThai;
        if (["Đang mượn", "Đang thuê", "Đang cho thuê"].includes(trangThaiSoanDo)) {
            toast.error("Không thể xóa hợp đồng vì đang có phiếu thuê đồ ở trạng thái đang cho thuê/mượn!");
            return;
        }

        showLoading("Đang xóa hợp đồng...");
        otherService.deleteHopDong({ maHopDong })
            .then((response) => {
                if (response?.success === false) {
                    toast.error(response?.message || "Có lỗi xảy ra khi xóa hợp đồng!");
                    hideLoading();
                    return;
                }
                toast.success("Xóa hợp đồng thành công!");
                hideLoading();
                setOpenDeleteDialog(false);
                onClose(true); // Đóng dialog và tải lại danh sách
            })
            .catch((error) => {
                console.error(error);
                const errorMsg = error?.message || error?.response?.data?.message || (typeof error === 'string' ? error : "Có lỗi xảy ra khi xóa hợp đồng!");
                toast.error(errorMsg);
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
                        <img src="${window.location.origin}${logoVang}" alt="${getContractPrintConfig().studioName}" style="height: 50px; object-fit: contain;" />
                    </div>
                    <div class="company-info" style="text-align: right;">
                        <div>Website: <strong>${getContractPrintConfig().studioWebsite}</strong></div>
                        <div>Hotline: <strong>${getContractPrintConfig().studioHotline}</strong></div>
                        <div>Địa chỉ: <strong>${getContractPrintConfig().studioAddress}</strong></div>
                    </div>
                </div>
                
                <div class="contract-title-sec">
                    <div class="title">${getContractPrintConfig().contractTitle}</div>
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
                        <div class="sig-title">${getContractPrintConfig().clientSignTitle}</div>
                        <div class="sig-name">${nameKH1 || ''}</div>
                    </div>
                    <div class="sig-box">
                        <div class="sig-title">${getContractPrintConfig().studioSignTitle}</div>
                        <div class="sig-name">${getContractPrintConfig().studioName}</div>
                    </div>
                </div>

                <div class="terms">
                    <div class="terms-title">Điều khoản chung & Cam kết dịch vụ:</div>
                    ${getContractPrintConfig().terms.map((term, i) => `<p>${i + 1}. ${term}</p>`).join('')}
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
            <Dialog 
                onClose={handleClose} 
                open={open}
                fullWidth={true}
                maxWidth="xl"
                PaperProps={{
                    className: "hd-modern-dialog-root",
                    sx: {
                        width: '100% !important',
                        maxWidth: '100vw !important',
                        m: '0 !important',
                        height: '100% !important',
                        maxHeight: '100vh !important',
                        borderRadius: '0 !important',
                        p: '0 !important'
                    }
                }}
            >
                <div className="hd-modern-wrapper">
                    {/* ===== 1. ULTRA-COMPACT EXECUTIVE HEADER ===== */}
                    <div className="hd-compact-header">
                        {/* Left: Icon, Title & Meta (Mã HĐ & Loại HĐ) */}
                        <div className="hd-header-left-group">
                            <div className="hd-header-icon-mini">
                                <FontAwesomeIcon icon={faFileContract} />
                            </div>
                            <div className="hd-header-title-text">
                                <h2>
                                    CHI TIẾT HĐ: 
                                    <span className="hd-header-contract-code" style={{ marginLeft: 6 }}>{maHopDong}</span>
                                </h2>
                            </div>
                            <span className="hd-chip-pill hd-chip-service">
                                💎 {getDichVuChinhLabel(dichVuChinh)}
                            </span>
                        </div>

                        {/* Center: Slim Inline Stepper (Tiến Trình) */}
                        <div className="hd-inline-stepper">
                            {[
                                { number: 1, label: "Tạo HĐ" },
                                { number: 2, label: "Chụp hình" },
                                { number: 3, label: "Hậu kỳ" },
                                { number: 4, label: "In ảnh" },
                                { number: 5, label: "Hoàn thành" }
                            ].map((step, idx, arr) => {
                                const isCompleted = step.number < giaiDoan;
                                const isActive = step.number === giaiDoan;

                                return (
                                    <Fragment key={step.number}>
                                        <div
                                            className={`hd-step-node-mini ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                            onClick={() => handleStepClick(step.number)}
                                            title={`Click chuyển giai đoạn: ${step.label}`}
                                        >
                                            <div className="hd-step-circle-mini">
                                                {isCompleted ? "✓" : step.number}
                                            </div>
                                            <span className="hd-step-label-mini">{step.label}</span>
                                        </div>
                                        {idx < arr.length - 1 && (
                                            <div className={`hd-step-line-mini ${step.number < giaiDoan ? 'filled' : ''}`}></div>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </div>

                        {/* Right: Close button only */}
                        <div className="hd-header-right-group">
                            <button className="hd-close-btn-mini" onClick={handleClose} title="Đóng cửa sổ">
                                ×
                            </button>
                        </div>
                    </div>

                    {/* ===== 2. MAIN DASHBOARD CONTENT (ALL IN 1 SCREEN - NO TABS) ===== */}
                    <div className="hd-dashboard-content">
                        <div className="hd-bento-grid">
                            
                            {/* ================= COLUMN 1: KHÁCH HÀNG & LỊCH TRÌNH ================= */}
                            <div className="hd-bento-col">
                                {/* Card 1: Khách Hàng */}
                                <div className="hd-card">
                                    <div className="hd-card-head">
                                        <h3 className="hd-card-title">
                                            <span>👰🤵</span> Khách Hàng
                                        </h3>
                                    </div>

                                    {/* KH 1 (Cô Dâu / Chính) */}
                                    <div className="hd-customer-box">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className="hd-customer-tag bride">👰 KH 1 (Cô dâu / Đại diện)</span>
                                            {(phoneKH1 || facebookKH1) && (
                                                <span 
                                                    style={{ fontSize: '0.68rem', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
                                                    onClick={() => {
                                                        const targetUser = phoneKH1 || facebookKH1;
                                                        const link = getClientLoginUrl(targetUser);
                                                        navigator.clipboard.writeText(link);
                                                        toast.success("Đã sao chép link đăng nhập KH 1!");
                                                    }}
                                                >
                                                    🔗 Copy link KH 1
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '6px' }}>
                                            <input className="hd-input-text" value={phoneKH1 || "SĐT"} disabled placeholder="SĐT KH 1" />
                                            <input className="hd-input-text" value={nameKH1 || "Tên KH 1"} disabled style={{ fontWeight: 700, color: '#0f172a' }} />
                                        </div>
                                        <input className="hd-input-text" value={addressKH1 || "Chưa có địa chỉ"} disabled placeholder="Địa chỉ KH 1" />
                                        <input
                                            className="hd-input-text"
                                            value={facebookKH1 || "Link / ID Facebook 1"}
                                            readOnly
                                            placeholder="Link/ID FB 1"
                                            style={facebookKH1 ? { cursor: 'pointer', color: '#0284c7', textDecoration: 'underline', backgroundColor: '#f0f9ff' } : {}}
                                            onClick={() => {
                                                if (facebookKH1) {
                                                    const url = facebookKH1.startsWith('http') ? facebookKH1 : `https://facebook.com/${facebookKH1}`;
                                                    window.open(url, '_blank');
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* KH 2 (Chú Rể) */}
                                    <div className="hd-customer-box">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className="hd-customer-tag groom">🤵 KH 2 (Chú rể / Phối hợp)</span>
                                            {(phoneKH2 || facebookKH2) && (
                                                <span 
                                                    style={{ fontSize: '0.68rem', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
                                                    onClick={() => {
                                                        const targetUser = phoneKH2 || facebookKH2;
                                                        const link = getClientLoginUrl(targetUser);
                                                        navigator.clipboard.writeText(link);
                                                        toast.success("Đã sao chép link đăng nhập KH 2!");
                                                    }}
                                                >
                                                    🔗 Copy link KH 2
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '6px' }}>
                                            <input className="hd-input-text" value={phoneKH2 || "SĐT"} disabled placeholder="SĐT KH 2" />
                                            <input className="hd-input-text" value={nameKH2 || "Tên KH 2"} disabled style={{ fontWeight: 700, color: '#0f172a' }} />
                                        </div>
                                        <input className="hd-input-text" value={addressKH2 || "Chưa có địa chỉ"} disabled placeholder="Địa chỉ KH 2" />
                                        <input
                                            className="hd-input-text"
                                            value={facebookKH2 || "Link / ID Facebook 2"}
                                            readOnly
                                            placeholder="Link/ID FB 2"
                                            style={facebookKH2 ? { cursor: 'pointer', color: '#0284c7', textDecoration: 'underline', backgroundColor: '#f0f9ff' } : {}}
                                            onClick={() => {
                                                if (facebookKH2) {
                                                    const url = facebookKH2.startsWith('http') ? facebookKH2 : `https://facebook.com/${facebookKH2}`;
                                                    window.open(url, '_blank');
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Card 2: Phân Công & Nhân Sự */}
                                <div className="hd-card">
                                    <div className="hd-card-head">
                                        <h3 className="hd-card-title">
                                            <span>👔</span> Phân Công Đội Ngũ
                                        </h3>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <div className="hd-form-group">
                                            <label className="hd-form-label">Sale</label>
                                            <select className="hd-select-control" name="nhanVienSale" value={nhanVienSale} onChange={(e) => setNhanVienSale(e.target.value)}>
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
                                        </div>

                                        <div className="hd-form-group">
                                            <label className="hd-form-label">Thợ chụp</label>
                                            <select className="hd-select-control" name="thoChupHinh" value={thoChupHinh} onChange={(e) => setThoChupHinh(e.target.value)}>
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
                                        </div>

                                        <div className="hd-form-group">
                                            <label className="hd-form-label">Makeup</label>
                                            <select className="hd-select-control" name="thoMakeUp" value={thoMakeUp} onChange={(e) => setThoMakeUp(e.target.value)}>
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
                                        </div>

                                        <div className="hd-form-group">
                                            <label className="hd-form-label">Chỉnh ảnh</label>
                                            <select className="hd-select-control" name="thoChinhAnh" value={thoChinhAnh} onChange={(e) => setThoChinhAnh(e.target.value)}>
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
                                        </div>
                                    </div>

                                    <div className="hd-form-group" style={{ marginTop: '6px' }}>
                                        <label className="hd-form-label">Trạng thái chốt lịch</label>
                                        <select 
                                            className="hd-select-control" 
                                            name="chotLich" 
                                            value={chotLich} 
                                            onChange={(e) => setChotLich(e.target.value)}
                                            style={{ 
                                                fontWeight: 700, 
                                                backgroundColor: chotLich === 'Đã chốt lịch' ? '#dcfce7' : chotLich === 'Đã gọi điện xác nhận' ? '#fef3c7' : '#ffffff',
                                                color: chotLich === 'Đã chốt lịch' ? '#15803d' : chotLich === 'Đã gọi điện xác nhận' ? '#b45309' : '#475569'
                                            }}
                                        >
                                            <option value="Chưa gọi điện">Chưa gọi điện</option>
                                            <option value="Đã gọi điện xác nhận">Đã gọi điện xác nhận</option>
                                            <option value="Đã chốt lịch">Đã chốt lịch</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Card 3: Lịch Trình & Phong Thủy */}
                                <div className="hd-card">
                                    <div className="hd-card-head">
                                        <h3 className="hd-card-title">
                                            <span>📅</span> Lịch Trình & Âm Lịch
                                        </h3>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div>
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
                                                                toast.warning(`Cảnh báo: Trùng/gần lịch chụp HĐ ${conflict.maHopDong} lúc ${timeStr} (< 3 tiếng).`);
                                                            }
                                                        }
                                                    }}
                                                    slotProps={{ textField: { fullWidth: true, size: 'small', inputProps: { style: { fontSize: '0.8rem', padding: '6px 10px' } } } }}
                                                    format="DD/MM/YYYY HH:mm"
                                                />
                                            </LocalizationProvider>
                                            {ngayChup && (
                                                <div style={{ fontSize: '0.7rem', color: '#d97706', marginTop: '2px', fontWeight: '600' }}>
                                                    🏮 Âm lịch: {formatLunarDateFull(ngayChup)}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            <div>
                                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                                                    <DateTimePicker
                                                        label="Ngày ăn hỏi"
                                                        value={ngayAnHoi ? dayjs(ngayAnHoi) : null}
                                                        onChange={(newValue) => setNgayAnHoi(newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '')}
                                                        slotProps={{ textField: { fullWidth: true, size: 'small', inputProps: { style: { fontSize: '0.8rem', padding: '6px 10px' } } } }}
                                                        format="DD/MM/YYYY HH:mm"
                                                    />
                                                </LocalizationProvider>
                                                {ngayAnHoi && (
                                                    <div style={{ fontSize: '0.68rem', color: '#d97706', marginTop: '2px', fontWeight: '600' }}>
                                                        🏮 {formatLunarDateFull(ngayAnHoi)}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                                                    <DateTimePicker
                                                        label="Ngày cưới"
                                                        value={ngayCuoi ? dayjs(ngayCuoi) : null}
                                                        onChange={(newValue) => setNgayCuoi(newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '')}
                                                        slotProps={{ textField: { fullWidth: true, size: 'small', inputProps: { style: { fontSize: '0.8rem', padding: '6px 10px' } } } }}
                                                        format="DD/MM/YYYY HH:mm"
                                                    />
                                                </LocalizationProvider>
                                                {ngayCuoi && (
                                                    <div style={{ fontSize: '0.68rem', color: '#d97706', marginTop: '2px', fontWeight: '600' }}>
                                                        🏮 {formatLunarDateFull(ngayCuoi)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            <div className="hd-form-group">
                                                <label className="hd-form-label">Ngày bắt đầu hậu kỳ</label>
                                                <input className="hd-input-text" type="date" name="ngayChinhAnh" value={ngayChinhAnh} onChange={(e) => setNgayChinhAnh(e.target.value)} />
                                            </div>
                                            <div className="hd-form-group">
                                                <label className="hd-form-label">Ngày trả ảnh</label>
                                                <input className="hd-input-text" type="date" name="ngayTraAnh" value={ngayTraAnh} onChange={(e) => setNgayTraAnh(e.target.value)} />
                                            </div>
                                        </div>

                                        <div className="hd-form-group">
                                            <label className="hd-form-label">Địa điểm chụp ảnh</label>
                                            <input className="hd-input-text" type="text" name="diaDiemChup" value={diaDiemChup} onChange={(e) => setDiaDiemChup(e.target.value)} placeholder="Ví dụ: Phim trường, Ngoại cảnh..." />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ================= COLUMN 2: SẢN PHẨM & QUY CÁCH ================= */}
                            <div className="hd-bento-col">
                                {/* Card 4: Sản Phẩm & Gói Dịch Vụ */}
                                <div className="hd-card">
                                    <div className="hd-card-head">
                                        <h3 className="hd-card-title">
                                            <span>💎</span> Sản Phẩm & Dịch Vụ Trong Hợp Đồng
                                        </h3>
                                    </div>

                                    {/* Search product autocomplete */}
                                    <div className="product-search-container" ref={searchRef} style={{ position: 'relative', marginBottom: '8px' }}>
                                        <AppSearchInput
                                            value={searchTerm}
                                            placeholder="Tìm thêm dịch vụ hoặc sản phẩm..."
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
                                                        <span className="p-price">{p.giaChoThueDichVu?.toLocaleString("vi-VN")} đ</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {/* Table */}
                                    <div className="hd-table-wrap">
                                        <table className="hd-table-compact">
                                            <thead>
                                                <tr>
                                                    <th>Tên Gói / SP</th>
                                                    <th style={{ textAlign: "center", width: '100px' }}>SL</th>
                                                    <th>Đơn giá</th>
                                                    <th style={{ width: '105px' }}>Giảm (đ)</th>
                                                    <th>Thành tiền</th>
                                                    <th style={{ textAlign: "center", width: '50px' }}>Xóa</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Array.isArray(gioHang) && gioHang.length > 0 ? (
                                                    gioHang.map((item, index) => {
                                                        const productId = item.dichVu?._id || item.dichVu || item._id;
                                                        const price = item.donGia || item.giaChoThueDichVu || 0;
                                                        const discountItem = parseFloat(item.giamGiaDichVu || 0);
                                                        const total = Math.max(0, (price * (item.soLuong || 0)) - discountItem);

                                                        const daThanhToan = getDaThanhToan();
                                                        const isOnlyItem = Array.isArray(gioHang) && gioHang.length <= 1;

                                                        const cartAfterDecrease = item.soLuong > 1
                                                            ? gioHang.map((sp, idx) => idx === index ? { ...sp, soLuong: sp.soLuong - 1 } : sp)
                                                            : gioHang.filter((_, idx) => idx !== index);
                                                        const canDecrease = (!isOnlyItem || item.soLuong > 1) && (daThanhToan <= 0 || calculateTotalWithCart(cartAfterDecrease) >= daThanhToan);

                                                        const cartAfterDelete = gioHang.filter((_, idx) => idx !== index);
                                                        const canDelete = !isOnlyItem && (daThanhToan <= 0 || calculateTotalWithCart(cartAfterDelete) >= daThanhToan);

                                                        return (
                                                            <tr key={productId || index}>
                                                                <td style={{ fontWeight: 600, color: '#0f172a' }}>
                                                                    {item.tenDichVuSnapshot || item.tenDichVu}
                                                                </td>
                                                                <td style={{ textAlign: "center" }}>
                                                                    <div className="hd-qty-box-mini">
                                                                        <button
                                                                            className="hd-qty-btn-mini"
                                                                            onClick={() => handleDecreaseQuantity(productId, index)}
                                                                            disabled={!canDecrease}
                                                                            style={{ opacity: !canDecrease ? 0.3 : 1 }}
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <span className="hd-qty-val-mini">{item.soLuong}</span>
                                                                        <button className="hd-qty-btn-mini" onClick={() => handleSelectProduct(item)}>+</button>
                                                                    </div>
                                                                </td>
                                                                <td style={{ fontWeight: 600 }}>{price.toLocaleString("vi-VN")} đ</td>
                                                                <td>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        placeholder="0"
                                                                        className="hd-input-text"
                                                                        value={item.giamGiaDichVu !== undefined && item.giamGiaDichVu !== null ? item.giamGiaDichVu : ''}
                                                                        onChange={(e) => handleDiscountItemChange(productId, e.target.value)}
                                                                        style={{ padding: '4px 6px', fontSize: '0.76rem' }}
                                                                    />
                                                                </td>
                                                                <td style={{ fontWeight: 700, color: '#0284c7' }}>
                                                                    {total.toLocaleString("vi-VN")} đ
                                                                    {discountItem > 0 && (
                                                                        <div style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 600 }}>
                                                                            (-{discountItem.toLocaleString("vi-VN")} đ)
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td style={{ textAlign: "center" }}>
                                                                    <button
                                                                        onClick={() => handleDeleteProduct(productId, index)}
                                                                        disabled={!canDelete}
                                                                        style={{ border: 'none', background: 'transparent', color: canDelete ? '#dc2626' : '#cbd5e1', cursor: canDelete ? 'pointer' : 'not-allowed', fontSize: '0.8rem' }}
                                                                        title="Xóa dịch vụ"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: '20px' }}>
                                                            Chưa có dịch vụ nào trong hợp đồng.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Card 5: Quy Cách Sản Phẩm Đính Kèm */}
                                {(() => {
                                    const hasItems = Array.isArray(gioHang) && gioHang.length > 0;
                                    const firstItem = hasItems ? gioHang[0] : {};

                                    return (
                                        <div className="hd-card">
                                            <div className="hd-card-head">
                                                <h3 className="hd-card-title">
                                                    <span>📦</span> Quy Cách Chi Tiết Đính Kèm Hợp Đồng
                                                </h3>
                                            </div>

                                            {/* Section 1: Ảnh In */}
                                            <div className="hd-spec-section-title">
                                                <span>🖼️</span> Ảnh Phóng & Để Bàn
                                            </div>
                                            <div className="hd-spec-grid">
                                                <div className="hd-form-group">
                                                    <label className="hd-form-label">SL ảnh chỉnh sửa</label>
                                                    <input
                                                        type="number"
                                                        className="hd-input-text"
                                                        value={firstItem.soLuongAnhChinhSua ?? 0}
                                                        onChange={(e) => updateGioHangParam("soLuongAnhChinhSua", Number(e.target.value) || 0)}
                                                        disabled={!hasItems}
                                                    />
                                                </div>
                                                <div className="hd-form-group">
                                                    <label className="hd-form-label">Ảnh 16x21</label>
                                                    <input
                                                        type="number"
                                                        className="hd-input-text"
                                                        value={firstItem.soLuongAnh16x21 ?? 0}
                                                        onChange={(e) => updateGioHangParam("soLuongAnh16x21", Number(e.target.value) || 0)}
                                                        disabled={!hasItems}
                                                    />
                                                </div>
                                                <div className="hd-form-group">
                                                    <label className="hd-form-label">Ảnh 20x30</label>
                                                    <input
                                                        type="number"
                                                        className="hd-input-text"
                                                        value={firstItem.soLuongAnh20x30 ?? 0}
                                                        onChange={(e) => updateGioHangParam("soLuongAnh20x30", Number(e.target.value) || 0)}
                                                        disabled={!hasItems}
                                                    />
                                                </div>
                                                <div className="hd-form-group">
                                                    <label className="hd-form-label">Ảnh 60x90</label>
                                                    <input
                                                        type="number"
                                                        className="hd-input-text"
                                                        value={firstItem.soLuongAnh60x90 ?? 0}
                                                        onChange={(e) => updateGioHangParam("soLuongAnh60x90", Number(e.target.value) || 0)}
                                                        disabled={!hasItems}
                                                    />
                                                </div>
                                            </div>

                                            {/* Section 2: Makeup */}
                                            <div className="hd-spec-section-title" style={{ marginTop: '8px' }}>
                                                <span>💄</span> Trang Điểm & Làm Đẹp
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                <div className="hd-form-group">
                                                    <label className="hd-form-label">Trang điểm ăn hỏi</label>
                                                    <input
                                                        type="text"
                                                        className="hd-input-text"
                                                        value={firstItem.trangDiemNgayAnHoi ?? ""}
                                                        onChange={(e) => updateGioHangParam("trangDiemNgayAnHoi", e.target.value)}
                                                        disabled={!hasItems}
                                                        placeholder="Không có"
                                                    />
                                                </div>
                                                <div className="hd-form-group">
                                                    <label className="hd-form-label">Trang điểm ngày cưới</label>
                                                    <input
                                                        type="text"
                                                        className="hd-input-text"
                                                        value={firstItem.trangDiemNgayCuoi ?? ""}
                                                        onChange={(e) => updateGioHangParam("trangDiemNgayCuoi", e.target.value)}
                                                        disabled={!hasItems}
                                                        placeholder="Không có"
                                                    />
                                                </div>
                                            </div>

                                            {/* Section 3: Costumes */}
                                            <div className="hd-spec-section-title" style={{ marginTop: '8px' }}>
                                                <span>👗</span> Trang Phục & Phụ Kiện
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                <div className="hd-form-group">
                                                    <label className="hd-form-label">Trang phục bê lễ</label>
                                                    <input
                                                        type="text"
                                                        className="hd-input-text"
                                                        value={firstItem.trangPhucChoDoiBeLe ?? ""}
                                                        onChange={(e) => updateGioHangParam("trangPhucChoDoiBeLe", e.target.value)}
                                                        disabled={!hasItems}
                                                        placeholder="Không có"
                                                    />
                                                </div>
                                                <div className="hd-form-group">
                                                    <label className="hd-form-label">TP cô dâu ăn hỏi</label>
                                                    <input
                                                        type="text"
                                                        className="hd-input-text"
                                                        value={firstItem.trangPhucCoDauNgayAnHoi ?? ""}
                                                        onChange={(e) => updateGioHangParam("trangPhucCoDauNgayAnHoi", e.target.value)}
                                                        disabled={!hasItems}
                                                        placeholder="Không có"
                                                    />
                                                </div>
                                                <div className="hd-form-group">
                                                    <label className="hd-form-label">TP chú rể ăn hỏi</label>
                                                    <input
                                                        type="text"
                                                        className="hd-input-text"
                                                        value={firstItem.trangPhucChuReNgayAnHoi ?? ""}
                                                        onChange={(e) => updateGioHangParam("trangPhucChuReNgayAnHoi", e.target.value)}
                                                        disabled={!hasItems}
                                                        placeholder="Không có"
                                                    />
                                                </div>
                                                <div className="hd-form-group">
                                                    <label className="hd-form-label">Váy cưới ngày cưới</label>
                                                    <input
                                                        type="text"
                                                        className="hd-input-text"
                                                        value={firstItem.trangPhucVayCuoiNgayCuoi ?? ""}
                                                        onChange={(e) => updateGioHangParam("trangPhucVayCuoiNgayCuoi", e.target.value)}
                                                        disabled={!hasItems}
                                                        placeholder="Không có"
                                                    />
                                                </div>
                                                <div className="hd-form-group">
                                                    <label className="hd-form-label">Vest chú rể ngày cưới</label>
                                                    <input
                                                        type="text"
                                                        className="hd-input-text"
                                                        value={firstItem.trangPhucVestChuReNgayCuoi ?? ""}
                                                        onChange={(e) => updateGioHangParam("trangPhucVestChuReNgayCuoi", e.target.value)}
                                                        disabled={!hasItems}
                                                        placeholder="Không có"
                                                    />
                                                </div>
                                                <div className="hd-form-group">
                                                    <label className="hd-form-label">Hoa cầm tay</label>
                                                    <input
                                                        type="text"
                                                        className="hd-input-text"
                                                        value={firstItem.hoaCamTay ?? ""}
                                                        onChange={(e) => updateGioHangParam("hoaCamTay", e.target.value)}
                                                        disabled={!hasItems}
                                                        placeholder="Không có"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Card 6: Thanh Toán */}
                                <div className="hd-card">
                                    <div className="hd-card-head">
                                        <h3 className="hd-card-title">
                                            <span>💳</span> Thanh Toán
                                        </h3>
                                    </div>

                                    {/* History list */}
                                    <div style={{ maxHeight: '110px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '8px' }}>
                                        <table className="hd-table-compact" style={{ fontSize: '0.74rem' }}>
                                            <thead>
                                                <tr>
                                                    <th>Ngày</th>
                                                    <th>Số tiền</th>
                                                    <th>Hình thức</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data?.thanhToan?.cacLuotThanhToan && data.thanhToan.cacLuotThanhToan.length > 0 ? (
                                                    data.thanhToan.cacLuotThanhToan.map((p, idx) => (
                                                        <tr key={idx}>
                                                            <td style={{ whiteSpace: 'nowrap' }}>{formatDate(p.date)}</td>
                                                            <td style={{ fontWeight: 700, color: '#16a34a' }}>{p.amount?.toLocaleString("vi-VN")} đ</td>
                                                            <td>{p.method}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3} style={{ textAlign: "center", color: "#94a3b8", padding: '8px' }}>
                                                            Chưa có giao dịch.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Financial Breakdown */}
                                    <div className="hd-pay-summary-box">
                                        <div className="hd-pay-row">
                                            <span>Tổng đơn:</span>
                                            <b>
                                                {gioHang.reduce((sum, item) => {
                                                    const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || 0);
                                                    return sum + (price * (item.soLuong || 0));
                                                }, 0).toLocaleString("vi-VN")} đ
                                            </b>
                                        </div>

                                        <div className="hd-pay-row">
                                            <span>Sau giảm giá:</span>
                                            <b>{tongTien.toLocaleString("vi-VN")} đ</b>
                                        </div>

                                        <div className="hd-pay-row" style={{ color: '#16a34a' }}>
                                            <span>Đã thanh toán:</span>
                                            <b>{((data?.thanhToan?.khachHangDaThanhToan || 0) + (Number(khachThanhToanTruoc) || 0)).toLocaleString("vi-VN")} đ</b>
                                        </div>

                                        {/* Progress */}
                                        {(() => {
                                            const paid = (data?.thanhToan?.khachHangDaThanhToan || 0) + (Number(khachThanhToanTruoc) || 0);
                                            const percent = data?.thanhToan?.phanTramDaThanhToan !== undefined
                                                ? Number(data.thanhToan.phanTramDaThanhToan)
                                                : (tongTien > 0 ? Math.min(100, Math.round((paid / tongTien) * 100 * 10) / 10) : (paid > 0 ? 100 : 0));

                                            return (
                                                <div style={{ margin: '2px 0' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700 }}>
                                                        <span style={{ color: '#64748b' }}>Tiến độ thu:</span>
                                                        <span style={{ color: percent >= 100 ? '#16a34a' : '#d97706' }}>{percent}%</span>
                                                    </div>
                                                    <div className="hd-pay-progress">
                                                        <div 
                                                            className="hd-pay-progress-bar" 
                                                            style={{ 
                                                                width: `${percent}%`, 
                                                                background: percent >= 100 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'linear-gradient(90deg, #fbbf24, #d97706)' 
                                                            }} 
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        <div className="hd-pay-row" style={{ borderTop: '1px dashed #fecaca', paddingTop: '4px', marginTop: '2px' }}>
                                            <span style={{ fontWeight: 800, color: '#dc2626' }}>Còn lại:</span>
                                            <b style={{ fontSize: '1rem', color: '#dc2626' }}>
                                                {Math.max(0, tongTien - ((data?.thanhToan?.khachHangDaThanhToan || 0) + (Number(khachThanhToanTruoc) || 0))).toLocaleString("vi-VN")} đ
                                            </b>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ================= COLUMN 3: FULL ALBUM & GOOGLE DRIVE ================= */}
                            <div className="hd-bento-col">
                                {/* Thẻ 1: Đường dẫn Drive & Đồng bộ hình ảnh */}
                                <div className="hd-card">
                                    <div className="hd-card-head">
                                        <h3 className="hd-card-title">
                                            <span>🔗</span> Đường dẫn Drive & Đồng bộ hình ảnh (Hỗ trợ cả khi HĐ Hoàn thành)
                                        </h3>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {/* Field 1: Ảnh gốc */}
                                        <div className="hd-form-group" style={{ marginBottom: 0 }}>
                                            <label className="hd-form-label">Đường dẫn ảnh gốc (Google Drive / Photos)</label>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <input
                                                    className="hd-input-text"
                                                    value={linkAnhGoc}
                                                    onChange={(e) => setLinkAnhGoc(e.target.value)}
                                                    placeholder="https://drive.google.com/drive/folders/..."
                                                    style={{ flex: 1 }}
                                                />
                                                <Button
                                                    variant="contained"
                                                    disabled={isSyncingAlbum || !linkAnhGoc}
                                                    onClick={() => handleSyncAlbum(linkAnhGoc, 'goc')}
                                                    sx={{
                                                        backgroundColor: '#1976d2',
                                                        whiteSpace: 'nowrap',
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        fontSize: '0.78rem',
                                                        height: '34px',
                                                        borderRadius: '6px',
                                                        px: 1.5,
                                                        '&:hover': { backgroundColor: '#1565c0' }
                                                    }}
                                                >
                                                    {isSyncingAlbum ? "Đang đồng bộ..." : "Đồng bộ ảnh gốc"}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Field 2: Ảnh chỉnh sửa */}
                                        <div className="hd-form-group" style={{ marginBottom: 0 }}>
                                            <label className="hd-form-label">Đường dẫn ảnh chỉnh sửa (Google Drive / Photos)</label>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <input
                                                    className="hd-input-text"
                                                    value={linkAnhChinhSua}
                                                    onChange={(e) => setLinkAnhChinhSua(e.target.value)}
                                                    placeholder="https://drive.google.com/drive/folders/..."
                                                    style={{ flex: 1 }}
                                                />
                                                <Button
                                                    variant="contained"
                                                    disabled={isSyncingAlbumChinhSua || !linkAnhChinhSua}
                                                    onClick={() => handleSyncAlbum(linkAnhChinhSua, 'chinhSua')}
                                                    sx={{
                                                        backgroundColor: '#7b1fa2',
                                                        whiteSpace: 'nowrap',
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        fontSize: '0.78rem',
                                                        height: '34px',
                                                        borderRadius: '6px',
                                                        px: 1.5,
                                                        '&:hover': { backgroundColor: '#6a1b9a' }
                                                    }}
                                                >
                                                    {isSyncingAlbumChinhSua ? "Đang đồng bộ..." : "Đồng bộ ảnh C.Sửa"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Thẻ 2: Album Khách Hàng Chọn Ảnh */}
                                <div className="hd-card">
                                    <div className="hd-card-head">
                                        <h3 className="hd-card-title">
                                            <span>📷</span> Album Khách Hàng Chọn Ảnh
                                        </h3>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => setOpenAlbumDetailDialog(true)}
                                                sx={{
                                                    backgroundColor: '#1976d2',
                                                    textTransform: 'none',
                                                    fontWeight: 700,
                                                    fontSize: '0.74rem',
                                                    padding: '3px 10px',
                                                    minHeight: '28px',
                                                    borderRadius: '6px',
                                                    '&:hover': { backgroundColor: '#1565c0' }
                                                }}
                                            >
                                                🖼️ Xem Ảnh
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => setOpenLocAnhDialog(true)}
                                                sx={{
                                                    color: '#7b1fa2',
                                                    borderColor: '#7b1fa2',
                                                    textTransform: 'none',
                                                    fontWeight: 700,
                                                    fontSize: '0.74rem',
                                                    padding: '3px 10px',
                                                    minHeight: '28px',
                                                    borderRadius: '6px',
                                                    '&:hover': { borderColor: '#6a1b9a', backgroundColor: 'rgba(123, 31, 162, 0.04)' }
                                                }}
                                            >
                                                💻 Lọc Ảnh
                                            </Button>
                                        </div>
                                    </div>

                                    {/* 4 Thẻ KPI Stats */}
                                    <div className="hd-album-stat-grid">
                                        <div className="hd-album-stat-box">
                                            <div className="hd-album-stat-title">ẢNH GỐC & TIM</div>
                                            <div className="hd-album-stat-val">
                                                {albumData?.danhSachAnh?.length || 0}
                                                <span style={{ color: '#ef4444', marginLeft: '6px', fontSize: '0.95rem' }}>
                                                    ❤️ {albumData?.danhSachAnh?.filter(a => a.isHearted).length || 0}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="hd-album-stat-box">
                                            <div className="hd-album-stat-title">ẢNH CHỈNH SỬA</div>
                                            <div className="hd-album-stat-val">
                                                {albumData?.danhSachAnhChinhSua?.length || 0}
                                            </div>
                                        </div>

                                        <div className="hd-album-stat-box">
                                            <div className="hd-album-stat-title">ĐỒNG BỘ ẢNH GỐC</div>
                                            <div style={{ marginTop: '2px' }}>
                                                <span className={`hd-album-stat-badge ${albumData?.trangThai === 'Hoàn thành' ? 'success' : 'pending'}`}>
                                                    {albumData?.trangThai || 'Chưa đồng bộ'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="hd-album-stat-box">
                                            <div className="hd-album-stat-title">ĐỒNG BỘ ẢNH C.SỬA</div>
                                            <div style={{ marginTop: '2px' }}>
                                                {(() => {
                                                    const isCompleted = albumData?.trangThaiChinhSua === 'Hoàn thành' || (albumData?.danhSachAnhChinhSua?.length > 0);
                                                    return (
                                                        <span className={`hd-album-stat-badge ${isCompleted ? 'success' : 'pending'}`}>
                                                            {albumData?.trangThaiChinhSua || (albumData?.danhSachAnhChinhSua?.length > 0 ? 'Hoàn thành' : 'Chưa đồng bộ')}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cài đặt chọn ảnh cho khách hàng */}
                                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', background: '#fafbfc' }}>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span>⚙️</span> Cài đặt chọn ảnh cho khách hàng
                                        </div>

                                        {/* Links Group */}
                                        {(() => {
                                            const customerUser = phoneKH1 || facebookKH1 || phoneKH2 || facebookKH2 || "";
                                            const loginUrl = getClientLoginUrl(customerUser);
                                            const shareCode = albumData?.shareLink;
                                            const sharedWebUrl = getSharedAlbumUrl(shareCode);

                                            return (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                                                    {/* Link 1: Đăng nhập */}
                                                    <div className="hd-album-link-card client">
                                                        <div className="hd-album-link-head">
                                                            <span style={{ color: '#1e293b' }}>🔑 Link đăng nhập khách hàng (Điền sẵn tài khoản)</span>
                                                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                                                                Tài khoản: <b style={{ color: '#0f172a' }}>{customerUser || "Chưa có"}</b>
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                            <input
                                                                className="hd-input-text"
                                                                readOnly
                                                                value={customerUser ? loginUrl : "Chưa có SĐT/FB để tạo link"}
                                                                style={{ fontSize: '0.76rem', background: '#ffffff' }}
                                                            />
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                disabled={!customerUser}
                                                                title="Sao chép link đăng nhập"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(loginUrl);
                                                                    toast.success("Đã sao chép link đăng nhập!");
                                                                }}
                                                                sx={{
                                                                    backgroundColor: '#1976d2',
                                                                    minWidth: '36px',
                                                                    width: '36px',
                                                                    height: '32px',
                                                                    p: 0,
                                                                    borderRadius: '6px',
                                                                    fontSize: '0.9rem',
                                                                    '&:hover': { backgroundColor: '#1565c0' }
                                                                }}
                                                            >
                                                                📋
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                disabled={!customerUser}
                                                                title="Mở link đăng nhập"
                                                                onClick={() => window.open(loginUrl, '_blank')}
                                                                sx={{
                                                                    borderColor: '#1976d2',
                                                                    color: '#1976d2',
                                                                    minWidth: '36px',
                                                                    width: '36px',
                                                                    height: '32px',
                                                                    p: 0,
                                                                    borderRadius: '6px',
                                                                    fontSize: '0.9rem',
                                                                    '&:hover': { borderColor: '#1565c0', backgroundColor: 'rgba(25, 118, 210, 0.04)' }
                                                                }}
                                                            >
                                                                🌐
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Link 2: Chia sẻ Album Web */}
                                                    <div className="hd-album-link-card shared">
                                                        <div className="hd-album-link-head">
                                                            <span style={{ color: '#166534' }}>✨ Link chia sẻ Album ảnh chỉnh sửa trên Web</span>
                                                            <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600 }}>
                                                                Mã chia sẻ: <b style={{ color: '#166534' }}>{shareCode || "Chưa tạo"}</b>
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                            <input
                                                                className="hd-input-text"
                                                                readOnly
                                                                value={shareCode ? sharedWebUrl : "Cần đồng bộ để tạo mã chia sẻ"}
                                                                style={{ fontSize: '0.76rem', background: '#ffffff', color: '#166534' }}
                                                            />
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                color="success"
                                                                disabled={!shareCode}
                                                                title="Sao chép link album chia sẻ"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(sharedWebUrl);
                                                                    toast.success("Đã sao chép link album chia sẻ!");
                                                                }}
                                                                sx={{
                                                                    minWidth: '36px',
                                                                    width: '36px',
                                                                    height: '32px',
                                                                    p: 0,
                                                                    borderRadius: '6px',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                            >
                                                                📋
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                color="success"
                                                                disabled={!shareCode}
                                                                title="Mở link album chia sẻ"
                                                                onClick={() => window.open(sharedWebUrl, '_blank')}
                                                                sx={{
                                                                    minWidth: '36px',
                                                                    width: '36px',
                                                                    height: '32px',
                                                                    p: 0,
                                                                    borderRadius: '6px',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                            >
                                                                🌐
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Switches Section */}
                                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                                            {/* Switch 1: Giới hạn số lượng ảnh */}
                                            <div className="hd-album-switch-row">
                                                <div className="hd-album-switch-info">
                                                    <span className="hd-album-switch-title">Giới hạn số lượng ảnh</span>
                                                    <span className="hd-album-switch-desc">Yêu cầu khách hàng chọn tối đa số ảnh quy định</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {coGioiHanAnh && (
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            className="hd-input-text"
                                                            value={soLuongAnhGioiHan}
                                                            onChange={(e) => setSoLuongAnhGioiHan(e.target.value)}
                                                            style={{ width: '70px', padding: '4px 6px', fontSize: '0.78rem' }}
                                                        />
                                                    )}
                                                    <Switch checked={coGioiHanAnh} onChange={(e) => setCoGioiHanAnh(e.target.checked)} size="small" />
                                                </div>
                                            </div>

                                            {/* Switch 2: Khóa album */}
                                            <div className="hd-album-switch-row">
                                                <div className="hd-album-switch-info">
                                                    <span className="hd-album-switch-title">Khóa album</span>
                                                    <span className="hd-album-switch-desc">Đánh dấu khách hàng đã hoàn thành việc chọn ảnh</span>
                                                </div>
                                                <Switch checked={khachHangXacNhan} onChange={(e) => setKhachHangXacNhan(e.target.checked)} color="success" size="small" />
                                            </div>

                                            {/* Switch 3: Bộ sưu tập đặc biệt */}
                                            <div className="hd-album-switch-row">
                                                <div className="hd-album-switch-info">
                                                    <span className="hd-album-switch-title">Bộ sưu tập đặc biệt</span>
                                                    <span className="hd-album-switch-desc">Hiển thị hình ảnh album này lên trang chủ & trang bộ sưu tập</span>
                                                </div>
                                                <Switch checked={isSpecialCollection} onChange={(e) => setIsSpecialCollection(e.target.checked)} color="info" size="small" />
                                            </div>
                                        </div>

                                        {/* Input Concept / Chủ đề */}
                                        <div className="hd-form-group" style={{ marginBottom: '12px' }}>
                                            <label className="hd-form-label">Chủ đề / Concept của Album</label>
                                            <input
                                                className="hd-input-text"
                                                value={chuDe}
                                                onChange={(e) => setChuDe(e.target.value)}
                                                placeholder="Ví dụ: Concept Studio nhẹ nhàng, Concept Cổ phục Hàn Quốc, ..."
                                                style={{ background: '#ffffff' }}
                                            />
                                        </div>

                                        {/* Save Button */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="contained"
                                                onClick={handleSaveAlbumSettings}
                                                sx={{
                                                    backgroundColor: '#b8962e',
                                                    color: '#ffffff',
                                                    fontWeight: 800,
                                                    fontSize: '0.82rem',
                                                    textTransform: 'none',
                                                    borderRadius: '6px',
                                                    px: 2.5,
                                                    py: 0.8,
                                                    boxShadow: '0 2px 8px rgba(184, 150, 46, 0.3)',
                                                    '&:hover': { backgroundColor: '#a17e20' }
                                                }}
                                            >
                                                Lưu cài đặt
                                            </Button>
                                        </div>

                                        {/* Print Photo List (if any) */}
                                        {danhSachAnhIn && danhSachAnhIn.length > 0 && (
                                            <div style={{ marginTop: '14px', borderTop: '1px dashed #e2e8f0', paddingTop: '10px' }}>
                                                <label className="hd-form-label" style={{ marginBottom: '6px' }}>🖨️ Danh sách ảnh in đã chọn:</label>
                                                <div className="hd-table-wrap" style={{ maxHeight: '140px', marginBottom: 0 }}>
                                                    <table className="hd-table-compact">
                                                        <thead>
                                                            <tr>
                                                                <th>STT</th>
                                                                <th>Kích thước</th>
                                                                <th style={{ textAlign: "right" }}>Số lượng</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {danhSachAnhIn.map((item, idx) => (
                                                                <tr key={idx}>
                                                                    <td>{idx + 1}</td>
                                                                    <td style={{ fontWeight: 600 }}>{item.kichThuoc}</td>
                                                                    <td style={{ textAlign: "right", fontWeight: 700, color: '#0284c7' }}>{item.soLuong}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== 3. COMPACT FIXED BOTTOM ACTION BAR ===== */}
                    <div className="hd-compact-footer">
                        <Button
                            onClick={() => {
                                setDeleteConfirmInput("");
                                setOpenDeleteDialog(true);
                            }}
                            variant="outlined"
                            color="error"
                            size="small"
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                borderRadius: '6px',
                                px: 1.5,
                                height: '32px'
                            }}
                        >
                            🗑️ Xóa Hợp Đồng
                        </Button>

                        <div className="hd-footer-actions-right">
                            <Button
                                onClick={handleClose}
                                variant="outlined"
                                color="inherit"
                                size="small"
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.78rem',
                                    borderRadius: '6px',
                                    px: 1.5,
                                    height: '32px'
                                }}
                            >
                                Thoát
                            </Button>

                            <Button
                                onClick={handlePrintHopDong}
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<FontAwesomeIcon icon={faPrint} style={{ fontSize: '0.7rem' }} />}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    borderRadius: '6px',
                                    px: 1.5,
                                    height: '32px'
                                }}
                            >
                                In Hợp Đồng
                            </Button>

                            <Button
                                onClick={() => setOpenPaymentDialog(true)}
                                variant="contained"
                                color="warning"
                                size="small"
                                startIcon={<FontAwesomeIcon icon={faCreditCard} style={{ fontSize: '0.7rem' }} />}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    borderRadius: '6px',
                                    px: 1.5,
                                    height: '32px'
                                }}
                            >
                                Thanh Toán
                            </Button>

                            <Button
                                onClick={() => onUpdateHopDong()}
                                variant="contained"
                                size="small"
                                sx={{
                                    background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                                    color: '#ffffff',
                                    fontWeight: 800,
                                    fontSize: '0.82rem',
                                    textTransform: 'none',
                                    borderRadius: '6px',
                                    px: 2.5,
                                    height: '32px',
                                    boxShadow: '0 2px 10px rgba(212, 175, 55, 0.4)',
                                    '&:hover': { background: '#a17e20' }
                                }}
                            >
                                💾 Lưu & Cập Nhật HĐ
                            </Button>
                        </div>
                    </div>
                </div>
            </Dialog>

                {/* Dialog nhập liệu thông tin tiến trình */}
                <Dialog open={openProgressInput} onClose={() => setOpenProgressInput(false)} maxWidth="sm" fullWidth>
                    <div style={{ padding: '24px', fontFamily: "'Inter', 'Plus Jakarta Sans', -apple-system, Roboto, sans-serif" }}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#1976d2', borderBottom: '1px solid #eee', paddingBottom: '8px', fontWeight: 700 }}>
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

                        {(() => {
                            const daThanhToanVal = Number(data?.thanhToan?.khachHangDaThanhToan) || 0;
                            const cacLuotVal = data?.thanhToan?.cacLuotThanhToan || [];
                            const hasPayments = daThanhToanVal > 0 || (Array.isArray(cacLuotVal) && cacLuotVal.length > 0);
                            const isRenting = ["Đang mượn", "Đang thuê", "Đang cho thuê"].includes(data?.soanDo?.trangThai);

                            if (hasPayments) {
                                return (
                                    <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', marginBottom: '16px', textAlign: 'left', fontSize: '0.9rem' }}>
                                        <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i>
                                        <strong>Không thể xóa hợp đồng:</strong> Hợp đồng đã có phát sinh thanh toán (<strong>{daThanhToanVal > 0 ? daThanhToanVal.toLocaleString('vi-VN') + ' đ' : 'có lịch sử thanh toán'}</strong>). Vui lòng kiểm tra lại.
                                    </div>
                                );
                            }

                            if (isRenting) {
                                return (
                                    <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', marginBottom: '16px', textAlign: 'left', fontSize: '0.9rem' }}>
                                        <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i>
                                        <strong>Không thể xóa hợp đồng:</strong> Đang có phiếu thuê/mượn đồ ở trạng thái đang cho thuê/mượn (<strong>{data?.soanDo?.trangThai}</strong>).
                                    </div>
                                );
                            }

                            return null;
                        })()}

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
                            {(() => {
                                const daThanhToanVal = Number(data?.thanhToan?.khachHangDaThanhToan) || 0;
                                const cacLuotVal = data?.thanhToan?.cacLuotThanhToan || [];
                                const hasPayments = daThanhToanVal > 0 || (Array.isArray(cacLuotVal) && cacLuotVal.length > 0);
                                const isRenting = ["Đang mượn", "Đang thuê", "Đang cho thuê"].includes(data?.soanDo?.trangThai);
                                const isBlocked = hasPayments || isRenting;

                                return (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        disabled={deleteConfirmInput !== maHopDong || isBlocked}
                                        onClick={handleDeleteHopDong}
                                    >
                                        Xác nhận xóa
                                    </Button>
                                );
                            })()}
                        </div>
                    </div>
                </Dialog>

                {/* Dialog Thanh toán VietQR SePay Webhook */}
                <SePayDialog
                    open={openPaymentDialog}
                    onClose={() => setOpenPaymentDialog(false)}
                    data={data}
                    maHopDong={maHopDong}
                    defaultAmount={Math.max(0, tongTien - ((data?.thanhToan?.khachHangDaThanhToan || 0) + (Number(khachThanhToanTruoc) || 0)))}
                    onSuccess={(updatedData) => {
                        setHasUpdated(true);
                        if (updatedData?.latestPayment && data) {
                            if (!data.thanhToan) data.thanhToan = {};
                            if (!data.thanhToan.cacLuotThanhToan) data.thanhToan.cacLuotThanhToan = [];
                            const exists = data.thanhToan.cacLuotThanhToan.some(p => p.id === updatedData.latestPayment.id);
                            if (!exists) {
                                data.thanhToan.cacLuotThanhToan.push(updatedData.latestPayment);
                            }
                            if (updatedData.khachHangDaThanhToan !== undefined) {
                                data.thanhToan.khachHangDaThanhToan = updatedData.khachHangDaThanhToan;
                                data.thanhToan.conLai = updatedData.conLai;
                            } else {
                                const addedAmt = Number(updatedData.latestPayment.amount) || 0;
                                data.thanhToan.khachHangDaThanhToan = (data.thanhToan.khachHangDaThanhToan || 0) + addedAmt;
                                data.thanhToan.conLai = Math.max(0, (tongTien || 0) - data.thanhToan.khachHangDaThanhToan);
                            }
                        }
                    }}
                />



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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', padding: '10px 0' }}>
                            {albumData.danhSachAnh?.map((item) => (
                                <Card
                                    key={item.idDrive}
                                    sx={{
                                        borderRadius: '14px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                        border: item.isHearted ? '2px solid #ef4444' : '1px solid #e2e8f0',
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                                        }
                                    }}
                                >
                                    <div style={{ position: 'relative', paddingTop: '115%', backgroundColor: '#f1f5f9' }}>
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
                                                top: 8,
                                                left: 8,
                                                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                                                color: '#fff',
                                                zIndex: 5,
                                                width: '28px',
                                                height: '28px'
                                            }}
                                            title="Tải ảnh này về máy"
                                        >
                                            <FontAwesomeIcon icon={faDownload} size="xs" />
                                        </IconButton>
                                        <img
                                            src={`${item.urlNen}`}
                                            alt={item.tenFile}
                                            loading="lazy"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                        />
                                        {item.isHearted && (
                                            <div style={{ position: 'absolute', top: 8, right: 8, color: '#ef4444', fontSize: '20px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', zIndex: 5 }}>
                                                <FontAwesomeIcon icon={faHeart} />
                                            </div>
                                        )}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '24px 10px 8px',
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
                                            color: 'white',
                                            fontSize: '0.78rem',
                                            fontWeight: '600',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            textAlign: 'left'
                                        }}>
                                            {item.tenFile}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                    {albumData && albumDetailTab === 1 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', padding: '10px 0' }}>
                            {albumData.danhSachAnh?.filter(a => a.isHearted || (a.comments && a.comments.length > 0)).map((anh, index) => (
                                <Card
                                    key={index}
                                    sx={{
                                        borderRadius: '14px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                                        }
                                    }}
                                >
                                    <div style={{ position: 'relative', paddingTop: '100%', backgroundColor: '#f1f5f9' }}>
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
                                                top: 8,
                                                left: 8,
                                                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                                                color: '#fff',
                                                zIndex: 5,
                                                width: '28px',
                                                height: '28px'
                                            }}
                                            title="Tải ảnh này về máy"
                                        >
                                            <FontAwesomeIcon icon={faDownload} size="xs" />
                                        </IconButton>
                                        <img
                                            src={`${anh.urlNen}`}
                                            alt={anh.tenFile}
                                            loading="lazy"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                        />
                                        {anh.isHearted && (
                                            <div style={{ position: 'absolute', top: 8, right: 8, color: '#ef4444', fontSize: '20px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', zIndex: 5 }}>
                                                <FontAwesomeIcon icon={faHeart} />
                                            </div>
                                        )}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '24px 10px 8px',
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
                                            color: 'white',
                                            fontSize: '0.78rem',
                                            fontWeight: '600',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            textAlign: 'left'
                                        }}>
                                            {anh.tenFile}
                                        </div>
                                    </div>
                                    {anh.comments && anh.comments.length > 0 && (
                                        <CardContent style={{ padding: '10px 12px', flex: 1, backgroundColor: '#f8fafc' }}>
                                            <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <Typography variant="caption" fontWeight="bold" style={{ color: '#0284c7', fontSize: '0.75rem' }}>💬 Bình luận KH:</Typography>
                                                {anh.comments.map((cmt, idx) => (
                                                    <Typography key={idx} variant="body2" style={{ marginTop: '2px', fontStyle: 'italic', fontSize: '0.78rem', color: '#334155' }}>- {cmt.noiDung}</Typography>
                                                ))}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                            {albumData.danhSachAnh?.filter(a => a.isHearted || (a.comments && a.comments.length > 0)).length === 0 && (
                                <Typography variant="body1" style={{ padding: '20px', gridColumn: '1 / -1', textAlign: 'center', color: '#64748b' }}>Khách hàng chưa chọn hoặc bình luận ảnh nào.</Typography>
                            )}
                        </div>
                    )}
                    {albumData && albumDetailTab === 2 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', padding: '10px 0' }}>
                            {albumData.danhSachAnhChinhSua?.map((anh, index) => (
                                <Card
                                    key={index}
                                    sx={{
                                        borderRadius: '14px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                                        }
                                    }}
                                >
                                    <div style={{ position: 'relative', paddingTop: '100%', backgroundColor: '#f1f5f9' }}>
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
                                                top: 8,
                                                left: 8,
                                                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                                                color: '#fff',
                                                zIndex: 5,
                                                width: '28px',
                                                height: '28px'
                                            }}
                                            title="Tải ảnh này về máy"
                                        >
                                            <FontAwesomeIcon icon={faDownload} size="xs" />
                                        </IconButton>
                                        <img
                                            src={`${anh.urlNen}`}
                                            alt={anh.tenFile}
                                            loading="lazy"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                        />
                                        {anh.isHearted && (
                                            <div style={{ position: 'absolute', top: 8, right: 8, color: '#ef4444', fontSize: '20px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', zIndex: 5 }}>
                                                <FontAwesomeIcon icon={faHeart} />
                                            </div>
                                        )}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '24px 10px 8px',
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
                                            color: 'white',
                                            fontSize: '0.78rem',
                                            fontWeight: '600',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            textAlign: 'left'
                                        }}>
                                            {anh.tenFile}
                                        </div>
                                    </div>
                                    {anh.comments && anh.comments.length > 0 && (
                                        <CardContent style={{ padding: '10px 12px', flex: 1, backgroundColor: '#f8fafc' }}>
                                            <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <Typography variant="caption" fontWeight="bold" style={{ color: '#0284c7', fontSize: '0.75rem' }}>💬 Bình luận KH:</Typography>
                                                {anh.comments.map((cmt, idx) => (
                                                    <Typography key={idx} variant="body2" style={{ marginTop: '2px', fontStyle: 'italic', fontSize: '0.78rem', color: '#334155' }}>- {cmt.noiDung}</Typography>
                                                ))}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                            {(!albumData.danhSachAnhChinhSua || albumData.danhSachAnhChinhSua.length === 0) && (
                                <Typography variant="body1" style={{ padding: '20px', gridColumn: '1 / -1', textAlign: 'center', color: '#64748b' }}>Chưa có ảnh chỉnh sửa nào.</Typography>
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
