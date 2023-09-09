import { useEffect } from 'react';
import useForm from '../hooks/useForm.js';
import PopupWithForm from './PopupWithForm.jsx';
import Input from './Input.jsx';

const EditAvatarPopup = ({ isOpen, onSubmit }) => {
  const { values, handleChange, setValues } = useForm({ avatar: '' });

  useEffect(() => {
    setValues({ avatar: '' });
  }, [isOpen, setValues]);

  return (
    <PopupWithForm
      name={'avatar'}
      title={'Обновить аватар'}
      isOpen={isOpen}
      onSubmit={(evt) => onSubmit(evt, values)}
    >
      <Input
        id={'avatar-link'}
        className={'popup__input popup__input_avatar-link'}
        type={'url'}
        name={'avatar'}
        placeholder={'Ссылка на новый аватар'}
        minLength={'2'}
        maxLength={'100'}
        spanId={'error-avatar-link'}
        value={values.avatar}
        onChange={handleChange}
      />
    </PopupWithForm>
  );
};

export default EditAvatarPopup;
