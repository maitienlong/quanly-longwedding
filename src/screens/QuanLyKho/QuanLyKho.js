import './quanlykho.css';
import React, { useState, useEffect } from 'react';
import { useLoading } from "../../context/LoadingContext";
import otherService from '../../API/services/otherService';
import ServiceDetailDialog from './ServiceDetailDialog';
import ServiceAddDialog from './ServiceAddDialog';
import { formatCurrency } from "../utils/formatCurrency.js";
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { toast } from 'sonner';
import { useContractTypes } from '../../hooks/useContractTypes';
import { updateContractTypesCache } from '../../utils/contractTypesHelper';

/* ==================== TRANG CHÍNH ==================== */
const QuanLyKho = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // TAB STATE
    const [activeTab, setActiveTab] = useState(0);

    // KHO / DICH VU STATE
    const [listSeviceAPI, setListSeviceAPI] = useState([]);
    const { showLoading, hideLoading } = useLoading();
    const [keyword, setKeyword] = useState("");
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    // CONTRACT TYPE STATE
    const { contractTypes } = useContractTypes();
    const [contractTypeKeyword, setContractTypeKeyword] = useState("");
    const [openTypeDialog, setOpenTypeDialog] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [typeName, setTypeName] = useState("");

    const commonHeight = 56;

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
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
            .then(res => res.status === 'success' && setListSeviceAPI(res.data.dichVu))
            .finally(() => hideLoading());
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

    return (
        <div className="content-wrapper-react" style={{ padding: isMobile ? '10px' : '20px', height: isMobile ? 'calc(100vh - 145px)' : 'auto', display: isMobile ? 'flex' : 'block', flexDirection: 'column' }}>
            
            {/* TABS HEADER */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '20px' }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="quản lý kho tabs">
                    <Tab label="Sản phẩm / Dịch vụ" />
                    <Tab label="Loại hợp đồng" />
                </Tabs>
            </Box>

            {activeTab === 0 ? (
                /* ================= TAB 1: SAN PHAM / DICH VU ================= */
                <>
                    <div className="content-header" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '20px', gap: isMobile ? '16px' : '0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'space-between' }}>
                            <h2 style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', marginBottom: 0 }}>QUẢN LÝ KHO</h2>
                            {isMobile && (
                                <div 
                                    style={{ 
                                        width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#1976d2', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        color: 'white', fontSize: '24px', opacity: 0.8,
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)', position: 'fixed', bottom: '90px', right: '20px', zIndex: 1000, cursor: 'pointer'
                                    }}
                                    onClick={() => setOpenAddDialog(true)}
                                >
                                    <i className="fa-solid fa-plus"></i>
                                </div>
                            )}
                        </div>
                        <div className="filters" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px' }}>
                            <TextField id="outlined-basic" label="Tìm kiếm" variant="outlined" InputProps={{
                                sx: { height: isMobile ? 42 : commonHeight }
                            }}
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                size={isMobile ? "small" : "medium"}
                                sx={{ width: isMobile ? '100%' : 'auto' }}
                            />

                            {!isMobile && (
                                <Button
                                    variant="contained"
                                    onClick={() => setOpenAddDialog(true)}
                                    sx={{
                                        height: commonHeight,
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Thêm
                                </Button>
                            )}
                        </div>
                    </div>

                    {isMobile ? (
                        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
                            <Stack spacing={2}>
                            {listSeviceAPI
                                .filter(item => 
                                    !keyword || 
                                    item.maDichVu.toLowerCase().includes(keyword.toLowerCase()) || 
                                    item.tenDichVu.toLowerCase().includes(keyword.toLowerCase())
                                )
                                .map((data, index) => (
                                    <Card 
                                        key={data.maDichVu} 
                                        onClick={() => setSelectedService(data)}
                                        sx={{ 
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            border: selectedService?.maDichVu === data.maDichVu ? '2px solid #1976d2' : 'none'
                                        }}
                                    >
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                                    {data.tenDichVu}
                                                </Typography>
                                                <Typography variant="body2" sx={{ backgroundColor: '#e3f2fd', color: '#1976d2', px: 1, borderRadius: '4px', fontWeight: 'bold' }}>
                                                    Kho: {data.tonKhoDichVu}
                                                </Typography>
                                            </Box>
                                            
                                            <Grid container spacing={1}>
                                                <Grid item xs={5}><Typography variant="body2" color="textSecondary">Mã dịch vụ:</Typography></Grid>
                                                <Grid item xs={7}><Typography variant="body2">{data.maDichVu}</Typography></Grid>

                                                <Grid item xs={5}><Typography variant="body2" color="textSecondary">Giá thành:</Typography></Grid>
                                                <Grid item xs={7}><Typography variant="body2" fontWeight="bold" color="error.main">{data.giaTriDichVu ? formatCurrency(data.giaTriDichVu) : '0 đ'}</Typography></Grid>

                                                <Grid item xs={5}><Typography variant="body2" color="textSecondary">Giá thuê:</Typography></Grid>
                                                <Grid item xs={7}><Typography variant="body2" fontWeight="bold" color="success.main">{data.giaChoThueDichVu ? formatCurrency(data.giaChoThueDichVu) : '0 đ'}</Typography></Grid>

                                                {data.moTaDichVu && (
                                                    <>
                                                        <Grid item xs={12}><Typography variant="body2" color="textSecondary">Mô tả:</Typography></Grid>
                                                        <Grid item xs={12}><Typography variant="body2" sx={{ fontStyle: 'italic', color: '#555' }}>{data.moTaDichVu}</Typography></Grid>
                                                    </>
                                                )}
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))
                            }
                            {listSeviceAPI.filter(item => !keyword || item.maDichVu.toLowerCase().includes(keyword.toLowerCase()) || item.tenDichVu.toLowerCase().includes(keyword.toLowerCase())).length === 0 && (
                                <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                                    Không tìm thấy dịch vụ nào.
                                </div>
                            )}
                            </Stack>
                        </div>
                    ) : (
                        <TableContainer component={Paper} style={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}>
                            <Table stickyHeader aria-label="simple table">
                                <TableHead sx={{ '& th': { backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold' } }}>
                                    <TableRow>
                                        <TableCell align="center" style={{ width: '5%' }}>STT</TableCell>
                                        <TableCell style={{ width: '15%' }}>ID</TableCell>
                                        <TableCell style={{ width: '25%' }}>DỊCH VỤ</TableCell>
                                        <TableCell style={{ width: '15%' }}>GIÁ THÀNH</TableCell>
                                        <TableCell style={{ width: '15%' }}>GIÁ THUÊ</TableCell>
                                        <TableCell align="center" style={{ width: '10%' }}>TỒN KHO</TableCell>
                                        <TableCell style={{ width: '15%' }}>MÔ TẢ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {listSeviceAPI
                                        .filter(item => 
                                            !keyword || 
                                            item.maDichVu.toLowerCase().includes(keyword.toLowerCase()) || 
                                            item.tenDichVu.toLowerCase().includes(keyword.toLowerCase())
                                        )
                                        .map((data, index) => (
                                        <TableRow key={data.maDichVu}
                                            sx={{
                                                '&:nth-of-type(odd)': {
                                                    backgroundColor: '#f5f5f5c4',
                                                }, '&:last-child td, &:last-child th': { border: 0 }
                                            }}
                                            selected={selectedService?.maDichVu === data.maDichVu}
                                            onClick={() => setSelectedService(data)}
                                        >
                                            <TableCell align="center" component="th" scope="row">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>{data.maDichVu}</TableCell>
                                            <TableCell>{data.tenDichVu}</TableCell>
                                            <TableCell>{data.giaTriDichVu ? formatCurrency(data.giaTriDichVu) : '0 đ'}</TableCell>
                                            <TableCell>{data.giaChoThueDichVu ? formatCurrency(data.giaChoThueDichVu) : '0 đ'}</TableCell>
                                            <TableCell align="center">{data.tonKhoDichVu}</TableCell>
                                            <TableCell>{data.moTaDichVu}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </>
            ) : (
                /* ================= TAB 2: QUAN LY LOAI HOP DONG ================= */
                <>
                    <div className="content-header" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '20px', gap: isMobile ? '16px' : '0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'space-between' }}>
                            <h2 style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', marginBottom: 0 }}>QUẢN LÝ LOẠI HỢP ĐỒNG</h2>
                            {isMobile && (
                                <div 
                                    style={{ 
                                        width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#1976d2', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        color: 'white', fontSize: '24px', opacity: 0.8,
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)', position: 'fixed', bottom: '90px', right: '20px', zIndex: 1000, cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        setEditingType(null);
                                        setTypeName("");
                                        setOpenTypeDialog(true);
                                    }}
                                >
                                    <i className="fa-solid fa-plus"></i>
                                </div>
                            )}
                        </div>
                        <div className="filters" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px' }}>
                            <TextField id="type-search" label="Tìm kiếm loại hợp đồng" variant="outlined" InputProps={{
                                sx: { height: isMobile ? 42 : commonHeight }
                            }}
                                value={contractTypeKeyword}
                                onChange={(e) => setContractTypeKeyword(e.target.value)}
                                size={isMobile ? "small" : "medium"}
                                sx={{ width: isMobile ? '100%' : 'auto' }}
                            />

                            {!isMobile && (
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        setEditingType(null);
                                        setTypeName("");
                                        setOpenTypeDialog(true);
                                    }}
                                    sx={{
                                        height: commonHeight,
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Thêm loại hợp đồng
                                </Button>
                            )}
                        </div>
                    </div>

                    {isMobile ? (
                        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
                            <Stack spacing={2}>
                            {contractTypes
                                .filter(item => 
                                    !contractTypeKeyword || 
                                    item.name.toLowerCase().includes(contractTypeKeyword.toLowerCase()) ||
                                    String(item.id).includes(contractTypeKeyword)
                                )
                                .map((data, index) => (
                                    <Card key={data.id} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                                    {data.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ backgroundColor: '#e3f2fd', color: '#1976d2', px: 1, borderRadius: '4px', fontWeight: 'bold' }}>
                                                    ID: {data.id}
                                                </Typography>
                                            </Box>
                                            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                                <Button 
                                                    variant="outlined" 
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => {
                                                        setEditingType(data);
                                                        setTypeName(data.name);
                                                        setOpenTypeDialog(true);
                                                    }}
                                                    startIcon={<i className="fa-solid fa-pen-to-square"></i>}
                                                >
                                                    Sửa
                                                </Button>
                                                <Button 
                                                    variant="outlined" 
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteType(data)}
                                                    startIcon={<i className="fa-solid fa-trash-can"></i>}
                                                >
                                                    Xóa
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))
                            }
                            {contractTypes.filter(item => !contractTypeKeyword || item.name.toLowerCase().includes(contractTypeKeyword.toLowerCase()) || String(item.id).includes(contractTypeKeyword)).length === 0 && (
                                <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                                    Không tìm thấy loại hợp đồng nào.
                                </div>
                            )}
                            </Stack>
                        </div>
                    ) : (
                        <TableContainer component={Paper} style={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}>
                            <Table stickyHeader aria-label="contract types table">
                                <TableHead sx={{ '& th': { backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold' } }}>
                                    <TableRow>
                                        <TableCell align="center" style={{ width: '10%' }}>STT</TableCell>
                                        <TableCell style={{ width: '20%' }}>MÃ ID</TableCell>
                                        <TableCell style={{ width: '50%' }}>TÊN LOẠI HỢP ĐỒNG</TableCell>
                                        <TableCell align="center" style={{ width: '20%' }}>HÀNH ĐỘNG</TableCell>
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
                                        <TableRow key={data.id}
                                            sx={{
                                                '&:nth-of-type(odd)': {
                                                    backgroundColor: '#f5f5f5c4',
                                                }, '&:last-child td, &:last-child th': { border: 0 }
                                            }}
                                        >
                                            <TableCell align="center">{index + 1}</TableCell>
                                            <TableCell>{data.id}</TableCell>
                                            <TableCell>{data.name}</TableCell>
                                            <TableCell align="center">
                                                <Button 
                                                    variant="text" 
                                                    color="primary"
                                                    onClick={() => {
                                                        setEditingType(data);
                                                        setTypeName(data.name);
                                                        setOpenTypeDialog(true);
                                                    }}
                                                    sx={{ minWidth: '40px', marginRight: '10px' }}
                                                >
                                                    <i className="fa-solid fa-pen-to-square" style={{ fontSize: '1.1rem' }}></i>
                                                </Button>
                                                <Button 
                                                    variant="text" 
                                                    color="error"
                                                    onClick={() => handleDeleteType(data)}
                                                    sx={{ minWidth: '40px' }}
                                                >
                                                    <i className="fa-solid fa-trash-can" style={{ fontSize: '1.1rem' }}></i>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </>
            )}

            {/* Existing inventory dialogs */}
            <ServiceAddDialog
                open={openAddDialog}
                onClose={(data) => data && onSaveSuccess()}
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
            <Dialog open={openTypeDialog} onClose={() => setOpenTypeDialog(false)} fullWidth maxWidth="xs">
                <form onSubmit={handleSaveType}>
                    <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        {editingType ? "CẬP NHẬT LOẠI HỢP ĐỒNG" : "THÊM LOẠI HỢP ĐỒNG"}
                    </DialogTitle>
                    <DialogContent>
                        <Box mt={2}>
                            <TextField
                                label="Tên loại hợp đồng"
                                variant="outlined"
                                fullWidth
                                value={typeName}
                                onChange={(e) => setTypeName(e.target.value)}
                                required
                                autoFocus
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ padding: '16px 24px' }}>
                        <Button onClick={() => setOpenTypeDialog(false)} color="inherit">Hủy</Button>
                        <Button type="submit" variant="contained" color="primary">Lưu</Button>
                    </DialogActions>
                </form>
            </Dialog>

        </div>
    );
};

export default QuanLyKho;
