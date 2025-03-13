import { Link } from "react-router";
import { prisma } from "utils/db";
import type { Route } from "./+types/messages";

export async function loader() {
  const messages = await prisma.message.findMany();
  return { messages };
}

export default function Messages({ loaderData }: Route.ComponentProps) {
  const data = loaderData;
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
        <ul className="space-y-4">
          {data.messages.map((message) => (
            <li
              key={message.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <span className="font-medium text-gray-900">{message.title}</span>
              <span className="text-gray-600 ml-2">{message.content}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
