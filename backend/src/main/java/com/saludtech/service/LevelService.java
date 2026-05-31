package com.saludtech.service;

import com.saludtech.config.LevelConfig;
import com.saludtech.model.User;
import com.saludtech.model.UserLevelHistory;
import com.saludtech.repository.UserLevelHistoryRepository;
import com.saludtech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LevelService {

    private final UserRepository userRepository;
    private final UserLevelHistoryRepository historyRepository;
    private final LevelConfig levelConfig;

    @Transactional
    public void evaluateLevelUpgrade(User user, BigDecimal totalPaid, int installmentsPaid) {
        short currentLevel = user.getLevel();
        Map<Short, LevelConfig.LevelRule> rules = levelConfig.getRules();

        if (rules == null || !rules.containsKey((short) (currentLevel + 1))) {
            return; // No rules or already at max level
        }

        short nextLevel = (short) (currentLevel + 1);
        LevelConfig.LevelRule rule = rules.get(nextLevel);

        if (totalPaid.compareTo(rule.getRequiredTotalPaid()) >= 0 &&
                installmentsPaid >= rule.getRequiredInstallmentsPaidCount()) {

            // Upgrade user
            short oldLevel = user.getLevel();
            user.setLevel(nextLevel);
            userRepository.save(user);

            // Record history
            UserLevelHistory history = new UserLevelHistory();
            history.setUser(user);
            history.setFromLevel(oldLevel);
            history.setToLevel(nextLevel);
            history.setReason("Automatic upgrade based on payment history");
            historyRepository.save(history);

            log.info("User {} upgraded from level {} to {}", user.getId(), oldLevel, nextLevel);
        }
    }

    @Transactional
    public void downgradeUser(User user, String reason) {
        short currentLevel = user.getLevel();
        if (currentLevel <= 1) {
            return;
        }

        short newLevel = (short) (currentLevel - 1);
        user.setLevel(newLevel);
        userRepository.save(user);

        UserLevelHistory history = new UserLevelHistory();
        history.setUser(user);
        history.setFromLevel(currentLevel);
        history.setToLevel(newLevel);
        history.setReason(reason);
        historyRepository.save(history);

        log.info("User {} downgraded from level {} to {} due to: {}", user.getId(), currentLevel, newLevel, reason);
    }

    /**
     * Applies the Cashea-style point and level penalty based on days overdue:
     * - 7 days: lose 20% of points
     * - 14 days: lose remaining 50% of points + downgrade 1 level
     * - Every 7 days after 14: downgrade 1 additional level
     * - 28 days: reset to level 1 and lose all points
     */
    @Transactional
    public void applyOverduePenalty(User user, int daysOverdue) {
        short currentLevel = user.getLevel();

        if (daysOverdue >= 28) {
            // Reset to level 1, lose all points
            user.setPoints(0);
            if (currentLevel > 1) {
                user.setLevel((short) 1);
                recordLevelHistory(user, currentLevel, (short) 1, "OVERDUE_28_DAYS_RESET");
            }
        } else if (daysOverdue >= 14 && daysOverdue % 7 == 0) {
            // Lose 50% of remaining points + downgrade 1 level each 7 days after day 14
            int pointsLost = (int) Math.ceil(user.getPoints() * 0.50);
            user.setPoints(Math.max(0, user.getPoints() - pointsLost));
            if (currentLevel > 1) {
                short newLevel = (short) (currentLevel - 1);
                user.setLevel(newLevel);
                recordLevelHistory(user, currentLevel, newLevel, "OVERDUE_" + daysOverdue + "_DAYS");
            }
        } else if (daysOverdue == 7) {
            // Lose 20% of points only
            int pointsLost = (int) Math.ceil(user.getPoints() * 0.20);
            user.setPoints(Math.max(0, user.getPoints() - pointsLost));
        }

        userRepository.save(user);
        log.info("Applied overdue penalty to user {} ({} days overdue): level={}, points={}",
                user.getId(), daysOverdue, user.getLevel(), user.getPoints());
    }

    @Transactional
    public void resetToLevel1(User user, String reason) {
        short currentLevel = user.getLevel();
        user.setLevel((short) 1);
        user.setPoints(0);
        userRepository.save(user);
        recordLevelHistory(user, currentLevel, (short) 1, reason);
        log.info("User {} reset to level 1 due to: {}", user.getId(), reason);
    }

    private void recordLevelHistory(User user, short fromLevel, short toLevel, String reason) {
        UserLevelHistory history = new UserLevelHistory();
        history.setUser(user);
        history.setFromLevel(fromLevel);
        history.setToLevel(toLevel);
        history.setReason(reason);
        historyRepository.save(history);
    }
}
