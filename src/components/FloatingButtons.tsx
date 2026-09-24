import { getSettings } from '@/lib/db';
import FloatingButtonsClient from './FloatingButtonsClient';

export default async function FloatingButtons() {
  const settings = await getSettings();
  const whatsapp = settings.whatsapp_number?.replace(/\s/g, '');
  const telegram = settings.telegram_username?.replace(/^@/, '');
  const phone = settings.phone?.trim();

  if (!whatsapp && !telegram && !phone) return null;

  return <FloatingButtonsClient whatsapp={whatsapp} telegram={telegram} phone={phone} />;
}
