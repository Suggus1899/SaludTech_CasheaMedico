"use client";

import { useEffect, useState } from "react";

export default function MockProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MOCK_API === "true") {
      import("../mocks/browser").then(({ worker }) => {
        worker.start({ onUnhandledRequest: "bypass" }).then(() => setReady(true));
      });
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}
