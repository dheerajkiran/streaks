import { ChatPanel } from "@/components/ChatPanel";

const USER_NAME = "Dheeraj";

export default function NewChatPage() {
  return (
    <div className="max-w-3xl mx-auto md:h-full">
      <ChatPanel messages={[]} name={USER_NAME} />
    </div>
  );
}
