import { RouterProvider } from 'react-router';
import { PhotoboothProvider } from './context/PhotoboothContext';
import { router } from './routes';

export default function App() {
  return (
    <PhotoboothProvider>
      <RouterProvider router={router} />
    </PhotoboothProvider>
  );
}
