import React from 'react';
import { PlayerState, TombGuardian, ScentLure } from '../types/game';

interface StatusPanelProps {
  player: PlayerState;
  turn: number;
  status: string;
  guardian: TombGuardian | null;
  scentLures: ScentLure[];
}

const StatBar: React.FC<{
  label: string;
  value: number;
  max: number;
  color: string;
  icon: string;
}> = ({ label, value, max, color, icon }) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div style={{ marginBottom: '10px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
          fontSize: '14px',
        }}
      >
        <span>
          {icon} {label}
        </span>
        <span>
          {Math.floor(value)}/{max}
        </span>
      </div>
      <div
        style={{
          height: '12px',
          backgroundColor: '#2d2d44',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            backgroundColor: color,
            width: `${percentage}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};

export const StatusPanel: React.FC<StatusPanelProps> = ({
  player,
  turn,
  status,
  guardian,
  scentLures,
}) => {
  const statusText: Record<string, string> = {
    exploring: '🔍 探索中',
    escaping: '🏃 撤离中',
    victory: '🎉 胜利',
    defeat: '💀 失败',
  };

  return (
    <div
      style={{
        backgroundColor: '#252540',
        padding: '16px',
        borderRadius: '8px',
        color: '#e0e0e0',
        minWidth: '200px',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#c0c0ff' }}>
        📊 状态
      </h3>

      <div
        style={{
          padding: '8px',
          backgroundColor: '#1a1a2e',
          borderRadius: '4px',
          marginBottom: '16px',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        {statusText[status] || status}
      </div>

      <StatBar
        label="体力"
        value={player.stamina}
        max={player.maxStamina}
        color="#4ade80"
        icon="💚"
      />

      <StatBar
        label="负重"
        value={player.weight}
        max={player.maxWeight}
        color="#fbbf24"
        icon="🎒"
      />

      <StatBar
        label="亮度"
        value={player.brightness}
        max={player.maxBrightness}
        color="#fde047"
        icon="💡"
      />

      <StatBar
        label="诅咒"
        value={player.curse}
        max={player.maxCurse}
        color="#a855f7"
        icon="☠️"
      />

      <div
        style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #3d3d5c',
          fontSize: '14px',
        }}
      >
        <div style={{ marginBottom: '8px' }}>
          🏛️ 层数: <strong>{player.depth}</strong>
        </div>
        <div style={{ marginBottom: '8px' }}>
          🔥 火把: <strong>{player.torchesRemaining}</strong>
        </div>
        <div style={{ marginBottom: '8px' }}>
          ⏱️ 回合: <strong>{turn}</strong>
        </div>
        <div style={{ marginBottom: '8px' }}>
          💰 金币: <strong>{player.gold}</strong>
        </div>
        {guardian && (
          <div
            style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #3d3d5c',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f87171', marginBottom: '6px' }}>
              👹 守墓兽
            </div>
            <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '4px' }}>
              状态: {guardian.state === 'patrolling' ? '🔄 巡逻中' :
                     guardian.state === 'ambushing' ? '👁️ 伏击中' :
                     guardian.state === 'chasing' ? '⚠️ 追击中' :
                     '🐕 侦查中'}
            </div>
            <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '4px' }}>
              感知范围: {guardian.detectRange}
            </div>
            {guardian.state === 'chasing' && (
              <div style={{ fontSize: '12px', color: '#f87171', fontWeight: 'bold' }}>
                ⚠️ 正在追击你！
              </div>
            )}
          </div>
        )}
        {scentLures.filter(l => l.turnsRemaining > 0).length > 0 && (
          <div
            style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #3d3d5c',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#a855f7', marginBottom: '6px' }}>
              🧴 气味诱饵
            </div>
            {scentLures.filter(l => l.turnsRemaining > 0).map((lure, idx) => {
              const strengthDesc = lure.strength >= 3 ? '💜 强烈' : lure.strength >= 2 ? '💟 中等' : '♪ 微弱';
              return (
                <div
                  key={lure.id}
                  style={{
                    fontSize: '11px',
                    color: '#ccc',
                    marginBottom: '4px',
                    padding: '4px 6px',
                    backgroundColor: '#1a1a2e',
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>🧴 {lure.itemName}</span>
                    <span>{strengthDesc}</span>
                  </div>
                  <div style={{ color: '#999', marginTop: '2px' }}>
                    坐标({lure.position.x},{lure.position.y})｜⏱️{lure.turnsRemaining}回合
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
