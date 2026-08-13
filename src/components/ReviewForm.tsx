import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Star } from "lucide-react";
import { getSession } from "@/lib/session";
import { useCreateReview } from "@/hooks/api";
import type { StorefrontReview } from "@/lib/orderMappers";

export const ReviewForm = ({ onSubmitted }: { onSubmitted?: (r: StorefrontReview) => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const createReviewMut = useCreateReview();
  const [rating, setRating] = useState(5);
  const [subject, setSubject] = useState<StorefrontReview["subject"]>("Company");
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getSession();
    if (!user) {
      navigate(`/auth?next=${encodeURIComponent(location.pathname + "#reviews")}`);
      return;
    }
    if (text.trim().length < 5) return;
    try {
      const row = await createReviewMut.mutateAsync({
        customer: user.name,
        product: subject,
        rating,
        comment: text.trim(),
        status: "Approved",
      });
      const r: StorefrontReview = {
        id: row.id,
        name: user.name,
        subject,
        rating,
        text: text.trim(),
        createdAt: row.date,
      };
      setDone(true);
      setText("");
      onSubmitted?.(r);
      setTimeout(() => setDone(false), 3000);
    } catch {
      // silent — user sees no done state
    }
  };

  return (
    <form onSubmit={submit} className="border border-cream/15 p-6 bg-ink text-cream">
      <h3 className="font-display text-2xl mb-4">SHARE YOUR REACTION</h3>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs uppercase tracking-widest text-cream/60">Rating</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className="p-0.5"
              aria-label={`${n} stars`}
            >
              <Star className={`h-5 w-5 ${n <= rating ? "fill-accent text-accent" : "text-cream/30"}`} />
            </button>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-2 mb-3">
        {(["Company", "Product Quality", "Service"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSubject(s)}
            className={`text-xs uppercase tracking-wide border py-2 transition ${
              subject === s ? "bg-cream text-ink border-cream" : "border-cream/25 text-cream/80 hover:border-cream"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Tell us about your experience…"
        className="w-full bg-transparent border border-cream/20 p-3 text-sm placeholder:text-cream/40 focus:outline-none focus:border-accent"
      />
      <div className="flex items-center justify-between mt-3 gap-3">
        <p className="text-[11px] text-cream/50">Login required to submit a review.</p>
        <button disabled={createReviewMut.isPending} className="bg-cream text-ink px-5 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-accent hover:text-cream transition disabled:opacity-60">
          {createReviewMut.isPending ? "Submitting…" : "Submit Review"}
        </button>
      </div>
      {done && <p className="text-xs text-accent mt-3">Thanks — your reaction is live.</p>}
    </form>
  );
};
