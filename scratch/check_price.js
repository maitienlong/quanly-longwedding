const mongoose = require('mongoose');
require('dotenv').config({ path: '../backend-quantri-longwedding/backend-admin-longwedding/.env' });
const uri = process.env.DATABASE || process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/wedding';

mongoose.connect(uri).then(async () => {
    const DichVu = mongoose.model('dichVu', new mongoose.Schema({}, { strict: false }));
    const items = await DichVu.find({ tenDichVu: { $regex: 'Váy Cưới Studio Vip II|Song Hỷ', $options: 'i' } });
    console.log('Found items:', JSON.stringify(items.map(i => ({
        ten: i.tenDichVu,
        ma: i.maDichVu,
        giaTriDichVu: i.giaTriDichVu,
        giaChoThueDichVu: i.giaChoThueDichVu,
        donGia: i.donGia,
        loaiDichVu: i.loaiDichVu
    })), null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});

