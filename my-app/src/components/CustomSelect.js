import { useState } from "react";

export default function CustomSelect({ value, onChange, options, label }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (newValue) => {
    onChange(newValue);
    setIsOpen(false);
  };

  const selectedLabel = options.find((opt) => opt.value === value)?.label || value;

  return (
    <div className='custom-select'>
      <label>{label}</label>
      <div className='select-container'>
        <button type='button' className='select-button' onClick={() => setIsOpen(!isOpen)}>
          {selectedLabel}
          <span className='arrow'>{isOpen ? "▲" : "▼"}</span>
        </button>
        {isOpen && (
          <ul className='options-list'>
            {options.map((option) => (
              <li key={option.value}>
                <button type='button' className='option-button' onClick={() => handleSelect(option.value)}>
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
