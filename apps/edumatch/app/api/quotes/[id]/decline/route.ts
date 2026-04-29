import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/server/profiles";
import { handleEduError, badRequest, serverError } from "@/lib/server";
import { declineQuote, QuoteError } from "@/lib/server/quotes";

export const runtime = "nodejs";

/**
 * POST /api/quotes/[id]/decline
 *
 * Student declines a quote. The quote status becomes DECLINED,
 * but other quotes remain available for acceptance.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await requireStudent();
    const { id: quoteId } = await params;

    await declineQuote(quoteId, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof QuoteError) {
      return badRequest(error.message);
    }
    if (error instanceof Error && error.name === "EduAuthError") {
      return handleEduError("quotes/decline", error);
    }
    return serverError("quotes/decline", error);
  }
}
