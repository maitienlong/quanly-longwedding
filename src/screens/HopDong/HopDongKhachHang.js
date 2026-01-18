import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import ThemHopDongDialog from './ThemHopDongDialog';
import AppSearchInput from '../../components/AppSearchInput';
import AppButton from '../../components/AppButton';
import AppComboBox from '../../components/AppComboBox';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useModal } from '../ModalContext';

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

    const { openModal } = useModal();

    const dialogLockRef = useRef(false);
    const data = [
        { value: "locngay", label: "Ngày hôm nay" },
        { value: "loctuan", label: "Tuần này" },
        { value: "locthang", label: "Tháng này" },
        { value: "locnam", label: "Năm này" },
    ];


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
                <div class="filters">
                    <AppComboBox
                        options={data}
                        value={selectedValue}
                        onChange={(val) => setSelectedValue(val)}
                        placeholder="Lọc theo thời gian"
                    />

                    <AppSearchInput
                        value={keyword}
                        onChange={setKeyword}
                        onSearch={() => console.log("Search service:", keyword)}
                        placeholder="Tìm dịch vụ..."
                    />

                    <AppButton
                        icon={faPlus}
                        onClick={() => openModal("ADD_HOP_DONG")}
                    >
                        Thêm hợp đồng
                    </AppButton>


                </div>
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
                                    onClick={() => openModal("VIEW_HOP_DONG", { data: hd })}
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

        </div>
    );
}

export default HopDongKhachHang;
