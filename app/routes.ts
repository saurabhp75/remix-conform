import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("messages", "routes/messages.tsx"),
  route("without-conform", "routes/without-conform.tsx"),
  route("regular-form", "routes/regular-form.tsx"),
] satisfies RouteConfig;
