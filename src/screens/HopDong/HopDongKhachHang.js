function HopDongKhachHang() {
    return (
        <div className="hopdongkhachhang">
            <div class="content-header">
                <h2>HỢP ĐỒNG KHÁCH HÀNG</h2>
                <div class="filters">
                    <button class="add-new-btn">
                        <i class="fa-solid fa-plus"></i>
                        THÊM HỢP ĐỒNG MỚI
                    </button>
                    <div class="select-wrapper">
                        <i class="fa-solid fa-calendar-alt"></i>
                        <select>
                            <option>Lọc chọn thời gian tìm kiếm</option>
                        </select>
                    </div>
                    <div class="search-bar">
                        <i class="fa-solid fa-search"></i>
                        <input type="text" placeholder="Tìm kiếm tên hoặc mã số HĐ" />
                    </div>
                </div>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>MÃ SỐ HĐ</th>
                            <th>TÊN KHÁCH HÀNG</th>
                            <th>SĐT</th>
                            <th>TRẠNG THÁI</th>
                            <th>DỊCH VỤ</th>
                            <th>NGÀY HĐ</th>
                            <th>NGÀY CHỤP</th>
                            <th>NGÀY XEM</th>
                            <th>NGÀY TRẢ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>W123456</td>
                            <td>TIẾN LONG<br />THANH THỦY</td>
                            <td>0862180802<br />0862620802</td>
                            <td><span class="status-chip">TẠO MỚI</span></td>
                            <td>CHỤP CƯỚI</td>
                            <td>01/01<br />2000</td>
                            <td>02/02<br />2000</td>
                            <td>03/03<br />2000</td>
                            <td>04/04<br />2000</td>
                        </tr>

                        <tr>
                            <td>1</td>
                            <td>W123456</td>
                            <td>TIẾN LONG<br />THANH THỦY</td>
                            <td>0862180802<br />0862620802</td>
                            <td><span class="status-chip">CHỈNH SỬA ẢNH</span></td>
                            <td>CHỤP CƯỚI</td>
                            <td>01/01<br />2000</td>
                            <td>02/02<br />2000</td>
                            <td>03/03<br />2000</td>
                            <td>04/04<br />2000</td>
                        </tr>

                        <tr>
                            <td>1</td>
                            <td>W123456</td>
                            <td>TIẾN LONG<br />THANH THỦY</td>
                            <td>0862180802<br />0862620802</td>
                            <td><span class="status-chip">CHỈNH SỬA ẢNH</span></td>
                            <td>CHỤP CƯỚI</td>
                            <td>01/01<br />2000</td>
                            <td>02/02<br />2000</td>
                            <td>03/03<br />2000</td>
                            <td>04/04<br />2000</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )

}
export default HopDongKhachHang;