package com.burmus.result;

import com.burmus.result.model.Result;
import com.burmus.result.repository.ResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResultService {
    private final ResultRepository resultRepository;
    public void create(Result result) {
        resultRepository.save(result);
    }
}
