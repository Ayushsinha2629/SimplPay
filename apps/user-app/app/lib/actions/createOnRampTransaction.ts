"use server";

import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

export async function createOnRampTransaction(provider: string, amount: number) {
    //Idally the token should come from the banking provider (hdfc/Axis)
    // const token = await axios.get("https;//api.hdfcbank.com/getToken", {
    //     amount: 
    // })
    const session = await getServerSession(authOptions)
    if(!session?.user || !session.user?.id ){
        return{
            message: "Unauthorized request"
        }
    }

    const token =  (Math.random() * 1000).toString();
    await prisma.onRampTransaction.create({
        data: {
            provider,
            status: "Processing",
            startTime: new Date(),
            token: token,
            userId: Number(session?.user?.id),
            amount: amount * 100 
        }
    })

}