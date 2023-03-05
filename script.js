const boards = document.getElementsByClassName('board');

const boardsArr = [...boards];
const boardsShort = ['ns', 'ip', 'cmp'];

const nsBoard = JSON.parse(localStorage.getItem('ns')) || [];
const ipBoard = JSON.parse(localStorage.getItem('ip')) || [];
const cmpBoard = JSON.parse(localStorage.getItem('cmp')) || [];

const boardsStorage = [nsBoard, ipBoard, cmpBoard];

let startBoardIdx;
let draggedItemIdx;

// Disable on Blur
function disabledOnBlur(input, listNum, liNum) {
  input.disabled = true;
  const boardStore = boardsStorage[listNum];
  boardStore[liNum] = input.value;
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

// Adding Event Listeners
function dragDropEvents(board) {
  const boardList = board.getElementsByClassName('list')[0];

  // Drag Start event -> dragged item
  boardList.addEventListener('dragstart', (e) => {
    startBoardIdx = boardsArr.findIndex(
      (board) => board === e.currentTarget.closest('div')
    );

    draggedItemIdx = [...e.currentTarget.getElementsByTagName('li')].findIndex(
      (el) => el === e.target
    );
  });

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
      // console.log(target.getBoundingClientRect());
      target.closest('li').classList.remove('over');
      // const { top, bottom } = target.getBoundingClientRect();

      // if (e.clientY >= bottom || e.clientY < top) {

      // }
    }
  });

  // Dropping
  boardList.addEventListener('drop', (e) => {
    let endBoardIdx;
    let droppedItemIdx;
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

      // Dropped Element Event Listeners
      droppedItem
        .getElementsByClassName('btn remove')[0]
        .addEventListener(
          'click',
          removeTaskElement.bind(
            null,
            endBoardIdx,
            draggedItemIdx + 1,
            droppedItem
          )
        );

      droppedItem
        .getElementsByClassName('btn edit')[0]
        .addEventListener('click', editTaskInput.bind(null, droppedItem));

      const input = droppedItem.getElementsByClassName('input')[0];

      input.addEventListener(
        'blur',
        disabledOnBlur.bind(null, input, endBoardIdx, droppedItemIdx)
      );

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
        boardsStorage[endBoardIdx].splice(
          0,
          0,
          droppedItem.getElementsByClassName('input')[0].value
        );

        localStorage.setItem(
          boardsShort[endBoardIdx],
          JSON.stringify(boardsStorage[endBoardIdx])
        );
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
  }
}

app();
