import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const PasswordInput = ({
  value,
  onChange,
  placeholder = "Password",
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={showPassword ? "text" : "password"}
        className="w-full rounded border p-2 pr-11"
      />

      <button
        type="button"
        onClick={() => setShowPassword((value) => !value)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};