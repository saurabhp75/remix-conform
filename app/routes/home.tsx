import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Conform guide" },
    { name: "description", content: "Tutorial on Conform form Library" },
  ];
}

export default function Home() {
  return (
    <>
      <div className="text-lg font-bold mb-4">Form examples:</div>
      <ul className="list-disc pl-5">
        <li className="mb-2">
          <p>
            <Link
              to="without-conform"
              className="text-blue-500 hover:underline"
            >
              Form without conform
            </Link>
          </p>
        </li>
        <li className="mb-2">
          <p>
            <Link to="regular-form" className="text-blue-500 hover:underline">
              Regular form
            </Link>
          </p>
        </li>
        <li className="mb-2">
          <p>
            <Link to="array-form" className="text-blue-500 hover:underline">
              Array form
            </Link>
          </p>
        </li>
        <li className="mb-2">
          <p>
            <Link to="nested-form" className="text-blue-500 hover:underline">
              Nested object form
            </Link>
          </p>
        </li>
        <li className="mb-2">
          <p>
            <Link
              to="nested-array-form"
              className="text-blue-500 hover:underline"
            >
              Nested array form
            </Link>
          </p>
        </li>
        <li className="mb-2">
          <p>
            <Link to="async-valid" className="text-blue-500 hover:underline">
              Async validation
            </Link>
          </p>
        </li>
        <li className="mb-2">
          <p>
            <Link to="form-fetcher" className="text-blue-500 hover:underline">
              Form action in other(resource) route
            </Link>
          </p>
        </li>
        <li className="mb-2">
          <p>
            <Link to="todos" className="text-blue-500 hover:underline">
              To Do
            </Link>
          </p>
        </li>
      </ul>
    </>
  );
}
