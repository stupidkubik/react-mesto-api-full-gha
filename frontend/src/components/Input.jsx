import React from "react"

const Input = (props) => {
  const {onChange, spanId, ...rest } = props

  return (
    <>
      <input 
      {...rest}
      onChange={onChange} 
      required />
      <span id={spanId} className="popup__error"></span>
    </>
  )
}

export default Input
