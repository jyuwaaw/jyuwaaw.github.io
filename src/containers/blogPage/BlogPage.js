import React from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import {blogSection} from "../../portfolio";
import {StyleProvider} from "../../contexts/StyleContext";
import {useLocalStorage} from "../../hooks/useLocalStorage";
import "./BlogPage.scss";

function BlogPage() {
  const darkPref =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : {matches: false};
  const [isDark, setIsDark] = useLocalStorage("isDark", darkPref.matches);

  const changeTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <StyleProvider value={{isDark: isDark, changeTheme: changeTheme}}>
      <div className={isDark ? "dark-mode" : null}>
        <Header />
        <div className="blog-page-main">
          <h1 className={isDark ? "dark-mode blog-page-title" : "blog-page-title"}>
            {blogSection.title}
          </h1>
          {blogSection.subtitle ? (
            <p className={isDark ? "dark-mode blog-page-subtitle" : "blog-page-subtitle"}>
              {blogSection.subtitle}
            </p>
          ) : null}
          <div className="blog-page-list">
            {blogSection.blogs.length === 0 ? (
              <p className={isDark ? "dark-mode blog-page-empty" : "blog-page-empty"}>
                No posts yet. Add entries to <code>blogSection.blogs</code> in{" "}
                <code>src/portfolio.js</code> to publish a post.
              </p>
            ) : (
              blogSection.blogs.map((blog, i) => (
                <div
                  key={i}
                  className={isDark ? "dark-mode blog-post-card" : "blog-post-card"}
                >
                  <div className="blog-post-meta">
                    {blog.date && (
                      <span className="blog-post-date">{blog.date}</span>
                    )}
                    {blog.tags &&
                      blog.tags.map((tag, j) => (
                        <span key={j} className="blog-post-tag">
                          {tag}
                        </span>
                      ))}
                  </div>
                  <h2 className={isDark ? "dark-mode blog-post-title" : "blog-post-title"}>
                    {blog.url ? (
                      <a
                        href={blog.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={isDark ? "dark-mode blog-post-link" : "blog-post-link"}
                      >
                        {blog.title}
                      </a>
                    ) : (
                      blog.title
                    )}
                  </h2>
                  <p className={isDark ? "dark-mode blog-post-desc" : "blog-post-desc"}>
                    {blog.description}
                  </p>
                  {blog.url && (
                    <a
                      href={blog.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="blog-post-read-more"
                    >
                      Read more →
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        <Footer />
      </div>
    </StyleProvider>
  );
}

export default BlogPage;
