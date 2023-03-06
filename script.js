const boards = document.getElementsByClassName('board');
const lists = [...document.getElementsByTagName('ul')];
const boardsArr = [...boards];
const boardsShort = ['ns', 'ip', 'cmp'];

const nsBoard = JSON.parse(localStorage.getItem('ns')) || [];
const ipBoard = JSON.parse(localStorage.getItem('ip')) || [];
const cmpBoard = JSON.parse(localStorage.getItem('cmp')) || [];

const boardsStorage = [nsBoard, ipBoard, cmpBoard];

let startBoardIdx;
let draggedItemIdx;

let endBoardIdx;
let droppedItemIdx;

// Disable on Blur
function disabledOnBlur(input, listNum, liNum) {
  input.disabled = true;
  const boardStore = boardsStorage[listNum];
  boardStore[liNum] = input.value;
  // console.log(liNum, boardStore);
  localStorage.setItem(boardsShort[listNum], JSON.stringify(boardStore));
}

// Creating task LI
function createTaskEl(listN, liN, txt = 'New Task') {
  const board = boardsArr[listN];
  const boardList = board.getElementsByClassName('list')[0];

  const liEl = document.createElement('li');
  liEl.draggable = true;
  liEl.innerHTML = `<input class="input" value="${txt}" disabled="true"/>
  `;

  // Inserting li to DOM
  boardList.appendChild(liEl);

  const input = liEl.getElementsByClassName('input')[0];
  input.addEventListener('blur', () => {
    disabledOnBlur(input, listN, liN);
  });

  // Adding Edit Btn
  const editBtn = document.createElement('button');
  editBtn.className = 'btn edit';
  editBtn.innerHTML = `<ion-icon name="create"></ion-icon>`;
  liEl.append(editBtn);

  // Adding Remove Btn
  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn remove';
  removeBtn.innerHTML = `<ion-icon name="trash-bin"></ion-icon>`;
  liEl.append(removeBtn);

  // Adding Event Listeners
  removeBtn.addEventListener(
    'click',
    removeTaskElement.bind(null, listN, liN, liEl)
  );
  editBtn.addEventListener('click', editTaskInput.bind(null, liEl));
  return liEl;
}

// Removing TASK LI
function removeTaskElement(listNum, liNum, li) {
  // removing from DOM
  li.remove();

  // removing from Local Storage
  boardsStorage[listNum].splice(liNum, 1);
  localStorage.setItem(
    boardsShort[listNum],
    JSON.stringify(boardsStorage[listNum])
  );
}

// Editing Task Input Field
function editTaskInput(li) {
  const input = li.getElementsByClassName('input')[0];
  input.disabled = false;
  const end = input.value.length;
  input.setSelectionRange(end, end);
  input.focus();
}

// Drag Start func
function dragStart(e) {
  let targ;
  if (e.target.tagName === 'LI') {
    targ = e.target;
  } else if (e.target.tagName === 'INPUT') {
    targ = e.target.closest('li');
    // console.log(targ);
  }

  if (targ) {
    startBoardIdx = lists.findIndex((list) => list === targ.closest('ul'));

    draggedItemIdx = [...e.currentTarget.getElementsByTagName('li')].findIndex(
      (el) => el === targ
    );
  }
}

// Drop func
function touchDrop(target) {
  let droppedItem;
  let draggedItem =
    lists[startBoardIdx].getElementsByTagName('li')[draggedItemIdx];

  droppedItem = draggedItem.cloneNode(true);
  // console.log(droppedItem);

  boardsStorage[startBoardIdx].splice(draggedItemIdx, 1);

  localStorage.setItem(
    boardsShort[startBoardIdx],
    JSON.stringify(boardsStorage[startBoardIdx])
  );

  if (target === 'INPUT') {
    let liEl = lists[endBoardIdx].getElementsByTagName('li')[draggedItemIdx];
    boardsStorage[endBoardIdx].splice(
      droppedItemIdx + 1,
      0,
      droppedItem.getElementsByClassName('input')[0].value
    );
    console.log(liEl);

    // Updating Local Storage
    localStorage.setItem(
      boardsShort[endBoardIdx],
      JSON.stringify(boardsStorage[endBoardIdx])
    );

    // Inserting element
    liEl.insertAdjacentElement('afterend', droppedItem);
  } else if (target === 'UL') {
    // Append li to List
    console.log(endBoardIdx);
    console.log(lists[endBoardIdx]);
    lists[endBoardIdx].append(droppedItem);

    // Update Local Storage
    boardsStorage[endBoardIdx].push(
      droppedItem.getElementsByClassName('input')[0].value
    );

    localStorage.setItem(
      boardsShort[endBoardIdx],
      JSON.stringify(boardsStorage[endBoardIdx])
    );
  }

  // Dropped Element Event Listeners
  droppedItem
    .getElementsByClassName('btn remove')[0]
    .addEventListener(
      'click',
      removeTaskElement.bind(null, endBoardIdx, droppedItemIdx + 1, droppedItem)
    );

  droppedItem
    .getElementsByClassName('btn edit')[0]
    .addEventListener('click', editTaskInput.bind(null, droppedItem));

  const input = droppedItem.getElementsByClassName('input')[0];

  input.addEventListener(
    'blur',
    disabledOnBlur.bind(null, input, endBoardIdx, droppedItemIdx + 1 || 0)
  );

  draggedItem.remove();
}
// Adding Event Listeners
function dragDropEvents(board) {
  const boardList = board.getElementsByClassName('list')[0];

  // Drag Start event -> dragged item
  boardList.addEventListener('dragstart', dragStart);

  // Drag Over
  boardList.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  // Drag Enter
  boardList.addEventListener('dragenter', (e) => {
    const target = e.target;
    if (e.target.tagName === 'INPUT') {
      target.closest('li').classList.add('over');
    }
  });

  // Drag Leave
  boardList.addEventListener('dragleave', (e) => {
    const target = e.target;
    if (target.tagName === 'INPUT') {
      target.closest('li').classList.remove('over');
    }
  });

  // Dropping
  boardList.addEventListener('drop', (e) => {
    let droppedItem;
    let draggedItem = boardsArr[startBoardIdx]
      .getElementsByTagName('ul')[0]
      .getElementsByTagName('li')[draggedItemIdx];

    let liEl;

    // Removing hover class
    if (e.target.tagName === 'INPUT') {
      liEl = e.target.closest('li');
      liEl.classList.remove('over');
    }

    if (
      (e.target.tagName === 'INPUT' &&
        e.target.closest('li') !== draggedItem) ||
      e.target.tagName === 'UL'
    ) {
      endBoardIdx = boardsArr.findIndex(
        (board) => board === e.currentTarget.closest('div')
      );

      droppedItem = draggedItem.cloneNode(true);

      boardsStorage[startBoardIdx].splice(draggedItemIdx, 1);

      localStorage.setItem(
        boardsShort[startBoardIdx],
        JSON.stringify(boardsStorage[startBoardIdx])
      );

      draggedItem.remove();

      if (e.target.tagName === 'INPUT') {
        // Finding dropping Idx
        droppedItemIdx = [
          ...e.currentTarget.getElementsByTagName('li'),
        ].findIndex((el) => el === liEl);
        boardsStorage[endBoardIdx].splice(
          droppedItemIdx + 1,
          0,
          droppedItem.getElementsByClassName('input')[0].value
        );

        // Updating Local Storage
        localStorage.setItem(
          boardsShort[endBoardIdx],
          JSON.stringify(boardsStorage[endBoardIdx])
        );

        // Inserting element
        liEl.insertAdjacentElement('afterend', droppedItem);
      } else if (e.target.tagName === 'UL') {
        // Append li to List
        e.target.append(droppedItem);

        // Update Local Storage
        boardsStorage[endBoardIdx].push(
          droppedItem.getElementsByClassName('input')[0].value
        );

        localStorage.setItem(
          boardsShort[endBoardIdx],
          JSON.stringify(boardsStorage[endBoardIdx])
        );
      }

      // Dropped Element Event Listeners
      droppedItem
        .getElementsByClassName('btn remove')[0]
        .addEventListener(
          'click',
          removeTaskElement.bind(
            null,
            endBoardIdx,
            droppedItemIdx + 1,
            droppedItem
          )
        );

      droppedItem
        .getElementsByClassName('btn edit')[0]
        .addEventListener('click', editTaskInput.bind(null, droppedItem));

      const input = droppedItem.getElementsByClassName('input')[0];
      input.addEventListener(
        'blur',
        disabledOnBlur.bind(null, input, endBoardIdx, droppedItemIdx + 1 || 0)
      );
    }
  });
}

// Enabling drag and drop on touch devices
function dragDropTouchEvents(board) {
  const boardList = board.getElementsByClassName('list')[0];

  boardList.addEventListener('touchstart', dragStart);

  board.addEventListener('touchend', (e) => {
    if (
      endBoardIdx >= 0 &&
      (endBoardIdx !== startBoardIdx || droppedItemIdx !== draggedItemIdx)
    ) {
      // console.log(endBoardIdx, droppedItemIdx);
      if (droppedItemIdx >= 0) {
        touchDrop('INPUT');
      } else {
        touchDrop('UL');
      }
    }
  });

  board.addEventListener('touchmove', (e) => {
    // console.log(e.changedTouches[0].target.tagName === 'INPUT');
    if (e.changedTouches[0].target.tagName === 'INPUT') {
      e.preventDefault();
      const currY = e.changedTouches[0].clientY;
      const currX = e.changedTouches[0].clientX;
      // console.log(e.changedTouches[0].clientY);

      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;

      // console.log(scrollTop, clientHeight);
      // console.log(Math.abs((scrollHeight - scrollTop) % clientHeight));
      // console.log(
      //   Math.abs(clientHeight - (scrollTop % clientHeight)) >= clientHeight - 60
      // );
      if (currY + 40 >= clientHeight) {
        window.scrollBy({
          top: 20,
          behavior: 'smooth',
        });
      } else if (currY <= 40) {
        window.scrollBy({
          top: -20,
          behavior: 'smooth',
        });
      }

      // Calculting lists dimensions
      const rects = [];
      const lists = [...document.getElementsByTagName('ul')];
      lists.forEach((list) => rects.push(list.getBoundingClientRect()));

      // Current list Idx
      const idx = rects.findIndex((rect) => {
        return (
          currY >= rect.top &&
          currY <= rect.bottom &&
          currX >= rect.left &&
          currY <= rect.right
        );
      });

      let liEls;
      // Current li Idx
      let liIdx;
      if (idx >= 0) {
        liEls = [...lists[idx].getElementsByTagName('li')];
        liIdx = liEls.findIndex((el) => {
          const { top, bottom } = el.getBoundingClientRect();
          return currY >= top && currY <= bottom + 10;
        });
      }

      // console.log(idx, liIdx);
      const allLis = [...document.getElementsByTagName('li')];

      // console.log(liIdx);
      if (e.target.tagName === 'INPUT') {
        if (liIdx !== droppedItemIdx) {
          endBoardIdx = idx;
          droppedItemIdx = liIdx;
          allLis.forEach((li) => li.classList.remove('over'));
          if (liIdx >= 0) liEls[liIdx].classList.add('over');
        }
      }
    }
  });
}

function app() {
  // Loop through all boards
  for (let i = 0; i < boardsArr.length; i++) {
    // Getting board and shortcut from arrays
    const board = boardsArr[i];
    const boardShort = boardsShort[i];
    const oldBoard = boardsStorage[i];

    // Selecting DOM elements
    const boardList = board.getElementsByClassName('list')[0];
    const addBtn = board.getElementsByClassName('btn btn--big')[0];

    // Rednering Stored Board
    if (oldBoard.length > 0) {
      for (let j = 0; j < oldBoard.length; j++) {
        const text = oldBoard[j];
        const newTask = createTaskEl(i, j, text);
      }
    }

    // Adding new Tasks
    addBtn.addEventListener('click', () => {
      const taskObj = 'New Task';
      const newTask = createTaskEl(i, oldBoard.length);
      oldBoard.push(taskObj);

      const input = newTask.getElementsByClassName('input')[0];
      input.disabled = false;
      input.select();
      localStorage.setItem(boardShort, JSON.stringify(oldBoard));
    });

    // Add Drag & Drop Event Listeners
    dragDropEvents(board);
    dragDropTouchEvents(board);
  }
}

app();
