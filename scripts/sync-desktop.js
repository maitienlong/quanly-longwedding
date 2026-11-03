/**
 * Script tự động đồng bộ mã nguồn & tài nguyên từ dự án Web sang dự án Electron Desktop
 * Nguồn: quantri-longwedding
 * Đích : quantrilongwedding-desktop
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SOURCE_ROOT = path.resolve(__dirname, '..');
const TARGET_ROOT = path.resolve(SOURCE_ROOT, '..', 'quantrilongwedding-desktop');

console.log('\n============================================================');
console.log('🚀 BẮT ĐẦU ĐỒNG BỘ TOÀN BỘ CHỨC NĂNG SANG ELECTRON DESKTOP');
console.log('============================================================');
console.log(`📁 Nguồn: ${SOURCE_ROOT}`);
console.log(`📁 Đích : ${TARGET_ROOT}\n`);

// 1. Kiểm tra tồn tại thư mục đích
if (!fs.existsSync(TARGET_ROOT)) {
    console.error(`❌ Không tìm thấy thư mục dự án Desktop tại: ${TARGET_ROOT}`);
    process.exit(1);
}

// 2. Đồng bộ thư mục src/
console.log('📦 1. Đang đồng bộ toàn bộ thư mục src/...');
const srcSource = path.join(SOURCE_ROOT, 'src');
const srcTarget = path.join(TARGET_ROOT, 'src');

if (fs.existsSync(srcSource)) {
    // Xóa sạch src cũ của desktop hoặc ghi đè toàn bộ
    fs.cpSync(srcSource, srcTarget, { recursive: true, force: true });
    console.log('   ✅ Đã sao chép hoàn tất 100% thư mục src/ (components, screens, UI, utils, hooks, context).');
} else {
    console.error('   ❌ Không tìm thấy thư mục src nguồn!');
}

// 3. Đồng bộ tài nguyên trong public/ (trừ electron.js)
console.log('\n🖼️  2. Đang đồng bộ tài nguyên trong public/...');
const publicSource = path.join(SOURCE_ROOT, 'public');
const publicTarget = path.join(TARGET_ROOT, 'public');

if (fs.existsSync(publicSource)) {
    const publicItems = fs.readdirSync(publicSource);
    let copiedCount = 0;

    for (const item of publicItems) {
        // KHÔNG ghi đè electron.js của Desktop
        if (item === 'electron.js') continue;

        const itemSrc = path.join(publicSource, item);
        const itemTarget = path.join(publicTarget, item);

        fs.cpSync(itemSrc, itemTarget, { recursive: true, force: true });
        copiedCount++;
    }
    console.log(`   ✅ Đã sao chép ${copiedCount} mục tài nguyên trong public/ (giữ nguyên file electron.js của desktop).`);
}

// 4. Đồng bộ file .env nếu có
console.log('\n⚙️  3. Kiểm tra file cấu hình .env...');
const envSource = path.join(SOURCE_ROOT, '.env');
const envTarget = path.join(TARGET_ROOT, '.env');
if (fs.existsSync(envSource)) {
    fs.copyFileSync(envSource, envTarget);
    console.log('   ✅ Đã đồng bộ file .env');
}

// 5. Kiểm tra và bổ sung dependencies trong package.json
console.log('\n📦 4. Kiểm tra thư viện (dependencies) mới...');
const pkgSourcePath = path.join(SOURCE_ROOT, 'package.json');
const pkgTargetPath = path.join(TARGET_ROOT, 'package.json');

let hasNewDeps = false;
let newDepsList = [];

if (fs.existsSync(pkgSourcePath) && fs.existsSync(pkgTargetPath)) {
    const pkgSource = JSON.parse(fs.readFileSync(pkgSourcePath, 'utf8'));
    const pkgTarget = JSON.parse(fs.readFileSync(pkgTargetPath, 'utf8'));

    if (!pkgTarget.dependencies) pkgTarget.dependencies = {};

    const sourceDeps = pkgSource.dependencies || {};
    for (const [dep, ver] of Object.entries(sourceDeps)) {
        if (!pkgTarget.dependencies[dep]) {
            pkgTarget.dependencies[dep] = ver;
            newDepsList.push(`${dep}@${ver}`);
            hasNewDeps = true;
        }
    }

    if (hasNewDeps) {
        fs.writeFileSync(pkgTargetPath, JSON.stringify(pkgTarget, null, 2), 'utf8');
        console.log(`   ✨ Đã tự động thêm ${newDepsList.length} thư viện mới vào package.json của desktop:`);
        newDepsList.forEach(d => console.log(`      + ${d}`));

        console.log('\n📥 5. Đang cài đặt thư viện mới cho Desktop (npm install --legacy-peer-deps)...');
        try {
            execSync('npm install --legacy-peer-deps', { cwd: TARGET_ROOT, stdio: 'inherit' });
            console.log('   ✅ Đã cài đặt xong thư viện mới cho Desktop!');
        } catch (err) {
            console.warn('   ⚠️ Không thể tự động chạy npm install. Bạn có thể mở thư mục desktop và chạy "npm install" thủ công.');
        }
    } else {
        console.log('   ✅ Toàn bộ thư viện của Desktop đã khớp với dự án Web.');
    }
}

console.log('\n============================================================');
console.log('🎉 ĐỒNG BỘ THÀNH CÔNG! BẠN CÓ THỂ MỞ DỰ ÁN ELECTRON ĐỂ SỬ DỤNG.');
console.log('👉 Cách khởi chạy Desktop:');
console.log('   cd "D:\\LONG WEDDING\\HETHONG CNTT\\quantrilongwedding-desktop"');
console.log('   npm run electron:dev');
console.log('============================================================\n');
