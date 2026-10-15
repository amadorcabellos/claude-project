// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import { Clock8 } from "lucide-react";

export default function Home() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h1>
          P<Clock8 className="logo" strokeWidth={2.75} />
          cket Heist
        </h1>
        <div>In. Out. Gone.</div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pocket Heist
          lets you plan, assign, and track small covert missions around the
          office. Sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua.
        </p>
      </div>
    </div>
  );
}
