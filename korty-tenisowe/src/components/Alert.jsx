import { useEffect } from "react";
import "./Alert.css";

export default function Alert({ alertMessage, setAlertMessage }) {
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [alertMessage, setAlertMessage]);

  return (
    <div className={`alert-overlay ${alertMessage ? "active" : ""}`}>
      <div className="alert">{alertMessage}</div>
    </div>
  );
}
