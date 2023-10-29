import { Query, ParamBuilder } from "./util.js";

type LikeCount = { noteId: string; count: number };
type LikeByUser = { id: string; noteId: string };
export type LikesByNoteIds = {
  likeCounts: LikeCount[];
  likesByUser: LikeByUser[];
};

class Likes {
  /**
   * Register a user liking a note. This is idempotent so multiple likes by a
   * user of the same note are ignored.
   */
  async insert(note_id: string, user_id: string): Promise<void> {
    const query = new Query();
    await query.start();
    try {
      await query.exec(
        `
        INSERT INTO likes (id, note_id, user_id) 
        VALUES($1, $2, $3)
        ON CONFLICT (note_id, user_id) DO NOTHING
        `,
        [crypto.randomUUID(), note_id, user_id],
      );
    } finally {
      await query.end();
    }
  }

  /**
   * Get "like" information for a set of notes, including whether a specific
   * user has liked each of those notes.
   */
  async selectByNoteIds(
    userId: string,
    noteIds: string[],
  ): Promise<LikesByNoteIds> {
    const query = new Query();
    await query.start();
    try {
      const param1 = new ParamBuilder();
      const param2 = new ParamBuilder(1);
      const [likeCounts, likesByUser] = await Promise.all([
        query.select<LikeCount>(
          `
          SELECT note_id, COUNT(id)
          FROM likes
          WHERE note_id IN (${param1.insert(noteIds.length)})
          GROUP BY note_id
          `,
          noteIds,
        ),
        query.select<LikeByUser>(
          `
          SELECT id, note_id
          FROM likes
          WHERE note_id IN (${param2.insert(noteIds.length)}) AND
          user_id = $1
          `,
          [userId, ...noteIds],
        ),
      ]);
      return { likeCounts, likesByUser };
    } finally {
      await query.end();
    }
  }
}

export const likes = new Likes();
