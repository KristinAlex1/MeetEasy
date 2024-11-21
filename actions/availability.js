"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getUserAvailability() {
    const { userId } = auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
        include: {
            availability: {
                include: {days: true },
            },
        },
    });

    if(!user || !user.availability) {
        return null;
    }

    const availabilityData = {
        timeGap: user.availability.timeGap,
    };


    [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ].forEach((day) => {
        user.availability.days.find((d) => d.day === day.toUpperCase());

        availabilityData[data]={
            isAvailable : !!dayAvailability,
            startTime: dayAvailability
                ?dayAvailability.startTime.toISOString().slice(11,16):"09:00",
            endTime: dayAvailability
                ?dayAvailability.endTime.toISOString().slice(11,16):"17:00",
        };
    })
    return availabilityData;
}