export const genres = [
  { value: "rock", label: "Rock" }, { value: "pop", label: "Pop" },
  { value: "hip hop", label: "Hip-hop" }, { value: "dance", label: "Dance" },
  { value: "electronic", label: "Electronic" }, { value: "jazz", label: "Jazz" },
  { value: "classical", label: "Classical" }, { value: "indie", label: "Indie" },
  { value: "metal", label: "Metal" }, { value: "r&b", label: "R&B" },
  { value: "country", label: "Country" }, { value: "other", label: "Other" },
];

export function parseGenres(query: string | string[] | undefined) {
  const selected = new Set(Array.isArray(query) ? query : query ? [query] : []);
  return genres.filter(({ value }) => selected.has(value)).map(({ value }) => value);
}

export function suggestGenre(artistGenres: string[]) {
  for (const raw of artistGenres) {
    const name = raw.toLowerCase().replaceAll("-", " ").trim();
    const match = genres.find(({ value }) => name === value);
    if (match) return match.value;
    if (/(?:^| )hip hop$/.test(name) || /(?:^| )rap$/.test(name)) return "hip hop";
    const broad = genres.find(({ value }) => name.endsWith(` ${value}`));
    if (broad) return broad.value;
  }
  return "other";
}

export function feedHref(selected: string[] = [], anchor = true) {
  return { pathname: "/", query: selected.length ? { genre: selected } : undefined, hash: anchor ? "latest-shares" : undefined };
}

export function postHref(id: string, selected: string[] = []) {
  return { pathname: `/post/${id}`, query: selected.length ? { genre: selected } : undefined };
}
