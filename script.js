const bookshelfScreen = document.getElementById("bookshelf-screen");
const detailScreen = document.getElementById("detail-screen");
const formScreen = document.getElementById("form-screen");

const backButton = document.getElementById("back-button");
const addButton = document.querySelector(".add-button");
const bookCards = document.querySelectorAll(".book-card");

const bookGrid = document.getElementById("book-grid");
const emptyMessage = document.getElementById("empty-message");

const detailTitle = document.getElementById("detail-title");
const detailAuthor = document.getElementById("detail-author");
const detailDate = document.getElementById("detail-date");
const detailStatus = document.getElementById("detail-status");
const detailRating = document.getElementById("detail-rating");
const detailReview = document.getElementById("detail-review");

const deleteButton = document.getElementById("delete-button");
const editButton = document.getElementById("edit-button");
const coverInput = document.getElementById("cover-input");
const detailCover = document.getElementById("detail-cover");

let book = [];
let selectedBookId = null;
let mode = "create"

bookCards.forEach((card) => {
  card.addEventListener("click", () => {
    bookshelfScreen.hidden = true;
    detailScreen.hidden = false;
    formScreen.hidden = true;
  });
});

addButton.addEventListener("click", () => {
  bookshelfScreen.hidden = true;
  detailScreen.hidden = true;
  formScreen.hidden = false;
});

backButton.addEventListener("click", () => {
  bookshelfScreen.hidden = false;
  detailScreen.hidden = true;
  formScreen.hidden = true;
});

//データ保存
let books = [];
const saveButton = document.getElementById("save-button");

saveButton.addEventListener("click", async(e) => {
  e.preventDefault();

  const title = document.querySelector('input[placeholder="本のタイトル"]').value;
  const author = document.querySelector('input[placeholder="著者名"]').value;
  const date = document.querySelector('input[type="date"]').value;
  const status = document.querySelector('select').value;
  const rating = document.querySelectorAll('select')[1].value;
  const review = document.querySelector('textarea').value;

  let coverImage = "./assets/book_done.png";

if (coverInput.files.length > 0) {
  coverImage = await toBase64(coverInput.files[0]);
}

  const newBook = {
    id: Date.now(),
    title,
    author,
    date,
    status,
    rating,
    review,
    coverImage
  };
  if(mode === "create"){
  books.push(newBook);
  }
  if(mode === "edit"){
    books = books.map((book) => {
      if (book.id === selectedBookId){
        return{
          ...newBook,
          id: selectedBookId
        };
      }
      return book;
    });
  }
  localStorage.setItem("books", JSON.stringify(books));

  console.log("保存した本:", newBook);
  // 追加：入力欄を空にする
  document.querySelector(".book-form").reset();

  // 追加：保存後に本棚へ戻る
  formScreen.hidden = true;
  detailScreen.hidden = true;
  bookshelfScreen.hidden = false;
  renderBooks();
  mode = "create";
  selectedBookId = null;
});

//復元
const savedBooks = localStorage.getItem("books");

if (savedBooks) {
  books = JSON.parse(savedBooks);
  console.log("復元された本:", books);
}
renderBooks(); 

//本棚に表示
function renderBooks() {
  bookGrid.innerHTML = "";
  if (books.length === 0) {
    emptyMessage.hidden = false;
    bookGrid.hidden = true;
    return;
  }

  emptyMessage.hidden = true;
  bookGrid.hidden = false;

  books.forEach((book) => {
    const article = document.createElement("article");
    article.className = "book-card";

    article.innerHTML = `
      <img src="${book.coverImage || './assets/book_done.png'}" alt="本の表紙" class="book-cover">
      <p class="book-label">${book.title}</p>
    `;

    article.addEventListener("click", () => {
  selectedBookId = book.id;
  detailCover.src = book.coverImage || "./assets/book_done.png";
  detailTitle.textContent = book.title;
  detailAuthor.textContent = book.author;
  detailDate.textContent = book.date;
  detailStatus.textContent = book.status;
  detailRating.textContent = book.rating;
  detailReview.textContent = book.review;

  bookshelfScreen.hidden = true;
  detailScreen.hidden = false;
  formScreen.hidden = true;
});
    bookGrid.appendChild(article);
  });
}
//削除処理
deleteButton.addEventListener("click", () => {
  const isConfirm = confirm("この本の記録を削除しますか？");

  if (!isConfirm) {
    return; // キャンセルなら何もしない
  }

  books = books.filter((book) => book.id !== selectedBookId);

  localStorage.setItem("books", JSON.stringify(books));

  selectedBookId = null;

  renderBooks();

  detailScreen.hidden = true;
  formScreen.hidden = true;
  bookshelfScreen.hidden = false;
});
//編集処理
editButton.addEventListener("click", () => {
  const targetBook = books.find((book) => book.id === selectedBookId);

  if (!targetBook) {
    return;
  }

  mode = "edit";

  document.querySelector('input[placeholder="本のタイトル"]').value = targetBook.title;
  document.querySelector('input[placeholder="著者名"]').value = targetBook.author;
  document.querySelector('input[type="date"]').value = targetBook.date;
  document.querySelector('select').value = targetBook.status;
  document.querySelectorAll('select')[1].value = targetBook.rating;
  document.querySelector('textarea').value = targetBook.review;

  bookshelfScreen.hidden = true;
  detailScreen.hidden = true;
  formScreen.hidden = false;
});
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}
