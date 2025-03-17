import { remember } from "@epic-web/remember";
import { PrismaClient } from "@prisma/client";
import type { UserType } from "~/routes/array-form";

export const prisma = remember("prisma", () => {
  // NOTE: if you change anything in this function you'll need to restart
  // the dev server to see your changes.
  const client = new PrismaClient();
  client.$connect();
  return client;
});

type SendMessageParams = { email: string; message: string };

export async function sendMessage(
  data: SendMessageParams
): Promise<{ sent: string | null }> {
  const win = Math.random() > 0.5;
  if (win) return { sent: null };

  const post = await prisma.message.create({
    data: { title: data.email, content: data.message },
  });

  return { sent: post.title };
}

type CreateAddressParams = {
  address: {
    street: string;
    zipcode: string;
    city: string;
    country: string;
  };
};

export async function createAddress(data: CreateAddressParams) {
  const win = Math.random() > 0.5;

  if (win) return null;

  const address = await prisma.address.create({
    data: {
      street: data.address.street,
      zipcode: data.address.zipcode,
      city: data.address.city,
      country: data.address.country,
    },
  });

  return address;
}

export async function createUser(data: UserType) {
  const win = Math.random() > 0.5;

  if (win) {
    console.log("### Something went wrong ###");
    return null;
  }

  if (!data.emails) {
    console.log("### No contacts ###");
    return null;
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        age: data.age,
        contacts: {
          create: data.emails.map((email) => ({
            email,
          })),
        },
      },
    });

    return user;
  } catch (e) {
    console.log("Error inserting user in db");
    return null;
  }
}

export async function dummyAsyncCheck(msg: string) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const returnString = Math.random() < 0.5;
      resolve(returnString ? msg : null);
    }, 500);
  });
}
