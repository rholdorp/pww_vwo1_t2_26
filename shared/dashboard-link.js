// Shared dashboard ↔ trainer integration
(function() {
  function readParams() {
    var h = window.location.hash;
    if (!h) return null;
    var p = new URLSearchParams(h.slice(1));
    var result = {
      section: p.get("section"),
      mode: p.get("mode"),
      taskId: p.get("taskId"),
      date: p.get("date")
    };
    window.location.hash = "";
    return result;
  }

  function backUrl(date) {
    return "../../dashboard.html#day=" + date;
  }

  function checkoffUrl(taskId, date) {
    return "../../dashboard.html#checkoff=" + taskId + "&day=" + (date || "");
  }

  function backLink(dashDate) {
    if (dashDate) {
      return React.createElement("a", {
        href: backUrl(dashDate),
        style: { color: "#4d96ff", textDecoration: "none", fontSize: "13px", fontWeight: 700 }
      }, "\u2190 Planning");
    }
    return React.createElement("a", {
      href: "../../index.html",
      style: { color: "#666", textDecoration: "none", fontSize: "13px" }
    }, "\u2190 Terug");
  }

  function checkoffButton(dashTaskId, dashDate, pct) {
    if (!dashTaskId || pct < 80) return null;
    return React.createElement("a", {
      href: checkoffUrl(dashTaskId, dashDate),
      style: {
        display: "block", width: "100%", padding: "12px", borderRadius: "12px",
        border: "2px solid #6bcb77", background: "rgba(107,203,119,0.12)",
        color: "#6bcb77", fontSize: "14px", fontWeight: 800,
        textAlign: "center", textDecoration: "none", marginBottom: "8px"
      }
    }, "\u2713 Afvinken & terug naar planning");
  }

  window.DashboardLink = {
    readParams: readParams,
    backUrl: backUrl,
    checkoffUrl: checkoffUrl,
    backLink: backLink,
    checkoffButton: checkoffButton
  };
})();
