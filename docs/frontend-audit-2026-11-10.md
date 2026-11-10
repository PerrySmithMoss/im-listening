# Frontend design and usability audit

10 November 2026 · reviewed against commit `cd9f23b4`

I'm Listening has a clear core activity: share a song, explain why you like it, and discover other people's recommendations. The orange identity and music illustrations give it character, and the manual sharing flow works. The strongest improvement would be to organise the experience around that activity. At present, decorative content, inconsistent layouts, and several misleading states compete with it.

Fix the readability and responsive bugs first, remove misleading artwork and inactive discovery content, then improve the feed and composer. A complete visual rebrand is unnecessary.

## Scope and evidence

This combines inspection of every frontend page and its supporting components with browser checks against the local Next.js frontend and API. This audit changed no production data or application source. A disposable local account and post were created for the authenticated checks and removed afterwards.

**Evidence labels:** **Browser** means reproduced in the rendered app; **Code** means established by the implementation; **Recommendation** means a proposed product/design improvement. Code findings that depend on unavailable services are not presented as completed integration tests.

| Screen or flow | Coverage |
| --- | --- |
| Public home | Desktop and mobile; hero, empty feed, filters, discovery, popular tracks, artists, footer |
| Signed-in home | Mobile and desktop layouts; account menu, share entry, populated feed, genre selection and removal |
| Song sharing | Spotify unavailable state; manual entry → review → emoji → rating → publication; publication while a different genre is selected |
| Post detail | Public and owner views; desktop and mobile; missing artwork; delete implementation reviewed without clicking delete |
| Login and registration | Initial screens; light/dark login; login and logout; login return destination; mobile, tablet and narrow desktop layouts; registration implementation |
| Forgot and reset password | Initial screens and implementation; no email delivery or password change performed |
| Google onboarding and sign-in settings | Expired/unavailable screens and implementation; live Google flow unavailable in local configuration |
| Privacy and terms | Mobile rendering, hierarchy and inline links; content presentation only |
| Missing post | Default 404 from `/post/0` |

Viewports sampled: 320 × 740, 390 × 844, 430 × 844, 834 × 1112, 1050 × 800, and 1280 × 720/800. These were targeted checks, not an exhaustive route-by-viewport matrix. Browser viewport checks do not cover real phone keyboards or touch hardware.

The initial pre-existing frontend stopped responding and had a missing middleware-manifest error. Inspection continued on a fresh local development server. This environment interruption is not counted as a product defect. Development-tool badges visible in screenshots are not production UI findings.

## Priority and recommended order

P1 means fix before spending time on cosmetic polish; P2 means the next usability iteration; P3 means follow-up polish or a product decision. Effort is relative: S is a focused component change, M spans shared components or state, and L needs a larger product/data change.

| Order | Work | Findings | Effort |
| --- | --- | --- | --- |
| 1 | Make forms readable, responsive, and consistently accessible | 01–03, 17, 21–22 | M |
| 2 | Make artwork, identity, and destructive actions trustworthy | 04–06 | S–M |
| 3 | Repair return navigation and publication feedback | 07, 12–13 | M |
| 4 | Simplify the homepage and standardise post cards | 08–11, 23 | M |
| 5 | Refine song search, writing, and recovery | 14–20 | M |
| 6 | Optimise imagery, sharing metadata, and unused code | 24–26 | S–M |

## Findings

### 01 P1 Dark-mode form text is difficult to read

**Browser + Code.** Login inputs use black text on a browser-supplied dark input background. Measured colours were `#000000` on `#3b3b3b`, approximately **1.87:1** contrast. The same hard-coded `text-black` pattern appears in sign-up, password recovery, and Google account forms; those related dark states need regression coverage.

**Reproduce:** open login, switch to dark mode, and type an email. [Screenshot](audit-evidence/login-dark.jpg).

**Change:** use one shared input component with explicit light/dark foreground, background, placeholder, border, and focus colours. Keep error text readable in both themes. Avoid relying on native control colours while forcing only the text colour.

**Acceptance:** labels, entered text, helper text and errors remain readable in both themes. Sources: [Login](../client/components/Login/Login.tsx), [SignUp](../client/components/SignUp/SignUp.tsx), [GoogleAuth](../client/components/GoogleAuth/GoogleAuth.tsx).

### 02 P1 Authentication layouts break around tablet and small desktop widths

**Browser + Code.** At 834 px, registration displays the large illustration above the form; the form starts at **y = 1173 px**. At 1050 px, the two fixed 500 px columns plus a 125 px gap exceed the viewport: document width was **1088 px**, and the form extended beyond the right edge. The forgot-password screen also visibly clips at that width.

**Cause:** illustration visibility switches at 810 px while the CSS grid stays single-column until 1050 px. Above that boundary the grid has a fixed 1125 px minimum footprint. [Tablet screenshot](audit-evidence/signup-tablet.jpg) · [Overflow screenshot](audit-evidence/signup-overflow.jpg).

**Change:** use a responsive, bounded form of roughly 400–440 px; keep the illustration optional and secondary. Use one breakpoint for illustration visibility and the two-column layout, with flexible columns and gap. Keep the heading and first field visible on tablet.

**Acceptance:** verify 809, 810, 834, 1049, 1050 and 1125 px widths, as well as 320/390 px; no horizontal scrolling or clipped form controls. Sources: [signup CSS](../client/components/SignUp/signup.module.css), [breakpoints](../client/tailwind.config.js).

### 03 P1 The primary button colours have insufficient text contrast

**Browser + calculation.** White text on the current orange `#fd7e14` is approximately **2.57:1**. This affects the main authentication buttons and other custom orange calls to action. The existing blue `#0f8deb` on white is approximately 3.48:1 and also needs attention where used for small text.

**Change:** retain the orange identity, but use a darker action colour with white text, or dark text on the brighter orange. Define separate decorative and interactive colour tokens. Check hover, focus and disabled states deliberately.

For normal text, use at least 4.5:1; large text has a 3:1 threshold. These targets follow [W3C's contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). This was a targeted contrast check, not a full accessibility certification. Sources: [colour configuration](../client/tailwind.config.js), [Header](../client/components/Home/Header.tsx).

### 04 P1 Missing artwork misrepresents the song and offers a nonexistent action

**Browser + Code.** A manually entered song gets the J. Cole `KOD.jpg` cover in the feed. Opening the same post replaces it with an image containing “Click here to upload an album image”, although the image has no upload action. Both outcomes mislead the listener.

**Reproduce:** share a song through manual entry, then compare its feed card and detail page. [Feed screenshot](audit-evidence/feed-false-artwork.jpg) · [Detail screenshot](audit-evidence/post-mobile.jpg).

**Change:** use one neutral music-artwork fallback everywhere. It should contain no instructions or artist-specific artwork. Add an image-load error fallback for unavailable remote images, and preserve a square aspect ratio.

**Acceptance:** empty and failed image URLs never display unrelated album art or imply upload functionality. Sources: [UserPostsCard](../client/components/Home/UserPosts/UserPostsCard.tsx), [post page](../client/pages/post/[id].tsx), `client/public/assets/image-placeholder.png`.

### 05 P2 New users inherit somebody else's portrait

**Browser + Code.** Accounts without an avatar show `/assets/user-avatar.jpeg`, a photograph of a person. The disposable audit account displayed that person in both navigation and posts.

**Change:** use initials or a neutral generated avatar. A photograph should appear only when supplied for that user. Add avatar editing later if profile management becomes part of the product. Sources: [Navbar](../client/components/Navbar/Navbar.tsx), [UserPostsCard](../client/components/Home/UserPosts/UserPostsCard.tsx), [post page](../client/pages/post/[id].tsx).

### 06 P1 A single small trash-button click permanently deletes a post

**Code; control observed in browser.** The owner action directly invokes the delete mutation. There is no confirmation, undo, or recovery step in the frontend. The button is visually a small standalone red icon.

**Change:** move it into a clearly labelled post-actions area and ask “Delete this post?” with explicit Cancel/Delete actions. If the product later supports soft deletion, an undo flow is another option. Give the action a comfortably sized target and announce completion.

**Acceptance:** an accidental activation cannot immediately remove a post; cancelling retains it. Source: [post page](../client/pages/post/[id].tsx), `removePost` and the `Delete post` button. No destructive browser test was performed.

### 07 P2 Email login loses the user's intended destination

**Browser + Code.** The post navigation correctly creates `/login?next=/post/29`, but successful password login sends the user to `/`. Switching between login and registration also discards `next`. Both password auth components hard-code `router.push("/")`.

**Change:** share the validated return-path handling across Google and password authentication. Preserve it when switching auth screens. Also distinguish a request to share a song from a generic login, so the composer can open after successful authentication.

**Acceptance:** signing in from a post returns to that post; starting from “Share a song” resumes sharing. Only safe internal destinations are accepted. Sources: [Login](../client/components/Login/Login.tsx), [SignUp](../client/components/SignUp/SignUp.tsx), [Navbar](../client/components/Navbar/Navbar.tsx).

### 08 P2 Discovery and popularity sections promise more than they deliver

**Browser + Code.** Genre tiles look like navigation, but clicking Jazz does nothing. Popular tracks and artist cards are static content with no listening or detail action. “Weekly Most Popular” comes from a fixed array, not a weekly ranking. “Promoted Artists” suggests a promotion programme that the UI does not explain.

**Change:** remove these sections from the initial release until they have useful destinations, or reduce them to a small, honestly labelled editorial section. If retained, make genre cards filter the feed with an explicit result state. Use “Community favourites” only when supported by actual data and an explained period.

The same content needs a metadata pass: every promoted artist is labelled “Hip-hop”; “The Weekend” appears in the artist array; the displayed Peru artwork includes Fireboy DML while the text credits only Ed Sheeran. Verify canonical artist/title/credit data rather than maintaining ad hoc strings. [Discovery screenshot](audit-evidence/discovery-desktop.jpg).

Sources: [DiscoverNewMusic](../client/components/Home/DiscoverNewMusic/DiscoverNewMusic.tsx), [WeeklyMostPopular](../client/components/Home/WeeklyMostPopular/WeeklyMostPopular.tsx), [PromotedArtists](../client/components/Home/PromotedArtists/PromotedArtists.tsx).

### 09 P2 The homepage does not explain or prioritise the core experience

**Browser + Recommendation.** The hero uses a broad slogan, and the small “Share” button leads to login. On desktop, the first feed cards sit below a tall illustration-led hero. At 390 px, the empty homepage is approximately **6183 px** tall because eight genre tiles and the static track/artist sections stack vertically.

**Change:** use a compact introduction: “Good music is better shared.” Follow it with an explicit explanation and “Share a song”. Add “Browse songs” as a secondary in-page action. Put the feed immediately after the introduction. Keep one illustration, but reduce its footprint; do not add more decorative imagery.

For returning users, show a short composer prompt above the feed instead of leaving a mostly empty screen when no posts exist. [Mobile homepage](audit-evidence/home-mobile.jpg). Sources: [Header](../client/components/Home/Header.tsx), [home page](../client/pages/index.tsx).

### 10 P2 The post-card breakpoint changes too early and distorts artwork

**Browser + Code.** At 390 px, cards use a full-width artwork layout. At 430 px, they switch to a two-column “desktop” card. The nominal 220 × 220 artwork area shrinks horizontally while keeping its height; the cover becomes visibly tall and narrow. Text and author information get squeezed into the remaining column.

**Change:** base card layout on available card width, rather than the page's 424 px breakpoint. Use a compact square thumbnail on phones, or retain the stacked layout until there is room for both columns. Make artwork non-shrinking with `aspect-ratio: 1` and a consistent crop rule. Use one responsive card markup tree instead of separate mobile and desktop copies.

**Acceptance:** no distortion or abrupt density change at 423/424/430 px, and long usernames/song titles wrap safely. [430 px screenshot](audit-evidence/feed-430.jpg). Source: [UserPostsCard](../client/components/Home/UserPosts/UserPostsCard.tsx).

### 11 P2 Post hierarchy obscures the music and implies live playback

**Browser + Code + Recommendation.** “Currently Playing” labels a chronological post feed, not a live playback state. Cards emphasise the author and artwork; song metadata is relatively small or muted, the username is repeated on mobile, and no posting time is shown. Detail pages use the review as the `h1`, while the song is secondary text.

**Change:** rename the section “Latest shares”. Lead cards and details with **song title**, then artist, then the author's short recommendation and rating. Show one author identity and a readable relative date, with an exact date available. Keep ratings clearly attributed to the person who posted, rather than implying an aggregate score.

Sources: [Categories](../client/components/Home/Categories.tsx), [UserPostsCard](../client/components/Home/UserPosts/UserPostsCard.tsx), [post page](../client/pages/post/[id].tsx).

### 12 P2 Empty and error states stop the journey

**Browser for empty states; Code for request-error handling.** The feed says only “No posts yet” or “No posts match these genres yet”. Initial request errors say to try later but offer no retry. Signed-in users can face an almost empty page with only a floating plus button.

**Change:** provide distinct states: loading skeleton, empty community with “Share the first song”, no matches with “Clear filters”, failed request with “Try again”, and pagination failure that preserves loaded cards. Explain the available next step adjacent to the message.

**Acceptance:** each state offers an appropriate action and status announcement; initial loading does not briefly masquerade as an empty community. Source: [ListOfUserPosts](../client/components/Home/UserPosts/ListOfUserPosts.tsx).

### 13 P2 Genre filtering and publishing do not form a coherent journey

**Browser + Code.** With Rock selected, publishing the audit post as Other succeeds, but the screen still says “No posts match these genres yet”. The success toast has no “View post” action. The composer allows Other and artist-specific genres, while the filter offers a narrower fixed list; discovery advertises Jazz, which is absent from the fixed composer/filter options. Filters live only in React context, so they survive some navigation but are absent from shareable URLs and reloads.

**Change:** after publication, navigate to the created post or offer a clear “View post” action without silently changing the user's filters. Maintain one canonical genre taxonomy and an explicit Other option. Add an All/Clear action and a short result summary. Encode filters in the URL if returning to the same filtered feed is intended.

**Acceptance:** a newly published post is immediately findable; categories mean the same thing in discovery, creation and filtering. Sources: [ShareMusic](../client/components/Modal/ShareMusic.tsx), [Categories](../client/components/Home/Categories.tsx), [GlobalUI context](../client/context/GlobalUI.context.tsx).

### 14 P2 Song search has no loading or no-results feedback

**Code; unavailable-service state observed.** Search waits 450 ms and clears previous results, but it has no searching indicator or explicit “no matches” state. An empty list can mean idle, waiting, or no results. Locally, the user-facing error was “Spotify search is not configured.”

**Change:** provide explicit initial, searching, results, no-results and unavailable states. For unavailable search, say “Song search is unavailable. You can still enter the song details.” Put the manual-entry action in that state. Consider “Search by song or artist” if supported, and show album/version information to distinguish duplicate tracks. Preserve the existing request cancellation.

**Acceptance:** an empty search response and a slow response are visibly different; manual entry remains usable after any search failure. Successful Spotify search and preview playback require separate testing with configured credentials. Source: [ShareMusic](../client/components/Modal/ShareMusic.tsx).

### 15 P2 Writing and rating need clearer controls

**Browser + Code.** A review is entered in a single-line text input with a hidden 190-character limit. The star group has no visible label or “3.5 out of 5” value. Publishing is disabled until both review and rating are supplied, without explaining what is missing. Opening the emoji picker pushes the remaining controls to the bottom of the mobile dialog.

**Change:** use a small textarea, a visible character count, and a labelled rating control with a readable selected value. Explain required fields. Keep the action area easy to reach on small screens and with an on-screen keyboard. Decide whether a rating and written review should both be mandatory for the product promise “share what you're listening to”. A short optional note may better suit casual sharing.

**Acceptance:** the reason publishing is unavailable is understandable; rating can be selected with keyboard and pointer; the dialog remains usable at narrow widths and with a phone keyboard. Source: [ShareMusic](../client/components/Modal/ShareMusic.tsx), [Rating](../client/components/Rating/Rating.tsx).

### 16 P2 Composer transitions need an explicit draft policy

**Code risk, not browser-confirmed data loss.** Draft state lives inside the modal content, with no explicit discard warning or durable draft handling. Changing song/search/manual mode clears the selected track and artist genres, but does not reset a previously chosen genre, review or rating. That can carry old choices to a different song.

**Change:** define which values are kept when changing songs. Preserve the note deliberately, but ask or reset when song-dependent data no longer applies. Warn before discarding a nonempty draft or retain it for the current session. Reset the composer after successful posting.

**Acceptance:** test close/reopen, Escape, outside click, Back, switching input modes, changing songs, failed save and successful save. Verify that no previous review is accidentally republished. Sources: [ShareMusic](../client/components/Modal/ShareMusic.tsx), [Navbar modal](../client/components/Navbar/Navbar.tsx).

### 17 P2 Authentication forms need persistent labels and useful feedback

**Browser + Code.** Login and sign-up use placeholder-only visible field labels. Their accessible names exist, but field identity disappears visually after typing. There is no password visibility control or visible password guidance. Username/name constraints are enforced on the server without equivalent helper text and length constraints in these forms. Authentication network errors are assigned to the password field using the raw error message. Busy buttons remain labelled “Log in”/“Sign up”.

**Change:** add persistent labels, “Show password”, concise requirements, associated inline errors, and a form-level request-error area. Use “Logging in…” and “Creating account…”. Focus the first invalid input on submission and associate errors with `aria-describedby`/`aria-invalid`.

Registration should also explain that the chosen public identity will appear on posts. Consider using one public display name and username instead of requiring first and last names upfront; make that a product/data decision. Put concise privacy/terms links adjacent to registration as well as in the footer.

Sources: [Login](../client/components/Login/Login.tsx), [SignUp](../client/components/SignUp/SignUp.tsx), [server validation](../server/src/resolvers/user.ts).

### 18 P2 Recovery screens lack completion guidance

**Browser for initial views; Code for completion/error paths.** Forgot-password has no contextual Back to login link. Its success message stays in the form beside the same submit button, with no next-step guidance. The reset form presents an editable password field before validating the link; token errors appear only after submission.

**Change:** give reset requests a clear “Check your email” state, retain the intentionally generic account-existence wording, add spam-folder guidance, and provide Back to login and controlled resend actions. Show password requirements before typing. Where feasible, validate the reset link first and show an expired-link recovery action immediately.

Do not introduce an email-existence disclosure while improving the copy. Sources: [forgot-password](../client/pages/forgot-password.tsx), [change-password](../client/pages/change-password/[token].tsx).

### 19 P2 Google and password account screens feel like separate products

**Browser for fallback screens; Code for active states.** Google onboarding/settings use a narrow, labelled form style; password login/registration use very large headings and illustration grids. The local sign-in-methods route displays only “Google sign-in is currently unavailable”, even though password authentication works. The pending-registration link says “Finish creating your Google account”, which incorrectly suggests the user is creating an account with Google.

**Change:** reuse the same auth shell and input/button system. Say “Finish creating your I'm Listening account”. Present Password and Google as sign-in methods with readable status and appropriate actions, even if one provider is unavailable. Explain why a verification code is needed and provide clear resend/recovery states.

**Acceptance:** validate active onboarding, code entry, linking, unlinking, cancellation and account selection once Google is configured. The local absence of a Google button is configuration-dependent and is not itself treated as a production bug. Source: [GoogleAuth](../client/components/GoogleAuth/GoogleAuth.tsx).

### 20 P2 Missing-post pages offer no way back into the app

**Browser + Code.** `/post/0` renders the framework's generic 404 without the app navigation or a route back to the feed. The normal detail component's request-error/not-found messages also provide no contextual recovery action.

**Change:** use a branded “This post isn't available” screen with “Browse latest shares”. Distinguish missing content from a temporary loading failure; provide Retry for the latter. Source: [post page](../client/pages/post/[id].tsx); there is no custom `pages/404.tsx`.

### 21 P2 Inline links are visually indistinguishable from prose

**Browser + Code.** Privacy-page email, Google policy, and ICO links rendered as black text without underlines. “Start again” on expired Google onboarding has the same problem. `a:-webkit-any-link { text-decoration: none !important; }` overrides the intentional underline utilities.

**Change:** remove the global override. Give inline links a consistent underline and focus style; style navigation links separately. This also makes the legal/support content more usable without changing its wording.

**Acceptance:** links can be identified without hovering or relying only on colour. Sources: [globals.css](../client/styles/globals.css), [PolicyPage](../client/components/PolicyPage/PolicyPage.tsx), [GoogleAuth](../client/components/GoogleAuth/GoogleAuth.tsx).

### 22 P2 Page structure and icon controls need an accessibility pass

**Browser + Code.** Login and sign-up have `h2` titles without an `h1`. The signed-in home also starts at `h2`. Core home/auth/detail content lacks a consistent `main` landmark and skip link. The share dialog's close button appeared unnamed in the accessibility tree. Read-only post stars were not exposed as a readable rating value in the inspected tree. Promotional images have generic “Product Image”/“Artist Photo” alternatives.

**Change:** provide one descriptive `h1` per page, a main landmark and skip link, a “Close sharing dialog” label, a “Rated 3.5 out of 5” text equivalent, and meaningful image alternatives where the picture conveys information. Keep decorative imagery empty/hidden from assistive technology.

**Acceptance:** complete a keyboard and screen-reader pass, including focus return from dialogs. The browser tree observations identify specific gaps; they are not a substitute for that full pass. Sources: [Navbar](../client/components/Navbar/Navbar.tsx), [Rating](../client/components/Rating/Rating.tsx), [auth components](../client/components/Login/Login.tsx), [weekly cards](../client/components/Home/WeeklyMostPopular/WeeklyMostPopularCard/WeeklyTopTrackCard.tsx).

### 23 P2 The post page needs a stronger purpose and clearer next actions

**Browser + Recommendation.** Detail pages are a small central artwork/review block surrounded by space. Grey text weakens the hierarchy, there is no Back to feed action, and the owner gets Delete but no edit action. Posts without a preview have no listening destination or explanation. The app stores the song name in a field called `albumName`, which also encourages confusing presentation.

**Change:** use a coherent song-detail layout: square artwork, title/artist, author/date, review, readable rating, then listening and post actions. Add Back to feed and Copy link. If Spotify track URLs/IDs are retained, provide a clearly labelled external listening link; do not promise full playback. Decide whether post editing belongs in the next iteration and explain the current restriction if necessary.

Use accurate song/album terminology throughout the UI; any internal field migration is a separate compatibility task. [Current mobile detail](audit-evidence/post-mobile.jpg). Sources: [post page](../client/pages/post/[id].tsx), [post CSS](../client/components/Home/UserPosts/user-posts.module.css), [ShareMusic](../client/components/Modal/ShareMusic.tsx).

### 24 P2 Images are heavier and less robust than necessary

**Code + browser inspection.** Most home images use plain `img` elements without lazy loading or responsive sources. All the inspected below-fold home images loaded at the initial mobile page visit; even the CSS-hidden hero image loaded. The static asset directory is about 3.5 MB, with the Pop discovery image alone about 1.1 MB. This is an asset-size observation, not a measured page-transfer or Core Web Vitals result.

**Change:** first remove redundant sections. For retained imagery, use responsive modern formats, declared dimensions/aspect ratios, appropriate loading priority, and lazy loading below the fold. Keep music artwork consistent in crop and treatment. Use a reusable fallback for failed artwork and avatar loads.

**Acceptance:** measure mobile image transfer, layout shift and largest-content rendering after implementation. Do not download every decorative image for a hidden section. Sources: `client/public/assets`, [DiscoverNewMusic](../client/components/Home/DiscoverNewMusic/DiscoverNewMusic.tsx), [Header](../client/components/Home/Header.tsx), [UserPostsCard](../client/components/Home/UserPosts/UserPostsCard.tsx).

### 25 P3 Shared design rules and previews would reduce visual drift

**Code + Recommendation.** Mantine components, raw HTML inputs, utility classes, and older CSS modules use different spacing, type sizes, colours and radii. The hero jumps to an 80 px inner margin at 424 px, while the feed keeps narrow page gutters. Some CSS specifies Nunito Sans without loading it. Post page titles use the whole review, and there are no dedicated Open Graph/Twitter preview fields in the shared metadata component.

**Change:** establish a small system of page widths, gutters, text styles, surfaces, radii, button sizes and semantic colours. Keep one loaded font/system stack. Add song-focused titles and share previews for public posts, with a neutral fallback when artwork is absent. Verify the rendered result when sharing a link.

Sources: [Header](../client/components/Home/Header.tsx), [signup CSS](../client/components/SignUp/signup.module.css), [Meta](../client/components/Home/Meta.tsx), [post page](../client/pages/post/[id].tsx).

### 26 P3 Remove dormant UI and defer unsupported navigation

**Code + Recommendation.** The repository retains older styles/components, commented-out See all controls, duplicated large inline auth illustrations, and unused-looking social button styles. The product has no frontend profile, artist, album or exploration routes despite visuals that suggest a larger music network.

**Change:** confirm references before deleting code, consolidate the auth illustration into one asset/component, and remove unused styles and commented UI after that check. Fix minor leftovers such as `flexjustify-center` in the weekly card. Keep navigation limited to working destinations. Treat profile editing, My posts, reporting content, and real discovery pages as explicit follow-up product work, rather than adding more inactive controls.

Sources: [home components](../client/components/Home), [signup CSS](../client/components/SignUp/signup.module.css), [weekly card](../client/components/Home/WeeklyMostPopular/WeeklyMostPopularCard/WeeklyTopTrackCard.tsx), [README backlog](../README.md).

## Proposed design direction

Keep the warm orange accent, headphones mark and approachable illustration style. Use the accent selectively for the primary action, selected filters and useful emphasis. Make artwork and people's recommendations the main visual content.

| Surface | Proposed arrangement |
| --- | --- |
| Public home | Compact navigation → short introduction and Share a song/Browse songs → Latest shares and genre filters → small useful footer |
| Signed-in home | Navigation → “What are you listening to?” composer prompt → Latest shares → pagination or helpful empty state |
| Feed card | Square artwork → song title and artist → author/date → recommendation → labelled rating; clear detail destination |
| Composer | Find a song or enter details → selected-song summary → note/rating/genre → explicit Publish action |
| Authentication | Small consistent heading and explanation → Google option when available → divider → labelled email/password form → recovery and legal links |
| Post detail | Back to feed → song/artwork → author/recommendation/rating → available listening action → link and owner actions |
| Account | Public identity and available sign-in methods; honest unavailable states; clear recovery/help route |

Suggested starting constraints: 16–24 px mobile page gutters, a bounded desktop content width, a 400–440 px auth form, consistent square artwork, 44–48 px primary controls, and body text around 16 px. Validate these against real content and the existing Mantine system instead of creating many one-off breakpoints.

## Suggested copy

| Current | Proposed |
| --- | --- |
| Listening is everything | Good music is better shared. |
| Share what you're listening to now. | Share a song you love, say why, and find your next favourite. |
| Share, as the entry CTA | Share a song |
| Currently Playing | Latest shares |
| Login | Log in |
| Sign up, as the form heading | Create your account |
| Already have an account | Already have an account? |
| No posts yet. | Be the first to share a song. |
| No posts match these genres yet. | No songs in these genres yet. Try another genre or clear the filters. |
| Spotify search is not configured. | Song search is unavailable. You can still enter the song details. |
| Write your review | What do you like about this song? |
| Unlabelled stars | Your rating · 3.5 out of 5 |
| Share, as the final submit action | Publish post |
| Posted / Your music review is live. | Song shared · View post |
| Finish creating your Google account | Finish creating your I'm Listening account |
| This page could not be found. | This post isn't available. Browse the latest shares. |

Use “Search by song or artist” only if the implemented search supports both. Use “Public post” near publishing so visibility is understood before submission. Avoid weekly, trending, live or promoted claims without the corresponding data and product behaviour.

## Verification checklist for implementation

- Read and complete every auth form in light/dark themes at 320, 390, 834, 1050 and 1280 px; include the breakpoint boundaries identified above.
- Use keyboard-only navigation through login, filters, composer, rating, emoji picker, modal close, and post actions; verify focus return and readable status messages with a screen reader.
- Share a manual song with no artwork; confirm one honest fallback across feed, detail and sharing previews.
- Test valid and failed remote artwork, long song/artist/user names, a 190-character note, and unbroken text.
- Publish with a nonmatching genre filter active; verify an immediate path to the new post.
- Log in from a post, switch login/registration methods, and resume the intended destination.
- Test search with a slow response, no results, unavailable service, multiple versions of a track, and a selected track with/without a preview.
- Test composer close/reopen and song changes; verify the chosen draft/reset policy and failed-save recovery.
- Verify empty, filtered-empty, failed-fetch, pagination-failure and missing-post recovery actions.
- Confirm deletion can be cancelled before data changes; test approved deletion on disposable fixtures when implemented.
- Complete live Google onboarding/linking/unlinking and email recovery separately in a configured test environment.
- Measure image transfer and layout stability on a mobile connection after optimising images.

The completed local checks established that password login/logout, genre selection/removal, manual song entry, emoji selection and publication worked. The 320 px registration and 390 px public home/policy layouts fit horizontally in the sampled states. Pagination with a large dataset, real Spotify results/audio, live Google authentication, email delivery, real device keyboards, and a complete assistive-technology pass remain unverified.
