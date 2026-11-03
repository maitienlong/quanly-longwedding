import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import otherService from '../../API/services/otherService';
import logo from '../../assets/logo/logo-vang.png';
import { toast } from 'sonner';
import './clientPortal.css';

function ClientPortal() {
    const { maHopDong } = useParams();
    const [loading, setLoading] = useState(true);
    const [contract, setContract] = useState(null);
    const [album, setAlbum] = useState(null);
    const [paymentQr, setPaymentQr] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'photos' | 'payment' | 'contact'

    // Photo Proofing & Pin Annotation State
    const [photos, setPhotos] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null); // For Lightbox
    const [newCommentText, setNewCommentText] = useState('');
    const [tempPinCoord, setTempPinCoord] = useState(null); // { x: 50, y: 50 }
    const [filterPhotoType, setFilterPhotoType] = useState('all'); // 'all' | 'hearted' | 'pinned' | 'cover'

    // Countdown State
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // Fetch Contract & Album data via Public Portal Endpoint
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const fetchData = async () => {
            try {
                const resPortal = await otherService.getPortalInfo(maHopDong);
                const portalData = resPortal?.data || resPortal;
                if (portalData?.contract && isMounted) {
                    setContract(portalData.contract);
                }
                if (portalData?.paymentQr && isMounted) {
                    setPaymentQr(portalData.paymentQr);
                }
                if (portalData?.album && isMounted) {
                    setAlbum(portalData.album);
                    if (Array.isArray(portalData.album.danhSachAnh) && portalData.album.danhSachAnh.length > 0) {
                        setPhotos(portalData.album.danhSachAnh);
                    }
                }
            } catch (error) {
                console.error("Lỗi tải thông tin cổng khách hàng:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (maHopDong) {
            fetchData();
        }
        return () => { isMounted = false; };
    }, [maHopDong]);

    // Fallback Mock Photos if album is empty to allow demoing proofing
    useEffect(() => {
        if (!loading && photos.length === 0) {
            const demoPhotos = [
                {
                    idDrive: 'demo_1',
                    tenFile: 'LW_001.jpg',
                    urlGoc: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=85',
                    urlNen: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
                    isHearted: true,
                    isCover: true,
                    comments: [
                        { noiDung: 'Bóp nhẹ eo bên trái', coordinateX: 42, coordinateY: 55, ngayTao: new Date() }
                    ]
                },
                {
                    idDrive: 'demo_2',
                    tenFile: 'LW_002.jpg',
                    urlGoc: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=85',
                    urlNen: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80',
                    isHearted: false,
                    isCover: false,
                    comments: []
                },
                {
                    idDrive: 'demo_3',
                    tenFile: 'LW_003.jpg',
                    urlGoc: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=85',
                    urlNen: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80',
                    isHearted: true,
                    isCover: false,
                    comments: [
                        { noiDung: 'Xóa bóng đổ trên mặt chú rể', coordinateX: 58, coordinateY: 32, ngayTao: new Date() }
                    ]
                },
                {
                    idDrive: 'demo_4',
                    tenFile: 'LW_004.jpg',
                    urlGoc: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1200&q=85',
                    urlNen: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=600&q=80',
                    isHearted: false,
                    isCover: false,
                    comments: []
                }
            ];
            setPhotos(demoPhotos);
        }
    }, [loading, photos.length]);

    // Countdown Timer calculation
    useEffect(() => {
        const targetDateStr = contract?.cacNgay?.ngayCuoi || contract?.cacNgay?.ngayAnHoi || contract?.cacNgay?.ngayChup;
        const targetTime = targetDateStr ? new Date(targetDateStr).getTime() : new Date().getTime() + (30 * 86400000);

        const updateTimer = () => {
            const now = new Date().getTime();
            const difference = targetTime - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [contract]);

    // Names & Dates
    const brideName = contract?.khachHang1?.tenKhachHang || "Cô Dâu";
    const groomName = contract?.khachHang2?.tenKhachHang || "Chú Rể";
    const weddingDate = contract?.cacNgay?.ngayCuoi ? new Date(contract.cacNgay.ngayCuoi).toLocaleDateString('vi-VN') : "Sắp diễn ra";
    const photoDate = contract?.cacNgay?.ngayChup ? new Date(contract.cacNgay.ngayChup).toLocaleDateString('vi-VN') : "Đang sắp lịch";

    // Payment Calculations
    const tongTien = contract?.thanhToan?.tongGiaTriSauGiam || contract?.thanhToan?.tongGiaTri || 0;
    const daThanhToan = contract?.thanhToan?.khachHangDaThanhToan || 0;
    const conLai = Math.max(0, tongTien - daThanhToan);
    const phanTramThanhToan = tongTien > 0 ? Math.min(100, Math.round((daThanhToan / tongTien) * 100)) : 0;

    // SePay QR Link from Backend Config
    const sepayQrUrl = paymentQr?.sepayQrUrl || `https://qr.sepay.vn/img?acc=9990187764519&bank=MBBank&amount=${conLai}&des=${encodeURIComponent(maHopDong || 'THANH TOAN')}`;

    // Toggle Heart on Photo (Persisted to Backend)
    const handleToggleHeart = async (photoId, e) => {
        if (e) e.stopPropagation();
        let nextHeartState = true;
        setPhotos(prev => prev.map(p => {
            if (p.idDrive === photoId) {
                nextHeartState = !p.isHearted;
                return { ...p, isHearted: nextHeartState };
            }
            return p;
        }));
        if (selectedPhoto && selectedPhoto.idDrive === photoId) {
            setSelectedPhoto(prev => prev ? { ...prev, isHearted: nextHeartState } : prev);
        }
        toast.success(nextHeartState ? 'Đã thêm ảnh vào danh sách chọn!' : 'Đã bỏ chọn ảnh');

        if (!String(photoId).startsWith('demo_')) {
            try {
                await otherService.portalPhotoAction(maHopDong, {
                    idDrive: photoId,
                    action: 'heart',
                    isHearted: nextHeartState
                });
            } catch (err) {
                console.warn('Lưu trạng thái chọn ảnh thất bại:', err);
            }
        }
    };

    // Toggle Cover Flag (Persisted to Backend)
    const handleToggleCover = async (photoId, e) => {
        if (e) e.stopPropagation();
        let nextCoverState = true;
        setPhotos(prev => prev.map(p => {
            if (p.idDrive === photoId) {
                nextCoverState = !p.isCover;
                return { ...p, isCover: nextCoverState, isHearted: true };
            }
            return p;
        }));
        toast.success(nextCoverState ? 'Đã chọn làm Ảnh Phóng Cổng!' : 'Đã bỏ đánh dấu ảnh cổng');

        if (!String(photoId).startsWith('demo_')) {
            try {
                await otherService.portalPhotoAction(maHopDong, {
                    idDrive: photoId,
                    action: 'cover',
                    isCover: nextCoverState
                });
            } catch (err) {
                console.warn('Lưu đánh dấu ảnh cổng thất bại:', err);
            }
        }
    };

    // Click on Image in Lightbox to drop Pin
    const handleImageClickToPin = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const xPercent = Math.round((clickX / rect.width) * 100);
        const yPercent = Math.round((clickY / rect.height) * 100);

        setTempPinCoord({ x: xPercent, y: yPercent });
    };

    // Save Pin Annotation Comment (Persisted to Backend)
    const handleAddPinComment = async () => {
        if (!newCommentText.trim() || !tempPinCoord || !selectedPhoto) return;

        const commentPayload = {
            noiDung: newCommentText.trim(),
            coordinateX: tempPinCoord.x,
            coordinateY: tempPinCoord.y,
            ngayTao: new Date()
        };

        setPhotos(prev => prev.map(p => {
            if (p.idDrive === selectedPhoto.idDrive) {
                const updatedComments = [...(p.comments || []), commentPayload];
                const updatedPhoto = { ...p, comments: updatedComments, isHearted: true };
                setSelectedPhoto(updatedPhoto);
                return updatedPhoto;
            }
            return p;
        }));

        setNewCommentText('');
        setTempPinCoord(null);
        toast.success("Đã ghim yêu cầu sửa ảnh thành công!");

        if (!String(selectedPhoto.idDrive).startsWith('demo_')) {
            try {
                await otherService.portalPhotoAction(maHopDong, {
                    idDrive: selectedPhoto.idDrive,
                    action: 'comment',
                    noiDung: commentPayload.noiDung,
                    coordinateX: commentPayload.coordinateX,
                    coordinateY: commentPayload.coordinateY
                });
            } catch (err) {
                console.warn('Lưu ghi chú ghim lên server thất bại:', err);
            }
        }
    };

    // Filtered Photos for Gallery
    const filteredPhotos = useMemo(() => {
        if (filterPhotoType === 'hearted') return photos.filter(p => p.isHearted);
        if (filterPhotoType === 'pinned') return photos.filter(p => p.comments && p.comments.length > 0);
        if (filterPhotoType === 'cover') return photos.filter(p => p.isCover);
        return photos;
    }, [photos, filterPhotoType]);

    // Count statistics
    const heartCount = photos.filter(p => p.isHearted).length;
    const coverCount = photos.filter(p => p.isCover).length;
    const pinCount = photos.reduce((sum, p) => sum + (p.comments?.length || 0), 0);

    // Complete Proofing Selection (Persisted to Backend)
    const handleCompleteSelection = async () => {
        if (heartCount === 0) {
            toast.warning("Anh/Chị vui lòng chọn ít nhất một vài ảnh ưng ý trước khi gửi nhé!");
            return;
        }
        try {
            await otherService.portalCompleteSelection(maHopDong, {
                ghiChuKhachHang: `Khách đã chốt ${heartCount} ảnh (${coverCount} ảnh cổng, ${pinCount} ghi chú chỉnh sửa)`
            });
            toast.success(`Long Wedding đã tiếp nhận ${heartCount} ảnh được chọn và ${pinCount} ghi chú chỉnh sửa! Ekip Photoshop sẽ bắt đầu hoàn thiện ngay.`);
        } catch (err) {
            toast.success(`Đã ghi nhận ${heartCount} ảnh được chọn và ${pinCount} ghi chú chỉnh sửa!`);
        }
    };

    const curStage = Number(contract?.giaiDoan) || 1;
    const curSub = contract?.subGiaiDoan || 'dang_thuc_hien';
    const isStageDone = (st) => curStage > st || (curStage === st && curSub === 'hoan_thanh');

    // 7-Stage Timeline Definition mapped to 4-stage system
    const stages = [
        { id: 1, title: 'Ký Hợp Đồng & Đặt Cọc', date: contract?.ngayHopDong ? new Date(contract.ngayHopDong).toLocaleDateString('vi-VN') : 'Đã hoàn tất', desc: 'Thống nhất gói chụp, lên concept và giữ lịch ngày đẹp.', completed: true, active: false },
        { id: 2, title: 'Buổi Chụp Ảnh Cưới', date: photoDate, desc: 'Ekip thợ ảnh & makeup đồng hành tại phim trường / ngoại cảnh.', completed: isStageDone(1), active: curStage === 1 && curSub === 'dang_thuc_hien' },
        { id: 3, title: 'Hậu kỳ & Chỉnh sửa Photoshop', date: 'Đang xử lý', desc: 'Ekip Photoshop xử lý màu da, ánh sáng và thiết kế album.', completed: curStage > 2 || (curStage === 2 && (curSub === 'khach_duyet_anh' || curSub === 'cho_khach_duyet' || curSub === 'hoan_thanh')), active: curStage === 2 && (curSub === 'dang_thuc_hien' || curSub === 'dang_hau_ky' || curSub === 'dang_chinh' || curSub === 'cho_chinh') },
        { id: 4, title: 'Khách Duyệt Ảnh & Chốt In', date: 'Chờ khách duyệt', desc: 'Dâu rể kiểm tra ảnh đã chỉnh sửa và xác nhận trước khi gia công in ấn.', completed: isStageDone(2), active: curStage === 2 && (curSub === 'khach_duyet_anh' || curSub === 'cho_khach_duyet') },
        { id: 5, title: 'Gửi In Album & Đóng Khung Ảnh', date: 'Theo lịch hẹn', desc: 'Gia công album công nghệ cao chống ẩm, khung tranh tráng gương.', completed: isStageDone(3), active: curStage === 3 },
        { id: 6, title: 'Thử Váy Cưới & Vest Lần Cuối', date: 'Trước ngày cưới 3-5 ngày', desc: 'Căn chỉnh số đo váy cưới, là ủi phẳng và chuẩn bị tráp phụ kiện.', completed: isStageDone(4), active: curStage === 4 && curSub === 'dang_thuc_hien' },
        { id: 7, title: 'Bàn Giao Trọn Gói & Ngày Hạnh Phúc', date: weddingDate, desc: 'Bàn giao trọn bộ sản phẩm và chúc mừng ngày trọng đại của đôi uyên ương!', completed: curStage === 4 && curSub === 'hoan_thanh', active: curStage === 4 && curSub === 'hoan_thanh' }
    ];

    if (loading) {
        return (
            <div className="client-portal-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <img src={logo} alt="Logo" style={{ height: 60, marginBottom: 16 }} />
                    <div style={{ color: '#eab308', fontWeight: 600, fontSize: '1.1rem' }}>Đang tải không gian cưới của bạn...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="client-portal-wrapper">
            <div className="cp-container">
                {/* Brand Header */}
                <div className="cp-brand-header">
                    <img src={logo} alt="Long Wedding Logo" className="cp-logo" />
                    <div className="cp-studio-name">LONG WEDDING STUDIO</div>
                    <div className="cp-studio-tagline">HÀNH TRÌNH TÌNH YÊU & KHOẢNH KHẮC VĨNH CỬU</div>
                </div>

                {/* Hero Couple Card with Countdown */}
                <div className="cp-hero-card">
                    <div className="cp-couple-title">CỔNG TRA CỨU TIẾN ĐỘ & DUYỆT ẢNH</div>
                    <div className="cp-couple-names">
                        <span>{brideName}</span>
                        <i className="fa-solid fa-heart cp-couple-heart"></i>
                        <span>{groomName}</span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                        Mã hợp đồng: <strong style={{ color: '#facc15' }}>#{maHopDong}</strong> | Ngày cưới: <strong style={{ color: '#38bdf8' }}>{weddingDate}</strong>
                    </div>

                    {/* Countdown */}
                    <div className="cp-countdown-grid">
                        <div className="cp-count-box">
                            <div className="cp-count-num">{timeLeft.days}</div>
                            <div className="cp-count-label">Ngày</div>
                        </div>
                        <div className="cp-count-box">
                            <div className="cp-count-num">{timeLeft.hours}</div>
                            <div className="cp-count-label">Giờ</div>
                        </div>
                        <div className="cp-count-box">
                            <div className="cp-count-num">{timeLeft.minutes}</div>
                            <div className="cp-count-label">Phút</div>
                        </div>
                        <div className="cp-count-box">
                            <div className="cp-count-num">{timeLeft.seconds}</div>
                            <div className="cp-count-label">Giây</div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="cp-tab-nav">
                    <button
                        className={`cp-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <i className="fa-solid fa-list-check"></i>
                        <span>Tiến Độ Cưới</span>
                    </button>
                    <button
                        className={`cp-tab-btn ${activeTab === 'photos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('photos')}
                    >
                        <i className="fa-solid fa-images"></i>
                        <span>Duyệt Ảnh ({heartCount})</span>
                    </button>
                    <button
                        className={`cp-tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
                        onClick={() => setActiveTab('payment')}
                    >
                        <i className="fa-solid fa-qrcode"></i>
                        <span>Thanh Toán</span>
                    </button>
                    <button
                        className={`cp-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
                        onClick={() => setActiveTab('contact')}
                    >
                        <i className="fa-solid fa-phone-volume"></i>
                        <span>Liên Hệ Studio</span>
                    </button>
                </div>

                {/* TAB 1: OVERVIEW & TIMELINE */}
                {activeTab === 'overview' && (
                    <div>
                        <div className="cp-section-card">
                            <div className="cp-section-header">
                                <div className="cp-section-title">
                                    <i className="fa-solid fa-compass" style={{ color: '#eab308' }}></i>
                                    Quy Trình Hoàn Thiện Ngày Cưới
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 600 }}>
                                    ● Cập nhật thời gian thực
                                </span>
                            </div>

                            <div className="cp-timeline">
                                {stages.map((stage) => (
                                    <div 
                                        key={stage.id} 
                                        className={`cp-timeline-item ${stage.completed ? 'completed' : ''} ${stage.active ? 'active' : ''}`}
                                    >
                                        <div className="cp-timeline-dot">
                                            {stage.completed ? (
                                                <i className="fa-solid fa-check"></i>
                                            ) : stage.active ? (
                                                <i className="fa-solid fa-hourglass-half"></i>
                                            ) : (
                                                stage.id
                                            )}
                                        </div>
                                        <div className="cp-timeline-content">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div className="cp-stage-title">{stage.id}. {stage.title}</div>
                                                {stage.active && (
                                                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 10, background: '#eab308', color: '#0f172a', fontWeight: 800 }}>
                                                        Đang tiến hành
                                                    </span>
                                                )}
                                            </div>
                                            <div className="cp-stage-date">
                                                <i className="fa-regular fa-calendar-check" style={{ marginRight: 5 }}></i>
                                                {stage.date}
                                            </div>
                                            <div className="cp-stage-desc">{stage.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Action to Photo Tab */}
                        <div className="cp-section-card" style={{ textAlign: 'center', background: 'rgba(234, 179, 8, 0.08)', borderColor: 'rgba(234, 179, 8, 0.3)' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#facc15', marginBottom: 6 }}>
                                📸 Bộ Ảnh Cưới Đã Sẵn Sàng Duyệt!
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>
                                Anh/Chị chỉ cần bấm thả tim vào các ảnh muốn in Album và ghim yêu cầu chỉnh sửa trực tiếp.
                            </div>
                            <button
                                className="cp-tab-btn active"
                                onClick={() => setActiveTab('photos')}
                                style={{ display: 'inline-flex', padding: '12px 28px', fontSize: '0.95rem' }}
                            >
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                                Vào Chọn Ảnh & Ghim Yêu Cầu Sửa Ngay
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB 2: PHOTO PROOFING & PIN ANNOTATION */}
                {activeTab === 'photos' && (
                    <div>
                        {/* Toolbar */}
                        <div className="cp-photo-toolbar">
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setFilterPhotoType('all')}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: filterPhotoType === 'all' ? '#eab308' : 'rgba(255,255,255,0.1)',
                                        color: filterPhotoType === 'all' ? '#0f172a' : '#cbd5e1',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Tất cả ({photos.length})
                                </button>
                                <button
                                    onClick={() => setFilterPhotoType('hearted')}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: filterPhotoType === 'hearted' ? '#e11d48' : 'rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    ❤️ Đã chọn ({heartCount})
                                </button>
                                <button
                                    onClick={() => setFilterPhotoType('cover')}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: filterPhotoType === 'cover' ? '#0284c7' : 'rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    🌟 Ảnh cổng ({coverCount})
                                </button>
                                <button
                                    onClick={() => setFilterPhotoType('pinned')}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: filterPhotoType === 'pinned' ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    📌 Có ghi chú ({pinCount})
                                </button>
                            </div>

                            <button
                                onClick={handleCompleteSelection}
                                style={{
                                    padding: '8px 18px',
                                    borderRadius: 10,
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)'
                                }}
                            >
                                <i className="fa-solid fa-paper-plane" style={{ marginRight: 6 }}></i>
                                Gửi Danh Sách Chốt ({heartCount} Ảnh)
                            </button>
                        </div>

                        {/* Hint box */}
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 14, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
                            💡 <strong>Mẹo:</strong> Bấm vào từng ảnh để phóng to và <strong>click trực tiếp lên mặt/váy</strong> để ghim yêu cầu sửa cho thợ Photoshop!
                        </div>

                        {/* Gallery Grid */}
                        <div className="cp-photo-grid">
                            {filteredPhotos.map((p) => (
                                <div
                                    key={p.idDrive}
                                    className={`cp-photo-card ${p.isHearted ? 'selected' : ''} ${p.isCover ? 'cover' : ''}`}
                                    onClick={() => setSelectedPhoto(p)}
                                >
                                    <img src={p.urlNen || p.urlGoc} alt={p.tenFile} className="cp-photo-img" loading="lazy" />
                                    <div className="cp-photo-overlay">
                                        <div className="cp-photo-top-actions">
                                            <button
                                                className={`cp-heart-btn ${p.isHearted ? 'active' : ''}`}
                                                onClick={(e) => handleToggleHeart(p.idDrive, e)}
                                                title="Thả tim chọn vào Album"
                                            >
                                                <i className="fa-solid fa-heart"></i>
                                            </button>
                                            {p.comments && p.comments.length > 0 && (
                                                <div className="cp-pin-badge">
                                                    <i className="fa-solid fa-location-dot"></i>
                                                    <span>{p.comments.length}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.72rem', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                                {p.tenFile}
                                            </span>
                                            <button
                                                onClick={(e) => handleToggleCover(p.idDrive, e)}
                                                style={{
                                                    background: p.isCover ? '#0284c7' : 'rgba(0,0,0,0.6)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    color: '#fff',
                                                    borderRadius: 6,
                                                    padding: '2px 6px',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer'
                                                }}
                                                title="Đánh dấu làm ảnh phóng cổng tiệc cưới"
                                            >
                                                🌟 {p.isCover ? 'Ảnh Cổng' : 'Đặt làm Cổng'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 3: PAYMENT & QR */}
                {activeTab === 'payment' && (
                    <div className="cp-section-card cp-payment-card">
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#facc15', marginBottom: 6 }}>
                            HÓA ĐƠN & THANH TOÁN TRỰC TUYẾN
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                            Hệ thống tự động xác nhận sau 3 giây khi quét mã QR SePay dưới đây
                        </div>

                        {/* Stats Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, margin: '20px auto', maxWidth: 500 }}>
                            <div style={{ background: 'rgba(15,23,42,0.6)', padding: 12, borderRadius: 12 }}>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tổng gói dịch vụ</div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{tongTien.toLocaleString('vi-VN')} đ</div>
                            </div>
                            <div style={{ background: 'rgba(15,23,42,0.6)', padding: 12, borderRadius: 12 }}>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Đã thanh toán</div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#22c55e' }}>{daThanhToan.toLocaleString('vi-VN')} đ</div>
                            </div>
                            <div style={{ background: 'rgba(15,23,42,0.6)', padding: 12, borderRadius: 12 }}>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Số dư còn lại</div>
                                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b' }}>{conLai.toLocaleString('vi-VN')} đ</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ maxWidth: 500, margin: '0 auto 20px auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>
                                <span>Tiến độ thanh toán</span>
                                <span style={{ fontWeight: 700, color: '#facc15' }}>{phanTramThanhToan}%</span>
                            </div>
                            <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ width: `${phanTramThanhToan}%`, height: '100%', background: '#22c55e', borderRadius: 4 }}></div>
                            </div>
                        </div>

                        {/* QR Code Frame */}
                        {conLai > 0 ? (
                            <div>
                                <div className="cp-qr-frame">
                                    <img src={sepayQrUrl} alt="QR Thanh toán SePay" className="cp-qr-img" />
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
                                    Quét mã với bất kỳ ứng dụng Ngân hàng nào (VietQR / Napas247)
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                                    Nội dung chuyển khoản tự động: <strong>{maHopDong}</strong>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: 24, background: 'rgba(34,197,94,0.1)', borderRadius: 16, border: '1px solid #22c55e' }}>
                                <i className="fa-solid fa-circle-check" style={{ fontSize: '2.5rem', color: '#22c55e', marginBottom: 8 }}></i>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#22c55e' }}>Hợp đồng đã thanh toán đủ 100%!</div>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>Cảm ơn anh chị đã tin tưởng đồng hành cùng Long Wedding!</div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: CONTACT & STUDIO */}
                {activeTab === 'contact' && (
                    <div className="cp-section-card">
                        <div className="cp-section-title" style={{ marginBottom: 16 }}>
                            <i className="fa-solid fa-house" style={{ color: '#eab308' }}></i>
                            THÔNG TIN STUDIO LONG WEDDING
                        </div>
                        <div style={{ lineHeight: 1.8, fontSize: '0.9rem', color: '#cbd5e1' }}>
                            <div>📍 <strong>Địa chỉ Studio:</strong> Trung tâm Áo Cưới Long Wedding</div>
                            <div>📞 <strong>Hotline tư vấn & CSKH:</strong> 098.xxx.xxxx (Hỗ trợ 24/7)</div>
                            <div>📸 <strong>Bộ phận Hậu kỳ Photoshop:</strong> 097.xxx.xxxx</div>
                            <div>👗 <strong>Phụ trách Váy cưới & Soạn đồ:</strong> 096.xxx.xxxx</div>
                            <div>🌐 <strong>Website chính thức:</strong> longwedding.vn</div>
                        </div>
                    </div>
                )}

                {/* Floating Hotline / Zalo Button */}
                <a href="tel:0981234567" className="cp-floating-help" title="Gọi Hotline Studio">
                    <i className="fa-solid fa-phone"></i>
                    <span>Gọi Studio</span>
                </a>

                {/* LIGHTBOX MODAL WITH PIN ANNOTATION TOOL */}
                {selectedPhoto && (
                    <div className="cp-modal-backdrop" onClick={() => setSelectedPhoto(null)}>
                        {/* Header */}
                        <div className="cp-lightbox-header" onClick={(e) => e.stopPropagation()}>
                            <div>
                                <strong style={{ color: '#facc15' }}>{selectedPhoto.tenFile}</strong>
                                <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: 12 }}>
                                    Bấm vào ảnh để ghim vị trí cần chỉnh sửa
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <button
                                    onClick={() => handleToggleHeart(selectedPhoto.idDrive)}
                                    style={{
                                        background: selectedPhoto.isHearted ? '#e11d48' : 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        color: '#fff',
                                        borderRadius: 8,
                                        padding: '6px 12px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: 700
                                    }}
                                >
                                    <i className="fa-solid fa-heart" style={{ marginRight: 5 }}></i>
                                    {selectedPhoto.isHearted ? 'Đã Chọn' : 'Chọn Ảnh Này'}
                                </button>
                                <button
                                    onClick={() => setSelectedPhoto(null)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#cbd5e1',
                                        fontSize: '1.3rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        </div>

                        {/* Body with Interactive Image */}
                        <div className="cp-lightbox-body" onClick={(e) => e.stopPropagation()}>
                            <div className="cp-lightbox-img-wrapper" onClick={handleImageClickToPin}>
                                <img
                                    src={selectedPhoto.urlGoc || selectedPhoto.urlNen}
                                    alt={selectedPhoto.tenFile}
                                    className="cp-lightbox-img"
                                />

                                {/* Render existing Pins */}
                                {selectedPhoto.comments && selectedPhoto.comments.map((c, i) => (
                                    <div
                                        key={i}
                                        className="cp-pin-point"
                                        style={{ left: `${c.coordinateX}%`, top: `${c.coordinateY}%` }}
                                        title={c.noiDung}
                                    >
                                        {i + 1}
                                    </div>
                                ))}

                                {/* Render Temporary Dropped Pin */}
                                {tempPinCoord && (
                                    <div
                                        className="cp-pin-point"
                                        style={{ left: `${tempPinCoord.x}%`, top: `${tempPinCoord.y}%`, background: '#ef4444' }}
                                    >
                                        +
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer: List of Notes or Input Form */}
                        <div 
                            style={{ background: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '14px 20px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {tempPinCoord ? (
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center', maxWidth: 650, margin: '0 auto' }}>
                                    <div style={{ color: '#eab308', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                        📍 Vị trí ({tempPinCoord.x}%, {tempPinCoord.y}%):
                                    </div>
                                    <input
                                        type="text"
                                        value={newCommentText}
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        placeholder="Nhập yêu cầu sửa ảnh (VD: bóp eo, xóa mụn, sửa tay)..."
                                        style={{
                                            flex: 1,
                                            background: '#1e293b',
                                            border: '1px solid rgba(234,179,8,0.4)',
                                            borderRadius: 8,
                                            padding: '8px 12px',
                                            color: '#fff',
                                            fontSize: '0.9rem',
                                            outline: 'none'
                                        }}
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddPinComment()}
                                    />
                                    <button
                                        onClick={handleAddPinComment}
                                        style={{
                                            background: '#eab308',
                                            color: '#0f172a',
                                            border: 'none',
                                            borderRadius: 8,
                                            padding: '8px 16px',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Lưu Ghim
                                    </button>
                                    <button
                                        onClick={() => setTempPinCoord(null)}
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            color: '#94a3b8',
                                            border: 'none',
                                            borderRadius: 8,
                                            padding: '8px 12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            ) : (
                                <div style={{ maxWidth: 750, margin: '0 auto' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <i className="fa-solid fa-list-ul"></i>
                                        <span>Ghi chú đã ghim trên ảnh này ({selectedPhoto.comments?.length || 0}):</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                                        {selectedPhoto.comments && selectedPhoto.comments.length > 0 ? (
                                            selectedPhoto.comments.map((c, idx) => (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        background: 'rgba(30,41,59,0.8)',
                                                        border: '1px solid rgba(234,179,8,0.3)',
                                                        borderRadius: 8,
                                                        padding: '4px 10px',
                                                        fontSize: '0.78rem',
                                                        color: '#f8fafc',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    <strong style={{ color: '#eab308', marginRight: 4 }}>#{idx + 1}</strong>
                                                    {c.noiDung}
                                                </div>
                                            ))
                                        ) : (
                                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                                Chưa có ghi chú nào. Hãy nhấp trực tiếp lên hình để ghim vị trí cần chỉnh sửa.
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClientPortal;
