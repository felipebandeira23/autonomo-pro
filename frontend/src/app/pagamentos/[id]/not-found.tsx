import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ padding: '64px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🔍</div>
      <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
        Lançamento Não Encontrado
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
        O identificador RPA acessado não existe na base atual ou foi purgado. 
        Confira se o ID está correto ou se você está na Unidade Gestora certa.
      </p>
      <Link
        href="/pagamentos"
        style={{
          background: 'var(--primary)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: 600,
          textDecoration: 'none',
          display: 'inline-block',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        Retornar à Esteira de Pagamentos
      </Link>
    </div>
  );
}
