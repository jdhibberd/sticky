import React, { useState, useRef, useEffect } from "react";
import type { Note } from "@/backend/model/note-page.js";
import {
  NOTE_CONTENT_MAXLEN,
  NOTE_PATH_MAXDEPTH,
} from "../lib/backend-const.gen.js";
import Cross from "./symbol/Cross.js";
import Slash from "./symbol/Slash.js";

type Props = {
  note: Note;
  depth: number;
};

type State = {
  content: string;
  contentDraft: string | undefined;
  isEditing: boolean;
};

export default function EditableNote({ note, depth }: Props) {
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
    window.location.hash = note.id;
  };

  const onEditClick = () => {
    setState((prevState) => {
      return { ...prevState, isEditing: true, contentDraft: prevState.content };
    });
  };

  /**
   * Clicking the "like" button will toggle between a like being added and
   * removed by the current user on the note.
   */
  const onLikesClick = async () => {
    if (note.likedByUser) {
      await fetch(`/api/likes/${note.id}`, {
        method: "DELETE",
      });
    } else {
      await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note.id }),
      });
    }
    dispatchEvent(new Event("notesChanged"));
  };

  const onTextareaKeyDown = async (event: React.KeyboardEvent) => {
    if (event.code === "Enter") {
      // interpret a press of the enter key to mean saving the note, and
      // suppress the usual behaviour which is to add a newline to the end of
      // the content
      event.preventDefault();
      if (state.contentDraft!.length === 0) {
        return;
      }
      await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, content: state.contentDraft }),
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
            id="edit-note"
            ref={textareaRef}
            onChange={onTextareaChange}
            onKeyDown={onTextareaKeyDown}
            onBlur={onTextareaBlur}
            value={state.contentDraft}
            maxLength={NOTE_CONTENT_MAXLEN}
          />
        </div>
      );
    } else if (depth < NOTE_PATH_MAXDEPTH) {
      return (
        <div className="content content-link" onClick={onContentClick}>
          {state.content}
        </div>
      );
    } else {
      return <div className="content">{state.content}</div>;
    }
  };

  const renderLikeButton = () => {
    return (
      <button
        className={note.likedByUser ? "like-liked" : ""}
        onClick={onLikesClick}
      >
        {note.likeCount}
      </button>
    );
  };

  const renderMutateButton = () => {
    if (state.isEditing) {
      return (
        <button onClick={onDeleteClick} onMouseDown={onDeleteMouseDown}>
          <Cross />
        </button>
      );
    } else {
      return (
        <button onClick={onEditClick}>
          <Slash />
        </button>
      );
    }
  };

  return (
    <div className="note">
      {renderContent()}
      <div className="footer">
        <div className="author">{note.author.name}</div>
        <div className="buttons">
          {renderLikeButton()}
          {renderMutateButton()}
        </div>
      </div>
    </div>
  );
}
