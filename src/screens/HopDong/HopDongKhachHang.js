import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { useContractTypes } from '../../hooks/useContractTypes';
import ThemHopDongKHDialog from './ThemHopDongKHDialog';
import { formatDate } from '../utils/convertDate';
import { formatLunarDateShort } from '../../utils/lunarDateUtils';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import IconButton from '@mui/material/IconButton';
import DetailHopDongKhachHangDialog from './DetailHopDongKhachHangDialog';

// getDichVuChinhLabel is now retrieved dynamically from useContractTypes hook

function HopDongKhachHang() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { getDichVuChinhLabel } = useContractTypes();
    const [hopDong, setHopDong] = useState([]);
    const { showLoading, hideLoading } = useLoading();

    // Lọc và Tìm kiếm
    const locThoiGian = [
        { label: 'Tất cả thời gian', id: 'all' },
        { label: 'Hôm nay', id: 'hôm nay' },
        { label: '1 tuần', id: '1 tuần' },
        { label: '1 tháng', id: '1 tháng' },
        { label: '4 tháng', id: '4 tháng' }
    ];

    const locTrangThai = [
        { label: 'Tất cả trạng thái', id: 'all' },
        { label: 'Tạo hợp đồng', id: 1 },
        { label: 'Chụp hình', id: 2 },
        { label: 'Hậu kỳ', id: 3 },
        { label: 'In ảnh', id: 4 },
        { label: 'Hoàn thành', id: 5 }
    ];

    const [selectedTime, setSelectedTime] = useState(locThoiGian[1]);
    const [selectedStatus, setSelectedStatus] = useState(locTrangThai[0]);
    const [searchInput, setSearchInput] = useState("");

    // LOGIC DIALOG KHÁCH HÀNG
    const [openDialogHD, setOpenDialogHD] = React.useState(false);
    const [openDetailDialog, setOpenDetailDialog] = React.useState(false);
    const [selectedValueDialog, setSelectedValueDialog] = React.useState({ data: "hello" });
    const [sendData, setSendData] = useState({});

    const handleClickOpenDialog = () => {
        setOpenDialogHD(true);
    };

    const loadHopDong = useCallback((timeVal, statusVal, searchVal) => {
        showLoading("Đang tải hợp đồng ...");
        const params = {};
        if (timeVal && timeVal !== 'all') {
            params.filter = timeVal;
        }
        if (statusVal && statusVal !== 'all') {
            params.status = statusVal;
        }
        if (searchVal) {
            params.keyword = searchVal;
        }

        otherService.LIST_HOPDONG(params)
            .then((response) => {
                console.log(response.data.hopDong);
                setHopDong(response.data.hopDong);
                hideLoading();
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                toast.error("Đã có lỗi rồi hai ơi: " + error.message);
                hideLoading();
            });
    }, [showLoading, hideLoading]);

    const handleCloseDialog = (value) => {
        setOpenDialogHD(false);
        setSelectedValueDialog(value);
        loadHopDong(selectedTime?.id, selectedStatus?.id, searchInput);
    };
    const handleClickOpenDetailDialog = () => {
        setOpenDetailDialog(true);
    };
    const handleCloseDetailDialog = (updated) => {
        setOpenDetailDialog(false);
        if (updated === true) {
            loadHopDong(selectedTime?.id, selectedStatus?.id, searchInput);
        }
    };

    const commonHeight = 56;

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadHopDong(selectedTime?.id, selectedStatus?.id, searchInput);
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [selectedTime?.id, selectedStatus?.id, searchInput, loadHopDong]);

    useEffect(() => {
        if (sendData && sendData._id) {
            const updatedHD = hopDong.find(hd => hd._id === sendData._id);
            if (updatedHD) {
                setSendData(updatedHD);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hopDong, sendData?._id]);

    const filteredHopDong = hopDong || [];

    const convertTrangThai = (giaiDoan) => {
        switch (giaiDoan) {
            case 1:
                return "Tạo hợp đồng";
            case 2:
                return "Chụp hình";
            case 3:
                return "Hậu kỳ";
            case 4:
                return "In ảnh";
            case 5:
                return "Hoàn thành";
            default:
                return "Giai đoạn " + giaiDoan;
        }
    };

    const getRowBackgroundColor = (giaiDoan) => {
        switch (giaiDoan) {
            case 1:
                return '#f3f4f6'; // Ghi (Grey) nhạt
            case 2:
                return '#fffbeb'; // Vàng (Yellow) nhạt
            case 3:
                return '#eff6ff'; // Xanh nước biển (Blue) nhạt
            case 4:
                return '#faf5f0'; // Nâu (Brown) nhạt
            case 5:
                return '#f0fdf4'; // Xanh lá cây (Green) nhạt
            default:
                return 'inherit';
        }
    };

    return (
        <div className="hopdongkhachhang">
            <div className="content-header">
                <h2>QUẢN LÝ HỢP ĐỒNG KHÁCH HÀNG</h2>
                <Stack 
                    spacing={2} 
                    direction={isMobile ? 'column' : 'row'} 
                    sx={{ width: '100%', mb: 2 }}
                >
                    <TextField
                        id="outlined-basic"
                        label="Tìm kiếm (Mã HĐ, SĐT, Tên)"
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        InputProps={{
                            sx: { height: isMobile ? 42 : commonHeight }
                        }}
                        sx={{ width: isMobile ? '100%' : 280, order: isMobile ? 1 : 3 }}
                    />
                    
                    <Stack direction="row" spacing={2} sx={{ width: isMobile ? '100%' : 'auto', order: isMobile ? 2 : 1 }}>
                        <Autocomplete
                            disablePortal
                            options={locThoiGian}
                            value={selectedTime}
                            onChange={(event, newValue) => {
                                setSelectedTime(newValue || locThoiGian[0]);
                            }}
                            getOptionLabel={(option) => option.label}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            size={isMobile ? "small" : "medium"}
                            sx={{ flex: 1, minWidth: isMobile ? 0 : 220 }}
                            renderInput={(params) => <TextField {...params} label="Lọc theo thời gian" sx={{ '& .MuiInputBase-root': { height: isMobile ? 42 : commonHeight } }} />}
                        />

                        <Autocomplete
                            disablePortal
                            options={locTrangThai}
                            value={selectedStatus}
                            onChange={(event, newValue) => {
                                setSelectedStatus(newValue || locTrangThai[0]);
                            }}
                            getOptionLabel={(option) => option.label}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            size={isMobile ? "small" : "medium"}
                            sx={{ flex: 1, minWidth: isMobile ? 0 : 220 }}
                            renderInput={(params) => <TextField {...params} label="Lọc theo trạng thái" sx={{ '& .MuiInputBase-root': { height: isMobile ? 42 : commonHeight } }} />}
                        />
                    </Stack>

                    {!isMobile && (
                        <Button
                            onClick={handleClickOpenDialog}
                            variant="contained"
                            sx={{
                                height: commonHeight, // Ép chiều cao bằng với các input trên
                                whiteSpace: 'nowrap',  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                                order: 4
                            }}
                        >Thêm Hợp Đồng</Button>
                    )}
                </Stack>
            </div>

            {/* ===== DANH SÁCH HỢP ĐỒNG ===== */}
            {isMobile ? (
                <Box sx={{ pb: 10 }}>
                    {hopDong && hopDong.length > 0 ? (
                        filteredHopDong.map((hd, index) => (
                            <Card 
                                key={index} 
                                sx={{ mb: 2, borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}
                                onClick={() => {
                                    setSendData(hd);
                                    handleClickOpenDetailDialog();
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        {hd.maHopDong}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip 
                                            label={convertTrangThai(hd.giaiDoan)} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: hd.giaiDoan === 5 ? '#2e7d32' : (hd.giaiDoan === 1 ? '#9e9e9e' : '#ed6c02'), 
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                fontSize: '0.75rem',
                                                height: '24px'
                                            }} 
                                        />
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
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{hd.khachHang1?.soDienThoai}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Dịch vụ</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{getDichVuChinhLabel(hd.dichVuChinh)}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Ngày HĐ</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                                {hd.ngayHopDong ? formatDate(hd.ngayHopDong) : "-"}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Card>
                        ))
                    ) : (
                        <Typography sx={{ textAlign: 'center', mt: 4 }}>Không có dữ liệu hợp đồng khách hàng.</Typography>
                    )}
                </Box>
            ) : (
                <TableContainer component={Paper} style={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}>
                <Table stickyHeader aria-label="simple table">

                    <TableHead sx={{ '& th': { backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold' } }}>
                        <TableRow>
                            <TableCell align='center' style={{ minWidth: 60, width: '5%' }}>STT</TableCell>
                            <TableCell align='center' style={{ minWidth: 100, width: '10%' }}>MÃ SỐ HĐ</TableCell>
                            <TableCell style={{ minWidth: 200, width: '20%' }}>TÊN KHÁCH HÀNG</TableCell>
                            <TableCell style={{ minWidth: 150, width: '15%' }}>LIÊN HỆ</TableCell>
                            <TableCell align='center' style={{ minWidth: 150, width: '15%' }}>DỊCH VỤ</TableCell>
                            <TableCell align='center' style={{ minWidth: 120, width: '15%' }}>TRẠNG THÁI</TableCell>
                            <TableCell align='center' style={{ minWidth: 150, width: '10%' }}>NGÀY HỢP ĐỒNG</TableCell>
                            <TableCell align='center' style={{ minWidth: 150, width: '10%' }}>NGÀY CHỤP</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {hopDong && hopDong.length > 0 ? (
                            filteredHopDong.map((hd, index) => (
                                <TableRow key={index}
                                    style={{ 
                                        cursor: "pointer",
                                        backgroundColor: getRowBackgroundColor(hd.giaiDoan)
                                    }}
                                    sx={{
                                        '&:hover': {
                                            filter: 'brightness(95%)',
                                            transition: 'filter 0.15s ease'
                                        }
                                    }}
                                    onClick={() => {
                                        setSendData(hd);
                                        handleClickOpenDetailDialog();
                                    }}
                                >
                                    <TableCell align='center'>{index + 1}</TableCell>
                                    <TableCell align='center'>{hd.maHopDong}</TableCell>
                                    <TableCell align='left'>
                                        {hd.khachHang1?.tenKhachHang}
                                        {hd.khachHang2?.tenKhachHang && (
                                            <>
                                                <br />
                                                <hr style={{ opacity: "40%" }} />
                                                {hd.khachHang2.tenKhachHang}
                                            </>
                                        )}
                                    </TableCell>
                                    <TableCell align='left'>
                                        {hd.khachHang1?.soDienThoai}
                                        {hd.khachHang2?.soDienThoai && (
                                            <>
                                                <br />
                                                {hd.khachHang2.soDienThoai}
                                            </>
                                        )}
                                    </TableCell>
                                    <TableCell align='center'>{getDichVuChinhLabel(hd.dichVuChinh)}</TableCell>
                                    <TableCell align='center'><span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{convertTrangThai(hd.giaiDoan)}</span></TableCell>
                                    <TableCell align='center'>
                                        {hd.ngayHopDong ? (
                                            <>
                                                <div>{formatDate(hd.ngayHopDong)}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginTop: '3px' }}>
                                                    (Âm: {formatLunarDateShort(hd.ngayHopDong)})
                                                </div>
                                            </>
                                        ) : "-"}
                                    </TableCell>
                                    <TableCell align='center'>
                                        {hd.cacNgay?.ngayChup ? (
                                            <>
                                                <div>{formatDate(hd.cacNgay.ngayChup)}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginTop: '3px' }}>
                                                    (Âm: {formatLunarDateShort(hd.cacNgay.ngayChup)})
                                                </div>
                                            </>
                                        ) : "Đang cập nhật"}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan="10">Không có dữ liệu hợp đồng khách hàng.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            )}

            {isMobile && (
                <Fab 
                    color="primary" 
                    sx={{ 
                        position: 'fixed', 
                        bottom: 70, 
                        right: 16, 
                        zIndex: 1000,
                        opacity: 0.5,
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
