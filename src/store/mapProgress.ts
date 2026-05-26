export type NodeStatus = 'locked' | 'available' | 'complete';

export interface MapNodeProgress {
  status: NodeStatus;
  mastery: number | null; // placeholder — not read by any current logic
  attempts: number;
  lastSeen: string | null;
}

export type MapProgress = Record<string, MapNodeProgress>;

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
  if (nextId && next[nextId]) {
    next[nextId] = { ...next[nextId], status: 'available' };
  }
  return next;
}
