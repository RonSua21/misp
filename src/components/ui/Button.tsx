"use client";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const sizeMap = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3 text-base",
};

const variantMap = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger:
    "inline-flex items-center justify-center gap-2 bg-red-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-red-700 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${variantMap[variant]} ${sizeMap[size]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
