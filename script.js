const bookshelfScreen = document.getElementById("bookshelf-screen");
const detailScreen = document.getElementById("detail-screen");
const formScreen = document.getElementById("form-screen");

const backButton = document.getElementById("back-button");
const addButton = document.querySelector(".add-button");

const bookGrid = document.getElementById("book-grid");
const emptyMessage = document.getElementById("empty-message");

const detailTitle = document.getElementById("detail-title");
const detailAuthor = document.getElementById("detail-author");
const detailDate = document.getElementById("detail-date");
const detailStatus = document.getElementById("detail-status");
const detailRating = document.getElementById("detail-rating");
const detailReview = document.getElementById("detail-review");
const detailCover = document.getElementById("detail-cover");

const deleteButton = document.getElementById("delete-button");
const editButton = document.getElementById("edit-button");

const coverInput = document.getElementById("cover-input");
const saveButton = document.getElementById("save-button");

let books = [];
let selectedBookId = null;
let mode = "create";

// ----------------------
// 画面遷移
// ----------------------

addButton.addEventListener("click", () => {
  mode = "create";
  selectedBookId = null;
  document.querySelector(".book-form").reset();

  bookshelfScreen.hidden = true;
  detailScreen.hidden = true;
  formScreen.hidden = false;
});

backButton.addEventListener("click", () => {
  bookshelfScreen.hidden = false;
  detailScreen.hidden = true;
  formScreen.hidden = true;
});

// ----------------------
// 保存処理
// ----------------------

saveButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const title = document.querySelector('input[placeholder="本のタイトル"]').value;
  const author = document.querySelector('input[placeholder="著者名"]').value;
  const date = document.querySelector('input[type="date"]').value;
  const status = document.querySelector('select').value;
  const rating = document.querySelectorAll('select')[1].value;
  const review = document.querySelector('textarea').value;

  let coverImage = "./assets/book_done.png";

  // 編集時は元の画像を保持
  if (mode === "edit") {
    const targetBook = books.find((b) => b.id === selectedBookId);
    coverImage = targetBook?.coverImage || coverImage;
  }

  // 新しく画像選んだ場合は上書き
  if (coverInput.files.length > 0) {
    coverImage = await toBase64(coverInput.files[0]);
  }

  const newBook = {
    id: mode === "edit" ? selectedBookId : Date.now(),
    title,
    author,
    date,
    status,
    rating,
    review,
    coverImage
  };

  if (mode === "create") {
    books.push(newBook);
  } else {
    books = books.map((b) =>
      b.id === selectedBookId ? newBook : b
    );
  }

  localStorage.setItem("books", JSON.stringify(books));

  document.querySelector(".book-form").reset();

  formScreen.hidden = true;
  detailScreen.hidden = true;
  bookshelfScreen.hidden = false;

  renderBooks();

  mode = "create";
  selectedBookId = null;
});

// ----------------------
// データ復元
// ----------------------

const savedBooks = localStorage.getItem("books");
if (savedBooks) {
  books = JSON.parse(savedBooks);
}

renderBooks();

// ----------------------
// 本棚表示
// ----------------------

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
      <img src="${book.coverImage}" class="book-cover">
      <p class="book-label">${book.title}</p>
    `;

    article.addEventListener("click", () => {
      selectedBookId = book.id;

      detailCover.src = book.coverImage;
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

// ----------------------
// 削除
// ----------------------

deleteButton.addEventListener("click", () => {
  if (!confirm("この本の記録を削除しますか？")) return;

  books = books.filter((b) => b.id !== selectedBookId);
  localStorage.setItem("books", JSON.stringify(books));

  selectedBookId = null;

  renderBooks();

  detailScreen.hidden = true;
  bookshelfScreen.hidden = false;
});

// ----------------------
// 編集
// ----------------------

editButton.addEventListener("click", () => {
  const targetBook = books.find((b) => b.id === selectedBookId);
  if (!targetBook) return;

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

// ----------------------
// 画像変換
// ----------------------

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
