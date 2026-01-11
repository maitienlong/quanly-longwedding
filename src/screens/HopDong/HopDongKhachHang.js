import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import ThemHopDongDialog from './ThemHopDongDialog'; // 👈 import dialog

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function HopDongKhachHang() {
    const [hopDong, setHopDong] = useState({ hopDong: [] });
    const { showLoading, hideLoading } = useLoading();
    const [showDialog, setShowDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");


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
            <div className="content-header">
                <h2 className="title-hdkh">HỢP ĐỒNG KHÁCH HÀNG</h2>
                <div className="filters">
                    <button
                        className="add-new-btn"
                        onClick={() => setShowDialog(true)}
                    >
                        <i className="fa-solid fa-plus"></i>
                        THÊM HỢP ĐỒNG MỚI
                    </button>

                    <div className="select-wrapper">
                        <i className="fa-solid fa-calendar-alt"></i>
                        <select>
                            <option>Lọc chọn thời gian tìm kiếm</option>
                        </select>
                    </div>

                    <div className="search-bar">
                        <i className="fa-solid fa-search"></i>
                        <input
                            type="text"
                            placeholder="Tìm kiếm tên hoặc mã số HĐ"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
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
                                <tr key={index}>
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

            {/* ===== DIALOG THÊM HỢP ĐỒNG ===== */}
            {showDialog && (
                <ThemHopDongDialog
                    onClose={() => setShowDialog(false)}
                    onSave={(data) => {
                        console.log("Dữ liệu hợp đồng mới:", data);
                        toast.success("Đã lưu hợp đồng mới!");
                        setShowDialog(false);
                    }}
                />
            )}
        </div>
    );
}

export default HopDongKhachHang;
