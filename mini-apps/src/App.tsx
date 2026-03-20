import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useMemo, useState } from "react";
import {
  PaymentModal,
  Chains,
  usePaymentModal,
  type Chain,
} from "@chainrails/react";
import { useConfig } from "wagmi";

const AMOUNT = "0.1";

function isValidRecipient(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

function App() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  const wagmiConfig = useConfig();

  const [recipient, setRecipient] = useState(
    "0xda3ecb2e5362295e2b802669dd47127a61d9ce54",
  );
  const [token, setToken] = useState("USDC");
  const [destinationChain, setDestinationChain] = useState<Chain>("BASE");
  const [isLoading, setIsLoading] = useState(false);

  const isRecipientValid = useMemo(
    () => isValidRecipient(recipient),
    [recipient],
  );

  const cr = usePaymentModal({
    sessionToken: null,
    amount: AMOUNT,
    onCancel: () => {
      alert("Payment Cancelled");
    },
    onSuccess: (result?: { transactionHash?: string }) => {
      console.log(result);
      alert(
        `Payment Successful\nTransaction Hash: ${result?.transactionHash ?? "n/a"}\n`,
      );
    },
    farcasterMiniApp: true,
    wagmiConfig,
  });

  async function pay() {
    if (!isRecipientValid) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/create-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destinationChain,
            token,
            recipient: recipient,
            amount: AMOUNT,
          }),
        },
      );
      const data: any = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error ?? `Request failed (${response.status})`);
      }
      if (!data.sessionToken) {
        throw new Error(
          "Failed to create payment session (missing sessionToken).",
        );
      }
      cr.updateSession(data);
      cr.open();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ padding: 12, maxWidth: 420 }}>
      <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 12 }}>
        Mini demo: pay with Chainrails
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>Recipient</div>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "transparent",
              color: "inherit",
            }}
          />
          {!isRecipientValid && recipient.length > 0 ? (
            <div style={{ fontSize: 12, color: "#ffb4b4" }}>
              Invalid address
            </div>
          ) : null}
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>Token</div>
          <select
            value={String(token)}
            onChange={(e) => setToken(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "transparent",
              color: "inherit",
            }}
          >
            <option value="USDC">USDC</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>Destination Chain</div>
          <select
            value={destinationChain}
            onChange={(e) => setDestinationChain(e.target.value as Chain)}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "transparent",
              color: "inherit",
            }}
          >
            {Object.keys(Chains).map((c) => (
              <option value={c} key={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={pay}
          disabled={!isRecipientValid || isLoading}
          style={{
            marginTop: 2,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.06)",
            color: "inherit",
            cursor: !isRecipientValid || isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Opening..." : "Pay with Chainrails"}
        </button>
      </div>

      <PaymentModal {...cr} isPending={isLoading} />
    </div>
  );
}

export default App;
