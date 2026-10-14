"use client";

import { type FormEvent, useMemo, useState } from "react";
import Image from "next/image";

type Choice = "research" | "context" | "skip";

type Signal = {
  observation: string;
  bestChoice: Choice;
  why: string;
};

const choices: Record<Choice, string> = {
  research: "Worth researching",
  context: "Need context",
  skip: "Skip",
};

const signals: Signal[] = [
  {
    observation: "A Head of Support asks how to reduce repeated onboarding tickets.",
    bestChoice: "research",
    why: "The role fits. The problem fits. You have a real thing to ask about before you write.",
  },
  {
    observation: "Someone simply likes the post.",
    bestChoice: "context",
    why: "A like does not tell you what they need, whether they own the problem, or why you should message them.",
  },
  {
    observation: "An agency selling helpdesk automation advertises its own service in the thread.",
    bestChoice: "skip",
    why: "They are selling into the same market. That is not a reason to treat them as a buyer.",
  },
];

const runPlayUrl =
  "https://pumpgtm.com/skills/message-linkedin-post-engagers?utm_source=lead_magnet&utm_medium=web&utm_campaign=competitor_audience";

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
  const [selectedChoices, setSelectedChoices] = useState<Record<number, Choice | undefined>>({});
  const [buyer, setBuyer] = useState("");
  const [problem, setProblem] = useState("");
  const [context, setContext] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [built, setBuilt] = useState(false);
  const [message, setMessage] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [copyError, setCopyError] = useState(false);

  const canBuild = buyer.trim().length >= 3 && problem.trim().length >= 3 && validHttpsUrl(postUrl);
  const urlIsInvalid = postUrl.trim().length > 0 && !validHttpsUrl(postUrl);
  const prompt = useMemo(() => buildPrompt(buyer, problem, context, postUrl), [buyer, problem, context, postUrl]);

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

  async function sharePage() {
    const shareData = {
      title: "Your next customers might be in your competitors' comments",
      text: "A short play for finding people worth talking to in a competitor's audience.",
      url: window.location.href,
    };
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
          <a className="brand" href="https://pumpgtm.com">
            <Image alt="" height={40} src="/pumpgtm-mark.webp" width={40} />
            <span>PumpGTM</span>
          </a>
          <div className="nav-links">
            <a href="https://pumpgtm.com/features">Features</a>
            <a href="https://pumpgtm.com/integrations">Integrations</a>
            <a href="https://pumpgtm.com/skills">Resources</a>
          </div>
          <a className="nav-cta" href={runPlayUrl}>Find Buyers <span>→</span></a>
          <button className="mobile-menu" type="button" aria-label="Open navigation">☰</button>
        </nav>
      </header>

      <main className="page-main">
        <a className="all-guides" href="https://pumpgtm.com/blog">← All guides</a>

        <article>
          <header className="playbook-hero">
            <div className="hero-copy-area">
              <h1>Your next customers might be in your competitors&apos; comments.</h1>
              <p className="deck">Most outbound starts with a list. This one starts with someone already talking about the problem you solve.</p>
              <a className="primary-button" href="#try-it">Try the 2-minute play <span className="button-icon">→</span></a>
              <p className="hero-meta"><strong>PumpGTM</strong><span>·</span><span>2 min read</span></p>
            </div>

            <aside className="video-mock" aria-label="Mock video walkthrough placeholder">
              <p className="video-mock-label">Mock walkthrough</p>
              <h2>Find the right few.</h2>
              <p>A short visual placeholder for the real product walkthrough.</p>
              <div className="video-stage">
                <button className="play-circle" type="button" aria-label="Mock video play button">▶</button>
                <small>Video placeholder · 1:12</small>
              </div>
            </aside>
          </header>

          <nav className="contents-nav" aria-label="In this playbook">
            <a href="#signal"><span>01</span>Spot a signal</a>
            <a href="#try-it"><span>02</span>Write the first line</a>
            <a href="#run"><span>03</span>Run the real play</a>
          </nav>

          <section className="article-section" id="signal" aria-labelledby="signal-title">
            <div className="article-column">
              <p className="section-kicker">Spot the signal</p>
              <h2 id="signal-title">Look for the problem, not the engagement.</h2>
              <p className="article-intro">You are not trying to message everyone under a post. You are looking for the few people with the right role, a real problem, and enough public context to write a useful first line.</p>

              <div className="example-context">
                <p>Illustrative example · Support software for Heads of Support at B2B SaaS companies</p>
                <blockquote>&quot;How are teams handling the same onboarding tickets every week?&quot;</blockquote>
              </div>
              <p className="illustrative-note">This is a teaching example, not an actual scraped comment.</p>

              <div className="signal-list">
                {signals.map((signal, index) => {
                  const selected = selectedChoices[index];
                  const isCorrect = selected === signal.bestChoice;
                  return (
                    <article className="signal-card" key={signal.observation}>
                      <h3>{signal.observation}</h3>
                      <p>What would you do next?</p>
                      <div className="choice-row" aria-label={`Choose a decision for example ${index + 1}`}>
                        {(Object.keys(choices) as Choice[]).map((choice) => (
                          <button className={`choice-button${selected === choice ? " selected" : ""}`} key={choice} onClick={() => setSelectedChoices((current) => ({ ...current, [index]: choice }))} type="button">
                            {choices[choice]}
                          </button>
                        ))}
                      </div>
                      {selected && <p className="signal-feedback" aria-live="polite"><strong>{isCorrect ? "That is the useful call. " : `Better call: ${choices[signal.bestChoice]}. `}</strong>{signal.why}</p>}
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="article-section" id="try-it" aria-labelledby="worksheet-title">
            <div className="article-column">
              <p className="section-kicker">Write the first line</p>
              <h2 id="worksheet-title">Make the first message useful.</h2>
              <p className="article-intro">Use their words. Check their role. Then write one short question. Nothing on this page sends, saves, or looks up a person.</p>

              <form className="worksheet" onSubmit={handleBuild}>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="buyer">Who do you sell to?</label>
                    <input id="buyer" maxLength={180} onChange={(event) => setBuyer(event.target.value)} placeholder="Heads of Support at B2B SaaS companies" value={buyer} />
                  </div>
                  <div className="field">
                    <label htmlFor="problem">What problem do you solve?</label>
                    <input id="problem" maxLength={180} onChange={(event) => setProblem(event.target.value)} placeholder="Repeat tickets during customer onboarding" value={problem} />
                  </div>
                  <div className="field full">
                    <label htmlFor="context">What did someone actually say?</label>
                    <textarea id="context" maxLength={600} onChange={(event) => setContext(event.target.value)} placeholder="Paste a short public comment or describe the public problem in your own words." value={context} />
                    <p className="input-note">Use public context only. Leave this empty and the draft keeps a visible placeholder.</p>
                  </div>
                  <div className="field full">
                    <label htmlFor="post-url">Public post URL <span>(optional, HTTPS)</span></label>
                    <input id="post-url" inputMode="url" maxLength={500} onChange={(event) => setPostUrl(event.target.value)} placeholder="https://www.linkedin.com/posts/..." value={postUrl} />
                    {urlIsInvalid && <p className="input-error">Add a complete HTTPS URL, or leave this field empty.</p>}
                  </div>
                </div>
                <div className="worksheet-actions">
                  <button className="primary-button" disabled={!canBuild} type="submit">Build my outreach starter <span className="button-icon">→</span></button>
                  <p>Buyer and problem are required. The source URL is optional.</p>
                </div>
              </form>

              {built && (
                <section className="output" aria-labelledby="draft-title">
                  <div className="output-header">
                    <p className="draft-label">Draft: review before sending</p>
                    <h3 id="draft-title">First-message starter</h3>
                    <p>Check the role and company first. A relevant comment is a starting point, not proof they want to buy.</p>
                  </div>
                  <textarea aria-label="Editable first-message draft" className="draft-area" maxLength={500} onChange={(event) => setMessage(event.target.value)} value={message} />
                  <div className="output-actions">
                    <button className="copy-button" onClick={() => copyText(message, "Message")} type="button">Copy message</button>
                    {copyStatus && <span className={`copy-status${copyError ? " error" : ""}`} aria-live="polite">{copyStatus}</span>}
                  </div>

                  <div className="prompt-wrap">
                    <p className="draft-label">PumpGTM handoff prompt</p>
                    <textarea aria-label="PumpGTM handoff prompt" className="prompt-area" readOnly value={prompt} />
                    <div className="output-actions">
                      <button className="copy-button" onClick={() => copyText(prompt, "Prompt")} type="button">Copy prompt for Claude</button>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </section>

          <section className="article-section" id="run" aria-labelledby="run-title">
            <div className="article-column">
              <p className="section-kicker">Run the real play</p>
              <h2 id="run-title">Review people before you reach out.</h2>
              <div className="run-grid">
                <ol className="steps">
                  <li>Pick a LinkedIn post or profile whose audience matches your buyer.</li>
                  <li>Use the post-engager workflow to review people who engaged.</li>
                  <li>Approve the recipients and messages before outreach. Handle the replies yourself.</li>
                </ol>
                <aside className="ui-placeholder" aria-label="Product workflow illustration">
                  <small>How review works</small>
                  <ol><li>Find post engagers</li><li>Review fit and context</li><li>Approve a draft</li></ol>
                  <p>Product screenshot intentionally omitted until an approved capture is available.</p>
                </aside>
              </div>
              <div className="cta-row">
                <a className="primary-button" href={runPlayUrl}>Run this play in PumpGTM <span className="button-icon">→</span></a>
                <button className="secondary-button" onClick={() => copyText(prompt, "Prompt")} type="button">Copy prompt for Claude</button>
              </div>
            </div>
          </section>
        </article>

        <section className="closing" aria-label="Share this play">
          <p>Do not message everyone in the comments. Message the few people you have a real reason to talk to.</p>
          <button className="share-button" onClick={sharePage} type="button">Share this play</button>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-row">
          <a className="footer-brand" href="https://pumpgtm.com"><Image alt="" height={30} src="/pumpgtm-mark.webp" width={30} />PumpGTM</a>
          <p>Find buyers and start conversations from your own accounts.</p>
        </div>
      </footer>
    </div>
  );
}
