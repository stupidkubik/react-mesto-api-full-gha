import React from "react"
import useForm from "../hooks/useForm.js"
import PopupWithForm from "./PopupWithForm.jsx"
import Input from "./Input.jsx"

const AddPlacePopup = ({ isOpen, onSubmit }) => {
	const {values, handleChange, setValues} = useForm({ title: '', link: '' })

	React.useEffect(() => {
		setValues({ title: '', link: '' })
	}, [isOpen, setValues]);

  return (
		<PopupWithForm 
		name={'add'} 
		title={'Новое место'} 
		buttonTitle={'Создать'} 
		isOpen={isOpen} 
		onSubmit={(evt) => onSubmit(evt, values)}>

			<Input
			id={"card-name"} 
			className={"popup__input popup__input_card_name"} 
			type={"text"} 
			name={"title"} 
			placeholder={"Название"} 
			minLength={"2"} 
			maxLength={"30"} 
			spanId={"error-card-name"}
			value={values.title} 
			onChange={handleChange} 
			/>

			<Input
			id={"card-link"} 
			className={"popup__input popup__input_card_link"} 
			type={"url"} 
			name={"link"} 
			placeholder={"Ссылка на картинку"} 
			spanId={"error-card-link"}
			value={values.link} 
			onChange={handleChange} 
			/>
		</PopupWithForm>
	)
}

export default AddPlacePopup
