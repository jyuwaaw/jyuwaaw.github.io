import React, {useEffect, useRef} from "react";
import "./Top.scss";

export default function Top() {
  const buttonRef = useRef(null);

  function TopEvent() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  useEffect(() => {
    function scrollFunction() {
      const button = buttonRef.current;
      if (!button) return;

      if (
        document.body.scrollTop > 20 ||
        document.documentElement.scrollTop > 20
      ) {
        button.style.visibility = "visible";
      } else {
        button.style.visibility = "hidden";
      }
    }

    window.addEventListener("scroll", scrollFunction);
    scrollFunction();

    return () => {
      window.removeEventListener("scroll", scrollFunction);
    };
  }, []);

  return (
    <button ref={buttonRef} onClick={TopEvent} id="topButton" title="Go to top">
      <i className="fas fa-hand-point-up" aria-hidden="true"></i>
    </button>
  );
}
