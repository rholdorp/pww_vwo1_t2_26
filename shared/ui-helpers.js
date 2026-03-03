// Shared UI helpers for trainer apps
(function() {
  function tag(color, text) {
    return React.createElement("span", {
      style: {
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "6px",
        fontSize: "10px",
        fontWeight: 700,
        background: color + "20",
        color: color
      }
    }, text);
  }

  function pBar(pct, color, height) {
    return React.createElement("div", {
      style: {
        height: height || "6px",
        borderRadius: "3px",
        background: "rgba(255,255,255,0.06)",
        overflow: "hidden"
      }
    }, React.createElement("div", {
      style: {
        height: "100%",
        width: Math.min(Math.round(pct), 100) + "%",
        background: color,
        borderRadius: "3px",
        transition: "width 0.5s"
      }
    }));
  }

  window.TrainerUI = { tag: tag, pBar: pBar };
})();
