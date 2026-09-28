import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const MobileSidebar = ({
  open,
  onClose,
}) => {
  const location = useLocation();

  useEffect(() => {
    if (open) {
      onClose();
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close sidebar overlay"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
      />

      <div className="relative z-10 h-full w-72 max-w-[85vw] shadow-2xl">
        <Sidebar onClose={onClose} />
      </div>
    </div>
  );
};

export default MobileSidebar;
