// Generate placeholder photo (colored canvas with text)
export function generatePlaceholderPhoto(index: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    const colors = [
      ['#FF6B6B', '#4ECDC4'],
      ['#A8E6CF', '#FFD3B6'],
      ['#FFAAA5', '#FF8B94'],
      ['#957DAD', '#D291BC'],
      ['#FEC8D8', '#FFDFD3'],
      ['#A8DADC', '#F1FAEE'],
    ];
    const colorPair = colors[index % colors.length];
    gradient.addColorStop(0, colorPair[0]);
    gradient.addColorStop(1, colorPair[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeText(`Photo ${index + 1}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText(`Photo ${index + 1}`, canvas.width / 2, canvas.height / 2);
    
    // Add decorative elements
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 20 + 5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  return canvas.toDataURL('image/jpeg');
}
