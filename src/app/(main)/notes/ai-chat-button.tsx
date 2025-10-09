"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuthToken } from "@convex-dev/auth/react";
import { useChat } from "ai/react";
import Markdown from "react-markdown";
import {
  Bot,
  Expand,
  Minimize,
  Send,
  Trash,
  X,
  Copy,
  Check,
  RotateCw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.replace(
  /.cloud$/,
  ".site"
);

const INITIAL_MESSAGE = {
  id: "welcome",
  role: "assistant" as const,
  content:
    "Hi! I'm your notes assistant. I can find and summarize any information that you've saved. How can I help you today?",
};

export function AIChatButton() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setChatOpen(true)} variant="outline">
        <Bot />
        <span>Ask AI</span>
      </Button>
      <AIChatBox open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

interface AIChatBoxProps {
  open: boolean;
  onClose: () => void;
}

function AIChatBox({ open, onClose }: AIChatBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const token = useAuthToken();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    stop,
    reload,
  } = useChat({
    api: `${convexSiteUrl}/api/chat`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    initialMessages: [INITIAL_MESSAGE],
    body: {
      systemContext: "notes-assistant",
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setError("Failed to send message. Please try again.");
      setTimeout(() => setError(null), 5000);
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClearChat = () => {
    setShowClearConfirm(true);
  };

  const confirmClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setError(null);
    setShowClearConfirm(false);
  };

  if (!open) return null;

  return (
    <div
      className={cn(
        "animate-in slide-in-from-bottom-10 bg-card fixed right-4 bottom-4 z-50 flex flex-col rounded-lg border shadow-lg duration-300 2xl:right-16",
        isExpanded
          ? "h-[650px] max-h-[90vh] w-[550px]"
          : "h-[500px] max-h-[80vh] w-80 sm:w-96"
      )}
    >
      {/* Header */}
      <div className="bg-primary text-primary-foreground flex items-center justify-between rounded-t-lg border-b p-3">
        <div className="flex items-center gap-2">
          <Bot size={18} />
          <h3 className="font-medium">Notes Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? <Minimize size={16} /> : <Expand size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
            title="Clear chat"
            disabled={isLoading || messages.length <= 1}
          >
            <Trash size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
            title="Close"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Offline Warning */}
      {!isOnline && (
        <div className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-b px-4 py-2 text-sm flex items-center gap-2">
          <div className="size-2 rounded-full bg-yellow-500 animate-pulse" />
          You're offline. Connection will resume automatically.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="size-2 animate-bounce rounded-full bg-primary" />
            <div className="size-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
            <div className="size-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 mx-8 flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setError(null);
                reload();
              }}
              className="shrink-0"
            >
              <RotateCw className="size-3 mr-1" />
              Retry
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form className="border-t p-3" onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="max-h-[120px] min-h-[40px] resize-none overflow-y-auto"
              maxLength={1000}
              autoFocus
              disabled={isLoading || !isOnline}
            />
            <div className="text-xs text-muted-foreground text-right mt-1">
              {input.length}/1000
            </div>
          </div>

          {isLoading ? (
            <Button
              type="button"
              onClick={stop}
              size="icon"
              variant="destructive"
              title="Stop generating"
            >
              <X className="size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!input.trim() || !isOnline}
              size="icon"
              title="Send message"
            >
              <Send className="size-4" />
            </Button>
          )}
        </div>
      </form>
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in this chat. You won’t
              be able to recover them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearChat}
              className="bg-primary/90 text-destructive-foreground hover:bg-primary"
            >
              Clear Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Separate component for message bubbles with copy functionality
function MessageBubble({ message }: { message: any }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-lg p-3 group relative",
        message.role === "user" ? "bg-primary/20 ml-8" : "bg-muted mr-8"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="font-semibold text-sm">
          {message.role === "user" ? "You" : "Assistant"}
        </div>
        {message.role === "assistant" && (
          <Button
            size="icon"
            variant="ghost"
            className="opacity-0 group-hover:opacity-100 h-6 w-6 transition-opacity"
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="size-3 text-green-500" />
            ) : (
              <Copy className="size-3" />
            )}
          </Button>
        )}
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <Markdown>{message.content}</Markdown>
      </div>
    </div>
  );
}
