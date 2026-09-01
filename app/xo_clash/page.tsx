"use client";

import React, {
    useEffect,
    useRef,
    useState,
} from "react";

type Player = "X" | "O";
type BoardValue = Player | "";

interface WinPosition {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
}

const X_SRC = "/xo/x_img.webp";
const O_SRC = "/xo/o_img.webp";
const RED_LINE_SRC = "/xo/red.webp";
const BLUE_LINE_SRC = "/xo/blue.webp";

const START_BALANCE = 10000;
const BET_MIN = 100;
const BET_MAX = 500;

const HUMAN: Player = "X";
const AI: Player = "O";

const AI_DIFFICULTY = 0.6;

const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6],
];

const RED_POSITIONS: Record<string, WinPosition> = {
    "0-1-2": { x: 49.527, y: 21.250, width: 72, height: 72, rotation: -45 },
    "3-4-5": { x: 49.527, y: 47.956, width: 72, height: 72, rotation: -45 },
    "6-7-8": { x: 50.134, y: 74.015, width: 72, height: 72, rotation: -45 },

    "0-3-6": { x: 22.792, y: 49.463, width: 72, height: 72, rotation: 45 },
    "1-4-7": { x: 49.510, y: 50.675, width: 72, height: 72, rotation: 45 },
    "2-5-8": { x: 76.464, y: 47.956, width: 72, height: 72, rotation: 45 },

    "0-4-8": { x: 50.742, y: 48.602, width: 72, height: 72, rotation: 0 },
    "2-4-6": { x: 49.122, y: 48.602, width: 72, height: 72, rotation: 90 },
};

const BLUE_POSITIONS: Record<string, WinPosition> = {
    "0-1-2": { x: 49.932, y: 20.820, width: 72, height: 72, rotation: -45 },
    "3-4-5": { x: 50.945, y: 47.525, width: 72, height: 72, rotation: -45 },
    "6-7-8": { x: 49.324, y: 73.800, width: 72, height: 72, rotation: -45 },

    "0-3-6": { x: 22.184, y: 49.679, width: 72, height: 72, rotation: 45 },
    "1-4-7": { x: 49.510, y: 50.675, width: 72, height: 72, rotation: 45 },
    "2-5-8": { x: 76.059, y: 47.740, width: 72, height: 72, rotation: 45 },

    "0-4-8": { x: 49.510, y: 50.675, width: 72, height: 72, rotation: 0 },
    "2-4-6": { x: 49.729, y: 48.171, width: 72, height: 72, rotation: 90 },
};

export default function Game() {
    const [backgroundImage, setBackgroundImage] = useState("");

    const [balance, setBalance] =
        useState(START_BALANCE);

    const [currentBet, setCurrentBet] =
        useState(0);

    const [board, setBoard] =
        useState<BoardValue[]>([
            "", "", "",
            "", "", "",
            "", "", "",
        ]);

    const [currentPlayer, setCurrentPlayer] =
        useState<Player>(HUMAN);

    const [isRunning, setIsRunning] =
        useState(false);

    const [moveLocked, setMoveLocked] =
        useState(false);

    const [status, setStatus] =
        useState("C'est à toi : X");

    const [betModalOpen, setBetModalOpen] =
        useState(true);

    const [betValue, setBetValue] =
        useState("");

    const [betError, setBetError] =
        useState("");

    const [resultModalOpen, setResultModalOpen] =
        useState(false);

    const [resultIsWin, setResultIsWin] =
        useState(false);

    const [resultDetail, setResultDetail] =
        useState("");

    const [rulesOpen, setRulesOpen] =
        useState(false);

    const [winLineVisible, setWinLineVisible] =
        useState(false);

    const [winLineSrc, setWinLineSrc] =
        useState("");

    const [winPosition, setWinPosition] =
        useState<WinPosition>({
            x: 50,
            y: 50,
            width: 72,
            height: 72,
            rotation: 0,
        });

    const boardRef = useRef<BoardValue[]>(board);
    const balanceRef = useRef(balance);
    const currentBetRef = useRef(currentBet);
    const isRunningRef = useRef(isRunning);
    const moveLockedRef = useRef(moveLocked);
    const currentPlayerRef = useRef<Player>(currentPlayer);

    useEffect(() => {
        boardRef.current = board;
    }, [board]);

    useEffect(() => {
        balanceRef.current = balance;
    }, [balance]);

    useEffect(() => {
        currentBetRef.current = currentBet;
    }, [currentBet]);

    useEffect(() => {
        isRunningRef.current = isRunning;
    }, [isRunning]);

    useEffect(() => {
        moveLockedRef.current = moveLocked;
    }, [moveLocked]);

    useEffect(() => {
        currentPlayerRef.current = currentPlayer;
    }, [currentPlayer]);

    /* =========================================
       BACKGROUND DYNAMIQUE
       ========================================= */

    useEffect(() => {
        const setDynamicBackground = () => {
            if (window.innerWidth >= 768) {
                setBackgroundImage(
                    "url('/xo/desktop.webp')"
                );
            } else {
                setBackgroundImage(
                    "url('/xo/mobile.webp')"
                );
            }
        };

        setDynamicBackground();

        window.addEventListener(
            "resize",
            setDynamicBackground
        );

        return () => {
            window.removeEventListener(
                "resize",
                setDynamicBackground
            );
        };
    }, []);

    /* =========================================
       EMPÊCHER ZOOM / SCROLL
       ========================================= */

    useEffect(() => {
        const preventTouchMove = (e: TouchEvent) => {
            const target = e.target as HTMLElement;

            if (
                target?.closest(
                    ".game-container"
                )
            ) {
                e.preventDefault();
            }
        };

        const preventGesture = (
            e: Event
        ) => {
            e.preventDefault();
        };

        const preventDoubleClick = (
            e: MouseEvent
        ) => {
            e.preventDefault();
        };

        document.addEventListener(
            "touchmove",
            preventTouchMove,
            { passive: false }
        );

        document.addEventListener(
            "gesturestart",
            preventGesture
        );

        document.addEventListener(
            "dblclick",
            preventDoubleClick
        );

        return () => {
            document.removeEventListener(
                "touchmove",
                preventTouchMove
            );

            document.removeEventListener(
                "gesturestart",
                preventGesture
            );

            document.removeEventListener(
                "dblclick",
                preventDoubleClick
            );
        };
    }, []);

    /* =========================================
       FORMAT XOF
       ========================================= */

    function formatXOF(amount: number) {
        return (
            amount.toLocaleString("fr-FR") +
            " XOF"
        );
    }

    /* =========================================
       ÉVALUER LE PLATEAU
       ========================================= */

    function evaluateBoard(
        currentBoard: BoardValue[]
    ): Player | "draw" | null {
        for (
            const condition of winConditions
        ) {
            const [a, b, c] = condition;

            if (
                currentBoard[a] !== "" &&
                currentBoard[a] ===
                    currentBoard[b] &&
                currentBoard[b] ===
                    currentBoard[c]
            ) {
                return currentBoard[a] as Player;
            }
        }

        if (
            !currentBoard.includes("")
        ) {
            return "draw";
        }

        return null;
    }

    /* =========================================
       TROUVER COMBINAISON GAGNANTE
       ========================================= */

    function findWinningCombo(
        currentBoard: BoardValue[]
    ): number[] | null {
        for (
            const condition of winConditions
        ) {
            const [a, b, c] = condition;

            if (
                currentBoard[a] !== "" &&
                currentBoard[a] ===
                    currentBoard[b] &&
                currentBoard[b] ===
                    currentBoard[c]
            ) {
                return condition;
            }
        }

        return null;
    }

    /* =========================================
       COUP GAGNANT IMMÉDIAT
       ========================================= */

    function findImmediateMove(
        currentBoard: BoardValue[],
        player: Player
    ) {
        for (
            let i = 0;
            i < 9;
            i++
        ) {
            if (
                currentBoard[i] !== ""
            ) {
                continue;
            }

            currentBoard[i] = player;

            const won =
                evaluateBoard(
                    currentBoard
                ) === player;

            currentBoard[i] = "";

            if (won) {
                return i;
            }
        }

        return -1;
    }

    /* =========================================
       COUP ALÉATOIRE
       ========================================= */

    function getRandomMove(
        currentBoard: BoardValue[]
    ) {
        const emptyCells: number[] = [];

        for (
            let i = 0;
            i < 9;
            i++
        ) {
            if (
                currentBoard[i] === ""
            ) {
                emptyCells.push(i);
            }
        }

        if (
            emptyCells.length === 0
        ) {
            return -1;
        }

        return emptyCells[
            Math.floor(
                Math.random() *
                    emptyCells.length
            )
        ];
    }

    /* =========================================
       MINIMAX
       ========================================= */

    function minimax(
        currentBoard: BoardValue[],
        depth: number,
        isMaximizing: boolean
    ): number {
        const result =
            evaluateBoard(
                currentBoard
            );

        if (result === AI) {
            return 10 - depth;
        }

        if (result === HUMAN) {
            return depth - 10;
        }

        if (result === "draw") {
            return 0;
        }

        if (isMaximizing) {
            let bestScore =
                -Infinity;

            for (
                let i = 0;
                i < 9;
                i++
            ) {
                if (
                    currentBoard[i] === ""
                ) {
                    currentBoard[i] = AI;

                    const score =
                        minimax(
                            currentBoard,
                            depth + 1,
                            false
                        );

                    currentBoard[i] = "";

                    bestScore =
                        Math.max(
                            bestScore,
                            score
                        );
                }
            }

            return bestScore;
        }

        let bestScore = Infinity;

        for (
            let i = 0;
            i < 9;
            i++
        ) {
            if (
                currentBoard[i] === ""
            ) {
                currentBoard[i] =
                    HUMAN;

                const score =
                    minimax(
                        currentBoard,
                        depth + 1,
                        true
                    );

                currentBoard[i] = "";

                bestScore =
                    Math.min(
                        bestScore,
                        score
                    );
            }
        }

        return bestScore;
    }

    /* =========================================
       MEILLEUR COUP
       ========================================= */

    function getBestMove() {
        let bestScore =
            -Infinity;

        let bestMove = -1;

        const currentBoard = [
            ...boardRef.current,
        ];

        for (
            let i = 0;
            i < 9;
            i++
        ) {
            if (
                currentBoard[i] !== ""
            ) {
                continue;
            }

            currentBoard[i] = AI;

            const score =
                minimax(
                    currentBoard,
                    0,
                    false
                );

            currentBoard[i] = "";

            if (
                score > bestScore
            ) {
                bestScore = score;
                bestMove = i;
            }
        }

        return bestMove;
    }

    /* =========================================
       CHOIX DU COUP IA
       ========================================= */

    function chooseComputerMove() {
        const currentBoard = [
            ...boardRef.current,
        ];

        const winningMove =
            findImmediateMove(
                currentBoard,
                AI
            );

        if (
            winningMove !== -1
        ) {
            return winningMove;
        }

        if (
            Math.random() <
            AI_DIFFICULTY
        ) {
            const blockingMove =
                findImmediateMove(
                    currentBoard,
                    HUMAN
                );

            if (
                blockingMove !== -1
            ) {
                return blockingMove;
            }
        }

        if (
            Math.random() <
            AI_DIFFICULTY
        ) {
            return getBestMove();
        }

        return getRandomMove(
            currentBoard
        );
    }

    /* =========================================
       AFFICHER BARRE DE VICTOIRE
       ========================================= */

    function showWinningLine(
        combo: number[],
        player: Player
    ) {
        const comboKey =
            combo.join("-");

        const positions =
            player === HUMAN
                ? RED_POSITIONS
                : BLUE_POSITIONS;

        const position =
            positions[comboKey];

        if (!position) {
            return;
        }

        setWinLineVisible(false);

        setWinPosition(position);

        setWinLineSrc(
            player === HUMAN
                ? RED_LINE_SRC
                : BLUE_LINE_SRC
        );

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setWinLineVisible(true);
            });
        });
    }

    /* =========================================
       CACHER BARRE
       ========================================= */

    function hideWinningLine() {
        setWinLineVisible(false);

        setTimeout(() => {
            setWinLineSrc("");
        }, 350);
    }

    /* =========================================
       AFFICHER RÉSULTAT
       ========================================= */

    function showResultModal(
        isWin: boolean,
        detailText: string
    ) {
        setResultIsWin(isWin);
        setResultDetail(detailText);
        setResultModalOpen(true);
    }

    /* =========================================
       TERMINER AVEC VICTOIRE
       ========================================= */

    function finishGame(
        winner: Player,
        player: Player
    ) {
        setIsRunning(false);
        isRunningRef.current = false;

        const betAmount =
            currentBetRef.current;

        let resultDetailText = "";

        let newBalance =
            balanceRef.current;

        if (
            winner === HUMAN
        ) {
            newBalance +=
                betAmount * 2;

            setStatus(
                "Tu as gagné ! 🎉 (+" +
                formatXOF(
                    betAmount
                ) +
                ")"
            );

            resultDetailText =
                "Tu remportes " +
                formatXOF(
                    betAmount * 2
                );
        } else {
            setStatus(
                "L'ordinateur a gagné ! 🤖 (-" +
                formatXOF(
                    betAmount
                ) +
                ")"
            );

            resultDetailText =
                "Tu perds ta mise de " +
                formatXOF(
                    betAmount
                );
        }

        balanceRef.current =
            newBalance;

        setBalance(newBalance);

        currentBetRef.current = 0;
        setCurrentBet(0);

        const winningCombo =
            findWinningCombo(
                boardRef.current
            );

        if (winningCombo) {
            showWinningLine(
                winningCombo,
                player
            );
        }

        setTimeout(() => {
            showResultModal(
                winner === HUMAN,
                resultDetailText
            );
        }, 900);
    }

    /* =========================================
       MATCH NUL / ÉGALITÉ
       ========================================= */

    function finishDraw() {
        setIsRunning(false);
        isRunningRef.current = false;

        const betAmount =
            currentBetRef.current;

        /*
         * Personne ne gagne.
         * La mise est intégralement remboursée.
         */

        const newBalance =
            balanceRef.current +
            betAmount;

        balanceRef.current =
            newBalance;

        setBalance(newBalance);

        currentBetRef.current = 0;
        setCurrentBet(0);

        setStatus(
            "Égalité ! 🤝 Mise remboursée."
        );

        /*
         * IMPORTANT :
         * Aucun Game Win et aucun Game Over.
         * On ouvre directement la popup de mise.
         */

        setTimeout(() => {
            openBetModal();
        }, 500);
    }

    /* =========================================
       COUP ORDINATEUR
       ========================================= */

    function computerMove() {
        if (
            !isRunningRef.current
        ) {
            setMoveLocked(false);
            moveLockedRef.current =
                false;

            return;
        }

        const bestMove =
            chooseComputerMove();

        if (bestMove === -1) {
            setMoveLocked(false);
            moveLockedRef.current =
                false;

            return;
        }

        const newBoard = [
            ...boardRef.current,
        ];

        newBoard[bestMove] = AI;

        boardRef.current = newBoard;
        setBoard(newBoard);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const result =
                    evaluateBoard(
                        newBoard
                    );

                if (
                    result !== null
                ) {
                    if (
                        result === "draw"
                    ) {
                        finishDraw();
                    } else {
                        finishGame(
                            result,
                            AI
                        );
                    }

                    setMoveLocked(false);
                    moveLockedRef.current =
                        false;

                    return;
                }

                setCurrentPlayer(HUMAN);
                currentPlayerRef.current =
                    HUMAN;

                setStatus(
                    "C'est à toi : X"
                );

                setMoveLocked(false);
                moveLockedRef.current =
                    false;
            });
        });
    }

    /* =========================================
       CLIC DU JOUEUR
       ========================================= */

    function cellClicked(
        cellIndex: number
    ) {
        if (
            !isRunningRef.current ||
            moveLockedRef.current ||
            currentPlayerRef.current !== HUMAN
        ) {
            return;
        }

        if (
            boardRef.current[cellIndex] !== ""
        ) {
            return;
        }

        setMoveLocked(true);
        moveLockedRef.current = true;

        const newBoard = [
            ...boardRef.current,
        ];

        newBoard[cellIndex] = HUMAN;

        boardRef.current = newBoard;
        setBoard(newBoard);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const result =
                    evaluateBoard(
                        newBoard
                    );

                if (
                    result !== null
                ) {
                    if (
                        result === "draw"
                    ) {
                        finishDraw();
                    } else {
                        finishGame(
                            result,
                            HUMAN
                        );
                    }

                    setMoveLocked(false);
                    moveLockedRef.current =
                        false;

                    return;
                }

                setCurrentPlayer(AI);
                currentPlayerRef.current =
                    AI;

                setStatus(
                    "L'ordinateur réfléchit..."
                );

                setTimeout(
                    computerMove,
                    300
                );
            });
        });
    }

    /* =========================================
       OUVRIR POPUP MISE
       ========================================= */

    function openBetModal() {
        setBetError("");
        setBetValue("");
        setBetModalOpen(true);
    }

    /* =========================================
       VALIDER LA MISE
       ========================================= */

    function confirmBet() {
        const value =
            parseInt(
                betValue,
                10
            );

        if (
            balanceRef.current <
            BET_MIN
        ) {
            return;
        }

        if (isNaN(value)) {
            setBetError(
                "Entre un montant."
            );

            return;
        }

        if (
            value < BET_MIN ||
            value > BET_MAX
        ) {
            setBetError(
                "La mise doit être entre " +
                BET_MIN +
                " et " +
                BET_MAX +
                " XOF."
            );

            return;
        }

        if (
            value >
            balanceRef.current
        ) {
            setBetError(
                "Solde insuffisant."
            );

            return;
        }

        currentBetRef.current =
            value;

        setCurrentBet(value);

        const newBalance =
            balanceRef.current -
            value;

        balanceRef.current =
            newBalance;

        setBalance(newBalance);

        setBetModalOpen(false);

        resetBoardState();
    }

    /* =========================================
       RECHARGER SOLDE
       ========================================= */

    function rechargeBalance() {
        balanceRef.current =
            START_BALANCE;

        setBalance(
            START_BALANCE
        );

        openBetModal();
    }

    /* =========================================
       NOUVELLE PARTIE
       ========================================= */

    function requestNewRound() {
        hideWinningLine();
        openBetModal();
    }

    /* =========================================
       CONTINUER APRÈS RÉSULTAT
       ========================================= */

    function continueGame() {
        setResultModalOpen(false);
        requestNewRound();
    }

    /* =========================================
       RÉINITIALISER LE PLATEAU
       ========================================= */

    function resetBoardState() {
        const emptyBoard: BoardValue[] = [
            "", "", "",
            "", "", "",
            "", "", "",
        ];

        boardRef.current =
            emptyBoard;

        setBoard(emptyBoard);

        setCurrentPlayer(HUMAN);
        currentPlayerRef.current =
            HUMAN;

        setIsRunning(true);
        isRunningRef.current =
            true;

        setMoveLocked(false);
        moveLockedRef.current =
            false;

        setStatus(
            "C'est à toi : X"
        );

        hideWinningLine();
    }

    const balanceInsufficient =
        balance < BET_MIN;

    const maxAllowed =
        Math.min(
            BET_MAX,
            balance
        );

    return (
        <>
            <div
                className="xo-page"
                style={{
                    backgroundImage,
                }}
            >
                <div className="game-container">

                    <h1>
                        XO Clash
                    </h1>

                    <div className="game-info">

                        <div className="info-pill">
                            Solde : {formatXOF(balance)}
                        </div>

                        <div className="info-pill">
                            Mise :{" "}
                            {currentBet > 0
                                ? formatXOF(
                                    currentBet
                                )
                                : "—"}
                        </div>

                    </div>

                    <div id="status">
                        {status}
                    </div>

                    <div
                        className="board"
                    >
                        <img
                            className="board-frame"
                            src="/xo/board_frame.webp"
                            alt=""
                            draggable={false}
                        />

                        <img
                            className="board-grille"
                            src="/xo/board_grille.webp"
                            alt=""
                            draggable={false}
                        />

                        {Array.from(
                            { length: 9 }
                        ).map(
                            (_, index) => (
                                <div
                                    key={`cell-${index}`}
                                    className="cell"
                                    data-index={index}
                                    onClick={() =>
                                        cellClicked(
                                            index
                                        )
                                    }
                                />
                            )
                        )}

                        {board.map(
                            (
                                value,
                                index
                            ) => (
                                <div
                                    key={`symbol-${index}-${value}`}
                                    className={
                                        "symbol " +
                                        (
                                            value !== ""
                                                ? "show"
                                                : ""
                                        )
                                    }
                                    data-index={index}
                                >
                                    {value !== "" && (
                                        <img
                                            src={
                                                value === "X"
                                                    ? X_SRC
                                                    : O_SRC
                                            }
                                            alt={value}
                                            draggable={false}
                                        />
                                    )}
                                </div>
                            )
                        )}

                        {winLineSrc && (
                            <img
                                className={
                                    "win-line " +
                                    (
                                        winLineVisible
                                            ? "show"
                                            : ""
                                    )
                                }
                                src={winLineSrc}
                                alt=""
                                draggable={false}
                                style={{
                                    left:
                                        `${winPosition.x}%`,
                                    top:
                                        `${winPosition.y}%`,
                                    width:
                                        `${winPosition.width}%`,
                                    height:
                                        `${winPosition.height}%`,
                                    ["--rotation" as string]:
                                        `${winPosition.rotation}deg`,
                                }}
                            />
                        )}

                    </div>

                    <button
                        id="rulesBtn"
                        onClick={() =>
                            setRulesOpen(true)
                        }
                    >
                        Règles
                    </button>

                </div>
            </div>

            {/* =====================================
                POPUP DE MISE
                ===================================== */}

            <div
                className={
                    "bet-overlay " +
                    (
                        betModalOpen
                            ? "show"
                            : ""
                    )
                }
            >
                <div className="bet-panel">

                    <div className="info-pill">
                        Solde : {formatXOF(balance)}
                    </div>

                    <div className="bet-modal">

                        <img
                            className="bet-image"
                            src="/xo/bet.webp"
                            alt="Votre mise !"
                            draggable={false}
                        />

                        <input
                            type="number"
                            inputMode="numeric"
                            className="bet-input"
                            value={betValue}
                            placeholder="100 - 500"
                            min={BET_MIN}
                            max={maxAllowed}
                            step="50"
                            disabled={
                                balanceInsufficient
                            }
                            onChange={(e) =>
                                setBetValue(
                                    e.target.value
                                )
                            }
                            onKeyDown={(e) => {
                                if (
                                    e.key === "Enter"
                                ) {
                                    e.preventDefault();
                                    confirmBet();
                                }
                            }}
                        />

                        <button
                            type="button"
                            className="bet-play-btn"
                            aria-label="Jouer"
                            disabled={
                                balanceInsufficient
                            }
                            onClick={
                                confirmBet
                            }
                        />

                    </div>

                    <div className="bet-error">
                        {balanceInsufficient
                            ? "Solde insuffisant pour miser."
                            : betError}
                    </div>

                    <button
                        type="button"
                        className={
                            "bet-recharge " +
                            (
                                balanceInsufficient
                                    ? "show"
                                    : ""
                            )
                        }
                        onClick={
                            rechargeBalance
                        }
                    >
                        Recharger le solde (10 000 XOF)
                    </button>

                </div>
            </div>

            {/* =====================================
                ÉCRAN DE FIN
                ===================================== */}

            <div
                className={
                    "result-overlay " +
                    (
                        resultModalOpen
                            ? "show"
                            : ""
                    )
                }
            >
                <div className="result-panel">

                    <div className="result-modal">

                        <img
                            className="result-frame-img"
                            src="/xo/panel_frame.webp"
                            alt=""
                            draggable={false}
                        />

                        <img
                            className="result-title-img"
                            src={
                                resultIsWin
                                    ? "/xo/text_game_win.webp"
                                    : "/xo/text_game_over.webp"
                            }
                            alt={
                                resultIsWin
                                    ? "Game Win !"
                                    : "Game Over !"
                            }
                            draggable={false}
                        />

                        <div className="result-detail">
                            {resultDetail}
                        </div>

                        <div className="result-balance">
                            Solde : {formatXOF(balance)}
                        </div>

                        <button
                            type="button"
                            className="result-continue-btn"
                            onClick={
                                continueGame
                            }
                        >
                            <img
                                src="/xo/btn_continuer.webp"
                                alt="Continuer"
                                draggable={false}
                            />
                        </button>

                    </div>

                </div>
            </div>

            {/* =====================================
                POPUP RÈGLES
                ===================================== */}

            <div
                className={
                    "rules-overlay " +
                    (
                        rulesOpen
                            ? "show"
                            : ""
                    )
                }
            >
                <div className="rules-modal">

                    <h2>
                        Règles du XO Clash
                    </h2>

                    <div className="rules-section">

                        <h3>
                            🎮 Comment jouer ?
                        </h3>

                        <p>
                            Tu joues avec le symbole X
                            contre l'ordinateur qui joue
                            avec O. À ton tour, clique sur
                            une case vide pour placer ton
                            symbole.
                        </p>

                    </div>

                    <div className="rules-section">

                        <h3>
                            🏆 Comment gagner ?
                        </h3>

                        <p>
                            Tu dois aligner trois X avant
                            l'ordinateur :
                        </p>

                        <ul>
                            <li>
                                Horizontalement
                            </li>
                            <li>
                                Verticalement
                            </li>
                            <li>
                                En diagonale
                            </li>
                        </ul>

                    </div>

                    <div className="rules-section">

                        <h3>
                            💰 Conditions de gain
                        </h3>

                        <p>
                            Avant chaque partie, choisis
                            une mise entre 100 et 500 XOF.
                            Si tu gagnes, ta mise est
                            doublée.
                        </p>

                    </div>

                    <div className="rules-section">

                        <h3>
                            ❌ Conditions de perte
                        </h3>

                        <p>
                            Si l'ordinateur aligne trois O
                            avant toi, la partie est perdue
                            et ta mise est perdue.
                        </p>

                    </div>

                    <div className="rules-section">

                        <h3>
                            🤝 En cas d'égalité
                        </h3>

                        <p>
                            Si toutes les cases sont
                            remplies sans gagnant,
                            personne ne gagne ni ne perd.
                            Ta mise est intégralement
                            remboursée.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="rules-close-btn"
                        onClick={() =>
                            setRulesOpen(false)
                        }
                    >
                        Fermer
                    </button>

                </div>
            </div>

            <style jsx global>{`

                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                html,
                body {
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    position: fixed;
                    top: 0;
                    left: 0;
                }

                body {
                    font-family:
                        'Segoe UI',
                        Tahoma,
                        Geneva,
                        Verdana,
                        sans-serif;

                    touch-action: manipulation;

                    -webkit-tap-highlight-color:
                        transparent;
                }

                .xo-page {
                    width: 100%;
                    height: 100vh;
                    height: 100dvh;

                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;

                    display: flex;

                    align-items: center;
                    justify-content: center;

                    position: relative;

                    transition:
                        background-image 0.3s
                        ease-in-out;
                }

                .game-container {
                    position: relative;

                    z-index: 1;

                    display: flex;

                    flex-direction: column;

                    align-items: center;

                    justify-content: center;

                    width: 100%;

                    height: 100vh;
                    height: 100dvh;

                    padding: 10px;

                    gap: 10px;
                }

                h1 {
                    color: #ffffff;

                    text-shadow:
                        0 2px 8px
                        rgba(0, 0, 0, 0.6);

                    font-size:
                        clamp(1.2rem, 4vh, 2.5rem);

                    text-align: center;

                    letter-spacing: 1px;

                    line-height: 1.2;
                }

                #status {
                    font-size:
                        clamp(0.8rem, 2.5vh, 1.2rem);

                    color: #ffffff;

                    text-shadow:
                        0 2px 4px
                        rgba(0, 0, 0, 0.6);

                    font-weight: bold;

                    text-align: center;

                    background:
                        rgba(0, 0, 0, 0.4);

                    padding:
                        8px 16px;

                    border-radius:
                        25px;

                    backdrop-filter:
                        blur(5px);

                    white-space:
                        nowrap;
                }

                .board {
                    position: relative;

                    width:
                        min(85vw, 85vh, 420px);

                    aspect-ratio:
                        1293 / 1216;

                    flex-shrink: 0;

                    filter:
                        drop-shadow(
                            0 10px 30px
                            rgba(0, 0, 0, 0.5)
                        );

                    overflow: visible;
                }

                .board-frame,
                .board-grille {
                    position: absolute;

                    pointer-events: none;

                    user-select: none;

                    -webkit-user-drag: none;

                    z-index: 1;
                }

                .board-frame {
                    left: 0;
                    top: 0;

                    width: 100%;
                    height: 100%;
                }

                .board-grille {
                    left: 5.41%;
                    top: 11.6%;

                    width: 88.2%;
                    height: 78.15%;
                }

                .cell {
                    position: absolute;

                    width: 29.4%;
                    height: 26.05%;

                    cursor: pointer;

                    border-radius: 10px;

                    transition:
                        background-color 0.2s ease,
                        transform 0.15s ease;

                    user-select: none;

                    -webkit-tap-highlight-color:
                        transparent;

                    z-index: 10;
                }

                .cell[data-index="0"] {
                    left: 5.41%;
                    top: 11.6%;
                }

                .cell[data-index="1"] {
                    left: 34.81%;
                    top: 11.6%;
                }

                .cell[data-index="2"] {
                    left: 64.21%;
                    top: 11.6%;
                }

                .cell[data-index="3"] {
                    left: 5.41%;
                    top: 37.65%;
                }

                .cell[data-index="4"] {
                    left: 34.81%;
                    top: 37.65%;
                }

                .cell[data-index="5"] {
                    left: 64.21%;
                    top: 37.65%;
                }

                .cell[data-index="6"] {
                    left: 5.41%;
                    top: 63.7%;
                }

                .cell[data-index="7"] {
                    left: 34.81%;
                    top: 63.7%;
                }

                .cell[data-index="8"] {
                    left: 64.21%;
                    top: 63.7%;
                }

                .cell:hover {
                    background-color:
                        rgba(255, 255, 255, 0.15);
                }

                .cell:active {
                    transform:
                        scale(0.97);
                }

                .symbol {
                    position: absolute;

                    pointer-events: none;

                    opacity: 0;

                    transform:
                        scale(0.5);

                    transition:
                        opacity 0.2s ease,
                        transform 0.25s
                        cubic-bezier(
                            .34,
                            1.56,
                            .64,
                            1
                        );

                    z-index: 20;
                }

                .symbol img {
                    width: 100%;
                    height: 100%;

                    display: block;

                    pointer-events: none;

                    user-select: none;

                    -webkit-user-drag: none;

                    object-fit: contain;

                    filter:
                        drop-shadow(
                            0 3px 6px
                            rgba(0, 0, 0, 0.35)
                        );
                }

                .symbol.show {
                    opacity: 1;

                    transform:
                        scale(1);
                }

                .symbol[data-index="0"] {
                    left: 13.850%;
                    top: 10.939%;
                    width: 18.613%;
                    height: 19.792%;
                }

                .symbol[data-index="1"] {
                    left: 40.604%;
                    top: 11.547%;
                    width: 18.613%;
                    height: 19.792%;
                }

                .symbol[data-index="2"] {
                    left: 67.683%;
                    top: 11.754%;
                    width: 17.943%;
                    height: 19.079%;
                }

                .symbol[data-index="3"] {
                    left: 13.119%;
                    top: 37.792%;
                    width: 18.613%;
                    height: 19.792%;
                }

                .symbol[data-index="4"] {
                    left: 40.190%;
                    top: 37.521%;
                    width: 18.613%;
                    height: 19.792%;
                }

                .symbol[data-index="5"] {
                    left: 66.437%;
                    top: 38.061%;
                    width: 18.613%;
                    height: 19.792%;
                }

                .symbol[data-index="6"] {
                    left: 14.103%;
                    top: 64.373%;
                    width: 18.613%;
                    height: 19.792%;
                }

                .symbol[data-index="7"] {
                    left: 40.349%;
                    top: 64.002%;
                    width: 18.613%;
                    height: 19.792%;
                }

                .symbol[data-index="8"] {
                    left: 66.278%;
                    top: 64.900%;
                    width: 18.613%;
                    height: 19.792%;
                }

                .win-line {
                    position: absolute;

                    left: 50%;
                    top: 50%;

                    width: 72%;
                    height: 72%;

                    object-fit: contain;

                    pointer-events: none;

                    user-select: none;

                    -webkit-user-drag: none;

                    opacity: 0;

                    transform:
                        translate(-50%, -50%)
                        rotate(0deg)
                        scale(0.8);

                    transform-origin:
                        center center;

                    transition:
                        opacity 0.25s ease,
                        transform 0.35s
                        cubic-bezier(
                            .34,
                            1.56,
                            .64,
                            1
                        );

                    z-index: 30;
                }

                .win-line.show {
                    opacity: 1;

                    transform:
                        translate(-50%, -50%)
                        rotate(var(--rotation))
                        scale(1);
                }

                .game-info {
                    display: flex;

                    gap: 10px;

                    flex-wrap: wrap;

                    align-items: center;

                    justify-content: center;
                }

                .info-pill {
                    font-size:
                        clamp(0.7rem, 2vh, 1rem);

                    color: #ffffff;

                    text-shadow:
                        0 2px 4px
                        rgba(0, 0, 0, 0.6);

                    font-weight: bold;

                    text-align: center;

                    background:
                        rgba(0, 0, 0, 0.4);

                    padding:
                        6px 14px;

                    border-radius:
                        25px;

                    backdrop-filter:
                        blur(5px);

                    white-space:
                        nowrap;
                }

                #rulesBtn {
                    padding:
                        clamp(8px, 2vh, 14px)
                        clamp(25px, 5vw, 35px);

                    font-size:
                        clamp(0.8rem, 2.5vh, 1.1rem);

                    background:
                        linear-gradient(
                            135deg,
                            #2196f3 0%,
                            #0d47a1 100%
                        );

                    color: white;

                    border: none;

                    border-radius: 50px;

                    cursor: pointer;

                    box-shadow:
                        0 4px 15px
                        rgba(0, 0, 0, 0.3);

                    transition:
                        all 0.3s ease;

                    font-weight: bold;

                    letter-spacing: 0.5px;

                    -webkit-tap-highlight-color:
                        transparent;

                    flex-shrink: 0;
                }

                #rulesBtn:hover {
                    transform:
                        translateY(-2px);

                    box-shadow:
                        0 6px 20px
                        rgba(0, 0, 0, 0.4);
                }

                #rulesBtn:active {
                    transform:
                        scale(0.97);
                }

                .bet-overlay {
                    position: fixed;

                    inset: 0;

                    z-index: 1000;

                    display: none;

                    align-items: center;

                    justify-content: center;

                    padding: 16px;

                    background:
                        rgba(5, 15, 35, 0.72);

                    backdrop-filter:
                        blur(4px);
                }

                .bet-overlay.show {
                    display: flex;
                }

                .bet-panel {
                    display: flex;

                    flex-direction: column;

                    align-items: center;

                    gap: 14px;

                    max-width: 100%;
                }

                .bet-panel .info-pill {
                    background:
                        rgba(0, 0, 0, 0.5);
                }

                .bet-modal {
                    position: relative;

                    width:
                        min(80vw, 62vh, 420px);

                    aspect-ratio:
                        1402 / 1122;

                    filter:
                        drop-shadow(
                            0 10px 30px
                            rgba(0, 0, 0, 0.5)
                        );
                }

                .bet-image {
                    position: absolute;

                    inset: 0;

                    width: 100%;
                    height: 100%;

                    pointer-events: none;

                    user-select: none;

                    -webkit-user-drag: none;
                }

                .bet-input {
                    position: absolute;

                    left: 25.6%;
                    top: 43.6%;

                    width: 48.6%;
                    height: 11.6%;

                    border: none;

                    background: transparent;

                    text-align: center;

                    font-family: inherit;

                    font-size:
                        clamp(1rem, 4.5vh, 1.7rem);

                    font-weight: bold;

                    color: #1259a3;

                    outline: none;

                    -moz-appearance: textfield;
                }

                .bet-input::placeholder {
                    color:
                        rgba(18, 89, 163, 0.45);

                    font-weight: bold;
                }

                .bet-input::-webkit-outer-spin-button,
                .bet-input::-webkit-inner-spin-button {
                    -webkit-appearance: none;

                    margin: 0;
                }

                .bet-play-btn {
                    position: absolute;

                    left: 20.3%;
                    top: 60.1%;

                    width: 60.3%;
                    height: 20.5%;

                    background: transparent;

                    border: none;

                    cursor: pointer;

                    padding: 0;

                    -webkit-tap-highlight-color:
                        transparent;
                }

                .bet-play-btn:active {
                    transform:
                        scale(0.97);
                }

                .bet-play-btn:disabled {
                    cursor: not-allowed;

                    opacity: 0.6;
                }

                .bet-error {
                    min-height: 1.2em;

                    font-size:
                        clamp(0.75rem, 2.2vh, 0.95rem);

                    color: #ff8a8a;

                    text-shadow:
                        0 2px 4px
                        rgba(0, 0, 0, 0.7);

                    font-weight: bold;

                    text-align: center;
                }

                .bet-recharge {
                    display: none;

                    padding: 8px 18px;

                    font-size:
                        clamp(0.75rem, 2.2vh, 0.95rem);

                    background:
                        linear-gradient(
                            135deg,
                            #f1c40f 0%,
                            #f39c12 100%
                        );

                    color: #1a1a1a;

                    border: none;

                    border-radius: 50px;

                    cursor: pointer;

                    font-weight: bold;

                    box-shadow:
                        0 4px 15px
                        rgba(0, 0, 0, 0.3);
                }

                .bet-recharge.show {
                    display: inline-block;
                }

                .result-overlay {
                    position: fixed;

                    inset: 0;

                    z-index: 1001;

                    display: none;

                    align-items: center;

                    justify-content: center;

                    padding: 16px;

                    background:
                        rgba(5, 15, 35, 0.75);

                    backdrop-filter:
                        blur(4px);
                }

                .result-overlay.show {
                    display: flex;
                }

                .result-panel {
                    display: flex;

                    flex-direction: column;

                    align-items: center;

                    max-width: 100%;
                }

                .result-modal {
                    position: relative;

                    width:
                        min(82vw, 64vh, 420px);

                    aspect-ratio:
                        864 / 867;

                    filter:
                        drop-shadow(
                            0 10px 30px
                            rgba(0, 0, 0, 0.5)
                        );
                }

                .result-frame-img {
                    position: absolute;

                    inset: 0;

                    width: 100%;
                    height: 100%;

                    pointer-events: none;

                    user-select: none;

                    -webkit-user-drag: none;
                }

                .result-title-img {
                    position: absolute;

                    left: 8%;
                    top: 9%;

                    width: 84%;

                    height: auto;

                    pointer-events: none;

                    user-select: none;

                    -webkit-user-drag: none;
                }

                .result-detail {
                    position: absolute;

                    left: 8%;
                    top: 44%;

                    width: 84%;

                    text-align: center;

                    font-size:
                        clamp(0.95rem, 3.6vh, 1.3rem);

                    font-weight: bold;

                    color: #14417f;

                    line-height: 1.3;
                }

                .result-balance {
                    position: absolute;

                    left: 8%;
                    top: 58%;

                    width: 84%;

                    text-align: center;

                    font-size:
                        clamp(0.8rem, 2.8vh, 1.05rem);

                    font-weight: 600;

                    color: #2c4a70;
                }

                .result-continue-btn {
                    position: absolute;

                    left: 15%;

                    top: 66%;

                    width: 70%;

                    background: transparent;

                    border: none;

                    padding: 0;

                    cursor: pointer;

                    -webkit-tap-highlight-color:
                        transparent;
                }

                .result-continue-btn img {
                    width: 100%;

                    height: auto;

                    display: block;

                    pointer-events: none;

                    user-select: none;

                    -webkit-user-drag: none;
                }

                .result-continue-btn:active {
                    transform:
                        scale(0.97);
                }

                .rules-overlay {
                    position: fixed;

                    inset: 0;

                    z-index: 2000;

                    display: none;

                    align-items: center;

                    justify-content: center;

                    padding: 20px;

                    background:
                        rgba(5, 15, 35, 0.78);

                    backdrop-filter:
                        blur(6px);
                }

                .rules-overlay.show {
                    display: flex;
                }

                .rules-modal {
                    position: relative;

                    width:
                        min(90vw, 500px);

                    max-height:
                        min(80vh, 650px);

                    overflow-y: auto;

                    padding:
                        clamp(20px, 5vw, 35px);

                    border-radius:
                        28px;

                    background:
                        linear-gradient(
                            145deg,
                            #ffffff,
                            #e7f1ff
                        );

                    border:
                        3px solid
                        rgba(33, 150, 243, 0.5);

                    box-shadow:
                        0 15px 50px
                        rgba(0, 0, 0, 0.5);

                    color: #163a63;
                }

                .rules-modal h2 {
                    text-align: center;

                    font-size:
                        clamp(1.4rem, 5vw, 2rem);

                    color: #1266c5;

                    margin-bottom: 20px;
                }

                .rules-section {
                    margin-bottom: 18px;
                }

                .rules-section h3 {
                    font-size:
                        clamp(1rem, 3vw, 1.2rem);

                    color: #0d5cad;

                    margin-bottom: 7px;
                }

                .rules-section p,
                .rules-section li {
                    font-size:
                        clamp(0.85rem, 2.8vw, 1rem);

                    line-height: 1.5;
                }

                .rules-section ul {
                    padding-left: 20px;
                }

                .rules-close-btn {
                    display: block;

                    margin:
                        25px auto 0;

                    padding:
                        11px 35px;

                    border: none;

                    border-radius: 50px;

                    background:
                        linear-gradient(
                            135deg,
                            #2196f3,
                            #0d47a1
                        );

                    color: white;

                    font-weight: bold;

                    font-size: 1rem;

                    cursor: pointer;

                    box-shadow:
                        0 5px 15px
                        rgba(13, 71, 161, 0.3);
                }

                .rules-close-btn:active {
                    transform:
                        scale(0.97);
                }

                @media (max-height: 500px) {

                    .game-container {
                        flex-direction: row;

                        flex-wrap: wrap;

                        gap: 5px;

                        padding: 5px;
                    }

                    h1 {
                        font-size:
                            clamp(
                                1rem,
                                5vw,
                                1.5rem
                            );

                        flex-basis: 100%;
                    }

                    #status {
                        font-size:
                            clamp(
                                0.7rem,
                                3vw,
                                0.9rem
                            );

                        padding:
                            4px 12px;
                    }

                    .board {
                        width:
                            min(
                                60vh,
                                60vw,
                                370px
                            );
                    }

                    #rulesBtn {
                        padding:
                            6px 15px;

                        font-size:
                            clamp(
                                0.7rem,
                                3vw,
                                0.9rem
                            );
                    }
                }

                @media (min-width: 1200px) {

                    .board {
                        width:
                            min(500px, 70vh);
                    }
                }

                @media (hover: none) {

                    .cell:hover {
                        background-color:
                            transparent;
                    }

                    #rulesBtn:hover {
                        transform: none;
                    }
                }

            `}</style>
        </>
    );
}