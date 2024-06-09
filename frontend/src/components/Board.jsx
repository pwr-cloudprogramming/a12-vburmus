import React from 'react';

const Board = ({tiles, onTileClick, playerTurn}) => {
    return (
        <div className="board">
            {tiles.map((tile, index) => (
                <div onClick={() => onTileClick(index)} key={index}
                     className={`tile border border-3 border-dark ${!tile && playerTurn.toLowerCase()}`}>
                    {tile}
                </div>))}
        </div>
    );
};

export default Board;