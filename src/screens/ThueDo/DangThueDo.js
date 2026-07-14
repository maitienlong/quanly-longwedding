import React from 'react';

import styled from "styled-components";

const CustomInput = styled.input`
  background-color: #fff;
  border-color: #d2d6de;
  border-radius: 3px;
  border-style: solid;
  border-width: 1px;
  color: #555;
  display: inline-block;
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 20px;
  padding: 6px 12px;
  height: 2rem;  /* Chiều cao 2rem */
  width: auto;   /* Chiều rộng tự động */
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input:focus {
  border-color: #a0a4ab;
  outline: none;
  box-shadow: 0 0 5px rgba(162, 170, 180, 0.5);
`;


const CustomSelect = styled.select`
   background-color: #fff;
  border-color: #d2d6de;
  border-radius: 3px;
  border-style: solid;
  border-width: 1px;
  color: #555;
  display: inline-block;
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 20px;
  padding: 6px 12px;
  height: 2rem;  /* Chiều cao 2rem */
  width: auto;   /* Chiều rộng tự động */
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input:focus {
  border-color: #a0a4ab;
  outline: none;
  box-shadow: 0 0 5px rgba(162, 170, 180, 0.5);
`;

const DateInput = styled.input`
  height: 2rem;
  width: auto;
  padding: 6px 12px;
  border: 1px solid #d2d6de;
  border-radius: 3px;
  font-size: 14px;
  color: #555;
  background-color: #fff;
  cursor: pointer;

  &:focus {
    border-color: #a0a4ab;
    outline: none;
    box-shadow: 0 0 5px rgba(162, 170, 180, 0.5);
  }
`;

const SubmitButton = styled.button`
  height: 2rem;
  width: auto;
  padding: 6px 12px;
  border: 1px solid #367fa9;
  border-radius: 3px;
  font-size: 14px;
  color: #fff;
  background-color: #367fa9;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #333;
  }

  &:focus {
    border-color: #367fa9;
    outline: none;
    box-shadow: 0 0 5px rgba(162, 170, 180, 0.5);
  }
`;



const TableContainer = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - 280px);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  table-layout: fixed;
`;

const Th = styled.th`
  background-color: #d4edfc;
  padding: 8px;
  border: 1px solid #ccc;
  text-align: center;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const Td = styled.td`
  padding: 8px;
  border: 1px solid #ccc;
  text-align: center;
  background-color: ${(props) => (props.highlight ? "#002f6c" : "#fff")};
  color: ${(props) => (props.highlight ? "#fff" : "#000")};
`;

const DangThueDo = () => {

    return (
        <div className="TabDangThucHien">
            <div className='tabdangthuchien-filter'>
                <CustomInput type="text" class="form-control" id="formGroupExampleInput" placeholder="Họ và tên, SĐT" />

                <CustomSelect class="form-select" aria-label="Default select example">
                    <option selected> - Lựa chọn trạng thái - </option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                </CustomSelect>

                <CustomSelect class="form-select" aria-label="Default select example">
                    <option selected> - Chọn loại hợp đồng - </option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                </CustomSelect>

                <CustomSelect class="form-select" aria-label="Default select example">
                    <option selected> - Chọn thanh toán - </option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                </CustomSelect>
                <DateInput type="date" class="custom-datepicker" />

                <CustomSelect class="form-select" aria-label="Default select example">
                    <option selected> - Loại ngày - </option>
                    <option value="1">Ngày Tạo</option>
                    <option value="2">Ngày chụp</option>
                    <option value="3">Ngày trả ảnh</option>
                    <option value="3">Ngày cưới</option>
                </CustomSelect>

                <SubmitButton type="submit"><i class="fa fa-search" aria-hidden="true"></i> Tìm kiếm</SubmitButton>
            </div>
            <TableContainer>
                <StyledTable>
                    <thead>
                        <tr>
                            <Th>STT</Th>
                            <Th>Mã hợp đồng</Th>
                            <Th>Khách hàng</Th>
                            <Th>SDT CD</Th>
                            <Th>SDT CR</Th>
                            <Th>Trạng thái</Th>
                            <Th>Dịch vụ</Th>
                            <Th>Loại hợp đồng</Th>
                            <Th>Email</Th>
                            <Th>Địa chỉ CD</Th>
                            <Th>Địa chỉ CR</Th>
                            <Th>Giá bán</Th>
                            <Th>Giảm giá</Th>
                            <Th>Doanh thu</Th>
                            <Th>Đã thu</Th>
                            <Th>Còn lại</Th>
                            <Th>Đã chi</Th>
                            <Th>Lý do giảm giá</Th>
                            <Th>Ngày hợp đồng</Th>
                            <Th>Ngày chụp</Th>
                            <Th>Ngày xem ảnh</Th>
                            <Th>Ngày tất ảnh</Th>
                            <Th>Ngày in ảnh</Th>
                            <Th>Ngày quay NG</Th>
                            <Th>Ngày quay NT</Th>
                            <Th>Ghi chú</Th>
                            <Th>Ngày tạo</Th>
                            <Th>Khách bàn</Th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <Td>1</Td>
                            <Td>QG125-004</Td>
                            <Td>KIỀN NHANH</Td>
                            <Td>0862180822</Td>
                            <Td>0862180822</Td>
                            <Td highlight>PTS</Td>
                            <Td>Dịch vụ</Td>
                            <Td>Loại hợp đồng</Td>
                            <Td>Email</Td>
                            <Td>Địa chỉ CD</Td>
                            <Td>NGHĨA HÒA - NGHĨA ĐÀN - NGHỆ AN</Td>
                            <Td>0</Td>
                            <Td>0</Td>
                            <Td>0</Td>
                            <Td>5,900,000</Td>
                            <Td>-3,800,000</Td>
                            <Td>0</Td>
                            <Td>Lý do giảm giá</Td>
                            <Td>04/01/2025</Td>
                            <Td>04/01/2025</Td>
                            <Td>07/01/2025</Td>
                            <Td>12/01/2025</Td>
                            <Td>14/01/2025</Td>
                            <Td>14/01/2025</Td>
                            <Td>15/01/2025</Td>
                            <Td>Ghi chú</Td>
                            <Td>05/01/2025</Td>
                            <Td>Khách của hàng</Td>
                        </tr>

                        <tr>
                            <Td>1</Td>
                            <Td>QG125-004</Td>
                            <Td>KIỀN NHANH</Td>
                            <Td>0862180822</Td>
                            <Td>0862180822</Td>
                            <Td highlight>PTS</Td>
                            <Td>Dịch vụ</Td>
                            <Td>Loại hợp đồng</Td>
                            <Td>Email</Td>
                            <Td>Địa chỉ CD</Td>
                            <Td>NGHĨA HÒA - NGHĨA ĐÀN - NGHỆ AN</Td>
                            <Td>0</Td>
                            <Td>0</Td>
                            <Td>0</Td>
                            <Td>5,900,000</Td>
                            <Td>-3,800,000</Td>
                            <Td>0</Td>
                            <Td>Lý do giảm giá</Td>
                            <Td>04/01/2025</Td>
                            <Td>04/01/2025</Td>
                            <Td>07/01/2025</Td>
                            <Td>12/01/2025</Td>
                            <Td>14/01/2025</Td>
                            <Td>14/01/2025</Td>
                            <Td>15/01/2025</Td>
                            <Td>Ghi chú</Td>
                            <Td>05/01/2025</Td>
                            <Td>Khách của hàng</Td>
                        </tr>

                        <tr>
                            <Td>1</Td>
                            <Td>QG125-004</Td>
                            <Td>KIỀN NHANH</Td>
                            <Td>0862180822</Td>
                            <Td>0862180822</Td>
                            <Td highlight>PTS</Td>
                            <Td>Dịch vụ</Td>
                            <Td>Loại hợp đồng</Td>
                            <Td>Email</Td>
                            <Td>Địa chỉ CD</Td>
                            <Td>NGHĨA HÒA - NGHĨA ĐÀN - NGHỆ AN</Td>
                            <Td>0</Td>
                            <Td>0</Td>
                            <Td>0</Td>
                            <Td>5,900,000</Td>
                            <Td>-3,800,000</Td>
                            <Td>0</Td>
                            <Td>Lý do giảm giá</Td>
                            <Td>04/01/2025</Td>
                            <Td>04/01/2025</Td>
                            <Td>07/01/2025</Td>
                            <Td>12/01/2025</Td>
                            <Td>14/01/2025</Td>
                            <Td>14/01/2025</Td>
                            <Td>15/01/2025</Td>
                            <Td>Ghi chú</Td>
                            <Td>05/01/2025</Td>
                            <Td>Khách của hàng</Td>
                        </tr>
                    </tbody>
                </StyledTable>
            </TableContainer>
        </div>
    );
};

export default DangThueDo;
