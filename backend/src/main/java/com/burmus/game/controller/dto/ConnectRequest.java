package com.burmus.game.controller.dto;

import com.burmus.game.model.Player;
import lombok.Data;

@Data
public class ConnectRequest {
    private Player player;
    private String gameId;
}