import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router';
import AppContext from '../contexts/AppContext.js';
import CurrentUserContext from '../contexts/CurrentUserContext.js';
import LoginUserContext from '../contexts/LoginUserContext.js';
import ProtectedRoute from './ProtectedRoute.jsx';

import api from '../utils/api.js';
import auth from '../utils/auth.js';
import Register from './Register.jsx';
import Login from './Login.jsx';
import InfoTooltip from './InfoTooltip.jsx';
import Main from './Main.jsx';
import PopupWithForm from './PopupWithForm.jsx';
import ImagePopup from './ImagePopup.jsx';
import EditProfilePopup from '../components/EditProfilePopup.jsx';
import AddPlacePopup from '../components/AddPlacePopup.jsx';
import EditAvatarPopup from '../components/EditAvatarPopup.jsx';

function App() {
  const [openPopupProfile, setOpenPopupProfile] = useState(false);
  const [openPopupAdd, setOpenPopupAdd] = useState(false);
  const [openPopupAvatar, setOpenPopupAvatar] = useState(false);
  const [openPopupDelete, setOpenPopupDelete] = useState(false);
  const [openPopupImage, setOpenPopupImage] = useState(false);
  const [openPopupInfo, setOpenPopupInfo] = useState(false);

  //Стейт наполнения тултипа
  const [tooltipInfo, setTooltipInfo] = useState({
    popupTitle: '',
    cssClass: '',
  });

  const [selectedCard, setSelectedCard] = useState({
    name: '',
    link: '',
  });
  const [deletedCardId, setDeletedCardId] = useState('');

  const [currentUser, setCurrentUser] = useState(null); // Загрузка данных текущего юзера
  const [userLogin, setUserLogin] = useState(null); // Загрузка данных после регистрации
  const [cards, setCards] = useState([]); // Загрузка карточек с сервера
  const [isLoading, setIsLoading] = useState(false); // Проверка сабмита на сервер
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Проверка юзера

  // Константа с путями
  const Paths = {
    Home: '/',
    Login: '/signin',
    SignUp: '/signup',
  };

  const navigate = useNavigate();

  // Проверка токена
  useEffect(() => {
    const jwt = localStorage.getItem('token');

    if (jwt) {
      checkToken(jwt);
    } else navigate(Paths.SignUp);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const jwt = localStorage.getItem('token');
      console.log('useEffect = ', jwt)

      Promise.all([
        api.getCards(jwt), // Запрашиваем массив карточек с сервера
        api.getUserInfo(jwt), // Запрашиваем данные юзера
      ])
        .then(([cardsData, user]) => {
          setCurrentUser(user);
          setCards(cardsData);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [isLoggedIn]);

  // Общая функция запроса к серверу
  function handleSubmit(request) {
    setIsLoading(true);
    request()
      .then(closeAllPopups)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }

  // Отдельная функция регистрации юзера
  function handleRegistration(evt, inputValues) {
    evt.preventDefault();
    setIsLoading(true);

    auth
      .signUp(inputValues)
      .then((res) => {
        setUserLogin(res);
        setTooltipInfo({
          popupTitle: 'Вы успешно зарегистрировались!',
          cssClass: 'popup__info-success',
        });
        navigate(Paths.Login);
      })
      // Если ошибка то заполняем тултип
      .catch((err) => {
        setTooltipInfo({
          popupTitle: 'Что-то пошло не так! Попробуйте ещё раз.',
          cssClass: 'popup__info-fail',
        });
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
        setOpenPopupInfo(true); //Открываем тултип
      });
  }

  // Авторизация
  function handleLogin(evt, inputValues) {
    evt.preventDefault();
    function makeRequest() {
      return auth.signIn(inputValues).then((res) => {
        console.log('res =', res);
        if (res.token) {
          setIsLoggedIn(true);
          localStorage.setItem('token', res.token);
          checkToken(res.token)
          console.log('isLoggedIn = ', isLoggedIn);
        }
      });
    }
    handleSubmit(makeRequest);
  }

  // Проверка валидности токена
  function checkToken(jwt) {
    function makeRequest() {
      return auth.checkToken(jwt).then((res) => {
        console.log('checkToken done');
        setUserLogin(res);
        setIsLoggedIn(true);
        navigate(Paths.Home);
      });
    }
    handleSubmit(makeRequest);
  }

  // Логика выхода из профиля
  function handleExit() {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserLogin(null);
    navigate(Paths.Login);
  }

  // Логика попапа обновления профиля
  function handleEditProfileClick() {
    setOpenPopupProfile(true);
  }

  function handleEditProfileSubmit(evt, inputValues) {
    evt.preventDefault();
    function makeRequest() {
      // const jwt = localStorage.getItem('token');

      return api.updateProfile(inputValues).then(setCurrentUser);
    }
    handleSubmit(makeRequest);
  }

  // Логика попапа добавления карточки
  function handleAddPlaceClick() {
    setOpenPopupAdd(true);
  }

  function handleAddPlaceSubmit(evt, inputValues) {
    evt.preventDefault();
    function makeRequest() {
      // const jwt = localStorage.getItem('token');

      return api.postCard(inputValues).then((newCard) => {
        setCards([newCard, ...cards]);
      });
    }
    handleSubmit(makeRequest);
  }

  // Логика попапа обновления аватара
  function handleEditAvatarClick() {
    setOpenPopupAvatar(true);
  }

  function handleAvatarSubmit(evt, inputValues) {
    evt.preventDefault();
    function makeRequest() {
      // const jwt = localStorage.getItem('token');

      return api.updateAvatar(inputValues).then(setCurrentUser);
    }
    handleSubmit(makeRequest);
  }

  // Логика попапа удаления карточки
  function handleCardDelete(evt, cardData) {
    if (openPopupDelete) {
      // Если попап уже открыт
      evt.preventDefault();
      function makeRequest() {
        // const jwt = localStorage.getItem('token');

        return api.deleteCard(deletedCardId).then(() => {
          setCards((cards) => cards.filter((c) => c._id !== deletedCardId));
        });
      }
      handleSubmit(makeRequest);
    } else {
      // Открываем попап
      setOpenPopupDelete(true);
      setDeletedCardId(cardData._id);
    }
  }

  // Открытие попапа с картинкой
  function handleCardClick(evt) {
    setSelectedCard({ link: evt.target.src, name: evt.target.alt });
    setOpenPopupImage(true);
  }

  // Обработчик лайков
  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    function makeRequest() {
      // const jwt = localStorage.getItem('token');

      return api.changeLikeCardStatus(card._id, isLiked).then((newCard) => {
        setCards((state) =>
          state.map((c) => (c._id === card._id ? newCard : c))
        );
      });
    }
    handleSubmit(makeRequest);
  }

  // Закрытие всех попапов
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

  return (
    <div className="App">
      <AppContext.Provider value={{ isLoading, closeAllPopups }}>
        <LoginUserContext.Provider value={{ isLoggedIn, Paths, userLogin }}>
          <CurrentUserContext.Provider value={currentUser}>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute
                    component={Main}
                    cards={cards}
                    onEditProfile={handleEditProfileClick}
                    onAddPlace={handleAddPlaceClick}
                    onEditAvatar={handleEditAvatarClick}
                    onOpenImage={handleCardClick}
                    onDelete={handleCardDelete}
                    handleCardLike={handleCardLike}
                    handleExit={handleExit}
                  />
                }
              />

              <Route
                path={Paths.Login}
                element={<Login onSubmit={handleLogin} />}
              />

              <Route
                path={Paths.SignUp}
                element={
                  <Register
                    isOpen={openPopupInfo}
                    onSubmit={handleRegistration}
                  />
                }
              />

              <Route path="*" element={<Navigate to={Paths.Home} replace />} />
            </Routes>

            <InfoTooltip isOpen={openPopupInfo} tooltipInfo={tooltipInfo} />

            <EditProfilePopup
              isOpen={openPopupProfile}
              onSubmit={handleEditProfileSubmit}
            />

            <AddPlacePopup
              isOpen={openPopupAdd}
              onSubmit={handleAddPlaceSubmit}
            />

            <EditAvatarPopup
              isOpen={openPopupAvatar}
              onSubmit={handleAvatarSubmit}
            />

            <PopupWithForm
              isOpen={openPopupDelete}
              onSubmit={handleCardDelete}
              name="delete"
              title="Вы уверены?"
              buttonTitle="Да"
            />

            <ImagePopup card={selectedCard} isOpen={openPopupImage} />
          </CurrentUserContext.Provider>
        </LoginUserContext.Provider>
      </AppContext.Provider>
    </div>
  );
}

export default App;
