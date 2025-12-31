import { PaymentClient } from '@/components/payment-client';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function PaymentPage() {
  const qrCodeImage = PlaceHolderImages.find(img => img.id === 'qr-code');

  if (!qrCodeImage) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            Error: QR Code image not found.
        </div>
    )
  }

  return <PaymentClient qrCodeImageUrl={qrCodeImage.imageUrl} />;
}
