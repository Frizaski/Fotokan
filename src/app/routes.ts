import { createBrowserRouter } from 'react-router';
import WelcomePage from './pages/WelcomePage';
import ChoosePhotosPage from './pages/ChoosePhotosPage';
import CameraPreviewPage from './pages/CameraPreviewPage';
import PhotoCapturePage from './pages/PhotoCapturePage';
import CustomizePage from './pages/CustomizePage';
import PrintPage from './pages/PrintPage';
import SendEmailPage from './pages/SendEmailPage';
import GoodbyePage from './pages/GoodbyePage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: WelcomePage,
  },
  {
    path: '/choose-photos',
    Component: ChoosePhotosPage,
  },
  {
    path: '/camera-preview',
    Component: CameraPreviewPage,
  },
  {
    path: '/capture',
    Component: PhotoCapturePage,
  },
  {
    path: '/customize',
    Component: CustomizePage,
  },
  {
    path: '/print',
    Component: PrintPage,
  },
  {
    path: '/send-email',
    Component: SendEmailPage,
  },
  {
    path: '/goodbye',
    Component: GoodbyePage,
  },
]);
