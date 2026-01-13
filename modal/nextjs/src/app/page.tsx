"use client";

import { chains, PaymentModal, tokens, usePaymentSession } from "@chainrails/react";

export default function Home() {
  const cr = usePaymentSession({
    session_url: `${process.env.NEXT_PUBLIC_API_URL}/api/create-session`,
    destinationChain: chains.BASE,
    token: tokens.USDC,
    recipient: "0x4F41BCf288E718A36c1e6919c2Dfc2E07d51c675",
    amount: 1,
  });

  return (
    <main>
      <div>
        <h1>Chainrails Demo</h1>
      </div>
      <h2>
        <button onClick={cr.open}>Pay</button>
      </h2>

      <PaymentModal {...cr} />
    </main>
  );
}
