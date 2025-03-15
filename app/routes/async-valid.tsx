import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { dummyAsyncCheck, sendMessage } from "utils/db";
import { z } from "zod";
import type { Route } from "./+types/async-valid";
import { data, Form, Link, redirect } from "react-router";

const schema = z.object({
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
    schema: schema.superRefine(async (data, ctx) => {
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

export default function Index({ actionData }: Route.ComponentProps) {
  const lastResult = actionData;

  const [form, fields] = useForm({
    lastResult: lastResult?.result,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
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
          <h2 className="text-2xl font-bold text-gray-900">Send Message</h2>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <Form method="POST" {...getFormProps(form)} className="space-y-6">
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
          </Form>
        </div>
      </div>
    </div>
  );
}
