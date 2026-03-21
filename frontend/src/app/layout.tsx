import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

export const metadata: Metadata = {
  title: 'AutônomoPro - Painel Corporativo',
  description: 'Sistema Moderno de Gestão de Autônomos e Pagamentos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="layout-container">
          <Sidebar />
          <div className="main-content">
            <TopBar />
            <main className="page-container animate-fade-in">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
