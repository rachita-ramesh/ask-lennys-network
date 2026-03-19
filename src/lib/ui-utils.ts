export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#D45D48",
    "#5F6854",
    "#8B7355",
    "#6B8E7B",
    "#9B6B5E",
    "#7B8471",
    "#A67B5B",
  ];
  return colors[Math.abs(hash) % colors.length];
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
