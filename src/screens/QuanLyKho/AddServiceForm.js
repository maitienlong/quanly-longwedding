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
        if (event.target.files && event.target.files[0]) {
            setImageFile(event.target.files[0]);
        }
    };
    
    // Gợi ý nội dung cho phần mô tả
    const descriptionPlaceholder = 
`SẢN PHẨM NHẬN ĐƯỢC
- 02 Ảnh phóng 60 x 90 cm...
- 02 Ảnh để bàn Hàn Quốc...

DỊCH VỤ TẶNG KÈM
- 01 Váy cưới cao cấp...
- 01 Áo dài cô dâu...
...`;

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
                <textarea 
                    id="service-description" 
                    rows="8" 
                    placeholder={descriptionPlaceholder}
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
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

export default AddServiceForm;
