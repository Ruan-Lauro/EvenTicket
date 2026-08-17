
type InputProps = {
  type?: string;
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  label?: string;
  name: string;
  value?: string;
  hasError?: boolean;
  className?: string;
  autoComplete?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
};

export default function Input({
  type = "text",
  placeholder = "Digite aqui...",
  onChange,
  required = false,
  label,
  name,
  value,
  hasError = false,
  className = "",
  autoComplete,
  min,
  max,
  step,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[14px] font-bold" htmlFor={name}>
          {label}
        </label>
      )}
      <input
        name={name}
        id={name}
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
        className={`border p-1.5 rounded-sm outline-none transition-colors ${
          hasError ? "border-red-500 bg-red-50 text-red-700" : "border-black/10"
        } ${className}`}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
        autoComplete={autoComplete}
      />
    </div>
  );
}