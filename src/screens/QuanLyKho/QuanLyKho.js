import './quanlykho.css'; // Đảm bảo bạn có file CSS này
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, faShirt, faCameraRetro, faWarehouse, 
    faBriefcase, faTimes 
} from '@fortawesome/free-solid-svg-icons';


// --- DỮ LIỆU BAN ĐẦU ---
// Dùng để khởi tạo state. Dữ liệu thực tế sẽ được quản lý và cập nhật trong state.
const initialOutfitsData = [
    { id: 'VC001', name: 'Váy cưới trễ vai Swan', stock: 5, size: 'M', rentalPrice: '2.500.000đ', image: null },
    { id: 'VC002', name: 'Váy công chúa bồng bềnh', stock: 3, size: 'S', rentalPrice: '3.000.000đ', image: null },
    { id: 'AD001', name: 'Áo dài lụa đỏ', stock: 10, size: 'S, M, L', rentalPrice: '1.000.000đ', image: null },
];

// Cập nhật cấu trúc dữ liệu cho dịch vụ để khớp với form mới
const initialServicesData = [
    { id: 'S-LONG-1', name: 'Gói Studio Long I', price: '5.200.000 VNĐ', description: 'Bao gồm ảnh phóng, ảnh bàn, file ảnh và các dịch vụ ngày chụp...', image: null },
    { id: 'DV02', name: 'Trang điểm cô dâu ngày cưới', price: '3.000.000đ', description: 'Trang điểm + làm tóc cho cô dâu tại nhà.', image: null },
];


// ====================================================================
// ==================== CÁC COMPONENT CON =============================
// ====================================================================

// COMPONENT DIALOG (TÁI SỬ DỤNG)
const Dialog = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog-container" onClick={(e) => e.stopPropagation()}>
                <div className="dialog-header">
                    <h3>{title}</h3>
                    <button onClick={onClose} className="dialog-close-btn">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <div className="dialog-body">{children}</div>
            </div>
        </div>
    );
};

// COMPONENT FORM THÊM TRANG PHỤC (ĐẦY ĐỦ)
const AddOutfitForm = ({ onCancel, onSave }) => {
    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [stock, setStock] = useState('');
    const [rentalPrice, setRentalPrice] = useState('');
    const [size, setSize] = useState('');
    const [imageFile, setImageFile] = useState(null);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!name || !id || !stock || !rentalPrice || !size) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        const newOutfit = { id, name, stock: parseInt(stock, 10), rentalPrice, size, image: imageFile };
        onSave(newOutfit);
    };

    const handleImageChange = (event) => {
        if (event.target.files && event.target.files[0]) setImageFile(event.target.files[0]);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="outfit-name">Tên trang phục</label>
                <input type="text" id="outfit-name" placeholder="Vd: Váy cưới Swan" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="outfit-id">Mã số</label>
                <input type="text" id="outfit-id" placeholder="Vd: VC004" value={id} onChange={(e) => setId(e.target.value)} />
            </div>
             <div className="form-group">
                <label htmlFor="outfit-size">Size</label>
                <input type="text" id="outfit-size" placeholder="Vd: S, M, L" value={size} onChange={(e) => setSize(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="rental-price">Giá thuê</label>
                <input type="text" id="rental-price" placeholder="Vd: 1.500.000đ" value={rentalPrice} onChange={(e) => setRentalPrice(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="outfit-stock">Số lượng tồn kho</label>
                <input type="number" id="outfit-stock" placeholder="Vd: 5" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="outfit-image">Tải ảnh trang phục</label>
                <input type="file" id="outfit-image" accept="image/*" onChange={handleImageChange} />
                {imageFile && <p className="file-selected">Đã chọn: {imageFile.name}</p>}
            </div>
            <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onCancel}>Hủy</button>
                <button type="submit" className="btn-submit">Lưu</button>
            </div>
        </form>
    );
};

// COMPONENT FORM THÊM DỊCH VỤ (ĐẦY ĐỦ)
const AddServiceForm = ({ onCancel, onSave }) => {
    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!name || !id || !price || !description) {
            alert('Vui lòng điền đầy đủ thông tin cho gói dịch vụ!');
            return;
        }
        const newService = { id, name, price, description, image: imageFile };
        onSave(newService);
    };

    const handleImageChange = (event) => {
        if (event.target.files && event.target.files[0]) setImageFile(event.target.files[0]);
    };
    
    const descriptionPlaceholder = `SẢN PHẨM NHẬN ĐƯỢC\n- 02 Ảnh phóng 60 x 90 cm...\n- 02 Ảnh để bàn Hàn Quốc...\n\nDỊCH VỤ TẶNG KÈM\n- 01 Váy cưới cao cấp...\n...`;

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="service-name">Tên gói dịch vụ</label>
                <input type="text" id="service-name" placeholder="Vd: Gói Studio Long I" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="service-id">Mã gói dịch vụ</label>
                <input type="text" id="service-id" placeholder="Vd: S-LONG-1" value={id} onChange={(e) => setId(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="service-price">Giá gói dịch vụ</label>
                <input type="text" id="service-price" placeholder="Vd: 5.200.000 VNĐ" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="service-description">Mô tả chi tiết các hạng mục</label>
                <textarea id="service-description" rows="8" placeholder={descriptionPlaceholder} value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
            </div>
             <div className="form-group">
                <label htmlFor="service-image">Ảnh đại diện gói</label>
                <input type="file" id="service-image" accept="image/*" onChange={handleImageChange} />
                {imageFile && <p className="file-selected">Đã chọn: {imageFile.name}</p>}
            </div>
            <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onCancel}>Hủy</button>
                <button type="submit" className="btn-submit">Lưu</button>
            </div>
        </form>
    );
};


// COMPONENT NÚT HÀNH ĐỘNG VỚI DROPDOWN
const ActionsButton = ({ onOpenModal }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownRef]);

    const handleOpenModal = (type) => {
        onOpenModal(type);
        setIsDropdownOpen(false);
    };

    return (
        <div className="actions-container" ref={dropdownRef}>
            <button className="main-add-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <FontAwesomeIcon icon={faPlus} /> THÊM
            </button>
            {isDropdownOpen && (
                <div className="secondary-actions">
                    <button className="secondary-add-btn" onClick={() => handleOpenModal('outfit')}>
                        <FontAwesomeIcon icon={faShirt} /> Thêm trang phục
                    </button>
                    <button className="secondary-add-btn" onClick={() => handleOpenModal('service')}>
                        <FontAwesomeIcon icon={faCameraRetro} /> Thêm dịch vụ
                    </button>
                </div>
            )}
        </div>
    );
};

// COMPONENT CỘT HIỂN THỊ DANH SÁCH (LINH HOẠT)
const InventoryColumn = ({ title, icon, data, headers }) => (
    <div className="inventory-column">
        <h3><FontAwesomeIcon icon={icon} /> {title}</h3>
        <div className="item-list-container">
            <table className="inventory-table">
                <thead>
                    <tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.id}</td>
                            {item.size && <td>{item.size}</td>}
                            {item.rentalPrice && <td>{item.rentalPrice}</td>}
                            {item.price && <td>{item.price}</td>}
                            {item.stock !== undefined && <td>{item.stock}</td>}
                            {item.image !== undefined && <td>{item.image ? '✓' : ''}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


// ====================================================================
// ==================== COMPONENT CHA (TRANG CHÍNH) ===================
// ====================================================================

const QuanLyKho = () => {
    const [modalType, setModalType] = useState(null);
    const [outfits, setOutfits] = useState(initialOutfitsData);
    const [services, setServices] = useState(initialServicesData);

    const handleCloseModal = () => {
        setModalType(null);
    };

    const handleAddOutfit = (newOutfit) => {
        setOutfits(currentOutfits => [...currentOutfits, newOutfit]);
        handleCloseModal();
    };
    
    const handleAddService = (newService) => {
        setServices(currentServices => [...currentServices, newService]);
        handleCloseModal();
    };

    return (
        <div className="content-wrapper-react">
            <div className="page-header">
                <h2>QUẢN LÝ KHO</h2>
                <ActionsButton onOpenModal={setModalType} />
            </div>

            <div className="inventory-grid">
                <InventoryColumn 
                    title="Trang phục trong kho"
                    icon={faWarehouse}
                    data={outfits} 
                    headers={['Tên trang phục', 'Mã số', 'Size', 'Giá thuê', 'Tồn kho', 'Ảnh']}
                />
                <InventoryColumn 
                    title="Dịch vụ cửa hàng"
                    icon={faBriefcase}
                    data={services}
                    headers={['Tên gói dịch vụ', 'Mã số', 'Giá tiền', 'Ảnh']}
                />
            </div>

            <Dialog 
                isOpen={modalType !== null} 
                onClose={handleCloseModal}
                title={modalType === 'outfit' ? "Thêm trang phục mới" : "Thêm dịch vụ mới"}
            >
                {modalType === 'outfit' && <AddOutfitForm onCancel={handleCloseModal} onSave={handleAddOutfit} />}
                {modalType === 'service' && <AddServiceForm onCancel={handleCloseModal} onSave={handleAddService} />}
            </Dialog>
        </div>
    );
};

export default QuanLyKho;