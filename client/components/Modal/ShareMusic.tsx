import { useMutation } from "@apollo/client/react";
import { Button, Group, Select, Stepper, TextInput, useComputedColorScheme } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import emojiData from "@emoji-mart/data";
import { useRouter } from "next/router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CreatePostDocument } from "../../graphql/generated/graphql";
import { graphqlUrl } from "../../lib/apollo";
import { PostRating } from "../Rating/Rating";

type Track = {
  id: string;
  artist: { id: string; name: string };
  title: string;
  albumName: string;
  albumUrl: string;
  previewUrl: string | null;
};

const genres = ["rock", "pop", "hip hop", "dance", "electronic", "classical", "indie", "metal", "r&b", "country", "other"];

async function spotify<T>(path: string, signal: AbortSignal): Promise<T> {
  const url = new URL(`spotify/${path}`, graphqlUrl);
  const response = await fetch(url, { credentials: "include", signal });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? "Could not reach Spotify.");
  }
  return response.json();
}

function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const theme = useComputedColorScheme("light");
  useEffect(() => {
    let cancelled = false;
    let picker: HTMLElement | undefined;
    void import("emoji-mart").then(({ Picker }) => {
      if (cancelled) return;
      // The browser picker is a custom element; its published types omit HTMLElement members.
      picker = new Picker({
        data: emojiData,
        theme,
        dynamicWidth: true,
        previewPosition: "none",
        onEmojiSelect: (emoji: { native: string }) => onSelect(emoji.native),
      }) as unknown as HTMLElement;
      picker.style.cssText = "width: min(100%, 352px); height: 270px";
      container.current?.append(picker);
    }).catch(() => { /* Emoji entry remains available through the system keyboard. */ });
    return () => {
      cancelled = true;
      picker?.remove();
    };
  }, [onSelect, theme]);
  return <div ref={container} />;
}

export function ShareMusic({ handleCloseModal }: { handleCloseModal: () => void }) {
  const router = useRouter();
  const [createPost, { loading: saving }] = useMutation(CreatePostDocument);
  const [active, setActive] = useState(0);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [searchError, setSearchError] = useState("");
  const [manual, setManual] = useState(false);
  const [selected, setSelected] = useState<Track | null>(null);
  const [artistName, setArtistName] = useState("");
  const [songName, setSongName] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [artistGenres, setArtistGenres] = useState<string[]>([]);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [showEmoji, setShowEmoji] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!search.trim() || manual || active !== 0) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ q: search.trim() });
      void spotify<Track[]>(`tracks?${params}`, controller.signal)
        .then(setResults)
        .catch((error: Error) => {
          if (!controller.signal.aborted) setSearchError(error.message);
        });
    }, 450);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, manual, active]);

  const artistId = selected?.artist.id;
  useEffect(() => {
    if (!artistId || manual) return;
    const controller = new AbortController();
    void spotify<string[]>(`artists/${encodeURIComponent(artistId)}/genres`, controller.signal)
      .then(setArtistGenres)
      .catch(() => { /* The user can still pick a genre. */ });
    return () => controller.abort();
  }, [artistId, manual]);

  const primaryGenre = artistGenres[0]?.toLowerCase();
  const broadGenre = primaryGenre?.endsWith("hip hop") ? "hip hop" : primaryGenre?.split(" ").at(-1);
  const suggestedGenre = broadGenre && genres.includes(broadGenre) ? broadGenre : "other";
  const reviewGenre = genre ?? suggestedGenre;

  const trackReady = manual ? Boolean(artistName.trim() && songName.trim()) : selected !== null;

  async function share(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trackReady || !review.trim() || !rating) return;
    setSaveError("");
    try {
      await createPost({
        variables: {
          artistName: manual ? artistName.trim() : selected!.artist.name,
          albumName: manual ? songName.trim() : selected!.title,
          title: review.trim(),
          previewSongUrl: manual ? null : selected!.previewUrl,
          genres: manual ? [] : artistGenres,
          genre: reviewGenre,
          rating,
          albumImage: manual ? "" : selected!.albumUrl,
        },
        refetchQueries: ["GetRecentPosts", "FilterPosts"],
      });
      handleCloseModal();
      notifications.show({ title: "Posted", message: "Your music review is live.", color: "teal" });
      void router.push("/");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not publish your review.");
    }
  }

  return (
    <div className="mt-6">
      <Stepper active={active} onStepClick={(step) => { if (step === 0) setActive(0); }} color="orange">
        <Stepper.Step label="Find song" allowStepSelect={active > 0}>
          <Button variant="subtle" onClick={() => { setManual(!manual); setArtistGenres([]); setSelected(null); }}>
            {manual ? "Search Spotify instead" : "Enter song details manually"}
          </Button>
          {manual ? (
            <div className="space-y-3">
              <TextInput label="Artist" value={artistName} maxLength={190} onChange={(event) => setArtistName(event.currentTarget.value)} required />
              <TextInput label="Song name" value={songName} maxLength={190} onChange={(event) => setSongName(event.currentTarget.value)} required />
            </div>
          ) : (
            <>
              <TextInput
                label="Song name"
                description="Search the Spotify catalog"
                value={search}
                maxLength={100}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                  setResults([]);
                  setSearchError("");
                  setSelected(null);
                  setArtistGenres([]);
                }}
              />
              {searchError && <p role="status" className="mt-2">{searchError}</p>}
              <ul className="space-y-2 mt-2">
                {results.map((track) => (
                  <li key={track.id}>
                    <button
                      type="button"
                      aria-pressed={selected?.id === track.id}
                      className="flex items-center gap-3 w-full p-2 text-left aria-pressed:border-orange-500 border border-transparent rounded"
                      onClick={() => { setSelected(track); setArtistGenres([]); }}
                    >
                      <img className="w-12 rounded" src={track.albumUrl || "/assets/image-placeholder.png"} alt="" />
                      <span><strong>{track.title}</strong> · {track.artist.name}</span>
                    </button>
                    {track.id === selected?.id && track.previewUrl && (
                      <audio controls src={track.previewUrl} aria-label="Song preview" />
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
          <Group justify="center" mt="lg">
            <Button color="orange" disabled={!trackReady} onClick={() => setActive(1)}>Next</Button>
          </Group>
        </Stepper.Step>
        <Stepper.Step label="Rate song" allowStepSelect={false}>
          <form className="space-y-3" onSubmit={share}>
            <p className="font-bold">{manual ? songName : selected?.title} · {manual ? artistName : selected?.artist.name}</p>
            <TextInput label="Write your review" value={review} maxLength={190} onChange={(event) => setReview(event.currentTarget.value)} required />
            <Button variant="subtle" type="button" onClick={() => setShowEmoji(!showEmoji)}>Add emoji</Button>
            {showEmoji && <EmojiPicker onSelect={(emoji) => {
              setReview((value) => value.length + emoji.length <= 190 ? value + emoji : value);
              setShowEmoji(false);
            }} />}
            <Select label="Genre" data={[...new Set([...genres, ...artistGenres])]} value={reviewGenre} onChange={setGenre} />
            <PostRating value={rating} onChange={setRating} />
            {saveError && <p role="alert">{saveError}</p>}
            <Group justify="center" mt="lg">
              <Button type="button" variant="default" onClick={() => setActive(0)}>Back</Button>
              <Button type="submit" color="orange" loading={saving} disabled={!review.trim() || !rating}>Share</Button>
            </Group>
          </form>
        </Stepper.Step>
      </Stepper>
    </div>
  );
}
