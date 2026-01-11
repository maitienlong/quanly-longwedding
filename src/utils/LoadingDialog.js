import React from "react";
import "./LoadingDialog.css";

const LoadingDialog = ({ show }) => {
  if (!show) return null; // không hiển thị khi show=false

  return (
    <div className="loading-overlay">
      <div className="loading-dialog">
        <div className="spinner"></div>
        <p>Đang xử lý, vui lòng chờ...</p>
      </div>
    </div>
  );
};

export default LoadingDialog;
