import { NextResponse } from "next/server";

export const errorZodMessages = (error: any) => {
    return NextResponse.json(
        {
            errors: error.issues.map((e:any) => ({
                path: e.path,
                message: e.message
            }))
        },
        { status: 422 }
    );
}