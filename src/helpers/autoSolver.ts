type CellInfo = {
  position: string;
  x: number;
  y: number;
  outOfBounds?: boolean;
  value: string;
  flagged: boolean;
};

const getSurroundingCellsInfo = (
  cell: string, x: number, y: number, field: string[][], flaggedCells: string[], columns: number, rows: number,
) => {
  const cellsToOpen = [];
  const cellsToFlag = [];
  let surroundingBombsRevealed: string[] = [];

  if (cell === '0' || cell === '□') {
    return null;
  }

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

  // checks if out of bounds and adds known values of the in bounds cells
  surroundingCells = surroundingCells.map((el) => {
    let outOfBounds = false;
    let value = '';

    if (el.x < 0 || el.y < 0) {
      outOfBounds = true;
    } else if (el.x >= columns || el.y >= rows) {
      outOfBounds = true;
    } else {
      value = field[el.x][el.y];

      const alreadyFlagged = flaggedCells.includes(`${el.x} ${el.y}`);

      if (alreadyFlagged) {
        surroundingBombsRevealed = [...surroundingBombsRevealed, `${el.x} ${el.y}`];
      }
    }

    return { ...el, outOfBounds, value };
  });

  return surroundingCells;
};

const getCellInfo = (
  x: number, y: number, field: string[][], flaggedCells: string[], columns: number, rows: number,
) => {
  const surroundingCells = [
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

  let revealedBombs = 0;
  let unOpenedCells = 0;

  // checks if out of bounds and adds known values of the in bounds cells
  const surroundingCellsInfo = surroundingCells.map((el) => {
    let outOfBounds = false;
    let value = '';
    let flagged = false;

    if (el.x < 0 || el.y < 0) {
      outOfBounds = true;
    } else if (el.x >= columns || el.y >= rows) {
      outOfBounds = true;
    } else {
      value = field[el.y][el.x];
      const alreadyFlagged = flaggedCells.includes(`${el.x} ${el.y}`);

      if (alreadyFlagged) {
        flagged = true;
        revealedBombs += 1;
      } else if (value === '□') {
        unOpenedCells += 1;
      }
    }

    return {
      ...el, outOfBounds, value, flagged,
    };
  });

  return { cellInfo: surroundingCellsInfo, revealedBombs, unOpenedCells };
};

const checkCellStatus = (cellInfo: CellInfo[]) => {

};

const autoSolve = (field: string[][], flaggedCells: string[]) => {
  const columns = field[0].length;
  const rows = field.length;

  const cellsToFlag: string[] = [];
  const cellsToOpen: string[] = [];

  field.forEach((row, y) => row.forEach((cell, x) => {
    const cellNotOpened = cell === '□' || cell === '0';

    if (!cellNotOpened) {
      const { cellInfo, revealedBombs, unOpenedCells } = getCellInfo(x, y, field, flaggedCells, columns, rows);
      const cellValue = parseInt(cell, 10);
      const chanceForBombOnAnyEmptyCell = ((cellValue - revealedBombs) / unOpenedCells) * 100;
      const allSurroundingCellsAreSafe = chanceForBombOnAnyEmptyCell === 0;
      const allSurroundingCellsAreDangerous = chanceForBombOnAnyEmptyCell === 100;

      if (allSurroundingCellsAreDangerous) {
        cellInfo.forEach((el) => {
          const goodToPush = !el.outOfBounds && !el.flagged && el.value === '□';
          const alreadyPushed = cellsToFlag.includes(`${el.x} ${el.y}`);
          if (!alreadyPushed && goodToPush) {
            cellsToFlag.push(`${el.x} ${el.y}`);
          }
        });
      } else if (allSurroundingCellsAreSafe) {
        cellInfo.forEach((el) => {
          const goodToPush = !el.outOfBounds && !el.flagged && el.value === '□';
          const alreadyPushed = cellsToOpen.includes(`${el.x} ${el.y}`);
          if (!alreadyPushed && goodToPush) {
            cellsToOpen.push(`${el.x} ${el.y}`);
          }
        });
      }
    }
  }));

  return { cellsToFlag, cellsToOpen };
};

// make an algorithm for minesweeper auto solver

export default autoSolve;
