import { Link } from "react-router";
import { prisma } from "utils/db";
import type { Route } from "./+types/messages";

export async function loader() {
  const messages = await prisma.message.findMany();

  return { messages };
}

export default function Messages({loaderData}: Route.ComponentProps) {
  // const data = useLoaderData<typeof loader>();
  const data = loaderData;
  return (
    <div>
      <div className="mb-4">
        <Link to="/">Home</Link>
      </div>
      <h1>Messages</h1>
      <ul>
        {data.messages.map((message) => (
          <li key={message.id}>
            {message.title}: {message.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
