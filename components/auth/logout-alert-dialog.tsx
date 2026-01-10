import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
// 👇 On importe le bouton de la sidebar ici
import { SidebarMenuButton } from "@/components/ui/sidebar" 
import { LogOut } from "lucide-react"
import { logout } from "@/app/actions/auth"

export function LogoutAlertDialog() {
  return (
    <AlertDialog>
      {/* 👇 asChild dit : "N'affiche pas ton bouton par défaut, utilise mon enfant" */}
      <AlertDialogTrigger asChild>
        <SidebarMenuButton variant="outline" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4 text-red-500"/>
            <span className="text-red-500">Se déconnecter</span>
        </SidebarMenuButton>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action vous déconnectera de votre session actuelle.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          {/* 👇 On attache l'action serveur ici */}
          <AlertDialogAction onClick={() => logout()} className="bg-red-600 hover:bg-red-700">
            Se déconnecter
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}