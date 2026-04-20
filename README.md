# fotoKAN - Photobooth Web Application

A touchscreen-optimized photobooth web application that allows users to take, customize, print, and share digital copies of photo strips.

## Features

### 8 Sequential Pages

1. **Welcome Screen** - Introduction with "PHOTOBOOTH by fotoKAN"
2. **Choose Photos** - Select 3, 4, or 6 photos for your strip
3. **Camera Preview** - Live camera preview before starting
4. **Photo Capture** - Automatic photo capture with 10-second countdown
5. **Customize Strip** - Add backgrounds and stickers to your photos
6. **Print Settings** - Choose how many copies to print
7. **Send Email** - Enter email to receive digital copies (strip + GIF)
8. **Goodbye** - Thank you screen with option to start again

### Customization Options

**Backgrounds:**
- Yellow
- Blue
- Maroon
- Black
- White
- Baby Pink

**Stickers:**
- Star
- Heart
- Bubble
- Ribbon
- Cloud
- No Sticker

## Design System

- **Primary Background:** Blue (#1a1aff)
- **Accent Color:** Yellow (#FFD700)
- **Main Font Color:** White
- **Button Style:** White text with yellow border
- **Touch-optimized:** Large interactive components

## Technical Stack

- React 18
- React Router 7 (Data mode)
- TypeScript
- Tailwind CSS v4
- Camera API (navigator.mediaDevices.getUserMedia)
- Canvas API for photo capture

## Usage

### Camera Access
The application requires camera access to capture photos. Grant camera permissions when prompted.

### Sequential Flow
Users cannot skip steps - the application guides them through each stage sequentially.

### Printing
The print functionality uses browser's native print dialog. Configure your printer driver before use.

### Email
Email functionality is currently mocked for demo purposes. In production, integrate with your preferred email service.

## Development Notes

### State Management
- Global state managed via React Context (`PhotoboothContext`)
- Session resets after completing the flow

### Camera
- Mirrored preview for selfie mode
- Auto-capture with countdown timer
- No retake functionality (as per requirements)

### Photo Strip
- Dynamic layout based on photo count selection
- Real-time preview of customizations
- Film strip aesthetic with perforations and borders

## Future Enhancements

1. **Admin Dashboard** - Configure special event themes
2. **Real Email Integration** - Connect to email service provider
3. **Printer Integration** - Direct printer driver communication
4. **GIF Generation** - Actual animated GIF creation
5. **Photo Filters** - Additional customization options
6. **Multi-language Support** - Currently Indonesian/English mix

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (iOS)

Requires HTTPS for camera access (except localhost).
