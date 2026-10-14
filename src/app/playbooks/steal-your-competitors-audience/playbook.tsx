"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useMemo, useState } from "react";

type Signal = {
  observation: string;
  decision: string;
  why: string;
};

type ChecklistGroup = {
  title: string;
  items: Array<[string, string]>;
};

const signals: Signal[] = [
  {
    observation: "A Head of Support asks how to reduce repeated onboarding tickets.",
    decision: "Research",
    why: "The role fits. The problem fits. There is a real reason to learn a little more before writing.",
  },
  {
    observation: "Someone simply likes the post.",
    decision: "Need context",
    why: "A like alone does not tell you what they need, whether they own the problem, or why you should message them.",
  },
  {
    observation: "An agency selling helpdesk automation advertises its own service in the thread.",
    decision: "Skip",
    why: "They are selling into the same market. That is not a reason to treat them as a buyer.",
  },
];

const checklistGroups: ChecklistGroup[] = [
  {
    title: "Set the play up",
    items: [
      ["buyer-statement", "I wrote one clear sentence describing the buyer, company type, and problem."],
      ["accounts", "I chose two or three relevant competitor, creator, or industry accounts to watch."],
      ["post", "I picked a post where my buyer is talking about a problem I solve."],
      ["context", "I read the full comment and the post before deciding to write."],
    ],
  },
  {
    title: "Check the person",
    items: [
      ["role", "I checked their role and company, not just the comment."],
      ["exclude", "I removed competitors, existing conversations, and people I should not contact."],
    ],
  },
  {
    title: "Review before anything runs",
    items: [
      ["message", "I read the first message and checked every claim in it."],
      ["approval", "I will approve the people and messages before outreach starts."],
      ["follow-up", "I have one useful follow-up ready, and I will stop when someone replies or says no."],
    ],
  },
];

const checklistStorageKey = "pumpgtm-competitor-audience-checklist";
const runPlayUrl = "https://pumpgtm.com/skills/message-linkedin-post-engagers?utm_source=lead_magnet&utm_medium=web&utm_campaign=competitor_audience";

function ArrowIcon() {
  return <svg aria-hidden="true" className="arrow-icon" fill="none" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" /></svg>;
}

function limitText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const cut = normalized.slice(0, maxLength).replace(/\s+\S*$/, "");
  return `${cut || normalized.slice(0, maxLength)}...`;
}

function validHttpsUrl(value: string) {
  if (!value.trim()) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function buildPrompt(buyer: string, problem: string, context: string, postUrl: string) {
  return `Help me find relevant buyers from a public industry or competitor post using PumpGTM.

My buyer: ${buyer.trim() || "[BUYER ROLE / COMPANY TYPE]"}
The problem my product solves: ${problem.trim() || "[PROBLEM]"}
Public source post: ${postUrl.trim() || "I'll add the URL"}
What caught my attention: ${context.trim() || "I'll add the actual comment"}

1. Show me the available post-engager workflow for this source and its collection limits.
2. Help me review a small sample of candidates against my buyer profile. For each, show the source and one specific reason for fit, with uncertainty marked.
3. Skip unrelated people, competitors, existing conversations and opt-outs.
4. Draft one relevant first message for candidates I explicitly select.
5. Show me the recipients, any usage or credit costs, and all message text. Do not enroll, pay for enrichment, send messages, or activate anything until I approve the exact actions.

Use PumpGTM MCP if connected. If not connected, tell me how to connect it instead of pretending anything ran.`;
}

export default function CompetitorAudiencePlaybook() {
  const [buyer, setBuyer] = useState("");
  const [problem, setProblem] = useState("");
  const [context, setContext] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [built, setBuilt] = useState(false);
  const [message, setMessage] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [copyError, setCopyError] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [checklistReady, setChecklistReady] = useState(false);

  const canBuild = buyer.trim().length >= 3 && problem.trim().length >= 3 && validHttpsUrl(postUrl);
  const urlIsInvalid = postUrl.trim().length > 0 && !validHttpsUrl(postUrl);
  const prompt = useMemo(() => buildPrompt(buyer, problem, context, postUrl), [buyer, problem, context, postUrl]);
  const checklistItems = checklistGroups.flatMap((group) => group.items);
  const checkedCount = checklistItems.filter(([id]) => checked[id]).length;

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(checklistStorageKey);
        if (saved) setChecked(JSON.parse(saved) as Record<string, boolean>);
      } catch {
        // The checklist still works if browser storage is unavailable.
      }
      setChecklistReady(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!checklistReady) return;
    try {
      window.localStorage.setItem(checklistStorageKey, JSON.stringify(checked));
    } catch {
      // No persistence is better than interrupting the playbook.
    }
  }, [checked, checklistReady]);

  function makeStarterMessage() {
    const issue = context.trim() ? limitText(context, 115).replace(/[.!?]+$/, "") : "[the issue you raised]";
    return `Saw your comment about ${issue}. Is ${problem.trim() || "[the problem you solve]"} something your team is working on right now?`;
  }

  function handleBuild(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canBuild) return;
    setMessage(makeStarterMessage());
    setBuilt(true);
    setCopyStatus("");
  }

  async function copyText(value: string, label: string) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(value);
      setCopyError(false);
      setCopyStatus(`${label} copied.`);
    } catch {
      setCopyError(true);
      setCopyStatus("Clipboard unavailable. Select and copy the text above.");
    }
  }

  function copyChecklist() {
    const text = checklistGroups
      .map((group) => `${group.title}\n${group.items.map(([id, label]) => `${checked[id] ? "[x]" : "[ ]"} ${label}`).join("\n")}`)
      .join("\n\n");
    void copyText(text, "Checklist");
  }

  async function sharePage() {
    const shareData = { title: "Your next customers might be in your competitors' comments", text: "A short PumpGTM play for finding people worth talking to.", url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setCopyError(false);
        setCopyStatus("Share sheet opened.");
      } else {
        await copyText(window.location.href, "Link");
      }
    } catch {
      setCopyError(true);
      setCopyStatus("Sharing was cancelled. You can copy the page URL from your browser.");
    }
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <nav className="nav" aria-label="Main navigation">
          <a className="brand" href="https://pumpgtm.com"><Image alt="" height={40} src="/pumpgtm-mark.webp" width={40} /><span>PumpGTM</span></a>
          <div className="nav-links">
            <a href="https://pumpgtm.com/features">Features</a>
            <a href="https://pumpgtm.com/integrations">Integrations</a>
            <a href="https://pumpgtm.com/skills">Resources</a>
          </div>
          <a className="nav-cta" href={runPlayUrl}>Find Buyers <ArrowIcon /></a>
          <button className="mobile-menu" type="button" aria-label="Open navigation">☰</button>
        </nav>
      </header>

      <main className="page-main">
        <a className="all-guides" href="https://pumpgtm.com/blog">← All guides</a>
        <article>
          <header className="playbook-hero">
            <div className="hero-copy-area">
              <h1>Your next customers might be in your competitors&apos; comments.</h1>
              <p className="deck">A simple move for finding a few people worth talking to, then writing one message you can stand behind.</p>
              <a className="primary-button" href="#step-1">Copy this play for your AI <ArrowIcon /></a>
              <p className="hero-meta"><strong>PumpGTM</strong><span>·</span><span>2 min read</span></p>
            </div>
            <aside className="hero-example" aria-label="One post, three checks">
              <h2>One post. Three checks.</h2>
              <p>What to do when someone in a competitor&apos;s audience says something useful.</p>
              <dl>
                <div><dt>Read the comment</dt><dd>Find the actual problem, not a vague signal.</dd></div>
                <div><dt>Check the fit</dt><dd>Look at the role and company before you write.</dd></div>
                <div><dt>Ask one question</dt><dd>Keep the first message short and specific.</dd></div>
              </dl>
              <p className="hero-example-rule">Do not message everyone. Have a reason.</p>
            </aside>
          </header>

          <nav className="contents-nav" aria-label="In this playbook">
            <a href="#step-1"><span>01</span>Pick one buyer</a>
            <a href="#step-2"><span>02</span>Find the post</a>
            <a href="#step-3"><span>03</span>Build a shortlist</a>
            <a href="#step-4"><span>04</span>Run it in PumpGTM</a>
            <a href="#step-5"><span>05</span>Write the message</a>
            <a href="#step-6"><span>06</span>Follow up once</a>
            <a href="#step-7"><span>07</span>Track the outcome</a>
            <a href="#checklist"><span>08</span>Launch checklist</a>
          </nav>

          <section className="article-section" id="step-1" aria-labelledby="step-1-title">
            <div className="article-column">
              <p className="section-kicker">Step 01 / 5 minutes</p>
              <h2 id="step-1-title">Pick one buyer.</h2>
              <p className="article-intro">Start with the person you want more conversations with. Not a market. Not a list. A real person with a job to do and a problem you can help with.</p>
              <section className="buyer-brief" aria-label="Buyer brief">
                <p className="buyer-label">Your one-line ICP</p>
                <p className="buyer-template">We help <strong>[role]</strong> at <strong>[company type]</strong> when <strong>[specific problem]</strong> becomes hard to ignore.</p>
                <div className="buyer-example"><p className="figure-label">A useful example</p><p>Heads of Support at 20 to 200 person B2B SaaS companies whose onboarding has made ticket volume hard to manage.</p></div>
              </section>
              <section className="account-watch" aria-label="Accounts to watch">
                <div><p className="figure-label">Then make a small watchlist</p><h3>Pick three accounts that already have your buyer&apos;s attention.</h3><ul className="watch-list"><li><strong>A competitor</strong> your buyer evaluates or compares.</li><li><strong>An operator</strong> who shares the work behind the problem.</li><li><strong>An industry voice</strong> where people ask practical questions.</li></ul></div>
              </section>
              <div className="two-up-notes"><p><strong>Keep</strong>the right role, the right company, and a problem you can explain in one sentence.</p><p><strong>Skip</strong>other vendors, generic engagement, and anyone you would struggle to write to honestly.</p></div>
            </div>
          </section>

          <section className="article-section" id="step-2" aria-labelledby="step-2-title">
            <div className="article-column">
              <h2 id="step-2-title">Step 2: Find a post with a real problem in it.</h2>
              <p className="article-intro">Ignore broad engagement. Look for a recent public conversation where someone is trying to solve the kind of problem you solve.</p>
              <p className="article-intro">The post gives you context. The comment tells you what to look into. Save the original link and read the whole thread before you do anything else.</p>

              <figure className="comment-figure">
                <p className="figure-label">Illustrative example, not an actual scraped comment</p>
                <blockquote>&quot;How are teams handling the same onboarding tickets every week?&quot;</blockquote>
                <figcaption>Support software selling to Heads of Support at B2B SaaS companies.</figcaption>
              </figure>

              <h3>Read the signal, not the vanity metric</h3>
              <p>Three things can happen in the same thread. Only one gives you a reason to do more research.</p>
              <div className="signal-list">
                {signals.map((signal) => <article className="signal-card" key={signal.observation}><div><h4>{signal.observation}</h4><p>{signal.why}</p></div><span className={`signal-decision ${signal.decision.toLowerCase().replace(" ", "-")}`}>{signal.decision}</span></article>)}
              </div>
            </div>
          </section>

          <section className="article-section" id="step-3" aria-labelledby="step-3-title">
            <div className="article-column">
              <h2 id="step-3-title">Step 3: Review the person, not just the comment.</h2>
              <p className="article-intro">A good shortlist is small enough to explain. Every name on it should come with a clear reason they belong there.</p>
              <ol className="steps"><li><strong>Fit:</strong> would this person have a say in the problem or the budget around it?</li><li><strong>Evidence:</strong> what public detail makes the conversation relevant right now?</li><li><strong>Timing:</strong> is the post recent enough that a message will feel natural?</li></ol>
              <p>If you cannot write one honest sentence about why you are reaching out, leave them off the list.</p>
            </div>
          </section>

          <section className="article-section" id="step-4" aria-labelledby="step-4-title">
            <div className="article-column">
              <h2 id="step-4-title">Step 4: Ask PumpGTM to research, not send.</h2>
              <p className="article-intro">Give PumpGTM one specific source post. Ask it to bring back a short, reviewable list with the source and a one-line reason for each person.</p>
              <div className="play-callout"><p><strong>The rule:</strong> review the people, the message, and the cost before you activate anything.</p></div>
              <div className="cta-row"><a className="primary-button" href={runPlayUrl}>Open the PumpGTM play <ArrowIcon /></a><button className="secondary-button" onClick={() => copyText(prompt, "Prompt")} type="button">Copy the review prompt</button></div>
            </div>
          </section>

          <section className="article-section" id="step-5" aria-labelledby="step-5-title">
            <div className="article-column">
              <h2 id="step-5-title">Step 5: Write a message that earns a reply.</h2>
              <p className="article-intro">Use the thing they actually said. Make one observation. Ask one question. Do not turn the first message into a pitch.</p>
              <figure className="walkthrough-figure">
                <div><p className="figure-label">Mock video placeholder</p><h3>Watch the move in one minute</h3><p>Replace this with an approved PumpGTM walkthrough when one is ready.</p></div>
                <div className="video-stage"><button className="play-circle" type="button" aria-label="Mock video play button">▶</button><small>Video placeholder · 1:12</small></div>
              </figure>

              <h3>Build your first line</h3>
              <form className="worksheet" onSubmit={handleBuild}>
                <div className="form-grid">
                  <div className="field"><label htmlFor="buyer">Who do you sell to?</label><input id="buyer" maxLength={180} onChange={(event) => setBuyer(event.target.value)} placeholder="Heads of Support at B2B SaaS companies" value={buyer} /></div>
                  <div className="field"><label htmlFor="problem">What problem do you solve?</label><input id="problem" maxLength={180} onChange={(event) => setProblem(event.target.value)} placeholder="Repeat tickets during customer onboarding" value={problem} /></div>
                  <div className="field full"><label htmlFor="context">What did someone actually say?</label><textarea id="context" maxLength={600} onChange={(event) => setContext(event.target.value)} placeholder="Paste a short public comment or describe the public problem in your own words." value={context} /><p className="input-note">Use public context only. Leave this empty and the draft keeps a visible placeholder.</p></div>
                  <div className="field full"><label htmlFor="post-url">Public post URL <span>(optional, HTTPS)</span></label><input id="post-url" inputMode="url" maxLength={500} onChange={(event) => setPostUrl(event.target.value)} placeholder="https://www.linkedin.com/posts/..." value={postUrl} />{urlIsInvalid && <p className="input-error">Add a complete HTTPS URL, or leave this field empty.</p>}</div>
                </div>
                <div className="worksheet-actions"><button className="primary-button" disabled={!canBuild} type="submit">Build my outreach starter <ArrowIcon /></button><p>Buyer and problem are required. The source URL is optional.</p></div>
              </form>

              {built && <section className="output" aria-labelledby="draft-title"><div className="output-header"><p className="draft-label">Draft: review before sending</p><h3 id="draft-title">First-message starter</h3><p>Check the role and company first. A relevant comment is a starting point, not proof they want to buy.</p></div><textarea aria-label="Editable first-message draft" className="draft-area" maxLength={500} onChange={(event) => setMessage(event.target.value)} value={message} /><div className="output-actions"><button className="copy-button" onClick={() => copyText(message, "Message")} type="button">Copy message</button>{copyStatus && <span className={`copy-status${copyError ? " error" : ""}`} aria-live="polite">{copyStatus}</span>}</div></section>}
              <section className="prompt-wrap" aria-label="PumpGTM handoff prompt"><div className="prompt-card-header"><div><p className="draft-label">Ready to copy</p><h3>PumpGTM research prompt</h3></div><button className="prompt-copy" onClick={() => copyText(prompt, "Prompt")} type="button"><svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><rect height="13" rx="2" stroke="currentColor" strokeWidth="1.8" width="13" x="8" y="8" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg>Copy prompt</button></div><textarea aria-label="PumpGTM handoff prompt" className="prompt-area" readOnly value={prompt} /></section>
            </div>
          </section>

          <section className="article-section" id="step-6" aria-labelledby="step-6-title">
            <div className="article-column">
              <h2 id="step-6-title">Step 6: Follow up once. Then leave it alone.</h2>
              <p className="article-intro">A second message only earns its place when it adds something useful. A bump does not.</p>
              <div className="play-callout"><p><strong>Simple play:</strong> a relevant public moment, a short question, one useful follow-up, then a real reply or a stop.</p></div>
              <p>If there is no reply, share a useful example or a fresh piece of context. If they say no, stop. If they reply, stop automation and take over as a human.</p>
              <div className="cta-row"><a className="primary-button" href={runPlayUrl}>Run this play in PumpGTM <ArrowIcon /></a><button className="secondary-button" onClick={() => copyText(prompt, "Prompt")} type="button">Copy prompt for Claude</button></div>
            </div>
          </section>

          <section className="article-section" id="step-7" aria-labelledby="step-7-title">
            <div className="article-column">
              <h2 id="step-7-title">Step 7: Measure the path to a real conversation.</h2>
              <p className="article-intro">A like is not buying intent. A reply to a free guide is not a sales lead. Your first win is a qualified conversation with the right person.</p>
              <ol className="steps"><li>Relevant people reviewed</li><li>Messages approved</li><li>Genuine replies</li><li>Meaningful conversations</li><li>Trials, demos, and paying customers</li></ol>
              <p>When someone is a real fit, show the smallest workflow that solves the problem they already described.</p>
            </div>
          </section>

          <section className="article-section" id="checklist" aria-labelledby="checklist-title">
            <div className="article-column checklist-section">
              <h2 id="checklist-title">Your launch checklist</h2>
              <p className="article-intro">Tick these off before you run the play. Your ticks save in this browser.</p>
              <div className="checklist-summary"><strong>{checkedCount} of {checklistItems.length} checked</strong><button className="copy-button" onClick={copyChecklist} type="button">Copy checklist</button></div>
              <div aria-label="Checklist progress" aria-valuemax={checklistItems.length} aria-valuemin={0} aria-valuenow={checkedCount} className="checklist-progress" role="progressbar"><span style={{ width: `${(checkedCount / checklistItems.length) * 100}%` }} /></div>
              <div className="checklist-groups">
                {checklistGroups.map((group) => <fieldset key={group.title}><legend>{group.title}</legend>{group.items.map(([id, label]) => <label key={id}><input checked={Boolean(checked[id])} onChange={() => setChecked((current) => ({ ...current, [id]: !current[id] }))} type="checkbox" /><span>{label}</span></label>)}</fieldset>)}
              </div>
              {copyStatus && <p className={`checklist-status${copyError ? " error" : ""}`} aria-live="polite">{copyStatus}</p>}
            </div>
          </section>
        </article>

        <section className="start-play-cta" aria-labelledby="start-play-title">
          <div>
            <h2 id="start-play-title">Put your first play to work.</h2>
            <p>Enter your website to build your buyer profile in PumpGTM. Review the people and messages before you launch.</p>
          </div>
          <form action={runPlayUrl} className="start-play-form" method="get">
            <label className="sr-only" htmlFor="company-source">Company website or work email</label>
            <input id="company-source" name="source" placeholder="yourcompany.com or you@company.com" type="text" />
            <button type="submit">Find Buyers <ArrowIcon /></button>
            <p><span>Y</span> Backed by Y Combinator</p>
          </form>
        </section>

        <section className="closing" aria-label="Share this play"><p>Do not message everyone in the comments. Message the few people you have a real reason to talk to.</p><button className="share-button" onClick={sharePage} type="button">Share this play</button></section>
      </main>

      <footer className="site-footer"><div className="footer-row"><a className="footer-brand" href="https://pumpgtm.com"><Image alt="" height={30} src="/pumpgtm-mark.webp" width={30} />PumpGTM</a><p>Find buyers and start conversations from your own accounts.</p></div></footer>
    </div>
  );
}
