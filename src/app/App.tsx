import { RouterProvider } from 'react-router';
import { PhotoboothProvider } from './context/PhotoboothContext';
import { AuthProvider } from './context/AuthContext';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <PhotoboothProvider>
        <RouterProvider router={router} />
      </PhotoboothProvider>
    </AuthProvider>
  );
}
