export const numberValue = (value: number | '' | undefined | null) => Number(value || 0);

export const currency = (value: number | '' | undefined | null) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(numberValue(value));

export const calculateItem = <T extends { qty: number | ''; rate: number | ''; discount: number | '' }>(item: T) => {
  const gross = numberValue(item.qty) * numberValue(item.rate);
  const amount = gross - (gross * numberValue(item.discount)) / 100;
  return { gross, amount };
};
