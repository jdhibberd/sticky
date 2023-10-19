import React, { useEffect, useState } from "react";
import type { Collection } from "../../backend/src/lib/entity.js";

export default function App() {
  const [state, setState] = useState<Collection[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await fetch("/api/collections");
    const result = await response.json();
    setState(result);
  };

  return (
    <span>
      Hello <em>World</em>!
      <ul>
        {state.map((collection) => (
          <li key={collection.id}>{collection.name}</li>
        ))}
      </ul>
    </span>
  );
}
