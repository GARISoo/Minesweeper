/* eslint-disable no-param-reassign */
export type CellInfo = {
  position: string;
  x: number;
  y: number;
  outOfBounds?: boolean;
  value: string;
  flagged: boolean;
  chanceOfBomb: number | null;
};

export const getCellInfo = (
  x: number, y: number, field: string[][], flaggedCells: string[], columns: number, rows: number, cell: string,
) => {
  const getCellValue = (yCord: number, xCord: number) => {
    const outOfBounds = xCord < 0 || xCord >= columns || yCord < 0 || yCord >= rows;

    if (outOfBounds) {
      return '';
    }

    return field[yCord][xCord];
  };

  const middleCell = cell;

  const checkIfFlagged = (xCord: number, yCord: number) => flaggedCells.includes(`${xCord} ${yCord}`);

  const checkOneTwoOneSetup = (surroundingCells: CellInfo[], revealedBombs: number) => {
    const topCellValid = (Number(surroundingCells[1].value) - revealedBombs) === 1;
    const bottomCellValid = (Number(surroundingCells[5].value) - revealedBombs) === 1;

    if (topCellValid && bottomCellValid) {
      const rightSide = [surroundingCells[2], surroundingCells[3], surroundingCells[4]];
      const rightSideValid = rightSide.every((el) => el.value === '□' && !el.flagged);

      if (rightSideValid) {
        surroundingCells[2].chanceOfBomb = 100;
        surroundingCells[4].chanceOfBomb = 100;
      }

      const leftSide = [surroundingCells[0], surroundingCells[6], surroundingCells[7]];
      const leftSideValid = leftSide.every((el) => el.value === '□' && !el.flagged);

      if (leftSideValid) {
        surroundingCells[0].chanceOfBomb = 100;
        surroundingCells[6].chanceOfBomb = 100;
      }

      return surroundingCells;
    }

    const rightCellValid = (Number(surroundingCells[3].value) - revealedBombs) === 1;
    const leftCellValid = (Number(surroundingCells[7].value) - revealedBombs) === 1;

    if (rightCellValid && leftCellValid) {
      const topSide = [surroundingCells[0], surroundingCells[1], surroundingCells[2]];
      const topSideValid = topSide.every((el) => el.value === '□' && !el.flagged);

      if (topSideValid) {
        surroundingCells[0].chanceOfBomb = 100;
        surroundingCells[2].chanceOfBomb = 100;
      }

      const bottomSide = [surroundingCells[4], surroundingCells[5], surroundingCells[6]];
      const bottomSideValid = bottomSide.every((el) => el.value === '□' && !el.flagged);

      if (bottomSideValid) {
        surroundingCells[4].chanceOfBomb = 100;
        surroundingCells[6].chanceOfBomb = 100;
      }

      return surroundingCells;
    }

    return surroundingCells;
  };

  const surroundingCellInfo = [
    {
      position: 'topLeft',
      value: getCellValue(y - 1, x - 1),
      flagged: checkIfFlagged(x - 1, y - 1),
      chanceOfBomb: null,
      x: x - 1,
      y: y - 1,
    },
    {
      position: 'top',
      value: getCellValue(y - 1, x),
      flagged: checkIfFlagged(x, y - 1),
      chanceOfBomb: null,
      x,
      y: y - 1,
    },
    {
      position: 'topRight',
      value: getCellValue(y - 1, x + 1),
      flagged: checkIfFlagged(x + 1, y - 1),
      chanceOfBomb: null,
      x: x + 1,
      y: y - 1,
    },
    {
      position: 'right',
      value: getCellValue(y, x + 1),
      flagged: checkIfFlagged(x + 1, y),
      chanceOfBomb: null,
      x: x + 1,
      y,
    },
    {
      position: 'bottomRight',
      value: getCellValue(y + 1, x + 1),
      flagged: checkIfFlagged(x + 1, y + 1),
      chanceOfBomb: null,
      x: x + 1,
      y: y + 1,
    },
    {
      position: 'bottom',
      value: getCellValue(y + 1, x),
      flagged: checkIfFlagged(x, y + 1),
      chanceOfBomb: null,
      x,
      y: y + 1,
    },
    {
      position: 'bottomLeft',
      value: getCellValue(y + 1, x - 1),
      flagged: checkIfFlagged(x - 1, y + 1),
      chanceOfBomb: null,
      x: x - 1,
      y: y + 1,
    },
    {
      position: 'left',
      value: getCellValue(y, x - 1),
      flagged: checkIfFlagged(x - 1, y),
      chanceOfBomb: null,
      x: x - 1,
      y,
    },
  ];

  const revealedBombs = surroundingCellInfo.filter((el) => el.flagged).length;
  const unOpenedCells = surroundingCellInfo.filter((el) => el.value === '□' && !el.flagged).length;

  const cellValue = parseInt(middleCell, 10);
  const chanceToHitBomb = ((cellValue - revealedBombs) / unOpenedCells) * 100;

  // adds all surrounding cells 100% chance for a bomb
  if (chanceToHitBomb === 100) {
    const surroundingCells = surroundingCellInfo.map((el) => {
      const validCell = el.value === '□' && !el.flagged;

      if (validCell) {
        return { ...el, chanceOfBomb: 100 };
      }

      return el;
    });

    return { surroundingCells };
  }

  // adds all surrounding cells 0% chance for a bomb
  if (chanceToHitBomb === 0) {
    const surroundingCells = surroundingCellInfo.map((el) => {
      const validCell = el.value === '□' && !el.flagged;

      if (validCell) {
        return { ...el, chanceOfBomb: 0 };
      }

      return el;
    });

    return { surroundingCells };
  }

  // if chancetohitbomb is not 0 or 100, it will recalculate with specific cases
  const middleCellValid = (cellValue - revealedBombs) === 2;

  if (middleCellValid) {
    const surroundingCells = checkOneTwoOneSetup(surroundingCellInfo, revealedBombs);

    return { surroundingCells };
  }

  return { surroundingCells: surroundingCellInfo };
};
