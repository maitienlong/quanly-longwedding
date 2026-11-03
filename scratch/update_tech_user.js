const fs = require('fs');
const file = '../backend-quantri-longwedding/backend-admin-longwedding/src/services/hopDong.service.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /function isTechnicianUser\(user\) \{[\s\S]*?return !isManagerOrAdmin;\r?\n\}/;

const newFunc = `function isTechnicianUser(user) {
    if (!user) return false;
    
    // Nếu là admin hoặc có quyền quản lý, dev, along -> chắc chắn không phải kỹ thuật viên
    if (user.permission === 1 || user.username === "dev" || user.username === "along" || user.is_admin === true) {
        return false;
    }
    
    const role = (user.positon || user.role || user.chucVu || "").toLowerCase();
    
    // Nếu role thuộc nhóm quản lý, admin, kế toán, sale -> không phải kỹ thuật viên
    if (
        role.includes("quản lý") || 
        role.includes("admin") || 
        role.includes("quản trị") || 
        role.includes("kế toán") ||
        role.includes("sale") ||
        role.includes("bán hàng") ||
        role.includes("thu ngân") ||
        role.includes("tiếp tân")
    ) {
        return false;
    }
    
    // Chỉ xem là kỹ thuật viên khi role RÕ RÀNG là thợ (chụp hình, makeup, chỉnh ảnh...)
    if (
        role.includes("thợ") ||
        role.includes("chụp") ||
        role.includes("make") ||
        role.includes("photoshop") ||
        role.includes("chỉnh ảnh") ||
        role.includes("kỹ thuật")
    ) {
        return true;
    }

    // Mặc định an toàn: Không ẩn đơn giá nếu không xác định rõ là kỹ thuật viên
    return false;
}`;

if (!regex.test(content)) {
    console.error('Old function not found!');
    process.exit(1);
}

content = content.replace(regex, newFunc);
fs.writeFileSync(file, content, 'utf8');
console.log('Updated isTechnicianUser successfully!');

