import { useMutation } from "@apollo/client/react";
import { Modal, useComputedColorScheme } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { CreatePostDocument } from "../../graphql/generated/graphql";
import { graphqlUrl } from "../../lib/apollo";
import { genres, parseGenres, postHref, suggestGenre } from "../../lib/genres";
import { Field } from "../Auth/Auth";
import { Artwork, mediaUrl } from "../Post/PostMedia";
import { RatingField } from "../Rating/Rating";

type Track = {
  id: string;
  artist: { id: string; name: string };
  title: string;
  albumName: string;
  albumUrl: string;
  previewUrl: string | null;
};
type Results = { query: string; tracks: Track[] | null };

async function spotify<T>(path: string, signal: AbortSignal): Promise<T> {
  const url = new URL(`spotify/${path}`, new URL(graphqlUrl, window.location.origin));
  const response = await fetch(url, { credentials: "include", signal });
  if (!response.ok) throw new Error("Song search is unavailable");
  return response.json();
}

function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const theme = useComputedColorScheme("light");
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let picker: HTMLElement | undefined;
    void Promise.all([import("emoji-mart"), import("@emoji-mart/data")]).then(([{ Picker }, { default: data }]) => {
      if (cancelled) return;
      picker = new Picker({
        data, theme, dynamicWidth: true, previewPosition: "none", perLine: 8,
        onEmojiSelect: (emoji: { native: string }) => onSelect(emoji.native),
      }) as unknown as HTMLElement;
      picker.style.cssText = "width: min(100%, 352px); height: 240px";
      container.current?.append(picker);
      picker.shadowRoot?.querySelector<HTMLInputElement>("input")?.focus();
    }).catch(() => { if (!cancelled) setError(true); });
    return () => {
      cancelled = true;
      picker?.remove();
    };
  }, [onSelect, theme]);
  return <div ref={container}>{error && <p role="status">The emoji picker couldn’t open. You can still use your keyboard’s emoji picker.</p>}</div>;
}

export function ShareMusic({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const router = useRouter();
  const [createPost, { loading: saving }] = useMutation(CreatePostDocument);
  const [step, setStep] = useState<"find" | "write">("find");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [manual, setManual] = useState(false);
  const [selected, setSelected] = useState<Track | null>(null);
  const [artistName, setArtistName] = useState("");
  const [songName, setSongName] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [suggestedGenre, setSuggestedGenre] = useState("other");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [showEmoji, setShowEmoji] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [discarding, setDiscarding] = useState(false);
  const emojiButton = useRef<HTMLButtonElement>(null);
  const stepTitle = useRef<HTMLHeadingElement>(null);
  const discardButton = useRef<HTMLButtonElement>(null);
  const query = search.trim();
  const currentResults = results?.query === query ? results : null;
  const searchPending = Boolean(query && !currentResults);
  const reviewGenre = genre ?? suggestedGenre;
  const trackReady = manual ? Boolean(artistName.trim() && songName.trim()) : selected !== null;
  const ready = Boolean(trackReady && review.trim() && rating);
  const hasDraft = Boolean(search || selected || artistName || songName || review || rating || genre);

  useEffect(() => {
    if (!opened || !query || manual || step !== "find" || currentResults) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ q: query });
      void spotify<Track[]>(`tracks?${params}`, controller.signal).then((tracks) => {
        if (!controller.signal.aborted) setResults({ query, tracks });
      }).catch(() => {
        if (!controller.signal.aborted) setResults({ query, tracks: null });
      });
    }, 450);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [currentResults, manual, opened, query, step]);

  useEffect(() => {
    if (!selected) return;
    const artistId = selected.artist.id;
    const controller = new AbortController();
    void spotify<string[]>(`artists/${encodeURIComponent(artistId)}/genres`, controller.signal)
      .then((values) => { if (!controller.signal.aborted) setSuggestedGenre(suggestGenre(values)); })
      .catch(() => { /* The user can still pick a genre. */ });
    return () => controller.abort();
  }, [selected]);

  const addEmoji = useCallback((emoji: string) => {
    setReview((value) => value.length + emoji.length <= 190 ? value + emoji : value);
    setShowEmoji(false);
    emojiButton.current?.focus();
  }, []);

  function resetSongChoices() {
    setRating(0);
    setGenre(null);
    setSuggestedGenre("other");
    setSaveError("");
  }

  function toggleManual() {
    setManual(!manual);
    setSelected(null);
    setArtistName("");
    setSongName("");
    setSearch("");
    setResults(null);
    resetSongChoices();
  }

  function resetDraft() {
    setManual(false);
    setStep("find");
    setSelected(null);
    setArtistName("");
    setSongName("");
    setSearch("");
    setResults(null);
    setReview("");
    setShowEmoji(false);
    setDiscarding(false);
    resetSongChoices();
  }

  function changeStep(next: "find" | "write") {
    setStep(next);
    setShowEmoji(false);
    requestAnimationFrame(() => stepTitle.current?.focus());
  }

  function close() {
    if (saving) return;
    setShowEmoji(false);
    setDiscarding(false);
    onClose();
  }

  async function share(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || saving) return;
    setSaveError("");
    const selectedGenres = parseGenres(router.query.genre);
    let id: string;
    try {
      const { data } = await createPost({
        variables: {
          artistName: manual ? artistName.trim() : selected!.artist.name,
          albumName: manual ? songName.trim() : selected!.title,
          title: review.trim(),
          previewSongUrl: manual ? null : mediaUrl(selected!.previewUrl),
          spotifyTrackId: manual ? null : selected!.id,
          genres: [],
          genre: reviewGenre,
          rating,
          albumImage: manual ? "" : mediaUrl(selected!.albumUrl) ?? "",
        },
        update(cache) {
          cache.evict({ fieldName: "getRecentPosts" });
          cache.evict({ fieldName: "filterPosts" });
        },
      });
      if (!data?.createPost.id) throw new Error();
      id = data.createPost.id;
    } catch {
      setSaveError("Could not publish your post. Your draft is still here; try again.");
      return;
    }
    resetDraft();
    onClose();
    notifications.show({ message: <span role="status">Song shared.</span>, color: "teal", withCloseButton: false });
    await router.push(postHref(id, selectedGenres)).catch(() => {
      const params = new URLSearchParams(selectedGenres.map((value) => ["genre", value]));
      window.location.assign(`/post/${id}${params.size ? `?${params}` : ""}`);
    });
  }

  const stepLabel = step === "find" ? "1 of 2 · Find a song" : "2 of 2 · Write your recommendation";
  const preview = selected && mediaUrl(selected.previewUrl);

  return (
    <Modal opened={opened} onClose={close} title="Share a song" size="36rem" padding="md"
      closeOnEscape={!saving} closeOnClickOutside={!saving} closeButtonProps={{ "aria-label": "Close sharing dialog", disabled: saving }}
      xOffset="0.75rem" yOffset="0.75rem" classNames={{ content: "composer-panel", header: "composer-header", body: "composer" }}>
      <div className="composer-content">
        {discarding ? (
          <div className="auth-form">
            <h3 tabIndex={-1} ref={stepTitle} className="section-title">Discard this draft?</h3>
            <p>Your song details, note and rating will be cleared.</p>
          </div>
        ) : (
          <>
            <h3 tabIndex={-1} ref={stepTitle} className="composer-step">{stepLabel}</h3>
            {step === "find" ? (
              <form id="composer-find" className="auth-form" onSubmit={(event) => { event.preventDefault(); if (trackReady) changeStep("write"); }}>
                {manual ? (
                  <>
                    <Field label="Artist" name="artist" value={artistName} maxLength={190}
                      onChange={(event) => { setArtistName(event.currentTarget.value); resetSongChoices(); }} required />
                    <Field label="Song title" name="song" value={songName} maxLength={190}
                      onChange={(event) => { setSongName(event.currentTarget.value); resetSongChoices(); }} required />
                    <button className="action action--secondary justify-self-start" type="button" onClick={toggleManual}>Search Spotify instead</button>
                  </>
                ) : (
                  <>
                    <Field label="Search by song or artist" name="song-search" type="search" placeholder="Search Spotify" value={search} maxLength={100}
                      autoComplete="off" onChange={(event) => {
                        setSearch(event.currentTarget.value);
                        setResults(null);
                        setSelected(null);
                        resetSongChoices();
                      }} />
                    <p role="status" className="muted">
                      {!query ? "Search Spotify, or enter the song details yourself." :
                        searchPending ? "Searching…" :
                        currentResults?.tracks === null ? "Song search is unavailable. You can still enter the song details." :
                        !currentResults?.tracks.length ? "No matching songs. Try a different search or enter the details yourself." :
                        `${currentResults.tracks.length} ${currentResults.tracks.length === 1 ? "song" : "songs"} found. Choose a track to continue.`}
                    </p>
                    {Boolean(currentResults?.tracks?.length) && (
                      <ul className="track-results">
                        {currentResults?.tracks?.map((track) => (
                          <li key={track.id}>
                            <button type="button" className="track-result" aria-pressed={selected?.id === track.id}
                              onClick={() => { if (selected?.id !== track.id) { setSelected(track); resetSongChoices(); } }}>
                              <Artwork src={track.albumUrl} sizes="48px" />
                              <span className="wrap-anywhere"><strong>{track.title}</strong><br />{track.artist.name} <span className="muted">· {track.albumName}</span></span>
                            </button>
                            {track.id === selected?.id && (preview
                              ? <audio className="mt-2" controls preload="none" src={preview} aria-label="Song preview" />
                              : <p className="muted text-sm mt-2">No audio preview is available.</p>)}
                          </li>
                        ))}
                      </ul>
                    )}
                    <button className="action action--secondary justify-self-start" type="button" onClick={toggleManual}>Enter song details manually</button>
                  </>
                )}
                {review && <p className="field-hint">Your note is kept if you change songs. Choose a new rating and genre for the new song.</p>}
              </form>
            ) : (
              <form id="composer-write" className="auth-form" onSubmit={share} aria-busy={saving}>
                <p className="wrap-anywhere"><strong>{manual ? songName : selected?.title}</strong> · {manual ? artistName : selected?.artist.name}</p>
                <div className="field">
                  <label htmlFor="song-note">What do you like about this song? (required)</label>
                  <textarea className="field-control composer-note" id="song-note" rows={3} value={review}
                    maxLength={190} aria-describedby="note-count" disabled={saving}
                    onChange={(event) => setReview(event.currentTarget.value)} required />
                  <div className="actions justify-between">
                    <button className="action action--secondary" ref={emojiButton} type="button" disabled={saving}
                      aria-expanded={showEmoji} onClick={() => setShowEmoji(!showEmoji)}>Add emoji</button>
                    <p id="note-count" className="field-hint">{review.length} / 190 characters</p>
                  </div>
                  {showEmoji && <EmojiPicker onSelect={addEmoji} />}
                </div>
                <div className="field">
                  <label htmlFor="song-genre">Genre</label>
                  <select className="field-control" id="song-genre" value={reviewGenre} disabled={saving} onChange={(event) => setGenre(event.currentTarget.value)}>
                    {genres.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <RatingField value={rating} onChange={setRating} disabled={saving} />
                {saveError && <p className="field-error" role="alert">{saveError}</p>}
              </form>
            )}
            {hasDraft && (
              <div className="composer-draft">
                <p className="field-hint">Closing keeps this draft until you publish, sign out or reload.</p>
                <button type="button" className="link-button inline-link" ref={discardButton} disabled={saving}
                  onClick={() => { setDiscarding(true); requestAnimationFrame(() => stepTitle.current?.focus()); }}>Discard draft</button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="composer-footer">
        {discarding ? (
          <div className="actions">
            <button className="action action--secondary" type="button" onClick={() => { setDiscarding(false); requestAnimationFrame(() => discardButton.current?.focus()); }}>Keep draft</button>
            <button className="action action--danger" type="button" onClick={() => { resetDraft(); requestAnimationFrame(() => stepTitle.current?.focus()); }}>Discard draft</button>
          </div>
        ) : step === "find" ? (
          <button className="action" type="submit" form="composer-find" disabled={!trackReady}>Next: Write a note</button>
        ) : (
          <>
            <p className="field-hint">{!ready ? "Add a note and rating to publish your public post." : "Public post"}</p>
            <div className="actions">
              <button className="action action--secondary" type="button" disabled={saving} onClick={() => changeStep("find")}>Back</button>
              <button className="action" type="submit" form="composer-write" disabled={!ready || saving}>{saving ? "Publishing…" : "Publish post"}</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
