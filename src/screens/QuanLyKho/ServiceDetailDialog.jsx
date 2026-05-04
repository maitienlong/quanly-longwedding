import AppDialog from "../../components/AppDialog";
import { useState, useEffect, useRef } from "react";
import AppSearchInput from "../../components/AppSearchInput";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';



function ServiceDetailDialog(props) {
    const { onClose, data, selectedValue, open } = props;
    const handleClose = () => {
        onClose(selectedValue);
    };

    const handleListItemClick = (value) => {
        onClose(value);
    };


    if (!data) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="lg"
        >
            <div className="service-detail">
                <p><b>Mã dịch vụ:</b> {data.maDichVu}</p>
                <p><b>Tên dịch vụ:</b> {data.tenDichVu}</p>
                <p><b>Tồn kho:</b> {data.tonKhoDichVu}</p>
                <p><b>Mô tả:</b>{data.moTaDichVu}</p>
        
                {data.imageDichVu && (
                    <img
                        src={typeof data.imageDichVu === "string"
                            ? data.imageDichVu
                            : URL.createObjectURL(data.imageDichVu)}
                        alt=""
                        style={{ width: "100%", borderRadius: 8, marginTop: 12 }}
                    />
                )}
            </div>
        </Dialog>
    );
};

export default ServiceDetailDialog;
