import { useOutletContext, Navigate } from "react-router-dom";
import "./Admin.css";
import AdminSchedule from "./components/AdminSchedule";
import AdminCourts from "./components/AdminCourts";
import AdminUsers from "./components/AdminUsers";

export default function Admin() {
  const { user, isUserLoading } = useOutletContext();

  if (isUserLoading) {
    return (
      <div className="admin-loading">
        <h2>Wczytywanie panelu administratora...</h2>
      </div>
    );
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "DEMO_ADMIN")) {
    return <Navigate to="/" />;
  }

  return (
    <div className="admin-container">
      <div className="admin">
        <h1 className="admin__header">Panel administratora</h1>
        <div className="admin__content-container">
          <AdminSchedule />
          <AdminCourts />
          <AdminUsers />
        </div>
      </div>
    </div>
  );
}
