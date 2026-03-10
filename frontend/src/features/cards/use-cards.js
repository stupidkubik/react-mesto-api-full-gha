import { useState } from 'react';
import apiClient from '../../shared/api/client.js';

function useCards({
  currentUser,
  deletedCardId,
  isDeletePopupOpen,
  onRequestDelete,
  submitRequest,
}) {
  const [cards, setCards] = useState([]);

  function loadCards() {
    return apiClient.getCards().then((cardsData) => {
      setCards(cardsData);
      return cardsData;
    });
  }

  function handleAddPlaceSubmit(evt, inputValues) {
    evt.preventDefault();

    return submitRequest(() =>
      apiClient.postCard(inputValues).then((newCard) => {
        setCards((currentCards) => [newCard, ...currentCards]);
        return newCard;
      })
    );
  }

  function handleCardDelete(evt, cardData) {
    if (isDeletePopupOpen) {
      evt.preventDefault();

      return submitRequest(() =>
        apiClient.deleteCard(deletedCardId).then(() => {
          setCards((currentCards) =>
            currentCards.filter((card) => card._id !== deletedCardId)
          );
        })
      );
    }

    onRequestDelete(cardData._id);
    return undefined;
  }

  function handleCardLike(card) {
    const currentUserId = currentUser?._id;

    if (!currentUserId) {
      return undefined;
    }

    const isLiked = card.likes.some((like) => like._id === currentUserId);

    return submitRequest(() =>
      apiClient.changeLikeCardStatus(card._id, isLiked).then((nextCard) => {
        setCards((currentCards) =>
          currentCards.map((currentCard) =>
            currentCard._id === card._id ? nextCard : currentCard
          )
        );
        return nextCard;
      })
    );
  }

  return {
    cards,
    handleAddPlaceSubmit,
    handleCardDelete,
    handleCardLike,
    loadCards,
  };
}

export default useCards;
