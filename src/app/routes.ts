import { createBrowserRouter } from 'react-router';
import WelcomePage from './pages/WelcomePage';
import ChoosePhotosPage from './pages/ChoosePhotosPage';
import DisclaimerPage from './pages/DisclaimerPage';
import CameraPreviewPage from './pages/CameraPreviewPage';
import PhotoCapturePage from './pages/PhotoCapturePage';
import CustomizePage from './pages/CustomizePage';
import PrintPage from './pages/PrintPage';
import SendEmailPage from './pages/SendEmailPage';
import GoodbyePage from './pages/GoodbyePage';
import PinGatePage from './pages/PinGatePage';
import AuthGuard from './components/AuthGuard';

export const router = createBrowserRouter([
  {
    path: '/pin',
    Component: PinGatePage,
  },
  {
    Component: AuthGuard,
    children: [
      {
        path: '/',
        Component: WelcomePage,
      },
      {
        path: '/choose-photos',
        Component: ChoosePhotosPage,
      },
      {
        path: '/disclaimer',
        Component: DisclaimerPage,
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
    ],
  },
]);
