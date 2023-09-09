import React from "react"

const usePopupClose = (isOpen, closePopup) => {

  React.useEffect(() => {
    if (!isOpen) return // останавливаем действие эффекта, если попап закрыт

    const handleOverlay = (evt) => {
      // если есть `popup_opened` в классах блока, значит, кликнули на оверлей
      if (evt.target.classList.contains("popup_opened")) {
        closePopup()
      }
    }

    const handleEscape = (evt) => {
      if (evt.key === "Escape") {
        closePopup()
      }
    }

    document.addEventListener("keydown", handleEscape)
    document.addEventListener("mousedown", handleOverlay)

    //  обязательно удаляем обработчики в `clean-up`- функции
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleOverlay)
    }
    // обязательно следим за `isOpen`, чтобы срабатывало только при открытии, а не при любой перерисовке компонента
  }, [isOpen, closePopup])
}

export default usePopupClose
