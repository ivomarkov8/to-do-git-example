const STORAGE = "sessionStorage";
const TODOS_STORAGE_KEYS = "todos";

const addToDoBtn = document.getElementById("add-to-do-btn");
const toDoContainerDone = document.querySelector("#to-do-container-done");
const toDoContainerInProgress = document.querySelector(
  "#to-do-container-in-progress"
);
const toDoInput = document.getElementsByTagName("input")[0];
const toDoSourceElement = document.getElementById("todo-source-select");

let toDos = [];
let localToDos = [];
let remoteToDos = [];
let toDosSource = toDoSourceElement.value;

function saveToDos() {
  window[STORAGE].setItem(TODOS_STORAGE_KEYS, JSON.stringify(localToDos));
}

function loadToDos() {
  const storedToDos = JSON.parse(window[STORAGE].getItem(TODOS_STORAGE_KEYS));
  if (storedToDos) {
    localToDos = storedToDos;
  }
}

function createToDoElement(todo) {
  const divElement = document.createElement("div");
  divElement.classList.add("to-do-instance");

  const pElement = document.createElement("p");
  console.log(todo);
  console.log(todo["title"]);

  pElement.textContent = todo.content ?? todo.title;

  if (toDosSource === "local") {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.addEventListener("click", () => {
      deleteToDo(todo.content);
    });
    divElement.appendChild(deleteBtn);
  }

  const checkBox = document.createElement("input");
  checkBox.setAttribute("type", "checkbox");
  checkBox.checked = todo.completed;
  checkBox.addEventListener("click", () => {
    toggleDone(todo);
    if (toDosSource === "local") {
      saveToDos();
    }
    renderToDos();
  });

  divElement.appendChild(checkBox);
  divElement.appendChild(pElement);

  return divElement;
}

function renderToDos() {
  toDoContainerDone.innerHTML = "";
  toDoContainerInProgress.innerHTML = "";
  toDos = toDosSource === "local" ? localToDos : remoteToDos;
  toDos.forEach((todo) => {
    const newToDoElement = createToDoElement(todo);
    if (todo.completed) {
      toDoContainerDone.appendChild(newToDoElement);
    } else {
      toDoContainerInProgress.appendChild(newToDoElement);
    }
  });
}

function addToDo() {
  const validText = toDoInput.value.trim();
  if (!validText) {
    alert("Not good");
    return;
  }

  const toDoObj = {
    content: validText,
    completed: false,
  };

  localToDos.push(toDoObj);
  toDoInput.value = "";
  saveToDos();
  renderToDos();
}

function deleteToDo(todo) {
  localToDos = localToDos.filter((el) => el.content !== todo);
  saveToDos();
  loadToDos();
  renderToDos();
}

function toggleDone(todo) {
  todo.completed = !todo.completed;
}

function fetchRemoteTodos() {
  return fetch("https://jsonplaceholder.typicode.com/todos?userId=1")
    .then((res) => res.json())
    .then((res) => (remoteToDos = res));
}

async function handleToDoSource() {
  if (remoteToDos.length === 0) {
    remoteToDos = await fetchRemoteTodos();
  }
  toDosSource = toDoSourceElement.value;
  renderToDos();
}

loadToDos();
renderToDos();

addToDoBtn.addEventListener("click", addToDo);
toDoSourceElement.addEventListener("change", handleToDoSource);