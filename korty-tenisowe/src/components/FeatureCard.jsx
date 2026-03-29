function FeatureCard({ feature }) {
  return (
    <div className="features__grid-item">
      <div className="features__icon-wrapper">
        <img src="#" alt={feature.iconAlt} />
      </div>
      <h3 className="features__grid-item-title">{feature.title}</h3>
      <p className="features__grid-item-subtitle">{feature.subtitle}</p>
    </div>
  );
}
