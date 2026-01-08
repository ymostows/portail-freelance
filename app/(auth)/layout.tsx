interface AuthLayoutProps {
    children: React.ReactNode
  }
  
  export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
      <div className="flex justify-center bg-muted/50">
        {/* Ici, on pourrait ajouter une Navbar simplifiée (juste le logo par exemple)
           qui apparaîtrait sur le Login ET le Register sans copier-coller le code.
        */}
        {children}
      </div>
    )
  }