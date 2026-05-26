export type NodeStatus = 'locked' | 'available' | 'complete';

export interface MapNodeProgress {
  status: NodeStatus;
  mastery: number | null; // 0–1, best score on a checkpoint attempt; null for lesson nodes
  attempts: number;
  lastSeen: string | null;
}

export type MapProgress = Record<string, MapNodeProgress>;

export const CHECKPOINT_PASSING_THRESHOLD = 0.8; // 4 of 5

export function initMapProgress(nodeIds: string[]): MapProgress {
  return Object.fromEntries(
    nodeIds.map((id, idx) => [
      id,
      {
        status: (idx === 0 ? 'available' : 'locked') as NodeStatus,
        mastery: null,
        attempts: 0,
        lastSeen: null,
      },
    ])
  );
}

// Enforce section boundaries: if section N's checkpoint isn't complete, lock all
// nodes in sections N+1, N+2, ... — fixes progress from before sections existed.
export function sanitizeProgress(
  progress: MapProgress,
  sectionList: { nodeIds: string[] }[]
): MapProgress {
  const next = { ...progress };
  let changed = false;
  let prevCheckpointComplete = true;

  for (const section of sectionList) {
    const checkpointId = section.nodeIds[section.nodeIds.length - 1];
    if (!prevCheckpointComplete) {
      for (const id of section.nodeIds) {
        if (next[id]?.status !== 'locked') {
          next[id] = { ...next[id], status: 'locked' };
          changed = true;
        }
      }
    }
    prevCheckpointComplete = next[checkpointId]?.status === 'complete';
  }

  return changed ? next : progress;
}

// After seeding missing nodes, unlock any checkpoint whose lesson nodes are all
// complete (handles profiles created before sections/checkpoints existed).
export function reconcileCheckpoints(
  progress: MapProgress,
  sectionList: { nodeIds: string[] }[]
): MapProgress {
  const next = { ...progress };
  let changed = false;
  for (const section of sectionList) {
    const checkpointId = section.nodeIds[section.nodeIds.length - 1];
    const lessonIds = section.nodeIds.slice(0, -1);
    if (next[checkpointId]?.status === 'locked') {
      const allComplete = lessonIds.every(id => next[id]?.status === 'complete');
      if (allComplete) {
        next[checkpointId] = { ...next[checkpointId], status: 'available' };
        changed = true;
      }
    }
  }
  return changed ? next : progress;
}

// Adds missing node entries (locked) when new curriculum nodes are added after
// a profile was created.
export function ensureProgress(progress: MapProgress, nodeIds: string[]): MapProgress {
  const next = { ...progress };
  let changed = false;
  for (const id of nodeIds) {
    if (!next[id]) {
      next[id] = { status: 'locked', mastery: null, attempts: 0, lastSeen: null };
      changed = true;
    }
  }
  return changed ? next : progress;
}

export function completeNode(
  progress: MapProgress,
  completedId: string,
  nextId: string | undefined
): MapProgress {
  const next: MapProgress = { ...progress };
  if (next[completedId]) {
    next[completedId] = {
      ...next[completedId],
      status: 'complete',
      lastSeen: new Date().toISOString(),
      attempts: next[completedId].attempts + 1,
    };
  }
  if (nextId && next[nextId]?.status === 'locked') {
    next[nextId] = { ...next[nextId], status: 'available' };
  }
  return next;
}

// For checkpoint nodes: only marks complete and unlocks nextNodeId if score meets threshold.
// On failure, increments attempts and updates best mastery but leaves status 'available'.
export function attemptCheckpoint(
  progress: MapProgress,
  checkpointId: string,
  correct: number,
  total: number,
  nextNodeId: string | undefined
): MapProgress {
  const next: MapProgress = { ...progress };
  const accuracy = total > 0 ? correct / total : 0;
  const passed = accuracy >= CHECKPOINT_PASSING_THRESHOLD;
  const prev = next[checkpointId] ?? { status: 'available' as NodeStatus, mastery: null, attempts: 0, lastSeen: null };

  next[checkpointId] = {
    ...prev,
    attempts: prev.attempts + 1,
    lastSeen: new Date().toISOString(),
    mastery: Math.max(prev.mastery ?? 0, accuracy),
    status: passed ? 'complete' : 'available',
  };

  if (passed && nextNodeId && next[nextNodeId]?.status === 'locked') {
    next[nextNodeId] = { ...next[nextNodeId], status: 'available' };
  }

  return next;
}
