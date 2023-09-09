import CurrentUserContext from "../contexts/CurrentUserContext.js"
import React from "react"

function Card({ 
  cardData, // Данные карточки
  onOpenImage, // Стейт открытия картинки 
  onDelete, // Стейт подтвержедния удаления карточки
  handleCardLike // Обработчик лайков
  }) {

  function isOwner() {
    return currentUser._id === cardData.owner._id // Проверяем АйДи карточки
  }

  const currentUser = React.useContext(CurrentUserContext)
  const isLiked = cardData.likes.some(i => i._id === currentUser._id)
  const cardLikeButtonClassName = (`element__like-icon ${isLiked ? 'element__like-icon_active' : ''}`) 

  return (
    <li className="element">
      <img className="element__image" 
      src={cardData.link} 
      alt={cardData.name} 
      onClick={onOpenImage} />

      <div className="element__name">
        <h2 className="element__title">{cardData.name}</h2>
  
        <div className="element__like-box">
          <button className={cardLikeButtonClassName}
          type="button" 
          aria-label="поставить лайк"
          onClick={() => handleCardLike(cardData)}>
          </button>

          <div className="element__like-count">{cardData.likes.length}</div>
        </div>
      </div>

      {
        isOwner() && <button className="element__trash-icon" 
        type="button" 
        aria-label="удалить карточку"
        onClick={(evt) => onDelete(evt, cardData)}>
        </button>
      }
    </li>
  )
}

export default Card
