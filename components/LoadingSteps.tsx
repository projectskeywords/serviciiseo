'use client';

interface Props { steps: string[]; currentStep: number; }

export default function LoadingSteps({ steps, currentStep }: Props) {
  return (
    <div style={{ padding: '32px 0', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', marginBottom: 28 }}>
        <svg width="42" height="42" viewBox="0 0 42 42" style={{ animation: 'spin 0.9s linear infinite' }}>
          <circle cx="21" cy="21" r="17" fill="none" stroke="#E8E7F5" strokeWidth="3.5" />
          <path d="M21 4 A17 17 0 0 1 38 21" fill="none" stroke="#5B4FE8" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300, margin: '0 auto' }}>
        {steps.map((s, i) => {
          const done = i < currentStep - 1;
          const active = i === currentStep - 1;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: i >= currentStep ? 0.3 : 1, transition: 'opacity 0.3s' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? '#22C55E' : active ? '#5B4FE8' : '#E8E7F5',
              }}>
                {done
                  ? <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : active ? <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />
                  : null}
              </div>
              <span style={{ fontSize: 14, color: active ? '#0F0E1A' : '#5C5980', fontWeight: active ? 600 : 400 }}>{s}</span>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
