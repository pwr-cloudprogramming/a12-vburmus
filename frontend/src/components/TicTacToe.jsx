import React, {useEffect, useState} from 'react';
import Board from "./Board";
import GameState from "../utils/GameState";
import Stomp from "stompjs";
import {makeMove} from "../utils/gameUtils";


const TicTacToe = ({gameId, playerCheckType, login, initialTiles, signOut}) => {
    const PLAYER_X = 'X';
    const PLAYER_O = 'O';
    const [tiles, setTiles] = useState(Array(9).fill(null));
    const [playerTurn, setPlayerTurn] = useState(playerCheckType === PLAYER_X)
    const [playerType, _] = useState(playerCheckType);
    const [gameState, setGameState] = useState(GameState.STARTED);
    const [opponentLogin, setOpponentLogin] = useState("");
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    function checkWinner(tiles, setGameState) {
        for (const combo of winningCombinations) {
            const tileValue1 = tiles[combo[0]];
            const tileValue2 = tiles[combo[1]];
            const tileValue3 = tiles[combo[2]];

            if (tileValue1 !== null && tileValue1 === tileValue2 && tileValue1 === tileValue3) {
                if (tileValue1 === PLAYER_X) {
                    setGameState(GameState.X_WIN);
                } else {
                    setGameState(GameState.O_WIN);
                }
                return;
            }
        }

        const areAllTilesFilledIn = tiles.every((tile) => tile !== null)
        if (areAllTilesFilledIn) {
            setGameState(GameState.DRAW)
        }
    }

    const handleTileClick = (index) => {
        if (tiles[index] !== null || gameState !== GameState.STARTED || !playerTurn) {
            return;
        }

        const newTiles = [...tiles];
        newTiles[index] = playerType;
        setTiles(newTiles);


        const indexes = indexToCoordinates(index);

        let data = {
            type: playerType,
            coordinateX: indexes.x,
            coordinateY: indexes.y,
            gameId: gameId
        };

        makeMove(data);
    }

    const indexToCoordinates = (index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        return {x: col, y: row};
    }

    const processData = (data) => {
        const board = data.board.flat();
        console.log("Player turn", data);
        const order = [0, 3, 6, 1, 4, 7, 2, 5, 8]; // New order of indexes

        const transformedBoard = order.map(index => {
            const value = board[index];
            if (value === 1) {
                return PLAYER_X;
            } else if (value === 2) {
                return PLAYER_O;
            } else {
                return null;
            }
        });

        setTiles(transformedBoard);
        setPlayerTurn(prevState => !prevState);
        if (data.player2 !== null && data.player1 !== null) {
            const opponentLogin = playerType === "X" ? data.player2.login : data.player1.login;
            setOpponentLogin(opponentLogin);
        }
    }

    useEffect(() => {
        checkWinner(tiles, setGameState);
    }, [tiles]);

    useEffect(() => {
        console.log("connecting to the game");
        const websocket = new WebSocket(process.env.REACT_APP_SOCKET + '/gameplay');

        const stompClient = Stomp.over(websocket);
        stompClient.connect({}, function (_) {
            console.log('Connected to the STOMP server');
            stompClient.subscribe(`/topic/game-progress/${gameId}`, function (message) {
                processData(JSON.parse(message.body));
            });
        });

        if (playerType === PLAYER_O) {
            const board = initialTiles.flat();

            const order = [0, 3, 6, 1, 4, 7, 2, 5, 8]; // New order of indexes

            const transformedBoard = order.map(index => {
                const value = board[index];
                if (value === 1) {
                    setPlayerTurn(prevState => !prevState);
                    return PLAYER_X;
                } else if (value === 2) {
                    return PLAYER_O;
                } else {
                    return null;
                }
            });
            setTiles(transformedBoard);
        }
    }, []);

    return (
        <div className="d-flex flex-column gap-5 mt-5 align-items-center justify-content-center">
            <h1>{gameState}</h1>
            <Board tiles={tiles} onTileClick={handleTileClick} playerTurn={playerType}/>
            <h1 className="text-danger">
                <div className="d-flex justify-content-center align-items-center">
                    <img src={"https://" + process.env.REACT_APP_AWS_BUCKET_NAME + ".s3.amazonaws.com/users/" + login.replaceAll("@", "_")
                        .replaceAll(".", "_") + ".jpg"}/>
                    <h1 className="px-5"> VS </h1>
                    {opponentLogin ? <img
                        src={"https://" + process.env.REACT_APP_AWS_BUCKET_NAME + ".s3.amazonaws.com/users/" + opponentLogin.replaceAll("@", "_")
                            .replaceAll(".", "_") + ".jpg"}/> : <h1>User</h1>}
                </div>
                <br/>
                <br/>
            </h1>
        </div>
    );
};

export default TicTacToe;