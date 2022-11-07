import { useState, useRef, useEffect } from 'react';
import autoSolve from '../../helpers/autoSolver';
import socket from '../../socket';
import styles from './Minesweepers.module.scss';

const Minesweepers = () => {
  const [field, setField] = useState<string[][]>([]);
  const [flaggedCells, setFlaggedCells] = useState<string[]>([]);
  const ws = useRef<any>(null);

  const newLevel = (level: number) => {
    socket.send(`new ${level}`);
    setFlaggedCells([]);
  };

  const flagCellAsBomb = (x: number, y: number, value: string) => {
    const cell = `${x} ${y}`;

    if (value === '□') {
      if (flaggedCells.includes(cell)) {
        setFlaggedCells(flaggedCells.filter((el) => el !== cell));
      } else {
        setFlaggedCells([...flaggedCells, cell]);
      }
    }
  };

  const flagManyCellsAsBomb = (cells: string[]) => {
    setFlaggedCells([...flaggedCells, ...cells]);
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

  const openCell = (x: number, y: number) => {
    socket.send(`open ${x} ${y}`);
    console.log('open', x, y);
  };

  useEffect(() => {
    socket.onopen = () => {
      socket.send('new 1');
    };

    socket.onclose = () => {
      console.log('closed');
    };

    socket.onmessage = ({ data }) => {
      console.log(data);
      const isNewMap = data.includes('map');

      if (isNewMap) {
        const adjustedField = data.split('\n').slice(1, -1).map((cell: any) => cell.split(''));
        setField(adjustedField);
      } else {
        socket.send('map');
      }
    };

    ws.current = socket;
  }, []);

  const handleOpenCell = (x: number, y: number) => {
    const checkFlaggedCell = flaggedCells.includes(`${x} ${y}`);

    if (!checkFlaggedCell) {
      openCell(x, y);
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

    const checkFlaggedCell = flaggedCells.includes(`${x} ${y}`);

    if (checkFlaggedCell) {
      path = 'assets/mines/flag.svg';
    }

    return path;
  };

  const handleRightClick = (e: any, x: number, y: number, value: string) => {
    e.preventDefault();

    flagCellAsBomb(x, y, value);
  };

  const tryToSolve = () => {
    let i = 0;
    const { cellsToOpen, cellsToFlag } = autoSolve(field, flaggedCells);
    if (cellsToFlag.length) {
      i += 1;
      flagManyCellsAsBomb(cellsToFlag);
      console.log('looping:', i);
      // tryToSolve();
    }
    if (cellsToOpen.length) {
      cellsToOpen.forEach((cell) => {
        const [x, y] = cell.split(' ');
        openCell(Number(x), Number(y));
      });
    }
    console.log('cellsToOpen:', cellsToOpen, 'cellsToFlag:', cellsToFlag);
  };

  return (
    <div>
      <button onClick={() => socket.send('help')}>help</button>
      <button onClick={tryToSolve}>solve</button>
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
      </div>
      <div>
        {field.map((cellsRow, y) => (
          <div key={Math.random() * 15785} className={styles.fieldRow}>
            {cellsRow.map((cell, x) => (
              <span
                className={styles.fieldCell}
                onClick={() => handleOpenCell(x, y)}
                key={Math.random() * 15785}
                onContextMenu={(e) => handleRightClick(e, x, y, cell)}
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

export default Minesweepers;
