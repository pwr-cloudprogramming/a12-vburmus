package com.burmus.game.service;

import com.burmus.game.model.*;
import com.burmus.result.ResultService;
import com.burmus.result.model.Result;
import com.burmus.result.model.User;
import com.burmus.user.service.UserService;
import com.burmus.utils.exceptions.InvalidGameException;
import com.burmus.utils.storage.GameStorage;
import jdk.jfr.consumer.RecordedThread;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.NoSuchElementException;
import java.util.Random;
import java.util.UUID;

import static com.burmus.game.model.GameStatus.*;

@Service
@RequiredArgsConstructor
public class GameService {
    private final ResultService resultService;
    private final UserService userService;
    @Value("${aws.lambda.url}")
    private String lambdaUrl;
    private final Random random = new Random();
    public Game createGame(Player player) {
        Game game = new Game();
        game.setBoard(new int[3][3]);
        game.setGameId(UUID.randomUUID().toString());
        game.setPlayer1(player);
        game.setStatus(NEW);
        GameStorage.getInstance().setGame(game);
        userService.create(User.builder().email(player.getLogin()).build());
        return game;
    }

    public Game connectToGame(Player player2) throws InvalidGameException {
        var keySet = GameStorage.getInstance().getGames().keySet();
        var gameArray = keySet.toArray();
        String randomGame = null;
        Game game = null;
        do {
            randomGame = (String) gameArray[random.nextInt(gameArray.length)];
            game = GameStorage.getInstance().getGames().get(randomGame);
        } while (!GameStatus.NEW.equals(game.getStatus()));
        if (game.getPlayer2() != null) {
            throw new InvalidGameException("Game is not valid anymore");
        }
        game.setPlayer2(player2);
        game.setStatus(IN_PROGRESS);
        GameStorage.getInstance().setGame(game);
        userService.create(User.builder().email(player2.getLogin()).build());
        return game;
    }


    public Game gamePlay(GamePlay gamePlay) throws InvalidGameException {
        if (!GameStorage.getInstance().getGames().containsKey(gamePlay.getGameId())) {
            throw new NoSuchElementException("Game not found");
        }

        Game game = GameStorage.getInstance().getGames().get(gamePlay.getGameId());
        if (game.getStatus().equals(FINISHED)) {
            throw new InvalidGameException("Game is already finished");
        }

        int[][] board = game.getBoard();
        board[gamePlay.getCoordinateX()][gamePlay.getCoordinateY()] = gamePlay.getType().getValue();

        Boolean xWinner = checkWinner(game.getBoard(), TicToe.X);
        Boolean oWinner = checkWinner(game.getBoard(), TicToe.O);
        if (xWinner || oWinner) {
            TicToe winner = Boolean.TRUE.equals(xWinner) ? TicToe.X : TicToe.O;
            game.setWinner(winner);
            game.setStatus(FINISHED);
            User user1 = userService.getUserByEmail(game.getPlayer1().getLogin());
            User user2 = userService.getUserByEmail(game.getPlayer2().getLogin());

            Result result = Result.builder()
                                  .first_user(user1)
                                  .second_user(user2)
                                  .winner(winner.name()).build();
            if(TicToe.X.equals(winner)){
                user1.incrementWins();
                user2.incrementLoses();
            }else{
                user2.incrementWins();
                user1.incrementLoses();
            }
            GameStorage.getInstance().getGames().remove(gamePlay.getGameId());
            resultService.create(result);
            makeHttpCall(lambdaUrl);
        }
        GameStorage.getInstance().setGame(game);
        return game;
    }
    private void makeHttpCall(String urlString) {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                                         .uri(URI.create(urlString))
                                         .build();

        client.sendAsync(request, HttpResponse.BodyHandlers.discarding())
              .thenAccept(response -> {
                  if (response.statusCode() != 200) {
                      System.out.println("HTTP request failed: " + response.statusCode());
                  }
              })
              .exceptionally(e -> {
                  e.printStackTrace();
                  return null;
              });
    }
    private Boolean checkWinner(int[][] board, TicToe ticToe) {
        int[] boardArray = new int[9];
        int counterIndex = 0;
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[i].length; j++) {
                boardArray[counterIndex] = board[i][j];
                counterIndex++;
            }
        }

        int[][] winCombinations = {{0, 1, 2}, {3, 4, 5}, {6, 7, 8}, {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, {0, 4, 8}, {2, 4
                , 6}};
        for (int[] winCombination : winCombinations) {
            int counter = 0;
            for (int i : winCombination) {
                if (boardArray[i] == ticToe.getValue()) {
                    counter++;
                    if (counter == 3) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}