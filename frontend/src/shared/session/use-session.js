import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import apiClient from '../api/client.js';
import APP_PATHS from '../../app/paths.js';

const TOKEN_STORAGE_KEY = 'token';

function useSession({ navigate, setIsLoading, closeAllPopups }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLogin, setUserLogin] = useState(null);
  const location = useLocation();

  function runSessionRequest(request) {
    setIsLoading(true);

    return request()
      .then((result) => {
        closeAllPopups();
        return result;
      })
      .finally(() => setIsLoading(false));
  }

  function establishSession(token) {
    return apiClient.checkToken(token).then((userData) => {
      setUserLogin(userData);
      setIsLoggedIn(true);
      navigate(APP_PATHS.Home);

      return userData;
    });
  }

  function checkToken(token) {
    return runSessionRequest(() => establishSession(token));
  }

  function handleRegistration(evt, inputValues, callbacks = {}) {
    const {
      onSuccess = () => {},
      onError = () => {},
      onFinally = () => {},
    } = callbacks;

    evt.preventDefault();
    setIsLoading(true);

    apiClient
      .signUp(inputValues)
      .then((registrationData) => {
        setUserLogin(registrationData);
        navigate(APP_PATHS.Login);
        onSuccess(registrationData);
      })
      .catch((err) => {
        onError(err);
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
        onFinally();
      });
  }

  function handleLogin(evt, inputValues) {
    evt.preventDefault();

    return runSessionRequest(() =>
      apiClient.signIn(inputValues).then((res) => {
        if (res.token) {
          localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
          return establishSession(res.token);
        }

        return res;
      })
    ).catch(console.error);
  }

  function handleExit() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setIsLoggedIn(false);
    setUserLogin(null);
    navigate(APP_PATHS.Login);
  }

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (token) {
      checkToken(token).catch(console.error);
    } else if (location.pathname === APP_PATHS.Home) {
      navigate(APP_PATHS.Login);
    }
  }, [location.pathname]);

  return {
    Paths: APP_PATHS,
    checkToken,
    handleExit,
    handleLogin,
    handleRegistration,
    isLoggedIn,
    userLogin,
  };
}

export default useSession;
