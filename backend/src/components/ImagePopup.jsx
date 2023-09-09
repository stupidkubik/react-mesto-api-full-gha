import Popup from './Popup.jsx';

function ImagePopup({ isOpen, card }) {
  return (
    <Popup isOpen={isOpen} name={'image'}>
      <img
        className="popup__image"
        src={card.link || '#'}
        alt={card.name || ' '}
      />

      <h2 className="popup__description">{card.name || ' '}</h2>
    </Popup>
  );
}

export default ImagePopup;
