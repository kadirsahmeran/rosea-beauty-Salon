import { useEffect } from "react";

export default function FirstLoadGate({ onReady, children }) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  return children;
}
