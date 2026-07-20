let cache = [
    { name: 'Pre-Wedding', id: 1 },
    { name: 'Phóng Sự Ăn Hỏi', id: 2 },
    { name: 'Phóng Sự Cưới', id: 3 },
    { name: 'Beauty', id: 4 },
    { name: 'Ảnh Thẻ', id: 5 },
    { name: 'Bé', id: 6 },
    { name: 'Gia Đình', id: 7 },
    { name: 'Video Phóng Sự', id: 8 },
    { name: 'Thiệp Mời', id: 9 },
    { name: 'Livestream', id: 10 },
    { name: 'Trang điểm', id: 11 },
    { name: 'Cho thuê trang phục', id: 12 },
    { name: 'Khác', id: 13 }
];

export const getContractTypesCache = () => cache;

export const updateContractTypesCache = (newTypes) => {
    cache = newTypes;
    window.dispatchEvent(new Event('contractTypesUpdated'));
};

export const getDichVuChinhLabel = (id) => {
    const found = cache.find(t => t.id === Number(id));
    return found ? found.name : 'Khác';
};

export const getLoaiHopDongOptions = () => {
    return cache.map(t => ({ label: t.name, id: t.id }));
};
