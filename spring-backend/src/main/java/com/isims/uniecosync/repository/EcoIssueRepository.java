package com.isims.uniecosync.repository;

import com.isims.uniecosync.model.EcoIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EcoIssueRepository extends JpaRepository<EcoIssue, Long> {
}
