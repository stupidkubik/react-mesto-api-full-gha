import AddPlacePopup from '../../components/AddPlacePopup.jsx';
import EditAvatarPopup from '../../components/EditAvatarPopup.jsx';
import EditProfilePopup from '../../components/EditProfilePopup.jsx';
import ImagePopup from '../../components/ImagePopup.jsx';
import InfoTooltip from '../../components/InfoTooltip.jsx';
import PopupWithForm from '../../components/PopupWithForm.jsx';

function PopupStack({
  isAddPlacePopupOpen,
  isAvatarPopupOpen,
  isDeletePopupOpen,
  isImagePopupOpen,
  isInfoPopupOpen,
  isProfilePopupOpen,
  onAddPlaceSubmit,
  onAvatarSubmit,
  onDeleteSubmit,
  onProfileSubmit,
  selectedCard,
  tooltipInfo,
}) {
  return (
    <>
      <InfoTooltip isOpen={isInfoPopupOpen} tooltipInfo={tooltipInfo} />

      <EditProfilePopup
        isOpen={isProfilePopupOpen}
        onSubmit={onProfileSubmit}
      />

      <AddPlacePopup isOpen={isAddPlacePopupOpen} onSubmit={onAddPlaceSubmit} />

      <EditAvatarPopup isOpen={isAvatarPopupOpen} onSubmit={onAvatarSubmit} />

      <PopupWithForm
        isOpen={isDeletePopupOpen}
        onSubmit={onDeleteSubmit}
        name="delete"
        title="Вы уверены?"
        buttonTitle="Да"
      />

      <ImagePopup card={selectedCard} isOpen={isImagePopupOpen} />
    </>
  );
}

export default PopupStack;
