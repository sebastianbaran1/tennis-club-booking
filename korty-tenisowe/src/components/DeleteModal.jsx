export default function DeleteModal({
  title,
  name,
  buttonText,
  handleDelete,
  onClose,
}) {
  return (
    <div className="modal-overlay active">
      <div className="modal">
        <button className="modal__close" onClick={onClose}>
          ✕
        </button>
        <h2 className="modal__title">{title}</h2>
        <p className="modal__subtitle">
          Czy na pewno chcesz usunąć:{" "}
          <span className="modal__subtitle-highlight">{name}</span>
          ? <br />
          Tej operacji nie można cofnąć.
        </p>

        <div className="modal__buttons">
          <button className="modal__button-cancel" onClick={onClose}>
            Anuluj
          </button>
          <button className="modal__button-confirm" onClick={handleDelete}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
