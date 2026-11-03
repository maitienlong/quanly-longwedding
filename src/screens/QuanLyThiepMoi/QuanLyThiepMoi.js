import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Select, MenuItem, FormControl, 
  InputLabel, Switch, FormControlLabel, CircularProgress, 
  Chip, Tooltip, IconButton, Grid, Paper, Box, Typography 
} from '@mui/material';
import { toast } from 'sonner';
import websiteService from '../../API/services/websiteService';
import appService from '../../API/services/otherService';
import { 
  generateStandaloneHtml, 
  THEME_PRESETS 
} from '../../utils/invitationCodeGenerator';
import './QuanLyThiepMoi.css';

// Hàm định dạng số có dấu phẩy phân cách hàng nghìn (VD: 150000 -> 150,000)
export const formatNumberWithCommas = (val) => {
  if (val === undefined || val === null || val === '') return '';
  if (val === 0 || val === '0') return '0';
  const cleanDigits = val.toString().replace(/[^0-9]/g, '');
  if (!cleanDigits) return '';
  return Number(cleanDigits).toLocaleString('en-US');
};

// Hàm hiển thị giá kèm chữ VNĐ với dấu phẩy phân cách
export const formatPriceDisplay = (val) => {
  if (val === undefined || val === null || val === '') return '0 VNĐ (Miễn Phí)';
  const str = val.toString();
  if (str.includes('Miễn Phí') || str.includes('miễn phí') || str === '0') {
    return '0 VNĐ (Miễn Phí)';
  }
  const cleanDigits = str.replace(/[^0-9]/g, '');
  if (!cleanDigits || cleanDigits === '0') return '0 VNĐ (Miễn Phí)';
  return `${Number(cleanDigits).toLocaleString('en-US')} VNĐ`;
};

// Danh sách các mẫu thiệp thiết kế sẵn chuẩn của hệ thống Long Wedding Studio
// Mỗi mẫu thiệp đồng thời là 1 MÃ DỊCH VỤ (Service Code) liên kết với Hợp đồng cưới
export const PREBUILT_TEMPLATES = [
  {
    id: 'tpl-song-hy-xanh',
    code: 'VIP-SONGHY-06',
    serviceCode: 'VIP-SONGHY-06',
    name: 'Song Hỷ Xanh (Song Hỷ Xanh Lá & Ngọc Lục Bảo)',
    category: 'Truyền Thống',
    themeId: 'song-hy-xanh',
    thumbnail: '/images/song-hy/thumbnail.webp',
    coverImage: '/images/song-hy/hero-arch.jpg',
    accessType: 'vip',
    price: '299,000',
    badge: 'ĐẶC QUYỀN VIP',
    requiredPackage: 'Gói Chụp Ảnh Cưới / Trọn Gói Studio',
    description: 'Mẫu thiệp cưới Song Hỷ Xanh với chữ Hỷ trang trọng trên nền xanh lá đậm hoàng gia, khung ảnh vòm cung nghệ thuật LOVE NEVER FAILS, lịch trình và hộp quà mừng may mắn.',
    primaryColor: '#1F3A25',
    secondaryColor: '#fff7eb',
    accentColor: '#e8f0e4',
    bgType: 'emerald-cream',
    envelopeStyle: 'song-hy-seal',
    effectType: 'song-hy-float',
    musicUrl: '/audio/MOIDUYENVANG.mp3',
    musicTitle: 'Mối Duyên Vàng',
    isActive: true,
    isPopular: true
  },
  {
    id: 'tpl-dreamy-fairytale',
    code: 'VIP-DREAMY-05',
    serviceCode: 'VIP-DREAMY-05',
    name: 'Lâu Đài Cổ Tích & Nơ Lụa Hồng (Dreamy Fairytale)',
    category: 'Lãng Mạn',
    themeId: 'dreamy-fairytale',
    thumbnail: '/images/dreamy/thumbnail.jpg',
    coverImage: '/images/dreamy/palace.jpg',
    accessType: 'vip',
    price: '320,000',
    badge: 'ĐẶC QUYỀN VIP',
    requiredPackage: 'Gói Chụp Ảnh Cưới / Trọn Gói Studio',
    description: 'Phong cách cổ tích Châu Âu: Bì thư nơ lụa satin hồng phấn mở ra lâu đài tráng lệ ven hồ, timeline tranh màu nước nghệ thuật.',
    primaryColor: '#B76E79',
    secondaryColor: '#FFF5F7',
    bgType: 'fairytale-blush',
    envelopeStyle: 'ribbon-bow',
    effectType: 'fairytale-petals',
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-1498.mp3',
    musicTitle: 'Dreamiest Waltz - Giai Điệu Cổ Tích Lãng Mạn',
    isActive: true,
    isPopular: true
  },
  {
    id: 'tpl-luxury-gold',
    code: 'VIP-GOLD-01',
    serviceCode: 'VIP-GOLD-01',
    name: 'Hoàng Gia & Ánh Kim (Luxury Gold)',
    category: 'Hoàng Gia',
    themeId: 'luxury-gold',
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    accessType: 'vip',
    price: '299,000',
    badge: 'ĐẶC QUYỀN VIP',
    requiredPackage: 'Gói Chụp Ảnh Cưới / Trọn Gói Studio',
    description: 'Thiết kế quý phái với viền nhũ vàng kim vương giả, hoa văn Baroque tinh tế và phong cách hoàng gia Châu Âu.',
    primaryColor: '#D4AF37',
    secondaryColor: '#1A1A1A',
    bgType: 'dark-gold',
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-1498.mp3',
    musicTitle: 'Wedding Waltz - Lãng Mạn Hoàng Gia',
    isActive: true,
    isPopular: true
  },
  {
    id: 'tpl-romantic-rose',
    code: 'VIP-ROSE-02',
    serviceCode: 'VIP-ROSE-02',
    name: 'Nàng Thơ & Hoa Hồng (Romantic Rose)',
    category: 'Lãng Mạn',
    themeId: 'romantic-rose',
    thumbnail: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    coverImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    accessType: 'vip',
    price: '250,000',
    badge: 'ĐẶC QUYỀN VIP',
    requiredPackage: 'Khách Hàng Studio Long Wedding',
    description: 'Sắc hồng pastel ngọt ngào, cánh hoa hồng bay nhẹ nhàng tạo cảm giác thơ mộng như câu chuyện cổ tích.',
    primaryColor: '#E07A5F',
    secondaryColor: '#FFF1F2',
    bgType: 'rose-blush',
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3',
    musicTitle: 'Beautiful Dream - Nhạc Cưới Dịu Êm',
    isActive: true,
    isPopular: true
  },
  {
    id: 'tpl-modern-minimal',
    code: 'FREE-MINIMAL-01',
    serviceCode: 'FREE-MINIMAL-01',
    name: 'Tối Giản & Thanh Lịch (Modern Minimalist)',
    category: 'Hiện Đại',
    themeId: 'modern-minimal',
    thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    accessType: 'free',
    price: '0',
    badge: 'MIỄN PHÍ',
    requiredPackage: 'Mọi Khách Hàng',
    description: 'Phong cách tối giản chuẩn tạp chí thời trang quốc tế, chú trọng typography hiện đại và bố cục tinh gọn.',
    primaryColor: '#2B2D42',
    secondaryColor: '#F8F9FA',
    bgType: 'clean-white',
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
    musicTitle: 'Serene View - Giai Điệu Trong Trẻo',
    isActive: true,
    isPopular: false
  },
  {
    id: 'tpl-botanical-garden',
    code: 'FREE-BOTANIC-02',
    serviceCode: 'FREE-BOTANIC-02',
    name: 'Cỏ Hoa & Thảo Mộc (Botanical Garden)',
    category: 'Rustic',
    themeId: 'botanical-garden',
    thumbnail: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    coverImage: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    accessType: 'free',
    price: '0',
    badge: 'MIỄN PHÍ',
    requiredPackage: 'Mọi Khách Hàng',
    description: 'Họa tiết cành lá bạch đàn watercolor tươi mát, mộc mạc và gần gũi, hoàn hảo cho tiệc cưới ngoài trời.',
    primaryColor: '#2D6A4F',
    secondaryColor: '#F4F7F5',
    bgType: 'sage-green',
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-acoustic-guitar-dream-2342.mp3',
    musicTitle: 'Acoustic Guitar - Nhẹ Nhàng Mộc Mạc',
    isActive: true,
    isPopular: true
  },
  {
    id: 'tpl-royal-red',
    code: 'VIP-RED-03',
    serviceCode: 'VIP-RED-03',
    name: 'Son Hỷ & Á Đông (Royal Crimson)',
    category: 'Truyền Thống',
    themeId: 'royal-red',
    thumbnail: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    coverImage: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    accessType: 'vip',
    price: '280,000',
    badge: 'ĐẶC QUYỀN VIP',
    requiredPackage: 'Gói Chụp Áo Dài / Trọn Gói VIP',
    description: 'Sắc đỏ son hỷ sự kết hợp nhũ vàng kim may mắn, hoa văn cổ điển tượng trưng cho tình duyên sắt son viên mãn.',
    primaryColor: '#C9184A',
    secondaryColor: '#FFF0F3',
    bgType: 'crimson-gold',
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-traditional-oriental-flute-and-harp-2900.mp3',
    musicTitle: 'Oriental Harmony - Lễ Hỷ Sum Vầy',
    isActive: true,
    isPopular: false
  },
  {
    id: 'tpl-korean-pastel',
    code: 'VIP-PASTEL-04',
    serviceCode: 'VIP-PASTEL-04',
    name: 'Hàn Quốc Dịu Êm (Korean Pastel)',
    category: 'Hàn Quốc',
    themeId: 'korean-pastel',
    thumbnail: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    coverImage: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    accessType: 'paid',
    price: '199,000',
    badge: 'TRẢ PHÍ / VIP',
    requiredPackage: 'Mở Khóa Theo Yêu Cầu',
    description: 'Tông màu pastel trong trẻo kiểu Hàn Quốc, tạo cảm giác tinh khôi, trẻ trung và thanh thoát.',
    primaryColor: '#7B2CBF',
    secondaryColor: '#F8F7FF',
    bgType: 'pastel-dream',
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-piano-reflections-148.mp3',
    musicTitle: 'Piano Reflections - Tình Yêu Thuần Khiết',
    isActive: true,
    isPopular: false
  }
];

const CATEGORY_OPTIONS = ['Tất Cả', 'Hoàng Gia', 'Lãng Mạn', 'Truyền Thống', 'Hiện Đại', 'Rustic', 'Hàn Quốc'];

const QuanLyThiepMoi = ({ isEmbedded = false }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [filterAccess, setFilterAccess] = useState('all'); // 'all' | 'active' | 'inactive' | 'free' | 'vip' | 'paid'
  const [filterCategory, setFilterCategory] = useState('Tất Cả');

  // Map: serviceCode -> danh sách hợp đồng (khách hàng đã mua thiệp đó)
  const [purchasedMap, setPurchasedMap] = useState({});
  const [loadingContracts, setLoadingContracts] = useState(false);

  // Modal Sửa Thông Tin Dịch Vụ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [demoRefreshKey, setDemoRefreshKey] = useState(0);
  const [syncingDb, setSyncingDb] = useState(false);

  // Modal Xem Trước Demo Toàn Màn Hình
  const [previewModalTemplate, setPreviewModalTemplate] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    code: '',
    serviceCode: '',
    name: '',
    category: 'Hoàng Gia',
    themeId: 'luxury-gold',
    thumbnail: '',
    coverImage: '',
    accessType: 'vip',
    price: '299.000đ',
    badge: 'ĐẶC QUYỀN VIP',
    requiredPackage: 'Gói Chụp Ảnh Cưới / Trọn Gói Studio',
    description: '',
    musicUrl: '',
    musicTitle: '',
    primaryColor: '#D4AF37',
    secondaryColor: '#1A1A1A',
    backgroundColor: '#0F0F0F',
    textColor: '#FDFBF7',
    effectType: 'sparkles',
    envelopeStyle: 'wax-seal',
    galleryLayout: 'grid-2col',
    isActive: true,
    isPopular: false
  });

  // Hợp nhất dữ liệu từ Backend và Danh sách mẫu thiết kế sẵn (PREBUILT_TEMPLATES)
  const mergeTemplates = (dbList) => {
    if (!Array.isArray(dbList) || dbList.length === 0) {
      return PREBUILT_TEMPLATES;
    }
    // Chỉ quản lý danh mục các mẫu thiệp thiết kế sẵn theo ID cố định
    return PREBUILT_TEMPLATES.map(prebuilt => {
      const foundInDb = dbList.find(item => 
        item.id === prebuilt.id || 
        item.themeId === prebuilt.themeId || 
        item.code === prebuilt.code ||
        item.serviceCode === prebuilt.serviceCode
      );
      if (foundInDb) {
        return {
          ...prebuilt,
          ...foundInDb,
          id: prebuilt.id, // Giữ ID cố định của mẫu thiết kế sẵn
          code: prebuilt.code,
          serviceCode: prebuilt.serviceCode,
          isActive: foundInDb.isActive !== undefined ? foundInDb.isActive : true
        };
      }
      return prebuilt;
    });
  };

  // Tải danh sách mẫu thiệp từ Backend
  const fetchTemplates = async () => {
    try {
      setRefreshing(true);
      const res = await websiteService.getSection('invitation-templates');
      const rawData = res && res.success && Array.isArray(res.data) ? res.data : [];
      const finalTemplates = mergeTemplates(rawData);
      setTemplates(finalTemplates);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách mẫu thiệp: ' + (err.message || ''));
      setTemplates(PREBUILT_TEMPLATES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tải danh sách hợp đồng và xây dựng purchasedMap
  const fetchPurchasedContracts = useCallback(async () => {
    try {
      setLoadingContracts(true);
      // Lấy danh sách hợp đồng, lọc những hợp đồng có mua dịch vụ thiệp
      const res = await appService.LIST_HOPDONG({ filter: 'all', status: 'all' });
      // API trả về: { success: true, data: { hopDong: [...], count: N } }
      const hopDongs = res?.data?.hopDong || res?.data?.data || (Array.isArray(res?.data) ? res.data : []) || [];

      // Xây dựng map: serviceCode/maLoaiThiep -> [{maHopDong, tenKhachHang, ngayHopDong}]
      const map = {};
      const hopDongArr = Array.isArray(hopDongs) ? hopDongs : [];

      hopDongArr.forEach(hd => {
        const gioHang = hd.gioHang || [];
        // Lấy tên khách hàng từ populated khachHang1
        const tenKH = hd.khachHang1?.tenKhachHang || hd.tenKhachHang || 'Khách hàng';
        const maHD = hd.maHopDong || '';

        // Duyệt qua từng dịch vụ trong giỏ hàng
        if (Array.isArray(gioHang)) {
          gioHang.forEach(dv => {
            // Kiểm tra xem đây có phải thiệp không:
            // - loaiDichVu === 5 (mã thiệp online)
            // - hoặc có maLoaiThiep (field trong cartItemSchema)
            const isThiep = dv.loaiDichVu === 5 || 
              dv.loaiDichVu === '5' ||
              (dv.maLoaiThiep && dv.maLoaiThiep.trim() !== '') ||
              (dv.tenDichVuSnapshot && (
                dv.tenDichVuSnapshot.includes('Thiệp') || 
                dv.tenDichVuSnapshot.includes('thiệp') ||
                dv.tenDichVuSnapshot.includes('VIP-') ||
                dv.tenDichVuSnapshot.includes('FREE-')
              )) ||
              (dv.maDichVu && typeof dv.maDichVu === 'string' && 
               (dv.maDichVu.startsWith('VIP-') || dv.maDichVu.startsWith('FREE-')));

            if (isThiep) {
              // Lấy code dịch vụ - ưu tiên maLoaiThiep (field trực tiếp trong schema)
              const code = dv.maLoaiThiep || dv.maDichVu || dv.code || dv.serviceCode || dv.thiepCode;
              if (code && code.trim() !== '') {
                if (!map[code]) map[code] = [];
                // Tránh duplicate theo maHopDong
                const exists = map[code].find(x => x.maHopDong === maHD);
                if (!exists && maHD) {
                  map[code].push({
                    maHopDong: maHD,
                    tenKhachHang: tenKH,
                    ngayHopDong: hd.ngayHopDong || hd.createdAt || '',
                    trangThai: hd.trangThai || hd.giaiDoan || ''
                  });
                }
              }
            }
          });
        }
      });

      setPurchasedMap(map);
    } catch (err) {
      console.warn('Không thể tải danh sách hợp đồng thiệp:', err.message);
    } finally {
      setLoadingContracts(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();

    fetchPurchasedContracts();
  }, [fetchPurchasedContracts]);

  // Chuyển đổi trạng thái Bật / Tắt hiển thị trên Website (Sự xuất hiện)
  const handleToggleStatus = async (tpl, e) => {
    if (e) e.stopPropagation();
    const newStatus = !tpl.isActive;
    const updatedItem = {
      ...tpl,
      isActive: newStatus,
      updatedAt: new Date().toISOString()
    };

    // Cập nhật UI ngay lập tức
    const updatedList = templates.map(t => (t.id === tpl.id ? updatedItem : t));
    setTemplates(updatedList);

    try {
      // Lưu vào backend
      await websiteService.updateSection('invitation-templates', updatedList);
      if (newStatus) {
        toast.success(`Đã BẬT xuất hiện mẫu "${tpl.name}" trên website!`);
      } else {
        toast.warning(`Đã ẨN mẫu "${tpl.name}" khỏi website khách hàng!`);
      }
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái xuất hiện: ' + (err.message || ''));
      fetchTemplates(); // Hoàn tác nếu lỗi
    }
  };

  // Chuyển đổi trạng thái Nổi bật (Hot / Popular)
  const handleTogglePopular = async (tpl, e) => {
    if (e) e.stopPropagation();
    const newPopular = !tpl.isPopular;
    const updatedItem = {
      ...tpl,
      isPopular: newPopular,
      updatedAt: new Date().toISOString()
    };

    const updatedList = templates.map(t => (t.id === tpl.id ? updatedItem : t));
    setTemplates(updatedList);

    try {
      await websiteService.updateSection('invitation-templates', updatedList);
      toast.success(newPopular ? `Đã gắn nhãn Nổi Bật cho mẫu "${tpl.name}"!` : `Đã bỏ nhãn Nổi Bật mẫu "${tpl.name}"`);
    } catch (err) {
      toast.error('Lỗi cập nhật: ' + err.message);
      fetchTemplates();
    }
  };

  // Mở modal sửa thông tin dịch vụ thiệp
  const handleOpenEdit = (tpl) => {
    setEditingTemplate(tpl);
    const themePreset = THEME_PRESETS[tpl.themeId] || THEME_PRESETS['luxury-gold'];
    setFormData({
      id: tpl.id,
      code: tpl.code || tpl.serviceCode || '',
      serviceCode: tpl.serviceCode || tpl.code || '',
      name: tpl.name || '',
      category: tpl.category || 'Hoàng Gia',
      themeId: tpl.themeId || 'luxury-gold',
      thumbnail: tpl.thumbnail || '',
      coverImage: tpl.coverImage || tpl.thumbnail || '',
      accessType: tpl.accessType || 'vip',
      price: formatNumberWithCommas(tpl.price), // Định dạng số có dấu phẩy phân cách hàng nghìn
      badge: tpl.badge || (tpl.accessType === 'free' ? 'MIỄN PHÍ' : 'ĐẶC QUYỀN VIP'),
      requiredPackage: tpl.requiredPackage || '',
      description: tpl.description || '',
      musicUrl: tpl.musicUrl || '',
      musicTitle: tpl.musicTitle || 'Nhạc Cưới Lãng Mạn',
      primaryColor: tpl.primaryColor || themePreset.primaryColor,
      secondaryColor: tpl.secondaryColor || themePreset.secondaryColor,
      backgroundColor: tpl.backgroundColor || themePreset.backgroundColor,
      textColor: tpl.textColor || themePreset.textColor,
      effectType: tpl.effectType || themePreset.effectType,
      envelopeStyle: tpl.envelopeStyle || 'wax-seal',
      galleryLayout: tpl.galleryLayout || 'grid-2col',
      order: tpl.order || (templates.findIndex(t => t.id === tpl.id) + 1) || 1,
      isActive: tpl.isActive !== undefined ? tpl.isActive : true,
      isPopular: !!tpl.isPopular
    });
    setDemoRefreshKey(prev => prev + 1);
    setIsModalOpen(true);
  };

  // Xử lý thay đổi đơn giá niêm yết: tự động phân cách dấu phẩy giữa hàng nghìn
  const handlePriceChange = (e) => {
    const inputVal = e.target.value;
    if (!inputVal) {
      setFormData(prev => ({ ...prev, price: '' }));
      return;
    }
    const cleanDigits = inputVal.replace(/[^0-9]/g, '');
    if (!cleanDigits) {
      setFormData(prev => ({ ...prev, price: '' }));
      return;
    }
    const formatted = Number(cleanDigits).toLocaleString('en-US');
    setFormData(prev => ({ ...prev, price: formatted }));
  };

  // Tải ảnh đại diện lên server
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await websiteService.uploadImage(file);
      if (res && (res.url || res.path)) {
        const thumbUrl = res.url || res.path;
        setFormData(prev => ({ ...prev, thumbnail: thumbUrl }));
        setDemoRefreshKey(prev => prev + 1);
        toast.success('Đã tải lên và thay thế ảnh thumbnail thành công!');
      }
    } catch (err) {
      toast.error('Lỗi tải ảnh: ' + (err.message || ''));
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Xử lý Kéo thả (Drag & Drop) sắp xếp thứ tự hiển thị
  const isDragEnabled = !searchKeyword && (filterCategory === 'all' || filterCategory === 'Tất Cả') && filterAccess === 'all';

  const handleDragStart = (e, index) => {
    if (!isDragEnabled) return;
    setDraggedIndex(index);
    setDragOverIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch (err) {}
  };

  const handleDragOver = (e, index) => {
    if (!isDragEnabled || draggedIndex === null || draggedIndex === index) return;
    e.preventDefault();

    const reordered = [...templates];
    const draggedItem = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setDragOverIndex(index);
    setTemplates(reordered);
  };

  const handleDragEnd = async () => {
    if (!isDragEnabled) return;
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Gán thứ tự hiển thị rõ ràng 1, 2, 3...
    const updatedWithOrder = templates.map((t, idx) => ({
      ...t,
      order: idx + 1
    }));
    setTemplates(updatedWithOrder);

    try {
      const res = await websiteService.updateSection('invitation-templates', updatedWithOrder);
      if (res && res.success !== false) {
        toast.success('Đã lưu thứ tự hiển thị mẫu thiệp thành công!');
      }
    } catch (err) {
      console.error('Lỗi lưu thứ tự mẫu thiệp:', err);
      toast.error('Lỗi khi lưu thứ tự hiển thị: ' + (err.message || ''));
    }
  };

  // Tải file nhạc từ máy tính lên server
  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingAudio(true);
      const res = await websiteService.uploadAudio(file);
      if (res && (res.url || res.path)) {
        const audioUrl = res.url || res.path;
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setFormData(prev => ({ 
          ...prev, 
          musicUrl: audioUrl,
          musicTitle: prev.musicTitle ? prev.musicTitle : cleanTitle
        }));
        setDemoRefreshKey(prev => prev + 1);
        toast.success(`Đã tải lên bài hát "${file.name}" thành công!`);
      }
    } catch (err) {
      toast.error('Lỗi tải file nhạc: ' + (err.message || ''));
    } finally {
      setUploadingAudio(false);
      e.target.value = '';
    }
  };

  // Lưu thông tin mẫu thiệp sau khi chỉnh sửa
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning('Vui lòng nhập tên mẫu thiệp / dịch vụ!');
      return;
    }

    try {
      const updatedItem = {
        ...editingTemplate,
        ...formData,
        id: editingTemplate ? editingTemplate.id : formData.id,
        serviceCode: formData.code, // Đồng bộ mã dịch vụ
        updatedAt: new Date().toISOString()
      };

      let updatedList = templates.map(t => (t.id === updatedItem.id ? updatedItem : t));
      
      // Nếu có chỉnh sửa thứ tự hiển thị trong modal
      if (formData.order) {
        const targetOrder = Math.max(1, Math.min(templates.length, Number(formData.order) || 1));
        updatedItem.order = targetOrder;
        updatedList = updatedList.filter(t => t.id !== updatedItem.id);
        updatedList.splice(targetOrder - 1, 0, updatedItem);
        updatedList = updatedList.map((t, idx) => ({ ...t, order: idx + 1 }));
      }

      setTemplates(updatedList);

      await websiteService.updateSection('invitation-templates', updatedList);
      try {
        await appService.syncInvitationTemplates({ templates: updatedList });
      } catch (syncErr) {
        console.warn('Lỗi phụ khi sync dịch vụ:', syncErr);
      }
      toast.success('Đã cập nhật thông tin dịch vụ thiệp cưới và đồng bộ vào DB thành công!');
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Lỗi khi lưu: ' + (err.message || ''));
    }
  };

  // Đồng bộ toàn bộ mẫu thiệp vào cơ sở dữ liệu Dịch Vụ
  const handleSyncToDatabase = async () => {
    try {
      setSyncingDb(true);
      // 1. Lưu cấu hình website templates
      await websiteService.updateSection('invitation-templates', templates);
      // 2. Kích hoạt đồng bộ vào MongoDB DichVu
      const res = await appService.syncInvitationTemplates({ templates });
      const syncedCount = res?.data?.count || res?.data?.data?.count || templates.length;
      toast.success(`Đã đồng bộ thành công ${syncedCount} mẫu thiệp vào cơ sở dữ liệu Dịch Vụ! Bạn có thể tìm kiếm trên Hợp đồng ngay bây giờ.`);
    } catch (err) {
      console.error('Lỗi khi đồng bộ dữ liệu dịch vụ:', err);
      toast.error('Lỗi khi đồng bộ dữ liệu dịch vụ: ' + (err.response?.data?.message || err.message || ''));
    } finally {
      setSyncingDb(false);
    }
  };

  // Xem demo trực tiếp trên website khách hàng
  const handleOpenClientDemo = (tpl) => {
    // Thử mở demo trên website cổng port 3000
    const demoUrl = `http://localhost:3000/thiep-online`;
    window.open(demoUrl, '_blank');
  };

  // Thống kê nhanh
  const countTotal = templates.length;
  const countActive = templates.filter(t => t.isActive).length;
  const countInactive = countTotal - countActive;
  const countVip = templates.filter(t => t.accessType === 'vip').length;
  const countFree = templates.filter(t => t.accessType === 'free').length;
  const countPaid = templates.filter(t => t.accessType === 'paid').length;
  // Tổng số hợp đồng đã mua thiệp
  const countTotalPurchased = Object.values(purchasedMap).reduce((acc, arr) => acc + arr.length, 0);

  // Lọc danh sách
  const filteredTemplates = templates.filter(item => {
    // 1. Tìm kiếm từ khóa (tên, mã dịch vụ, ID, mô tả)
    const kw = searchKeyword.toLowerCase().trim();
    if (kw) {
      const matchName = item.name?.toLowerCase().includes(kw);
      const matchCode = item.code?.toLowerCase().includes(kw) || item.serviceCode?.toLowerCase().includes(kw);
      const matchId = item.id?.toLowerCase().includes(kw);
      const matchCat = item.category?.toLowerCase().includes(kw);
      if (!matchName && !matchCode && !matchId && !matchCat) return false;
    }

    // 2. Lọc theo trạng thái / phân quyền
    if (filterAccess === 'active' && !item.isActive) return false;
    if (filterAccess === 'inactive' && item.isActive) return false;
    if (filterAccess === 'free' && item.accessType !== 'free') return false;
    if (filterAccess === 'vip' && item.accessType !== 'vip') return false;
    if (filterAccess === 'paid' && item.accessType !== 'paid') return false;

    // 3. Lọc theo phong cách danh mục
    if (filterCategory !== 'Tất Cả' && item.category !== filterCategory) return false;

    return true;
  });

  return (
    <div className={`quanly-thiep-moi-wrapper ${isEmbedded ? "is-embedded" : ""}`}>
      {/* Top Header */}
      {/* Top Header */}
      <div className="sapo-page-header">
        <div>
          <div className="page-badge-label">LONG WEDDING STUDIO &bull; HỆ THỐNG DỊCH VỤ THIỆP MỜI</div>
          <h1 className="sapo-page-title">
            <i className="fa-solid fa-envelope-open-text" style={{ color: '#D4AF37', marginRight: 12 }}></i>
            Quản Lý Danh Sách & Sự Xuất Hiện Mẫu Thiệp Cưới
          </h1>
          <p className="sapo-page-desc">
            Các mẫu thiệp được thiết kế sẵn theo mã dịch vụ & ID cố định. Bật/Tắt sự xuất hiện trực tiếp trên website khách hàng và thiết lập phân quyền Hợp đồng cưới.
          </p>
        </div>

        <div className="sapo-header-actions">
          <button 
            className="sapo-btn-sync" 
            onClick={handleSyncToDatabase} 
            disabled={syncingDb}
            title="Đồng bộ toàn bộ mẫu thiệp vào danh sách Dịch Vụ để có thể tìm kiếm và lên Hợp Đồng cưới"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: syncingDb ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <i className={`fa-solid ${syncingDb ? 'fa-spinner fa-spin' : 'fa-database'}`}></i>
            <span>{syncingDb ? 'Đang Đồng Bộ DB...' : 'Đồng Bộ Dịch Vụ Vào DB'}</span>
          </button>

          <button 
            className="sapo-btn-secondary" 
            onClick={fetchTemplates} 
            disabled={refreshing}
            title="Đồng bộ lại danh sách từ cơ sở dữ liệu"
          >
            <i className={`fa-solid fa-rotate ${refreshing ? 'fa-spin' : ''}`}></i>
            <span>Làm Mới</span>
          </button>

          <a 
            href={window.location.hostname === "localhost" ? "http://localhost:3000/thiep-online" : "/thiep-online"} 
            target="_blank" 
            rel="noreferrer"
            className="sapo-btn-primary"
            title="Mở trang Kho Mẫu Thiệp thực tế trên website khách hàng"
          >
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
            <span>Xem Kho Mẫu Website</span>
          </a>
        </div>
      </div>

      {/* Metrics Row - Bảng Chỉ Số Thông Minh */}
      <div className="sapo-metrics-row">
        <div className="sapo-metric-card highlight-card">
          <div className="metric-icon total"><i className="fa-solid fa-layer-group"></i></div>
          <div className="metric-info">
            <span className="metric-label">Tổng số mẫu thiết kế sẵn</span>
            <strong className="metric-val">{countTotal} Mẫu</strong>
          </div>
        </div>

        <div className="sapo-metric-card active-card">
          <div className="metric-icon active-icon"><i className="fa-solid fa-circle-check"></i></div>
          <div className="metric-info">
            <span className="metric-label">Đang xuất hiện trên Website</span>
            <strong className="metric-val text-success">{countActive} Mẫu</strong>
          </div>
        </div>

        <div className="sapo-metric-card inactive-card">
          <div className="metric-icon inactive-icon"><i className="fa-solid fa-eye-slash"></i></div>
          <div className="metric-info">
            <span className="metric-label">Đang tạm ẩn khỏi Website</span>
            <strong className="metric-val text-muted">{countInactive} Mẫu</strong>
          </div>
        </div>

        <div className="sapo-metric-card vip-card">
          <div className="metric-icon vip"><i className="fa-solid fa-crown"></i></div>
          <div className="metric-info">
            <span className="metric-label">Đặc Quyền VIP Hợp Đồng</span>
            <strong className="metric-val text-warning">{countVip} Mẫu</strong>
          </div>
        </div>

        <div className="sapo-metric-card purchased-card">
          <div className="metric-icon purchased-icon"><i className="fa-solid fa-heart"></i></div>
          <div className="metric-info">
            <span className="metric-label">Hợp đồng đã sử dụng thiệp</span>
            <strong className="metric-val text-rose">
              {loadingContracts ? <CircularProgress size={14} style={{ color: '#ec4899' }} /> : `${countTotalPurchased} HĐ`}
            </strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="sapo-filter-bar">
        <div className="sapo-search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input 
            type="text" 
            placeholder="Tìm theo Tên mẫu, Mã Dịch Vụ (VD: VIP-SONGHY-06), ID (tpl-song-hy-xanh)..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          {searchKeyword && (
            <button className="btn-clear-search" onClick={() => setSearchKeyword('')}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>

        {/* Lọc danh mục */}
        <div className="category-select-wrapper">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="sapo-select-dropdown"
          >
            {CATEGORY_OPTIONS.map((cat, idx) => (
              <option key={idx} value={cat}>Phong cách: {cat}</option>
            ))}
          </select>
        </div>

        {/* Filter Pills */}
        <div className="sapo-filter-pills">
          <button 
            className={`filter-pill ${filterAccess === 'all' ? 'active' : ''}`}
            onClick={() => setFilterAccess('all')}
          >
            Tất Cả ({countTotal})
          </button>
          <button 
            className={`filter-pill pill-active ${filterAccess === 'active' ? 'active' : ''}`}
            onClick={() => setFilterAccess('active')}
          >
            <i className="fa-solid fa-eye" style={{ marginRight: 5 }}></i>
            Đang Xuất Hiện ({countActive})
          </button>
          <button 
            className={`filter-pill pill-inactive ${filterAccess === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilterAccess('inactive')}
          >
            <i className="fa-solid fa-eye-slash" style={{ marginRight: 5 }}></i>
            Tạm Ẩn ({countInactive})
          </button>
          <button 
            className={`filter-pill ${filterAccess === 'vip' ? 'active' : ''}`}
            onClick={() => setFilterAccess('vip')}
          >
            Đặc Quyền VIP ({countVip})
          </button>
          <button 
            className={`filter-pill ${filterAccess === 'free' ? 'active' : ''}`}
            onClick={() => setFilterAccess('free')}
          >
            Miễn Phí ({countFree})
          </button>
          <button 
            className={`filter-pill ${filterAccess === 'paid' ? 'active' : ''}`}
            onClick={() => setFilterAccess('paid')}
          >
            Trả Phí ({countPaid})
          </button>
        </div>
      </div>

      {/* Hướng dẫn kéo thả thứ tự hiển thị */}
      <div className="sapo-reorder-banner">
        <div className="reorder-banner-content">
          <div className="banner-icon-box">
            <i className="fa-solid fa-arrows-up-down-left-right"></i>
          </div>
          <div className="banner-text-box">
            <h4 className="banner-title">Thứ tự hiển thị mẫu thiệp trên Website</h4>
            <p className="banner-desc">
              Bạn có thể <strong>nhấn giữ và kéo thả trực tiếp</strong> các mẫu thiệp bên dưới để sắp xếp vị trí xuất hiện trên website khách hàng. Thay đổi sẽ tự động lưu ngay khi bạn thả chuột.
            </p>
          </div>
        </div>
        {!isDragEnabled && (
          <div className="reorder-banner-note">
            <i className="fa-solid fa-circle-info"></i>
            <span>Đang tìm kiếm hoặc lọc danh mục. Hãy chọn <strong>Tất Cả</strong> và xóa ô tìm kiếm để kéo thả sắp xếp toàn bộ.</span>
          </div>
        )}
      </div>

      {/* Grid Templates */}
      {loading ? (
        <div className="sapo-loading-box">
          <CircularProgress size={36} style={{ color: '#D4AF37' }} />
          <p>Đang đồng bộ danh sách mẫu thiệp thiết kế sẵn...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="sapo-empty-box">
          <i className="fa-solid fa-folder-open"></i>
          <h3>Không tìm thấy mẫu thiệp nào phù hợp</h3>
          <p>Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc khác.</p>
        </div>
      ) : (
        <div className="sapo-templates-grid">
          {filteredTemplates.map((item, index) => {
            const isDraggingThis = draggedIndex === index;
            const isOverThis = dragOverIndex === index;
            const displayOrder = item.order || (index + 1);

            return (
            <div 
              key={item.id} 
              className={`sapo-tpl-card ${item.isActive ? 'card-active' : 'card-inactive'} ${isDraggingThis ? 'is-dragging' : ''} ${isOverThis ? 'drag-over-target' : ''}`}
              draggable={isDragEnabled}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Thanh kéo thả & Thứ tự hiển thị */}
              <div 
                className="tpl-drag-header" 
                title={isDragEnabled ? "Nhấn giữ và kéo thả để thay đổi vị trí thứ tự xuất hiện trên website" : "Chuyển về tab Tất Cả để kéo thả sắp xếp"}
              >
                <div className="drag-handle-pill">
                  <i className="fa-solid fa-grip-vertical grip-icon"></i>
                  <span className="order-number-badge">#{displayOrder}</span>
                  <span className="order-label-text">Vị trí {displayOrder}</span>
                </div>
                <div className="drag-tip-text">
                  <i className="fa-solid fa-arrows-up-down-left-right"></i>
                  <span>Kéo để đổi vị trí</span>
                </div>
              </div>
              {/* Header ảnh & Badges */}
              <div className="tpl-img-box">
                <img src={item.thumbnail} alt={item.name} />
                <div className="tpl-overlay-gradient"></div>

                {/* Huy hiệu phân quyền */}
                <span className={`tpl-badge-pill ${item.accessType}`}>
                  {item.badge || (item.accessType === 'free' ? 'MIỄN PHÍ' : 'ĐẶC QUYỀN VIP')}
                </span>

                {/* Nút gắn nhãn Nổi bật / Hot */}
                <button 
                  type="button"
                  className={`tpl-popular-btn ${item.isPopular ? 'is-popular' : ''}`}
                  onClick={(e) => handleTogglePopular(item, e)}
                  title={item.isPopular ? "Mẫu nổi bật / Hot (Bấm để gỡ nhãn)" : "Bấm để gắn nhãn Mẫu Nổi Bật"}
                >
                  <i className={`fa-solid ${item.isPopular ? 'fa-fire' : 'fa-star'}`}></i>
                </button>

                {/* Tag trạng thái xuất hiện */}
                <div className={`tpl-visibility-indicator ${item.isActive ? 'status-visible' : 'status-hidden'}`}>
                  <span className="pulse-dot"></span>
                  <span>{item.isActive ? 'ĐANG XUẤT HIỆN' : 'ĐANG TẠM ẨN'}</span>
                </div>
              </div>

              {/* Thân card */}
              <div className="tpl-body-box">
                {/* Dòng định danh: Mã Dịch Vụ & ID Cố Định */}
                <div className="tpl-service-identity-row">
                  <div className="identity-tags">
                    <span className="service-code-tag" title="Mã Dịch Vụ liên kết Hợp đồng cưới">
                      <i className="fa-solid fa-tag"></i> {item.code || item.serviceCode}
                    </span>
                    <span className="service-id-tag" title="ID định danh cố định trong hệ thống">
                      #{item.id}
                    </span>
                  </div>
                  <span className="category-tag">{item.category}</span>
                </div>

                <h3 className="tpl-name" title={item.name}>{item.name}</h3>
                <p className="tpl-description">{item.description}</p>

                {/* Thông tin nghiệp vụ dịch vụ */}
                <div className="tpl-attributes-list">
                  <div className="attr-item">
                    <span className="attr-label">Phân khúc:</span>
                    <strong className={`attr-value type-${item.accessType}`}>
                      {item.accessType === 'free' ? 'Miễn phí (Tự do trải nghiệm)' : item.accessType === 'vip' ? 'Đặc quyền Hợp Đồng Studio' : 'Trả phí / Bán lẻ'}
                    </strong>
                  </div>
                  <div className="attr-item">
                    <span className="attr-label">Đơn giá niêm yết:</span>
                    <strong className="attr-value price-highlight">{formatPriceDisplay(item.price)}</strong>
                  </div>
                  <div className="attr-item">
                    <span className="attr-label">Gói áp dụng:</span>
                    <span className="attr-value text-muted" title={item.requiredPackage}>
                      {item.requiredPackage || 'Mọi khách hàng'}
                    </span>
                  </div>
                  {item.musicTitle && (
                    <div className="attr-item music-attr">
                      <span className="attr-label">Nhạc nền:</span>
                      <span className="attr-value music-val">
                        <i className="fa-solid fa-music"></i> {item.musicTitle}
                      </span>
                    </div>
                  )}
                </div>

                {/* === KHỐI KHÁCH HÀNG ĐÃ MUA THIỆP NÀY === */}
                {(() => {
                  const serviceCode = item.code || item.serviceCode || item.id;
                  const buyers = purchasedMap[serviceCode] || [];
                  if (buyers.length === 0 && loadingContracts) {
                    return (
                      <div className="tpl-buyers-row tpl-buyers-loading">
                        <CircularProgress size={12} style={{ color: '#ec4899', marginRight: 6 }} />
                        <span>Đang tải dữ liệu khách hàng...</span>
                      </div>
                    );
                  }
                  if (buyers.length === 0) {
                    return (
                      <div className="tpl-buyers-row tpl-no-buyers">
                        <i className="fa-regular fa-clock"></i>
                        <span>Chưa có khách hàng sử dụng mẫu này</span>
                      </div>
                    );
                  }
                  return (
                    <div className="tpl-buyers-section">
                      <div className="tpl-buyers-header">
                        <span className="buyers-count-badge">
                          <i className="fa-solid fa-heart"></i> {buyers.length} khách hàng đã sử dụng
                        </span>
                      </div>
                      <div className="tpl-buyers-list">
                        {buyers.slice(0, 3).map((buyer, bi) => (
                          <div key={bi} className="buyer-item">
                            <div className="buyer-avatar">
                              {(buyer.tenKhachHang || 'K').charAt(0).toUpperCase()}
                            </div>
                            <div className="buyer-info">
                              <span className="buyer-name">{buyer.tenKhachHang}</span>
                              <span className="buyer-contract">HD: {buyer.maHopDong}</span>
                            </div>
                          </div>
                        ))}
                        {buyers.length > 3 && (
                          <div className="buyer-more">
                            <i className="fa-solid fa-ellipsis"></i>
                            <span>+{buyers.length - 3} khách hàng khác</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Footer Điều Khiển Xuất Hiện & Tác Vụ */}
                <div className="tpl-footer-row">
                  {/* CÔNG TẮC BẬT / TẮT XUẤT HIỆN 1-CHẠM TRỰC TIẾP */}
                  <div 
                    className={`status-switch-wrapper ${item.isActive ? 'is-on' : 'is-off'}`}
                    onClick={(e) => handleToggleStatus(item, e)}
                    title={item.isActive ? "Bấm để TẠM ẨN mẫu thiệp khỏi website khách hàng" : "Bấm để CHO PHÉP XUẤT HIỆN mẫu thiệp trên website"}
                  >
                    <div className="toggle-track">
                      <div className="toggle-thumb"></div>
                    </div>
                    <span className="toggle-label-text">
                      {item.isActive ? 'Đang Hiển Thị' : 'Tạm Ẩn'}
                    </span>
                  </div>

                  {/* Nhóm nút tác vụ */}
                  <div className="btn-actions-group">
                    <button 
                      className="action-btn preview-btn" 
                      onClick={() => setPreviewModalTemplate(item)}
                      title="Xem trước mẫu thiệp tương tác"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => handleOpenEdit(item)}
                      title="Chỉnh sửa thông tin kinh doanh & hiển thị"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* Modal Chỉnh Sửa Thông Tin Dịch Vụ Mẫu Thiệp */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '16px',
            overflow: 'hidden',
            maxHeight: '94vh'
          }
        }}
      >
        <DialogTitle style={{ 
          background: '#0F172A', 
          color: '#F8FAFC',
          borderBottom: '1px solid #334155', 
          fontWeight: 700, 
          fontSize: '1.2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px 24px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 38, height: 38, borderRadius: 10, 
              background: 'linear-gradient(135deg, #D4AF37, #AA771C)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#000', fontSize: '1.1rem' 
            }}>
              <i className="fa-solid fa-pen-to-square"></i>
            </div>
            <div>
              <div style={{ fontSize: '1.15rem' }}>Cấu Hình Dịch Vụ Mẫu Thiệp Cưới</div>
              <div style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 400 }}>
                ID Hệ Thống: <code style={{ color: '#FCD34D' }}>{formData.id}</code> &bull; Thiết kế sẵn trên Website
              </div>
            </div>
          </div>
          
          <IconButton onClick={() => setIsModalOpen(false)} style={{ color: '#94A3B8' }}>
            <i className="fa-solid fa-xmark"></i>
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ padding: '24px', background: '#F8FAFC' }}>
          <form onSubmit={handleSave}>
            <Grid container spacing={3}>
              {/* CỘT TRÁI: THÔNG TIN DỊCH VỤ & KINH DOANH */}
              <Grid item xs={12} md={7}>
                <Paper style={{ padding: 20, borderRadius: 12, marginBottom: 20, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <Typography variant="subtitle1" style={{ fontWeight: 700, marginBottom: 16, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="fa-solid fa-circle-info" style={{ color: '#2563EB' }}></i>
                    Thông Tin Mẫu Thiệp & Mã Dịch Vụ Hợp Đồng
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <TextField 
                        label="Tên Mẫu Thiệp / Dịch Vụ" 
                        fullWidth 
                        size="small" 
                        required 
                        value={formData.name} 
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField 
                        label="Mã Dịch Vụ (Service Code)" 
                        fullWidth 
                        size="small" 
                        required 
                        value={formData.code} 
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value, serviceCode: e.target.value }))}
                        helperText="Liên kết Hợp đồng cưới"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Phong Cách / Danh Mục</InputLabel>
                        <Select 
                          value={formData.category} 
                          label="Phong Cách / Danh Mục"
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        >
                          <MenuItem value="Hoàng Gia">Hoàng Gia & Ánh Kim</MenuItem>
                          <MenuItem value="Lãng Mạn">Lãng Mạn & Hoa Hồng</MenuItem>
                          <MenuItem value="Truyền Thống">Son Hỷ & Á Đông Truyền Thống</MenuItem>
                          <MenuItem value="Hiện Đại">Hiện Đại & Minimalist</MenuItem>
                          <MenuItem value="Rustic">Rustic Cỏ Hoa Thảo Mộc</MenuItem>
                          <MenuItem value="Hàn Quốc">Hàn Quốc Dịu Êm Pastel</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Phân Khúc Quyền Hạn (Access Tier)</InputLabel>
                        <Select 
                          value={formData.accessType} 
                          label="Phân Khúc Quyền Hạn (Access Tier)"
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => ({ 
                              ...prev, 
                              accessType: val,
                              badge: val === 'free' ? 'MIỄN PHÍ' : val === 'vip' ? 'ĐẶC QUYỀN VIP' : 'TRẢ PHÍ / VIP',
                              price: val === 'free' ? '0' : (prev.price && prev.price !== '0' ? prev.price : '299,000')
                            }));
                          }}
                        >
                          <MenuItem value="free">Miễn Phí (Tự do trải nghiệm)</MenuItem>
                          <MenuItem value="vip">Đặc Quyền VIP (Theo Hợp Đồng Studio)</MenuItem>
                          <MenuItem value="paid">Trả Phí / Bán Lẻ Theo Yêu Cầu</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Đơn Giá Niêm Yết" 
                        fullWidth 
                        size="small" 
                        value={formData.price} 
                        onChange={handlePriceChange}
                        placeholder="VD: 150,000 hoặc 0"
                        InputProps={{
                          endAdornment: (
                            <span style={{ color: '#64748B', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                              VNĐ
                            </span>
                          )
                        }}
                        helperText="Phân cách hàng nghìn bằng dấu phẩy (VD: 150,000)"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Thứ Tự Hiển Thị Trên Website (Vị trí #)" 
                        type="number"
                        fullWidth 
                        size="small" 
                        value={formData.order || 1} 
                        onChange={(e) => setFormData(prev => ({ ...prev, order: Math.max(1, Number(e.target.value) || 1) }))}
                        helperText="Mẫu có số thứ tự #1 sẽ hiển thị đầu tiên trên website"
                        inputProps={{ min: 1, max: templates.length }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Huy Hiệu Hiển Thị (Badge)" 
                        fullWidth 
                        size="small" 
                        value={formData.badge} 
                        onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                        placeholder="VD: ĐẶC QUYỀN VIP"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField 
                        label="Gói Hợp Đồng Áp Dụng (Điều kiện mở khóa)" 
                        fullWidth 
                        size="small" 
                        value={formData.requiredPackage} 
                        onChange={(e) => setFormData(prev => ({ ...prev, requiredPackage: e.target.value }))}
                        placeholder="VD: Gói Chụp Ảnh Cưới / Trọn Gói Studio Long Wedding"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField 
                        label="Mô Tả Giới Thiệu Mẫu Thiệp" 
                        fullWidth 
                        multiline 
                        rows={2} 
                        size="small" 
                        value={formData.description} 
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* HÌNH ẢNH & ÂM NHẠC (TẢI LÊN TỪ MÁY TÍNH & THAY THẾ) */}
                <Paper style={{ padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <Typography variant="subtitle1" style={{ fontWeight: 700, marginBottom: 16, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="fa-solid fa-photo-film" style={{ color: '#10B981' }}></i>
                    Tài Nguyên Ảnh & Nhạc Nền (Tải Lên Từ Máy Tính & Thay Thế)
                  </Typography>

                  {/* KHỐI 1: ẢNH THUMBNAIL (Xem trước + Tải lên thay thế) */}
                  <div style={{ 
                    display: 'flex', gap: 16, alignItems: 'center', 
                    padding: '14px 16px', background: '#F8FAFC', 
                    borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 16 
                  }}>
                    {/* Hộp xem trước Thumbnail thu nhỏ */}
                    <div style={{ 
                      width: 68, height: 86, borderRadius: 8, overflow: 'hidden', 
                      background: '#0F172A', flexShrink: 0, border: '2px solid #D4AF37',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {formData.thumbnail ? (
                        <img 
                          src={formData.thumbnail} 
                          alt="Thumbnail preview" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <i className="fa-solid fa-image" style={{ color: '#64748B', fontSize: '1.5rem' }}></i>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>
                          Ảnh Đại Diện Thumbnail (WebP / JPG)
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          Tỷ lệ khuyến nghị 3:4 hoặc 4:5
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: 10 }}>
                        <TextField 
                          fullWidth 
                          size="small" 
                          placeholder="Dán URL ảnh hoặc bấm Tải Ảnh Lên..."
                          value={formData.thumbnail} 
                          onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                        />

                        <input 
                          type="file" 
                          id="upload-thumb-input" 
                          accept="image/jpeg,image/png,image/webp,image/*" 
                          style={{ display: 'none' }} 
                          onChange={handleFileUpload} 
                        />
                        <label htmlFor="upload-thumb-input" style={{ flexShrink: 0 }}>
                          <Button 
                            variant="contained" 
                            component="span" 
                            disabled={uploadingImage}
                            style={{ 
                              height: '40px', textTransform: 'none', 
                              background: '#2563EB', color: '#FFF', fontWeight: 600,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {uploadingImage ? (
                              <CircularProgress size={18} style={{ color: '#FFF' }} />
                            ) : (
                              <><i className="fa-solid fa-cloud-arrow-up" style={{ marginRight: 6 }}></i> Tải Ảnh Lên</>
                            )}
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* KHỐI 2: NHẠC NỀN MP3 (Tải lên thay thế + Trình nghe thử mini) */}
                  <div style={{ 
                    padding: '14px 16px', background: '#F8FAFC', 
                    borderRadius: 12, border: '1px solid #E2E8F0' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>
                        Bài Hát Nhạc Nền Thiệp Cưới (MP3 / WAV)
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Tải lên file nhạc từ máy tính (dung lượng &lt; 20MB)
                      </span>
                    </div>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField 
                          label="Tên Bài Hát Mặc Định" 
                          fullWidth 
                          size="small" 
                          value={formData.musicTitle} 
                          onChange={(e) => setFormData(prev => ({ ...prev, musicTitle: e.target.value }))}
                          placeholder="VD: Mối Duyên Vàng"
                        />
                      </Grid>

                      <Grid item xs={12} sm={5}>
                        <TextField 
                          label="Đường Dẫn File Nhạc (URL / MP3)" 
                          fullWidth 
                          size="small" 
                          value={formData.musicUrl} 
                          onChange={(e) => setFormData(prev => ({ ...prev, musicUrl: e.target.value }))}
                          placeholder="/audio/MOIDUYENVANG.mp3"
                        />
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <input 
                          type="file" 
                          id="upload-audio-input" 
                          accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/ogg,audio/*" 
                          style={{ display: 'none' }} 
                          onChange={handleAudioUpload} 
                        />
                        <label htmlFor="upload-audio-input" style={{ width: '100%', display: 'block' }}>
                          <Button 
                            variant="contained" 
                            component="span" 
                            fullWidth
                            disabled={uploadingAudio}
                            style={{ 
                              height: '40px', textTransform: 'none', 
                              background: '#059669', color: '#FFF', fontWeight: 600,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {uploadingAudio ? (
                              <CircularProgress size={18} style={{ color: '#FFF' }} />
                            ) : (
                              <><i className="fa-solid fa-file-audio" style={{ marginRight: 6 }}></i> Tải Nhạc Lên</>
                            )}
                          </Button>
                        </label>
                      </Grid>
                    </Grid>

                    {/* Trình nghe thử bài hát mini */}
                    {formData.musicUrl && (
                      <div style={{ 
                        marginTop: 12, padding: '8px 12px', background: '#FFFFFF', 
                        borderRadius: 8, border: '1px solid #E2E8F0', 
                        display: 'flex', alignItems: 'center', gap: 12 
                      }}>
                        <div style={{ 
                          width: 32, height: 32, borderRadius: '50%', background: '#EFF6FF', 
                          color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.85rem', flexShrink: 0
                        }}>
                          <i className="fa-solid fa-music"></i>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>
                            Nghe thử nhạc thiệp: <strong style={{ color: '#1E293B' }}>{formData.musicTitle || 'Nhạc Cưới'}</strong>
                          </div>
                          <audio 
                            controls 
                            src={formData.musicUrl} 
                            key={formData.musicUrl}
                            style={{ width: '100%', height: 32, marginTop: 4 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                {/* Công tắc Bật/Tắt và Nổi bật */}
                  <Box style={{ display: 'flex', gap: 24, marginTop: 20, paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={formData.isActive} 
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} 
                          color="primary"
                        />
                      }
                      label={<strong>Xuất hiện trên Website</strong>}
                    />

                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={formData.isPopular} 
                          onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))} 
                          color="warning"
                        />
                      }
                      label={<span>Gắn nhãn Nổi Bật (Hot)</span>}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* CỘT PHẢI: XEM TRƯỚC LIVE DEMO THỰC TẾ */}
              <Grid item xs={12} md={5}>
                <Paper style={{ 
                  height: '100%', minHeight: 520, 
                  borderRadius: 12, overflow: 'hidden', 
                  border: '1px solid #E2E8F0', 
                  display: 'flex', flexDirection: 'column' 
                }}>
                  <div style={{ 
                    padding: '12px 16px', background: '#1E293B', color: '#F8FAFC',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                  }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                      <i className="fa-solid fa-mobile-screen" style={{ marginRight: 8, color: '#FCD34D' }}></i>
                      Mô Phỏng Giao Diện Di Động
                    </span>
                    <Button 
                      size="small" 
                      style={{ color: '#94A3B8', textTransform: 'none', fontSize: '0.78rem' }}
                      onClick={() => setDemoRefreshKey(prev => prev + 1)}
                    >
                      <i className="fa-solid fa-rotate-right" style={{ marginRight: 5 }}></i> Làm mới
                    </Button>
                  </div>

                  <div style={{ flex: 1, background: '#F1F5F9', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 12 }}>
                    <iframe 
                      key={demoRefreshKey}
                      title="Live Demo Preview"
                      srcDoc={generateStandaloneHtml(formData)}
                      style={{ 
                        width: '100%', 
                        maxWidth: '360px', 
                        height: '500px', 
                        border: '8px solid #0F172A', 
                        borderRadius: '24px', 
                        background: '#FFF',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
                      }}
                    />
                  </div>
                </Paper>
              </Grid>
            </Grid>

            <DialogActions style={{ marginTop: 24, padding: '16px 0 0 0', borderTop: '1px solid #E2E8F0' }}>
              <Button onClick={() => setIsModalOpen(false)} style={{ color: '#64748B', textTransform: 'none' }}>
                Đóng
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                style={{ 
                  background: 'linear-gradient(135deg, #1E293B, #0F172A)', 
                  color: '#F8FAFC', fontWeight: 600, padding: '8px 24px', textTransform: 'none' 
                }}
              >
                <i className="fa-solid fa-check" style={{ marginRight: 8 }}></i>
                Lưu Thay Đổi
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Xem Trước Demo Đầy Đủ */}
      {previewModalTemplate && (
        <Dialog
          open={Boolean(previewModalTemplate)}
          onClose={() => setPreviewModalTemplate(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            style: {
              borderRadius: '16px',
              overflow: 'hidden',
              height: '90vh'
            }
          }}
        >
          <div style={{ 
            background: '#0F172A', color: '#FFF', padding: '12px 20px', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
          }}>
            <div>
              <strong>{previewModalTemplate.name}</strong> &bull; <span style={{ color: '#D4AF37' }}>{previewModalTemplate.code}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button 
                size="small"
                variant="outlined"
                style={{ color: '#FCD34D', borderColor: '#FCD34D', textTransform: 'none' }}
                onClick={() => handleOpenClientDemo(previewModalTemplate)}
              >
                <i className="fa-solid fa-arrow-up-right-from-square" style={{ marginRight: 6 }}></i> Xem Trên Web
              </Button>
              <IconButton onClick={() => setPreviewModalTemplate(null)} style={{ color: '#FFF' }}>
                <i className="fa-solid fa-xmark"></i>
              </IconButton>
            </div>
          </div>
          <iframe 
            title="Interactive Preview"
            srcDoc={generateStandaloneHtml(previewModalTemplate)}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </Dialog>
      )}
    </div>
  );
};

export default QuanLyThiepMoi;
