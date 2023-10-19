import React, { useState } from "react";
import type { Collection } from "../../../backend/src/lib/entity.js";

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

  const onKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.code === "Enter") {
      event.preventDefault();
      await fetch("/api/collections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: collection.id, name: state }),
      });
      dispatchEvent(new Event("collectionsChanged"));
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(event.target.value);
  };

  const onBlur = (event: React.FocusEvent) => {
    setState(collection.name);
  };

  return (
    <div className="collection-card">
      <div className="content">
        <textarea
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          value={state}
        />
      </div>
      <div className="footer">
        <div className="author">John</div>
        <div className="buttons">
          <div className="button">29</div>
          <div className="button" onClick={onDeleteClick}>
            {/* &#x2715; */}╱
          </div>
        </div>
      </div>
      <div className="shadow" />
    </div>
  );
}
