import React, { useState, useEffect, useMemo } from 'react';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { toast } from 'sonner';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import './quanlychitieu.css';

// Material UI components
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Autocomplete,
    Box,
    Stack,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Grid,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    InputAdornment,
    useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../Login/AuthContext/AuthContext';

// Helper Number Formatters
const formatMoney = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('vi-VN') + ' đ';
};

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

const formatInputNumber = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const numStr = String(val).replace(/\D/g, '');
    if (!numStr) return '';
    return Number(numStr).toLocaleString('vi-VN');
};

const parseInputNumber = (str) => {
    if (!str) return 0;
    const clean = String(str).replace(/\D/g, '');
    return clean ? Number(clean) : 0;
};

// Vietnamese Number To Words
const docSoTiengViet = (so) => {
    if (!so || Number(so) === 0) return "Không đồng";
    
    const docBlock = (number, daydu) => {
        const chuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
        let tram = Math.floor(number / 100);
        let chuc = Math.floor((number % 100) / 10);
        let donvi = number % 10;
        let result = "";
        
        if (tram > 0 || daydu) {
            result += chuSo[tram] + " trăm ";
        }
        
        if (chuc === 0 && donvi === 0) return result;
        
        if (chuc === 0) {
            result += "lẻ " + chuSo[donvi] + " ";
        } else if (chuc === 1) {
            result += "mười ";
            if (donvi === 1) result += "một ";
            else if (donvi === 5) result += "lăm ";
            else if (donvi > 0) result += chuSo[donvi] + " ";
        } else {
            result += chuSo[chuc] + " mươi ";
            if (donvi === 1) result += "mốt ";
            else if (donvi === 5) result += "lăm ";
            else if (donvi > 0) result += chuSo[donvi] + " ";
        }
        return result;
    };

    const dvBlock = ["", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ"];
    let str = "";
    let number = Math.abs(Number(so));
    let blocks = [];
    
    while (number > 0) {
        blocks.push(number % 1000);
        number = Math.floor(number / 1000);
    }
    
    for (let i = blocks.length - 1; i >= 0; i--) {
        const dec = blocks[i];
        const daydu = (i < blocks.length - 1);
        const blockStr = docBlock(dec, daydu);
        if (blockStr) {
            str += blockStr + dvBlock[i];
        }
    }
    
    str = str.trim();
    if (str) {
        str = str.charAt(0).toUpperCase() + str.slice(1);
    }
    return str + " đồng";
};

function QuanLyChiTieu() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { showLoading, hideLoading } = useLoading();
    const { user } = useAuth();
    const loggedInUserFullname = user?.fullname || '';
    
    const [hopDongs, setHopDongs] = useState([]);
    const [expensesList, setExpensesList] = useState([]);
    const [donViList, setDonViList] = useState([]);
    
    // Filters & Search
    const [searchInput, setSearchInput] = useState('');
    const [timeFilter, setTimeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'general' | 'contract'

    // Dialog state
    const [openAddDialog, setOpenAddDialog] = useState(false);

    // Form inputs state
    const [selectedHD, setSelectedHD] = useState(null); // Linked contract
    const [ngayChi, setNgayChi] = useState(dayjs().format('YYYY-MM-DDTHH:mm'));
    const [donViNhan, setDonViNhan] = useState('');
    const [lyDoChi, setLyDoChi] = useState('');
    const [soTien, setSoTien] = useState('');
    const [nguoiChi, setNguoiChi] = useState('');
    const [ghiChu, setGhiChu] = useState('');

    useEffect(() => {
        if (user?.fullname) {
            setNguoiChi(user.fullname);
        }
    }, [user]);

    // Load data from contracts API, chiTieu API, and donViNhanTien API
    const loadData = () => {
        showLoading("Đang tải dữ liệu chi tiêu...");
        Promise.allSettled([
            otherService.LIST_HOPDONG({}),
            otherService.LIST_CHITIEU({}),
            otherService.findAllDonViNhanTien({})
        ])
        .then(([resHD, resCT, resDV]) => {
            const listHD = (resHD.status === 'fulfilled' && resHD.value?.data?.hopDong) ? resHD.value.data.hopDong : [];
            setHopDongs(listHD);

            const listCT = (resCT.status === 'fulfilled' && resCT.value?.data?.chiTieu) ? resCT.value.data.chiTieu : [];
            const mapped = listCT.map(exp => {
                const hd = listHD.find(h => h.maHopDong === exp.maHopDong);
                return {
                    ...exp,
                    khachHangLabel: exp.maHopDong === 'CH-CHUNG' || !exp.maHopDong ? 'Chi tiêu chung cửa hàng' : 
                        (hd?.khachHang1?.tenKhachHang || 'Hợp đồng khách hàng')
                };
            });

            // Sort by date descending
            mapped.sort((a, b) => new Date(b.date) - new Date(a.date));
            setExpensesList(mapped);

            const listDV = (resDV.status === 'fulfilled' && resDV.value?.data?.donViNhanTien) ? resDV.value.data.donViNhanTien : [];
            setDonViList(listDV);
        })
        .catch(err => {
            console.error(err);
            toast.error("Lỗi khi tải danh sách chi tiêu: " + err.message);
        })
        .finally(() => hideLoading());
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filter aggregated expenses by time, category and search keyword
    const filteredExpenses = useMemo(() => {
        return expensesList.filter(exp => {
            // 1. Time Filter
            if (timeFilter !== 'all' && exp.date) {
                const date = new Date(exp.date);
                const now = new Date();
                if (timeFilter === 'today') {
                    if (date.toDateString() !== now.toDateString()) return false;
                } else if (timeFilter === 'week') {
                    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                    if (date < startOfWeek) return false;
                } else if (timeFilter === 'month') {
                    if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return false;
                } else if (timeFilter === 'year') {
                    if (date.getFullYear() !== now.getFullYear()) return false;
                }
            }

            // 2. Category Filter
            if (categoryFilter === 'general') {
                if (exp.maHopDong !== 'CH-CHUNG' && exp.maHopDong) return false;
            } else if (categoryFilter === 'contract') {
                if (exp.maHopDong === 'CH-CHUNG' || !exp.maHopDong) return false;
            }

            // 3. Search Keyword Filter
            if (searchInput.trim()) {
                const kw = searchInput.toLowerCase();
                const matchesCode = exp.maHopDong?.toLowerCase().includes(kw);
                const matchesReceiver = exp.receiver?.toLowerCase().includes(kw);
                const matchesReason = exp.reason?.toLowerCase().includes(kw);
                const matchesCreator = exp.creator?.toLowerCase().includes(kw);
                const matchesCustomer = exp.khachHangLabel?.toLowerCase().includes(kw);
                return matchesCode || matchesReceiver || matchesReason || matchesCreator || matchesCustomer;
            }

            return true;
        });
    }, [expensesList, timeFilter, categoryFilter, searchInput]);

    // Statistics Calculations
    const statsTotalAmount = useMemo(() => {
        return filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    }, [filteredExpenses]);

    const statsGeneralAmount = useMemo(() => {
        return filteredExpenses
            .filter(item => item.maHopDong === 'CH-CHUNG' || !item.maHopDong)
            .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    }, [filteredExpenses]);

    const statsContractAmount = useMemo(() => {
        return filteredExpenses
            .filter(item => item.maHopDong !== 'CH-CHUNG' && item.maHopDong)
            .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    }, [filteredExpenses]);

    const statsTopShop = useMemo(() => {
        const shopMap = {};
        filteredExpenses.forEach(item => {
            const r = item.receiver || 'Khác';
            shopMap[r] = (shopMap[r] || 0) + (Number(item.amount) || 0);
        });
        let topName = 'Chưa có';
        let maxVal = 0;
        Object.keys(shopMap).forEach(key => {
            if (shopMap[key] > maxVal) {
                maxVal = shopMap[key];
                topName = key;
            }
        });
        return { name: topName, amount: maxVal };
    }, [filteredExpenses]);

    // Reset Form fields
    const resetForm = () => {
        setSelectedHD(null);
        setNgayChi(dayjs().format('YYYY-MM-DDTHH:mm'));
        setDonViNhan('');
        setLyDoChi('');
        setSoTien('');
        setNguoiChi(loggedInUserFullname);
        setGhiChu('');
    };

    // Save a new expenditure
    const handleSaveExpense = () => {
        if (!donViNhan.trim()) {
            toast.warning("Vui lòng nhập hoặc chọn shop mua hàng!");
            return;
        }
        if (!lyDoChi.trim()) {
            toast.warning("Vui lòng nhập lý do chi!");
            return;
        }
        if (!soTien || Number(soTien) <= 0) {
            toast.warning("Vui lòng nhập số tiền chi hợp lệ!");
            return;
        }

        const isGeneral = !selectedHD;
        const targetMaHopDong = isGeneral ? "CH-CHUNG" : selectedHD.maHopDong;
        
        const payload = {
            id: `EXP-${Date.now()}`,
            date: ngayChi ? new Date(ngayChi).toISOString() : new Date().toISOString(),
            receiver: donViNhan.trim(),
            reason: lyDoChi.trim(),
            amount: Number(soTien),
            creator: nguoiChi.trim() || "Cửa hàng",
            note: ghiChu.trim(),
            maHopDong: targetMaHopDong
        };

        showLoading("Đang ghi nhận chi tiêu...");
        otherService.CREATE_CHITIEU(payload)
            .then(() => {
                toast.success("Ghi nhận chi tiêu thành công!");
                setOpenAddDialog(false);
                resetForm();
                loadData();
            })
            .catch(err => {
                toast.error("Có lỗi xảy ra: " + err.message);
                hideLoading();
            });
    };

    // Delete an expenditure transaction
    const handleDeleteExpense = (exp) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa khoản chi ${Number(exp.amount).toLocaleString('vi-VN')} đ cho ${exp.receiver} không?`)) {
            return;
        }

        showLoading("Đang xóa chi tiêu...");
        otherService.REMOVE_CHITIEU({ id: exp.id })
            .then(() => {
                toast.success("Xóa khoản chi tiêu thành công!");
                loadData();
            })
            .catch(err => {
                toast.error("Lỗi khi xóa chi tiêu: " + err.message);
                hideLoading();
            });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "-";
        return dayjs(date).format('DD/MM/YYYY HH:mm');
    };

    const handlePrintPhieuChi = (exp) => {
        const printWindow = window.open("", "_blank");
        const dateObj = new Date(exp.date);
        const day = dateObj.getDate();
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();
        
        printWindow.document.write(`
            <html>
            <head>
                <title>Phiếu Chi - ${exp.id}</title>
                <style>
                    body { font-family: "Arial", sans-serif; padding: 20px; line-height: 1.5; color: #333; }
                    .voucher { border: 1px solid #333; padding: 20px; position: relative; max-width: 800px; margin: 0 auto; }
                    .header-sec { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .company-info { font-size: 13px; font-weight: bold; }
                    .voucher-title-sec { text-align: center; }
                    .title { font-size: 22px; font-weight: bold; margin: 0; }
                    .date-line { font-style: italic; font-size: 13px; margin-top: 5px; }
                    .voucher-code { font-size: 13px; font-weight: bold; text-align: right; }
                    .form-line { display: flex; margin-bottom: 8px; font-size: 14px; }
                    .label { font-weight: bold; min-width: 180px; }
                    .value { flex-grow: 1; border-bottom: 1px dashed #666; padding-left: 5px; }
                    .signatures { display: flex; justify-content: space-between; margin-top: 40px; font-size: 13px; font-weight: bold; text-align: center; }
                    .sig-box { width: 150px; }
                    .sig-space { height: 70px; }
                </style>
            </head>
            <body>
                <div class="voucher">
                    <div class="header-sec">
                        <div class="company-info">
                            <div>LONG WEDDING</div>
                            <div style="font-weight: normal; font-size: 11px;">Hệ thống Quản Trị Studio Cưới</div>
                        </div>
                        <div class="voucher-title-sec">
                            <div class="title">PHIẾU CHI</div>
                            <div class="date-line">Ngày ${day} tháng ${month} năm ${year}</div>
                        </div>
                        <div class="voucher-code">
                            <div>Mẫu số: 02 - TT</div>
                            <div>Mã HĐ: ${exp.maHopDong === 'CH-CHUNG' ? 'Chi chung' : exp.maHopDong}</div>
                            <div style="font-weight: normal; font-size: 11px; margin-top: 5px;">Mã PC: ${exp.id}</div>
                        </div>
                    </div>
                    
                    <div class="form-line">
                        <span class="label">Họ và tên người nhận tiền:</span>
                        <span class="value">${exp.receiver}</span>
                    </div>
                    <div class="form-line">
                        <span class="label">Mục liên kết / Khách hàng:</span>
                        <span class="value">${exp.khachHangLabel || ''}</span>
                    </div>
                    <div class="form-line">
                        <span class="label">Lý do chi:</span>
                        <span class="value">${exp.reason}</span>
                    </div>
                    <div class="form-line">
                        <span class="label">Số tiền chi:</span>
                        <span class="value"><strong>${Number(exp.amount).toLocaleString('vi-VN')} VNĐ</strong></span>
                    </div>
                    <div class="form-line">
                        <span class="label">Viết bằng chữ:</span>
                        <span class="value"><em>${docSoTiengViet(exp.amount)}</em></span>
                    </div>
                    <div class="form-line">
                        <span class="label">Kèm theo chứng từ:</span>
                        <span class="value">${exp.note || 'Chứng từ gốc / Hóa đơn đính kèm'}</span>
                    </div>
                    
                    <div class="signatures">
                        <div class="sig-box">
                            <div>Giám đốc</div>
                            <div style="font-weight: normal; font-size: 11px;">(Ký, họ tên, đóng dấu)</div>
                            <div class="sig-space"></div>
                        </div>
                        <div class="sig-box">
                            <div>Kế toán trưởng</div>
                            <div style="font-weight: normal; font-size: 11px;">(Ký, họ tên)</div>
                            <div class="sig-space"></div>
                        </div>
                        <div class="sig-box">
                            <div>Thủ quỹ</div>
                            <div style="font-weight: normal; font-size: 11px;">(Ký, họ tên)</div>
                            <div class="sig-space"></div>
                        </div>
                        <div class="sig-box">
                            <div>Người lập phiếu</div>
                            <div style="font-weight: normal; font-size: 11px;">(Ký, họ tên)</div>
                            <div class="sig-space"></div>
                            <div>${exp.creator || ''}</div>
                        </div>
                        <div class="sig-box">
                            <div>Người nhận tiền</div>
                            <div style="font-weight: normal; font-size: 11px;">(Ký, họ tên)</div>
                            <div class="sig-space"></div>
                            <div>${exp.receiver || ''}</div>
                        </div>
                    </div>
                </div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="expense-page-container">
            {/* 1. HEADER TITLE & ACTIONS */}
            <div className="expense-header">
                <div className="expense-title-wrap">
                    <div className="expense-badge-top">
                        <i className="fa-solid fa-receipt"></i> LONG WEDDING FINANCIAL & EXPENSE MANAGEMENT
                    </div>
                    <h2>
                        <i className="fa-solid fa-money-bill-transfer" style={{ color: '#dc2626' }}></i> QUẢN LÝ CHI TIÊU CỬA HÀNG
                    </h2>
                    <p className="expense-subtitle">
                        Theo dõi, phân loại và kiểm soát toàn bộ chi phí vận hành cửa hàng và chi phí theo hợp đồng
                    </p>
                </div>

                <div className="expense-header-actions">
                    <Button
                        variant="contained"
                        className="btn-add-expense"
                        onClick={() => {
                            resetForm();
                            setOpenAddDialog(true);
                        }}
                        startIcon={<i className="fa-solid fa-plus"></i>}
                    >
                        Thêm Chi Tiêu Mới
                    </Button>
                </div>
            </div>

            {/* 2. STATS OVERVIEW CARDS */}
            <div className="expense-stats-grid">
                <div className="expense-stat-card glass-panel">
                    <div className="stat-info">
                        <span className="stat-label">Tổng chi phí (Kỳ chọn)</span>
                        <h3 style={{ color: '#dc2626' }}>{formatShortMoney(statsTotalAmount)}</h3>
                        <span className="stat-sub">{filteredExpenses.length} lượt giao dịch</span>
                    </div>
                    <div className="stat-icon icon-red">
                        <i className="fa-solid fa-money-check-dollar"></i>
                    </div>
                </div>

                <div className="expense-stat-card glass-panel">
                    <div className="stat-info">
                        <span className="stat-label">Chi phí vận hành chung</span>
                        <h3 style={{ color: '#9333ea' }}>{formatShortMoney(statsGeneralAmount)}</h3>
                        <span className="stat-sub">Điện, nước, decor, quảng cáo...</span>
                    </div>
                    <div className="stat-icon icon-purple">
                        <i className="fa-solid fa-shop"></i>
                    </div>
                </div>

                <div className="expense-stat-card glass-panel">
                    <div className="stat-info">
                        <span className="stat-label">Chi phí theo hợp đồng</span>
                        <h3 style={{ color: '#2563eb' }}>{formatShortMoney(statsContractAmount)}</h3>
                        <span className="stat-sub">In ấn, vật tư theo từng khách hàng</span>
                    </div>
                    <div className="stat-icon icon-blue">
                        <i className="fa-solid fa-file-invoice"></i>
                    </div>
                </div>

                <div className="expense-stat-card glass-panel">
                    <div className="stat-info">
                        <span className="stat-label">Shop chi nhiều nhất</span>
                        <h3 style={{ color: '#d97706', fontSize: '1.25rem' }}>{statsTopShop.name}</h3>
                        <span className="stat-sub">Tổng chi: {formatShortMoney(statsTopShop.amount)}</span>
                    </div>
                    <div className="stat-icon icon-amber">
                        <i className="fa-solid fa-store"></i>
                    </div>
                </div>
            </div>

            {/* 3. TOOLBAR & FILTERS */}
            <div className="expense-toolbar glass-panel">
                <div className="toolbar-left">
                    <TextField
                        size="small"
                        placeholder="Tìm theo Mã HĐ, Lý do, Shop, Người chi..."
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

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Thời gian chi</InputLabel>
                        <Select
                            value={timeFilter}
                            label="Thời gian chi"
                            onChange={(e) => setTimeFilter(e.target.value)}
                        >
                            <MenuItem value="all">Tất cả thời gian</MenuItem>
                            <MenuItem value="today">Hôm nay</MenuItem>
                            <MenuItem value="week">Tuần này</MenuItem>
                            <MenuItem value="month">Tháng này</MenuItem>
                            <MenuItem value="year">Năm nay</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 170 }}>
                        <InputLabel>Phân loại chi</InputLabel>
                        <Select
                            value={categoryFilter}
                            label="Phân loại chi"
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <MenuItem value="all">Tất cả khoản chi</MenuItem>
                            <MenuItem value="general">🏢 Chi chung cửa hàng</MenuItem>
                            <MenuItem value="contract">📋 Chi theo hợp đồng</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                <div className="toolbar-right">
                    <Tooltip title="Tải lại dữ liệu">
                        <IconButton onClick={loadData} sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                            <i className="fa-solid fa-rotate"></i>
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* 4. EXPENSES TABLE */}
            <Paper elevation={0} className="expense-table-container glass-panel">
                <TableContainer sx={{ maxHeight: 'calc(100vh - 360px)' }}>
                    <Table stickyHeader size="small">
                        <TableHead sx={{ '& th': { bgcolor: '#f8fafc', color: '#334155', fontWeight: 800, py: 1.8 } }}>
                            <TableRow>
                                <TableCell align="center" style={{ width: '50px' }}>STT</TableCell>
                                <TableCell style={{ width: '140px' }}>MÃ LIÊN KẾT</TableCell>
                                <TableCell style={{ width: '200px' }}>KHÁCH HÀNG / MỤC</TableCell>
                                <TableCell style={{ width: '150px' }}>NGÀY CHI</TableCell>
                                <TableCell style={{ width: '160px' }}>SHOP MUA HÀNG</TableCell>
                                <TableCell style={{ width: '220px' }}>LÝ DO CHI</TableCell>
                                <TableCell align="right" style={{ width: '140px' }}>SỐ TIỀN CHI</TableCell>
                                <TableCell style={{ width: '140px' }}>NGƯỜI CHI</TableCell>
                                <TableCell style={{ width: '160px' }}>GHI CHÚ</TableCell>
                                <TableCell align="center" style={{ width: '140px' }}>HÀNH ĐỘNG</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredExpenses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                                        <i className="fa-solid fa-receipt" style={{ fontSize: '2.5rem', marginBottom: 10, display: 'block', color: '#cbd5e1' }}></i>
                                        Không tìm thấy khoản chi tiêu nào phù hợp.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredExpenses.map((exp, idx) => (
                                    <TableRow key={exp.id || idx} className="expense-table-row">
                                        <TableCell align="center" style={{ fontWeight: 600, color: '#64748b' }}>
                                            {idx + 1}
                                        </TableCell>
                                        <TableCell>
                                            {exp.maHopDong === 'CH-CHUNG' || !exp.maHopDong ? (
                                                <span className="badge-general-expense">
                                                    <i className="fa-solid fa-shop"></i> CHUNG
                                                </span>
                                            ) : (
                                                <span className="badge-contract-expense">
                                                    <i className="fa-solid fa-file-contract"></i> {exp.maHopDong}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                                            {exp.khachHangLabel}
                                        </TableCell>
                                        <TableCell sx={{ color: '#475569', fontSize: '0.82rem', fontWeight: 600 }}>
                                            {formatDate(exp.date)}
                                        </TableCell>
                                        <TableCell>
                                            <span className="badge-shop">
                                                <i className="fa-solid fa-store" style={{ fontSize: '0.75rem' }}></i> {exp.receiver || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>
                                            {exp.reason || '-'}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 800, color: '#dc2626', fontSize: '0.95rem' }}>
                                            -{formatMoney(exp.amount || 0)}
                                        </TableCell>
                                        <TableCell>
                                            <span className="badge-creator">
                                                👤 {exp.creator || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                                            {exp.note || '-'}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Tooltip title="In Phiếu Chi">
                                                    <Button
                                                        size="small"
                                                        className="btn-action-print"
                                                        onClick={() => handlePrintPhieuChi(exp)}
                                                        startIcon={<i className="fa-solid fa-print"></i>}
                                                    >
                                                        In
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip title="Xóa khoản chi">
                                                    <IconButton
                                                        size="small"
                                                        className="btn-action-del"
                                                        onClick={() => handleDeleteExpense(exp)}
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* 5. DIALOG THÊM CHI TIÊU MỚI */}
            <Dialog 
                open={openAddDialog} 
                onClose={() => setOpenAddDialog(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ bgcolor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
                    <i className="fa-solid fa-file-invoice-dollar" style={{ color: '#f87171' }}></i>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        THÊM MỚI KHOẢN CHI TIÊU
                    </Typography>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 3 }}>
                    <Box display="flex" flexDirection="column" gap={2.5}>
                        <Grid container spacing={2}>
                            {/* Chọn Hợp đồng / Chi chung */}
                            <Grid item xs={12}>
                                <Autocomplete
                                    options={hopDongs}
                                    getOptionLabel={(option) => `HĐ: ${option.maHopDong} - ${option.khachHang1?.tenKhachHang || 'Khách hàng'}`}
                                    value={selectedHD}
                                    onChange={(event, newValue) => setSelectedHD(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Liên kết Hợp đồng (Bỏ trống nếu là Chi tiêu chung cửa hàng)"
                                            placeholder="Gõ tìm kiếm theo mã HĐ hoặc tên khách hàng..."
                                            helperText={selectedHD ? `Đang liên kết: ${selectedHD.maHopDong} (${selectedHD.khachHang1?.tenKhachHang})` : "Khoản chi này sẽ được ghi nhận là [Chi tiêu chung cửa hàng]"}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Ngày giờ chi */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Thời gian chi"
                                    type="datetime-local"
                                    fullWidth
                                    value={ngayChi}
                                    onChange={(e) => setNgayChi(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            {/* Người chi tiền */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Người thực hiện chi"
                                    fullWidth
                                    value={nguoiChi}
                                    onChange={(e) => setNguoiChi(e.target.value)}
                                    placeholder="Tên nhân viên..."
                                />
                            </Grid>

                            {/* Shop mua hàng / Đơn vị nhận */}
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    freeSolo
                                    options={donViList.map(d => d.name).filter(Boolean)}
                                    value={donViNhan}
                                    onInputChange={(event, newInputValue) => setDonViNhan(newInputValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Shop mua hàng / Đơn vị nhận tiền"
                                            required
                                            placeholder="Ví dụ: Shopee, Xưởng In Sài Gòn, Điện Lực..."
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Số tiền chi */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Số tiền chi (VNĐ)"
                                    required
                                    fullWidth
                                    value={formatInputNumber(soTien)}
                                    onChange={(e) => setSoTien(parseInputNumber(e.target.value))}
                                    placeholder="Ví dụ: 820.000"
                                    helperText={soTien ? `Bằng chữ: ${docSoTiengViet(soTien)}` : "Nhập số tiền chi..."}
                                    inputProps={{ style: { fontWeight: 800, color: '#dc2626' } }}
                                />
                            </Grid>

                            {/* Lý do chi */}
                            <Grid item xs={12}>
                                <TextField
                                    label="Lý do chi"
                                    required
                                    fullWidth
                                    value={lyDoChi}
                                    onChange={(e) => setLyDoChi(e.target.value)}
                                    placeholder="Ví dụ: Chi phí mua rêu decor studio, Chi phí in album cho khách..."
                                />
                            </Grid>

                            {/* Ghi chú */}
                            <Grid item xs={12}>
                                <TextField
                                    label="Ghi chú thêm"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={ghiChu}
                                    onChange={(e) => setGhiChu(e.target.value)}
                                    placeholder="Thông tin chứng từ, số hóa đơn đính kèm..."
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc' }}>
                    <Button onClick={() => setOpenAddDialog(false)} color="inherit" sx={{ fontWeight: 600 }}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        className="btn-add-expense"
                        onClick={handleSaveExpense}
                        startIcon={<i className="fa-solid fa-check"></i>}
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                    >
                        Lưu Khoản Chi
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default QuanLyChiTieu;
