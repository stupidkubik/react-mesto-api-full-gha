import logo from '../images/logo/logo-white.svg'

function Header() {
  return (
    <header className="header App__header">
      <img className="header__logo" 
      src={logo} 
      alt="Логотип" />
    </header>
  )
}

export default Header