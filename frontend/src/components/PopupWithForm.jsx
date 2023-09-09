import React from "react"
import AppContext from "../contexts/AppContext.js"
import usePopupClose from "../hooks/usePopupClose.js"

function PopupWithForm({ 
	name, // Название класса попапа
	title, // Заголовок попапа
	buttonTitle = 'Сохранить', // Название кнопки сабмита
	onSubmit,
	isOpen,
	children
	}) {

	const { isLoading, closeAllPopups } = React.useContext(AppContext)

	usePopupClose(isOpen, closeAllPopups)

	return (
		<div className={`popup popup_type_${name} ${isOpen ? 'popup_opened' : ''}`}>
			<div className="popup__container">
				<h2 className="popup__title">{title}</h2>

				<button className="popup__close"
				type="button" 
				aria-label="Закрыть окно"
				onClick={closeAllPopups}>
				</button>

				<form 
				className={`popup__form popup__form_${name}`} 
				name={`${name}-form`} 
				onSubmit={onSubmit} 
				// noValidate
				>
					{children}
					<button className="popup__submit" type="submit">{isLoading ? '...' : buttonTitle}</button>
				</form>
			</div>
		</div>
	)
}

export default PopupWithForm