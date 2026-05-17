export async function generateQRDataURL(text: string): Promise<string> {
  try {
    const QRCode = await import('qrcode');
    return await QRCode.toDataURL(text, {
      width: 280,
      margin: 2,
      color: { dark: '#1A1A1A', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    });
  } catch {
    return '';
  }
}

export async function generateQRSVG(text: string): Promise<string> {
  try {
    const QRCode = await import('qrcode');
    return await QRCode.toString(text, {
      type: 'svg',
      width: 280,
      margin: 2,
      color: { dark: '#1A1A1A', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    });
  } catch {
    return '';
  }
}
