import React from 'react';
import { PlayerState, TombGuardian } from '../types/game';

interface StatusPanelProps {
  player: PlayerState;
  turn: number;
  status: string;
  guardian: TombGuardian | null;
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
      </div>
    </div>
  );
};
