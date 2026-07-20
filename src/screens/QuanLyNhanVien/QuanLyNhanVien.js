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

import logoDefault from '../../assets/logo/BETA-1 VANG@4x.png';
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

    const commonHeight = 56;

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
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '150px' }}>HÀNH ĐỘNG</TableCell>
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
                                <TableRow key={user.username} className="quanlynhanvien-row">
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
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
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
        </div>
    );
}

export default QuanLyNhanVien;
