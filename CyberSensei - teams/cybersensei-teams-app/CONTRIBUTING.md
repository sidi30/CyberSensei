# Guide de Contribution - CyberSensei Teams App

Merci de votre intérêt pour contribuer à CyberSensei Teams App ! 🎉

## 📋 Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Standards de code](#standards-de-code)
- [Process de Pull Request](#process-de-pull-request)
- [Conventions de nommage](#conventions-de-nommage)

## 🤝 Code de conduite

En participant à ce projet, vous acceptez de respecter notre code de conduite :

- Soyez respectueux et inclusif
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est meilleur pour la communauté
- Faites preuve d'empathie envers les autres membres

## 🚀 Comment contribuer

### Rapporter des bugs

1. Vérifiez que le bug n'a pas déjà été rapporté
2. Créez une issue avec le template "Bug Report"
3. Incluez :
   - Description claire du bug
   - Étapes pour reproduire
   - Comportement attendu vs actuel
   - Captures d'écran si applicable
   - Environnement (OS, Node version, etc.)

### Proposer des fonctionnalités

1. Créez une issue avec le template "Feature Request"
2. Décrivez la fonctionnalité et son utilité
3. Attendez les retours avant de commencer le développement

### Soumettre des modifications

1. Fork le repository
2. Créez une branche : `git checkout -b feature/ma-fonctionnalite`
3. Faites vos modifications
4. Testez vos modifications
5. Commit : `git commit -m "feat: ajoute ma fonctionnalité"`
6. Push : `git push origin feature/ma-fonctionnalite`
7. Ouvrez une Pull Request

## 📝 Standards de code

### TypeScript

- Utilisez TypeScript strict mode
- Typez toutes les variables et fonctions
- Évitez `any` autant que possible
- Documentez les interfaces et types complexes

```typescript
// ✅ Bon
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Mauvais
function getUser(id: any): any {
  // ...
}
```

### React

- Utilisez des functional components avec hooks
- Nommez les composants en PascalCase
- Utilisez TypeScript pour les props

```typescript
// ✅ Bon
interface UserCardProps {
  user: User;
  onSelect?: (user: User) => void;
}

export function UserCard({ user, onSelect }: UserCardProps) {
  // ...
}

// ❌ Mauvais
export function userCard(props: any) {
  // ...
}
```

### Hooks personnalisés

- Préfixez avec `use`
- Retournez un objet pour la flexibilité

```typescript
// ✅ Bon
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  return { user, loading, setUser };
}
```

### Styles

- Utilisez Fluent UI makeStyles
- Évitez les styles inline sauf nécessaire
- Nommez les classes en camelCase

```typescript
const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    fontSize: '24px',
  },
});
```

## 🔄 Process de Pull Request

### Avant de soumettre

- [ ] Le code compile sans erreurs
- [ ] Les tests passent (si applicable)
- [ ] Le linter ne remonte pas d'erreurs
- [ ] La documentation est à jour
- [ ] Les commits suivent la convention

### Commits

Utilisez la convention [Conventional Commits](https://www.conventionalcommits.org/) :

```
type(scope): description

[optional body]

[optional footer]
```

Types :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (ne change pas le code)
- `refactor`: Refactoring
- `test`: Ajout/modification de tests
- `chore`: Maintenance

Exemples :
```
feat(bot): ajoute commande pour afficher le score
fix(employee-tab): corrige le chargement du quiz
docs(readme): met à jour les instructions d'installation
```

### Review

- Soyez ouvert aux suggestions
- Répondez aux commentaires
- Mettez à jour votre PR selon les retours

## 🏗️ Conventions de nommage

### Fichiers

- Composants React : `PascalCase.tsx`
- Hooks : `useCamelCase.ts`
- Utilitaires : `camelCase.ts`
- Types : `types.ts` ou `interfaces.ts`
- Constantes : `UPPER_SNAKE_CASE` ou `constants.ts`

### Variables et fonctions

```typescript
// Variables : camelCase
const userName = 'John';
const isLoading = false;

// Constantes : UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRIES = 3;

// Fonctions : camelCase
function fetchUserData() {}
async function submitForm() {}

// Composants : PascalCase
function UserProfile() {}
function QuizSection() {}

// Hooks : use + PascalCase
function useAuth() {}
function useApiClient() {}
```

### Interfaces et Types

```typescript
// Interfaces : PascalCase
interface User {
  id: string;
  name: string;
}

// Types : PascalCase
type UserRole = 'USER' | 'MANAGER' | 'ADMIN';

// Props : ComponentName + Props
interface UserCardProps {
  user: User;
}
```

## 🧪 Tests

Si vous ajoutez des fonctionnalités, incluez des tests :

```typescript
describe('useAuth', () => {
  it('should return user after successful login', async () => {
    // Test implementation
  });
});
```

## 📚 Documentation

Documentez :
- Les nouvelles fonctionnalités
- Les APIs complexes
- Les configurations spéciales
- Les décisions de design importantes

Utilisez JSDoc pour les fonctions complexes :

```typescript
/**
 * Récupère les métriques pour les managers
 * @param filters - Filtres optionnels (département, topic)
 * @returns Promise avec les métriques
 * @throws {Error} Si l'utilisateur n'est pas manager
 */
async function getManagerMetrics(filters?: Filters): Promise<Metrics> {
  // ...
}
```

## 🐛 Debugging

Utilisez les outils de debug appropriés :

- Console du navigateur pour les tabs
- VS Code debugger pour le bot
- Teams Developer Tools
- Azure Application Insights en production

## 📞 Questions

Si vous avez des questions :
- Ouvrez une issue de type "Question"
- Contactez l'équipe sur le canal Teams
- Consultez la documentation existante

## 🙏 Remerciements

Merci pour vos contributions ! Chaque contribution, aussi petite soit-elle, aide à améliorer CyberSensei.

