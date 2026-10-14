import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-redirect">
      <p>PumpGTM playbook</p>
      <h1>Find a reason to start the conversation.</h1>
      <Link href="/playbooks/steal-your-competitors-audience">
        Open the competitor audience play →
      </Link>
    </main>
  );
}
