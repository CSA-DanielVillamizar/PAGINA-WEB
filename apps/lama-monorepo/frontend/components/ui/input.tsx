import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  success?: boolean;
}

/**
 * Input Adventure - Input con estados visuales mejorados
 * 
 * Estados:
 * - Default: border gris
 * - Focus: border amarillo neón con glow
 * - Error: border rojo con mensaje
 * - Success: border verde
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-lg border bg-secondary px-4 py-3 text-sm",
            "transition-adventure placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:border-primary focus-visible:glow-adventure-sm",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:border-destructive",
            success && "border-green-500 focus-visible:border-green-500",
            !error && !success && "border-border",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-destructive"></span>
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
