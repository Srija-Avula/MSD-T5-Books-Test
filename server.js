const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'books.json');

app.use(express.json());

function readBooksFile() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading books file:', err);
    return [];
  }
}

function writeBooksFile(books) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing books file:', err);
  }
}


app.get('/books', (req, res) => {
  const books = readBooksFile();
  res.json(books);
});


app.get('/books/available', (req, res) => {
  const books = readBooksFile();
  const availableBooks = books.filter(b => b.available === true);
  res.json(availableBooks);
});


app.post('/books', (req, res) => {
  const { title, author, available } = req.body;

  if (!title || !author || available === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const books = readBooksFile();
  const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
  const newBook = { id: newId, title, author, available };

  books.push(newBook);
  writeBooksFile(books);

  res.status(201).json(newBook);
});

app.put('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  const { title, author, available } = req.body;

  const books = readBooksFile();
  const index = books.findIndex(b => b.id === bookId);

  if (index === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  
  if (title !== undefined) books[index].title = title;
  if (author !== undefined) books[index].author = author;
  if (available !== undefined) books[index].available = available;

  writeBooksFile(books);
  res.json(books[index]);
});


app.delete('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  let books = readBooksFile();
  const index = books.findIndex(b => b.id === bookId);

  if (index === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const deletedBook = books.splice(index, 1)[0];
  writeBooksFile(books);
  res.json({ message: 'Book deleted', deletedBook });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});


app.listen(PORT, () => {
  console.log(`📚 Book API running on http://localhost:${PORT}`);
});
