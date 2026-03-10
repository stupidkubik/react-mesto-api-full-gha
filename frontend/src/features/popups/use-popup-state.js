import { useState } from 'react';

function usePopupState() {
  const [openPopupProfile, setOpenPopupProfile] = useState(false);
  const [openPopupAdd, setOpenPopupAdd] = useState(false);
  const [openPopupAvatar, setOpenPopupAvatar] = useState(false);
  const [openPopupDelete, setOpenPopupDelete] = useState(false);
  const [openPopupImage, setOpenPopupImage] = useState(false);
  const [openPopupInfo, setOpenPopupInfo] = useState(false);
  const [tooltipInfo, setTooltipInfo] = useState({
    popupTitle: '',
    cssClass: '',
  });
  const [selectedCard, setSelectedCard] = useState({
    name: '',
    link: '',
  });
  const [deletedCardId, setDeletedCardId] = useState('');

  function openProfilePopup() {
    setOpenPopupProfile(true);
  }

  function openAddPlacePopup() {
    setOpenPopupAdd(true);
  }

  function openAvatarPopup() {
    setOpenPopupAvatar(true);
  }

  function requestCardDeletion(cardId) {
    setOpenPopupDelete(true);
    setDeletedCardId(cardId);
  }

  function openImagePopup(evt) {
    setSelectedCard({ link: evt.target.src, name: evt.target.alt });
    setOpenPopupImage(true);
  }

  function showRegistrationSuccess() {
    setTooltipInfo({
      popupTitle: 'Вы успешно зарегистрировались!',
      cssClass: 'popup__info-success',
    });
    setOpenPopupInfo(true);
  }

  function showRegistrationFailure() {
    setTooltipInfo({
      popupTitle: 'Что-то пошло не так! Попробуйте ещё раз.',
      cssClass: 'popup__info-fail',
    });
    setOpenPopupInfo(true);
  }

  function closeAllPopups() {
    setOpenPopupProfile(false);
    setOpenPopupAdd(false);
    setOpenPopupAvatar(false);
    setOpenPopupDelete(false);
    setOpenPopupImage(false);
    setOpenPopupInfo(false);
    setSelectedCard({ name: '', link: '' });
    setDeletedCardId('');
  }

  return {
    closeAllPopups,
    deletedCardId,
    isAddPlacePopupOpen: openPopupAdd,
    isAvatarPopupOpen: openPopupAvatar,
    isDeletePopupOpen: openPopupDelete,
    isImagePopupOpen: openPopupImage,
    isInfoPopupOpen: openPopupInfo,
    isProfilePopupOpen: openPopupProfile,
    openAddPlacePopup,
    openAvatarPopup,
    openImagePopup,
    openProfilePopup,
    requestCardDeletion,
    selectedCard,
    showRegistrationFailure,
    showRegistrationSuccess,
    tooltipInfo,
  };
}

export default usePopupState;
