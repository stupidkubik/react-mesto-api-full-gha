import { useContext } from 'react';
import AppContext from '../contexts/AppContext.js';
import Popup from './Popup.jsx';

function PopupWithForm({
  name, // Название класса попапа
  title, // Заголовок попапа
  buttonTitle = 'Сохранить', // Название кнопки сабмита
  isOpen,
  onSubmit,
  children,
}) {
  const { isLoading } = useContext(AppContext);

  return (
    <Popup isOpen={isOpen} name={name}>
      <h2 className="popup__title">{title}</h2>

      <form
        className={`popup__form popup__form_${name}`}
        name={`${name}-form`}
        onSubmit={onSubmit}
        // noValidate
      >
        {children}
        <button className="popup__submit" type="submit">
          {isLoading ? '...' : buttonTitle}
        </button>
      </form>
    </Popup>
  );
}

export default PopupWithForm;
