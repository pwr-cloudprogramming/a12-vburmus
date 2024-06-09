package com.burmus.game.controller;

import com.burmus.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/rating")
@RequiredArgsConstructor
public class RatingController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getRating() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}