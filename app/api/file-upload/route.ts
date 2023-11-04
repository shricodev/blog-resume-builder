import { v4 as uuid4 } from "uuid";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect("/login");
  }
  const sentData = await req.formData();
  const file: File = sentData.get("userImage") as unknown as File;

  if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
    return NextResponse.json(
      {
        error: "Only png/jpg/jpeg files are allowed",
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.storage
    .from("resume-builder-gpt4-userprofile")
    .upload(user.id + "/" + uuid4(), file);

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  return NextResponse.json(data);
}
