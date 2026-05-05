export function calculateTrendingScore({ likesCount, commentsCount, createdAt }) {
  const hoursOld = Math.max(
    0,
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60),
  );

  return likesCount * 1 + commentsCount * 2 + (1 / (hoursOld + 2)) * 50;
}

export function calculateStars({ likesCount, commentsCount, spotlightCount }) {
  const stars = Math.floor(likesCount / 10) + spotlightCount * 2 + Math.floor(commentsCount / 5) * 0.5;
  return Number(stars.toFixed(1));
}

export function tierFromStars(stars) {
  if (stars >= 300) {
    return "MAHFIL_E_KHAS";
  }
  if (stars >= 51) {
    return "USTAD";
  }
  return "NAYA_SHAYAR";
}
