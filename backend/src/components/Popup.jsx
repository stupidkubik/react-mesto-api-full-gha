import { useEffect, useContext } from 'react';
import AppContext from '../contexts/AppContext.js';
// создаем отдельный компонент `Popup` для обертки любых попапов
const Popup = ({ isOpen, name, children }) => {
  const { closeAllPopups } = useContext(AppContext);
  // внутри указываем `useEffect` для обработчика `Escape`
  useEffect(() => {
    // ограничиваем навешивание обработчика: если не открыт, то не нужно навешивать
    if (!isOpen) return;
    // объявляем внутри `useEffect` функцию, чтобы она не теряла ссылку при перерисовке компонента
    const closeByEscape = (e) => {
      if (e.key === 'Escape') {
        closeAllPopups();
      }
    };

    document.addEventListener('keydown', closeByEscape);
    // обязательно удаляем обработчик в `clean-up` функции
    return () => document.removeEventListener('keydown', closeByEscape);
    // обязательно следим за `isOpen`, чтобы срабатывало только при открытии, а не всегда
  }, [isOpen, closeAllPopups]);

  // создаем обработчик оверлея
  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) {
      closeAllPopups();
    }
  };

  // внутри верстка обертки любого попапа с классом `popup` и добавлением `popup_opened`.
  return (
    <div
      className={`popup ${isOpen ? 'popup_opened' : ''} popup_type_${name}`}
      // добавляем обработчик оверлея
      onClick={handleOverlay}
    >
      {/* добавляем контейнер для контента попапа с возможностью изменения типа, чтобы ImagePopup можно было сделать с другими размерами */}
      <div
        className={
          name === 'image' ? 'popup__container_type_image' : 'popup__container'
        }
      >
        {/* тут может быть любой контент попапа в `children`: хоть для попапа картинки, хоть для `InfoToolTip`, 
        хоть для `PopupWithForm` */}
        {children}
        {/* кнопка крестика есть у любого попапа */}
        <button
          className="popup__close"
          type="button"
          onClick={closeAllPopups}
          aria-label="Закрыть окно"
        />
      </div>
    </div>
  );
};

export default Popup;
