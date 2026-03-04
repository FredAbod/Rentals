import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe/stripe";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    redirect("/");
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      return (
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h1 className="text-3xl font-bold text-accent mb-4">
            Payment Successful!
          </h1>
          <p className="text-white/80 max-w-lg mx-auto mb-8">
            Thank you for your booking! Your event rentals have been secured.
            You will receive an email confirmation shortly detailing your
            booking and delivery window.
          </p>
          <a
            href="/"
            className="inline-block rounded-full bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
          >
            Return Home
          </a>
        </div>
      );
    }

    // Fallback if not paid or metadata is missing
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Processing...</h1>
        <p className="text-white/60">
          Your payment is being processed or could not be verified.
        </p>
      </div>
    );
  } catch (error) {
    console.error("Error finalizing success page:", error);
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          Session Expired
        </h1>
        <p className="text-white/70">
          We could not verify your session. Please contact support if you
          believe you were charged.
        </p>
      </div>
    );
  }
}
