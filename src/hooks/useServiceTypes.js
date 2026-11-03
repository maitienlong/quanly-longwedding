import { useState, useEffect } from 'react';
import { 
    getServiceTypesCache, 
    updateServiceTypesCache, 
    getLoaiDichVuLabel,
    getLoaiDichVuInfo 
} from '../utils/serviceTypesHelper';
import otherService from '../API/services/otherService';

export const useServiceTypes = () => {
    const [serviceTypes, setServiceTypes] = useState(getServiceTypesCache());

    useEffect(() => {
        const handleUpdate = () => {
            setServiceTypes(getServiceTypesCache());
        };
        window.addEventListener('serviceTypesUpdated', handleUpdate);

        // Nạp từ server nếu cache hiện tại là default và muốn đồng bộ mới nhất
        otherService.findAllLoaiDichVu()
            .then(res => {
                if (res.status === 'success' && res.data?.loaiDichVu) {
                    updateServiceTypesCache(res.data.loaiDichVu);
                }
            })
            .catch(err => {
                console.error("Lỗi tải loại dịch vụ:", err);
            });

        return () => {
            window.removeEventListener('serviceTypesUpdated', handleUpdate);
        };
    }, []);

    const reloadServiceTypes = async () => {
        try {
            const res = await otherService.findAllLoaiDichVu();
            if (res.status === 'success' && res.data?.loaiDichVu) {
                updateServiceTypesCache(res.data.loaiDichVu);
                return res.data.loaiDichVu;
            }
        } catch (err) {
            console.error("Lỗi tải lại loại dịch vụ:", err);
        }
        return getServiceTypesCache();
    };

    return {
        serviceTypes,
        getLoaiDichVuLabel,
        getLoaiDichVuInfo,
        reloadServiceTypes
    };
};
