import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import AppSearchInput from '../../components/AppSearchInput';
import AppButton from '../../components/AppButton';
import AppComboBox from '../../components/AppComboBox';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import ThemHopDongKHDialog from './ThemHopDongKHDialog';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function HopDongKhachHang() {
    const [hopDong, setHopDong] = useState({ hopDong: [] });
    const { showLoading, hideLoading } = useLoading();

    const [searchTerm, setSearchTerm] = useState("");
    const [keyword, setKeyword] = useState("");
    const [selectedValue, setSelectedValue] = useState(null);

    const [selectedHopDong, setSelectedHopDong] = useState(null);

    const dialogLockRef = useRef(false);

    // LOGIC DIALOG KHÁCH HÀNG
    const [openDialogHD, setOpenDialogHD] = React.useState(false);
    const [selectedValueDialog, setSelectedValueDialog] = React.useState({ data: "hello" });

    const handleClickOpenDialog = () => {

        setOpenDialogHD(true);
        console.log("Mở dialog hợp đồng khách hàng" + openDialogHD);
    };

    const handleCloseDialog = (value) => {
        setOpenDialogHD(false);
        setSelectedValueDialog(value);
    };
    //-------------------------------

    const locThoiGian = [
        { label: 'Hôm nay', id: 1 },
        { label: 'Tuần này', id: 2 },
        { label: 'Tháng này', id: 3 },
        { label: 'Năm này', id: 4 }]

    const commonHeight = 56;

    useEffect(() => {
        showLoading("Đang tải hợp đồng ...");
        otherService.findAllHopDong()
            .then((response) => {
                setHopDong(response.data);
                toast.success("Tải dữ liệu hợp đồng khách hàng thành công!");
                hideLoading();
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                toast.error("Lỗi khi tải dữ liệu hợp đồng khách hàng.");
                hideLoading();
            });
    }, [showLoading, hideLoading]);

    const filteredHopDong =
        hopDong.hopDong?.filter((hd) => {
            if (!searchTerm) return true; // nếu chưa nhập thì hiện tất cả
            const lowerTerm = removeAccents(searchTerm.toLowerCase());
            return (
                (hd.maHopDong && removeAccents(hd.maHopDong.toLowerCase()).includes(lowerTerm)) ||
                (hd.tenKhachHang && removeAccents(hd.tenKhachHang.toLowerCase()).includes(lowerTerm)) ||
                (hd.tenCoDau && removeAccents(hd.tenCoDau.toLowerCase()).includes(lowerTerm))
            );
        }) || [];

    return (
        <div className="hopdongkhachhang">
            <div class="content-header">
                <h2>QUẢN LÝ HỢP ĐỒNG KHÁCH HÀNG</h2>
                <Stack spacing={2} direction="row">

                    <Autocomplete
                        disablePortal
                        options={locThoiGian}
                        sx={{ width: 300, height: commonHeight }}
                        renderInput={(params) => <TextField {...params} label="Lọc theo thời gian" />}
                    />

                    <TextField id="outlined-basic" label="Tìm kiếm" variant="outlined" InputProps={{
                        sx: { height: commonHeight }
                    }} />

                    <Button
                        onClick={handleClickOpenDialog}
                        variant="contained"
                        sx={{
                            height: commonHeight, // Ép chiều cao bằng với 2 input trên
                            whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                        }}
                    >Thêm Hợp Đồng</Button>


                </Stack>
            </div>

            {/* ===== DANH SÁCH HỢP ĐỒNG ===== */}
            <TableContainer component={Paper}>
                <Table aria-label="simple table">

                    <TableHead>
                        <TableRow>
                            <TableCell align='center' style={{ width: 20 }}>STT</TableCell>
                            <TableCell align='center' style={{ width: 20 }}>MÃ SỐ HĐ</TableCell>
                            <TableCell align='center' style={{ width: 100 }}>TÊN KHÁCH HÀNG</TableCell>
                            <TableCell style={{ width: 100 }}>LIÊN HỆ</TableCell>
                            <TableCell align='center' style={{ width: 100 }}>DỊCH VỤ</TableCell>
                            <TableCell align='center' style={{ width: 20 }}>TRẠNG THÁI</TableCell>
                            <TableCell align='center' style={{ width: 100 }}>NGÀY HỢP ĐỒNG</TableCell>
                            <TableCell align='center' style={{ width: 100 }}>NGÀY CHỤP</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {hopDong.hopDong && hopDong.hopDong.length > 0 ? (
                            filteredHopDong.map((hd, index) => (
                                <TableRow key={index}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => { }}
                                >
                                    <TableCell align='center' style={{ width: 20 }}>{index + 1}</TableCell>
                                    <TableCell align='center' style={{ width: 20 }}>{hd.maHopDong}</TableCell>
                                    <TableCell align='left' style={{ width: 100 }}>{hd.khachHang.chuRe.tenKhachHang}<br />{hd.khachHang.coDau.tenKhachHang}</TableCell>
                                    <TableCell align='left' style={{ width: 100 }}>{hd.khachHang.chuRe.soDienThoai}<br />{hd.khachHang.coDau.soDienThoai}</TableCell>
                                    <TableCell align='center' style={{ width: 100 }}>CHỤP CƯỚI</TableCell>
                                    <TableCell align='center' style={{ width: 20 }}><span className="status-chip">{hd.trangThaiHopDong}</span></TableCell>
                                    <TableCell align='center' style={{ width: 100 }}>{hd.ngayKy}</TableCell>
                                    <TableCell align='center' style={{ width: 100 }}>{hd.ngayChup}</TableCell>
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


            <ThemHopDongKHDialog
                selectedValue={selectedValueDialog}
                open={openDialogHD}
                onClose={handleCloseDialog}
            />
        </div>
    );
}

function HopDongDialog(props) {
    const { onClose, selectedValue, open } = props;
    const handleClose = () => {
        onClose(selectedValue);
    };

    const handleListItemClick = (value) => {
        onClose(value);
    };

    return (
        <Dialog onClose={handleClose} open={open}
            fullWidth
            maxWidth="lg"
        >
            <DialogTitle>Hợp Đồng Khách Hàng</DialogTitle>
        </Dialog>
    );
}

export default HopDongKhachHang;
