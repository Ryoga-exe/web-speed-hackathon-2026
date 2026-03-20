import React, { MouseEvent, useCallback, useEffect, useId, useRef, useState } from "react";
void React;

import { Button } from "@web-speed-hackathon-2026/client/src/components/foundation/Button";
import { Modal } from "@web-speed-hackathon-2026/client/src/components/modal/Modal";

interface Props {
  alt: string;
  fetchPriority?: "auto" | "high" | "low";
  loading?: "eager" | "lazy";
  src: string;
}

/**
 * アスペクト比を維持したまま、要素のコンテンツボックス全体を埋めるように画像を拡大縮小します
 */
export const CoveredImage = ({ alt, fetchPriority, loading = "lazy", src }: Props) => {
  const dialogId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || dialog == null || dialog.open) {
      return;
    }

    dialog.showModal();
  }, [isOpen]);

  // ダイアログの背景をクリックしたときに投稿詳細ページに遷移しないようにする
  const handleDialogClick = useCallback((ev: MouseEvent<HTMLDialogElement>) => {
    ev.stopPropagation();
  }, []);

  const handleCloseDialog = useCallback(() => {
    dialogRef.current?.close();
    setIsOpen(false);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        decoding="async"
        fetchPriority={fetchPriority}
        loading={loading}
        src={src}
      />

      <button
        className="border-cax-border bg-cax-surface-raised/90 text-cax-text-muted hover:bg-cax-surface absolute right-1 bottom-1 rounded-full border px-2 py-1 text-center text-xs"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        ALT を表示する
      </button>

      {isOpen ? (
        <Modal
          id={dialogId}
          ref={dialogRef}
          closedby="any"
          onClick={handleDialogClick}
          onClose={() => setIsOpen(false)}
        >
          <div className="grid gap-y-6">
            <h1 className="text-center text-2xl font-bold">画像の説明</h1>

            <p className="text-sm">{alt}</p>

            <Button variant="secondary" onClick={handleCloseDialog}>
              閉じる
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
};
