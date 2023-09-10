import { useContext } from 'react';
import CurrentUserContext from '../contexts/CurrentUserContext.js';
import LoginUserContext from '../contexts/LoginUserContext';
import Card from './Card.jsx';
import Header from './Header';
import Footer from './Footer.jsx';

function Main({
  cards,
  onEditProfile, // Слушатель открытия профиля
  onAddPlace, // Слушатель добавления карточки
  onEditAvatar, // Слушатель редактирования аватара
  onOpenImage, // Слушатель открытия картинки
  onDelete, // Слушатель подтверждения удаления
  handleCardLike,
  handleExit,
}) {
  const currentUser = useContext(CurrentUserContext);
  const { userLogin = 'user' } = useContext(LoginUserContext);

  return (
    <>
      <Header name={userLogin.email} handleExit={handleExit} />

      <main className="content App__content">
        <section className="profile">
          <div className="profile__item">
            <button
              className="profile__avatar-edit"
              type="button"
              aria-label="редактировать аватар"
              onClick={onEditAvatar}
            >
              <img
                className="profile__avatar"
                src={currentUser?.avatar}
                alt="Аватар профиля"
              />
            </button>

            <div className="profile__info">
              <div className="profile__name-item">
                <h1 className="profile__name">{currentUser?.name || ''}</h1>

                <button
                  className="profile__edit"
                  type="button"
                  aria-label="редактировать профиль"
                  onClick={onEditProfile}
                />
              </div>

              <p className="profile__caption">{currentUser?.about || ''}</p>
            </div>
          </div>

          <button
            className="profile__add-element"
            type="button"
            aria-label="добавить фотографию"
            onClick={onAddPlace}
          ></button>
        </section>

        <section className="elements">
          <ul className="elements__list">
            {cards.map((cardData) => {
              return (
                <Card
                  key={cardData._id}
                  cardData={cardData}
                  onOpenImage={onOpenImage}
                  onDelete={onDelete}
                  handleCardLike={handleCardLike}
                />
              );
            })}
          </ul>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Main;
