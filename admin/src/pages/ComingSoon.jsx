import { useLocation } from "react-router-dom";

export default function ComingSoon() {
  const location = useLocation();
  const title = location.pathname.replace("/", "") || "This section";

  return (
    <div className="state-block">
      <h2 style={{ textTransform: "capitalize" }}>{title.replace("-", " ")}</h2>
      <p>This module is built in a later phase.</p>
    </div>
  );
}
