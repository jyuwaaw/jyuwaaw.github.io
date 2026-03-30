import React, {useContext} from "react";
import {Fade} from "react-reveal";
import "./Greeting.scss";
import SocialMedia from "../../components/socialMedia/SocialMedia";
import Button from "../../components/button/Button";
import {greeting} from "../../portfolio";
import StyleContext from "../../contexts/StyleContext";

export default function Greeting() {
  const {isDark} = useContext(StyleContext);
  if (!greeting.displayGreeting) {
    return null;
  }
  return (
    <Fade bottom duration={1000} distance="40px">
      <div className="greet-main" id="greeting">
        <div className="greeting-main">
          <div className="greeting-text-div">
            <div>
              <h1
                className={isDark ? "dark-mode greeting-text" : "greeting-text"}
              >
                {greeting.title}
              </h1>
              <p
                className={
                  isDark
                    ? "dark-mode greeting-text-p"
                    : "greeting-text-p subTitle"
                }
              >
                {greeting.subTitle}
              </p>
              <div id="resume" className="empty-div"></div>
              <SocialMedia />
              <div className="button-greeting-div">
                <Button text="Contact me" href="#contact" />
                {greeting.resumeLink && (
                  <a
                    href={require("./resume.pdf")}
                    download="Resume.pdf"
                    className="download-link-button"
                  >
                    <Button text="Download my resume" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="greeting-image-div greeting-panel">
            <div className={isDark ? "chip-card dark-mode" : "chip-card"}>
              <div className="chip-card-label">Focus</div>
              <h2>RTL • Verification • Physical Design</h2>
              <p>
                ASIC implementation and DV work across accelerator architecture,
                UVM environments, timing-driven design, and lab automation.
              </p>
              <ul className="chip-card-list">
                <li>Verilog / SystemVerilog / UVM</li>
                <li>Design Compiler / PrimeTime / Innovus / ICC2</li>
                <li>FPGA prototyping, coverage, and debug automation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Fade>
  );
}
