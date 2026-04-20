import React from 'react';
import './ServiceCard.css';

function ServiceCard({ title, price, image, onClick, isAddCard = false, caption }) {
  const initials = title
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <button type="button" className={`service-card ${isAddCard ? 'service-card--add' : ''}`} onClick={onClick}>
      {isAddCard ? (
        <div className="service-card__plus">+</div>
      ) : image ? (
        <img src={image} alt="" className="service-card__image" />
      ) : (
        <div className="service-card__fallback">{initials}</div>
      )}
      <span className="service-card__title">{title}</span>
      <span className="service-card__price">{caption || `EUR ${price.toFixed(2)}/month`}</span>
    </button>
  );
}

export default ServiceCard;
