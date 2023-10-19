import React, { useState } from "react";
import type { Collection } from "../../backend/src/lib/entity.js";

type Props = {
  collection: Collection;
};

export default function CollectionCard({ collection }: Props) {
  const [state, setState] = useState<string>(collection.name);

  const onDeleteClick = async () => {
    await fetch(`/api/collections/${collection.id}`, {
      method: "DELETE",
    });
    dispatchEvent(new Event("collectionsChanged"));
  };

  const onKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.code === "Enter") {
      await fetch("/api/collections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: collection.id, name: state }),
      });
      dispatchEvent(new Event("collectionsChanged"));
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(event.target.value);
  };

  const onBlur = (event: React.FocusEvent) => {
    setState(collection.name);
  };

  return (
    <li>
      <input
        type="text"
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        value={state}
      />
      <button onClick={onDeleteClick}>Delete</button>
    </li>
  );
}
