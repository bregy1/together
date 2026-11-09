# Vision — Yaruno

## Idea

An app to plan activities and let people join: hosts choose who comes, and a trust score filters out people who don't show up.

Yaruno starts in Oberwallis and is available in Switzerland.

## Problem

People want to meet others and do things together, but everyday life is dominated by phones and little real conversation. Getting a group together for an activity is hard, and when strangers do say yes, there is no way to tell whether they will actually come.

Figures from Romi's brand guide (v1.0, p.3; quoted from the guide, not checked against the original studies): 42 % of the Swiss population feel lonely sometimes to very often (Federal Statistical Office, 2022), and among 15–24-year-olds "very often" has doubled since 2017; it takes about 50 hours of shared time to turn an acquaintance into a friend, and after studies or a job change the places for that are missing; 69 % of dating apps are deleted within a month, and over 90 % of Gen Z prefer meeting people at events and in groups.

What people do today, and why it falls short:

- **WhatsApp groups or asking friends:** reaches only an existing circle; nobody really commits; details such as the time or place get lost in long chat histories, and nothing can be reused for the next time.
- **Meetup or Facebook events:** large, anonymous events or few local offers in Oberwallis; no signal about who is reliable.
- **Clubs (Vereine):** need membership and a regular commitment; not made for a one-off or spontaneous activity.
- **Nothing:** people stay at home or do the activity alone.

Yaruno answers this with plans that keep their details in one place and can be reused, hosts who decide who joins, and a trust score that gives a sense of whether people actually come. The score is computed internally; users see it only as a coloured bar with four fixed states, never as a number (boss, 2026-11-09).

## Goal and success

Yaruno is a non-profit project to help people meet people in real life, from locals for locals: no big company, just some people building something for people. A reusable group-planning tool comes as a side effect. Success means the app gets running and is actually used; in the best case, voluntary support from users ("buy us a coffee") covers the running costs, which are low at the start.

The focus is on plans that really happen, not on app activity.

| Metric | Measure | Target | By |
|---|---|---|---|
| **North star:** plans that took place | Share of planned plans that actually took place | ≥ 70 % | 6 months after pilot launch |
| Show-up rate | Share of accepted participants who actually attend | ≥ 85 % | 6 months after pilot launch |
| Come back | Share of people who join or host a second plan within 30 days of their first | ≥ 40 % | 6 months after pilot launch |
| Reports | Reviewed reports per 100 plans that took place | < 2 | 6 months after pilot launch |

Watched without a target: active users; requests answered (share of join requests the host accepts or declines before the plan starts).

## Target users

Primary:

- **Wants company for activities:** wants to do things (sport, outings, games) but lacks company, because friends are busy, have moved away or have other interests. Joins plans, or finds people for their own idea.
- **New to the region:** has moved to the region (studies, a new job) and wants to meet people. Gets into a circle through shared activities.

Secondary:

- **Friend groups organising:** existing groups that want a better tool than WhatsApp to plan, change and reuse their events.
- **Hosts with a hobby:** people who regularly run an activity (a walk, board games, bouldering) and want others to join.

Brand focus (Romi's brand guide v1.0, p.3): 20- to 40-year-olds around Brig, Visp and Naters who are new to the region or whose circle of friends is changing: people who moved for a job, returners after their studies, locals whose friends moved away, weekly residents.

All groups use the app at home when planning ahead, on the go for something spontaneous, right before and during an activity (meeting point, who is coming, running late), and afterwards (who was there, reusing the plan, adding friends).

- **Minimum age:** 18. The app is for adults only.
- **Markets:** Switzerland only at launch; both stores list Yaruno in Switzerland only. The pilot runs in Oberwallis, but members can use any region in Switzerland. Other countries come later.

### Roles in the app

- **Member:** every user; no account without a verified phone number. Discovers plans, requests to join, attends, adds friends.
- **Host:** any member who creates a plan; there is no host approval or tier model. The host always decides who joins, can invite friends and can add co-hosts. Misuse (rude plan titles or texts) is handled by moderation, not by restricting who may host.
- **Co-host:** a member the host adds to a plan, who can edit it together with the host.
- **Partner organisation:** an organisation such as a bar, a gym or a band that publishes events everyone can join. Members can see which of their friends are going, or copy the event and ask other people to go with them.
- **Moderator:** a role that allows reviewing reports and deciding on them. In the pilot, Bregy and Romi moderate.
- **Admin:** runs Yaruno: everything a moderator can do, plus reviewing cancellations and managing the interest list.

## Core value

Plans that really happen, with people who show up. If Yaruno fails at this, nothing else matters.

## Principles

- **Real meetings over screen time.** The app exists to get people out the door. Time in the app is kept short and planning is the focus: no engagement tricks, no endless scrolling for its own sake.
- **Privacy over convenience.** People who are not accepted see only what they need to decide. The location and the meeting point stay on the server until acceptance, even if that costs an extra step.
- **Gentle trust over gamification.** The trust score punishes repeated bad behaviour (frequent no-shows, reviewed reports); normal people get an ok-to-good score without effort. There are no points to chase.
- **Host's choice over open access.** The host always decides who joins their plan. Partner events are the deliberate exception.

## Non-goals

- **No payment of any kind required from users:** no paywall, no paid features, no deposit or penalty fee. Every feature is free; voluntary support only. Why: the goal is that people meet, not revenue.
- **Not a dating app:** Yaruno tells users so explicitly; it is for meeting up and planning events. Consensual flirting is fine, but there is no matching or swiping on people. Why: dating dynamics would undermine trust and safety in groups.
- **No people directory:** profiles are visible only in the context of a plan or between friends; nobody can browse or search people. Why: protects members from being looked up.
- **No live location:** users are never tracked; only a plan's places exist. Why: privacy.
- **No required location or contacts access:** the region is entered by hand, and there is no address-book upload. Why: keep it safe and collect only what is needed.
- **No selling between users:** Yaruno is not a marketplace. Partner events are labelled, with transparent costs. Why: keeps plans about the activity, not business.
- **Not a social network with likes, not an event ticket shop, not a club with mandatory membership** (Romi's brand guide v1.0, p.3). Why: Yaruno is about plans, not profiles, followers or sales.

## Risks and constraints

Risks:

- **Meeting strangers in person:** safety tips before the first meetup, community rules, report and block [MOD].
- **Fake profiles:** a verified phone number for every account [ONB]; the selfie-verified badge comes later [PROF]. The minimum age is self-declared via the birth date; a stronger age check would need an ID check.
- **Harassment and hate:** text filter, report, block, review by moderators, sanctions with the right to object [MOD, ADM].
- **Unfair trust labels:** simple rules, only reviewed reports count, the group can accept cancellations, admins can review cancellations [TRUST, ADM].
- **Store rules for user content** (Apple App Review Guideline 1.2, Google Play User Generated Content policy): filtering, reporting, blocking and timely action are covered by [MOD, ADM].
- **Moderation load:** two moderators in the pilot; reports may pile up. The moderator role lets more people help [ADM].
- **Empty feed at launch:** in the app, members are invited to host the first plan [FEED, PLAN]; recruiting the first hosts is organisational, not an app feature.
- **Liability for what happens during an activity:** the terms of use state that Yaruno only helps people find activities; legal review is open (`app.md` → Legal).
- **Data in Switzerland only** (`constitution.md`): push notifications pass through Apple's and Google's servers, and SMS codes through carriers. `/spec-decide` must define what "Switzerland only" covers (e.g. stored data in Switzerland, minimal content in push messages).
- **SMS costs and abuse:** SMS codes cost money per message, and bots can trigger mass sending (SMS pumping); rate limits and the SMS provider's fraud protection belong in the authentication decision (`/spec-decide`).
- **Biometric data** (later, with the selfie badge): face scans are sensitive data; explicit consent, deletion right after the check.
- **Voluntary support** ("buy us a coffee", idea): the stores' rules for tips and donations must be checked before it is built.

Constraints:

- **Launch market:** Switzerland only.
- **Date:** no fixed date; set once the stack and the effort are known.
- **Budget:** stay as free as possible. Hosting may come cheaply from a friend's infrastructure in Switzerland; costs are decided once the app is built and deployed.
- **People:** Bregy owns technology and architecture, Romi owns design, colours and logo; both moderate in the pilot.
- **Legal entity:** not decided yet; needed before the first store submission (`app.md` → Legal).
- **What exists:** the clickable ChatGPT prototype (private, see `notes/chatgpt-prototype-chat.md`) and this repository.

## Discovery status

| # | Topic | Status | Where |
|---|---|---|---|
| 1 | Idea & problem | done | this file |
| 2 | Goal & success | done | this file |
| 3 | Users & context | done | this file |
| 4 | Value, principles, non-goals | done | this file |
| 5 | Feature map & MVP cut | done | `features.md` |
| 6 | Key journeys | done | `journeys.md` |
| 7 | Design direction | done | `../design/direction.md` |
| 8 | Glossary | done | `glossary.md` |
| 9 | Risks & constraints | done | this file, `app.md` |

Last round: 2026-11-08 — topic 9 (done: law, data residency, accessibility, moderation, store region, entity, date, budget) — discovery complete; open decisions remain as markers.

Carried forward:
- `/spec-write PART`: what "everyone can join" means for partner events (no host approval? no seat limit?).
