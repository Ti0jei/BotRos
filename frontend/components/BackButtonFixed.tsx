import { IconArrowBack } from '@tabler/icons-react';

export default function BackButtonFixed({
  onClick,
  children = 'Назад',
}: {
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        bottom: 0,
        width: '100vw',
        background: 'rgba(255,255,255,0.94)',
        padding: '14px 0 10px 0',
        boxShadow: '0 -2px 14px 0 rgba(0,0,0,0.07)',
        zIndex: 1200,
      }}
    >
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 20px' }}>
        <button
          onClick={onClick}
          style={{
            background: 'transparent',
            color: '#d6336c',
            fontWeight: 600,
            border: '1.5px solid #d6336c',
            borderRadius: 12,
            height: 44,
            width: '100%',
            fontSize: 17,
            transition: 'background 0.15s',
            boxShadow: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onMouseOver={e =>
            (e.currentTarget.style.background = '#ffe3ed')
          }
          onMouseOut={e =>
            (e.currentTarget.style.background = 'transparent')
          }
        >
          <IconArrowBack size={16} style={{ marginRight: 7, verticalAlign: 'middle' }} />
          {children}
        </button>
      </div>
    </div>
  );
}
