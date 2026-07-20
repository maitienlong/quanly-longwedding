import React, { useState, useEffect } from 'react';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { toast } from 'sonner';
import './quanlykhachhang.css';

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

function QuanLyKhachHang() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { showLoading, hideLoading } = useLoading();
    const [customers, setCustomers] = useState([]);
    const [keyword, setKeyword] = useState('');

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
        showLoading("Đang tải danh sách khách hàng...");
        otherService.findKhachHang({ keyword })
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

    const handleSearch = () => {
        loadData();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            loadData();
        }
    };

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
                         // Convert username to UID if available
                         if (res.data.uid) {
                             setFacebookId(res.data.uid);
                         }
                         // Only overwrite if the name field is currently empty
                         if (res.data.name && (!tenKhachHang || tenKhachHang.trim() === '')) {
                             setTenKhachHang(res.data.name);
                         }
                     }
                 })
                 .catch(err => console.log("Lỗi lấy thông tin FB:", err));
        }
    };

    return (
        <div className="quanlykhachhang-container" style={{ padding: isMobile ? '10px' : '20px', height: isMobile ? 'calc(100vh - 145px)' : 'auto', display: isMobile ? 'flex' : 'block', flexDirection: 'column' }}>
            {/* HEADER & FILTERS */}
            <div className="quanlykhachhang-header">
                <h2 style={{ color: '#0d1b3f', marginBottom: isMobile ? '12px' : '0' }}>QUẢN LÝ KHÁCH HÀNG</h2>
                <Stack 
                    spacing={2} 
                    direction={isMobile ? 'column' : 'row'} 
                    sx={{ width: '100%', mb: 2 }}
                >
                    <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto', flex: 1, order: isMobile ? 1 : 3 }}>
                        <TextField
                            label="Tìm kiếm khách hàng..."
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
                            Thêm Khách Hàng
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

            {/* CUSTOMERS TABLE */}
            {isMobile ? (
                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
                    <Stack spacing={2}>
                    {customers.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                            Không tìm thấy thông tin khách hàng nào.
                        </div>
                    ) : (
                        customers.map((cust, idx) => (
                            <Card key={cust._id} sx={{ mb: 2, borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <Avatar src={cust.avatar || logoDefault} sx={{ width: 40, height: 40, border: '2px solid #1976d2' }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '1rem', color: '#333' }}>
                                            {cust.tenKhachHang}
                                            {cust.facebookId && (
                                                <a href={`https://facebook.com/${cust.facebookId}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, color: '#1877f2' }} title="Mở Facebook khách hàng">
                                                    <i className="fa-brands fa-facebook"></i>
                                                </a>
                                            )}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip 
                                            label={cust.soHopDong > 0 ? `${cust.soHopDong} hợp đồng` : 'Chưa có HĐ'} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: cust.soHopDong > 0 ? '#2e7d32' : '#9e9e9e', 
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
                                            <Typography variant="caption" color="text.secondary">Số điện thoại</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{cust.soDienThoai}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Ngày sinh</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{cust.ngaySinhNhat || '-'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Giới tính</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{cust.gioiTinh || '-'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Địa chỉ</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{cust.diaChi}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => handleOpenEdit(cust)}
                                                    startIcon={<i className="fa-solid fa-pen"></i>}
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleDeleteCustomer(cust)}
                                                    startIcon={<i className="fa-solid fa-trash"></i>}
                                                    disabled={cust.soHopDong > 0}
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
                            <TableCell style={{ fontWeight: 'bold', width: '80px' }}>AVATAR</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '200px' }}>HỌ VÀ TÊN</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '150px' }}>SỐ ĐIỆN THOẠI</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '130px' }}>NGÀY SINH</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '110px' }}>GIỚI TÍNH</TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>ĐỊA CHỈ</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '160px' }}>SỐ HỢP ĐỒNG</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '180px' }}>HÀNH ĐỘNG</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" style={{ padding: '30px', color: '#999' }}>
                                    Không tìm thấy thông tin khách hàng nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((cust, idx) => (
                                <TableRow key={cust._id} className="quanlykhachhang-row">
                                    <TableCell align="center">{idx + 1}</TableCell>
                                    <TableCell align="center">
                                        <Avatar src={cust.avatar || logoDefault} sx={{ width: 38, height: 38, border: '1px solid #e0e0e0', margin: 'auto' }} />
                                    </TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>
                                        {cust.tenKhachHang}
                                        {cust.facebookId && (
                                            <a href={`https://facebook.com/${cust.facebookId}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, color: '#1877f2' }} title="Mở Facebook khách hàng">
                                                <i className="fa-brands fa-facebook"></i>
                                            </a>
                                        )}
                                    </TableCell>
                                    <TableCell>{cust.soDienThoai}</TableCell>
                                    <TableCell align="center">{cust.ngaySinhNhat || '-'}</TableCell>
                                    <TableCell align="center">{cust.gioiTinh || '-'}</TableCell>
                                    <TableCell>{cust.diaChi}</TableCell>
                                    <TableCell align="center">
                                        {cust.soHopDong > 0 ? (
                                            <span className="badge badge-active">{cust.soHopDong} hợp đồng</span>
                                        ) : (
                                            <span className="badge badge-none">Chưa có HĐ</span>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => handleOpenEdit(cust)}
                                                startIcon={<i className="fa-solid fa-pen"></i>}
                                            >
                                                Sửa
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleDeleteCustomer(cust)}
                                                startIcon={<i className="fa-solid fa-trash"></i>}
                                                disabled={cust.soHopDong > 0}
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

            {/* DIALOG ADD CUSTOMER */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle style={{ fontWeight: 'bold', color: '#1976d2', borderBottom: '1px solid #eee' }}>
                    THÊM MỚI KHÁCH HÀNG
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
                        {/* AVATAR UPLOAD */}
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mb={1}>
                            <Box position="relative">
                                <Avatar
                                    src={avatar || logoDefault}
                                    alt="avatar"
                                    sx={{ width: 90, height: 90, border: '3px solid #1976d2', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}
                                />
                                <label htmlFor="add-cust-avatar-upload" style={{ position: 'absolute', bottom: -4, right: -4 }}>
                                    <input
                                        accept="image/*"
                                        id="add-cust-avatar-upload"
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
                        <TextField
                            label="Họ và tên khách hàng"
                            required
                            size="small"
                            fullWidth
                            value={tenKhachHang}
                            onChange={(e) => setTenKhachHang(e.target.value)}
                            placeholder="Ví dụ: Nguyễn Văn A"
                        />
                        <TextField
                            label="Số điện thoại"
                            required
                            size="small"
                            fullWidth
                            value={soDienThoai}
                            onChange={(e) => setSoDienThoai(e.target.value.replace(/\s/g, ''))}
                            placeholder="Ví dụ: 0987654321"
                        />
                        <TextField
                            label="Địa chỉ cư trú"
                            required
                            size="small"
                            fullWidth
                            value={diaChi}
                            onChange={(e) => setDiaChi(e.target.value)}
                            placeholder="Ví dụ: 123 Nguyễn Trãi, Thanh Xuân, Hà Nội"
                        />
                        
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Ngày sinh nhật (DD/MM/YYYY)"
                                size="small"
                                fullWidth
                                value={ngaySinhNhat}
                                onChange={(e) => setNgaySinhNhat(e.target.value)}
                                placeholder="Ví dụ: 01/01/1995"
                            />
                            <FormControl size="small" style={{ minWidth: 150 }}>
                                <InputLabel>Giới tính</InputLabel>
                                <Select
                                    value={gioiTinh}
                                    label="Giới tính"
                                    onChange={(e) => setGioiTinh(e.target.value)}
                                >
                                    <MenuItem value="Nam">Nam</MenuItem>
                                    <MenuItem value="Nữ">Nữ</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>

                        <TextField
                            label="Ngày cấp CCCD"
                            size="small"
                            fullWidth
                            value={ngayCapCCCD}
                            onChange={(e) => setNgayCapCCCD(e.target.value)}
                            placeholder="Ví dụ: 15/08/2021"
                        />
                        
                        <TextField
                            label="Mã đăng nhập App khách hàng"
                            size="small"
                            fullWidth
                            value={maDangNhap}
                            onChange={(e) => setMaDangNhap(e.target.value)}
                            placeholder="Ví dụ: longwedding123 (mặc định abcd1234)"
                        />
                        
                        <TextField
                            label="Link Facebook / ID Facebook"
                            size="small"
                            fullWidth
                            value={facebookId}
                            onChange={handleFacebookLinkChange}
                            placeholder="Dán link facebook vào đây"
                        />
                    </Box>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
                    <Button onClick={() => setOpenAddDialog(false)} color="inherit">
                        Hủy
                    </Button>
                    <Button onClick={handleCreateCustomer} variant="contained" color="primary">
                        Thêm khách hàng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DIALOG EDIT CUSTOMER */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle style={{ fontWeight: 'bold', color: '#1976d2', borderBottom: '1px solid #eee' }}>
                    CẬP NHẬT THÔNG TIN KHÁCH HÀNG
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
                        {/* AVATAR UPLOAD */}
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mb={1}>
                            <Box position="relative">
                                <Avatar
                                    src={avatar || logoDefault}
                                    alt="avatar"
                                    sx={{ width: 90, height: 90, border: '3px solid #1976d2', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}
                                />
                                <label htmlFor="edit-cust-avatar-upload" style={{ position: 'absolute', bottom: -4, right: -4 }}>
                                    <input
                                        accept="image/*"
                                        id="edit-cust-avatar-upload"
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
                        <TextField
                            label="Họ và tên khách hàng"
                            required
                            size="small"
                            fullWidth
                            value={tenKhachHang}
                            onChange={(e) => setTenKhachHang(e.target.value)}
                        />
                        <TextField
                            label="Số điện thoại"
                            required
                            size="small"
                            fullWidth
                            value={soDienThoai}
                            onChange={(e) => setSoDienThoai(e.target.value)}
                        />
                        <TextField
                            label="Địa chỉ cư trú"
                            required
                            size="small"
                            fullWidth
                            value={diaChi}
                            onChange={(e) => setDiaChi(e.target.value)}
                        />
                        
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Ngày sinh nhật (DD/MM/YYYY)"
                                size="small"
                                fullWidth
                                value={ngaySinhNhat}
                                onChange={(e) => setNgaySinhNhat(e.target.value)}
                            />
                            <FormControl size="small" style={{ minWidth: 150 }}>
                                <InputLabel>Giới tính</InputLabel>
                                <Select
                                    value={gioiTinh}
                                    label="Giới tính"
                                    onChange={(e) => setGioiTinh(e.target.value)}
                                >
                                    <MenuItem value="Nam">Nam</MenuItem>
                                    <MenuItem value="Nữ">Nữ</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>

                        <TextField
                            label="Ngày cấp CCCD"
                            size="small"
                            fullWidth
                            value={ngayCapCCCD}
                            onChange={(e) => setNgayCapCCCD(e.target.value)}
                        />
                        
                        <TextField
                            label="Mã đăng nhập App khách hàng"
                            size="small"
                            fullWidth
                            value={maDangNhap}
                            onChange={(e) => setMaDangNhap(e.target.value)}
                        />
                        
                        <TextField
                            label="Link Facebook / ID Facebook"
                            size="small"
                            fullWidth
                            value={facebookId}
                            onChange={handleFacebookLinkChange}
                            placeholder="Dán link facebook vào đây"
                        />
                    </Box>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
                    <Button onClick={() => setOpenEditDialog(false)} color="inherit">
                        Hủy
                    </Button>
                    <Button onClick={handleUpdateCustomer} variant="contained" color="primary">
                        Cập nhật
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default QuanLyKhachHang;
