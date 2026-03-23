import { Button, Text, View } from "react-native";
import { PaymentModal, usePaymentModal } from "@chainrails/react-native";
import { useState } from "react";

export default function Index() {
  const [loading, setLoading] = useState(false);
  const cr = usePaymentModal({
    sessionToken: null,
    onCancel: () => {
      console.log("Payment Cancelled");
    },
    onSuccess: () => {
      console.log("Payment Successful");
    },
  });

  async function pay() {
    setLoading(true);
    const res = await fetch(
      `https://chainrails-sdk-server.vercel.app/test/create-session?amount=0&destinationChain=BASE&recipient=0xda3ecb2e5362295e2b802669dd47127a61d9ce54&token=USDC`,
    );
    const data = await res.json();
    cr.updateSession(data);
    cr.open();
    setLoading(false);
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Text>Hii, stranger</Text>
      <Button onPress={pay} title={loading ? "Loading..." : "Buy me a Coffee"} />
      <PaymentModal {...cr} isPending={loading} />
    </View>
  );
}
