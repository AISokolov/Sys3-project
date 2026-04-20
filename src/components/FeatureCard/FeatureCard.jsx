import React from 'react';
import './FeatureCard.css';

function FeatureCard({ icon, title, description }) {
  return (
    <article className="feature-card">
      <img src={icon} alt="" className="feature-card__icon" />
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__description">{description}</p>
    </article>
  );
}

export default FeatureCard;
