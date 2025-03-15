import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { data, Link, redirect, useFetcher } from "react-router";
import { z } from "zod";
// import { action } from "./send-message";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { dummyAsyncCheck, sendMessage } from "utils/db";
import type { Route } from "./+types/form-resource";

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
    <div>
      <div>
        <Link to="/">Home</Link>
      </div>
      <div>
        <p>
          This form is implemented using fetcher, which post on a different
          route
        </p>
      </div>
      <fetcher.Form
        method="POST"
        {...getFormProps(form)}
        action="/send-message"
      >
        <div>
          <label htmlFor={fields.email.id}>Email</label>
          <input {...getInputProps(fields.email, { type: "email" })} />
          <div id={fields.email.errorId}>{fields.email.errors}</div>
        </div>
        <div>
          <label htmlFor={fields.message.id}>Message</label>
          <textarea {...getTextareaProps(fields.message)} />
          <div id={fields.message.errorId}>{fields.message.errors}</div>
        </div>
        <div id={form.errorId}>{form.errors}</div>
        <button>Send</button>
      </fetcher.Form>
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
