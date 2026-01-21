# 🎯 Guide d'Utilisation - Interface Freelancer

## 📍 Flux d'utilisation complet

### Étape 1 : Création de la roadmap (État DRAFT)

```
┌─ Mon Projet ──────────────────────────┐
│                                       │
│ Créez votre roadmap...                │
├─────────────────────────────────────── │
│ + Ajouter un jalon                   │
│ + Régénérer                          │
│                                       │
│ Jalon 1: Maquettes                  │
│ ├─ Description: Design initial      │
│ └─ Durée: 5 jours                   │
│                                       │
│ Jalon 2: Design UI                  │
│ ├─ Description: Interface          │
│ └─ Durée: 7 jours                  │
│                                       │
│ Jalon 3: Développement             │
│ └─ Durée: 14 jours                 │
│                                       │
└─ [Valider et Activer le Projet] ─────┘
```

**Actions disponibles :**
- Ajouter/supprimer des jalons
- Réorganiser (drag & drop)
- Éditer titre, description, durée
- Valider la roadmap

---

### Étape 2 : Activation du projet (État ACTIVE)

Une fois validée, la roadmap devient active et le projet passe en état `ACTIVE`.

```
┌─ Avancement ────────────── 0% ───────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                      │
│ À faire│En cours│Complétées        │
│   3    │  0     │    0             │
│                                      │
│ 🕐 Prochaine                        │
│ Étape 1 • Maquettes         [Démarrer]
│                                      │
│ ┌─ Etape 1: Maquettes ──────────────┐
│ │ [▶ Démarrer]  ← ACTIVE BUTTON   │
│ │ Design initial, Durée: 5 jours   │
│ └────────────────────────────────────┘
│                                      │
│ ┌─ Etape 2: Design UI ──────────────┐
│ │ [▶ Démarrer]                      │
│ │ Interface, Durée: 7 jours        │
│ └────────────────────────────────────┘
│                                      │
│ ┌─ Etape 3: Développement ─────────┐
│ │ [▶ Démarrer]                      │
│ │ Durée: 14 jours                  │
│ └────────────────────────────────────┘
└────────────────────────────────────────┘
```

**État :** PENDING (attendant)

---

### Étape 3 : Démarrer une étape

Cliquez sur `[▶ Démarrer]` pour commencer une étape.

```
┌─ Avancement ────────────── 0% ───────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                      │
│ À faire│En cours│Complétées        │
│   2    │  1     │    0             │
│                                      │
│ ● En cours                          │ ← Indicateur pulse!
│ Étape 1 • Maquettes                │
│                                      │
│ ┌─ Etape 1: Maquettes ──────────────┐
│ │ [→ Soumettre] ← ANIMÉ PULSE!    │
│ │ Design initial, Durée: 5 jours   │
│ │ 🟠 EN COURS                       │
│ └────────────────────────────────────┘
│                                      │
│ ┌─ Etape 2: Design UI ──────────────┐
│ │ [▶ Démarrer]                      │
│ │ Interface, Durée: 7 jours        │
│ └────────────────────────────────────┘
│                                      │
└────────────────────────────────────────┘
```

**État :** IN_PROGRESS (en cours)
- Le bouton devient orange + pulse
- L'étape s'entoure d'une ring orange
- Le compteur "En cours" augmente
- Indicateur pulse visible en haut

---

### Étape 4 : Soumettre pour validation

Cliquez sur `[→ Soumettre]` quand le travail est terminé.

```
┌─ Avancement ────────────── 0% ───────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                      │
│ À faire│En cours│Complétées        │
│   2    │  0     │    0             │
│                                      │
│ ● En cours                          │
│ Étape 1 • Maquettes                │
│                                      │
│ ┌─ Etape 1: Maquettes ──────────────┐
│ │ [✓ Valider] ← VERT !            │
│ │ Design initial, Durée: 5 jours   │
│ │ 🟠 EN ATTENTE DE VALIDATION      │
│ └────────────────────────────────────┘
│                                      │
│ ┌─ Etape 2: Design UI ──────────────┐
│ │ [▶ Démarrer]                      │
│ │ Interface, Durée: 7 jours        │
│ └────────────────────────────────────┘
│                                      │
└────────────────────────────────────────┘
```

**État :** AWAITING_APPROVAL (en attente)
- Le bouton devient vert
- L'étape passe en "En attente de validation"

---

### Étape 5 : Valider l'étape

Cliquez sur `[✓ Valider]` pour valider l'étape complètement.

```
┌─ Avancement ────────────── 33% ──────┐
│ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                      │
│ À faire│En cours│Complétées        │
│   2    │  0     │    1             │
│                                      │
│ 🕐 Prochaine                        │
│ Étape 2 • Design UI         [Démarrer]
│                                      │
│ ┌─ Etape 1: Maquettes ──────────────┐
│ │ ✓ Complétée                       │
│ │ Design initial, Durée: 5 jours   │
│ │ 🟢 COMPLÉTÉE (opacité réduite)   │
│ └────────────────────────────────────┘
│                                      │
│ ┌─ Etape 2: Design UI ──────────────┐
│ │ [▶ Démarrer]                      │
│ │ Interface, Durée: 7 jours        │
│ └────────────────────────────────────┘
│                                      │
│ ┌─ Etape 3: Développement ─────────┐
│ │ [▶ Démarrer]                      │
│ │ Durée: 14 jours                  │
│ └────────────────────────────────────┘
└────────────────────────────────────────┘
```

**État :** COMPLETED (complétée)
- Affiche badge "✓ Complétée"
- Barre de progression augmente (33%)
- Compteur "Complétées" augmente
- Prochaine étape identifiée automatiquement

---

### Étape 6 : Progression complète

Répétez les étapes 3-5 pour chaque jalon. À la fin :

```
┌─ Avancement ────────────── 100% ─────┐
│ ████████████████████████████████████  │
│                                      │
│ À faire│En cours│Complétées        │
│   0    │  0     │    3             │
│                                      │
│ 🎉 Projet complété 🎉               │
│ Toutes les étapes validées !        │
│                                      │
│ ┌─ Etape 1: Maquettes ──────────────┐
│ │ ✓ Complétée                       │
│ │ Design initial, Durée: 5 jours   │
│ └────────────────────────────────────┘
│                                      │
│ ┌─ Etape 2: Design UI ──────────────┐
│ │ ✓ Complétée                       │
│ │ Interface, Durée: 7 jours        │
│ └────────────────────────────────────┘
│                                      │
│ ┌─ Etape 3: Développement ─────────┐
│ │ ✓ Complétée                       │
│ │ Durée: 14 jours                  │
│ └────────────────────────────────────┘
└────────────────────────────────────────┘
```

**État :** COMPLETED (projet terminé)
- Barre à 100%
- Message de complétion animé
- Toutes les étapes affichent le badge
- Opacité réduite pour les étapes (terminé)

---

## 🎨 Légende des couleurs et symboles

### Boutons d'action
```
[▶ Démarrer]      → Bleu, action suivante
[→ Soumettre]     → Orange (pulse), en cours
[✓ Valider]       → Vert, validation finale
✓ Complétée       → Badge vert, état final
```

### Indicateurs d'étape
```
À faire    → 3   (Bleu 50)
En cours   → 1   (Orange 50, scale-up)
Complétées → 0   (Vert 50)
```

### Étapes sur la timeline
```
🕐          → Prochaine étape à venir
●           → Étape en cours (pulsant orange)
✓           → Étape complétée (vert)
```

### Anneaux des cartes
```
Normal (PENDING)      → Pas de ring spécial
Orange ring (IN_PROG) → ring-2 ring-orange-500/40
Vert ring (COMPLETED) → opacity-75, ring vert
```

---

## 🔄 Flux des états

```
PENDING
   ↓ [▶ Démarrer]
IN_PROGRESS (Pulse animation)
   ↓ [→ Soumettre]
AWAITING_APPROVAL
   ↓ [✓ Valider]
COMPLETED (Badge vert, opacité)

Si client refuse:
COMPLETED → IN_PROGRESS (éditer et renvoyer)
```

---

## ⚡ Animations en action

### 1. Point indicateur
Pulse continu quand un projet est en cours
```
✓ Visible au haut du composant ProjectProgress
✓ Orange/Amber
✓ Animation 2s (cycle pulse)
```

### 2. Étape en cours
Card s'entoure d'une ring orange avec glow
```
✓ Ring: 2px, orange-500/40
✓ Shadow: orange-500/10
✓ Scale: 1.01 au survol
✓ Animation pulse sur le bouton
```

### 3. Progression
Barre se remplit progressivement
```
✓ Transition: 700ms ease-in-out
✓ Couleur: Bleu → Orange → Vert selon avancement
```

### 4. Complétion
Message d'apparition avec animation slide
```
✓ Fade-in + slide-in from bottom
✓ 0.3s ease-out
```

---

## 💡 Tips d'utilisation

1. **Drag & Drop** : Réorganisez les étapes avant de valider
2. **Édition inline** : Cliquez sur n'importe quel texte pour éditer
3. **Observez les indicateurs** : Point pulsant = étape active
4. **Utilisez les durées** : Aidez le client à comprendre la timeline
5. **Validez régulièrement** : Gardez le client informé de la progression

---

## 🚀 Barre de progression visuelle

```
À faire              En cours           Complétées
  ├─────────┼─────────────┼─────────────┤
  3         1             0    → 0% rempli

À faire              En cours           Complétées
  ├─────────┼─────────────┼─────────────┤
  2         1             0    → 33% rempli

À faire              En cours           Complétées
  ├─────────┼─────────────┼─────────────┤
  1         1             1    → 67% rempli

À faire              En cours           Complétées
  ├─────────┼─────────────┼─────────────┤
  0         0             3    → 100% rempli ✓
```

---

**Version** : 1.0  
**Date** : Janvier 2026  
**Interface** : Freelancer Dashboard  
**Statut** : ✅ Opérationnel
