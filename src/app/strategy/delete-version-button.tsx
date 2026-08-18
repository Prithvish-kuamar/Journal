"use client";

import { deleteStrategyVersion } from "@/app/actions";
import styles from "./strategy.module.css";

interface DeleteVersionButtonProps {
  versionId: string;
  status: string;
}

export function DeleteVersionButton({ versionId, status }: DeleteVersionButtonProps) {
  const isDraft = status === "DRAFT";
  return (
    <form action={deleteStrategyVersion}>
      <input type="hidden" name="versionId" value={versionId} />
      <button
        type="submit"
        className={styles.deleteBtn}
        disabled={!isDraft}
        title={isDraft ? "Delete draft version" : "Only draft versions can be deleted; published versions are immutable"}
        onClick={(e) => {
          if (!isDraft || !confirm("Delete this draft version?\n\nThis action cannot be undone and will remove the version along with any gates, grade categories, entry models, emotional questions and rules in this change set.")) e.preventDefault();
        }}
      >
        Delete
      </button>
    </form>
  );
}
