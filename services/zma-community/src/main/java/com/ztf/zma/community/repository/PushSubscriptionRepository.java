package com.ztf.zma.community.repository;

import com.ztf.zma.community.domain.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, String> {
    List<PushSubscription> findByUserEmail(String userEmail);
    Optional<PushSubscription> findByUserEmailAndEndpoint(String userEmail, String endpoint);
}
