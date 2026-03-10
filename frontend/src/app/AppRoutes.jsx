import { Navigate, Route, Routes } from 'react-router';
import Main from '../components/Main.jsx';
import Login from '../components/Login.jsx';
import Register from '../components/Register.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

function AppRoutes({
  cards,
  handleCardLike,
  handleExit,
  onAddPlace,
  onDelete,
  onEditAvatar,
  onEditProfile,
  onLogin,
  onOpenImage,
  onRegister,
  openPopupInfo,
  paths,
}) {
  return (
    <Routes>
      <Route
        path={paths.Home}
        element={
          <ProtectedRoute
            component={Main}
            cards={cards}
            onEditProfile={onEditProfile}
            onAddPlace={onAddPlace}
            onEditAvatar={onEditAvatar}
            onOpenImage={onOpenImage}
            onDelete={onDelete}
            handleCardLike={handleCardLike}
            handleExit={handleExit}
          />
        }
      />

      <Route path={paths.Login} element={<Login onSubmit={onLogin} />} />

      <Route
        path={paths.SignUp}
        element={<Register isOpen={openPopupInfo} onSubmit={onRegister} />}
      />

      <Route path="*" element={<Navigate to={paths.Home} replace />} />
    </Routes>
  );
}

export default AppRoutes;
