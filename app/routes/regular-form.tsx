import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, Link, redirect } from "react-router";
import { sendMessage } from "utils/db";
import { z } from "zod";
import type { Route } from "./+types/regular-form";

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

  const submission = parseWithZod(formData, { schema });

  // Report the submission to client if it is not successful
  if (submission.status !== "success") {
    return submission.reply();
  }

  const message = await sendMessage(submission.value);

  // Return a form error if the message is not sent
  if (!message.sent) {
    return submission.reply({
      formErrors: ["Failed to send the message. Please try again later."],
    });
  }

  return redirect("/messages");
}

export default function Index({ actionData }: Route.ComponentProps) {
  const lastResult = actionData;

  // The useForm hook will return all the metadata we need to render the form
  // and focus on the first invalid field when the form is submitted
  const [form, fields] = useForm({
    // This not only sync the error sent from the server
    // But also used as the default value of the form
    // in case the document is reloaded for progressive enhancement
    // It is optional, but required if you are validating on the server
    lastResult,

    // (Optional) The initial value of the form.
    // defaultValue,

    // Derive html validation attributes for each field
    constraint: getZodConstraint(schema),

    // When to validate, default is 'onSubmit'
    // shouldValidate: "onBlur", // "onSubmit"|"onBlur"|"onInput"

    // When to re-validate each field after it is validated,
    // defaults to value of shouldValidate
    // shouldRevalidate: "onInput", // "onSubmit"|"onBlur"|"onInput"

    // Enable client side validation. Fallback to server validation if not provided
    // Run this funtion when the form is (re)validated. TODO: Check if it disbales
    // server validation
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },

    // called before form is submitted. If onValidate is set,
    // it will be called only if client validation passes
    // onSubmit()
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="mb-6">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
        <Form
          method="POST"
          {...getFormProps(form)}
          className="bg-white shadow-md rounded-lg p-6 space-y-6"
        >
          <div className="space-y-2">
            <label
              htmlFor={fields.email.id}
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              {...getInputProps(fields.email, { type: "email" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
            />
            <div id={fields.email.errorId} className="text-red-600 text-sm">
              {fields.email.errors}
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor={fields.message.id}
              className="block text-sm font-medium text-gray-700"
            >
              Message
            </label>
            <textarea
              {...getTextareaProps(fields.message)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
            />
            <div id={fields.message.errorId} className="text-red-600 text-sm">
              {fields.message.errors}
            </div>
          </div>
          <div id={form.errorId} className="text-red-600 text-sm">
            {form.errors}
          </div>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
            Send
          </button>
        </Form>
      </div>
    </div>
  );
}
