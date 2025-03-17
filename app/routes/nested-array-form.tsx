import {
  getFieldsetProps,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import { createUser } from "utils/db";
import { z } from "zod";
import type { Route } from "./+types/nested-array-form";
import { Form, Link, redirect } from "react-router";

const ContactsFieldSetSchema = z.object({
  mobile: z.string(),
  email: z.string().email().optional(),
  // mobile: z
  //   .string({ required_error: "mobile no. is required" })
  //   .min(10, "Must be a valid mobile number")
  //   .max(14, "Must be a valid mobile number"),
  // email: z
  //   .string({ required_error: "Email is required" })
  //   .email("Email is invalid"),
});

// export type ContactsFieldSet = z.infer<typeof ContactsFieldSetSchema>;

export const UserEditorSchema = z.object({
  name: z.string({ required_error: "age is required" }).min(5).max(30),
  age: z
    .number({
      required_error: "Age is required",
      invalid_type_error: "Age must be a number",
    })
    .gte(1, "Age must be greater than 1")
    .lte(120, "Age must be less than 120"),
  contacts: z.array(ContactsFieldSetSchema).max(3).optional(),
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  // Replace `Object.fromEntries()` with the parseWithZod helper
  const submission = parseWithZod(formData, { schema: UserEditorSchema });

  // Report the submission to client if it is not successful
  if (submission.status !== "success") {
    return submission.reply();
  }

  // const user = await createUser(submission.value);

  // console.log({ user });

  // // Return a form error if the message is not sent
  // if (!user) {
  //   return submission.reply({
  //     formErrors: ["Failed to send the message. Please try again later."],
  //   });
  // }

  return redirect("/user");
}

export default function Example({ actionData }: Route.ComponentProps) {
  const lastResult = actionData;
  const [form, fields] = useForm({
    // id: "address-form", // need to set the id for nested form objects
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: UserEditorSchema });
    },
    shouldValidate: "onBlur",
    constraint: getZodConstraint(UserEditorSchema),
    // shouldRevalidate: "onInput",
    defaultValue: {
      contacts: [{}],
    },
  });
  const contacts = fields.contacts.getFieldList();

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-500 flex items-center gap-2"
          >
            <span>←</span> Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Create User Profile
          </h1>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <Form method="POST" {...getFormProps(form)} className="space-y-6">
            <button type="submit" className="hidden" />
            <div className="space-y-4">
              <div>
                <label
                  htmlFor={fields.name.id}
                  className="block text-sm font-medium text-gray-700"
                >
                  Name:
                </label>
                <input
                  {...getInputProps(fields.name, { type: "text" })}
                  className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter full name"
                />
                <div
                  id={fields.name.errorId}
                  className="mt-1 text-sm text-red-600"
                >
                  {fields.name.errors}
                </div>
              </div>

              <div>
                <label
                  htmlFor={fields.age.id}
                  className="block text-sm font-medium text-gray-700"
                >
                  Age:
                </label>
                <input
                  {...getInputProps(fields.age, { type: "number" })}
                  className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div
                  id={fields.age.errorId}
                  className="mt-1 text-sm text-red-600"
                >
                  {fields.age.errors}
                </div>
              </div>
            </div>
            {/* Contacts Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Contact Information
                </h2>
                <button
                  {...form.insert.getButtonProps({
                    name: fields.contacts.name,
                  })}
                  className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500 border border-indigo-600 rounded-md hover:bg-indigo-50"
                >
                  + Add Contact
                </button>
              </div>

              <ul className="space-y-4">
                {contacts.map((contact, index) => {
                  const contactFields = contact.getFieldset();
                  return (
                    <li
                      key={contact.key}
                      {...getFieldsetProps(contact)}
                      className="p-4 border border-gray-200 rounded-lg space-y-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">
                          Contact #{index + 1}
                        </h3>
                        <button
                          {...form.remove.getButtonProps({
                            name: fields.contacts.name,
                            index,
                          })}
                          className="text-red-600 hover:text-red-500 text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor={contactFields.mobile.id}
                            className="block text-sm font-medium text-gray-700"
                          >
                            Mobile:
                          </label>
                          <input
                            {...getInputProps(contactFields.mobile, {
                              type: "text",
                            })}
                            className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter mobile number"
                          />
                          <div
                            id={contactFields.mobile.errorId}
                            className="mt-1 text-sm text-red-600"
                          >
                            {contactFields.mobile.errors}
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor={contactFields.email.id}
                            className="block text-sm font-medium text-gray-700"
                          >
                            Email:
                          </label>
                          <input
                            {...getInputProps(contactFields.email, {
                              type: "email",
                            })}
                            className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter email address"
                          />
                          <div
                            id={contactFields.email.errorId}
                            className="mt-1 text-sm text-red-600"
                          >
                            {contactFields.email.errors}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div id={form.errorId} className="text-sm text-red-600">
              {form.errors}
            </div>
            <button className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
              Save Profile
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
