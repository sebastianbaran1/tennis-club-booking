import { useEffect } from "react";
import "./Alert.css";

export default function Alert({ alertMessage, setAlertMessage }) {
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 3500);
      console.log("alert srodek");
      return () => clearTimeout(timer);
    }
    console.log("alert ");
  }, [alertMessage, setAlertMessage]);

  return (
    <div className={`alert-overlay ${alertMessage ? "active" : ""}`}>
      <div className="alert">{alertMessage}</div>
    </div>
  );
}
