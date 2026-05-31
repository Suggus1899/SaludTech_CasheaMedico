package com.saludtech.service;

import com.saludtech.model.User;
import com.saludtech.model.UserGamificationHistory;
import com.saludtech.model.enums.GamificationEvent;
import com.saludtech.repository.UserGamificationHistoryRepository;
import com.saludtech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GamificationService {

    private final UserRepository userRepository;
    private final UserGamificationHistoryRepository historyRepository;

    @Transactional
    public void awardPointsForPayment(User user, boolean isEarly) {
        int pointsToAward = isEarly ? 15 : 10;
        String desc = isEarly ? "Pago adelantado de cuota" : "Pago puntual de cuota";

        user.setPoints(user.getPoints() + pointsToAward);
        userRepository.save(user);

        UserGamificationHistory history = new UserGamificationHistory();
        history.setUser(user);
        history.setEventType(isEarly ? GamificationEvent.EARLY_PAYMENT : GamificationEvent.ON_TIME_PAYMENT);
        history.setPointsAwarded(pointsToAward);
        history.setDescription(desc);
        historyRepository.save(history);

        log.info("Awarded {} points to user {} for {}", pointsToAward, user.getId(), desc);
    }

    @Transactional
    public void awardPointsForPreventiveCheckup(User user) {
        int pointsToAward = 50;
        String desc = "Chequeo médico preventivo anual";

        user.setPoints(user.getPoints() + pointsToAward);
        userRepository.save(user);

        UserGamificationHistory history = new UserGamificationHistory();
        history.setUser(user);
        history.setEventType(GamificationEvent.PREVENTIVE_CHECKUP_ANNUAL);
        history.setPointsAwarded(pointsToAward);
        history.setDescription(desc);
        historyRepository.save(history);

        log.info("Awarded {} points to user {} for {}", pointsToAward, user.getId(), desc);
    }
}
