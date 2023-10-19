import React, { useEffect, useState } from "react";
import type { Collection } from "../../backend/src/lib/entity.js";
import Componse from "./Compose.js";
import CollectionCard from "./CollectionCard.js";

export default function App() {
  const [state, setState] = useState<Collection[]>([]);

  useEffect(() => {
    addEventListener("collectionsChanged", onCollectionsChanged);
    fetchData();
  }, []);

  const onCollectionsChanged = () => {
    fetchData();
  };

  const fetchData = async () => {
    const response = await fetch("/api/collections");
    const result = await response.json();
    setState(result);
  };

  return (
    <span>
      <ul>
        {state.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
        <li>
          <Componse />
        </li>
      </ul>
    </span>
  );
}
