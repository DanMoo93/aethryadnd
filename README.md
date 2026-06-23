# Tabletop Ledger

A self-hosted Roll20-style platform for running D&D campaigns: account
auth, campaigns with invite codes, a full SRD 5.1 character creator
(all classes/subclasses/races/spells/equipment), a real-time dice tray
with a shared roll log, a virtual tabletop with map upload/tokens/fog
of war, and a live combat tracker with initiative order and HP/condition
tracking.

## Stack

- **Backend:** Node + Express, Socket.io for real-time events, Multer for map uploads
- **Frontend:** React + Vite, React Router, Konva.js (`react-konva`) for the map canvas
- **Database:** lowdb (JSON file) locally, Postgres on Render for the deployed free setup
- **Auth:** JWT + bcrypt password hashing

### About the database

This was prototyped in a sandbox that couldn't compile native Node
modules, so it uses **lowdb** (a JSON-file-backed store) instead of
Postgres or SQLite. All data access goes through
`server/src/db/repository.js` — that's the only file that touches the
storage layer directly. To move to Postgres for real deployment:

1. Set up a Postgres database (Railway/Render/Supabase all work)
2. Replace `server/src/db/index.js` with a `pg` connection pool
3. Rewrite the functions in `repository.js` to run SQL queries instead
   of array operations — the function signatures can stay the same
4. Nothing in `routes/` or `sockets/` needs to change

This is a deliberate seam — it's the first thing to swap before this
goes anywhere with real user data, since the JSON file has no
concurrent-write safety and will not survive a server restart in a way
that scales past one local dev machine.

## Project structure

```
server/
  src/
    db/
      index.js           # storage connection (lowdb for now)
      repository.js      # all data access — swap this for Postgres later
      characterSheet.js  # D&D 5e sheet schema + derived-stat helpers
    rules/
      index.js             # combined export of all SRD rules content
      classes.js, classesPart2.js   # all 12 classes + subclasses + features
      races.js              # all 9 races + subraces
      backgrounds.js          # all 6 backgrounds
      feats.js                  # all 39 SRD feats
      equipment.js                # weapons, armor, gear, packs
      spellSlots.js                 # slot/cantrip/spells-known progression tables
      spells/                        # 220 SRD spells, split by level, + index.js
      levelUp.js                      # level-up preview/apply computation
    middleware/
      auth.js             # JWT signing/verification
    routes/
      auth.js             # register, login, /me
      campaigns.js         # create, list, join via invite code
      characters.js        # CRUD for character sheets
      scenes.js             # scenes, map upload, token CRUD
      encounters.js          # combat tracker: encounters, combatants, turns
      rules.js                # exposes /api/rules — all SRD content, public reads
    sockets/
      index.js             # campaign rooms, dice rolls, chat, token moves, fog,
                             #   plus broadcastEncounterUpdate() called by encounters.js
    dice.js                 # dice notation parser (1d20+5, 4d6kh3, etc.)
    index.js                # server entry point
  uploads/
    maps/                   # uploaded map images, served as static files

client/
  src/
    lib/
      api.js              # REST client
      socket.js            # Socket.io client
    context/
      AuthContext.jsx       # logged-in user state
    components/
      AppLayout.jsx          # sidebar nav shell
      DiceTray.jsx            # dice roller + live roll ledger
      MapCanvas.jsx            # Konva canvas: map, grid, tokens, fog
      CombatTracker.jsx         # initiative order, HP, conditions, turn tracking
      LevelUp.jsx                # level-up flow: HP, ASI, subclass, new spells
      wizard/
        CharacterWizard.jsx       # step orchestration for character creation
        StepRace.jsx, StepClass.jsx, StepAbilities.jsx, StepBackground.jsx,
        StepEquipment.jsx, StepSpells.jsx, StepReview.jsx
    pages/
      Login.jsx, Register.jsx
      Dashboard.jsx           # campaign list, create/join
      CampaignDetail.jsx      # members, characters, scenes, dice tray
      CharacterSheet.jsx      # 5e stat block editor
      ScenePage.jsx            # the virtual tabletop screen
```

## Running locally

You'll need two terminals.

**Backend:**
```bash
cd server
npm install
npm run dev      # http://localhost:4000
```

**Frontend:**
```bash
cd client
npm install
npm run dev      # http://localhost:5173
```

Open `http://localhost:5173`, create an account, create a campaign,
and share the invite code with your group so they can join.

## Deploying

The repo now includes a Render Blueprint in [render.yaml](./render.yaml).
The current deployment layout is the mostly-free route:

1. Backend free web service at `api.aethryadnd.online`
2. Frontend free static site at `aethryadnd.online`
3. Free Render Postgres for persistent campaign data
4. Uploaded maps are stored as image data in the database, so no disk mount is needed

After connecting the GitHub repo to Render, add the custom domains in the
Render dashboard and point DNS at the generated targets. The frontend also
needs the backend URL in `VITE_API_URL` / `VITE_SOCKET_URL`; the Blueprint
already points those at the custom API domain.

## What's built (v1 + v2 + v3)

**Campaigns & characters:**
- Account creation and login (JWT-based)
- Campaigns with shareable invite codes; GM vs player roles
- D&D 5e character sheets: abilities, modifiers, HP, AC, speed, notes
- Permission rules: only the character's owner or the campaign's GM can
  edit a sheet

**Dice:**
- Real-time dice roller — every roll in a campaign is broadcast live to
  everyone connected, with a shared roll history (the "ledger")
- Supports standard notation: `1d20+5`, `2d6`, `4d6kh3` (keep highest 3)

**Virtual tabletop:**
- GMs create scenes per campaign and upload a map image (PNG/JPEG/WEBP/GIF, 15MB max)
- A grid overlay sized to the scene's width/height in cells
- Draggable tokens, synced live over sockets — every player sees moves
  instantly; players can only drag tokens they own, GMs can drag any token
- Fog of war: a GM-only paint tool reveals or hides grid cells; players
  only ever see revealed cells (fog renders fully opaque for players,
  semi-transparent for the GM so they can still see the whole map)
- The canvas scales to fit the available screen width

**Combat tracker:**
- GMs create one or more encounters per scene
- Add combatants with initiative, HP, AC; sort by initiative with one click
- Start combat, advance turns, and the round counter increments automatically
  when the order wraps back to the top
- HP editing and condition tags (poisoned, stunned, prone, etc.) — GM-only,
  to avoid one player editing another's numbers
- Every action (HP change, turn advance, new combatant) broadcasts live to
  everyone in the scene, the same way dice rolls and token moves do

**Full character creator (SRD 5.1 ruleset):**
- All 12 classes (Barbarian through Wizard) with one SRD subclass each,
  level-gated features up to level 20, hit dice, saving throws, and
  spellcasting profiles built in
- All 9 SRD races plus their subraces (13 total race/subrace combos),
  with ability bonuses and traits
- All 6 SRD backgrounds, 39 feats, and the full equipment catalog
  (36 weapons, 13 armors, adventuring gear, and 7 starting packs)
- The complete SRD spell list — 220 spells across cantrips through 9th
  level, each tagged with which classes can learn it
- A guided step-by-step wizard: Race → Class → Abilities → Background →
  Equipment → Spells (skipped for non-casters) → Review, then creates
  the character via the existing character API
- All three ability score methods: standard array, point buy (27 points,
  SRD cost table), and rolling 4d6-drop-lowest six times
- Spell slot math (full/half/pact caster progressions), cantrips known,
  and spells known/prepared counts are all computed from formulas, not
  hardcoded per level
- All of this content is served from `/api/rules` as reference data —
  reusable for things like a future "spell lookup" or "monster reference"
  panel without re-fetching from anywhere else
- The character sheet view now surfaces all of it: subclass and background
  appear in the header, Saving Throws and Skills are clickable proficiency
  toggles with live-computed bonuses, Equipment shows weapons/armor/shield,
  and Spellcasting shows full cantrip/spell cards (school, casting time,
  range, concentration, full description) resolved from `/api/rules/spells-by-keys`

**Level-up flow:**
- A "Level Up" button on the character sheet opens a guided flow: pick a
  target level, choose how to roll HP (take the class average per level,
  or roll the hit die live), see exactly which class/subclass features
  you've gained, pick a subclass if this is the level it unlocks, make
  Ability Score Improvement choices at levels 4/8/12/16/19, and pick new
  cantrips/spells if the class gained any
- All the math (HP gain, proficiency bonus, spell slot progression, which
  features unlock at which level) is computed server-side from the same
  rules tables the character creator uses, so the two stay consistent
- Subclass features are correctly included even when the subclass is
  chosen in the same level-up that crosses into a higher level (e.g.
  choosing School of Evocation while leveling a Wizard from 1 to 5 grants
  both the Wizard's Arcane Tradition feature and the subclass's own
  level-2 features, not just one or the other)

## What's next (not built yet)

1. **Token ↔ character linking** — right now tokens and combatants are
   independent of character sheets; linking them would let HP/AC show on
   hover and auto-create a token/combatant from a character
2. **Player-editable HP** — combat tracker is GM-only right now by design
   (avoids cross-player edits), but a "let players adjust their own HP"
   toggle would be a natural follow-up for tables that want it
3. **Persistent chat log** (currently broadcasts live but isn't saved)
4. **Real database** — see the note above; this is the first thing to
   do before any real users touch this
5. **Deployment** — Railway or Render both work well for Node + Postgres;
   the app isn't deployed anywhere yet, this is all local
6. **Token images** — tokens currently render as colored circles with
   initials; custom token art would need its own small upload flow,
   similar to maps
7. **Higher-level spell access for known casters** — the level-up flow's
   spell picker currently offers 1st-level spells when a known caster
   (Bard/Sorcerer/Warlock/Ranger) gains a new spell slot; once a
   character can reach 2nd-level+ spells, the picker should offer those
   too instead of staying capped at 1st level

## Known limitations of this prototype

- Data lives in a single JSON file (`server/data/db.json`, created on
  first run) — fine for local dev, not for concurrent real users
- Uploaded maps live on local disk by default (`server/uploads/maps/`), or
  on the persistent Render disk in production
  locally, but won't survive a redeploy on most PaaS hosts without
  switching to S3/Cloudinary/similar object storage
- No password reset flow
- Chat and presence work over sockets but aren't persisted to the
  campaign history
- Fog of war is per-cell binary (revealed/hidden) — no soft edges or
  line-of-sight raycasting, which is the more advanced version of this
  feature most VTTs eventually build toward
