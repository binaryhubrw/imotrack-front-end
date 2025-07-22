✅ Step 5: src/components/UpdateBook.jsx
jsx
Copy
Edit
import { useState, useEffect } from "react";
import { updateBook } from "../api";

export default function UpdateBook({ selected, refresh, clear }) {
  const [title, setTitle] = useState("");
  const [pages, setPages] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    if (selected) {
      setTitle(selected.title);
      setPages(selected.pages);
      setAuthor(selected.author);
    }
  }, [selected]);

  if (!selected) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    await updateBook(selected._id, { title, pages: Number(pages), author });
    clear();
    refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Update Book</h2>
      <input value={title} onChange={e=>setTitle(e.target.value)} />
      <input value={pages} onChange={e=>setPages(e.target.value)} />
      <input value={author} onChange={e=>setAuthor(e.target.value)} />
      <button type="submit">Update</button>
      <button type="button" onClick={clear}>Cancel</button>
    </form>
  );
}
✅ Step 6: src/App.jsx
jsx
Copy
Edit
import { useState } from "react";
import BookList from "./components/BookList";
import AddBook from "./components/AddBook";
import UpdateBook from "./components/UpdateBook";

export default function App() {
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [selected, setSelected] = useState(null);

  function refresh() {
    setRefreshFlag((f) => f + 1);
  }

  return (
    <div>
      <h1>📖 Book Manager Demo</h1>
      <AddBook refresh={refresh} />
      <UpdateBook selected={selected} refresh={refresh} clear={() => setSelected(null)} />
      <BookList onSelect={(b) => setSelected(b)} refresh={refreshFlag} />
    </div>
  );
}




import { useState, useEffect } from "react";
import { updateBook } from "../api";

export default function UpdateBookNoProps() {
  // Example: local state for selected book
  const [selected, setSelected] = useState({
    _id: "1",
    title: "Sample Book",
    pages: 100,
    author: "Author Name"
  });
  const [title, setTitle] = useState("");
  const [pages, setPages] = useState("");
  const [author, setAuthor] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    if (selected) {
      setTitle(selected.title);
      setPages(selected.pages);
      setAuthor(selected.author);
    }
  }, [selected]);

  if (!selected) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    await updateBook(selected._id, { title, pages: Number(pages), author });
    setSelected(null); // clear selection
    setRefreshFlag(f => f + 1); // refresh logic
  }

  function clear() {
    setSelected(null);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Update Book</h2>
      <input value={title} onChange={e=>setTitle(e.target.value)} />
      <input value={pages} onChange={e=>setPages(e.target.value)} />
      <input value={author} onChange={e=>setAuthor(e.target.value)} />
      <button type="submit">Update</button>
      <button type="button" onClick={clear}>Cancel</button>
    </form>
  );
}