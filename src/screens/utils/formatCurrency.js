const formatCurrency = (value) => {
    if (!value) return '';
    return Number(value).toLocaleString('vi-VN') + ' đ';
};

const parseCurrency = (value) => {
    return Number(value.replace(/\D/g, ''));
};
export { formatCurrency, parseCurrency };
