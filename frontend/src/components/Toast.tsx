import { useEffect, useState } from "react";

export type ToastType =
  | "saved"
  | "applied"
  | "interview"
  | "offer"
  | "rejected"
  | "archived";

const MESSAGES: Record<ToastType, string[]> = {
  saved: [
    "Saved.",
    "Added.",
    "Tracked.",
    "Logged.",
    "Recorded.",
    "Entry created.",
  ],
  applied: [
    "Application sent.",
    "Submitted.",
    "Applied.",
    "Sent.",
    "Application logged.",
    "Submission complete.",
  ],
  interview: [
    "Interview scheduled.",
    "Interview set.",
    "Next round.",
    "Interview confirmed.",
    "Stage updated.",
    "You’re moving forward.",
  ],
  offer: [
    "Offer on the table.",
    "That’s a strong yes.",
    "Well earned.",
    "Offer received.",
    "Decision time.",
    "This one’s real.",
  ],
  rejected: [
    "Not selected.",
    "Application closed.",
    "Rejected.",
    "Didn’t move forward.",
    "Process ended.",
    "Not a match.",
  ],
  archived: [
    "Archived.",
    "Moved to archive.",
    "Stored.",
    "Filed away.",
    "Closed out.",
    "Out of rotation.",
  ],
};

interface Props {
  visible: boolean;
  type?: ToastType;
  onHide: () => void;
}

export default function Toast({ visible, type = "saved", onHide }: Props) {
  const [message, setMessage] = useState(MESSAGES.saved[0]);

  useEffect(() => {
    if (!visible) return;
    const pool = MESSAGES[type];
    setMessage(pool[Math.floor(Math.random() * pool.length)]);
    const t = setTimeout(onHide, 3000);
    return () => clearTimeout(t);
  }, [visible, type]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300
        bg-primary-darker border border-primary rounded-lg px-5 py-2 shadow-lg text-xs font-medium
        text-background flex items-center gap-2
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
    >
      {message}
    </div>
  );
}
