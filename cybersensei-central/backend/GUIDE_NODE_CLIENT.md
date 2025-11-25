# 🔌 Guide d'Intégration pour les Nodes CyberSensei

Ce guide explique comment intégrer un node CyberSensei avec le backend central.

## 📋 Prérequis

- Node CyberSensei déployé chez un client
- URL du backend central : `https://central.cybersensei.com` (ou votre URL)
- Clé de licence obtenue auprès de l'administrateur

## 🚀 Workflow d'Intégration

### 1. Validation de Licence au Démarrage

**Endpoint** : `GET /api/license/validate?key={LICENSE_KEY}`

**Exemple** :
```bash
curl -X GET "https://central.cybersensei.com/api/license/validate?key=A1B2C3D4-E5F6G7H8-I9J0K1L2-M3N4O5P6"
```

**Réponse (succès)** :
```json
{
  "valid": true,
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "tenantName": "Acme Corporation",
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "usageCount": 42,
  "maxUsageCount": 1000
}
```

**Réponse (erreur)** :
```json
{
  "statusCode": 400,
  "message": "Licence expirée"
}
```

**📝 Actions à effectuer** :
- ✅ Stocker le `tenantId` dans la configuration du node
- ✅ Afficher `tenantName` dans l'interface d'administration
- ✅ Surveiller `expiresAt` pour alerter avant expiration
- ✅ Bloquer le démarrage si `valid: false`

---

### 2. Vérification des Mises à Jour

**Fréquence recommandée** : Toutes les heures ou au démarrage

**Endpoint** : `GET /update/check?tenantId={TENANT_ID}&version={CURRENT_VERSION}`

**Exemple** :
```bash
curl -X GET "https://central.cybersensei.com/update/check?tenantId=550e8400-e29b-41d4-a716-446655440000&version=1.0.0"
```

**Réponse (mise à jour disponible)** :
```json
{
  "updateAvailable": true,
  "currentVersion": "1.0.0",
  "latestVersion": "1.2.0",
  "updateId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "changelog": "- Correctifs de sécurité critiques\n- Amélioration des performances IA\n- Nouveaux exercices",
  "fileSize": 52428800
}
```

**Réponse (à jour)** :
```json
{
  "updateAvailable": false,
  "currentVersion": "1.2.0",
  "latestVersion": "1.2.0",
  "updateId": null,
  "changelog": null,
  "fileSize": null
}
```

**📝 Actions à effectuer** :
- ✅ Afficher une notification dans l'interface d'administration
- ✅ Permettre le téléchargement manuel ou automatique
- ✅ Afficher le changelog à l'administrateur

---

### 3. Téléchargement d'une Mise à Jour

**Endpoint** : `GET /update/download/{UPDATE_ID}`

**Exemple** :
```bash
curl -X GET "https://central.cybersensei.com/update/download/7c9e6679-7425-40de-944b-e07fc1f90ae7" \
  -o update-1.2.0.zip
```

**Réponse** : Fichier ZIP binaire

**📝 Actions à effectuer** :
1. Télécharger le fichier ZIP
2. Vérifier l'intégrité (checksum si fourni)
3. Sauvegarder une copie de l'installation actuelle
4. Arrêter les services CyberSensei
5. Extraire le ZIP
6. Appliquer la mise à jour
7. Redémarrer les services
8. Vérifier le bon fonctionnement
9. Mettre à jour la version dans la configuration

---

### 4. Envoi de Télémétrie

**Fréquence recommandée** : Toutes les 5-10 minutes

**Endpoint** : `POST /telemetry`

**Exemple** :
```bash
curl -X POST "https://central.cybersensei.com/telemetry" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "uptime": 86400,
    "activeUsers": 42,
    "exercisesCompletedToday": 156,
    "aiLatency": 247.5,
    "version": "1.2.0",
    "additionalData": {
      "cpuUsage": 45.2,
      "memoryUsage": 62.8,
      "diskUsage": 38.1
    }
  }'
```

**Champs requis** :
- `tenantId` : ID du tenant (obtenu via validation de licence)
- `uptime` : Temps de fonctionnement en secondes
- `activeUsers` : Nombre d'utilisateurs actuellement connectés
- `exercisesCompletedToday` : Exercices complétés aujourd'hui

**Champs optionnels** :
- `aiLatency` : Latence moyenne de l'IA en millisecondes
- `version` : Version du node
- `additionalData` : Données supplémentaires (objet JSON)

**Réponse** :
```json
{
  "success": true,
  "message": "Télémétrie enregistrée avec succès",
  "timestamp": "2025-11-24T10:30:00.000Z"
}
```

---

## 🛡️ Gestion des Erreurs

### Erreur : Licence Expirée

```json
{
  "statusCode": 400,
  "message": "Licence expirée"
}
```

**Actions** :
- Afficher un message critique à l'administrateur
- Bloquer l'accès aux fonctionnalités principales
- Fournir un lien de contact pour renouvellement

### Erreur : Tenant Inactif

```json
{
  "statusCode": 400,
  "message": "Tenant inactif"
}
```

**Actions** :
- Contacter le support CyberSensei
- Le tenant a peut-être été désactivé temporairement

### Erreur : Clé de Licence Invalide

```json
{
  "statusCode": 404,
  "message": "Clé de licence invalide"
}
```

**Actions** :
- Vérifier la clé de licence
- Contacter le support si le problème persiste

---

## 💻 Exemple d'Implémentation Complète

### Python

```python
import requests
import json
import time
from datetime import datetime

class CyberSenseiClient:
    def __init__(self, backend_url, license_key):
        self.backend_url = backend_url.rstrip('/')
        self.license_key = license_key
        self.tenant_id = None
        self.current_version = "1.0.0"
    
    def validate_license(self):
        """Valider la licence au démarrage"""
        try:
            response = requests.get(
                f"{self.backend_url}/api/license/validate",
                params={"key": self.license_key},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("valid"):
                    self.tenant_id = data["tenantId"]
                    print(f"✅ Licence valide pour: {data['tenantName']}")
                    return True
            
            print(f"❌ Licence invalide: {response.json().get('message')}")
            return False
            
        except Exception as e:
            print(f"❌ Erreur de validation: {str(e)}")
            return False
    
    def check_updates(self):
        """Vérifier les mises à jour disponibles"""
        if not self.tenant_id:
            print("❌ Licence non validée")
            return None
        
        try:
            response = requests.get(
                f"{self.backend_url}/update/check",
                params={
                    "tenantId": self.tenant_id,
                    "version": self.current_version
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("updateAvailable"):
                    print(f"🔔 Mise à jour disponible: {data['latestVersion']}")
                    print(f"📝 Changelog:\n{data['changelog']}")
                    return data
                else:
                    print("✅ Version à jour")
                    return None
                    
        except Exception as e:
            print(f"❌ Erreur vérification update: {str(e)}")
            return None
    
    def download_update(self, update_id, output_path):
        """Télécharger une mise à jour"""
        try:
            response = requests.get(
                f"{self.backend_url}/update/download/{update_id}",
                stream=True,
                timeout=300
            )
            
            if response.status_code == 200:
                with open(output_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                print(f"✅ Mise à jour téléchargée: {output_path}")
                return True
            
            return False
            
        except Exception as e:
            print(f"❌ Erreur téléchargement: {str(e)}")
            return False
    
    def send_telemetry(self, metrics):
        """Envoyer de la télémétrie"""
        if not self.tenant_id:
            print("❌ Licence non validée")
            return False
        
        try:
            payload = {
                "tenantId": self.tenant_id,
                "uptime": metrics["uptime"],
                "activeUsers": metrics["active_users"],
                "exercisesCompletedToday": metrics["exercises_completed"],
                "aiLatency": metrics.get("ai_latency"),
                "version": self.current_version,
                "additionalData": metrics.get("additional_data", {})
            }
            
            response = requests.post(
                f"{self.backend_url}/telemetry",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 201:
                print("✅ Télémétrie envoyée")
                return True
            
            print(f"❌ Erreur télémétrie: {response.status_code}")
            return False
            
        except Exception as e:
            print(f"❌ Erreur envoi télémétrie: {str(e)}")
            return False
    
    def start_telemetry_loop(self, interval=300):
        """Boucle d'envoi de télémétrie (toutes les 5 minutes par défaut)"""
        while True:
            metrics = self.collect_metrics()
            self.send_telemetry(metrics)
            time.sleep(interval)
    
    def collect_metrics(self):
        """Collecter les métriques du système (à implémenter)"""
        return {
            "uptime": int(time.time()),  # À remplacer par le vrai uptime
            "active_users": 42,  # À remplacer
            "exercises_completed": 156,  # À remplacer
            "ai_latency": 247.5,  # À remplacer
            "additional_data": {
                "cpu": 45.2,
                "memory": 62.8
            }
        }

# Utilisation
if __name__ == "__main__":
    client = CyberSenseiClient(
        backend_url="https://central.cybersensei.com",
        license_key="A1B2C3D4-E5F6G7H8-I9J0K1L2-M3N4O5P6"
    )
    
    # 1. Valider la licence
    if not client.validate_license():
        print("❌ Impossible de démarrer sans licence valide")
        exit(1)
    
    # 2. Vérifier les mises à jour
    update = client.check_updates()
    if update:
        user_input = input("Télécharger la mise à jour ? (o/n): ")
        if user_input.lower() == 'o':
            client.download_update(update["updateId"], "update.zip")
    
    # 3. Démarrer la boucle de télémétrie
    print("🚀 Démarrage de la télémétrie...")
    client.start_telemetry_loop(interval=300)  # Toutes les 5 minutes
```

---

## 🔐 Sécurité

### Bonnes Pratiques

1. **Stockage Sécurisé** : Ne stockez jamais la clé de licence en clair dans le code
2. **HTTPS Only** : Utilisez toujours HTTPS pour communiquer avec le backend
3. **Timeout** : Configurez des timeouts pour éviter les blocages
4. **Retry Logic** : Implémentez une logique de retry pour les erreurs réseau
5. **Logging** : Loggez toutes les communications pour le débogage

### Configuration Recommandée

```json
{
  "backend": {
    "url": "https://central.cybersensei.com",
    "timeout": 30,
    "retry_attempts": 3,
    "retry_delay": 5
  },
  "telemetry": {
    "interval": 300,
    "enabled": true
  },
  "updates": {
    "check_interval": 3600,
    "auto_download": false,
    "auto_install": false
  }
}
```

---

## 📞 Support

Pour toute question sur l'intégration, contactez :
- **Email** : support@cybersensei.com
- **Documentation API** : https://central.cybersensei.com/api

---

**✅ Votre node est maintenant prêt à communiquer avec le backend central !**

