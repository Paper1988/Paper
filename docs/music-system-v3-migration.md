# Music subsystem v3 migration

## Goal

Move Paper's music subsystem behind a provider-neutral boundary before replacing
Moonlink.js with `lavalink-client`. The v3 release should preserve current user
workflows while making the Lavalink client an implementation detail.

## Why this is needed

The current implementation exposes Moonlink types and player objects across
commands, buttons, menus, event handlers, renderers, API routes, and controller
utilities. Player metadata is also stored in Moonlink's `player.data`. A direct
library swap would therefore touch many unrelated modules at once.

## Target architecture

```text
Commands / Buttons / Menus / API
              |
          MusicManager
              |
         MusicAdapter
          /       \
 MoonlinkAdapter  LavalinkClientAdapter
                      |
                   NodeLink
```

Paper-owned models (`MusicTrack`, `MusicPlayerSnapshot`, and related types)
are the only music types allowed above the adapter boundary. Provider objects
must remain inside their adapter.

## Migration stages

1. **Foundation:** introduce normalized music models and the adapter contract.
   This stage must not change runtime behavior.
2. **Compatibility adapter:** implement the contract over the existing
   Moonlink manager. Move provider event translation and player metadata
   handling into that adapter.
3. **Paper facade:** add a MusicManager owned by PaperClient, then migrate
   commands, buttons, menus, renderer, controller, and API consumers incrementally.
4. **New provider:** implement the same contract with `lavalink-client`,
   configure its NodeLink integration, and validate feature parity.
5. **Cutover:** remove Moonlink dependencies and legacy event wiring after
   regression tests pass.

## Existing behavior to preserve

- Search and playlist results
- Queue insertion, shuffle, and display
- Play, pause, resume, stop, skip, previous, and seek
- Volume, track/queue repeat, and autoplay
- Progress updates and the Discord music control message
- Saved playlists and guild music settings
- Queue-end auto-leave and player cleanup
- Node connection, reconnect, and error reporting

## Current implementation status

- [x] Provider-neutral domain types and adapter contract
- [x] Initial Moonlink compatibility adapter
- [x] Route core node connect/disconnect/error events through the adapter
- [ ] Move remaining Moonlink event consumers behind the adapter
- [x] Move controller message ID and player timers into Paper-owned MusicSessionManager
- [x] Add PaperClient-owned MusicManager facade
- [x] Route node lifecycle subscriptions and controller player lookup through MusicManager
- [x] Migrate the `/music play` command to MusicManager
- [ ] Migrate remaining command and component consumers to MusicManager
- [ ] Add the lavalink-client / NodeLink adapter

## State ownership

PaperClient now owns a MusicSessionManager keyed by guild ID. It stores the
control-message ID, progress-update timer, and queue-end timeout independently
from Moonlink player data. Session timers are cleared when replaced, and the
session is removed when the player is destroyed or auto-leaves.

## Non-goals for the first stage

- No user-facing feature changes
- No NodeLink-only feature rollout (filters, lyrics, chapters, or extra sources)
- No dependency replacement until the compatibility layer and parity tests
  are ready

## Verification checklist

- [ ] TypeScript build succeeds
- [ ] Moonlink adapter passes contract tests
- [ ] Multi-guild playback and concurrent searches work
- [ ] Voice connection and reconnect behavior is verified
- [ ] Queue and loop behavior matches current production behavior
- [ ] Progress UI and message cleanup are verified
- [ ] API and developer node diagnostics are migrated
- [ ] No provider-specific imports remain outside adapter implementations
