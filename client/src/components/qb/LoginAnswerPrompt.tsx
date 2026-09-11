import { Link } from "react-router-dom";

// Shown where an answer/explanation would be when the visitor is anonymous.
// The API omits answer fields for anonymous callers (A5.5), so without this
// the reveal toggles would reveal an empty box.
export default function LoginAnswerPrompt() {
  return (
    <Link
      to="/login"
      className="block w-full rounded-2xl bg-chart-6 py-2.5 text-center font-semibold text-sm max-sm:text-xs shadow-2xl hover:opacity-75"
    >
      Log in to see the answer
    </Link>
  );
}
