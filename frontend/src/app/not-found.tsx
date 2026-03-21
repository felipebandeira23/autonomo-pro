import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="animate-fade-in"
      style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '620px',
          textAlign: 'center',
          padding: '48px',
          border: '1px solid var(--border-light)',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            margin: '0 auto 24px auto',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 82, 204, 0.08)',
            color: 'var(--primary)',
            fontSize: '2rem',
            fontWeight: 800,
          }}
        >
          404
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
          Conteudo nao encontrado
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '28px' }}>
          O registro ou pagina solicitado nao existe mais, foi movido ou nao esta disponivel para este workspace.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <Link
            href="/pagamentos"
            style={{
              padding: '12px 18px',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Voltar para pagamentos
          </Link>
          <Link
            href="/"
            style={{
              padding: '12px 18px',
              borderRadius: '8px',
              background: 'transparent',
              color: 'var(--text-main)',
              textDecoration: 'none',
              fontWeight: 600,
              border: '1px solid var(--border-light)',
            }}
          >
            Ir para dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
