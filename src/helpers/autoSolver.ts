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

  const getSurroundingCellInfo = (xCord: number, yCord: number, specifics: string) => {
    const cells = [{
      position: 'topleft',
      value: getCellValue(yCord - 1, xCord - 1),
      flagged: checkIfFlagged(xCord - 1, yCord - 1),
      chanceOfBomb: null,
      x: xCord - 1,
      y: yCord - 1,
    },
    {
      position: 'top',
      value: getCellValue(yCord - 1, xCord),
      flagged: checkIfFlagged(xCord, yCord - 1),
      chanceOfBomb: null,
      x: xCord,
      y: yCord - 1,
    },
    {
      position: 'topright',
      value: getCellValue(yCord - 1, xCord + 1),
      flagged: checkIfFlagged(xCord + 1, yCord - 1),
      chanceOfBomb: null,
      x: xCord + 1,
      y: yCord - 1,
    },
    {
      position: 'right',
      value: getCellValue(yCord, xCord + 1),
      flagged: checkIfFlagged(xCord + 1, yCord),
      chanceOfBomb: null,
      x: xCord + 1,
      y: yCord,
    },
    {
      position: 'bottomright',
      value: getCellValue(yCord + 1, xCord + 1),
      flagged: checkIfFlagged(xCord + 1, yCord + 1),
      chanceOfBomb: null,
      x: xCord + 1,
      y: yCord + 1,
    },
    {
      position: 'bottom',
      value: getCellValue(yCord + 1, xCord),
      flagged: checkIfFlagged(xCord, yCord + 1),
      chanceOfBomb: null,
      x: xCord,
      y: yCord + 1,
    },
    {
      position: 'bottomleft',
      value: getCellValue(yCord + 1, xCord - 1),
      flagged: checkIfFlagged(xCord - 1, yCord + 1),
      chanceOfBomb: null,
      x: xCord - 1,
      y: yCord + 1,
    },
    {
      position: 'left',
      value: getCellValue(yCord, xCord - 1),
      flagged: checkIfFlagged(xCord - 1, yCord),
      chanceOfBomb: null,
      x: xCord - 1,
      y: yCord,
    }];

    const specificCells = specifics === 'all' ? cells : cells.filter(({ position }) => position.includes(specifics));

    return specificCells;
  };

  const checkOneTwoOneSetup = (surroundingCells: CellInfo[], revealedBombs: number) => {
    const topCellInBounds = !surroundingCells[1].outOfBounds;
    const bottomCellInBounds = !surroundingCells[5].outOfBounds;

    const topCellSurroundingCells = topCellInBounds && getSurroundingCellInfo(x, y - 1, 'all');
    let topCellRevealedBombs = 0;

    if (topCellSurroundingCells) {
      topCellRevealedBombs = topCellSurroundingCells.filter(({ flagged }) => flagged).length;
    }

    const bottomCellSurroundingCells = bottomCellInBounds && getSurroundingCellInfo(x, y + 1, 'all');
    let bottomCellRevealedBombs = 0;

    if (bottomCellSurroundingCells) {
      bottomCellRevealedBombs = bottomCellSurroundingCells.filter(({ flagged }) => flagged).length;
    }

    const topCellValid = (Number(surroundingCells[1].value) - topCellRevealedBombs) === 1;
    const bottomCellValid = (Number(surroundingCells[5].value) - bottomCellRevealedBombs) === 1;

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

    const leftCellInBounds = !surroundingCells[7].outOfBounds;
    const rightCellInBounds = !surroundingCells[3].outOfBounds;

    const leftCellSurroundingCells = leftCellInBounds && getSurroundingCellInfo(x - 1, y, 'all');
    let leftCellRevealedBombs = 0;

    if (leftCellSurroundingCells) {
      leftCellRevealedBombs = leftCellSurroundingCells.filter(({ flagged }) => flagged).length;
    }

    const rightCellSurroundingCells = rightCellInBounds && getSurroundingCellInfo(x + 1, y, 'all');
    let rightCellRevealedBombs = 0;

    if (rightCellSurroundingCells) {
      rightCellRevealedBombs = rightCellSurroundingCells.filter(({ flagged }) => flagged).length;
    }

    const rightCellValid = (Number(surroundingCells[3].value) - rightCellRevealedBombs) === 1;
    const leftCellValid = (Number(surroundingCells[7].value) - leftCellRevealedBombs) === 1;

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

  const surroundingCellInfo = getSurroundingCellInfo(x, y, 'all');

  const cellCleared = surroundingCellInfo.every(({ value, flagged }) => value !== '□' || flagged);

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

  return { surroundingCells: surroundingCellInfo, cellCleared };
};
