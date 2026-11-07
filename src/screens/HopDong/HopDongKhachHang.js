import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { useContractTypes } from '../../hooks/useContractTypes';
import { useAuth } from '../Login/AuthContext/AuthContext';
import ThemHopDongKHDialog from './ThemHopDongKHDialog';
import DetailHopDongKhachHangDialog from './DetailHopDongKhachHangDialog';
import { formatDate } from '../utils/convertDate';
import { formatLunarDateShort } from '../../utils/lunarDateUtils';
import { getContractStatusInfo, isUnscheduledShooting, QUICK_STATUS_OPTIONS, CONTRACT_ROW_COLOR_LEGEND, getNearestShootOrRecordSchedule, checkContractCompletionEligibility } from '../../utils/contractStatusHelper';
import HopDongKanbanBoard from './HopDongKanbanBoard';
import './hopdongkhachhang.css';

// Material UI components
import {
    Stack,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Card,
    Typography,
    Fab,
    Box,
    Chip,
    Grid,
    IconButton,
    ToggleButton,
    ToggleButtonGroup,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
    InputAdornment,
    useMediaQuery,
    OutlinedInput,
    Checkbox,
    ListItemText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Icons
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

const formatShortMoney = (val) => {
    const num = Number(val) || 0;
    if (Math.abs(num) >= 1000000000) {
        return (num / 1000000000).toFixed(2) + ' Tỷ';
    }
    if (Math.abs(num) >= 1000000) {
        return (num / 1000000).toFixed(1) + ' Tr';
    }
    if (Math.abs(num) >= 1000) {
        return (num / 1000).toFixed(0) + ' k';
    }
    return num.toLocaleString('vi-VN');
};

function HopDongKhachHang() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { getDichVuChinhLabel } = useContractTypes();
    const { user } = useAuth();
    const [hopDong, setHopDong] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const { showLoading, hideLoading } = useLoading();

    // Kiểm tra quyền Quản trị viên / Quản lý
    const isAdmin = user?.permission === 1 || 
                    user?.positon === "Quản lý" || 
                    user?.positon === "Admin" || 
                    user?.positon === "Quản trị viên" || 
                    user?.chucVu === "Quản lý" || 
                    user?.role === "ADMIN" || 
                    user?.username === "along";

    // Phân quyền Kỹ thuật viên (Thợ chụp / Makeup / Hậu kỳ)
    const isTechnician = useMemo(() => {
        if (!user) return false;
        const role = (user.chucVu || user.vaiTro || user.role || user.positon || '').toLowerCase();
        const isManager = role.includes('quản lý') || role.includes('admin') || role.includes('kế toán') || role.includes('sale') || role.includes('bán hàng') || user.permission === 1 || user.is_admin === true || user.username === 'along';
        return !isManager;
    }, [user]);

    // Hàm kiểm tra hợp đồng do tài khoản tạo hoặc được phân công làm việc
    const isContractOwnedOrAssigned = useCallback((hd, currentUser) => {
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
        return checkMatch(hd?.createBy) ||
               checkMatch(hd?.nguoiTao) ||
               checkMatch(hd?.userTao) ||
               checkMatch(npv.thoChupHinh) ||
               checkMatch(npv.thoMakeUp) ||
               checkMatch(npv.thoChinhAnh) ||
               checkMatch(npv.banHang) ||
               checkMatch(npv.phucVu) ||
               checkMatch(hd?.soanDo?.nguoiKiem);
    }, []);

    // Filters
    const [timeFilter, setTimeFilter] = useState('all'); // 'all' | 'hôm nay' | '1 tuần' | '1 tháng' | '4 tháng'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'no_schedule' | 1 | 2 | 3 | 4 | 5
    const [excludeStatus, setExcludeStatus] = useState([]); // Array: các id trạng thái bị loại trừ khỏi danh sách hiển thị
    const [searchInput, setSearchInput] = useState("");
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid' | 'kanban'

    // Dialog state
    const [openDialogHD, setOpenDialogHD] = useState(false);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [selectedValueDialog, setSelectedValueDialog] = useState({ data: "hello" });
    const [sendData, setSendData] = useState({});

    const handleKanbanAdvanceStage = async (contract, targetStage) => {
        const stageNames = {
            1: "Chụp hình",
            2: "Hậu kỳ",
            3: "In ảnh",
            4: "Hoàn thành"
        };
        const targetSub = targetStage === 2 ? 'cho_chinh' : (targetStage === 4 ? 'hoan_thanh' : 'dang_thuc_hien');

        // Bổ sung kiểm tra điều kiện hoàn thành hợp đồng
        if (targetStage === 4) {
            const check = checkContractCompletionEligibility(contract);
            if (!check.eligible) {
                toast.error(check.message);
                return;
            }
        }

        if (!window.confirm(`Bạn có chắc chắn muốn chuyển hợp đồng #${contract.maHopDong} sang bước: "${stageNames[targetStage]}" không?`)) {
            return;
        }

        try {
            showLoading("Đang chuyển giai đoạn...");
            await otherService.UPDATE_PROGRESS({
                maHopDong: contract.maHopDong,
                giaiDoan: targetStage,
                subGiaiDoan: targetSub,
                data: {
                    ghiChu: `Chuyển sang ${stageNames[targetStage]} từ bảng Kanban`
                }
            });
            toast.success(`Đã chuyển hợp đồng #${contract.maHopDong} sang ${stageNames[targetStage]}!`);
            loadHopDong(timeFilter, searchInput);
        } catch (err) {
            toast.error("Lỗi khi cập nhật tiến trình: " + (err.response?.data?.message || err.message));
        } finally {
            hideLoading();
        }
    };

    const handleClickOpenDialog = () => {
        setOpenDialogHD(true);
    };

    const loadHopDong = useCallback((timeVal, searchVal, pageNum = 1, isLoadMore = false) => {
        if (isLoadMore) {
            setIsLoadingMore(true);
        } else {
            showLoading("Đang tải hợp đồng ...");
        }
        const params = {
            page: pageNum,
            limit: 20
        };
        if (timeVal && timeVal !== 'all') {
            params.filter = timeVal;
        }
        if (searchVal) {
            params.keyword = searchVal;
        }

        otherService.LIST_HOPDONG(params)
            .then((response) => {
                const newContracts = response.data.hopDong || [];
                const total = response.data.count !== undefined ? response.data.count : newContracts.length;
                const more = response.data.hasMore !== undefined ? response.data.hasMore : (pageNum * 20 < total);

                if (isLoadMore) {
                    setHopDong(prev => {
                        const existingIds = new Set(prev.map(x => x._id || x.maHopDong));
                        const filteredNew = newContracts.filter(x => !existingIds.has(x._id || x.maHopDong));
                        return [...prev, ...filteredNew];
                    });
                } else {
                    setHopDong(newContracts);
                }

                setHasMore(more);
                setPage(pageNum);
                setTotalRecords(total);

                if (isLoadMore) {
                    setIsLoadingMore(false);
                } else {
                    hideLoading();
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                toast.error("Đã có lỗi xảy ra: " + error.message);
                if (isLoadMore) {
                    setIsLoadingMore(false);
                } else {
                    hideLoading();
                }
            });
    }, [showLoading, hideLoading]);

    const handleScroll = useCallback((e) => {
        const target = e.currentTarget;
        if (!target) return;
        const { scrollTop, scrollHeight, clientHeight } = target;
        if (scrollTop + clientHeight >= scrollHeight - 80) {
            if (hasMore && !isLoadingMore) {
                loadHopDong(timeFilter, searchInput, page + 1, true);
            }
        }
    }, [hasMore, isLoadingMore, loadHopDong, timeFilter, searchInput, page]);

    const handleCloseDialog = (value) => {
        setOpenDialogHD(false);
        setSelectedValueDialog(value);
        setPage(1);
        loadHopDong(timeFilter, searchInput, 1, false);
    };

    const handleClickOpenDetailDialog = () => {
        setOpenDetailDialog(true);
    };

    const handleCloseDetailDialog = (updated) => {
        setOpenDetailDialog(false);
        if (updated === true) {
            setPage(1);
            loadHopDong(timeFilter, searchInput, 1, false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setPage(1);
            loadHopDong(timeFilter, searchInput, 1, false);
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [timeFilter, searchInput, loadHopDong]);

    useEffect(() => {
        if (sendData && sendData._id) {
            const updatedHD = hopDong.find(hd => hd._id === sendData._id);
            if (updatedHD) {
                setSendData(updatedHD);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hopDong, sendData?._id]);

    // Filtered hopDong by permission and status filter
    const filteredHopDong = useMemo(() => {
        const rawList = hopDong || [];
        const baseList = isAdmin ? rawList : rawList.filter(hd => isContractOwnedOrAssigned(hd, user));

        return baseList.filter(hd => {
            const statusInfo = getContractStatusInfo(hd);
            const isUnscheduled = isUnscheduledShooting(hd);
            const normalizedSub = (() => {
                const s = statusInfo.subStage;
                if (statusInfo.stage === 2) {
                    if (['cho_chinh', 'da_giao_file_goc', 'khach_da_chon_anh'].includes(s)) return 'cho_chinh';
                    if (['dang_chinh', 'dang_hau_ky', 'dang_chinh_anh', 'dang_thuc_hien'].includes(s)) return 'dang_chinh';
                    if (['cho_khach_duyet', 'khach_duyet_anh', 'cho_khach_duyet_layout', 'khach_da_duyet_layout'].includes(s)) return 'cho_khach_duyet';
                }
                return s;
            })();
            const statusKey = isUnscheduled ? 'no_schedule' : `${statusInfo.stage}_${ statusInfo.subStage }`;
            const normalizedStatusKey = isUnscheduled ? 'no_schedule' : `${statusInfo.stage}_${normalizedSub}`;
            const stageNumStr = String(statusInfo.stage);

            const matchFilterKey = (filterVal) => {
                const fStr = String(filterVal);
                if (fStr === 'no_schedule') return isUnscheduled;
                if (fStr === 'bao_luu') return hd.subGiaiDoan === 'bao_luu';
                if (fStr === 'huy') return hd.subGiaiDoan === 'huy';
                if (hd.subGiaiDoan === 'bao_luu' || hd.subGiaiDoan === 'huy' || isUnscheduled) return false;
                if (fStr.includes('_')) {
                    return statusKey === fStr || normalizedStatusKey === fStr;
                }
                return stageNumStr === fStr;
            };

            // 1. Lọc theo trạng thái hợp đồng (tiến độ cụ thể)
            if (statusFilter !== 'all') {
                if (!matchFilterKey(statusFilter)) return false;
            }

            // 2. Lọc loại bỏ các trạng thái không mong muốn (ví dụ: loại bỏ Hoàn thành)
            if (excludeStatus.length > 0) {
                if (excludeStatus.some(ex => matchFilterKey(ex))) {
                    return false;
                }
            }

            return true;
        });
    }, [hopDong, isAdmin, user, isContractOwnedOrAssigned, statusFilter, excludeStatus]);

    // Statistics Calculations
    const totalCount = filteredHopDong.length;
    const totalContractValue = useMemo(() => {
        return filteredHopDong.reduce((sum, hd) => sum + (Number(hd.thanhToan?.tongGiaTriSauGiam || hd.thanhToan?.tongGiaTri) || 0), 0);
    }, [filteredHopDong]);

    const totalPaidValue = useMemo(() => {
        return filteredHopDong.reduce((sum, hd) => sum + (Number(hd.thanhToan?.khachHangDaThanhToan) || 0), 0);
    }, [filteredHopDong]);

    const totalRemainingDebt = useMemo(() => {
        return filteredHopDong.reduce((sum, hd) => sum + (Number(hd.thanhToan?.conLai) || 0), 0);
    }, [filteredHopDong]);

    const totalUnscheduledCount = useMemo(() => {
        return filteredHopDong.filter(hd => isUnscheduledShooting(hd)).length;
    }, [filteredHopDong]);

    const convertTrangThai = (hd) => {
        return getContractStatusInfo(hd).label;
    };

    const getTrangThaiColor = (hd) => {
        return getContractStatusInfo(hd).color;
    };

    const getRowBackgroundColor = (hd) => {
        const info = getContractStatusInfo(hd);
        return info.rowBgColor || '#ffffff';
    };

    const renderStatusBadge = (hd) => {
        const info = getContractStatusInfo(hd);
        if (info.isUnscheduled) {
            return (
                <Chip 
                    icon={<i className="fa-solid fa-triangle-exclamation" style={{ color: '#78350f', fontSize: '0.72rem', marginLeft: '6px' }}></i>}
                    label="Chưa xếp lịch" 
                    size="small" 
                    sx={{ 
                        bgcolor: '#fde047', 
                        color: '#78350f',
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        height: '24px',
                        border: '1px solid #eab308',
                        boxShadow: '0 2px 4px rgba(234, 179, 8, 0.25)',
                        '& .MuiChip-icon': { color: '#78350f' }
                    }} 
                />
            );
        }

        if (info.isComplete) {
            return (
                <Chip 
                    icon={<i className="fa-solid fa-circle-check" style={{ color: '#fff', fontSize: '0.75rem', marginLeft: '6px' }}></i>}
                    label="Đã hoàn tất" 
                    size="small" 
                    sx={{ 
                        bgcolor: '#059669', 
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        height: '24px',
                        boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)',
                        '& .MuiChip-icon': { color: '#fff' }
                    }} 
                />
            );
        }

        const isDone = info.subStage === 'hoan_thanh';
        const subColor = info.subStageConfig?.color || (isDone ? '#0284c7' : info.color);
        const showSubStagePill = info.stage === 2 && !['bao_luu', 'huy'].includes(info.subStage);

        if (info.subStage === 'bao_luu' || info.subStage === 'huy') {
            return (
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.6,
                        px: 1.1,
                        py: 0.35,
                        borderRadius: '14px',
                        bgcolor: info.bgColor,
                        border: `1.5px solid ${info.borderColor}`,
                        whiteSpace: 'nowrap'
                    }}
                >
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: info.color }}>
                        {info.badgeText}
                    </span>
                </Box>
            );
        }

        // Giai đoạn 1 (Chụp hình): Màu trắng
        if (info.stage === 1) {
            return (
                <Box 
                    sx={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.6,
                        px: 1.0,
                        py: 0.35,
                        borderRadius: '14px',
                        bgcolor: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        whiteSpace: 'nowrap'
                    }} 
                >
                    <span style={{ fontSize: '0.82rem' }}>📸</span>
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155' }}>
                        Chụp hình
                    </span>
                </Box>
            );
        }

        return (
            <Box 
                sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.6,
                    px: 0.9,
                    py: 0.35,
                    borderRadius: '14px',
                    bgcolor: info.bgColor,
                    border: `1.5px solid ${info.borderColor || info.stageConfig.borderColor}`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    whiteSpace: 'nowrap'
                }} 
            >
                <span style={{ fontSize: '0.82rem' }}>{info.stageConfig.icon}</span>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: info.stageConfig.color }}>
                    {info.stageConfig.shortName}
                </span>
                {showSubStagePill && (
                    <span style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '8px',
                        backgroundColor: subColor,
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        lineHeight: '1.4'
                    }}>
                        {info.subStageConfig?.icon && <span style={{ fontSize: '0.62rem' }}>{info.subStageConfig.icon}</span>}
                        {info.subStageConfig?.shortName || (isDone ? 'Hoàn thành' : 'Chờ chỉnh')}
                    </span>
                )}
            </Box>
        );
    };

    // Render thông tin ngày chụp/quay: hiển thị lịch gần nhất khi trong hợp đồng có nhiều ngày chụp hoặc quay
    const renderShootingDateCell = (hd, isCompact = false) => {
        const scheduleInfo = getNearestShootOrRecordSchedule(hd);
        const isCompleted = Number(hd.giaiDoan) > 1 || (Number(hd.giaiDoan) === 1 && hd.subGiaiDoan === 'hoan_thanh') || Number(hd.giaiDoan) === 5;

        if (scheduleInfo && scheduleInfo.nearest) {
            const { nearest, totalCount, hasMultiple, allSchedules } = scheduleInfo;
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isCompact ? 'flex-end' : 'center', gap: '2px' }}>
                    <div style={{ fontWeight: 700, color: '#0369a1', fontSize: isCompact ? '0.85rem' : '0.82rem' }}>
                        {formatDate(nearest.date)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        (Âm: {formatLunarDateShort(nearest.date)})
                    </div>
                    {getShootingCountdownTag(nearest.date, isCompleted)}
                    {hasMultiple && (
                        <Tooltip 
                            title={
                                <div style={{ padding: '3px 5px', maxWidth: 280 }}>
                                    <div style={{ fontWeight: 700, marginBottom: 4, color: '#f8fafc', fontSize: '0.78rem' }}>
                                        📸 Tổng {totalCount} ca chụp & quay:
                                    </div>
                                    {allSchedules.map((s, sIdx) => {
                                        const isNearest = s === nearest;
                                        return (
                                            <div key={sIdx} style={{ fontSize: '0.72rem', padding: '2px 0', color: isNearest ? '#fde047' : '#e2e8f0', fontWeight: isNearest ? 700 : 400 }}>
                                                {isNearest ? '👉 ' : '• '}{s.label}: {formatDate(s.date)} ({s.diffDays >= 0 ? `Còn ${s.diffDays} ngày` : `Đã qua ${Math.abs(s.diffDays)} ngày`})
                                            </div>
                                        );
                                    })}
                                </div>
                            }
                            arrow
                        >
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.64rem',
                                fontWeight: 700,
                                color: '#0284c7',
                                background: '#e0f2fe',
                                border: '1px solid #bae6fd',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                marginTop: '2px',
                                cursor: 'pointer'
                            }}>
                                📸 Lịch gần nhất ({totalCount} ca)
                            </span>
                        </Tooltip>
                    )}
                </div>
            );
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isCompact ? 'flex-end' : 'center' }}>
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#854d0e',
                    background: '#fef08a',
                    border: '1px solid #facc15',
                    padding: '2px 8px',
                    borderRadius: '4px'
                }}>
                    ⚠️ Chưa xếp lịch
                </span>
            </div>
        );
    };

    // Hàm tạo tag cảnh báo đếm ngược ngày chụp
    const getShootingCountdownTag = (dateVal, isCompleted = false) => {
        if (!dateVal) {
            return (
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#dc2626',
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    marginTop: '3px'
                }}>
                    ⚠️ Chưa xếp lịch
                </span>
            );
        }

        const shootDate = new Date(dateVal);
        if (isNaN(shootDate.getTime())) return null;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const target = new Date(shootDate.getFullYear(), shootDate.getMonth(), shootDate.getDate());
        const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (isCompleted) {
            return (
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: '#059669',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    marginTop: '3px'
                }}>
                    ✓ Đã hoàn thành
                </span>
            );
        }

        if (diffDays === 0) {
            return (
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: '#dc2626',
                    background: '#fee2e2',
                    border: '1px solid #f87171',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    marginTop: '3px'
                }}>
                    🚨 Hôm nay chụp!
                </span>
            );
        }

        if (diffDays === 1) {
            return (
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: '#c2410c',
                    background: '#ffedd5',
                    border: '1px solid #fdba74',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    marginTop: '3px'
                }}>
                    ⚡ Ngày mai (còn 1 ngày)
                </span>
            );
        }

        if (diffDays >= 2 && diffDays <= 3) {
            return (
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#b45309',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    marginTop: '3px'
                }}>
                    ⏳ Còn {diffDays} ngày nữa
                </span>
            );
        }

        if (diffDays >= 4 && diffDays <= 7) {
            return (
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#0369a1',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    marginTop: '3px'
                }}>
                    🗓️ Còn {diffDays} ngày nữa
                </span>
            );
        }

        if (diffDays > 7) {
            return (
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: '#475569',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    marginTop: '3px'
                }}>
                    🗓️ Còn {diffDays} ngày nữa
                </span>
            );
        }

        const passedDays = Math.abs(diffDays);
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.68rem',
                fontWeight: 500,
                color: '#64748b',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                padding: '1px 6px',
                borderRadius: '4px',
                marginTop: '3px'
            }}>
                Đã qua {passedDays} ngày
            </span>
        );
    };

    const quickStatusOptions = QUICK_STATUS_OPTIONS;

    const handleSelectStatusFilter = (stId) => {
        setStatusFilter(stId);
        if (stId !== 'all' && excludeStatus.includes(String(stId))) {
            setExcludeStatus(prev => prev.filter(id => id !== String(stId)));
        }
    };

    return (
        <div className="contract-page-container">
            {/* 1. HEADER TITLE & ACTIONS */}
            <div className="contract-header">
                <div className="contract-title-wrap">
                    <div className="contract-badge-top">
                        <i className="fa-solid fa-file-contract"></i> LONG WEDDING CONTRACT & SERVICE OPERATIONS
                    </div>
                    <h2>
                        <i className="fa-solid fa-folder-open" style={{ color: '#0284c7' }}></i> QUẢN LÝ HỢP ĐỒNG KHÁCH HÀNG
                    </h2>
                    <p className="contract-subtitle">
                        {!isAdmin 
                            ? `👤 Đang hiển thị các hợp đồng do bạn tạo hoặc được phân công (${user?.fullname || user?.username || 'Nhân viên'})` 
                            : 'Theo dõi tiến độ dịch vụ, lịch chụp ảnh cưới, tiến độ hậu kỳ, in ảnh và trạng thái thanh toán theo từng hợp đồng'}
                    </p>
                </div>

                <div className="contract-header-actions">
                    <Button
                        variant="contained"
                        className="btn-add-contract"
                        onClick={handleClickOpenDialog}
                        startIcon={<i className="fa-solid fa-plus"></i>}
                    >
                        Thêm Hợp Đồng Mới
                    </Button>
                </div>
            </div>

            {/* 2. TOOLBAR & FILTERS */}
            <div className="contract-toolbar glass-panel">
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

                    <FormControl size="small" sx={{ minWidth: 170 }}>
                        <InputLabel>Thời gian</InputLabel>
                        <Select
                            value={timeFilter}
                            label="Thời gian"
                            onChange={(e) => setTimeFilter(e.target.value)}
                        >
                            <MenuItem value="all">Tất cả thời gian</MenuItem>
                            <MenuItem value="hôm nay">Hôm nay</MenuItem>
                            <MenuItem value="1 tuần">1 tuần qua</MenuItem>
                            <MenuItem value="1 tháng">1 tháng qua</MenuItem>
                            <MenuItem value="4 tháng">4 tháng qua</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 190 }}>
                        <InputLabel>Trạng thái hợp đồng</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Trạng thái hợp đồng"
                            onChange={(e) => handleSelectStatusFilter(e.target.value)}
                        >
                            {quickStatusOptions.map(opt => (
                                <MenuItem key={opt.id} value={opt.id}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Bộ lọc loại bỏ trạng thái (Exclude status) */}
                    <FormControl size="small" sx={{ minWidth: 205 }}>
                        <InputLabel id="exclude-status-label">Loại bỏ trạng thái</InputLabel>
                        <Select
                            labelId="exclude-status-label"
                            multiple
                            value={excludeStatus}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (Array.isArray(val) && val.includes('_clear_')) {
                                    setExcludeStatus([]);
                                    return;
                                }
                                setExcludeStatus(typeof val === 'string' ? val.split(',') : val);
                            }}
                            input={<OutlinedInput label="Loại bỏ trạng thái" />}
                            renderValue={(selected) => {
                                if (!selected || selected.length === 0) {
                                    return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Không loại trừ</span>;
                                }
                                if (selected.length === 1) {
                                    const opt = quickStatusOptions.find(o => String(o.id) === String(selected[0]));
                                    const cleanLabel = opt ? opt.label.replace(/^[^\s]+\s*/, '') : selected[0];
                                    return (
                                        <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.82rem' }}>
                                            🚫 Bỏ: {cleanLabel}
                                        </span>
                                    );
                                }
                                return (
                                    <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.82rem' }}>
                                        🚫 Đã bỏ {selected.length} trạng thái
                                    </span>
                                );
                            }}
                        >
                            {excludeStatus.length > 0 && (
                                <MenuItem 
                                    value="_clear_" 
                                    sx={{ 
                                        color: '#0284c7', 
                                        fontWeight: 700, 
                                        fontSize: '0.82rem',
                                        borderBottom: '1px dashed #cbd5e1',
                                        py: 1
                                    }}
                                >
                                    <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }}></i>
                                    Hiển thị tất cả (Bỏ loại trừ)
                                </MenuItem>
                            )}
                            {quickStatusOptions.filter(o => o.id !== 'all').map((opt) => {
                                const isChecked = excludeStatus.indexOf(String(opt.id)) > -1;
                                return (
                                    <MenuItem key={opt.id} value={String(opt.id)} sx={{ py: 0.5 }}>
                                        <Checkbox 
                                            size="small" 
                                            checked={isChecked} 
                                            sx={{ 
                                                color: isChecked ? '#dc2626' : undefined, 
                                                '&.Mui-checked': { color: '#dc2626' },
                                                p: 0.5,
                                                mr: 1
                                            }} 
                                        />
                                        <ListItemText 
                                            primary={`Loại bỏ: ${opt.label}`} 
                                            primaryTypographyProps={{ 
                                                fontSize: '0.83rem', 
                                                fontWeight: isChecked ? 700 : 500,
                                                color: isChecked ? '#dc2626' : '#1e293b'
                                            }} 
                                        />
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </div>

                <div className="toolbar-right">
                    <ToggleButtonGroup
                        size="small"
                        value={viewMode}
                        exclusive
                        onChange={(e, newMode) => newMode && setViewMode(newMode)}
                        sx={{ bgcolor: '#f8fafc' }}
                    >
                        <ToggleButton value="table" title="Dạng Bảng Chi Tiết">
                            <ViewListIcon fontSize="small" sx={{ mr: 0.5 }} /> Bảng
                        </ToggleButton>
                        <ToggleButton value="kanban" title="Bảng Kanban Tiến Trình Kéo - Thả">
                            <i className="fa-solid fa-chart-gantt" style={{ marginRight: '6px' }}></i> Kanban
                        </ToggleButton>
                        <ToggleButton value="grid" title="Dạng Lưới Thẻ">
                            <ViewModuleIcon fontSize="small" sx={{ mr: 0.5 }} /> Lưới
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Tooltip title="Tải lại dữ liệu">
                        <IconButton 
                            onClick={() => loadHopDong(timeFilter, searchInput)}
                            sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}
                        >
                            <i className="fa-solid fa-rotate"></i>
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* 3. THANH CHÚ GIẢI MÀU SẮC DÒNG HỢP ĐỒNG (CLICK ĐỂ LỌC NHANH) */}
            <div className="contract-quick-filters glass-panel" style={{ padding: '7px 14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginRight: '4px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    🎨 Màu dòng trạng thái:
                </span>
                {CONTRACT_ROW_COLOR_LEGEND.map((item) => {
                    const isSelected = String(statusFilter) === String(item.id);
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectStatusFilter(isSelected && item.id !== 'all' ? 'all' : item.id)}
                            title={`Nhấn để lọc: ${item.label}`}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '3px 10px',
                                borderRadius: '14px',
                                fontSize: '0.73rem',
                                fontWeight: isSelected ? 800 : 600,
                                backgroundColor: item.bg,
                                color: item.color,
                                border: isSelected ? `2px solid ${item.color}` : `1px solid ${item.border}`,
                                boxShadow: isSelected ? `0 2px 6px ${item.color}33` : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <span
                                style={{
                                    width: '9px',
                                    height: '9px',
                                    borderRadius: '50%',
                                    backgroundColor: item.color,
                                    display: 'inline-block',
                                    flexShrink: 0
                                }}
                            />
                            {item.label}
                        </button>
                    );
                })}
            </div>


            {/* 4. CONTENT: TABLE OR GRID VIEW */}
            {isMobile ? (
                <Box className="contract-list-scroll" onScroll={handleScroll} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pb: 10 }}>
                    {filteredHopDong && filteredHopDong.length > 0 ? (
                        filteredHopDong.map((hd, index) => (
                            <Card 
                                key={index} 
                                sx={{ 
                                    mb: 2, 
                                    borderRadius: 2, 
                                    border: `1px solid ${getContractStatusInfo(hd).borderColor}`, 
                                    borderLeft: `5px solid ${getContractStatusInfo(hd).color}`,
                                    bgcolor: getRowBackgroundColor(hd),
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)' 
                                }}
                                onClick={() => {
                                    setSendData(hd);
                                    handleClickOpenDetailDialog();
                                }}
                            >
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    p: 1.5, 
                                    bgcolor: getContractStatusInfo(hd).bgColor || '#f8fafc', 
                                    borderBottom: `1px solid ${getContractStatusInfo(hd).borderColor || '#e0e0e0'}` 
                                }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: getContractStatusInfo(hd).color }}>
                                        #{hd.maHopDong}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {renderStatusBadge(hd)}
                                        <IconButton size="small" sx={{ padding: 0 }}>
                                            <MoreHorizIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Box sx={{ p: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Khách hàng</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{hd.khachHang1?.tenKhachHang}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Liên hệ</Typography>
                                            <Box display="flex" alignItems="center" gap={0.8}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{hd.khachHang1?.soDienThoai}</Typography>
                                                {hd.khachHang1?.facebookId && (
                                                    <a 
                                                        href={hd.khachHang1.facebookId.startsWith('http') ? hd.khachHang1.facebookId : `https://facebook.com/${hd.khachHang1.facebookId}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        style={{ color: '#1877f2', textDecoration: 'none' }}
                                                        title="Mở Facebook"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <i className="fa-brands fa-facebook" style={{ fontSize: '1.1rem' }}></i>
                                                    </a>
                                                )}
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Dịch vụ</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{getDichVuChinhLabel(hd.dichVuChinh)}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Ngày HĐ</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                                                {hd.ngayHopDong ? formatDate(hd.ngayHopDong) : "-"}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Ngày chụp:</Typography>
                                                <Box textAlign="right">
                                                    {renderShootingDateCell(hd, true)}
                                                </Box>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Card>
                        ))
                    ) : (
                        <Typography sx={{ textAlign: 'center', mt: 4 }}>Không có dữ liệu hợp đồng khách hàng.</Typography>
                    )}
                </Box>
            ) : viewMode === 'kanban' ? (
                /* ===== DẠNG BẢNG KANBAN TIẾN TRÌNH ===== */
                <HopDongKanbanBoard 
                    contracts={filteredHopDong}
                    onContractClick={(hd) => {
                        setSendData(hd);
                        handleClickOpenDetailDialog();
                    }}
                    onAdvanceStage={handleKanbanAdvanceStage}
                />
            ) : viewMode === 'grid' ? (
                /* ===== DẠNG LƯỚI (GRID VIEW) ===== */
                <Box className="contract-list-scroll" onScroll={handleScroll} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5, pb: 4, pt: 0.5 }}>
                    {filteredHopDong && filteredHopDong.length > 0 ? (
                        <Grid container spacing={2.5}>
                            {filteredHopDong.map((hd, index) => {
                                const statusInfo = getContractStatusInfo(hd);
                                return (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={hd._id || index}>
                                        <Card 
                                            sx={{ 
                                                borderRadius: '14px', 
                                                border: `1px solid ${statusInfo.borderColor}`, 
                                                borderLeft: `5px solid ${statusInfo.color}`,
                                                bgcolor: statusInfo.rowBgColor || '#ffffff',
                                                boxShadow: `0 4px 12px ${statusInfo.color}15`,
                                                transition: 'all 0.25s ease-in-out',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    boxShadow: `0 12px 28px ${statusInfo.color}25`,
                                                    borderColor: statusInfo.color,
                                                    transform: 'translateY(-3px)'
                                                }
                                            }}
                                            onClick={() => {
                                                setSendData(hd);
                                                handleClickOpenDetailDialog();
                                            }}
                                        >
                                            <Box>
                                                {/* Header Card */}
                                                <Box 
                                                    sx={{ 
                                                        p: 1.5, 
                                                        background: isUnscheduledShooting(hd) 
                                                            ? 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)' 
                                                            : `linear-gradient(135deg, ${statusInfo.color}e6 0%, #0f172a 100%)`, 
                                                        color: '#ffffff',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        borderTopLeftRadius: '14px',
                                                        borderTopRightRadius: '14px'
                                                    }}
                                                >
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.98rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '65%' }} title={hd.khachHang1?.tenKhachHang}>
                                                        👤 {hd.khachHang1?.tenKhachHang || 'Chưa cập nhật'}
                                                    </Typography>
                                                    {renderStatusBadge(hd)}
                                                </Box>

                                                {/* Card Content */}
                                                <Box p={2} display="flex" flexDirection="column" gap={1.5}>
                                                    {/* Mã hợp đồng & Số điện thoại KH1 */}
                                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.82rem' }}>
                                                            📋 Mã HĐ: <span style={{ fontWeight: 700, color: '#0284c7' }}>{hd.maHopDong}</span>
                                                        </Typography>
                                                        {hd.khachHang1?.soDienThoai && (
                                                            <Box display="flex" alignItems="center" gap={0.6}>
                                                                <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>{hd.khachHang1.soDienThoai}</span>
                                                                {hd.khachHang1?.facebookId && (
                                                                    <a 
                                                                        href={hd.khachHang1.facebookId.startsWith('http') ? hd.khachHang1.facebookId : `https://facebook.com/${hd.khachHang1.facebookId}`} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        style={{ color: '#1877f2', textDecoration: 'none' }}
                                                                        title="Mở Facebook Khách 1"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <i className="fa-brands fa-facebook"></i>
                                                                    </a>
                                                                )}
                                                            </Box>
                                                        )}
                                                    </Box>

                                                    {/* Khách hàng 2 */}
                                                    {hd.khachHang2?.tenKhachHang && (
                                                        <Box pt={1} borderTop="1px dashed #e2e8f0">
                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.3 }}>
                                                                👤 KHÁCH HÀNG 2:
                                                            </Typography>
                                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                                <Typography variant="body1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.98rem' }}>
                                                                    {hd.khachHang2.tenKhachHang}
                                                                </Typography>
                                                                {hd.khachHang2?.soDienThoai && (
                                                                    <Box display="flex" alignItems="center" gap={0.6}>
                                                                        <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>{hd.khachHang2.soDienThoai}</span>
                                                                        {hd.khachHang2?.facebookId && (
                                                                            <a 
                                                                                href={hd.khachHang2.facebookId.startsWith('http') ? hd.khachHang2.facebookId : `https://facebook.com/${hd.khachHang2.facebookId}`} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer" 
                                                                                style={{ color: '#1877f2', textDecoration: 'none' }}
                                                                                title="Mở Facebook Khách 2"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <i className="fa-brands fa-facebook"></i>
                                                                            </a>
                                                                        )}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    )}

                                                    {/* Chi tiết dịch vụ & Lịch trình */}
                                                    <Box p={1.2} bgcolor="#f8fafc" borderRadius="10px" border="1px solid #f1f5f9" display="flex" flexDirection="column" gap={0.8}>
                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Dịch vụ chính:</span>
                                                            <strong style={{ fontSize: '0.82rem', color: '#0284c7' }}>{getDichVuChinhLabel(hd.dichVuChinh)}</strong>
                                                        </Box>
                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Ngày hợp đồng:</span>
                                                            <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 500 }}>
                                                                {hd.ngayHopDong ? formatDate(hd.ngayHopDong) : '-'}
                                                            </span>
                                                        </Box>
                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Ngày chụp ảnh:</span>
                                                            <Box textAlign="right">
                                                                {renderShootingDateCell(hd, true)}
                                                            </Box>
                                                        </Box>

                                                        {/* Thanh Progress Trạng Thái Thanh Toán hoặc Job Card cho KTV */}
                                                        {isTechnician ? (
                                                            <Box sx={{ mt: 0.5, pt: 0.8, borderTop: '1px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Phiếu công việc:</span>
                                                                <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, border: '1px solid #bfdbfe' }}>
                                                                    🛠️ {hd.cacNgay?.diaDiemChup ? `Điểm: ${hd.cacNgay.diaDiemChup}` : 'Xem chi tiết việc'}
                                                                </span>
                                                            </Box>
                                                        ) : (() => {
                                                            const daThanhToan = Number(hd.thanhToan?.khachHangDaThanhToan) || 0;
                                                            const conLai = hd.thanhToan?.conLai !== undefined ? Number(hd.thanhToan.conLai) : 0;
                                                            const tongTienHD = daThanhToan + conLai;

                                                            let percent = hd.thanhToan?.phanTramDaThanhToan !== undefined
                                                                ? Number(hd.thanhToan.phanTramDaThanhToan)
                                                                : (tongTienHD > 0 ? Math.min(100, Math.round((daThanhToan / tongTienHD) * 100 * 10) / 10) : (daThanhToan > 0 ? 100 : 0));

                                                            const statusText = hd.thanhToan?.trangThaiThanhToan || (percent >= 100 ? 'Đã thanh toán đủ' : percent > 0 ? `Đã thanh toán ${percent}%` : 'Chưa thanh toán');

                                                            return (
                                                                <Box sx={{ mt: 0.5, pt: 0.8, borderTop: '1px dashed #e2e8f0' }}>
                                                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.4}>
                                                                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Thanh toán:</span>
                                                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: percent >= 100 ? '#15803d' : percent > 0 ? '#b45309' : '#dc2626' }}>
                                                                            {statusText} ({percent}%)
                                                                        </span>
                                                                    </Box>
                                                                    <Box sx={{ width: '100%', height: '8px', bgcolor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                                                        <Box
                                                                            sx={{
                                                                                width: `${percent}%`,
                                                                                height: '100%',
                                                                                borderRadius: '4px',
                                                                                background: percent >= 100 ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' : percent > 0 ? 'linear-gradient(90deg, #fbbf24 0%, #d97706 100%)' : 'transparent',
                                                                                transition: 'width 0.4s ease-in-out'
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                                                                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Đã thu: <strong>{daThanhToan.toLocaleString('vi-VN')} đ</strong></span>
                                                                        <span style={{ fontSize: '0.72rem', color: conLai <= 0 ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                                                                            {conLai <= 0 ? 'Hết nợ' : `Còn: ${conLai.toLocaleString('vi-VN')} đ`}
                                                                        </span>
                                                                    </Box>
                                                                </Box>
                                                            );
                                                        })()}
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {/* Card Footer Button */}
                                            <Box p={1.5} borderTop="1px solid #f1f5f9" bgcolor="#fafafa" borderBottomLeftRadius="14px" borderBottomRightRadius="14px">
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        borderRadius: '8px',
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        fontSize: '0.82rem',
                                                        borderColor: '#cbd5e1',
                                                        color: '#0284c7',
                                                        '&:hover': {
                                                            borderColor: '#0284c7',
                                                            bgcolor: '#f0f9ff'
                                                        }
                                                    }}
                                                >
                                                    📄 Xem chi tiết hợp đồng
                                                </Button>
                                            </Box>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    ) : (
                        <Typography sx={{ textAlign: 'center', mt: 4, color: '#64748b' }}>Không có dữ liệu hợp đồng khách hàng.</Typography>
                    )}
                </Box>
            ) : (
                /* ===== DẠNG BẢNG (TABLE VIEW) ===== */
                <Paper elevation={0} className="contract-table-container glass-panel">
                    <TableContainer className="contract-list-scroll" onScroll={handleScroll} sx={{ flex: 1, minHeight: 0, height: '100%', overflowY: 'auto', overflowX: 'auto' }}>
                        <Table stickyHeader size="small">
                            <TableHead sx={{ '& th': { bgcolor: '#f8fafc', color: '#334155', fontWeight: 800, py: 1.5, zIndex: 3 } }}>
                                <TableRow>
                                    <TableCell align='center' style={{ minWidth: 45, width: '4%' }}>STT</TableCell>
                                    <TableCell style={{ minWidth: 165, width: '15%' }}>TÊN KHÁCH HÀNG</TableCell>
                                    <TableCell align='center' style={{ minWidth: 95, width: '8%' }}>MÃ SỐ HĐ</TableCell>
                                    <TableCell style={{ minWidth: 125, width: '10%' }}>LIÊN HỆ</TableCell>
                                    <TableCell align='center' style={{ minWidth: 145, width: '13%' }}>NGÀY CHỤP</TableCell>
                                    <TableCell align='center' style={{ minWidth: 105, width: '9%' }}>DỊCH VỤ</TableCell>
                                    <TableCell align='center' style={{ minWidth: 155, width: '15%' }}>{isTechnician ? 'PHIẾU CÔNG VIỆC' : 'THANH TOÁN'}</TableCell>
                                    <TableCell align='center' style={{ minWidth: 155, width: '15%' }}>TRẠNG THÁI</TableCell>
                                    <TableCell align='center' style={{ minWidth: 115, width: '11%' }}>NGÀY HỢP ĐỒNG</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredHopDong && filteredHopDong.length > 0 ? (
                                    filteredHopDong.map((hd, index) => {
                                        const statusInfo = getContractStatusInfo(hd);
                                        return (
                                        <TableRow 
                                            key={hd._id || index}
                                            className="contract-table-row"
                                            sx={{ 
                                                backgroundColor: `${statusInfo.rowBgColor || '#ffffff'} !important`,
                                                opacity: statusInfo.subStage === 'huy' ? 0.78 : 1,
                                                '& td': {
                                                    backgroundColor: 'transparent',
                                                    borderBottom: `1px solid ${statusInfo.borderColor || '#e2e8f0'}`
                                                },
                                                '&:hover': {
                                                    filter: 'brightness(0.96)'
                                                }
                                            }}
                                            onClick={() => {
                                                setSendData(hd);
                                                handleClickOpenDetailDialog();
                                            }}
                                        >
                                            <TableCell 
                                                align='center' 
                                                style={{ 
                                                    fontWeight: 800, 
                                                    color: statusInfo.color,
                                                    borderLeft: `5px solid ${statusInfo.color}`
                                                }}
                                            >
                                                {index + 1}
                                            </TableCell>
                                            <TableCell align='left' style={{ fontWeight: 800, fontSize: '0.96rem', color: statusInfo.subStage === 'huy' ? '#94a3b8' : '#0f172a', textDecoration: statusInfo.subStage === 'huy' ? 'line-through' : 'none' }}>
                                                {hd.khachHang1?.tenKhachHang}
                                                {hd.khachHang2?.tenKhachHang && (
                                                    <>
                                                        <br />
                                                        <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>& {hd.khachHang2.tenKhachHang}</span>
                                                    </>
                                                )}
                                            </TableCell>
                                            <TableCell align='center'>
                                                <span 
                                                    className="badge-code"
                                                    style={{
                                                        borderColor: `${statusInfo.color}40`,
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                >
                                                    {hd.maHopDong}
                                                </span>
                                            </TableCell>
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
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 2 }}>
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
                                            {/* Cột 5: NGÀY CHỤP */}
                                            <TableCell align='center'>
                                                {renderShootingDateCell(hd, false)}
                                            </TableCell>
                                            <TableCell align='center'>
                                                <span className="badge-service-tag">
                                                    {getDichVuChinhLabel(hd.dichVuChinh)}
                                                </span>
                                            </TableCell>
                                            <TableCell align='center' onClick={(e) => { e.stopPropagation(); setSendData(hd); handleClickOpenDetailDialog(); }}>
                                                {isTechnician ? (
                                                    <span style={{ fontSize: '0.74rem', background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, border: '1px solid #bfdbfe', display: 'inline-block' }}>
                                                        🛠️ Job Card ({hd.cacNgay?.diaDiemChup || 'Tại Studio'})
                                                    </span>
                                                ) : (() => {
                                                    const percent = hd.thanhToan?.phanTramDaThanhToan !== undefined
                                                        ? Number(hd.thanhToan.phanTramDaThanhToan)
                                                        : (Number(hd.thanhToan?.tongGiaTriSauGiam || hd.thanhToan?.tongGiaTri || 0) > 0
                                                            ? Math.min(100, Math.round(((Number(hd.thanhToan?.khachHangDaThanhToan) || 0) / Number(hd.thanhToan?.tongGiaTriSauGiam || hd.thanhToan?.tongGiaTri)) * 100 * 10) / 10)
                                                            : 0);
                                                    const daThanhToan = Number(hd.thanhToan?.khachHangDaThanhToan) || 0;
                                                    const conLai = hd.thanhToan?.conLai !== undefined ? Number(hd.thanhToan.conLai) : 0;
                                                    const statusText = hd.thanhToan?.trangThaiThanhToan || (percent >= 100 ? 'Đã thanh toán đủ' : percent > 0 ? `Đã cọc ${percent}%` : 'Chưa thanh toán');

                                                    return (
                                                        <Box sx={{ minWidth: 140, px: 0.5 }}>
                                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.3}>
                                                                <Chip
                                                                    label={`${percent}%`}
                                                                    size="small"
                                                                    sx={{
                                                                        height: '18px',
                                                                        fontSize: '0.68rem',
                                                                        fontWeight: 800,
                                                                        bgcolor: percent >= 100 ? '#dcfce7' : percent > 0 ? '#fef3c7' : '#fee2e2',
                                                                        color: percent >= 100 ? '#15803d' : percent > 0 ? '#b45309' : '#b91c1c',
                                                                        border: `1px solid ${percent >= 100 ? '#86efac' : percent > 0 ? '#fde047' : '#fca5a5'}`
                                                                    }}
                                                                />
                                                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: percent >= 100 ? '#16a34a' : percent > 0 ? '#d97706' : '#64748b' }}>
                                                                    {statusText}
                                                                </span>
                                                            </Box>
                                                            <Box sx={{ width: '100%', height: '6px', bgcolor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                                                <Box
                                                                    sx={{
                                                                        width: `${percent}%`,
                                                                        height: '100%',
                                                                        borderRadius: '3px',
                                                                        background: percent >= 100 ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' : percent > 0 ? 'linear-gradient(90deg, #fbbf24 0%, #d97706 100%)' : 'transparent'
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.3} sx={{ fontSize: '0.72rem' }}>
                                                                <span style={{ color: '#0284c7', fontWeight: 600 }}>Thu: {daThanhToan.toLocaleString('vi-VN')}đ</span>
                                                                <span style={{ color: conLai <= 0 ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                                                                    {conLai <= 0 ? 'Hết nợ' : `Nợ: ${conLai.toLocaleString('vi-VN')}đ`}
                                                                </span>
                                                            </Box>
                                                        </Box>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell align='center'>
                                                {renderStatusBadge(hd)}
                                            </TableCell>
                                            <TableCell align='center'>
                                                {hd.ngayHopDong ? (
                                                    <>
                                                        <div style={{ fontWeight: 600, color: '#334155' }}>{formatDate(hd.ngayHopDong)}</div>
                                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                                                            (Âm: {formatLunarDateShort(hd.ngayHopDong)})
                                                        </div>
                                                    </>
                                                ) : "-"}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                                            <i className="fa-solid fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: 10, display: 'block', color: '#cbd5e1' }}></i>
                                            Không tìm thấy dữ liệu hợp đồng nào phù hợp.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {isLoadingMore && (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 2, bgcolor: '#f8fafc' }}>
                                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: '#0284c7', fontSize: '0.82rem', fontWeight: 700 }}>
                                                <i className="fa-solid fa-spinner fa-spin"></i> Đang tải thêm hợp đồng...
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!hasMore && filteredHopDong.length > 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 1.5, bgcolor: '#f8fafc', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
                                            Đã hiển thị toàn bộ {totalRecords || filteredHopDong.length} hợp đồng
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {isMobile && (
                <Fab 
                    color="primary" 
                    sx={{ 
                        position: 'fixed', 
                        bottom: 70, 
                        right: 16, 
                        zIndex: 1000,
                        opacity: 0.8,
                        boxShadow: '0 6px 16px rgba(2,132,199,0.35)',
                        '&:hover': {
                            opacity: 1
                        }
                    }}
                    onClick={handleClickOpenDialog}
                >
                    <AddIcon />
                </Fab>
            )}

            <DetailHopDongKhachHangDialog
                data={sendData}
                open={openDetailDialog}
                onClose={handleCloseDetailDialog}
            />

            <ThemHopDongKHDialog
                selectedValue={selectedValueDialog}
                open={openDialogHD}
                onClose={handleCloseDialog}
            />
        </div>
    );
}

export default HopDongKhachHang;
