import React from "react";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  className?: string;
  error?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  className = "",
  error,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={name} className="font-medium text-xs md:text-sm text-gray-700">
          {label}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`border rounded px-2.5 py-1.5 md:px-3 md:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
        {...props}
      >
        <option value="" disabled>
          Selecione...
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs md:text-sm text-red-600">{error}</span>}
    </div>
  );
};

export default Select;
