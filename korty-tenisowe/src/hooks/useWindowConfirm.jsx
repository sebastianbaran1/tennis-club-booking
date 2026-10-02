import DeleteModal from "../components/ConfirmModal";
import { useState } from "react";

export default function useWindowConfirm(
  title,
  subtitle,
  highlight,
  cancelText,
  confirmText,
) {
  const [promise, setPromise] = useState(null);

  const open = () => {
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

  const onClose = () => {
    promise.resolve(false);
    setPromise(null);
  };

  const onDelete = () => {
    promise.resolve(true);
    setPromise(null);
  };

  const component = promise ? (
    <DeleteModal
      title={title}
      subtitle={subtitle}
      highlight={highlight}
      cancelText={cancelText}
      confirmText={confirmText}
      handleConfirm={onDelete}
      onClose={onClose}
    />
  ) : null;

  return [component, open];
}
