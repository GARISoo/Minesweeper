import { useState, useRef, useEffect } from 'react';
import socket from '../../socket';
import styles from './Minesweeper.module.scss';

type SurroundingCellsType = {
  position: string,
  x: number,
  y: number,
  outOfBounds?: boolean,
  value?: string,
}

const Minesweeper = () => {
  const [field, setField] = useState<string[][]>([]);
  const [previousField, setPreviousField] = useState<string[][]>([]);
  const [flaggedCells, setFlaggedCells] = useState<string[]>([]);
  const [columns, setColumns] = useState(0);
  const [rows, setRows] = useState(0);
  const [autoSolver, setAutoSolver] = useState(false);
  const [mapPause, setMapPause] = useState(false);
  const ws = useRef<any>(null);

  const newLevel = (level: number) => {
    socket.send(`new ${level}`);
    setFlaggedCells([]);
  };

  const levels = [
    {
      id: 1,
      name: 'Beginner',
      handleNewLevel: () => newLevel(1),
    },
    {
      id: 2,
      name: 'Medium',
      handleNewLevel: () => newLevel(2),
    },
    {
      id: 3,
      name: 'Advanced',
      handleNewLevel: () => newLevel(3),
    },
    {
      id: 4,
      name: 'Hardcore',
      handleNewLevel: () => newLevel(4),
    },
  ];

  const fieldsAreTheSame = (array1: any, array2: any) => {
    if (!Array.isArray(array1) && !Array.isArray(array2)) {
      return array1 === array2;
    }

    if (array1.length !== array2.length) {
      return false;
    }

    for (let i = 0, len = array1.length; i < len; i += 1) {
      if (!fieldsAreTheSame(array1[i], array2[i])) {
        return false;
      }
    }

    return true;
  };

  const openCell = (x: number, y: number) => {
    socket.send(`open ${x} ${y}`);

    // ensures the previous field is saved to compare in next response
    setPreviousField(field);
  };

  const isCellValidToOpen = ({
    value, outOfBounds, x, y,
  }: SurroundingCellsType) => {
    let isValid = true;
    const alreadyOpened = value !== '□';
    const alreadyFlagged = flaggedCells.includes(`${x}${y}`);

    if (outOfBounds || alreadyOpened || alreadyFlagged) {
      isValid = false;
    }

    return isValid;
  };

  const getSurroundingCellInfo = (x: number, y: number) => {
    const surroundingBombs = field[x][y];

    let surroundingCells = [
      {
        position: 'topLeft',
        x: x - 1,
        y: y - 1,
      },
      {
        position: 'top',
        x,
        y: y - 1,
      },
      {
        position: 'topRight',
        x: x + 1,
        y: y - 1,
      },
      {
        position: 'right',
        x: x + 1,
        y,
      },
      {
        position: 'bottomRight',
        x: x + 1,
        y: y + 1,
      },
      {
        position: 'bottom',
        x,
        y: y + 1,
      },
      {
        position: 'bottomLeft',
        x: x - 1,
        y: y + 1,
      },
      {
        position: 'left',
        x: x - 1,
        y,
      },
    ];

    let surroundingBombsRevealed = 0;

    // checks if out of bounds and adds known values of the in bounds cells
    surroundingCells = surroundingCells.map((cell) => {
      let outOfBounds = false;
      let value = '';

      if (cell.x < 0 || cell.y < 0) {
        outOfBounds = true;
      } else if (cell.x > columns || cell.y > rows) {
        outOfBounds = true;
      } else {
        value = field[cell.x][cell.y];

        const alreadyFlagged = flaggedCells.includes(`${cell.x}${cell.y}`);

        if (alreadyFlagged) {
          surroundingBombsRevealed += 1;
        }
      }

      return { ...cell, outOfBounds, value };
    });

    const validCellsForOpen = surroundingCells.filter((cell) => isCellValidToOpen(cell));

    return {
      surroundingBombs, surroundingCells, validCellsForOpen, surroundingBombsRevealed,
    };
  };

  // function requires reverse coordinates to work ex: instead of (x, y)  to => (y, x) instead
  const checkSurroundingCells = (y: number, x: number) => {
    const {
      surroundingBombs, surroundingCells, validCellsForOpen, surroundingBombsRevealed,
    } = getSurroundingCellInfo(y, x);

    // checks if all surrounding cells have been cleared of mines if so, then opens all valid cells
    if (Number(surroundingBombs) === surroundingBombsRevealed) {
      // set on pause new field mapping, before last call to open cell - unpauses to map new field
      setMapPause(true);

      const lastSendingCell = validCellsForOpen.length - 1;

      validCellsForOpen.forEach((cell, index) => {
        if (lastSendingCell === index) {
          // ensures the previous field is saved to compare in next response
          setPreviousField(field);
          setMapPause(false);
        }

        socket.send(`open ${cell.x} ${cell.y}`);
      });
    }
  };

  const autoSolve = () => {
    if (!autoSolver) {
      // tells useEffect to catch any field updates from the server
      setAutoSolver(true);

      // opens initial cell
      openCell(0, 0);

      // ensures the previous field is saved to compare in next response
      setPreviousField(field);
    } else {
      checkSurroundingCells(0, 0);
    }
  };

  useEffect(() => {
    if (autoSolver) {
      // checks if anything changed to avoid infinity loop
      if (!fieldsAreTheSame(previousField, field)) {
        autoSolve();
      }
    }
  }, [field]);

  useEffect(() => {
    socket.onopen = () => {
      socket.send('new 1');
    };

    socket.onclose = () => {
      console.log('closed');
    };

    socket.onmessage = ({ data }) => {
      console.log('map');
      if (!mapPause) {
        if (data.includes('new') || data.includes('open: OK')
         || data.includes('open: You lose') || data.includes('open: You win')) {
          socket.send('map');
        }
        if (data.includes('map')) {
          const adjustedField = data.split('\n').slice(1, -1).map((cell: any) => cell.split(''));
          setField(adjustedField);
          setColumns(adjustedField[0].length);
          setRows(adjustedField.length);
        }
      }
    };

    ws.current = socket;
  }, [field]);

  const handleOpenCell = (x: number, y: number) => {
    const checkFlaggedCell = flaggedCells.includes(`${x}${y}`);

    if (!checkFlaggedCell) {
      socket.send(`open ${x} ${y}`);

      // ensures the previous field is saved to compare in next response
      setPreviousField(field);
    }
  };

  const determineSVG = (cell: string, x: number, y: number) => {
    let path = 'assets/mines/';
    switch (cell) {
      case '0':
        path += '0.svg';
        break;
      case '1':
        path += '1.svg';
        break;
      case '2':
        path += '2.svg';
        break;
      case '3':
        path += '3.svg';
        break;
      case '4':
        path += '4.svg';
        break;
      case '5':
        path += '5.svg';
        break;
      case '6':
        path += '6.svg';
        break;
      case '7':
        path += '7.svg';
        break;
      case '8':
        path += '8.svg';
        break;
      case '□':
        path += 'empty.svg';
        break;
      case '*':
        path += 'mine.svg';
        break;
      default:
        break;
    }

    const checkFlaggedCell = flaggedCells.includes(`${x}${y}`);

    if (checkFlaggedCell) {
      path = 'assets/mines/flag.svg';
    }

    return path;
  };

  const handleRightClick = (e: any, x: number, y: number) => {
    e.preventDefault();

    const cell = `${x}${y}`;

    if (flaggedCells.includes(cell)) {
      setFlaggedCells(flaggedCells.filter((el) => el !== cell));
    } else {
      setFlaggedCells([...flaggedCells, cell]);
    }
  };

  return (
    <div>
      <button onClick={() => socket.send('help')}>help</button>
      <div>
        {levels.map(({ id, name, handleNewLevel }) => (
          <button
            className={styles.levelBtn}
            key={id}
            onClick={handleNewLevel}
          >
            {name}
          </button>
        ))}
        <button onClick={autoSolve}>Auto Solve</button>
      </div>
      <div>
        {field.map((cellsRow, y) => (
          <div key={Math.random() * 15785} className={styles.fieldRow}>
            {cellsRow.map((cell, x) => (
              <span
                className={styles.fieldCell}
                onClick={() => handleOpenCell(x, y)}
                key={Math.random() * 15785}
                onContextMenu={(e) => handleRightClick(e, x, y)}
              >
                <img src={determineSVG(cell, x, y)} alt="cell" className={styles.fieldCellSVG} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Minesweeper;
