import React, { useEffect, useState } from "react";
import type { Collection } from "../../backend/src/lib/entity.js";
import Componse from "./Compose.js";

export default function App() {
  const [state, setState] = useState<Collection[]>([]);

  useEffect(() => {
    addEventListener("composed", onComposed);
    fetchData();
  }, []);

  const onComposed = () => {
    fetchData();
  };

  const fetchData = async () => {
    const response = await fetch("/api/collections");
    const result = await response.json();
    setState(result);
  };

  const onDeleteClick = async (collection: Collection) => {
    await fetch(`/api/collections/${collection.id}`, {
      method: "DELETE",
    });
    fetchData();
  };

  return (
    <span>
      <ul>
        {state.map((collection) => (
          <li key={collection.id}>
            {collection.name}
            <button onClick={() => onDeleteClick(collection)}>Delete</button>
          </li>
        ))}
      </ul>
      <Componse />
    </span>
  );
}
