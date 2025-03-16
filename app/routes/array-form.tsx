import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import type { Route } from "./+types/array-form";
import { Form, Link, redirect } from "react-router";
import { createUser } from "utils/db";

export const UserSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(5).max(30),
  age: z
    .number({
      required_error: "Age is required",
      invalid_type_error: "Age must be a number",
    })
    .gte(1, "Age must be greater than 1")
    .lte(120, "Age must be less than 120"),
  emails: z.array(z.string().email("Invalid email")),
});

export type UserType = z.infer<typeof UserSchema>;

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: UserSchema });

  // Report the submission to client if it is not successful
  if (submission.status !== "success") {
    return submission.reply();
  }
  const user = createUser(submission.value);
  // Return a form error if the message is not sent
  if (!user) {
    console.log("*** Failed to send the message ***");

    return submission.reply({
      formErrors: ["Failed to send the message. Please try again later."],
    });
  }

  return redirect("/user");
}

export default function Example({ actionData }: Route.ComponentProps) {
  const lastResult = actionData;
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: UserSchema });
    },
    shouldValidate: "onBlur",
    constraint: getZodConstraint(UserSchema),
    defaultValue: {
      emails: [""],
    },
  });
  const emails = fields.emails.getFieldList();

  // Remove warning(see below), by undefining the key prop in the input
  // Warning: A props object containing a "key" prop is being spread into JSX:
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
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
          <button type="submit" className="hidden" />
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Array form</h1>

          <div className="space-y-2">
            <label
              htmlFor={fields.name.id}
              className="block text-sm font-medium text-gray-700"
            >
              Name:
            </label>
            <input
              {...getInputProps(fields.name, { type: "text" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              autoFocus
            />
            <div id={fields.name.errorId} className="text-red-600 text-sm">
              {fields.name.errors}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={fields.age.id}
              className="block text-sm font-medium text-gray-700"
            >
              Age:
            </label>
            <input
              {...getInputProps(fields.age, { type: "number" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
            <div id={fields.age.errorId} className="text-red-600 text-sm">
              {fields.age.errors}
            </div>
          </div>

          <div className="space-y-4">
            <ul className="space-y-4">
              {emails.map((email, index) => (
                <li key={email.key} className="flex items-center gap-2">
                  <div className="flex-1 space-y-2">
                    <label
                      htmlFor={email.id}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {`Email #${index + 1}:`}
                    </label>
                    <input
                      {...getInputProps(email, { type: "text" })}
                      key={undefined}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                    <div
                      id={fields.emails.errorId}
                      className="text-red-600 text-sm"
                    >
                      {fields.emails.errors}
                    </div>
                  </div>
                  <button
                    {...form.remove.getButtonProps({
                      name: fields.emails.name,
                      index,
                    })}
                    className="mt-6 px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-4">
              <button
                {...form.insert.getButtonProps({
                  name: fields.emails.name,
                })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Add contact
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Submit
              </button>
            </div>
          </div>

          <div id={form.errorId} className="text-red-600 text-sm mt-4">
            {form.errors}
          </div>
        </Form>
      </div>
    </div>
  );
}
