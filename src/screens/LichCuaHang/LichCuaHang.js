import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { useContractTypes } from '../../hooks/useContractTypes';
import { useAuth } from '../Login/AuthContext/AuthContext';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import DetailHopDongKhachHangDialog from '../HopDong/DetailHopDongKhachHangDialog';
import LocAnhMayTinhDialog from '../HopDong/LocAnhMayTinhDialog';
import { getContractStatusInfo, HAU_KY_SUB_STAGES } from '../../utils/contractStatusHelper';
import { hasPermission } from '../../utils/permissionHelper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import './lichcuahang.css';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCamera,
    faWandMagicSparkles,
    faPrint
} from '@fortawesome/free-solid-svg-icons';

import { formatLunarDateShort, formatLunarDateFull, getDetailedLunarInfo, convertLunarToSolar } from '../../utils/lunarDateUtils';

// getDichVuChinhLabel is now retrieved dynamically from useContractTypes hook

const formatDateOnly = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const pad = (n) => n.toString().padStart(2, '0');
    const dd = pad(date.getDate());
    const MM = pad(date.getMonth() + 1);
    const yyyy = date.getFullYear();
    return `${dd}/${MM}/${yyyy}`;
};

const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const pad = (n) => n.toString().padStart(2, '0');
    const dd = pad(date.getDate());
    const MM = pad(date.getMonth() + 1);
    const yyyy = date.getFullYear();
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    return `${hh}:${mm} ${dd}/${MM}/${yyyy}`;
};

const formatTimestampToDateInput = (val) => {
    if (!val) return "";
    const date = new Date(val);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDateTimeInput = (val) => {
    if (!val) return "";
    const date = new Date(val);
    if (isNaN(date.getTime())) return "";
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const isPastToday = (dateString, giaiDoan, tab, subGiaiDoan) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    // Lấy thời điểm bắt đầu của hôm nay (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Kiểm tra xem lịch trình đã hoàn thành chưa
    let isCompleted = false;
    const stageNum = Number(giaiDoan) || 1;
    const isSubDone = subGiaiDoan === 'hoan_thanh';

    if (tab === 'chupHinh' || tab === 'quayPhim' || tab === 'makeUp') {
        isCompleted = stageNum > 1 || (stageNum === 1 && isSubDone);
    } else if (tab === 'hauKy') {
        isCompleted = stageNum > 2 || (stageNum === 2 && isSubDone);
    } else if (tab === 'inAnh') {
        isCompleted = stageNum > 3 || (stageNum === 3 && isSubDone);
    } else if (tab === 'anHoiVaCuoi') {
        isCompleted = stageNum === 4 && isSubDone;
    }
    
    // Báo đỏ nếu ngày lịch trình nhỏ hơn ngày hôm nay và chưa hoàn thành
    return date.getTime() < today.getTime() && !isCompleted;
};

function LichCuaHang() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { getDichVuChinhLabel } = useContractTypes();
    const { user } = useAuth();
    const [hopDong, setHopDong] = useState([]);
    const { showLoading, hideLoading } = useLoading();

    // Kiểm tra quyền Quản trị viên / Quản lý
    const isAdmin = user?.permission === 1 || 
                    user?.positon === "Quản lý" || 
                    user?.positon === "Admin" || 
                    user?.positon === "Quản trị viên" || 
                    user?.chucVu === "Quản lý" || 
                    user?.role === "ADMIN" || 
                    user?.username === "along";

    // Kiểm tra quyền Phân công thợ (Photo / Make / Hậu kỳ)
    const canAssignCrew = useMemo(() => {
        const effectiveUser = user || (() => {
            try { return JSON.parse(localStorage.getItem('user')) || {}; } catch(e) { return {}; }
        })();
        return hasPermission(effectiveUser, 'phan-cong-tho');
    }, [user]);

    // Hàm kiểm tra hợp đồng có được giao cho nhân viên hiện tại hay không
    const isAssignedToUser = useCallback((hd, currentUser) => {
        if (!currentUser) return false;
        const targets = [
            currentUser.fullname,
            currentUser.hoTen,
            currentUser.tenNhanVien,
            currentUser.username
        ].filter(Boolean).map(s => s.toLowerCase().trim());

        if (targets.length === 0) return true;

        const checkMatch = (val) => {
            if (!val) return false;
            const v = String(val).toLowerCase().trim();
            return targets.some(t => t === v || v.includes(t) || t.includes(v));
        };

        const npv = hd?.nguoiPhucVu || {};
        return checkMatch(npv.thoChupHinh) ||
               checkMatch(npv.thoMakeUp) ||
               checkMatch(npv.thoChinhAnh) ||
               checkMatch(npv.thoQuayPhim) ||
               checkMatch(npv.banHang) ||
               checkMatch(npv.phucVu) ||
               checkMatch(hd?.createBy) ||
               checkMatch(hd?.nguoiTao) ||
               checkMatch(hd?.soanDo?.nguoiKiem) ||
               (Array.isArray(hd?.serviceSchedules) && hd.serviceSchedules.some(s => checkMatch(s.nhanVien)));
    }, []);



    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' hoặc 'list'
    const [refreshing, setRefreshing] = useState(false);
    const todayDate = new Date();
    const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth()); // 0 - 11
    const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());

    // Lịch âm
    const [showLunar, setShowLunar] = useState(() => {
        const saved = localStorage.getItem('showLunarCalendar');
        return saved !== null ? saved === 'true' : true;
    });

    // Dialog tra cứu lịch âm
    const [openLunarLookup, setOpenLunarLookup] = useState(false);
    const [lookupSolarDate, setLookupSolarDate] = useState(() => {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    });

    // State tra cứu ngược âm sang dương
    const [lookupLunarDay, setLookupLunarDay] = useState(1);
    const [lookupLunarMonth, setLookupLunarMonth] = useState(1);
    const [lookupLunarYear, setLookupLunarYear] = useState(todayDate.getFullYear());
    const [lookupLunarLeap, setLookupLunarLeap] = useState(false);
    const [lookupTab, setLookupTab] = useState(0); // 0: Solar -> Lunar, 1: Lunar -> Solar

    useEffect(() => {
        localStorage.setItem('showLunarCalendar', showLunar);
    }, [showLunar]);

    const [listStaff, setListStaff] = useState([]);
    const [listDichVu, setListDichVu] = useState([]);
    const [newlyAddedPhotos, setNewlyAddedPhotos] = useState([]);
    const [selectedDichVuOption, setSelectedDichVuOption] = useState(null);

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

        otherService.findDichVu()
            .then((response) => {
                setListDichVu(response.data.dichVu || []);
            })
            .catch((error) => {
                console.error("Lỗi khi tải danh sách dịch vụ:", error);
            });
    }, []);

    // Tab quản lý
    const [activeTab, setActiveTab] = useState('tongHop'); // 'tongHop', 'makeUp', 'chupHinh', 'hauKy', 'inAnh', 'anHoiVaCuoi'
    const [hauKyStatusFilter, setHauKyStatusFilter] = useState('all');

    // Danh sách hợp đồng sau khi phân quyền (Nhân viên chỉ thấy HĐ mình được giao) & bộ lọc tiến trình cho từng giai đoạn
    const filteredHopDong = useMemo(() => {
        let rawList = hopDong || [];
        if (!isAdmin) {
            rawList = rawList.filter(hd => isAssignedToUser(hd, user));
        }
        // Tab Chụp hình: Chỉ hiển thị HĐ ở Giai đoạn 1 (Chụp hình). Khi chuyển sang hậu kỳ (giai đoạn 2) sẽ rời khỏi bảng này
        if (activeTab === 'chupHinh') {
            rawList = rawList.filter(hd => Number(hd.giaiDoan) === 1);
        }
        // Tab Hậu kỳ: Chỉ hiển thị HĐ ở Giai đoạn 2 (Hậu kỳ)
        if (activeTab === 'hauKy') {
            rawList = rawList.filter(hd => Number(hd.giaiDoan) === 2);
            if (hauKyStatusFilter !== 'all') {
                rawList = rawList.filter(hd => {
                    const info = getContractStatusInfo(hd);
                    return info.subStage === hauKyStatusFilter;
                });
            }
        }
        // Tab In ảnh: Chỉ hiển thị HĐ ở Giai đoạn 3 (In ảnh)
        if (activeTab === 'inAnh') {
            rawList = rawList.filter(hd => Number(hd.giaiDoan) === 3);
        }
        if (activeTab === 'makeUp') {
            rawList = rawList.filter(hd => {
                const hasScheduleMake = (hd.serviceSchedules || []).some(s => s.serviceType === 'makeup');
                const hasLichMake = (hd.lichTrangDiem || []).length > 0;
                const hasNgayMake = !!hd.cacNgay?.ngayTrangDiem;
                const hasThoMake = !!hd.nguoiPhucVu?.thoMakeUp;
                return hasScheduleMake || hasLichMake || hasNgayMake || hasThoMake;
            });
        }
        if (activeTab === 'quayPhim') {
            rawList = rawList.filter(hd => {
                const hasScheduleVideo = (hd.serviceSchedules || []).some(s => s.serviceType === 'video');
                const hasLichVideo = (hd.lichQuayPhim || []).length > 0;
                const hasNgayVideo = !!hd.cacNgay?.ngayQuayPhim;
                const hasThoVideo = !!hd.nguoiPhucVu?.thoQuayPhim;
                return hasScheduleVideo || hasLichVideo || hasNgayVideo || hasThoVideo;
            });
        }
        return rawList;
    }, [hopDong, isAdmin, user, isAssignedToUser, activeTab, hauKyStatusFilter]);

    // Lọc và Tìm kiếm
    const locThoiGian = [
        { label: 'Tất cả thời gian', id: 'all' },
        { label: 'Hôm nay', id: 'hôm nay' },
        { label: 'Tuần này', id: 'tuần này' },
        { label: 'Tháng này', id: 'tháng này' }
    ];

    // Mặc định lọc thời gian là "Tuần này"
    const [selectedTime, setSelectedTime] = useState(locThoiGian[2]);
    const [searchInput, setSearchInput] = useState("");

    // dialog chi tiết hợp đồng cho Tab Hậu Kỳ
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [sendData, setSendData] = useState({});

    // Dialog thanh toán khi hoàn thành hợp đồng
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
    const [paymentContract, setPaymentContract] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("Tiền mặt");
    const [paymentNote, setPaymentNote] = useState("Thanh toán hoàn thành hợp đồng");

    // dialog cập nhật lịch chụp cho Tab Chụp Hình
    const [openChupHinhDialog, setOpenChupHinhDialog] = useState(false);
    const [chupHinhTab, setChupHinhTab] = useState(0);
    const [albumData, setAlbumData] = useState(null);
    const [coGioiHanAnh, setCoGioiHanAnh] = useState(false);
    const [soLuongAnhGioiHan, setSoLuongAnhGioiHan] = useState(0);
    const [khachHangXacNhan, setKhachHangXacNhan] = useState(false);
    const [openLocAnhDialog, setOpenLocAnhDialog] = useState(false);
    const [selectedChupHinhContract, setSelectedChupHinhContract] = useState(null);
    const [isSyncingAlbumChinhSua, setIsSyncingAlbumChinhSua] = useState(false);

    const [confirmDiaDiem, setConfirmDiaDiem] = useState("");
    const [confirmChotLich, setConfirmChotLich] = useState("Chưa gọi điện");
    const [confirmLinkAnh, setConfirmLinkAnh] = useState("");
    const [isSyncingAlbum, setIsSyncingAlbum] = useState(false);
    const [confirmThoChupHinh, setConfirmThoChupHinh] = useState("");
    const [confirmThoMakeUp, setConfirmThoMakeUp] = useState("");
    const [chupHinhSchedules, setChupHinhSchedules] = useState([]);

    // Tab Makeup & Phân công trang điểm
    const [openMakeUpDialog, setOpenMakeUpDialog] = useState(false);
    const [selectedMakeUpContract, setSelectedMakeUpContract] = useState(null);
    const [confirmMakeUpDate, setConfirmMakeUpDate] = useState("");
    const [confirmMakeUpGio, setConfirmMakeUpGio] = useState("");
    const [confirmMakeUpLocation, setConfirmMakeUpLocation] = useState("");
    const [confirmMakeUpStaff, setConfirmMakeUpStaff] = useState("");
    const [confirmMakeUpNote, setConfirmMakeUpNote] = useState("");
    const [makeUpScheduleItems, setMakeUpScheduleItems] = useState([]);

    // Tab Lịch tổng hợp (Google Calendar)
    const [allLichSoanDo, setAllLichSoanDo] = useState([]);
    const [calendarCategoryFilter, setCalendarCategoryFilter] = useState('all');
    const [selectedDayModal, setSelectedDayModal] = useState(null);

    // dialog cập nhật lịch hậu kỳ cho Tab Hậu Kỳ
    const [openHauKyDialog, setOpenHauKyDialog] = useState(false);
    const [selectedHauKyContract, setSelectedHauKyContract] = useState(null);
    const [confirmThoChinhAnh, setConfirmThoChinhAnh] = useState("");
    const [confirmNgayChinhAnh, setConfirmNgayChinhAnh] = useState("");
    const [confirmNgayTraAnh, setConfirmNgayTraAnh] = useState("");
    const [confirmLinkAnhChinhSua, setConfirmLinkAnhChinhSua] = useState("");
    const [confirmSubGiaiDoan, setConfirmSubGiaiDoan] = useState("cho_chinh");

    // dialog nhập kích thước & số lượng khi chuyển sang in ảnh
    const [openInAnhInputDialog, setOpenInAnhInputDialog] = useState(false);
    const [tempDanhSachAnhIn, setTempDanhSachAnhIn] = useState([]);
    const [tempKichThuoc, setTempKichThuoc] = useState("");
    const [tempSoLuong, setTempSoLuong] = useState(1);

    // dialog hiển thị danh sách ảnh in & hoàn thành cho Tab In Ảnh
    const [openInAnhViewDialog, setOpenInAnhViewDialog] = useState(false);
    const [selectedInAnhContract, setSelectedInAnhContract] = useState(null);

    const loadHopDong = useCallback((tabVal, timeVal, searchVal) => {
        showLoading("Đang tải lịch cửa hàng ...");
        let dateField = 'cacNgay.ngayChup';
        let targetStage = [1]; // Chỉ lấy giai đoạn 1 (Chụp hình). Khi chuyển sang hậu kỳ (giai đoạn 2), HĐ sẽ chuyển sang tab Hậu kỳ.

        if (tabVal === 'makeUp') {
            dateField = 'makeUp';
            targetStage = 'all';
        } else if (tabVal === 'quayPhim') {
            dateField = 'quayPhim';
            targetStage = 'all';
        } else if (tabVal === 'hauKy') {
            dateField = 'cacNgay.ngayChinhAnh';
            targetStage = [2]; // Chỉ lấy giai đoạn 2 (Hậu kỳ). Khi chuyển sang in ảnh (giai đoạn 3), HĐ chuyển sang tab In ảnh.
        } else if (tabVal === 'inAnh') {
            dateField = 'cacNgay.ngayTraAnh';
            targetStage = [3]; // Chỉ lấy giai đoạn 3 (In ảnh). Khi hoàn thành (giai đoạn 4), HĐ hoàn tất quy trình.
        } else if (tabVal === 'anHoiVaCuoi') {
            dateField = 'anHoiVaCuoi';
            targetStage = 'all';
        } else if (tabVal === 'tongHop') {
            dateField = 'tongHop';
            targetStage = 'all';
            otherService.findAllLichSoanDo({})
                .then(res => {
                    if (res.data?.lichSoanDo) setAllLichSoanDo(res.data.lichSoanDo);
                })
                .catch(() => {});
        }
        
        const params = {
            isCalendar: true,
            dateField: dateField
        };
        if (targetStage !== 'all') {
            params.status = targetStage;
        }
        const finalTimeVal = tabVal === 'inAnh' ? 'all' : timeVal;
        if (finalTimeVal && finalTimeVal !== 'all') {
            params.filter = finalTimeVal;
        }
        if (searchVal) {
            params.keyword = searchVal;
        }

        otherService.LIST_HOPDONG(params)
            .then((response) => {
                setHopDong(response.data.hopDong);
                hideLoading();
            })
            .catch((error) => {
                console.error('Error fetching calendar data:', error);
                toast.error("Lỗi tải lịch cửa hàng: " + error.message);
                hideLoading();
            });
    }, [showLoading, hideLoading]);

    const handleReloadData = () => {
        setRefreshing(true);
        const timeFilter = viewMode === 'calendar' ? 'all' : selectedTime?.id;
        loadHopDong(activeTab, timeFilter, searchInput);
        setTimeout(() => {
            setRefreshing(false);
            toast.success("Đã làm mới dữ liệu lịch cửa hàng!");
        }, 500);
    };

    const handleCloseDetailDialog = (updated) => {
        setOpenDetailDialog(false);
        if (updated === true) {
            loadHopDong(activeTab, selectedTime?.id, searchInput);
        }
    };

    const handleRowClick = (hd) => {
        if (activeTab === 'chupHinh') {
            setSelectedChupHinhContract(hd);

            setConfirmDiaDiem(hd.cacNgay?.diaDiemChup || "");
            setConfirmChotLich(hd.cacNgay?.chotLich || "Chưa gọi điện");
            setConfirmLinkAnh(hd.linkAnhGoc || "");
            setConfirmThoChupHinh(hd.nguoiPhucVu?.thoChupHinh || "");
            setConfirmThoMakeUp(hd.nguoiPhucVu?.thoMakeUp || "");
            
            // Khởi tạo danh sách ca chụp & makeup (serviceSchedules)
            let initialSchedules = [];
            if (Array.isArray(hd.serviceSchedules)) {
                initialSchedules = JSON.parse(JSON.stringify(hd.serviceSchedules));
            } else if (Array.isArray(hd.lichChup) && hd.lichChup.length > 0) {
                initialSchedules = hd.lichChup.map((lc, idx) => ({
                    id: lc.id || `sch-photo-${idx}-${Date.now()}`,
                    serviceId: lc.dichVuId || 'MANUAL_PHOTO',
                    serviceName: lc.tenDichVu || 'Chụp ảnh',
                    serviceType: 'photo',
                    luot: idx + 1,
                    totalLuot: hd.lichChup.length,
                    ngayGio: lc.ngayGio || lc.ngayChup,
                    diaDiem: lc.diaDiem || hd.cacNgay?.diaDiemChup || 'Tại Studio',
                    nhanVien: lc.nhanVien || lc.thoChupHinh || hd.nguoiPhucVu?.thoChupHinh || '',
                    ghiChu: lc.ghiChu || ''
                }));
                if (Array.isArray(hd.lichTrangDiem)) {
                    hd.lichTrangDiem.forEach((mk, idx) => {
                        initialSchedules.push({
                            id: mk.id || `sch-make-${idx}-${Date.now()}`,
                            serviceId: mk.dichVuId || 'MANUAL_MAKEUP',
                            serviceName: mk.tenDichVu || 'Trang điểm',
                            serviceType: 'makeup',
                            luot: idx + 1,
                            totalLuot: hd.lichTrangDiem.length,
                            ngayGio: mk.ngayTrangDiem || mk.ngay,
                            diaDiem: mk.diaDiem || 'Tại Studio',
                            nhanVien: mk.thoMakeUp || hd.nguoiPhucVu?.thoMakeUp || '',
                            ghiChu: mk.ghiChu || ''
                        });
                    });
                }
            } else if (hd.cacNgay?.ngayChup) {
                initialSchedules = [{
                    id: `sch-photo-${Date.now()}`,
                    serviceId: 'MANUAL_PHOTO',
                    serviceName: 'Chụp ảnh',
                    serviceType: 'photo',
                    luot: 1,
                    totalLuot: 1,
                    ngayGio: hd.cacNgay.ngayChup,
                    diaDiem: hd.cacNgay.diaDiemChup || 'Tại Studio',
                    nhanVien: hd.nguoiPhucVu?.thoChupHinh || '',
                    ghiChu: ''
                }];
                if (hd.cacNgay?.ngayTrangDiem || hd.nguoiPhucVu?.thoMakeUp) {
                    initialSchedules.push({
                        id: `sch-make-${Date.now()}`,
                        serviceId: 'MANUAL_MAKEUP',
                        serviceName: 'Trang điểm',
                        serviceType: 'makeup',
                        luot: 1,
                        totalLuot: 1,
                        ngayGio: hd.cacNgay?.ngayTrangDiem || hd.cacNgay?.ngayChup,
                        diaDiem: hd.cacNgay?.diaDiemTrangDiem || 'Tại Studio',
                        nhanVien: hd.nguoiPhucVu?.thoMakeUp || '',
                        ghiChu: ''
                    });
                }
            }
            setChupHinhSchedules(initialSchedules);

            const firstPhotoTask = initialSchedules.find(s => s.serviceType === 'photo');
            if (firstPhotoTask) {
                if (firstPhotoTask.nhanVien) setConfirmThoChupHinh(firstPhotoTask.nhanVien);
                if (firstPhotoTask.diaDiem) setConfirmDiaDiem(firstPhotoTask.diaDiem);
            }
            const firstMakeTask = initialSchedules.find(s => s.serviceType === 'makeup');
            if (firstMakeTask && firstMakeTask.nhanVien) {
                setConfirmThoMakeUp(firstMakeTask.nhanVien);
            }
            
            setChupHinhTab(0);
            setAlbumData(null);
            if (hd.maHopDong) {
                otherService.getAlbumDetail(hd.maHopDong)
                    .then(res => {
                        if (res && res.album) {
                            setAlbumData(res.album);
                            setCoGioiHanAnh(res.album.coGioiHanAnh || false);
                            setSoLuongAnhGioiHan(res.album.soLuongAnhGioiHan || 0);
                            setKhachHangXacNhan(res.album.khachHangXacNhan || false);
                        }
                    })
                    .catch(() => {});
            }

            setOpenChupHinhDialog(true);
        } else if (activeTab === 'makeUp') {
            setSelectedMakeUpContract(hd);
            setConfirmMakeUpStaff(hd.nguoiPhucVu?.thoMakeUp || "");
            setConfirmMakeUpLocation(hd.cacNgay?.diaDiemTrangDiem || "Tại Studio");
            setConfirmMakeUpDate(formatDateTimeInput(hd.cacNgay?.ngayTrangDiem) || "");
            setConfirmMakeUpGio(hd.cacNgay?.gioTrangDiem || "");
            setConfirmMakeUpNote(hd.ghiChu || "");

            let makeItems = [];
            if (Array.isArray(hd.serviceSchedules) && hd.serviceSchedules.length > 0) {
                makeItems = hd.serviceSchedules.filter(s => s.serviceType === 'makeup').map((s, idx) => ({ ...s, luot: s.luot || idx + 1 }));
            } else if (Array.isArray(hd.lichTrangDiem) && hd.lichTrangDiem.length > 0) {
                makeItems = hd.lichTrangDiem.map((mk, idx) => ({
                    id: mk.id || `mk-${idx}-${Date.now()}`,
                    serviceId: mk.dichVuId || 'MANUAL_MAKEUP',
                    serviceName: mk.tenDichVu || 'Trang điểm',
                    serviceType: 'makeup',
                    luot: idx + 1,
                    ngayGio: mk.ngayTrangDiem || mk.ngay,
                    diaDiem: mk.diaDiem || hd.cacNgay?.diaDiemTrangDiem || 'Tại Studio',
                    nhanVien: mk.thoMakeUp || hd.nguoiPhucVu?.thoMakeUp || '',
                    ghiChu: mk.ghiChu || ''
                }));
            }
            if (makeItems.length === 0 && (hd.cacNgay?.ngayTrangDiem || hd.nguoiPhucVu?.thoMakeUp)) {
                makeItems = [{
                    id: `mk-single-${Date.now()}`,
                    serviceId: 'MANUAL_MAKEUP',
                    serviceName: 'Trang điểm',
                    serviceType: 'makeup',
                    luot: 1,
                    ngayGio: hd.cacNgay?.ngayTrangDiem,
                    diaDiem: hd.cacNgay?.diaDiemTrangDiem || 'Tại Studio',
                    nhanVien: hd.nguoiPhucVu?.thoMakeUp || '',
                    ghiChu: ''
                }];
            }
            setMakeUpScheduleItems(makeItems);
            setOpenMakeUpDialog(true);
        } else if (activeTab === 'hauKy') {
            setSelectedHauKyContract(hd);
            setConfirmThoChinhAnh(hd.nguoiPhucVu?.thoChinhAnh || "");
            setConfirmNgayChinhAnh(formatTimestampToDateInput(hd.cacNgay?.ngayChinhAnh) || "");
            setConfirmNgayTraAnh(formatTimestampToDateInput(hd.cacNgay?.ngayTraAnh) || "");
            setConfirmLinkAnh(hd.linkAnhGoc || "");
            setConfirmLinkAnhChinhSua(hd.linkAnhChinhSua || "");
            
            let initialSub = hd.subGiaiDoan || 'cho_chinh';
            if (['cho_chinh', 'da_giao_file_goc', 'khach_da_chon_anh'].includes(initialSub)) {
                initialSub = 'cho_chinh';
            } else if (['cho_khach_duyet', 'khach_duyet_anh', 'cho_khach_duyet_layout', 'khach_da_duyet_layout'].includes(initialSub)) {
                initialSub = 'cho_khach_duyet';
            } else if (initialSub === 'hoan_thanh') {
                initialSub = 'hoan_thanh';
            } else {
                initialSub = 'dang_chinh';
            }
            setConfirmSubGiaiDoan(initialSub);
            
            setAlbumData(null);
            if (hd.maHopDong) {
                otherService.getAlbumDetail(hd.maHopDong)
                    .then(res => {
                        if (res && res.album) {
                            setAlbumData(res.album);
                        }
                    })
                    .catch(() => {});
            }

            setOpenHauKyDialog(true);
        } else if (activeTab === 'inAnh') {
            setSelectedInAnhContract(hd);
            setOpenInAnhViewDialog(true);
        } else {
            setSendData(hd);
            setOpenDetailDialog(true);
        }
    };

    const handleSyncAlbum = (link, isChinhSua = false) => {
        const urlToSync = typeof link === 'string' ? link : confirmLinkAnh;
        if (!urlToSync) {
            toast.error("Chưa có đường dẫn ảnh. Vui lòng nhập link Google Drive hoặc Google Photos.");
            return;
        }
        const contract = isChinhSua ? selectedHauKyContract : selectedChupHinhContract;
        const loaiAnh = isChinhSua ? 'chinhSua' : 'goc';
        
        if (isChinhSua) setIsSyncingAlbumChinhSua(true);
        else setIsSyncingAlbum(true);

        otherService.syncAlbum({ maHopDong: contract?.maHopDong, driveLink: urlToSync.trim(), loaiAnh })
            .then(res => {
                toast.success(res.message || "Đồng bộ album thành công!");
                if (res.album) {
                    setAlbumData(res.album);
                    if (!isChinhSua) {
                        setCoGioiHanAnh(res.album.coGioiHanAnh || false);
                        setSoLuongAnhGioiHan(res.album.soLuongAnhGioiHan || 0);
                        setKhachHangXacNhan(res.album.khachHangXacNhan || false);
                    }
                }
            })
            .catch(err => {
                console.error(err);
                toast.error(err.response?.data?.message || "Lỗi đồng bộ album!");
            })
            .finally(() => {
                if (isChinhSua) setIsSyncingAlbumChinhSua(false);
                else setIsSyncingAlbum(false);
            });
    };

    const handleSaveAlbumSettings = () => {
        const contractId = activeTab === 'hauKy' ? selectedHauKyContract?.maHopDong : selectedChupHinhContract?.maHopDong;
        otherService.updateAlbumSettings(contractId, { coGioiHanAnh, soLuongAnhGioiHan, khachHangXacNhan })
            .then(res => {
                toast.success(res.message || "Đã lưu cài đặt album!");
                if (res.album) {
                    setAlbumData(res.album);
                }
            })
            .catch(err => {
                toast.error(err.response?.data?.message || "Lỗi lưu cài đặt!");
            });
    };

    const handleConfirmThoChupHinhChange = (val) => {
        setConfirmThoChupHinh(val);
        setChupHinhSchedules(prev => {
            if (!prev || prev.length === 0) return prev;
            return prev.map(s => s.serviceType === 'photo' ? { ...s, nhanVien: val } : s);
        });
    };

    const handleConfirmThoMakeUpChange = (val) => {
        setConfirmThoMakeUp(val);
        setChupHinhSchedules(prev => {
            if (!prev || prev.length === 0) return prev;
            return prev.map(s => s.serviceType === 'makeup' ? { ...s, nhanVien: val } : s);
        });
    };

    const handleConfirmDiaDiemChange = (val) => {
        setConfirmDiaDiem(val);
        setChupHinhSchedules(prev => {
            if (!prev || prev.length === 0) return prev;
            return prev.map(s => s.serviceType === 'photo' ? { ...s, diaDiem: val } : s);
        });
    };

    const handleChupHinhScheduleChange = (scheduleId, fieldName, value) => {
        setChupHinhSchedules(prev => {
            const nextList = (prev || []).map(sch => {
                if (sch.id === scheduleId || (sch._id && sch._id === scheduleId)) {
                    return { ...sch, [fieldName]: value };
                }
                return sch;
            });
            const firstPhoto = nextList.find(s => s.serviceType === 'photo');
            if (firstPhoto && (firstPhoto.id === scheduleId || firstPhoto._id === scheduleId)) {
                if (fieldName === 'nhanVien') setConfirmThoChupHinh(value);
                if (fieldName === 'diaDiem') setConfirmDiaDiem(value);
            }
            const firstMake = nextList.find(s => s.serviceType === 'makeup');
            if (firstMake && (firstMake.id === scheduleId || firstMake._id === scheduleId)) {
                if (fieldName === 'nhanVien') setConfirmThoMakeUp(value);
            }
            return nextList;
        });
    };

    const handleRemoveChupHinhSchedule = (scheduleId) => {
        setChupHinhSchedules(prev => {
            const nextList = (prev || []).filter(sch => (sch.id ? sch.id !== scheduleId : sch._id !== scheduleId));
            const remainingPhotos = nextList.filter(s => s.serviceType === 'photo');
            const remainingMakes = nextList.filter(s => s.serviceType === 'makeup');

            if (remainingPhotos.length === 0) {
                setConfirmThoChupHinh("");
            } else {
                setConfirmThoChupHinh(remainingPhotos[0].nhanVien || "");
                setConfirmDiaDiem(remainingPhotos[0].diaDiem || "");
            }

            if (remainingMakes.length === 0) {
                setConfirmThoMakeUp("");
            } else {
                setConfirmThoMakeUp(remainingMakes[0].nhanVien || "");
            }

            return nextList;
        });
    };

    const handleAddChupHinhSchedule = (type) => {
        const isPhoto = type === 'photo';
        const existingCount = (chupHinhSchedules || []).filter(s => s.serviceType === type).length;
        const newSch = {
            id: `sch-${type}-${Date.now()}-${Math.floor(Math.random()*1000)}`,
            serviceId: isPhoto ? `MANUAL_PHOTO_${Date.now()}` : `MANUAL_MAKEUP_${Date.now()}`,
            serviceName: isPhoto ? (existingCount === 0 ? 'Chụp ảnh' : `Chụp ảnh lượt ${existingCount + 1}`) : (existingCount === 0 ? 'Trang điểm' : `Trang điểm lượt ${existingCount + 1}`),
            serviceType: type,
            luot: existingCount + 1,
            totalLuot: existingCount + 1,
            ngayGio: selectedChupHinhContract?.cacNgay?.ngayChup ? (formatDateTimeInput(selectedChupHinhContract.cacNgay.ngayChup)) : new Date().toISOString().slice(0, 16),
            diaDiem: confirmDiaDiem || 'Tại Studio',
            nhanVien: isPhoto ? confirmThoChupHinh : confirmThoMakeUp,
            ghiChu: ''
        };
        setChupHinhSchedules(prev => [...(prev || []), newSch]);
    };

    const handleUpdateMakeUp = () => {
        if (!selectedMakeUpContract) return;
        showLoading("Đang cập nhật lịch makeup...");

        let updatedServiceSchedules = [...(selectedMakeUpContract.serviceSchedules || [])];
        updatedServiceSchedules = updatedServiceSchedules.filter(s => s.serviceType !== 'makeup');
        updatedServiceSchedules = [...updatedServiceSchedules, ...makeUpScheduleItems];

        const firstMake = makeUpScheduleItems[0] || null;
        const newNgayTrangDiem = firstMake ? (firstMake.ngayGio ? new Date(firstMake.ngayGio).toISOString() : null) : (confirmMakeUpDate ? new Date(confirmMakeUpDate).toISOString() : null);
        const computedMakeStaff = firstMake ? (firstMake.nhanVien || confirmMakeUpStaff) : confirmMakeUpStaff;
        const newThoMakeUp = canAssignCrew ? computedMakeStaff : (selectedMakeUpContract.nguoiPhucVu?.thoMakeUp || "");
        const newDiaDiemTrangDiem = firstMake ? (firstMake.diaDiem || confirmMakeUpLocation) : confirmMakeUpLocation;

        const payload = {
            _id: selectedMakeUpContract._id,
            maHopDong: selectedMakeUpContract.maHopDong,
            serviceSchedules: updatedServiceSchedules,
            lichTrangDiem: makeUpScheduleItems.map((mk, idx) => ({
                id: mk.id,
                dichVuId: mk.serviceId || "",
                tenDichVu: mk.serviceName || `Trang điểm lượt ${idx + 1}`,
                luot: mk.luot || idx + 1,
                ngayTrangDiem: mk.ngayGio ? new Date(mk.ngayGio).toISOString() : null,
                diaDiem: mk.diaDiem || "Tại Studio",
                thoMakeUp: mk.nhanVien || "",
                ghiChu: mk.ghiChu || ""
            })),
            cacNgay: {
                ...selectedMakeUpContract.cacNgay,
                ngayTrangDiem: newNgayTrangDiem,
                diaDiemTrangDiem: newDiaDiemTrangDiem
            },
            nguoiPhucVu: {
                ...selectedMakeUpContract.nguoiPhucVu,
                thoMakeUp: newThoMakeUp
            },
            newAuditEntry: {
                action: "Cập nhật & Phân công lịch makeup",
                reason: `Phân công thợ makeup: ${newThoMakeUp || 'Chưa gán'}. Gồm ${makeUpScheduleItems.length} ca makeup.`,
                performedBy: user?.tenNhanVien || user?.fullname || user?.username || "Nhân viên",
                timestamp: new Date().toISOString()
            }
        };

        otherService.UPDATE_HOPDONG(payload)
            .then(() => {
                toast.success("Cập nhật lịch makeup thành công!");
                setOpenMakeUpDialog(false);
                setSelectedMakeUpContract(null);
                loadHopDong(activeTab, selectedTime?.id, searchInput);
                hideLoading();
            })
            .catch((err) => {
                console.error(err);
                toast.error("Lỗi cập nhật lịch makeup: " + (err.response?.data?.message || err.message));
                hideLoading();
            });
    };

    const handleAddMakeUpSchedule = () => {
        const nextLuot = (makeUpScheduleItems || []).length + 1;
        const newItem = {
            id: 'mk-' + Date.now(),
            serviceId: 'MANUAL_MAKEUP',
            serviceName: 'Trang điểm ca ' + nextLuot,
            serviceType: 'makeup',
            luot: nextLuot,
            ngayGio: confirmMakeUpDate ? new Date(confirmMakeUpDate).toISOString() : new Date().toISOString(),
            diaDiem: confirmMakeUpLocation || 'Tại Studio',
            nhanVien: confirmMakeUpStaff || '',
            ghiChu: ''
        };
        setMakeUpScheduleItems(prev => [...(prev || []), newItem]);
    };

    const handleRemoveMakeUpSchedule = (id) => {
        setMakeUpScheduleItems(prev => (prev || []).filter(item => item.id !== id));
    };

    const handleUpdateMakeUpScheduleItem = (id, field, value) => {
        setMakeUpScheduleItems(prev => (prev || []).map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const handleCalendarEventClick = (evt) => {
        if (!evt || !evt.contract) return;
        if (evt.category === 'makeup') {
            setSelectedMakeUpContract(evt.contract);
            setConfirmMakeUpStaff(evt.contract.nguoiPhucVu?.thoMakeUp || evt.staff || '');
            setConfirmMakeUpLocation(evt.contract.cacNgay?.diaDiemTrangDiem || 'Tại Studio');
            setConfirmMakeUpDate(formatDateTimeInput(evt.contract.cacNgay?.ngayTrangDiem) || '');
            setConfirmMakeUpGio(evt.contract.cacNgay?.gioTrangDiem || '');
            setConfirmMakeUpNote(evt.contract.ghiChu || '');

            let makeItems = [];
            if (Array.isArray(evt.contract.serviceSchedules) && evt.contract.serviceSchedules.length > 0) {
                makeItems = evt.contract.serviceSchedules.filter(s => s.serviceType === 'makeup').map((s, idx) => ({ ...s, luot: s.luot || idx + 1 }));
            } else if (Array.isArray(evt.contract.lichTrangDiem) && evt.contract.lichTrangDiem.length > 0) {
                makeItems = evt.contract.lichTrangDiem.map((mk, idx) => ({
                    id: mk.id || ('mk-' + idx + '-' + Date.now()),
                    serviceId: mk.dichVuId || 'MANUAL_MAKEUP',
                    serviceName: mk.tenDichVu || 'Trang điểm',
                    serviceType: 'makeup',
                    luot: idx + 1,
                    ngayGio: mk.ngayTrangDiem || mk.ngay,
                    diaDiem: mk.diaDiem || evt.contract.cacNgay?.diaDiemTrangDiem || 'Tại Studio',
                    nhanVien: mk.thoMakeUp || evt.contract.nguoiPhucVu?.thoMakeUp || '',
                    ghiChu: mk.ghiChu || ''
                }));
            }
            if (makeItems.length === 0 && (evt.contract.cacNgay?.ngayTrangDiem || evt.contract.nguoiPhucVu?.thoMakeUp)) {
                makeItems = [{
                    id: 'mk-single-' + Date.now(),
                    serviceId: 'MANUAL_MAKEUP',
                    serviceName: 'Trang điểm',
                    serviceType: 'makeup',
                    luot: 1,
                    ngayGio: evt.contract.cacNgay?.ngayTrangDiem,
                    diaDiem: evt.contract.cacNgay?.diaDiemTrangDiem || 'Tại Studio',
                    nhanVien: evt.contract.nguoiPhucVu?.thoMakeUp || '',
                    ghiChu: ''
                }];
            }
            setMakeUpScheduleItems(makeItems);
            setOpenMakeUpDialog(true);
        } else if (evt.category === 'chup' || evt.category === 'video') {
            handleRowClick(evt.contract);
        } else if (evt.category === 'photoshop' || evt.category === 'inanh' || evt.category === 'cuoihoi') {
            setSendData(evt.contract);
            setOpenDetailDialog(true);
        } else if (evt.category === 'soando') {
            if (evt.contract?._id) {
                setSendData(evt.contract);
                setOpenDetailDialog(true);
            } else {
                toast.info('Lịch soạn đồ #' + (evt.contract?.maHopDong || '') + '. Bạn có thể quản lý chi tiết trong menu Lịch Soạn Đồ.');
            }
        } else {
            handleRowClick(evt.contract);
        }
    };

    const handleUpdateChupHinh = (shouldTransitionToHauKy = false) => {
        if (!selectedChupHinhContract) return;

        if (shouldTransitionToHauKy) {
            // Cho phép chọn độc lập thợ chụp hoặc makeup, không bắt buộc chọn tất cả
            if (!confirmLinkAnh || !confirmLinkAnh.trim()) {
                toast.warning("Chưa có đường dẫn ảnh gốc (link ảnh). Bạn có thể bổ sung sau nếu cần.");
            }
        }

        showLoading(shouldTransitionToHauKy ? "Đang chuyển trạng thái sang hậu kỳ..." : "Đang cập nhật lịch chụp & đồng bộ nhiệm vụ...");

        // Đồng bộ danh sách photoSchedules & makeupSchedules từ chupHinhSchedules
        const photoSchedules = (chupHinhSchedules || []).filter(s => s.serviceType === 'photo' && s.ngayGio).map((sch, idx) => {
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
                id: sch.id,
                dichVuId: sch.serviceId || "",
                tenDichVu: sch.serviceName || `Chụp ảnh lượt ${sch.luot || (idx + 1)}`,
                luot: sch.luot || idx + 1,
                ngayGio: ngayIso,
                ngayChup: ngayIso,
                gioChup: gioStr,
                diaDiem: sch.diaDiem || confirmDiaDiem || "Tại Studio",
                thoChupHinh: sch.nhanVien || confirmThoChupHinh || "",
                nhanVien: sch.nhanVien || confirmThoChupHinh || "",
                ghiChu: sch.ghiChu || ""
            };
        });

        const makeupSchedules = (chupHinhSchedules || []).filter(s => s.serviceType === 'makeup' && s.ngayGio).map((sch, idx) => {
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
                id: sch.id,
                dichVuId: sch.serviceId || "",
                tenDichVu: sch.serviceName || `Trang điểm lượt ${sch.luot || (idx + 1)}`,
                luot: sch.luot || idx + 1,
                ngayTrangDiem: ngayIso,
                gioTrangDiem: gioStr,
                diaDiem: sch.diaDiem || "Tại Studio",
                thoMakeUp: sch.nhanVien || confirmThoMakeUp || "",
                ghiChu: sch.ghiChu || ""
            };
        });

        const videoSchedules = (chupHinhSchedules || []).filter(s => s.serviceType === 'video' && s.ngayGio).map((sch, idx) => {
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
                id: sch.id,
                dichVuId: sch.serviceId || "",
                tenDichVu: sch.serviceName || `Quay phim lượt ${sch.luot || (idx + 1)}`,
                luot: sch.luot || idx + 1,
                ngayGio: ngayIso,
                ngayQuay: ngayIso,
                gioQuay: gioStr,
                diaDiem: sch.diaDiem || "Tại Studio",
                thoQuayPhim: sch.nhanVien || "",
                nhanVien: sch.nhanVien || "",
                ghiChu: sch.ghiChu || ""
            };
        });

        const allPhoto = (chupHinhSchedules || []).filter(s => s.serviceType === 'photo');
        const allMake = (chupHinhSchedules || []).filter(s => s.serviceType === 'makeup');
        const allVideo = (chupHinhSchedules || []).filter(s => s.serviceType === 'video');

        const firstPhoto = photoSchedules[0] || null;
        const firstMakeup = makeupSchedules[0] || null;
        const firstVideo = videoSchedules[0] || null;
        const hasDefinedSchedules = Array.isArray(chupHinhSchedules);

        const newNgayChup = firstPhoto ? firstPhoto.ngayChup : (hasDefinedSchedules && allPhoto.length === 0 ? null : (selectedChupHinhContract.cacNgay?.ngayChup || null));
        const newGioChup = firstPhoto ? (firstPhoto.gioChup || "") : (hasDefinedSchedules && allPhoto.length === 0 ? "" : (selectedChupHinhContract.cacNgay?.gioChup || ""));
        const newDiaDiemChup = firstPhoto ? (firstPhoto.diaDiem || confirmDiaDiem || "") : (hasDefinedSchedules && allPhoto.length === 0 ? "" : (confirmDiaDiem || selectedChupHinhContract.cacNgay?.diaDiemChup || ""));
        const computedThoChup = firstPhoto ? (firstPhoto.thoChupHinh || confirmThoChupHinh || "") : (hasDefinedSchedules && allPhoto.length === 0 ? "" : (confirmThoChupHinh || selectedChupHinhContract.nguoiPhucVu?.thoChupHinh || ""));
        const newThoChupHinh = canAssignCrew ? computedThoChup : (selectedChupHinhContract.nguoiPhucVu?.thoChupHinh || "");

        const newNgayTrangDiem = firstMakeup ? firstMakeup.ngayTrangDiem : (hasDefinedSchedules && allMake.length === 0 ? null : (selectedChupHinhContract.cacNgay?.ngayTrangDiem || null));
        const newGioTrangDiem = firstMakeup ? (firstMakeup.gioTrangDiem || "") : (hasDefinedSchedules && allMake.length === 0 ? "" : (selectedChupHinhContract.cacNgay?.gioTrangDiem || ""));
        const newDiaDiemTrangDiem = firstMakeup ? (firstMakeup.diaDiem || "") : (hasDefinedSchedules && allMake.length === 0 ? "" : (selectedChupHinhContract.cacNgay?.diaDiemTrangDiem || ""));
        const computedThoMake = firstMakeup ? (firstMakeup.thoMakeUp || confirmThoMakeUp || "") : (hasDefinedSchedules && allMake.length === 0 ? "" : (confirmThoMakeUp || selectedChupHinhContract.nguoiPhucVu?.thoMakeUp || ""));
        const newThoMakeUp = canAssignCrew ? computedThoMake : (selectedChupHinhContract.nguoiPhucVu?.thoMakeUp || "");

        const newNgayQuayPhim = firstVideo ? firstVideo.ngayGio : (hasDefinedSchedules && allVideo.length === 0 ? null : (selectedChupHinhContract.cacNgay?.ngayQuayPhim || null));
        const newGioQuayPhim = firstVideo ? (firstVideo.gioQuay || "") : (hasDefinedSchedules && allVideo.length === 0 ? "" : (selectedChupHinhContract.cacNgay?.gioQuayPhim || ""));
        const newDiaDiemQuayPhim = firstVideo ? (firstVideo.diaDiem || "") : (hasDefinedSchedules && allVideo.length === 0 ? "" : (selectedChupHinhContract.cacNgay?.diaDiemQuayPhim || ""));
        const newThoQuayPhim = firstVideo ? (firstVideo.thoQuayPhim || "") : (hasDefinedSchedules && allVideo.length === 0 ? "" : (selectedChupHinhContract.nguoiPhucVu?.thoQuayPhim || ""));

        const payload = {
            _id: selectedChupHinhContract._id,
            maHopDong: selectedChupHinhContract.maHopDong,
            cacNgay: {
                ...selectedChupHinhContract.cacNgay,
                ngayChup: newNgayChup,
                gioChup: newGioChup,
                diaDiemChup: newDiaDiemChup,
                chotLich: confirmChotLich,
                ngayTrangDiem: newNgayTrangDiem,
                gioTrangDiem: newGioTrangDiem,
                diaDiemTrangDiem: newDiaDiemTrangDiem,
                ngayQuayPhim: newNgayQuayPhim,
                gioQuayPhim: newGioQuayPhim,
                diaDiemQuayPhim: newDiaDiemQuayPhim
            },
            nguoiPhucVu: {
                ...selectedChupHinhContract.nguoiPhucVu,
                thoChupHinh: newThoChupHinh,
                thoMakeUp: newThoMakeUp,
                thoQuayPhim: newThoQuayPhim
            },
            linkAnhGoc: confirmLinkAnh,
            serviceSchedules: chupHinhSchedules,
            lichChup: photoSchedules,
            lichTrangDiem: makeupSchedules,
            lichQuayPhim: videoSchedules,
            newAuditEntry: {
                action: shouldTransitionToHauKy ? "Chuyển sang hậu kỳ & Đồng bộ lịch nhiệm vụ" : "Xác nhận lịch chụp & Đồng bộ phân công nhiệm vụ",
                reason: `Chốt lịch: ${confirmChotLich}. Ekip: Chụp (${newThoChupHinh || 'Chưa gán'}), Make (${newThoMakeUp || 'Chưa gán'}). Gồm ${(chupHinhSchedules || []).length} nhiệm vụ.`,
                performedBy: user?.tenNhanVien || user?.fullname || user?.username || "Nhân viên",
                timestamp: new Date().toISOString()
            }
        };

        if (shouldTransitionToHauKy) {
            payload.giaiDoan = 2; // Chuyển sang hậu kỳ
            payload.subGiaiDoan = 'cho_chinh';
        } else {
            payload.subGiaiDoan = confirmLinkAnh ? 'hoan_thanh' : 'dang_thuc_hien';
        }

        otherService.UPDATE_HOPDONG(payload)
            .then((response) => {
                toast.success(shouldTransitionToHauKy ? "Đã chuyển sang hậu kỳ & đồng bộ phân công thành công!" : "Cập nhật thông tin chụp & đồng bộ phân công thành công!");
                setOpenChupHinhDialog(false);
                setSelectedChupHinhContract(null);
                loadHopDong(activeTab, selectedTime?.id, searchInput);
                hideLoading();
            })
            .catch((error) => {
                console.error(error);
                toast.error("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
                hideLoading();
            });
    };

    const triggerCompleteContract = (contract) => {
        const conLai = contract?.thanhToan?.conLai || 0;
        if (conLai > 0) {
            setPaymentContract(contract);
            setPaymentAmount(conLai);
            setPaymentMethod("Tiền mặt");
            setPaymentNote("Thanh toán hoàn thành hợp đồng");
            setOpenPaymentDialog(true);
        } else {
            showLoading("Đang chuyển trạng thái sang hoàn thành...");
            otherService.UPDATE_HOPDONG({
                maHopDong: contract.maHopDong,
                giaiDoan: 4,
                subGiaiDoan: 'hoan_thanh'
            })
            .then(() => {
                toast.success("Hợp đồng đã hoàn thành!");
                setOpenHauKyDialog(false);
                setOpenInAnhViewDialog(false);
                setSelectedHauKyContract(null);
                setSelectedInAnhContract(null);
                loadHopDong(activeTab, selectedTime?.id, searchInput);
                hideLoading();
            })
            .catch((error) => {
                console.error(error);
                toast.error("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
                hideLoading();
            });
        }
    };

    const handleConfirmPaymentAndComplete = () => {
        if (!paymentContract) return;

        if (paymentAmount <= 0) {
            toast.error("Vui lòng nhập số tiền thanh toán hợp lệ!");
            return;
        }

        showLoading("Đang thực hiện thanh toán và hoàn thành...");

        const cacLuotThanhToan = [...(paymentContract?.thanhToan?.cacLuotThanhToan || [])];
        cacLuotThanhToan.push({
            id: `TT-${paymentContract.maHopDong}-${Date.now()}`,
            khachHang: paymentContract.khachHang1?.tenKhachHang || "Khách hàng",
            amount: Number(paymentAmount),
            date: new Date().toISOString(),
            method: paymentMethod,
            noiDung: paymentNote || "Thanh toán hoàn thành hợp đồng"
        });

        const payload = {
            maHopDong: paymentContract.maHopDong,
            giaiDoan: 4,
            subGiaiDoan: 'hoan_thanh',
            thanhToan: {
                ...paymentContract.thanhToan,
                cacLuotThanhToan: cacLuotThanhToan
            }
        };

        otherService.UPDATE_HOPDONG(payload)
            .then((response) => {
                toast.success("Thanh toán thành công và hợp đồng đã hoàn thành!");
                setOpenPaymentDialog(false);
                setPaymentContract(null);
                setOpenHauKyDialog(false);
                setOpenInAnhViewDialog(false);
                setSelectedHauKyContract(null);
                setSelectedInAnhContract(null);
                loadHopDong(activeTab, selectedTime?.id, searchInput);
                hideLoading();
            })
            .catch((error) => {
                console.error(error);
                toast.error("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
                hideLoading();
            });
    };

    const handleUpdateHauKy = (targetStage = null) => {
        if (!selectedHauKyContract) return;

        if (targetStage === 5) {
            triggerCompleteContract(selectedHauKyContract);
            return;
        }

        if (targetStage === 4 && !confirmLinkAnhChinhSua.trim()) {
            toast.error("Vui lòng nhập đường dẫn ảnh chỉnh sửa trước khi chuyển sang in ảnh!");
            return;
        }

        let actionText = "Đang cập nhật lịch hậu kỳ...";
        if (targetStage === 4) {
            actionText = "Đang chuyển trạng thái sang in ảnh...";
        } else if (targetStage === 5) {
            actionText = "Đang chuyển trạng thái sang hoàn thành...";
        }

        showLoading(actionText);

        const payload = {
            maHopDong: selectedHauKyContract.maHopDong,
            cacNgay: {
                ...selectedHauKyContract.cacNgay,
                ngayChinhAnh: confirmNgayChinhAnh ? new Date(confirmNgayChinhAnh).toISOString() : null,
                ngayTraAnh: confirmNgayTraAnh ? new Date(confirmNgayTraAnh).toISOString() : null
            },
            nguoiPhucVu: {
                ...selectedHauKyContract.nguoiPhucVu,
                thoChinhAnh: confirmThoChinhAnh
            },
            linkAnhChinhSua: confirmLinkAnhChinhSua,
            subGiaiDoan: confirmSubGiaiDoan
        };

        if (targetStage) {
            // Chuyển sang in ảnh: giai đoạn 3 (hoặc 4 ở legacy), đánh dấu hậu kỳ hoàn tất
            payload.giaiDoan = 3;
            payload.subGiaiDoan = 'hoan_thanh';
            if (targetStage === 4 || targetStage === 3) {
                payload.danhSachAnhIn = tempDanhSachAnhIn;
                if (newlyAddedPhotos.length > 0) {
                    const originalCart = [...(selectedHauKyContract?.gioHang || [])];
                    newlyAddedPhotos.forEach(newPhoto => {
                        const existingIndex = originalCart.findIndex(item => 
                            (item.dichVu?._id || item.dichVu || item._id) === newPhoto.dichVu
                        );
                        if (existingIndex > -1) {
                            originalCart[existingIndex] = {
                                ...originalCart[existingIndex],
                                soLuong: (originalCart[existingIndex].soLuong || 0) + newPhoto.soLuong
                            };
                        } else {
                            originalCart.push(newPhoto);
                        }
                    });
                    payload.gioHang = originalCart;
                }
            }
        }

        otherService.UPDATE_HOPDONG(payload)
            .then((response) => {
                let successText = "Cập nhật thông tin hậu kỳ thành công!";
                if (targetStage === 4) {
                    successText = "Đã chuyển sang in ảnh thành công!";
                } else if (targetStage === 5) {
                    successText = "Đã hoàn thành hợp đồng thành công!";
                }
                toast.success(successText);
                setOpenHauKyDialog(false);
                setSelectedHauKyContract(null);
                loadHopDong(activeTab, selectedTime?.id, searchInput);
                hideLoading();
            })
            .catch((error) => {
                console.error(error);
                toast.error("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
                hideLoading();
            });
    };

    // --- CÁC HÀM HỖ TRỢ HIỂN THỊ LỊCH THÁNG ---
    const getDaysInMonthGrid = (year, month) => {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay(); 
        
        const grid = [];
        
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const d = new Date(year, month - 1, prevMonthLastDay - i);
            grid.push({
                date: d,
                isCurrentMonth: false,
                dayNum: d.getDate(),
                monthNum: d.getMonth()
            });
        }
        
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            grid.push({
                date: d,
                isCurrentMonth: true,
                dayNum: i,
                monthNum: month
            });
        }
        
        const remainingSlots = 42 - grid.length;
        for (let i = 1; i <= remainingSlots; i++) {
            const d = new Date(year, month + 1, i);
            grid.push({
                date: d,
                isCurrentMonth: false,
                dayNum: i,
                monthNum: d.getMonth()
            });
        }
        
        return grid;
    };

    const isSameDay = (date1, date2String) => {
        if (!date2String) return false;
        const date2 = new Date(date2String);
        if (isNaN(date2.getTime())) return false;
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getFullYear() === today.getFullYear() &&
               date.getMonth() === today.getMonth() &&
               date.getDate() === today.getDate();
    };

    const getEventsForDay = (dayDate) => {
        const events = [];
        
        const getTimeFromDate = (dateString) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "";
            const hh = String(date.getHours()).padStart(2, '0');
            const mm = String(date.getMinutes()).padStart(2, '0');
            return `${hh}:${mm}`;
        };

        filteredHopDong.forEach(hd => {
            const custName = hd.khachHang1?.tenKhachHang || hd.hoTen || '';
            const defaultPkgName = hd.gioHang?.[0]?.tenDichVuSnapshot || '';

            // 1. Chụp hình
            if (activeTab === 'chupHinh' || activeTab === 'tongHop') {
                const photoTasks = Array.isArray(hd.serviceSchedules) 
                    ? hd.serviceSchedules.filter(s => s.serviceType === 'photo' && s.ngayGio) 
                    : [];

                if (photoTasks.length > 0) {
                    photoTasks.forEach(task => {
                        if (isSameDay(dayDate, task.ngayGio)) {
                            const time = getTimeFromDate(task.ngayGio);
                            const svcDesc = task.serviceName || task.tenDichVu || defaultPkgName || '';
                            events.push({
                                id: `ev-chup-${hd._id}-${task.id || task._id}`,
                                category: 'chup',
                                type: 'chupHinh',
                                isLegacy: false,
                                contract: hd,
                                title: svcDesc || 'Chụp ảnh',
                                time: time,
                                label: `${time ? time + ' ' : ''}📸 [Chụp] ${custName}${svcDesc ? ` - ${svcDesc}` : ''}`,
                                staff: task.nhanVien || hd.nguoiPhucVu?.thoChupHinh,
                                color: '#0284c7'
                            });
                        }
                    });
                } else {
                    // Dữ liệu cũ (lichChup hoặc cacNgay.ngayChup) -> Đánh dấu màu vàng để phân biệt
                    if (Array.isArray(hd.lichChup) && hd.lichChup.length > 0) {
                        hd.lichChup.forEach((lc, idx) => {
                            const dateVal = lc.ngayGio || lc.ngayChup;
                            if (dateVal && isSameDay(dayDate, dateVal)) {
                                const time = getTimeFromDate(dateVal) || lc.gioChup || '';
                                const svcDesc = lc.tenDichVu || defaultPkgName || '';
                                events.push({
                                    id: `ev-chup-legacy-${hd._id}-${lc.id || lc._id || idx}`,
                                    category: 'chup',
                                    type: 'chupHinh_legacy',
                                    isLegacy: true,
                                    contract: hd,
                                    title: svcDesc || 'Chụp ảnh',
                                    time: time,
                                    label: `${time ? time + ' ' : ''}⚠️ 📸 [Chụp - Cũ] ${custName}${svcDesc ? ` - ${svcDesc}` : ''}`,
                                    staff: lc.thoChupHinh || hd.nguoiPhucVu?.thoChupHinh,
                                    color: '#f59e0b',
                                    bg: '#fef3c7',
                                    textColor: '#b45309'
                                });
                            }
                        });
                    } else if (hd.cacNgay?.ngayChup && isSameDay(dayDate, hd.cacNgay.ngayChup)) {
                        const time = getTimeFromDate(hd.cacNgay?.ngayChup) || hd.cacNgay?.gioChup || '';
                        const svcDesc = defaultPkgName || '';
                        events.push({
                            id: `ev-chup-legacy-${hd._id}`,
                            category: 'chup',
                            type: 'chupHinh_legacy',
                            isLegacy: true,
                            contract: hd,
                            title: svcDesc || 'Chụp ảnh',
                            time: time,
                            label: `${time ? time + ' ' : ''}⚠️ 📸 [Chụp - Cũ] ${custName}${svcDesc ? ` - ${svcDesc}` : ''}`,
                            staff: hd.nguoiPhucVu?.thoChupHinh,
                            color: '#f59e0b',
                            bg: '#fef3c7',
                            textColor: '#b45309'
                        });
                    }
                }
            }

            // 2. Makeup
            if (activeTab === 'makeUp' || activeTab === 'tongHop') {
                const makeupTasks = Array.isArray(hd.serviceSchedules) 
                    ? hd.serviceSchedules.filter(s => s.serviceType === 'makeup' && s.ngayGio) 
                    : [];

                if (makeupTasks.length > 0) {
                    makeupTasks.forEach(task => {
                        if (isSameDay(dayDate, task.ngayGio)) {
                            const time = getTimeFromDate(task.ngayGio);
                            const svcDesc = task.serviceName || task.tenDichVu || defaultPkgName || '';
                            events.push({
                                id: `ev-make-${hd._id}-${task.id || task._id}`,
                                category: 'makeup',
                                type: 'makeup',
                                isLegacy: false,
                                contract: hd,
                                title: svcDesc || 'Trang điểm',
                                time: time,
                                label: `${time ? time + ' ' : ''}💄 [Trang điểm] ${custName}${svcDesc ? ` - ${svcDesc}` : ''}`,
                                staff: task.nhanVien || hd.nguoiPhucVu?.thoMakeUp,
                                color: '#db2777'
                            });
                        }
                    });
                } else {
                    // Dữ liệu cũ (lichTrangDiem hoặc cacNgay.ngayTrangDiem) -> Đánh dấu màu vàng để phân biệt
                    if (Array.isArray(hd.lichTrangDiem) && hd.lichTrangDiem.length > 0) {
                        hd.lichTrangDiem.forEach((mk, idx) => {
                            const dateVal = mk.ngayTrangDiem || mk.ngayGio || mk.ngay;
                            if (dateVal && isSameDay(dayDate, dateVal)) {
                                const time = getTimeFromDate(dateVal) || mk.gioTrangDiem || '';
                                const svcDesc = mk.tenDichVu || defaultPkgName || '';
                                events.push({
                                    id: `ev-make-legacy-${hd._id}-${mk.id || mk._id || idx}`,
                                    category: 'makeup',
                                    type: 'makeup_legacy',
                                    isLegacy: true,
                                    contract: hd,
                                    title: svcDesc || 'Trang điểm',
                                    time: time,
                                    label: `${time ? time + ' ' : ''}⚠️ 💄 [Trang điểm - Cũ] ${custName}${svcDesc ? ` - ${svcDesc}` : ''}`,
                                    staff: mk.thoMakeUp || hd.nguoiPhucVu?.thoMakeUp,
                                    color: '#f59e0b',
                                    bg: '#fef3c7',
                                    textColor: '#b45309'
                                });
                            }
                        });
                    } else if (hd.cacNgay?.ngayTrangDiem && isSameDay(dayDate, hd.cacNgay.ngayTrangDiem)) {
                        const time = getTimeFromDate(hd.cacNgay?.ngayTrangDiem) || hd.cacNgay?.gioTrangDiem || '';
                        const svcDesc = defaultPkgName || '';
                        events.push({
                            id: `ev-make-legacy-${hd._id}`,
                            category: 'makeup',
                            type: 'makeup_legacy',
                            isLegacy: true,
                            contract: hd,
                            title: svcDesc || 'Trang điểm',
                            time: time,
                            label: `${time ? time + ' ' : ''}⚠️ 💄 [Trang điểm - Cũ] ${custName}${svcDesc ? ` - ${svcDesc}` : ''}`,
                            staff: hd.nguoiPhucVu?.thoMakeUp,
                            color: '#f59e0b',
                            bg: '#fef3c7',
                            textColor: '#b45309'
                        });
                    }
                }
            }

            // 2.5 Quay phim
            if (activeTab === 'quayPhim' || activeTab === 'chupHinh' || activeTab === 'tongHop') {
                const videoTasks = Array.isArray(hd.serviceSchedules) 
                    ? hd.serviceSchedules.filter(s => s.serviceType === 'video' && s.ngayGio) 
                    : [];

                if (videoTasks.length > 0) {
                    videoTasks.forEach(task => {
                        if (isSameDay(dayDate, task.ngayGio)) {
                            const time = getTimeFromDate(task.ngayGio);
                            const svcDesc = task.serviceName || task.tenDichVu || defaultPkgName || '';
                            events.push({
                                id: `ev-video-${hd._id}-${task.id || task._id}`,
                                category: 'video',
                                type: 'video',
                                isLegacy: false,
                                contract: hd,
                                title: svcDesc || 'Quay phim',
                                time: time,
                                label: `${time ? time + ' ' : ''}🎥 [Quay] ${custName}${svcDesc ? ` - ${svcDesc}` : ''}`,
                                staff: task.nhanVien || hd.nguoiPhucVu?.thoQuayPhim,
                                color: '#7c3aed'
                            });
                        }
                    });
                } else {
                    // Dữ liệu cũ (lichQuayPhim hoặc cacNgay.ngayQuayPhim) -> Đánh dấu màu vàng để phân biệt
                    if (Array.isArray(hd.lichQuayPhim) && hd.lichQuayPhim.length > 0) {
                        hd.lichQuayPhim.forEach((vq, idx) => {
                            const dateVal = vq.ngayGio || vq.ngayQuayPhim || vq.ngay;
                            if (dateVal && isSameDay(dayDate, dateVal)) {
                                const time = getTimeFromDate(dateVal) || vq.gioQuayPhim || '';
                                const svcDesc = vq.tenDichVu || defaultPkgName || '';
                                events.push({
                                    id: `ev-video-legacy-${hd._id}-${vq.id || vq._id || idx}`,
                                    category: 'video',
                                    type: 'video_legacy',
                                    isLegacy: true,
                                    contract: hd,
                                    title: svcDesc || 'Quay phim',
                                    time: time,
                                    label: `${time ? time + ' ' : ''}⚠️ 🎥 [Quay - Cũ] ${custName}${svcDesc ? ` - ${svcDesc}` : ''}`,
                                    staff: vq.thoQuayPhim || hd.nguoiPhucVu?.thoQuayPhim,
                                    color: '#f59e0b',
                                    bg: '#fef3c7',
                                    textColor: '#b45309'
                                });
                            }
                        });
                    } else if (hd.cacNgay?.ngayQuayPhim && isSameDay(dayDate, hd.cacNgay.ngayQuayPhim)) {
                        const time = getTimeFromDate(hd.cacNgay?.ngayQuayPhim) || hd.cacNgay?.gioQuayPhim || '';
                        const svcDesc = defaultPkgName || '';
                        events.push({
                            id: `ev-video-legacy-${hd._id}`,
                            category: 'video',
                            type: 'video_legacy',
                            isLegacy: true,
                            contract: hd,
                            title: svcDesc || 'Quay phim',
                            time: time,
                            label: `${time ? time + ' ' : ''}⚠️ 🎥 [Quay - Cũ] ${custName}${svcDesc ? ` - ${svcDesc}` : ''}`,
                            staff: hd.nguoiPhucVu?.thoQuayPhim,
                            color: '#f59e0b',
                            bg: '#fef3c7',
                            textColor: '#b45309'
                        });
                    }
                }
            }

            // 2.8 Nhiệm vụ khác (BTS, CSKH, Hỗ trợ) từ serviceSchedules
            if (activeTab === 'tongHop') {
                const otherTasks = Array.isArray(hd.serviceSchedules) 
                    ? hd.serviceSchedules.filter(s => ['bts', 'cskh', 'support'].includes(s.serviceType) && s.ngayGio) 
                    : [];
                otherTasks.forEach(task => {
                    if (isSameDay(dayDate, task.ngayGio)) {
                        const time = getTimeFromDate(task.ngayGio);
                        const icons = { bts: '🎬', cskh: '📞', support: '🤝' };
                        const names = { bts: 'Hậu trường', cskh: 'CSKH', support: 'Hỗ trợ' };
                        const colors = { bts: '#ea580c', cskh: '#059669', support: '#d97706' };
                        const svcDesc = task.serviceName || names[task.serviceType];
                        events.push({
                            id: `ev-other-${hd._id}-${task.id || task._id}`,
                            category: task.serviceType,
                            type: task.serviceType,
                            isLegacy: false,
                            contract: hd,
                            title: svcDesc,
                            time: time,
                            label: `${time ? time + ' ' : ''}${icons[task.serviceType]} [${names[task.serviceType]}] ${custName}${svcDesc ? ` - ${svcDesc}` : ''}`,
                            staff: task.nhanVien,
                            color: colors[task.serviceType]
                        });
                    }
                });
            }

            // 3. Hậu kỳ (Photoshop) - CHỈ hiển thị khi chọn tab Lịch Hậu Kỳ (activeTab === 'hauKy')
            if (activeTab === 'hauKy') {
                if (isSameDay(dayDate, hd.cacNgay?.ngayChinhAnh)) {
                    events.push({
                        id: `ev-pts-${hd._id}`,
                        category: 'photoshop',
                        type: 'hauKy_chinh',
                        contract: hd,
                        title: 'Hậu kỳ ảnh',
                        label: `🪄 [PTS] ${hd.khachHang1?.tenKhachHang || ''}`,
                        staff: hd.nguoiPhucVu?.thoChinhAnh,
                        color: '#7c3aed'
                    });
                }
                if (isSameDay(dayDate, hd.cacNgay?.ngayTraAnh) && Number(hd.giaiDoan) === 2) {
                    events.push({
                        id: `ev-tra-pts-${hd._id}`,
                        category: 'photoshop',
                        type: 'hauKy_tra',
                        contract: hd,
                        title: 'Hẹn trả ảnh',
                        label: `📅 [Trả ảnh PTS] ${hd.khachHang1?.tenKhachHang || ''}`,
                        staff: hd.nguoiPhucVu?.thoChinhAnh,
                        color: '#9333ea'
                    });
                }
            }

            // 4. In ảnh
            if (activeTab === 'inAnh' || activeTab === 'tongHop') {
                if (isSameDay(dayDate, hd.cacNgay?.ngayTraAnh) && Number(hd.giaiDoan) >= 3) {
                    events.push({
                        id: `ev-in-${hd._id}`,
                        category: 'inanh',
                        type: 'inAnh',
                        contract: hd,
                        title: 'Bàn giao ảnh in',
                        label: `🖨️ [In ảnh] ${hd.khachHang1?.tenKhachHang || ''}`,
                        color: '#ea580c'
                    });
                }
            }

            // 5. Ăn hỏi & Cưới
            if (activeTab === 'anHoiVaCuoi' || activeTab === 'tongHop') {
                if (isSameDay(dayDate, hd.cacNgay?.ngayAnHoi)) {
                    const time = getTimeFromDate(hd.cacNgay?.ngayAnHoi);
                    events.push({
                        id: `ev-anhoi-${hd._id}`,
                        category: 'cuoihoi',
                        type: 'anHoi',
                        contract: hd,
                        title: 'Lễ Ăn Hỏi',
                        time: time,
                        label: `${time ? time + ' ' : ''}💍 [Ăn Hỏi] ${hd.khachHang1?.tenKhachHang || ''}`,
                        color: '#dc2626'
                    });
                }
                if (isSameDay(dayDate, hd.cacNgay?.ngayCuoi)) {
                    const time = getTimeFromDate(hd.cacNgay?.ngayCuoi);
                    events.push({
                        id: `ev-cuoi-${hd._id}`,
                        category: 'cuoihoi',
                        type: 'cuoi',
                        contract: hd,
                        title: 'Tiệc Cưới',
                        time: time,
                        label: `${time ? time + ' ' : ''}❤️ [Cưới] ${hd.khachHang1?.tenKhachHang || ''}`,
                        color: '#16a34a'
                    });
                }
            }
        });

        // 6. Soạn đồ (cho tab Lịch tổng hợp)
        if (activeTab === 'tongHop') {
            (allLichSoanDo || []).forEach(sd => {
                const targetDate = sd.ngaySoan || sd.ngayMuon;
                if (targetDate && isSameDay(dayDate, targetDate)) {
                    const matchedHD = (filteredHopDong || []).find(h => h.maHopDong === sd.maHopDong || h._id === sd.hopDongId);
                    events.push({
                        id: `ev-soan-${sd._id || sd.maHopDong}`,
                        category: 'soando',
                        type: 'soanDo',
                        contract: matchedHD || { maHopDong: sd.maHopDong },
                        title: 'Lịch soạn đồ',
                        label: `👗 [Soạn đồ] #${sd.maHopDong} - ${matchedHD?.khachHang1?.tenKhachHang || sd.khachHang || ''}`,
                        staff: sd.nguoiKiem,
                        color: '#0d9488'
                    });
                }
            });
        }

        // Lọc theo bộ lọc danh mục của Google Calendar
        if (activeTab === 'tongHop' && calendarCategoryFilter !== 'all') {
            return events.filter(e => e.category === calendarCategoryFilter);
        }

        return events;
    };

    const getEventBackground = (type) => {
        if (type && type.endsWith('_legacy')) return '#fef3c7';
        switch (type) {
            case 'chupHinh':
                return '#e0f2fe';
            case 'makeup':
                return '#fce7f3';
            case 'video':
                return '#f3e8ff';
            case 'bts':
                return '#ffedd5';
            case 'cskh':
                return '#ecfdf5';
            case 'support':
                return '#fefce8';
            case 'hauKy_chinh':
                return '#ede9fe';
            case 'hauKy_tra':
                return '#fef3c7';
            case 'inAnh':
                return '#ffedd5';
            case 'anHoi':
                return '#fee2e2';
            case 'cuoi':
                return '#dcfce7';
            case 'soanDo':
                return '#ccfbf1';
            default:
                return '#f1f5f9';
        }
    };

    const getEventTextColor = (type) => {
        if (type && type.endsWith('_legacy')) return '#b45309';
        switch (type) {
            case 'chupHinh':
                return '#0284c7';
            case 'makeup':
                return '#be185d';
            case 'video':
                return '#7c3aed';
            case 'bts':
                return '#c2410c';
            case 'cskh':
                return '#047857';
            case 'support':
                return '#a16207';
            case 'hauKy_chinh':
                return '#7c3aed';
            case 'hauKy_tra':
                return '#d97706';
            case 'inAnh':
                return '#ea580c';
            case 'anHoi':
                return '#dc2626';
            case 'cuoi':
                return '#16a34a';
            case 'soanDo':
                return '#0f766e';
            default:
                return '#3c4043';
        }
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const handleGoToToday = () => {
        const today = new Date();
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
    };

    const renderMonthlyCalendar = () => {
        const daysGrid = getDaysInMonthGrid(currentYear, currentMonth);
        const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

        // Thống kê số sự kiện trong tháng
        let totalMonthEvents = 0;
        daysGrid.forEach(d => {
            if (d.isCurrentMonth) {
                totalMonthEvents += getEventsForDay(d.date).length;
            }
        });

        return (
            <Paper elevation={0} style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '20px' }}>
                <style>{`
                    .gcal-day-cell {
                        transition: background-color 0.15s ease;
                    }
                    .gcal-day-cell:hover {
                        background-color: #f8fafc;
                    }
                    .calendar-event-badge {
                        transition: all 0.15s ease-in-out;
                        user-select: none;
                    }
                    .calendar-event-badge:hover {
                        filter: brightness(0.94);
                        box-shadow: 0 2px 6px rgba(0,0,0,0.12);
                        transform: translateY(-1px);
                    }
                `}</style>

                {/* Google Calendar Header / Navigation Bar */}
                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={2.5}>
                    <Box display="flex" alignItems="center" gap={1.2}>
                        <Button 
                            variant="outlined" 
                            onClick={handleGoToToday}
                            sx={{ 
                                textTransform: 'none', 
                                fontWeight: 700, 
                                borderRadius: '8px', 
                                borderColor: '#cbd5e1', 
                                color: '#1e293b',
                                px: 2,
                                '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' }
                            }}
                        >
                            Hôm nay
                        </Button>
                        <Box display="flex" alignItems="center">
                            <IconButton 
                                onClick={handlePrevMonth}
                                size="small"
                                sx={{ border: '1px solid #e2e8f0', mr: 0.5, '&:hover': { bgcolor: '#f1f5f9' } }}
                                title="Tháng trước"
                            >
                                <i className="fa-solid fa-chevron-left" style={{ fontSize: '0.85rem' }}></i>
                            </IconButton>
                            <IconButton 
                                onClick={handleNextMonth}
                                size="small"
                                sx={{ border: '1px solid #e2e8f0', mr: 0.5, '&:hover': { bgcolor: '#f1f5f9' } }}
                                title="Tháng sau"
                            >
                                <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.85rem' }}></i>
                            </IconButton>
                            <Tooltip title="Làm mới dữ liệu lịch">
                                <IconButton 
                                    onClick={handleReloadData}
                                    size="small"
                                    disabled={refreshing}
                                    sx={{ 
                                        border: '1px solid #e2e8f0', 
                                        color: '#0284c7', 
                                        '&:hover': { bgcolor: '#f0f9ff', borderColor: '#0284c7' } 
                                    }}
                                >
                                    <i className={`fa-solid fa-rotate-right ${refreshing ? 'fa-spin' : ''}`} style={{ fontSize: '0.85rem' }}></i>
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', ml: 1, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 1 }}>
                            Tháng {currentMonth + 1}, {currentYear}
                            <Chip 
                                label={`${totalMonthEvents} sự kiện`} 
                                size="small" 
                                sx={{ bgcolor: '#e0f2fe', color: '#0284c7', fontWeight: 700, fontSize: '0.78rem' }}
                            />
                        </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={2}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showLunar}
                                    onChange={(e) => setShowLunar(e.target.checked)}
                                    color="primary"
                                    size="small"
                                />
                            }
                            label={<span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Âm lịch</span>}
                        />
                    </Box>
                </Box>

                {/* Google Calendar Grid */}
                <Box 
                    display="grid" 
                    gridTemplateColumns="repeat(7, 1fr)" 
                    borderTop="1px solid #dadce0"
                    borderLeft="1px solid #dadce0"
                    borderRadius="8px"
                    overflow="hidden"
                >
                    {/* Header: 7 ngày trong tuần */}
                    {dayNames.map((name, idx) => (
                        <Box 
                            key={`header-${idx}`} 
                            textAlign="center" 
                            fontWeight="700" 
                            fontSize="0.84rem"
                            color={idx === 0 ? '#dc2626' : idx === 6 ? '#0284c7' : '#475569'}
                            borderRight="1px solid #dadce0"
                            borderBottom="1px solid #dadce0"
                            padding="10px 4px"
                            backgroundColor="#f8fafc"
                        >
                            {name}
                        </Box>
                    ))}

                    {/* Lưới các ô ngày */}
                    {daysGrid.map((day, idx) => {
                        const dayEvents = getEventsForDay(day.date);
                        const isDayToday = isToday(day.date);
                        const lunarInfo = getDetailedLunarInfo(day.date);

                        let dayLabel = `${day.dayNum}`;
                        if (day.dayNum === 1) {
                            dayLabel = `1 thg ${day.monthNum + 1}`;
                        }

                        const maxVisible = 3;
                        const visibleEvents = dayEvents.slice(0, maxVisible);
                        const hiddenCount = dayEvents.length - maxVisible;

                        const tooltipTitle = lunarInfo ? (
                            <Box style={{ padding: '6px', fontSize: '0.78rem', lineHeight: '1.4' }}>
                                <div style={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '3px', marginBottom: '4px' }}>
                                    {lunarInfo.solarStr}
                                </div>
                                <div><strong>Âm lịch:</strong> {lunarInfo.fullLunarStr}</div>
                                <div><strong>Can Chi:</strong> Ngày {lunarInfo.dayName}, tháng {lunarInfo.monthName}</div>
                                <div><strong>Tiết khí:</strong> {lunarInfo.solarTerm || 'Không có'}</div>
                            </Box>
                        ) : "";

                        return (
                            <Box 
                                key={idx}
                                className="gcal-day-cell"
                                borderRight="1px solid #dadce0"
                                borderBottom="1px solid #dadce0"
                                padding="6px"
                                backgroundColor={isDayToday ? '#f0f9ff' : (day.isCurrentMonth ? '#ffffff' : '#f8fafc')}
                                display="flex"
                                flexDirection="column"
                                onClick={() => {
                                    if (dayEvents.length > 0) {
                                        setSelectedDayModal({ open: true, date: day.date, events: dayEvents });
                                    }
                                }}
                                style={{ 
                                    minHeight: '135px', 
                                    position: 'relative',
                                    cursor: dayEvents.length > 0 ? 'pointer' : 'default'
                                }}
                            >
                                {/* Số ngày & Lịch âm */}
                                <Tooltip title={tooltipTitle} arrow enterDelay={500} placement="top">
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.8} width="100%">
                                        <Box display="flex" alignItems="center">
                                            {isDayToday ? (
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#1a73e8',
                                                    color: '#ffffff',
                                                    width: '26px',
                                                    height: '26px',
                                                    borderRadius: '50%',
                                                    fontSize: '0.84rem',
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 2px 4px rgba(26,115,232,0.4)'
                                                }}>
                                                    {day.dayNum}
                                                </span>
                                            ) : (
                                                <span style={{
                                                    fontSize: '0.82rem',
                                                    fontWeight: day.isCurrentMonth ? '700' : '500',
                                                    color: day.isCurrentMonth ? (day.date.getDay() === 0 ? '#dc2626' : '#1e293b') : '#94a3b8',
                                                    padding: '2px 4px'
                                                }}>
                                                    {dayLabel}
                                                </span>
                                            )}
                                        </Box>

                                        {showLunar && lunarInfo && (
                                            <span style={{
                                                fontSize: '0.7rem',
                                                color: (lunarInfo.lunarDay === 1 || lunarInfo.lunarDay === 15) ? '#d97706' : '#64748b',
                                                fontWeight: (lunarInfo.lunarDay === 1 || lunarInfo.lunarDay === 15) ? 'bold' : 'normal',
                                                backgroundColor: (lunarInfo.lunarDay === 1 || lunarInfo.lunarDay === 15) ? '#fef3c7' : 'transparent',
                                                padding: '1px 4px',
                                                borderRadius: '4px',
                                                border: (lunarInfo.lunarDay === 1 || lunarInfo.lunarDay === 15) ? '1px solid #fde68a' : 'none'
                                            }}>
                                                {lunarInfo.lunarDay === 1 
                                                    ? `${lunarInfo.lunarDay}/${lunarInfo.lunarMonth}${lunarInfo.isLeapMonth ? 'N' : ''}` 
                                                    : lunarInfo.lunarDay
                                                }
                                            </span>
                                        )}
                                    </Box>
                                </Tooltip>

                                {/* Danh sách sự kiện (Google Calendar Event Pills) */}
                                <Box 
                                    flexGrow={1} 
                                    display="flex" 
                                    flexDirection="column" 
                                    gap="4px"
                                    style={{ overflowY: 'hidden' }}
                                >
                                    {visibleEvents.map((evt, eIdx) => (
                                        <div
                                            key={eIdx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCalendarEventClick(evt);
                                            }}
                                            style={{
                                                backgroundColor: evt.bg || getEventBackground(evt.type),
                                                color: evt.textColor || getEventTextColor(evt.type),
                                                borderLeft: `3.5px solid ${evt.color || '#0284c7'}`,
                                                border: evt.isLegacy ? '1px solid #fde68a' : undefined,
                                                borderLeftWidth: '3.5px',
                                                padding: '3px 6px',
                                                borderRadius: '4px',
                                                fontSize: '0.72rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                lineHeight: 1.3
                                            }}
                                            className={`calendar-event-badge ${evt.isLegacy ? 'event-legacy-amber' : ''}`}
                                            title={evt.label}
                                        >
                                            {evt.label}
                                        </div>
                                    ))}

                                    {/* Link xem thêm +X sự kiện */}
                                    {hiddenCount > 0 && (
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedDayModal({ open: true, date: day.date, events: dayEvents });
                                            }}
                                            style={{
                                                fontSize: '0.72rem',
                                                fontWeight: 700,
                                                color: '#1a73e8',
                                                padding: '2px 4px',
                                                cursor: 'pointer',
                                                textAlign: 'left'
                                            }}
                                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                        >
                                            + {hiddenCount} sự kiện nữa
                                        </div>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Paper>
        );
    };

        const commonHeight = 56;

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const timeFilter = viewMode === 'calendar' ? 'all' : selectedTime?.id;
            loadHopDong(activeTab, timeFilter, searchInput);
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [activeTab, selectedTime?.id, searchInput, loadHopDong, viewMode]);

    useEffect(() => {
        if (sendData && sendData._id) {
            const updatedHD = hopDong.find(hd => hd._id === sendData._id);
            if (updatedHD) {
                setSendData(updatedHD);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hopDong, sendData?._id]);

    const renderTrangThaiBadge = (giaiDoan, maybeSub) => {
        const hdObj = typeof giaiDoan === 'object' && giaiDoan !== null 
            ? giaiDoan 
            : { giaiDoan, subGiaiDoan: maybeSub };
        const info = getContractStatusInfo(hdObj);
        const stageNum = Number(hdObj.giaiDoan) || 1;

        // Hiển thị chi tiết 4 trạng thái nếu ở giai đoạn Hậu kỳ hoặc Tab Hậu kỳ
        if (stageNum === 2 || activeTab === 'hauKy') {
            const sub = info.subStage;
            const subCfg = HAU_KY_SUB_STAGES.find(s => s.id === sub) || HAU_KY_SUB_STAGES[0];
            return (
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    backgroundColor: subCfg.bg,
                    border: `1px solid ${subCfg.border}`,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: subCfg.color,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}>
                    <span>{subCfg.icon}</span>
                    <span>{subCfg.name}</span>
                </div>
            );
        }

        const isDone = info.subStage === 'hoan_thanh';

        return (
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '12px',
                backgroundColor: info.bgColor,
                border: `1px solid ${info.stageConfig.borderColor}`,
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#1e293b',
                whiteSpace: 'nowrap'
            }}>
                <span>{info.stageConfig.icon}</span>
                <span>{info.stageConfig.shortName}</span>
                <span style={{
                    fontSize: '0.68rem',
                    padding: '1px 5px',
                    borderRadius: '8px',
                    backgroundColor: isDone ? '#059669' : '#d97706',
                    color: '#fff',
                    fontWeight: 700
                }}>
                    {isDone ? '✓ Xong' : '⏳ Đang làm'}
                </span>
            </div>
        );
    };

    return (
        <div className="schedule-page-container">
            {/* 1. HEADER TITLE */}
            <div className="schedule-header">
                <div className="schedule-title-wrap">
                    <div className="schedule-badge-top">
                        <i className="fa-solid fa-calendar-check"></i> LONG WEDDING STORE CALENDAR & WORKFLOW
                    </div>
                    <h2>
                        <i className="fa-solid fa-calendar-days" style={{ color: '#0284c7' }}></i> QUẢN LÝ LỊCH CỬA HÀNG
                    </h2>
                    <p className="schedule-subtitle">
                        {!isAdmin 
                            ? `👤 Đang hiển thị các hợp đồng & lịch trình được giao cho bạn (${user?.fullname || user?.username || 'Nhân viên'})` 
                            : 'Theo dõi và điều phối lịch chụp ảnh cưới, lịch hậu kỳ, in ấn và lịch trình ăn hỏi & cưới hỏi của khách hàng'}
                    </p>
                </div>
            </div>

            {/* 2. 6-TAB NAVIGATION (Thứ tự: Lịch tổng hợp -> Lịch makeup -> Lịch chụp hình -> Lịch hậu kỳ -> Lịch in ảnh -> Lịch ăn hỏi & cưới) */}
            <div className="schedule-tabs-container glass-panel">
                <button
                    className={`schedule-tab-btn ${activeTab === 'tongHop' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('tongHop');
                        setViewMode('calendar');
                        setSendData({});
                    }}
                    style={{ background: activeTab === 'tongHop' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : undefined }}
                >
                    <i className="fa-solid fa-calendar-days"></i>
                    LỊCH TỔNG HỢP (THÁNG)
                </button>
                <button
                    className={`schedule-tab-btn ${activeTab === 'makeUp' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('makeUp');
                        setViewMode('list');
                        setSendData({});
                    }}
                >
                    <i className="fa-solid fa-paintbrush"></i>
                    LỊCH MAKEUP
                </button>
                <button
                    className={`schedule-tab-btn ${activeTab === 'chupHinh' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('chupHinh');
                        setViewMode('list');
                        setSendData({});
                    }}
                >
                    <i className="fa-solid fa-camera"></i>
                    LỊCH CHỤP HÌNH
                </button>
                <button
                    className={`schedule-tab-btn ${activeTab === 'quayPhim' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('quayPhim');
                        setViewMode('list');
                        setSendData({});
                    }}
                >
                    <i className="fa-solid fa-video"></i>
                    LỊCH QUAY PHIM
                </button>
                <button
                    className={`schedule-tab-btn ${activeTab === 'hauKy' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('hauKy');
                        setViewMode('list');
                        setSendData({});
                    }}
                >
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    LỊCH HẬU KỲ
                </button>
                <button
                    className={`schedule-tab-btn ${activeTab === 'inAnh' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('inAnh');
                        setViewMode('list');
                        setSendData({});
                    }}
                >
                    <i className="fa-solid fa-print"></i>
                    LỊCH IN ẢNH
                </button>
                <button
                    className={`schedule-tab-btn ${activeTab === 'anHoiVaCuoi' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('anHoiVaCuoi');
                        setViewMode('list');
                        setSendData({});
                    }}
                >
                    <i className="fa-solid fa-heart"></i>
                    LỊCH ĂN HỎI & CƯỚI
                </button>
            </div>

            {/* 3. TOOLBAR & FILTERS */}
            <div className="schedule-toolbar glass-panel">
                <div className="toolbar-left">
                    <TextField
                        size="small"
                        placeholder="Tìm kiếm (Mã HĐ, SĐT, Tên KH)..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="search-input"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <i className="fa-solid fa-magnifying-glass" style={{ color: '#94a3b8' }}></i>
                                </InputAdornment>
                            ),
                            endAdornment: searchInput && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchInput('')}>
                                        <i className="fa-solid fa-xmark" style={{ fontSize: '0.85rem' }}></i>
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    {viewMode === 'list' && (
                        <FormControl size="small" sx={{ minWidth: 170 }}>
                            <InputLabel>Thời gian</InputLabel>
                            <Select
                                value={selectedTime?.id || 'tuần này'}
                                label="Thời gian"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedTime(locThoiGian.find(t => t.id === val) || locThoiGian[0]);
                                }}
                            >
                                <MenuItem value="all">Tất cả thời gian</MenuItem>
                                <MenuItem value="hôm nay">Hôm nay</MenuItem>
                                <MenuItem value="tuần này">Tuần này</MenuItem>
                                <MenuItem value="tháng này">Tháng này</MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    {activeTab === 'tongHop' && (
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.82rem' }}>
                                <i className="fa-solid fa-filter" style={{ color: '#0284c7', marginRight: '4px' }}></i> Lọc:
                            </Typography>
                            {[
                                { id: 'all', label: 'Tất cả', color: '#1e293b', bg: '#f1f5f9' },
                                { id: 'chup', label: '📸 Chụp ảnh', color: '#0369a1', bg: '#e0f2fe' },
                                { id: 'makeup', label: '💄 Trang điểm', color: '#be185d', bg: '#fce7f3' },
                                { id: 'video', label: '🎥 Quay phim', color: '#7c3aed', bg: '#f3e8ff' },
                                { id: 'inanh', label: '🖨️ In ảnh', color: '#ea580c', bg: '#ffedd5' },
                                { id: 'cuoihoi', label: '💍 Cưới & Hỏi', color: '#dc2626', bg: '#fee2e2' },
                                { id: 'soando', label: '👗 Soạn đồ', color: '#0d9488', bg: '#ccfbf1' },
                            ].map(cat => (
                                <Chip
                                    key={cat.id}
                                    label={cat.label}
                                    onClick={() => setCalendarCategoryFilter(cat.id)}
                                    size="small"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: '0.78rem',
                                        cursor: 'pointer',
                                        bgcolor: calendarCategoryFilter === cat.id ? cat.color : cat.bg,
                                        color: calendarCategoryFilter === cat.id ? '#ffffff' : cat.color,
                                        border: `1.5px solid ${calendarCategoryFilter === cat.id ? cat.color : 'transparent'}`,
                                        '&:hover': {
                                            opacity: 0.9,
                                            bgcolor: calendarCategoryFilter === cat.id ? cat.color : cat.bg
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                    )}

                    {activeTab === 'hauKy' && viewMode === 'list' && (
                        <FormControl size="small" sx={{ minWidth: 190 }}>
                            <InputLabel id="hau-ky-status-filter-label">Trạng thái Hậu kỳ</InputLabel>
                            <Select
                                labelId="hau-ky-status-filter-label"
                                value={hauKyStatusFilter}
                                label="Trạng thái Hậu kỳ"
                                onChange={(e) => setHauKyStatusFilter(e.target.value)}
                                sx={{ borderRadius: '8px' }}
                            >
                                <MenuItem value="all">⚡ Tất cả trạng thái</MenuItem>
                                <MenuItem value="cho_chinh">⏳ Chờ Chỉnh</MenuItem>
                                <MenuItem value="dang_chinh">🎨 Đang Chỉnh</MenuItem>
                                <MenuItem value="cho_khach_duyet">💬 Chờ khách duyệt</MenuItem>
                                <MenuItem value="hoan_thanh">✓ Hoàn thành</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                </div>

                <div className="toolbar-right">
                    <Button
                        variant="outlined"
                        onClick={handleReloadData}
                        size="small"
                        disabled={refreshing}
                        startIcon={<i className={`fa-solid fa-rotate-right ${refreshing ? 'fa-spin' : ''}`}></i>}
                        sx={{ 
                            height: 40, 
                            textTransform: 'none', 
                            fontWeight: 700, 
                            fontSize: '0.85rem', 
                            borderRadius: '10px', 
                            px: 1.8, 
                            whiteSpace: 'nowrap',
                            color: '#0284c7', 
                            borderColor: '#cbd5e1', 
                            bgcolor: '#ffffff',
                            '&:hover': { bgcolor: '#f0f9ff', borderColor: '#0284c7' }
                        }}
                    >
                        Làm mới
                    </Button>

                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        size="small"
                        onChange={(event, nextView) => {
                            if (nextView !== null) {
                                setViewMode(nextView);
                            }
                        }}
                        sx={{ bgcolor: '#f8fafc' }}
                    >
                        <ToggleButton value="list" title="Dạng danh sách">
                            <i className="fa-solid fa-list" style={{ marginRight: '6px' }}></i>
                            {!isMobile && "Danh sách"}
                        </ToggleButton>
                        <ToggleButton value="calendar" title="Dạng lịch tháng">
                            <i className="fa-solid fa-calendar-days" style={{ marginRight: '6px' }}></i>
                            {!isMobile && "Lịch tháng"}
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Button
                        variant="outlined"
                        onClick={() => setOpenLunarLookup(true)}
                        size="small"
                        sx={{ 
                            height: 40, 
                            textTransform: 'none', 
                            fontWeight: 700, 
                            fontSize: '0.85rem', 
                            borderRadius: '10px', 
                            px: 1.8, 
                            whiteSpace: 'nowrap',
                            borderColor: '#cbd5e1',
                            color: '#0284c7',
                            '&:hover': { borderColor: '#0284c7', bgcolor: '#f0f9ff' }
                        }}
                    >
                        <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }}></i>
                        Tra cứu Lịch Âm
                    </Button>
                </div>
            </div>

            {/* 4. MAIN CONTENT (LIST VIEW OR MONTHLY CALENDAR) */}
            {viewMode === 'list' ? (
                isMobile ? (
                    (() => {
                        if (!filteredHopDong || filteredHopDong.length === 0) {
                            return (
                                <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                                    <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '2.5rem', marginBottom: '10px', display: 'block', color: '#cbd5e1' }}></i>
                                    Không có dữ liệu lịch làm việc.
                                </div>
                            );
                        }
                
                        return (
                            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
                                <Stack spacing={2}>
                                {filteredHopDong.map((hd, index) => {
                                    const targetDate = activeTab === 'chupHinh'
                                        ? (hd.serviceSchedules?.find(s => s.serviceType === 'photo' && s.ngayGio)?.ngayGio || hd.cacNgay?.ngayChup || hd.lichChup?.[0]?.ngayChup)
                                        : activeTab === 'makeUp'
                                        ? (hd.serviceSchedules?.find(s => s.serviceType === 'makeup' && s.ngayGio)?.ngayGio || hd.cacNgay?.ngayTrangDiem || hd.lichTrangDiem?.[0]?.ngayTrangDiem)
                                        : activeTab === 'quayPhim'
                                        ? (hd.serviceSchedules?.find(s => s.serviceType === 'video' && s.ngayGio)?.ngayGio || hd.cacNgay?.ngayQuayPhim || hd.lichQuayPhim?.[0]?.ngayQuayPhim)
                                        : activeTab === 'hauKy'
                                        ? (hd.cacNgay?.ngayTraAnh || (hd.cacNgay?.ngayChinhAnh ? new Date(new Date(hd.cacNgay.ngayChinhAnh).getTime() + 3*24*60*60*1000).toISOString() : null))
                                        : activeTab === 'inAnh'
                                        ? hd.cacNgay?.ngayTraAnh
                                        : (hd.cacNgay?.ngayCuoi || hd.cacNgay?.ngayAnHoi);
                                    const isOverdue = isPastToday(targetDate, hd.giaiDoan, activeTab, hd.subGiaiDoan);
                
                                    return (
                                        <Card 
                                            key={index} 
                                            onClick={() => handleRowClick(hd)}
                                            sx={{ 
                                                cursor: "pointer",
                                                borderRadius: '14px',
                                                border: isOverdue ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                                                borderLeft: isOverdue ? '5px solid #dc2626' : '1px solid #e2e8f0',
                                                backgroundColor: isOverdue ? '#fff5f5' : '#fff',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                                            }}
                                        >
                                            <CardContent sx={{ p: 2 }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                    <Typography variant="subtitle1" fontWeight="800" color="#0284c7">
                                                        Mã HĐ: {hd.maHopDong}
                                                    </Typography>
                                                    {renderTrangThaiBadge(hd)}
                                                </Box>
                
                                                <Grid container spacing={1} mt={1}>
                                                    <Grid item xs={4}><Typography variant="body2" color="textSecondary">Khách hàng:</Typography></Grid>
                                                    <Grid item xs={8}>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {hd.khachHang1?.tenKhachHang}
                                                            {hd.khachHang2?.tenKhachHang && ` / ${hd.khachHang2.tenKhachHang}`}
                                                        </Typography>
                                                    </Grid>
                
                                                    <Grid item xs={4}><Typography variant="body2" color="textSecondary">Liên hệ:</Typography></Grid>
                                                    <Grid item xs={8}>
                                                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                                            <Typography variant="body2" fontWeight="500">
                                                                {hd.khachHang1?.soDienThoai}
                                                                {hd.khachHang2?.soDienThoai && ` / ${hd.khachHang2.soDienThoai}`}
                                                            </Typography>
                                                            {hd.khachHang1?.facebookId && (
                                                                <a 
                                                                    href={hd.khachHang1.facebookId.startsWith('http') ? hd.khachHang1.facebookId : `https://facebook.com/${hd.khachHang1.facebookId}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    style={{ color: '#1877f2', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.85rem' }}
                                                                    title="Mở Facebook Khách hàng 1"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <i className="fa-brands fa-facebook"></i> FB 1
                                                                </a>
                                                            )}
                                                            {hd.khachHang2?.facebookId && (
                                                                <a 
                                                                    href={hd.khachHang2.facebookId.startsWith('http') ? hd.khachHang2.facebookId : `https://facebook.com/${hd.khachHang2.facebookId}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    style={{ color: '#1877f2', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.85rem' }}
                                                                    title="Mở Facebook Khách hàng 2"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <i className="fa-brands fa-facebook"></i> FB 2
                                                                </a>
                                                            )}
                                                        </Box>
                                                    </Grid>
                
                                                    <Grid item xs={4}><Typography variant="body2" color="textSecondary">Dịch vụ:</Typography></Grid>
                                                    <Grid item xs={8}>
                                                        <Typography variant="body2" fontWeight="600" color="#0369a1">{getDichVuChinhLabel(hd.dichVuChinh)}</Typography>
                                                    </Grid>
                
                                                    {activeTab === 'makeUp' && (
                                                        <>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Ngày makeup:</Typography></Grid>
                                                            <Grid item xs={8}>
                                                                <Typography variant="body2" fontWeight="bold" color={isOverdue ? '#dc2626' : '#db2777'}>
                                                                    {hd.cacNgay?.ngayTrangDiem ? formatDateTime(hd.cacNgay.ngayTrangDiem) : 'Chưa cập nhật'}
                                                                    {isOverdue && ' (Trễ lịch)'}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Địa điểm:</Typography></Grid>
                                                            <Grid item xs={8}><Typography variant="body2">{hd.cacNgay?.diaDiemTrangDiem || hd.cacNgay?.diaDiemChup || 'Tại Studio'}</Typography></Grid>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Thợ makeup:</Typography></Grid>
                                                            <Grid item xs={8}>
                                                                <Typography variant="body2" fontWeight="600" color="#db2777">
                                                                    {hd.nguoiPhucVu?.thoMakeUp || 'Chưa phân công'}
                                                                </Typography>
                                                            </Grid>
                                                        </>
                                                    )}
                                                    {activeTab === 'chupHinh' && (
                                                        <>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Ngày chụp:</Typography></Grid>
                                                            <Grid item xs={8}>
                                                                <Typography variant="body2" fontWeight="bold" color={isOverdue ? '#dc2626' : 'textPrimary'}>
                                                                    {hd.cacNgay?.ngayChup ? `${formatDateTime(hd.cacNgay.ngayChup)}` : "Chưa cập nhật"}
                                                                    {isOverdue && " (Trễ lịch)"}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Địa điểm:</Typography></Grid>
                                                            <Grid item xs={8}><Typography variant="body2">{hd.cacNgay?.diaDiemChup || "Chưa cập nhật"}</Typography></Grid>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Ekip:</Typography></Grid>
                                                            <Grid item xs={8}>
                                                                <Typography variant="body2">
                                                                    {(() => {
                                                                        const parts = [];
                                                                        if (hd.nguoiPhucVu?.thoChupHinh) parts.push(`Chụp: ${hd.nguoiPhucVu.thoChupHinh}`);
                                                                        if (hd.nguoiPhucVu?.thoMakeUp) parts.push(`Make: ${hd.nguoiPhucVu.thoMakeUp}`);
                                                                        return parts.join(" + ") || "Chưa giao ekip";
                                                                    })()}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Chốt lịch:</Typography></Grid>
                                                            <Grid item xs={8}>
                                                                <Typography variant="body2" color={hd.cacNgay?.chotLich === "Đã chốt lịch" || hd.cacNgay?.chotLich === "Đã gọi điện xác nhận" ? "success.main" : "warning.main"}>
                                                                    {hd.cacNgay?.chotLich || "Chưa gọi điện"}
                                                                </Typography>
                                                            </Grid>
                                                        </>
                                                    )}
                                                    {activeTab === 'quayPhim' && (
                                                        <>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Ngày quay:</Typography></Grid>
                                                            <Grid item xs={8}>
                                                                <Typography variant="body2" fontWeight="bold" color={isOverdue ? '#dc2626' : '#7c3aed'}>
                                                                    {(() => {
                                                                        const vTasks = (hd.serviceSchedules || []).filter(s => s.serviceType === 'video' && s.ngayGio);
                                                                        const vDate = vTasks.length > 0 ? vTasks[0].ngayGio : (hd.cacNgay?.ngayQuayPhim || (hd.lichQuayPhim && hd.lichQuayPhim[0]?.ngayGio));
                                                                        return vDate ? formatDateTime(vDate) : 'Chưa cập nhật';
                                                                    })()}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Địa điểm:</Typography></Grid>
                                                            <Grid item xs={8}>
                                                                <Typography variant="body2">
                                                                    {(() => {
                                                                        const vTasks = (hd.serviceSchedules || []).filter(s => s.serviceType === 'video');
                                                                        return vTasks[0]?.diaDiem || hd.cacNgay?.diaDiemQuayPhim || 'Tại Studio';
                                                                    })()}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Thợ quay:</Typography></Grid>
                                                            <Grid item xs={8}>
                                                                <Typography variant="body2" fontWeight="600" color="#7c3aed">
                                                                    {(() => {
                                                                        const vTasks = (hd.serviceSchedules || []).filter(s => s.serviceType === 'video');
                                                                        return vTasks[0]?.nhanVien || hd.nguoiPhucVu?.thoQuayPhim || 'Chưa phân công';
                                                                    })()}
                                                                </Typography>
                                                            </Grid>
                                                        </>
                                                    )}
                
                                                    {activeTab === 'hauKy' && (
                                                        <>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Ngày hậu kỳ:</Typography></Grid>
                                                            <Grid item xs={8}>
                                                                <Typography variant="body2">
                                                                    {formatDateOnly(hd.cacNgay?.ngayChinhAnh) || "Chưa cập nhật"}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Ngày trả ảnh:</Typography></Grid>
                                                            <Grid item xs={8}>
                                                                <Typography variant="body2" fontWeight="bold" color={isOverdue ? '#dc2626' : 'textPrimary'}>
                                                                    {formatDateOnly(hd.cacNgay?.ngayTraAnh) || (hd.cacNgay?.ngayChinhAnh ? formatDateOnly(new Date(new Date(hd.cacNgay.ngayChinhAnh).getTime() + 3*24*60*60*1000).toISOString()) + " (Dự kiến)" : "Chưa cập nhật")}
                                                                    {isOverdue && " (Trễ lịch)"}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Thợ chỉnh:</Typography></Grid>
                                                            <Grid item xs={8}><Typography variant="body2">{hd.nguoiPhucVu?.thoChinhAnh || "Chưa giao"}</Typography></Grid>
                                                        </>
                                                    )}
                
                                                    {activeTab === 'inAnh' && (
                                                        <>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Ngày trả ảnh:</Typography></Grid>
                                                            <Grid item xs={8}>
                                                                <Typography variant="body2" fontWeight="bold" color={isOverdue ? '#dc2626' : 'textPrimary'}>
                                                                    {formatDateOnly(hd.cacNgay?.ngayTraAnh) || "Chưa cập nhật"}
                                                                    {isOverdue && " (Trễ lịch)"}
                                                                </Typography>
                                                            </Grid>
                                                        </>
                                                    )}
                
                                                    {activeTab === 'anHoiVaCuoi' && (
                                                        <>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Ngày ăn hỏi:</Typography></Grid>
                                                            <Grid item xs={8}>
                                                                <Typography variant="body2" fontWeight="bold">
                                                                    {hd.cacNgay?.ngayAnHoi ? `${formatDateTime(hd.cacNgay.ngayAnHoi)}` : "-"}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Ngày cưới:</Typography></Grid>
                                                            <Grid item xs={8}>
                                                                <Typography variant="body2" fontWeight="bold">
                                                                    {hd.cacNgay?.ngayCuoi ? `${formatDateTime(hd.cacNgay.ngayCuoi)}` : "-"}
                                                                </Typography>
                                                            </Grid>
                                                        </>
                                                    )}
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                                </Stack>
                            </div>
                        );
                    })()
                ) : (
                <Paper elevation={0} className="schedule-table-container glass-panel">
                    <TableContainer style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
                        <style>{`
                            .fixed-layout-table {
                                table-layout: fixed !important;
                                width: 100% !important;
                                min-width: 1090px !important;
                            }
                            .fixed-layout-table td {
                                word-wrap: break-word !important;
                                word-break: break-word !important;
                                white-space: normal !important;
                            }
                            .fixed-layout-table th {
                                white-space: nowrap !important;
                            }
                        `}</style>
                        <Table stickyHeader aria-label="simple table" className="fixed-layout-table" size="small">
                            <TableHead sx={{ '& th': { backgroundColor: '#f8fafc', color: '#334155', fontWeight: 800, py: 1.8 } }}>
                                {activeTab === 'chupHinh' ? (
                                    <TableRow>
                                        <TableCell align='center' style={{ width: 60 }}>STT</TableCell>
                                        <TableCell align='center' style={{ width: 140 }}>NGÀY CHỤP</TableCell>
                                        <TableCell align='center' style={{ width: 105 }}>MÃ SỐ HĐ</TableCell>
                                        <TableCell align='left' style={{ width: 160 }}>TÊN KHÁCH HÀNG</TableCell>
                                        <TableCell align='left' style={{ width: 120 }}>LIÊN HỆ</TableCell>
                                        <TableCell align='center' style={{ width: 110 }}>DỊCH VỤ</TableCell>
                                        <TableCell align='center' style={{ width: 150 }}>ĐỊA ĐIỂM CHỤP</TableCell>
                                        <TableCell align='center' style={{ width: 150 }}>EKIP</TableCell>
                                        <TableCell align='center' style={{ width: 130 }}>CHỐT LỊCH</TableCell>
                                    </TableRow>
                                ) : activeTab === 'quayPhim' ? (
                                    <TableRow>
                                        <TableCell align='center' style={{ width: 60 }}>STT</TableCell>
                                        <TableCell align='center' style={{ width: 140 }}>NGÀY QUAY</TableCell>
                                        <TableCell align='center' style={{ width: 105 }}>MÃ SỐ HĐ</TableCell>
                                        <TableCell align='left' style={{ width: 160 }}>TÊN KHÁCH HÀNG</TableCell>
                                        <TableCell align='left' style={{ width: 120 }}>LIÊN HỆ</TableCell>
                                        <TableCell align='center' style={{ width: 120 }}>DỊCH VỤ / GÓI QUAY</TableCell>
                                        <TableCell align='center' style={{ width: 140 }}>ĐỊA ĐIỂM QUAY</TableCell>
                                        <TableCell align='center' style={{ width: 140 }}>THỢ QUAY PHIM</TableCell>
                                        <TableCell align='center' style={{ width: 110 }}>THAO TÁC</TableCell>
                                    </TableRow>
                                ) : activeTab === 'makeUp' ? (
                                    <TableRow>
                                        <TableCell align='center' style={{ width: 60 }}>STT</TableCell>
                                        <TableCell align='center' style={{ width: 140 }}>NGÀY MAKEUP</TableCell>
                                        <TableCell align='center' style={{ width: 105 }}>MÃ SỐ HĐ</TableCell>
                                        <TableCell align='left' style={{ width: 160 }}>TÊN KHÁCH HÀNG</TableCell>
                                        <TableCell align='left' style={{ width: 120 }}>LIÊN HỆ</TableCell>
                                        <TableCell align='center' style={{ width: 120 }}>DỊCH VỤ / GÓI MAKE</TableCell>
                                        <TableCell align='center' style={{ width: 140 }}>ĐỊA ĐIỂM MAKEUP</TableCell>
                                        <TableCell align='center' style={{ width: 140 }}>THỢ MAKEUP</TableCell>
                                        <TableCell align='center' style={{ width: 110 }}>THAO TÁC</TableCell>
                                    </TableRow>
                                ) : activeTab === 'hauKy' ? (
                                    <TableRow>
                                        <TableCell align='center' style={{ width: 60 }}>STT</TableCell>
                                        <TableCell align='center' style={{ width: 140 }}>NGÀY HẬU KỲ</TableCell>
                                        <TableCell align='center' style={{ width: 140 }}>NGÀY TRẢ ẢNH</TableCell>
                                        <TableCell align='center' style={{ width: 105 }}>MÃ SỐ HĐ</TableCell>
                                        <TableCell align='left' style={{ width: 160 }}>TÊN KHÁCH HÀNG</TableCell>
                                        <TableCell align='left' style={{ width: 120 }}>LIÊN HỆ</TableCell>
                                        <TableCell align='center' style={{ width: 140 }}>THỢ CHỈNH ẢNH</TableCell>
                                        <TableCell align='center' style={{ width: 110 }}>DỊCH VỤ</TableCell>
                                        <TableCell align='center' style={{ width: 120 }}>TIẾN TRÌNH</TableCell>
                                    </TableRow>
                                ) : activeTab === 'inAnh' ? (
                                    <TableRow>
                                        <TableCell align='center' style={{ width: 60 }}>STT</TableCell>
                                        <TableCell align='center' style={{ width: 140 }}>NGÀY CHUYỂN IN</TableCell>
                                        <TableCell align='center' style={{ width: 140 }}>NGÀY TRẢ ẢNH</TableCell>
                                        <TableCell align='center' style={{ width: 105 }}>MÃ SỐ HĐ</TableCell>
                                        <TableCell align='left' style={{ width: 160 }}>TÊN KHÁCH HÀNG</TableCell>
                                        <TableCell align='left' style={{ width: 120 }}>LIÊN HỆ</TableCell>
                                        <TableCell align='center' style={{ width: 140 }}>THỢ CHỈNH ẢNH</TableCell>
                                        <TableCell align='center' style={{ width: 110 }}>DỊCH VỤ</TableCell>
                                        <TableCell align='center' style={{ width: 120 }}>TIẾN TRÌNH</TableCell>
                                    </TableRow>
                                ) : (
                                    <TableRow>
                                        <TableCell align='center' style={{ width: 60 }}>STT</TableCell>
                                        <TableCell align='center' style={{ width: 170 }}>NGÀY ĂN HỎI</TableCell>
                                        <TableCell align='center' style={{ width: 170 }}>NGÀY CƯỚI</TableCell>
                                        <TableCell align='center' style={{ width: 105 }}>MÃ SỐ HĐ</TableCell>
                                        <TableCell align='left' style={{ width: 160 }}>TÊN KHÁCH HÀNG</TableCell>
                                        <TableCell align='left' style={{ width: 120 }}>LIÊN HỆ</TableCell>
                                        <TableCell align='center' style={{ width: 110 }}>DỊCH VỤ</TableCell>
                                        <TableCell align='center' style={{ width: 120 }}>TIẾN TRÌNH</TableCell>
                                    </TableRow>
                                )}
                            </TableHead>
         
                            <TableBody>
                                {filteredHopDong && filteredHopDong.length > 0 ? (
                                    filteredHopDong.map((hd, index) => {
                                        const targetDate = activeTab === 'chupHinh'
                                            ? (hd.serviceSchedules?.find(s => s.serviceType === 'photo' && s.ngayGio)?.ngayGio || hd.cacNgay?.ngayChup || hd.lichChup?.[0]?.ngayChup)
                                            : activeTab === 'makeUp'
                                            ? (hd.serviceSchedules?.find(s => s.serviceType === 'makeup' && s.ngayGio)?.ngayGio || hd.cacNgay?.ngayTrangDiem || hd.lichTrangDiem?.[0]?.ngayTrangDiem)
                                            : activeTab === 'quayPhim'
                                            ? (hd.serviceSchedules?.find(s => s.serviceType === 'video' && s.ngayGio)?.ngayGio || hd.cacNgay?.ngayQuayPhim || hd.lichQuayPhim?.[0]?.ngayQuayPhim)
                                            : activeTab === 'hauKy'
                                            ? (hd.cacNgay?.ngayTraAnh || (hd.cacNgay?.ngayChinhAnh ? new Date(new Date(hd.cacNgay.ngayChinhAnh).getTime() + 3*24*60*60*1000).toISOString() : null))
                                            : activeTab === 'inAnh'
                                            ? hd.cacNgay?.ngayTraAnh
                                            : (hd.cacNgay?.ngayCuoi || hd.cacNgay?.ngayAnHoi);
                                        const isOverdue = isPastToday(targetDate, hd.giaiDoan, activeTab, hd.subGiaiDoan);
         
                                        return (
                                            <TableRow 
                                                key={hd._id || index}
                                                className={`schedule-table-row ${isOverdue ? 'row-late' : ''}`}
                                                onClick={() => handleRowClick(hd)}
                                            >
                                                {/* 1. STT */}
                                                <TableCell align='center' style={{ fontWeight: 600, color: '#64748b' }}>{index + 1}</TableCell>

                                                {/* 2. Ngày tháng */}
                                                {activeTab === 'makeUp' && (
                                                    <TableCell align='center'>
                                                        {(() => {
                                                            const mkTasks = (hd.serviceSchedules || []).filter(s => s.serviceType === 'makeup' && s.ngayGio);
                                                            const mkDate = mkTasks.length > 0 ? mkTasks[0].ngayGio : (hd.cacNgay?.ngayTrangDiem || (hd.lichTrangDiem && hd.lichTrangDiem[0]?.ngayTrangDiem));
                                                            const isLegacy = mkTasks.length === 0 && Boolean(mkDate);
                                                            return mkDate ? (
                                                                <>
                                                                    <div style={{ fontWeight: 700, color: isLegacy ? '#b45309' : (isOverdue ? '#dc2626' : '#be185d') }}>
                                                                        💄 {formatDateTime(mkDate)}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.72rem', color: isLegacy ? '#b45309' : '#94a3b8', marginTop: '2px' }}>
                                                                        {isLegacy ? '⚠️ (Dữ liệu cũ)' : `(Âm: ${formatLunarDateShort(mkDate)})`}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <span style={{ color: '#e11d48', fontWeight: 600, fontSize: '0.8rem' }}>⚠️ Chưa xếp lịch</span>
                                                            );
                                                        })()}
                                                        {isOverdue && (
                                                            <span style={{ display: 'inline-block', fontSize: '0.72rem', color: '#dc2626', fontWeight: 800, marginTop: '2px' }}>
                                                                (Trễ lịch)
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                )}
                                                {activeTab === 'chupHinh' && (
                                                    <TableCell align='center'>
                                                        {(() => {
                                                            const photoTasks = (hd.serviceSchedules || []).filter(s => s.serviceType === 'photo' && s.ngayGio);
                                                            const chDate = photoTasks.length > 0 ? photoTasks[0].ngayGio : (hd.cacNgay?.ngayChup || (hd.lichChup && hd.lichChup[0]?.ngayGio));
                                                            const isLegacy = photoTasks.length === 0 && Boolean(chDate);
                                                            return chDate ? (
                                                                <>
                                                                    <div style={{ fontWeight: 700, color: isLegacy ? '#b45309' : (isOverdue ? '#dc2626' : '#0f172a') }}>
                                                                        {formatDateTime(chDate)}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.72rem', color: isLegacy ? '#b45309' : '#94a3b8', marginTop: '2px' }}>
                                                                        {isLegacy ? '⚠️ (Dữ liệu cũ)' : `(Âm: ${formatLunarDateShort(chDate)})`}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.8rem' }}>⚠️ Chưa cập nhật</span>
                                                            );
                                                        })()}
                                                        {isOverdue && (
                                                            <span style={{ display: 'inline-block', fontSize: '0.72rem', color: '#dc2626', fontWeight: 800, marginTop: '2px' }}>
                                                                (Trễ lịch)
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                )}
                                                {activeTab === 'quayPhim' && (
                                                    <TableCell align='center'>
                                                        {(() => {
                                                            const vTasks = (hd.serviceSchedules || []).filter(s => s.serviceType === 'video' && s.ngayGio);
                                                            const vDate = vTasks.length > 0 ? vTasks[0].ngayGio : (hd.cacNgay?.ngayQuayPhim || (hd.lichQuayPhim && hd.lichQuayPhim[0]?.ngayGio));
                                                            const isLegacy = vTasks.length === 0 && Boolean(vDate);
                                                            return vDate ? (
                                                                <>
                                                                    <div style={{ fontWeight: 700, color: isLegacy ? '#b45309' : (isOverdue ? '#dc2626' : '#7c3aed') }}>
                                                                        🎥 {formatDateTime(vDate)}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.72rem', color: isLegacy ? '#b45309' : '#94a3b8', marginTop: '2px' }}>
                                                                        {isLegacy ? '⚠️ (Dữ liệu cũ)' : `(Âm: ${formatLunarDateShort(vDate)})`}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <span style={{ color: '#e11d48', fontWeight: 600, fontSize: '0.8rem' }}>⚠️ Chưa xếp lịch</span>
                                                            );
                                                        })()}
                                                        {isOverdue && (
                                                            <span style={{ display: 'inline-block', fontSize: '0.72rem', color: '#dc2626', fontWeight: 800, marginTop: '2px' }}>
                                                                (Trễ lịch)
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                )}
                                                {activeTab === 'hauKy' && (
                                                    <>
                                                        <TableCell align='center'>
                                                            {formatDateOnly(hd.cacNgay?.ngayChinhAnh) || "Chưa cập nhật"}
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            <div style={{ fontWeight: 700, color: isOverdue ? '#dc2626' : '#0f172a' }}>
                                                                {formatDateOnly(hd.cacNgay?.ngayTraAnh) || (hd.cacNgay?.ngayChinhAnh ? formatDateOnly(new Date(new Date(hd.cacNgay.ngayChinhAnh).getTime() + 3*24*60*60*1000).toISOString()) + " (Dự kiến)" : "Chưa cập nhật")}
                                                            </div>
                                                            {isOverdue && (
                                                                <span style={{ display: 'inline-block', fontSize: '0.72rem', color: '#dc2626', fontWeight: 800, marginTop: '2px' }}>
                                                                    (Trễ lịch)
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                    </>
                                                )}
                                                {activeTab === 'inAnh' && (
                                                    <>
                                                        <TableCell align='center'>
                                                            {formatDateTime(hd.cacNgay?.ngayChuyenInAnh) || "Chưa cập nhật"}
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            <div style={{ fontWeight: 700, color: isOverdue ? '#dc2626' : '#0f172a' }}>
                                                                {formatDateOnly(hd.cacNgay?.ngayTraAnh) || "Chưa cập nhật"}
                                                            </div>
                                                            {isOverdue && (
                                                                <span style={{ display: 'inline-block', fontSize: '0.72rem', color: '#dc2626', fontWeight: 800, marginTop: '2px' }}>
                                                                    (Trễ lịch)
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                    </>
                                                )}
                                                {activeTab === 'anHoiVaCuoi' && (
                                                    <>
                                                        <TableCell align='center'>
                                                            {hd.cacNgay?.ngayAnHoi ? (
                                                                <>
                                                                    <div style={{ fontWeight: 700, color: '#e11d48' }}>{formatDateTime(hd.cacNgay.ngayAnHoi)}</div>
                                                                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                                                                        (Âm: {formatLunarDateShort(hd.cacNgay.ngayAnHoi)})
                                                                    </div>
                                                                </>
                                                            ) : "-"}
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            {hd.cacNgay?.ngayCuoi ? (
                                                                <>
                                                                    <div style={{ fontWeight: 700, color: '#16a34a' }}>{formatDateTime(hd.cacNgay.ngayCuoi)}</div>
                                                                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                                                                        (Âm: {formatLunarDateShort(hd.cacNgay.ngayCuoi)})
                                                                    </div>
                                                                </>
                                                            ) : "-"}
                                                        </TableCell>
                                                    </>
                                                )}

                                                {/* 3. Mã số HĐ */}
                                                <TableCell align='center'>
                                                    <span className="badge-code">
                                                        {hd.maHopDong}
                                                    </span>
                                                </TableCell>

                                                {/* 4. Tên khách hàng */}
                                                <TableCell align='left'>
                                                    <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#0f172a' }}>
                                                        {hd.khachHang1?.tenKhachHang}
                                                    </div>
                                                    {hd.khachHang2?.tenKhachHang && (
                                                        <div style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
                                                            & {hd.khachHang2.tenKhachHang}
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* 5. Số điện thoại */}
                                                <TableCell align='left'>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ fontWeight: 600, color: '#2563eb' }}>{hd.khachHang1?.soDienThoai}</span>
                                                        {hd.khachHang1?.facebookId && (
                                                            <Tooltip title="Mở Facebook Khách hàng 1">
                                                                <a 
                                                                    href={hd.khachHang1.facebookId.startsWith('http') ? hd.khachHang1.facebookId : `https://facebook.com/${hd.khachHang1.facebookId}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    style={{ color: '#1877f2', textDecoration: 'none' }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <i className="fa-brands fa-facebook"></i>
                                                                </a>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                    {hd.khachHang2?.soDienThoai && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                                            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{hd.khachHang2.soDienThoai}</span>
                                                            {hd.khachHang2?.facebookId && (
                                                                <Tooltip title="Mở Facebook Khách hàng 2">
                                                                    <a 
                                                                        href={hd.khachHang2.facebookId.startsWith('http') ? hd.khachHang2.facebookId : `https://facebook.com/${hd.khachHang2.facebookId}`} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        style={{ color: '#1877f2', textDecoration: 'none' }}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <i className="fa-brands fa-facebook"></i>
                                                                    </a>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* 6. Các cột thông tin còn lại sau SĐT */}
                                                {activeTab === 'makeUp' && (
                                                    <>
                                                        <TableCell align='center'>
                                                            <span className="badge-service-tag" style={{ background: '#fce7f3', color: '#be185d' }}>
                                                                {getDichVuChinhLabel(hd.dichVuChinh) || 'Gói Makeup'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell align='center' style={{ fontSize: '0.85rem' }}>
                                                            {hd.cacNgay?.diaDiemTrangDiem || hd.cacNgay?.diaDiemChup || "Tại Studio"}
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            {hd.nguoiPhucVu?.thoMakeUp ? (
                                                                <span className="badge-ekip" style={{ background: '#fdf2f8', color: '#db2777', borderColor: '#fbcfe8' }}>
                                                                    💄 {hd.nguoiPhucVu.thoMakeUp}
                                                                </span>
                                                            ) : (
                                                                <span style={{ color: '#e11d48', fontSize: '0.82rem', fontWeight: 600 }}>Chưa giao</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRowClick(hd);
                                                                }}
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 700,
                                                                    borderRadius: '6px',
                                                                    color: '#db2777',
                                                                    borderColor: '#f472b6',
                                                                    py: 0.2,
                                                                    px: 1,
                                                                    '&:hover': { bgcolor: '#fdf2f8', borderColor: '#db2777' }
                                                                }}
                                                            >
                                                                Phân công
                                                            </Button>
                                                        </TableCell>
                                                    </>
                                                )}
                                                {activeTab === 'quayPhim' && (
                                                    <>
                                                        <TableCell align='center'>
                                                            <span className="badge-service-tag" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                                                                {getDichVuChinhLabel(hd.dichVuChinh) || 'Gói Quay'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell align='center' style={{ fontSize: '0.85rem' }}>
                                                            {(() => {
                                                                const vTasks = (hd.serviceSchedules || []).filter(s => s.serviceType === 'video');
                                                                return vTasks[0]?.diaDiem || hd.cacNgay?.diaDiemQuayPhim || hd.cacNgay?.diaDiemChup || "Tại Studio";
                                                            })()}
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            {(() => {
                                                                const vTasks = (hd.serviceSchedules || []).filter(s => s.serviceType === 'video');
                                                                const staff = vTasks[0]?.nhanVien || hd.nguoiPhucVu?.thoQuayPhim;
                                                                return staff ? (
                                                                    <span className="badge-ekip" style={{ background: '#faf5ff', color: '#7c3aed', borderColor: '#e9d5ff' }}>
                                                                        🎥 {staff}
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: '#e11d48', fontSize: '0.82rem', fontWeight: 600 }}>Chưa giao</span>
                                                                );
                                                            })()}
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRowClick(hd);
                                                                }}
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 700,
                                                                    borderRadius: '6px',
                                                                    color: '#7c3aed',
                                                                    borderColor: '#c084fc',
                                                                    py: 0.2,
                                                                    px: 1,
                                                                    '&:hover': { bgcolor: '#f3e8ff', borderColor: '#7c3aed' }
                                                                }}
                                                            >
                                                                Chi tiết
                                                            </Button>
                                                        </TableCell>
                                                    </>
                                                )}
                                                {activeTab === 'chupHinh' && (
                                                    <>
                                                        <TableCell align='center'>
                                                            <span className="badge-service-tag">
                                                                {getDichVuChinhLabel(hd.dichVuChinh)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell align='center' style={{ fontSize: '0.85rem' }}>
                                                            {hd.cacNgay?.diaDiemChup || "Chưa cập nhật"}
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            {(() => {
                                                                const parts = [];
                                                                if (hd.nguoiPhucVu?.thoChupHinh) parts.push(`Chụp: ${hd.nguoiPhucVu.thoChupHinh}`);
                                                                if (hd.nguoiPhucVu?.thoMakeUp) parts.push(`Make: ${hd.nguoiPhucVu.thoMakeUp}`);
                                                                return parts.length > 0 ? (
                                                                    <span className="badge-ekip">
                                                                        {parts.join(" + ")}
                                                                    </span>
                                                                ) : <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Chưa giao</span>;
                                                            })()}
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            {(() => {
                                                                const status = hd.cacNgay?.chotLich || "Chưa gọi điện";
                                                                let statusClass = "call-not-yet";
                                                                let iconName = "fa-phone";
                                                                if (status === "Đã gọi điện xác nhận" || status === "Đã chốt lịch") {
                                                                    statusClass = "call-done";
                                                                    iconName = "fa-check";
                                                                } else if (status === "Khách dời lịch" || status === "Hẹn gọi lại") {
                                                                    statusClass = "call-postponed";
                                                                    iconName = "fa-clock-rotate-left";
                                                                }
                                                                return (
                                                                    <span className={`badge-call-status ${statusClass}`}>
                                                                        <i className={`fa-solid ${iconName}`}></i> {status}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </TableCell>
                                                    </>
                                                )}
                                                {(activeTab === 'hauKy' || activeTab === 'inAnh') && (
                                                    <>
                                                        <TableCell align='center' style={{ fontWeight: 600, color: '#334155' }}>
                                                            {hd.nguoiPhucVu?.thoChinhAnh ? <span className="badge-ekip">{hd.nguoiPhucVu.thoChinhAnh}</span> : <span style={{ color: '#94a3b8' }}>Chưa giao</span>}
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            <span className="badge-service-tag">
                                                                {getDichVuChinhLabel(hd.dichVuChinh)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell align='center'>{renderTrangThaiBadge(hd)}</TableCell>
                                                    </>
                                                )}

                                                {activeTab === 'anHoiVaCuoi' && (
                                                    <>
                                                        <TableCell align='center'>
                                                            <span className="badge-service-tag">
                                                                {getDichVuChinhLabel(hd.dichVuChinh)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell align='center'>{renderTrangThaiBadge(hd)}</TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={activeTab === 'chupHinh' ? 9 : activeTab === 'makeUp' ? 9 : activeTab === 'hauKy' ? 9 : activeTab === 'inAnh' ? 9 : 8} align="center" sx={{ py: 6, color: "#94a3b8" }}>
                                            <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '2.5rem', marginBottom: '10px', display: 'block', color: '#cbd5e1' }}></i>
                                            Không có dữ liệu lịch làm việc trong khoảng thời gian này.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
                )
            ) : (
                renderMonthlyCalendar()
            )}

            {/* Dialog chi tiết hợp đồng cho Tab Hậu Kỳ */}
            <DetailHopDongKhachHangDialog
                data={sendData}
                open={openDetailDialog}
                onClose={handleCloseDetailDialog}
            />

            {/* Dialog Cập nhật lịch chụp hình & Gọi điện xác nhận cho Tab Chụp Hình */}
            <Dialog 
                open={openChupHinhDialog} 
                onClose={() => setOpenChupHinhDialog(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    style: {
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        overflow: 'hidden'
                    }
                }}
            >
                {/* Header section with gradient background & customer summary */}
                <Box 
                    sx={{ 
                        p: 2.5, 
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                        color: '#ffffff',
                        position: 'relative'
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <Box 
                                sx={{ 
                                    width: 44, 
                                    height: 44, 
                                    borderRadius: '12px', 
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: '#ffffff',
                                    fontSize: '1.25rem',
                                    boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
                                }}
                            >
                                <FontAwesomeIcon icon={faCamera} />
                            </Box>
                            <Box>
                                <Typography variant="h6" style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.2px', color: '#ffffff' }}>
                                    XÁC NHẬN LỊCH CHỤP HÌNH
                                </Typography>
                                <Typography variant="caption" style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                                    Cập nhật thông tin chốt lịch, phân công thợ & đồng bộ ảnh
                                </Typography>
                            </Box>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                            <Chip 
                                label={`Mã HĐ: ${selectedChupHinhContract?.maHopDong || ''}`} 
                                sx={{ 
                                    bgcolor: 'rgba(255,255,255,0.12)', 
                                    color: '#38bdf8', 
                                    fontWeight: 700, 
                                    fontSize: '0.82rem',
                                    border: '1px solid rgba(56,189,248,0.3)'
                                }} 
                            />
                        </Box>
                    </Box>

                    {/* Customer Quick Summary Bar */}
                    {selectedChupHinhContract && (
                        <Box 
                            mt={2} 
                            p={1.5} 
                            borderRadius="10px" 
                            sx={{ 
                                backgroundColor: 'rgba(255,255,255,0.06)', 
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 2.5,
                                fontSize: '0.8rem',
                                color: '#cbd5e1'
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={0.8}>
                                <span style={{ color: '#60a5fa' }}>👤</span>
                                <span>Khách hàng: <strong style={{ color: '#ffffff' }}>{selectedChupHinhContract.khachHang1?.tenKhachHang || 'Khách hàng'}</strong></span>
                            </Box>
                            {selectedChupHinhContract.khachHang1?.soDienThoai && (
                                <Box display="flex" alignItems="center" gap={0.8}>
                                    <span style={{ color: '#4ade80' }}>📞</span>
                                    <span>SĐT: <strong style={{ color: '#ffffff' }}>{selectedChupHinhContract.khachHang1.soDienThoai}</strong></span>
                                    {selectedChupHinhContract.khachHang1?.facebookId && (
                                        <a 
                                            href={selectedChupHinhContract.khachHang1.facebookId.startsWith('http') ? selectedChupHinhContract.khachHang1.facebookId : `https://facebook.com/${selectedChupHinhContract.khachHang1.facebookId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#38bdf8', textDecoration: 'none', marginLeft: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                            title="Mở Facebook Khách hàng"
                                        >
                                            <i className="fa-brands fa-facebook"></i> Facebook
                                        </a>
                                    )}
                                </Box>
                            )}
                            {selectedChupHinhContract.cacNgay?.ngayChup && (
                                <Box display="flex" alignItems="center" gap={0.8}>
                                    <span style={{ color: '#facc15' }}>📅</span>
                                    <span>Ngày chụp: <strong style={{ color: '#ffffff' }}>{formatDateOnly(selectedChupHinhContract.cacNgay.ngayChup)}</strong></span>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Custom Segmented Tabs */}
                    <Box mt={2}>
                        <Tabs 
                            value={chupHinhTab} 
                            onChange={(e, val) => setChupHinhTab(val)} 
                            sx={{
                                minHeight: '36px',
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#38bdf8',
                                    height: '3px',
                                    borderRadius: '3px'
                                },
                                '& .MuiTab-root': {
                                    color: '#94a3b8',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    minHeight: '36px',
                                    padding: '6px 16px',
                                    '&.Mui-selected': {
                                        color: '#ffffff',
                                        fontWeight: 700
                                    }
                                }
                            }}
                        >
                            <Tab label="📋 Thông tin xác nhận" />
                            <Tab label="📷 Ảnh đồng bộ" />
                        </Tabs>
                    </Box>
                </Box>

                <DialogContent dividers sx={{ p: 3, bgcolor: '#f8fafc' }}>
                    {chupHinhTab === 0 && (
                        <Box display="flex" flexDirection="column" gap={2.5}>
                            {/* Section 1: Phân công & Chốt lịch */}
                            <Box p={2.5} borderRadius="12px" bgcolor="#ffffff" boxShadow="0 1px 3px rgba(0,0,0,0.05)" border="1px solid #e2e8f0">
                                <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#1e293b', marginBottom: '16px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#2563eb' }}>👥</span> Trạng thái xác nhận & Phân công nhân sự
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel id="confirm-chot-lich-label">Gọi điện xác nhận / Chốt lịch</InputLabel>
                                            <Select
                                                labelId="confirm-chot-lich-label"
                                                value={confirmChotLich}
                                                onChange={(e) => setConfirmChotLich(e.target.value)}
                                                label="Gọi điện xác nhận / Chốt lịch"
                                                sx={{ borderRadius: '8px' }}
                                            >
                                                <MenuItem value="Chưa gọi điện">
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                                                        <span>Chưa gọi điện</span>
                                                    </Box>
                                                </MenuItem>
                                                <MenuItem value="Đã gọi điện xác nhận">
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                                                        <span>Đã gọi điện xác nhận</span>
                                                    </Box>
                                                </MenuItem>
                                                <MenuItem value="Đã chốt lịch">
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
                                                        <span style={{ fontWeight: 600, color: '#059669' }}>Đã chốt lịch</span>
                                                    </Box>
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Địa điểm chụp"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            value={confirmDiaDiem}
                                            onChange={(e) => handleConfirmDiaDiemChange(e.target.value)}
                                            placeholder="Ví dụ: Studio Long Wedding, Phim trường..."
                                            InputProps={{ style: { borderRadius: '8px' } }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel id="confirm-tho-chup-label">Thợ chụp hình (Photo)</InputLabel>
                                            <Select
                                                labelId="confirm-tho-chup-label"
                                                value={confirmThoChupHinh}
                                                onChange={(e) => handleConfirmThoChupHinhChange(e.target.value)}
                                                label="Thợ chụp hình (Photo)"
                                                sx={{ borderRadius: '8px' }}
                                            >
                                                <MenuItem value=""><em>-- Chưa phân công --</em></MenuItem>
                                                {(() => {
                                                    const staff = listStaff.filter(s => s.positon === 'Thợ chụp hình');
                                                    const names = staff.map(s => s.fullname || s.username);
                                                    if (confirmThoChupHinh && !names.includes(confirmThoChupHinh)) {
                                                        names.push(confirmThoChupHinh);
                                                    }
                                                    return names.map((name, i) => (
                                                        <MenuItem key={i} value={name}>📸 {name}</MenuItem>
                                                    ));
                                                })()}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel id="confirm-tho-makeup-label">Thợ makeup (Trang điểm)</InputLabel>
                                            <Select
                                                labelId="confirm-tho-makeup-label"
                                                value={confirmThoMakeUp}
                                                onChange={(e) => handleConfirmThoMakeUpChange(e.target.value)}
                                                label="Thợ makeup (Trang điểm)"
                                                sx={{ borderRadius: '8px' }}
                                            >
                                                <MenuItem value=""><em>-- Chưa phân công --</em></MenuItem>
                                                {(() => {
                                                    const staff = listStaff.filter(s => s.positon === 'Thợ trang điểm');
                                                    const names = staff.map(s => s.fullname || s.username);
                                                    if (confirmThoMakeUp && !names.includes(confirmThoMakeUp)) {
                                                        names.push(confirmThoMakeUp);
                                                    }
                                                    return names.map((name, i) => (
                                                        <MenuItem key={i} value={name}>💄 {name}</MenuItem>
                                                    ));
                                                })()}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Bảng đồng bộ danh sách nhiệm vụ phân công chi tiết */}
                                    <Grid item xs={12}>
                                        <Box mt={2} pt={2} borderTop="1px dashed #cbd5e1">
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} flexWrap="wrap" gap={1}>
                                                <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ color: '#0284c7' }}>📅</span> Lịch phân công nhiệm vụ chi tiết ({chupHinhSchedules.length})
                                                </Typography>
                                                <Box display="flex" gap={1}>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => handleAddChupHinhSchedule('photo')}
                                                        sx={{ textTransform: 'none', fontSize: '0.78rem', py: 0.3, px: 1.2, borderColor: '#38bdf8', color: '#0284c7', fontWeight: 600, borderRadius: '6px' }}
                                                    >
                                                        + Thêm ca chụp
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => handleAddChupHinhSchedule('makeup')}
                                                        sx={{ textTransform: 'none', fontSize: '0.78rem', py: 0.3, px: 1.2, borderColor: '#f472b6', color: '#db2777', fontWeight: 600, borderRadius: '6px' }}
                                                    >
                                                        + Thêm ca make-up
                                                    </Button>
                                                </Box>
                                            </Box>

                                            {chupHinhSchedules.length === 0 ? (
                                                <Box p={2.5} textAlign="center" bgcolor="#f8fafc" borderRadius="8px" border="1px dashed #cbd5e1" color="#64748b" fontSize="0.84rem">
                                                    Chưa có nhiệm vụ phân công nào. Bấm nút phía trên để thêm ca chụp hoặc trang điểm.
                                                </Box>
                                            ) : (
                                                <Box display="flex" flexDirection="column" gap={1.5}>
                                                    {chupHinhSchedules.map((sch, schIdx) => {
                                                        const isPhoto = sch.serviceType === 'photo';
                                                        const isMake = sch.serviceType === 'makeup';
                                                        const isVideo = sch.serviceType === 'video';
                                                        const isBTS = sch.serviceType === 'bts';
                                                        const bgTag = isPhoto ? '#e0f2fe' : isMake ? '#fce7f3' : isVideo ? '#e0e7ff' : isBTS ? '#ffedd5' : '#f1f5f9';
                                                        const colorTag = isPhoto ? '#0369a1' : isMake ? '#be185d' : isVideo ? '#3730a3' : isBTS ? '#c2410c' : '#475569';
                                                        const iconTag = isPhoto ? '📸' : isMake ? '💄' : isVideo ? '🎥' : isBTS ? '🎬' : '📋';

                                                        return (
                                                            <Box 
                                                                key={sch.id || sch._id || schIdx}
                                                                p={1.5} 
                                                                borderRadius="8px" 
                                                                bgcolor="#f8fafc" 
                                                                border="1px solid #e2e8f0"
                                                                sx={{ transition: 'all 0.2s', '&:hover': { borderColor: '#cbd5e1', bgcolor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' } }}
                                                            >
                                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                                    <Box display="flex" alignItems="center" gap={1}>
                                                                        <span style={{ backgroundColor: bgTag, color: colorTag, fontWeight: 700, fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px' }}>
                                                                            {iconTag} {isPhoto ? 'Chụp ảnh' : isMake ? 'Trang điểm' : isVideo ? 'Quay phim' : isBTS ? 'Hậu trường' : 'Nhiệm vụ'} {sch.luot ? `(Lượt ${sch.luot})` : ''}
                                                                        </span>
                                                                    </Box>
                                                                    <Button 
                                                                        size="small" 
                                                                        color="error" 
                                                                        onClick={() => handleRemoveChupHinhSchedule(sch.id || sch._id)}
                                                                        sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto', p: '2px 8px', fontWeight: 600 }}
                                                                    >
                                                                        ✕ Xóa
                                                                    </Button>
                                                                </Box>

                                                                <Grid container spacing={1.5}>
                                                                    <Grid item xs={12} sm={4}>
                                                                        <TextField
                                                                            fullWidth
                                                                            size="small"
                                                                            label="Nội dung nhiệm vụ"
                                                                            value={sch.serviceName || ''}
                                                                            onChange={(e) => handleChupHinhScheduleChange(sch.id || sch._id, 'serviceName', e.target.value)}
                                                                            InputProps={{ style: { fontSize: '0.82rem', borderRadius: '6px' } }}
                                                                            InputLabelProps={{ style: { fontSize: '0.8rem' } }}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={4}>
                                                                        <TextField
                                                                            fullWidth
                                                                            size="small"
                                                                            label="Thời gian thực hiện"
                                                                            type="datetime-local"
                                                                            value={sch.ngayGio ? (sch.ngayGio.includes('T') ? sch.ngayGio.slice(0, 16) : sch.ngayGio) : ''}
                                                                            onChange={(e) => handleChupHinhScheduleChange(sch.id || sch._id, 'ngayGio', e.target.value)}
                                                                            InputLabelProps={{ shrink: true, style: { fontSize: '0.8rem' } }}
                                                                            InputProps={{ style: { fontSize: '0.82rem', borderRadius: '6px' } }}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={4}>
                                                                        <FormControl fullWidth size="small">
                                                                            <InputLabel style={{ fontSize: '0.8rem' }}>Nhân sự phụ trách</InputLabel>
                                                                            <Select
                                                                                value={sch.nhanVien || ''}
                                                                                onChange={(e) => handleChupHinhScheduleChange(sch.id || sch._id, 'nhanVien', e.target.value)}
                                                                                label="Nhân sự phụ trách"
                                                                                sx={{ fontSize: '0.82rem', borderRadius: '6px' }}
                                                                            >
                                                                                <MenuItem value=""><em>-- Chưa phân công --</em></MenuItem>
                                                                                {(() => {
                                                                                    const role = isPhoto ? 'Thợ chụp hình' : isMake ? 'Thợ trang điểm' : isVideo ? 'Thợ quay phim' : null;
                                                                                    const staff = role ? listStaff.filter(s => s.positon === role) : listStaff;
                                                                                    const names = staff.map(s => s.fullname || s.username);
                                                                                    if (sch.nhanVien && !names.includes(sch.nhanVien)) names.push(sch.nhanVien);
                                                                                    return names.map((name, i) => (
                                                                                        <MenuItem key={i} value={name} sx={{ fontSize: '0.82rem' }}>
                                                                                            {iconTag} {name}
                                                                                        </MenuItem>
                                                                                    ));
                                                                                })()}
                                                                            </Select>
                                                                        </FormControl>
                                                                    </Grid>
                                                                </Grid>
                                                            </Box>
                                                        );
                                                    })}
                                                </Box>
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Section 2: Link Drive & Đồng bộ */}
                            <Box p={2.5} borderRadius="12px" bgcolor="#ffffff" boxShadow="0 1px 3px rgba(0,0,0,0.05)" border="1px solid #e2e8f0">
                                <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#1e293b', marginBottom: '12px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#0284c7' }}>☁️</span> Đường dẫn ảnh gốc (Google Drive / Photos)
                                </Typography>

                                <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
                                    <TextField
                                        label="Đường dẫn ảnh gốc"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        value={confirmLinkAnh}
                                        onChange={(e) => setConfirmLinkAnh(e.target.value)}
                                        placeholder="https://drive.google.com/drive/folders/..."
                                        InputProps={{ style: { borderRadius: '8px' } }}
                                        sx={{ flex: 1, minWidth: '240px' }}
                                    />
                                    <Button 
                                        variant="contained" 
                                        onClick={handleSyncAlbum}
                                        disabled={isSyncingAlbum || !selectedChupHinhContract}
                                        sx={{ 
                                            borderRadius: '8px',
                                            textTransform: 'none', 
                                            fontWeight: 700, 
                                            fontSize: '0.82rem',
                                            padding: '8px 18px',
                                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                            boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
                                            whiteSpace: 'nowrap',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'
                                            }
                                        }}
                                    >
                                        {isSyncingAlbum ? "Đang đồng bộ..." : "⚡ Đồng bộ ảnh KH"}
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    )}
                    
                    {chupHinhTab === 1 && (
                        <Box mt={1}>
                            {!albumData || !albumData.danhSachAnh || albumData.danhSachAnh.length === 0 ? (
                                <Typography color="textSecondary" align="center" style={{ padding: '40px 20px', fontSize: '0.9rem' }}>
                                    Chưa có ảnh nào được đồng bộ. Vui lòng sang tab <strong>Thông tin xác nhận</strong> để thực hiện đồng bộ.
                                </Typography>
                            ) : (
                                <>
                                    <Box sx={{ mb: 3, p: 2.5, border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                        <Typography variant="subtitle2" style={{ fontWeight: 700, marginBottom: '12px', color: '#1e293b', fontSize: '0.88rem' }}>
                                            ⚙️ CÀI ĐẶT CHỌN ẢNH CHO KHÁCH HÀNG
                                        </Typography>
                                        
                                        <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={coGioiHanAnh}
                                                        onChange={(e) => setCoGioiHanAnh(e.target.checked)}
                                                        color="primary"
                                                    />
                                                }
                                                label={<Typography variant="body2" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Giới hạn số lượng ảnh khách chọn</Typography>}
                                            />
                                            
                                            {coGioiHanAnh && (
                                                <TextField
                                                    label="Số lượng ảnh"
                                                    type="number"
                                                    size="small"
                                                    value={soLuongAnhGioiHan}
                                                    onChange={(e) => setSoLuongAnhGioiHan(e.target.value)}
                                                    InputProps={{ inputProps: { min: 1 }, style: { borderRadius: '8px' } }}
                                                    style={{ width: '140px' }}
                                                />
                                            )}

                                            <Button 
                                                variant="contained" 
                                                size="small" 
                                                color="primary" 
                                                onClick={handleSaveAlbumSettings}
                                                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                                            >
                                                Lưu Cài Đặt
                                            </Button>
                                        </Box>

                                        <Box mt={2} p={1.5} borderRadius="8px" bgcolor={khachHangXacNhan ? '#f0fdf4' : '#fffbe6'} border={khachHangXacNhan ? '1px solid #bbf7d0' : '1px solid #ffe58f'}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={khachHangXacNhan}
                                                        onChange={(e) => setKhachHangXacNhan(e.target.checked)}
                                                        color={khachHangXacNhan ? "success" : "warning"}
                                                    />
                                                }
                                                label={
                                                    <Typography variant="body2" style={{ fontWeight: 700, color: khachHangXacNhan ? '#166534' : '#d97706' }}>
                                                        Khóa album (Khách hàng đã chọn ảnh xong)
                                                    </Typography>
                                                }
                                            />
                                            <Typography variant="caption" display="block" style={{ color: '#64748b', marginTop: '2px' }}>
                                                Khi bật công tắc này, khách hàng sẽ không thể chọn thêm hay bỏ chọn ảnh trên website.
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>
                                        📷 Tổng số ảnh gốc: {albumData.danhSachAnh.length}
                                    </Typography>
                                    <Box sx={{ width: '100%', columnCount: { xs: 2, sm: 3 }, columnGap: '16px', mt: 2 }}>
                                        {albumData.danhSachAnh.map((item) => (
                                            <Box key={item.idDrive} sx={{ mb: '16px', breakInside: 'avoid' }}>
                                                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
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
                                                        fontSize: '0.78rem',
                                                        fontWeight: '500',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {item.tenFile}
                                                    </div>
                                                </div>
                                            </Box>
                                        ))}
                                    </Box>
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: '14px 24px', bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
                    <Button 
                        onClick={() => setOpenChupHinhDialog(false)} 
                        sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none', fontSize: '0.85rem' }}
                    >
                        Hủy bỏ
                    </Button>
                    <Box display="flex" gap={1.5}>
                        <Button 
                            onClick={() => handleUpdateChupHinh(false)} 
                            variant="outlined" 
                            sx={{ 
                                borderRadius: '8px', 
                                textTransform: 'none', 
                                fontWeight: 600, 
                                fontSize: '0.85rem',
                                borderColor: '#cbd5e1',
                                color: '#334155',
                                '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }
                            }}
                        >
                            Cập nhật thông tin
                        </Button>
                        <Button 
                            onClick={() => handleUpdateChupHinh(true)} 
                            variant="contained" 
                            sx={{ 
                                borderRadius: '8px', 
                                textTransform: 'none', 
                                fontWeight: 700, 
                                fontSize: '0.85rem',
                                padding: '6px 20px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                boxShadow: '0 4px 10px rgba(16,185,129,0.3)',
                                '&:hover': { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }
                            }}
                        >
                            Chuyển sang hậu kỳ ➔
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Dialog Cập nhật lịch hậu kỳ cho Tab Hậu Kỳ */}
            <Dialog 
                open={openHauKyDialog} 
                onClose={() => setOpenHauKyDialog(false)} 
                maxWidth="md" 
                fullWidth 
                PaperProps={{ 
                    style: { 
                        maxWidth: '820px',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        overflow: 'hidden'
                    } 
                }}
            >
                {/* Header section with gradient background */}
                <Box 
                    sx={{ 
                        p: 2.5, 
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                        color: '#ffffff'
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <Box 
                                sx={{ 
                                    width: 44, 
                                    height: 44, 
                                    borderRadius: '12px', 
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: '#ffffff',
                                    fontSize: '1.25rem',
                                    boxShadow: '0 4px 12px rgba(139,92,246,0.4)'
                                }}
                            >
                                <FontAwesomeIcon icon={faWandMagicSparkles} />
                            </Box>
                            <Box>
                                <Typography variant="h6" style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.2px', color: '#ffffff' }}>
                                    CHI TIẾT TIẾN TRÌNH HẬU KỲ
                                </Typography>
                                <Typography variant="caption" style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                                    Quản lý thợ chỉnh sửa, ngày trả ảnh & đồng bộ file hậu kỳ
                                </Typography>
                            </Box>
                        </Box>

                        <Chip 
                            label={`Mã HĐ: ${selectedHauKyContract?.maHopDong || ''}`} 
                            sx={{ 
                                bgcolor: 'rgba(255,255,255,0.12)', 
                                color: '#c084fc', 
                                fontWeight: 700, 
                                fontSize: '0.82rem',
                                border: '1px solid rgba(192,132,252,0.3)'
                            }} 
                        />
                    </Box>

                    {/* Customer Quick Summary Bar */}
                    {selectedHauKyContract && (
                        <Box 
                            mt={2} 
                            p={1.5} 
                            borderRadius="10px" 
                            sx={{ 
                                backgroundColor: 'rgba(255,255,255,0.06)', 
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 2.5,
                                fontSize: '0.8rem',
                                color: '#cbd5e1'
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={0.8}>
                                <span style={{ color: '#60a5fa' }}>👤</span>
                                <span>Khách hàng: <strong style={{ color: '#ffffff' }}>{selectedHauKyContract.khachHang1?.tenKhachHang || 'Khách hàng'}</strong></span>
                            </Box>
                            {selectedHauKyContract.khachHang1?.soDienThoai && (
                                <Box display="flex" alignItems="center" gap={0.8}>
                                    <span style={{ color: '#4ade80' }}>📞</span>
                                    <span>SĐT: <strong style={{ color: '#ffffff' }}>{selectedHauKyContract.khachHang1.soDienThoai}</strong></span>
                                    {selectedHauKyContract.khachHang1?.facebookId && (
                                        <a 
                                            href={selectedHauKyContract.khachHang1.facebookId.startsWith('http') ? selectedHauKyContract.khachHang1.facebookId : `https://facebook.com/${selectedHauKyContract.khachHang1.facebookId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#c084fc', textDecoration: 'none', marginLeft: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                            title="Mở Facebook Khách hàng"
                                        >
                                            <i className="fa-brands fa-facebook"></i> Facebook
                                        </a>
                                    )}
                                </Box>
                            )}
                            <Box display="flex" alignItems="center" gap={0.8} ml="auto">
                                <span>Tiến trình:</span>
                                <strong style={{ color: confirmSubGiaiDoan === 'hoan_thanh' ? '#0d9488' : confirmSubGiaiDoan === 'cho_khach_duyet' ? '#7c3aed' : confirmSubGiaiDoan === 'dang_chinh' ? '#2563eb' : '#ea580c' }}>
                                    {confirmSubGiaiDoan === 'cho_chinh' ? '⏳ Chờ chỉnh' : confirmSubGiaiDoan === 'dang_chinh' ? '🎨 Đang chỉnh' : confirmSubGiaiDoan === 'cho_khach_duyet' ? '💬 Khách duyệt' : '✓ Hoàn thành'}
                                </strong>
                            </Box>
                        </Box>
                    )}
                </Box>

                <DialogContent dividers sx={{ p: 3, bgcolor: '#f8fafc' }}>
                    <Box display="flex" flexDirection="column" gap={2.5}>
                        {/* Section 0: 4 Trạng thái tiến trình Hậu kỳ */}
                        <Box p={2.5} borderRadius="12px" bgcolor="#ffffff" boxShadow="0 1px 3px rgba(0,0,0,0.05)" border="1px solid #e2e8f0">
                            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
                                <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#8b5cf6' }}>🚀</span> Trạng thái tiến trình hậu kỳ
                                </Typography>
                                <Chip 
                                    label={
                                        confirmSubGiaiDoan === 'cho_chinh' ? '⏳ Chờ chỉnh' :
                                        confirmSubGiaiDoan === 'dang_chinh' ? '🎨 Đang chỉnh' :
                                        confirmSubGiaiDoan === 'cho_khach_duyet' ? '💬 Khách duyệt' :
                                        '✓ Hoàn thành'
                                    }
                                    size="small"
                                    sx={{ 
                                        fontWeight: 700, 
                                        fontSize: '0.74rem',
                                        bgcolor: 
                                            confirmSubGiaiDoan === 'cho_chinh' ? '#fff7ed' :
                                            confirmSubGiaiDoan === 'dang_chinh' ? '#eff6ff' :
                                            confirmSubGiaiDoan === 'cho_khach_duyet' ? '#f5f3ff' : '#f0fdfa',
                                        color: 
                                            confirmSubGiaiDoan === 'cho_chinh' ? '#ea580c' :
                                            confirmSubGiaiDoan === 'dang_chinh' ? '#2563eb' :
                                            confirmSubGiaiDoan === 'cho_khach_duyet' ? '#7c3aed' : '#0d9488',
                                        border: '1px solid currentColor'
                                    }}
                                />
                            </Box>

                            <Grid container spacing={1.5}>
                                {HAU_KY_SUB_STAGES.map((stg) => {
                                    const isSelected = confirmSubGiaiDoan === stg.id;
                                    return (
                                        <Grid item xs={6} sm={3} key={stg.id}>
                                            <Box 
                                                onClick={() => {
                                                    setConfirmSubGiaiDoan(stg.id);
                                                    if (stg.id === 'dang_chinh' && !confirmNgayChinhAnh) {
                                                        const today = new Date().toISOString().split('T')[0];
                                                        setConfirmNgayChinhAnh(today);
                                                        if (!confirmNgayTraAnh) {
                                                            const d = new Date();
                                                            d.setDate(d.getDate() + 3);
                                                            setConfirmNgayTraAnh(d.toISOString().split('T')[0]);
                                                        }
                                                    }
                                                }}
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    border: isSelected ? `2px solid ${stg.color}` : '1px solid #e2e8f0',
                                                    bgcolor: isSelected ? stg.bg : '#ffffff',
                                                    boxShadow: isSelected ? `0 4px 12px ${stg.badgeBg}` : 'none',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 0.5,
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    userSelect: 'none',
                                                    '&:hover': {
                                                        borderColor: stg.color,
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                                                    }
                                                }}
                                            >
                                                {isSelected && (
                                                    <Box 
                                                        sx={{ 
                                                            position: 'absolute', 
                                                            top: 6, 
                                                            right: 6, 
                                                            width: 16, 
                                                            height: 16, 
                                                            borderRadius: '50%', 
                                                            bgcolor: stg.color, 
                                                            color: '#fff', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            fontSize: '0.65rem',
                                                            fontWeight: 900
                                                        }}
                                                    >
                                                        ✓
                                                    </Box>
                                                )}
                                                <Box display="flex" alignItems="center" gap={0.8}>
                                                    <span style={{ fontSize: '1.15rem' }}>{stg.icon}</span>
                                                    <Typography variant="body2" style={{ fontWeight: 800, color: isSelected ? stg.color : '#1e293b', fontSize: '0.85rem' }}>
                                                        {stg.name}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" style={{ color: isSelected ? '#334155' : '#64748b', fontSize: '0.72rem', lineHeight: 1.3 }}>
                                                    {stg.desc}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>

                        {/* Section 1: Phân công & Lịch hậu kỳ */}
                        <Box p={2.5} borderRadius="12px" bgcolor="#ffffff" boxShadow="0 1px 3px rgba(0,0,0,0.05)" border="1px solid #e2e8f0">
                            <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#1e293b', marginBottom: '16px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#7c3aed' }}>🎨</span> Phân công nhân sự & Thời gian trả ảnh
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="confirm-tho-chinh-anh-label">Thợ chỉnh ảnh</InputLabel>
                                        <Select
                                            labelId="confirm-tho-chinh-anh-label"
                                            value={confirmThoChinhAnh}
                                            onChange={(e) => setConfirmThoChinhAnh(e.target.value)}
                                            label="Thợ chỉnh ảnh"
                                            sx={{ borderRadius: '8px' }}
                                        >
                                            <MenuItem value=""><em>-- Chưa phân công --</em></MenuItem>
                                            {(() => {
                                                const staff = listStaff.filter(s => s.positon === 'Thợ chỉnh ảnh');
                                                const names = staff.map(s => s.fullname || s.username);
                                                if (confirmThoChinhAnh && !names.includes(confirmThoChinhAnh)) {
                                                    names.push(confirmThoChinhAnh);
                                                }
                                                return names.map((name, i) => (
                                                    <MenuItem key={i} value={name}>🎨 {name}</MenuItem>
                                                ));
                                            })()}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Ngày bắt đầu hậu kỳ"
                                        type="date"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        value={confirmNgayChinhAnh}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setConfirmNgayChinhAnh(val);
                                            if (val && !confirmNgayTraAnh) {
                                                const d = new Date(val);
                                                d.setDate(d.getDate() + 3);
                                                const year = d.getFullYear();
                                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                                const day = String(d.getDate()).padStart(2, '0');
                                                setConfirmNgayTraAnh(`${year}-${month}-${day}`);
                                            }
                                        }}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{ style: { borderRadius: '8px' } }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Ngày trả ảnh"
                                        type="date"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        value={confirmNgayTraAnh}
                                        onChange={(e) => setConfirmNgayTraAnh(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{ style: { borderRadius: '8px' } }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Section 2: Đường dẫn Drive & Đồng bộ */}
                        <Box p={2.5} borderRadius="12px" bgcolor="#ffffff" boxShadow="0 1px 3px rgba(0,0,0,0.05)" border="1px solid #e2e8f0">
                            <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#1e293b', marginBottom: '16px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#0284c7' }}>☁️</span> Đường dẫn ảnh Google Drive / Photos
                            </Typography>

                            <Box display="flex" flexDirection="column" gap={2}>
                                <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
                                    <TextField
                                        label="Đường dẫn ảnh gốc"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        value={confirmLinkAnh}
                                        onChange={(e) => setConfirmLinkAnh(e.target.value)}
                                        placeholder="Google Drive hoặc Google Photos link..."
                                        InputProps={{ style: { borderRadius: '8px' } }}
                                        sx={{ flex: 1, minWidth: '240px' }}
                                    />
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        onClick={() => handleSyncAlbum(confirmLinkAnh, false)}
                                        disabled={isSyncingAlbum || !selectedHauKyContract}
                                        sx={{ 
                                            borderRadius: '8px', 
                                            textTransform: 'none', 
                                            fontWeight: 700, 
                                            fontSize: '0.82rem',
                                            padding: '8px 18px',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {isSyncingAlbum ? "Đang đồng bộ..." : "⚡ Đồng bộ ảnh KH"}
                                    </Button>
                                </Box>

                                <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
                                    <TextField
                                        label="Đường dẫn ảnh chỉnh sửa"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        value={confirmLinkAnhChinhSua}
                                        onChange={(e) => setConfirmLinkAnhChinhSua(e.target.value)}
                                        placeholder="Google Drive hoặc Google Photos link..."
                                        InputProps={{ style: { borderRadius: '8px' } }}
                                        sx={{ flex: 1, minWidth: '240px' }}
                                    />
                                    <Button 
                                        variant="contained" 
                                        color="secondary" 
                                        onClick={() => handleSyncAlbum(confirmLinkAnhChinhSua, true)}
                                        disabled={isSyncingAlbumChinhSua || !selectedHauKyContract}
                                        sx={{ 
                                            borderRadius: '8px', 
                                            textTransform: 'none', 
                                            fontWeight: 700, 
                                            fontSize: '0.82rem',
                                            padding: '8px 18px',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {isSyncingAlbumChinhSua ? "Đang đồng bộ..." : "⚡ Đồng bộ ảnh C.Sửa"}
                                    </Button>
                                </Box>
                                <Box p={1} bgcolor="#f0f9ff" border="1px solid #bae6fd" borderRadius="8px" fontSize="0.76rem" color="#0369a1" display="flex" alignItems="center" gap={0.8}>
                                    <span>💡</span>
                                    <span><strong>Mẹo đồng bộ nhanh & ổn định:</strong> Thư mục Google Drive cần bật quyền <em>"Bất kỳ ai có đường liên kết đều có thể xem"</em>. Ưu tiên dùng Google Drive để quét ảnh nhanh và giữ nguyên tên file gốc.</span>
                                </Box>
                            </Box>
                        </Box>

                        {/* Section 3: Thông tin Album */}
                        {albumData && (
                            <Box p={2.5} borderRadius="12px" bgcolor="#ffffff" boxShadow="0 1px 3px rgba(0,0,0,0.05)" border="1px solid #e2e8f0">
                                <Typography variant="subtitle2" style={{ fontWeight: 700, marginBottom: '12px', color: '#1e293b', fontSize: '0.88rem' }}>
                                    📷 THÔNG TIN ALBUM & KHÓA CHỌN ẢNH
                                </Typography>

                                <Box display="flex" gap={2} flexWrap="wrap" fontSize="0.85rem" mb={2}>
                                    <Box p={1.2} bgcolor="#f8fafc" border="1px solid #e2e8f0" borderRadius="8px">
                                        <b>ĐB ảnh gốc: </b> 
                                        <span style={{ color: albumData.trangThai === 'Hoàn thành' ? '#059669' : '#d97706', fontWeight: 700 }}>{albumData.trangThai}</span>
                                    </Box>
                                    <Box p={1.2} bgcolor="#f8fafc" border="1px solid #e2e8f0" borderRadius="8px">
                                        <b>ĐB ảnh C.Sửa: </b> 
                                        <span style={{ color: albumData.trangThaiChinhSua === 'Hoàn thành' ? '#059669' : '#d97706', fontWeight: 700 }}>{albumData.trangThaiChinhSua || 'Chưa đồng bộ'}</span>
                                    </Box>
                                    <Box p={1.2} bgcolor="#f8fafc" border="1px solid #e2e8f0" borderRadius="8px"><b>Số ảnh gốc:</b> {albumData.danhSachAnh?.length || 0}</Box>
                                    <Box p={1.2} bgcolor="#f8fafc" border="1px solid #e2e8f0" borderRadius="8px"><b style={{ color: '#dc2626' }}>❤️ Đã tim:</b> {albumData.danhSachAnh?.filter(a => a.isHearted).length || 0}</Box>
                                    <Box p={1.2} bgcolor="#f8fafc" border="1px solid #e2e8f0" borderRadius="8px"><b>Ảnh chỉnh sửa:</b> {albumData.danhSachAnhChinhSua?.length || 0}</Box>
                                </Box>

                                <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        size="small"
                                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                                        onClick={() => setOpenLocAnhDialog(true)}
                                    >
                                        💻 Lọc ảnh trên máy tính
                                    </Button>

                                    <Box display="flex" alignItems="center" gap={1} p={1} borderRadius="8px" bgcolor={khachHangXacNhan ? '#f0fdf4' : '#fffbe6'} border={khachHangXacNhan ? '1px solid #bbf7d0' : '1px solid #ffe58f'}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={khachHangXacNhan}
                                                    onChange={(e) => setKhachHangXacNhan(e.target.checked)}
                                                    color={khachHangXacNhan ? "success" : "warning"}
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Typography variant="body2" style={{ fontWeight: 700, color: khachHangXacNhan ? '#166534' : '#d97706', fontSize: '0.82rem' }}>
                                                    Khóa album (Khách chọn xong)
                                                </Typography>
                                            }
                                        />
                                    </Box>

                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        color="primary" 
                                        onClick={handleSaveAlbumSettings}
                                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                                    >
                                        Lưu cài đặt khóa album
                                    </Button>
                                </Box>

                                {albumData.danhSachAnhChinhSua && albumData.danhSachAnhChinhSua.some(p => p.comments && p.comments.length > 0) && (
                                    <Box mt={2.5} p={2} border="1px solid #e2e8f0" borderRadius="10px" bgcolor="#fafafa">
                                        <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#2563eb', marginBottom: '8px', fontSize: '0.85rem' }}>
                                            💬 BÌNH LUẬN ẢNH CHỈNH SỬA
                                        </Typography>
                                        <Box style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '5px' }}>
                                            {albumData.danhSachAnhChinhSua.filter(p => p.comments && p.comments.length > 0).map(photo => (
                                                <div key={photo.idDrive} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px dashed #e2e8f0' }}>
                                                    <Typography variant="body2" fontWeight="bold" style={{ color: '#dc2626', fontSize: '0.82rem' }}>
                                                        📷 {photo.tenFile}
                                                    </Typography>
                                                    {photo.comments.map((c, i) => (
                                                        <Box key={i} mt={0.5} ml={2} p={1} bgcolor="#ffffff" borderRadius="6px" border="1px solid #f1f5f9">
                                                            <Typography variant="body2" style={{ fontSize: '0.82rem' }}>{c.noiDung}</Typography>
                                                            <Typography variant="caption" color="textSecondary" display="block" style={{ marginTop: '2px', fontSize: '0.72rem' }}>
                                                                🕒 {new Date(c.ngayTao).toLocaleString()}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </div>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: '14px 24px', bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Button 
                        onClick={() => {
                            setOpenHauKyDialog(false);
                            setSendData(selectedHauKyContract);
                            setOpenDetailDialog(true);
                        }} 
                        variant="outlined" 
                        color="info"
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        📄 Xem chi tiết HĐ
                    </Button>
                    <Box display="flex" gap={1.2} flexWrap="wrap">
                        <Button 
                            onClick={() => setOpenHauKyDialog(false)} 
                            sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none', fontSize: '0.85rem' }}
                        >
                            Hủy
                        </Button>
                        <Button 
                            onClick={() => handleUpdateHauKy(null)} 
                            variant="outlined" 
                            sx={{ 
                                borderRadius: '8px', 
                                textTransform: 'none', 
                                fontWeight: 600, 
                                fontSize: '0.85rem',
                                borderColor: '#cbd5e1',
                                color: '#334155'
                            }}
                        >
                            Cập nhật thông tin
                        </Button>
                        <Button 
                            onClick={() => {
                                if (!confirmLinkAnhChinhSua.trim()) {
                                    toast.error("Vui lòng nhập đường dẫn ảnh chỉnh sửa trước khi chuyển sang in ảnh!");
                                    return;
                                }
                                
                                let initialList = [];
                                if (selectedHauKyContract?.danhSachAnhIn && selectedHauKyContract.danhSachAnhIn.length > 0) {
                                    initialList = [...selectedHauKyContract.danhSachAnhIn];
                                } else if (selectedHauKyContract && Array.isArray(selectedHauKyContract.gioHang)) {
                                    let q16x21 = 0;
                                    let q20x30 = 0;
                                    let q60x90 = 0;
                                    
                                    selectedHauKyContract.gioHang.forEach(item => {
                                        const qty = item.soLuong || 1;
                                        q16x21 += (Number(item.soLuongAnh16x21) || 0) * qty;
                                        q20x30 += (Number(item.soLuongAnh20x30) || 0) * qty;
                                        q60x90 += (Number(item.soLuongAnh60x90) || 0) * qty;
                                    });
                                    
                                    if (q16x21 > 0) {
                                        initialList.push({ kichThuoc: "16x21", soLuong: q16x21 });
                                    }
                                    if (q20x30 > 0) {
                                        initialList.push({ kichThuoc: "20x30", soLuong: q20x30 });
                                    }
                                    if (q60x90 > 0) {
                                        initialList.push({ kichThuoc: "60x90", soLuong: q60x90 });
                                    }
                                }
                                
                                setTempDanhSachAnhIn(initialList);
                                setTempKichThuoc("");
                                setTempSoLuong(1);
                                setNewlyAddedPhotos([]);
                                setSelectedDichVuOption(null);
                                setOpenInAnhInputDialog(true);
                            }} 
                            variant="contained" 
                            sx={{ 
                                borderRadius: '8px', 
                                textTransform: 'none', 
                                fontWeight: 700, 
                                fontSize: '0.85rem',
                                padding: '6px 18px',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                boxShadow: '0 4px 10px rgba(245,158,11,0.3)',
                                '&:hover': { background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }
                            }}
                        >
                            Chuyển sang in ảnh ➔
                        </Button>
                        <Button 
                            onClick={() => handleUpdateHauKy(5)} 
                            variant="contained" 
                            sx={{ 
                                borderRadius: '8px', 
                                textTransform: 'none', 
                                fontWeight: 700, 
                                fontSize: '0.85rem',
                                padding: '6px 18px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                boxShadow: '0 4px 10px rgba(16,185,129,0.3)',
                                '&:hover': { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }
                            }}
                        >
                            Hoàn thành ➔
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            <LocAnhMayTinhDialog 
                open={openLocAnhDialog} 
                onClose={() => setOpenLocAnhDialog(false)} 
                albumData={albumData} 
            />

            {/* Dialog nhập kích thước & số lượng khi chuyển sang in ảnh */}
            <Dialog 
                open={openInAnhInputDialog} 
                onClose={() => setOpenInAnhInputDialog(false)} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    style: {
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        overflow: 'hidden'
                    }
                }}
            >
                <Box 
                    sx={{ 
                        p: 2.5, 
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                        color: '#ffffff'
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <Box 
                                sx={{ 
                                    width: 40, 
                                    height: 40, 
                                    borderRadius: '10px', 
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: '#ffffff',
                                    fontSize: '1.1rem'
                                }}
                            >
                                <FontAwesomeIcon icon={faPrint} />
                            </Box>
                            <Typography variant="h6" style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>
                                NHẬP THÔNG TIN ẢNH IN
                            </Typography>
                        </Box>

                        <Chip 
                            label={`Mã HĐ: ${selectedHauKyContract?.maHopDong || ''}`} 
                            sx={{ 
                                bgcolor: 'rgba(255,255,255,0.12)', 
                                color: '#fbbf24', 
                                fontWeight: 700, 
                                fontSize: '0.8rem'
                            }} 
                        />
                    </Box>
                </Box>

                <DialogContent dividers sx={{ p: 3, bgcolor: '#f8fafc' }}>
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Typography variant="body2" style={{ color: '#475569', fontSize: '0.85rem' }}>
                            Chọn dịch vụ ảnh từ danh sách hoặc nhập kích thước tự do:
                        </Typography>

                        <Box display="flex" flexDirection="column" gap={1.5} p={2} bgcolor="#ffffff" borderRadius="10px" border="1px solid #e2e8f0">
                            <Autocomplete
                                options={listDichVu}
                                getOptionLabel={(option) => `${option.tenDichVu} (${option.maDichVu}) - ${Number(option.giaChoThueDichVu || 0).toLocaleString("vi-VN")}đ`}
                                value={selectedDichVuOption}
                                onChange={(event, newValue) => {
                                    setSelectedDichVuOption(newValue);
                                    if (newValue) {
                                        setTempKichThuoc(newValue.tenDichVu);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Tìm kiếm dịch vụ ảnh"
                                        variant="outlined"
                                        size="small"
                                        InputProps={{ ...params.InputProps, style: { borderRadius: '8px' } }}
                                    />
                                )}
                                fullWidth
                            />
                            <Box display="flex" gap={1}>
                                <TextField
                                    label="Kích thước / Tên dịch vụ ảnh"
                                    variant="outlined"
                                    value={tempKichThuoc}
                                    onChange={(e) => setTempKichThuoc(e.target.value)}
                                    size="small"
                                    style={{ flex: 2 }}
                                    InputProps={{ style: { borderRadius: '8px' } }}
                                />
                                <TextField
                                    label="Số lượng"
                                    type="number"
                                    variant="outlined"
                                    value={tempSoLuong}
                                    onChange={(e) => setTempSoLuong(Math.max(1, parseInt(e.target.value) || 1))}
                                    size="small"
                                    style={{ flex: 1 }}
                                    inputProps={{ min: 1 }}
                                    InputProps={{ style: { borderRadius: '8px' } }}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                                    onClick={() => {
                                        if (!tempKichThuoc.trim()) {
                                            toast.warning("Vui lòng nhập kích thước hoặc chọn dịch vụ!");
                                            return;
                                        }
                                        setTempDanhSachAnhIn([
                                            ...tempDanhSachAnhIn,
                                            {
                                                kichThuoc: tempKichThuoc.trim(),
                                                soLuong: tempSoLuong,
                                                dichVuId: selectedDichVuOption?._id || null,
                                                donGia: selectedDichVuOption?.giaChoThueDichVu || 0
                                            }
                                        ]);
                                        if (selectedDichVuOption) {
                                            setNewlyAddedPhotos([
                                                ...newlyAddedPhotos,
                                                {
                                                    dichVu: selectedDichVuOption._id,
                                                    tenDichVuSnapshot: selectedDichVuOption.tenDichVu,
                                                    maDichVu: selectedDichVuOption.maDichVu,
                                                    donGia: Number(selectedDichVuOption.giaChoThueDichVu) || 0,
                                                    soLuong: tempSoLuong,
                                                    loaiDichVu: selectedDichVuOption.loaiDichVu,
                                                    soLuongAnhChinhSua: Number(selectedDichVuOption.soLuongAnhChinhSua) || 0,
                                                    soLuongAnh16x21: Number(selectedDichVuOption.soLuongAnh16x21) || 0,
                                                    soLuongAnh20x30: Number(selectedDichVuOption.soLuongAnh20x30) || 0,
                                                    soLuongAnh60x90: Number(selectedDichVuOption.soLuongAnh60x90) || 0,
                                                    trangDiemNgayAnHoi: selectedDichVuOption.trangDiemNgayAnHoi || "",
                                                    trangDiemNgayCuoi: selectedDichVuOption.trangDiemNgayCuoi || "",
                                                    trangPhucChoDoiBeLe: selectedDichVuOption.trangPhucChoDoiBeLe || "",
                                                    trangPhucCoDauNgayAnHoi: selectedDichVuOption.trangPhucCoDauNgayAnHoi || "",
                                                    trangPhucChuReNgayAnHoi: selectedDichVuOption.trangPhucChuReNgayAnHoi || "",
                                                    trangPhucVayCuoiNgayCuoi: selectedDichVuOption.trangPhucVayCuoiNgayCuoi || "",
                                                    trangPhucVestChuReNgayCuoi: selectedDichVuOption.trangPhucVestChuReNgayCuoi || "",
                                                    hoaCamTay: selectedDichVuOption.hoaCamTay || ""
                                                }
                                            ]);
                                        }
                                        setTempKichThuoc("");
                                        setTempSoLuong(1);
                                        setSelectedDichVuOption(null);
                                    }}
                                >
                                    Thêm
                                </Button>
                            </Box>
                        </Box>

                        <Box style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', backgroundColor: '#ffffff' }}>
                            {tempDanhSachAnhIn.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', margin: '16px 0' }}>Chưa có ảnh in nào trong danh sách</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                                            <th style={{ padding: '8px' }}>STT</th>
                                            <th style={{ padding: '8px' }}>Kích thước</th>
                                            <th style={{ padding: '8px' }}>Số lượng</th>
                                            <th style={{ padding: '8px', textAlign: 'center' }}>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tempDanhSachAnhIn.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '8px' }}>{idx + 1}</td>
                                                <td style={{ padding: '8px', fontWeight: 600, color: '#1e293b' }}>{item.kichThuoc}</td>
                                                <td style={{ padding: '8px', fontWeight: 700, color: '#2563eb' }}>{item.soLuong}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        sx={{ textTransform: 'none' }}
                                                        onClick={() => {
                                                            const itemToDelete = tempDanhSachAnhIn[idx];
                                                            setTempDanhSachAnhIn(tempDanhSachAnhIn.filter((_, i) => i !== idx));
                                                            if (itemToDelete.dichVuId) {
                                                                setNewlyAddedPhotos(newlyAddedPhotos.filter(p => p.dichVu !== itemToDelete.dichVuId));
                                                            }
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
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: '14px 24px', bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
                    <Button onClick={() => setOpenInAnhInputDialog(false)} sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}>
                        Quay lại
                    </Button>
                    <Button
                        onClick={() => {
                            if (tempDanhSachAnhIn.length === 0) {
                                toast.warning("Vui lòng thêm ít nhất một ảnh in!");
                                return;
                            }
                            handleUpdateHauKy(4);
                            setOpenInAnhInputDialog(false);
                        }}
                        variant="contained"
                        sx={{ 
                            borderRadius: '8px', 
                            textTransform: 'none', 
                            fontWeight: 700, 
                            fontSize: '0.85rem',
                            padding: '6px 20px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 4px 10px rgba(16,185,129,0.3)'
                        }}
                    >
                        Xác nhận chuyển in ảnh ➔
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog quản lý & bàn giao in ấn cho Tab In Ảnh */}
            <Dialog open={openInAnhViewDialog} onClose={() => setOpenInAnhViewDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle style={{ fontWeight: 'bold', color: '#1976d2' }}>
                    CHI TIẾT IN ẤN - HĐ: {selectedInAnhContract?.maHopDong}
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <Box display="flex" flexDirection="column" gap={0.5}>
                            <p style={{ margin: 0, fontSize: '0.95rem' }}><strong>Khách hàng:</strong> {selectedInAnhContract?.khachHang1?.tenKhachHang} {selectedInAnhContract?.khachHang1?.soDienThoai ? `(${selectedInAnhContract.khachHang1.soDienThoai})` : ''}</p>
                            {selectedInAnhContract?.khachHang2 && (
                                <p style={{ margin: 0, fontSize: '0.95rem' }}><strong>Khách hàng 2:</strong> {selectedInAnhContract.khachHang2.tenKhachHang} {selectedInAnhContract.khachHang2.soDienThoai ? `(${selectedInAnhContract.khachHang2.soDienThoai})` : ''}</p>
                            )}
                            <p style={{ margin: 0, fontSize: '0.95rem' }}><strong>Thời gian chuyển in ảnh:</strong> {formatDateTime(selectedInAnhContract?.cacNgay?.ngayChuyenInAnh) || "Chưa cập nhật"}</p>
                            <p style={{ margin: 0, fontSize: '0.95rem' }}><strong>Ngày trả ảnh:</strong> {formatDateOnly(selectedInAnhContract?.cacNgay?.ngayTraAnh) || "Chưa cập nhật"}</p>
                            {selectedInAnhContract?.linkAnhChinhSua && (
                                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                                    <strong>Link ảnh chỉnh sửa:</strong> <a href={selectedInAnhContract.linkAnhChinhSua} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>Mở link Drive</a>
                                </p>
                            )}
                        </Box>

                        <h4 style={{ margin: '12px 0 6px 0', color: '#333' }}>Danh sách ảnh in:</h4>
                        <Box style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '8px' }}>
                            {!selectedInAnhContract?.danhSachAnhIn || selectedInAnhContract.danhSachAnhIn.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#999', fontSize: '0.85rem', margin: '16px 0' }}>Chưa cập nhật danh sách ảnh in</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                                            <th style={{ padding: '6px' }}>STT</th>
                                            <th style={{ padding: '6px' }}>Kích thước</th>
                                            <th style={{ padding: '6px' }}>Số lượng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedInAnhContract.danhSachAnhIn.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                                <td style={{ padding: '6px' }}>{idx + 1}</td>
                                                <td style={{ padding: '6px' }}>{item.kichThuoc}</td>
                                                <td style={{ padding: '6px' }}>{item.soLuong}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px', justifyContent: 'space-between' }}>
                    <Button onClick={() => {
                        setOpenInAnhViewDialog(false);
                        setSendData(selectedInAnhContract);
                        setOpenDetailDialog(true);
                    }} variant="outlined" color="info">
                        Xem chi tiết HĐ
                    </Button>
                    <Box display="flex" gap={1}>
                        <Button onClick={() => setOpenInAnhViewDialog(false)} color="inherit">
                            Thoát
                        </Button>
                        <Button
                            onClick={() => {
                                triggerCompleteContract(selectedInAnhContract);
                            }}
                            variant="contained"
                            color="success"
                        >
                            Bàn giao & Hoàn thành
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Dialog Thanh toán khi hoàn thành */}
            <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle style={{ fontWeight: 'bold', color: '#e74c3c' }}>
                    HỢP ĐỒNG CHƯA THANH TOÁN HẾT
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>
                            Hợp đồng <strong>{paymentContract?.maHopDong}</strong> còn lại: <strong style={{ color: 'red' }}>{Number(paymentContract?.thanhToan?.conLai || 0).toLocaleString("vi-VN")}đ</strong> chưa thanh toán.
                        </p>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                            Vui lòng nhập số tiền thanh toán để hoàn thành hợp đồng:
                        </p>
                        <TextField
                            label="Số tiền thanh toán"
                            type="number"
                            variant="outlined"
                            fullWidth
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Math.max(0, Number(e.target.value) || 0))}
                            inputProps={{ max: paymentContract?.thanhToan?.conLai || 0 }}
                        />
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="payment-method-label">Phương thức thanh toán</InputLabel>
                            <Select
                                labelId="payment-method-label"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                label="Phương thức thanh toán"
                            >
                                <MenuItem value="Tiền mặt">Tiền mặt</MenuItem>
                                <MenuItem value="Chuyển khoản">Chuyển khoản</MenuItem>
                                <MenuItem value="Thẻ">Thẻ</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Nội dung thanh toán"
                            variant="outlined"
                            fullWidth
                            value={paymentNote}
                            onChange={(e) => setPaymentNote(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button onClick={() => setOpenPaymentDialog(false)} color="inherit">
                        Hủy
                    </Button>
                    <Button onClick={handleConfirmPaymentAndComplete} variant="contained" color="success">
                        Thanh toán & Hoàn thành
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Quản lý & Phân công lịch makeup */}
            <Dialog 
                open={openMakeUpDialog} 
                onClose={() => setOpenMakeUpDialog(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    style: {
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        overflow: 'hidden'
                    }
                }}
            >
                <Box 
                    sx={{ 
                        p: 2.5, 
                        background: 'linear-gradient(135deg, #831843 0%, #be185d 100%)', 
                        color: '#ffffff',
                        position: 'relative'
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <Box 
                                sx={{ 
                                    width: 44, 
                                    height: 44, 
                                    borderRadius: '12px', 
                                    background: 'rgba(255, 255, 255, 0.2)', 
                                    backdropFilter: 'blur(8px)',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: '#ffffff',
                                    fontSize: '1.25rem',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}
                            >
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                            </Box>
                            <Box>
                                <Typography variant="h6" style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.2px', color: '#ffffff' }}>
                                    QUẢN LÝ & PHÂN CÔNG LỊCH MAKEUP
                                </Typography>
                                <Typography variant="caption" style={{ color: '#fbcfe8', fontSize: '0.78rem' }}>
                                    Sắp xếp lịch trang điểm, địa điểm và phân công thợ makeup
                                </Typography>
                            </Box>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                            <Chip 
                                label={`Mã HĐ: ${selectedMakeUpContract?.maHopDong || ''}`} 
                                sx={{ 
                                    bgcolor: 'rgba(255,255,255,0.2)', 
                                    color: '#ffffff', 
                                    fontWeight: 700, 
                                    fontSize: '0.82rem',
                                    border: '1px solid rgba(255,255,255,0.3)'
                                }} 
                            />
                        </Box>
                    </Box>

                    {selectedMakeUpContract && (
                        <Box 
                            mt={2} 
                            p={1.5} 
                            borderRadius="10px" 
                            sx={{ 
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 2,
                                fontSize: '0.85rem'
                            }}
                        >
                            <div>
                                <strong>Khách hàng:</strong> {selectedMakeUpContract.khachHang1?.tenKhachHang || selectedMakeUpContract.hoTen || 'Chưa có tên'}
                                {selectedMakeUpContract.khachHang2?.tenKhachHang ? ` & ${selectedMakeUpContract.khachHang2.tenKhachHang}` : ''}
                            </div>
                            <div>
                                <strong>SĐT:</strong> {selectedMakeUpContract.khachHang1?.soDienThoai || selectedMakeUpContract.soDienThoai || '---'}
                            </div>
                            <div>
                                <strong>Gói:</strong> {getDichVuChinhLabel(selectedMakeUpContract.dichVuChinh)}
                            </div>
                        </Box>
                    )}
                </Box>

                <DialogContent sx={{ p: 3, backgroundColor: '#f8fafc' }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#ffffff', mb: 2.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#be185d', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className="fa-solid fa-user-tag"></i> THÔNG TIN PHÂN CÔNG MAKEUP CHÍNH
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="datetime-local"
                                    label="Ngày & Giờ makeup chính"
                                    value={confirmMakeUpDate}
                                    onChange={(e) => setConfirmMakeUpDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="makeup-staff-select-label">Thợ makeup phụ trách chính</InputLabel>
                                    <Select
                                        labelId="makeup-staff-select-label"
                                        value={confirmMakeUpStaff}
                                        onChange={(e) => setConfirmMakeUpStaff(e.target.value)}
                                        label="Thợ makeup phụ trách chính"
                                    >
                                        <MenuItem value=""><em>-- Chưa phân công --</em></MenuItem>
                                        {(() => {
                                            const staff = (listStaff || []).filter(s => s.positon === 'Thợ trang điểm' || s.chucVu === 'Thợ trang điểm' || s.position === 'Thợ trang điểm');
                                            const allNames = (staff.length > 0 ? staff : (listStaff || [])).map(s => s.fullname || s.username);
                                            if (confirmMakeUpStaff && !allNames.includes(confirmMakeUpStaff)) {
                                                allNames.push(confirmMakeUpStaff);
                                            }
                                            return allNames.map((name, idx) => (
                                                <MenuItem key={idx} value={name}>💄 {name}</MenuItem>
                                            ));
                                        })()}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Địa điểm makeup"
                                    value={confirmMakeUpLocation}
                                    onChange={(e) => setConfirmMakeUpLocation(e.target.value)}
                                    placeholder="Tại Studio / Nhà gái / Phim trường..."
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Ghi chú tone / phong cách makeup"
                                    value={confirmMakeUpNote}
                                    onChange={(e) => setConfirmMakeUpNote(e.target.value)}
                                    placeholder="Tone Thái, Hàn Quốc, phong cách tự nhiên..."
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Danh sách ca makeup chi tiết */}
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} flexWrap="wrap" gap={1}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i className="fa-solid fa-list-check" style={{ color: '#be185d' }}></i> Danh sách ca makeup trong hợp đồng ({makeUpScheduleItems.length})
                            </Typography>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={handleAddMakeUpSchedule}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    borderColor: '#f43f5e',
                                    color: '#be185d',
                                    '&:hover': { bgcolor: '#fdf2f8', borderColor: '#be185d' }
                                }}
                            >
                                + Thêm ca makeup
                            </Button>
                        </Box>

                        {makeUpScheduleItems.length === 0 ? (
                            <Box textAlign="center" py={3} color="#94a3b8">
                                Chưa có ca makeup chi tiết. Bấm "+ Thêm ca makeup" để thêm ca mới.
                            </Box>
                        ) : (
                            <Stack spacing={1.5}>
                                {makeUpScheduleItems.map((item, idx) => (
                                    <Box
                                        key={item.id || idx}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: '10px',
                                            border: '1px solid #fbcfe8',
                                            bgcolor: '#fff5f7',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1.5
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Chip label={`Ca ${idx + 1}`} size="small" sx={{ bgcolor: '#be185d', color: '#fff', fontWeight: 700 }} />
                                                <TextField
                                                    size="small"
                                                    variant="standard"
                                                    value={item.serviceName || ''}
                                                    onChange={(e) => handleUpdateMakeUpScheduleItem(item.id, 'serviceName', e.target.value)}
                                                    placeholder="Tên ca make (Ăn hỏi / Ngày cưới / Chụp ảnh...)"
                                                    InputProps={{ style: { fontWeight: 600, fontSize: '0.88rem' } }}
                                                    sx={{ minWidth: 200 }}
                                                />
                                            </Box>
                                            <IconButton size="small" color="error" onClick={() => handleRemoveMakeUpSchedule(item.id)}>
                                                <i className="fa-solid fa-trash-can" style={{ fontSize: '0.85rem' }}></i>
                                            </IconButton>
                                        </Box>
                                        <Grid container spacing={1.5}>
                                            <Grid item xs={12} sm={4}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    type="datetime-local"
                                                    label="Thời gian"
                                                    value={formatDateTimeInput(item.ngayGio)}
                                                    onChange={(e) => handleUpdateMakeUpScheduleItem(item.id, 'ngayGio', e.target.value ? new Date(e.target.value).toISOString() : '')}
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Thợ makeup</InputLabel>
                                                    <Select
                                                        value={item.nhanVien || ''}
                                                        onChange={(e) => handleUpdateMakeUpScheduleItem(item.id, 'nhanVien', e.target.value)}
                                                        label="Thợ makeup"
                                                    >
                                                        <MenuItem value=""><em>-- Chọn thợ --</em></MenuItem>
                                                        {(() => {
                                                            const staff = (listStaff || []).filter(s => s.positon === 'Thợ trang điểm' || s.chucVu === 'Thợ trang điểm' || s.position === 'Thợ trang điểm');
                                                            const allNames = (staff.length > 0 ? staff : (listStaff || [])).map(s => s.fullname || s.username);
                                                            if (item.nhanVien && !allNames.includes(item.nhanVien)) {
                                                                allNames.push(item.nhanVien);
                                                            }
                                                            return allNames.map((name, i) => (
                                                                <MenuItem key={i} value={name}>💄 {name}</MenuItem>
                                                            ));
                                                        })()}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Địa điểm make"
                                                    value={item.diaDiem || ''}
                                                    onChange={(e) => handleUpdateMakeUpScheduleItem(item.id, 'diaDiem', e.target.value)}
                                                    placeholder="Studio / Nhà gái..."
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </DialogContent>

                <DialogActions sx={{ p: 2, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
                    <Button onClick={() => setOpenMakeUpDialog(false)} color="inherit" sx={{ fontWeight: 600 }}>
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateMakeUp}
                        sx={{
                            background: 'linear-gradient(135deg, #be185d 0%, #db2777 100%)',
                            color: '#ffffff',
                            fontWeight: 700,
                            px: 3,
                            boxShadow: '0 4px 12px rgba(190,24,93,0.3)',
                            '&:hover': { background: 'linear-gradient(135deg, #9d174d 0%, #be185d 100%)' }
                        }}
                    >
                        <i className="fa-solid fa-floppy-disk" style={{ marginRight: '6px' }}></i> Lưu & Cập nhật makeup
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog xem chi tiết toàn bộ sự kiện trong ngày khi click trên lịch tháng Google Calendar */}
            <Dialog 
                open={Boolean(selectedDayModal && selectedDayModal.open)} 
                onClose={() => setSelectedDayModal({ open: false, date: null, events: [] })} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    style: {
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        overflow: 'hidden'
                    }
                }}
            >
                {(() => {
                    const modalDate = selectedDayModal?.date ? new Date(selectedDayModal.date) : null;
                    const lunarInfo = modalDate ? getDetailedLunarInfo(modalDate) : null;
                    const events = selectedDayModal?.events || [];

                    return (
                        <>
                            <Box 
                                sx={{ 
                                    p: 2.5, 
                                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                                    color: '#ffffff',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Box>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#38bdf8' }}>
                                            📅 {modalDate ? `LỊCH TRÌNH NGÀY ${modalDate.getDate()}/${modalDate.getMonth() + 1}/${modalDate.getFullYear()}` : 'LỊCH TRÌNH TRONG NGÀY'}
                                        </Typography>
                                        <Chip 
                                            label={`${events.length} sự kiện`} 
                                            size="small" 
                                            sx={{ bgcolor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: 700 }}
                                        />
                                    </Box>
                                    {lunarInfo && (
                                        <Typography variant="caption" sx={{ color: '#cbd5e1', display: 'block', mt: 0.5 }}>
                                            Âm lịch: {lunarInfo.fullLunarStr} (Ngày {lunarInfo.dayName}, tháng {lunarInfo.monthName}, năm {lunarInfo.yearName})
                                        </Typography>
                                    )}
                                </Box>
                                <IconButton onClick={() => setSelectedDayModal({ open: false, date: null, events: [] })} sx={{ color: '#ffffff' }}>
                                    <i className="fa-solid fa-xmark"></i>
                                </IconButton>
                            </Box>

                            <DialogContent sx={{ p: 2.5, bgcolor: '#f8fafc', maxHeight: '65vh', overflowY: 'auto' }}>
                                {events.length === 0 ? (
                                    <Box textAlign="center" py={6} color="#94a3b8">
                                        <i className="fa-regular fa-calendar-check" style={{ fontSize: '2.5rem', marginBottom: '10px', display: 'block', color: '#cbd5e1' }}></i>
                                        Không có lịch trình nào được xếp trong ngày này.
                                    </Box>
                                ) : (
                                    <Stack spacing={1.5}>
                                        {events.map((evt, idx) => (
                                            <Paper 
                                                key={idx}
                                                elevation={0}
                                                sx={{ 
                                                    p: 2, 
                                                    borderRadius: '12px', 
                                                    border: evt.isLegacy ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
                                                    borderLeft: `5px solid ${evt.isLegacy ? '#f59e0b' : (evt.color || '#0284c7')}`,
                                                    bgcolor: evt.isLegacy ? '#fffbeb' : '#ffffff',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                                        borderColor: evt.isLegacy ? '#f59e0b' : (evt.color || '#0284c7')
                                                    }
                                                }}
                                            >
                                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                                                    <Box display="flex" alignItems="center" gap={1.2}>
                                                        <span 
                                                            style={{
                                                                padding: '3px 8px',
                                                                borderRadius: '6px',
                                                                fontSize: '0.78rem',
                                                                fontWeight: 700,
                                                                backgroundColor: evt.bg || getEventBackground(evt.type),
                                                                color: evt.textColor || getEventTextColor(evt.type)
                                                            }}
                                                        >
                                                            {evt.title || 'Sự kiện'}
                                                        </span>
                                                        {evt.isLegacy && (
                                                            <Chip 
                                                                label="⚠️ Dữ liệu cũ" 
                                                                size="small" 
                                                                sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700, height: 22, fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                        {evt.time && (
                                                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                                                                ⏰ {evt.time}
                                                            </span>
                                                        )}
                                                    </Box>
                                                    <Chip 
                                                        label={`#${evt.contract?.maHopDong || 'HĐ'}`} 
                                                        size="small" 
                                                        sx={{ bgcolor: '#f1f5f9', color: '#0284c7', fontWeight: 700 }}
                                                    />
                                                </Box>

                                                <Box mt={1.5} display="flex" flexDirection="column" gap={0.5} fontSize="0.86rem">
                                                    <div>
                                                        <strong>Khách hàng:</strong> {evt.contract?.khachHang1?.tenKhachHang || evt.contract?.hoTen || 'Khách hàng'}
                                                        {evt.contract?.khachHang1?.soDienThoai && ` (${evt.contract.khachHang1.soDienThoai})`}
                                                    </div>
                                                    {evt.title && (
                                                        <div>
                                                            <strong>Nhiệm vụ / Dịch vụ:</strong> <span style={{ color: '#0f172a', fontWeight: 600 }}>{evt.title}</span>
                                                        </div>
                                                    )}
                                                    {evt.staff && (
                                                        <div>
                                                            <strong>Nhân sự phụ trách:</strong> <span style={{ color: '#0284c7', fontWeight: 600 }}>{evt.staff}</span>
                                                        </div>
                                                    )}
                                                    {evt.contract?.cacNgay?.diaDiemChup && (
                                                        <div>
                                                            <strong>Địa điểm:</strong> {evt.contract.cacNgay.diaDiemChup}
                                                        </div>
                                                    )}
                                                </Box>

                                                <Box mt={1.5} display="flex" justifyContent="flex-end">
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => {
                                                            setSelectedDayModal({ open: false, date: null, events: [] });
                                                            handleCalendarEventClick(evt);
                                                        }}
                                                        sx={{
                                                            textTransform: 'none',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 700,
                                                            borderRadius: '8px'
                                                        }}
                                                    >
                                                        Chi tiết / Phân công →
                                                    </Button>
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Stack>
                                )}
                            </DialogContent>

                            <DialogActions sx={{ p: 2, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                                <Button onClick={() => setSelectedDayModal({ open: false, date: null, events: [] })} color="inherit" sx={{ fontWeight: 600 }}>
                                    Đóng
                                </Button>
                            </DialogActions>
                        </>
                    );
                })()}
            </Dialog>

            {/* Dialog Tra cứu Lịch Âm */}
            <Dialog 
                open={openLunarLookup} 
                onClose={() => setOpenLunarLookup(false)} 
                maxWidth="sm" 
                fullWidth
            >
                <DialogTitle style={{ fontWeight: 'bold', color: '#1976d2', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    TRA CỨU & ĐỔI LỊCH ÂM DƯƠNG
                </DialogTitle>
                <DialogContent>
                    {/* Tabs điều hướng tự chế cực đẹp */}
                    <Box display="flex" justifyContent="center" gap={1} my={2}>
                        <Button 
                            variant={lookupTab === 0 ? "contained" : "outlined"} 
                            color="primary"
                            onClick={() => setLookupTab(0)}
                            style={{ flex: 1, textTransform: 'none', fontWeight: 'bold' }}
                        >
                            Dương lịch ➔ Âm lịch
                        </Button>
                        <Button 
                            variant={lookupTab === 1 ? "contained" : "outlined"} 
                            color="primary"
                            onClick={() => setLookupTab(1)}
                            style={{ flex: 1, textTransform: 'none', fontWeight: 'bold' }}
                        >
                            Âm lịch ➔ Dương lịch
                        </Button>
                    </Box>

                    {lookupTab === 0 ? (
                        /* CHUYỂN DƯƠNG SANG ÂM */
                        <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
                            <TextField
                                label="Chọn ngày Dương lịch"
                                type="date"
                                variant="outlined"
                                fullWidth
                                value={lookupSolarDate}
                                onChange={(e) => setLookupSolarDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />

                            {(() => {
                                const details = getDetailedLunarInfo(lookupSolarDate);
                                if (!details) {
                                    return <p style={{ textAlign: 'center', color: '#999' }}>Vui lòng chọn ngày hợp lệ.</p>;
                                }
                                return (
                                    <Box 
                                        p={2} 
                                        style={{ 
                                            backgroundColor: '#f8f9fa', 
                                            borderRadius: '8px', 
                                            border: '1px solid #e0e0e0',
                                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        <h4 style={{ margin: '0 0 12px 0', color: '#1976d2', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>
                                            KẾT QUẢ TRA CỨU
                                        </h4>
                                        <Box display="flex" flexDirection="column" gap={1.2} style={{ fontSize: '0.95rem' }}>
                                            <div>
                                                <strong>Dương lịch:</strong> <span style={{ color: '#2c3e50', fontWeight: '600' }}>{details.solarStr}</span>
                                            </div>
                                            <div>
                                                <strong>Âm lịch:</strong> <span style={{ color: '#e67e22', fontWeight: 'bold' }}>{details.fullLunarStr}</span>
                                            </div>
                                            <div>
                                                <strong>Can Chi:</strong> Ngày <strong>{details.dayName}</strong>, tháng <strong>{details.monthName}</strong>, năm <strong>{details.yearName}</strong>
                                            </div>
                                            <div>
                                                <strong>Tiết khí:</strong> <span style={{ color: '#16a34a', fontWeight: '500' }}>{details.solarTerm || 'Không có'}</span>
                                            </div>
                                            <div style={{ borderTop: '1px dotted #ccc', paddingTop: '10px', marginTop: '4px' }}>
                                                <strong>Giờ hoàng đạo (Giờ lành):</strong>
                                                <div style={{ color: '#d35400', marginTop: '4px', fontWeight: '500', lineHeight: '1.4' }}>
                                                    {details.luckyHoursStr || 'Không có'}
                                                </div>
                                            </div>
                                        </Box>
                                    </Box>
                                );
                            })()}
                        </Box>
                    ) : (
                        /* CHUYỂN ÂM SANG DƯƠNG */
                        <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
                            <Box display="flex" gap={1.5}>
                                <FormControl style={{ flex: 1 }}>
                                    <InputLabel id="lunar-day-label">Ngày Âm</InputLabel>
                                    <Select
                                        labelId="lunar-day-label"
                                        value={lookupLunarDay}
                                        label="Ngày Âm"
                                        onChange={(e) => setLookupLunarDay(e.target.value)}
                                    >
                                        {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                                            <MenuItem key={d} value={d}>{d}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl style={{ flex: 1 }}>
                                    <InputLabel id="lunar-month-label">Tháng Âm</InputLabel>
                                    <Select
                                        labelId="lunar-month-label"
                                        value={lookupLunarMonth}
                                        label="Tháng Âm"
                                        onChange={(e) => setLookupLunarMonth(e.target.value)}
                                    >
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                            <MenuItem key={m} value={m}>{m}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Năm Âm"
                                    type="number"
                                    style={{ flex: 1.2 }}
                                    value={lookupLunarYear}
                                    onChange={(e) => setLookupLunarYear(parseInt(e.target.value) || new Date().getFullYear())}
                                    inputProps={{ min: 1900, max: 2100 }}
                                />
                            </Box>

                            <Box display="flex" alignItems="center">
                                <FormControlLabel
                                    control={
                                        <Checkbox 
                                            checked={lookupLunarLeap} 
                                            onChange={(e) => setLookupLunarLeap(e.target.checked)} 
                                            color="primary"
                                        />
                                    }
                                    label={<span style={{ fontSize: '0.9rem' }}>Tháng âm lịch nhuận</span>}
                                />
                            </Box>

                            {(() => {
                                const solarDateObj = convertLunarToSolar(lookupLunarDay, lookupLunarMonth, lookupLunarYear, lookupLunarLeap);
                                if (!solarDateObj) {
                                    return (
                                        <Box p={2} style={{ backgroundColor: '#fff5f5', borderRadius: '8px', border: '1px solid #fed7d7', textAlign: 'center', color: '#c53030' }}>
                                            Ngày âm lịch này không hợp lệ cho năm đã chọn. Vui lòng kiểm tra lại.
                                        </Box>
                                    );
                                }
                                
                                const details = getDetailedLunarInfo(solarDateObj);
                                if (!details) return null;

                                return (
                                    <Box 
                                        p={2} 
                                        style={{ 
                                            backgroundColor: '#f8f9fa', 
                                            borderRadius: '8px', 
                                            border: '1px solid #e0e0e0',
                                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} style={{ borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>
                                            <h4 style={{ margin: 0, color: '#1976d2' }}>
                                                KẾT QUẢ ĐỔI NGÀY
                                            </h4>
                                            <Button 
                                                variant="contained" 
                                                color="success" 
                                                size="small"
                                                onClick={() => {
                                                    // Đổi lịch tháng dương lịch sang tháng của ngày này
                                                    setCurrentMonth(solarDateObj.getMonth());
                                                    setCurrentYear(solarDateObj.getFullYear());
                                                    setViewMode('calendar');
                                                    setOpenLunarLookup(false);
                                                    toast.success(`Đã chuyển lịch sang ${details.solarStr}`);
                                                }}
                                                style={{ textTransform: 'none', fontWeight: 'bold' }}
                                            >
                                                <i className="fa-solid fa-calendar-check" style={{ marginRight: '6px' }}></i>
                                                Xem trên lịch
                                            </Button>
                                        </Box>
                                        <Box display="flex" flexDirection="column" gap={1.2} style={{ fontSize: '0.95rem' }}>
                                            <div>
                                                <strong>Dương lịch tương ứng:</strong> <span style={{ color: '#1976d2', fontWeight: 'bold' }}>{details.solarStr}</span>
                                            </div>
                                            <div>
                                                <strong>Âm lịch:</strong> <span style={{ color: '#e67e22', fontWeight: '600' }}>{details.fullLunarStr}</span>
                                            </div>
                                            <div>
                                                <strong>Can Chi:</strong> Ngày <strong>{details.dayName}</strong>, tháng <strong>{details.monthName}</strong>, năm <strong>{details.yearName}</strong>
                                            </div>
                                            <div>
                                                <strong>Tiết khí:</strong> <span style={{ color: '#16a34a', fontWeight: '500' }}>{details.solarTerm || 'Không có'}</span>
                                            </div>
                                            <div style={{ borderTop: '1px dotted #ccc', paddingTop: '10px', marginTop: '4px' }}>
                                                <strong>Giờ hoàng đạo (Giờ lành):</strong>
                                                <div style={{ color: '#d35400', marginTop: '4px', fontWeight: '500', lineHeight: '1.4' }}>
                                                    {details.luckyHoursStr || 'Không có'}
                                                </div>
                                            </div>
                                        </Box>
                                    </Box>
                                );
                            })()}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
                    <Button onClick={() => setOpenLunarLookup(false)} color="inherit" variant="outlined" style={{ fontWeight: 'bold' }}>
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default LichCuaHang;
