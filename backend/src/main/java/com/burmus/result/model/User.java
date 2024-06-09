package com.burmus.result.model;

import lombok.*;

import javax.persistence.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String email;
    @Builder.Default
    private Integer wins = 0;
    @Builder.Default
    private Integer loses = 0;
    @Builder.Default
    private Integer rating = 0;
    @Builder.Default
    private boolean subscribed = false;
    public void incrementWins(){
        this.wins++;
    }
    public void incrementLoses(){
        this.loses++;
    }
}