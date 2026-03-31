import React from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import {garageSection} from "../../portfolio";
import {StyleProvider} from "../../contexts/StyleContext";
import {useLocalStorage} from "../../hooks/useLocalStorage";
import mechanicPhoto from "../../assets/images/me_as_mechanic_c63s.jpg";
import "./GaragePage.scss";

function GaragePage() {
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
        <div className="garage-page-main">
          <h1 className={isDark ? "dark-mode garage-page-title" : "garage-page-title"}>
            {garageSection.title}
          </h1>
          <p className={isDark ? "dark-mode garage-page-subtitle" : "garage-page-subtitle"}>
            {garageSection.subtitle}
          </p>
          <div className="garage-hero-wrap">
            <div className="garage-photo-card">
              <img
                className="garage-photo"
                src={mechanicPhoto}
                alt="Benji working as a mechanic"
              />
            </div>
            <div className={isDark ? "dark-mode garage-page-card" : "garage-page-card"}>
              <p className="garage-page-intro">{garageSection.intro}</p>
              <ul className="garage-page-list">
                {garageSection.highlights.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </StyleProvider>
  );
}

export default GaragePage;
