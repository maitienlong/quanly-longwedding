import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AppButton from "../../components/AppButton";
import { formatCurrency, parseCurrency } from "../utils/formatCurrency.js";

import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";

import { fileToBase64 } from "../utils/fileToBase64.js";

const ServiceAddDialog = ({ onCancel, onSave }) => {
    const nameRef = useRef(null);
    const { showLoading, hideLoading } = useLoading();

    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [priceRaw, setPriceRaw] = useState('');
    const [priceThueRaw, setPriceThueRaw] = useState('');
    const [priceDisplay, setPriceDisplay] = useState('');
    const [priceThue, setPriceThue] = useState('');
    const [tonKho, setTonKho] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);

    const [imageBase64, setImageBase64] = useState(null);


    useEffect(() => {
        nameRef.current?.focus();
    }, []);

    const handlePriceChange = (e) => {
        const raw = parseCurrency(e.target.value);
        setPriceRaw(raw);
        setPriceDisplay(raw ? formatCurrency(raw) : '');
    };

    const handlePriceThue = (e) => {
        const raw = parseCurrency(e.target.value);
        setPriceThueRaw(raw);
        setPriceThue(raw ? formatCurrency(raw) : '');
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

        showLoading("Đang thêm dịch vụ ...");

        otherService.ServiceAddProdcut({
            maDichVu: id.trim(),
            tenDichVu: name.trim(),
            giaDichVu: priceRaw,
            giaThueDichVu: priceThueRaw,
            tonKhoDichVu: tonKho ? Number(tonKho) : 0,
            moTaDichVu: description.trim(),
            imageDichVu: imageBase64
        }).then((response) => {
            console.error(response);
            toast.success("Thêm dịch vụ thành công!");
            onCancel();
            onSave({
                msg: 'success'
            });
            hideLoading();
        })
            .catch((error) => {
                console.error('Error fetching data:', error);
                toast.error("Lỗi khi tải dữ liệu hợp đồng khách hàng.");
                hideLoading();
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
                    <label>Giá Thuê</label>
                    <input
                        value={priceThue}
                        onChange={handlePriceThue}
                        placeholder="VD: 5.000.000 đ"
                    />
                </div>

                <div className="form-group">
                    <label>Tồn Kho</label>
                    <input
                        type='number'
                        value={tonKho}
                        onChange={(e) => setTonKho(e.target.value)}
                        placeholder="Nhập số lượng tồn kho"
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
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            setImageFile(file);

                            const base64 = await fileToBase64(file);
                            setImageBase64(base64);
                        }}
                    />
                </div>
            </div>

            {/* ===== CỘT PHẢI: PREVIEW ===== */}
            <div className="service-form-right">
                {imageFile ? (
                    <img
                        src={imageBase64}
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
                    Thêm dịch vụ
                </AppButton>
            </div>
        </form>
    );
};

export default ServiceAddDialog;
