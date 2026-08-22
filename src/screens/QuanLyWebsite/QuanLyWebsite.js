import React, { useState, useEffect } from 'react';
import './QuanLyWebsite.css';
import { toast } from 'sonner';
import websiteService from '../../API/services/websiteService';
import otherService from '../../API/services/otherService';
import { formatCurrency } from '../utils/formatCurrency.js';

const SECTIONS = [
  { id: 'banners', name: 'Slide Banner', icon: '🖼️' },
  { id: 'khai_truong', name: 'Deal Khai Trương', icon: '🎟️' },
  { id: 'services', name: 'Dịch vụ của tôi', icon: '💼' },
  { id: 'feedback', name: 'Feedback khách hàng', icon: '⭐' },
  { id: 'bookings', name: 'Danh sách lịch tư vấn', icon: '📅' },
  { id: 'dresses', name: 'Bộ sưu tập váy cưới', icon: '👗' },
  { id: 'invitations', name: 'Mẫu thiệp cưới nổi bật', icon: '💌' },
  { id: 'makeup', name: 'Nghệ thuật trang điểm', icon: '💄' },
  { id: 'packages', name: 'Bảng giá & Gói chụp', icon: '💰' },
  { id: 'collections', name: 'Concept mẫu', icon: '🎨' },
  { id: 'special_collections', name: 'Bộ sưu tập đặc biệt', icon: '✨' },
  { id: 'footer', name: 'Thông tin Footer', icon: '📌' }
];

const QuanLyWebsite = () => {
  const [activeTab, setActiveTab] = useState('banners');
  const [khaiTruongSubTab, setKhaiTruongSubTab] = useState('deals');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const getEffectiveSection = () => {
    if (activeTab === 'khai_truong') {
      if (khaiTruongSubTab === 'vouchers') return 'vouchers';
      if (khaiTruongSubTab === 'claims') return 'voucher_claims';
      return 'khai_truong';
    }
    return activeTab;
  };
  const section = getEffectiveSection();
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    if (section !== 'special_collections') return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, targetIndex) => {
    if (section !== 'special_collections' || draggedIndex === null || draggedIndex === targetIndex) return;
    e.preventDefault();
    
    const reorderedData = [...data];
    const draggedItem = reorderedData[draggedIndex];
    reorderedData.splice(draggedIndex, 1);
    reorderedData.splice(targetIndex, 0, draggedItem);
    
    setDraggedIndex(targetIndex);
    setData(reorderedData);
  };

  const handleDragEnd = async () => {
    if (section !== 'special_collections') return;
    setDraggedIndex(null);
    
    setLoading(true);
    try {
      const res = await websiteService.updateSection('special_collections', data, localStorage.getItem('access_token') || localStorage.getItem('token'));
      if (res && res.success) {
        toast.success("Đã cập nhật thứ tự hiển thị!");
        setData(res.data || []);
      }
    } catch (err) {
      toast.error("Lỗi khi lưu thứ tự hiển thị");
    } finally {
      setLoading(false);
    }
  };
  
  // Sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [servicesList, setServicesList] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [activeServiceTab, setActiveServiceTab] = useState('general');
  
  // Auth state removed as we use admin token
  // Temporary state for form
  const [editItem, setEditItem] = useState(null);
  const [bookingFilter, setBookingFilter] = useState('all');
 
  // Global Settings
  const [globalSettings, setGlobalSettings] = useState({ isPublished: true, scheduledPublishTime: '' });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    fetchGlobalSettings();
  }, []);

  const fetchGlobalSettings = async () => {
    try {
      const res = await websiteService.getSection('settings');
      if (res && res.success && res.data && !Array.isArray(res.data)) {
        setGlobalSettings({
          isPublished: res.data.isPublished !== undefined ? res.data.isPublished : true,
          scheduledPublishTime: res.data.scheduledPublishTime || ''
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải cài đặt chung", error);
    }
  };

  const handleSaveGlobalSettings = async () => {
    setIsSavingSettings(true);
    try {
      await websiteService.updateSection('settings', globalSettings, localStorage.getItem('access_token') || localStorage.getItem('token'));
      toast.success("Đã lưu cài đặt hiển thị website!");
    } catch (error) {
      toast.error("Lỗi khi lưu cài đặt hiển thị");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSingleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const preview = URL.createObjectURL(file);
    setEditItem(prev => ({
      ...prev,
      [fieldName]: { file, preview }
    }));
    toast.success("Đã chọn ảnh thành công!");
  };

  const handleMultipleImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const currentImages = Array.isArray(editItem.images) ? editItem.images : [];
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setEditItem(prev => ({
      ...prev,
      images: [...currentImages, ...newImages]
    }));
    toast.success(`Đã chọn ${files.length} ảnh thành công!`);
  };

  const renderImageUploadField = (placeholder, fieldName) => {
    const value = editItem[fieldName];
    const previewSrc = (value && typeof value === 'object' && value.preview) ? value.preview : value;

    return (
      <div className="image-upload-field">
        <label className="field-label">{placeholder}</label>
        {previewSrc ? (
          <div className="image-preview-wrapper">
            <img src={previewSrc} alt="Preview" className="image-preview-thumb" />
            <div className="image-preview-actions">
              <button 
                type="button" 
                className="image-action-btn delete" 
                onClick={() => {
                  if (value && typeof value === 'object' && value.preview) {
                    URL.revokeObjectURL(value.preview);
                  }
                  setEditItem({ ...editItem, [fieldName]: '' });
                }}
              >
                Xóa ảnh
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-dropzone">
            <span className="upload-text">Chọn ảnh từ máy tính</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleSingleImageUpload(e, fieldName)} 
              className="upload-input-file"
            />
          </div>
        )}
      </div>
    );
  };

  const renderMultipleImagesUpload = () => {
    const images = Array.isArray(editItem.images) ? editItem.images : [];
    
    return (
      <div className="multiple-images-field">
        <label className="field-label">Danh sách ảnh Album ({images.length} ảnh)</label>
        <div className="album-images-grid">
          {images.map((img, index) => {
            const previewSrc = (img && typeof img === 'object' && img.preview) ? img.preview : img;
            return (
              <div key={index} className="album-image-card">
                <img src={previewSrc} alt={`Album item ${index}`} className="album-image-thumb" />
                <button 
                  type="button" 
                  className="album-image-delete-btn" 
                  onClick={() => {
                    if (img && typeof img === 'object' && img.preview) {
                      URL.revokeObjectURL(img.preview);
                    }
                    const newImages = images.filter((_, idx) => idx !== index);
                    setEditItem({ ...editItem, images: newImages });
                  }}
                  title="Xóa ảnh này"
                >
                  ×
                </button>
              </div>
            );
          })}
          
          <div className="album-image-add-card">
            <span>+ Thêm ảnh</span>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleMultipleImagesUpload} 
              className="upload-input-file"
            />
          </div>
        </div>
      </div>
    );
  };

  const getFilteredData = () => {
    if (section === 'collections') {
      return data.filter(item => !item.isSpecial);
    }
    if (section !== 'bookings') return data;
    
    const getLocalDateString = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = getLocalDateString(new Date());

    const startOfWeek = new Date();
    const dayOfWeek = startOfWeek.getDay(); // 0 is Sunday, 1 is Monday, ...
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const parseLocalDate = (dateStr) => {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
      return new Date(dateStr);
    };

    return data.filter(item => {
      if (!item.date) return bookingFilter === 'all';
      
      const itemDate = parseLocalDate(item.date);
      itemDate.setHours(0, 0, 0, 0);
      
      if (bookingFilter === 'today') {
        return item.date === todayStr;
      } else if (bookingFilter === 'week') {
        return itemDate >= startOfWeek && itemDate <= endOfWeek;
      }
      return true;
    });
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, khaiTruongSubTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await websiteService.getSection(section);
      if (res && res.success) {
        setData(res.data || []);
      }
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const openSyncDialog = () => {
    setIsSyncing(true);
    fetchServicesForSync();
  };

  const fetchServicesForSync = async () => {
    setSyncLoading(true);
    try {
      const res = await otherService.findDichVu({});
      if (res && res.status === 'success') {
        const list = res.data?.dichVu || [];
        setServicesList(list);
        // Select all by default
        setSelectedServiceIds(list.map(s => s.maDichVu) || []);
      } else {
        toast.error("Không thể tải danh sách dịch vụ");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải danh sách dịch vụ");
    } finally {
      setSyncLoading(false);
    }
  };

  const handleToggleServiceSelect = (maDichVu) => {
    setSelectedServiceIds(prev => {
      if (prev.includes(maDichVu)) {
        return prev.filter(id => id !== maDichVu);
      } else {
        return [...prev, maDichVu];
      }
    });
  };

  const handleSelectAllServices = () => {
    if (selectedServiceIds.length === servicesList.length) {
      setSelectedServiceIds([]);
    } else {
      setSelectedServiceIds(servicesList.map(s => s.maDichVu));
    }
  };

  const handlePerformSync = async () => {
    if (selectedServiceIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một dịch vụ để đồng bộ");
      return;
    }

    setLoading(true);
    try {
      const selectedServices = servicesList.filter(s => selectedServiceIds.includes(s.maDichVu));
      
      const newItems = selectedServices.map((service, index) => {
        // Convert moTaDichVu to features array
        const features = service.moTaDichVu 
          ? service.moTaDichVu.split(/\n|,/).map(f => f.trim()).filter(f => f !== '')
          : [];

        // Format price to e.g. "8.500.000đ"
        const formattedPrice = service.giaTriDichVu 
          ? formatCurrency(service.giaTriDichVu) 
          : (service.giaChoThueDichVu ? formatCurrency(service.giaChoThueDichVu) : '0 đ');

        return {
          id: Date.now() + index,
          name: service.tenDichVu,
          price: formattedPrice,
          features: features,
          popular: false
        };
      });

      // Append new items to existing data array
      const updatedData = [...data, ...newItems];

      // Save using updateSection
      const res = await websiteService.updateSection(activeTab, updatedData, localStorage.getItem('access_token') || localStorage.getItem('token'));
      if (res && res.success) {
        toast.success(`Đồng bộ thành công ${newItems.length} dịch vụ!`);
        setData(res.data);
        setIsSyncing(false);
      } else {
        toast.error("Lỗi đồng bộ dịch vụ");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi đồng bộ dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const closeEdit = () => {
    if (editItem) {
      // Revoke single image object URLs
      for (const key of Object.keys(editItem)) {
        if (editItem[key] && typeof editItem[key] === 'object' && editItem[key].preview) {
          URL.revokeObjectURL(editItem[key].preview);
        }
      }
      // Revoke multiple images object URLs
      if (Array.isArray(editItem.images)) {
        editItem.images.forEach(img => {
          if (img && typeof img === 'object' && img.preview) {
            URL.revokeObjectURL(img.preview);
          }
        });
      }
      // Revoke pageContent gallery object URLs
      if (editItem.pageContent && Array.isArray(editItem.pageContent.gallery)) {
        editItem.pageContent.gallery.forEach(item => {
          if (item.image && typeof item.image === 'object' && item.image.preview) {
            URL.revokeObjectURL(item.image.preview);
          }
        });
      }
    }
    setIsEditing(false);
    setEditItem(null);
  };

  const prepareSubmitData = async (item) => {
    const prepared = { ...item };

    // Process single image fields
    for (const key of Object.keys(prepared)) {
      if (prepared[key] && typeof prepared[key] === 'object' && prepared[key].file instanceof File) {
        prepared[key] = await fileToBase64(prepared[key].file);
      }
    }

    // Process multiple images field
    if (Array.isArray(prepared.images)) {
      const processedImages = [];
      for (const img of prepared.images) {
        if (img && typeof img === 'object' && img.file instanceof File) {
          const base64 = await fileToBase64(img.file);
          processedImages.push(base64);
        } else {
          processedImages.push(img);
        }
      }
      prepared.images = processedImages;
    }

    // Process pageContent fields
    if (prepared.pageContent) {
      const pageContent = { ...prepared.pageContent };

      // Process gallery images
      if (Array.isArray(pageContent.gallery)) {
        const processedGallery = [];
        for (const item of pageContent.gallery) {
          const newItem = { ...item };
          if (newItem.image && typeof newItem.image === 'object' && newItem.image.file instanceof File) {
            newItem.image = await fileToBase64(newItem.image.file);
          }
          processedGallery.push(newItem);
        }
        pageContent.gallery = processedGallery;
      }

      prepared.pageContent = pageContent;
    }

    // Process gifts for khai_truong tab
    if (typeof prepared.gifts === 'string') {
      prepared.gifts = prepared.gifts.split('\n').map(s => s.trim()).filter(s => s !== '');
    }

    return prepared;
  };



  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá mục này?")) return;
    setLoading(true);
    try {
      const res = await websiteService.deleteSectionItem(section, id, localStorage.getItem('access_token') || localStorage.getItem('token'));
      
      if (res && res.success) {
        toast.success("Xóa thành công!");
        setData(res.data);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (item) => {
    if (section === 'services') {
      const initializedItem = {
        ...item,
        pageContent: {
          features: item.pageContent?.features || [
            { title: '', desc: '', iconName: 'Camera' },
            { title: '', desc: '', iconName: 'Heart' },
            { title: '', desc: '', iconName: 'Award' }
          ],
          gallery: item.pageContent?.gallery || [],
          packages: item.pageContent?.packages || []
        }
      };
      setEditItem(initializedItem);
      setActiveServiceTab('general');
    } else if (section === 'khai_truong') {
      setEditItem({
        ...item,
        gifts: Array.isArray(item.gifts) ? item.gifts.join('\n') : (item.gifts || '')
      });
    } else if (section === 'vouchers') {
      setEditItem({
        ...item,
        quantity: item.quantity !== undefined ? item.quantity : 20,
        claimedCount: item.claimedCount !== undefined ? item.claimedCount : 0
      });
    } else {
      setEditItem(item);
    }
    setIsEditing(true);
  };

  const openAdd = () => {
    // Generate a unique ID (simple timestamp for simplicity)
    const base = { id: Date.now() };
    if (section === 'services') {
      base.pageContent = {
        features: [
          { title: '', desc: '', iconName: 'Camera' },
          { title: '', desc: '', iconName: 'Heart' },
          { title: '', desc: '', iconName: 'Award' }
        ],
        gallery: [],
        packages: []
      };
      setActiveServiceTab('general');
    } else if (section === 'khai_truong') {
      base.title = '';
      base.discount = 'GIẢM 30%';
      base.price = '';
      base.originalPrice = '';
      base.gifts = '';
      base.popular = false;
    } else if (section === 'vouchers') {
      base.code = 'KHAITRUONG2026';
      base.type = 'discount';
      base.value = 'Giảm thêm 1.000.000đ';
      base.desc = 'Áp dụng cho đơn hàng trọn gói từ 8.000.000đ';
      base.quantity = 20;
      base.claimedCount = 0;
    }
    setEditItem(base);
    setIsEditing(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = await prepareSubmitData(editItem);
      const isExisting = data.some(d => 
        (submitData._id !== undefined && d._id === submitData._id) || 
        (submitData.id !== undefined && d.id === submitData.id)
      );
      let res;
      
      if (isExisting) {
        res = await websiteService.updateSectionItem(section, submitData.id, submitData, localStorage.getItem('access_token') || localStorage.getItem('token'));
      } else {
        res = await websiteService.addSectionItem(section, submitData, localStorage.getItem('access_token') || localStorage.getItem('token'));
      }
      
      if (res && res.success) {
        toast.success("Cập nhật thành công!");
        setData(res.data);
      } else {
        toast.error(res?.message || "Lỗi khi cập nhật");
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật: " + (error.message || error.response?.data?.message || "Đã có lỗi xảy ra"));
    } finally {
      setLoading(false);
      closeEdit();
    }
  };



  const renderServiceGeneralTab = () => {
    return (
      <div className="service-tab-panel">
        <div className="form-group">
          <label className="field-label">Tên dịch vụ</label>
          <input type="text" placeholder="vd: Chụp Ảnh Cưới" value={editItem.title || ''} onChange={(e) => setEditItem({...editItem, title: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="field-label">Mô tả ngắn</label>
          <textarea placeholder="vd: Bắt trọn từng khoảnh khắc tự nhiên..." value={editItem.desc || ''} onChange={(e) => setEditItem({...editItem, desc: e.target.value})} required />
        </div>
        {renderImageUploadField("Ảnh nền dịch vụ", "image")}
        <div className="form-group">
          <label className="field-label">Đường dẫn liên kết (Link - trùng với Route website)</label>
          <input type="text" placeholder="vd: /chup-anh-cuoi" value={editItem.link || ''} onChange={(e) => setEditItem({...editItem, link: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="field-label">Tên Icon (vd: Camera, Scissors, Heart, Video...)</label>
          <input type="text" placeholder="vd: Camera" value={editItem.iconName || ''} onChange={(e) => setEditItem({...editItem, iconName: e.target.value})} required />
        </div>
      </div>
    );
  };

  const renderServiceFeaturesTab = () => {
    const features = editItem.pageContent?.features || [];
    return (
      <div className="service-tab-panel">
        <p style={{ fontSize: '0.85em', color: '#666', marginBottom: '15px' }}>
          Thiết lập tối đa 3 đặc điểm nổi bật hiển thị ở đầu trang chi tiết dịch vụ.
        </p>
        {features.map((feature, idx) => (
          <div key={idx} className="feature-editor-card">
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95em', fontWeight: 'bold' }}>Đặc điểm {idx + 1}</h4>
            <div className="form-grid">
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Tiêu đề đặc điểm (vd: Thiết Bị Hiện Đại)" 
                  value={feature.title || ''} 
                  onChange={(e) => {
                    const newFeatures = [...features];
                    newFeatures[idx] = { ...newFeatures[idx], title: e.target.value };
                    setEditItem({ ...editItem, pageContent: { ...editItem.pageContent, features: newFeatures } });
                  }} 
                  required
                />
              </div>
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Mã Icon (vd: Camera, Heart, Award, Sparkles...)" 
                  value={feature.iconName || ''} 
                  onChange={(e) => {
                    const newFeatures = [...features];
                    newFeatures[idx] = { ...newFeatures[idx], iconName: e.target.value };
                    setEditItem({ ...editItem, pageContent: { ...editItem.pageContent, features: newFeatures } });
                  }} 
                  required
                />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '10px' }}>
              <textarea 
                placeholder="Mô tả chi tiết đặc điểm này..." 
                value={feature.desc || ''} 
                onChange={(e) => {
                  const newFeatures = [...features];
                  newFeatures[idx] = { ...newFeatures[idx], desc: e.target.value };
                  setEditItem({ ...editItem, pageContent: { ...editItem.pageContent, features: newFeatures } });
                }} 
                required
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderServiceGalleryTab = () => {
    const gallery = editItem.pageContent?.gallery || [];
    
    const handleGalleryImageUpload = (e, idx) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const preview = URL.createObjectURL(file);
      const newGallery = [...gallery];
      if (newGallery[idx].image && typeof newGallery[idx].image === 'object' && newGallery[idx].image.preview) {
        URL.revokeObjectURL(newGallery[idx].image.preview);
      }
      newGallery[idx] = { ...newGallery[idx], image: { file, preview } };
      setEditItem({ ...editItem, pageContent: { ...editItem.pageContent, gallery: newGallery } });
    };

    const addGalleryItem = () => {
      const newGallery = [...gallery, { image: '', title: '', desc: '' }];
      setEditItem({ ...editItem, pageContent: { ...editItem.pageContent, gallery: newGallery } });
    };

    const deleteGalleryItem = (idx) => {
      const item = gallery[idx];
      if (item && item.image && typeof item.image === 'object' && item.image.preview) {
        URL.revokeObjectURL(item.image.preview);
      }
      const newGallery = gallery.filter((_, i) => i !== idx);
      setEditItem({ ...editItem, pageContent: { ...editItem.pageContent, gallery: newGallery } });
    };

    return (
      <div className="service-tab-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <p style={{ fontSize: '0.85em', color: '#666', margin: 0 }}>
            Danh sách các hình ảnh concept hoặc tác phẩm tiêu biểu.
          </p>
          <button type="button" className="add-btn-small" onClick={addGalleryItem}>+ Thêm ảnh</button>
        </div>
        
        <div className="gallery-editor-list">
          {gallery.map((item, idx) => {
            const previewSrc = (item.image && typeof item.image === 'object' && item.image.preview) ? item.image.preview : item.image;
            return (
              <div key={idx} className="gallery-editor-card">
                <div className="gallery-thumb-section">
                  {previewSrc ? (
                    <div className="gallery-thumb-wrapper">
                      <img src={previewSrc} alt="Preview" className="gallery-thumb" />
                      <button type="button" className="gallery-delete-img" onClick={() => {
                        if (item.image && typeof item.image === 'object' && item.image.preview) {
                          URL.revokeObjectURL(item.image.preview);
                        }
                        const newGallery = [...gallery];
                        newGallery[idx] = { ...newGallery[idx], image: '' };
                        setEditItem({ ...editItem, pageContent: { ...editItem.pageContent, gallery: newGallery } });
                      }}>×</button>
                    </div>
                  ) : (
                    <div className="gallery-upload-btn">
                      <span>Chọn ảnh</span>
                      <input type="file" accept="image/*" onChange={(e) => handleGalleryImageUpload(e, idx)} className="gallery-file-input" />
                    </div>
                  )}
                </div>
                <div className="gallery-info-section">
                  <input 
                    type="text" 
                    placeholder="Tên Concept (vd: Concept Lãng Mạn)" 
                    value={item.title || ''} 
                    onChange={(e) => {
                      const newGallery = [...gallery];
                      newGallery[idx] = { ...newGallery[idx], title: e.target.value };
                      setEditItem({ ...editItem, pageContent: { ...editItem.pageContent, gallery: newGallery } });
                    }}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Mô tả phụ (vd: Không gian ngoài trời)" 
                    value={item.desc || ''} 
                    onChange={(e) => {
                      const newGallery = [...gallery];
                      newGallery[idx] = { ...newGallery[idx], desc: e.target.value };
                      setEditItem({ ...editItem, pageContent: { ...editItem.pageContent, gallery: newGallery } });
                    }}
                    required
                  />
                  <button type="button" className="del-btn-small" onClick={() => deleteGalleryItem(idx)}>Xóa mục</button>
                </div>
              </div>
            );
          })}
          {gallery.length === 0 && <p className="empty-msg-small">Chưa có hình ảnh nào trong bộ sưu tập.</p>}
        </div>
      </div>
    );
  };

  const renderServicePackagesTab = () => {
    const packages = editItem.pageContent?.packages || [];

    const addPackageItem = () => {
      const newPackages = [...packages, { name: '', price: '', features: [], popular: false }];
      setEditItem({ ...editItem, pageContent: { ...editItem.pageContent, packages: newPackages } });
    };

    const deletePackageItem = (idx) => {
      const newPackages = packages.filter((_, i) => i !== idx);
      setEditItem({ ...editItem, pageContent: { ...editItem.pageContent, packages: newPackages } });
    };

    return (
      <div className="service-tab-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <p style={{ fontSize: '0.85em', color: '#666', margin: 0 }}>
            Thiết lập bảng giá gói dịch vụ hiển thị riêng cho trang chi tiết dịch vụ này.
          </p>
          <button type="button" className="add-btn-small" onClick={addPackageItem}>+ Thêm gói</button>
        </div>

        <div className="packages-editor-list">
          {packages.map((pkg, idx) => {
            const featuresStr = Array.isArray(pkg.features) ? pkg.features.join(', ') : (pkg.features || '');
            return (
              <div key={idx} className="package-editor-card-inner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95em', fontWeight: 'bold' }}>Gói dịch vụ {idx + 1}</h4>
                  <button type="button" className="del-btn-small" onClick={() => deletePackageItem(idx)}>Xóa gói</button>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <input 
                      type="text" 
                      placeholder="Tên gói (vd: Gói Studio Basic)" 
                      value={pkg.name || ''} 
                      onChange={(e) => {
                        const newPackages = [...packages];
                        newPackages[idx] = { ...newPackages[idx], name: e.target.value };
                        setEditItem({ ...editItem, pageContent: { ...editItem.pageContent, packages: newPackages } });
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type="text" 
                      placeholder="Giá (vd: 5.900.000đ)" 
                      value={pkg.price || ''} 
                      onChange={(e) => {
                        const newPackages = [...packages];
                        newPackages[idx] = { ...newPackages[idx], price: e.target.value };
                        setEditItem({ ...editItem, pageContent: { ...editItem.pageContent, packages: newPackages } });
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '10px' }}>
                  <textarea 
                    placeholder="Các dịch vụ đi kèm (cách nhau bởi dấu phẩy)" 
                    value={featuresStr} 
                    onChange={(e) => {
                      const arr = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
                      const newPackages = [...packages];
                      newPackages[idx] = { ...newPackages[idx], features: arr };
                      setEditItem({ ...editItem, pageContent: { ...editItem.pageContent, packages: newPackages } });
                    }}
                    required
                  />
                </div>
                <label className="checkbox-label" style={{ marginTop: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={pkg.popular || false} 
                    onChange={(e) => {
                      const newPackages = [...packages];
                      newPackages[idx] = { ...newPackages[idx], popular: e.target.checked };
                      setEditItem({ ...editItem, pageContent: { ...editItem.pageContent, packages: newPackages } });
                    }}
                  />
                  Gói dịch vụ được yêu thích (nổi bật)
                </label>
              </div>
            );
          })}
          {packages.length === 0 && <p className="empty-msg-small">Chưa thiết lập gói dịch vụ nào.</p>}
        </div>
      </div>
    );
  };

  const renderFormFields = () => {
    if (!editItem) return null;
    
    if (section === 'banners') {
      return (
        <>
          <input type="text" placeholder="Tiêu đề (Title)" value={editItem.title || ''} onChange={(e) => setEditItem({...editItem, title: e.target.value})} required />
          <input type="text" placeholder="Tiêu đề phụ (Subtitle)" value={editItem.subtitle || ''} onChange={(e) => setEditItem({...editItem, subtitle: e.target.value})} required />
          {renderImageUploadField("Hình ảnh Banner", "image")}
          <input type="text" placeholder="Đường dẫn liên kết (Link - vd: /khai-truong)" value={editItem.link || ''} onChange={(e) => setEditItem({...editItem, link: e.target.value})} required />
        </>
      );
    } else if (section === 'khai_truong') {
      const giftsValue = typeof editItem.gifts === 'string' 
        ? editItem.gifts 
        : (Array.isArray(editItem.gifts) ? editItem.gifts.join('\n') : '');
      return (
        <>
          <input type="text" placeholder="Tên gói Deal (vd: Gói Chụp Ảnh Cưới VIP Studio)" value={editItem.title || ''} onChange={(e) => setEditItem({...editItem, title: e.target.value})} required />
          <input type="text" placeholder="Nhãn giảm giá (vd: GIẢM 35% hoặc TẶNG FLYCAM)" value={editItem.discount || ''} onChange={(e) => setEditItem({...editItem, discount: e.target.value})} required />
          <input type="text" placeholder="Giá khuyến mãi (vd: 9.900.000đ)" value={editItem.price || ''} onChange={(e) => setEditItem({...editItem, price: e.target.value})} required />
          <input type="text" placeholder="Giá gốc (vd: 15.500.000đ)" value={editItem.originalPrice || ''} onChange={(e) => setEditItem({...editItem, originalPrice: e.target.value})} required />
          {renderImageUploadField("Ảnh gói Deal Khai Trương", "image")}
          <div className="form-group">
            <label className="field-label" style={{ fontSize: '0.9em', color: '#555', marginBottom: '4px', display: 'block' }}>
              🎁 Danh sách quà tặng / Khuyến mãi kèm theo (mỗi dòng 1 phần quà):
            </label>
            <textarea 
              placeholder="vd: Miễn phí 02 bộ Váy Cưới VIP&#10;Tặng Album Mica Tráng Gương&#10;Tặng 02 ảnh ép gỗ khổ lớn 60x90 cm" 
              value={giftsValue} 
              onChange={(e) => setEditItem({...editItem, gifts: e.target.value})} 
              rows={5}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontFamily: 'inherit' }}
            />
          </div>
          <label className="checkbox-label" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={editItem.popular || false} onChange={(e) => setEditItem({...editItem, popular: e.target.checked})} style={{ width: 'auto', margin: 0 }} />
            <span>🔥 Đánh dấu là Deal "Nổi Bật / HOT"</span>
          </label>
        </>
      );
    } else if (section === 'vouchers') {
      return (
        <>
          <div className="form-group">
            <label className="field-label">Mã Voucher (Code)</label>
            <input type="text" placeholder="vd: KHAITRUONG2026" value={editItem.code || ''} onChange={(e) => setEditItem({...editItem, code: e.target.value.toUpperCase()})} required />
          </div>
          <div className="form-group">
            <label className="field-label">Loại Voucher</label>
            <select 
              value={editItem.type || 'discount'} 
              onChange={(e) => setEditItem({...editItem, type: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '10px' }}
            >
              <option value="discount">🏷️ Giảm giá trực tiếp</option>
              <option value="frame">🖼️ Tặng khung ảnh cao cấp</option>
              <option value="dress">👗 Thuê váy VIP 0 đồng</option>
            </select>
          </div>
          <div className="form-group">
            <label className="field-label">Tên ưu đãi / Giá trị</label>
            <input type="text" placeholder="vd: Giảm thêm 1.000.000đ hoặc Voucher Thuê Váy VIP 0đ" value={editItem.value || ''} onChange={(e) => setEditItem({...editItem, value: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="field-label">Mô tả điều kiện áp dụng</label>
            <textarea placeholder="vd: Áp dụng cho đơn hàng trọn gói từ 8.000.000đ" value={editItem.desc || ''} onChange={(e) => setEditItem({...editItem, desc: e.target.value})} rows={2} required />
          </div>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="field-label">Số lượng mã phát hành</label>
              <input type="number" min="1" value={editItem.quantity !== undefined ? editItem.quantity : 20} onChange={(e) => setEditItem({...editItem, quantity: Number(e.target.value)})} required />
            </div>
            <div className="form-group">
              <label className="field-label">Số lượng đã săn</label>
              <input type="number" min="0" value={editItem.claimedCount !== undefined ? editItem.claimedCount : 0} onChange={(e) => setEditItem({...editItem, claimedCount: Number(e.target.value)})} required />
            </div>
          </div>
        </>
      );
    } else if (section === 'services') {
      return (
        <div className="service-editor-tabs-container">
          <div className="service-editor-tabs">
            <button type="button" className={`service-tab-btn ${activeServiceTab === 'general' ? 'active' : ''}`} onClick={() => setActiveServiceTab('general')}>Thông tin chung</button>
            <button type="button" className={`service-tab-btn ${activeServiceTab === 'features' ? 'active' : ''}`} onClick={() => setActiveServiceTab('features')}>Đặc điểm nổi bật (3)</button>
            <button type="button" className={`service-tab-btn ${activeServiceTab === 'gallery' ? 'active' : ''}`} onClick={() => setActiveServiceTab('gallery')}>Bộ sưu tập / Concept</button>
            <button type="button" className={`service-tab-btn ${activeServiceTab === 'packages' ? 'active' : ''}`} onClick={() => setActiveServiceTab('packages')}>Bảng giá riêng</button>
          </div>
          
          <div className="service-editor-tab-content">
            {activeServiceTab === 'general' && renderServiceGeneralTab()}
            {activeServiceTab === 'features' && renderServiceFeaturesTab()}
            {activeServiceTab === 'gallery' && renderServiceGalleryTab()}
            {activeServiceTab === 'packages' && renderServicePackagesTab()}
          </div>
        </div>
      );
    } else if (section === 'feedback') {
      return (
        <>
          <input type="text" placeholder="Tên khách hàng (vd: Mai & Tuấn)" value={editItem.name || ''} onChange={(e) => setEditItem({...editItem, name: e.target.value})} required />
          <input type="text" placeholder="Ngày (vd: 20.10.2023)" value={editItem.date || ''} onChange={(e) => setEditItem({...editItem, date: e.target.value})} required />
          <textarea placeholder="Nội dung đánh giá" value={editItem.content || ''} onChange={(e) => setEditItem({...editItem, content: e.target.value})} required />
          <input type="number" placeholder="Đánh giá (1-5 sao)" value={editItem.rating || 5} min="1" max="5" onChange={(e) => setEditItem({...editItem, rating: Number(e.target.value)})} required />
          {renderImageUploadField("Ảnh khách hàng / Feedback", "image")}
        </>
      );
    } else if (section === 'dresses') {
      return (
        <>
          <input type="text" placeholder="Tên váy" value={editItem.name || ''} onChange={(e) => setEditItem({...editItem, name: e.target.value})} required />
          {renderImageUploadField("Hình ảnh váy cưới", "image")}
          <select value={editItem.category || 'Váy Công Chúa'} onChange={(e) => setEditItem({...editItem, category: e.target.value})}>
            <option value="Váy Công Chúa">Váy Công Chúa</option>
            <option value="Váy Đuôi Cá">Váy Đuôi Cá</option>
            <option value="Váy Suông">Váy Suông</option>
            <option value="Áo Dài">Áo Dài</option>
          </select>
        </>
      );
    } else if (section === 'bookings') {
      return (
        <div className="booking-details-view">
          <div className="booking-detail-row">
            <span className="booking-detail-label">Tên khách hàng</span>
            <span className="booking-detail-value">{editItem.name || 'N/A'}</span>
          </div>
          <div className="booking-detail-row">
            <span className="booking-detail-label">Số điện thoại</span>
            <span className="booking-detail-value highlight">{editItem.phone || 'N/A'}</span>
          </div>
          <div className="booking-detail-row">
            <span className="booking-detail-label">Ngày hẹn</span>
            <span className="booking-detail-value">
              {editItem.date ? editItem.date.split('-').reverse().join('/') : 'N/A'}
            </span>
          </div>
          <div className="booking-detail-row">
            <span className="booking-detail-label">Giờ hẹn</span>
            <span className="booking-detail-value">{editItem.time || 'N/A'}</span>
          </div>
          <div className="booking-detail-row">
            <span className="booking-detail-label">Dịch vụ quan tâm</span>
            <span className="booking-detail-value">{editItem.service || 'N/A'}</span>
          </div>
          <div className="booking-detail-row">
            <span className="booking-detail-label">Ghi chú</span>
            <span className="booking-detail-value" style={{ whiteSpace: 'pre-wrap' }}>
              {editItem.note || 'Không có ghi chú'}
            </span>
          </div>
          <div className="booking-status-edit">
            <div className="form-group">
              <label className="field-label">Trạng thái tư vấn</label>
              <select value={editItem.status || 'chua_lien_he'} onChange={(e) => setEditItem({...editItem, status: e.target.value})}>
                <option value="chua_lien_he">Chưa tư vấn</option>
                <option value="da_lien_he">Đã tư vấn</option>
              </select>
            </div>
          </div>
        </div>
      );
    } else if (section === 'invitations') {
      return (
        <>
          <input type="text" placeholder="Tên mẫu thiệp" value={editItem.name || ''} onChange={(e) => setEditItem({...editItem, name: e.target.value})} required />
          <input type="text" placeholder="Mã thiệp (vd: TC-01)" value={editItem.code || ''} onChange={(e) => setEditItem({...editItem, code: e.target.value})} required />
          <input type="text" placeholder="Loại thiệp (vd: Ép Kim Cao Cấp)" value={editItem.category || ''} onChange={(e) => setEditItem({...editItem, category: e.target.value})} required />
          <input type="text" placeholder="Giá thành (vd: 8.000đ / Thiệp)" value={editItem.price || ''} onChange={(e) => setEditItem({...editItem, price: e.target.value})} required />
          {renderImageUploadField("Hình ảnh thiệp cưới", "image")}
        </>
      );
    } else if (section === 'makeup') {
      return (
        <>
          <input type="text" placeholder="Tên layout" value={editItem.title || ''} onChange={(e) => setEditItem({...editItem, title: e.target.value})} required />
          {renderImageUploadField("Hình ảnh layout trang điểm", "image")}
          <textarea placeholder="Mô tả" value={editItem.desc || ''} onChange={(e) => setEditItem({...editItem, desc: e.target.value})} required />
        </>
      );
    } else if (section === 'packages') {
      const featuresStr = Array.isArray(editItem.features) ? editItem.features.join(', ') : (editItem.features || '');
      return (
        <>
          <input type="text" placeholder="Tên gói" value={editItem.name || ''} onChange={(e) => setEditItem({...editItem, name: e.target.value})} required />
          <input type="text" placeholder="Giá (vd: 8.500.000đ)" value={editItem.price || ''} onChange={(e) => setEditItem({...editItem, price: e.target.value})} required />
          <textarea placeholder="Các mục bao gồm (cách nhau bằng dấu phẩy)" value={featuresStr} onChange={(e) => {
            const arr = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
            setEditItem({...editItem, features: arr});
          }} required />
          <label className="checkbox-label">
            <input type="checkbox" checked={editItem.popular || false} onChange={(e) => setEditItem({...editItem, popular: e.target.checked})} />
            Đánh dấu là gói "Được Yêu Thích"
          </label>
        </>
      );
    } else if (section === 'collections') {
      return (
        <>
          <input type="text" placeholder="Tiêu đề bộ sưu tập / Concept" value={editItem.title || ''} onChange={(e) => setEditItem({...editItem, title: e.target.value})} required />
          <input type="text" placeholder="Tên cô dâu & chú rể (vd: Mai & Tuấn) - Có thể bỏ trống nếu là Concept" value={editItem.coupleName || ''} onChange={(e) => setEditItem({...editItem, coupleName: e.target.value})} />
          {renderImageUploadField("Ảnh bìa Album (Cover)", "cover")}
          <input type="text" placeholder="Thể loại (vd: wedding, prewedding, concept...)" value={editItem.category || ''} onChange={(e) => setEditItem({...editItem, category: e.target.value})} required />
          {renderMultipleImagesUpload()}
          <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '10px' }}>
            <input type="checkbox" checked={editItem.showOnHome || false} onChange={(e) => setEditItem({...editItem, showOnHome: e.target.checked})} style={{ margin: 0, width: 'auto' }} />
            Hiển thị trên trang chủ
          </label>
        </>
      );
    } else if (section === 'footer') {
      return (
        <>
          <input type="text" placeholder="Địa chỉ" value={editItem.address || ''} onChange={(e) => setEditItem({...editItem, address: e.target.value})} required />
          <input type="text" placeholder="Số điện thoại" value={editItem.phone || ''} onChange={(e) => setEditItem({...editItem, phone: e.target.value})} required />
          <input type="text" placeholder="Email" value={editItem.email || ''} onChange={(e) => setEditItem({...editItem, email: e.target.value})} required />
          <textarea placeholder="Mô tả ngắn" value={editItem.description || ''} onChange={(e) => setEditItem({...editItem, description: e.target.value})} required rows={3} />
        </>
      );
    }
  };

  return (
    <div className="quanly-website-container">
      {/* ===== PAGE HEADER ===== */}
      <div className="website-page-header">
        <div className="website-header-title-wrap">
          <div className="website-header-icon">
            🌐
          </div>
          <div>
            <h2>QUẢN LÝ GIAO DIỆN WEBSITE</h2>
            <p>Tùy chỉnh nội dung, banner, bảng giá và giao diện hiển thị trên trang chủ Long Wedding</p>
          </div>
        </div>
      </div>

      {/* ===== GLOBAL SETTINGS PANEL ===== */}
      <div className="global-settings-panel">
        <div className="global-settings-header">
          <h3>
            <span>⚙️ Cài đặt trạng thái Website</span>
          </h3>
          <button 
            className="save-settings-btn" 
            onClick={handleSaveGlobalSettings} 
            disabled={isSavingSettings}
          >
            <span>💾 {isSavingSettings ? 'Đang lưu...' : 'Lưu cài đặt'}</span>
          </button>
        </div>
        
        <div className="global-settings-content">
          <div className="setting-row">
            <div className="setting-label-col">
              <div className="setting-title-wrap">
                <span className="setting-title">Trạng thái công bố Website</span>
                <span className={`status-badge-live ${globalSettings.isPublished ? 'online' : 'offline'}`}>
                  <span className="pulse-dot"></span>
                  {globalSettings.isPublished ? 'ĐANG HOẠT ĐỘNG (PUBLIC)' : 'TẠM ẨN / BẢO TRÌ'}
                </span>
              </div>
              <span className="setting-desc">
                {globalSettings.isPublished 
                  ? "Khách hàng có thể truy cập website bình thường. Tắt công tắc để chuyển website sang chế độ bảo trì/chuẩn bị lên sóng." 
                  : "Website đang tạm ẩn. Khách hàng truy cập sẽ nhìn thấy màn hình 'Đang chuẩn bị lên sóng'."}
              </span>
            </div>
            <div className="setting-action-col">
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={globalSettings.isPublished} 
                  onChange={(e) => setGlobalSettings({...globalSettings, isPublished: e.target.checked})} 
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
          
          {!globalSettings.isPublished && (
            <div className="setting-row time-picker-row">
              <div className="setting-label-col">
                <span className="setting-title">⏰ Hẹn giờ tự động mở lại Website (Không bắt buộc)</span>
                <span className="setting-desc">Website sẽ đếm ngược và tự động công bố lại vào thời gian này.</span>
              </div>
              <div className="setting-action-col">
                <input 
                  type="datetime-local" 
                  className="settings-datetime-input"
                  value={globalSettings.scheduledPublishTime} 
                  onChange={(e) => setGlobalSettings({...globalSettings, scheduledPublishTime: e.target.value})} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* ===== TABS NAVIGATION ===== */}
      <div className="website-tabs-container">
        <div className="website-tabs">
          {SECTIONS.map(sec => (
            <button 
              key={sec.id} 
              className={`tab-btn ${activeTab === sec.id ? 'active' : ''}`}
              onClick={() => setActiveTab(sec.id)}
            >
              <span className="tab-icon">{sec.icon}</span>
              <span>{sec.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== CONTENT PANEL ===== */}
      <div className="website-content-panel">
        <div className="panel-header">
          <div className="panel-header-title-wrap">
            <h3>
              {activeTab === 'khai_truong' 
                ? (khaiTruongSubTab === 'deals' ? '🎟️ Deal Khai Trương' : (khaiTruongSubTab === 'vouchers' ? '🎁 Voucher Ưu Đãi' : '👥 Khách hàng Săn Voucher')) 
                : `${SECTIONS.find(s => s.id === activeTab)?.icon || '📁'} ${SECTIONS.find(s => s.id === activeTab)?.name}`}
            </h3>
            <span className="panel-count-badge">
              {getFilteredData().length} mục
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {section === 'packages' && (
              <button className="sync-btn" onClick={openSyncDialog}>
                <span>☁️ Đồng bộ từ Quản lý dịch vụ</span>
              </button>
            )}
            {section !== 'bookings' && section !== 'voucher_claims' && section !== 'special_collections' && (
              <button className="add-btn" onClick={openAdd}>
                <span>+ {section === 'khai_truong' ? 'Thêm Deal Khai Trương' : (section === 'vouchers' ? 'Thêm Voucher Mới' : 'Thêm Mục Mới')}</span>
              </button>
            )}
          </div>
        </div>

        {activeTab === 'khai_truong' && (
          <div className="khaitruong-sub-tabs">
            <button 
              className={`sub-tab-btn ${khaiTruongSubTab === 'deals' ? 'active' : ''}`}
              onClick={() => setKhaiTruongSubTab('deals')}
            >
              🎟️ Deal Khai Trương
            </button>
            <button 
              className={`sub-tab-btn ${khaiTruongSubTab === 'vouchers' ? 'active' : ''}`}
              onClick={() => setKhaiTruongSubTab('vouchers')}
            >
              🎁 Voucher Ưu Đãi
            </button>
            <button 
              className={`sub-tab-btn ${khaiTruongSubTab === 'claims' ? 'active' : ''}`}
              onClick={() => setKhaiTruongSubTab('claims')}
            >
              👥 Khách hàng Săn Voucher
            </button>
          </div>
        )}

        {section === 'bookings' && (
          <div className="bookings-filter-bar">
            <button 
              className={`filter-tab-btn ${bookingFilter === 'all' ? 'active' : ''}`}
              onClick={() => setBookingFilter('all')}
            >
              Tất cả
            </button>
            <button 
              className={`filter-tab-btn ${bookingFilter === 'today' ? 'active' : ''}`}
              onClick={() => setBookingFilter('today')}
            >
              Hôm nay
            </button>
            <button 
              className={`filter-tab-btn ${bookingFilter === 'week' ? 'active' : ''}`}
              onClick={() => setBookingFilter('week')}
            >
              Tuần này
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div className="spinner" style={{ margin: '0 auto 12px auto' }}></div>
            <div>Đang tải dữ liệu giao diện...</div>
          </div>
        ) : (
          <div className="items-list">
            {getFilteredData().map((item, index) => (
              <div 
                className={`item-card ${section === 'bookings' ? 'clickable-card' : ''} ${section === 'special_collections' ? 'special-collections-draggable-card' : ''}`} 
                key={item._id || item.id}
                onClick={() => section === 'bookings' && openEdit(item)}
                draggable={section === 'special_collections'}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="item-thumb-wrapper">
                  {item.image || item.img || item.cover || item.coverImage ? (
                    <img 
                      src={item.image || item.img || item.cover || item.coverImage} 
                      alt={item.name || item.title} 
                      className="item-thumb" 
                    />
                  ) : (
                    <div className="item-thumb-placeholder">
                      {SECTIONS.find(s => s.id === activeTab)?.icon || '🖼️'}
                    </div>
                  )}
                </div>
                
                <div className="item-info">
                  <h4>
                    {section === 'footer' ? item.email : (section === 'voucher_claims' ? item.name : (item.name || item.title))}
                    {section === 'collections' && item.showOnHome && (
                      <span style={{backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold'}}>Hiện trang chủ</span>
                    )}
                    {section === 'bookings' && (
                      <span style={{
                        backgroundColor: item.status === 'da_lien_he' ? '#dcfce7' : '#fee2e2',
                        color: item.status === 'da_lien_he' ? '#15803d' : '#b91c1c',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {item.status === 'da_lien_he' ? '✓ Đã tư vấn' : '⏳ Chưa tư vấn'}
                      </span>
                    )}
                  </h4>
                  {section !== 'footer' && section !== 'voucher_claims' && (
                    <p className="item-desc">
                      {section === 'invitations'
                        ? `Mã: ${item.code || ''} | Loại: ${item.category || ''} | Giá: ${item.price || ''}`
                        : (section === 'bookings'
                          ? `SĐT: ${item.phone || ''} | Hẹn: ${item.date ? item.date.split('-').reverse().join('/') : ''} ${item.time || ''} | Dịch vụ: ${item.service || ''}`
                          : (section === 'special_collections'
                            ? `Mã Hợp Đồng: ${item.maHopDong} | Số ảnh: ${item.photoCount || 0}`
                            : (item.category || item.desc || item.price)))}
                    </p>
                  )}
                  {(section === 'collections' || section === 'special_collections') && item.coupleName && <p className="item-desc" style={{marginTop: '4px', fontSize: '12px', color: '#666'}}>👰🤵 {item.coupleName}</p>}
                  {section === 'khai_truong' && (
                    <div style={{ marginTop: '6px' }}>
                      <p className="item-desc" style={{ fontSize: '13px', color: '#059669', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                        💰 {item.price} <span style={{ color: '#999', fontSize: '11px', fontWeight: 'normal', textDecoration: 'line-through' }}>{item.originalPrice}</span> | 🏷️ {item.discount}
                      </p>
                      {Array.isArray(item.gifts) && item.gifts.length > 0 && (
                        <div style={{ fontSize: '12px', color: '#555' }}>
                          {item.gifts.slice(0, 3).map((gift, gIdx) => (
                            <div key={gIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>🎁</span> <span>{gift}</span>
                            </div>
                          ))}
                          {item.gifts.length > 3 && <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>+ {item.gifts.length - 3} quà tặng khác...</div>}
                        </div>
                      )}
                    </div>
                  )}
                  {section === 'vouchers' && (
                    <div style={{ marginTop: '6px' }}>
                      <p className="item-desc" style={{ fontSize: '13px', color: '#d97706', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                        🎫 Mã: <span style={{ fontFamily: 'monospace', fontSize: '14px', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', color: '#b45309' }}>{item.code}</span> — {item.value}
                      </p>
                      <p className="item-desc" style={{ fontSize: '12px', color: '#666', margin: '0 0 6px 0' }}>{item.desc}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${Math.min(100, ((item.claimedCount || 0) / (item.quantity || 1)) * 100)}%`, 
                            background: ((item.claimedCount || 0) >= (item.quantity || 1)) ? '#ef4444' : '#10b981',
                            borderRadius: '4px' 
                          }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: ((item.claimedCount || 0) >= (item.quantity || 1)) ? '#ef4444' : '#059669' }}>
                          Đã săn: {item.claimedCount || 0} / {item.quantity || 0}
                          {((item.claimedCount || 0) >= (item.quantity || 1)) && ' (HẾT MÃ)'}
                        </span>
                      </div>
                    </div>
                  )}
                  {section === 'voucher_claims' && (
                    <div style={{ marginTop: '6px' }}>
                      <p className="item-desc" style={{ fontSize: '13px', color: '#10b981', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                        🎁 Quà trúng: <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '4px' }}>{item.voucherTitle || item.voucherCode}</span> (Mã: <code style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{item.voucherCode}</code>)
                      </p>
                      <p className="item-desc" style={{ fontSize: '12px', color: '#333', margin: '0 0 4px 0' }}>
                        👤 Khách hàng: <strong>{item.name}</strong> | 📞 SĐT: <strong>{item.phone}</strong>
                      </p>
                      <p className="item-desc" style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                        📍 Địa chỉ: {item.address || 'Chưa nhập'} | 🕒 Ngày quay: {item.claimedAt ? new Date(item.claimedAt).toLocaleString('vi-VN') : 'Mới đây'}
                      </p>
                    </div>
                  )}
                  {section === 'footer' && <p className="item-desc">📍 {item.address} | 📞 {item.phone}</p>}
                </div>

                <div className="item-actions" onClick={(e) => section === 'bookings' && e.stopPropagation()}>
                  {section === 'bookings' ? (
                    <button className="edit-btn" onClick={() => openEdit(item)}>
                      <span>👁️ Xem chi tiết</span>
                    </button>
                  ) : (
                    section !== 'voucher_claims' && section !== 'special_collections' && (
                      <button className="edit-btn" onClick={() => openEdit(item)}>
                        <span>✏️ Sửa</span>
                      </button>
                    )
                  )}
                  <button className="del-btn" onClick={() => handleDelete(item._id || item.id)}>
                    <span>🗑️ {section === 'special_collections' ? 'Hủy công bố' : 'Xoá'}</span>
                  </button>
                </div>
              </div>
            ))}

            {getFilteredData().length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 20px', background: '#f8fafc', borderRadius: '12px', border: '1.5px dashed #cbd5e1' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>📂</div>
                <h4 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>Chưa có dữ liệu nào trong chuyên mục này</h4>
                <p className="empty-msg" style={{ margin: '0 0 16px 0', padding: 0 }}>Bắt đầu bằng cách thêm mục mới để hiển thị lên website.</p>
                {section !== 'bookings' && section !== 'voucher_claims' && section !== 'special_collections' && (
                  <button className="add-btn" onClick={openAdd} style={{ margin: '0 auto' }}>
                    <span>+ Thêm Mục Đầu Tiên</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== EDIT / ADD MODAL ===== */}
      {isEditing && (
        <div className="modal-overlay">
          <div className={`modal-content ${section === 'services' ? 'wide-modal' : ''}`}>
            <div className="modal-header-styled">
              <h3>{section === 'bookings' ? 'Chi tiết lịch tư vấn' : (editItem?.id?.toString().length > 10 ? 'Thêm mục mới' : 'Chỉnh sửa mục')}</h3>
              <button 
                type="button" 
                onClick={closeEdit}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={submitForm} className="website-form">
              {renderFormFields()}
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeEdit}>Hủy bỏ</button>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== SYNC MODAL ===== */}
      {isSyncing && (
        <div className="modal-overlay">
          <div className="sync-modal-content">
            <div className="modal-header-styled">
              <h3>☁️ Đồng bộ dịch vụ sang Website</h3>
              <button 
                type="button" 
                onClick={() => setIsSyncing(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px', textAlign: 'left', margin: 0 }}>
              Chọn các dịch vụ từ Quản lý kho / dịch vụ để đưa lên bảng giá trên website.
            </p>
            
            {syncLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                <div className="spinner"></div>
                <span style={{ marginTop: '10px', fontSize: '13px', color: '#64748b' }}>Đang tải danh sách dịch vụ...</span>
              </div>
            ) : (
              <>
                <div className="sync-all-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '12px 0 6px 0' }}>
                  <label className="sync-all-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                    <input 
                      type="checkbox" 
                      checked={servicesList.length > 0 && selectedServiceIds.length === servicesList.length}
                      onChange={handleSelectAllServices}
                    />
                    <span>Chọn tất cả ({servicesList.length} dịch vụ)</span>
                  </label>
                </div>
                
                <div className="services-sync-list">
                  {servicesList.map(service => {
                    const isSelected = selectedServiceIds.includes(service.maDichVu);
                    return (
                      <div 
                        key={service.maDichVu} 
                        className="service-sync-item"
                        onClick={() => handleToggleServiceSelect(service.maDichVu)}
                      >
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => {}}
                        />
                        <div className="service-sync-info">
                          <span className="service-sync-name">{service.tenDichVu}</span>
                          <span className="service-sync-meta">Mã: {service.maDichVu}</span>
                        </div>
                        <span className="service-sync-price">
                          {service.giaTriDichVu ? formatCurrency(service.giaTriDichVu) : (service.giaChoThueDichVu ? formatCurrency(service.giaChoThueDichVu) : '0 đ')}
                        </span>
                      </div>
                    );
                  })}
                  {servicesList.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '20px', color: '#999', margin: 0 }}>Không tìm thấy dịch vụ nào để đồng bộ.</p>
                  )}
                </div>
                
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setIsSyncing(false)}>Hủy bỏ</button>
                  <button 
                    type="button" 
                    className="save-btn" 
                    onClick={handlePerformSync} 
                    disabled={selectedServiceIds.length === 0 || loading}
                  >
                    {loading ? 'Đang đồng bộ...' : `Xác nhận đồng bộ (${selectedServiceIds.length})`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyWebsite;
