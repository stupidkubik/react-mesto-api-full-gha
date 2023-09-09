import React from "react"

import AppContext from "../contexts/AppContext.js"
import CurrentUserContext from "../contexts/CurrentUserContext.js"

import api from "../utils/api.js"
import Header from "./Header.jsx"
import Main from "./Main.jsx"
import Footer from "./Footer.jsx"
import PopupWithForm from "./PopupWithForm.jsx"
import ImagePopup from "./ImagePopup.jsx"
import EditProfilePopup from "../components/EditProfilePopup.jsx"
import AddPlacePopup from "../components/AddPlacePopup.jsx"
import EditAvatarPopup from "../components/EditAvatarPopup.jsx"

function App() {
  const [openPopupProfile, setOpenPopupProfile] = React.useState(false)
  const [openPopupAdd, setOpenPopupAdd] = React.useState(false)
  const [openPopupAvatar, setOpenPopupAvatar] = React.useState(false)
  const [openPopupDelete, setOpenPopupDelete] = React.useState(false)
  const [openPopupImage, setOpenPopupImage] = React.useState(false)

  const [selectedCard, setSelectedCard] = React.useState({ name: '', link: '' })
  const [deletedCardId, setDeletedCardId] = React.useState('')

  const [currentUser, setCurrentUser] = React.useState(null) // Загрузка данных текущего юзера
  const [cards, setCards] = React.useState([]) // Загрузка карточек с сервера
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    Promise.all([
      api.getCards(), // Запрашиваем массив карточек с сервера
      api.getUserInfo() // Запрашиваем данные юзера
    ])
    .then(([cardsData, user]) => {
      setCurrentUser(user)
      setCards(cardsData)
    })
    .catch((err) => {
      console.error(err)
    })
  }, [])

  // Общая функция запроса к серверу
  function handleSubmit(request) {
    setIsLoading(true)
    request()
      .then(closeAllPopups)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }

  // Логика попапа обновления профиля
  function handleEditProfileClick() {
    setOpenPopupProfile(true)
  }

  function handleEditProfileSubmit(evt, inputValues) {
    evt.preventDefault()
    function makeRequest() {
      return api.updateProfile(inputValues).then(setCurrentUser)
    }
    handleSubmit(makeRequest)
  }

  // Логика попапа добавления карточки
  function handleAddPlaceClick() {
    setOpenPopupAdd(true)
  }

  function handleAddPlaceSubmit(evt, inputValues) {
    evt.preventDefault()
    function makeRequest() {
      return api.postCard(inputValues).then((newCard => {
        setCards([newCard, ...cards])
      }))
    }
    handleSubmit(makeRequest)
  }

  // Логика попапа обновления аватара
  function handleEditAvatarClick() {
    setOpenPopupAvatar(true)
  }

  function handleAvatarSubmit(evt, inputValues) {
    evt.preventDefault()
    function makeRequest() {
      return api.updateAvatar(inputValues).then(setCurrentUser)
    }
    handleSubmit(makeRequest)
  }

  // Логика попапа удаления карточки
  function handleCardDelete(evt, cardData) {
    if(openPopupDelete) { // Если попап уже открыт
      evt.preventDefault()
      function makeRequest() {
        return api.deleteCard(deletedCardId)
        .then(setCards((cards) => cards.filter((c) => c._id !== deletedCardId)))
      }
      handleSubmit(makeRequest)
    } else { // Открываем попап
      setOpenPopupDelete(true)
      setDeletedCardId(cardData._id)
    }
  }

  function handleCardClick(evt) { // Открытие попапа с картинкой
    setSelectedCard({ link: evt.target.src, name: evt.target.alt})
    setOpenPopupImage(true)
  }

  function handleCardLike(card) { // Обработчик лайков
    const isLiked = card.likes.some(i => i._id === currentUser._id)
    function makeRequest() {
      return api.changeLikeCardStatus(card._id, isLiked)
      .then((newCard) => {
        setCards((state) => state.map((c) => c._id === card._id ? newCard : c))
      })
    }
    handleSubmit(makeRequest)
  }

  function closeAllPopups() { // Закрытие всех попапов
    setOpenPopupProfile(false)
    setOpenPopupAdd(false)
    setOpenPopupAvatar(false)
    setOpenPopupDelete(false)
    setOpenPopupImage(false)

    setSelectedCard({ name: '', link: '' })
    setDeletedCardId('')
  }

  return (
    <AppContext.Provider value={{ isLoading, closeAllPopups }}>
      <CurrentUserContext.Provider value={currentUser}>
        <div className="App">
          <Header />
          
          <Main cards={cards} 
          onEditProfile={handleEditProfileClick} 
          onAddPlace={handleAddPlaceClick} 
          onEditAvatar={handleEditAvatarClick} 
          onOpenImage={handleCardClick} 
          onDelete={handleCardDelete} 
          handleCardLike={handleCardLike} />

          <Footer />

          <EditProfilePopup 
          isOpen={openPopupProfile}
          onSubmit={handleEditProfileSubmit} />

          <AddPlacePopup 
          isOpen={openPopupAdd}
          onSubmit={handleAddPlaceSubmit} />

          <EditAvatarPopup 
          isOpen={openPopupAvatar} 
          onSubmit={handleAvatarSubmit} />

          <PopupWithForm 
          isOpen={openPopupDelete} 
          onSubmit={handleCardDelete}
          name="delete" 
          title="Вы уверены?" 
          buttonTitle="Да" />

          <ImagePopup 
          card={selectedCard} 
          isOpen={openPopupImage} />
        </div>
      </CurrentUserContext.Provider>
    </AppContext.Provider>
  )
}

export default App
