import { useContext, useEffect, useState } from 'react';
import logo from '../images/logo/logo-white.svg';
import { Link } from 'react-router-dom';
import LoginUserContext from '../contexts/LoginUserContext.js';

function Header({ name, link, handleExit }) {
  const { Paths } = useContext(LoginUserContext);
  const [mobileView, setMobileView] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  // Функция открытия бургер-меню
  function toggleMenu() {
    setMenuIsOpen(!menuIsOpen);
  }

  // Определяем размер экрана и меняем бругер-меню
  function changeView() {
    const screenWidth = window.innerWidth;

    if (screenWidth < 767) {
      setMobileView(true);
    } else setMobileView(false);
  }

  useEffect(() => {
    changeView();
    window.addEventListener('resize', changeView);

    return () => {
      window.removeEventListener('resize', changeView);
    };
  }, []);

  return (
    <header
      className={`header App__header ${menuIsOpen ? 'header_opened' : ''}`}
    >
      <Link to="/">
        <img className="header__logo" src={logo} alt="Логотип" />
      </Link>

      {link ? (
        <Link className="header__link" to={link}>
          {name}
        </Link>
      ) : (
        <>
          <div className={mobileView ? 'header__menu_hidden' : 'header__menu'}>
            <div className="header__email">{name}</div>
            <Link
              className="header__exit"
              type="button"
              onClick={handleExit}
              to={Paths.Login}
            >
              Выйти
            </Link>
          </div>

          <button
            className={
              mobileView
                ? `${
                    menuIsOpen
                      ? 'header__burger-menu_opened'
                      : 'header__burger-menu'
                  }`
                : 'header__burger-menu_hidden'
            }
            type="button"
            onClick={toggleMenu}
          />
        </>
      )}
    </header>
  );
}

export default Header;
