import { Link } from "react-router";
import { prisma } from "utils/db";
import type { Route } from "./+types/user";

export async function loader() {
  const users = await prisma.user.findMany({
    include: {
      contacts: true,
    },
  });

  return { users };
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>
        <ol className="space-y-4">
          {data.users.map((user) => (
            <li
              key={user.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-gray-600">
                    Name:{" "}
                    <span className="text-gray-900 font-medium">
                      {user.name}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    Age:{" "}
                    <span className="text-gray-900 font-medium">
                      {user.age}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Email(s):
                  </h3>
                  <ul className="space-y-2">
                    {user.contacts.map((contact) => (
                      <li key={contact.id} className="text-gray-600">
                        {contact.email}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
