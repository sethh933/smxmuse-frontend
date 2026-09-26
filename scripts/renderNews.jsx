import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { NotesIndexPage, NotePostPage } from "../src/NotesPage.jsx";

// Render the actual page components so headings, text and entity links stay
// identical to the interactive version. Effects/API calls do not run here.
export function renderNews(path, data) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/news" element={<NotesIndexPage initialPosts={data.posts} />} />
        <Route path="/news/:slug" element={<NotePostPage initialPost={data.post} />} />
      </Routes>
    </MemoryRouter>
  );
}
