import { prisma } from "utils/db";
import type { Route } from "./+types/addresses";
import { Link } from "react-router";

export async function loader() {
  const addresses = await prisma.address.findMany();

  return { addresses };
}

export default function Messages({ loaderData }: Route.ComponentProps) {
  const data = loaderData;
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-500 flex items-center gap-2"
          >
            <span>←</span> Back to Home
          </Link>
          
        </div>
        <ul className="bg-white rounded-xl shadow-lg divide-y divide-gray-200">
          {data.addresses.map((address) => (
            <li
              key={address.id}
              className="p-6 hover:bg-gray-50 transition duration-150 ease-in-out"
            >
              <div className="flex flex-col gap-1">
                <p className="text-lg font-medium text-gray-900">
                  {address.street}
                </p>
                <div className="text-sm text-gray-500">
                  {address.city}, {address.zipcode}
                </div>
                <div className="text-sm text-gray-500">{address.country}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
