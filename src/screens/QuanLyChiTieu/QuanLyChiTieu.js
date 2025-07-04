
function QuanLyChiTieu() {
    return (
        <div className="hopdongkhachhang">
            <div class="content-header">
                <h2>QUẢN LÝ CHI TIÊU</h2>
                <div class="filters">
                    <button class="add-new-btn">
                        <i class="fa-solid fa-plus"></i>
                        THÊM CHI TIÊU
                    </button>
                    <div class="select-wrapper">
                        <i class="fa-solid fa-calendar-alt"></i>
                        <select>
                            <option>Lọc chọn thời gian tìm kiếm</option>
                        </select>
                    </div>
                    <div class="search-bar">
                        <i class="fa-solid fa-search"></i>
                        <input type="text" placeholder="Tìm kiếm tên hoặc mã số GD chi tiêu" />
                    </div>
                </div>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>MÃ SỐ</th>
                            <th>NGÀY CHI</th>
                            <th>ĐƠN VỊ NHẬN TIỀN</th>
                            <th>LÝ DO CHI</th>
                            <th>SỐ TIỀN</th>
                            <th>NGƯỜI CHI</th>
                            <th>GHI CHÚ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>W123456</td>
                            <td>30/60/2025</td>
                            <td>Hoàng Gia Lab</td>
                            <td>Tiền Ảnh</td>
                            <td>1.500.000đ</td>
                            <td>longmt</td>
                            <td>Không có gì cả</td>

                        </tr>
                        <tr>
                            <td>2</td>
                            <td>W123456</td>
                            <td>30/60/2025</td>
                            <td>Hoàng Gia Lab</td>
                            <td>Tiền Ảnh</td>
                            <td>1.500.000đ</td>
                            <td>longmt</td>
                            <td>Không có gì cả</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )

}
export default QuanLyChiTieu;