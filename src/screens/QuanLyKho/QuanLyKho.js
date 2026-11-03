import './quanlykho.css';
import React, { useState, useEffect, useMemo } from 'react';
import { useLoading } from "../../context/LoadingContext";
import otherService from '../../API/services/otherService';
import ServiceDetailDialog from './ServiceDetailDialog';
import ServiceAddDialog from './ServiceAddDialog';
import ServiceExcelImportDialog from './ServiceExcelImportDialog';
import { exportServicesToExcel } from '../../utils/excelServiceHelper';
import { formatCurrency } from "../utils/formatCurrency.js";
import { toast } from 'sonner';
import { useContractTypes } from '../../hooks/useContractTypes';
import { updateContractTypesCache } from '../../utils/contractTypesHelper';
import { useServiceTypes } from '../../hooks/useServiceTypes';
import { updateServiceTypesCache, getLoaiDichVuInfo } from '../../utils/serviceTypesHelper';

// Material UI components
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Typography,
    Grid,
    Stack,
    Box,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    IconButton,
    Tooltip,
    InputAdornment,
    Card,
    CardContent,
    useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Icons
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

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

const PRESET_EMOJIS = ['👗', '📦', '🖼️', '💄', '💌', '💐', '🚗', '📸', '👑', '💍', '🎀', '🎬', '🎂', '🏷️'];
const PRESET_COLORS = [
    { name: 'Tím', color: '#9333ea', badgeBg: '#f3e8ff' },
    { name: 'Xanh dương', color: '#2563eb', badgeBg: '#dbeafe' },
    { name: 'Xanh lá', color: '#059669', badgeBg: '#d1fae5' },
    { name: 'Hồng sen', color: '#db2777', badgeBg: '#fce7f3' },
    { name: 'Đỏ hồng', color: '#e11d48', badgeBg: '#ffe4e6' },
    { name: 'Cam đất', color: '#d97706', badgeBg: '#fef3c7' },
    { name: 'Chàm', color: '#4f46e5', badgeBg: '#e0e7ff' },
    { name: 'Xanh ngọc', color: '#0284c7', badgeBg: '#e0f2fe' },
    { name: 'Xám đậm', color: '#475569', badgeBg: '#f1f5f9' }
];

const QuanLyKho = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { showLoading, hideLoading } = useLoading();
    
    // TAB STATE (0: Kho / Dịch vụ, 1: Loại dịch vụ, 2: Loại hợp đồng, 3: Shop mua hàng)
    const [activeTab, setActiveTab] = useState(0);

    // KHO / DICH VU STATE
    const [listSeviceAPI, setListSeviceAPI] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [filterLoaiDichVu, setFilterLoaiDichVu] = useState("all");
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openImportExcelDialog, setOpenImportExcelDialog] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // SERVICE TYPES (LOẠI DỊCH VỤ) STATE
    const { serviceTypes, reloadServiceTypes } = useServiceTypes();
    const [serviceTypeKeyword, setServiceTypeKeyword] = useState("");
    const [openServiceTypeDialog, setOpenServiceTypeDialog] = useState(false);
    const [editingServiceType, setEditingServiceType] = useState(null);
    const [serviceTypeName, setServiceTypeName] = useState("");
    const [serviceTypePrefix, setServiceTypePrefix] = useState("");
    const [serviceTypeIcon, setServiceTypeIcon] = useState("📦");
    const [serviceTypeColor, setServiceTypeColor] = useState("#2563eb");
    const [serviceTypeBadgeBg, setServiceTypeBadgeBg] = useState("#dbeafe");
    const [serviceTypeDesc, setServiceTypeDesc] = useState("");

    // CONTRACT TYPE STATE
    const { contractTypes } = useContractTypes();
    const [contractTypeKeyword, setContractTypeKeyword] = useState("");
    const [openTypeDialog, setOpenTypeDialog] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [typeName, setTypeName] = useState("");

    // SHOP MUA HANG STATE
    const [donViList, setDonViList] = useState([]);
    const [donViKeyword, setDonViKeyword] = useState("");
    const [openDonViDialog, setOpenDonViDialog] = useState(false);
    const [editingDonVi, setEditingDonVi] = useState(null);
    const [donViName, setDonViName] = useState("");
    const [donViPhone, setDonViPhone] = useState("");
    const [donViAddress, setDonViAddress] = useState("");
    const [donViNote, setDonViNote] = useState("");

    const loadDonViList = async () => {
        showLoading("Đang tải danh sách shop mua hàng...");
        try {
            const [resDonVi, resChiTieu] = await Promise.allSettled([
                otherService.findAllDonViNhanTien({}),
                otherService.LIST_CHITIEU({})
            ]);

            const savedList = (resDonVi.status === 'fulfilled' && resDonVi.value?.status === 'success' && resDonVi.value?.data?.donViNhanTien)
                ? resDonVi.value.data.donViNhanTien
                : [];
            
            const chiTieuList = (resChiTieu.status === 'fulfilled' && resChiTieu.value?.status === 'success' && resChiTieu.value?.data?.chiTieu)
                ? resChiTieu.value.data.chiTieu
                : [];

            // Group chiTieu by receiver
            const statsMap = {};
            chiTieuList.forEach(ct => {
                const rec = ct.receiver ? ct.receiver.trim() : '';
                if (rec) {
                    const key = rec.toLowerCase();
                    if (!statsMap[key]) {
                        statsMap[key] = {
                            originalName: rec,
                            soLanChi: 0,
                            tongTienChi: 0
                        };
                    }
                    statsMap[key].soLanChi += 1;
                    statsMap[key].tongTienChi += Number(ct.amount) || 0;
                }
            });

            // Map saved shops with stats
            const seenKeys = new Set();
            const mergedList = savedList.map(item => {
                const key = (item.name || '').trim().toLowerCase();
                seenKeys.add(key);
                const stat = statsMap[key] || { soLanChi: 0, tongTienChi: 0 };
                return {
                    ...item,
                    soLanChi: (item.soLanChi !== undefined && item.soLanChi > 0) ? item.soLanChi : stat.soLanChi,
                    tongTienChi: (item.tongTienChi !== undefined && item.tongTienChi > 0) ? item.tongTienChi : stat.tongTienChi
                };
            });

            // Add shops from chiTieu that aren't in savedList yet
            Object.keys(statsMap).forEach(key => {
                if (!seenKeys.has(key)) {
                    mergedList.push({
                        name: statsMap[key].originalName,
                        phone: '',
                        address: '',
                        note: '',
                        soLanChi: statsMap[key].soLanChi,
                        tongTienChi: statsMap[key].tongTienChi
                    });
                }
            });

            // Sort by tongTienChi descending then by name
            mergedList.sort((a, b) => (b.tongTienChi || 0) - (a.tongTienChi || 0) || (a.name || '').localeCompare(b.name || ''));

            setDonViList(mergedList);
        } catch (err) {
            console.error("Lỗi tải danh sách shop mua hàng:", err);
        } finally {
            hideLoading();
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        if (newValue === 3) {
            loadDonViList();
        } else if (newValue === 0) {
            otherService.findDichVu({})
                .then(res => res.status === 'success' && setListSeviceAPI(res.data.dichVu))
                .catch(err => console.error(err));
        } else if (newValue === 1) {
            reloadServiceTypes();
        }
    };

    const onSaveSuccess = () => {
        setOpenAddDialog(false);
        setSelectedService(null);
        setIsEditMode(false);
        showLoading("Đang tải dữ liệu...");
        otherService.findDichVu({})
            .then(res => res.status === 'success' && setListSeviceAPI(res.data.dichVu))
            .finally(() => hideLoading());
    };

    const handleDeleteService = (service) => {
        if (!service) return;
        if (window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${service.tenDichVu}" (${service.maDichVu}) không?`)) {
            showLoading("Đang xóa dịch vụ...");
            otherService.ServiceRemoveProduct({ maDichVu: service.maDichVu })
                .then(() => {
                    toast.success("Xóa dịch vụ thành công!");
                    onSaveSuccess();
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("Lỗi khi xóa dịch vụ: " + (err?.message || "Đã có lỗi xảy ra"));
                })
                .finally(() => hideLoading());
        }
    };

    useEffect(() => {
        showLoading("Đang tải dữ liệu...");
        otherService.findDichVu({})
            .then(res => {
                if (res.status === 'success' && res.data?.dichVu) {
                    setListSeviceAPI(res.data.dichVu);
                }
            })
            .catch(err => console.error(err))
            .finally(() => hideLoading());

        loadDonViList();
        reloadServiceTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ===== HANDLERS CHO LOẠI DỊCH VỤ =====
    const handleSaveServiceType = async (e) => {
        e.preventDefault();
        if (!serviceTypeName.trim()) {
            toast.warning("Vui lòng nhập tên loại dịch vụ!");
            return;
        }

        showLoading("Đang lưu loại dịch vụ...");
        try {
            let res;
            if (editingServiceType) {
                res = await otherService.updateLoaiDichVu({
                    id: editingServiceType.id,
                    name: serviceTypeName.trim(),
                    prefix: serviceTypePrefix.trim(),
                    icon: serviceTypeIcon.trim() || "📦",
                    color: serviceTypeColor,
                    badgeBg: serviceTypeBadgeBg,
                    description: serviceTypeDesc.trim()
                });
            } else {
                res = await otherService.createLoaiDichVu({
                    name: serviceTypeName.trim(),
                    prefix: serviceTypePrefix.trim(),
                    icon: serviceTypeIcon.trim() || "📦",
                    color: serviceTypeColor,
                    badgeBg: serviceTypeBadgeBg,
                    description: serviceTypeDesc.trim()
                });
            }

            if (res.status === 'success') {
                toast.success(editingServiceType ? "Cập nhật loại dịch vụ thành công!" : "Thêm loại dịch vụ mới thành công!");
                setOpenServiceTypeDialog(false);
                setEditingServiceType(null);
                setServiceTypeName("");
                setServiceTypePrefix("");
                setServiceTypeIcon("📦");
                setServiceTypeColor("#2563eb");
                setServiceTypeBadgeBg("#dbeafe");
                setServiceTypeDesc("");

                const updated = await reloadServiceTypes();
                if (updated) updateServiceTypesCache(updated);
            } else {
                toast.error(res.message || "Đã có lỗi xảy ra");
            }
        } catch (err) {
            toast.error(err.message || "Lỗi kết nối máy chủ");
        } finally {
            hideLoading();
        }
    };

    const handleDeleteServiceType = async (type) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa loại dịch vụ "${type.name}" không?`)) return;
        showLoading("Đang xóa loại dịch vụ...");
        try {
            const res = await otherService.removeLoaiDichVu({ id: type.id });
            if (res.status === 'success') {
                toast.success("Xóa loại dịch vụ thành công!");
                const updated = await reloadServiceTypes();
                if (updated) updateServiceTypesCache(updated);
            } else {
                toast.error(res.message || "Đã có lỗi xảy ra");
            }
        } catch (err) {
            toast.error(err.message || "Lỗi kết nối");
        } finally {
            hideLoading();
        }
    };

    // ===== HANDLERS CHO LOẠI HỢP ĐỒNG =====
    const handleSaveType = async (e) => {
        e.preventDefault();
        if (!typeName.trim()) {
            toast.warning("Vui lòng nhập tên loại hợp đồng!");
            return;
        }
        showLoading("Đang lưu loại hợp đồng...");
        try {
            let res;
            if (editingType) {
                res = await otherService.updateLoaiHopDong({ id: editingType.id, name: typeName.trim() });
            } else {
                res = await otherService.createLoaiHopDong({ name: typeName.trim() });
            }
            if (res.status === 'success') {
                toast.success(editingType ? "Cập nhật thành công!" : "Thêm thành công!");
                setOpenTypeDialog(false);
                setEditingType(null);
                setTypeName("");
                const refreshRes = await otherService.findAllLoaiHopDong();
                if (refreshRes.status === 'success' && refreshRes.data.loaiHopDong) {
                    updateContractTypesCache(refreshRes.data.loaiHopDong);
                }
            } else {
                toast.error(res.message || "Đã có lỗi xảy ra");
            }
        } catch (err) {
            toast.error(err.message || "Lỗi kết nối");
        } finally {
            hideLoading();
        }
    };

    const handleDeleteType = async (type) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa loại hợp đồng "${type.name}" không?`)) return;
        showLoading("Đang xóa loại hợp đồng...");
        try {
            const res = await otherService.removeLoaiHopDong({ id: type.id });
            if (res.status === 'success') {
                toast.success("Xóa loại hợp đồng thành công!");
                const refreshRes = await otherService.findAllLoaiHopDong();
                if (refreshRes.status === 'success' && refreshRes.data.loaiHopDong) {
                    updateContractTypesCache(refreshRes.data.loaiHopDong);
                }
            } else {
                toast.error(res.message || "Đã có lỗi xảy ra");
            }
        } catch (err) {
            toast.error(err.message || "Lỗi kết nối");
        } finally {
            hideLoading();
        }
    };

    // ===== HANDLERS CHO SHOP MUA HÀNG =====
    const handleSaveDonVi = async (e) => {
        e.preventDefault();
        if (!donViName.trim()) {
            toast.warning("Vui lòng nhập tên shop mua hàng!");
            return;
        }
        showLoading("Đang lưu shop mua hàng...");
        try {
            let res;
            const targetId = editingDonVi?.id || editingDonVi?._id;
            if (targetId) {
                res = await otherService.updateDonViNhanTien({
                    id: targetId,
                    name: donViName.trim(),
                    phone: donViPhone.trim(),
                    address: donViAddress.trim(),
                    note: donViNote.trim()
                });
            } else {
                res = await otherService.createDonViNhanTien({
                    name: donViName.trim(),
                    phone: donViPhone.trim(),
                    address: donViAddress.trim(),
                    note: donViNote.trim()
                });
            }

            if (res.status === 'success') {
                toast.success(editingDonVi ? "Cập nhật shop mua hàng thành công!" : "Thêm shop mua hàng thành công!");
                setOpenDonViDialog(false);
                setEditingDonVi(null);
                setDonViName("");
                setDonViPhone("");
                setDonViAddress("");
                setDonViNote("");
                loadDonViList();
            } else {
                toast.error(res.message || "Đã có lỗi xảy ra");
            }
        } catch (err) {
            toast.error(err.message || "Lỗi kết nối máy chủ");
        } finally {
            hideLoading();
        }
    };

    const handleDeleteDonVi = async (item) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa shop "${item.name}" không?`)) return;
        const targetId = item.id || item._id;
        if (!targetId) {
            setDonViList(prev => prev.filter(d => d.name !== item.name));
            toast.success("Xóa shop mua hàng thành công!");
            return;
        }
        showLoading("Đang xóa shop mua hàng...");
        try {
            const res = await otherService.removeDonViNhanTien({ id: targetId });
            if (res.status === 'success') {
                toast.success("Xóa shop mua hàng thành công!");
                loadDonViList();
            } else {
                toast.error(res.message || "Đã có lỗi xảy ra");
            }
        } catch (err) {
            toast.error(err.message || "Lỗi kết nối");
        } finally {
            hideLoading();
        }
    };

    // Filtered lists
    const filteredServices = useMemo(() => {
        return listSeviceAPI.filter(item => {
            const matchKeyword = !keyword || 
                (item.maDichVu && item.maDichVu.toLowerCase().includes(keyword.toLowerCase())) || 
                (item.tenDichVu && item.tenDichVu.toLowerCase().includes(keyword.toLowerCase()));
            const matchLoai = filterLoaiDichVu === "all" || Number(item.loaiDichVu) === Number(filterLoaiDichVu);
            return matchKeyword && matchLoai;
        });
    }, [listSeviceAPI, keyword, filterLoaiDichVu]);

    // Thống kê dịch vụ theo từng loại dịch vụ
    const serviceCountByType = useMemo(() => {
        const map = {};
        listSeviceAPI.forEach(item => {
            const id = Number(item.loaiDichVu);
            map[id] = (map[id] || 0) + 1;
        });
        return map;
    }, [listSeviceAPI]);

    // Statistics Calculations
    const totalInventoryCount = listSeviceAPI.length;
    const totalServiceTypesCount = serviceTypes.length;
    const totalContractTypesCount = contractTypes.length;
    const totalShopsCount = donViList.length;
    const totalShopExpenseAmount = useMemo(() => {
        return donViList.reduce((sum, d) => sum + (Number(d.tongTienChi) || 0), 0);
    }, [donViList]);

    return (
        <div className="warehouse-page-container">
            {/* 1. HEADER TITLE */}
            <div className="warehouse-header">
                <div className="warehouse-title-wrap">
                    <div className="warehouse-badge-top">
                        <i className="fa-solid fa-boxes-stacked"></i> LONG WEDDING INVENTORY & SERVICE CATALOG
                    </div>
                    <h2>
                        <i className="fa-solid fa-warehouse" style={{ color: '#0284c7' }}></i> QUẢN LÝ KHO, DỊCH VỤ & SHOP MUA HÀNG
                    </h2>
                    <p className="warehouse-subtitle">
                        Quản lý kho trang phục váy cưới, vật tư in ấn, danh mục loại dịch vụ, loại hợp đồng và mạng lưới shop nhà cung cấp
                    </p>
                </div>

                <div className="warehouse-header-actions">
                    {activeTab === 0 && (
                        <Button
                            variant="contained"
                            className="btn-add-primary"
                            onClick={() => setOpenAddDialog(true)}
                            startIcon={<i className="fa-solid fa-plus"></i>}
                        >
                            Thêm Dịch Vụ Mới
                        </Button>
                    )}
                    {activeTab === 1 && (
                        <Button
                            variant="contained"
                            className="btn-add-primary"
                            onClick={() => {
                                setEditingServiceType(null);
                                setServiceTypeName("");
                                setServiceTypePrefix("");
                                setServiceTypeIcon("📦");
                                setServiceTypeColor("#2563eb");
                                setServiceTypeBadgeBg("#dbeafe");
                                setServiceTypeDesc("");
                                setOpenServiceTypeDialog(true);
                            }}
                            startIcon={<i className="fa-solid fa-plus"></i>}
                        >
                            Thêm Loại Dịch Vụ Mới
                        </Button>
                    )}
                    {activeTab === 2 && (
                        <Button
                            variant="contained"
                            className="btn-add-primary"
                            onClick={() => {
                                setEditingType(null);
                                setTypeName("");
                                setOpenTypeDialog(true);
                            }}
                            startIcon={<i className="fa-solid fa-plus"></i>}
                        >
                            Thêm Loại Hợp Đồng
                        </Button>
                    )}
                    {activeTab === 3 && (
                        <Button
                            variant="contained"
                            className="btn-add-primary"
                            onClick={() => {
                                setEditingDonVi(null);
                                setDonViName("");
                                setDonViPhone("");
                                setDonViAddress("");
                                setDonViNote("");
                                setOpenDonViDialog(true);
                            }}
                            startIcon={<i className="fa-solid fa-plus"></i>}
                        >
                            Thêm Shop Mới
                        </Button>
                    )}
                </div>
            </div>

            {/* 2. STATS OVERVIEW CARDS */}
            <div className="warehouse-stats-grid">
                <div className="warehouse-stat-card glass-panel">
                    <div className="stat-info">
                        <span className="stat-label">Sản phẩm / Dịch vụ kho</span>
                        <h3 style={{ color: '#2563eb' }}>{totalInventoryCount} <span className="stat-unit">mục</span></h3>
                        <span className="stat-sub">Váy, vest, gói chụp, in ảnh...</span>
                    </div>
                    <div className="stat-icon icon-blue">
                        <i className="fa-solid fa-vest-patches"></i>
                    </div>
                </div>

                <div className="warehouse-stat-card glass-panel">
                    <div className="stat-info">
                        <span className="stat-label">Danh mục loại dịch vụ</span>
                        <h3 style={{ color: '#0284c7' }}>{totalServiceTypesCount} <span className="stat-unit">loại</span></h3>
                        <span className="stat-sub">Phân loại & sinh mã viết tắt</span>
                    </div>
                    <div className="stat-icon icon-cyan">
                        <i className="fa-solid fa-layer-group"></i>
                    </div>
                </div>

                <div className="warehouse-stat-card glass-panel">
                    <div className="stat-info">
                        <span className="stat-label">Danh mục loại hợp đồng</span>
                        <h3 style={{ color: '#9333ea' }}>{totalContractTypesCount} <span className="stat-unit">loại</span></h3>
                        <span className="stat-sub">Pre-wedding, Tiệc cưới, Makeup...</span>
                    </div>
                    <div className="stat-icon icon-purple">
                        <i className="fa-solid fa-tags"></i>
                    </div>
                </div>

                <div className="warehouse-stat-card glass-panel">
                    <div className="stat-info">
                        <span className="stat-label">Shop & Nhà cung cấp</span>
                        <h3 style={{ color: '#059669' }}>{totalShopsCount} <span className="stat-unit">đối tác</span></h3>
                        <span className="stat-sub">Xưởng in, decor, hoa tươi...</span>
                    </div>
                    <div className="stat-icon icon-emerald">
                        <i className="fa-solid fa-shop"></i>
                    </div>
                </div>

                <div className="warehouse-stat-card glass-panel">
                    <div className="stat-info">
                        <span className="stat-label">Tổng chi phí mua sắm</span>
                        <h3 style={{ color: '#d97706' }}>{formatShortMoney(totalShopExpenseAmount)}</h3>
                        <span className="stat-sub">Chi trả vật tư & dịch vụ ngoài</span>
                    </div>
                    <div className="stat-icon icon-amber">
                        <i className="fa-solid fa-money-bill-transfer"></i>
                    </div>
                </div>
            </div>

            {/* 3. TABS NAVIGATION */}
            <div className="warehouse-tabs-nav glass-panel">
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    textColor="primary"
                    indicatorColor="primary"
                    variant={isMobile ? "scrollable" : "standard"}
                    sx={{
                        minHeight: '38px',
                        '& .MuiTabs-indicator': {
                            height: '3px',
                            borderRadius: '3px 3px 0 0',
                        }
                    }}
                >
                    <Tab 
                        icon={<i className="fa-solid fa-boxes-packing" style={{ marginRight: 6, color: '#0284c7', fontSize: '0.88rem' }}></i>}
                        iconPosition="start"
                        label="👗 Kho Sản Phẩm & Gói Dịch Vụ" 
                        sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.86rem', minHeight: '38px', py: 0.6, px: 1.8 }} 
                    />
                    <Tab 
                        icon={<i className="fa-solid fa-layer-group" style={{ marginRight: 6, color: '#0284c7', fontSize: '0.88rem' }}></i>}
                        iconPosition="start"
                        label="🏷️ Danh Mục Loại Dịch Vụ" 
                        sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.86rem', minHeight: '38px', py: 0.6, px: 1.8 }} 
                    />
                    <Tab 
                        icon={<i className="fa-solid fa-file-signature" style={{ marginRight: 6, color: '#9333ea', fontSize: '0.88rem' }}></i>}
                        iconPosition="start"
                        label="💎 Danh Mục Loại Hợp Đồng" 
                        sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.86rem', minHeight: '38px', py: 0.6, px: 1.8 }} 
                    />
                    <Tab 
                        icon={<i className="fa-solid fa-store" style={{ marginRight: 6, color: '#059669', fontSize: '0.88rem' }}></i>}
                        iconPosition="start"
                        label="🏪 Danh Sách Shop Mua Hàng" 
                        sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.86rem', minHeight: '38px', py: 0.6, px: 1.8 }} 
                    />
                </Tabs>
            </div>

            {/* TAB 0: SAN PHAM / DICH VU KHO */}
            {activeTab === 0 && (
                <>
                    <div className="warehouse-toolbar glass-panel">
                        <div className="toolbar-left">
                            <TextField 
                                size="small"
                                placeholder="Tìm kiếm theo mã hoặc tên dịch vụ..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="search-input"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <i className="fa-solid fa-magnifying-glass" style={{ color: '#94a3b8' }}></i>
                                        </InputAdornment>
                                    ),
                                    endAdornment: keyword && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setKeyword('')}>
                                                <i className="fa-solid fa-xmark" style={{ fontSize: '0.85rem' }}></i>
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <FormControl size="small" sx={{ minWidth: 170 }}>
                                <InputLabel>Phân loại dịch vụ</InputLabel>
                                <Select
                                    value={filterLoaiDichVu}
                                    label="Phân loại dịch vụ"
                                    onChange={(e) => setFilterLoaiDichVu(e.target.value)}
                                >
                                    <MenuItem value="all">Tất cả dịch vụ</MenuItem>
                                    {serviceTypes.map((t) => (
                                        <MenuItem key={t.id} value={t.id}>
                                            <span style={{ marginRight: 6 }}>{t.icon || '📦'}</span> {t.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>

                        <div className="toolbar-right">
                            <Button
                                variant="outlined"
                                className="btn-toolbar-outline"
                                onClick={() => setOpenImportExcelDialog(true)}
                                startIcon={<FileUploadOutlinedIcon />}
                            >
                                Nhập Excel
                            </Button>

                            <Button
                                variant="outlined"
                                className="btn-toolbar-outline"
                                onClick={() => exportServicesToExcel(filteredServices)}
                                startIcon={<FileDownloadOutlinedIcon />}
                            >
                                Xuất Excel ({filteredServices.length})
                            </Button>
                        </div>
                    </div>

                    <Paper elevation={0} className="warehouse-table-container glass-panel">
                        <TableContainer className="warehouse-table-scroll" sx={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', overflowX: 'auto' }}>
                            <Table stickyHeader size="small">
                                <TableHead sx={{ '& th': { bgcolor: '#f8fafc', color: '#334155', fontWeight: 800, py: 1.2, borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' } }}>
                                    <TableRow>
                                        <TableCell align="center" style={{ width: '50px' }}>STT</TableCell>
                                        <TableCell style={{ width: '150px' }}>MÃ DỊCH VỤ</TableCell>
                                        <TableCell style={{ width: '280px' }}>TÊN DỊCH VỤ / SẢN PHẨM</TableCell>
                                        <TableCell style={{ width: '160px' }}>PHÂN LOẠI</TableCell>
                                        <TableCell align="right" style={{ width: '130px' }}>GIÁ BÁN / GÓI</TableCell>
                                        <TableCell align="right" style={{ width: '130px' }}>GIÁ THUÊ</TableCell>
                                        <TableCell align="center" style={{ width: '100px' }}>TỒN KHO</TableCell>
                                        <TableCell style={{ minWidth: '200px' }}>MÔ TẢ GHI CHÚ</TableCell>
                                        <TableCell align="center" style={{ width: '110px' }}>HÀNH ĐỘNG</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredServices.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center" style={{ padding: '40px 0', color: '#94a3b8' }}>
                                                <i className="fa-solid fa-box-open" style={{ fontSize: '2.5rem', marginBottom: 12, display: 'block', color: '#cbd5e1' }}></i>
                                                Chưa tìm thấy dịch vụ nào phù hợp với bộ lọc!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredServices.map((data, index) => {
                                            const stock = Number(data.tonKhoDichVu) || 0;
                                            const typeInfo = getLoaiDichVuInfo(data.loaiDichVu);

                                            return (
                                                <TableRow 
                                                    key={data.maDichVu || index}
                                                    className="warehouse-table-row"
                                                    selected={selectedService?.maDichVu === data.maDichVu}
                                                    onClick={() => {
                                                        setSelectedService(data);
                                                        setIsEditMode(false);
                                                    }}
                                                >
                                                    <TableCell align="center" style={{ fontWeight: 600, color: '#64748b' }}>
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell style={{ fontWeight: 800, color: '#0284c7' }}>
                                                        {data.maDichVu}
                                                    </TableCell>
                                                    <TableCell style={{ fontWeight: 700, color: '#0f172a' }}>
                                                        {data.tenDichVu}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span 
                                                            className="service-type-chip"
                                                            style={{
                                                                backgroundColor: typeInfo.badgeBg || '#dbeafe',
                                                                color: typeInfo.color || '#2563eb',
                                                                borderColor: (typeInfo.color || '#2563eb') + '40',
                                                                fontWeight: 700
                                                            }}
                                                        >
                                                            <span style={{ marginRight: 4 }}>{typeInfo.icon || '📦'}</span>
                                                            {typeInfo.name}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell align="right" style={{ fontWeight: 700, color: '#dc2626' }}>
                                                        {data.giaTriDichVu ? formatCurrency(data.giaTriDichVu) : '0 đ'}
                                                    </TableCell>
                                                    <TableCell align="right" style={{ fontWeight: 700, color: '#16a34a' }}>
                                                        {data.giaChoThueDichVu ? formatCurrency(data.giaChoThueDichVu) : '0 đ'}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <span className={`badge-stock ${stock > 5 ? 'stock-in' : stock > 0 ? 'stock-low' : 'stock-empty'}`}>
                                                            {stock > 0 ? `Còn ${stock}` : 'Hết hàng'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell style={{ color: '#64748b', fontSize: '0.82rem' }}>
                                                        {data.moTaDichVu || '-'}
                                                    </TableCell>
                                                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                                        <Stack direction="row" spacing={0.8} justifyContent="center">
                                                            <IconButton 
                                                                size="small" 
                                                                className="btn-action-edit-type"
                                                                onClick={() => {
                                                                    setSelectedService(data);
                                                                    setIsEditMode(true);
                                                                }}
                                                                title="Chỉnh sửa sản phẩm / dịch vụ"
                                                            >
                                                                <i className="fa-solid fa-pen"></i>
                                                            </IconButton>
                                                            <IconButton 
                                                                size="small" 
                                                                className="btn-action-del-shop"
                                                                onClick={() => handleDeleteService(data)}
                                                                title="Xóa dịch vụ này"
                                                            >
                                                                <i className="fa-solid fa-trash"></i>
                                                            </IconButton>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </>
            )}

            {/* TAB 1: QUAN LY LOAI DICH VU */}
            {activeTab === 1 && (
                <>
                    <div className="warehouse-toolbar glass-panel">
                        <div className="toolbar-left">
                            <TextField 
                                size="small"
                                placeholder="Tìm kiếm loại dịch vụ theo tên, mã viết tắt, mô tả..."
                                value={serviceTypeKeyword}
                                onChange={(e) => setServiceTypeKeyword(e.target.value)}
                                className="search-input"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <i className="fa-solid fa-magnifying-glass" style={{ color: '#94a3b8' }}></i>
                                        </InputAdornment>
                                    ),
                                    endAdornment: serviceTypeKeyword && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setServiceTypeKeyword('')}>
                                                <i className="fa-solid fa-xmark" style={{ fontSize: '0.85rem' }}></i>
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </div>
                    </div>

                    <Paper elevation={0} className="warehouse-table-container glass-panel">
                        <TableContainer className="warehouse-table-scroll" sx={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', overflowX: 'auto' }}>
                            <Table stickyHeader size="small">
                                <TableHead sx={{ '& th': { bgcolor: '#f8fafc', color: '#334155', fontWeight: 800, py: 1.2, borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' } }}>
                                    <TableRow>
                                        <TableCell align="center" style={{ width: '60px' }}>STT</TableCell>
                                        <TableCell style={{ width: '90px' }}>MÃ ID</TableCell>
                                        <TableCell style={{ width: '220px' }}>TÊN LOẠI DỊCH VỤ</TableCell>
                                        <TableCell style={{ width: '160px' }}>TIỀN TỐ MÃ (TỰ SINH)</TableCell>
                                        <TableCell align="center" style={{ width: '140px' }}>SẢN PHẨM TRONG KHO</TableCell>
                                        <TableCell style={{ minWidth: '240px' }}>MÔ TẢ DANH MỤC</TableCell>
                                        <TableCell align="center" style={{ width: '130px' }}>HÀNH ĐỘNG</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {serviceTypes
                                        .filter(item => 
                                            !serviceTypeKeyword || 
                                            item.name.toLowerCase().includes(serviceTypeKeyword.toLowerCase()) ||
                                            (item.prefix && item.prefix.toLowerCase().includes(serviceTypeKeyword.toLowerCase())) ||
                                            (item.description && item.description.toLowerCase().includes(serviceTypeKeyword.toLowerCase())) ||
                                            String(item.id).includes(serviceTypeKeyword)
                                        )
                                        .map((data, index) => {
                                            const countInKho = serviceCountByType[data.id] || data.serviceCount || 0;
                                            return (
                                                <TableRow key={data.id} className="warehouse-table-row">
                                                    <TableCell align="center" style={{ fontWeight: 600, color: '#64748b' }}>
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={`ID: ${data.id}`} size="small" sx={{ fontWeight: 800, bgcolor: '#f1f5f9', color: '#475569' }} />
                                                    </TableCell>
                                                    <TableCell style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                                                        <span 
                                                            style={{ 
                                                                display: 'inline-flex', 
                                                                alignItems: 'center', 
                                                                gap: 8,
                                                                padding: '4px 10px',
                                                                borderRadius: '8px',
                                                                backgroundColor: data.badgeBg || '#dbeafe',
                                                                color: data.color || '#2563eb'
                                                            }}
                                                        >
                                                            <span style={{ fontSize: '1.1rem' }}>{data.icon || '📦'}</span>
                                                            <span>{data.name}</span>
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={data.prefix || 'Không có'} 
                                                            size="small" 
                                                            sx={{ 
                                                                fontWeight: 800, 
                                                                bgcolor: '#ecfdf5', 
                                                                color: '#059669',
                                                                border: '1px solid #a7f3d0'
                                                            }} 
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip 
                                                            label={`${countInKho} dịch vụ`} 
                                                            size="small" 
                                                            sx={{ 
                                                                fontWeight: 800, 
                                                                bgcolor: countInKho > 0 ? '#e0f2fe' : '#f1f5f9', 
                                                                color: countInKho > 0 ? '#0284c7' : '#94a3b8' 
                                                            }} 
                                                        />
                                                    </TableCell>
                                                    <TableCell style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                                        {data.description || '-'}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Stack direction="row" spacing={1} justifyContent="center">
                                                            <IconButton 
                                                                size="small" 
                                                                className="btn-action-edit-type"
                                                                onClick={() => {
                                                                    setEditingServiceType(data);
                                                                    setServiceTypeName(data.name || "");
                                                                    setServiceTypePrefix(data.prefix || "");
                                                                    setServiceTypeIcon(data.icon || "📦");
                                                                    setServiceTypeColor(data.color || "#2563eb");
                                                                    setServiceTypeBadgeBg(data.badgeBg || "#dbeafe");
                                                                    setServiceTypeDesc(data.description || "");
                                                                    setOpenServiceTypeDialog(true);
                                                                }}
                                                                title="Sửa loại dịch vụ"
                                                            >
                                                                <i className="fa-solid fa-pen"></i>
                                                            </IconButton>
                                                            <IconButton 
                                                                size="small" 
                                                                className="btn-action-del-shop"
                                                                onClick={() => handleDeleteServiceType(data)}
                                                                title="Xóa loại dịch vụ"
                                                            >
                                                                <i className="fa-solid fa-trash"></i>
                                                            </IconButton>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </>
            )}

            {/* TAB 2: QUAN LY LOAI HOP DONG */}
            {activeTab === 2 && (
                <>
                    <div className="warehouse-toolbar glass-panel">
                        <div className="toolbar-left">
                            <TextField 
                                size="small"
                                placeholder="Tìm kiếm loại hợp đồng..."
                                value={contractTypeKeyword}
                                onChange={(e) => setContractTypeKeyword(e.target.value)}
                                className="search-input"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <i className="fa-solid fa-magnifying-glass" style={{ color: '#94a3b8' }}></i>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </div>
                    </div>

                    <Paper elevation={0} className="warehouse-table-container glass-panel">
                        <TableContainer className="warehouse-table-scroll" sx={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', overflowX: 'auto' }}>
                            <Table stickyHeader size="small">
                                <TableHead sx={{ '& th': { bgcolor: '#f8fafc', color: '#334155', fontWeight: 800, py: 1.2, borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' } }}>
                                    <TableRow>
                                        <TableCell align="center" style={{ width: '60px' }}>STT</TableCell>
                                        <TableCell style={{ width: '120px' }}>MÃ ID</TableCell>
                                        <TableCell style={{ width: '500px' }}>TÊN LOẠI HỢP ĐỒNG / GÓI DỊCH VỤ</TableCell>
                                        <TableCell align="center" style={{ width: '150px' }}>HÀNH ĐỘNG</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {contractTypes
                                        .filter(item => 
                                             !contractTypeKeyword || 
                                            item.name.toLowerCase().includes(contractTypeKeyword.toLowerCase()) ||
                                            String(item.id).includes(contractTypeKeyword)
                                        )
                                        .map((data, index) => (
                                            <TableRow key={data.id} className="warehouse-table-row">
                                                <TableCell align="center" style={{ fontWeight: 600, color: '#64748b' }}>
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={`ID: ${data.id}`} size="small" sx={{ fontWeight: 800, bgcolor: '#f1f5f9', color: '#475569' }} />
                                                </TableCell>
                                                <TableCell style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                                                    💎 {data.name}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Stack direction="row" spacing={1} justifyContent="center">
                                                        <IconButton 
                                                            size="small" 
                                                            className="btn-action-edit-shop"
                                                            onClick={() => {
                                                                setEditingType(data);
                                                                setTypeName(data.name);
                                                                setOpenTypeDialog(true);
                                                            }}
                                                            title="Sửa tên loại HĐ"
                                                        >
                                                            <i className="fa-solid fa-pen"></i>
                                                        </IconButton>
                                                        <IconButton 
                                                            size="small" 
                                                            className="btn-action-del-shop"
                                                            onClick={() => handleDeleteType(data)}
                                                            title="Xóa loại HĐ"
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </IconButton>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </>
            )}

            {/* TAB 3: SHOP MUA HANG */}
            {activeTab === 3 && (
                <>
                    <div className="warehouse-toolbar glass-panel">
                        <div className="toolbar-left">
                            <TextField 
                                size="small"
                                placeholder="Tìm kiếm shop theo tên, SĐT, địa chỉ..."
                                value={donViKeyword}
                                onChange={(e) => setDonViKeyword(e.target.value)}
                                className="search-input"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <i className="fa-solid fa-magnifying-glass" style={{ color: '#94a3b8' }}></i>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </div>
                    </div>

                    <Paper elevation={0} className="warehouse-table-container glass-panel">
                        <TableContainer className="warehouse-table-scroll" sx={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', overflowX: 'auto' }}>
                            <Table stickyHeader size="small">
                                <TableHead sx={{ '& th': { bgcolor: '#f8fafc', color: '#334155', fontWeight: 800, py: 1.2, borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' } }}>
                                    <TableRow>
                                        <TableCell align="center" style={{ width: '50px' }}>STT</TableCell>
                                        <TableCell style={{ width: '220px' }}>TÊN SHOP MUA HÀNG</TableCell>
                                        <TableCell style={{ width: '140px' }}>SỐ ĐIỆN THOẠI</TableCell>
                                        <TableCell style={{ width: '250px' }}>ĐỊA CHỈ & GHI CHÚ</TableCell>
                                        <TableCell align="center" style={{ width: '120px' }}>LƯỢT CHI</TableCell>
                                        <TableCell align="right" style={{ width: '160px' }}>TỔNG TIỀN ĐÃ CHI</TableCell>
                                        <TableCell align="center" style={{ width: '130px' }}>HÀNH ĐỘNG</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {donViList
                                        .filter(item => 
                                            !donViKeyword ||
                                            (item.name && item.name.toLowerCase().includes(donViKeyword.toLowerCase())) ||
                                            (item.phone && item.phone.toLowerCase().includes(donViKeyword.toLowerCase())) ||
                                            (item.address && item.address.toLowerCase().includes(donViKeyword.toLowerCase())) ||
                                            (item.note && item.note.toLowerCase().includes(donViKeyword.toLowerCase()))
                                        )
                                        .map((data, index) => (
                                            <TableRow key={data.id || data._id || index} className="warehouse-table-row">
                                                <TableCell align="center" style={{ fontWeight: 600, color: '#64748b' }}>
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell style={{ fontWeight: 800, color: '#0f172a' }}>
                                                    🏪 {data.name}
                                                </TableCell>
                                                <TableCell style={{ color: '#475569', fontWeight: 600 }}>
                                                    {data.phone ? (
                                                        <span><i className="fa-solid fa-phone" style={{ marginRight: 4, color: '#0284c7' }}></i>{data.phone}</span>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell style={{ color: '#64748b', fontSize: '0.82rem' }}>
                                                    {data.address && <div><i className="fa-solid fa-location-dot" style={{ marginRight: 4, color: '#dc2626' }}></i>{data.address}</div>}
                                                    {data.note && <div style={{ fontStyle: 'italic', color: '#94a3b8' }}>{data.note}</div>}
                                                    {!data.address && !data.note && '-'}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip 
                                                        label={`${data.soLanChi || 0} lần`} 
                                                        size="small" 
                                                        sx={{ fontWeight: 800, bgcolor: '#e0f2fe', color: '#0369a1' }} 
                                                    />
                                                </TableCell>
                                                <TableCell align="right" style={{ fontWeight: 800, color: '#dc2626' }}>
                                                    {(Number(data.tongTienChi) || 0).toLocaleString('vi-VN')} đ
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Stack direction="row" spacing={1} justifyContent="center">
                                                        <IconButton 
                                                            size="small" 
                                                            className="btn-action-edit-shop"
                                                            onClick={() => {
                                                                setEditingDonVi(data);
                                                                setDonViName(data.name || "");
                                                                setDonViPhone(data.phone || "");
                                                                setDonViAddress(data.address || "");
                                                                setDonViNote(data.note || "");
                                                                setOpenDonViDialog(true);
                                                            }}
                                                            title="Sửa shop mua hàng"
                                                        >
                                                            <i className="fa-solid fa-pen"></i>
                                                        </IconButton>
                                                        <IconButton 
                                                            size="small" 
                                                            className="btn-action-del-shop"
                                                            onClick={() => handleDeleteDonVi(data)}
                                                            title="Xóa shop mua hàng"
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </IconButton>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </>
            )}

            {/* MODALS & DIALOGS */}
            <ServiceAddDialog
                open={openAddDialog}
                existingServices={listSeviceAPI}
                onClose={(shouldReload) => {
                    setOpenAddDialog(false);
                    if (shouldReload) onSaveSuccess();
                }}
            />

            <ServiceExcelImportDialog
                open={openImportExcelDialog}
                onClose={() => setOpenImportExcelDialog(false)}
                onSuccess={onSaveSuccess}
                existingServices={listSeviceAPI}
            />

            <ServiceDetailDialog
                open={!!selectedService}
                initialEdit={isEditMode}
                onClose={(shouldReload) => {
                    setSelectedService(null);
                    setIsEditMode(false);
                    if (shouldReload) onSaveSuccess();
                }}
                data={selectedService}
            />

            {/* DIALOG THÊM / SỬA LOẠI DỊCH VỤ */}
            <Dialog 
                open={openServiceTypeDialog} 
                onClose={() => setOpenServiceTypeDialog(false)} 
                fullWidth 
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <form onSubmit={handleSaveServiceType}>
                    <DialogTitle sx={{ bgcolor: '#0284c7', color: '#fff', fontWeight: 800, py: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="fa-solid fa-layer-group"></i>
                        {editingServiceType ? "CẬP NHẬT LOẠI DỊCH VỤ" : "THÊM LOẠI DỊCH VỤ MỚI"}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3 }}>
                        <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
                            <TextField
                                label="Tên loại dịch vụ"
                                variant="outlined"
                                fullWidth
                                value={serviceTypeName}
                                onChange={(e) => setServiceTypeName(e.target.value)}
                                required
                                autoFocus
                                placeholder="Ví dụ: Hoa Cưới & Xe Hoa, Phụ Kiện Cưới..."
                                helperText="Tên loại dịch vụ dùng để phân nhóm và quản lý sản phẩm trong kho."
                            />

                            <TextField
                                label="Tiền tố mã dịch vụ (Prefix tự sinh)"
                                variant="outlined"
                                fullWidth
                                value={serviceTypePrefix}
                                onChange={(e) => setServiceTypePrefix(e.target.value.toUpperCase())}
                                placeholder="Ví dụ: HOA_, XE_, PHUKIEN_..."
                                helperText="Tiền tố này sẽ được gắn đầu mã khi tự động sinh mã dịch vụ theo tên viết tắt (bỏ trống hệ thống sẽ tự sinh)."
                            />

                            {/* Chọn Emoji Icon */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>
                                    Biểu tượng đại diện (Icon / Emoji):
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <TextField
                                        size="small"
                                        value={serviceTypeIcon}
                                        onChange={(e) => setServiceTypeIcon(e.target.value)}
                                        sx={{ width: 80, textAlign: 'center' }}
                                        inputProps={{ style: { fontSize: '1.2rem', textAlign: 'center' } }}
                                    />
                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                        Hoặc chọn nhanh biểu tượng bên dưới:
                                    </Typography>
                                </Box>
                                <Box display="flex" flexWrap="wrap" gap={1}>
                                    {PRESET_EMOJIS.map(em => (
                                        <button
                                            key={em}
                                            type="button"
                                            className={`service-type-emoji-btn ${serviceTypeIcon === em ? 'active' : ''}`}
                                            onClick={() => setServiceTypeIcon(em)}
                                        >
                                            {em}
                                        </button>
                                    ))}
                                </Box>
                            </Box>

                            {/* Chọn Màu Sắc Chủ Đạo */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>
                                    Màu sắc huy hiệu (Badge color):
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={1.2} alignItems="center">
                                    {PRESET_COLORS.map(pc => (
                                        <Tooltip key={pc.color} title={pc.name}>
                                            <div
                                                className={`service-type-color-dot ${serviceTypeColor === pc.color ? 'active' : ''}`}
                                                style={{ backgroundColor: pc.color }}
                                                onClick={() => {
                                                    setServiceTypeColor(pc.color);
                                                    setServiceTypeBadgeBg(pc.badgeBg);
                                                }}
                                            />
                                        </Tooltip>
                                    ))}
                                </Box>
                            </Box>

                            <TextField
                                label="Mô tả danh mục"
                                variant="outlined"
                                multiline
                                rows={2}
                                fullWidth
                                value={serviceTypeDesc}
                                onChange={(e) => setServiceTypeDesc(e.target.value)}
                                placeholder="Ghi chú chi tiết về các sản phẩm/dịch vụ thuộc phân loại này..."
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                        <Button onClick={() => setOpenServiceTypeDialog(false)} color="inherit" sx={{ fontWeight: 600 }}>Hủy</Button>
                        <Button type="submit" variant="contained" sx={{ fontWeight: 700, borderRadius: 2, bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' } }}>
                            {editingServiceType ? "Cập Nhật Loại Dịch Vụ" : "Lưu Loại Dịch Vụ"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Type Add/Edit Dialog (Loại hợp đồng) */}
            <Dialog 
                open={openTypeDialog} 
                onClose={() => setOpenTypeDialog(false)} 
                fullWidth 
                maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <form onSubmit={handleSaveType}>
                    <DialogTitle sx={{ bgcolor: '#0f172a', color: '#fff', fontWeight: 800, py: 2 }}>
                        {editingType ? "CẬP NHẬT LOẠI HỢP ĐỒNG" : "THÊM LOẠI HỢP ĐỒNG MỚI"}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3 }}>
                        <Box mt={2}>
                            <TextField
                                label="Tên loại hợp đồng / gói dịch vụ"
                                variant="outlined"
                                fullWidth
                                value={typeName}
                                onChange={(e) => setTypeName(e.target.value)}
                                required
                                autoFocus
                                placeholder="Ví dụ: Pre-Wedding, Phóng Sự Cưới..."
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                        <Button onClick={() => setOpenTypeDialog(false)} color="inherit" sx={{ fontWeight: 600 }}>Hủy</Button>
                        <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 700, borderRadius: 2 }}>Lưu</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Shop Mua Hang Add/Edit Dialog */}
            <Dialog 
                open={openDonViDialog} 
                onClose={() => setOpenDonViDialog(false)} 
                fullWidth 
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <form onSubmit={handleSaveDonVi}>
                    <DialogTitle sx={{ bgcolor: '#0f172a', color: '#fff', fontWeight: 800, py: 2 }}>
                        {editingDonVi ? "CẬP NHẬT SHOP MUA HÀNG" : "THÊM SHOP MUA HÀNG MỚI"}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3 }}>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            <TextField
                                label="Tên shop / Đơn vị bán hàng"
                                variant="outlined"
                                fullWidth
                                value={donViName}
                                onChange={(e) => setDonViName(e.target.value)}
                                required
                                autoFocus
                                placeholder="Ví dụ: Hoàng Gia Lab, Xưởng in ABC, Shopee, Tiệm hoa..."
                                helperText="Tên shop sẽ được tự động hiển thị gợi ý khi nhập phiếu chi tiêu."
                            />
                            <TextField
                                label="Số điện thoại"
                                variant="outlined"
                                fullWidth
                                value={donViPhone}
                                onChange={(e) => setDonViPhone(e.target.value)}
                                placeholder="09xxxxxxxx..."
                            />
                            <TextField
                                label="Địa chỉ"
                                variant="outlined"
                                fullWidth
                                value={donViAddress}
                                onChange={(e) => setDonViAddress(e.target.value)}
                                placeholder="Địa chỉ shop / xưởng / cơ sở..."
                            />
                            <TextField
                                label="Ghi chú"
                                variant="outlined"
                                multiline
                                rows={2}
                                fullWidth
                                value={donViNote}
                                onChange={(e) => setDonViNote(e.target.value)}
                                placeholder="Thông tin số tài khoản, link Facebook, lưu ý khác..."
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                        <Button onClick={() => setOpenDonViDialog(false)} color="inherit" sx={{ fontWeight: 600 }}>Hủy</Button>
                        <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 700, borderRadius: 2 }}>Lưu Shop</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
};

export default QuanLyKho;
