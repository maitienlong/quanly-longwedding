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

const QuanLyKho = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { showLoading, hideLoading } = useLoading();
    
    // TAB STATE (0: Kho / Dịch vụ, 1: Loại hợp đồng, 2: Shop mua hàng)
    const [activeTab, setActiveTab] = useState(0);

    // KHO / DICH VU STATE
    const [listSeviceAPI, setListSeviceAPI] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [filterLoaiDichVu, setFilterLoaiDichVu] = useState("all");
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openImportExcelDialog, setOpenImportExcelDialog] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    // SHOP MUA HANG STATE
    const [donViList, setDonViList] = useState([]);
    const [donViKeyword, setDonViKeyword] = useState("");
    const [openDonViDialog, setOpenDonViDialog] = useState(false);
    const [editingDonVi, setEditingDonVi] = useState(null);
    const [donViName, setDonViName] = useState("");
    const [donViPhone, setDonViPhone] = useState("");
    const [donViAddress, setDonViAddress] = useState("");
    const [donViNote, setDonViNote] = useState("");

    // CONTRACT TYPE STATE
    const { contractTypes } = useContractTypes();
    const [contractTypeKeyword, setContractTypeKeyword] = useState("");
    const [openTypeDialog, setOpenTypeDialog] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [typeName, setTypeName] = useState("");

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

    const getLoaiDichVuLabel = (type) => {
        const num = Number(type);
        if (num === 1) return "Trang Phục";
        if (num === 2) return "Gói Dịch Vụ";
        if (num === 3) return "Ảnh";
        if (num === 4) return "Trang Điểm";
        return "Khác";
    };

    const getLoaiDichVuChipClass = (type) => {
        const num = Number(type);
        if (num === 1) return "service-type-chip type-dress";
        if (num === 2) return "service-type-chip type-package";
        if (num === 3) return "service-type-chip type-photo";
        if (num === 4) return "service-type-chip type-makeup";
        return "service-type-chip type-other";
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        if (newValue === 2) {
            loadDonViList();
        } else if (newValue === 0) {
            otherService.findDichVu({})
                .then(res => res.status === 'success' && setListSeviceAPI(res.data.dichVu))
                .catch(err => console.error(err));
        }
    };

    const onSaveSuccess = () => {
        setOpenAddDialog(false);
        setSelectedService(null);
        showLoading("Đang tải dữ liệu...");
        otherService.findDichVu({})
            .then(res => res.status === 'success' && setListSeviceAPI(res.data.dichVu))
            .finally(() => hideLoading());
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                // Tải lại cache
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

    // Statistics Calculations
    const totalInventoryCount = listSeviceAPI.length;
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
                        Quản lý kho trang phục váy cưới, vật tư in ấn, danh mục loại hợp đồng và mạng lưới shop nhà cung cấp
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
                                setEditingType(null);
                                setTypeName("");
                                setOpenTypeDialog(true);
                            }}
                            startIcon={<i className="fa-solid fa-plus"></i>}
                        >
                            Thêm Loại Hợp Đồng
                        </Button>
                    )}
                    {activeTab === 2 && (
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
                                    <MenuItem value={1}>👗 Trang Phục</MenuItem>
                                    <MenuItem value={2}>📸 Gói Dịch Vụ</MenuItem>
                                    <MenuItem value={3}>🖼️ Ảnh</MenuItem>
                                    <MenuItem value={4}>💄 Trang Điểm</MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        <div className="toolbar-right">
                            <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                startIcon={<FileDownloadOutlinedIcon />}
                                onClick={() => exportServicesToExcel(filteredServices)}
                                sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2, height: 36 }}
                            >
                                Xuất Excel
                            </Button>

                            <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                startIcon={<FileUploadOutlinedIcon />}
                                onClick={() => setOpenImportExcelDialog(true)}
                                sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2, height: 36 }}
                            >
                                Nhập Excel
                            </Button>
                        </div>
                    </div>

                    <Paper elevation={0} className="warehouse-table-container glass-panel">
                        <TableContainer className="warehouse-table-scroll" sx={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', overflowX: 'auto' }}>
                            <Table stickyHeader size="small">
                                <TableHead sx={{ '& th': { bgcolor: '#f8fafc', color: '#334155', fontWeight: 800, py: 1.2, borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' } }}>
                                    <TableRow>
                                        <TableCell align="center" style={{ width: '50px' }}>STT</TableCell>
                                        <TableCell style={{ width: '130px' }}>MÃ DỊCH VỤ</TableCell>
                                        <TableCell style={{ width: '220px' }}>TÊN DỊCH VỤ / SẢN PHẨM</TableCell>
                                        <TableCell style={{ width: '150px' }}>LOẠI DỊCH VỤ</TableCell>
                                        <TableCell align="right" style={{ width: '140px' }}>GIÁ THÀNH</TableCell>
                                        <TableCell align="right" style={{ width: '140px' }}>GIÁ THUÊ</TableCell>
                                        <TableCell align="center" style={{ width: '120px' }}>TỒN KHO</TableCell>
                                        <TableCell style={{ width: '220px' }}>MÔ TẢ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredServices.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                                                <i className="fa-solid fa-box-open" style={{ fontSize: '2.5rem', marginBottom: 10, display: 'block', color: '#cbd5e1' }}></i>
                                                Không tìm thấy sản phẩm / dịch vụ nào phù hợp.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredServices.map((data, index) => {
                                            const stock = Number(data.tonKhoDichVu) || 0;
                                            return (
                                                <TableRow 
                                                    key={data.maDichVu || index}
                                                    className="warehouse-table-row"
                                                    selected={selectedService?.maDichVu === data.maDichVu}
                                                    onClick={() => setSelectedService(data)}
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
                                                        <span className={getLoaiDichVuChipClass(data.loaiDichVu)}>
                                                            {getLoaiDichVuLabel(data.loaiDichVu)}
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

            {/* TAB 1: QUAN LY LOAI HOP DONG */}
            {activeTab === 1 && (
                <>
                    <div className="warehouse-toolbar glass-panel">
                        <div className="toolbar-left">
                            <TextField 
                                size="small"
                                placeholder="Tìm kiếm loại hợp đồng theo tên hoặc ID..."
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

            {/* TAB 2: SHOP MUA HANG */}
            {activeTab === 2 && (
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
                                                            title="Sửa thông tin shop"
                                                        >
                                                            <i className="fa-solid fa-pen"></i>
                                                        </IconButton>
                                                        <IconButton 
                                                            size="small" 
                                                            className="btn-action-del-shop"
                                                            onClick={() => handleDeleteDonVi(data)}
                                                            title="Xóa shop"
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

            {/* Modal Components */}
            <ServiceAddDialog
                open={openAddDialog}
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
                onClose={(shouldReload) => {
                    setSelectedService(null);
                    if (shouldReload) onSaveSuccess();
                }}
                data={selectedService}
            />

            {/* Type Add/Edit Dialog */}
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
