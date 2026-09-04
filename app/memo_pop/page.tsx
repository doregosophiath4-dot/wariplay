"use client";

import { useEffect, useRef, useState } from "react";

const TOTAL_CARDS = 24;
const PAIRS = 12;
const START_TIME = 90;

const CARD_IMAGES = [
  "memo/1.jpg",
  "memo/2.jpg",
  "memo/3.jpg",
  "memo/4.jpg",
  "memo/5.jpg",
  "memo/6.jpg",
  "memo/7.jpg",
  "memo/8.jpg",
  "memo/9.jpg",
  "memo/10.jpg",
  "memo/11.jpg",
  "memo/12.jpg",
];

const CARD_BACK = "memo/22.jpg";

type ObjectiveType = "time" | "errors" | "moves";

type Objective = {
  type: ObjectiveType;
  value: number;
  text: string;
};

type CardData = {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
};

const OBJECTIVES = [
  {
    type: "time" as const,
    generate(): Objective {
      const values = [30, 40, 50, 60, 70, 80];
      const seconds =
        values[Math.floor(Math.random() * values.length)];

      return {
        type: "time",
        value: seconds,
        text: `Terminez le jeu en moins de ${seconds} secondes`,
      };
    },
  },
  {
    type: "errors" as const,
    generate(): Objective {
      const values = [1, 2, 3, 4, 5];
      const limit =
        values[Math.floor(Math.random() * values.length)];

      return {
        type: "errors",
        value: limit,
        text: `Faites moins de ${limit} erreurs`,
      };
    },
  },
  {
    type: "moves" as const,
    generate(): Objective {
      const values = [18, 20, 22, 24, 26, 28];
      const limit =
        values[Math.floor(Math.random() * values.length)];

      return {
        type: "moves",
        value: limit,
        text: `Terminez le jeu en ${limit} coups maximum`,
      };
    },
  },
];

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return (
    String(min).padStart(2, "0") +
    ":" +
    String(sec).padStart(2, "0")
  );
}

function formatMoney(value: number) {
  return Number(value).toLocaleString("fr-FR");
}

export default function MemoryGame() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [firstCard, setFirstCard] = useState<number | null>(null);
  const [secondCard, setSecondCard] = useState<number | null>(null);

  const [lockBoard, setLockBoard] = useState(true);

  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);

  const [remainingTime, setRemainingTime] =
    useState(START_TIME);

  const [currentBet, setCurrentBet] = useState(0);

  const [betInput, setBetInput] = useState("");

  const [objective, setObjective] =
    useState<Objective | null>(null);

  const [gameStarted, setGameStarted] =
    useState(false);

  const [gameFinished, setGameFinished] =
    useState(false);

  const [popup, setPopup] = useState<
    "bet" | "objective" | "loss" | "win" | null
  >("bet");

  const [popupClosing, setPopupClosing] =
    useState(false);

  const [lossMessage, setLossMessage] =
    useState("");

  const [winMessage, setWinMessage] =
    useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const firstCardRef = useRef<number | null>(null);
  const secondCardRef = useRef<number | null>(null);

  const cardsRef = useRef<CardData[]>([]);

  const lockBoardRef = useRef(true);
  const gameFinishedRef = useRef(false);

  const currentBetRef = useRef(0);
  const objectiveRef =
    useRef<Objective | null>(null);

  const movesRef = useRef(0);
  const errorsRef = useRef(0);
  const matchedPairsRef = useRef(0);
  const remainingTimeRef =
    useRef(START_TIME);

  useEffect(() => {
    createCards();
    showBetPopup();

    return () => {
      stopTimer();
    };
  }, []);

  function syncCards(nextCards: CardData[]) {
    cardsRef.current = nextCards;
    setCards(nextCards);
  }

  function createCards() {
    const values = shuffle([
      ...CARD_IMAGES,
      ...CARD_IMAGES,
    ]);

    const nextCards: CardData[] = [];

    for (let i = 0; i < TOTAL_CARDS; i++) {
      nextCards.push({
        id: i,
        value: values[i],
        flipped: false,
        matched: false,
      });
    }

    syncCards(nextCards);

    firstCardRef.current = null;
    secondCardRef.current = null;

    setFirstCard(null);
    setSecondCard(null);
  }

  function showBetPopup() {
    setGameStarted(false);
    setGameFinished(false);

    gameFinishedRef.current = false;
    lockBoardRef.current = true;

    setLockBoard(true);

    setBetInput("");

    setPopupClosing(false);
    setPopup("bet");
  }

  function closePopup(
    callback?: () => void
  ) {
    setPopupClosing(true);

    setTimeout(() => {
      setPopup(null);
      setPopupClosing(false);

      if (callback) {
        callback();
      }
    }, 400);
  }

  function openPopup(
    name: "bet" | "objective" | "loss" | "win"
  ) {
    setPopupClosing(false);

    requestAnimationFrame(() => {
      setPopup(name);
    });
  }

  function confirmBet() {
    const rawValue = betInput.trim();

    if (rawValue === "") {
      return;
    }

    const value = Number(rawValue);

    if (!Number.isFinite(value)) {
      setBetInput("");
      return;
    }

    if (value < 100) {
      setBetInput("");
      return;
    }

    if (!Number.isInteger(value)) {
      setBetInput("");
      return;
    }

    currentBetRef.current = value;
    setCurrentBet(value);

    closePopup(() => {
      generateObjective();
      showObjectivePopup();
    });
  }

  function generateObjective() {
    const template =
      OBJECTIVES[
        Math.floor(
          Math.random() * OBJECTIVES.length
        )
      ];

    const generated =
      template.generate();

    objectiveRef.current = generated;
    setObjective(generated);
  }

  function showObjectivePopup() {
    openPopup("objective");
  }

  function confirmObjective() {
    closePopup(() => {
      startGame();
    });
  }

  function startGame() {
    stopTimer();

    gameFinishedRef.current = false;
    lockBoardRef.current = false;

    setGameFinished(false);
    setGameStarted(true);
    setLockBoard(false);

    firstCardRef.current = null;
    secondCardRef.current = null;

    setFirstCard(null);
    setSecondCard(null);

    movesRef.current = 0;
    errorsRef.current = 0;
    matchedPairsRef.current = 0;
    remainingTimeRef.current = START_TIME;

    setMoves(0);
    setScore(0);
    setErrors(0);
    setMatchedPairs(0);
    setRemainingTime(START_TIME);

    createCards();

    startTimer();
  }

  function startTimer() {
    stopTimer();

    timerRef.current = setInterval(() => {
      if (
        gameFinishedRef.current ||
        !gameStarted
      ) {
        return;
      }

      remainingTimeRef.current -= 1;

      const nextTime =
        remainingTimeRef.current;

      setRemainingTime(nextTime);

      if (nextTime <= 0) {
        remainingTimeRef.current = 0;

        loseGame(
          "Objectif non atteint !<br />Temps dépassé."
        );
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function flipCard(cardId: number) {
    if (
      lockBoardRef.current ||
      gameFinishedRef.current ||
      !gameStarted
    ) {
      return;
    }

    const currentCards = cardsRef.current;

    const card =
      currentCards.find(
        (item) => item.id === cardId
      );

    if (!card) {
      return;
    }

    if (
      card.id === firstCardRef.current ||
      card.matched ||
      card.flipped
    ) {
      return;
    }

    const nextCards = currentCards.map(
      (item) =>
        item.id === cardId
          ? {
              ...item,
              flipped: true,
            }
          : item
    );

    syncCards(nextCards);

    if (
      firstCardRef.current === null
    ) {
      firstCardRef.current = cardId;

      setFirstCard(cardId);

      return;
    }

    secondCardRef.current = cardId;

    setSecondCard(cardId);

    lockBoardRef.current = true;

    setLockBoard(true);

    movesRef.current += 1;

    setMoves(movesRef.current);

    checkForMatch(
      firstCardRef.current,
      cardId
    );
  }

  function checkForMatch(
    firstId: number,
    secondId: number
  ) {
    const currentCards = cardsRef.current;

    const first =
      currentCards.find(
        (card) => card.id === firstId
      );

    const second =
      currentCards.find(
        (card) => card.id === secondId
      );

    if (!first || !second) {
      return;
    }

    if (first.value === second.value) {
      handleMatch(
        firstId,
        secondId
      );
    } else {
      handleMismatch(
        firstId,
        secondId
      );
    }
  }

  function handleMatch(
    firstId: number,
    secondId: number
  ) {
    matchedPairsRef.current += 1;

    const nextPairs =
      matchedPairsRef.current;

    setMatchedPairs(nextPairs);

    setScore((previous) =>
      previous + 100
    );

    const nextCards =
      cardsRef.current.map((card) =>
        card.id === firstId ||
        card.id === secondId
          ? {
              ...card,
              matched: true,
              flipped: true,
            }
          : card
      );

    syncCards(nextCards);

    setTimeout(() => {
      resetSelection();

      if (
        matchedPairsRef.current ===
        PAIRS
      ) {
        finishGame();
      }
    }, 650);
  }

  function handleMismatch(
    firstId: number,
    secondId: number
  ) {
    errorsRef.current += 1;

    setErrors(errorsRef.current);

    setScore((previous) =>
      Math.max(0, previous - 10)
    );

    setTimeout(() => {
      const nextCards =
        cardsRef.current.map((card) =>
          card.id === firstId ||
          card.id === secondId
            ? {
                ...card,
                flipped: false,
              }
            : card
        );

      syncCards(nextCards);

      resetSelection();
    }, 800);
  }

  function resetSelection() {
    firstCardRef.current = null;
    secondCardRef.current = null;

    setFirstCard(null);
    setSecondCard(null);

    lockBoardRef.current = false;

    setLockBoard(false);
  }

  function finishGame() {
    if (gameFinishedRef.current) {
      return;
    }

    gameFinishedRef.current = true;
    lockBoardRef.current = true;

    setGameFinished(true);
    setLockBoard(true);

    stopTimer();

    const usedTime =
      START_TIME -
      remainingTimeRef.current;

    const currentObjective =
      objectiveRef.current;

    if (!currentObjective) {
      loseGame(
        "Objectif non atteint !"
      );

      return;
    }

    let success = false;

    if (
      currentObjective.type ===
      "time"
    ) {
      success =
        usedTime <=
        currentObjective.value;
    }

    if (
      currentObjective.type ===
      "errors"
    ) {
      success =
        errorsRef.current <
        currentObjective.value;
    }

    if (
      currentObjective.type ===
      "moves"
    ) {
      success =
        movesRef.current <=
        currentObjective.value;
    }

    if (success) {
      winGame();
    } else {
      loseGame(
        createLossMessage()
      );
    }
  }

  function createLossMessage() {
    const currentObjective =
      objectiveRef.current;

    if (!currentObjective) {
      return "Objectif non atteint !";
    }

    if (
      currentObjective.type ===
      "time"
    ) {
      return `
        Objectif non atteint !<br />
        Temps : ${formatTime(
          START_TIME -
            remainingTimeRef.current
        )}
      `;
    }

    if (
      currentObjective.type ===
      "errors"
    ) {
      return `
        Objectif non atteint !<br />
        Erreurs : ${errorsRef.current}
      `;
    }

    if (
      currentObjective.type ===
      "moves"
    ) {
      return `
        Objectif non atteint !<br />
        Coups : ${movesRef.current}
      `;
    }

    return "Objectif non atteint !";
  }

  function winGame() {
    gameFinishedRef.current = true;
    lockBoardRef.current = true;

    setGameFinished(true);
    setLockBoard(true);

    stopTimer();

    const winnings =
      currentBetRef.current * 2;

    setWinMessage(
      `Gain : ${formatMoney(
        winnings
      )} XOF`
    );

    openPopup("win");
  }

  function loseGame(
    message: string
  ) {
    if (
      lossMessage &&
      popup === "loss"
    ) {
      return;
    }

    gameFinishedRef.current = true;
    lockBoardRef.current = true;

    setGameFinished(true);
    setLockBoard(true);

    stopTimer();

    setLossMessage(`
      ${message}<br />
      Mise perdue : ${formatMoney(
        currentBetRef.current
      )} XOF
    `);

    openPopup("loss");
  }

  function resetAfterEnd() {
    stopTimer();

    gameFinishedRef.current = false;
    lockBoardRef.current = true;

    setGameFinished(false);
    setGameStarted(false);
    setLockBoard(true);

    firstCardRef.current = null;
    secondCardRef.current = null;

    setFirstCard(null);
    setSecondCard(null);

    currentBetRef.current = 0;
    setCurrentBet(0);

    setBetInput("");

    showBetPopup();
  }

  function getCardClass(card: CardData) {
    const classes = ["card"];

    if (card.flipped) {
      classes.push("flipped");
    }

    if (card.matched) {
      classes.push("matched");
    }

    return classes.join(" ");
  }

  return (
    <>
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
        }

        body {
          overflow: hidden;

          background-image:
            url("/memo/desktop.jpg");

          background-size: cover;

          background-position: center;

          background-repeat: no-repeat;

          font-family: Arial, sans-serif;
        }

        .game-container {
          width: 100%;
          height: 100dvh;

          display: flex;

          flex-direction: column;

          align-items: center;

          padding: 6px 0;

          overflow: hidden;
        }

        .game-header {
          position: relative;

          width: min(720px, 94vw);

          flex-shrink: 0;

          margin: 0 auto 5px;

          line-height: 0;
        }

        .game-header img {
          display: block;

          width: 100%;
          height: auto;

          pointer-events: none;

          user-select: none;
        }

        .header-value {
          position: absolute;

          z-index: 5;

          display: flex;

          align-items: center;

          justify-content: center;

          text-align: center;

          color: white;

          font-weight: 900;

          text-shadow:
            2px 2px 0 #24104e,
            -1px -1px 0 #24104e,
            1px -1px 0 #24104e,
            -1px 1px 0 #24104e;

          pointer-events: none;

          line-height: 1;
        }

        #timer {
          left: 11.7%;
          top: 45.8%;

          width: 15.7%;
          height: 16.2%;

          font-size:
            clamp(14px, 2.4vw, 27px);
        }

        #moves {
          left: 76%;
          top: 45.8%;

          width: 9.1%;
          height: 13.9%;

          font-size:
            clamp(14px, 2.2vw, 25px);
        }

        #score {
          left: 90.8%;
          top: 46.2%;

          width: 8.2%;
          height: 14.4%;

          font-size:
            clamp(14px, 2.2vw, 25px);
        }

        .game-board {
          width: min(500px, 94vw);

          margin-left: auto;
          margin-right: auto;

          align-self: center;

          justify-self: center;

          display: grid;

          grid-template-columns:
            repeat(6, minmax(0, 1fr));

          grid-template-rows:
            repeat(4, auto);

          gap: 4px;

          perspective: 1200px;

          flex-shrink: 0;
        }

        .card {
          position: relative;

          width: 100%;

          aspect-ratio: 1 / 1.35;

          cursor: pointer;

          perspective: 1000px;

          user-select: none;

          -webkit-tap-highlight-color: transparent;
        }

        .card-inner {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          transform-style: preserve-3d;

          transition:
            transform .55s
            cubic-bezier(.22,.61,.36,1),
            filter .25s ease;

          will-change: transform;
        }

        .card.flipped .card-inner,
        .card.matched .card-inner {
          transform: rotateY(180deg);
        }

        .card-face {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          display: flex;

          align-items: center;

          justify-content: center;

          overflow: visible;

          backface-visibility: hidden;

          -webkit-backface-visibility: hidden;
        }

        .card-face img {
          display: block;

          width: 100%;
          height: 100%;

          object-fit: contain;

          object-position: center;

          pointer-events: none;

          user-select: none;
        }

        .card-front {
          transform: rotateY(0deg);
        }

        .card-back {
          transform: rotateY(180deg);
        }

        .card:not(.flipped):not(.matched):hover
        .card-inner {
          transform:
            translateY(-2px)
            scale(1.025);
        }

        .card.flipped:not(.matched)
        .card-inner {
          animation:
            flipComplete .55s ease;
        }

        @keyframes flipComplete {
          0% {
            transform:
              rotateY(0deg)
              scale(1);
          }

          45% {
            transform:
              rotateY(90deg)
              scale(1.04);
          }

          100% {
            transform:
              rotateY(180deg)
              scale(1);
          }
        }

        .card.matched .card-inner {
          animation:
            matchedPop .55s ease forwards,
            matchedGlow 1.2s
            ease-in-out .15s
            infinite alternate;
        }

        @keyframes matchedPop {
          0% {
            transform:
              rotateY(180deg)
              scale(1);
          }

          30% {
            transform:
              rotateY(180deg)
              scale(1.12);
          }

          55% {
            transform:
              rotateY(180deg)
              scale(.96);
          }

          75% {
            transform:
              rotateY(180deg)
              scale(1.05);
          }

          100% {
            transform:
              rotateY(180deg)
              scale(1);
          }
        }

        @keyframes matchedGlow {
          from {
            filter: brightness(1);
          }

          to {
            filter: brightness(1.3);
          }
        }

        .popup-overlay {
          position: fixed;

          inset: 0;

          z-index: 1000;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 10px;

          background:
            rgba(0, 0, 0, .60);

          opacity: 0;

          visibility: hidden;

          transition:
            opacity .35s ease,
            visibility .35s ease;
        }

        .popup-overlay.active {
          opacity: 1;

          visibility: visible;
        }

        .popup-overlay.closing {
          opacity: 0;
        }

        .popup {
          position: relative;

          width: min(500px, 94vw);

          aspect-ratio: 1 / 1;

          transform:
            translateY(35px)
            scale(.82)
            rotateX(8deg);

          opacity: 0;

          transition:
            transform .5s
            cubic-bezier(.17,.89,.32,1.28),
            opacity .35s ease;

          will-change:
            transform,
            opacity;
        }

        .popup-overlay.active .popup {
          transform:
            translateY(0)
            scale(1)
            rotateX(0deg);

          opacity: 1;
        }

        .popup-overlay.closing .popup {
          transform:
            translateY(25px)
            scale(.82)
            rotateX(-8deg);

          opacity: 0;
        }

        .popup-bg {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: contain;

          pointer-events: none;

          user-select: none;
        }

        #betInput {
          position: absolute;

          left: 16.48%;
          top: 47.39%;

          width: 66.47%;
          height: 20.42%;

          z-index: 10;

          border: none;

          outline: none;

          background: transparent;

          text-align: center;

          font-size:
            clamp(18px, 4vw, 34px);

          font-weight: 900;

          color: #402000;

          padding: 5px 15px;
        }

        #betInput::placeholder {
          color: transparent;
        }

        #betInput::-webkit-outer-spin-button,
        #betInput::-webkit-inner-spin-button {
          -webkit-appearance: none;

          margin: 0;
        }

        #betInput[type="number"] {
          appearance: textfield;

          -moz-appearance: textfield;
        }

        #betConfirmBtn {
          position: absolute;

          left: 23.29%;
          top: 78.26%;

          width: 53.59%;
          height: 21.63%;

          z-index: 11;

          border: none;

          background: transparent;

          cursor: pointer;
        }

        #textearea {
          position: absolute;

          left: 12.15%;
          top: 50.31%;

          width: 76.32%;
          height: 18.47%;

          z-index: 10;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 5px 12px;

          text-align: center;

          color: #472500;

          font-size:
            clamp(16px, 3vw, 30px);

          font-weight: 900;

          line-height: 1.15;

          pointer-events: none;
        }

        #objectifConfirmBtn {
          position: absolute;

          left: 24.79%;
          top: 79.72%;

          width: 51.04%;
          height: 18.96%;

          z-index: 11;

          border: none;

          background: transparent;

          cursor: pointer;
        }

        #zontexte {
          position: absolute;

          left: 12.02%;
          top: 45.45%;

          width: 76.29%;
          height: 18.47%;

          z-index: 10;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 5px 12px;

          text-align: center;

          color: #4a1600;

          font-size:
            clamp(16px, 3vw, 30px);

          font-weight: 900;

          line-height: 1.15;

          pointer-events: none;
        }

        #overConfirmBtn {
          position: absolute;

          left: 21.96%;
          top: 79.48%;

          width: 57.57%;
          height: 19.20%;

          z-index: 11;

          border: none;

          background: transparent;

          cursor: pointer;
        }

        #winInput {
          position: absolute;

          left: 14.83%;
          top: 55.42%;

          width: 71.46%;
          height: 18.23%;

          z-index: 10;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 5px 12px;

          text-align: center;

          color: #452500;

          font-size:
            clamp(16px, 3vw, 30px);

          font-weight: 900;

          line-height: 1.15;

          pointer-events: none;
        }

        #winConfirmBtn {
          position: absolute;

          left: 24.55%;
          top: 79.23%;

          width: 50.80%;
          height: 16.53%;

          z-index: 11;

          border: none;

          background: transparent;

          cursor: pointer;
        }

        .popup button {
          transition:
            transform .18s ease,
            filter .18s ease;
        }

        .popup button:hover {
          transform: scale(1.04);

          filter: brightness(1.08);
        }

        .popup button:active {
          transform: scale(.95);
        }

        @media
        (min-width: 701px)
        and (max-height: 850px) {

          .game-container {
            padding-top: 3px;
            padding-bottom: 3px;
          }

          .game-header {
            width:
              min(650px, 90vw);

            margin-bottom: 3px;
          }

          .game-board {
            width:
              min(460px, 88vw);

            gap: 3px;
          }
        }

        @media
        (min-width: 701px)
        and (max-height: 720px) {

          .game-header {
            width:
              min(570px, 84vw);
          }

          .game-board {
            width:
              min(400px, 78vw);

            gap: 2px;
          }
        }

        @media (max-width: 700px) {

          body {
            overflow: hidden;

            background-image:
              url("/memo/mobile.jpg");

            background-size: cover;

            background-position: center;

            background-repeat: no-repeat;
          }

          .game-container {
            width: 100%;

            height: 100dvh;

            padding:
              4px 0 8px;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: flex-start;

            overflow: hidden;
          }

          .game-header {
            width: 96vw;

            max-width: 600px;

            margin-left: auto;
            margin-right: auto;

            margin-bottom: 4px;

            align-self: center;
          }

          .game-board {
            width: 94vw;

            max-width: 500px;

            min-width: 0;

            margin-left: auto !important;
            margin-right: auto !important;

            align-self: center !important;

            justify-self: center !important;

            position: relative;

            left: 0;

            right: auto;

            transform: none;

            grid-template-columns:
              repeat(6, minmax(0, 1fr));

            grid-template-rows:
              repeat(4, auto);

            gap: 3px;
          }

          #timer,
          #moves,
          #score {
            font-size:
              clamp(
                10px,
                3.1vw,
                19px
              );
          }

          .popup {
            width:
              min(
                94vw,
                500px
              );
          }

          #betInput {
            font-size:
              clamp(
                18px,
                5vw,
                28px
              );
          }

          #textearea,
          #zontexte,
          #winInput {
            font-size:
              clamp(
                13px,
                4vw,
                24px
              );
          }
        }

        @media (max-width: 380px) {

          .game-container {
            padding-left: 0;
            padding-right: 0;
          }

          .game-header {
            width: 97vw;

            margin-left: auto;
            margin-right: auto;
          }

          .game-board {
            width: 94vw;

            margin-left: auto !important;
            margin-right: auto !important;

            gap: 2px;
          }

          #timer,
          #moves,
          #score {
            font-size:
              clamp(
                9px,
                3vw,
                15px
              );
          }
        }

        @media
        (max-width: 700px)
        and (max-height: 650px) {

          .game-header {
            width: 82vw;

            margin-bottom: 2px;
          }

          .game-board {
            width: 82vw;

            gap: 2px;
          }
        }

        @media (max-width: 700px) {

          .card {
            min-width: 0;

            max-width: 100%;
          }
        }

      `}</style>

      <div className="game-container">

        <div className="game-header">

          <img
            src="/memo/header.webp"
            alt="Header Memory"
            draggable={false}
          />

          <div
            id="timer"
            className="header-value"
          >
            {formatTime(remainingTime)}
          </div>

          <div
            id="moves"
            className="header-value"
          >
            {moves}
          </div>

          <div
            id="score"
            className="header-value"
          >
            {score}
          </div>

        </div>

        <main
          id="gameBoard"
          className="game-board"
        >
          {cards
            .slice(0, TOTAL_CARDS)
            .map((card) => (
              <div
                key={card.id}
                className={getCardClass(card)}
                onClick={() =>
                  flipCard(card.id)
                }
              >
                <div className="card-inner">

                  <div
                    className="card-face card-front"
                  >
                    <img
                      src={`/${CARD_BACK}`}
                      alt=""
                      draggable={false}
                    />
                  </div>

                  <div
                    className="card-face card-back"
                  >
                    <img
                      src={`/${card.value}`}
                      alt=""
                      draggable={false}
                    />
                  </div>

                </div>
              </div>
            ))}
        </main>

      </div>


      {/* =====================================================
          POPUP MISE
      ====================================================== */}

      {popup === "bet" && (
        <div
          className={[
            "popup-overlay",
            "active",
            popupClosing ? "closing" : "",
          ].join(" ")}
        >
          <div className="popup">

            <img
              src="/memo/bet.webp"
              className="popup-bg"
              alt="Votre mise"
              draggable={false}
            />

            <input
              id="betInput"
              type="number"
              min={100}
              step={1}
              inputMode="numeric"
              autoComplete="off"
              value={betInput}
              onChange={(event) => {
                const value =
                  event.target.value;

                if (
                  value === "" ||
                  /^\d+$/.test(value)
                ) {
                  setBetInput(value);
                }
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                ) {
                  confirmBet();
                }
              }}
            />

            <button
              id="betConfirmBtn"
              aria-label="Jouer"
              onClick={confirmBet}
            />

          </div>
        </div>
      )}


      {/* =====================================================
          POPUP OBJECTIF
      ====================================================== */}

      {popup === "objective" &&
        objective && (
          <div
            className={[
              "popup-overlay",
              "active",
              popupClosing ? "closing" : "",
            ].join(" ")}
          >
            <div className="popup">

              <img
                src="/memo/objectifs.webp"
                className="popup-bg"
                alt="Objectif"
                draggable={false}
              />

              <div id="textearea">
                {objective.text}
              </div>

              <button
                id="objectifConfirmBtn"
                aria-label="Continuer"
                onClick={
                  confirmObjective
                }
              />

            </div>
          </div>
        )}


      {/* =====================================================
          POPUP LOSS
      ====================================================== */}

      {popup === "loss" && (
        <div
          className={[
            "popup-overlay",
            "active",
            popupClosing ? "closing" : "",
          ].join(" ")}
        >
          <div className="popup">

            <img
              src="/memo/loss.webp"
              className="popup-bg"
              alt="Game Over"
              draggable={false}
            />

            <div
              id="zontexte"
              dangerouslySetInnerHTML={{
                __html: lossMessage,
              }}
            />

            <button
              id="overConfirmBtn"
              aria-label="Continuer"
              onClick={() =>
                closePopup(() => {
                  resetAfterEnd();
                })
              }
            />

          </div>
        </div>
      )}


      {/* =====================================================
          POPUP WIN
      ====================================================== */}

      {popup === "win" && (
        <div
          className={[
            "popup-overlay",
            "active",
            popupClosing ? "closing" : "",
          ].join(" ")}
        >
          <div className="popup">

            <img
              src="/memo/win.webp"
              className="popup-bg"
              alt="Game Win"
              draggable={false}
            />

            <div id="winInput">
              {winMessage}
            </div>

            <button
              id="winConfirmBtn"
              aria-label="Continuer"
              onClick={() =>
                closePopup(() => {
                  resetAfterEnd();
                })
              }
            />

          </div>
        </div>
      )}

    </>
  );
}