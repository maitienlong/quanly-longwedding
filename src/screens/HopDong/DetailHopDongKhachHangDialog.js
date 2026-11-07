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
import { useAuth } from '../Login/AuthContext/AuthContext';
import Autocomplete from '@mui/material/Autocomplete';
import { Box, Switch, FormControlLabel, Tabs, Tab, IconButton } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import LunarDateTimePicker from '../../components/LunarDateTimePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { formatDate } from '../utils/convertDate';
import { formatLunarDateFull } from '../../utils/lunarDateUtils';
import { checkContractCompletionEligibility } from '../../utils/contractStatusHelper';
import { isMakeupItem, formatTimestampToDateTimeInput } from '../../utils/makeupHelper';
import {
    isMakeupService,
    isPhotoShootService,
    isClothingService,
    isWeddingCardService,
    syncSchedulesWithCart,
    formatDateTimeInput
} from '../../utils/contractScheduleHelper';
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
import { getContractPrintConfig, getSafePrintLogo, generateContractPrintHtml, extractContractPrintData } from '../../utils/printConfigHelper';
import { getStageSlaInfo } from '../../utils/contractStatusHelper';
import { hasPermission } from '../../utils/permissionHelper';
import SePayDialog from './SePayDialog';
// getDichVuChinhLabel is now retrieved dynamically from useContractTypes hook

function DetailHopDongKhachHangDialog(props) {
    const { onClose, data, selectedValue, open } = props;
    const { getDichVuChinhLabel, loaiHopDongOptions } = useContractTypes();
    const { user: currentUser } = useAuth();
    const canAssignCrew = useMemo(() => {
        const effectiveUser = currentUser || (() => {
            try { return JSON.parse(localStorage.getItem('user')) || {}; } catch (e) { return {}; }
        })();
        return hasPermission(effectiveUser, 'phan-cong-tho');
    }, [currentUser]);
    const isTechnician = useMemo(() => {
        if (!currentUser) return false;
        const role = (currentUser.chucVu || currentUser.vaiTro || currentUser.role || currentUser.positon || '').toLowerCase();
        const isManager = role.includes('quản lý') || role.includes('admin') || role.includes('kế toán') || role.includes('sale') || role.includes('bán hàng') || currentUser.permission === 1 || currentUser.is_admin === true || currentUser.username === 'along';
        return !isManager;
    }, [currentUser]);

    // Hậu kỳ & In ấn chi tiết
    const [danhSachMaAnhChon, setDanhSachMaAnhChon] = useState("");
    const [linkLayoutMaket, setLinkLayoutMaket] = useState("");
    const [thongTinInAn, setThongTinInAn] = useState({
        tenXuong: "",
        kichThuoc: "",
        chatLieu: "",
        ngayGuiIn: "",
        ngayHenLay: "",
        tinhTrang: "cho_in"
    });
    const [isSavingHauKy, setIsSavingHauKy] = useState(false);

    // Phụ lục phát sinh (Addon / Upsell)
    const [phuLucPhatSinh, setPhuLucPhatSinh] = useState([]);
    const [newAddonTen, setNewAddonTen] = useState("");
    const [newAddonDonGia, setNewAddonDonGia] = useState(0);
    const [newAddonSoLuong, setNewAddonSoLuong] = useState(1);
    const [newAddonGhiChu, setNewAddonGhiChu] = useState("");
    const [isAddingAddon, setIsAddingAddon] = useState(false);

    // Trang phục giữ
    const [trangPhucGiu, setTrangPhucGiu] = useState([]);
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
    const [subGiaiDoan, setSubGiaiDoan] = useState('dang_thuc_hien');
    const [lichSuGiaiDoan, setLichSuGiaiDoan] = useState([]);
    const [khachHangXacNhanAnh, setKhachHangXacNhanAnh] = useState(null);
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
    const [serviceSchedules, setServiceSchedules] = useState([]);

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

    // state cho giảm giá & voucher
    const [giamGia, setGiamGia] = useState(0);
    const [loaiGiamGia, setLoaiGiamGia] = useState(0); // "VND" hoặc "%"
    const [voucherCode, setVoucherCode] = useState("");
    const [voucherGiamGia, setVoucherGiamGia] = useState(0);
    const [voucherId, setVoucherId] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
    const [openSepayDialog, setOpenSepayDialog] = useState(false);
    const [openClientPortalModal, setOpenClientPortalModal] = useState(false);

    // Audit Log & Change Detection States
    const [auditLog, setAuditLog] = useState([]);
    const [initialSnapshot, setInitialSnapshot] = useState(null);
    const [openConfirmSaveDialog, setOpenConfirmSaveDialog] = useState(false);
    const [pendingChanges, setPendingChanges] = useState([]);
    const [openHistoryModal, setOpenHistoryModal] = useState(false);
    const [historyActiveTab, setHistoryActiveTab] = useState('audit'); // 'audit' | 'stage'
    const [historySearchKeyword, setHistorySearchKeyword] = useState('');

    // Context menu cho dòng giỏ hàng dịch vụ & Highlight lịch vừa tạo
    const [serviceContextMenu, setServiceContextMenu] = useState(null);
    const [highlightedScheduleId, setHighlightedScheduleId] = useState(null);

    // State cho các đường dẫn Drive bổ sung
    const [extraDriveLinks, setExtraDriveLinks] = useState([]);
    const [isSavingDriveLinks, setIsSavingDriveLinks] = useState(false);

    // Chiều cao giỏ hàng có thể điều chỉnh
    const [cartHeight, setCartHeight] = useState(() => {
        const saved = localStorage.getItem('hd_cart_table_height');
        return saved ? Math.max(140, Math.min(900, parseInt(saved, 10))) : 260;
    });
    const [isDraggingCart, setIsDraggingCart] = useState(false);

    const handleStartResizeCart = (e) => {
        e.preventDefault();
        setIsDraggingCart(true);
        const startY = e.clientY;
        const startH = cartHeight;

        const onMouseMove = (moveEvent) => {
            const delta = moveEvent.clientY - startY;
            const newH = Math.min(900, Math.max(140, startH + delta));
            setCartHeight(newH);
        };

        const onMouseUp = (upEvent) => {
            setIsDraggingCart(false);
            const delta = upEvent.clientY - startY;
            const finalH = Math.min(900, Math.max(140, startH + delta));
            setCartHeight(finalH);
            try {
                localStorage.setItem('hd_cart_table_height', finalH.toString());
            } catch (err) {}
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const isPreWContract = Number(dichVuChinh) === 1 || 
        (getDichVuChinhLabel ? getDichVuChinhLabel(dichVuChinh) : '').toLowerCase().includes('pre-wedding') ||
        (getDichVuChinhLabel ? getDichVuChinhLabel(dichVuChinh) : '').toLowerCase().includes('pre wedding') ||
        Boolean(ngayAnHoi) || 
        Boolean(ngayCuoi) ||
        Boolean(data?.cacNgay?.ngayAnHoi) ||
        Boolean(data?.cacNgay?.ngayCuoi);

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

            const rawGioHang = data.gioHang || [];
            const enrichedGioHang = rawGioHang.map((item, idx) => {
                const sId = item.dichVu?._id || item.dichVu || item._id || item.maDichVu;
                let defaultTurns = Number(item.soLuot) || Number(item.soLuong) || 1;

                let shootTurns = item.soLuongLichChup !== undefined ? Number(item.soLuongLichChup) : (isPhotoShootService(item) ? 1 : 0);
                let makeTurns = item.soLuongLichMake !== undefined ? Number(item.soLuongLichMake) : (isMakeupService(item) ? 1 : 0);

                const matchingLichTrangDiem = (data.lichTrangDiem || []).filter(l => 
                    (l.dichVuId && String(l.dichVuId) === String(sId)) ||
                    (l.tenDichVu && (l.tenDichVu.includes(item.tenDichVuSnapshot || item.tenDichVu || '')))
                );
                if (matchingLichTrangDiem.length > 0 && item.soLuongLichMake === undefined) {
                    makeTurns = matchingLichTrangDiem.length;
                }

                const matchingLichChup = (data.lichChup || []).filter(l => 
                    (l.dichVuId && String(l.dichVuId) === String(sId)) ||
                    (l.tenDichVu && (l.tenDichVu.includes(item.tenDichVuSnapshot || item.tenDichVu || '')))
                );
                if (matchingLichChup.length > 0 && item.soLuongLichChup === undefined) {
                    shootTurns = matchingLichChup.length;
                }

                const matchedSchedule = matchingLichTrangDiem[0];
                const isCard = isWeddingCardService(item);
                const enrichedItem = {
                    ...item,
                    soLuot: defaultTurns,
                    soLuongLichChup: shootTurns,
                    soLuongLichMake: makeTurns,
                    ngayTrangDiem: item.ngayTrangDiem || matchedSchedule?.ngayTrangDiem || (data.cacNgay?.ngayTrangDiem ? new Date(data.cacNgay.ngayTrangDiem).toISOString() : ''),
                    gioTrangDiem: item.gioTrangDiem || matchedSchedule?.gioTrangDiem || data.cacNgay?.gioTrangDiem || '',
                    diaDiemTrangDiem: item.diaDiemTrangDiem || matchedSchedule?.diaDiem || data.cacNgay?.diaDiemTrangDiem || '',
                    thoMakeUp: item.thoMakeUp || matchedSchedule?.thoMakeUp || data.nguoiPhucVu?.thoMakeUp || '',
                    ghiChuTrangDiem: item.ghiChuTrangDiem || matchedSchedule?.ghiChu || '',
                };
                if (isCard) {
                    enrichedItem.maLoaiThiep = item.maLoaiThiep || "";
                    enrichedItem.tenLoaiThiep = item.tenLoaiThiep || "";
                    enrichedItem.isThiep = true;
                } else {
                    delete enrichedItem.maLoaiThiep;
                    delete enrichedItem.tenLoaiThiep;
                    delete enrichedItem.isThiep;
                }
                return enrichedItem;
            });

            // Reconstruct initialSchedules
            const loadedSchedules = [];
            if (Array.isArray(data.lichTrangDiem) && data.lichTrangDiem.length > 0) {
                data.lichTrangDiem.forEach((mk, idx) => {
                    loadedSchedules.push({
                        id: mk.id || `sch-mk-${idx}-${Date.now()}`,
                        serviceId: mk.dichVuId || 'LEGACY_MAKEUP',
                        serviceName: mk.tenDichVu || 'Dịch vụ Trang Điểm',
                        serviceType: 'makeup',
                        luot: idx + 1,
                        totalLuot: data.lichTrangDiem.length,
                        ngayGio: formatDateTimeInput(mk.ngayTrangDiem || mk.ngay),
                        diaDiem: mk.diaDiem || data.cacNgay?.diaDiemTrangDiem || 'Tại Studio',
                        nhanVien: mk.thoMakeUp || data.nguoiPhucVu?.thoMakeUp || '',
                        ghiChu: mk.ghiChu || ''
                    });
                });
            } else if (data.cacNgay?.ngayTrangDiem || data.nguoiPhucVu?.thoMakeUp) {
                loadedSchedules.push({
                    id: `sch-mk-legacy-${Date.now()}`,
                    serviceId: 'LEGACY_MAKEUP',
                    serviceName: 'Lịch Trang Điểm (Hợp Đồng)',
                    serviceType: 'makeup',
                    luot: 1,
                    totalLuot: 1,
                    ngayGio: formatDateTimeInput(data.cacNgay?.ngayTrangDiem),
                    diaDiem: data.cacNgay?.diaDiemTrangDiem || 'Tại Studio',
                    nhanVien: data.nguoiPhucVu?.thoMakeUp || '',
                    ghiChu: ''
                });
            }

            if (Array.isArray(data.lichChup) && data.lichChup.length > 0) {
                data.lichChup.forEach((lc, idx) => {
                    loadedSchedules.push({
                        id: lc.id || `sch-photo-${idx}-${Date.now()}`,
                        serviceId: lc.dichVuId || 'LEGACY_SHOOT',
                        serviceName: lc.tenDichVu || 'Lịch Chụp Ảnh',
                        serviceType: 'photo',
                        luot: idx + 1,
                        totalLuot: data.lichChup.length,
                        ngayGio: formatDateTimeInput(lc.ngayGio || lc.ngayChup),
                        diaDiem: lc.diaDiem || lc.diaDiemChup || data.cacNgay?.diaDiemChup || 'Tại Studio',
                        nhanVien: lc.nhanVien || lc.thoChupHinh || data.nguoiPhucVu?.thoChupHinh || '',
                        ghiChu: lc.ghiChu || ''
                    });
                });
            } else if (data.cacNgay?.ngayChup || data.nguoiPhucVu?.thoChupHinh) {
                loadedSchedules.push({
                    id: `sch-shoot-legacy-${Date.now()}`,
                    serviceId: 'LEGACY_SHOOT',
                    serviceName: 'Lịch Chụp Ảnh (Hợp Đồng)',
                    serviceType: 'photo',
                    luot: 1,
                    totalLuot: 1,
                    ngayGio: formatDateTimeInput(data.cacNgay?.ngayChup),
                    diaDiem: data.cacNgay?.diaDiemChup || 'Tại Studio',
                    nhanVien: data.nguoiPhucVu?.thoChupHinh || '',
                    ghiChu: ''
                });
            }

            if (Array.isArray(data.lichQuayPhim) && data.lichQuayPhim.length > 0) {
                data.lichQuayPhim.forEach((lq, idx) => {
                    loadedSchedules.push({
                        id: lq.id || `sch-vid-${idx}-${Date.now()}`,
                        serviceId: lq.dichVuId || 'LEGACY_VIDEO',
                        serviceName: lq.tenDichVu || 'Lịch Quay Phim',
                        serviceType: 'video',
                        luot: idx + 1,
                        totalLuot: data.lichQuayPhim.length,
                        ngayGio: formatDateTimeInput(lq.ngayGio || lq.ngayQuay),
                        diaDiem: lq.diaDiem || data.cacNgay?.diaDiemQuayPhim || 'Tại Studio',
                        nhanVien: lq.nhanVien || lq.thoQuayPhim || data.nguoiPhucVu?.thoQuayPhim || '',
                        ghiChu: lq.ghiChu || ''
                    });
                });
            } else if (data.cacNgay?.ngayQuayPhim || data.nguoiPhucVu?.thoQuayPhim) {
                loadedSchedules.push({
                    id: `sch-vid-legacy-${Date.now()}`,
                    serviceId: 'LEGACY_VIDEO',
                    serviceName: 'Lịch Quay Phim (Hợp Đồng)',
                    serviceType: 'video',
                    luot: 1,
                    totalLuot: 1,
                    ngayGio: formatDateTimeInput(data.cacNgay?.ngayQuayPhim),
                    diaDiem: data.cacNgay?.diaDiemQuayPhim || 'Tại Studio',
                    nhanVien: data.nguoiPhucVu?.thoQuayPhim || '',
                    ghiChu: ''
                });
            }

            if (Array.isArray(data.serviceSchedules)) {
                setServiceSchedules(data.serviceSchedules);
            } else {
                setServiceSchedules(loadedSchedules);
            }
            setGioHang(enrichedGioHang);
            setGiamGia(data.thanhToan?.giamGia || 0);
            setLoaiGiamGia(data.thanhToan?.loaiGiamGia || 0);
            setVoucherCode(data.thanhToan?.voucherCode || "");
            setVoucherGiamGia(data.thanhToan?.voucherGiamGia || 0);
            setVoucherId(data.thanhToan?.voucherId || null);
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
            setSubGiaiDoan(data.subGiaiDoan || 'dang_thuc_hien');
            setLichSuGiaiDoan(data.lichSuGiaiDoan || []);
            setKhachHangXacNhanAnh(data.khachHangXacNhanAnh || null);
            setDichVuChinh(data.dichVuChinh || 0);
            setIsSpecialCollection(data.isSpecialCollection || false);
            setPhuLucPhatSinh(data.phuLucPhatSinh || []);
            setDanhSachMaAnhChon(Array.isArray(data.hauKy?.danhSachMaAnhChon) ? data.hauKy.danhSachMaAnhChon.join(', ') : (data.hauKy?.danhSachMaAnhChon || ""));
            setLinkLayoutMaket(data.hauKy?.linkLayoutMaket || "");
            setThongTinInAn(data.hauKy?.thongTinInAn || {
                tenXuong: "",
                kichThuoc: "",
                chatLieu: "",
                ngayGuiIn: "",
                ngayHenLay: "",
                tinhTrang: "cho_in"
            });
            setTrangPhucGiu(data.trangPhucGiu || []);
            setLinkAnhGoc(data.linkAnhGoc || "");
            setLinkAnhChinhSua(data.linkAnhChinhSua || "");
            setExtraDriveLinks(Array.isArray(data.extraDriveLinks) ? data.extraDriveLinks : []);
            setAuditLog(data.auditLog || []);

            const baseSchedules = (Array.isArray(data.serviceSchedules) && data.serviceSchedules.length > 0)
                ? data.serviceSchedules
                : loadedSchedules;
            setInitialSnapshot({
                dichVuChinh: Number(data.dichVuChinh) || 0,
                idKH1: data.khachHang1?._id || data.khachHang1 || "",
                idKH2: data.khachHang2?._id || data.khachHang2 || "",
                gioHang: JSON.stringify(enrichedGioHang.map(s => ({
                    id: String(s.dichVu?._id || s.dichVu || s._id || s.maDichVu || ''),
                    ten: s.tenDichVuSnapshot || s.tenDichVu || '',
                    sl: Number(s.soLuong) || 1,
                    dg: Number(s.donGia || s.giaChoThueDichVu || s.dichVu?.giaChoThueDichVu || 0),
                    gg: Number(s.giamGiaDichVu) || 0,
                    thiep: s.maLoaiThiep || ''
                }))),
                ngayChup: formatTimestampToDateTimeInput(data.cacNgay?.ngayChup) || "",
                ngayAnHoi: formatTimestampToDateTimeInput(data.cacNgay?.ngayAnHoi) || "",
                ngayCuoi: formatTimestampToDateTimeInput(data.cacNgay?.ngayCuoi) || "",
                ngayChinhAnh: formatTimestampToDateInput(data.cacNgay?.ngayChinhAnh) || "",
                ngayTraAnh: formatTimestampToDateInput(data.cacNgay?.ngayTraAnh) || "",
                diaDiemChup: (data.cacNgay?.diaDiemChup || "").trim(),
                chotLich: data.cacNgay?.chotLich || "Chưa gọi điện",
                thoChupHinh: (data.nguoiPhucVu?.thoChupHinh || "").trim(),
                thoMakeUp: (data.nguoiPhucVu?.thoMakeUp || "").trim(),
                thoChinhAnh: (data.nguoiPhucVu?.thoChinhAnh || "").trim(),
                nhanVienSale: data.nhanVienSale || "0",
                giamGia: Number(data.thanhToan?.giamGia) || 0,
                loaiGiamGia: Number(data.thanhToan?.loaiGiamGia) || 0,
                voucherCode: data.thanhToan?.voucherCode || "",
                linkAnhGoc: (data.linkAnhGoc || "").trim(),
                linkAnhChinhSua: (data.linkAnhChinhSua || "").trim(),
                extraDriveLinks: JSON.stringify(data.extraDriveLinks || []),
                serviceSchedules: JSON.stringify((baseSchedules || []).map(sch => ({
                    id: sch.id,
                    serviceName: sch.serviceName || sch.name || '',
                    serviceType: sch.serviceType || sch.type || 'photo',
                    luot: sch.luot || 1,
                    ngayGio: sch.ngayGio || '',
                    diaDiem: sch.diaDiem || '',
                    nhanVien: sch.nhanVien || '',
                    ghiChu: sch.ghiChu || ''
                }))),
                phuLucPhatSinh: JSON.stringify(data.phuLucPhatSinh || [])
            });
            if (data.maHopDong) {
                fetchAlbumData(data.maHopDong);
            }
        } else if (open) {
            setGiaiDoan(1);
            setSubGiaiDoan('dang_thuc_hien');
            setLichSuGiaiDoan([]);
            setKhachHangXacNhanAnh(null);
            setDichVuChinh(0);
            setGioHang([]);
            setGiamGia(0);
            setVoucherCode("");
            setVoucherGiamGia(0);
            setVoucherId(null);
            setKhachThanhToanTruoc(0);
            setAlbumData(null);
            setPhuLucPhatSinh([]);
            setDanhSachMaAnhChon("");
            setLinkLayoutMaket("");
            setThongTinInAn({
                tenXuong: "",
                kichThuoc: "",
                chatLieu: "",
                ngayGuiIn: "",
                ngayHenLay: "",
                tinhTrang: "cho_in"
            });
            setTrangPhucGiu([]);
            setLinkAnhGoc("");
            setLinkAnhChinhSua("");
            setExtraDriveLinks([]);
            setAuditLog([]);
            setInitialSnapshot(null);
            setPendingChanges([]);
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
            const thiepName = (p.tenLoaiThiep || '').toLowerCase();
            const thiepNameNoTone = removeVietnameseTones(p.tenLoaiThiep);

            const isThiepSearch = cleanTermNoTone.includes('thiep') || cleanTermNoTone.includes('mau thiep');
            const isThiepService = isWeddingCardService(p);

            if (isThiepSearch && isThiepService) return true;

            return name.includes(cleanTerm) || 
                   code.includes(cleanTerm) ||
                   thiepName.includes(cleanTerm) ||
                   nameNoTone.includes(cleanTermNoTone) ||
                   codeNoTone.includes(cleanTermNoTone) ||
                   thiepNameNoTone.includes(cleanTermNoTone);
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
            const shootTurns = product.soLuongLichChup !== undefined ? Number(product.soLuongLichChup) : (isPhotoShootService(product) ? 1 : 0);
            const makeTurns = product.soLuongLichMake !== undefined ? Number(product.soLuongLichMake) : (isMakeupService(product) ? 1 : 0);
            updatedGioHang = gioHang.map(item => {
                const itemId = item.dichVu?._id || item.dichVu || item._id;
                if (itemId === targetId) {
                    return {
                        dichVu: product._id,
                        tenDichVuSnapshot: product.tenDichVu,
                        maDichVu: product.maDichVu,
                        donGia: Number(product.giaChoThueDichVu || product.giaTriDichVu || product.donGia) || 0,
                        soLuong: 1,
                        soLuot: 1,
                        soLuongLichChup: shootTurns,
                        soLuongLichMake: makeTurns,
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
                        hoaCamTay: product.hoaCamTay || "",
                    detailsSnapshot: product.details ? JSON.parse(JSON.stringify(product.details)) : null,
                        detailsSnapshot: product.details ? JSON.parse(JSON.stringify(product.details)) : null
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
                const isThiep = isWeddingCardService(product);
                const shootTurns = product.soLuongLichChup !== undefined ? Number(product.soLuongLichChup) : (isPhotoShootService(product) ? 1 : 0);
                const makeTurns = product.soLuongLichMake !== undefined ? Number(product.soLuongLichMake) : (isMakeupService(product) ? 1 : 0);
                const newCartItem = {
                    dichVu: product._id,
                    tenDichVuSnapshot: product.tenDichVu,
                    maDichVu: product.maDichVu,
                    donGia: Number(product.giaChoThueDichVu || product.giaTriDichVu || product.donGia) || 0,
                    soLuong: 1,
                    soLuot: 1,
                    soLuongLichChup: shootTurns,
                    soLuongLichMake: makeTurns,
                    loaiDichVu: product.loaiDichVu || (isThiep ? 5 : 2),
                    ...(isThiep ? {
                        maLoaiThiep: product.maLoaiThiep || product.templateId || product.maDichVu,
                        tenLoaiThiep: product.tenLoaiThiep || product.tenDichVu,
                        isThiep: true
                    } : {}),
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
                    hoaCamTay: product.hoaCamTay || "",
                    detailsSnapshot: product.details ? JSON.parse(JSON.stringify(product.details)) : null
                };
                if (!isThiep) {
                    delete newCartItem.maLoaiThiep;
                    delete newCartItem.tenLoaiThiep;
                    delete newCartItem.isThiep;
                }
                updatedGioHang = [...gioHang, newCartItem];
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

    const handleMakeupScheduleChange = (index, field, value) => {
        const updatedCart = gioHang.map((sp, idx) => {
            if (idx === index) {
                return { ...sp, [field]: value };
            }
            return sp;
        });
        setGioHang(updatedCart);
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


    const handleThiepTemplateChange = (productId, templateCode, templateName) => {
        const targetIdStr = productId?.toString();
        const updatedCart = gioHang.map(sp => {
            if (getCartItemId(sp) === targetIdStr || sp.maDichVu === productId) {
                return { ...sp, maLoaiThiep: templateCode, tenLoaiThiep: templateName };
            }
            return sp;
        });
        setGioHang(updatedCart);
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
            const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.giaTriDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.dichVu?.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.dichVu?.giaTriDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
            const discountItem = parseFloat(item.giamGiaDichVu || 0);
            return sum + Math.max(0, (price * (item.soLuong || 0)) - discountItem);
        }, 0);

        let tongSauGiam = tongGoc;
        if (Number(loaiGiamGia) === 1) {
            tongSauGiam = tongGoc - (tongGoc * (giamGia / 100));
        } else {
            tongSauGiam = tongGoc - giamGia;
        }

        const vDiscount = Number(voucherGiamGia) || 0;
        if (vDiscount > 0) {
            tongSauGiam -= vDiscount;
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
        // Bỏ tự động đồng bộ lịch từ giỏ hàng - Quản trị viên thêm thủ công
        const newTotal = newCart.reduce((sum, item) => {
            const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.giaTriDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.dichVu?.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.dichVu?.giaTriDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
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
                idx === itemIdx ? { ...sp, soLuong: sp.soLuong - 1, soLuot: !isClothingService(sp) ? Math.max(1, (sp.soLuot || sp.soLuong || 1) - 1) : (sp.soLuot || 1) } : sp
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

    const handleQuantityChange = (dichVuId, targetIndex, newQty) => {
        const itemIdx = (targetIndex !== undefined && targetIndex >= 0)
            ? targetIndex
            : gioHang.findIndex(sp => getCartItemId(sp) === dichVuId?.toString());

        if (itemIdx < 0 || !gioHang[itemIdx]) return;
        const val = Math.max(1, parseInt(newQty, 10) || 1);

        const updatedCart = gioHang.map((sp, idx) =>
            idx === itemIdx ? { ...sp, soLuong: val, soLuot: !isClothingService(sp) ? val : (sp.soLuot || 1) } : sp
        );

        const newTotalSauGiam = calculateTotalWithCart(updatedCart);
        const daThanhToan = getDaThanhToan();
        if (daThanhToan > 0 && newTotalSauGiam < daThanhToan) {
            toast.error(`Tổng tiền (${newTotalSauGiam.toLocaleString('vi-VN')} đ) không thể nhỏ hơn số tiền khách đã thanh toán (${daThanhToan.toLocaleString('vi-VN')} đ)!`);
            return;
        }

        updateCartAndTotal(updatedCart);
    };

    const handleAddSchedule = (type = 'photo') => {
        let defaultName = 'Chụp ảnh';
        let defaultLocation = 'Tại Studio';
        if (type === 'makeup') {
            defaultName = 'Trang điểm';
            defaultLocation = 'Tại Studio';
        } else if (type === 'video') {
            defaultName = 'Quay phim';
            defaultLocation = 'Tại Studio';
        } else if (type === 'bts') {
            defaultName = 'Quay / Chụp hậu trường';
            defaultLocation = 'Tại Studio';
        } else if (type === 'cskh') {
            defaultName = 'Chăm sóc khách hàng';
            defaultLocation = 'Tại Studio';
        } else if (type === 'support') {
            defaultName = 'Hỗ trợ ekip';
            defaultLocation = 'Tại Studio';
        } else if (type === 'cskh') {
            defaultName = 'Chăm sóc khách hàng';
            defaultLocation = 'Tại Studio';
        } else if (type === 'support') {
            defaultName = 'Hỗ trợ ekip';
            defaultLocation = 'Tại Studio';
        }

        const existingSameType = (serviceSchedules || []).filter(s => s.serviceType === type);
        const newTurn = existingSameType.length + 1;

        const newSchedule = {
            id: `sch-${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            serviceId: `MANUAL_${type.toUpperCase()}_${Date.now()}`,
            serviceName: `${defaultName} ${newTurn > 1 ? `(Lượt ${newTurn})` : ''}`.trim(),
            serviceType: type,
            luot: newTurn,
            totalLuot: newTurn,
            ngayGio: '',
            diaDiem: defaultLocation,
            nhanVien: '',
            ghiChu: ''
        };

        setServiceSchedules(prev => [...(prev || []), newSchedule]);
        toast.success(`Đã thêm nhiệm vụ: ${defaultName}`);
    };

    // Chuột phải vào dòng giỏ hàng dịch vụ
    const handleCartRowContextMenu = (e, item) => {
        e.preventDefault();
        setServiceContextMenu({
            mouseX: e.clientX,
            mouseY: e.clientY,
            item: item
        });
    };

    // Thêm lịch phân công nhiệm vụ gắn với gói dịch vụ cụ thể
    const handleAddScheduleFromItem = (item, type = 'photo') => {
        setServiceContextMenu(null);
        if (!item) return;

        const typeLabels = {
            photo: 'Chụp ảnh',
            makeup: 'Trang điểm',
            video: 'Quay phim',
            bts: 'Hậu trường',
            cskh: 'Chăm sóc KH',
            support: 'Hỗ trợ'
        };

        const defaultLocations = {
            photo: 'Tại Studio',
            makeup: 'Tại Studio',
            video: 'Tại Studio',
            bts: 'Tại Studio',
            cskh: 'Tại Studio',
            support: 'Tại Studio'
        };

        const existingSameType = (serviceSchedules || []).filter(s => s.serviceType === type);
        const newTurn = existingSameType.length + 1;
        const itemName = item.tenDichVuSnapshot || item.tenDichVu || 'Dịch vụ';
        const sId = item.dichVu?._id || item.dichVu || item._id || item.maDichVu || `ITEM_${Date.now()}`;
        const newScheduleId = `sch-${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const newSchedule = {
            id: newScheduleId,
            serviceId: sId,
            serviceName: `${itemName} - ${typeLabels[type] || type}${newTurn > 1 ? ` (Lượt ${newTurn})` : ''}`,
            serviceType: type,
            luot: newTurn,
            totalLuot: newTurn,
            ngayGio: '',
            diaDiem: defaultLocations[type] || 'Tại Studio',
            nhanVien: '',
            ghiChu: `Gắn với: ${itemName}`
        };

        setServiceSchedules(prev => [...(prev || []), newSchedule]);
        setHighlightedScheduleId(newScheduleId);
        toast.success(`Đã thêm lịch phân công "${typeLabels[type]}" cho gói "${itemName}"!`);

        // Cuộn mượt đến thẻ Lịch & Phân Công Nhiệm Vụ và highlight nhiệm vụ mới
        setTimeout(() => {
            const cardEl = document.getElementById('hd-card-schedules');
            if (cardEl) {
                cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            const itemEl = document.getElementById(`schedule-card-${newScheduleId}`);
            if (itemEl) {
                itemEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 150);

        // Tự động tắt viền highlight sau 3.5 giây
        setTimeout(() => {
            setHighlightedScheduleId(null);
        }, 3600);
    };

    // Đóng context menu khi click ra ngoài hoặc cuộn chuột
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (serviceContextMenu && !e.target.closest('.hd-context-menu')) {
                setServiceContextMenu(null);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && serviceContextMenu) {
                setServiceContextMenu(null);
            }
        };
        window.addEventListener('click', handleOutsideClick);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('click', handleOutsideClick);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [serviceContextMenu]);

    // Lưu nhanh các đường dẫn Drive bổ sung
    const handleSaveDriveLinksQuick = async () => {
        if (!data || !data.maHopDong) {
            toast.error("Không tìm thấy thông tin hợp đồng để lưu!");
            return;
        }
        try {
            setIsSavingDriveLinks(true);
            const res = await otherService.UPDATE_HOPDONG({
                _id: data._id,
                maHopDong: data.maHopDong,
                linkAnhGoc,
                linkAnhChinhSua,
                extraDriveLinks
            });
            if (res && res.success === false) {
                toast.error(res.message || "Lỗi lưu đường dẫn Drive");
                return;
            }
            toast.success("Đã lưu các đường dẫn Drive thành công!");
            setInitialSnapshot(prev => prev ? {
                ...prev,
                linkAnhGoc: (linkAnhGoc || "").trim(),
                linkAnhChinhSua: (linkAnhChinhSua || "").trim(),
                extraDriveLinks: JSON.stringify(extraDriveLinks || [])
            } : prev);
        } catch (err) {
            console.error("Lỗi lưu đường dẫn Drive:", err);
            toast.error("Không thể lưu đường dẫn Drive: " + (err.response?.data?.message || err.message));
        } finally {
            setIsSavingDriveLinks(false);
        }
    };

    const handleScheduleFieldChange = (scheduleId, fieldName, value) => {
        if (fieldName === 'nhanVien' && !canAssignCrew) {
            toast.error("Bạn chưa được cấp quyền phân công hoặc thay đổi thợ!");
            return;
        }
        setServiceSchedules(prev => {
            const nextList = (prev || []).map(sch => {
                if (sch.id === scheduleId || (sch._id && sch._id === scheduleId)) {
                    const updated = { ...sch, [fieldName]: value };
                    if (fieldName === 'serviceType') {
                        const isAutoName = !sch.serviceName || 
                            sch.serviceName.includes('Chụp ảnh') || 
                            sch.serviceName.includes('Trang điểm') || 
                            sch.serviceName.includes('Quay phim') || 
                            sch.serviceName.includes('hậu trường') || 
                            sch.serviceName.includes('Chăm sóc') || 
                            sch.serviceName.includes('Hỗ trợ');
                        if (isAutoName) {
                            if (value === 'photo') updated.serviceName = 'Chụp ảnh';
                            else if (value === 'makeup') updated.serviceName = 'Trang điểm';
                            else if (value === 'video') updated.serviceName = 'Quay phim';
                            else if (value === 'bts') updated.serviceName = 'Quay / Chụp hậu trường';
                            else if (value === 'cskh') updated.serviceName = 'Chăm sóc khách hàng';
                            else if (value === 'support') updated.serviceName = 'Hỗ trợ';
                        }
                    }
                    return updated;
                }
                return sch;
            });

            // Đồng bộ sang các state chính nếu là ca chụp đầu tiên
            const firstPhoto = nextList.find(s => s.serviceType === 'photo');
            if (firstPhoto && firstPhoto.id === scheduleId) {
                if (fieldName === 'ngayGio') setNgayChup(value);
                if (fieldName === 'nhanVien') setThoChupHinh(value);
                if (fieldName === 'diaDiem') setDiaDiemChup(value);
            }
            // Đồng bộ sang các state chính nếu là ca makeup đầu tiên
            const firstMake = nextList.find(s => s.serviceType === 'makeup');
            if (firstMake && firstMake.id === scheduleId) {
                if (fieldName === 'nhanVien') setThoMakeUp(value);
            }

            return nextList;
        });
    };

    const handleRemoveManualSchedule = (scheduleId) => {
        setServiceSchedules(prev => {
            const nextList = (prev || []).filter(sch => (sch.id ? sch.id !== scheduleId : sch._id !== scheduleId));
            const remainingPhotos = nextList.filter(s => s.serviceType === 'photo');
            const remainingMakes = nextList.filter(s => s.serviceType === 'makeup');

            if (remainingPhotos.length === 0) {
                setNgayChup("");
                setThoChupHinh("");
                setDiaDiemChup("");
            } else {
                setNgayChup(remainingPhotos[0].ngayGio || "");
                setThoChupHinh(remainingPhotos[0].nhanVien || "");
                setDiaDiemChup(remainingPhotos[0].diaDiem || "");
            }

            if (remainingMakes.length === 0) {
                setThoMakeUp("");
            } else {
                setThoMakeUp(remainingMakes[0].nhanVien || "");
            }

            return nextList;
        });
    };

    const tinhTongThanhToan = () => {
        // Tính tổng tiền gốc từ giỏ hàng (đã trừ giảm giá từng dịch vụ)
        const tongGoc = gioHang.reduce((sum, item) => {
            const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.giaTriDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.dichVu?.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.dichVu?.giaTriDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
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

    const handleSavePostProduction = async () => {
        if (!data?._id) return;
        setIsSavingHauKy(true);
        try {
            const arrMaAnh = danhSachMaAnhChon
                ? danhSachMaAnhChon.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean)
                : [];
            const res = await otherService.updatePostProduction({
                contractId: data._id,
                subGiaiDoan,
                hauKy: {
                    linkLayoutMaket,
                    danhSachMaAnhChon: arrMaAnh,
                    thongTinInAn
                }
            });
            if (res.data?.success || res.status === 200) {
                toast.success("Đã cập nhật tiến trình hậu kỳ & thông tin in ấn!");
                setHasUpdated(true);
            } else {
                toast.error(res.data?.message || "Lỗi cập nhật hậu kỳ");
            }
        } catch (err) {
            toast.error("Lỗi: " + (err.response?.data?.message || err.message));
        } finally {
            setIsSavingHauKy(false);
        }
    };

    const handleAddAddon = async () => {
        if (!newAddonTen.trim()) {
            toast.warning("Vui lòng nhập tên dịch vụ phát sinh!");
            return;
        }
        setIsAddingAddon(true);
        try {
            const item = {
                tenDichVu: newAddonTen.trim(),
                donGia: Number(newAddonDonGia) || 0,
                soLuong: Number(newAddonSoLuong) || 1,
                ghiChu: newAddonGhiChu.trim(),
                nguoiThem: currentUser?.fullname || currentUser?.hoTen || currentUser?.username || 'Staff'
            };
            const res = await otherService.addAddonItem({
                contractId: data._id,
                item
            });
            if (res.data?.success) {
                toast.success("Đã thêm phụ lục phát sinh thành công!");
                setPhuLucPhatSinh(res.data.data?.phuLucPhatSinh || [...phuLucPhatSinh, { ...item, thanhTien: item.donGia * item.soLuong }]);
                setNewAddonTen("");
                setNewAddonDonGia(0);
                setNewAddonSoLuong(1);
                setNewAddonGhiChu("");
                setHasUpdated(true);
            } else {
                toast.error(res.data?.message || "Lỗi khi thêm phụ lục");
            }
        } catch (err) {
            toast.error("Lỗi: " + (err.response?.data?.message || err.message));
        } finally {
            setIsAddingAddon(false);
        }
    };

    // Hàm phát hiện các thay đổi so với snapshot ban đầu
    const detectContractChanges = useCallback(() => {
        if (!initialSnapshot) return [];
        const diff = [];

        // 1. Loại hợp đồng
        if (Number(dichVuChinh) !== Number(initialSnapshot.dichVuChinh)) {
            const oldName = getDichVuChinhLabel ? getDichVuChinhLabel(initialSnapshot.dichVuChinh) : initialSnapshot.dichVuChinh;
            const newName = getDichVuChinhLabel ? getDichVuChinhLabel(dichVuChinh) : dichVuChinh;
            diff.push({ field: "Loại hợp đồng", icon: "🏷️", oldVal: oldName || "Chưa chọn", newVal: newName || "Chưa chọn" });
        }

        // 2. Ngày chụp
        if ((ngayChup || "") !== (initialSnapshot.ngayChup || "")) {
            diff.push({ 
                field: "Ngày giờ chụp", 
                icon: "📸", 
                oldVal: initialSnapshot.ngayChup ? dayjs(initialSnapshot.ngayChup).format('DD/MM/YYYY HH:mm') : "Chưa có", 
                newVal: ngayChup ? dayjs(ngayChup).format('DD/MM/YYYY HH:mm') : "Đã xóa ngày" 
            });
        }

        // 3. Địa điểm chụp
        if ((diaDiemChup || "").trim() !== (initialSnapshot.diaDiemChup || "").trim()) {
            diff.push({ field: "Địa điểm chụp", icon: "📍", oldVal: initialSnapshot.diaDiemChup || "Chưa nhập", newVal: diaDiemChup || "Chưa nhập" });
        }

        // 4. Chốt lịch
        if ((chotLich || "Chưa gọi điện") !== (initialSnapshot.chotLich || "Chưa gọi điện")) {
            diff.push({ field: "Trạng thái chốt lịch", icon: "📞", oldVal: initialSnapshot.chotLich || "Chưa gọi điện", newVal: chotLich || "Chưa gọi điện" });
        }

        // 5. Thợ chụp hình
        if ((thoChupHinh || "").trim() !== (initialSnapshot.thoChupHinh || "").trim()) {
            diff.push({ field: "Thợ chụp hình", icon: "📷", oldVal: initialSnapshot.thoChupHinh || "Chưa chọn", newVal: thoChupHinh || "Chưa chọn" });
        }

        // 6. Thợ make up
        if ((thoMakeUp || "").trim() !== (initialSnapshot.thoMakeUp || "").trim()) {
            diff.push({ field: "Thợ trang điểm", icon: "💄", oldVal: initialSnapshot.thoMakeUp || "Chưa chọn", newVal: thoMakeUp || "Chưa chọn" });
        }

        // 7. Thợ chỉnh ảnh
        if ((thoChinhAnh || "").trim() !== (initialSnapshot.thoChinhAnh || "").trim()) {
            diff.push({ field: "Thợ chỉnh ảnh", icon: "🎨", oldVal: initialSnapshot.thoChinhAnh || "Chưa chọn", newVal: thoChinhAnh || "Chưa chọn" });
        }

        // 8. Ngày ăn hỏi
        if ((ngayAnHoi || "") !== (initialSnapshot.ngayAnHoi || "")) {
            diff.push({ 
                field: "Ngày ăn hỏi", 
                icon: "🏮", 
                oldVal: initialSnapshot.ngayAnHoi ? dayjs(initialSnapshot.ngayAnHoi).format('DD/MM/YYYY HH:mm') : "Chưa có", 
                newVal: ngayAnHoi ? dayjs(ngayAnHoi).format('DD/MM/YYYY HH:mm') : "Đã xóa ngày" 
            });
        }

        // 9. Ngày cưới
        if ((ngayCuoi || "") !== (initialSnapshot.ngayCuoi || "")) {
            diff.push({ 
                field: "Ngày cưới", 
                icon: "💍", 
                oldVal: initialSnapshot.ngayCuoi ? dayjs(initialSnapshot.ngayCuoi).format('DD/MM/YYYY HH:mm') : "Chưa có", 
                newVal: ngayCuoi ? dayjs(ngayCuoi).format('DD/MM/YYYY HH:mm') : "Đã xóa ngày" 
            });
        }

        // 10. Hạn chỉnh ảnh
        if ((ngayChinhAnh || "") !== (initialSnapshot.ngayChinhAnh || "")) {
            diff.push({ 
                field: "Hạn chỉnh ảnh", 
                icon: "📅", 
                oldVal: initialSnapshot.ngayChinhAnh ? dayjs(initialSnapshot.ngayChinhAnh).format('DD/MM/YYYY') : "Chưa có", 
                newVal: ngayChinhAnh ? dayjs(ngayChinhAnh).format('DD/MM/YYYY') : "Đã xóa ngày" 
            });
        }

        // 11. Hạn trả ảnh
        if ((ngayTraAnh || "") !== (initialSnapshot.ngayTraAnh || "")) {
            diff.push({ 
                field: "Hạn trả ảnh", 
                icon: "🖼️", 
                oldVal: initialSnapshot.ngayTraAnh ? dayjs(initialSnapshot.ngayTraAnh).format('DD/MM/YYYY') : "Chưa có", 
                newVal: ngayTraAnh ? dayjs(ngayTraAnh).format('DD/MM/YYYY') : "Đã xóa ngày" 
            });
        }

        // 12. Nhân viên Sale
        if ((nhanVienSale || "0") !== (initialSnapshot.nhanVienSale || "0")) {
            diff.push({ field: "Nhân viên Sale", icon: "💼", oldVal: initialSnapshot.nhanVienSale || "0", newVal: nhanVienSale || "0" });
        }

        // 13. Giảm giá
        if (Number(giamGia) !== Number(initialSnapshot.giamGia) || Number(loaiGiamGia) !== Number(initialSnapshot.loaiGiamGia)) {
            const formatGiam = (g, t) => Number(t) === 1 ? `${g}%` : `${Number(g).toLocaleString('vi-VN')} đ`;
            diff.push({ 
                field: "Giảm giá hợp đồng", 
                icon: "💰", 
                oldVal: formatGiam(initialSnapshot.giamGia, initialSnapshot.loaiGiamGia), 
                newVal: formatGiam(giamGia, loaiGiamGia) 
            });
        }

        // 14. Voucher
        if ((voucherCode || "") !== (initialSnapshot.voucherCode || "")) {
            diff.push({ field: "Mã Voucher", icon: "🎟️", oldVal: initialSnapshot.voucherCode || "Không có", newVal: voucherCode || "Không có" });
        }

        // 15. Thanh toán thêm
        if (Number(khachThanhToanTruoc) > 0) {
            diff.push({ 
                field: "Thanh toán thêm", 
                icon: "💵", 
                oldVal: "Chưa thanh toán thêm", 
                newVal: `+ ${Number(khachThanhToanTruoc).toLocaleString('vi-VN')} đ (${methodPayment || 'Tiền mặt'})` 
            });
        }

        // 16. Link ảnh gốc
        if ((linkAnhGoc || "").trim() !== (initialSnapshot.linkAnhGoc || "").trim()) {
            diff.push({ field: "Link ảnh gốc", icon: "📁", oldVal: initialSnapshot.linkAnhGoc || "Chưa có", newVal: linkAnhGoc || "Chưa có" });
        }

        // 17. Link ảnh chỉnh sửa
        if ((linkAnhChinhSua || "").trim() !== (initialSnapshot.linkAnhChinhSua || "").trim()) {
            diff.push({ field: "Link ảnh chỉnh sửa", icon: "✨", oldVal: initialSnapshot.linkAnhChinhSua || "Chưa có", newVal: linkAnhChinhSua || "Chưa có" });
        }

        // 17.5. Đường dẫn Drive bổ sung
        try {
            const baseExtra = JSON.parse(initialSnapshot.extraDriveLinks || "[]");
            const curExtra = extraDriveLinks || [];
            if (JSON.stringify(curExtra) !== JSON.stringify(baseExtra)) {
                diff.push({
                    field: "Đường dẫn Drive bổ sung",
                    icon: "🔗",
                    oldVal: `${baseExtra.length} đường dẫn`,
                    newVal: `${curExtra.length} đường dẫn`
                });
            }
        } catch (err) {}

        // 18. Giỏ hàng
        try {
            const baseCart = JSON.parse(initialSnapshot.gioHang || "[]");
            const currentCart = (gioHang || []).map(s => ({
                id: String(s.dichVu?._id || s.dichVu || s._id || s.maDichVu || ''),
                ten: s.tenDichVuSnapshot || s.tenDichVu || '',
                sl: Number(s.soLuong) || 1,
                dg: Number(s.donGia || s.giaChoThueDichVu || s.dichVu?.giaChoThueDichVu || 0),
                gg: Number(s.giamGiaDichVu) || 0,
                thiep: s.maLoaiThiep || ''
            }));

            // Added items
            currentCart.forEach(curItem => {
                const match = baseCart.find(b => b.id === curItem.id || (b.ten && b.ten === curItem.ten));
                if (!match) {
                    diff.push({ 
                        field: "Thêm dịch vụ giỏ hàng", 
                        icon: "➕", 
                        oldVal: "Chưa có", 
                        newVal: `${curItem.ten} (SL: ${curItem.sl}, Giá: ${curItem.dg.toLocaleString('vi-VN')} đ)` 
                    });
                } else {
                    if (curItem.sl !== match.sl) {
                        diff.push({ 
                            field: `Đổi số lượng: ${curItem.ten}`, 
                            icon: "🔢", 
                            oldVal: `SL: ${match.sl}`, 
                            newVal: `SL: ${curItem.sl}` 
                        });
                    }
                    if (curItem.gg !== match.gg) {
                        diff.push({ 
                            field: `Giảm giá: ${curItem.ten}`, 
                            icon: "🏷️", 
                            oldVal: `${match.gg.toLocaleString('vi-VN')} đ`, 
                            newVal: `${curItem.gg.toLocaleString('vi-VN')} đ` 
                        });
                    }
                    if (curItem.thiep !== match.thiep) {
                        diff.push({ 
                            field: `Mẫu thiệp: ${curItem.ten}`, 
                            icon: "💌", 
                            oldVal: match.thiep || "Mặc định", 
                            newVal: curItem.thiep || "Mặc định" 
                        });
                    }
                }
            });

            // Removed items
            baseCart.forEach(baseItem => {
                const match = currentCart.find(c => c.id === baseItem.id || (c.ten && c.ten === baseItem.ten));
                if (!match) {
                    diff.push({ 
                        field: "Xóa dịch vụ khỏi giỏ", 
                        icon: "🗑️", 
                        oldVal: `${baseItem.ten} (SL: ${baseItem.sl})`, 
                        newVal: "Đã xóa khỏi hợp đồng" 
                    });
                }
            });
        } catch (err) {
            console.error("Lỗi so khớp giỏ hàng:", err);
        }

        // 19. Lịch trình dịch vụ & Phân công nhiệm vụ ekip
        try {
            const baseSchedules = JSON.parse(initialSnapshot.serviceSchedules || "[]");
            const curSchedules = serviceSchedules || [];

            if (curSchedules.length !== baseSchedules.length) {
                diff.push({
                    field: "Số lượng nhiệm vụ ekip",
                    icon: "📋",
                    oldVal: `${baseSchedules.length} nhiệm vụ`,
                    newVal: `${curSchedules.length} nhiệm vụ`
                });
            }

            // So sánh chi tiết từng nhiệm vụ
            curSchedules.forEach((curSch, idx) => {
                const baseSch = baseSchedules.find(b => b.id && b.id === curSch.id) || baseSchedules[idx];
                const schName = curSch.serviceName || `Nhiệm vụ ${idx + 1}`;
                if (!baseSch) {
                    diff.push({
                        field: `Thêm nhiệm vụ: ${schName}`,
                        icon: "➕",
                        oldVal: "Chưa có",
                        newVal: `${schName} (${curSch.diaDiem || 'Tại Studio'}${curSch.ngayGio ? ` lúc ${dayjs(curSch.ngayGio).format('DD/MM/YYYY HH:mm')}` : ''})`
                    });
                } else {
                    if ((curSch.ngayGio || '') !== (baseSch.ngayGio || '')) {
                        diff.push({
                            field: `Thời gian: ${schName}`,
                            icon: "⏰",
                            oldVal: baseSch.ngayGio ? dayjs(baseSch.ngayGio).format('DD/MM/YYYY HH:mm') : "Chưa đặt",
                            newVal: curSch.ngayGio ? dayjs(curSch.ngayGio).format('DD/MM/YYYY HH:mm') : "Chưa đặt"
                        });
                    }
                    if ((curSch.diaDiem || '').trim() !== (baseSch.diaDiem || '').trim()) {
                        diff.push({
                            field: `Địa điểm: ${schName}`,
                            icon: "📍",
                            oldVal: baseSch.diaDiem || "Chưa có",
                            newVal: curSch.diaDiem || "Chưa có"
                        });
                    }
                    if ((curSch.nhanVien || '').trim() !== (baseSch.nhanVien || '').trim()) {
                        diff.push({
                            field: `Phân công nhân sự: ${schName}`,
                            icon: "👤",
                            oldVal: baseSch.nhanVien || "Chưa phân công",
                            newVal: curSch.nhanVien || "Chưa phân công"
                        });
                    }
                    if ((curSch.serviceType || '') !== (baseSch.serviceType || baseSch.type || '')) {
                        diff.push({
                            field: `Loại nhiệm vụ: ${schName}`,
                            icon: "🔄",
                            oldVal: baseSch.serviceType || baseSch.type || 'Chụp ảnh',
                            newVal: curSch.serviceType || 'Chụp ảnh'
                        });
                    }
                    if ((curSch.serviceName || '').trim() !== (baseSch.serviceName || baseSch.name || '').trim()) {
                        diff.push({
                            field: `Tên nhiệm vụ: ${schName}`,
                            icon: "📝",
                            oldVal: baseSch.serviceName || baseSch.name || '',
                            newVal: curSch.serviceName || ''
                        });
                    }
                    if ((curSch.ghiChu || '').trim() !== (baseSch.ghiChu || '').trim()) {
                        diff.push({
                            field: `Ghi chú: ${schName}`,
                            icon: "📝",
                            oldVal: baseSch.ghiChu || "Trống",
                            newVal: curSch.ghiChu || "Trống"
                        });
                    }
                }
            });

            // Kiểm tra nhiệm vụ bị xóa
            baseSchedules.forEach((baseSch) => {
                const stillExists = curSchedules.some(c => c.id && c.id === baseSch.id);
                if (!stillExists && curSchedules.length < baseSchedules.length) {
                    diff.push({
                        field: `Xóa nhiệm vụ: ${baseSch.serviceName || baseSch.name || 'Nhiệm vụ'}`,
                        icon: "🗑️",
                        oldVal: `${baseSch.serviceName || baseSch.name || 'Nhiệm vụ'}`,
                        newVal: "Đã xóa khỏi lịch"
                    });
                }
            });
        } catch (e) {
            console.error("Lỗi so khớp lịch trình:", e);
        }

        // 20. Phụ lục phát sinh
        try {
            const baseAddons = JSON.parse(initialSnapshot.phuLucPhatSinh || "[]");
            if ((phuLucPhatSinh || []).length !== baseAddons.length) {
                diff.push({
                    field: "Phụ lục phát sinh (Upsell)",
                    icon: "📦",
                    oldVal: `${baseAddons.length} phụ lục`,
                    newVal: `${(phuLucPhatSinh || []).length} phụ lục`
                });
            }
        } catch (e) {}

        return diff;
    }, [
        initialSnapshot,
        dichVuChinh,
        ngayChup,
        diaDiemChup,
        chotLich,
        thoChupHinh,
        thoMakeUp,
        thoChinhAnh,
        ngayAnHoi,
        ngayCuoi,
        ngayChinhAnh,
        ngayTraAnh,
        nhanVienSale,
        giamGia,
        loaiGiamGia,
        voucherCode,
        khachThanhToanTruoc,
        methodPayment,
        linkAnhGoc,
        linkAnhChinhSua,
        extraDriveLinks,
        gioHang,
        serviceSchedules,
        phuLucPhatSinh,
        getDichVuChinhLabel
    ]);

    const currentDiff = useMemo(() => detectContractChanges(), [detectContractChanges]);
    const hasChanges = currentDiff.length > 0;

    const onUpdateHopDong = (confirmedChanges = []) => {
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

        const processedGioHang = (gioHang || []).map(sp => {
            const isMk = isMakeupItem(sp);
            const isCard = isWeddingCardService(sp);
            const dt = isMk && sp.ngayTrangDiem ? new Date(sp.ngayTrangDiem) : null;
            const validDt = dt && !isNaN(dt.getTime());
            const itemToSave = {
                ...sp,
                ngayTrangDiem: validDt ? dt.toISOString() : (sp.ngayTrangDiem || null),
                gioTrangDiem: isMk ? (sp.gioTrangDiem || (validDt ? `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}` : '')) : '',
                diaDiemTrangDiem: isMk ? (sp.diaDiemTrangDiem || '') : '',
                thoMakeUp: isMk ? (sp.thoMakeUp || '') : (sp.thoMakeUp || ''),
                ghiChuTrangDiem: isMk ? (sp.ghiChuTrangDiem || '') : ''
            };
            if (isCard) {
                itemToSave.maLoaiThiep = sp.maLoaiThiep || "";
                itemToSave.tenLoaiThiep = sp.tenLoaiThiep || "";
                itemToSave.isThiep = true;
            } else {
                delete itemToSave.maLoaiThiep;
                delete itemToSave.tenLoaiThiep;
                delete itemToSave.isThiep;
            }
            return itemToSave;
        });

        const makeupSchedules = (serviceSchedules || []).filter(s => s.serviceType === 'makeup').map((sch, idx) => {
            let ngayIso = null;
            let gioStr = '';
            if (sch.ngayGio) {
                const dt = new Date(sch.ngayGio);
                if (!isNaN(dt.getTime())) {
                    ngayIso = dt.toISOString();
                    gioStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
                }
            }
            return {
                id: sch.id || `mk-up-${data._id}-${idx}`,
                dichVuId: sch.serviceId,
                tenDichVu: sch.serviceName || 'Trang điểm',
                luot: sch.luot || idx + 1,
                ngayTrangDiem: ngayIso,
                gioTrangDiem: gioStr,
                diaDiem: sch.diaDiem || '',
                thoMakeUp: sch.nhanVien || '',
                ghiChu: sch.ghiChu || ''
            };
        });

        const photoSchedules = (serviceSchedules || []).filter(s => s.serviceType === 'photo').map((sch, idx) => {
            let ngayIso = null;
            let gioStr = '';
            if (sch.ngayGio) {
                const dt = new Date(sch.ngayGio);
                if (!isNaN(dt.getTime())) {
                    ngayIso = dt.toISOString();
                    gioStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
                }
            }
            return {
                id: sch.id || `photo-up-${data._id}-${idx}`,
                dichVuId: sch.serviceId,
                tenDichVu: sch.serviceName || 'Chụp ảnh',
                luot: sch.luot || idx + 1,
                ngayGio: ngayIso,
                gioChup: gioStr,
                diaDiem: sch.diaDiem || '',
                thoChupHinh: sch.nhanVien || '',
                ghiChu: sch.ghiChu || ''
            };
        });

        const videoSchedules = (serviceSchedules || []).filter(s => s.serviceType === 'video').map((sch, idx) => {
            let ngayIso = null;
            let gioStr = '';
            if (sch.ngayGio) {
                const dt = new Date(sch.ngayGio);
                if (!isNaN(dt.getTime())) {
                    ngayIso = dt.toISOString();
                    gioStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
                }
            }
            return {
                id: sch.id || `video-up-${data._id}-${idx}`,
                dichVuId: sch.serviceId,
                tenDichVu: sch.serviceName || 'Quay phim',
                luot: sch.luot || idx + 1,
                ngayGio: ngayIso,
                ngayQuay: ngayIso,
                gioQuay: gioStr,
                diaDiem: sch.diaDiem || '',
                thoQuayPhim: sch.nhanVien || '',
                ghiChu: sch.ghiChu || ''
            };
        });

        const allPhotoSchedules = (serviceSchedules || []).filter(s => s.serviceType === 'photo');
        const allMakeupSchedules = (serviceSchedules || []).filter(s => s.serviceType === 'makeup');
        const allVideoSchedules = (serviceSchedules || []).filter(s => s.serviceType === 'video');

        const firstPhoto = photoSchedules[0] || null;
        const firstMakeup = makeupSchedules[0] || null;
        const firstVideo = videoSchedules[0] || null;
        const hasDefinedSchedules = Array.isArray(serviceSchedules);

        // Khi người dùng quản lý lịch qua serviceSchedules:
        // Nếu xóa hết các ca chụp -> xóa hoàn toàn ngayChup, gioChup, diaDiemChup, thoChupHinh
        const newNgayChup = firstPhoto ? firstPhoto.ngayGio : (hasDefinedSchedules ? null : convertDateToISOString(ngayChup));
        const newGioChup = firstPhoto ? (firstPhoto.gioChup || "") : (hasDefinedSchedules ? "" : (ngayChup ? `${String(new Date(ngayChup).getHours()).padStart(2, '0')}:${String(new Date(ngayChup).getMinutes()).padStart(2, '0')}` : ""));
        const newDiaDiemChup = firstPhoto ? (firstPhoto.diaDiem || "") : (allPhotoSchedules.length > 0 ? (allPhotoSchedules[0].diaDiem || "") : (hasDefinedSchedules ? "" : diaDiemChup));
        const newThoChupHinh = firstPhoto ? (firstPhoto.thoChupHinh || "") : (allPhotoSchedules.length > 0 ? (allPhotoSchedules[0].nhanVien || "") : (hasDefinedSchedules ? "" : thoChupHinh));

        // Tương tự cho lịch trang điểm
        const newNgayTrangDiem = firstMakeup ? firstMakeup.ngayTrangDiem : (hasDefinedSchedules ? null : (data?.cacNgay?.ngayTrangDiem || null));
        const newGioTrangDiem = firstMakeup ? (firstMakeup.gioTrangDiem || "") : (hasDefinedSchedules ? "" : (data?.cacNgay?.gioTrangDiem || ""));
        const newDiaDiemTrangDiem = firstMakeup ? (firstMakeup.diaDiem || "") : (allMakeupSchedules.length > 0 ? (allMakeupSchedules[0].diaDiem || "") : (hasDefinedSchedules ? "" : (data?.cacNgay?.diaDiemTrangDiem || "")));
        const newThoMakeUp = firstMakeup ? (firstMakeup.thoMakeUp || "") : (allMakeupSchedules.length > 0 ? (allMakeupSchedules[0].nhanVien || "") : (hasDefinedSchedules ? "" : thoMakeUp));

        // Tương tự cho lịch quay phim
        const newNgayQuayPhim = firstVideo ? firstVideo.ngayGio : (hasDefinedSchedules ? null : (data?.cacNgay?.ngayQuayPhim || null));
        const newGioQuayPhim = firstVideo ? (firstVideo.gioQuay || "") : (hasDefinedSchedules ? "" : (data?.cacNgay?.gioQuayPhim || ""));
        const newDiaDiemQuayPhim = firstVideo ? (firstVideo.diaDiem || "") : (allVideoSchedules.length > 0 ? (allVideoSchedules[0].diaDiem || "") : (hasDefinedSchedules ? "" : (data?.cacNgay?.diaDiemQuayPhim || "")));
        const newThoQuayPhim = firstVideo ? (firstVideo.thoQuayPhim || "") : (allVideoSchedules.length > 0 ? (allVideoSchedules[0].nhanVien || "") : (hasDefinedSchedules ? "" : (data?.nguoiPhucVu?.thoQuayPhim || "")));

        const isPreWContract = Number(dichVuChinh) === 1 || 
            (getDichVuChinhLabel ? getDichVuChinhLabel(dichVuChinh) : '').toLowerCase().includes('pre-wedding') ||
            (getDichVuChinhLabel ? getDichVuChinhLabel(dichVuChinh) : '').toLowerCase().includes('pre wedding') ||
            Boolean(ngayAnHoi) || 
            Boolean(ngayCuoi) ||
            Boolean(data?.cacNgay?.ngayAnHoi) ||
            Boolean(data?.cacNgay?.ngayCuoi);

        showLoading("Đang cập nhật hợp đồng...");
        otherService.UPDATE_HOPDONG({
            _id: data._id,
            maHopDong,
            ngayHopDong,
            khachHang1: idKH1,
            khachHang2: idKH2,
            gioHang: processedGioHang,
            lichTrangDiem: makeupSchedules,
            lichChup: photoSchedules,
            lichQuayPhim: videoSchedules,
            serviceSchedules: canAssignCrew ? serviceSchedules : (serviceSchedules || []).map(sch => {
                const orig = (data?.serviceSchedules || []).find(os => (os.id && os.id === sch.id) || (os._id && os._id === sch.id));
                return { ...sch, nhanVien: orig ? (orig.nhanVien || "") : "" };
            }),
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
                    voucherCode: voucherCode || data?.thanhToan?.voucherCode || "",
                    voucherGiamGia: voucherGiamGia || data?.thanhToan?.voucherGiamGia || 0,
                    voucherId: voucherId || data?.thanhToan?.voucherId || undefined,
                    cacLuotThanhToan: cacLuotThanhToan
                };
            })(),
            cacNgay: {
                ngayChup: newNgayChup,
                ngayAnHoi: (isPreWContract || Boolean(ngayAnHoi)) ? (ngayAnHoi ? convertDateToISOString(ngayAnHoi) : null) : null,
                ngayCuoi: (isPreWContract || Boolean(ngayCuoi)) ? (ngayCuoi ? convertDateToISOString(ngayCuoi) : null) : null,
                ngayChinhAnh: convertDateToISOString(ngayChinhAnh),
                ngayTraAnh: convertDateToISOString(ngayTraAnh),
                gioChup: newGioChup,
                diaDiemChup: newDiaDiemChup,
                chotLich,
                ngayTrangDiem: newNgayTrangDiem,
                gioTrangDiem: newGioTrangDiem,
                diaDiemTrangDiem: newDiaDiemTrangDiem
            },
            nguoiPhucVu: {
                thoChupHinh: newThoChupHinh,
                thoMakeUp: newThoMakeUp,
                thoChinhAnh: thoChinhAnh,
                banHang: data?.nguoiPhucVu?.banHang || "",
                phucVu: data?.nguoiPhucVu?.phucVu || ""
            },
            nhanVienSale: nhanVienSale,
            giaiDoan: giaiDoan,
            subGiaiDoan: subGiaiDoan,
            dichVuChinh: dichVuChinh,
            khachThanhToanTruoc: khachThanhToanTruoc,
            linkAnhGoc: linkAnhGoc,
            linkAnhChinhSua: linkAnhChinhSua,
            extraDriveLinks: extraDriveLinks,
            newAuditEntry: (() => {
                const changesToLog = confirmedChanges.length > 0 ? confirmedChanges : currentDiff;
                return {
                    action: changesToLog.some(c => c.field.includes("Thanh toán"))
                        ? "Cập nhật hợp đồng & Thanh toán"
                        : (changesToLog.some(c => c.field.includes("Xóa")) ? "Cập nhật & Xóa dịch vụ" : "Cập nhật thông tin hợp đồng"),
                    reason: changesToLog.length > 0
                        ? changesToLog.map(c => `${c.field}: ${c.oldVal} ➔ ${c.newVal}`).join("; ")
                        : "Cập nhật thông tin hợp đồng",
                    details: changesToLog,
                    performedBy: currentUser?.fullname || currentUser?.hoTen || currentUser?.name || currentUser?.username || "Nhân viên",
                    role: currentUser?.chucVu || currentUser?.vaiTro || currentUser?.positon || "Admin",
                    timestamp: new Date().toISOString()
                };
            })()
        }).then((response) => {
            if (response?.success === false) {
                toast.error(response?.message || "Có lỗi xảy ra khi cập nhật hợp đồng!");
                hideLoading();
                return;
            }
            toast.success("Cập nhật hợp đồng thành công!");
            hideLoading();
            setInitialSnapshot(null);
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

    const submitProgressUpdate = (stageNum, subStageVal, progressData = {}) => {
        if (Number(stageNum) === 4) {
            const currentContractObj = {
                ...data,
                thanhToan: (typeof thanhToan === 'object' && thanhToan !== null) ? thanhToan : data?.thanhToan,
                serviceSchedules: serviceSchedules || data?.serviceSchedules,
                lichChup: data?.lichChup || [],
                lichQuayPhim: data?.lichQuayPhim || [],
                lichTrangDiem: data?.lichTrangDiem || [],
                cacNgay: {
                    ...(data?.cacNgay || {}),
                    ngayChup: ngayChup || data?.cacNgay?.ngayChup,
                    ngayAnHoi: ngayAnHoi || data?.cacNgay?.ngayAnHoi,
                    ngayCuoi: ngayCuoi || data?.cacNgay?.ngayCuoi
                }
            };
            const check = checkContractCompletionEligibility(currentContractObj);
            if (!check.eligible) {
                toast.error(check.message);
                return;
            }
        }
        if (!data || !data._id) return;

        showLoading("Đang cập nhật tiến trình...");
        const targetSub = subStageVal || subGiaiDoan || 'dang_thuc_hien';

        otherService.UPDATE_PROGRESS({
            maHopDong: maHopDong,
            giaiDoan: stageNum,
            subGiaiDoan: targetSub,
            data: progressData
        }).then((response) => {
            const stepNames = {
                1: "Chụp hình",
                2: "Hậu kỳ",
                3: "In ảnh",
                4: "Hoàn thành"
            };
            const subNames = {
                'dang_thuc_hien': "Đang thực hiện",
                'cho_chinh': "Chờ chỉnh",
                'dang_chinh': "Đang chỉnh",
                'dang_hau_ky': "Đang chỉnh",
                'dang_chinh_anh': "Đang chỉnh",
                'cho_khach_duyet': "Khách duyệt",
                'khach_duyet_anh': "Khách duyệt",
                'cho_khach_duyet_layout': "Khách duyệt",
                'khach_da_duyet_layout': "Khách duyệt",
                'da_giao_file_goc': "Chờ chỉnh",
                'khach_da_chon_anh': "Chờ chỉnh",
                'da_gui_xuong_in': "Đã gửi xưởng in",
                'studio_da_nhan_hang': "Đã nhận tại Studio",
                'da_tra_khach': "Đã bàn giao khách",
                'hoan_thanh': "Hoàn thành",
                'bao_luu': "Bảo lưu",
                'huy': "Đã hủy"
            };

            const showSubLabel = Number(stageNum) === 2 || ['bao_luu', 'huy'].includes(targetSub);
            const statusText = showSubLabel
                ? `${stepNames[stageNum] || stageNum} (${subNames[targetSub] || targetSub})`
                : `${stepNames[stageNum] || stageNum}`;
            toast.success(`Đã cập nhật tiến trình: ${statusText}!`);
            setGiaiDoan(stageNum);
            setSubGiaiDoan(targetSub);
            setHasUpdated(true);

            // Cập nhật các state hiển thị cục bộ
            const updatedContract = response?.data?.data || response?.data;
            if (updatedContract?.lichSuGiaiDoan) {
                setLichSuGiaiDoan(updatedContract.lichSuGiaiDoan);
            }
            if (stageNum === 1 && progressData.linkAnhGoc) {
                setLinkAnhGoc(progressData.linkAnhGoc);
            } else if (stageNum === 2 && progressData.linkAnhChinhSua) {
                setLinkAnhChinhSua(progressData.linkAnhChinhSua);
            } else if (stageNum === 3 && progressData.danhSachAnhIn) {
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

    const handleMarkStageComplete = (stageNum) => {
        setTargetStep(stageNum);
        if (stageNum === 1) {
            setInputLinkAnhGoc(linkAnhGoc || "");
            setOpenProgressInput(true);
            return;
        }
        if (stageNum === 2) {
            setInputLinkAnhChinhSua(linkAnhChinhSua || "");
            setOpenProgressInput(true);
            return;
        }
        if (stageNum === 3) {
            setInputDanhSachAnhIn(danhSachAnhIn || []);
            setNewKichThuoc("");
            setNewSoLuong(1);
            setOpenProgressInput(true);
            return;
        }
        if (stageNum === 4) {
            const conLai = Number(thanhToan?.conLai || data?.thanhToan?.conLai || 0);
            if (conLai > 0) {
                if (!window.confirm(`Hợp đồng còn nợ ${conLai.toLocaleString('vi-VN')}đ. Bạn có chắc chắn muốn xác nhận Hoàn tất hợp đồng không?`)) {
                    return;
                }
            } else {
                if (!window.confirm("Bạn có chắc chắn muốn xác nhận Hoàn tất hợp đồng này không?")) {
                    return;
                }
            }
            submitProgressUpdate(4, 'hoan_thanh', {});
        }
    };

    const handleStepClick = (stepNumber) => {
        setTargetStep(stepNumber);

        // Nếu click vào đúng bước hiện tại: mở hộp thoại cập nhật thông tin chi tiết của bước đó
        if (stepNumber === giaiDoan) {
            if (stepNumber === 1) {
                setInputLinkAnhGoc(linkAnhGoc || "");
                setOpenProgressInput(true);
            } else if (stepNumber === 2) {
                setInputLinkAnhChinhSua(linkAnhChinhSua || "");
                setOpenProgressInput(true);
            } else if (stepNumber === 3) {
                setInputDanhSachAnhIn(danhSachAnhIn || []);
                setNewKichThuoc("");
                setNewSoLuong(1);
                setOpenProgressInput(true);
            } else if (stepNumber === 4) {
                handleMarkStageComplete(4);
            }
            return;
        }

        // Cho phép chuyển đổi thủ công sang bất kỳ bước nào (tiến hoặc lùi)
        const stageNames = {
            1: "1. Chụp hình",
            2: "2. Hậu kỳ",
            3: "3. In ảnh",
            4: "4. Hoàn thành"
        };
        const targetSub = stepNumber === 2 ? 'cho_chinh' : (stepNumber === 4 ? 'hoan_thanh' : 'dang_thuc_hien');
        if (window.confirm(`Bạn có chắc chắn muốn chuyển thủ công trạng thái hợp đồng sang bước "${stageNames[stepNumber]}" không?`)) {
            submitProgressUpdate(stepNumber, targetSub, {});
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

        const cleanArr = (arr) => (arr || []).filter(x => {
            if (!x) return false;
            const s = String(x).trim().toLowerCase();
            return s !== '' && s !== 'không có' && s !== 'khong co' && s !== 'không' && s !== 'khong';
        }).join(", ");

        return {
            soLuongAnhChinhSua: totals.soLuongAnhChinhSua,
            soLuongAnh16x21: totals.soLuongAnh16x21,
            soLuongAnh20x30: totals.soLuongAnh20x30,
            soLuongAnh60x90: totals.soLuongAnh60x90,
            trangDiemNgayAnHoi: cleanArr(totals.trangDiemNgayAnHoi),
            trangDiemNgayCuoi: cleanArr(totals.trangDiemNgayCuoi),
            trangPhucChoDoiBeLe: cleanArr(totals.trangPhucChoDoiBeLe),
            trangPhucCoDauNgayAnHoi: cleanArr(totals.trangPhucCoDauNgayAnHoi),
            trangPhucChuReNgayAnHoi: cleanArr(totals.trangPhucChuReNgayAnHoi),
            trangPhucVayCuoiNgayCuoi: cleanArr(totals.trangPhucVayCuoiNgayCuoi),
            trangPhucVestChuReNgayCuoi: cleanArr(totals.trangPhucVestChuReNgayCuoi),
            hoaCamTay: cleanArr(totals.hoaCamTay)
        };
    };

    const handlePrintHopDong = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Trình duyệt đang chặn cửa sổ pop-up. Vui lòng cho phép để in.");
            return;
        }

        const ngayHDFormatted = dayjs(ngayHopDong).format("DD/MM/YYYY");
        const ngayChupFormatted = ngayChup ? dayjs(ngayChup).format("DD/MM/YYYY") : "";
        const ngayAnHoiFormatted = ngayAnHoi ? dayjs(ngayAnHoi).format("DD/MM/YYYY") : "";
        const ngayCuoiFormatted = ngayCuoi ? dayjs(ngayCuoi).format("DD/MM/YYYY") : "";
        const ngayTraAnhFormatted = ngayTraAnh ? dayjs(ngayTraAnh).format("DD/MM/YYYY") : "";
        const totals = getAggregatedParams();

        const tongGocDonHang = gioHang.reduce((sum, item) => {
            const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.giaTriDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.dichVu?.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.dichVu?.giaTriDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
            return sum + (price * (item.soLuong || 1));
        }, 0);

        const cacLuotThanhToan = [...(data?.thanhToan?.cacLuotThanhToan || [])];
        if (Number(khachThanhToanTruoc) > 0) {
            cacLuotThanhToan.push({
                date: new Date().toISOString(),
                amount: Number(khachThanhToanTruoc),
                method: methodPayment || "Tiền mặt",
                noiDung: noiDungPayment || ""
            });
        }
        if (cacLuotThanhToan.length === 0) {
            const paidVal = Number(data?.thanhToan?.khachHangDaThanhToan || data?.khachThanhToan || 0);
            if (paidVal > 0) {
                cacLuotThanhToan.push({
                    date: data?.createdAt || data?.ngayHopDong || ngayHDFormatted,
                    amount: paidVal,
                    method: data?.thanhToan?.method || data?.thanhToan?.khachThanhToan?.method || "Tiền mặt",
                    noiDung: data?.thanhToan?.noiDung || data?.thanhToan?.khachThanhToan?.noiDung || ""
                });
            }
        }

        const rawContract = {
            maHopDong,
            ngayLapHopDongFormatted: ngayHDFormatted,
            nameKH1,
            nameKH2,
            phoneKH1,
            phoneKH2,
            addressKH1,
            addressKH2,
            ngayChupFormatted,
            ngayAnHoiFormatted,
            ngayCuoiFormatted,
            ngayTraAnhFormatted,
            diaDiemChup: diaDiemChup || data?.cacNgay?.diaDiemChup || '',
            thoChupHinh: thoChupHinh || data?.nguoiPhucVu?.thoChupHinh || '',
            thoMakeUp: thoMakeUp || data?.nguoiPhucVu?.thoMakeUp || '',
            thoChinhAnh: thoChinhAnh || data?.nguoiPhucVu?.thoChinhAnh || '',
            nhanVienSale: (nhanVienSale && nhanVienSale !== "0") ? nhanVienSale : (data?.nguoiPhucVu?.banHang || ""),
            chotLich: chotLich || data?.cacNgay?.chotLich || '',
            serviceSchedules,
            cacNgay: data?.cacNgay,
            nguoiPhucVu: data?.nguoiPhucVu,
            trangDiemNgayAnHoi: totals.trangDiemNgayAnHoi,
            trangDiemNgayCuoi: totals.trangDiemNgayCuoi,
            tongTien,
            tongGocDonHang,
            tongGiaTriDonHang: tongGocDonHang,
            voucherGiamGia: voucherGiamGia || data?.thanhToan?.voucherGiamGia || 0,
            giamGiaDonHang: giamGia || data?.thanhToan?.giamGia || 0,
            thanhToan: data?.thanhToan,
            cacLuotThanhToan,
            datCoc: (cacLuotThanhToan[0]?.amount || khachThanhToanTruoc || 0),
            daThanhToan: ((data?.thanhToan?.khachHangDaThanhToan || 0) + (Number(khachThanhToanTruoc) || 0))
        };

        const printData = extractContractPrintData(rawContract, gioHang, totals);
        const html = generateContractPrintHtml(printData, getContractPrintConfig());

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
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
                    {/* Job Card Mode Banner for Technicians */}
                    {isTechnician && (
                        <div style={{
                            background: 'linear-gradient(90deg, #1e293b, #0f172a)',
                            color: '#38bdf8',
                            padding: '6px 20px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #334155'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1rem' }}>🛠️</span>
                                <span>CHẾ ĐỘ PHIẾU CÔNG VIỆC (JOB CARD) - KỸ THUẬT VIÊN</span>
                                <span style={{ color: '#94a3b8', fontSize: '0.74rem', fontWeight: 400 }}>• Số liệu tài chính, thanh toán & giá vốn được bảo mật tự động</span>
                            </div>
                            <span style={{ background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>
                                Chỉ xem thông số kỹ thuật & Lịch trình
                            </span>
                        </div>
                    )}
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
                            <Autocomplete
                                disablePortal
                                options={loaiHopDongOptions}
                                size="small"
                                value={loaiHopDongOptions.find(o => o.id === Number(dichVuChinh)) || null}
                                sx={{
                                    minWidth: { xs: 180, sm: 220, md: 240 },
                                    maxWidth: 320,
                                    '& .MuiOutlinedInput-root': {
                                        height: 32,
                                        fontSize: '0.82rem',
                                        fontWeight: 700,
                                        color: '#38bdf8',
                                        backgroundColor: 'rgba(56, 189, 248, 0.12)',
                                        borderRadius: '6px',
                                        '& fieldset': {
                                            borderColor: 'rgba(56, 189, 248, 0.45)',
                                            borderWidth: '1.5px'
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#38bdf8'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#38bdf8'
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: '#38bdf8'
                                        }
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        placeholder="Chọn loại hợp đồng *" 
                                    />
                                )}
                                onChange={(event, newValue) => {
                                    setDichVuChinh(newValue ? newValue.id : 0);
                                }}
                            />
                        </div>

                        {/* Center: Slim Inline Stepper (Tiến Trình 4 Bước) */}
                        <div className="hd-inline-stepper">
                            {[
                                { number: 1, label: "Chụp hình", icon: "📸" },
                                { number: 2, label: "Hậu kỳ", icon: "🎨" },
                                { number: 3, label: "In ảnh", icon: "🖼️" },
                                { number: 4, label: "Hoàn thành", icon: "🏁" }
                            ].map((step, idx, arr) => {
                                const isCompleted = step.number < giaiDoan || (step.number === 4 && giaiDoan === 4) || (step.number === 2 && giaiDoan === 2 && subGiaiDoan === 'hoan_thanh');
                                const isActive = step.number === giaiDoan;

                                return (
                                    <Fragment key={step.number}>
                                        <div
                                            className={`hd-step-node-mini ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                            onClick={() => handleStepClick(step.number)}
                                            title={`Click xem / chuyển sang: ${step.label}`}
                                        >
                                            <div className="hd-step-circle-mini">
                                                {isCompleted ? "✓" : step.number}
                                            </div>
                                            <span className="hd-step-label-mini">
                                                {step.icon} {step.label}
                                            </span>
                                        </div>
                                        {idx < arr.length - 1 && (
                                            <div className={`hd-step-line-mini ${step.number < giaiDoan ? 'filled' : ''}`}></div>
                                        )}
                                    </Fragment>
                                );
                            })}

                            {/* Nấc Giai Đoạn Con:
                                - Chỉ Giai đoạn 2 (Hậu kỳ) mới có 4 trạng thái phụ: Chờ chỉnh, Đang chỉnh, Khách duyệt, Hoàn thành
                                - Các giai đoạn 1, 3, 4 chỉ có 1 trạng thái chính duy nhất
                            */}
                            {giaiDoan === 2 && !['bao_luu', 'huy'].includes(subGiaiDoan) && (
                                <div className="hd-substage-toggle-container">
                                    {[
                                        { key: 'cho_chinh', label: 'Chờ chỉnh', icon: '⏳' },
                                        { key: 'dang_chinh', label: 'Đang chỉnh', icon: '🎨' },
                                        { key: 'khach_duyet', label: 'Khách duyệt', icon: '👀' },
                                        { key: 'hoan_thanh', label: 'Hoàn thành', icon: '✅' },
                                    ].map((subItem) => {
                                        const isCurrent = (subGiaiDoan || 'dang_chinh') === subItem.key;
                                        return (
                                            <button
                                                key={subItem.key}
                                                type="button"
                                                className={`hd-substage-btn ${isCurrent ? 'active' : ''}`}
                                                onClick={() => submitProgressUpdate(2, subItem.key, {})}
                                            >
                                                <span className="hd-substage-btn-icon">{subItem.icon}</span>
                                                <span className="hd-substage-btn-label">{subItem.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Right: Actions */}
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

                                {/* Card 2: Lịch & Phân Công Nhiệm Vụ */}
                                <div className="hd-card" id="hd-card-schedules">
                                    <div className="hd-card-head">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <h3 className="hd-card-title">
                                                <span>📅</span> Lịch & Phân Công Nhiệm Vụ
                                            </h3>
                                            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                                                ({serviceSchedules.length} nhiệm vụ)
                                            </span>
                                        </div>
                                    </div>

                                    <div className="hd-card-body">
                                        {/* Trạng thái chốt lịch & Thợ chỉnh ảnh */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                            <div className="hd-floating-field" style={{ marginBottom: 0 }}>
                                                <label>
                                                    🎨 Thợ chỉnh ảnh
                                                    {!canAssignCrew && <span style={{ fontSize: '0.72rem', color: '#ef4444', marginLeft: '4px', fontWeight: 600 }}>(🔒 Khóa)</span>}
                                                </label>
                                                <select 
                                                    value={thoChinhAnh} 
                                                    disabled={!canAssignCrew}
                                                    style={!canAssignCrew ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed', opacity: 0.8 } : {}}
                                                    onChange={(e) => {
                                                        if (!canAssignCrew) {
                                                            toast.error("Bạn chưa được cấp quyền phân công hoặc thay đổi thợ!");
                                                            return;
                                                        }
                                                        setThoChinhAnh(e.target.value);
                                                    }}
                                                >
                                                    <option value="">Chưa phân công</option>
                                                    {listStaff.filter(s => s.positon === 'Thợ chỉnh ảnh').map(s => {
                                                        const name = s.fullname || s.username;
                                                        return <option key={s.username || s._id || name} value={name}>{name}</option>;
                                                    })}
                                                </select>
                                            </div>
                                            <div className="hd-floating-field" style={{ marginBottom: 0 }}>
                                                <label>📞 Trạng thái chốt lịch</label>
                                                <select value={chotLich} onChange={(e) => setChotLich(e.target.value)}>
                                                    <option value="Chưa gọi điện">Chưa gọi điện</option>
                                                    <option value="Đã gọi điện xác nhận">Đã gọi điện xác nhận</option>
                                                    <option value="Đã chốt lịch">Đã chốt lịch</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Nếu hợp đồng là Pre-Wedding (hoặc có ngày ăn hỏi / ngày cưới) thì có thêm ô nhập Ngày Ăn Hỏi và Ngày Cưới */}
                                        {isPreWContract && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                                                <div className="hd-floating-field" style={{ marginBottom: 0 }}>
                                                    <label>💍 Ngày ăn hỏi</label>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                                                        <LunarDateTimePicker
                                                            value={ngayAnHoi ? dayjs(ngayAnHoi) : null}
                                                            onChange={(newValue) => setNgayAnHoi(newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '')}
                                                            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                                            format="DD/MM/YYYY HH:mm"
                                                        />
                                                    </LocalizationProvider>
                                                    {ngayAnHoi && (
                                                        <div className="hd-lunar-tag">
                                                            🌙 Âm lịch: {formatLunarDateFull(ngayAnHoi)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="hd-floating-field" style={{ marginBottom: 0 }}>
                                                    <label>💒 Ngày cưới</label>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                                                        <LunarDateTimePicker
                                                            value={ngayCuoi ? dayjs(ngayCuoi) : null}
                                                            onChange={(newValue) => setNgayCuoi(newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '')}
                                                            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                                            format="DD/MM/YYYY HH:mm"
                                                        />
                                                    </LocalizationProvider>
                                                    {ngayCuoi && (
                                                        <div className="hd-lunar-tag">
                                                            🌙 Âm lịch: {formatLunarDateFull(ngayCuoi)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Ngày trả ảnh */}
                                        <div className="hd-floating-field" style={{ marginBottom: '10px' }}>
                                            <label>📦 Ngày trả ảnh</label>
                                            <input 
                                                type="date" 
                                                value={ngayTraAnh} 
                                                onChange={(e) => setNgayTraAnh(e.target.value)} 
                                            />
                                            {ngayTraAnh && (
                                                <div className="hd-lunar-tag">
                                                    🌙 Âm lịch: {formatLunarDateFull(ngayTraAnh)}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '12px 0 10px 0' }} />

                                        {/* Nút thêm lịch phân công thủ công */}
                                        <div className="hd-schedule-add-bar">
                                            <div className="hd-schedule-add-title">➕ Thêm lịch phân công nhiệm vụ:</div>
                                            <button
                                                type="button"
                                                className="hd-schedule-add-btn btn-photo"
                                                onClick={() => handleAddSchedule('photo')}
                                                title="Thêm nhiệm vụ Chụp ảnh"
                                            >
                                                <span>📸</span> + Chụp ảnh
                                            </button>
                                            <button
                                                type="button"
                                                className="hd-schedule-add-btn btn-makeup"
                                                onClick={() => handleAddSchedule('makeup')}
                                                title="Thêm nhiệm vụ Trang điểm"
                                            >
                                                <span>💄</span> + Trang điểm
                                            </button>
                                            <button
                                                type="button"
                                                className="hd-schedule-add-btn btn-video"
                                                onClick={() => handleAddSchedule('video')}
                                                title="Thêm nhiệm vụ Quay phim"
                                            >
                                                <span>🎥</span> + Quay phim
                                            </button>
                                            <button
                                                type="button"
                                                className="hd-schedule-add-btn btn-bts"
                                                onClick={() => handleAddSchedule('bts')}
                                                title="Thêm nhiệm vụ Hậu trường"
                                            >
                                                <span>🎬</span> + Hậu trường
                                            </button>
                                            <button
                                                type="button"
                                                className="hd-schedule-add-btn btn-cskh"
                                                onClick={() => handleAddSchedule('cskh')}
                                                title="Thêm nhiệm vụ Chăm sóc khách hàng"
                                            >
                                                <span>📞</span> + Chăm sóc KH
                                            </button>
                                            <button
                                                type="button"
                                                className="hd-schedule-add-btn btn-support"
                                                onClick={() => handleAddSchedule('support')}
                                                title="Thêm nhiệm vụ Hỗ trợ"
                                            >
                                                <span>🤝</span> + Hỗ trợ
                                            </button>
                                        </div>

                                        {serviceSchedules.length > 0 ? (
                                            serviceSchedules.map((sch, schIdx) => {
                                                const currentType = sch.serviceType || 'photo';
                                                const isShoot = currentType === 'photo';
                                                const isMakeup = currentType === 'makeup';
                                                const isVideo = currentType === 'video';
                                                const isBTS = currentType === 'bts';
                                                const isCSKH = currentType === 'cskh';
                                                const isSupport = currentType === 'support';

                                                let cardTypeClass = 'type-photo';
                                                let timeLabel = '⏰ Thời gian chụp hình *';
                                                let staffLabel = '📸 Phân công thợ Chụp';
                                                let quickLocations = ['Tại Studio', 'Phim trường', 'Ngoại cảnh', 'Tại gia đình'];

                                                if (isMakeup) {
                                                    cardTypeClass = 'type-makeup';
                                                    timeLabel = '⏰ Thời gian trang điểm *';
                                                    staffLabel = '💄 Phân công thợ Makeup';
                                                    quickLocations = ['Tại Studio', 'Nhà riêng cô dâu', 'Tại tiệc cưới', 'Tại gia đình'];
                                                } else if (isVideo) {
                                                    cardTypeClass = 'type-video';
                                                    timeLabel = '⏰ Thời gian quay phim *';
                                                    staffLabel = '🎥 Phân công thợ Quay phim';
                                                    quickLocations = ['Tại Studio', 'Phim trường', 'Ngoại cảnh', 'Tại gia đình', 'Tiệc cưới'];
                                                } else if (isBTS) {
                                                    cardTypeClass = 'type-bts';
                                                    timeLabel = '⏰ Thời gian quay/chụp hậu trường *';
                                                    staffLabel = '🎬 Phân công nhân sự Hậu trường';
                                                    quickLocations = ['Tại Studio', 'Phim trường', 'Ngoại cảnh', 'Phòng makeup', 'Đoàn ekip'];
                                                } else if (isCSKH) {
                                                    cardTypeClass = 'type-cskh';
                                                    timeLabel = '⏰ Thời gian CSKH / Hẹn *';
                                                    staffLabel = '📞 Nhân viên CSKH';
                                                    quickLocations = ['Tại Studio', 'Gọi điện thoại', 'Nhà khách hàng'];
                                                } else if (isSupport) {
                                                    cardTypeClass = 'type-support';
                                                    timeLabel = '⏰ Thời gian hỗ trợ *';
                                                    staffLabel = '🤝 Nhân viên Hỗ trợ';
                                                    quickLocations = ['Tại Studio', 'Địa điểm chụp', 'Hội trường cưới'];
                                                }

                                                return (
                                                    <div 
                                                        key={sch.id || schIdx} 
                                                        id={`schedule-card-${sch.id}`}
                                                        className={`hd-schedule-card ${cardTypeClass} ${highlightedScheduleId === sch.id ? 'schedule-pulse-highlight' : ''}`}
                                                    >
                                                        <div className="hd-schedule-card-header">
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
                                                                <select
                                                                    className="hd-schedule-type-select"
                                                                    value={currentType}
                                                                    onChange={(e) => handleScheduleFieldChange(sch.id, 'serviceType', e.target.value)}
                                                                >
                                                                    <option value="photo">📸 Chụp ảnh</option>
                                                                    <option value="makeup">💄 Trang điểm</option>
                                                                    <option value="video">🎥 Quay phim</option>
                                                                    <option value="bts">🎬 Hậu trường</option>
                                                                    <option value="cskh">📞 Chăm sóc khách hàng</option>
                                                                    <option value="support">🤝 Hỗ trợ</option>
                                                                </select>
                                                                <span className="hd-schedule-turn-badge">
                                                                    Lượt {sch.luot || (schIdx + 1)}
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveManualSchedule(sch.id || sch._id)}
                                                                className="hd-schedule-delete-btn"
                                                                title="Xóa nhiệm vụ này"
                                                            >
                                                                ✕ Xóa
                                                            </button>
                                                        </div>

                                                        <div className="hd-schedule-fields-grid">
                                                            {/* Dịch vụ liên kết trong giỏ hàng */}
                                                            <div className="hd-floating-field">
                                                                <label>🔗 Dịch vụ / Gói liên kết trong giỏ hàng</label>
                                                                <select
                                                                    value={sch.serviceId || ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        const targetItem = (gioHang || []).find(item => {
                                                                            const sId = item.dichVu?._id || item.dichVu || item._id || item.maDichVu;
                                                                            return sId === val;
                                                                        });
                                                                        handleScheduleFieldChange(sch.id, 'serviceId', val);
                                                                        if (targetItem) {
                                                                            const itemName = targetItem.tenDichVuSnapshot || targetItem.tenDichVu;
                                                                            if (!sch.serviceName || sch.serviceName === 'Chụp ảnh' || sch.serviceName === 'Quay phim' || sch.serviceName === 'Trang điểm') {
                                                                                handleScheduleFieldChange(sch.id, 'serviceName', `${itemName} - ${currentType}`);
                                                                            }
                                                                            if (!sch.ghiChu || sch.ghiChu.startsWith('Gắn với:')) {
                                                                                handleScheduleFieldChange(sch.id, 'ghiChu', `Gắn với: ${itemName}`);
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    <option value="">-- Tự do / Không gắn gói cụ thể --</option>
                                                                    {(gioHang || []).map((cartItem, cIdx) => {
                                                                        const cId = cartItem.dichVu?._id || cartItem.dichVu || cartItem._id || cartItem.maDichVu || `ITEM_${cIdx}`;
                                                                        const cName = cartItem.tenDichVuSnapshot || cartItem.tenDichVu || `Gói #${cIdx + 1}`;
                                                                        return (
                                                                            <option key={cId || cIdx} value={cId}>
                                                                                📦 {cName} {cartItem.maDichVu ? `(${cartItem.maDichVu})` : ''}
                                                                            </option>
                                                                        );
                                                                    })}
                                                                </select>
                                                            </div>

                                                            {/* Tên / Nội dung nhiệm vụ */}
                                                            <div className="hd-floating-field">
                                                                <label>📌 Nội dung nhiệm vụ phân công *</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="VD: Chụp phóng sự tiệc cưới, Makeup cô dâu tại nhà..."
                                                                    value={sch.serviceName || ''}
                                                                    onChange={(e) => handleScheduleFieldChange(sch.id, 'serviceName', e.target.value)}
                                                                />
                                                            </div>

                                                            {/* Thời gian */}
                                                            <div className="hd-floating-field">
                                                                <label>{timeLabel}</label>
                                                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                                                                    <LunarDateTimePicker
                                                                        value={sch.ngayGio ? dayjs(sch.ngayGio) : null}
                                                                        onChange={(newValue) => {
                                                                            const formatted = newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '';
                                                                            handleScheduleFieldChange(sch.id, 'ngayGio', formatted);
                                                                            if (formatted && isShoot) {
                                                                                const conflict = checkNgayChupConflict(formatted, data?._id);
                                                                                if (conflict) {
                                                                                    const conflictTime = new Date(conflict.cacNgay.ngayChup);
                                                                                    const timeStr = `${String(conflictTime.getHours()).padStart(2, '0')}:${String(conflictTime.getMinutes()).padStart(2, '0')} ngày ${conflictTime.getDate()}/${conflictTime.getMonth() + 1}/${conflictTime.getFullYear()}`;
                                                                                    toast.warning(`Cảnh báo: Trùng/gần lịch chụp với HĐ ${conflict.maHopDong} lúc ${timeStr}.`);
                                                                                }
                                                                            }
                                                                        }}
                                                                        slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                                                        format="DD/MM/YYYY HH:mm"
                                                                    />
                                                                </LocalizationProvider>
                                                                {sch.ngayGio && (
                                                                    <div className="hd-lunar-tag">
                                                                        🌙 Âm lịch: {formatLunarDateFull(sch.ngayGio)}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Địa điểm */}
                                                            <div className="hd-floating-field">
                                                                <label>📍 Địa điểm *</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder={isShoot ? "VD: Tại Studio, Phim trường, Ngoại cảnh..." : "VD: Nhà riêng cô dâu, Studio..."}
                                                                    value={sch.diaDiem || ''}
                                                                    onChange={(e) => handleScheduleFieldChange(sch.id, 'diaDiem', e.target.value)}
                                                                />
                                                                <div className="hd-quick-chips">
                                                                    {quickLocations.map(chip => (
                                                                        <button
                                                                            key={chip}
                                                                            type="button"
                                                                            className="hd-quick-chip-btn"
                                                                            onClick={() => handleScheduleFieldChange(sch.id, 'diaDiem', chip)}
                                                                        >
                                                                            {chip}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Phân công nhân viên */}
                                                            <div className="hd-floating-field">
                                                                <label>{staffLabel}
                                                                    {!canAssignCrew && (
                                                                        <span style={{ fontSize: '0.72rem', color: '#ef4444', marginLeft: '6px', fontWeight: 600 }}>
                                                                            (🔒 Cần quyền phân công)
                                                                        </span>
                                                                    )}
                                                                </label>
                                                                <select
                                                                    value={sch.nhanVien || ''}
                                                                    disabled={!canAssignCrew}
                                                                    title={!canAssignCrew ? "Bạn chưa được cấp quyền phân công thợ" : ""}
                                                                    style={!canAssignCrew ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed', opacity: 0.8 } : {}}
                                                                    onChange={(e) => handleScheduleFieldChange(sch.id, 'nhanVien', e.target.value)}
                                                                >
                                                                    <option value="">Chưa phân công</option>
                                                                    {(() => {
                                                                        let preferredRole = '';
                                                                        if (isShoot) preferredRole = 'Thợ chụp hình';
                                                                        else if (isMakeup) preferredRole = 'Thợ trang điểm';
                                                                        else if (isVideo) preferredRole = 'Thợ quay phim';
                                                                        else if (isBTS) preferredRole = 'Thợ quay phim';
                                                                        else if (isCSKH) preferredRole = 'Nhân viên Sale';

                                                                        const preferredStaff = preferredRole ? listStaff.filter(s => s.positon === preferredRole || (isBTS && s.positon === 'Thợ chụp hình')) : [];
                                                                        const otherStaff = preferredRole ? listStaff.filter(s => s.positon !== preferredRole && !(isBTS && s.positon === 'Thợ chụp hình')) : listStaff;

                                                                        return (
                                                                            <>
                                                                                {preferredStaff.length > 0 && (
                                                                                    <optgroup label={`-- Phù hợp (${preferredRole}) --`}>
                                                                                        {preferredStaff.map(s => {
                                                                                            const name = s.fullname || s.username;
                                                                                            return <option key={s.username || s._id || name} value={name}>{name}</option>;
                                                                                        })}
                                                                                    </optgroup>
                                                                                )}
                                                                                <optgroup label="-- Tất cả nhân viên --">
                                                                                    {otherStaff.map(s => {
                                                                                        const name = s.fullname || s.username;
                                                                                        return <option key={s.username || s._id || name} value={name}>{name} {s.positon ? `(${s.positon})` : ''}</option>;
                                                                                    })}
                                                                                </optgroup>
                                                                            </>
                                                                        );
                                                                    })()}
                                                                </select>
                                                            </div>

                                                            {/* Ghi chú */}
                                                            <div className="hd-floating-field">
                                                                <label>📝 Ghi chú yêu cầu</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Ghi chú yêu cầu nếu có..."
                                                                    value={sch.ghiChu || ''}
                                                                    onChange={(e) => handleScheduleFieldChange(sch.id, 'ghiChu', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="hd-schedule-empty">
                                                <div>📋 <strong>Chưa có lịch phân công nhiệm vụ nào</strong></div>
                                                <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#64748b' }}>
                                                    Bấm vào các nút <strong>+ Chụp ảnh</strong>, <strong>+ Trang điểm</strong>, <strong>+ Quay phim</strong>, <strong>+ Hậu trường</strong>, <strong>+ Chăm sóc KH</strong>, <strong>+ Hỗ trợ</strong> ở trên để thêm lịch phân công nhiệm vụ.
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>

                            {/* ================= COLUMN 2: SẢN PHẨM & QUY CÁCH ================= */}
                            <div className="hd-bento-col">
                                {/* Card 4: Giỏ hàng */}
                                <div className="hd-card">
                                    <div className="hd-card-head">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <h3 className="hd-card-title">
                                                <span>🛒</span> Giỏ hàng
                                            </h3>
                                            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                                                ({Array.isArray(gioHang) ? gioHang.length : 0} mục)
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const nextH = cartHeight <= 260 ? 480 : 260;
                                                    setCartHeight(nextH);
                                                    try {
                                                        localStorage.setItem('hd_cart_table_height', nextH.toString());
                                                    } catch (err) {}
                                                }}
                                                title={cartHeight <= 260 ? "Mở rộng chiều cao giỏ hàng" : "Thu gọn về mặc định"}
                                                style={{
                                                    fontSize: '0.7rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #cbd5e1',
                                                    background: '#fff',
                                                    color: '#475569',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontWeight: 600
                                                }}
                                            >
                                                <span>↕</span> {cartHeight <= 260 ? 'Mở rộng' : 'Thu gọn'}
                                            </button>
                                        </div>
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
                                                 {suggestions.map(p => {
                                                     const isThiep = isWeddingCardService(p);
                                                     const price = Number(p.giaChoThueDichVu || p.donGia || p.giaTriDichVu) || 0;
                                                     return (
                                                         <li key={p.maDichVu || p._id} onClick={() => handleSelectProduct(p)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                                                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                 {p.imageDichVu ? (
                                                                     <img src={p.imageDichVu} alt={p.tenDichVu} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                                                 ) : isThiep ? (
                                                                     <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>💌</div>
                                                                 ) : null}
                                                                 <div>
                                                                     <div className="p-name" style={{ fontWeight: 600, color: '#0f172a' }}>
                                                                         {isThiep && (
                                                                             <span style={{ fontSize: '0.68rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px', marginRight: '6px', fontWeight: 700 }}>
                                                                                 💌 Thiệp Online
                                                                             </span>
                                                                         )}
                                                                         {p.tenDichVu}
                                                                     </div>
                                                                     <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                                                                         Mã: <strong style={{ color: '#0369a1' }}>{p.maDichVu}</strong>
                                                                     </div>
                                                                 </div>
                                                             </div>
                                                             <span className="p-price" style={{ fontWeight: 700, color: '#0284c7' }}>
                                                                 {price > 0 ? (price.toLocaleString("vi-VN") + " đ") : 'Miễn phí'}
                                                             </span>
                                                         </li>
                                                     );
                                                 })}
                                             </ul>
                                        )}
                                    </div>

                                    {/* Table Resizable */}
                                    <div 
                                        className="hd-cart-table-wrap"
                                        style={{ height: `${cartHeight}px` }}
                                    >
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
                                                        const price = (item.donGia !== undefined && item.donGia !== null && item.donGia !== '') 
        ? Number(item.donGia) 
        : Number(item.giaChoThueDichVu || item.giaTriDichVu || item.dichVu?.giaChoThueDichVu || item.dichVu?.giaTriDichVu || 0);
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
                                                            <tr 
                                                                key={productId || index}
                                                                onContextMenu={(e) => handleCartRowContextMenu(e, item)}
                                                                className={serviceContextMenu?.item === item ? "hd-cart-row-context" : ""}
                                                                title="Nhấp chuột phải để thêm lịch phân công nhiệm vụ cho gói này"
                                                                style={{ cursor: 'context-menu' }}
                                                            >
                                                                <td style={{ fontWeight: 600, color: '#0f172a' }}>
                                                                    {item.tenDichVuSnapshot || item.tenDichVu}
                                                                    {item.maDichVu && (
                                                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.maDichVu}</div>
                                                                    )}
                                                                    {/* Huy hiệu các lịch phân công gắn với gói này */}
                                                                    {(() => {
                                                                        const itemIdentifier = item.dichVu?._id || item.dichVu || item._id || item.maDichVu;
                                                                        const itemName = item.tenDichVuSnapshot || item.tenDichVu || '';
                                                                        const linkedSchedules = (serviceSchedules || []).filter(sch => 
                                                                            (sch.serviceId && (sch.serviceId === itemIdentifier || sch.serviceId === item._id || sch.serviceId === item.maDichVu)) ||
                                                                            (itemName && sch.serviceName && sch.serviceName.includes(itemName)) ||
                                                                            (itemName && sch.ghiChu && sch.ghiChu.includes(itemName))
                                                                        );

                                                                        if (linkedSchedules.length === 0) return null;

                                                                        const typeIcons = {
                                                                            photo: '📸',
                                                                            makeup: '💄',
                                                                            video: '🎥',
                                                                            bts: '🎬',
                                                                            cskh: '📞',
                                                                            support: '🤝'
                                                                        };
                                                                        const typeNames = {
                                                                            photo: 'Chụp',
                                                                            makeup: 'Make',
                                                                            video: 'Quay',
                                                                            bts: 'Hậu trường',
                                                                            cskh: 'CSKH',
                                                                            support: 'Hỗ trợ'
                                                                        };

                                                                        return (
                                                                            <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                                                {linkedSchedules.map(sch => {
                                                                                    const icon = typeIcons[sch.serviceType] || '📅';
                                                                                    const typeName = typeNames[sch.serviceType] || sch.serviceType;
                                                                                    const badgeClass = `badge-${sch.serviceType || 'photo'}`;
                                                                                    return (
                                                                                        <button
                                                                                            key={sch.id}
                                                                                            type="button"
                                                                                            className={`hd-cart-linked-schedule-badge ${badgeClass}`}
                                                                                            title={`Nhấp để chuyển đến: ${sch.serviceName || typeName}`}
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                const el = document.getElementById(`schedule-card-${sch.id}`);
                                                                                                if (el) {
                                                                                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                                                                    setHighlightedScheduleId(sch.id);
                                                                                                    setTimeout(() => setHighlightedScheduleId(null), 2500);
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            {icon} {typeName} L{sch.luot || 1}{sch.nhanVien ? `: ${sch.nhanVien}` : ''}
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                    {isWeddingCardService(item) && (
                                                                        <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                            <span style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 'bold' }}>💌 Mã loại thiệp:</span>
                                                                            <select
                                                                                value={item.maLoaiThiep || ''}
                                                                                onChange={(e) => {
                                                                                    const val = e.target.value;
                                                                                    const optText = e.target.options[e.target.selectedIndex]?.text || '';
                                                                                    handleThiepTemplateChange(productId, val, optText);
                                                                                }}
                                                                                style={{
                                                                                    padding: '2px 6px',
                                                                                    fontSize: '0.74rem',
                                                                                    borderRadius: '4px',
                                                                                    border: '1px solid #cbd5e1',
                                                                                    backgroundColor: '#fff',
                                                                                    color: '#0f172a',
                                                                                    fontWeight: '600',
                                                                                    outline: 'none'
                                                                                }}
                                                                            >
                                                                                <option value="">-- Mặc định (Tất cả mẫu) --</option>
                                                                                <option value="tpl-luxury-gold">Hoàng Gia Ánh Kim (tpl-luxury-gold)</option>
                                                                                <option value="tpl-romantic-rose">Nàng Thơ Hoa Hồng (tpl-romantic-rose)</option>
                                                                                <option value="tpl-modern-minimal">Tối Giản Thanh Lịch (tpl-modern-minimal)</option>
                                                                                <option value="tpl-botanical-garden">Cỏ Hoa Rustic (tpl-botanical-garden)</option>
                                                                                <option value="tpl-royal-red">Son Hỷ Á Đông (tpl-royal-red)</option>
                                                                                <option value="tpl-korean-pastel">Hàn Quốc Dịu Êm (tpl-korean-pastel)</option>
                                                                                <option value="tpl-dreamy-fairytale">Lâu Đài Cổ Tích (tpl-dreamy-fairytale)</option>
                                                                            </select>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td style={{ textAlign: "center" }}>
                                                                    <div className="hd-qty-box-mini">
                                                                        <button
                                                                            type="button"
                                                                            className="hd-qty-btn-mini"
                                                                            onClick={() => handleDecreaseQuantity(productId, index)}
                                                                            disabled={!canDecrease}
                                                                            style={{ opacity: !canDecrease ? 0.3 : 1 }}
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            className="hd-qty-input-mini"
                                                                            value={item.soLuong}
                                                                            onChange={(e) => handleQuantityChange(productId, index, e.target.value)}
                                                                        />
                                                                        <button type="button" className="hd-qty-btn-mini" onClick={() => handleSelectProduct(item)}>+</button>
                                                                    </div>
                                                                </td>
                                                                {isTechnician ? (
                                                                    <td style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem' }}>*** đ</td>
                                                                ) : (
                                                                    <td style={{ fontWeight: 600 }}>{price.toLocaleString("vi-VN")} đ</td>
                                                                )}
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
                                                                {isTechnician ? (
                                                                    <td style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem' }}>*** đ</td>
                                                                ) : (
                                                                    <td style={{ fontWeight: 700, color: '#0284c7' }}>
                                                                        {total.toLocaleString("vi-VN")} đ
                                                                        {discountItem > 0 && (
                                                                            <div style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 600 }}>
                                                                                (-{discountItem.toLocaleString("vi-VN")} đ)
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                )}
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
                                    <div 
                                        onMouseDown={handleStartResizeCart}
                                        className={`hd-cart-resize-handle ${isDraggingCart ? 'active' : ''}`}
                                        title="Nhấn giữ và kéo lên/xuống để điều chỉnh chiều cao giỏ hàng"
                                    />
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

                                        {(voucherCode || data?.thanhToan?.voucherCode) && (
                                            <div className="hd-pay-row" style={{ color: '#15803d', fontSize: '0.78rem' }}>
                                                <span>↳ Voucher (<strong>{voucherCode || data?.thanhToan?.voucherCode}</strong>):</span>
                                                <b>-{(voucherGiamGia || data?.thanhToan?.voucherGiamGia || 0).toLocaleString("vi-VN")} đ</b>
                                            </div>
                                        )}

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
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={handleSaveDriveLinksQuick}
                                            disabled={isSavingDriveLinks}
                                            sx={{
                                                backgroundColor: '#0284c7',
                                                color: '#fff',
                                                textTransform: 'none',
                                                fontSize: '0.74rem',
                                                fontWeight: 700,
                                                height: '28px',
                                                whiteSpace: 'nowrap',
                                                '&:hover': { backgroundColor: '#0369a1' }
                                            }}
                                        >
                                            {isSavingDriveLinks ? "Đang lưu..." : "💾 Lưu đường dẫn"}
                                        </Button>
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

                                        {/* Đường dẫn Drive bổ sung do người dùng tự đặt tên */}
                                        <div className="hd-extra-drive-section">
                                            <div className="hd-extra-drive-header-bar">
                                                <div className="hd-extra-drive-header-title">
                                                    <span>📁</span> Đường dẫn bổ sung ({(extraDriveLinks || []).length})
                                                </div>
                                            </div>

                                            {(extraDriveLinks || []).map((linkItem, lIdx) => (
                                                <div key={linkItem.id || lIdx} className="hd-extra-drive-item">
                                                    <div className="hd-extra-drive-top-row">
                                                        <input
                                                            className="hd-extra-drive-name-input"
                                                            value={linkItem.name || ""}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setExtraDriveLinks(prev => (prev || []).map((item, idx) => idx === lIdx ? { ...item, name: val } : item));
                                                            }}
                                                            placeholder="Tên đường dẫn (VD: Ảnh phóng 60x90, Video cưới...)"
                                                        />
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setExtraDriveLinks(prev => (prev || []).filter((_, idx) => idx !== lIdx));
                                                            }}
                                                            title="Xóa đường dẫn này"
                                                            sx={{ color: '#ef4444', p: 0.5 }}
                                                        >
                                                            <span style={{ fontSize: '0.85rem' }}>🗑️</span>
                                                        </IconButton>
                                                    </div>

                                                    <div className="hd-extra-drive-url-row">
                                                        <input
                                                            className="hd-input-text"
                                                            value={linkItem.url || ""}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setExtraDriveLinks(prev => (prev || []).map((item, idx) => idx === lIdx ? { ...item, url: val } : item));
                                                            }}
                                                            placeholder="https://drive.google.com/drive/folders/..."
                                                            style={{ flex: 1, fontSize: '0.78rem' }}
                                                        />
                                                        {linkItem.url && (
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={() => window.open(linkItem.url, '_blank')}
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    fontSize: '0.74rem',
                                                                    fontWeight: 600,
                                                                    minWidth: 'auto',
                                                                    px: 1.2,
                                                                    height: '32px'
                                                                }}
                                                                title="Mở trong tab mới"
                                                            >
                                                                🔗 Mở
                                                            </Button>
                                                        )}
                                                        {linkItem.url && (
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(linkItem.url);
                                                                    toast.success(`Đã sao chép: ${linkItem.name || 'Đường dẫn'}`);
                                                                }}
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    fontSize: '0.74rem',
                                                                    fontWeight: 600,
                                                                    minWidth: 'auto',
                                                                    px: 1.2,
                                                                    height: '32px'
                                                                }}
                                                                title="Sao chép đường dẫn"
                                                            >
                                                                📋 Copy
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                className="hd-btn-add-drive-link"
                                                onClick={() => {
                                                    setExtraDriveLinks(prev => [
                                                        ...(prev || []),
                                                        {
                                                            id: `drive-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                                            name: `Đường dẫn ${(extraDriveLinks || []).length + 1}`,
                                                            url: '',
                                                            createdAt: new Date().toISOString()
                                                        }
                                                    ]);
                                                }}
                                            >
                                                <span>➕</span> Thêm đường dẫn mới
                                            </button>
                                        </div>

                                        <div style={{ marginTop: '10px', padding: '6px 10px', background: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd', fontSize: '0.76rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span>💡</span>
                                            <span><strong>Mẹo đồng bộ nhanh & ổn định:</strong> Thư mục Google Drive cần bật quyền <em>"Bất kỳ ai có đường liên kết đều có thể xem"</em>. Ưu tiên dùng Google Drive để giữ nguyên chất lượng và tên gốc của ảnh.</span>
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

                                        {/* Card Lịch Sử Hợp Đồng & Tiến Trình (Audit Log & Stage Timeline) */}
                                        <div className="hd-card" style={{ marginTop: '14px' }}>
                                            <div className="hd-card-head" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setHistoryActiveTab('audit')}
                                                        style={{
                                                            background: historyActiveTab === 'audit' ? '#d97706' : '#f1f5f9',
                                                            color: historyActiveTab === 'audit' ? '#fff' : '#475569',
                                                            border: 'none',
                                                            borderRadius: '14px',
                                                            padding: '3px 10px',
                                                            fontSize: '0.74rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        📜 Hoạt động ({(auditLog || []).length})
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setHistoryActiveTab('stage')}
                                                        style={{
                                                            background: historyActiveTab === 'stage' ? '#d97706' : '#f1f5f9',
                                                            color: historyActiveTab === 'stage' ? '#fff' : '#475569',
                                                            border: 'none',
                                                            borderRadius: '14px',
                                                            padding: '3px 10px',
                                                            fontSize: '0.74rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        🕒 Tiến trình ({(lichSuGiaiDoan || []).length})
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setOpenHistoryModal(true)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#2563eb',
                                                        fontSize: '0.74rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '3px'
                                                    }}
                                                    title="Mở toàn màn hình xem đầy đủ lịch sử"
                                                >
                                                    🔍 Xem chi tiết ➔
                                                </button>
                                            </div>

                                            <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '6px 0' }}>
                                                {historyActiveTab === 'audit' ? (
                                                    (!auditLog || auditLog.length === 0) ? (
                                                        <div style={{ textAlign: 'center', padding: '24px 12px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                                            <span>📝</span> Chưa có nhật ký hoạt động nào được ghi lại cho hợp đồng này.
                                                        </div>
                                                    ) : (
                                                        [...auditLog].reverse().map((log, aIdx) => {
                                                            const isNewest = aIdx === 0;
                                                            return (
                                                                <div 
                                                                    key={aIdx} 
                                                                    style={{ 
                                                                        display: 'flex', 
                                                                        gap: '10px', 
                                                                        padding: '8px 12px', 
                                                                        borderBottom: '1px solid #f8fafc', 
                                                                        background: isNewest ? 'rgba(217, 119, 6, 0.04)' : 'transparent', 
                                                                        borderRadius: '6px',
                                                                        marginBottom: '2px'
                                                                    }}
                                                                >
                                                                    <span style={{ fontSize: '1.1rem', lineHeight: 1, marginTop: '2px' }}>
                                                                        {log.action?.includes('Thanh toán') ? '💵' : log.action?.includes('Xóa') ? '🗑️' : log.action?.includes('tiến trình') ? '🔄' : log.action?.includes('phụ lục') ? '➕' : '✏️'}
                                                                    </span>
                                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                            <strong style={{ fontSize: '0.82rem', color: '#1e293b' }}>
                                                                                {log.action || 'Cập nhật hợp đồng'}
                                                                            </strong>
                                                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                                                                {log.timestamp ? new Date(log.timestamp).toLocaleString('vi-VN') : ''}
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px', wordBreak: 'break-word' }}>
                                                                            {log.reason || 'Đã cập nhật thông tin'}
                                                                        </div>
                                                                        {Array.isArray(log.details) && log.details.length > 0 && (
                                                                            <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                                                {log.details.map((d, dIdx) => (
                                                                                    <div key={dIdx} style={{ fontSize: '0.72rem', color: '#64748b', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px' }}>
                                                                                        {d.icon || '•'} <strong>{d.field}</strong>: <span style={{ color: '#dc2626', textDecoration: 'line-through' }}>{d.oldVal}</span> ➔ <span style={{ color: '#16a34a', fontWeight: 700 }}>{d.newVal}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                                                                            Bởi: <strong>{log.performedBy || 'Nhân viên'}</strong> {log.role ? `(${log.role})` : ''}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )
                                                ) : (
                                                    (!lichSuGiaiDoan || lichSuGiaiDoan.length === 0) ? (
                                                        <div style={{ textAlign: 'center', padding: '24px 12px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                                            Chưa có lịch sử tiến trình
                                                        </div>
                                                    ) : (
                                                        lichSuGiaiDoan.map((log, lIdx) => {
                                                            const stageNames = { 1: "Chụp hình", 2: "Hậu kỳ", 3: "In ảnh", 4: "Hoàn thành" };
                                                            const subNames = { 
                                                                'dang_thuc_hien': "Đang thực hiện", 
                                                                'cho_chinh': "Chờ chỉnh",
                                                                'dang_chinh': "Đang chỉnh",
                                                                'dang_hau_ky': "Đang chỉnh",
                                                                'dang_chinh_anh': "Đang chỉnh",
                                                                'cho_khach_duyet': "Khách duyệt",
                                                                'khach_duyet_anh': "Khách duyệt",
                                                                'cho_khach_duyet_layout': "Khách duyệt",
                                                                'khach_da_duyet_layout': "Khách duyệt",
                                                                'da_giao_file_goc': "Chờ chỉnh",
                                                                'khach_da_chon_anh': "Chờ chỉnh",
                                                                'da_gui_xuong_in': "Đã gửi xưởng in",
                                                                'studio_da_nhan_hang': "Đã nhận tại Studio",
                                                                'da_tra_khach': "Đã bàn giao khách",
                                                                'hoan_thanh': "Hoàn thành",
                                                                'bao_luu': "Bảo lưu",
                                                                'huy': "Đã hủy"
                                                            };
                                                            const showSubInLog = Number(log.giaiDoan) === 2 || ['bao_luu', 'huy'].includes(log.subGiaiDoan);
                                                            return (
                                                                <div key={lIdx} style={{ display: 'flex', gap: '10px', padding: '8px 12px', borderBottom: '1px solid #f8fafc', background: lIdx === lichSuGiaiDoan.length - 1 ? 'rgba(217, 119, 6, 0.04)' : 'transparent', borderRadius: '6px' }}>
                                                                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>
                                                                        {log.giaiDoan === 1 ? '📸' : log.giaiDoan === 2 ? '🎨' : log.giaiDoan === 3 ? '🖼️' : '🏁'}
                                                                    </span>
                                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                            <strong style={{ fontSize: '0.84rem', color: '#1e293b' }}>
                                                                                {stageNames[log.giaiDoan] || `Bước ${log.giaiDoan}`}{showSubInLog ? ` (${subNames[log.subGiaiDoan] || log.subGiaiDoan})` : ''}
                                                                            </strong>
                                                                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                                                                {log.thoiGian ? new Date(log.thoiGian).toLocaleString('vi-VN') : ''}
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                                                                            {log.ghiChu || 'Cập nhật tiến trình'}
                                                                        </div>
                                                                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                                                                            Bởi: <strong>{log.nguoiThucHien || 'Nhân viên'}</strong> {log.vaiTro ? `(${log.vaiTro})` : ''}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )
                                                )}
                                            </div>
                                        </div>
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
                                onClick={() => setOpenClientPortalModal(true)}
                                variant="contained"
                                size="small"
                                startIcon={<FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: '0.7rem' }} />}
                                sx={{
                                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    textTransform: 'none',
                                    borderRadius: '6px',
                                    px: 1.5,
                                    height: '32px',
                                    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
                                    '&:hover': { background: '#0284c7' }
                                }}
                                title="Mở link hoặc mã QR gửi Cô Dâu - Chú Rể tra cứu tiến độ & duyệt ảnh"
                            >
                                Cổng Khách Hàng
                            </Button>

                            {!isTechnician && (
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
                            )}

                            <Button
                                onClick={() => setOpenHistoryModal(true)}
                                variant="outlined"
                                color="secondary"
                                size="small"
                                startIcon={<span>📜</span>}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    borderRadius: '6px',
                                    px: 1.5,
                                    height: '32px',
                                    borderColor: '#cbd5e1',
                                    color: '#475569',
                                    '&:hover': { borderColor: '#d97706', background: '#fffbeb', color: '#b45309' }
                                }}
                            >
                                Lịch Sử HĐ ({(auditLog || []).length})
                            </Button>

                            <Button
                                onClick={() => {
                                    if (hasChanges) {
                                        setPendingChanges(currentDiff);
                                        setOpenConfirmSaveDialog(true);
                                    } else {
                                        onUpdateHopDong([]);
                                    }
                                }}
                                variant="contained"
                                size="small"
                                sx={{
                                    background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%) !important',
                                    color: '#ffffff !important',
                                    fontWeight: 800,
                                    fontSize: '0.82rem',
                                    textTransform: 'none',
                                    borderRadius: '6px',
                                    px: 2.5,
                                    height: '32px',
                                    cursor: 'pointer',
                                    opacity: 1,
                                    boxShadow: '0 2px 10px rgba(212, 175, 55, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    '&:hover': { 
                                        background: '#a17e20 !important',
                                        boxShadow: '0 4px 14px rgba(212, 175, 55, 0.5)'
                                    }
                                }}
                                title={hasChanges ? `Có ${currentDiff.length} thay đổi chưa lưu. Nhấn để lưu.` : "Nhấn để lưu / đồng bộ hợp đồng"}
                            >
                                <span>💾 Lưu</span>
                                {hasChanges && (
                                    <span style={{
                                        background: '#dc2626',
                                        color: '#ffffff',
                                        borderRadius: '10px',
                                        fontSize: '0.68rem',
                                        fontWeight: 800,
                                        padding: '1px 6px',
                                        lineHeight: 1.2
                                    }}>
                                        {currentDiff.length}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </Dialog>

                {/* Dialog nhập liệu thông tin tiến trình */}
                <Dialog open={openProgressInput} onClose={() => setOpenProgressInput(false)} maxWidth="sm" fullWidth>
                    <div style={{ padding: '24px', fontFamily: "'Inter', 'Plus Jakarta Sans', -apple-system, Roboto, sans-serif" }}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#1976d2', borderBottom: '1px solid #eee', paddingBottom: '8px', fontWeight: 700 }}>
                            Cập nhật tiến trình: {targetStep === 1 ? "📸 Chụp hình" : targetStep === 2 ? "🎨 Hậu kỳ" : targetStep === 3 ? "🖼️ In ảnh" : "🏁 Hoàn tất hợp đồng"}
                        </h3>

                        {targetStep === 1 && (
                            <div style={{ marginTop: '12px' }}>
                                <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '12px' }}>
                                    Vui lòng nhập đường dẫn thư mục chứa ảnh gốc của khách hàng (Google Drive / Photos):
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

                        {targetStep === 2 && (
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

                        {targetStep === 3 && (
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
                                variant={targetStep === 2 ? "outlined" : "contained"}
                                color="primary"
                                onClick={() => {
                                    if (targetStep === 1) {
                                        submitProgressUpdate(targetStep, subGiaiDoan, { linkAnhGoc: inputLinkAnhGoc.trim() });
                                    } else if (targetStep === 2) {
                                        submitProgressUpdate(targetStep, subGiaiDoan, { linkAnhChinhSua: inputLinkAnhChinhSua.trim() });
                                    } else if (targetStep === 3) {
                                        submitProgressUpdate(targetStep, subGiaiDoan, { danhSachAnhIn: inputDanhSachAnhIn });
                                    }
                                }}
                            >
                                Lưu thông tin
                            </Button>
                            {targetStep === 2 && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => {
                                        submitProgressUpdate(2, 'hoan_thanh', { linkAnhChinhSua: inputLinkAnhChinhSua.trim() });
                                    }}
                                >
                                    Lưu & Đánh dấu Hoàn thành
                                </Button>
                            )}
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

            {/* Modal Cổng Khách Hàng (Portal Link & QR) */}
            <Dialog open={openClientPortalModal} onClose={() => setOpenClientPortalModal(false)} maxWidth="xs" fullWidth>
                <div style={{ padding: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👑</div>
                    <h3 style={{ color: '#0f172a', fontWeight: 800, marginBottom: '6px' }}>Cổng Khách Hàng Long Wedding</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>
                        Gửi đường link hoặc mã QR này cho Cô Dâu & Chú Rể để họ tự tra cứu tiến độ cưới, xem album và duyệt ảnh trực tuyến.
                    </p>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                        <div style={{ background: '#fff', padding: '10px', borderRadius: '12px', display: 'inline-block', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.origin + '/my-wedding/' + data?.maHopDong)}`} 
                                alt="QR Cổng Khách Hàng" 
                                style={{ width: 160, height: 160, display: 'block' }}
                            />
                        </div>
                        <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#334155', fontWeight: 600, wordBreak: 'break-all' }}>
                            {window.location.origin}/my-wedding/{data?.maHopDong}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                const url = `${window.location.origin}/my-wedding/${data?.maHopDong}`;
                                navigator.clipboard.writeText(url);
                                toast.success("Đã sao chép link Cổng Khách Hàng vào bộ nhớ tạm!");
                            }}
                            sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                            📋 Sao chép Link gửi Zalo / Tin nhắn
                        </Button>

                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                                window.open(`/my-wedding/${data?.maHopDong}`, '_blank');
                            }}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            🌐 Mở xem trải nghiệm khách hàng (Tab mới)
                        </Button>

                        <Button
                            variant="text"
                            color="inherit"
                            onClick={() => setOpenClientPortalModal(false)}
                            sx={{ textTransform: 'none', color: '#64748b' }}
                        >
                            Đóng
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Modal Xác Nhận Lưu Thay Đổi Hợp Đồng */}
            <Dialog 
                open={openConfirmSaveDialog} 
                onClose={() => setOpenConfirmSaveDialog(false)} 
                maxWidth="sm" 
                fullWidth
            >
                <div style={{ padding: '24px', fontFamily: "'Inter', sans-serif" }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                        <span style={{ fontSize: '1.6rem' }}>📝</span>
                        <div>
                            <h3 style={{ margin: 0, color: '#0f172a', fontWeight: 800, fontSize: '1.15rem' }}>
                                Xác Nhận Lưu Thay Đổi Hợp Đồng
                            </h3>
                            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                Mã hợp đồng: <strong style={{ color: '#d97706' }}>{maHopDong}</strong> • Có <strong>{pendingChanges.length}</strong> mục được chỉnh sửa
                            </span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                        <p style={{ margin: '0 0 10px 0', fontSize: '0.86rem', color: '#334155', fontWeight: 600 }}>
                            Chi tiết các thông tin vừa thay đổi:
                        </p>
                        <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', padding: '8px' }}>
                            {pendingChanges.map((change, idx) => (
                                <div 
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '10px',
                                        padding: '8px 10px',
                                        background: '#ffffff',
                                        borderRadius: '8px',
                                        marginBottom: idx < pendingChanges.length - 1 ? '6px' : 0,
                                        border: '1px solid #f1f5f9',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                                    }}
                                >
                                    <span style={{ fontSize: '1.1rem', marginTop: '2px' }}>{change.icon || '✏️'}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b' }}>
                                            {change.field}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                                            <span style={{ color: '#dc2626', textDecoration: 'line-through', background: '#fef2f2', padding: '1px 6px', borderRadius: '4px' }}>
                                                {change.oldVal}
                                            </span>
                                            <span style={{ color: '#64748b' }}>➔</span>
                                            <span style={{ color: '#16a34a', fontWeight: 700, background: '#f0fdf4', padding: '1px 6px', borderRadius: '4px' }}>
                                                {change.newVal}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={() => setOpenConfirmSaveDialog(false)}
                            sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setOpenConfirmSaveDialog(false);
                                onUpdateHopDong(pendingChanges);
                            }}
                            sx={{
                                background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                                color: '#ffffff',
                                fontWeight: 800,
                                textTransform: 'none',
                                px: 3,
                                boxShadow: '0 2px 10px rgba(212, 175, 55, 0.4)',
                                '&:hover': { background: '#a17e20' }
                            }}
                        >
                            ✓ Xác nhận lưu
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Modal Xem Toàn Bộ Lịch Sử Hợp Đồng */}
            <Dialog
                open={openHistoryModal}
                onClose={() => setOpenHistoryModal(false)}
                maxWidth="md"
                fullWidth
            >
                <div style={{ padding: '24px', fontFamily: "'Inter', sans-serif" }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.6rem' }}>📜</span>
                            <div>
                                <h3 style={{ margin: 0, color: '#0f172a', fontWeight: 800, fontSize: '1.2rem' }}>
                                    Lịch Sử Hoạt Động Hợp Đồng: {maHopDong}
                                </h3>
                                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                    Theo dõi vết các hoạt động: thêm/sửa/bổ sung/xóa/thanh toán/tiến trình
                                </span>
                            </div>
                        </div>
                        <IconButton onClick={() => setOpenHistoryModal(false)} size="small">
                            ✕
                        </IconButton>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button
                                variant={historyActiveTab === 'audit' ? 'contained' : 'outlined'}
                                size="small"
                                onClick={() => setHistoryActiveTab('audit')}
                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                            >
                                📜 Lịch sử thay đổi ({(auditLog || []).length})
                            </Button>
                            <Button
                                variant={historyActiveTab === 'stage' ? 'contained' : 'outlined'}
                                size="small"
                                onClick={() => setHistoryActiveTab('stage')}
                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                            >
                                🕒 Tiến trình giai đoạn ({(lichSuGiaiDoan || []).length})
                            </Button>
                        </div>
                        <TextField
                            size="small"
                            placeholder="Tìm kiếm lịch sử..."
                            value={historySearchKeyword}
                            onChange={(e) => setHistorySearchKeyword(e.target.value)}
                            sx={{ width: 220 }}
                        />
                    </div>

                    <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', padding: '10px' }}>
                        {historyActiveTab === 'audit' ? (
                            (!auditLog || auditLog.length === 0) ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '6px' }}>📝</div>
                                    Chưa có nhật ký hoạt động nào cho hợp đồng này.
                                </div>
                            ) : (
                                [...auditLog]
                                    .reverse()
                                    .filter(log => {
                                        if (!historySearchKeyword) return true;
                                        const kw = historySearchKeyword.toLowerCase();
                                        return (
                                            (log.action || '').toLowerCase().includes(kw) ||
                                            (log.reason || '').toLowerCase().includes(kw) ||
                                            (log.performedBy || '').toLowerCase().includes(kw)
                                        );
                                    })
                                    .map((log, aIdx) => (
                                        <div 
                                            key={aIdx}
                                            style={{
                                                padding: '12px',
                                                background: '#ffffff',
                                                borderRadius: '8px',
                                                marginBottom: '8px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '1.1rem' }}>
                                                        {log.action?.includes('Thanh toán') ? '💵' : log.action?.includes('Xóa') ? '🗑️' : log.action?.includes('tiến trình') ? '🔄' : log.action?.includes('phụ lục') ? '➕' : '✏️'}
                                                    </span>
                                                    <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                                                        {log.action || 'Cập nhật hợp đồng'}
                                                    </strong>
                                                </div>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>
                                                    {log.timestamp ? new Date(log.timestamp).toLocaleString('vi-VN') : ''}
                                                </span>
                                            </div>

                                            <div style={{ fontSize: '0.84rem', color: '#334155', margin: '6px 0', lineHeight: 1.4 }}>
                                                {log.reason || 'Đã cập nhật thông tin hợp đồng'}
                                            </div>

                                            {Array.isArray(log.details) && log.details.length > 0 && (
                                                <div style={{ margin: '6px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {log.details.map((d, dIdx) => (
                                                        <div key={dIdx} style={{ fontSize: '0.78rem', color: '#475569', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px', borderLeft: '3px solid #d97706' }}>
                                                            {d.icon || '•'} <strong>{d.field}</strong>: <span style={{ color: '#dc2626', textDecoration: 'line-through' }}>{d.oldVal}</span> ➔ <span style={{ color: '#16a34a', fontWeight: 700 }}>{d.newVal}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '6px', borderTop: '1px dashed #f1f5f9', paddingTop: '4px' }}>
                                                Người thực hiện: <strong style={{ color: '#1e293b' }}>{log.performedBy || 'Nhân viên'}</strong> {log.role ? `(${log.role})` : ''}
                                            </div>
                                        </div>
                                    ))
                            )
                        ) : (
                            (!lichSuGiaiDoan || lichSuGiaiDoan.length === 0) ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    Chưa có lịch sử tiến trình giai đoạn
                                </div>
                            ) : (
                                lichSuGiaiDoan.map((log, lIdx) => {
                                    const stageNames = { 1: "Chụp hình", 2: "Hậu kỳ", 3: "In ảnh", 4: "Hoàn thành" };
                                    return (
                                        <div 
                                            key={lIdx}
                                            style={{
                                                padding: '12px',
                                                background: '#ffffff',
                                                borderRadius: '8px',
                                                marginBottom: '8px',
                                                border: '1px solid #e2e8f0',
                                                display: 'flex',
                                                gap: '12px'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.4rem' }}>
                                                {log.giaiDoan === 1 ? '📸' : log.giaiDoan === 2 ? '🎨' : log.giaiDoan === 3 ? '🖼️' : '🏁'}
                                            </span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                                                        {stageNames[log.giaiDoan] || `Bước ${log.giaiDoan}`}
                                                    </strong>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                        {log.thoiGian ? new Date(log.thoiGian).toLocaleString('vi-VN') : ''}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '4px' }}>
                                                    {log.ghiChu || 'Cập nhật tiến trình'}
                                                </div>
                                                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                                                    Bởi: <strong>{log.nguoiThucHien || 'Nhân viên'}</strong> {log.vaiTro ? `(${log.vaiTro})` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <Button
                            variant="outlined"
                            onClick={() => setOpenHistoryModal(false)}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            Đóng
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Context Menu khi chuột phải vào dòng dịch vụ trong giỏ hàng */}
            {serviceContextMenu && (
                <div
                    className="hd-context-menu"
                    style={{
                        left: Math.max(10, Math.min(serviceContextMenu.mouseX, window.innerWidth - 260)),
                        top: Math.max(10, Math.min(serviceContextMenu.mouseY, window.innerHeight - 260))
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="hd-context-header" title={serviceContextMenu.item?.tenDichVuSnapshot || serviceContextMenu.item?.tenDichVu}>
                        📦 {serviceContextMenu.item?.tenDichVuSnapshot || serviceContextMenu.item?.tenDichVu || 'Dịch vụ'}
                    </div>
                    <div className="hd-context-item hd-context-parent">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>📅</span>
                            <span>Thêm lịch phân công</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>▶</span>
                        <div className={`hd-context-submenu ${serviceContextMenu.mouseX > window.innerWidth - 460 ? 'open-left' : ''}`}>
                            <div
                                className="hd-context-subitem"
                                onClick={() => handleAddScheduleFromItem(serviceContextMenu.item, 'photo')}
                            >
                                <span>📸</span> Chụp ảnh
                            </div>
                            <div
                                className="hd-context-subitem"
                                onClick={() => handleAddScheduleFromItem(serviceContextMenu.item, 'makeup')}
                            >
                                <span>💄</span> Trang điểm
                            </div>
                            <div
                                className="hd-context-subitem"
                                onClick={() => handleAddScheduleFromItem(serviceContextMenu.item, 'video')}
                            >
                                <span>🎥</span> Quay phim
                            </div>
                            <div
                                className="hd-context-subitem"
                                onClick={() => handleAddScheduleFromItem(serviceContextMenu.item, 'bts')}
                            >
                                <span>🎬</span> Hậu trường
                            </div>
                            <div
                                className="hd-context-subitem"
                                onClick={() => handleAddScheduleFromItem(serviceContextMenu.item, 'cskh')}
                            >
                                <span>📞</span> Chăm sóc KH
                            </div>
                            <div
                                className="hd-context-subitem"
                                onClick={() => handleAddScheduleFromItem(serviceContextMenu.item, 'support')}
                            >
                                <span>🤝</span> Hỗ trợ ekip
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </Fragment>
    );
}

export default DetailHopDongKhachHangDialog;
