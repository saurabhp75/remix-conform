import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { createAddress } from "utils/db";
import { z } from "zod";
import type { Route } from "./+types/nested-form";
import { Link, redirect } from "react-router";

// If form data has an entry ['tasks[0].content', 'Hello World'], the object constructed will become { tasks: [{ content: 'Hello World' }] }
const AddressFieldSetSchema = z.object({
  street: z
    .string({ required_error: "Street name is required" })
    .min(4, "Street name is too short")
    .max(25, "Street name is too long"),
  zipcode: z
    .string({ required_error: "zipcode is required" })
    .min(3, "zipcode is too short")
    .max(12, "zipcode too long"),
  city: z
    .string({ required_error: "city name is required" })
    .min(5, "city name is too short")
    .max(25, "city name too long"),
  country: z
    .string({ required_error: "country name is required" })
    .min(5, "country name is too short")
    .max(25, "country name too long"),
});

export const AddressSchema = z.object({
  address: AddressFieldSetSchema,
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  // Replace `Object.fromEntries()` with the parseWithZod helper
  const submission = parseWithZod(formData, { schema: AddressSchema });

  // Report the submission to client if it is not successful
  if (submission.status !== "success") {
    return submission.reply();
  }

  const address = await createAddress(submission.value);

  console.log({ address });

  // Return a form error if the message is not sent
  if (!address) {
    console.log("*** Failed to send the message ***");

    return submission.reply({
      formErrors: ["Failed to send the message. Please try again later."],
    });
  }

  return redirect("/addresses");
}

export default function Example({ actionData }: Route.ComponentProps) {
  const lastResult = actionData;

  const [form, fields] = useForm({
    id: "address-form", // need to set the id for nested form objects
    lastResult,
    constraint: getZodConstraint(AddressSchema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: AddressSchema });
    },
  });

  const address = fields.address.getFieldset();

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
          <h2 className="text-2xl font-bold text-gray-900">Add New Address</h2>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <form method="POST" {...getFormProps(form)} className="space-y-8">
            <fieldset className="border-2 border-gray-200 rounded-lg p-6 space-y-6">
              <legend className="text-lg font-semibold text-gray-900 px-2 bg-white -ml-2">
                Address Details
              </legend>
              <div className="grid gap-6">
                {/* Street Input */}
                <div className="space-y-1">
                  <label
                    htmlFor={address.street.id}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Street Address
                  </label>
                  <input
                    {...getInputProps(address.street, { type: "text" })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    placeholder="Enter street address"
                  />
                  <div
                    id={address.street.errorId}
                    className="text-sm text-red-600"
                  >
                    {address.street.errors}
                  </div>
                </div>

                {/* Two Column Layout for Zipcode and City */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label
                      htmlFor={address.zipcode.id}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Zipcode
                    </label>
                    <input
                      {...getInputProps(address.zipcode, { type: "text" })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                      placeholder="Enter zipcode"
                    />
                    <div
                      id={address.zipcode.errorId}
                      className="text-sm text-red-600"
                    >
                      {address.zipcode.errors}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor={address.city.id}
                      className="block text-sm font-medium text-gray-700"
                    >
                      City
                    </label>
                    <input
                      {...getInputProps(address.city, { type: "text" })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                      placeholder="Enter city"
                    />
                    <div
                      id={address.city.errorId}
                      className="text-sm text-red-600"
                    >
                      {address.city.errors}
                    </div>
                  </div>
                </div>

                {/* Country Input */}
                <div className="space-y-1">
                  <label
                    htmlFor={address.country.id}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country
                  </label>
                  <input
                    {...getInputProps(address.country, { type: "text" })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    placeholder="Enter country"
                  />
                  <div
                    id={address.country.errorId}
                    className="text-sm text-red-600"
                  >
                    {address.country.errors}
                  </div>
                </div>
              </div>
              <div id={form.errorId} className="text-sm text-red-600">
                {form.errors}
              </div>
            </fieldset>
            <button className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
              Save Address
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
