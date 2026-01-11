import React, { createContext, useContext, useState, useCallback } from "react";
import LoadingDialog from "../components/LoadingDialog";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("Đang xử lý...");

  const showLoading = useCallback((message = "Đang xử lý...") => {
    setText(message);
    setLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      <LoadingDialog show={loading} text={text} />
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
