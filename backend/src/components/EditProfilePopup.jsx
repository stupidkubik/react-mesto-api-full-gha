import { useContext, useEffect } from 'react';
import CurrentUserContext from '../contexts/CurrentUserContext.js';
import useForm from '../hooks/useForm.js';
import PopupWithForm from './PopupWithForm.jsx';
import Input from './Input.jsx';

const EditProfilePopup = ({ isOpen, onSubmit }) => {
  const currentUser = useContext(CurrentUserContext);

  const { values, handleChange, setValues } = useForm({
    name: currentUser?.name ?? '',
    about: currentUser?.about ?? '',
  });

  useEffect(() => {
    setValues({
      name: currentUser?.name ?? '',
      about: currentUser?.about ?? '',
    });
  }, [currentUser, isOpen, setValues]);

  return (
    <PopupWithForm
      name={'profile'}
      title={'Редактировать профиль'}
      isOpen={isOpen}
      onSubmit={(evt) => onSubmit(evt, values)}
    >
      <Input
        id={'profile-name'}
        className={'popup__input popup__input_profile_name'}
        type={'text'}
        name={'name'}
        placeholder={'Введите своё имя'}
        minLength={'2'}
        maxLength={'40'}
        spanId={'error-profile-name'}
        value={values.name}
        onChange={handleChange}
      />

      <Input
        id={'profile-caption'}
        className={'popup__input popup__input_profile_caption'}
        type={'text'}
        name={'about'}
        placeholder={'Опишите себя'}
        minLength={'2'}
        maxLength={'200'}
        spanId={'error-profile-caption'}
        value={values.about}
        onChange={handleChange}
      />
    </PopupWithForm>
  );
};

export default EditProfilePopup;
