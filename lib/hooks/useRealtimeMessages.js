"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "../supabase/client";

export function useRealtimeMessages(conversationId) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    // Fetch initial messages using the API (to bypass RLS if using admin client in API)
    // Or we can use direct Supabase query if RLS allows.
    // Let's use the API route for consistency and RLS bypass for now
    fetch(`/api/chat/messages?conversation_id=${conversationId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted.current) return;
        if (data.error) {
          setError(data.error);
        } else {
          setMessages(data.data || []);
        }
      })
      .catch((err) => {
        if (!isMounted.current) return;
        console.error("Failed to load messages", err);
        setError("Failed to load messages");
      })
      .finally(() => {
        if (isMounted.current) setIsLoading(false);
      });

    // Subscribe to new messages
    // Note: User needs to run `alter publication supabase_realtime add table public.messages;` in SQL Editor
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (!isMounted.current) return;
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (!isMounted.current) return;
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? payload.new : m))
          );
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status for ${conversationId}:`, status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { messages, isLoading, error, setMessages };
}