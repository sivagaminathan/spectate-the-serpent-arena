import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Snake" },
      { name: "description", content: "Create a snake account and join the leaderboard." },
      { property: "og:title", content: "Sign up — Snake" },
      { property: "og:description", content: "Create a snake account." },
    ],
  }),
  component: () => <AuthForm kind="signup" />,
});
