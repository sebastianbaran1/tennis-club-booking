export default function StaticPageLayout({ label, title, children }) {
  return (
    <div className="static-page">
      <div className="static-page__card">
        <div className="static-page__header">
          <span className="static-page__label">{label}</span>
          <h1 className="static-page__title">{title}</h1>
        </div>
        <div className="static-page__content">{children}</div>
      </div>
    </div>
  );
}
