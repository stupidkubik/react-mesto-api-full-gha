import LoginUserContext from '../contexts/LoginUserContext';
import { useContext } from 'react';
import { Navigate } from 'react-router';

const ProtectedRoute = ({ component: Component, ...props }) => {
  const { isLoggedIn, Paths } = useContext(LoginUserContext);

  return isLoggedIn ? (
    <Component {...props} />
  ) : (
    <Navigate to={Paths.Login} replace />
  );
};

export default ProtectedRoute;
