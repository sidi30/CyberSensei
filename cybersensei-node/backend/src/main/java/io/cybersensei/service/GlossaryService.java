package io.cybersensei.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service de glossaire cybersécurité
 * Fournit les définitions, exemples et termes liés
 */
@Service
public class GlossaryService {

    private final Map<String, GlossaryEntry> glossary = new HashMap<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GlossaryEntry {
        private String term;
        private String definition;
        private String example;
        private String category;
        private List<String> relatedTerms;
        private List<String> aliases;
    }

    @PostConstruct
    public void initGlossary() {
        // Menaces et attaques
        addEntry("phishing", GlossaryEntry.builder()
                .term("phishing")
                .definition("Le phishing (hameçonnage) est une technique d'escroquerie qui consiste à envoyer des emails ou messages frauduleux imitant des organismes légitimes pour voler des informations personnelles (mots de passe, numéros de carte bancaire, etc.).")
                .example("Un email prétendant venir de votre banque vous demandant de 'vérifier votre compte' en cliquant sur un lien suspect.")
                .category("threats")
                .relatedTerms(List.of("spear_phishing", "vishing", "smishing", "social_engineering"))
                .aliases(List.of("hameçonnage", "hameconnage"))
                .build());

        addEntry("ransomware", GlossaryEntry.builder()
                .term("ransomware")
                .definition("Un ransomware (rançongiciel) est un logiciel malveillant qui chiffre les fichiers d'un ordinateur et exige une rançon pour les déchiffrer. C'est l'une des menaces les plus dévastatrices pour les entreprises.")
                .example("WannaCry, NotPetya, Ryuk sont des ransomwares célèbres qui ont paralysé des milliers d'entreprises.")
                .category("threats")
                .relatedTerms(List.of("malware", "encryption", "backup"))
                .aliases(List.of("rançongiciel", "rancongiciel"))
                .build());

        addEntry("malware", GlossaryEntry.builder()
                .term("malware")
                .definition("Un malware (logiciel malveillant) est tout programme conçu pour nuire à un système informatique : virus, vers, trojans, spyware, ransomware, etc.")
                .example("Un fichier .exe téléchargé depuis un site non fiable qui installe secrètement un programme espion.")
                .category("threats")
                .relatedTerms(List.of("virus", "trojan", "spyware", "ransomware"))
                .aliases(List.of("logiciel malveillant"))
                .build());

        addEntry("social_engineering", GlossaryEntry.builder()
                .term("social_engineering")
                .definition("L'ingénierie sociale est l'art de manipuler les personnes pour qu'elles divulguent des informations confidentielles ou effectuent des actions compromettantes. Elle exploite la psychologie humaine plutôt que les failles techniques.")
                .example("Un 'technicien IT' appelle un employé et lui demande son mot de passe pour 'résoudre un problème urgent'.")
                .category("threats")
                .relatedTerms(List.of("phishing", "pretexting", "baiting"))
                .aliases(List.of("ingénierie sociale", "ingenierie sociale"))
                .build());

        addEntry("ddos", GlossaryEntry.builder()
                .term("ddos")
                .definition("Une attaque DDoS (Distributed Denial of Service) consiste à submerger un serveur ou un réseau avec un trafic massif provenant de multiples sources, le rendant indisponible pour les utilisateurs légitimes.")
                .example("Des milliers d'ordinateurs infectés envoient simultanément des requêtes à un site web, le faisant tomber.")
                .category("threats")
                .relatedTerms(List.of("botnet", "dos"))
                .aliases(List.of("déni de service", "denial of service"))
                .build());

        addEntry("brute_force", GlossaryEntry.builder()
                .term("brute_force")
                .definition("Une attaque par force brute consiste à tester systématiquement toutes les combinaisons possibles de mots de passe jusqu'à trouver le bon. Plus le mot de passe est court et simple, plus l'attaque est rapide.")
                .example("Un attaquant teste 'password1', 'password2', 'password3'... jusqu'à trouver le bon mot de passe.")
                .category("threats")
                .relatedTerms(List.of("password", "dictionary_attack", "credential_stuffing"))
                .aliases(List.of("force brute"))
                .build());

        addEntry("sql_injection", GlossaryEntry.builder()
                .term("sql_injection")
                .definition("L'injection SQL est une technique d'attaque qui exploite les failles dans les applications web pour exécuter des commandes SQL malveillantes sur la base de données, permettant de voler ou modifier des données.")
                .example("Entrer ' OR '1'='1 dans un champ de connexion pour contourner l'authentification.")
                .category("threats")
                .relatedTerms(List.of("xss", "web_security"))
                .aliases(List.of("injection sql"))
                .build());

        addEntry("xss", GlossaryEntry.builder()
                .term("xss")
                .definition("Le Cross-Site Scripting (XSS) est une faille de sécurité web qui permet à un attaquant d'injecter du code JavaScript malveillant dans des pages web vues par d'autres utilisateurs.")
                .example("Un commentaire sur un forum qui contient du code JavaScript volant les cookies de session des visiteurs.")
                .category("threats")
                .relatedTerms(List.of("sql_injection", "web_security"))
                .aliases(List.of("cross-site scripting"))
                .build());

        addEntry("apt", GlossaryEntry.builder()
                .term("apt")
                .definition("Une APT (Advanced Persistent Threat) est une attaque sophistiquée et prolongée, généralement menée par des groupes bien financés (états, crime organisé) qui s'infiltrent discrètement dans un réseau et y restent longtemps pour voler des données.")
                .example("Un groupe de hackers étatiques infiltre une entreprise pendant des mois pour voler des secrets industriels.")
                .category("threats")
                .relatedTerms(List.of("nation_state", "espionage"))
                .aliases(List.of("advanced persistent threat", "menace persistante"))
                .build());

        // Protections et outils
        addEntry("firewall", GlossaryEntry.builder()
                .term("firewall")
                .definition("Un pare-feu (firewall) est un système de sécurité qui surveille et contrôle le trafic réseau entrant et sortant selon des règles de sécurité prédéfinies. Il agit comme une barrière entre un réseau de confiance et un réseau non fiable.")
                .example("Windows Defender Firewall bloque les connexions entrantes non autorisées vers votre PC.")
                .category("protection")
                .relatedTerms(List.of("network_security", "ids", "ips"))
                .aliases(List.of("pare-feu", "parefeu"))
                .build());

        addEntry("vpn", GlossaryEntry.builder()
                .term("vpn")
                .definition("Un VPN (Virtual Private Network) crée un tunnel chiffré entre votre appareil et un serveur distant, masquant votre adresse IP et protégeant vos données sur les réseaux publics.")
                .example("Se connecter au VPN de l'entreprise depuis un café pour accéder aux ressources internes de manière sécurisée.")
                .category("protection")
                .relatedTerms(List.of("encryption", "remote_work", "network_security"))
                .aliases(List.of("réseau privé virtuel"))
                .build());

        addEntry("2fa", GlossaryEntry.builder()
                .term("2fa")
                .definition("L'authentification à deux facteurs (2FA) ajoute une couche de sécurité supplémentaire en exigeant deux types de vérification : quelque chose que vous savez (mot de passe) ET quelque chose que vous avez (téléphone, clé de sécurité).")
                .example("Après avoir entré votre mot de passe Gmail, vous recevez un code par SMS ou via l'app Google Authenticator.")
                .category("protection")
                .relatedTerms(List.of("mfa", "password", "authentication"))
                .aliases(List.of("mfa", "double authentification", "authentification deux facteurs"))
                .build());

        addEntry("encryption", GlossaryEntry.builder()
                .term("encryption")
                .definition("Le chiffrement est le processus de transformation de données lisibles en données illisibles (chiffrées) à l'aide d'un algorithme et d'une clé. Seuls ceux qui possèdent la clé de déchiffrement peuvent lire les données originales.")
                .example("HTTPS chiffre les communications entre votre navigateur et les sites web pour empêcher l'interception des données.")
                .category("protection")
                .relatedTerms(List.of("ssl_tls", "aes", "rsa", "vpn"))
                .aliases(List.of("chiffrement", "cryptage"))
                .build());

        addEntry("siem", GlossaryEntry.builder()
                .term("siem")
                .definition("Un SIEM (Security Information and Event Management) est une solution qui collecte, analyse et corrèle les logs de sécurité de toute l'infrastructure IT pour détecter les menaces et les incidents en temps réel.")
                .example("Le SIEM alerte l'équipe sécurité quand un utilisateur se connecte depuis deux pays différents en 5 minutes.")
                .category("protection")
                .relatedTerms(List.of("soc", "logging", "incident_response"))
                .aliases(List.of("security information", "gestion des événements de sécurité"))
                .build());

        addEntry("soc", GlossaryEntry.builder()
                .term("soc")
                .definition("Un SOC (Security Operations Center) est une équipe dédiée qui surveille, détecte et répond aux incidents de sécurité 24h/24 en utilisant des outils comme les SIEM, IDS/IPS, et EDR.")
                .example("L'équipe SOC détecte une tentative d'intrusion à 3h du matin et bloque immédiatement l'attaquant.")
                .category("protection")
                .relatedTerms(List.of("siem", "incident_response", "threat_hunting"))
                .aliases(List.of("security operations center", "centre d'opérations de sécurité"))
                .build());

        addEntry("iam", GlossaryEntry.builder()
                .term("iam")
                .definition("L'IAM (Identity and Access Management) est l'ensemble des processus et technologies pour gérer les identités numériques et contrôler qui a accès à quoi dans une organisation.")
                .example("Le système IAM accorde automatiquement les bons accès à un nouvel employé selon son poste.")
                .category("protection")
                .relatedTerms(List.of("authentication", "authorization", "least_privilege"))
                .aliases(List.of("identity access management", "gestion des identités"))
                .build());

        // Concepts
        addEntry("zero_trust", GlossaryEntry.builder()
                .term("zero_trust")
                .definition("Le Zero Trust (confiance zéro) est un modèle de sécurité qui part du principe qu'aucun utilisateur ni appareil ne doit être automatiquement considéré comme fiable, même à l'intérieur du réseau de l'entreprise. Chaque accès doit être vérifié.")
                .example("Même depuis le bureau, un employé doit s'authentifier et prouver son identité pour accéder à chaque application.")
                .category("concepts")
                .relatedTerms(List.of("authentication", "least_privilege", "microsegmentation"))
                .aliases(List.of("confiance zéro", "zéro confiance"))
                .build());

        addEntry("shadow_it", GlossaryEntry.builder()
                .term("shadow_it")
                .definition("Le Shadow IT désigne l'utilisation de logiciels, applications ou services cloud par les employés sans l'approbation du département informatique, créant des risques de sécurité et de conformité.")
                .example("Un employé utilise son compte Dropbox personnel pour stocker des documents d'entreprise.")
                .category("concepts")
                .relatedTerms(List.of("byod", "data_protection", "compliance"))
                .aliases(List.of("informatique fantôme"))
                .build());

        // Malwares spécifiques
        addEntry("backdoor", GlossaryEntry.builder()
                .term("backdoor")
                .definition("Une porte dérobée (backdoor) est un moyen caché d'accéder à un système informatique en contournant les mécanismes de sécurité normaux. Elle peut être installée intentionnellement ou par un attaquant.")
                .example("Un développeur malveillant laisse un compte admin secret dans une application qu'il a créée.")
                .category("threats")
                .relatedTerms(List.of("malware", "trojan", "vulnerability"))
                .aliases(List.of("porte dérobée", "porte derobee"))
                .build());

        addEntry("keylogger", GlossaryEntry.builder()
                .term("keylogger")
                .definition("Un keylogger (enregistreur de frappe) est un logiciel ou matériel qui enregistre toutes les touches tapées au clavier, permettant de capturer mots de passe, messages et autres informations sensibles.")
                .example("Un malware qui envoie secrètement tout ce que vous tapez à un pirate, y compris vos identifiants bancaires.")
                .category("threats")
                .relatedTerms(List.of("spyware", "malware", "credential_theft"))
                .aliases(List.of("enregistreur de frappe"))
                .build());

        addEntry("spyware", GlossaryEntry.builder()
                .term("spyware")
                .definition("Un spyware (logiciel espion) est un programme qui s'installe discrètement sur votre appareil pour collecter des informations sur vos activités : sites visités, frappes clavier, fichiers, etc.")
                .example("Une app gratuite qui en arrière-plan enregistre votre localisation et vos conversations.")
                .category("threats")
                .relatedTerms(List.of("malware", "keylogger", "adware"))
                .aliases(List.of("logiciel espion"))
                .build());

        addEntry("trojan", GlossaryEntry.builder()
                .term("trojan")
                .definition("Un cheval de Troie (trojan) est un programme malveillant déguisé en logiciel légitime. Une fois installé, il peut voler des données, installer d'autres malwares ou donner un accès à distance aux attaquants.")
                .example("Un jeu gratuit téléchargé sur un site douteux qui installe secrètement un programme de contrôle à distance.")
                .category("threats")
                .relatedTerms(List.of("malware", "backdoor", "rat"))
                .aliases(List.of("cheval de troie", "cheval de Troie"))
                .build());
    }

    private void addEntry(String key, GlossaryEntry entry) {
        glossary.put(key.toLowerCase(), entry);
        // Ajouter les aliases comme clés alternatives
        if (entry.getAliases() != null) {
            for (String alias : entry.getAliases()) {
                glossary.put(alias.toLowerCase(), entry);
            }
        }
    }

    /**
     * Recherche un terme dans le glossaire
     */
    public Optional<GlossaryEntry> findByTerm(String term) {
        if (term == null) return Optional.empty();
        return Optional.ofNullable(glossary.get(term.toLowerCase().trim()));
    }

    /**
     * Récupère tous les termes (sans doublons d'aliases)
     */
    public Map<String, GlossaryEntry> getAllTerms() {
        return glossary.entrySet().stream()
                .filter(e -> e.getKey().equals(e.getValue().getTerm().toLowerCase()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    /**
     * Récupère les termes groupés par catégorie
     */
    public Map<String, List<String>> getTermsByCategory() {
        return getAllTerms().values().stream()
                .collect(Collectors.groupingBy(
                        GlossaryEntry::getCategory,
                        Collectors.mapping(GlossaryEntry::getTerm, Collectors.toList())
                ));
    }

    /**
     * Récupère les termes liés à un terme donné
     */
    public List<GlossaryEntry> getRelatedTerms(String term) {
        return findByTerm(term)
                .map(entry -> entry.getRelatedTerms().stream()
                        .map(this::findByTerm)
                        .filter(Optional::isPresent)
                        .map(Optional::get)
                        .collect(Collectors.toList()))
                .orElse(Collections.emptyList());
    }
}
