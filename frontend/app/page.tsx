import { redirect } from "next/navigation";

export default function Page() {
  if (process.env.NODE_ENV === "production") {
    redirect("/home");
  }

  // In development, show a simple landing page
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Ayodhya Tourism</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Discover the sacred city with ease
        </p>
        <a
          href="/home"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Explore Ayodhya
        </a>
      </div>
    </div>
  );
}
