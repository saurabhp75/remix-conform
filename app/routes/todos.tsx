import {
  useForm,
  getFormProps,
  getInputProps,
  getFieldsetProps,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import type { Route } from "./+types/todos";
import { Form, Link, redirect } from "react-router";

const taskSchema = z.object({
  content: z.string(),
  completed: z.boolean().optional(),
});

const todosSchema = z.object({
  title: z.string(),
  tasks: z.array(taskSchema).nonempty(),
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: todosSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  return redirect(`/?value=${JSON.stringify(submission.value)}`);
}

export default function Example({ actionData }: Route.ComponentProps) {
  const lastResult = actionData;
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: todosSchema });
    },
    shouldValidate: "onBlur",
  });
  const tasks = fields.tasks.getFieldList();

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
          <h1 className="text-2xl font-bold text-gray-900">Todo List</h1>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <Form method="post" {...getFormProps(form)} className="space-y-6">
            <button type="submit" className="hidden" />
            <div className="space-y-1">
              <label
                htmlFor={fields.title.id}
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                {...getInputProps(fields.title, { type: "text" })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter list title"
              />
              <div className="text-sm text-red-600">{fields.title.errors}</div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
                <button
                  {...form.insert.getButtonProps({ name: fields.tasks.name })}
                  className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500 border border-indigo-600 rounded-md hover:bg-indigo-50"
                >
                  + Add Task
                </button>
              </div>
              <div className="text-sm text-red-600">{fields.tasks.errors}</div>

              <ul className="space-y-4">
                {tasks.map((task, index) => {
                  const taskFields = task.getFieldset();
                  return (
                    <li
                      key={task.key}
                      {...getFieldsetProps(task)}
                      className="p-4 border border-gray-200 rounded-lg space-y-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">
                          Task #{index + 1}
                        </h3>
                        <div className="flex items-center gap-2">
                          <button
                            {...form.reorder.getButtonProps({
                              name: fields.tasks.name,
                              from: index,
                              to: 0,
                            })}
                            className="text-sm text-gray-600 hover:text-gray-900"
                          >
                            ↑ Top
                          </button>
                          <button
                            {...form.remove.getButtonProps({
                              name: fields.tasks.name,
                              index,
                            })}
                            className="text-red-600 hover:text-red-500 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <input
                            {...getInputProps(taskFields.content, {
                              type: "text",
                            })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter task description"
                          />
                          <div className="mt-1 text-sm text-red-600">
                            {taskFields.content.errors}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              {...getInputProps(taskFields.completed, {
                                type: "checkbox",
                              })}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Completed</span>
                          </label>
                          <button
                            {...form.update.getButtonProps({
                              name: task.name,
                              value: { content: "" },
                            })}
                            className="text-sm text-gray-600 hover:text-gray-900"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <button className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
              Save Todo List
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
