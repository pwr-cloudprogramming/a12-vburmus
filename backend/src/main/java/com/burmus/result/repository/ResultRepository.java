package com.burmus.result.repository;

import com.burmus.result.model.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResultRepository  extends JpaRepository<Result, Long>{
}