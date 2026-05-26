import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { curriculum } from '../data/curriculum';
import { type MapProgress, initMapProgress, completeNode } from '../store/mapProgress';
import { storageAdapter } from '../store/storage';
import { useProfile } from '../context/ProfileContext';
import './MapView.css';

// ── Layout constants ──────────────────────────────────────────────────────
const CONTAINER_W = 360;
const NODE_R = 30;
const AVATAR_SIZE = 40;

// Node positions — varied x and y spacing so the path feels like a trail, not a grid.
// Breaking the strict left-right-left alternation is what makes it read as a meander.
// Extend when adding more curriculum nodes.
const NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 215, y: 80  },  // start: right-center
  { x: 65,  y: 195 },  // hard left  (115px drop)
  { x: 265, y: 355 },  // hard right  (160px drop — big diagonal sweep)
  { x: 145, y: 465 },  // center      (110px drop — gentle retreat left)
  { x: 55,  y: 600 },  // hard left   (135px drop — continues left, breaks alternation)
  { x: 255, y: 740 },  // hard right  (140px drop — final big sweep)
];

function nodeCX(idx: number) { return NODE_POSITIONS[idx]?.x ?? 180; }
function nodeCY(idx: number) { return NODE_POSITIONS[idx]?.y ?? 90 + idx * 130; }
function totalH() {
  const last = NODE_POSITIONS[curriculum.length - 1];
  return (last?.y ?? 725) + NODE_R + 80;
}

// Catmull-Rom → cubic bezier: smooth curve that actually passes through every node
function buildSvgPath() {
  const pts = NODE_POSITIONS.slice(0, curriculum.length);
  if (pts.length < 2) return '';

  // Phantom endpoints so the spline has a defined tangent at each end
  const extended = [
    { x: 2 * pts[0].x - pts[1].x, y: 2 * pts[0].y - pts[1].y },
    ...pts,
    { x: 2 * pts[pts.length - 1].x - pts[pts.length - 2].x,
      y: 2 * pts[pts.length - 1].y - pts[pts.length - 2].y },
  ];

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < extended.length - 2; i++) {
    const p0 = extended[i - 1], p1 = extended[i];
    const p2 = extended[i + 1], p3 = extended[i + 2];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// Avatar is centered above its node
function avatarStyle(idx: number) {
  return {
    left: nodeCX(idx) - AVATAR_SIZE / 2,
    top:  nodeCY(idx) - NODE_R - AVATAR_SIZE - 6,
  };
}

export default function MapView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeProfile } = useProfile();

  const [mapProgress, setMapProgress] = useState<MapProgress | null>(null);
  const [avatarIdx,   setAvatarIdx]   = useState(-1);
  const [justUnlockedId, setJustUnlockedId] = useState<string | null>(null);
  // Guard so the init/completion effect runs exactly once per mount
  const initiated = useRef(false);

  useEffect(() => {
    if (!activeProfile || initiated.current) return;
    initiated.current = true;

    const state = location.state as { completedNodeId?: string } | null;

    storageAdapter.getMapProgress(activeProfile.id).then(raw => {
      let progress = raw;

      // First visit for this profile — seed the map
      if (Object.keys(progress).length === 0) {
        progress = initMapProgress(curriculum.map(n => n.id));
        storageAdapter.saveMapProgress(activeProfile.id, progress);
      }

      if (state?.completedNodeId) {
        const completedId  = state.completedNodeId;
        const completedIdx = curriculum.findIndex(n => n.id === completedId);
        const nextNode     = curriculum[completedIdx + 1];

        const newProgress = completeNode(progress, completedId, nextNode?.id);

        // 1. Render avatar at the just-completed node, new progress, pop class on next node
        setMapProgress(newProgress);
        setAvatarIdx(completedIdx);
        if (nextNode) setJustUnlockedId(nextNode.id);

        // 2. Next paint: slide avatar to the newly available node
        requestAnimationFrame(() => {
          if (nextNode) setAvatarIdx(completedIdx + 1);
        });

        storageAdapter.saveMapProgress(activeProfile.id, newProgress);
        // Clear nav state so a back-navigate doesn't re-trigger
        window.history.replaceState({}, document.title);

        setTimeout(() => setJustUnlockedId(null), 1800);

        // Scroll to bring the new node into view after the animation settles
        const scrollIdx = Math.min(completedIdx + 1, curriculum.length - 1);
        setTimeout(() => {
          window.scrollTo({
            top: nodeCY(scrollIdx) - window.innerHeight / 2 + 60,
            behavior: 'smooth',
          });
        }, 400);

      } else {
        setMapProgress(progress);
        const currentIdx = curriculum.findIndex(n => progress[n.id]?.status === 'available');
        const idx = currentIdx >= 0 ? currentIdx : 0;
        setAvatarIdx(idx);

        // Auto-scroll to the current node on load
        setTimeout(() => {
          window.scrollTo({
            top: nodeCY(idx) - window.innerHeight / 2 + 60,
            behavior: 'smooth',
          });
        }, 120);
      }
    });
  }, [activeProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  const h = totalH();
  const path = buildSvgPath();

  return (
    <div className="map-root">
      <header className="map-header">
        <button className="map-header__back" onClick={() => navigate('/menu')}>
          ← Menu
        </button>
        <span className="map-header__title">{activeProfile?.name}'s Path</span>
        <div
          className="map-header__avatar-dot"
          style={{ background: activeProfile?.avatarColor }}
        >
          {activeProfile?.avatarEmoji}
        </div>
      </header>

      <div className="map-scroll">
        <div className="map-inner" style={{ height: h }}>

          {/* Connecting path */}
          <svg
            className="map-svg"
            viewBox={`0 0 ${CONTAINER_W} ${h}`}
            width={CONTAINER_W}
            height={h}
            aria-hidden="true"
          >
            {/* track shadow */}
            <path d={path} stroke="#0a1628" strokeWidth={12} fill="none" strokeLinecap="round" />
            {/* track fill */}
            <path d={path} stroke="#1e3f6e" strokeWidth={8}  fill="none" strokeLinecap="round" />
            {/* dashed highlight */}
            <path
              d={path}
              stroke="#2a5598"
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
              strokeDasharray="2 14"
            />
          </svg>

          {/* Avatar — CSS transition drives the advance animation */}
          {avatarIdx >= 0 && (
            <div
              className="map-avatar"
              style={{
                ...avatarStyle(avatarIdx),
                background: activeProfile?.avatarColor ?? '#4a90e2',
              }}
            >
              {activeProfile?.avatarEmoji}
            </div>
          )}

          {/* Curriculum nodes */}
          {curriculum.map((node, idx) => {
            const status = mapProgress?.[node.id]?.status ?? 'locked';
            const isJustUnlocked = node.id === justUnlockedId;

            return (
              <button
                key={node.id}
                className={[
                  'map-node',
                  `map-node--${status}`,
                  isJustUnlocked ? 'map-node--pop' : '',
                ].filter(Boolean).join(' ')}
                style={{
                  left:   nodeCX(idx) - NODE_R,
                  top:    nodeCY(idx) - NODE_R,
                  width:  NODE_R * 2,
                  height: NODE_R * 2,
                }}
                disabled={status === 'locked'}
                onClick={() => navigate(`/lesson/${node.id}`)}
                aria-label={`${node.label} — ${status}`}
              >
                {status === 'locked' && (
                  <span className="map-node__lock">🔒</span>
                )}
                {status === 'available' && (
                  <span className="map-node__letter">{node.label}</span>
                )}
                {status === 'complete' && (
                  <>
                    <span className="map-node__letter">{node.label}</span>
                    <span className="map-node__check">✓</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
