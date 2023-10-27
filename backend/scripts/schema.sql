CREATE TABLE users (
  "id" UUID PRIMARY KEY,
  "name" VARCHAR(64) NOT NULL
)
CREATE TABLE notes (
  "id" UUID PRIMARY KEY,
  "author_id" UUID NOT NULL,
  "content" TEXT NOT NULL,
  "likes" INTEGER NOT NULL, /*TODO remove*/
  "path" TEXT NOT NULL
);
CREATE TABLE likes (
  "id" UUID PRIMARY KEY,
  "note_id" UUID NOT NULL,
  "user_id" TEXT NOT NULL,
  UNIQUE("note_id", "user_id")
);