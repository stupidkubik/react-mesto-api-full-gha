import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import useCards from '../features/cards/use-cards.js';
import PopupStack from '../features/popups/PopupStack.jsx';
import usePopupState from '../features/popups/use-popup-state.js';
import useProfile from '../features/profile/use-profile.js';
import { useSession } from '../shared/session/index.js';
import AppProviders from './AppProviders.jsx';
import AppRoutes from './AppRoutes.jsx';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const popupState = usePopupState();

  const navigate = useNavigate();
  const { Paths, handleExit, handleLogin, handleRegistration, isLoggedIn, userLogin } =
    useSession({
      navigate,
      setIsLoading,
      closeAllPopups: popupState.closeAllPopups,
    });
  const submitRequest = (request) => {
    setIsLoading(true);

    return request()
      .then((result) => {
        popupState.closeAllPopups();
        return result;
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };
  const profile = useProfile({ submitRequest });
  const cards = useCards({
    currentUser: profile.currentUser,
    deletedCardId: popupState.deletedCardId,
    isDeletePopupOpen: popupState.isDeletePopupOpen,
    onRequestDelete: popupState.requestCardDeletion,
    submitRequest,
  });

  useEffect(() => {
    if (isLoggedIn) {
      Promise.all([cards.loadCards(), profile.loadCurrentUser()]).catch(
        console.error
      );
    }
  }, [isLoggedIn]);

  function handleRegistrationSubmit(evt, inputValues) {
    handleRegistration(evt, inputValues, {
      onSuccess: popupState.showRegistrationSuccess,
      onError: popupState.showRegistrationFailure,
    });
  }

  return (
    <div className="App">
      <AppProviders
        closeAllPopups={popupState.closeAllPopups}
        currentUser={profile.currentUser}
        isLoading={isLoading}
        isLoggedIn={isLoggedIn}
        paths={Paths}
        userLogin={userLogin}
      >
        <AppRoutes
          cards={cards.cards}
          handleCardLike={cards.handleCardLike}
          handleExit={handleExit}
          onAddPlace={popupState.openAddPlacePopup}
          onDelete={cards.handleCardDelete}
          onEditAvatar={popupState.openAvatarPopup}
          onEditProfile={popupState.openProfilePopup}
          onLogin={handleLogin}
          onOpenImage={popupState.openImagePopup}
          onRegister={handleRegistrationSubmit}
          openPopupInfo={popupState.isInfoPopupOpen}
          paths={Paths}
        />

        <PopupStack
          isAddPlacePopupOpen={popupState.isAddPlacePopupOpen}
          isAvatarPopupOpen={popupState.isAvatarPopupOpen}
          isDeletePopupOpen={popupState.isDeletePopupOpen}
          isImagePopupOpen={popupState.isImagePopupOpen}
          isInfoPopupOpen={popupState.isInfoPopupOpen}
          isProfilePopupOpen={popupState.isProfilePopupOpen}
          onAddPlaceSubmit={cards.handleAddPlaceSubmit}
          onAvatarSubmit={profile.handleAvatarSubmit}
          onDeleteSubmit={cards.handleCardDelete}
          onProfileSubmit={profile.handleEditProfileSubmit}
          selectedCard={popupState.selectedCard}
          tooltipInfo={popupState.tooltipInfo}
        />
      </AppProviders>
    </div>
  );
}

export default App;
