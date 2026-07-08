import { getSettings } from '@/lib/db';
import FloatingButtonsClient from './FloatingButtonsClient';

export default async function FloatingButtons() {
  const settings = await getSettings();
  const whatsapp = settings.whatsapp_number?.replace(/\s/g, '');
  const telegram = settings.telegram_username?.replace(/^@/, '');

  if (!whatsapp && !telegram) return null;

  return <FloatingButtonsClient whatsapp={whatsapp} telegram={telegram} />;
}
