package com.ztf.zma.users.repository;

import com.ztf.zma.users.domain.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPreferencesRepository extends JpaRepository<UserPreferences, String> {
}
