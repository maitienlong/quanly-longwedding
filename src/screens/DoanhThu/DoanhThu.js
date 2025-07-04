import './doanhthu.css';

function DoanhThu() {
    return (
        <div className="DoanhThu">
            <div class="content-header">
                <h2>DOANH THU & KPI</h2>
                <div class="time-filters">
                    <button class="filter-btn" data-period="day">Ngày</button>
                    <button class="filter-btn" data-period="week">Tuần</button>
                    <button class="filter-btn active" data-period="month">Tháng</button>
                    <button class="filter-btn" data-period="year">Năm</button>
                </div>
            </div>

            <div class="content-wrapper">
                <div class="summary-cards">
                    <div class="card revenue-card">
                        <div class="card-icon"><i class="fa-solid fa-arrow-up"></i></div>
                        <div class="card-content">
                            <h3>TỔNG THU</h3>
                            <p id="total-revenue">0đ</p>
                        </div>
                    </div>
                    <div class="card expense-card">
                        <div class="card-icon"><i class="fa-solid fa-arrow-down"></i></div>
                        <div class="card-content">
                            <h3>TỔNG CHI</h3>
                            <p id="total-expense">0đ</p>
                        </div>
                    </div>
                </div>

                <div class="main-dashboard-grid">
                    <div class="chart-container">
                        <h3>Biểu đồ Doanh thu</h3>
                        <canvas id="revenueChart"></canvas>
                    </div>
                    <div class="kpi-container">
                        <h3>Xếp hạng KPI Nhân viên</h3>
                        <table class="kpi-table">
                            <thead>
                                <tr>
                                    <th>Hạng</th>
                                    <th>Nhân viên</th>
                                    <th>Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody id="kpi-table-body">
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    )

}
export default DoanhThu;