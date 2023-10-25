import React, { useState, useRef, useEffect } from "react";
import type { Note } from "@/backend/entity.js";
import { navigateToNote, getNotePath } from "../lib/util.js";

type Props = {
  note: Note;
  hasChildren?: boolean;
};

type State = {
  content: string;
  isEditing: boolean;
};

export default function EditableNote({ note, hasChildren = false }: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [state, setState] = useState<State>({
    content: note.content,
    isEditing: false,
  });

  useEffect(() => {
    if (state.isEditing) {
      const textarea = inputRef.current!;
      textarea.focus();
      textarea.selectionStart = textarea.value.length;
    }
  }, [state.isEditing]);

  const onDeleteClick = async () => {
    await fetch(`/api/notes/${note.id}`, {
      method: "DELETE",
    });
    dispatchEvent(new Event("notesChanged"));
  };

  const onContentClick = () => {
    navigateToNote(note);
  };

  const onEditClick = () => {
    setState((prevState) => {
      return { ...prevState, isEditing: true };
    });
  };

  const onKeyDown = async (event: React.KeyboardEvent) => {
    if (event.code === "Enter") {
      event.preventDefault();
      const path = getNotePath();
      await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, content: state.content, path }),
      });
      const textarea = inputRef.current!;
      textarea.blur();
      dispatchEvent(new Event("notesChanged"));
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState((prevState) => {
      return { ...prevState, content: event.target.value };
    });
  };

  const onBlur = () => {
    setState({ isEditing: false, content: note.content });
  };

  const renderContent = () => {
    if (state.isEditing) {
      return (
        <div className="content content-editable">
          <textarea
            ref={inputRef}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            value={state.content}
          />
        </div>
      );
    } else {
      return (
        <div className="content content-link" onClick={onContentClick}>
          {state.content}
        </div>
      );
    }
  };

  const renderMutateButton = () => {
    if (state.isEditing) {
      return <button onClick={onDeleteClick}>&#x2715;</button>;
    } else {
      return <button onClick={onEditClick}>/</button>;
    }
  };

  return (
    <div className="note">
      {renderContent()}
      <div className="footer">
        <div className="author">John</div>
        <div className="buttons">
          <button>29</button>
          {renderMutateButton()}
        </div>
      </div>
      {hasChildren && <div className="shadow" />}
    </div>
  );
}
