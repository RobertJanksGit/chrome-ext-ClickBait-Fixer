import React from "react";

const ToggleButton = ({ checked, onChange, label }) => {
  return (
    <div className="toggle-container">
      <input
        type="checkbox"
        className="toggle-input"
        checked={checked}
        onChange={onChange}
        id={label}
      />
      <label className="toggle-label" htmlFor={label}></label>
    </div>
  );
};

export default ToggleButton;
