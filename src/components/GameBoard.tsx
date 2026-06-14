import React from 'react';
import { GameState, ScentLure, TombGuardian } from '../types/game';

interface GameBoardProps {
  game: GameState;
}

const TILE_SIZE = 40;

const tileIcons: Record<string, string> = {
  wall: '🧱',
  floor: '',
  entrance: '🚪',
  exit: '⬆️',
  stone: '🪨',
  pressurePlate: '🔘',
  door: '🚪',
  trap: '⚠️',
  relic: '💎',
  torch: '🔥',
  chest: '📦',
};

function strengthToColor(strength: number, intensity: number): string {
  const alpha = Math.max(0.05, Math.min(0.35, intensity * 0.12));
  if (strength >= 3) return `rgba(217, 70, 239, ${alpha})`;
  if (strength >= 2) return `rgba(168, 85, 247, ${alpha})`;
  return `rgba(139, 92, 246, ${alpha * 0.7})`;
}

export const GameBoard: React.FC<GameBoardProps> = ({ game }) => {
  const { room, player } = game;

  const lureAuraMap: Record<string, { lure: ScentLure; intensity: number }> = {};
  for (const lure of room.scentLures) {
    if (lure.turnsRemaining <= 0) continue;
    const centerTile = room.tiles[lure.position.y]?.[lure.position.x];
    if (!centerTile || !centerTile.visible) continue;
    const radius = Math.ceil(lure.strength);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = lure.position.x + dx;
        const ny = lure.position.y + dy;
        const key = `${nx},${ny}`;
        const t = room.tiles[ny]?.[nx];
        if (!t || !t.visible) continue;
        const dist = Math.abs(dx) + Math.abs(dy);
        if (dist > radius) continue;
        const intensity = (radius - dist + 1);
        const existing = lureAuraMap[key];
        if (!existing || existing.intensity < intensity) {
          lureAuraMap[key] = { lure, intensity };
        }
      }
    }
  }

  const patrolMarkers: Record<string, true> = {};
  if (room.guardian && room.guardian.visible && room.guardian.patrolRoute) {
    for (const p of room.guardian.patrolRoute) {
      const t = room.tiles[p.y]?.[p.x];
      if (t && (t.visible || t.explored)) {
        patrolMarkers[`${p.x},${p.y}`] = true;
      }
    }
  }

  const detectMarkers: Record<string, true> = {};
  if (room.guardian && room.guardian.visible) {
    const r = room.guardian.detectRange;
    const gx = room.guardian.position.x;
    const gy = room.guardian.position.y;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) + Math.abs(dy) > r) continue;
        const nx = gx + dx;
        const ny = gy + dy;
        const t = room.tiles[ny]?.[nx];
        if (t && (t.visible || t.explored)) {
          detectMarkers[`${nx},${ny}`] = true;
        }
      }
    }
  }

  const getTileStyle = (tile: any, x: number, y: number): React.CSSProperties => {
    const isPlayer = player.position.x === x && player.position.y === y;
    const baseStyle: React.CSSProperties = {
      width: TILE_SIZE,
      height: TILE_SIZE,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      position: 'relative',
      transition: 'all 0.2s ease',
      overflow: 'hidden',
    };

    if (!tile.visible && !tile.explored) {
      return { ...baseStyle, backgroundColor: '#1a1a2e' };
    }

    if (!tile.visible && tile.explored) {
      return { ...baseStyle, backgroundColor: '#2d2d44', opacity: 0.5 };
    }

    let bgColor = '#3d3d5c';
    switch (tile.type) {
      case 'wall':
        bgColor = '#4a4a6a';
        break;
      case 'floor':
        bgColor = tile.lit ? '#5a5a7a' : '#3d3d5c';
        break;
      case 'entrance':
        bgColor = '#2d5a2d';
        break;
      case 'exit':
        bgColor = '#5a5a2d';
        break;
      case 'door':
        bgColor = tile.activated ? '#2d5a5a' : '#5a2d2d';
        break;
      case 'pressurePlate':
        bgColor = tile.activated ? '#4a7a4a' : '#5a5a5a';
        break;
      default:
        bgColor = tile.lit ? '#5a5a7a' : '#3d3d5c';
    }

    return { ...baseStyle, backgroundColor: bgColor };
  };

  const getAuraOverlay = (x: number, y: number): React.CSSProperties | null => {
    const aura = lureAuraMap[`${x},${y}`];
    if (!aura) return null;
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: strengthToColor(aura.lure.strength, aura.intensity),
      pointerEvents: 'none',
      zIndex: 3,
    };
  };

  const getDetectOverlay = (x: number, y: number, guardian: TombGuardian): React.CSSProperties | null => {
    if (!detectMarkers[`${x},${y}`]) return null;
    if (x === guardian.position.x && y === guardian.position.y) return null;
    const isChasing = guardian.state === 'chasing';
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isChasing
        ? 'rgba(248, 113, 113, 0.18)'
        : 'rgba(251, 191, 36, 0.12)',
      border: `1px dashed ${isChasing ? '#f87171' : '#fbbf24'}`,
      boxSizing: 'border-box',
      pointerEvents: 'none',
      zIndex: 2,
    };
  };

  const getTileContent = (tile: any, x: number, y: number) => {
    const isPlayer = player.position.x === x && player.position.y === y;
    const lure = room.scentLures.find(
      (l) => l.position.x === x && l.position.y === y && l.turnsRemaining > 0
    );

    if (isPlayer) {
      return <span style={{ zIndex: 10 }}>🧙</span>;
    }

    if (!tile.visible && !tile.explored) {
      return null;
    }

    const overlays: React.ReactNode[] = [];

    const patrolMarker = patrolMarkers[`${x},${y}`];
    if (patrolMarker) {
      overlays.push(
        <div
          key="patrol"
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'rgba(168, 85, 247, 0.8)',
            top: '4px',
            left: '4px',
            pointerEvents: 'none',
            zIndex: 4,
          }}
          title="守墓兽巡逻点"
        />
      );
    }

    if (room.guardian && room.guardian.visible && room.guardian.position.x === x && room.guardian.position.y === y) {
      const gState = room.guardian.state;
      let icon = '👹';
      if (gState === 'ambushing') icon = '👁️';
      else if (gState === 'investigating') icon = '🐕';
      else if (gState === 'chasing') icon = '👹';
      overlays.push(
        <span key="guardian" style={{ zIndex: 9, filter: gState === 'chasing' ? 'drop-shadow(0 0 4px #f87171)' : 'none' }}>
          {icon}
        </span>
      );
      overlays.push(
        <div
          key="gstate"
          style={{
            position: 'absolute',
            bottom: '1px',
            right: '2px',
            fontSize: '9px',
            padding: '0 3px',
            borderRadius: '3px',
            backgroundColor:
              gState === 'chasing' ? '#f87171' :
              gState === 'ambushing' ? '#a855f7' :
              gState === 'investigating' ? '#fbbf24' : '#60a5fa',
            color: '#1a1a2e',
            fontWeight: 'bold',
            zIndex: 11,
          }}
        >
          {gState === 'chasing' ? '追' :
           gState === 'ambushing' ? '伏' :
           gState === 'investigating' ? '查' : '巡'}
        </div>
      );
    }

    if (lure && tile.visible) {
      overlays.push(
        <span key="lure" style={{ zIndex: 8, opacity: 0.95 }}>🧴</span>
      );
      overlays.push(
        <div
          key="lureinfo"
          style={{
            position: 'absolute',
            top: '1px',
            left: '1px',
            fontSize: '9px',
            padding: '0 3px',
            borderRadius: '3px',
            backgroundColor: lure.strength >= 3 ? '#d946ef' : lure.strength >= 2 ? '#a855f7' : '#8b5cf6',
            color: '#1a1a2e',
            fontWeight: 'bold',
            zIndex: 12,
          }}
          title={`${lure.itemName}｜强度${lure.strength}｜${lure.turnsRemaining}回合`}
        >
          {lure.strength}⭐{lure.turnsRemaining}
        </div>
      );
    }

    const trap = room.traps.find(
      (t) => t.position.x === x && t.position.y === y && t.visible
    );
    if (trap && tile.visible) {
      overlays.push(
        <span key="trap">{trap.triggered ? '💥' : '⚠️'}</span>
      );
    }

    const relic = room.relics.find(
      (r) => r.position.x === x && r.position.y === y && !r.collected
    );
    if (relic && tile.visible) {
      overlays.push(<span key="relic">💎</span>);
    }

    const torch = room.torches.find(
      (t) => t.position.x === x && t.position.y === y && t.fuel > 0
    );
    if (torch && tile.visible) {
      overlays.push(<span key="torch">🔥</span>);
    }

    let doorIcon = '';
    if (tile.type === 'door') {
      doorIcon = tile.activated ? '🚪' : '🔒';
    }

    const baseIcon = tileIcons[tile.type] || '';

    return (
      <>
        <span style={{ zIndex: 1 }}>{doorIcon || baseIcon}</span>
        {overlays}
      </>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#1a1a2e',
        borderRadius: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#bbb',
        }}
      >
        {room.guardian && (
          <div style={{ padding: '4px 8px', backgroundColor: '#2d2d44', borderRadius: '4px' }}>
            <span style={{ color: '#a855f7' }}>●</span> 紫点 = 守墓兽巡逻伏击点
          </div>
        )}
        {room.guardian && room.guardian.visible && (
          <div style={{ padding: '4px 8px', backgroundColor: '#2d2d44', borderRadius: '4px' }}>
            检测范围：{room.guardian.state === 'chasing' ? <span style={{ color: '#f87171' }}>🔴 红色</span> : <span style={{ color: '#fbbf24' }}>🟡 黄色虚框</span>}
          </div>
        )}
        {room.scentLures.filter(l => l.turnsRemaining > 0).length > 0 && (
          <div style={{ padding: '4px 8px', backgroundColor: '#2d2d44', borderRadius: '4px' }}>
            <span style={{ color: '#a855f7' }}>□</span> 紫光晕 = 气味辐射范围｜数字=强度⭐剩余回合
          </div>
        )}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${room.width}, ${TILE_SIZE}px)`,
          gap: '1px',
          backgroundColor: '#1a1a2e',
          border: '3px solid #4a4a6a',
          borderRadius: '4px',
          padding: '2px',
        }}
      >
        {room.tiles.map((row, y) =>
          row.map((tile, x) => (
            <div key={`${x}-${y}`} style={getTileStyle(tile, x, y)}>
              {room.guardian && room.guardian.visible && (() => {
                const ov = getDetectOverlay(x, y, room.guardian);
                return ov ? <div style={ov} /> : null;
              })()}
              {(() => {
                const ov = getAuraOverlay(x, y);
                return ov ? <div style={ov} /> : null;
              })()}
              {getTileContent(tile, x, y)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
