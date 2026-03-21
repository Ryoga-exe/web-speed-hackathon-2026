import classNames from "classnames";
import {
  ChangeEvent,
  useEffect,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  KeyboardEvent,
  FormEvent,
} from "react";

import { FontAwesomeIcon } from "@web-speed-hackathon-2026/client/src/components/foundation/FontAwesomeIcon";
import { DirectMessageFormData } from "@web-speed-hackathon-2026/client/src/direct_message/types";
import { formatShortTime } from "@web-speed-hackathon-2026/client/src/utils/format_datetime";
import { getProfileImagePath } from "@web-speed-hackathon-2026/client/src/utils/get_path";

interface Props {
  conversationError: Error | null;
  conversation: Models.DirectMessageConversation;
  activeUser: Models.User;
  hasMoreBefore: boolean;
  isLoadingOlder: boolean;
  isPeerTyping: boolean;
  onLoadOlder: () => void;
  isSubmitting: boolean;
  onTypingChange: (isTyping: boolean) => void;
  onSubmit: (params: DirectMessageFormData) => Promise<void>;
}

const TYPING_IDLE_MS = 1500;

export const DirectMessagePage = ({
  conversationError,
  conversation,
  activeUser,
  hasMoreBefore,
  isLoadingOlder,
  isPeerTyping,
  onLoadOlder,
  isSubmitting,
  onTypingChange,
  onSubmit,
}: Props) => {
  const formRef = useRef<HTMLFormElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textAreaId = useId();
  const previousLastMessageIdRef = useRef<string | null>(null);
  const previousScrollHeightRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);
  const typingStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const peer =
    conversation.initiator.id !== activeUser.id ? conversation.initiator : conversation.member;

  const [text, setText] = useState("");
  const textAreaRows = Math.min((text || "").split("\n").length, 5);
  const isInvalid = text.trim().length === 0;

  const clearTypingStopTimeout = useCallback(() => {
    if (typingStopTimeoutRef.current !== null) {
      clearTimeout(typingStopTimeoutRef.current);
      typingStopTimeoutRef.current = null;
    }
  }, []);

  const updateTypingState = useCallback(
    (isTyping: boolean) => {
      if (isTypingRef.current === isTyping) {
        return;
      }

      isTypingRef.current = isTyping;
      onTypingChange(isTyping);
    },
    [onTypingChange],
  );

  const scheduleTypingStop = useCallback(() => {
    clearTypingStopTimeout();
    typingStopTimeoutRef.current = setTimeout(() => {
      updateTypingState(false);
    }, TYPING_IDLE_MS);
  }, [clearTypingStopTimeout, updateTypingState]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const nextText = event.target.value;
      setText(nextText);

      if (nextText.trim().length === 0) {
        clearTypingStopTimeout();
        updateTypingState(false);
        return;
      }

      updateTypingState(true);
      scheduleTypingStop();
    },
    [clearTypingStopTimeout, scheduleTypingStop, updateTypingState],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    },
    [formRef],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      clearTypingStopTimeout();
      updateTypingState(false);
      void onSubmit({ body: text.trim() }).then(() => {
        setText("");
      });
    },
    [clearTypingStopTimeout, onSubmit, text, updateTypingState],
  );

  const handleBlur = useCallback(() => {
    clearTypingStopTimeout();
    updateTypingState(false);
  }, [clearTypingStopTimeout, updateTypingState]);

  useEffect(() => {
    return () => {
      clearTypingStopTimeout();
      if (isTypingRef.current) {
        onTypingChange(false);
      }
    };
  }, [clearTypingStopTimeout, onTypingChange]);

  useLayoutEffect(() => {
    const messagesElement = messagesRef.current;
    if (messagesElement == null) {
      return;
    }

    const lastMessageId = conversation.messages[conversation.messages.length - 1]?.id ?? null;
    const didAppendNewMessage = previousLastMessageIdRef.current !== lastMessageId;

    if (previousScrollHeightRef.current !== null) {
      messagesElement.scrollTop += messagesElement.scrollHeight - previousScrollHeightRef.current;
      previousScrollHeightRef.current = null;
    } else if (didAppendNewMessage || isPeerTyping) {
      messagesElement.scrollTop = messagesElement.scrollHeight;
    }

    previousLastMessageIdRef.current = lastMessageId;
  }, [conversation.messages, isPeerTyping]);

  const handleLoadOlder = useCallback(() => {
    const messagesElement = messagesRef.current;
    if (messagesElement != null) {
      previousScrollHeightRef.current = messagesElement.scrollHeight;
    }
    onLoadOlder();
  }, [onLoadOlder]);

  if (conversationError != null) {
    return (
      <section className="px-6 py-10">
        <p className="text-cax-danger text-sm">メッセージの取得に失敗しました</p>
      </section>
    );
  }

  return (
    <section className="bg-cax-surface flex min-h-[calc(100vh-(--spacing(12)))] flex-col lg:min-h-screen">
      <header className="border-cax-border bg-cax-surface sticky top-0 z-10 flex items-center gap-2 border-b px-4 py-3">
        <img
          alt={peer.profileImage.alt}
          className="h-12 w-12 rounded-full object-cover"
          src={getProfileImagePath(peer.profileImage.id)}
        />
        <div className="min-w-0">
          <h1 className="overflow-hidden text-xl font-bold text-ellipsis whitespace-nowrap">
            {peer.name}
          </h1>
          <p className="text-cax-text-muted overflow-hidden text-xs text-ellipsis whitespace-nowrap">
            @{peer.username}
          </p>
        </div>
      </header>

      <div
        className="bg-cax-surface-subtle flex-1 space-y-4 overflow-y-auto px-4 pt-4 pb-8"
        ref={messagesRef}
      >
        {hasMoreBefore && (
          <div className="flex justify-center">
            <button
              className="border-cax-border bg-cax-surface text-cax-text hover:bg-cax-surface-subtle rounded-full border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoadingOlder}
              onClick={handleLoadOlder}
              type="button"
            >
              {isLoadingOlder ? "読込中..." : "以前のメッセージを表示"}
            </button>
          </div>
        )}

        {conversation.messages.length === 0 && (
          <p className="text-cax-text-muted text-center text-sm">
            まだメッセージはありません。最初のメッセージを送信してみましょう。
          </p>
        )}

        <ul className="grid gap-3" data-testid="dm-message-list">
          {conversation.messages.map((message) => {
            const isActiveUserSend = message.sender.id === activeUser.id;

            return (
              <li
                key={message.id}
                className={classNames(
                  "flex flex-col w-full",
                  isActiveUserSend ? "items-end" : "items-start",
                )}
                style={{
                  containIntrinsicSize: "auto 4rem",
                  contentVisibility: "auto",
                }}
              >
                <p
                  className={classNames(
                    "max-w-3/4 rounded-xl border px-4 py-2 text-sm whitespace-pre-wrap leading-relaxed wrap-anywhere",
                    isActiveUserSend
                      ? "rounded-br-sm border-transparent bg-cax-brand text-cax-surface-raised"
                      : "rounded-bl-sm border-cax-border bg-cax-surface text-cax-text",
                  )}
                >
                  {message.body}
                </p>
                <div className="flex gap-1 text-xs">
                  <time dateTime={message.createdAt}>{formatShortTime(message.createdAt)}</time>
                  {isActiveUserSend && message.isRead && (
                    <span className="text-cax-text-muted">既読</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sticky bottom-12 z-10 lg:bottom-0">
        {isPeerTyping && (
          <p className="bg-cax-surface-raised/75 text-cax-brand absolute inset-x-0 top-0 -translate-y-full px-4 py-1 text-xs">
            <span className="font-bold">{peer.name}</span>さんが入力中…
          </p>
        )}

        <form
          className="border-cax-border bg-cax-surface flex items-end gap-2 border-t p-4"
          onSubmit={handleSubmit}
          ref={formRef}
        >
          <div className="flex grow">
            <label className="sr-only" htmlFor={textAreaId}>
              内容
            </label>
            <textarea
              id={textAreaId}
              className="border-cax-border placeholder-cax-text-subtle focus:outline-cax-brand w-full resize-none rounded-xl border px-3 py-2 focus:outline-2 focus:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onBlur={handleBlur}
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              rows={textAreaRows}
              disabled={isSubmitting}
            />
          </div>
          <button
            className="bg-cax-brand text-cax-surface-raised hover:bg-cax-brand-strong rounded-full px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isInvalid || isSubmitting}
            type="submit"
          >
            <FontAwesomeIcon iconType="arrow-right" styleType="solid" />
          </button>
        </form>
      </div>
    </section>
  );
};
