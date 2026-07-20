import { useState, useEffect } from 'react';
import { getContractTypesCache } from '../utils/contractTypesHelper';

export const useContractTypes = () => {
    const [types, setTypes] = useState(getContractTypesCache());

    useEffect(() => {
        const handleUpdate = () => {
            setTypes(getContractTypesCache());
        };
        window.addEventListener('contractTypesUpdated', handleUpdate);
        return () => {
            window.removeEventListener('contractTypesUpdated', handleUpdate);
        };
    }, []);

    const getDichVuChinhLabel = (id) => {
        const found = types.find(t => t.id === Number(id));
        return found ? found.name : 'Khác';
    };

    const loaiHopDongOptions = types.map(t => ({
        label: t.name,
        id: t.id
    }));

    return {
        contractTypes: types,
        loaiHopDongOptions,
        getDichVuChinhLabel
    };
};
