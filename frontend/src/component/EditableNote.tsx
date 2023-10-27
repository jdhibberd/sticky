import React, { useState, useRef, useEffect } from "react";
import type { Note } from "@/backend/entity.js";
import { navigateToNote } from "../lib/util.js";

type Props = {
  note: Note;
  hasChildren?: boolean;
};

type State = {
  content: string;
  contentDraft: string | undefined;
  isEditing: boolean;
};

export default function EditableNote({ note, hasChildren = false }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [state, setState] = useState<State>({
    content: note.content,
    contentDraft: undefined,
    isEditing: false,
  });

  useEffect(() => {
    if (state.isEditing) {
      // after rendering editable content place the cursor at the end of the
      // content for convenience
      const textarea = textareaRef.current!;
      textarea.focus();
      textarea.selectionStart = textarea.value.length;
    }
  }, [state.isEditing]);

  const onDeleteMouseDown = async (event: React.MouseEvent) => {
    // prevent the "onmousedown" event on the delete button from triggering the
    // "onblur" event on the textarea, which would replace the delete button
    // with the edit button and prevent the delete button from ever being
    // clickable
    event.preventDefault();
  };

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
      return { ...prevState, isEditing: true, contentDraft: prevState.content };
    });
  };

  const onLikesClick = async () => {
    await fetch("/api/notes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...note, likes: note.likes + 1 }),
    });
    dispatchEvent(new Event("notesChanged"));
  };

  const onTextareaKeyDown = async (event: React.KeyboardEvent) => {
    if (event.code === "Enter") {
      // interpret a press of the enter key to mean saving the note, and
      // suppress the usual behaviour which is to add a newline to the end of
      // the content
      event.preventDefault();
      await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...note, content: state.contentDraft }),
      });
      dispatchEvent(new Event("notesChanged"));
      setState((prevState) => {
        return {
          isEditing: false,
          contentDraft: undefined,
          content: prevState.contentDraft!,
        };
      });
    }
  };

  const onTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState((prevState) => {
      return { ...prevState, contentDraft: event.target.value };
    });
  };

  const onTextareaBlur = () => {
    setState((prevState) => {
      return { ...prevState, isEditing: false, contentDraft: undefined };
    });
  };

  const renderContent = () => {
    if (state.isEditing) {
      return (
        <div className="content content-editable">
          <textarea
            ref={textareaRef}
            onChange={onTextareaChange}
            onKeyDown={onTextareaKeyDown}
            onBlur={onTextareaBlur}
            value={state.contentDraft}
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
      return (
        <button onClick={onDeleteClick} onMouseDown={onDeleteMouseDown}>
          <svg
            viewBox="0 0 28 28"
            xmlns="http://www.w3.org/2000/svg"
            stroke="black"
            strokeWidth={"2px"}
          >
            <line x1="72%" y1="28%" x2="28%" y2="72%" />
            <line x1="28%" y1="28%" x2="72%" y2="72%" />
          </svg>
        </button>
      );
    } else {
      return (
        <button onClick={onEditClick}>
          <svg
            viewBox="0 0 28 28"
            xmlns="http://www.w3.org/2000/svg"
            stroke="black"
            strokeWidth={"2px"}
          >
            <line x1="72%" y1="28%" x2="28%" y2="72%" />
          </svg>
        </button>
      );
    }
  };

  return (
    <div className="note">
      {renderContent()}
      <div className="footer">
        <div className="author">John</div>
        <div className="buttons">
          <button onClick={onLikesClick}>{note.likes}</button>
          {renderMutateButton()}
        </div>
      </div>
      {hasChildren && <div className="shadow" />}
    </div>
  );
}
