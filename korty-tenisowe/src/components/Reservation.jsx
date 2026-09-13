export default function Reservation({ res, handleCancelReservation }) {
  return (
    <div className="reservation-card">
      <div>
        <h3 className="reservation-card__date">{res.date}</h3>
        <p className="reservation-card__detail">
          <span className="profile-info-label">Godzina:</span> {res.startTime} (
          {res.duration} min)
        </p>
        <p className="reservation-card__location">
          Miejsce: {res.court.name} ({res.court.surface})
        </p>
      </div>

      {handleCancelReservation && (
        <button
          className="btn-cancel"
          onClick={() => handleCancelReservation(res.id)}
        >
          Anuluj
        </button>
      )}
    </div>
  );
}
