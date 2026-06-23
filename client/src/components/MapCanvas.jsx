import { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Line, Circle, Text, Group } from 'react-konva';
import { describeCharacter } from '../lib/characterLinks';

// Loads an HTMLImageElement for a given URL, returns null while loading.
function useImage(url) {
  const [img, setImg] = useState(null);
  useEffect(() => {
    if (!url) {
      setImg(null);
      return;
    }
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = url;
    image.onload = () => setImg(image);
    return () => setImg(null);
  }, [url]);
  return img;
}

function cellKey(col, row) {
  return `${col},${row}`;
}

export default function MapCanvas({ scene, isGm, socket, userId, characters = [] }) {
  const stageWidth = scene.gridWidth * scene.cellSize;
  const stageHeight = scene.gridHeight * scene.cellSize;
  const mapImage = useImage(scene.mapUrl ? `${import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'}${scene.mapUrl}` : null);
  const characterById = new Map(characters.map((character) => [character.id, character]));

  const [tokens, setTokens] = useState(scene.tokens || []);
  const [revealedCells, setRevealedCells] = useState(scene.revealedCells || []);
  const [hoveredTokenId, setHoveredTokenId] = useState(null);

  // Camera from server (authoritative for players). Local view is used for GM interactions.
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });
  const [localView, setLocalView] = useState({ x: 0, y: 0, scale: 1 });

  const [fogTool, setFogTool] = useState(false); // GM: click-drag to reveal/hide
  const [fogMode, setFogMode] = useState('reveal');
  const isPaintingFog = useRef(false);

  // Panning state for GM when fogTool is off
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const viewStart = useRef({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [fitScale, setFitScale] = useState(1);

  // Keep local state in sync if the scene prop changes (e.g. switching scenes)
  useEffect(() => {
    setTokens(scene.tokens || []);
    setRevealedCells(scene.revealedCells || []);
    setHoveredTokenId(null);
    // reset camera views when switching scenes
    setCamera({ x: 0, y: 0, scale: 1 });
    setLocalView({ x: 0, y: 0, scale: 1 });
  }, [scene.id]);

  // Fit the stage to the available width on mount/resize
  useEffect(() => {
    function fit() {
      if (!containerRef.current) return;
      const available = containerRef.current.offsetWidth;
      setFitScale(Math.min(1, available / stageWidth));
    }
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [stageWidth]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    function handleMoved({ tokenId, x, y }) {
      setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, x, y } : t)));
    }
    function handleFog({ revealedCells }) {
      setRevealedCells(revealedCells);
    }
    function handleCamera(cam) {
      const c = cam || { x: 0, y: 0, scale: 1 };
      setCamera(c);
      // For GMs, keep local view in sync when the server broadcasts a camera
      if (isGm) setLocalView(c);
    }
    socket.on('token:moved', handleMoved);
    socket.on('fog:updated', handleFog);
    socket.on('camera:moved', handleCamera);
    return () => {
      socket.off('token:moved', handleMoved);
      socket.off('fog:updated', handleFog);
      socket.off('camera:moved', handleCamera);
    };
  }, [socket, isGm]);

  // Displayed camera: players follow server camera, GM manipulates localView
  const [displayedCamera, setDisplayedCamera] = useState(isGm ? localView : camera);
  const displayedRef = useRef(displayedCamera);
  useEffect(() => { displayedRef.current = displayedCamera; }, [displayedCamera]);

  // Keep displayed camera in sync when toggling GM view
  useEffect(() => {
    if (isGm) {
      setDisplayedCamera(localView);
      displayedRef.current = localView;
    } else {
      setDisplayedCamera(camera || { x: 0, y: 0, scale: 1 });
      displayedRef.current = camera || { x: 0, y: 0, scale: 1 };
    }
  }, [isGm]);

  // GM local view immediate update
  useEffect(() => {
    if (isGm) {
      setDisplayedCamera(localView);
      displayedRef.current = localView;
    }
  }, [localView, isGm]);

  // Animate players' camera when server camera updates
  useEffect(() => {
    if (isGm) return; // GMs control local view directly
    const from = { ...displayedRef.current };
    const to = camera || { x: 0, y: 0, scale: 1 };
    if (from.x === to.x && from.y === to.y && from.scale === to.scale) {
      setDisplayedCamera(to);
      displayedRef.current = to;
      return;
    }
    let rafId;
    const duration = 300;
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      const next = {
        x: from.x + (to.x - from.x) * ease,
        y: from.y + (to.y - from.y) * ease,
        scale: from.scale + (to.scale - from.scale) * ease,
      };
      setDisplayedCamera(next);
      displayedRef.current = next;
      if (t < 1) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [camera, isGm]);

  const finalScale = fitScale * (displayedCamera?.scale || 1);
  const hoveredToken = tokens.find((token) => token.id === hoveredTokenId) || null;
  const hoveredCharacter = hoveredToken?.characterId ? characterById.get(hoveredToken.characterId) : null;
  const hoveredCharacterSummary = describeCharacter(hoveredCharacter);

  const revealedSet = new Set(revealedCells.map(([c, r]) => cellKey(c, r)));

  function handleTokenDragEnd(token, e) {
    const x = e.target.x();
    const y = e.target.y();
    setTokens((prev) => prev.map((t) => (t.id === token.id ? { ...t, x, y } : t)));
    socket.emit('token:move', { sceneId: scene.id, tokenId: token.id, x, y }, (res) => {
      if (res?.error) {
        // Revert on rejection (e.g. tried to move someone else's token)
        setTokens((prev) => prev.map((t) => (t.id === token.id ? { ...t, x: token.x, y: token.y } : t)));
      }
    });
  }

  const paintCell = useCallback(
    (col, row) => {
      if (!isGm || !fogTool) return;
      socket.emit('fog:update', { sceneId: scene.id, cells: [[col, row]], mode: fogMode }, () => {});
      setRevealedCells((prev) => {
        const set = new Set(prev.map(([c, r]) => cellKey(c, r)));
        if (fogMode === 'reveal') set.add(cellKey(col, row));
        else set.delete(cellKey(col, row));
        return Array.from(set).map((k) => k.split(',').map(Number));
      });
    },
    [isGm, fogTool, fogMode, socket, scene.id]
  );

  // Stage interaction handlers: painting fog (when fogTool) or panning (when GM and fogTool off)
  function handleStageMouseDown(e) {
    // Painting
    if (isGm && fogTool) {
      isPaintingFog.current = true;
      const pos = e.target.getStage().getRelativePointerPosition();
      paintCell(Math.floor(pos.x / scene.cellSize), Math.floor(pos.y / scene.cellSize));
      return;
    }

    // Panning (GM only)
    if (isGm && !fogTool) {
      isPanning.current = true;
      panStart.current = { x: e.evt.clientX, y: e.evt.clientY };
      viewStart.current = { ...localView };
    }
  }

  function handleStageMouseMove(e) {
    if (isPaintingFog.current) {
      const pos = e.target.getStage().getRelativePointerPosition();
      paintCell(Math.floor(pos.x / scene.cellSize), Math.floor(pos.y / scene.cellSize));
      return;
    }

    if (isPanning.current) {
      const dx = e.evt.clientX - panStart.current.x;
      const dy = e.evt.clientY - panStart.current.y;
      // Convert screen delta to scene coordinate delta
      const sceneDx = dx / finalScale;
      const sceneDy = dy / finalScale;
      setLocalView({ ...viewStart.current, x: viewStart.current.x - sceneDx, y: viewStart.current.y - sceneDy });
    }
  }

  function handleStageMouseUp() {
    isPaintingFog.current = false;
    isPanning.current = false;
  }

  function handleWheel(e) {
    if (!isGm || fogTool) return;
    e.evt.preventDefault();
    const delta = e.evt.deltaY;
    const factor = Math.exp(-delta * 0.001);
    setLocalView((prev) => {
      const nextScale = Math.max(0.2, Math.min(4, prev.scale * factor));
      return { ...prev, scale: nextScale };
    });
  }


  // Grid lines
  const gridLines = [];
  for (let c = 0; c <= scene.gridWidth; c++) {
    gridLines.push(
      <Line key={`v${c}`} points={[c * scene.cellSize, 0, c * scene.cellSize, stageHeight]} stroke="rgba(201,168,106,0.15)" strokeWidth={1} />
    );
  }
  for (let r = 0; r <= scene.gridHeight; r++) {
    gridLines.push(
      <Line key={`h${r}`} points={[0, r * scene.cellSize, stageWidth, r * scene.cellSize]} stroke="rgba(201,168,106,0.15)" strokeWidth={1} />
    );
  }

  // Fog rectangles: render a dark rect over every cell that is NOT revealed.
  // GM sees fog at reduced opacity (so they can still see the map); players
  // see it fully opaque.
  const fogRects = [];
  if (scene.fogEnabled) {
    for (let c = 0; c < scene.gridWidth; c++) {
      for (let r = 0; r < scene.gridHeight; r++) {
        if (revealedSet.has(cellKey(c, r))) continue;
        fogRects.push(
          <Rect
            key={`fog-${c}-${r}`}
            x={c * scene.cellSize}
            y={r * scene.cellSize}
            width={scene.cellSize}
            height={scene.cellSize}
            fill="#0a0a0d"
            opacity={isGm ? 0.55 : 1}
          />
        );
      }
    }
  }

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {isGm && (
        <div className="flex-row" style={{ marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <button className={`btn ${fogTool ? 'btn-gm' : 'btn-ghost'}`} onClick={() => setFogTool(!fogTool)}>
            {fogTool ? 'Fog tool: ON' : 'Fog tool: OFF'}
          </button>
          {fogTool && (
            <>
              <button className={`btn ${fogMode === 'reveal' ? 'btn-gm' : 'btn-ghost'}`} onClick={() => setFogMode('reveal')}>
                Reveal
              </button>
              <button className={`btn ${fogMode === 'hide' ? 'btn-gm' : 'btn-ghost'}`} onClick={() => setFogMode('hide')}>
                Hide
              </button>
              <span className="muted" style={{ fontSize: '0.85rem' }}>Click and drag on the map to paint fog</span>
               <button className="btn btn-ghost" onClick={() => { setLocalView({ x: 0, y: 0, scale: 1 }); socket && socket.emit('camera:set', { sceneId: scene.id, camera: { x: 0, y: 0, scale: 1 } }, () => {}); }} style={{ marginLeft: '0.5rem' }}>Broadcast reset view</button>
               <button className="btn btn-ghost" onClick={() => { socket && socket.emit('camera:set', { sceneId: scene.id, camera: localView }, () => {}); }} style={{ marginLeft: '0.5rem' }}>Broadcast current view</button>
            </>
          )}
        </div>
      )}

      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
        {hoveredToken && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 2,
              padding: '0.65rem 0.75rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--line)',
              background: 'rgba(12, 12, 16, 0.92)',
              color: 'var(--parchment)',
              minWidth: 180,
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontWeight: 700 }}>{hoveredToken.name}</div>
            {hoveredCharacterSummary ? (
              <div className="muted" style={{ fontSize: '0.82rem', marginTop: '0.35rem' }}>
                {hoveredCharacterSummary.className} {hoveredCharacterSummary.level}
                <br />
                HP {hoveredCharacterSummary.hpCurrent}/{hoveredCharacterSummary.hpMax} · AC {hoveredCharacterSummary.ac}
              </div>
            ) : (
              <div className="muted" style={{ fontSize: '0.82rem', marginTop: '0.35rem' }}>
                No linked character
              </div>
            )}
          </div>
        )}
        <Stage
          ref={stageRef}
          width={stageWidth * fitScale}
          height={stageHeight * fitScale}
          scaleX={displayedCamera.scale}
          scaleY={displayedCamera.scale}
          x={-displayedCamera.x * fitScale * (displayedCamera.scale || 1)}
          y={-displayedCamera.y * fitScale * (displayedCamera.scale || 1)}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onWheel={handleWheel}
        >
          <Layer>
            {mapImage ? (
              <KonvaImage image={mapImage} width={stageWidth} height={stageHeight} />
            ) : (
              <Rect x={0} y={0} width={stageWidth} height={stageHeight} fill="#1b1a20" />
            )}
            {gridLines}
          </Layer>

          <Layer>
            {tokens.map((token) => (
              <TokenShape
                key={token.id}
                token={token}
                cellSize={scene.cellSize}
                draggable={isGm || token.ownerUserId === userId}
                isHovered={token.id === hoveredTokenId}
                onMouseEnter={() => setHoveredTokenId(token.id)}
                onMouseLeave={() => setHoveredTokenId(null)}
                onDragEnd={(e) => handleTokenDragEnd(token, e)}
              />
            ))}
          </Layer>

          {/* Fog renders above tokens so hidden tokens are concealed */}
          <Layer listening={false}>{fogRects}</Layer>
        </Stage>
      </div>
    </div>
  );
}

function TokenShape({ token, cellSize, draggable, onDragEnd, isHovered, onMouseEnter, onMouseLeave }) {
  const radius = (cellSize * (token.size || 1)) / 2 - 4;
  return (
    <Group
      x={token.x}
      y={token.y}
      draggable={draggable}
      onDragEnd={onDragEnd}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Circle radius={radius} fill={token.color || '#8b2e2e'} stroke={isHovered ? '#f5d88a' : '#c9a86a'} strokeWidth={isHovered ? 3 : 2} />
      <Text
        text={token.name?.slice(0, 2).toUpperCase() || '?'}
        fontFamily="Source Sans 3"
        fontSize={radius * 0.7}
        fill="#f3eada"
        width={radius * 2}
        height={radius * 2}
        offsetX={radius}
        offsetY={radius}
        align="center"
        verticalAlign="middle"
      />
    </Group>
  );
}
