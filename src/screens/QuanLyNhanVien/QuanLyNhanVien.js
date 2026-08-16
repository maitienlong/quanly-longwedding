import React, { useState, useEffect } from 'react';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { toast } from 'sonner';
import './quanlynhanvien.css';

// Material UI components
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';

import logoDefault from '../../assets/logo/logo-vang.png';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

function QuanLyNhanVien() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { showLoading, hideLoading } = useLoading();
    const [users, setUsers] = useState([]);
    const [keyword, setKeyword] = useState('');

    // Dialog state
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);

    // Form fields state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullname, setFullname] = useState('');
    const [birthday, setBirthday] = useState('');
    const [positon, setPositon] = useState('Nhân viên');
    const [permission, setPermission] = useState(2); // 1: Admin, 2: Staff
    const [avatar, setAvatar] = useState('');
    const [luongCoBan, setLuongCoBan] = useState(0);
    const [luongHoaHong, setLuongHoaHong] = useState(0);
    const [loaiHoaHong, setLoaiHoaHong] = useState(0); // 0: VNĐ/công việc, 1: % doanh số
    const [chiTieuTuan, setChiTieuTuan] = useState(5);
    const [chiTieuThang, setChiTieuThang] = useState(20);
    const [chiTieuNam, setChiTieuNam] = useState(200);

    // Salary & Contract detail state
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [openSalaryDialog, setOpenSalaryDialog] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [allContractsList, setAllContractsList] = useState([]);

    const commonHeight = 56;

    const fetchAllContracts = () => {
        otherService.LIST_HOPDONG({})
            .then(res => {
                const list = res.data?.hopDong || res.data?.data?.hopDong || (Array.isArray(res.data) ? res.data : []);
                if (Array.isArray(list)) {
                    setAllContractsList(list);
                }
            })
            .catch(err => console.error("Lỗi lấy danh sách hợp đồng:", err));
    };

    const handleOpenSalaryDetail = (emp) => {
        setSelectedEmployee(emp);
        setSelectedMonth(new Date().getMonth() + 1);
        setSelectedYear(new Date().getFullYear());
        fetchAllContracts();
        setOpenSalaryDialog(true);
    };

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
        showLoading("Đang tải danh sách nhân viên...");
        otherService.findUsers({ keyword })
            .then(res => {
                if (res.data && res.data.status === 'success') {
                    setUsers(res.data.data.users || []);
                } else if (res.status === 'success') {
                    setUsers(res.data.users || []);
                } else {
                    setUsers(res.data?.users || []);
                }
            })
            .catch(err => {
                console.error(err);
                toast.error("Lỗi khi tải danh sách nhân viên: " + err.message);
            })
            .finally(() => hideLoading());
    };

    useEffect(() => {
        loadData();
        fetchAllContracts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = () => {
        loadData();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            loadData();
        }
    };

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setFullname('');
        setBirthday('');
        setPositon('Nhân viên');
        setPermission(2);
        setAvatar('');
        setLuongCoBan(0);
        setLuongHoaHong(0);
        setLoaiHoaHong(0);
        setChiTieuTuan(5);
        setChiTieuThang(20);
        setChiTieuNam(200);
    };

    const handleCreateUser = () => {
        if (!username.trim()) {
            toast.warning("Vui lòng nhập tài khoản đăng nhập!");
            return;
        }
        if (!password.trim()) {
            toast.warning("Vui lòng nhập mật khẩu!");
            return;
        }
        if (!fullname.trim()) {
            toast.warning("Vui lòng nhập họ và tên!");
            return;
        }

        const payload = {
            username: username.trim(),
            password: password,
            fullname: fullname.trim(),
            birthday: birthday.trim(),
            positon: positon,
            permission: Number(permission),
            avatar: avatar,
            luongCoBan: Number(luongCoBan) || 0,
            luongHoaHong: Number(luongHoaHong) || 0,
            loaiHoaHong: Number(loaiHoaHong) || 0,
            chiTieuTuan: Number(chiTieuTuan) || 0,
            chiTieuThang: Number(chiTieuThang) || 0,
            chiTieuNam: Number(chiTieuNam) || 0
        };

        showLoading("Đang tạo tài khoản nhân viên...");
        otherService.createUser(payload)
            .then(() => {
                toast.success("Tạo tài khoản nhân viên thành công!");
                setOpenAddDialog(false);
                resetForm();
                loadData();
            })
            .catch(err => {
                toast.error("Lỗi tạo nhân viên: " + err.message);
                hideLoading();
            });
    };

    const handleOpenEdit = (user) => {
        setUsername(user.username);
        setPassword(''); // do not pre-fill password for security
        setFullname(user.fullname || '');
        setBirthday(user.birthday || '');
        setPositon(user.positon || 'Nhân viên');
        setPermission(user.permission || 2);
        setAvatar(user.avatar || '');
        setLuongCoBan(user.luongCoBan || 0);
        setLuongHoaHong(user.luongHoaHong || 0);
        setLoaiHoaHong(user.loaiHoaHong || 0);
        setChiTieuTuan(user.chiTieuTuan !== undefined ? user.chiTieuTuan : 5);
        setChiTieuThang(user.chiTieuThang !== undefined ? user.chiTieuThang : 20);
        setChiTieuNam(user.chiTieuNam !== undefined ? user.chiTieuNam : 200);
        setOpenEditDialog(true);
    };

    const handleUpdateUser = () => {
        if (!fullname.trim()) {
            toast.warning("Vui lòng nhập họ và tên!");
            return;
        }

        const payload = {
            username: username,
            fullname: fullname.trim(),
            birthday: birthday.trim(),
            positon: positon,
            permission: Number(permission),
            avatar: avatar,
            luongCoBan: Number(luongCoBan) || 0,
            luongHoaHong: Number(luongHoaHong) || 0,
            loaiHoaHong: Number(loaiHoaHong) || 0,
            chiTieuTuan: Number(chiTieuTuan) || 0,
            chiTieuThang: Number(chiTieuThang) || 0,
            chiTieuNam: Number(chiTieuNam) || 0
        };

        if (password.trim()) {
            payload.password = password;
        }

        showLoading("Đang cập nhật tài khoản nhân viên...");
        otherService.updateUser(payload)
            .then(() => {
                toast.success("Cập nhật tài khoản nhân viên thành công!");
                setOpenEditDialog(false);
                resetForm();
                loadData();
            })
            .catch(err => {
                toast.error("Lỗi cập nhật nhân viên: " + err.message);
                hideLoading();
            });
    };

    const handleDeleteUser = (user) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản nhân viên "${user.fullname || user.username}" không?`)) {
            return;
        }

        showLoading("Đang xóa tài khoản nhân viên...");
        otherService.removeUser({ username: user.username })
            .then(() => {
                toast.success("Xóa tài khoản nhân viên thành công!");
                loadData();
            })
            .catch(err => {
                toast.error("Lỗi khi xóa nhân viên: " + err.message);
                hideLoading();
            });
    };

    return (
        <div className="quanlynhanvien-container" style={{ padding: isMobile ? '10px' : '20px', height: isMobile ? 'calc(100vh - 145px)' : 'auto', display: isMobile ? 'flex' : 'block', flexDirection: 'column' }}>
            {/* HEADER & FILTERS */}
            <div className="quanlynhanvien-header">
                <h2 style={{ color: '#0d1b3f', marginBottom: isMobile ? '12px' : '0' }}>QUẢN LÝ NHÂN VIÊN</h2>
                <Stack 
                    spacing={2} 
                    direction={isMobile ? 'column' : 'row'} 
                    sx={{ width: '100%', mb: 2 }}
                >
                    <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto', flex: 1, order: isMobile ? 1 : 3 }}>
                        <TextField
                            label="Tìm kiếm nhân viên..."
                            variant="outlined"
                            size={isMobile ? "small" : "medium"}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{ flexGrow: 1 }}
                            InputProps={{
                                sx: { height: isMobile ? 42 : commonHeight }
                            }}
                        />
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleSearch}
                            style={{ height: isMobile ? 42 : commonHeight }}
                        >
                            Tìm
                        </Button>
                    </div>

                    {!isMobile && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                resetForm();
                                setOpenAddDialog(true);
                            }}
                            startIcon={<i className="fa-solid fa-user-plus"></i>}
                            style={{ height: commonHeight, whiteSpace: 'nowrap', order: 4 }}
                        >
                            Thêm Nhân Viên
                        </Button>
                    )}
                </Stack>
                {isMobile && (
                    <div 
                        style={{ 
                            width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#1976d2', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            color: 'white', fontSize: '24px', opacity: 0.8,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)', position: 'fixed', bottom: '90px', right: '20px', zIndex: 1000, cursor: 'pointer'
                        }}
                        onClick={() => {
                            resetForm();
                            setOpenAddDialog(true);
                        }}
                    >
                        <i className="fa-solid fa-user-plus"></i>
                    </div>
                )}
            </div>

            {/* EMPLOYEES TABLE */}
            {isMobile ? (
                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
                    <Stack spacing={2}>
                    {users.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                            Không tìm thấy tài khoản nhân viên nào.
                        </div>
                    ) : (
                        users.map((user, idx) => (
                            <Card key={user.username} sx={{ mb: 2, borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <Avatar src={user.avatar || logoDefault} sx={{ width: 40, height: 40, border: '2px solid #1976d2' }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '1rem', color: '#333' }}>
                                            {user.fullname || user.username}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip 
                                            label={user.permission === 1 ? 'Admin' : 'Nhân viên'} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: user.permission === 1 ? '#d32f2f' : '#2980b9', 
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                fontSize: '0.75rem',
                                                height: '24px'
                                            }} 
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ p: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Tên đăng nhập</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{user.username}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Chức vụ</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{user.positon || '-'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Lương cơ bản</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                                {Number(user.luongCoBan || 0).toLocaleString('vi-VN')} đ
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Hoa hồng</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
                                                {user.loaiHoaHong === 1 ? `${user.luongHoaHong || 0}% doanh số` : `${Number(user.luongHoaHong || 0).toLocaleString('vi-VN')} đ/CV`}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="caption" color="text.secondary">Chỉ tiêu (Tuần/Tháng/Năm)</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {user.chiTieuTuan || 5} CV/tuần | {user.chiTieuThang || 20} CV/tháng | {user.chiTieuNam || 200} CV/năm
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="info"
                                                    onClick={() => handleOpenSalaryDetail(user)}
                                                    startIcon={<i className="fa-solid fa-file-invoice-dollar"></i>}
                                                    sx={{ fontWeight: 700 }}
                                                >
                                                    Lương & HĐ
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => handleOpenEdit(user)}
                                                    startIcon={<i className="fa-solid fa-pen"></i>}
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleDeleteUser(user)}
                                                    startIcon={<i className="fa-solid fa-trash"></i>}
                                                >
                                                    Xóa
                                                </Button>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Card>
                        ))
                    )}
                    </Stack>
                </div>
            ) : (
            <TableContainer component={Paper} elevation={3} style={{ borderRadius: '8px', overflow: 'auto', marginTop: '20px', maxHeight: 'calc(100vh - 280px)' }}>
                <Table stickyHeader>
                    <TableHead sx={{ '& th': { backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold' } }}>
                        <TableRow>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '50px' }}>STT</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '80px' }}>AVATAR</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '140px' }}>TÊN ĐĂNG NHẬP</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '180px' }}>HỌ VÀ TÊN</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '140px' }}>CHỨC VỤ</TableCell>
                            <TableCell align="right" style={{ fontWeight: 'bold', width: '140px' }}>LƯƠNG CƠ BẢN</TableCell>
                            <TableCell align="right" style={{ fontWeight: 'bold', width: '150px' }}>LƯƠNG HOA HỒNG</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '180px' }}>CHỈ TIÊU (T/TH/N)</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '120px' }}>QUYỀN HẠN</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '220px' }}>HÀNH ĐỘNG</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center" style={{ padding: '30px', color: '#999' }}>
                                    Không tìm thấy tài khoản nhân viên nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user, idx) => (
                                <TableRow key={user.username} className="quanlynhanvien-row" style={{ cursor: 'pointer' }} onClick={() => handleOpenSalaryDetail(user)}>
                                    <TableCell align="center">{idx + 1}</TableCell>
                                    <TableCell align="center">
                                        <Avatar src={user.avatar || logoDefault} sx={{ width: 38, height: 38, border: '1px solid #e0e0e0', margin: 'auto' }} />
                                    </TableCell>
                                    <TableCell style={{ fontWeight: '500' }}>{user.username}</TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>{user.fullname || '-'}</TableCell>
                                    <TableCell>{user.positon || '-'}</TableCell>
                                    <TableCell align="right" style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                        {Number(user.luongCoBan || 0).toLocaleString('vi-VN')} đ
                                    </TableCell>
                                    <TableCell align="right" style={{ fontWeight: 'bold', color: '#ed6c02' }}>
                                        {user.loaiHoaHong === 1 ? `${user.luongHoaHong || 0}% doanh số` : `${Number(user.luongHoaHong || 0).toLocaleString('vi-VN')} đ/CV`}
                                    </TableCell>
                                    <TableCell align="center" style={{ fontSize: '0.85rem' }}>
                                        <b>{user.chiTieuTuan || 5}</b> T | <b>{user.chiTieuThang || 20}</b> Th | <b>{user.chiTieuNam || 200}</b> N
                                    </TableCell>
                                    <TableCell align="center">
                                        {user.permission === 1 ? (
                                            <span className="badge badge-admin">Quản trị viên</span>
                                        ) : (
                                            <span className="badge badge-staff">Nhân viên</span>
                                        )}
                                    </TableCell>
                                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="info"
                                                onClick={() => handleOpenSalaryDetail(user)}
                                                startIcon={<i className="fa-solid fa-file-invoice-dollar"></i>}
                                                sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                                            >
                                                Lương & HĐ
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => handleOpenEdit(user)}
                                                startIcon={<i className="fa-solid fa-pen"></i>}
                                            >
                                                Sửa
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleDeleteUser(user)}
                                                startIcon={<i className="fa-solid fa-trash"></i>}
                                            >
                                                Xóa
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            )}

            {/* DIALOG ADD EMPLOYEE */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle style={{ fontWeight: 'bold', color: '#1976d2', borderBottom: '1px solid #eee' }}>
                    THÊM MỚI NHÂN VIÊN
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        {/* AVATAR UPLOAD */}
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mb={1}>
                            <Box position="relative">
                                <Avatar
                                    src={avatar || logoDefault}
                                    alt="avatar"
                                    sx={{ width: 90, height: 90, border: '3px solid #1976d2', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}
                                />
                                <label htmlFor="add-user-avatar-upload" style={{ position: 'absolute', bottom: -4, right: -4 }}>
                                    <input
                                        accept="image/*"
                                        id="add-user-avatar-upload"
                                        type="file"
                                        style={{ display: 'none' }}
                                        onChange={handleAvatarChange}
                                    />
                                    <IconButton color="primary" aria-label="upload picture" component="span" sx={{ bgcolor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', '&:hover': { bgcolor: '#f0f0f0' } }}>
                                        <PhotoCamera fontSize="small" />
                                    </IconButton>
                                </label>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                Mặc định: Logo Long Wedding (Bấm icon máy ảnh để đổi)
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Tài khoản đăng nhập (Username)"
                                    required
                                    size="small"
                                    fullWidth
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                    placeholder="Ví dụ: nguyenvanan, sale_chithao..."
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Mật khẩu (Password)"
                                    required
                                    type="password"
                                    size="small"
                                    fullWidth
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Họ và tên nhân viên"
                                    required
                                    size="small"
                                    fullWidth
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    placeholder="Ví dụ: Nguyễn Văn An"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Ngày sinh nhật (DD/MM/YYYY)"
                                    size="small"
                                    fullWidth
                                    value={birthday}
                                    onChange={(e) => setBirthday(e.target.value)}
                                    placeholder="Ví dụ: 25/12/1996"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Chức vụ (Role)</InputLabel>
                                    <Select
                                        value={positon}
                                        label="Chức vụ (Role)"
                                        onChange={(e) => setPositon(e.target.value)}
                                    >
                                        <MenuItem value="Quản lý">Quản lý</MenuItem>
                                        <MenuItem value="Nhân viên Sale">Nhân viên Sale</MenuItem>
                                        <MenuItem value="Thợ chụp hình">Thợ chụp hình</MenuItem>
                                        <MenuItem value="Thợ trang điểm">Thợ trang điểm</MenuItem>
                                        <MenuItem value="Thợ chỉnh ảnh">Thợ chỉnh ảnh</MenuItem>
                                        <MenuItem value="Nhân viên phục vụ">Nhân viên phục vụ</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Quyền hạn trên hệ thống</InputLabel>
                                    <Select
                                        value={permission}
                                        label="Quyền hạn trên hệ thống"
                                        onChange={(e) => setPermission(e.target.value)}
                                    >
                                        <MenuItem value={1}>Quản trị viên (Admin)</MenuItem>
                                        <MenuItem value={2}>Nhân viên (Staff)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2', mt: 1 }}>
                            THÔNG TIN LƯƠNG & HOA HỒNG
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Lương cơ bản (VNĐ/tháng)"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={luongCoBan}
                                    onChange={(e) => setLuongCoBan(e.target.value)}
                                    placeholder="Ví dụ: 7000000"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Loại hoa hồng</InputLabel>
                                    <Select
                                        value={loaiHoaHong}
                                        label="Loại hoa hồng"
                                        onChange={(e) => setLoaiHoaHong(Number(e.target.value))}
                                    >
                                        <MenuItem value={0}>VNĐ / mỗi công việc</MenuItem>
                                        <MenuItem value={1}>% Doanh số hợp đồng</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label={loaiHoaHong === 1 ? "Mức hoa hồng (%)" : "Mức hoa hồng (VNĐ/công việc)"}
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={luongHoaHong}
                                    onChange={(e) => setLuongHoaHong(e.target.value)}
                                    placeholder={loaiHoaHong === 1 ? "Ví dụ: 5" : "Ví dụ: 100000"}
                                />
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2', mt: 1 }}>
                            CHỈ TIÊU CÔNG VIỆC (KPI TARGETS)
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Chỉ tiêu Tuần (Số CV)"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={chiTieuTuan}
                                    onChange={(e) => setChiTieuTuan(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Chỉ tiêu Tháng (Số CV)"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={chiTieuThang}
                                    onChange={(e) => setChiTieuThang(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Chỉ tiêu Năm (Số CV)"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={chiTieuNam}
                                    onChange={(e) => setChiTieuNam(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
                    <Button onClick={() => setOpenAddDialog(false)} color="inherit">
                        Hủy
                    </Button>
                    <Button onClick={handleCreateUser} variant="contained" color="primary">
                        Thêm nhân viên
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DIALOG EDIT EMPLOYEE */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle style={{ fontWeight: 'bold', color: '#1976d2', borderBottom: '1px solid #eee' }}>
                    CẬP NHẬT THÔNG TIN NHÂN VIÊN
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        {/* AVATAR UPLOAD */}
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mb={1}>
                            <Box position="relative">
                                <Avatar
                                    src={avatar || logoDefault}
                                    alt="avatar"
                                    sx={{ width: 90, height: 90, border: '3px solid #1976d2', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}
                                />
                                <label htmlFor="edit-user-avatar-upload" style={{ position: 'absolute', bottom: -4, right: -4 }}>
                                    <input
                                        accept="image/*"
                                        id="edit-user-avatar-upload"
                                        type="file"
                                        style={{ display: 'none' }}
                                        onChange={handleAvatarChange}
                                    />
                                    <IconButton color="primary" aria-label="upload picture" component="span" sx={{ bgcolor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', '&:hover': { bgcolor: '#f0f0f0' } }}>
                                        <PhotoCamera fontSize="small" />
                                    </IconButton>
                                </label>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                Mặc định: Logo Long Wedding (Bấm icon máy ảnh để đổi)
                            </Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Tài khoản đăng nhập (Username)"
                                    disabled
                                    size="small"
                                    fullWidth
                                    value={username}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Mật khẩu mới (Bỏ trống nếu không đổi)"
                                    type="password"
                                    size="small"
                                    fullWidth
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới..."
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Họ và tên nhân viên"
                                    required
                                    size="small"
                                    fullWidth
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Ngày sinh nhật (DD/MM/YYYY)"
                                    size="small"
                                    fullWidth
                                    value={birthday}
                                    onChange={(e) => setBirthday(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Chức vụ (Role)</InputLabel>
                                    <Select
                                        value={positon}
                                        label="Chức vụ (Role)"
                                        onChange={(e) => setPositon(e.target.value)}
                                    >
                                        <MenuItem value="Quản lý">Quản lý</MenuItem>
                                        <MenuItem value="Nhân viên Sale">Nhân viên Sale</MenuItem>
                                        <MenuItem value="Thợ chụp hình">Thợ chụp hình</MenuItem>
                                        <MenuItem value="Thợ trang điểm">Thợ trang điểm</MenuItem>
                                        <MenuItem value="Thợ chỉnh ảnh">Thợ chỉnh ảnh</MenuItem>
                                        <MenuItem value="Nhân viên phục vụ">Nhân viên phục vụ</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Quyền hạn trên hệ thống</InputLabel>
                                    <Select
                                        value={permission}
                                        label="Quyền hạn trên hệ thống"
                                        onChange={(e) => setPermission(e.target.value)}
                                    >
                                        <MenuItem value={1}>Quản trị viên (Admin)</MenuItem>
                                        <MenuItem value={2}>Nhân viên (Staff)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2', mt: 1 }}>
                            THÔNG TIN LƯƠNG & HOA HỒNG
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Lương cơ bản (VNĐ/tháng)"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={luongCoBan}
                                    onChange={(e) => setLuongCoBan(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Loại hoa hồng</InputLabel>
                                    <Select
                                        value={loaiHoaHong}
                                        label="Loại hoa hồng"
                                        onChange={(e) => setLoaiHoaHong(Number(e.target.value))}
                                    >
                                        <MenuItem value={0}>VNĐ / mỗi công việc</MenuItem>
                                        <MenuItem value={1}>% Doanh số hợp đồng</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label={loaiHoaHong === 1 ? "Mức hoa hồng (%)" : "Mức hoa hồng (VNĐ/công việc)"}
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={luongHoaHong}
                                    onChange={(e) => setLuongHoaHong(e.target.value)}
                                />
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2', mt: 1 }}>
                            CHỈ TIÊU CÔNG VIỆC (KPI TARGETS)
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Chỉ tiêu Tuần (Số CV)"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={chiTieuTuan}
                                    onChange={(e) => setChiTieuTuan(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Chỉ tiêu Tháng (Số CV)"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={chiTieuThang}
                                    onChange={(e) => setChiTieuThang(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Chỉ tiêu Năm (Số CV)"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={chiTieuNam}
                                    onChange={(e) => setChiTieuNam(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
                    <Button onClick={() => setOpenEditDialog(false)} color="inherit">
                        Hủy
                    </Button>
                    <Button onClick={handleUpdateUser} variant="contained" color="primary">
                        Cập nhật
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DIALOG CHI TIẾT LƯƠNG & HỢP ĐỒNG THEO THÁNG */}
            <Dialog
                open={openSalaryDialog}
                onClose={() => setOpenSalaryDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    style: {
                        borderRadius: 16,
                        overflow: 'hidden'
                    }
                }}
            >
                {selectedEmployee && (
                    <>
                        {/* Modal Header */}
                        <Box sx={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', p: 2.5, position: 'relative' }}>
                            <IconButton
                                size="small"
                                onClick={() => setOpenSalaryDialog(false)}
                                sx={{ position: 'absolute', top: 12, right: 12, color: '#94a3b8', '&:hover': { color: '#fff' } }}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </IconButton>

                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar src={selectedEmployee.avatar || logoDefault} sx={{ width: 60, height: 60, border: '2px solid #38bdf8' }} />
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>
                                        {selectedEmployee.fullname || selectedEmployee.username}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                                        <Chip label={selectedEmployee.positon || 'Nhân viên'} size="small" sx={{ bgcolor: '#0284c7', color: '#fff', fontWeight: 700, height: 22, fontSize: '0.72rem' }} />
                                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>@{selectedEmployee.username}</Typography>
                                    </Stack>
                                </Box>
                            </Stack>
                        </Box>

                        <DialogContent style={{ padding: '20px' }}>
                            {/* Thanh Lọc Tháng / Năm */}
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} p={1.5} bgcolor="#f8fafc" borderRadius="12px" border="1px solid #e2e8f0">
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                    📅 BẢNG KÊ LƯƠNG & CÔNG VIỆC {selectedMonth === 0 ? `TẤT CẢ CÁC THÁNG NĂM ${selectedYear}` : `THÁNG ${selectedMonth}/${selectedYear}`}
                                </Typography>
                                
                                <Stack direction="row" spacing={1.5}>
                                    <FormControl size="small" sx={{ minWidth: 140 }}>
                                        <InputLabel>Tháng</InputLabel>
                                        <Select
                                            value={selectedMonth}
                                            label="Tháng"
                                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                            sx={{ bgcolor: '#fff' }}
                                        >
                                            <MenuItem value={0}>Tất cả các tháng</MenuItem>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                                <MenuItem key={m} value={m}>Tháng {m}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: 100 }}>
                                        <InputLabel>Năm</InputLabel>
                                        <Select
                                            value={selectedYear}
                                            label="Năm"
                                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                                            sx={{ bgcolor: '#fff' }}
                                        >
                                            {[2024, 2025, 2026, 2027].map(y => (
                                                <MenuItem key={y} value={y}>Năm {y}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Stack>
                            </Box>

                            {/* Tính toán số liệu & hợp đồng */}
                            {(() => {
                                const fn = (selectedEmployee.fullname || '').trim().toLowerCase();
                                const un = (selectedEmployee.username || '').trim().toLowerCase();

                                // Lọc các hợp đồng mà nhân viên làm trong tháng/năm đã chọn
                                const myMonthContracts = allContractsList.filter(contract => {
                                    // 1. Kiểm tra ngày tháng
                                    if (selectedMonth !== 0) {
                                        const rawDate = contract.ngayHopDong || contract.createdAt || contract.ngayTao || contract.cacNgay?.ngayChup;
                                        if (!rawDate) return false;
                                        const d = new Date(rawDate);
                                        if (isNaN(d.getTime())) return false;
                                        if (d.getMonth() + 1 !== selectedMonth || d.getFullYear() !== selectedYear) return false;
                                    } else {
                                        const rawDate = contract.ngayHopDong || contract.createdAt || contract.ngayTao || contract.cacNgay?.ngayChup;
                                        if (rawDate) {
                                            const d = new Date(rawDate);
                                            if (!isNaN(d.getTime()) && d.getFullYear() !== selectedYear) return false;
                                        }
                                    }

                                    // 2. Kiểm tra nhân viên có phụ trách hợp đồng này không
                                    const npv = contract.nguoiPhucVu || {};
                                    const staffList = [
                                        npv.thoChupHinh,
                                        npv.thoChinhAnh,
                                        npv.thoMakeUp,
                                        npv.banHang,
                                        npv.phucVu,
                                        contract.createBy,
                                        contract.nguoiTao,
                                        contract.nhanVien,
                                        contract.nhanVienTuVan
                                    ].filter(Boolean).map(s => String(s).trim().toLowerCase());

                                    return staffList.some(s => 
                                        s === fn || 
                                        s === un || 
                                        (fn && (s.includes(fn) || fn.includes(s))) ||
                                        (un && (s.includes(un) || un.includes(s)))
                                    );
                                });

                                const workCount = myMonthContracts.length;
                                const chiTieuThang = Number(selectedEmployee.chiTieuThang || 20);
                                const luongCoBan = Number(selectedEmployee.luongCoBan || 0);
                                const luongHoaHong = Number(selectedEmployee.luongHoaHong || 0);
                                const loaiHoaHong = Number(selectedEmployee.loaiHoaHong || 0);

                                // Tổng doanh số các hợp đồng phụ trách
                                const tongDoanhSo = myMonthContracts.reduce((sum, c) => {
                                    const val = c.thanhToan?.tongGiaTriSauGiam || c.thanhToan?.tongGiaTri || 0;
                                    return sum + Number(val);
                                }, 0);

                                // Tính hoa hồng
                                let hoaHongTotal = 0;
                                if (loaiHoaHong === 1) {
                                    hoaHongTotal = (tongDoanhSo * luongHoaHong) / 100;
                                } else {
                                    hoaHongTotal = workCount * luongHoaHong;
                                }

                                // Vượt chỉ tiêu
                                const exceededCount = Math.max(0, workCount - chiTieuThang);
                                const thuongVuot = exceededCount * 200000; // 200k / HĐ vượt
                                const tongLuongThang = luongCoBan + hoaHongTotal + thuongVuot;

                                // Hàm nhận diện vai trò trong HĐ
                                const getAssignedRoles = (c) => {
                                    const npv = c.nguoiPhucVu || {};
                                    const roles = [];
                                    const check = (val) => {
                                        if (!val) return false;
                                        const clean = String(val).trim().toLowerCase();
                                        return clean === fn || clean === un || (fn && clean.includes(fn)) || (un && clean.includes(un));
                                    };

                                    if (check(npv.thoChupHinh)) roles.push('📸 Chụp hình');
                                    if (check(npv.thoMakeUp)) roles.push('💄 Make-up');
                                    if (check(npv.thoChinhAnh)) roles.push('🎨 Chỉnh ảnh');
                                    if (check(npv.banHang)) roles.push('💼 Tư vấn');
                                    if (check(npv.phucVu)) roles.push('👥 Phục vụ');
                                    if (check(c.createBy) || check(c.nguoiTao)) roles.push('📝 Tạo HĐ');
                                    
                                    return roles.length > 0 ? roles.join(', ') : 'Thành viên ekip';
                                };

                                return (
                                    <Stack spacing={2.5}>
                                        {/* Cards Tổng Quan Lương */}
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={3}>
                                                <Paper variant="outlined" sx={{ p: 1.8, bgcolor: '#f0f9ff', borderColor: '#bae6fd', borderRadius: '12px' }}>
                                                    <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 600, display: 'block' }}>💼 Hợp đồng đã làm</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0284c7', mt: 0.5 }}>
                                                        {workCount} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/ {chiTieuThang} HĐ</span>
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <Paper variant="outlined" sx={{ p: 1.8, bgcolor: '#f0fdf4', borderColor: '#bbf7d0', borderRadius: '12px' }}>
                                                    <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600, display: 'block' }}>💵 Lương cơ bản</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5 }}>
                                                        {luongCoBan.toLocaleString('vi-VN')} đ
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <Paper variant="outlined" sx={{ p: 1.8, bgcolor: '#fffbeb', borderColor: '#fde68a', borderRadius: '12px' }}>
                                                    <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 600, display: 'block' }}>🎁 Hoa hồng & Thưởng</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#d97706', mt: 0.5 }}>
                                                        {(hoaHongTotal + thuongVuot).toLocaleString('vi-VN')} đ
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <Paper variant="outlined" sx={{ p: 1.8, bgcolor: '#eff6ff', borderColor: '#93c5fd', borderRadius: '12px' }}>
                                                    <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 700, display: 'block' }}>👑 TỔNG LƯƠNG NHẬN</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#1d4ed8', mt: 0.5 }}>
                                                        {tongLuongThang.toLocaleString('vi-VN')} đ
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        </Grid>

                                        {/* Bảng Chi Tiết Hợp Đồng */}
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1 }}>
                                                📋 DANH SÁCH HỢP ĐỒNG THỰC HIỆN ({myMonthContracts.length} hợp đồng):
                                            </Typography>

                                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '10px', maxHeight: 320, overflowY: 'auto' }}>
                                                <Table size="small" stickyHeader>
                                                    <TableHead sx={{ '& th': { bgcolor: '#f1f5f9', fontWeight: 700, color: '#334155' } }}>
                                                        <TableRow>
                                                            <TableCell align="center">STT</TableCell>
                                                            <TableCell>MÃ HỢP ĐỒNG</TableCell>
                                                            <TableCell>KHÁCH HÀNG</TableCell>
                                                            <TableCell>VAI TRÒ PHỤ TRÁCH</TableCell>
                                                            <TableCell>NGÀY HỢP ĐỒNG</TableCell>
                                                            <TableCell align="right">GIÁ TRỊ HĐ</TableCell>
                                                            <TableCell align="right">HOA HỒNG THỰC TẾ</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {myMonthContracts.length === 0 ? (
                                                            <TableRow>
                                                                <TableCell colSpan={7} align="center" sx={{ py: 3, color: '#94a3b8' }}>
                                                                    Không có hợp đồng nào được thực hiện trong thời gian đã chọn.
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : (
                                                            myMonthContracts.map((c, idx) => {
                                                                const giaTri = c.thanhToan?.tongGiaTriSauGiam || c.thanhToan?.tongGiaTri || 0;
                                                                const hoaHongHD = loaiHoaHong === 1 ? (giaTri * luongHoaHong) / 100 : luongHoaHong;
                                                                const rolesAssigned = getAssignedRoles(c);

                                                                return (
                                                                    <TableRow key={c._id || idx} hover>
                                                                        <TableCell align="center">{idx + 1}</TableCell>
                                                                        <TableCell sx={{ fontWeight: 700, color: '#0284c7' }}>{c.maHopDong}</TableCell>
                                                                        <TableCell sx={{ fontWeight: 600 }}>{c.khachHang1?.tenKhachHang || 'Chưa cập nhật'}</TableCell>
                                                                        <TableCell>
                                                                            <Chip label={rolesAssigned} size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 600, fontSize: '0.72rem' }} />
                                                                        </TableCell>
                                                                        <TableCell>{c.ngayHopDong ? new Date(c.ngayHopDong).toLocaleDateString('vi-VN') : '-'}</TableCell>
                                                                        <TableCell align="right" sx={{ fontWeight: 600, color: '#334155' }}>
                                                                            {Number(giaTri).toLocaleString('vi-VN')} đ
                                                                        </TableCell>
                                                                        <TableCell align="right" sx={{ fontWeight: 700, color: '#16a34a' }}>
                                                                            +{Number(hoaHongHD).toLocaleString('vi-VN')} đ
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            })
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    </Stack>
                                );
                            })()}
                        </DialogContent>

                        <DialogActions style={{ padding: '16px 20px', bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                            <Button variant="contained" color="inherit" onClick={() => setOpenSalaryDialog(false)} style={{ borderRadius: 8 }}>
                                Đóng cửa sổ
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </div>
    );
}

export default QuanLyNhanVien;
