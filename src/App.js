import React from "react";
import "./App.scss";
import {HashRouter, Routes, Route} from "react-router-dom";
import Main from "./containers/Main";
import BlogPage from "./containers/blogPage/BlogPage";
import GaragePage from "./containers/garage/GaragePage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/garage" element={<GaragePage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
