export function destinyNumberFromBirthdate(dateString: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error("Invalid birthdate format");
  }

  const digits = dateString.replace(/\D/g, "");
  if (digits.length !== 8) {
    throw new Error("Invalid birthdate digits");
  }

  let sum = digits.split("").reduce((total, digit) => total + Number(digit), 0);

  while (sum >= 10) {
    sum = String(sum)
      .split("")
      .reduce((total, digit) => total + Number(digit), 0);
  }

  if (sum < 1 || sum > 9) {
    throw new Error("Destiny number out of range");
  }

  return sum;
}

