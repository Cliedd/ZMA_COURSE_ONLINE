package com.ztf.zma.media.repository;

import com.ztf.zma.media.domain.MediaVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MediaVariantRepository extends JpaRepository<MediaVariant, String> {
    List<MediaVariant> findByMediaId(String mediaId);
    void deleteByMediaId(String mediaId);
}
