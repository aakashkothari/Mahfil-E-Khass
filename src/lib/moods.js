export const MOODS = {
  ishq: {
    label: "Ishq",
    color: "text-mood-ishq",
    bg: "bg-mood-ishq/12",
    border: "border-mood-ishq/30",
  },
  dard: {
    label: "Dard",
    color: "text-mood-dard",
    bg: "bg-mood-dard/12",
    border: "border-mood-dard/30",
  },
  tanhai: {
    label: "Tanhai",
    color: "text-mood-tanhai",
    bg: "bg-mood-tanhai/12",
    border: "border-mood-tanhai/30",
  },
  khushi: {
    label: "Khushi",
    color: "text-mood-khushi",
    bg: "bg-mood-khushi/12",
    border: "border-mood-khushi/30",
  },
  gussa: {
    label: "Gussa",
    color: "text-mood-gussa",
    bg: "bg-mood-gussa/12",
    border: "border-mood-gussa/30",
  },
  umeed: {
    label: "Umeed",
    color: "text-mood-umeed",
    bg: "bg-mood-umeed/12",
    border: "border-mood-umeed/30",
  },
  yaadein: {
    label: "Yaadein",
    color: "text-mood-yaadein",
    bg: "bg-mood-yaadein/12",
    border: "border-mood-yaadein/30",
  },
};

export const moodOptions = Object.entries(MOODS).map(([value, mood]) => ({
  value,
  ...mood,
}));
