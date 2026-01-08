"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PasswordInputProps extends React.ComponentProps<"input"> {
  showPassword?: boolean
  onToggle?: () => void
  hideToggle?: boolean
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showPassword: externalShowPassword, onToggle, hideToggle, ...props }, ref) => {
    const [internalShowPassword, setInternalShowPassword] = React.useState(false)

    const isVisible = externalShowPassword ?? internalShowPassword

    const toggleVisibility = () => {
      if (onToggle) {
        onToggle()
      } else {
        setInternalShowPassword(!internalShowPassword)
      }
    }

    // 👇 CHANGEMENT ICI : On garde seulement props.disabled (ex: formulaire en chargement)
    // On enlève "props.value === ''" pour que l'œil soit toujours cliquable
    const disabled = props.disabled

    return (
      <div className="relative">
        <Input
          type={isVisible ? "text" : "password"}
          className={cn("hide-password-toggle pr-10", className)}
          ref={ref}
          disabled={disabled} // L'input peut être désactivé
          {...props}
        />
        
        {!hideToggle && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            // 👇 AJOUT : z-10 pour être sûr qu'il est au dessus
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent z-10 cursor-pointer"
            onClick={toggleVisibility}
            disabled={disabled} // Le bouton suit l'état global, mais pas le contenu vide
          >
            {isVisible && !disabled ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="sr-only">
              {isVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            </span>
          </Button>
        )}

        <style>{`
          .hide-password-toggle::-ms-reveal,
          .hide-password-toggle::-ms-clear {
            visibility: hidden;
            pointer-events: none;
            display: none;
          }
        `}</style>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"