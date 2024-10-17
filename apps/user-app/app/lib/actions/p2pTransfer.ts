"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function p2pTransfer(to: string, amount: number) {
    const session = await getServerSession(authOptions)
    if(!session?.user || !session.user?.id ){
        return{
            message: "Unauthorized request"
        }
    }

    const toUser = await prisma.user.findFirst({
        where: {
            number: to
        }
    })

    if(!toUser){
        return{
            message: "User not Found"
        }
    }
    await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(session.user?.id)} FOR UPDATE`;

        const fromBalance = await tx.balance.findUnique({
            where: { userId: Number(session.user?.id) },
          });
          if (!fromBalance || fromBalance.amount < amount) {
            throw new Error('Insufficient funds');
          }

          await tx.balance.update({
            where: { userId: Number(session.user?.id) },
            data: { amount: { decrement: amount } },
          });

          await tx.balance.update({
            where: { userId: toUser.id },
            data: { amount: { increment: amount } },
          });

          await tx.p2pTransfer.create({
            data: {
                fromUserId: Number(session.user?.id),
                toUserId: toUser.id,
                amount: amount,
                timestamp: new Date()
            }
          })
    });
}