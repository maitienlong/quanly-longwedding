import React, { useState, useEffect, useMemo } from 'react';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { toast } from 'sonner';
import './quanlykhachhang.css';
import logoDefault from '../../assets/logo/logo-vang.png';

// Material UI components
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
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
    Typography,
    Grid,
    Chip,
    Avatar,
    IconButton,
    Tooltip,
    InputAdornment,
    ToggleButton,
    ToggleButtonGroup,
    useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

function QuanLyKhachHang() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { showLoading, hideLoading } = useLoading();
    
    const [customers, setCustomers] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [contractFilter, setContractFilter] = useState('all'); // 'all' | 'has_contract' | 'no_contract'
    const [genderFilter, setGenderFilter] = useState('all'); // 'all' | 'Nam' | 'Nữ'
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

    // Dialog state
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);

    // Form fields state
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [tenKhachHang, setTenKhachHang] = useState('');
    const [soDienThoai, setSoDienThoai] = useState('');
    const [avatar, setAvatar] = useState('');
    const [maDangNhap, setMaDangNhap] = useState('');
    const [ngaySinhNhat, setNgaySinhNhat] = useState('');
    const [gioiTinh, setGioiTinh] = useState('Nam');
    const [diaChi, setDiaChi] = useState('');
    const [ngayCapCCCD, setNgayCapCCCD] = useState('');
    const [facebookId, setFacebookId] = useState('');

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.warning("Dung lượng ảnh vượt quá 5MB!");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const loadData = () => {
        showLoading("Đang tải danh sách khách hàng...");
        otherService.findKhachHang({ keyword: '' })
            .then(res => {
                if (res.data && res.data.status === 'success') {
                    setCustomers(res.data.data || []);
                } else if (res.status === 'success') {
                    setCustomers(res.data || []);
                } else {
                    setCustomers(res.data?.data || []);
                }
            })
            .catch(err => {
                console.error(err);
                toast.error("Lỗi khi tải danh sách khách hàng: " + err.message);
            })
            .finally(() => hideLoading());
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filtered customer list
    const filteredCustomers = useMemo(() => {
        return customers.filter(cust => {
            // Search keyword
            if (keyword.trim()) {
                const kw = keyword.toLowerCase();
                const matchName = cust.tenKhachHang?.toLowerCase().includes(kw);
                const matchPhone = cust.soDienThoai?.includes(kw);
                const matchAddress = cust.diaChi?.toLowerCase().includes(kw);
                const matchFB = cust.facebookId?.toLowerCase().includes(kw);
                if (!matchName && !matchPhone && !matchAddress && !matchFB) return false;
            }

            // Contract filter
            if (contractFilter === 'has_contract' && (!cust.soHopDong || cust.soHopDong <= 0)) {
                return false;
            }
            if (contractFilter === 'no_contract' && cust.soHopDong > 0) {
                return false;
            }

            // Gender filter
            if (genderFilter !== 'all' && cust.gioiTinh !== genderFilter) {
                return false;
            }

            return true;
        });
    }, [customers, keyword, contractFilter, genderFilter]);

    // Statistics Calculations
    const totalCustomers = customers.length;
    const customersWithContract = useMemo(() => {
        return customers.filter(c => c.soHopDong > 0).length;
    }, [customers]);
    const potentialCustomers = useMemo(() => {
        return customers.filter(c => !c.soHopDong || c.soHopDong <= 0).length;
    }, [customers]);
    const birthdayThisMonth = useMemo(() => {
        const currentMonth = new Date().getMonth() + 1;
        return customers.filter(c => {
            if (!c.ngaySinhNhat) return false;
            const parts = c.ngaySinhNhat.split(/[-/]/);
            if (parts.length >= 2) {
                const month = parseInt(parts[1], 10);
                return month === currentMonth;
            }
            return false;
        }).length;
    }, [customers]);

    const resetForm = () => {
        setSelectedCustomerId('');
        setTenKhachHang('');
        setSoDienThoai('');
        setAvatar('');
        setMaDangNhap('');
        setNgaySinhNhat('');
        setGioiTinh('Nam');
        setDiaChi('');
        setNgayCapCCCD('');
        setFacebookId('');
    };

    const handleCreateCustomer = () => {
        if (!tenKhachHang.trim()) {
            toast.warning("Vui lòng nhập họ và tên khách hàng!");
            return;
        }
        if (!soDienThoai.trim() && !facebookId.trim()) {
            toast.warning("Vui lòng nhập Số điện thoại hoặc ID Facebook!");
            return;
        }
        if (!diaChi.trim()) {
            toast.warning("Vui lòng nhập địa chỉ!");
            return;
        }

        const payload = {
            tenKhachHang: tenKhachHang.trim(),
            soDienThoai: soDienThoai.trim(),
            avatar: avatar.trim() || undefined,
            maDangNhap: maDangNhap.trim() || undefined,
            ngaySinhNhat: ngaySinhNhat.trim() || undefined,
            gioiTinh: gioiTinh,
            diaChi: diaChi.trim(),
            ngayCapCCCD: ngayCapCCCD.trim() || undefined,
            facebookId: facebookId.trim() || undefined
        };

        showLoading("Đang khởi tạo khách hàng...");
        otherService.createKhachHang(payload)
            .then(() => {
                toast.success("Khởi tạo khách hàng thành công!");
                setOpenAddDialog(false);
                resetForm();
                loadData();
            })
            .catch(err => {
                toast.error("Lỗi khi thêm khách hàng: " + err.message);
                hideLoading();
            });
    };

    const handleOpenEdit = (customer) => {
        setSelectedCustomerId(customer._id);
        setTenKhachHang(customer.tenKhachHang || '');
        setSoDienThoai(customer.soDienThoai || '');
        setAvatar(customer.avatar || '');
        setMaDangNhap(customer.maDangNhap || '');
        setNgaySinhNhat(customer.ngaySinhNhat || '');
        setGioiTinh(customer.gioiTinh || 'Nam');
        setDiaChi(customer.diaChi || '');
        setNgayCapCCCD(customer.ngayCapCCCD || '');
        setFacebookId(customer.facebookId || '');
        setOpenEditDialog(true);
    };

    const handleUpdateCustomer = () => {
        if (!tenKhachHang.trim()) {
            toast.warning("Vui lòng nhập họ và tên khách hàng!");
            return;
        }
        if (!soDienThoai.trim() && !facebookId.trim()) {
            toast.warning("Vui lòng nhập Số điện thoại hoặc ID Facebook!");
            return;
        }
        if (!diaChi.trim()) {
            toast.warning("Vui lòng nhập địa chỉ!");
            return;
        }

        const payload = {
            _id: selectedCustomerId,
            tenKhachHang: tenKhachHang.trim(),
            soDienThoai: soDienThoai.trim(),
            avatar: avatar.trim(),
            maDangNhap: maDangNhap.trim(),
            ngaySinhNhat: ngaySinhNhat.trim(),
            gioiTinh: gioiTinh,
            diaChi: diaChi.trim(),
            ngayCapCCCD: ngayCapCCCD.trim(),
            facebookId: facebookId.trim()
        };

        showLoading("Đang cập nhật khách hàng...");
        otherService.updateKhachHang(payload)
            .then(() => {
                toast.success("Cập nhật khách hàng thành công!");
                setOpenEditDialog(false);
                resetForm();
                loadData();
            })
            .catch(err => {
                toast.error("Lỗi cập nhật khách hàng: " + err.message);
                hideLoading();
            });
    };

    const handleDeleteCustomer = (customer) => {
        if (customer.soHopDong > 0) {
            toast.error(`Không thể xóa khách hàng này vì đang có ${customer.soHopDong} hợp đồng liên kết trên hệ thống!`);
            return;
        }

        if (!window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${customer.tenKhachHang}" khỏi hệ thống không?`)) {
            return;
        }

        showLoading("Đang xóa khách hàng...");
        otherService.removeKhachHang({ _id: customer._id })
            .then(() => {
                toast.success("Xóa khách hàng thành công!");
                loadData();
            })
            .catch(err => {
                toast.error("Lỗi khi xóa khách hàng: " + err.message);
                hideLoading();
            });
    };

    const handleFacebookLinkChange = (e) => {
        let originalUrl = e.target.value;
        let val = originalUrl;
        if (val.includes('facebook.com') || val.includes('fb.com')) {
            try {
                const url = new URL(val.startsWith('http') ? val : `https://${val}`);
                if (url.searchParams.has('id')) {
                    val = url.searchParams.get('id');
                } else {
                    const pathParts = url.pathname.split('/').filter(Boolean);
                    if (pathParts.length > 0) {
                        val = pathParts[0];
                    }
                }
            } catch (err) {
                const match = val.match(/(?:facebook\.com|fb\.com)\/(?:profile\.php\?id=)?([^\/?&#]+)/i);
                if (match && match[1]) {
                    val = match[1];
                }
            }
        }
        setFacebookId(val);
        
        // Auto-fetch Facebook UID and name if we have a valid URL
        if (originalUrl.includes('facebook.com') || originalUrl.includes('fb.com')) {
             let fullUrl = originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`;
             otherService.getFacebookInfo({ url: fullUrl })
                 .then(res => {
                     if (res.data) {
                         if (res.data.uid) {
                             setFacebookId(res.data.uid);
                         }
                         if (res.data.name && (!tenKhachHang || tenKhachHang.trim() === '')) {
                             setTenKhachHang(res.data.name);
                         }
                     }
                 })
                 .catch(err => console.log("Lỗi lấy thông tin FB:", err));
        }
    };

    return (
        <div className="customer-page-container">
            {/* 1. HEADER TITLE & ACTIONS */}
            <div className="customer-header">
                <div className="customer-title-wrap">
                    <div className="customer-badge-top">
                        <i className="fa-solid fa-users"></i> LONG WEDDING CRM & CUSTOMER DIRECTORY
                    </div>
                    <h2>
                        <i className="fa-solid fa-address-book" style={{ color: '#2563eb' }}></i> QUẢN LÝ KHÁCH HÀNG STUDIO
                    </h2>
                    <p className="customer-subtitle">
                        Lưu trữ hồ sơ, quản lý thông tin liên hệ, ngày sinh nhật, mạng xã hội và lịch sử hợp đồng của khách hàng
                    </p>
                </div>

                <div className="customer-header-actions">
                    <Button
                        variant="contained"
                        className="btn-add-customer"
                        onClick={() => {
                            resetForm();
                            setOpenAddDialog(true);
                        }}
                        startIcon={<i className="fa-solid fa-user-plus"></i>}
                    >
                        Thêm Khách Hàng
                    </Button>
                </div>
            </div>

            {/* 2. STATS OVERVIEW CARDS */}
            <div className="customer-stats-grid">
                <div className="customer-stat-card glass-panel">
                    <div className="stat-info">
                        <span className="stat-label">Tổng khách hàng</span>
                        <h3 style={{ color: '#2563eb' }}>{totalCustomers} <span className="stat-unit">hồ sơ</span></h3>
                        <span className="stat-sub">Đã lưu trữ trong hệ thống CRM</span>
                    </div>
                    <div className="stat-icon icon-blue">
                        <i className="fa-solid fa-users-gear"></i>
                    </div>
                </div>

                <div className="customer-stat-card glass-panel">
                    <div className="stat-info">
                        <span className="stat-label">Đã ký hợp đồng</span>
                        <h3 style={{ color: '#059669' }}>{customersWithContract} <span className="stat-unit">khách</span></h3>
                        <span className="stat-sub">Khách hàng chính thức của studio</span>
                    </div>
                    <div className="stat-icon icon-emerald">
                        <i className="fa-solid fa-file-signature"></i>
                    </div>
                </div>

                <div className="customer-stat-card glass-panel">
                    <div className="stat-info">
                        <span className="stat-label">Khách hàng tiềm năng</span>
                        <h3 style={{ color: '#d97706' }}>{potentialCustomers} <span className="stat-unit">khách</span></h3>
                        <span className="stat-sub">Chưa tạo hợp đồng chính thức</span>
                    </div>
                    <div className="stat-icon icon-amber">
                        <i className="fa-solid fa-user-clock"></i>
                    </div>
                </div>

                <div className="customer-stat-card glass-panel">
                    <div className="stat-info">
                        <span className="stat-label">Sinh nhật tháng này</span>
                        <h3 style={{ color: '#e11d48' }}>{birthdayThisMonth} <span className="stat-unit">khách</span></h3>
                        <span className="stat-sub">Sẵn sàng gửi quà & ưu đãi</span>
                    </div>
                    <div className="stat-icon icon-rose">
                        <i className="fa-solid fa-cake-candles"></i>
                    </div>
                </div>
            </div>

            {/* 3. TOOLBAR & FILTERS */}
            <div className="customer-toolbar glass-panel">
                <div className="toolbar-left">
                    <TextField
                        size="small"
                        placeholder="Tìm kiếm theo Tên, SĐT, Địa chỉ, Facebook..."
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
                        <InputLabel>Tình trạng hợp đồng</InputLabel>
                        <Select
                            value={contractFilter}
                            label="Tình trạng hợp đồng"
                            onChange={(e) => setContractFilter(e.target.value)}
                        >
                            <MenuItem value="all">Tất cả khách hàng</MenuItem>
                            <MenuItem value="has_contract">💍 Đã có hợp đồng</MenuItem>
                            <MenuItem value="no_contract">🌟 Chưa có hợp đồng</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Giới tính</InputLabel>
                        <Select
                            value={genderFilter}
                            label="Giới tính"
                            onChange={(e) => setGenderFilter(e.target.value)}
                        >
                            <MenuItem value="all">Tất cả giới tính</MenuItem>
                            <MenuItem value="Nam">👨 Nam</MenuItem>
                            <MenuItem value="Nữ">👩 Nữ</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                <div className="toolbar-right">
                    <ToggleButtonGroup
                        size="small"
                        value={viewMode}
                        exclusive
                        onChange={(e, next) => next && setViewMode(next)}
                        sx={{ bgcolor: '#f8fafc' }}
                    >
                        <ToggleButton value="table" title="Dạng bảng chi tiết">
                            <i className="fa-solid fa-table-list"></i>
                        </ToggleButton>
                        <ToggleButton value="cards" title="Dạng thẻ hồ sơ">
                            <i className="fa-solid fa-id-card"></i>
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Tooltip title="Tải lại dữ liệu">
                        <IconButton onClick={loadData} sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                            <i className="fa-solid fa-rotate"></i>
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* 4. CONTENT: TABLE OR CARDS VIEW */}
            {viewMode === 'table' ? (
                <Paper elevation={0} className="customer-table-container glass-panel">
                    <TableContainer sx={{ maxHeight: 'calc(100vh - 360px)' }}>
                        <Table stickyHeader size="small">
                            <TableHead sx={{ '& th': { bgcolor: '#f8fafc', color: '#334155', fontWeight: 800, py: 1.8 } }}>
                                <TableRow>
                                    <TableCell align="center" style={{ width: '50px' }}>STT</TableCell>
                                    <TableCell style={{ width: '70px' }}>AVATAR</TableCell>
                                    <TableCell style={{ width: '220px' }}>HỌ VÀ TÊN KHÁCH HÀNG</TableCell>
                                    <TableCell style={{ width: '150px' }}>SỐ ĐIỆN THOẠI</TableCell>
                                    <TableCell align="center" style={{ width: '130px' }}>NGÀY SINH</TableCell>
                                    <TableCell align="center" style={{ width: '110px' }}>GIỚI TÍNH</TableCell>
                                    <TableCell style={{ width: '260px' }}>ĐỊA CHỈ</TableCell>
                                    <TableCell align="center" style={{ width: '150px' }}>SỐ HỢP ĐỒNG</TableCell>
                                    <TableCell align="center" style={{ width: '130px' }}>HÀNH ĐỘNG</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredCustomers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                                            <i className="fa-solid fa-users-slash" style={{ fontSize: '2.5rem', marginBottom: 10, display: 'block', color: '#cbd5e1' }}></i>
                                            Không tìm thấy thông tin khách hàng nào phù hợp.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCustomers.map((cust, idx) => (
                                        <TableRow key={cust._id || idx} className="customer-table-row">
                                            <TableCell align="center" style={{ fontWeight: 600, color: '#64748b' }}>
                                                {idx + 1}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Avatar 
                                                    src={cust.avatar || logoDefault} 
                                                    sx={{ width: 38, height: 38, border: '2px solid #e2e8f0', margin: 'auto' }} 
                                                />
                                            </TableCell>
                                            <TableCell style={{ fontWeight: 800, color: '#0f172a' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    {cust.tenKhachHang}
                                                    {cust.facebookId && (
                                                        <Tooltip title="Mở trang Facebook khách hàng">
                                                            <a 
                                                                href={`https://facebook.com/${cust.facebookId}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                style={{ color: '#1877f2', fontSize: '0.95rem' }}
                                                            >
                                                                <i className="fa-brands fa-facebook"></i>
                                                            </a>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell style={{ fontWeight: 600, color: '#2563eb' }}>
                                                {cust.soDienThoai ? (
                                                    <a href={`tel:${cust.soDienThoai}`} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <i className="fa-solid fa-phone" style={{ fontSize: '0.75rem' }}></i> {cust.soDienThoai}
                                                    </a>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell align="center" style={{ color: '#475569', fontSize: '0.85rem' }}>
                                                {cust.ngaySinhNhat ? (
                                                    <span>🎂 {cust.ngaySinhNhat}</span>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell align="center">
                                                {cust.gioiTinh === 'Nữ' ? (
                                                    <Chip label="Nữ" size="small" className="chip-gender-female" />
                                                ) : (
                                                    <Chip label="Nam" size="small" className="chip-gender-male" />
                                                )}
                                            </TableCell>
                                            <TableCell style={{ color: '#64748b', fontSize: '0.82rem' }}>
                                                {cust.diaChi || '-'}
                                            </TableCell>
                                            <TableCell align="center">
                                                {cust.soHopDong >= 2 ? (
                                                    <span className="badge-contract-vip">
                                                        👑 {cust.soHopDong} hợp đồng
                                                    </span>
                                                ) : cust.soHopDong === 1 ? (
                                                    <span className="badge-contract-active">
                                                        ✓ 1 hợp đồng
                                                    </span>
                                                ) : (
                                                    <span className="badge-contract-none">
                                                        Chưa có HĐ
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} justifyContent="center">
                                                    <IconButton
                                                        size="small"
                                                        className="btn-action-edit"
                                                        onClick={() => handleOpenEdit(cust)}
                                                        title="Chỉnh sửa thông tin"
                                                    >
                                                        <i className="fa-solid fa-pen"></i>
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        className="btn-action-delete"
                                                        onClick={() => handleDeleteCustomer(cust)}
                                                        disabled={cust.soHopDong > 0}
                                                        title={cust.soHopDong > 0 ? "Không thể xóa khách có hợp đồng" : "Xóa khách hàng"}
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </IconButton>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            ) : (
                /* CARDS GRID VIEW */
                <div className="customer-grid-view">
                    {filteredCustomers.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            <i className="fa-solid fa-users-slash" style={{ fontSize: '3rem', marginBottom: 12, display: 'block', color: '#cbd5e1' }}></i>
                            Không tìm thấy thông tin khách hàng nào phù hợp.
                        </div>
                    ) : (
                        filteredCustomers.map(cust => (
                            <div key={cust._id} className="customer-card glass-panel">
                                <div className="customer-card-header">
                                    <Avatar 
                                        src={cust.avatar || logoDefault} 
                                        sx={{ width: 54, height: 54, border: '3px solid #2563eb', boxShadow: '0 4px 10px rgba(37,99,235,0.2)' }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {cust.tenKhachHang}
                                            </Typography>
                                            {cust.facebookId && (
                                                <a href={`https://facebook.com/${cust.facebookId}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1877f2' }}>
                                                    <i className="fa-brands fa-facebook"></i>
                                                </a>
                                            )}
                                        </div>
                                        <div style={{ marginTop: 2 }}>
                                            {cust.soHopDong >= 2 ? (
                                                <span className="badge-contract-vip">👑 {cust.soHopDong} Hợp đồng</span>
                                            ) : cust.soHopDong === 1 ? (
                                                <span className="badge-contract-active">✓ 1 Hợp đồng</span>
                                            ) : (
                                                <span className="badge-contract-none">Chưa có HĐ</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="customer-card-body">
                                    <div className="customer-card-row">
                                        <i className="fa-solid fa-phone" style={{ width: 18, color: '#2563eb' }}></i>
                                        <span><b>SĐT:</b> {cust.soDienThoai || '-'}</span>
                                    </div>
                                    <div className="customer-card-row">
                                        <i className="fa-solid fa-cake-candles" style={{ width: 18, color: '#e11d48' }}></i>
                                        <span><b>Sinh nhật:</b> {cust.ngaySinhNhat || '-'} ({cust.gioiTinh || 'Nam'})</span>
                                    </div>
                                    <div className="customer-card-row">
                                        <i className="fa-solid fa-location-dot" style={{ width: 18, color: '#64748b' }}></i>
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><b>Đ/C:</b> {cust.diaChi || '-'}</span>
                                    </div>
                                </div>

                                <div className="customer-card-footer">
                                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ID: {cust._id ? cust._id.slice(-6) : '-'}</span>
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleOpenEdit(cust)}
                                            startIcon={<i className="fa-solid fa-pen"></i>}
                                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                                        >
                                            Sửa
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleDeleteCustomer(cust)}
                                            disabled={cust.soHopDong > 0}
                                            startIcon={<i className="fa-solid fa-trash"></i>}
                                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                                        >
                                            Xóa
                                        </Button>
                                    </Stack>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* 5. DIALOG ADD CUSTOMER */}
            <Dialog 
                open={openAddDialog} 
                onClose={() => setOpenAddDialog(false)} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ bgcolor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
                    <i className="fa-solid fa-user-plus" style={{ color: '#38bdf8' }}></i>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        THÊM MỚI HỒ SƠ KHÁCH HÀNG
                    </Typography>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 3 }}>
                    <Box display="flex" flexDirection="column" gap={2.5}>
                        {/* AVATAR UPLOAD */}
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                            <Box position="relative">
                                <Avatar
                                    src={avatar || logoDefault}
                                    alt="avatar"
                                    sx={{ 
                                        width: 90, 
                                        height: 90, 
                                        border: '3px solid #2563eb', 
                                        boxShadow: '0 6px 16px rgba(37,99,235,0.3)' 
                                    }}
                                />
                                <label htmlFor="add-cust-avatar-upload" style={{ position: 'absolute', bottom: -4, right: -4 }}>
                                    <input
                                        accept="image/*"
                                        id="add-cust-avatar-upload"
                                        type="file"
                                        style={{ display: 'none' }}
                                        onChange={handleAvatarChange}
                                    />
                                    <IconButton color="primary" component="span" sx={{ bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', '&:hover': { bgcolor: '#f0f0f0' } }}>
                                        <PhotoCamera fontSize="small" />
                                    </IconButton>
                                </label>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                Bấm icon máy ảnh để tải ảnh chân dung khách hàng
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Họ và tên khách hàng"
                                    required
                                    fullWidth
                                    value={tenKhachHang}
                                    onChange={(e) => setTenKhachHang(e.target.value)}
                                    placeholder="Ví dụ: Nguyễn Văn An, Trần Thị Thảo..."
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Số điện thoại liên hệ"
                                    required
                                    fullWidth
                                    value={soDienThoai}
                                    onChange={(e) => setSoDienThoai(e.target.value.replace(/\s/g, ''))}
                                    placeholder="Ví dụ: 0987654321"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Giới tính</InputLabel>
                                    <Select
                                        value={gioiTinh}
                                        label="Giới tính"
                                        onChange={(e) => setGioiTinh(e.target.value)}
                                    >
                                        <MenuItem value="Nam">👨 Nam</MenuItem>
                                        <MenuItem value="Nữ">👩 Nữ</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Ngày sinh nhật (DD/MM/YYYY)"
                                    fullWidth
                                    value={ngaySinhNhat}
                                    onChange={(e) => setNgaySinhNhat(e.target.value)}
                                    placeholder="Ví dụ: 21/11/2000"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Ngày cấp CCCD"
                                    fullWidth
                                    value={ngayCapCCCD}
                                    onChange={(e) => setNgayCapCCCD(e.target.value)}
                                    placeholder="Ví dụ: 15/08/2021"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Địa chỉ cư trú"
                                    required
                                    fullWidth
                                    value={diaChi}
                                    onChange={(e) => setDiaChi(e.target.value)}
                                    placeholder="Ví dụ: Xóm Bình Nghĩa, Nghĩa Đàn, Nghệ An"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Mã đăng nhập App khách hàng"
                                    fullWidth
                                    value={maDangNhap}
                                    onChange={(e) => setMaDangNhap(e.target.value)}
                                    placeholder="Mặc định: abcd1234"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Link Facebook / UID Facebook"
                                    fullWidth
                                    value={facebookId}
                                    onChange={handleFacebookLinkChange}
                                    placeholder="Dán link Facebook tại đây..."
                                    helperText="Tự động nhận diện UID & Tên khi dán link"
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
                        className="btn-add-customer"
                        onClick={handleCreateCustomer}
                        startIcon={<i className="fa-solid fa-check"></i>}
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                    >
                        Khởi Tạo Khách Hàng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 6. DIALOG EDIT CUSTOMER */}
            <Dialog 
                open={openEditDialog} 
                onClose={() => setOpenEditDialog(false)} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ bgcolor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
                    <i className="fa-solid fa-user-pen" style={{ color: '#38bdf8' }}></i>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        CẬP NHẬT HỒ SƠ KHÁCH HÀNG
                    </Typography>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 3 }}>
                    <Box display="flex" flexDirection="column" gap={2.5}>
                        {/* AVATAR UPLOAD */}
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                            <Box position="relative">
                                <Avatar
                                    src={avatar || logoDefault}
                                    alt="avatar"
                                    sx={{ 
                                        width: 90, 
                                        height: 90, 
                                        border: '3px solid #2563eb', 
                                        boxShadow: '0 6px 16px rgba(37,99,235,0.3)' 
                                    }}
                                />
                                <label htmlFor="edit-cust-avatar-upload" style={{ position: 'absolute', bottom: -4, right: -4 }}>
                                    <input
                                        accept="image/*"
                                        id="edit-cust-avatar-upload"
                                        type="file"
                                        style={{ display: 'none' }}
                                        onChange={handleAvatarChange}
                                    />
                                    <IconButton color="primary" component="span" sx={{ bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', '&:hover': { bgcolor: '#f0f0f0' } }}>
                                        <PhotoCamera fontSize="small" />
                                    </IconButton>
                                </label>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                Bấm icon máy ảnh để đổi ảnh đại diện
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Họ và tên khách hàng"
                                    required
                                    fullWidth
                                    value={tenKhachHang}
                                    onChange={(e) => setTenKhachHang(e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Số điện thoại liên hệ"
                                    required
                                    fullWidth
                                    value={soDienThoai}
                                    onChange={(e) => setSoDienThoai(e.target.value.replace(/\s/g, ''))}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Giới tính</InputLabel>
                                    <Select
                                        value={gioiTinh}
                                        label="Giới tính"
                                        onChange={(e) => setGioiTinh(e.target.value)}
                                    >
                                        <MenuItem value="Nam">👨 Nam</MenuItem>
                                        <MenuItem value="Nữ">👩 Nữ</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Ngày sinh nhật (DD/MM/YYYY)"
                                    fullWidth
                                    value={ngaySinhNhat}
                                    onChange={(e) => setNgaySinhNhat(e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Ngày cấp CCCD"
                                    fullWidth
                                    value={ngayCapCCCD}
                                    onChange={(e) => setNgayCapCCCD(e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Địa chỉ cư trú"
                                    required
                                    fullWidth
                                    value={diaChi}
                                    onChange={(e) => setDiaChi(e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Mã đăng nhập App khách hàng"
                                    fullWidth
                                    value={maDangNhap}
                                    onChange={(e) => setMaDangNhap(e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Link Facebook / UID Facebook"
                                    fullWidth
                                    value={facebookId}
                                    onChange={handleFacebookLinkChange}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc' }}>
                    <Button onClick={() => setOpenEditDialog(false)} color="inherit" sx={{ fontWeight: 600 }}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        className="btn-add-customer"
                        onClick={handleUpdateCustomer}
                        startIcon={<i className="fa-solid fa-check"></i>}
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                    >
                        Lưu Cập Nhật
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default QuanLyKhachHang;
