export function buildRenewWhatsAppLink(params: {
  coachName: string;
  email: string;
  planLabel: string;
  priceDzd: number;
  ownerWhatsapp: string;
}) {
  const text =
    `مرحبا، أنا ${params.coachName} (${params.email}).\n` +
    `أرغب في تفعيل/تجديد اشتراكي في CoachPage DZ.\n` +
    `الخطة المختارة: ${params.planLabel} — ${params.priceDzd} دج.`;
  return `https://wa.me/${params.ownerWhatsapp}?text=${encodeURIComponent(text)}`;
}
