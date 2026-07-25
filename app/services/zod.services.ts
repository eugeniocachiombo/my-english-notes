import { NextResponse } from "next/server";

export const errorZodMessages = (error: any) => {
    return NextResponse.json(
        {
            errors: error.issues.map((e:any) => ({
                [e.path.join("")]: e.message
            }))
        },
        { status: 422 }
    );
}