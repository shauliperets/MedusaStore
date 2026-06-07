import { Input as UiInput, Label } from "@modules/common/components/ui"
import React, { useEffect, useImperativeHandle, useState } from "react"
import { Eye, EyeOff } from "lucide-react"

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  name: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type, name, label, required, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [inputType, setInputType] = useState(type)

    useEffect(() => {
      if (type === "password" && showPassword) {
        setInputType("text")
      }
      if (type === "password" && !showPassword) {
        setInputType("password")
      }
    }, [type, showPassword])

    useImperativeHandle(ref, () => inputRef.current!)

    return (
      <div className="flex flex-col w-full gap-y-2">
        <Label htmlFor={name} className="text-sm">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </Label>
        <div className="relative">
          <UiInput
            type={inputType}
            name={name}
            required={required}
            {...props}
            ref={inputRef}
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          )}
        </div>
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
