function LichSoanDo() {
    return (
        <div className="LichSoanDo">
            <div class="content-header">
                <h2>LỊCH SOẠN ĐỒ</h2>
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
                            <th>NGÀY SOẠN ĐỒ</th>
                            <th>NỘI DUNG</th>
                            <th>NGÀY MƯỢN</th>
                            <th>NGÀY TRẢ</th>
                            <th>ĐẶT CỌC ĐỒ</th>
                            <th>KIỂM ĐỒ</th>
                            <th>TRẠNG THÁI</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>W123456</td>
                            <td>TIẾN LONG<br />THANH THỦY</td>
                            <td>0862180802<br />0862620802</td>
                            <td>30/06/2025</td>
                            <td>Đồ bê lễ</td>
                            <td>02/07/2025</td>
                            <td>04/07/2025</td>
                            <td>1.500.000</td>
                            <td>longmt</td>
                            <td>Chưa mượn</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>W123456</td>
                            <td>TIẾN LONG<br />THANH THỦY</td>
                            <td>0862180802<br />0862620802</td>
                            <td>30/06/2025</td>
                            <td>Đồ bê lễ</td>
                            <td>02/07/2025</td>
                            <td>04/07/2025</td>
                            <td>1.500.000</td>
                            <td>longmt</td>
                            <td>Chưa mượn</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )

}
export default LichSoanDo;