import Popup from './Popup.jsx';

function InfoTooltip({ isOpen, tooltipInfo }) {
  return (
    <Popup isOpen={isOpen} name={'info'}>
      <div className={tooltipInfo.cssClass} />
      <h2 className="popup__info">{tooltipInfo.popupTitle}</h2>
    </Popup>
  );
}

export default InfoTooltip;
