import './quanlykho.css';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faCameraRetro,
    faWarehouse,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useLoading } from "../../context/LoadingContext";
import otherService from '../../API/services/otherService';
import SearchInput from '../../components/AppSearchInput';
import AppButton from '../../components/AppButton';

/* ==================== DIALOG ==================== */
const Dialog = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog-container" onClick={(e) => e.stopPropagation()}>
                <div className="dialog-header">
                    <h3>{title}</h3>
                    <button onClick={onClose} className="dialog-close-btn">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <div className="dialog-body">{children}</div>
            </div>
        </div>
    );
};

/* ==================== HELPER FORMAT TIỀN ==================== */
const formatCurrency = (value) => {
    if (!value) return '';
    return Number(value).toLocaleString('vi-VN') + ' đ';
};

const parseCurrency = (value) => {
    return Number(value.replace(/\D/g, ''));
};

/* ==================== FORM THÊM DỊCH VỤ ==================== */
const AddServiceForm = ({ onCancel, onSave }) => {
    const nameRef = useRef(null);

    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [priceRaw, setPriceRaw] = useState('');
    const [priceDisplay, setPriceDisplay] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    /* AUTO FOCUS */
    useEffect(() => {
        nameRef.current?.focus();
    }, []);

    const handlePriceChange = (e) => {
        const raw = parseCurrency(e.target.value);
        setPriceRaw(raw);
        setPriceDisplay(raw ? formatCurrency(raw) : '');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name || !id || !description) {
            toast.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (!priceRaw || priceRaw <= 0) {
            toast.error("Giá dịch vụ không hợp lệ!");
            return;
        }

        onSave({
            maDichVu: id.trim(),
            tenDichVu: name.trim(),
            donGia: priceRaw,
            moTa: description.trim(),
            hinhAnh: imageFile
        });
    };

    return (
        <form onSubmit={handleSubmit} className="service-form-grid">
            {/* ===== CỘT TRÁI: FORM ===== */}
            <div className="service-form-left">

                <div className="form-group">
                    <label>Mã dịch vụ</label>
                    <input
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Tên dịch vụ</label>
                    <input
                        ref={nameRef}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Giá</label>
                    <input
                        value={priceDisplay}
                        onChange={handlePriceChange}
                        placeholder="VD: 5.000.000 đ"
                    />
                </div>

                <div className="form-group">
                    <label>Tồn Kho</label>
                    <input
                        value={priceDisplay}
                        onChange={handlePriceChange}
                        placeholder="VD: 5.000.000 đ"
                    />
                </div>

                <div className="form-group">
                    <label>Mô tả</label>
                    <textarea
                        rows="5"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Ảnh đại diện</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                    />
                </div>
            </div>

            {/* ===== CỘT PHẢI: PREVIEW ===== */}
            <div className="service-form-right">
                {imageFile ? (
                    <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        className="service-image-preview"
                    />
                ) : (
                    <div className="service-image-placeholder">
                        Chưa có ảnh<br />Preview sẽ hiển thị tại đây
                    </div>
                )}
            </div>

            {/* ===== ACTION ===== */}
            <div className="form-actions service-form-actions">
                <AppButton
                    variant="secondary"
                    onClick={onCancel}
                >
                    Hủy
                </AppButton>

                <AppButton
                    type="submit"
                    onClick={onSave}
                >
                    Lưu
                </AppButton>
            </div>
        </form>
    );
};




/* ==================== BẢNG TRANG PHỤC ==================== */
const InventoryColumnTrangPhuc = ({ title, icon, data, headers, onImageClick }) => (
    <div className="inventory-column">
        <h3><FontAwesomeIcon icon={icon} /> {title}</h3>
        <div className="item-list-container scrollable-table">
            <table className="inventory-table">
                <thead>
                    <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td>{item.maTrangPhuc}</td>
                            <td>{item.tenTrangPhuc}</td>
                            <td>{item.size}</td>
                            <td>{item.giaThue}</td>
                            <td>{item.soLuong}</td>
                            <td onClick={() => item.hinhAnh && onImageClick(item.hinhAnh)}>
                                {item.hinhAnh ? (
                                    <img
                                        src={typeof item.hinhAnh === 'string'
                                            ? item.hinhAnh
                                            : URL.createObjectURL(item.hinhAnh)}
                                        alt=""
                                        style={{ width: 60, borderRadius: 6 }}
                                    />
                                ) : '—'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

/* ==================== TRANG CHÍNH ==================== */
const QuanLyKho = () => {
    const [modalType, setModalType] = useState(null);
    const [outfits, setOutfits] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const { showLoading, hideLoading } = useLoading();
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
        showLoading("Đang tải dữ liệu...");

        otherService.findAllTrangPhuc({})
            .then(res => res.status === 'success' && setOutfits(res.data));

        otherService.findDichVu({})
            .then(res => res.status === 'success' && setServices(res.data.dichVu))
            .finally(() => hideLoading());
    }, []);

    const handleAddService = (service) => {
        setServices(prev => [...prev, service]);
        toast.success("Thêm dịch vụ thành công!");
        setModalType(null);
    };

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
                        onClick={() => setModalType("service")}
                    >
                        Thêm
                    </AppButton>


                </div>
            </div>

            <div className="inventory-grid">
                <InventoryColumnTrangPhuc
                    title="Trang phục trong kho"
                    icon={faWarehouse}
                    data={outfits}
                    headers={['Mã DV', 'Tên Dịch Vụ', 'Mô Tả', 'Giá Dịch Vụ', 'Tồn Kho', 'Trạng thái']}
                    onImageClick={setSelectedImage}
                />
            </div>

            <Dialog
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                title="Xem ảnh"
            >
                {selectedImage && (
                    <img
                        src={typeof selectedImage === 'string'
                            ? selectedImage
                            : URL.createObjectURL(selectedImage)}
                        alt=""
                        style={{ width: '100%' }}
                    />
                )}
            </Dialog>

            <Dialog
                isOpen={modalType === 'service'}
                onClose={() => setModalType(null)}
                title="Thêm dịch vụ mới"
            >
                <AddServiceForm
                    onCancel={() => setModalType(null)}
                    onSave={handleAddService}
                />
            </Dialog>
        </div>
    );
};

export default QuanLyKho;
