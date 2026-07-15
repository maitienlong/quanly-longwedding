import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
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
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

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

import { formatLunarDateShort, getDetailedLunarInfo, convertLunarToSolar } from '../../utils/lunarDateUtils';

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

const isPastToday = (dateString, giaiDoan, tab) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    // Lấy thời điểm bắt đầu của hôm nay (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Kiểm tra xem lịch trình đã hoàn thành chưa
    let isCompleted = false;
    if (tab === 'chupHinh') {
        isCompleted = giaiDoan >= 3; // Giai đoạn >= 3 (Hậu kỳ, In ảnh, Hoàn thành) coi như đã chụp xong
    } else if (tab === 'hauKy') {
        isCompleted = giaiDoan >= 4; // Giai đoạn >= 4 (In ảnh, Hoàn thành) coi như đã chỉnh sửa xong
    } else if (tab === 'inAnh') {
        isCompleted = giaiDoan >= 5; // Giai đoạn >= 5 (Hoàn thành) coi như đã in xong
    } else if (tab === 'anHoiVaCuoi') {
        isCompleted = giaiDoan >= 5; // Giai đoạn >= 5 (Hoàn thành) coi như đã xong
    }
    
    // Báo đỏ nếu ngày lịch trình nhỏ hơn ngày hôm nay và chưa hoàn thành
    return date.getTime() < today.getTime() && !isCompleted;
};

function LichCuaHang() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [hopDong, setHopDong] = useState([]);
    const { showLoading, hideLoading } = useLoading();

    const [viewMode, setViewMode] = useState('list'); // 'list' hoặc 'calendar'
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
    const [activeTab, setActiveTab] = useState('chupHinh'); // 'chupHinh', 'hauKy', hoặc 'anHoiVaCuoi'

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
    const [selectedChupHinhContract, setSelectedChupHinhContract] = useState(null);

    const [confirmDiaDiem, setConfirmDiaDiem] = useState("");
    const [confirmChotLich, setConfirmChotLich] = useState("Chưa gọi điện");
    const [confirmLinkAnh, setConfirmLinkAnh] = useState("");
    const [confirmThoChupHinh, setConfirmThoChupHinh] = useState("");
    const [confirmThoMakeUp, setConfirmThoMakeUp] = useState("");

    // dialog cập nhật lịch hậu kỳ cho Tab Hậu Kỳ
    const [openHauKyDialog, setOpenHauKyDialog] = useState(false);
    const [selectedHauKyContract, setSelectedHauKyContract] = useState(null);
    const [confirmThoChinhAnh, setConfirmThoChinhAnh] = useState("");
    const [confirmNgayChinhAnh, setConfirmNgayChinhAnh] = useState("");
    const [confirmNgayTraAnh, setConfirmNgayTraAnh] = useState("");
    const [confirmLinkAnhChinhSua, setConfirmLinkAnhChinhSua] = useState("");

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
        let targetStage = [1, 2];

        if (tabVal === 'hauKy') {
            dateField = 'cacNgay.ngayChinhAnh';
            targetStage = 3;
        } else if (tabVal === 'inAnh') {
            dateField = 'cacNgay.ngayTraAnh';
            targetStage = 4;
        } else if (tabVal === 'anHoiVaCuoi') {
            dateField = 'anHoiVaCuoi';
            targetStage = 'all';
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
            setOpenChupHinhDialog(true);
        } else if (activeTab === 'hauKy') {
            setSelectedHauKyContract(hd);
            setConfirmThoChinhAnh(hd.nguoiPhucVu?.thoChinhAnh || "");
            setConfirmNgayChinhAnh(formatTimestampToDateInput(hd.cacNgay?.ngayChinhAnh) || "");
            setConfirmNgayTraAnh(formatTimestampToDateInput(hd.cacNgay?.ngayTraAnh) || "");
            setConfirmLinkAnhChinhSua(hd.linkAnhChinhSua || "");
            setOpenHauKyDialog(true);
        } else if (activeTab === 'inAnh') {
            setSelectedInAnhContract(hd);
            setOpenInAnhViewDialog(true);
        } else {
            setSendData(hd);
            setOpenDetailDialog(true);
        }
    };

    const handleUpdateChupHinh = (shouldTransitionToHauKy = false) => {
        if (!selectedChupHinhContract) return;

        if (shouldTransitionToHauKy) {
            if (!confirmThoChupHinh) {
                toast.error("Vui lòng chọn thợ chụp hình trước khi chuyển sang hậu kỳ!");
                return;
            }
            if (!confirmThoMakeUp) {
                toast.error("Vui lòng chọn thợ makeup trước khi chuyển sang hậu kỳ!");
                return;
            }
            if (!confirmDiaDiem || !confirmDiaDiem.trim()) {
                toast.error("Vui lòng nhập địa điểm chụp trước khi chuyển sang hậu kỳ!");
                return;
            }
            if (!confirmLinkAnh || !confirmLinkAnh.trim()) {
                toast.error("Vui lòng nhập đường dẫn ảnh gốc (link ảnh) trước khi chuyển sang hậu kỳ!");
                return;
            }
        }

        showLoading(shouldTransitionToHauKy ? "Đang chuyển trạng thái sang hậu kỳ..." : "Đang cập nhật lịch chụp...");

        const payload = {
            maHopDong: selectedChupHinhContract.maHopDong,
            cacNgay: {
                ...selectedChupHinhContract.cacNgay,
                gioChup: (() => {
                    const ngayChup = selectedChupHinhContract.cacNgay?.ngayChup;
                    if (!ngayChup) return "";
                    const date = new Date(ngayChup);
                    if (isNaN(date.getTime())) return "";
                    const hh = String(date.getHours()).padStart(2, '0');
                    const mm = String(date.getMinutes()).padStart(2, '0');
                    return `${hh}:${mm}`;
                })(),
                diaDiemChup: confirmDiaDiem,
                chotLich: confirmChotLich
            },
            nguoiPhucVu: {
                ...selectedChupHinhContract.nguoiPhucVu,
                thoChupHinh: confirmThoChupHinh,
                thoMakeUp: confirmThoMakeUp
            },
            linkAnhGoc: confirmLinkAnh
        };

        if (shouldTransitionToHauKy) {
            payload.giaiDoan = 3; // Chuyển sang hậu kỳ
        }

        otherService.UPDATE_HOPDONG(payload)
            .then((response) => {
                toast.success(shouldTransitionToHauKy ? "Đã chuyển sang hậu kỳ thành công!" : "Cập nhật thông tin chụp thành công!");
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
                giaiDoan: 5
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
            giaiDoan: 5,
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
            linkAnhChinhSua: confirmLinkAnhChinhSua
        };

        if (targetStage) {
            payload.giaiDoan = targetStage;
            if (targetStage === 4) {
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
        const filteredHopDong = hopDong || [];
        
        const getTimeFromDate = (dateString) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "";
            const hh = String(date.getHours()).padStart(2, '0');
            const mm = String(date.getMinutes()).padStart(2, '0');
            return `${hh}:${mm}`;
        };

        filteredHopDong.forEach(hd => {
            if (activeTab === 'chupHinh') {
                if (isSameDay(dayDate, hd.cacNgay?.ngayChup)) {
                    const time = getTimeFromDate(hd.cacNgay?.ngayChup) || hd.cacNgay?.gioChup || 'Chưa giờ';
                    events.push({
                        type: 'chupHinh',
                        contract: hd,
                        label: `${time} - ${hd.khachHang1?.tenKhachHang || ''}`,
                        color: '#3498db'
                    });
                }
            } else if (activeTab === 'hauKy') {
                if (isSameDay(dayDate, hd.cacNgay?.ngayChinhAnh)) {
                    events.push({
                        type: 'hauKy_chinh',
                        contract: hd,
                        label: `Bắt đầu chỉnh: ${hd.khachHang1?.tenKhachHang || ''}`,
                        color: '#9b59b6'
                    });
                }
                if (isSameDay(dayDate, hd.cacNgay?.ngayTraAnh)) {
                    events.push({
                        type: 'hauKy_tra',
                        contract: hd,
                        label: `Trả ảnh: ${hd.khachHang1?.tenKhachHang || ''}`,
                        color: '#e67e22'
                    });
                }
            } else if (activeTab === 'inAnh') {
                if (isSameDay(dayDate, hd.cacNgay?.ngayTraAnh)) {
                    events.push({
                        type: 'inAnh',
                        contract: hd,
                        label: `Bàn giao ảnh: ${hd.khachHang1?.tenKhachHang || ''}`,
                        color: '#f39c12'
                    });
                }
            } else if (activeTab === 'anHoiVaCuoi') {
                if (isSameDay(dayDate, hd.cacNgay?.ngayAnHoi)) {
                    const time = getTimeFromDate(hd.cacNgay?.ngayAnHoi);
                    const timeLabel = time ? `${time} - ` : '';
                    events.push({
                        type: 'anHoi',
                        contract: hd,
                        label: `${timeLabel}${hd.khachHang1?.tenKhachHang || ''} (Ăn Hỏi)`,
                        color: '#e74c3c'
                    });
                }
                if (isSameDay(dayDate, hd.cacNgay?.ngayCuoi)) {
                    const time = getTimeFromDate(hd.cacNgay?.ngayCuoi);
                    const timeLabel = time ? `${time} - ` : '';
                    events.push({
                        type: 'cuoi',
                        contract: hd,
                        label: `${timeLabel}${hd.khachHang1?.tenKhachHang || ''} (Cưới)`,
                        color: '#2ecc71'
                    });
                }
            }
        });
        return events;
    };

    const getEventBackground = (type) => {
        switch (type) {
            case 'chupHinh':
                return '#e8f0fe';
            case 'hauKy_chinh':
                return '#f3e8fd';
            case 'hauKy_tra':
                return '#fef3c7';
            case 'inAnh':
                return '#fef3c7';
            case 'anHoi':
                return '#fee2e2';
            case 'cuoi':
                return '#dcfce7';
            default:
                return '#f1f3f4';
        }
    };

    const getEventTextColor = (type) => {
        switch (type) {
            case 'chupHinh':
                return '#1a73e8';
            case 'hauKy_chinh':
                return '#9333ea';
            case 'hauKy_tra':
                return '#d97706';
            case 'inAnh':
                return '#d97706';
            case 'anHoi':
                return '#dc2626';
            case 'cuoi':
                return '#16a34a';
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
        
        return (
            <Paper elevation={1} style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <style>{`
                    .calendar-event-badge {
                        transition: all 0.2s ease-in-out;
                    }
                    .calendar-event-badge:hover {
                        filter: brightness(0.92);
                        box-shadow: 0 2px 5px rgba(0,0,0,0.15);
                        transform: translateY(-1px);
                    }
                `}</style>
                {/* Lịch Header / Điều hướng */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Button 
                            variant="outlined" 
                            onClick={handleGoToToday}
                            style={{ textTransform: 'none', fontWeight: 'bold' }}
                        >
                            Hôm nay
                        </Button>
                        <Button 
                            variant="outlined" 
                            onClick={handlePrevMonth}
                            style={{ minWidth: '40px', padding: '6px' }}
                            title="Tháng trước"
                        >
                            <i className="fa-solid fa-chevron-left"></i>
                        </Button>
                        <Button 
                            variant="outlined" 
                            onClick={handleNextMonth}
                            style={{ minWidth: '40px', padding: '6px' }}
                            title="Tháng sau"
                        >
                            <i className="fa-solid fa-chevron-right"></i>
                        </Button>
                    </Box>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', color: '#1976d2' }}>
                        Tháng {currentMonth + 1} năm {currentYear}
                    </h3>
                    <Box display="flex" alignItems="center">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showLunar}
                                    onChange={(e) => setShowLunar(e.target.checked)}
                                    color="primary"
                                    size="small"
                                />
                            }
                            label={<span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#5f6368' }}>Lịch âm</span>}
                        />
                    </Box>
                </Box>

                {/* Lưới ngày và thứ */}
                <Box 
                    display="grid" 
                    gridTemplateColumns="repeat(7, 1fr)" 
                    gridAutoRows="minmax(130px, auto)"
                    borderTop="1px solid #dadce0"
                    borderLeft="1px solid #dadce0"
                >
                    {/* Hàng thứ trong tuần */}
                    {dayNames.map((name, idx) => (
                        <Box 
                            key={`header-${idx}`} 
                            textAlign="center" 
                            fontWeight="bold" 
                            fontSize="0.9rem"
                            color={idx === 0 ? '#d32f2f' : idx === 6 ? '#1976d2' : '#5f6368'}
                            borderRight="1px solid #dadce0"
                            borderBottom="1px solid #dadce0"
                            padding="12px 4px"
                            backgroundColor="#f1f3f4"
                        >
                            {name}
                        </Box>
                    ))}
                    {daysGrid.map((day, idx) => {
                        const dayEvents = getEventsForDay(day.date);
                        const isDayToday = isToday(day.date);
                        const lunarInfo = getDetailedLunarInfo(day.date);

                        let dayLabel = `${day.dayNum}`;
                        if (day.dayNum === 1) {
                            dayLabel = `1 thg ${day.monthNum + 1}`;
                        }

                        const tooltipTitle = lunarInfo ? (
                            <Box style={{ padding: '8px', fontSize: '0.8rem', lineHeight: '1.4' }}>
                                <div style={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px', marginBottom: '6px', fontSize: '0.85rem' }}>
                                    {lunarInfo.solarStr}
                                </div>
                                <div><strong>Âm lịch:</strong> {lunarInfo.fullLunarStr}</div>
                                <div><strong>Can Chi:</strong> Ngày {lunarInfo.dayName}, tháng {lunarInfo.monthName}, năm {lunarInfo.yearName}</div>
                                <div><strong>Tiết khí:</strong> {lunarInfo.solarTerm || 'Không có'}</div>
                                <div style={{ marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px' }}>
                                    <strong>Giờ hoàng đạo:</strong>
                                    <div style={{ color: '#ffb74d', marginTop: '2px' }}>{lunarInfo.luckyHoursStr || 'Không có'}</div>
                                </div>
                            </Box>
                        ) : "";

                        return (
                            <Tooltip key={idx} title={tooltipTitle} arrow enterDelay={400} placement="top">
                                <Box 
                                    borderRight="1px solid #dadce0"
                                    borderBottom="1px solid #dadce0"
                                    padding="8px"
                                    backgroundColor={day.isCurrentMonth ? '#fff' : '#f8f9fa'}
                                    display="flex"
                                    flexDirection="column"
                                    style={{ minHeight: '130px', position: 'relative' }}
                                >
                                    {/* Ngày số & Ngày âm */}
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} width="100%">
                                        <Box display="flex" alignItems="center">
                                            {isDayToday ? (
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#1a73e8',
                                                    color: '#fff',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {day.dayNum}
                                                </span>
                                            ) : (
                                                <span style={{
                                                    fontSize: '0.85rem',
                                                    fontWeight: day.isCurrentMonth ? '600' : 'normal',
                                                    color: day.isCurrentMonth ? (day.date.getDay() === 0 ? '#d32f2f' : '#3c4043') : '#70757a',
                                                    padding: '4px'
                                                }}>
                                                    {dayLabel}
                                                </span>
                                            )}
                                        </Box>

                                        {showLunar && lunarInfo && (
                                            <span style={{
                                                fontSize: '0.72rem',
                                                color: (lunarInfo.lunarDay === 1 || lunarInfo.lunarDay === 15) ? '#e67e22' : '#7f8c8d',
                                                fontWeight: (lunarInfo.lunarDay === 1 || lunarInfo.lunarDay === 15) ? 'bold' : 'normal',
                                                backgroundColor: (lunarInfo.lunarDay === 1 || lunarInfo.lunarDay === 15) ? '#fff3e0' : 'transparent',
                                                padding: '1px 4px',
                                                borderRadius: '4px',
                                                border: (lunarInfo.lunarDay === 1 || lunarInfo.lunarDay === 15) ? '1px solid #ffe0b2' : 'none'
                                            }}>
                                                {lunarInfo.lunarDay === 1 
                                                    ? `${lunarInfo.lunarDay}/${lunarInfo.lunarMonth}${lunarInfo.isLeapMonth ? 'N' : ''}` 
                                                    : lunarInfo.lunarDay
                                                }
                                            </span>
                                        )}
                                    </Box>

                                    {/* Sự kiện trong ngày */}
                                    <Box 
                                        flexGrow={1} 
                                        display="flex" 
                                        flexDirection="column" 
                                        gap="5px"
                                        style={{ overflowY: 'auto', maxHeight: '110px' }}
                                    >
                                        {dayEvents.map((evt, eIdx) => (
                                            <div
                                                key={eIdx}
                                                onClick={() => handleRowClick(evt.contract)}
                                                style={{
                                                    backgroundColor: getEventBackground(evt.type),
                                                    color: getEventTextColor(evt.type),
                                                    borderLeft: `4px solid ${evt.color}`,
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                                className="calendar-event-badge"
                                                title={evt.label}
                                            >
                                                {evt.label}
                                            </div>
                                        ))}
                                    </Box>
                                </Box>
                            </Tooltip>
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

    const filteredHopDong = hopDong || [];

    const renderTrangThaiBadge = (giaiDoan) => {
        const states = {
            1: { label: "Tạo hợp đồng", color: "#7f8c8d" }, // Ghi
            2: { label: "Chụp hình", color: "#f39c12" },   // Vàng
            3: { label: "Hậu kỳ", color: "#3498db" },      // Xanh nước biển
            4: { label: "In ảnh", color: "#8d6e63" },      // Nâu
            5: { label: "Hoàn thành", color: "#2ecc71" }   // Xanh lá cây
        };
        const st = states[giaiDoan] || { label: "Không rõ", color: "#95a5a6" };
        return (
            <span style={{
                backgroundColor: st.color,
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '500',
                whiteSpace: 'nowrap'
            }}>
                {st.label}
            </span>
        );
    };

    return (
        <div className="hopdongkhachhang" style={{ padding: isMobile ? '10px' : '20px', height: isMobile ? 'calc(100vh - 145px)' : 'auto', display: isMobile ? 'flex' : 'block', flexDirection: 'column' }}>
            {/* Tab Container */}
            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '20px', 
                borderBottom: '2px solid #e0e0e0', 
                paddingBottom: '10px',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                WebkitOverflowScrolling: 'touch'
            }}>
                <button
                    onClick={() => {
                        setActiveTab('chupHinh');
                        setSendData({});
                    }}
                    style={{
                        padding: '10px 24px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        border: 'none',
                        background: activeTab === 'chupHinh' ? '#1976d2' : 'transparent',
                        color: activeTab === 'chupHinh' ? '#fff' : '#666',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: activeTab === 'chupHinh' ? '0 2px 5px rgba(0,0,0,0.2)' : 'none'
                    }}
                >
                    <i className="fa-solid fa-camera" style={{ marginRight: '8px' }}></i>
                    QUẢN LÝ LỊCH CHỤP HÌNH
                </button>
                <button
                    onClick={() => {
                        setActiveTab('hauKy');
                        setSendData({});
                    }}
                    style={{
                        padding: '10px 24px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        border: 'none',
                        background: activeTab === 'hauKy' ? '#1976d2' : 'transparent',
                        color: activeTab === 'hauKy' ? '#fff' : '#666',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: activeTab === 'hauKy' ? '0 2px 5px rgba(0,0,0,0.2)' : 'none'
                    }}
                >
                    <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: '8px' }}></i>
                    QUẢN LÝ LỊCH HẬU KỲ
                </button>
                <button
                    onClick={() => {
                        setActiveTab('inAnh');
                        setSendData({});
                    }}
                    style={{
                        padding: '10px 24px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        border: 'none',
                        background: activeTab === 'inAnh' ? '#1976d2' : 'transparent',
                        color: activeTab === 'inAnh' ? '#fff' : '#666',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: activeTab === 'inAnh' ? '0 2px 5px rgba(0,0,0,0.2)' : 'none'
                    }}
                >
                    <i className="fa-solid fa-print" style={{ marginRight: '8px' }}></i>
                    QUẢN LÝ LỊCH IN ẢNH
                </button>
                <button
                    onClick={() => {
                        setActiveTab('anHoiVaCuoi');
                        setSendData({});
                    }}
                    style={{
                        padding: '10px 24px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        border: 'none',
                        background: activeTab === 'anHoiVaCuoi' ? '#1976d2' : 'transparent',
                        color: activeTab === 'anHoiVaCuoi' ? '#fff' : '#666',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: activeTab === 'anHoiVaCuoi' ? '0 2px 5px rgba(0,0,0,0.2)' : 'none'
                    }}
                >
                    <i className="fa-solid fa-heart" style={{ marginRight: '8px' }}></i>
                    QUẢN LÝ LỊCH ĂN HỎI & CƯỚI
                </button>
            </div>
 
            <div className="content-header">
                <h2 style={{ marginBottom: isMobile ? '12px' : 0 }}>{activeTab === 'chupHinh' ? 'LỊCH LÀM VIỆC CHỤP HÌNH' : activeTab === 'hauKy' ? 'LỊCH LÀM VIỆC HẬU KỲ' : activeTab === 'inAnh' ? 'LỊCH LÀM VIỆC IN ẢNH' : 'LỊCH ĂN HỎI & CƯỚI'}</h2>
                <Stack 
                    spacing={2} 
                    direction={{ xs: 'column', md: 'row' }} 
                    alignItems={{ xs: 'stretch', md: 'center' }}
                    sx={{ width: '100%' }}
                >
                    <TextField
                        id="outlined-basic"
                        label="Tìm kiếm (Mã HĐ, SĐT, Tên)"
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        InputProps={{
                            sx: { height: isMobile ? 42 : commonHeight }
                        }}
                        sx={{ width: isMobile ? '100%' : 280, order: isMobile ? 1 : 2 }}
                    />
                    
                    <Stack direction="row" spacing={2} sx={{ width: isMobile ? '100%' : 'auto', order: isMobile ? 2 : 1 }}>
                        {viewMode === 'list' && (
                            <Autocomplete
                                disablePortal
                                options={locThoiGian}
                                value={selectedTime}
                                onChange={(event, newValue) => {
                                    setSelectedTime(newValue || locThoiGian[0]);
                                }}
                                getOptionLabel={(option) => option.label}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                size={isMobile ? "small" : "medium"}
                                sx={{ flex: 1, minWidth: isMobile ? 0 : 220 }}
                                renderInput={(params) => <TextField {...params} label="Lọc theo thời gian" sx={{ '& .MuiInputBase-root': { height: isMobile ? 42 : commonHeight } }} />}
                            />
                        )}
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            size={isMobile ? "small" : "medium"}
                            onChange={(event, nextView) => {
                                if (nextView !== null) {
                                    setViewMode(nextView);
                                }
                            }}
                            aria-label="view mode selector"
                            sx={{ height: isMobile ? 42 : commonHeight, backgroundColor: '#fff', flex: isMobile && viewMode !== 'list' ? 1 : 'unset' }}
                        >
                            <ToggleButton value="list" aria-label="list view" title="Dạng danh sách">
                                <i className="fa-solid fa-list" style={{ marginRight: '6px' }}></i>
                                {!isMobile && "Danh sách"}
                            </ToggleButton>
                            <ToggleButton value="calendar" aria-label="calendar view" title="Dạng lịch tháng">
                                <i className="fa-solid fa-calendar-days" style={{ marginRight: '6px' }}></i>
                                {!isMobile && "Lịch tháng"}
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setOpenLunarLookup(true)}
                        size={isMobile ? "small" : "medium"}
                        sx={{ height: isMobile ? 42 : commonHeight, textTransform: 'none', fontWeight: 'bold', order: 3 }}
                    >
                        <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }}></i>
                        Tra cứu Lịch Âm
                    </Button>
                </Stack>
            </div>

            {/* ===== NỘI DUNG LỊCH LÀM VIỆC ===== */}
            {viewMode === 'list' ? (
                isMobile ? (
                    (() => {
                        if (!filteredHopDong || filteredHopDong.length === 0) {
                            return (
                                <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                                    Không có dữ liệu lịch làm việc.
                                </div>
                            );
                        }
                
                        return (
                            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
                                <Stack spacing={2}>
                                {filteredHopDong.map((hd, index) => {
                                    const targetDate = activeTab === 'chupHinh' ? hd.cacNgay?.ngayChup : activeTab === 'hauKy' ? hd.cacNgay?.ngayChinhAnh : activeTab === 'inAnh' ? hd.cacNgay?.ngayTraAnh : (hd.cacNgay?.ngayCuoi || hd.cacNgay?.ngayAnHoi);
                                    const isOverdue = isPastToday(targetDate, hd.giaiDoan, activeTab);
                
                                    return (
                                        <Card 
                                            key={index} 
                                            onClick={() => handleRowClick(hd)}
                                            sx={{ 
                                                cursor: "pointer",
                                                borderLeft: isOverdue ? '4px solid #e53e3e' : '4px solid transparent',
                                                backgroundColor: isOverdue ? '#fff5f5' : '#fff',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <CardContent>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                                        Mã HĐ: {hd.maHopDong}
                                                    </Typography>
                                                    {renderTrangThaiBadge(hd.giaiDoan)}
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
                                                        <Typography variant="body2" fontWeight="500">
                                                            {hd.khachHang1?.soDienThoai}
                                                            {hd.khachHang2?.soDienThoai && ` / ${hd.khachHang2.soDienThoai}`}
                                                        </Typography>
                                                    </Grid>
                
                                                    <Grid item xs={4}><Typography variant="body2" color="textSecondary">Dịch vụ:</Typography></Grid>
                                                    <Grid item xs={8}>
                                                        <Typography variant="body2" fontWeight="500">{getDichVuChinhLabel(hd.dichVuChinh)}</Typography>
                                                    </Grid>
                
                                                    {activeTab === 'chupHinh' && (
                                                        <>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Ngày chụp:</Typography></Grid>
                                                            <Grid item xs={8}>
                                                                <Typography variant="body2" fontWeight="bold" color={isOverdue ? 'error' : 'textPrimary'}>
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
                
                                                    {activeTab === 'hauKy' && (
                                                        <>
                                                            <Grid item xs={4}><Typography variant="body2" color="textSecondary">Ngày hậu kỳ:</Typography></Grid>
                                                            <Grid item xs={8}>
                                                                <Typography variant="body2" fontWeight="bold" color={isOverdue ? 'error' : 'textPrimary'}>
                                                                    {formatDateOnly(hd.cacNgay?.ngayChinhAnh) || "Chưa cập nhật"}
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
                                                                <Typography variant="body2" fontWeight="bold" color={isOverdue ? 'error' : 'textPrimary'}>
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
                <TableContainer component={Paper} style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
                    <style>{`
                        .fixed-layout-table {
                            table-layout: fixed !important;
                            width: 100% !important;
                            min-width: 1090px !important;
                        }
                        .fixed-layout-table th, .fixed-layout-table td {
                            word-wrap: break-word !important;
                            word-break: break-word !important;
                            white-space: normal !important;
                        }
                    `}</style>
                    <Table stickyHeader aria-label="simple table" className="fixed-layout-table">
                    <TableHead sx={{ '& th': { backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold' } }}>
                            {activeTab === 'chupHinh' ? (
                                <TableRow>
                                    <TableCell align='center' style={{ width: 40 }}>STT</TableCell>
                                    <TableCell align='center' style={{ width: 140 }}>NGÀY CHỤP</TableCell>
                                    <TableCell align='center' style={{ width: 90 }}>MÃ SỐ HĐ</TableCell>
                                    <TableCell align='center' style={{ width: 160 }}>TÊN KHÁCH HÀNG</TableCell>
                                    <TableCell style={{ width: 110 }}>SĐT</TableCell>
                                    <TableCell align='center' style={{ width: 110 }}>DỊCH VỤ</TableCell>
                                    <TableCell align='center' style={{ width: 160 }}>ĐỊA ĐIỂM CHỤP</TableCell>
                                    <TableCell align='center' style={{ width: 150 }}>EKIP</TableCell>
                                    <TableCell align='center' style={{ width: 130 }}>CHỐT LỊCH</TableCell>
                                </TableRow>
                            ) : activeTab === 'hauKy' ? (
                                <TableRow>
                                    <TableCell align='center' style={{ width: 40 }}>STT</TableCell>
                                    <TableCell align='center' style={{ width: 140 }}>NGÀY HẬU KỲ</TableCell>
                                    <TableCell align='center' style={{ width: 140 }}>NGÀY TRẢ ẢNH</TableCell>
                                    <TableCell align='center' style={{ width: 90 }}>MÃ SỐ HĐ</TableCell>
                                    <TableCell align='center' style={{ width: 160 }}>TÊN KHÁCH HÀNG</TableCell>
                                    <TableCell style={{ width: 110 }}>SĐT</TableCell>
                                    <TableCell align='center' style={{ width: 140 }}>THỢ CHỈNH ẢNH</TableCell>
                                    <TableCell align='center' style={{ width: 110 }}>DỊCH VỤ</TableCell>
                                    <TableCell align='center' style={{ width: 120 }}>TIẾN TRÌNH</TableCell>
                                </TableRow>
                            ) : activeTab === 'inAnh' ? (
                                <TableRow>
                                    <TableCell align='center' style={{ width: 40 }}>STT</TableCell>
                                    <TableCell align='center' style={{ width: 140 }}>NGÀY CHUYỂN IN</TableCell>
                                    <TableCell align='center' style={{ width: 140 }}>NGÀY TRẢ ẢNH</TableCell>
                                    <TableCell align='center' style={{ width: 90 }}>MÃ SỐ HĐ</TableCell>
                                    <TableCell align='center' style={{ width: 160 }}>TÊN KHÁCH HÀNG</TableCell>
                                    <TableCell style={{ width: 110 }}>SĐT</TableCell>
                                    <TableCell align='center' style={{ width: 140 }}>THỢ CHỈNH ẢNH</TableCell>
                                    <TableCell align='center' style={{ width: 110 }}>DỊCH VỤ</TableCell>
                                    <TableCell align='center' style={{ width: 120 }}>TIẾN TRÌNH</TableCell>
                                </TableRow>
                            ) : (
                                <TableRow>
                                    <TableCell align='center' style={{ width: 40 }}>STT</TableCell>
                                    <TableCell align='center' style={{ width: 170 }}>NGÀY ĂN HỎI</TableCell>
                                    <TableCell align='center' style={{ width: 170 }}>NGÀY CƯỚI</TableCell>
                                    <TableCell align='center' style={{ width: 90 }}>MÃ SỐ HĐ</TableCell>
                                    <TableCell align='center' style={{ width: 160 }}>TÊN KHÁCH HÀNG</TableCell>
                                    <TableCell style={{ width: 110 }}>SĐT</TableCell>
                                    <TableCell align='center' style={{ width: 110 }}>DỊCH VỤ</TableCell>
                                    <TableCell align='center' style={{ width: 120 }}>TIẾN TRÌNH</TableCell>
                                </TableRow>
                            )}
                        </TableHead>
     
                        <TableBody>
                            {filteredHopDong && filteredHopDong.length > 0 ? (
                                filteredHopDong.map((hd, index) => {
                                    const targetDate = activeTab === 'chupHinh' ? hd.cacNgay?.ngayChup : activeTab === 'hauKy' ? hd.cacNgay?.ngayChinhAnh : activeTab === 'inAnh' ? hd.cacNgay?.ngayTraAnh : (hd.cacNgay?.ngayCuoi || hd.cacNgay?.ngayAnHoi);
                                    const isOverdue = isPastToday(targetDate, hd.giaiDoan, activeTab);
     
                                    return (
                                        <TableRow key={index}
                                            style={{ 
                                                cursor: "pointer",
                                                backgroundColor: isOverdue ? '#fff5f5' : 'inherit',
                                                transition: 'background-color 0.3s'
                                            }}
                                            onClick={() => handleRowClick(hd)}
                                        >
                                            {/* 1. STT */}
                                            <TableCell align='center'>{index + 1}</TableCell>

                                            {/* 2. Ngày tháng (chuyển lên trước mã số hợp đồng) */}
                                            {activeTab === 'chupHinh' && (
                                                <TableCell align='center' style={{ 
                                                    color: isOverdue ? '#e53e3e' : 'inherit', 
                                                    fontWeight: isOverdue ? 'bold' : 'normal' 
                                                }}>
                                                    {hd.cacNgay?.ngayChup ? (
                                                        <>
                                                            <div>{formatDateTime(hd.cacNgay.ngayChup)}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginTop: '3px' }}>
                                                                (Âm: {formatLunarDateShort(hd.cacNgay.ngayChup)})
                                                            </div>
                                                        </>
                                                    ) : "Chưa cập nhật"}
                                                    {isOverdue && (
                                                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#e53e3e', fontWeight: 'bold', marginTop: '2px' }}>
                                                            (Trễ lịch)
                                                        </span>
                                                    )}
                                                </TableCell>
                                            )}
                                            {activeTab === 'hauKy' && (
                                                <>
                                                    <TableCell align='center' style={{ 
                                                        color: isOverdue ? '#e53e3e' : 'inherit', 
                                                        fontWeight: isOverdue ? 'bold' : 'normal' 
                                                    }}>
                                                        {formatDateOnly(hd.cacNgay?.ngayChinhAnh) || "Chưa cập nhật"}
                                                        {isOverdue && (
                                                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#e53e3e', fontWeight: 'bold', marginTop: '2px' }}>
                                                                (Trễ lịch)
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align='center'>{formatDateOnly(hd.cacNgay?.ngayTraAnh) || "Chưa cập nhật"}</TableCell>
                                                </>
                                            )}
                                            {activeTab === 'inAnh' && (
                                                <>
                                                    <TableCell align='center'>
                                                        {formatDateTime(hd.cacNgay?.ngayChuyenInAnh) || "Chưa cập nhật"}
                                                    </TableCell>
                                                    <TableCell align='center' style={{ 
                                                        color: isOverdue ? '#e53e3e' : 'inherit', 
                                                        fontWeight: isOverdue ? 'bold' : 'normal' 
                                                    }}>
                                                        {formatDateOnly(hd.cacNgay?.ngayTraAnh) || "Chưa cập nhật"}
                                                        {isOverdue && (
                                                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#e53e3e', fontWeight: 'bold', marginTop: '2px' }}>
                                                                (Trễ lịch)
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </>
                                            )}
                                            {activeTab === 'anHoiVaCuoi' && (
                                                <>
                                                    <TableCell align='center' style={{ 
                                                        color: isPastToday(hd.cacNgay?.ngayAnHoi, hd.giaiDoan, activeTab) ? '#e53e3e' : 'inherit', 
                                                        fontWeight: isPastToday(hd.cacNgay?.ngayAnHoi, hd.giaiDoan, activeTab) ? 'bold' : 'normal' 
                                                    }}>
                                                        {hd.cacNgay?.ngayAnHoi ? (
                                                            <>
                                                                <div>{formatDateTime(hd.cacNgay.ngayAnHoi)}</div>
                                                                <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginTop: '3px' }}>
                                                                    (Âm: {formatLunarDateShort(hd.cacNgay.ngayAnHoi)})
                                                                </div>
                                                            </>
                                                        ) : "-"}
                                                    </TableCell>
                                                    <TableCell align='center' style={{ 
                                                        color: isPastToday(hd.cacNgay?.ngayCuoi, hd.giaiDoan, activeTab) ? '#e53e3e' : 'inherit', 
                                                        fontWeight: isPastToday(hd.cacNgay?.ngayCuoi, hd.giaiDoan, activeTab) ? 'bold' : 'normal' 
                                                    }}>
                                                        {hd.cacNgay?.ngayCuoi ? (
                                                            <>
                                                                <div>{formatDateTime(hd.cacNgay.ngayCuoi)}</div>
                                                                <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginTop: '3px' }}>
                                                                    (Âm: {formatLunarDateShort(hd.cacNgay.ngayCuoi)})
                                                                </div>
                                                            </>
                                                        ) : "-"}
                                                    </TableCell>
                                                </>
                                            )}

                                            {/* 3. Mã số HĐ */}
                                            <TableCell align='center'>{hd.maHopDong}</TableCell>

                                            {/* 4. Tên khách hàng */}
                                            <TableCell align='left'>
                                                {hd.khachHang1?.tenKhachHang}
                                                {hd.khachHang2?.tenKhachHang && (
                                                    <>
                                                        <br />
                                                        <hr style={{ opacity: "40%", margin: "4px 0" }} />
                                                        {hd.khachHang2.tenKhachHang}
                                                    </>
                                                )}
                                            </TableCell>

                                            {/* 5. Số điện thoại */}
                                            <TableCell align='left'>
                                                {hd.khachHang1?.soDienThoai}
                                                {hd.khachHang2?.soDienThoai && (
                                                    <>
                                                        <br />
                                                        <hr style={{ opacity: "40%", margin: "4px 0" }} />
                                                        {hd.khachHang2.soDienThoai}
                                                    </>
                                                )}
                                            </TableCell>

                                            {/* 6. Các cột thông tin còn lại sau SĐT */}
                                            {activeTab === 'chupHinh' && (
                                                <>
                                                    <TableCell align='center'>{getDichVuChinhLabel(hd.dichVuChinh)}</TableCell>
                                                    <TableCell align='center'>{hd.cacNgay?.diaDiemChup || "Chưa cập nhật"}</TableCell>
                                                    <TableCell align='center'>
                                                        {(() => {
                                                            const parts = [];
                                                            if (hd.nguoiPhucVu?.thoChupHinh) parts.push(`Chụp: ${hd.nguoiPhucVu.thoChupHinh}`);
                                                            if (hd.nguoiPhucVu?.thoMakeUp) parts.push(`Make: ${hd.nguoiPhucVu.thoMakeUp}`);
                                                            return parts.join(" + ") || "Chưa giao ekip";
                                                        })()}
                                                    </TableCell>
                                                    <TableCell align='center'>
                                                        {(() => {
                                                            const status = hd.cacNgay?.chotLich || "Chưa gọi điện";
                                                            let color = "#e67e22"; // default orange
                                                            if (status === "Đã gọi điện xác nhận" || status === "Đã chốt lịch") {
                                                                color = "#2ecc71"; // green
                                                            }
                                                            return (
                                                                <span style={{
                                                                    backgroundColor: color,
                                                                    color: '#fff',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '12px',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: '500',
                                                                    whiteSpace: 'nowrap'
                                                                }}>
                                                                    {status}
                                                                </span>
                                                            );
                                                        })()}
                                                    </TableCell>
                                                </>
                                            )}

                                            {activeTab === 'hauKy' && (
                                                <>
                                                    <TableCell align='center'>{hd.nguoiPhucVu?.thoChinhAnh || "Chưa giao"}</TableCell>
                                                    <TableCell align='center'>{getDichVuChinhLabel(hd.dichVuChinh)}</TableCell>
                                                    <TableCell align='center'>{renderTrangThaiBadge(hd.giaiDoan)}</TableCell>
                                                </>
                                            )}
                                            {activeTab === 'inAnh' && (
                                                <>
                                                    <TableCell align='center'>{hd.nguoiPhucVu?.thoChinhAnh || "Chưa giao"}</TableCell>
                                                    <TableCell align='center'>{getDichVuChinhLabel(hd.dichVuChinh)}</TableCell>
                                                    <TableCell align='center'>{renderTrangThaiBadge(hd.giaiDoan)}</TableCell>
                                                </>
                                            )}

                                            {activeTab === 'anHoiVaCuoi' && (
                                                <>
                                                    <TableCell align='center'>{getDichVuChinhLabel(hd.dichVuChinh)}</TableCell>
                                                    <TableCell align='center'>{renderTrangThaiBadge(hd.giaiDoan)}</TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={activeTab === 'chupHinh' ? 9 : activeTab === 'hauKy' ? 9 : activeTab === 'inAnh' ? 8 : 8} align="center" style={{ color: "#999", padding: "20px 0" }}>
                                        Không có dữ liệu lịch làm việc.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
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
            <Dialog open={openChupHinhDialog} onClose={() => setOpenChupHinhDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle style={{ fontWeight: 'bold', color: '#1976d2' }}>
                    XÁC NHẬN LỊCH CHỤP HÌNH - HĐ: {selectedChupHinhContract?.maHopDong}
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="confirm-chot-lich-label">Gọi điện xác nhận / Chốt lịch</InputLabel>
                            <Select
                                labelId="confirm-chot-lich-label"
                                value={confirmChotLich}
                                onChange={(e) => setConfirmChotLich(e.target.value)}
                                label="Gọi điện xác nhận / Chốt lịch"
                            >
                                <MenuItem value="Chưa gọi điện">Chưa gọi điện</MenuItem>
                                <MenuItem value="Đã gọi điện xác nhận">Đã gọi điện xác nhận</MenuItem>
                                <MenuItem value="Đã chốt lịch">Đã chốt lịch</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="confirm-tho-chup-label">Thợ chụp hình</InputLabel>
                            <Select
                                labelId="confirm-tho-chup-label"
                                value={confirmThoChupHinh}
                                onChange={(e) => setConfirmThoChupHinh(e.target.value)}
                                label="Thợ chụp hình"
                            >
                                <MenuItem value="">Chưa phân công</MenuItem>
                                {(() => {
                                    const staff = listStaff.filter(s => s.positon === 'Thợ chụp hình');
                                    const names = staff.map(s => s.fullname || s.username);
                                    if (confirmThoChupHinh && !names.includes(confirmThoChupHinh)) {
                                        names.push(confirmThoChupHinh);
                                    }
                                    return names.map((name, i) => (
                                        <MenuItem key={i} value={name}>{name}</MenuItem>
                                    ));
                                })()}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="confirm-tho-makeup-label">Thợ makeup</InputLabel>
                            <Select
                                labelId="confirm-tho-makeup-label"
                                value={confirmThoMakeUp}
                                onChange={(e) => setConfirmThoMakeUp(e.target.value)}
                                label="Thợ makeup"
                            >
                                <MenuItem value="">Chưa phân công</MenuItem>
                                {(() => {
                                    const staff = listStaff.filter(s => s.positon === 'Thợ trang điểm');
                                    const names = staff.map(s => s.fullname || s.username);
                                    if (confirmThoMakeUp && !names.includes(confirmThoMakeUp)) {
                                        names.push(confirmThoMakeUp);
                                    }
                                    return names.map((name, i) => (
                                        <MenuItem key={i} value={name}>{name}</MenuItem>
                                    ));
                                })()}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Địa điểm chụp"
                            variant="outlined"
                            fullWidth
                            value={confirmDiaDiem}
                            onChange={(e) => setConfirmDiaDiem(e.target.value)}
                        />

                        <TextField
                            label="Đường dẫn ảnh gốc (Link ảnh)"
                            variant="outlined"
                            fullWidth
                            value={confirmLinkAnh}
                            onChange={(e) => setConfirmLinkAnh(e.target.value)}
                            placeholder="https://drive.google.com/..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button onClick={() => setOpenChupHinhDialog(false)} color="inherit">
                        Hủy
                    </Button>
                    <Button onClick={() => handleUpdateChupHinh(false)} variant="outlined" color="primary">
                        Cập nhật
                    </Button>
                    <Button onClick={() => handleUpdateChupHinh(true)} variant="contained" color="success">
                        Chuyển sang hậu kỳ
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Cập nhật lịch hậu kỳ cho Tab Hậu Kỳ */}
            <Dialog open={openHauKyDialog} onClose={() => setOpenHauKyDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle style={{ fontWeight: 'bold', color: '#1976d2' }}>
                    XÁC NHẬN LỊCH HẬU KỲ - HĐ: {selectedHauKyContract?.maHopDong}
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="confirm-tho-chinh-anh-label">Thợ chỉnh ảnh</InputLabel>
                            <Select
                                labelId="confirm-tho-chinh-anh-label"
                                value={confirmThoChinhAnh}
                                onChange={(e) => setConfirmThoChinhAnh(e.target.value)}
                                label="Thợ chỉnh ảnh"
                            >
                                <MenuItem value="">Chưa phân công</MenuItem>
                                {(() => {
                                    const staff = listStaff.filter(s => s.positon === 'Thợ chỉnh ảnh');
                                    const names = staff.map(s => s.fullname || s.username);
                                    if (confirmThoChinhAnh && !names.includes(confirmThoChinhAnh)) {
                                        names.push(confirmThoChinhAnh);
                                    }
                                    return names.map((name, i) => (
                                        <MenuItem key={i} value={name}>{name}</MenuItem>
                                    ));
                                })()}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Ngày bắt đầu hậu kỳ"
                            type="date"
                            variant="outlined"
                            fullWidth
                            value={confirmNgayChinhAnh}
                            onChange={(e) => setConfirmNgayChinhAnh(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            label="Ngày trả ảnh"
                            type="date"
                            variant="outlined"
                            fullWidth
                            value={confirmNgayTraAnh}
                            onChange={(e) => setConfirmNgayTraAnh(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            label="Đường dẫn ảnh chỉnh sửa (Link ảnh)"
                            variant="outlined"
                            fullWidth
                            value={confirmLinkAnhChinhSua}
                            onChange={(e) => setConfirmLinkAnhChinhSua(e.target.value)}
                            placeholder="https://drive.google.com/..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px', justifyContent: 'space-between' }}>
                    <Button onClick={() => {
                        setOpenHauKyDialog(false);
                        setSendData(selectedHauKyContract);
                        setOpenDetailDialog(true);
                    }} variant="outlined" color="info">
                        Xem chi tiết HĐ
                    </Button>
                    <Box display="flex" gap={1}>
                        <Button onClick={() => setOpenHauKyDialog(false)} color="inherit">
                            Hủy
                        </Button>
                        <Button onClick={() => handleUpdateHauKy(null)} variant="outlined" color="primary">
                            Cập nhật
                        </Button>
                        <Button onClick={() => {
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
                        }} variant="contained" color="warning">
                            Chuyển sang in ảnh
                        </Button>
                        <Button onClick={() => handleUpdateHauKy(5)} variant="contained" color="success">
                            Hoàn thành
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Dialog nhập kích thước & số lượng khi chuyển sang in ảnh */}
            <Dialog open={openInAnhInputDialog} onClose={() => setOpenInAnhInputDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle style={{ fontWeight: 'bold', color: '#1976d2' }}>
                    NHẬP THÔNG TIN ẢNH IN - HĐ: {selectedHauKyContract?.maHopDong}
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <p style={{ fontSize: '0.9rem', color: '#555', margin: 0 }}>
                            Chọn dịch vụ ảnh từ danh sách hoặc nhập kích thước tự do:
                        </p>
                        <Box display="flex" flexDirection="column" gap={1.5}>
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
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
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

                        <Box style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '8px' }}>
                            {tempDanhSachAnhIn.length === 0 ? (
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
                                        {tempDanhSachAnhIn.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                                <td style={{ padding: '6px' }}>{idx + 1}</td>
                                                <td style={{ padding: '6px' }}>{item.kichThuoc}</td>
                                                <td style={{ padding: '6px' }}>{item.soLuong}</td>
                                                <td style={{ padding: '6px', textAlign: 'center' }}>
                                                    <Button
                                                        size="small"
                                                        color="error"
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
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button onClick={() => setOpenInAnhInputDialog(false)} color="inherit">
                        Quay lại
                    </Button>
                    <Button
                        onClick={() => {
                            if (tempDanhSachAnhIn.length === 0) {
                                toast.warning("Vui lòng thêm ít nhất một ảnh in!");
                                return;
                            }
                            // Trigger actual stage transition
                            handleUpdateHauKy(4);
                            setOpenInAnhInputDialog(false);
                        }}
                        variant="contained"
                        color="success"
                    >
                        Xác nhận chuyển in ảnh
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
