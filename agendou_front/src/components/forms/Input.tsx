import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
  className?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  onInput,
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

      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onInput={onInput}
        className={`border rounded px-2.5 py-1.5 md:px-3 md:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base ${error ? "border-red-500" : "border-gray-300"} ${className}`}
        {...props}
      />
      {error && <span className="text-xs md:text-sm text-red-600">{error}</span>}
    </div>
  );
};

export default Input;
