function FeatureCard({ icon, title, description }) {
  return (
    <article className="feature-card">
      <div className="feature-icon">{icon}</div>

      <div className="feature-text">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}

export default FeatureCard;