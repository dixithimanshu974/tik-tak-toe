import React, { useState, useEffect } from "react";

const TikTakToe = () => {
    const arr = Array.from({ length: 9 }, (_, i) => i);
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    // 0 = Computer ('O'), 1 = User ('X')
    const [userMoves, setUserMoves] = useState([]);
    const [computerMoves, setComputerMoves] = useState([]);
    const [winner, setWinner] = useState(null);
    const [userWins, setUserWins] = useState(0);
    const [computerWins, setComputerWins] = useState(0);
    const [firstMove, setFirstMove] = useState(null);

    const boardFromMoves = (uMoves, cMoves) => {
        const board = Array(9).fill(null);
        uMoves.forEach((i) => (board[i] = "X"));
        cMoves.forEach((i) => (board[i] = "O"));
        return board;
    };

    const getWinnerFromBoard = (board) => {
        for (const comb of winningCombinations) {
            const [a, b, c] = comb;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    };

    const isBoardFull = (board) => board.every((cell) => cell !== null);

    // Minimax algorithm (returns { score, index })
    const minimax = (board, depth, isMaximizing) => {
        const winnerMark = getWinnerFromBoard(board);
        if (winnerMark === "O") return { score: 10 - depth };
        if (winnerMark === "X") return { score: depth - 10 };
        if (isBoardFull(board)) return { score: 0 };

        if (isMaximizing) {
            let best = { score: -Infinity, index: null };
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = "O";
                    const res = minimax(board, depth + 1, false);
                    board[i] = null;
                    if (res.score > best.score) {
                        best = { score: res.score, index: i };
                    }
                }
            }
            return best;
        } else {
            let best = { score: Infinity, index: null };
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = "X";
                    const res = minimax(board, depth + 1, true);
                    board[i] = null;
                    if (res.score < best.score) {
                        best = { score: res.score, index: i };
                    }
                }
            }
            return best;
        }
    };

    const getBestMove = (board) => {
        const { index } = minimax(board, 0, true);
        if (index !== null) return index;
        const available = board.map((v, i) => (v === null ? i : null)).filter((v) => v !== null);
        return available.length ? available[Math.floor(Math.random() * available.length)] : null;
    };

    const isUsersTurn = () => {
        if (firstMove === null) return false;
        if (firstMove === 1) return userMoves.length === computerMoves.length;
        return userMoves.length < computerMoves.length;
    };

    const makeComputerMove = (currentUserMoves, currentComputerMoves) => {
        if (winner) return;

        const board = boardFromMoves(currentUserMoves, currentComputerMoves);
        
        if (getWinnerFromBoard(board) || isBoardFull(board)) {
            const w = getWinnerFromBoard(board);
            if (w === "X") {
                setWinner("User");
                setUserWins((p) => p + 1);
            } else if (w === "O") {
                setWinner("Computer");
                setComputerWins((p) => p + 1);
            } else if (isBoardFull(board) && !w) {
                setWinner("Draw");
            }
            return;
        }

        const best = getBestMove(board);
        if (best === null) {
            if (isBoardFull(board)) setWinner("Draw");
            return;
        }

        
        const newComputerMoves = [...currentComputerMoves, best];
        const boardAfter = boardFromMoves(currentUserMoves, newComputerMoves);
        setComputerMoves((prev) => [...prev, best]);

        const wAfter = getWinnerFromBoard(boardAfter);
        if (wAfter === "O") {
            setWinner("Computer");
            setComputerWins((p) => p + 1);
        } else if (isBoardFull(boardAfter)) {
            setWinner("Draw");
        }
    };

    const handleUserMove = (idx) => {
        if (
            winner ||
            firstMove === null ||
            userMoves.includes(idx) ||
            computerMoves.includes(idx) ||
            !isUsersTurn()
        )
            return;

        const newUserMoves = [...userMoves, idx];
        setUserMoves(newUserMoves);

        const boardAfterUser = boardFromMoves(newUserMoves, computerMoves);
        const w = getWinnerFromBoard(boardAfterUser);
        if (w === "X") {
            setWinner("User");
            setUserWins((p) => p + 1);
            return;
        }
        if (isBoardFull(boardAfterUser)) {
            setWinner("Draw");
            return;
        }

        makeComputerMove(newUserMoves, computerMoves);
    };

    const resetGame = () => {
        setUserMoves([]);
        setComputerMoves([]);
        setWinner(null);
        setFirstMove(null);
    };

    useEffect(() => {
        if (
            firstMove === 0 &&
            !winner &&
            userMoves.length === 0 &&
            computerMoves.length === 0
        ) {
            makeComputerMove([], []);
        }
    }, [firstMove]);

    return (
        <div className="w-full flex flex-col h-screen bg-white gap-5 justify-center items-center p-4">
            <div className="flex flex-col gap-3 items-center">
                <h2 className="text-xl font-bold">Tic Tac Toe</h2>
                <p className="text-lg">
                    User Wins: {userWins} | Computer Wins: {computerWins}
                </p>
                {winner && (
                    <p className="text-lg font-semibold text-green-600">
                        {winner === "Draw" ? "Draw!" : `${winner} Wins!`}
                    </p>
                )}
                <div className="flex gap-2">
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                        onClick={resetGame}
                    >
                        New Round (choose first)
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-200 rounded-lg"
                        onClick={() => {
                            setUserMoves([]);
                            setComputerMoves([]);
                            setWinner(null);
                            if (firstMove === 0) {
                                makeComputerMove([], []);
                            }
                        }}
                    >
                        Restart Round
                    </button>
                </div>
            </div>

            {/* First Move Selection */}
            {firstMove === null ? (
                <div className="flex flex-col gap-3 items-center">
                    <p className="text-lg font-medium">Who plays first?</p>
                    <div className="flex gap-3">
                        <button
                            className="px-5 py-2 bg-black text-white rounded-lg"
                            onClick={() => setFirstMove(1)}
                        >
                            User First
                        </button>
                        <button
                            className="px-5 py-2 bg-black text-white rounded-lg"
                            onClick={() => setFirstMove(0)}
                        >
                            Computer First
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-[360px] sm:w-[420px] md:w-[500px] h-[360px] sm:h-[420px] md:h-[500px] grid grid-cols-3 bg-black">
                    {arr.map((idx) => (
                        <div
                            key={idx}
                            className="w-full h-full flex justify-center items-center border border-white text-3xl font-bold cursor-pointer text-white select-none"
                            onClick={() => handleUserMove(idx)}
                        >
                            {userMoves.includes(idx)
                                ? "X"
                                : computerMoves.includes(idx)
                                    ? "O"
                                    : ""}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TikTakToe;
