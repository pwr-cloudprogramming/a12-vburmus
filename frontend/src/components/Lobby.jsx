import React, {useEffect, useState} from 'react';
import TicTacToe from "./TicTacToe";
import {connectToGame, createGame, getAccessToken, getRating, setImageForUser} from "../utils/gameUtils";
import {Input} from "@aws-amplify/ui-react";

const Lobby = ({signOut, user}) => {
    const [gameStarted, setGameStarted] = useState(false);
    const [showRating, setShowRating] = useState(false);
    const [gameId, setGameId] = useState("");
    const [playerLogin, setPlayerLogin] = useState("");
    const [playerType, setPlayerType] = useState("X")
    const [initialTiles, setInitialTiles] = useState()
    const [image, setImage] = useState(null);
    const [validImage, setValidImage] = useState(false);
    const [error, setError] = useState("");
    const [rating, setRating] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        handleGetRating()
    }, [])
    useEffect(() => {
        setPlayerLogin(user.signInDetails.loginId);
    }, [user, signOut]);
    useEffect(() => {
        const ALLOWED_IMG = ["image/jpg", "image/jpeg", "image/png", "image/gif"];
        if (image) {
            if (ALLOWED_IMG.includes(image.type)) {
                setValidImage(true);
            } else {
                setValidImage(false);
                setError("Please select a valid image file [jpg, jpeg, png, gif]");
            }
        } else {
            setValidImage(true)
        }
    }, [image])
    const handleGetRating = async () => {
        setLoading(true)
        console.log("Getting rating...")
        getRating(playerLogin)
            .then((data) => {
                console.log(data)
                setRating(data)
            })
        setLoading(false)
    }
    const handleCreateGame = async () => {
        let accessToken = getAccessToken(user.username)
        if (playerLogin) {
            createGame(playerLogin, accessToken)
                .then((data) => {
                    setGameId(data.gameId);
                    setPlayerLogin(playerLogin);
                    setPlayerType("X");
                    setGameStarted(true);
                })
                .catch(() => console.log("Error creating game!"))
        }
    }

    const handleConnectToGame = async () => {
        let accessToken = getAccessToken(user.username)

        if (playerLogin) {
            connectToGame(playerLogin, accessToken)
                .then((data) => {
                    setPlayerLogin(playerLogin);
                    setGameId(data.gameId);
                    setPlayerType("O");
                    setGameStarted(true);
                    setInitialTiles(data.board);
                })
        }
    }
    const handleSendFile = async () => {
        console.log("Sending file...")
        if (image) {
            setImageForUser(playerLogin, image)
            setError("")
            setImage(null)
        } else {
            alert("Please select an image file to send")
        }
    }

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
    };

    const thStyle = {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px',
        textAlign: 'left',
    };

    const tdStyle = {
        border: '1px solid #ddd',
        padding: '10px',
        textAlign: 'left',
    };

    const trHoverStyle = {
        backgroundColor: '#f1f1f1',
    };
    if (showRating) {
        return (loading ? <div>Loading...</div> :
                <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 gap-3">
                    <h1>Rating</h1>
                    <table style={tableStyle}>
                        <thead>
                        <tr>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Rating</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rating.map((r, index) => (
                            <tr key={index} style={index % 2 === 0 ? {} : trHoverStyle}>
                                <td style={tdStyle}>{r.email}</td>
                                <td style={tdStyle}>{r.rating}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <button onClick={() =>setShowRating(false)}>Back</button>
                </div>
        )
    } else {
        if (!gameStarted) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 gap-3">
                    <h1>Tic Tac Toe</h1>
                    <button className="btn btn-light w-100" onClick={() => handleCreateGame()}>Create Game</button>
                    <button className="btn btn-light w-100" onClick={() => handleConnectToGame()}>Connect to Game</button>
                    <Input type="file" onChange={(e) => {
                        if (e.target.files) setImage(e.target.files[0])
                    }}/>
                    {image && validImage && <button onClick={handleSendFile}>Accept</button>}
                    {image && !validImage && <p className="text-danger">{error}</p>}
                    <button onClick={signOut}>Sign out</button>
                    <button onClick={() => {
                        setShowRating(true)
                    }}>Rating
                    </button>
                </div>
            );
        } else {
            return (
                <TicTacToe gameId={gameId} playerCheckType={playerType} initialTiles={initialTiles} login={playerLogin} signOut={signOut}/>
            );
        }
    }
};

export default Lobby;