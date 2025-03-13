import { Form, redirect } from "react-router";
import { sendMessage } from "utils/db";
import { z } from "zod";
import type { Route } from "./+types/without-conform";

const schema = z.object({
  // The preprocess step is required for zod to perform the required check properly
  // As the value of an empty input is an usually an empty string
  email: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string({ required_error: "Email is required" }).email("Email is invalid")
  ),
  message: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string({ required_error: "Message is required" })
      .min(10, "Message is too short")
      .max(100, "Message is too long")
  ),
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  // Construct an object using `Object.fromEntries`
  const payload = Object.fromEntries(formData);
  // Then parse it with zod
  const result = schema.safeParse(payload);

  // Return the error to the client if the data is not valid
  if (!result.success) {
    const error = result.error.flatten();

    return {
      payload,
      formErrors: error.formErrors,
      fieldErrors: error.fieldErrors,
    };
  }

  const message = await sendMessage(result.data);

  // Return a form error if the message is not sent
  if (!message.sent) {
    return {
      payload,
      formErrors: ["Failed to send the message. Please try again later."],
      fieldErrors: {},
    };
  }

  return redirect("/messages");
}

export default function Index({ actionData }: Route.ComponentProps) {
  const result = actionData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <Form
          method="POST"
          className="bg-white shadow-md rounded-lg p-6 space-y-6"
          aria-invalid={result?.formErrors ? true : undefined}
          aria-describedby={result?.formErrors ? "contact-error" : undefined}
        >
          <div id="contact-error" className="text-red-600 text-sm">
            {result?.formErrors}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="contact-email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              name="email"
              defaultValue={result?.payload.email as string}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
              aria-invalid={result?.fieldErrors.email ? true : undefined}
              aria-describedby={
                result?.fieldErrors.email ? "contact-email-error" : undefined
              }
            />
            <div id="contact-email-error" className="text-red-600 text-sm">
              {result?.fieldErrors.email}
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="contact-message"
              className="block text-sm font-medium text-gray-700"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              defaultValue={result?.payload.message as string}
              required
              minLength={10}
              maxLength={100}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
              aria-invalid={result?.fieldErrors.message ? true : undefined}
              aria-describedby={
                result?.fieldErrors.message
                  ? "contact-email-message"
                  : undefined
              }
            />
            <div id="contact-email-message" className="text-red-600 text-sm">
              {result?.fieldErrors.message}
            </div>
          </div>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
            Send
          </button>
        </Form>
      </div>
    </div>
  );
}
