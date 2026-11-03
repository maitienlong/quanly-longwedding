const fs = require('fs');

// 1. Cập nhật DetailHopDongKhachHangDialog.js
const detailPath = 'src/screens/HopDong/DetailHopDongKhachHangDialog.js';
let detailCode = fs.readFileSync(detailPath, 'utf8');

// Thay đổi chỗ gán donGia khi chọn sản phẩm
detailCode = detailCode.replace(
    /donGia:\s*Number\(product\.giaChoThueDichVu\)\s*\|\|\s*0,/g,
    'donGia: Number(product.giaChoThueDichVu || product.giaTriDichVu || product.donGia) || 0,'
);

// Thay đổi chỗ tính price trong bảng render
const oldPriceRender = 'const price = item.donGia || item.giaChoThueDichVu || 0;';
const newPriceRender = `const price = (item.donGia !== undefined && item.donGia !== null && item.donGia !== '') 
        ? Number(item.donGia) 
        : Number(item.giaChoThueDichVu || item.giaTriDichVu || item.dichVu?.giaChoThueDichVu || item.dichVu?.giaTriDichVu || 0);`;

if (detailCode.includes(oldPriceRender)) {
    detailCode = detailCode.replace(oldPriceRender, newPriceRender);
} else {
    console.log('Notice: oldPriceRender not found in Detail, check variations');
}

// Thay đổi chỗ tính price trong calculateTotalWithCart / updateCartAndTotal
detailCode = detailCode.replace(
    /item\.donGia\?\.toString\(\)\.replace\(\/\[\^0-9\.-]\+\/g, ""\)\s*\|\|\s*item\.giaChoThueDichVu\?\.toString\(\)\.replace\(\/\[\^0-9\.-]\+\/g, ""\)\s*\|\|\s*0/g,
    'item.donGia?.toString().replace(/[^0-9.-]+/g, "") || item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.giaTriDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.dichVu?.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.dichVu?.giaTriDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0'
);

fs.writeFileSync(detailPath, detailCode, 'utf8');
console.log('Updated DetailHopDongKhachHangDialog.js successfully!');

// 2. Cập nhật ThemHopDongKHDialog.js
const themPath = 'src/screens/HopDong/ThemHopDongKHDialog.js';
let themCode = fs.readFileSync(themPath, 'utf8');

themCode = themCode.replace(
    /item\.giaChoThueDichVu\?\.toString\(\)\.replace\(\/\[\^0-9\.-]\+\/g, ""\)\s*\|\|\s*0/g,
    'item.donGia?.toString().replace(/[^0-9.-]+/g, "") || item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.giaTriDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0'
);

themCode = themCode.replace(
    /sp\.giaChoThueDichVu\?\.toString\(\)\.replace\(\/\[\^0-9\.-]\+\/g, ""\)\s*\|\|\s*0/g,
    'sp.donGia?.toString().replace(/[^0-9.-]+/g, "") || sp.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || sp.giaTriDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0'
);

fs.writeFileSync(themPath, themCode, 'utf8');
console.log('Updated ThemHopDongKHDialog.js successfully!');

