import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import ThemHopDongKHDialog from './ThemHopDongKHDialog';
import { formatDate } from '../utils/convertDate';
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
import DetailHopDongKhachHangDialog from './DetailHopDongKhachHangDialog';

const getDichVuChinhLabel = (id) => {
    const options = {
        1: 'Pre-Wedding',
        2: 'Phóng Sự Ăn Hỏi',
        3: 'Phóng Sự Cưới',
        4: 'Beauty',
        5: 'Ảnh Thẻ',
        6: 'Bé',
        7: 'Gia Đình',
        8: 'Video Phóng Sự',
        9: 'Thiệp Mời',
        10: 'Livestream',
        11: 'Trang điểm',
        12: 'Cho thuê trang phục',
        13: 'Khác'
    };
    return options[Number(id)] || 'Khác';
};

function HopDongKhachHang() {
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

    return (
        <div className="hopdongkhachhang">
            <div className="content-header">
                <h2>QUẢN LÝ HỢP ĐỒNG KHÁCH HÀNG</h2>
                <Stack spacing={2} direction="row">

                    <Autocomplete
                        disablePortal
                        options={locThoiGian}
                        value={selectedTime}
                        onChange={(event, newValue) => {
                            setSelectedTime(newValue || locThoiGian[0]);
                        }}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        sx={{ width: 220, height: commonHeight }}
                        renderInput={(params) => <TextField {...params} label="Lọc theo thời gian" />}
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
                        sx={{ width: 220, height: commonHeight }}
                        renderInput={(params) => <TextField {...params} label="Lọc theo trạng thái" />}
                    />

                    <TextField
                        id="outlined-basic"
                        label="Tìm kiếm (Mã HĐ, SĐT, Tên)"
                        variant="outlined"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        InputProps={{
                            sx: { height: commonHeight }
                        }}
                        sx={{ width: 280 }}
                    />

                    <Button
                        onClick={handleClickOpenDialog}
                        variant="contained"
                        sx={{
                            height: commonHeight, // Ép chiều cao bằng với các input trên
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
                                    <TableCell align='center' style={{ width: 100 }}>{getDichVuChinhLabel(hd.dichVuChinh)}</TableCell>
                                    <TableCell align='center' style={{ width: 20 }}><span className="status-chip">{convertTrangThai(hd.giaiDoan)}</span></TableCell>
                                    <TableCell align='center' style={{ width: 100 }}>{formatDate(hd.ngayHopDong)}</TableCell>
                                    <TableCell align='center' style={{ width: 100 }}>{formatDate(hd.cacNgay?.ngayChup) || "Đang cập nhật"}</TableCell>
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
