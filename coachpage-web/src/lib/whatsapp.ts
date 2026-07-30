const OWNER_WHATSAPP = "213553093511";

export function buildRenewWhatsAppLink(params: { coachName: string; email: string; planLabel: string; priceDzd: number }) {
  const text =
    `مرحبا، أنا ${params.coachName} (${params.email}).\n` +
    `أرغب في تفعيل/تجديد اشتراكي في CoachPage DZ.\n` +
    `الخطة المختارة: ${params.planLabel} — ${params.priceDzd} دج.`;
  return `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(text)}`;
}
