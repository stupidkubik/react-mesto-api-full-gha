import { useState } from 'react';
import apiClient from '../../shared/api/client.js';

function useProfile({ submitRequest }) {
  const [currentUser, setCurrentUser] = useState(null);

  function loadCurrentUser() {
    return apiClient.getUserInfo().then((user) => {
      setCurrentUser(user);
      return user;
    });
  }

  function handleEditProfileSubmit(evt, inputValues) {
    evt.preventDefault();

    return submitRequest(() =>
      apiClient.updateProfile(inputValues).then((user) => {
        setCurrentUser(user);
        return user;
      })
    );
  }

  function handleAvatarSubmit(evt, inputValues) {
    evt.preventDefault();

    return submitRequest(() =>
      apiClient.updateAvatar(inputValues).then((user) => {
        setCurrentUser(user);
        return user;
      })
    );
  }

  return {
    currentUser,
    handleAvatarSubmit,
    handleEditProfileSubmit,
    loadCurrentUser,
  };
}

export default useProfile;
