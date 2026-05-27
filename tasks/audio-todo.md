# Audio File TODO

All paths are relative to `public/`. Save as `.wav` (`.mp3` optional duplicate).  
**Gating:** activities are written in `activities.ts` but only go live when their activityId is added to the node's `activityIds` in `curriculum.ts`. Check off files here → tell Claude → Claude flips the switch.

**Recording notes:**
- `*-name.wav` — say the letter/cluster name (e.g. "bee", "double-u", "ess-aitch")
- `*-sound.wav` — say the isolated phoneme sound (e.g. /b/, /ʃ/, /bl/)
- `words/*.wav` — say the word naturally, no exaggeration
- Phoneme sounds: short, clean, no schwa added (so /t/ not "tuh")

---

## Quick Inventory

### phonics-units/ — already recorded ✅
`a` `b` `c` `d` `e` `f` `h` `i` `l` `m` `n` `p` `r` `s` `t` `u` (both name+sound)  
`k-sound` only (no k-name; k is only used inside `ck`)

### words/ — already recorded ✅
`add` `am` `ant` `apple` `bat` `bed` `big` `bus` `cat` `cup` `dog` `hat` `hop`  
`insect` `itch` `man` `map` `mat` `milk` `monkey` `mop` `mud` `nap` `pan` `pig`  
`pin` `pot` `rat` `red` `sat` `sit` `snake` `sun` `ten` `tin` `tip` `top` `turtle` `you`

---

## Zone 1 — Blue (m, a, s, t)
Activities live ✅. All audio present ✅

---

## Zone 2 — Green (i, n, p)
Activities live ✅. All audio present ✅

---

## Zone 3 — Yellow (b, o, c)
Activities live ✅. All audio present ✅

---

## Zone 4 — Orange (r, u, f)
Activities live ✅. All audio present ✅

---

## Zone 5 — Purple (d, l, g, h)
Activities live ✅. All audio present ✅

---

## Zone 6 — Pink (e, w, j, v)
All staged (no activities written yet).

### Phonics Units
- [ ] `audio/phonics-units/j-name.wav` — "jay"
- [ ] `audio/phonics-units/j-sound.wav` — /dʒ/ as in "jump"
- [ ] `audio/phonics-units/v-name.wav` — "vee"
- [ ] `audio/phonics-units/v-sound.wav` — /v/ as in "van"
- [ ] `audio/phonics-units/w-name.wav` — "double-u"
- [ ] `audio/phonics-units/w-sound.wav` — /w/ as in "wet"

### Words needed
- [ ] `audio/words/egg.wav` — "egg"
- [ ] `audio/words/end.wav` — "end"
- [ ] `audio/words/elk.wav` — "elk"
- [ ] `audio/words/wet.wav` — "wet"
- [ ] `audio/words/web.wav` — "web"
- [ ] `audio/words/win.wav` — "win"
- [ ] `audio/words/jet.wav` — "jet"
- [ ] `audio/words/jot.wav` — "jot"
- [ ] `audio/words/jug.wav` — "jug"
- [ ] `audio/words/van.wav` — "van"
- [ ] `audio/words/vat.wav` — "vat"
- [ ] `audio/words/vet.wav` — "vet"
- [ ] `audio/words/vim.wav` — "vim"

### Activity staging
- `quiz-e` → add to `node-e`
- `quiz-w` → add to `node-w`
- `quiz-j` → add to `node-j`
- `quiz-v` → add to `node-v`
- `quiz-cp6` → add to `node-cp6`

---

## Zone 7 — Gray (y, z, x, qu)
All staged.

### Phonics Units
- [ ] `audio/phonics-units/y-name.wav` — "why"
- [ ] `audio/phonics-units/y-sound.wav` — /j/ as in "yes"
- [ ] `audio/phonics-units/z-name.wav` — "zee"
- [ ] `audio/phonics-units/z-sound.wav` — /z/ as in "zip"
- [ ] `audio/phonics-units/x-name.wav` — "ex"
- [ ] `audio/phonics-units/x-sound.wav` — /ks/ as in "fox"
- [ ] `audio/phonics-units/qu-name.wav` — "cue"
- [ ] `audio/phonics-units/qu-sound.wav` — /kw/ as in "quit"

### Words needed
- [ ] `audio/words/yet.wav` — "yet"
- [ ] `audio/words/yam.wav` — "yam"
- [ ] `audio/words/zip.wav` — "zip"
- [ ] `audio/words/zap.wav` — "zap"
- [ ] `audio/words/fox.wav` — "fox"
- [ ] `audio/words/box.wav` — "box"
- [ ] `audio/words/quiz.wav` — "quiz"
- [ ] `audio/words/quit.wav` — "quit"

### Activity staging
- `quiz-y` → `node-y` | `quiz-z` → `node-z` | `quiz-x` → `node-x` | `quiz-qu` → `node-qu`
- `quiz-cp7` → `node-cp7`

---

## Zone 8 — Teal (sh, ch, th, wh, ck)
All staged.

### Phonics Units
- [ ] `audio/phonics-units/sh-name.wav` — "ess-aitch"
- [ ] `audio/phonics-units/sh-sound.wav` — /ʃ/ as in "ship"
- [ ] `audio/phonics-units/ch-name.wav` — "see-aitch"
- [ ] `audio/phonics-units/ch-sound.wav` — /tʃ/ as in "chip"
- [ ] `audio/phonics-units/th-name.wav` — "tee-aitch"
- [ ] `audio/phonics-units/th-sound.wav` — /θ/ as in "thin" _(record voiced /ð/ as second file if needed)_
- [ ] `audio/phonics-units/wh-name.wav` — "double-u-aitch"
- [ ] `audio/phonics-units/wh-sound.wav` — /w/ as in "when"
- [ ] `audio/phonics-units/ck-name.wav` — "see-kay"
- [ ] `audio/phonics-units/ck-sound.wav` — /k/ as in "back"

### Words needed
- [ ] `audio/words/ship.wav` — "ship"
- [ ] `audio/words/shop.wav` — "shop"
- [ ] `audio/words/shed.wav` — "shed"
- [ ] `audio/words/chip.wav` — "chip"
- [ ] `audio/words/chop.wav` — "chop"
- [ ] `audio/words/chin.wav` — "chin"
- [ ] `audio/words/thin.wav` — "thin"
- [ ] `audio/words/that.wav` — "that"
- [ ] `audio/words/this.wav` — "this"
- [ ] `audio/words/when.wav` — "when"
- [ ] `audio/words/whip.wav` — "whip"
- [ ] `audio/words/back.wav` — "back"
- [ ] `audio/words/duck.wav` — "duck"
- [ ] `audio/words/kick.wav` — "kick"
- [ ] `audio/words/lock.wav` — "lock"
- [ ] `audio/words/neck.wav` — "neck"
- [ ] `audio/words/rock.wav` — "rock"
- [ ] `audio/words/sock.wav` — "sock"
- [ ] `audio/words/tick.wav` — "tick"

### Activity staging
- `quiz-sh` `quiz-ch` `quiz-th` `quiz-wh` `quiz-ck` → respective nodes
- `quiz-cp8` → `node-cp8`

---

## Zone 9 — Red (l-blends: bl, cl, fl, gl, pl, sl)
All staged.

### Phonics Units
- [ ] `audio/phonics-units/bl-name.wav` — "bl"
- [ ] `audio/phonics-units/bl-sound.wav` — /bl/ as in "blue"
- [ ] `audio/phonics-units/cl-name.wav` — "cl"
- [ ] `audio/phonics-units/cl-sound.wav` — /kl/ as in "clap"
- [ ] `audio/phonics-units/fl-name.wav` — "fl"
- [ ] `audio/phonics-units/fl-sound.wav` — /fl/ as in "flat"
- [ ] `audio/phonics-units/gl-name.wav` — "gl"
- [ ] `audio/phonics-units/gl-sound.wav` — /gl/ as in "glad"
- [ ] `audio/phonics-units/pl-name.wav` — "pl"
- [ ] `audio/phonics-units/pl-sound.wav` — /pl/ as in "plan"
- [ ] `audio/phonics-units/sl-name.wav` — "sl"
- [ ] `audio/phonics-units/sl-sound.wav` — /sl/ as in "slip"

### Words needed
- [ ] `audio/words/blob.wav` — "blob"
- [ ] `audio/words/bled.wav` — "bled"
- [ ] `audio/words/blot.wav` — "blot"
- [ ] `audio/words/clam.wav` — "clam"
- [ ] `audio/words/clap.wav` — "clap"
- [ ] `audio/words/clip.wav` — "clip"
- [ ] `audio/words/flat.wav` — "flat"
- [ ] `audio/words/flip.wav` — "flip"
- [ ] `audio/words/flit.wav` — "flit"
- [ ] `audio/words/glad.wav` — "glad"
- [ ] `audio/words/glob.wav` — "glob"
- [ ] `audio/words/plan.wav` — "plan"
- [ ] `audio/words/plop.wav` — "plop"
- [ ] `audio/words/plum.wav` — "plum"
- [ ] `audio/words/slim.wav` — "slim"
- [ ] `audio/words/slip.wav` — "slip"
- [ ] `audio/words/slop.wav` — "slop"

### Activity staging
- `quiz-bl` `quiz-cl` `quiz-fl` `quiz-gl` `quiz-pl` `quiz-sl` → respective nodes
- `quiz-cp9` → `node-cp9`

---

## Zone 10 — Crimson (r-blends: br, cr, dr, fr, gr, pr, tr)
All staged.

### Phonics Units
- [ ] `audio/phonics-units/br-name.wav` — "br"
- [ ] `audio/phonics-units/br-sound.wav` — /br/ as in "brat"
- [ ] `audio/phonics-units/cr-name.wav` — "cr"
- [ ] `audio/phonics-units/cr-sound.wav` — /kr/ as in "crab"
- [ ] `audio/phonics-units/dr-name.wav` — "dr"
- [ ] `audio/phonics-units/dr-sound.wav` — /dr/ as in "drip"
- [ ] `audio/phonics-units/fr-name.wav` — "fr"
- [ ] `audio/phonics-units/fr-sound.wav` — /fr/ as in "frog"
- [ ] `audio/phonics-units/gr-name.wav` — "gr"
- [ ] `audio/phonics-units/gr-sound.wav` — /gr/ as in "grab"
- [ ] `audio/phonics-units/pr-name.wav` — "pr"
- [ ] `audio/phonics-units/pr-sound.wav` — /pr/ as in "prim"
- [ ] `audio/phonics-units/tr-name.wav` — "tr"
- [ ] `audio/phonics-units/tr-sound.wav` — /tr/ as in "trip"

### Words needed
- [ ] `audio/words/brat.wav` — "brat"
- [ ] `audio/words/brim.wav` — "brim"
- [ ] `audio/words/crab.wav` — "crab"
- [ ] `audio/words/crop.wav` — "crop"
- [ ] `audio/words/drip.wav` — "drip"
- [ ] `audio/words/drum.wav` — "drum"
- [ ] `audio/words/drop.wav` — "drop"
- [ ] `audio/words/frog.wav` — "frog"
- [ ] `audio/words/fret.wav` — "fret"
- [ ] `audio/words/grin.wav` — "grin"
- [ ] `audio/words/grip.wav` — "grip"
- [ ] `audio/words/prim.wav` — "prim"
- [ ] `audio/words/trip.wav` — "trip"
- [ ] `audio/words/trim.wav` — "trim"
- [ ] `audio/words/trot.wav` — "trot"

### Activity staging
- `quiz-br` `quiz-cr` `quiz-dr` `quiz-fr` `quiz-gr` `quiz-pr` `quiz-tr` → respective nodes
- `quiz-cp10` → `node-cp10`

---

## Zone 11 — Amber (s-blends: sc, sk, sm, sn, sp, sw)
All staged.

### Phonics Units
- [ ] `audio/phonics-units/sc-name.wav` — "sc"
- [ ] `audio/phonics-units/sc-sound.wav` — /sk/ as in "scam"
- [ ] `audio/phonics-units/sk-name.wav` — "sk"
- [ ] `audio/phonics-units/sk-sound.wav` — /sk/ as in "skip"
- [ ] `audio/phonics-units/sm-name.wav` — "sm"
- [ ] `audio/phonics-units/sm-sound.wav` — /sm/ as in "smug"
- [ ] `audio/phonics-units/sn-name.wav` — "sn"
- [ ] `audio/phonics-units/sn-sound.wav` — /sn/ as in "snap"
- [ ] `audio/phonics-units/sp-name.wav` — "sp"
- [ ] `audio/phonics-units/sp-sound.wav` — /sp/ as in "spin"
- [ ] `audio/phonics-units/sw-name.wav` — "sw"
- [ ] `audio/phonics-units/sw-sound.wav` — /sw/ as in "swim"

### Words needed
- [ ] `audio/words/scam.wav` — "scam"
- [ ] `audio/words/scat.wav` — "scat"
- [ ] `audio/words/skip.wav` — "skip"
- [ ] `audio/words/skim.wav` — "skim"
- [ ] `audio/words/smug.wav` — "smug"
- [ ] `audio/words/smash.wav` — "smash"
- [ ] `audio/words/snap.wav` — "snap"
- [ ] `audio/words/snip.wav` — "snip"
- [ ] `audio/words/spin.wav` — "spin"
- [ ] `audio/words/spot.wav` — "spot"
- [ ] `audio/words/swim.wav` — "swim"
- [ ] `audio/words/swam.wav` — "swam"

### Activity staging
- `quiz-sc` `quiz-sk` `quiz-sm` `quiz-sn` `quiz-sp` `quiz-sw` → respective nodes
- `quiz-cp11` → `node-cp11`

---

## Zone 12 — Gold (final blends: -nd, -nt, -nk, -mp, -ft, -lk)
All staged.

### Phonics Units
- [ ] `audio/phonics-units/nd-name.wav` — "nd" (final)
- [ ] `audio/phonics-units/nd-sound.wav` — /nd/ as in "hand"
- [ ] `audio/phonics-units/nt-name.wav` — "nt" (final)
- [ ] `audio/phonics-units/nt-sound.wav` — /nt/ as in "mint"
- [ ] `audio/phonics-units/nk-name.wav` — "nk" (final)
- [ ] `audio/phonics-units/nk-sound.wav` — /ŋk/ as in "sink"
- [ ] `audio/phonics-units/mp-name.wav` — "mp" (final)
- [ ] `audio/phonics-units/mp-sound.wav` — /mp/ as in "camp"
- [ ] `audio/phonics-units/ft-name.wav` — "ft" (final)
- [ ] `audio/phonics-units/ft-sound.wav` — /ft/ as in "left"
- [ ] `audio/phonics-units/lk-name.wav` — "lk" (final)
- [ ] `audio/phonics-units/lk-sound.wav` — /lk/ as in "milk"

### Words needed
- [ ] `audio/words/and.wav` — "and"
- [ ] `audio/words/hand.wav` — "hand"
- [ ] `audio/words/bend.wav` — "bend"
- [ ] `audio/words/mint.wav` — "mint"
- [ ] `audio/words/hunt.wav` — "hunt"
- [ ] `audio/words/dent.wav` — "dent"
- [ ] `audio/words/sink.wav` — "sink"
- [ ] `audio/words/rink.wav` — "rink"
- [ ] `audio/words/bunk.wav` — "bunk"
- [ ] `audio/words/camp.wav` — "camp"
- [ ] `audio/words/bump.wav` — "bump"
- [ ] `audio/words/jump.wav` — "jump"
- [ ] `audio/words/left.wav` — "left"
- [ ] `audio/words/loft.wav` — "loft"
- [ ] `audio/words/lift.wav` — "lift"
- [ ] `audio/words/silk.wav` — "silk"
- [ ] `audio/words/bulk.wav` — "bulk"

### Activity staging
- `quiz-nd` `quiz-nt` `quiz-nk` `quiz-mp` `quiz-ft` `quiz-lk` → respective nodes
- `quiz-cp12` → `node-cp12`

---

## Zone 13 — Lime (3-letter blends: str, scr, spr, spl, squ)
All staged.

### Phonics Units
- [ ] `audio/phonics-units/str-name.wav` — "str"
- [ ] `audio/phonics-units/str-sound.wav` — /str/ as in "strap"
- [ ] `audio/phonics-units/scr-name.wav` — "scr"
- [ ] `audio/phonics-units/scr-sound.wav` — /skr/ as in "scrap"
- [ ] `audio/phonics-units/spr-name.wav` — "spr"
- [ ] `audio/phonics-units/spr-sound.wav` — /spr/ as in "spring"
- [ ] `audio/phonics-units/spl-name.wav` — "spl"
- [ ] `audio/phonics-units/spl-sound.wav` — /spl/ as in "split"
- [ ] `audio/phonics-units/squ-name.wav` — "squ"
- [ ] `audio/phonics-units/squ-sound.wav` — /skw/ as in "squat"

### Words needed
- [ ] `audio/words/strap.wav` — "strap"
- [ ] `audio/words/strip.wav` — "strip"
- [ ] `audio/words/strong.wav` — "strong"
- [ ] `audio/words/scrap.wav` — "scrap"
- [ ] `audio/words/scrub.wav` — "scrub"
- [ ] `audio/words/sprig.wav` — "sprig"
- [ ] `audio/words/sprint.wav` — "sprint"
- [ ] `audio/words/split.wav` — "split"
- [ ] `audio/words/splat.wav` — "splat"
- [ ] `audio/words/squat.wav` — "squat"
- [ ] `audio/words/squid.wav` — "squid"

### Activity staging
- `quiz-str` `quiz-scr` `quiz-spr` `quiz-spl` `quiz-squ` → respective nodes
- `quiz-cp13` → `node-cp13`

---

## Zone 14 — Emerald (CVCe: a_e, i_e, o_e, u_e)
All staged.

### Phonics Units
- [ ] `audio/phonics-units/a_e-name.wav` — "a-e" (magic e pattern)
- [ ] `audio/phonics-units/a_e-sound.wav` — long /eɪ/ as in "cake"
- [ ] `audio/phonics-units/i_e-name.wav` — "i-e"
- [ ] `audio/phonics-units/i_e-sound.wav` — long /aɪ/ as in "bike"
- [ ] `audio/phonics-units/o_e-name.wav` — "o-e"
- [ ] `audio/phonics-units/o_e-sound.wav` — long /oʊ/ as in "home"
- [ ] `audio/phonics-units/u_e-name.wav` — "u-e"
- [ ] `audio/phonics-units/u_e-sound.wav` — long /juː/ as in "cube"

### Words needed
- [ ] `audio/words/cake.wav` — "cake"
- [ ] `audio/words/came.wav` — "came"
- [ ] `audio/words/game.wav` — "game"
- [ ] `audio/words/lane.wav` — "lane"
- [ ] `audio/words/made.wav` — "made"
- [ ] `audio/words/name.wav` — "name"
- [ ] `audio/words/safe.wav` — "safe"
- [ ] `audio/words/wave.wav` — "wave"
- [ ] `audio/words/bike.wav` — "bike"
- [ ] `audio/words/hide.wav` — "hide"
- [ ] `audio/words/kite.wav` — "kite"
- [ ] `audio/words/like.wav` — "like"
- [ ] `audio/words/mine.wav` — "mine"
- [ ] `audio/words/ride.wav` — "ride"
- [ ] `audio/words/time.wav` — "time"
- [ ] `audio/words/bone.wav` — "bone"
- [ ] `audio/words/home.wav` — "home"
- [ ] `audio/words/note.wav` — "note"
- [ ] `audio/words/rope.wav` — "rope"
- [ ] `audio/words/tone.wav` — "tone"
- [ ] `audio/words/woke.wav` — "woke"
- [ ] `audio/words/cube.wav` — "cube"
- [ ] `audio/words/cute.wav` — "cute"
- [ ] `audio/words/dune.wav` — "dune"
- [ ] `audio/words/mule.wav` — "mule"
- [ ] `audio/words/rule.wav` — "rule"
- [ ] `audio/words/tune.wav` — "tune"

### Activity staging
- `quiz-ae` `quiz-ie` `quiz-oe-vce` `quiz-ue` → respective nodes
- `quiz-cp14` → `node-cp14`

---

## Zone 15 — Cyan (vowel teams: ai, ay, ee, ea)
All staged.

### Phonics Units
- [ ] `audio/phonics-units/ai-name.wav` — "a-i"
- [ ] `audio/phonics-units/ai-sound.wav` — long /eɪ/ as in "rain"
- [ ] `audio/phonics-units/ay-name.wav` — "a-y"
- [ ] `audio/phonics-units/ay-sound.wav` — long /eɪ/ as in "play"
- [ ] `audio/phonics-units/ee-name.wav` — "e-e"
- [ ] `audio/phonics-units/ee-sound.wav` — long /iː/ as in "feet"
- [ ] `audio/phonics-units/ea-name.wav` — "e-a"
- [ ] `audio/phonics-units/ea-sound.wav` — long /iː/ as in "meat"

### Words needed
- [ ] `audio/words/rain.wav` — "rain"
- [ ] `audio/words/mail.wav` — "mail"
- [ ] `audio/words/sail.wav` — "sail"
- [ ] `audio/words/tail.wav` — "tail"
- [ ] `audio/words/wait.wav` — "wait"
- [ ] `audio/words/day.wav` — "day"
- [ ] `audio/words/play.wav` — "play"
- [ ] `audio/words/say.wav` — "say"
- [ ] `audio/words/stay.wav` — "stay"
- [ ] `audio/words/feet.wav` — "feet"
- [ ] `audio/words/seed.wav` — "seed"
- [ ] `audio/words/tree.wav` — "tree"
- [ ] `audio/words/meet.wav` — "meet"
- [ ] `audio/words/heat.wav` — "heat"
- [ ] `audio/words/leaf.wav` — "leaf"
- [ ] `audio/words/meat.wav` — "meat"
- [ ] `audio/words/read.wav` — "read"
- [ ] `audio/words/sea.wav` — "sea"

### Activity staging
- `quiz-ai` `quiz-ay` `quiz-ee` `quiz-ea` → respective nodes
- `quiz-cp15` → `node-cp15`

---

## Zone 16 — Sky (vowel teams: oa, ow-long, ue, ew)
All staged.

### Phonics Units
- [ ] `audio/phonics-units/oa-name.wav` — "o-a"
- [ ] `audio/phonics-units/oa-sound.wav` — long /oʊ/ as in "boat"
- [ ] `audio/phonics-units/ow-long-name.wav` — "o-w (long o)"
- [ ] `audio/phonics-units/ow-long-sound.wav` — long /oʊ/ as in "snow"
- [ ] `audio/phonics-units/ue-name.wav` — "u-e"
- [ ] `audio/phonics-units/ue-sound.wav` — long /uː/ as in "blue"
- [ ] `audio/phonics-units/ew-name.wav` — "e-w"
- [ ] `audio/phonics-units/ew-sound.wav` — long /uː/ as in "new"

### Words needed
- [ ] `audio/words/boat.wav` — "boat"
- [ ] `audio/words/coat.wav` — "coat"
- [ ] `audio/words/road.wav` — "road"
- [ ] `audio/words/soap.wav` — "soap"
- [ ] `audio/words/snow.wav` — "snow"
- [ ] `audio/words/grow.wav` — "grow"
- [ ] `audio/words/blow.wav` — "blow"
- [ ] `audio/words/flow.wav` — "flow"
- [ ] `audio/words/show.wav` — "show"
- [ ] `audio/words/blue.wav` — "blue"
- [ ] `audio/words/clue.wav` — "clue"
- [ ] `audio/words/glue.wav` — "glue"
- [ ] `audio/words/true.wav` — "true"
- [ ] `audio/words/new.wav` — "new"
- [ ] `audio/words/dew.wav` — "dew"
- [ ] `audio/words/flew.wav` — "flew"
- [ ] `audio/words/stew.wav` — "stew"

### Activity staging
- `quiz-oa` `quiz-ow-long` `quiz-ue-team` `quiz-ew` → respective nodes
- `quiz-cp16` → `node-cp16`

---

## Zone 17 — Indigo (vowel teams: ie, igh, oe)
All staged.

### Phonics Units
- [ ] `audio/phonics-units/ie-name.wav` — "i-e" (vowel team)
- [ ] `audio/phonics-units/ie-sound.wav` — long /aɪ/ as in "pie"
- [ ] `audio/phonics-units/igh-name.wav` — "i-g-h"
- [ ] `audio/phonics-units/igh-sound.wav` — long /aɪ/ as in "night"
- [ ] `audio/phonics-units/oe-name.wav` — "o-e" (vowel team)
- [ ] `audio/phonics-units/oe-sound.wav` — long /oʊ/ as in "toe"

### Words needed
- [ ] `audio/words/pie.wav` — "pie"
- [ ] `audio/words/tie.wav` — "tie"
- [ ] `audio/words/lie.wav` — "lie"
- [ ] `audio/words/die.wav` — "die"
- [ ] `audio/words/night.wav` — "night"
- [ ] `audio/words/light.wav` — "light"
- [ ] `audio/words/right.wav` — "right"
- [ ] `audio/words/sight.wav` — "sight"
- [ ] `audio/words/tight.wav` — "tight"
- [ ] `audio/words/might.wav` — "might"
- [ ] `audio/words/toe.wav` — "toe"
- [ ] `audio/words/doe.wav` — "doe"
- [ ] `audio/words/foe.wav` — "foe"
- [ ] `audio/words/hoe.wav` — "hoe"

### Activity staging
- `quiz-ie-team` `quiz-igh` `quiz-oe-team` → respective nodes
- `quiz-cp17` → `node-cp17`

---

## Zone 18 — Violet (oo long, oo short, ou, ow-diphthong)
All staged.

### Phonics Units
- [ ] `audio/phonics-units/oo-long-name.wav` — "o-o (long)"
- [ ] `audio/phonics-units/oo-long-sound.wav` — /uː/ as in "moon"
- [ ] `audio/phonics-units/oo-short-name.wav` — "o-o (short)"
- [ ] `audio/phonics-units/oo-short-sound.wav` — /ʊ/ as in "book"
- [ ] `audio/phonics-units/ou-name.wav` — "o-u"
- [ ] `audio/phonics-units/ou-sound.wav` — /aʊ/ as in "out"
- [ ] `audio/phonics-units/ow-dip-name.wav` — "o-w (diphthong)"
- [ ] `audio/phonics-units/ow-dip-sound.wav` — /aʊ/ as in "cow"

### Words needed
- [ ] `audio/words/moon.wav` — "moon"
- [ ] `audio/words/food.wav` — "food"
- [ ] `audio/words/cool.wav` — "cool"
- [ ] `audio/words/pool.wav` — "pool"
- [ ] `audio/words/spoon.wav` — "spoon"
- [ ] `audio/words/book.wav` — "book"
- [ ] `audio/words/cook.wav` — "cook"
- [ ] `audio/words/look.wav` — "look"
- [ ] `audio/words/foot.wav` — "foot"
- [ ] `audio/words/wood.wav` — "wood"
- [ ] `audio/words/out.wav` — "out"
- [ ] `audio/words/loud.wav` — "loud"
- [ ] `audio/words/cloud.wav` — "cloud"
- [ ] `audio/words/found.wav` — "found"
- [ ] `audio/words/shout.wav` — "shout"
- [ ] `audio/words/cow.wav` — "cow"
- [ ] `audio/words/now.wav` — "now"
- [ ] `audio/words/town.wav` — "town"
- [ ] `audio/words/down.wav` — "down"
- [ ] `audio/words/crown.wav` — "crown"

### Activity staging
- `quiz-oo-long` `quiz-oo-short` `quiz-ou` `quiz-ow-dip` → respective nodes
- `quiz-cp18` → `node-cp18`

---

## Zone 19 — Rose (oi, oy, aw, au)
All staged.

### Phonics Units
- [ ] `audio/phonics-units/oi-name.wav` — "o-i"
- [ ] `audio/phonics-units/oi-sound.wav` — /ɔɪ/ as in "oil"
- [ ] `audio/phonics-units/oy-name.wav` — "o-y"
- [ ] `audio/phonics-units/oy-sound.wav` — /ɔɪ/ as in "boy"
- [ ] `audio/phonics-units/aw-name.wav` — "a-w"
- [ ] `audio/phonics-units/aw-sound.wav` — /ɔː/ as in "saw"
- [ ] `audio/phonics-units/au-name.wav` — "a-u"
- [ ] `audio/phonics-units/au-sound.wav` — /ɔː/ as in "cause"

### Words needed
- [ ] `audio/words/oil.wav` — "oil"
- [ ] `audio/words/boil.wav` — "boil"
- [ ] `audio/words/coin.wav` — "coin"
- [ ] `audio/words/foil.wav` — "foil"
- [ ] `audio/words/soil.wav` — "soil"
- [ ] `audio/words/boy.wav` — "boy"
- [ ] `audio/words/joy.wav` — "joy"
- [ ] `audio/words/toy.wav` — "toy"
- [ ] `audio/words/saw.wav` — "saw"
- [ ] `audio/words/claw.wav` — "claw"
- [ ] `audio/words/draw.wav` — "draw"
- [ ] `audio/words/yawn.wav` — "yawn"
- [ ] `audio/words/hawk.wav` — "hawk"
- [ ] `audio/words/cause.wav` — "cause"
- [ ] `audio/words/haul.wav` — "haul"
- [ ] `audio/words/launch.wav` — "launch"
- [ ] `audio/words/pause.wav` — "pause"

### Activity staging
- `quiz-oi` `quiz-oy` `quiz-aw` `quiz-au` → respective nodes
- `quiz-cp19` → `node-cp19`

---

## Zone 20 — Maroon (r-controlled: ar, or, er, ir, ur)
All staged.

### Phonics Units
- [ ] `audio/phonics-units/ar-name.wav` — "a-r"
- [ ] `audio/phonics-units/ar-sound.wav` — /ɑːr/ as in "car"
- [ ] `audio/phonics-units/or-name.wav` — "o-r"
- [ ] `audio/phonics-units/or-sound.wav` — /ɔːr/ as in "horn"
- [ ] `audio/phonics-units/er-name.wav` — "e-r"
- [ ] `audio/phonics-units/er-sound.wav` — /ɜːr/ as in "her"
- [ ] `audio/phonics-units/ir-name.wav` — "i-r"
- [ ] `audio/phonics-units/ir-sound.wav` — /ɜːr/ as in "bird"
- [ ] `audio/phonics-units/ur-name.wav` — "u-r"
- [ ] `audio/phonics-units/ur-sound.wav` — /ɜːr/ as in "fur"

### Words needed
- [ ] `audio/words/car.wav` — "car"
- [ ] `audio/words/bar.wav` — "bar"
- [ ] `audio/words/farm.wav` — "farm"
- [ ] `audio/words/star.wav` — "star"
- [ ] `audio/words/dark.wav` — "dark"
- [ ] `audio/words/park.wav` — "park"
- [ ] `audio/words/horn.wav` — "horn"
- [ ] `audio/words/corn.wav` — "corn"
- [ ] `audio/words/sort.wav` — "sort"
- [ ] `audio/words/fork.wav` — "fork"
- [ ] `audio/words/storm.wav` — "storm"
- [ ] `audio/words/her.wav` — "her"
- [ ] `audio/words/fern.wav` — "fern"
- [ ] `audio/words/verb.wav` — "verb"
- [ ] `audio/words/bird.wav` — "bird"
- [ ] `audio/words/girl.wav` — "girl"
- [ ] `audio/words/shirt.wav` — "shirt"
- [ ] `audio/words/first.wav` — "first"
- [ ] `audio/words/fur.wav` — "fur"
- [ ] `audio/words/burn.wav` — "burn"
- [ ] `audio/words/curl.wav` — "curl"
- [ ] `audio/words/turn.wav` — "turn"
- [ ] `audio/words/purse.wav` — "purse"

### Activity staging
- `quiz-ar` `quiz-or` `quiz-er` `quiz-ir` `quiz-ur` → respective nodes
- `quiz-cp20` → `node-cp20`

---

## Zone 21 — Brown (advanced consonants: -ng, -nk, soft-c, soft-g, -tch, -dge)
All staged.

### Phonics Units
- [ ] `audio/phonics-units/ng-name.wav` — "n-g" (final)
- [ ] `audio/phonics-units/ng-sound.wav` — /ŋ/ as in "ring"
- [ ] `audio/phonics-units/nk-adv-name.wav` — "n-k" (final)
- [ ] `audio/phonics-units/nk-adv-sound.wav` — /ŋk/ as in "think"
- [ ] `audio/phonics-units/soft-c-name.wav` — "soft c"
- [ ] `audio/phonics-units/soft-c-sound.wav` — /s/ as in "cent"
- [ ] `audio/phonics-units/soft-g-name.wav` — "soft g"
- [ ] `audio/phonics-units/soft-g-sound.wav` — /dʒ/ as in "gem"
- [ ] `audio/phonics-units/tch-name.wav` — "t-c-h"
- [ ] `audio/phonics-units/tch-sound.wav` — /tʃ/ as in "catch"
- [ ] `audio/phonics-units/dge-name.wav` — "d-g-e"
- [ ] `audio/phonics-units/dge-sound.wav` — /dʒ/ as in "bridge"

### Words needed
- [ ] `audio/words/ring.wav` — "ring"
- [ ] `audio/words/sing.wav` — "sing"
- [ ] `audio/words/king.wav` — "king"
- [ ] `audio/words/song.wav` — "song"
- [ ] `audio/words/lung.wav` — "lung"
- [ ] `audio/words/think.wav` — "think"
- [ ] `audio/words/pink.wav` — "pink"
- [ ] `audio/words/bank.wav` — "bank"
- [ ] `audio/words/cent.wav` — "cent"
- [ ] `audio/words/city.wav` — "city"
- [ ] `audio/words/dance.wav` — "dance"
- [ ] `audio/words/face.wav` — "face"
- [ ] `audio/words/gem.wav` — "gem"
- [ ] `audio/words/giant.wav` — "giant"
- [ ] `audio/words/cage.wav` — "cage"
- [ ] `audio/words/catch.wav` — "catch"
- [ ] `audio/words/match.wav` — "match"
- [ ] `audio/words/patch.wav` — "patch"
- [ ] `audio/words/witch.wav` — "witch"
- [ ] `audio/words/edge.wav` — "edge"
- [ ] `audio/words/badge.wav` — "badge"
- [ ] `audio/words/bridge.wav` — "bridge"
- [ ] `audio/words/lodge.wav` — "lodge"
- [ ] `audio/words/fudge.wav` — "fudge"

### Activity staging
- `quiz-ng` `quiz-nk-adv` `quiz-soft-c` `quiz-soft-g` `quiz-tch` `quiz-dge` → respective nodes
- `quiz-cp21` → `node-cp21`

---

## Zone 22 — Olive (silent letters: kn, wr, gn, mb, ph)
All staged.

### Phonics Units
- [ ] `audio/phonics-units/kn-name.wav` — "k-n (silent k)"
- [ ] `audio/phonics-units/kn-sound.wav` — /n/ as in "know"
- [ ] `audio/phonics-units/wr-name.wav` — "w-r (silent w)"
- [ ] `audio/phonics-units/wr-sound.wav` — /r/ as in "write"
- [ ] `audio/phonics-units/gn-name.wav` — "g-n (silent g)"
- [ ] `audio/phonics-units/gn-sound.wav` — /n/ as in "gnaw"
- [ ] `audio/phonics-units/mb-name.wav` — "m-b (silent b)"
- [ ] `audio/phonics-units/mb-sound.wav` — /m/ as in "lamb"
- [ ] `audio/phonics-units/ph-name.wav` — "p-h"
- [ ] `audio/phonics-units/ph-sound.wav` — /f/ as in "phone"

### Words needed
- [ ] `audio/words/know.wav` — "know"
- [ ] `audio/words/knee.wav` — "knee"
- [ ] `audio/words/knock.wav` — "knock"
- [ ] `audio/words/knot.wav` — "knot"
- [ ] `audio/words/knife.wav` — "knife"
- [ ] `audio/words/write.wav` — "write"
- [ ] `audio/words/wrist.wav` — "wrist"
- [ ] `audio/words/wrong.wav` — "wrong"
- [ ] `audio/words/wrap.wav` — "wrap"
- [ ] `audio/words/gnaw.wav` — "gnaw"
- [ ] `audio/words/gnome.wav` — "gnome"
- [ ] `audio/words/lamb.wav` — "lamb"
- [ ] `audio/words/comb.wav` — "comb"
- [ ] `audio/words/thumb.wav` — "thumb"
- [ ] `audio/words/climb.wav` — "climb"
- [ ] `audio/words/phone.wav` — "phone"
- [ ] `audio/words/photo.wav` — "photo"
- [ ] `audio/words/graph.wav` — "graph"
- [ ] `audio/words/dolphin.wav` — "dolphin"

### Activity staging
- `quiz-kn` `quiz-wr` `quiz-gn` `quiz-mb` `quiz-ph` → respective nodes
- `quiz-cp22` → `node-cp22`

---

## Zone 23 — Navy (syllables: compound, VCCV, open)
All staged. _(Activities here are more about reading multisyllabic words than phoneme drills.)_

### Words needed
- [ ] `audio/words/sunshine.wav` — "sunshine"
- [ ] `audio/words/football.wav` — "football"
- [ ] `audio/words/rainbow.wav` — "rainbow"
- [ ] `audio/words/bedroom.wav` — "bedroom"
- [ ] `audio/words/rabbit.wav` — "rabbit"
- [ ] `audio/words/kitten.wav` — "kitten"
- [ ] `audio/words/mitten.wav` — "mitten"
- [ ] `audio/words/dinner.wav` — "dinner"
- [ ] `audio/words/tiger.wav` — "tiger"
- [ ] `audio/words/paper.wav` — "paper"
- [ ] `audio/words/pilot.wav` — "pilot"
- [ ] `audio/words/open.wav` — "open"

### Activity staging
- `quiz-compound` `quiz-vccv` `quiz-open-syl` → respective nodes
- `quiz-cp23` → `node-cp23`

---

## Zone 24 — Forest (syllables: VCe, vowel-team, r-controlled, -cle)
All staged.

### Words needed
- [ ] `audio/words/cupcake.wav` — "cupcake"
- [ ] `audio/words/pancake.wav` — "pancake"
- [ ] `audio/words/mistake.wav` — "mistake"
- [ ] `audio/words/explain.wav` — "explain"
- [ ] `audio/words/railroad.wav` — "railroad"
- [ ] `audio/words/market.wav` — "market"
- [ ] `audio/words/corner.wav` — "corner"
- [ ] `audio/words/purple.wav` — "purple"
- [ ] `audio/words/apple.wav` — "apple" _(already exists ✅)_
- [ ] `audio/words/bubble.wav` — "bubble"
- [ ] `audio/words/jungle.wav` — "jungle"
- [ ] `audio/words/simple.wav` — "simple"
- [ ] `audio/words/candle.wav` — "candle"

### Activity staging
- `quiz-vce-syl` `quiz-vowel-team-syl` `quiz-r-syl` `quiz-cle-syl` → respective nodes
- `quiz-cp24` → `node-cp24`

---

## Zone 25 — Slate (suffixes: -s/-es, -ed, -ing)
All staged.

### Words needed
_(These activities show morphology — base word + suffix combos)_
- [ ] `audio/words/cats.wav` — "cats"
- [ ] `audio/words/dogs.wav` — "dogs"
- [ ] `audio/words/boxes.wav` — "boxes"
- [ ] `audio/words/dishes.wav` — "dishes"
- [ ] `audio/words/walked.wav` — "walked"
- [ ] `audio/words/played.wav` — "played"
- [ ] `audio/words/wanted.wav` — "wanted"
- [ ] `audio/words/running.wav` — "running"
- [ ] `audio/words/sitting.wav` — "sitting"
- [ ] `audio/words/jumping.wav` — "jumping"
- [ ] `audio/words/reading.wav` — "reading"

### Activity staging
- `quiz-suf-s` `quiz-suf-ed` `quiz-suf-ing` → respective nodes
- `quiz-cp25` → `node-cp25`

---

## Zone 26 — Coral (suffixes: -er, -est, -ly, -ful, -less)
All staged.

### Words needed
- [ ] `audio/words/bigger.wav` — "bigger"
- [ ] `audio/words/biggest.wav` — "biggest"
- [ ] `audio/words/faster.wav` — "faster"
- [ ] `audio/words/fastest.wav` — "fastest"
- [ ] `audio/words/slowly.wav` — "slowly"
- [ ] `audio/words/quickly.wav` — "quickly"
- [ ] `audio/words/friendly.wav` — "friendly"
- [ ] `audio/words/helpful.wav` — "helpful"
- [ ] `audio/words/careful.wav` — "careful"
- [ ] `audio/words/hopeless.wav` — "hopeless"
- [ ] `audio/words/fearless.wav` — "fearless"
- [ ] `audio/words/kindness.wav` — "kindness"
- [ ] `audio/words/darkness.wav` — "darkness"

### Activity staging
- `quiz-suf-er` `quiz-suf-ly` `quiz-suf-ful` `quiz-suf-less` → respective nodes
- `quiz-cp26` → `node-cp26`

---

## Zone 27 — Magenta (prefixes: un-, re-, pre- + suffixes -tion, -ment)
All staged.

### Words needed
- [ ] `audio/words/undo.wav` — "undo"
- [ ] `audio/words/unpack.wav` — "unpack"
- [ ] `audio/words/unhappy.wav` — "unhappy"
- [ ] `audio/words/redo.wav` — "redo"
- [ ] `audio/words/replay.wav` — "replay"
- [ ] `audio/words/reread.wav` — "reread"
- [ ] `audio/words/preview.wav` — "preview"
- [ ] `audio/words/prepay.wav` — "prepay"
- [ ] `audio/words/action.wav` — "action"
- [ ] `audio/words/station.wav` — "station"
- [ ] `audio/words/nation.wav` — "nation"
- [ ] `audio/words/mention.wav` — "mention"
- [ ] `audio/words/payment.wav` — "payment"
- [ ] `audio/words/treatment.wav` — "treatment"
- [ ] `audio/words/agreement.wav` — "agreement"

### Activity staging
- `quiz-pre-un` `quiz-pre-re` `quiz-pre-pre` `quiz-suf-tion` `quiz-suf-ment` → respective nodes
- `quiz-cp27` → `node-cp27`

---

## Prompts — currently all present ✅
If new activity types need new prompt lines, add them here:
- [ ] _(none needed yet)_
