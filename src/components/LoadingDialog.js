import React from "react";
import "./css/loadingDialog.css";

const LoadingDialog = ({ show, text = "Đang xử lý, vui lòng chờ..." }) => {
  if (!show) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-dialog">
        <div className="spinner"></div>
        <p>{text}</p>
      </div>
    </div>
  );
};

export default LoadingDialog;
