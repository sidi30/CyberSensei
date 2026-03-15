package io.cybersensei.scheduler.dto;

import java.util.List;

/**
 * Résultat de la comparaison entre deux scans successifs.
 *
 * @param deltaScore       variation du score (négatif = dégradation)
 * @param previousScore    score du scan précédent
 * @param currentScore     score du scan actuel
 * @param nouvellesAlertes nouveaux risques apparus (absents du scan précédent)
 * @param risquesResolus   risques disparus (présents avant, absents maintenant)
 * @param domain           domaine scanné
 */
public record ScanDiff(
    int deltaScore,
    int previousScore,
    int currentScore,
    List<String> nouvellesAlertes,
    List<String> risquesResolus,
    String domain
) {}
