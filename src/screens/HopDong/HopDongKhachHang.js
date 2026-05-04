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
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>MÃ SỐ HĐ</th>
                            <th>TÊN KHÁCH HÀNG</th>
                            <th>SĐT</th>
                            <th>TRẠNG THÁI</th>
                            <th>DỊCH VỤ</th>
                            <th>NGÀY KÝ HĐ</th>
                            <th>NGÀY CHỤP</th>
                            <th>NGÀY CƯỚI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hopDong.hopDong && hopDong.hopDong.length > 0 ? (
                            filteredHopDong.map((hd, index) => (
                                <tr key={index}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {}}
                                >
                                    <td>{index + 1}</td>
                                    <td>{hd.maHopDong}</td>
                                    <td>{hd.khachHang.chuRe.tenKhachHang}<br />{hd.khachHang.coDau.tenKhachHang}</td>
                                    <td>{hd.khachHang.chuRe.soDienThoai}<br />{hd.khachHang.coDau.soDienThoai}</td>
                                    <td><span className="status-chip">{hd.trangThaiHopDong}</span></td>
                                    <td>CHỤP CƯỚI</td>
                                    <td>{hd.ngayKy}</td>
                                    <td>{hd.ngayChup}</td>
                                    <td>{hd.ngayCuoi}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10">Không có dữ liệu hợp đồng khách hàng.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>


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
            maxWidth = "lg"
            >
            <DialogTitle>Hợp Đồng Khách Hàng</DialogTitle>
        </Dialog>
    );
}

export default HopDongKhachHang;
