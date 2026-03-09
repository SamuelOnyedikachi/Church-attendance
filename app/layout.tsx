import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ConvexClientProvider from './ConvexClientProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rythmn 5 Fellowship UGH',
  description: 'Church Attendance Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative isolate flex min-h-screen flex-col text-gray-950`} suppressHydrationWarning>
        <div
          className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center opacity-5"
          style={{ backgroundImage: "url('/church-bg.png')" }}
        />

        <div className='flex-1'><ConvexClientProvider>{children}</ConvexClientProvider></div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Footer />
      </body>
    </html>
  );
}
