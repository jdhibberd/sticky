CREATE TABLE users (
  "id" UUID PRIMARY KEY,
  "name" VARCHAR(64) NOT NULL
)
CREATE TABLE notes (
  "id" UUID PRIMARY KEY,
  "author_id" UUID NOT NULL,
  "content" TEXT NOT NULL,
  "path" TEXT NOT NULL
);
CREATE TABLE likes (
  "user_id" UUID NOT NULL,  
  "note_id" UUID NOT NULL,
  PRIMARY KEY ("user_id", "note_id")
);