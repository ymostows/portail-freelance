# Test des Couleurs Tailwind v4

## Classes à tester

Ouvrez `http://localhost:3000/dashboard` et vérifiez :

### ✅ Ce qui devrait être visible :

1. **Header** :
   - Fond blanc/noir selon le mode
   - Texte noir/blanc

2. **Sidebar** :
   - Fond gris clair (light mode) / gris foncé (dark mode)
   - Bouton "F" avec fond bleu indigo (primary)
   - Items de menu avec hover bleu clair

3. **Cards** :
   - Fond blanc avec bordure grise
   - Texte "Revenus totaux", "Projets actifs", "Clients" en noir
   - Fond gris clair pour les cards (`bg-muted/50`)

4. **Boutons** (si présents) :
   - Bouton primary : fond bleu indigo, texte blanc
   - Bouton secondary : fond gris clair, texte noir

### 🔧 Si tout est noir/blanc :

Cela signifie que Tailwind v4 ne génère pas les classes de couleur correctement.

## Solution de debug

1. Vérifiez dans le navigateur (F12) → Elements
2. Regardez les styles appliqués sur un élément avec `bg-primary`
3. Si `bg-primary` n'est pas trouvé ou = transparent, c'est un problème de config Tailwind
