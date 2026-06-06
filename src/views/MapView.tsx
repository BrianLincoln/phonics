import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { curriculum, sections } from '../data/curriculum';
import {
  type MapProgress,
  initMapProgress,
  ensureProgress,
  sanitizeProgress,
  reconcileCheckpoints,
  completeNode,
  attemptCheckpoint,
  CHECKPOINT_PASSING_THRESHOLD,
} from '../store/mapProgress';
import { storageAdapter } from '../store/storage';
import { useProfile } from '../context/ProfileContext';
import { ProfileAvatar } from '../components/ProfileAvatar';
import './MapView.css';

// ── Layout constants ──────────────────────────────────────────────────────
const CONTAINER_W = 360;
const NODE_R = 30;
const CHECKPOINT_R = 56;
const AVATAR_SIZE = 40;

const NODE_POSITIONS: { x: number; y: number }[] = [
  // Section 1 — Blue (nodes 0–4)
  { x: 215, y: 80   }, // 0  m
  { x: 65,  y: 205  }, // 1  a
  { x: 265, y: 360  }, // 2  s
  { x: 145, y: 475  }, // 3  t
  { x: 65,  y: 615  }, // 4  ★ cp1

  // Section 2 — Green (nodes 5–8)
  { x: 250, y: 785  }, // 5  i
  { x: 145, y: 925  }, // 6  n
  { x: 65,  y: 1055 }, // 7  p
  { x: 245, y: 1200 }, // 8  ★ cp2

  // Section 3 — Yellow (nodes 9–12)
  { x: 75,  y: 1370 }, // 9  b
  { x: 250, y: 1510 }, // 10 o
  { x: 145, y: 1640 }, // 11 c
  { x: 60,  y: 1780 }, // 12 ★ cp3

  // Section 4 — Orange (nodes 13–16)
  { x: 245, y: 1950 }, // 13 r
  { x: 155, y: 2080 }, // 14 u
  { x: 65,  y: 2210 }, // 15 f
  { x: 245, y: 2360 }, // 16 ★ cp4

  // Section 5 — Purple (nodes 17–21)
  { x: 145, y: 2530 }, // 17 d
  { x: 65,  y: 2660 }, // 18 l
  { x: 255, y: 2800 }, // 19 g
  { x: 145, y: 2930 }, // 20 h
  { x: 60,  y: 3080 }, // 21 ★ cp5

  // Section 6 — Pink (nodes 22–26)
  { x: 250, y: 3250 }, // 22 e
  { x: 145, y: 3380 }, // 23 w
  { x: 65,  y: 3510 }, // 24 j
  { x: 250, y: 3650 }, // 25 v
  { x: 145, y: 3790 }, // 26 ★ cp6

  // Section 7 — Gray (nodes 27–31)
  { x: 65,  y: 3960 }, // 27 y
  { x: 245, y: 4100 }, // 28 z
  { x: 145, y: 4230 }, // 29 x
  { x: 65,  y: 4360 }, // 30 qu
  { x: 245, y: 4510 }, // 31 ★ cp7

  // Section 8 — Teal (nodes 32–37)
  { x: 145, y: 4680 }, // 32 sh
  { x: 65,  y: 4810 }, // 33 ch
  { x: 250, y: 4960 }, // 34 th
  { x: 145, y: 5090 }, // 35 wh
  { x: 65,  y: 5220 }, // 36 ck
  { x: 245, y: 5370 }, // 37 ★ cp8
];

// Colors for each section's path track.
const SECTION_COLORS: Record<string, { shadow: string; fill: string; dash: string }> = {
  // Zones 1–8
  blue:    { shadow: '#051428', fill: '#1a5fa8', dash: '#5a9fe8' },
  green:   { shadow: '#031510', fill: '#177a42', dash: '#2ecc71' },
  yellow:  { shadow: '#181000', fill: '#9a7008', dash: '#e8b800' },
  orange:  { shadow: '#180800', fill: '#a04010', dash: '#e87020' },
  purple:  { shadow: '#0c0020', fill: '#5a1888', dash: '#a060d0' },
  pink:    { shadow: '#180010', fill: '#901848', dash: '#e04888' },
  gray:    { shadow: '#0a0f18', fill: '#324a60', dash: '#6898b8' },
  teal:    { shadow: '#001810', fill: '#0a7060', dash: '#1ab8a0' },
  // Zones 9–13 (blends)
  red:     { shadow: '#1a0000', fill: '#b01020', dash: '#e84050' },
  crimson: { shadow: '#1a0008', fill: '#9a1030', dash: '#d84060' },
  amber:   { shadow: '#181200', fill: '#9a6000', dash: '#e8a000' },
  gold:    { shadow: '#181400', fill: '#8a7000', dash: '#d8c000' },
  lime:    { shadow: '#081800', fill: '#387a00', dash: '#70d800' },
  // Zones 14–19 (long vowels & vowel teams)
  emerald: { shadow: '#001808', fill: '#0a7838', dash: '#20c868' },
  cyan:    { shadow: '#001818', fill: '#0a7878', dash: '#20c8c8' },
  sky:     { shadow: '#001020', fill: '#1060a0', dash: '#40b0f0' },
  indigo:  { shadow: '#080028', fill: '#3028a0', dash: '#7068e0' },
  violet:  { shadow: '#100020', fill: '#6010a0', dash: '#b050e8' },
  rose:    { shadow: '#180010', fill: '#a01060', dash: '#e050a0' },
  // Zones 20–22 (r-controlled & advanced consonants)
  maroon:  { shadow: '#180000', fill: '#800010', dash: '#c02030' },
  brown:   { shadow: '#100800', fill: '#704010', dash: '#b07030' },
  olive:   { shadow: '#0c1000', fill: '#506010', dash: '#90a020' },
  // Zones 23–24 (syllables)
  navy:    { shadow: '#000818', fill: '#102060', dash: '#3060b0' },
  forest:  { shadow: '#001000', fill: '#105820', dash: '#209040' },
  // Zones 25–27 (suffixes & prefixes)
  slate:   { shadow: '#080c10', fill: '#304050', dash: '#6080a0' },
  coral:   { shadow: '#180800', fill: '#a03820', dash: '#e07050' },
  magenta: { shadow: '#180018', fill: '#901890', dash: '#d848d8' },
};

function nodeCX(idx: number) { return NODE_POSITIONS[idx]?.x ?? 180; }
function nodeCY(idx: number) { return NODE_POSITIONS[idx]?.y ?? 90 + idx * 130; }

// Build a Catmull-Rom smooth path through the given node indices.
// Uses the node immediately before/after the range as phantom endpoints
// so sections join seamlessly at shared checkpoint nodes.
function buildPathForIndices(indices: number[]): string {
  if (indices.length < 2) return '';
  const pts = indices.map(i => NODE_POSITIONS[i] ?? { x: 180, y: i * 130 });

  const firstIdx = indices[0];
  const lastIdx  = indices[indices.length - 1];
  const phantomStart = NODE_POSITIONS[firstIdx - 1]
    ?? { x: 2 * pts[0].x - pts[1].x, y: 2 * pts[0].y - pts[1].y };
  const phantomEnd   = NODE_POSITIONS[lastIdx + 1]
    ?? { x: 2 * pts[pts.length - 1].x - pts[pts.length - 2].x,
          y: 2 * pts[pts.length - 1].y - pts[pts.length - 2].y };

  const extended = [phantomStart, ...pts, phantomEnd];
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

// Section N's path starts from section N-1's checkpoint (for visual continuity).
function getSectionPathIndices(sectionIdx: number): number[] {
  const section = sections[sectionIdx];
  const ownIndices = section.nodeIds.map(id => curriculum.findIndex(n => n.id === id));
  if (sectionIdx === 0) return ownIndices;

  const prev = sections[sectionIdx - 1];
  const prevCheckpointIdx = curriculum.findIndex(n => n.id === prev.nodeIds[prev.nodeIds.length - 1]);
  return [prevCheckpointIdx, ...ownIndices];
}

function avatarStyle(idx: number, isCheckpoint = false) {
  const r = isCheckpoint ? CHECKPOINT_R : NODE_R;
  return {
    left: nodeCX(idx) - AVATAR_SIZE / 2,
    top:  nodeCY(idx) - r - AVATAR_SIZE - 6,
  };
}

interface CheckpointFeedback {
  passed: boolean;
  correct: number;
  total: number;
}

export default function MapView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeProfile } = useProfile();

  const [mapProgress, setMapProgress] = useState<MapProgress | null>(null);
  const [avatarIdx,   setAvatarIdx]   = useState(-1);
  const [justUnlockedId, setJustUnlockedId] = useState<string | null>(null);
  const [checkpointFeedback, setCheckpointFeedback] = useState<CheckpointFeedback | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [blendingUnlocked, setBlendingUnlocked] = useState(false);
  const initiated = useRef(false);

  useEffect(() => {
    if (!activeProfile) return;
    storageAdapter.getMapProgress(activeProfile.id).then(progress => {
      setBlendingUnlocked(progress['node-cp1']?.status === 'complete');
    });
  }, [activeProfile]);

  useEffect(() => {
    if (!activeProfile || initiated.current) return;
    initiated.current = true;

    const state = location.state as {
      completedNodeId?: string;
      checkpointScore?: { correct: number; total: number };
    } | null;

    storageAdapter.getMapProgress(activeProfile.id).then(raw => {
      const allNodeIds = curriculum.map(n => n.id);
      let progress = raw;

      if (Object.keys(progress).length === 0) {
        progress = initMapProgress(allNodeIds);
        storageAdapter.saveMapProgress(activeProfile.id, progress);
      } else {
        const cleaned = sanitizeProgress(
          reconcileCheckpoints(ensureProgress(progress, allNodeIds), sections),
          sections
        );
        if (cleaned !== progress) {
          storageAdapter.saveMapProgress(activeProfile.id, cleaned);
        }
        progress = cleaned;
      }

      if (state?.completedNodeId) {
        const completedId  = state.completedNodeId;
        const completedIdx = curriculum.findIndex(n => n.id === completedId);
        const completedNode = curriculum[completedIdx];
        const nextNode      = curriculum[completedIdx + 1];

        let newProgress: MapProgress;

        if (completedNode?.type === 'checkpoint' && state.checkpointScore) {
          const { correct, total } = state.checkpointScore;
          newProgress = attemptCheckpoint(progress, completedId, correct, total, nextNode?.id);
          newProgress = reconcileCheckpoints(newProgress, sections);
          const passed = correct / total >= CHECKPOINT_PASSING_THRESHOLD;
          setCheckpointFeedback({ passed, correct, total });
          setTimeout(() => setCheckpointFeedback(null), 4000);
        } else {
          newProgress = completeNode(progress, completedId, nextNode?.id);
          newProgress = reconcileCheckpoints(newProgress, sections);
        }

        setMapProgress(newProgress);
        setAvatarIdx(completedIdx);

        const newFrontierIdx = curriculum.findIndex(n => newProgress[n.id]?.status === 'available');
        const oldFrontierIdx = curriculum.findIndex(n => progress[n.id]?.status === 'available');
        const didUnlock = newFrontierIdx >= 0 && newFrontierIdx !== oldFrontierIdx;

        if (didUnlock) {
          setJustUnlockedId(curriculum[newFrontierIdx].id);
          requestAnimationFrame(() => setAvatarIdx(newFrontierIdx));
          setTimeout(() => setJustUnlockedId(null), 1800);
        } else if (newFrontierIdx >= 0) {
          requestAnimationFrame(() => setAvatarIdx(newFrontierIdx));
        }

        storageAdapter.saveMapProgress(activeProfile.id, newProgress);
        window.history.replaceState({}, document.title);

        const scrollIdx = newFrontierIdx >= 0 ? newFrontierIdx : completedIdx;
        setTimeout(() => {
          window.scrollTo({ top: nodeCY(scrollIdx) - window.innerHeight / 2 + 60, behavior: 'smooth' });
        }, 400);

      } else {
        setMapProgress(progress);
        const currentIdx = curriculum.findIndex(n => progress[n.id]?.status === 'available');
        const idx = currentIdx >= 0 ? currentIdx : 0;
        setAvatarIdx(idx);
        setTimeout(() => {
          window.scrollTo({ top: nodeCY(idx) - window.innerHeight / 2 + 60, behavior: 'smooth' });
        }, 120);
      }
    });
  }, [activeProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Only show sections up to and including the one with the current frontier node.
  const activeSectionIdx = (() => {
    if (!mapProgress) return 0;
    let last = 0;
    sections.forEach((s, i) => {
      if (s.nodeIds.some(id => (mapProgress[id]?.status ?? 'locked') !== 'locked')) {
        last = i;
      }
    });
    return last;
  })();

  const visibleSections = sections.slice(0, activeSectionIdx + 1);
  const visibleNodeIds  = new Set(visibleSections.flatMap(s => s.nodeIds));

  const lastVisibleNodeIdx = (() => {
    const last = visibleSections[visibleSections.length - 1];
    const lastId = last?.nodeIds[last.nodeIds.length - 1];
    return lastId ? curriculum.findIndex(n => n.id === lastId) : 0;
  })();

  const h = nodeCY(lastVisibleNodeIdx) + NODE_R + 100;

  return (
    <div className="map-root">
      <header className="map-header">
        <span className="map-header__title">{activeProfile?.name}'s Path</span>
        {activeProfile && (
          <button
            className="map-header__avatar-btn"
            onClick={() => navigate(`/edit-profile/${activeProfile.id}`)}
            aria-label="Edit profile"
          >
            <ProfileAvatar profile={activeProfile} variant="dark" />
          </button>
        )}
      </header>

      {checkpointFeedback && (
        <div className={`map-checkpoint-toast map-checkpoint-toast--${checkpointFeedback.passed ? 'pass' : 'fail'}`}>
          {checkpointFeedback.passed
            ? `Challenge complete! ${checkpointFeedback.correct} of ${checkpointFeedback.total} — keep going! 🎉`
            : `You got ${checkpointFeedback.correct} of ${checkpointFeedback.total}. Try again!`}
        </div>
      )}

      <div className="map-scroll">
        <div className="map-inner" style={{ height: h }}>

          {/* Per-section colored paths */}
          <svg
            className="map-svg"
            viewBox={`0 0 ${CONTAINER_W} ${h}`}
            width={CONTAINER_W}
            height={h}
            aria-hidden="true"
          >
            {visibleSections.map((section, sIdx) => {
              const colors = SECTION_COLORS[section.color] ?? SECTION_COLORS.blue;
              const indices = getSectionPathIndices(sections.indexOf(section));
              const d = buildPathForIndices(indices);
              return (
                <g key={section.id}>
                  <path d={d} stroke={colors.shadow} strokeWidth={12} fill="none" strokeLinecap="round" />
                  <path d={d} stroke={colors.fill}   strokeWidth={8}  fill="none" strokeLinecap="round" />
                  <path d={d} stroke={colors.dash}   strokeWidth={4}  fill="none" strokeLinecap="round" strokeDasharray="2 14" />
                </g>
              );
            })}
          </svg>

          {/* Avatar */}
          {avatarIdx >= 0 && (
            <div
              className="map-avatar"
              style={{
                ...avatarStyle(avatarIdx, curriculum[avatarIdx]?.type === 'checkpoint'),
                background: activeProfile?.avatarColor ?? '#4a90e2',
              }}
            >
              {activeProfile?.avatarEmoji}
            </div>
          )}

          {/* Curriculum nodes — only visible sections */}
          {curriculum.map((node, idx) => {
            if (!visibleNodeIds.has(node.id)) return null;

            const status = mapProgress?.[node.id]?.status ?? 'locked';
            const isCheckpoint = node.type === 'checkpoint';
            const isJustUnlocked = node.id === justUnlockedId;
            const r = isCheckpoint ? CHECKPOINT_R : NODE_R;

            return (
              <div key={node.id} className="map-node-wrapper">
                <button
                  className={[
                    'map-node',
                    isCheckpoint ? 'map-node--checkpoint' : '',
                    `map-node--${status}`,
                    isCheckpoint && status === 'available' ? 'map-node--checkpoint-available' : '',
                    isJustUnlocked ? 'map-node--pop' : '',
                  ].filter(Boolean).join(' ')}
                  style={{
                    left:   nodeCX(idx) - r,
                    top:    nodeCY(idx) - r,
                    width:  r * 2,
                    height: r * 2,
                  }}
                  disabled={status === 'locked'}
                  onClick={() => navigate(`/lesson/${node.id}`)}
                  aria-label={`${isCheckpoint ? 'Section Quiz' : node.label} — ${status}`}
                >
                  {!isCheckpoint && status === 'locked' && (
                    <span className="map-node__letter map-node__letter--dim">{node.label}</span>
                  )}
                  {!isCheckpoint && status === 'available' && (
                    <span className="map-node__letter">{node.label}</span>
                  )}
                  {!isCheckpoint && status === 'complete' && (
                    <>
                      <span className="map-node__letter">{node.label}</span>
                      <span className="map-node__check">✓</span>
                    </>
                  )}
                  {isCheckpoint && status === 'complete' && (
                    <>
                      <span className="map-node__trophy">🏆</span>
                      <span className="map-node__check">✓</span>
                    </>
                  )}
                  {isCheckpoint && status === 'available' && (
                    <span className="map-node__trophy">🏆</span>
                  )}
                  {isCheckpoint && status === 'locked' && (
                    <span className="map-node__trophy map-node__trophy--dim">🏆</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {menuOpen && (
        <div className="menu-fab-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <div className={`menu-fab-items${menuOpen ? ' menu-fab-items--open' : ''}`}>
        <button className="menu-fab-item" onClick={() => { setMenuOpen(false); navigate('/endless'); }}>🔤 Letter Sounds</button>
        {blendingUnlocked && (
          <button className="menu-fab-item" onClick={() => { setMenuOpen(false); navigate('/endless-blend'); }}>🧩 Blending</button>
        )}
        <button className="menu-fab-item" onClick={() => { setMenuOpen(false); navigate('/endless-mixed'); }}>✨ All Skills</button>
        <button className="menu-fab-item" onClick={() => { setMenuOpen(false); navigate('/units'); }}>Units</button>
        <button className="menu-fab-item" onClick={() => { setMenuOpen(false); navigate('/progress'); }}>Progress</button>
        <button className="menu-fab-item" onClick={() => { setMenuOpen(false); navigate('/'); }}>Switch Learner</button>
      </div>

      <button
        className={`menu-fab${menuOpen ? ' menu-fab--open' : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="More options"
      >
        {menuOpen ? '×' : '+'}
      </button>
    </div>
  );
}
