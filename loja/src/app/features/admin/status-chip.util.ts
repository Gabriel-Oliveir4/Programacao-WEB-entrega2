export function statusChipClass(status?: string | null): string {
  const normalized = (status ?? '').toLowerCase();

  if (normalized === 'pago' || normalized === 'ativo') return 'chip-paid';
  if (normalized === 'criado') return 'chip-created';
  if (normalized === 'cancelado' || normalized === 'inativo') return 'chip-cancelado';

  return 'chip-default';
}
