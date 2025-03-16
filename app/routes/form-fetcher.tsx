import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { data, Link, redirect, useFetcher } from "react-router";
import { z } from "zod";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { dummyAsyncCheck, sendMessage } from "utils/db";
import type { Route } from "./+types/form-fetcher";

export const msgSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Email is invalid"),
  message: z
    .string({ required_error: "Message is required" })
    .min(10, "Message is too short")
    .max(100, "Message is too long"),
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    schema: msgSchema.superRefine(async (data, ctx) => {
      const message = await dummyAsyncCheck(data.email);
      if (!message) {
        ctx.addIssue({
          // path specifies the field in error
          // If omitted then it is considered as form error
          path: ["email"],
          code: z.ZodIssueCode.custom,
          message: "Email already exists(dummy error check)",
        });
        return;
      }
    }),
    async: true,
  });

  // This has already been done at the client side
  // const submission = parseWithZod(formData, { schema });
  if (submission.status !== "success") {
    return data(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const message = await sendMessage(submission.value);

  if (!message.sent) {
    return data({
      result: submission.reply({
        formErrors: ["Failed to send the message. Please try again later."],
      }),
    });
  }

  return redirect("/messages");
}

export default function Index() {
  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    lastResult: fetcher.data?.result,
    constraint: getZodConstraint(msgSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: msgSchema });
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-500 flex items-center gap-2"
          >
            <span>←</span> Back to Home
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Fetcher Form</h2>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <p className="mb-6 text-sm text-gray-600">
            This form is implemented using fetcher
          </p>

          <fetcher.Form
            method="POST"
            {...getFormProps(form)}
            action="/send-message"
            className="space-y-6"
          >
            <div className="space-y-1">
              <label
                htmlFor={fields.email.id}
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                {...getInputProps(fields.email, { type: "email" })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                placeholder="Enter your email"
              />
              <div id={fields.email.errorId} className="text-sm text-red-600">
                {fields.email.errors}
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor={fields.message.id}
                className="block text-sm font-medium text-gray-700"
              >
                Message
              </label>
              <textarea
                {...getTextareaProps(fields.message)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out min-h-[120px]"
                placeholder="Type your message here..."
              />
              <div id={fields.message.errorId} className="text-sm text-red-600">
                {fields.message.errors}
              </div>
            </div>

            <div id={form.errorId} className="text-sm text-red-600">
              {form.errors}
            </div>

            <button className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
              Send Message
            </button>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        403: () => <p>Yeah(403), you cant be here...</p>,
        400: () => <p>Yeah(400), you cant be here...</p>,
      }}
    />
  );
}
