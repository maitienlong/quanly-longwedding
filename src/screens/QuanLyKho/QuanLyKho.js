import './quanlykho.css';
import React, { useState, useEffect, useRef } from 'react';
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



/* ==================== TRANG CHÍNH ==================== */
const QuanLyKho = () => {
    const [listSeviceAPI, setListSeviceAPI] = useState([]);
    const { showLoading, hideLoading } = useLoading();
    const [keyword, setKeyword] = useState("");
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    const onSaveSuccess = () => {
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

    return (
        <div className="content-wrapper-react">
            <div class="content-header">
                <h2>QUẢN LÝ KHO</h2>
                <div class="filters">
                    <SearchInput
                        value={keyword}
                        onChange={setKeyword}
                        onSearch={() => console.log("Search service:", keyword)}
                        placeholder="Tìm dịch vụ..."
                    />

                    <AppButton
                        icon={faPlus}
                        onClick={() => setOpenAddDialog(true)}
                    >
                        Thêm
                    </AppButton>
                </div>
            </div>

            <div className="inventory-grid">
                <div className="item-list-container scrollable-table">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th key="maDichVu">STT</th>
                                <th key="maDichVu">Mã Dịch Vụ</th>
                                <th key="dichVu">Dịch Vụ</th>
                                <th key="giaThanh">Giá Thành</th>
                                 <th key="giaThanh">Giá Thuê</th>
                                <th key="moTa">Mô tả</th>
                                <th key="tonKho">Tồn Kho</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listSeviceAPI.map((item, index) => (
                                <tr
                                    key={index}
                                    className="clickable-row"
                                    onClick={() =>
                                        <AppDialog
                                            isOpen={true}
                                            onClose={() => setOpenAddDialog(false)}
                                            title="Thêm dịch vụ mới"
                                        >
                                            <ServiceDetailDialog
                                                open={!!selectedService}
                                                service={selectedService}
                                                onClose={() => setSelectedService(null)}
                                            />
                                        </AppDialog>
                                    }
                                >
                                    <td>{index + 1}</td>
                                    <td>{item.maDichVu}</td>
                                    <td>{item.tenDichVu}</td>
                                    <td>{item.giaDichVu}</td>
                                    <td>{item.giaThueDichVu}</td>
                                    <td>{item.moTaDichVu}</td>
                                    <td>{item.tonKhoDichVu}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AppDialog
                isOpen={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                title="Thêm dịch vụ mới"
            >
                <ServiceAddDialog
                    onCancel={() => setOpenAddDialog(false)}
                    onSave={onSaveSuccess}
                />
            </AppDialog>


        </div>
    );
};

export default QuanLyKho;
