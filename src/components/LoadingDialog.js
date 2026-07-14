import React, { useEffect, useState } from "react";
import "./css/loadingDialog.css";

const LoadingDialog = ({ show }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    let intervalId;
    let timeoutId;
    let fadeTimeoutId;

    if (show) {
      setFade(false);
      setVisible(true);
      setProgress(10); // Start with 10% progress immediately

      // Animate progress up to ~98%
      intervalId = setInterval(() => {
        setProgress((prev) => {
          if (prev < 40) return prev + Math.floor(Math.random() * 15) + 10;
          if (prev < 70) return prev + Math.floor(Math.random() * 8) + 4;
          if (prev < 90) return prev + Math.floor(Math.random() * 3) + 1;
          if (prev < 97) return prev + 0.3;
          return prev;
        });
      }, 200);
    } else {
      if (visible) {
        setProgress(100);
        // Fade out after the width transition completes
        fadeTimeoutId = setTimeout(() => {
          setFade(true);
          timeoutId = setTimeout(() => {
            setVisible(false);
            setProgress(0);
            setFade(false);
          }, 300);
        }, 300);
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
      if (fadeTimeoutId) clearTimeout(fadeTimeoutId);
    };
  }, [show, visible]);

  if (!visible) return null;

  return (
    <div className="top-loading-container">
      <div
        className={`top-loading-bar ${fade ? "fade-out" : ""}`}
        style={{ width: `${progress}%` }}
      />
      <div className={`top-loading-spinner ${fade ? "fade-out" : ""}`}>
        <div className="spinner-icon" />
      </div>
    </div>
  );
};

export default LoadingDialog;
