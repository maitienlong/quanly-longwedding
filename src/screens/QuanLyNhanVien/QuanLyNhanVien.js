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

    const commonHeight = 56;

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
            permission: Number(permission)
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
            permission: Number(permission)
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
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '1rem', color: '#333' }}>
                                        {user.fullname || user.username}
                                    </Typography>
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
                                            <Typography variant="caption" color="text.secondary">Ngày sinh</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{user.birthday || '-'}</Typography>
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
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '60px' }}>STT</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '180px' }}>TÊN ĐĂNG NHẬP</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '220px' }}>HỌ VÀ TÊN</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '160px' }}>NGÀY SINH</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '180px' }}>CHỨC VỤ</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '150px' }}>QUYỀN HẠN</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '200px' }}>HÀNH ĐỘNG</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" style={{ padding: '30px', color: '#999' }}>
                                    Không tìm thấy tài khoản nhân viên nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user, idx) => (
                                <TableRow key={user.username} className="quanlynhanvien-row">
                                    <TableCell align="center">{idx + 1}</TableCell>
                                    <TableCell style={{ fontWeight: '500' }}>{user.username}</TableCell>
                                    <TableCell>{user.fullname || '-'}</TableCell>
                                    <TableCell align="center">{user.birthday || '-'}</TableCell>
                                    <TableCell>{user.positon || '-'}</TableCell>
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
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle style={{ fontWeight: 'bold', color: '#1976d2', borderBottom: '1px solid #eee' }}>
                    THÊM MỚI NHÂN VIÊN
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
                        <TextField
                            label="Tài khoản đăng nhập (Username)"
                            required
                            size="small"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                            placeholder="Ví dụ: nguyenvanan, sale_chithao..."
                        />
                        <TextField
                            label="Mật khẩu (Password)"
                            required
                            type="password"
                            size="small"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <TextField
                            label="Họ và tên nhân viên"
                            required
                            size="small"
                            fullWidth
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            placeholder="Ví dụ: Nguyễn Văn An"
                        />
                        <TextField
                            label="Ngày sinh nhật (DD/MM/YYYY)"
                            size="small"
                            fullWidth
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                            placeholder="Ví dụ: 25/12/1996"
                        />
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
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle style={{ fontWeight: 'bold', color: '#1976d2', borderBottom: '1px solid #eee' }}>
                    CẬP NHẬT THÔNG TIN NHÂN VIÊN
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
                        <TextField
                            label="Tài khoản đăng nhập (Username)"
                            disabled
                            size="small"
                            fullWidth
                            value={username}
                        />
                        <TextField
                            label="Mật khẩu mới (Bỏ trống nếu không muốn đổi)"
                            type="password"
                            size="small"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu mới nếu cần đổi..."
                        />
                        <TextField
                            label="Họ và tên nhân viên"
                            required
                            size="small"
                            fullWidth
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                        />
                        <TextField
                            label="Ngày sinh nhật (DD/MM/YYYY)"
                            size="small"
                            fullWidth
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                        />
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
