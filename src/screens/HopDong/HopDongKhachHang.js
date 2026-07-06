import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import ThemHopDongKHDialog from './ThemHopDongKHDialog';
import { formatDate } from '../utils/convertDate';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import DetailHopDongKhachHangDialog from './DetailHopDongKhachHangDialog';
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function HopDongKhachHang() {
    const [hopDong, setHopDong] = useState([]);
    const { showLoading, hideLoading } = useLoading();

    const [searchTerm, setSearchTerm] = useState("");

    // LOGIC DIALOG KHÁCH HÀNG
    const [openDialogHD, setOpenDialogHD] = React.useState(false);
    const [openDetailDialog, setOpenDetailDialog] = React.useState(false);
    const [selectedValueDialog, setSelectedValueDialog] = React.useState({ data: "hello" });
    const [sendData, setSendData] = useState({});

    const handleClickOpenDialog = () => {
        setOpenDialogHD(true);
    };

    const handleCloseDialog = (value) => {
        setOpenDialogHD(false);
        setSelectedValueDialog(value);
        loadHopDong();
    };
    const handleClickOpenDetailDialog = () => {
        setOpenDetailDialog(true);
    };
    const handleCloseDetailDialog = (updated) => {
        setOpenDetailDialog(false);
        if (updated === true) {
            loadHopDong();
        }
    };

    const locThoiGian = [
        { label: 'Hôm nay', id: 1 },
        { label: 'Tuần này', id: 2 },
        { label: 'Tháng này', id: 3 },
        { label: 'Năm này', id: 4 }]

    const commonHeight = 56;

    const loadHopDong = () => {
        showLoading("Đang tải hợp đồng ...");
        otherService.LIST_HOPDONG()
            .then((response) => {
                console.log(response.data.hopDong);
                setHopDong(response.data.hopDong);
                toast.success("Tải dữ liệu hợp đồng khách hàng thành công!");
                hideLoading();
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                toast.error("Lỗi khi tải dữ liệu hợp đồng khách hàng." + error.message);
                hideLoading();
            });
    };

    useEffect(() => {
        loadHopDong();
    }, [showLoading, hideLoading]);

    const filteredHopDong =
        hopDong?.filter((hd) => {
            if (!searchTerm) return true; // nếu chưa nhập thì hiện tất cả
            const lowerTerm = removeAccents(searchTerm.toLowerCase());
            return (
                (hd.maHopDong && removeAccents(hd.maHopDong.toLowerCase()).includes(lowerTerm)) ||
                (hd.khachHang1?.tenKhachHang && removeAccents(hd.khachHang1.tenKhachHang.toLowerCase()).includes(lowerTerm)) ||
                (hd.khachHang2?.tenKhachHang && removeAccents(hd.khachHang2.tenKhachHang.toLowerCase()).includes(lowerTerm))
            );
        }) || [];

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

    return (
        <div className="hopdongkhachhang">
            <div class="content-header">
                <h2>QUẢN LÝ HỢP ĐỒNG KHÁCH HÀNG</h2>
                 <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ width: '100%' }}>

                    <Autocomplete
                        disablePortal
                        options={locThoiGian}
                        sx={{ width: { xs: '100%', sm: 300 } }}
                        renderInput={(params) => <TextField {...params} label="Lọc theo thời gian" InputProps={{ ...params.InputProps, sx: { height: commonHeight } }} />}
                    />

                    <TextField 
                        id="outlined-basic" 
                        label="Tìm kiếm" 
                        variant="outlined" 
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                        InputProps={{
                            sx: { height: commonHeight }
                        }} 
                    />

                    <Button
                        onClick={handleClickOpenDialog}
                        variant="contained"
                        sx={{
                            height: commonHeight, // Ép chiều cao bằng với 2 input trên
                            whiteSpace: 'nowrap',  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                            width: { xs: '100%', sm: 'auto' }
                        }}
                    >Thêm Hợp Đồng</Button>
                </Stack>
            </div>

            {/* ===== DANH SÁCH HỢP ĐỒNG ===== */}
            <TableContainer component={Paper} sx={{ overflowX: 'auto', maxWidth: '100%' }}>
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
                        {hopDong && hopDong.length > 0 ? (
                            filteredHopDong.map((hd, index) => (
                                <TableRow key={index}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setSendData(hd);
                                        handleClickOpenDetailDialog();
                                    }}
                                >
                                    <TableCell align='center' style={{ width: 20 }}>{index + 1}</TableCell>
                                    <TableCell align='center' style={{ width: 20 }}>{hd.maHopDong}</TableCell>
                                    <TableCell align='left' style={{ width: 100 }}>
                                        {hd.khachHang1?.tenKhachHang}
                                        {hd.khachHang2?.tenKhachHang && (
                                            <>
                                                <br />
                                                <hr style={{ opacity: "40%" }} />
                                                {hd.khachHang2.tenKhachHang}
                                            </>
                                        )}
                                    </TableCell>
                                    <TableCell align='left' style={{ width: 100 }}>
                                        {hd.khachHang1?.soDienThoai}
                                        {hd.khachHang2?.soDienThoai && (
                                            <>
                                                <br />
                                                {hd.khachHang2.soDienThoai}
                                            </>
                                        )}
                                    </TableCell>
                                    <TableCell align='center' style={{ width: 100 }}>CHỤP CƯỚI</TableCell>
                                    <TableCell align='center' style={{ width: 20 }}><span className="status-chip">{convertTrangThai(hd.giaiDoan)}</span></TableCell>
                                    <TableCell align='center' style={{ width: 100 }}>{formatDate(hd.ngayHopDong)}</TableCell>
                                    <TableCell align='center' style={{ width: 100 }}>{formatDate(hd.cacNgay.ngayChup) || "Đang cập nhật"}</TableCell>
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
