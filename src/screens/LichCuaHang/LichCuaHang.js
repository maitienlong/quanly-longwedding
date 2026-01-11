function LichCuaHang() {
    return (
        <div className="hopdongkhachhang">
            <div class="content-header">
                <h2>LỊCH CHỤP ẢNH</h2>
                <div class="filters">
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
                            <th>ĐỊA ĐIỂM CHỤP</th>
                            <th>EKIP</th>
                            <th>DỊCH VỤ</th>
                            <th>NGÀY CHỤP</th>
                            <th>THỜI GIAN CHỤP</th>
                            <th>CHỐT LỊCH</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>W123456</td>
                            <td>TIẾN LONG<br />THANH THỦY</td>
                            <td>0862180802<br />0862620802</td>
                            <td>Ngoại cảnh + Studio</td>
                            <td>Long + Thuý</td>
                            <td>PreWedding</td>
                            <td>29/06/2025</td>
                            <td>9h30p</td>
                            <td>Đã gọi điện xác nhận</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>W123456</td>
                            <td>TIẾN LONG<br />THANH THỦY</td>
                            <td>0862180802<br />0862620802</td>
                            <td>Ngoại cảnh + Studio</td>
                            <td>Long + Thuý</td>
                            <td>PSC</td>
                            <td>29/06/2025</td>
                            <td>9h30p</td>
                            <td>Đã gọi điện xác nhận</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )

}
export default LichCuaHang;