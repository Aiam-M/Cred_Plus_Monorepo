import Header from '../components/Header';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-cred-gray-neutral">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
