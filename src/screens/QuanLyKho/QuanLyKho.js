import './quanlykho.css';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus
} from '@fortawesome/free-solid-svg-icons';
import { useLoading } from "../../context/LoadingContext";
import otherService from '../../API/services/otherService';
import SearchInput from '../../components/AppSearchInput';
import AppButton from '../../components/AppButton';
import AppDialog from "../../components/AppDialog";
import ServiceDetailDialog from './ServiceDetailDialog';
import ServiceAddDialog from './ServiceAddDialog';
import { formatCurrency, parseCurrency } from "../utils/formatCurrency.js";


import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
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


/* ==================== TRANG CHÍNH ==================== */
const QuanLyKho = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [listSeviceAPI, setListSeviceAPI] = useState([]);
    const { showLoading, hideLoading } = useLoading();
    const [keyword, setKeyword] = useState("");
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    const commonHeight = 56;

    // table
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    // -------------------------------

    const onSaveSuccess = () => {
        setOpenAddDialog(false);
        setSelectedService(null);
        showLoading("Đang tải dữ liệu...");
        otherService.findDichVu({})
            .then(res => res.status === 'success' && setListSeviceAPI(res.data.dichVu))
            .finally(() => hideLoading());
    }

    useEffect(() => {
        showLoading("Đang tải dữ liệu...");
        otherService.findDichVu({})
            .then(res => res.status === 'success' && setListSeviceAPI(res.data.dichVu))
            .finally(() => hideLoading());
    }, []);



    const rows = [
        { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
        { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
        { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
        { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
        { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
        { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
        { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
        { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
        { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
    ];


    return (
        <div className="content-wrapper-react" style={{ padding: isMobile ? '10px' : '20px', height: isMobile ? 'calc(100vh - 145px)' : 'auto', display: isMobile ? 'flex' : 'block', flexDirection: 'column' }}>
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
                                height: commonHeight, // Ép chiều cao bằng với 2 input trên
                                whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
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


        </div>
    );
};

export default QuanLyKho;
