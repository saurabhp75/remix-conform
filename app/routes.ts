import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("messages", "routes/messages.tsx"),
  route("without-conform", "routes/without-conform.tsx"),
  route("regular-form", "routes/regular-form.tsx"),
  route("array-form", "routes/array-form.tsx"),
  route("user", "routes/user.tsx"),
  route("nested-form", "routes/nested-form.tsx"),
  route("addresses", "routes/addresses.tsx"),
  route("nested-array-form", "routes/nested-array-form.tsx"),
  route("async-valid", "routes/async-valid.tsx"),
  route("form-fetcher", "routes/form-fetcher.tsx"),
  route("todos", "routes/todos.tsx"),
  route("send-message", "routes/send-message.tsx"),
] satisfies RouteConfig;
