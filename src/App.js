import './App.css';
import Board from "./Board";
import Square from "./Square";
import { useState, useEffect } from 'react';

const defaultSquares = () => (new Array(9)).fill(null);

const lines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

// Function to get cookie value by name
const getCookie = (name) => {
  const matches = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[]\/+^])/g, '\\$1')}=([^;]*)`));
  return matches ? decodeURIComponent(matches[1]) : undefined;
};

// Function to save AI learning data to cookie
const saveLearningDataToCookie = (data) => {
  const cookieValue = JSON.stringify(data);
  document.cookie = `PhiHaveBigDick=${cookieValue}; expires=Thu, 13 Jun 2025 12:00:00 GMT; path=/`;
};

// Function to get learning data from cookie
const getLearningDataFromCookie = () => {
  const learningData = getCookie('PhiHaveBigDick');
  return learningData ? JSON.parse(learningData) : [];
};

function App() {
  const [squares, setSquares] = useState(defaultSquares());
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [learningData, setLearningData] = useState(getLearningDataFromCookie());
  const [isCookieConsent, setIsCookieConsent] = useState(getCookie('cookieConsent') === 'true');
  const [cookieAccepted, setCookieAccepted] = useState(getCookie('cookieAccepted') === 'true');

  useEffect(() => {
    const isComputerTurn = squares.filter(square => square !== null).length % 2 === 1;
    const linesThatAre = (a, b, c) => {
      return lines.filter(squareIndexes => {
        const squareValues = squareIndexes.map(index => squares[index]);
        return JSON.stringify([a, b, c].sort()) === JSON.stringify(squareValues.sort());
      });
    };
    const emptyIndexes = squares
      .map((square, index) => square === null ? index : null)
      .filter(val => val !== null);
    const playerWon = linesThatAre('x', 'x', 'x').length > 0;
    const computerWon = linesThatAre('o', 'o', 'o').length > 0;

    if (playerWon) {
      setWinner('x');
    }
    if (computerWon) {
      setWinner('o');
    }
    if (!playerWon && !computerWon && emptyIndexes.length === 0) {
      setIsDraw(true);
    }

    const putComputerAt = index => {
      let newSquares = squares.slice(); // Create a copy of squares array
      newSquares[index] = 'o';
      setSquares(newSquares);

      // Save the move to learning data if consent is given
      if (isCookieConsent) {
        const newLearningData = [...learningData, { move: index, player: 'o' }];
        setLearningData(newLearningData);
        saveLearningDataToCookie(newLearningData);
      }
    };

    if (isComputerTurn && !winner && !isDraw) {
      const winingLines = linesThatAre('o', 'o', null);
      if (winingLines.length > 0) {
        const winIndex = winingLines[0].filter(index => squares[index] === null)[0];
        putComputerAt(winIndex);
        return;
      }

      const linesToBlock = linesThatAre('x', 'x', null);
      if (linesToBlock.length > 0) {
        const blockIndex = linesToBlock[0].filter(index => squares[index] === null)[0];
        putComputerAt(blockIndex);
        return;
      }

      const linesToContinue = linesThatAre('o', null, null);
      if (linesToContinue.length > 0) {
        putComputerAt(linesToContinue[0].filter(index => squares[index] === null)[0]);
        return;
      }

      const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
      putComputerAt(randomIndex);
    }
  }, [squares, winner, isDraw, learningData, isCookieConsent]);

  function handleSquareClick(index) {
    const isPlayerTurn = squares.filter(square => square !== null).length % 2 === 0;
    if (isPlayerTurn && !winner && !isDraw && squares[index] === null) {
      let newSquares = squares.slice(); // Create a copy of squares array
      newSquares[index] = 'x';
      setSquares(newSquares);

      // Save the move to learning data if consent is given
      if (isCookieConsent) {
        const newLearningData = [...learningData, { move: index, player: 'x' }];
        setLearningData(newLearningData);
        saveLearningDataToCookie(newLearningData);
      }
    }
  }

  function resetGame() {
    setSquares(defaultSquares());
    setWinner(null);
    setIsDraw(false);
    setLearningData([]);
    saveLearningDataToCookie([]);
  }

  function handleAcceptCookies() {
    setCookieAccepted(true);
    setIsCookieConsent(true); // อัพเดทค่านี้เมื่อยอมรับคุกกี้
    document.cookie = `cookieAccepted=true; expires=Sun, 31 Dec 2024 12:00:00 UTC; path=/`;
    document.cookie = `cookieConsent=true; expires=Sun, 31 Dec 2024 12:00:00 UTC; path=/`;
  }

  return (
    <main>
      {!isCookieConsent && !cookieAccepted && (
        <div className="cookie-consent">
          <p>This website uses cookies to keep you slave to AI forever, If you are not stupid enough just ignore this and don't press the button.</p>
          <button onClick={handleAcceptCookies}>I Accept</button>
        </div>
      )}
      <Board>
        {squares.map((square, index) =>
          <Square
            key={index}
            x={square === 'x' ? 1 : 0}
            o={square === 'o' ? 1 : 0}
            onClick={() => handleSquareClick(index)} />
        )}
      </Board>
      {!!winner && winner === 'x' && (
        <div className="result green">
          You WON!
        </div>
      )}
      {!!winner && winner === 'o' && (
        <div className="result red">
          You are slave of AI!
        </div>
      )}
      {isDraw && (
        <div className="result blue">
          It's a Draw!
        </div>
      )}
      {(winner || isDraw) && (
        <button onClick={resetGame} className="reset-button">
          Reset Game
        </button>
      )}
    </main>
  );
}

export default App;
