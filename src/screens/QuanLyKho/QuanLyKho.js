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


/* ==================== TRANG CHÍNH ==================== */
const QuanLyKho = () => {
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
        <div className="content-wrapper-react">
            <div class="content-header">
                <h2>QUẢN LÝ KHO</h2>
                <div class="filters">
                    <TextField id="outlined-basic" label="Tìm kiếm" variant="outlined" InputProps={{
                        sx: { height: commonHeight }
                    }}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />

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
                </div>
            </div>


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
