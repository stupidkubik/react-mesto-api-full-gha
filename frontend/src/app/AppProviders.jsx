import AppContext from '../contexts/AppContext.js';
import CurrentUserContext from '../contexts/CurrentUserContext.js';
import LoginUserContext from '../contexts/LoginUserContext.js';

function AppProviders({
  children,
  closeAllPopups,
  currentUser,
  isLoading,
  isLoggedIn,
  paths,
  userLogin,
}) {
  return (
    <AppContext.Provider value={{ isLoading, closeAllPopups }}>
      <LoginUserContext.Provider
        value={{ isLoggedIn, Paths: paths, userLogin }}
      >
        <CurrentUserContext.Provider value={currentUser}>
          {children}
        </CurrentUserContext.Provider>
      </LoginUserContext.Provider>
    </AppContext.Provider>
  );
}

export default AppProviders;
