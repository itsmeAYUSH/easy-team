import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Welcome to Easy Team</h1>
      <div>
        <Link href="/login">Login</Link>
      </div>
      <div>
        <Link href="/signup">Sign Up</Link>
      </div>
    </div>
  );
}