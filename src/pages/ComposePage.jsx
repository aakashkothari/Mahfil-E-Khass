import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { moodOptions } from "../lib/moods";
import { api } from "../lib/api";

export function ComposePage() {
  const navigate = useNavigate();
  const [contentRoman, setContentRoman] = useState("");
  const [contentHindi, setContentHindi] = useState("");
  const [contentTransliterated, setContentTransliterated] = useState("");
  const [moodTag, setMoodTag] = useState("ishq");
  const [loading, setLoading] = useState({
    translate: false,
    mood: false,
    transliterate: false,
    post: false,
  });
  const [error, setError] = useState("");

  async function runAction(key, endpoint, handler) {
    setError("");
    setLoading((current) => ({ ...current, [key]: true }));
    try {
      const response = await api(endpoint, {
        method: "POST",
        body: JSON.stringify({ text: contentRoman }),
      });
      handler(response);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setLoading((current) => ({ ...current, [key]: false }));
    }
  }

  async function submitPost() {
    setError("");
    setLoading((current) => ({ ...current, post: true }));
    try {
      await api("createPost", {
        method: "POST",
        body: JSON.stringify({
          contentRoman,
          contentHindi,
          contentTransliterated,
          moodTag,
        }),
      });
      navigate("/");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading((current) => ({ ...current, post: false }));
    }
  }

  return (
    <div className="mx-auto max-w-poetry space-y-8">
      <section className="mahfil-card overflow-hidden">
        <div className="border-b border-surface-border px-6 py-6">
          <p className="mahfil-pill border-primary/20 bg-primary/10 text-primary">Compose</p>
          <h1 className="mt-4 font-poetry text-4xl">Dil ki mehfil sajaiye.</h1>
          <p className="mt-3 text-sm leading-7 text-text-soft">
            Roman mein likhiye, Hindi translation lijiye, mood pehchaniye, aur phir duniya ko suna
            dijiye.
          </p>
        </div>

        <div className="space-y-8 px-6 py-6">
          <div className="verse-lead">
            <textarea
              rows={9}
              value={contentRoman}
              onChange={(event) => setContentRoman(event.target.value)}
              className="w-full resize-none border-none bg-transparent p-0 font-poetry text-[1.6rem] leading-[2.5rem] text-text-main placeholder:text-text-soft/50 focus:outline-none"
              placeholder="Apni shayari likhiye..."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                runAction("translate", "ai-translate", (response) =>
                  setContentHindi(response.translation),
                )
              }
              disabled={!contentRoman.trim() || loading.translate}
            >
              {loading.translate ? "..." : "Translate to Hindi"}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                runAction("mood", "ai-tag-mood", (response) => setMoodTag(response.mood))
              }
              disabled={!contentRoman.trim() || loading.mood}
            >
              {loading.mood ? "..." : "Mood Auto Detect"}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                runAction("transliterate", "ai-transliterate", (response) =>
                  setContentTransliterated(response.transliteration),
                )
              }
              disabled={!contentRoman.trim() || loading.transliterate}
            >
              {loading.transliterate ? "..." : "Refine Roman"}
            </Button>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-surface-border bg-surface-soft/80 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-text-soft">Hindi Script</p>
              <p className="mt-4 whitespace-pre-line font-urdu text-[1.45rem] leading-[2.8rem] text-text-main">
                {contentHindi || "Yahan aapki Devanagari translation nazar aayegi..."}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-surface-border bg-surface-soft/80 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-text-soft">Polished Roman</p>
              <p className="mt-4 whitespace-pre-line text-sm leading-8 text-text-main">
                {contentTransliterated || "Aapka refined roman flow yahan milega..."}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-text-soft">Select Mood</p>
            <div className="flex flex-wrap gap-3">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMoodTag(option.value)}
                  className={`mahfil-pill border ${option.bg} ${option.border} ${option.color} ${
                    moodTag === option.value ? "ring-2 ring-white/20" : ""
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-surface-border pt-6">
            <p className="text-xs uppercase tracking-[0.22em] text-text-soft">
              {contentRoman.trim().length}/1400 characters
            </p>
            <Button
              size="lg"
              onClick={submitPost}
              disabled={!contentRoman.trim() || loading.post}
            >
              {loading.post ? "Post ho raha hai..." : "Post Shayari"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
