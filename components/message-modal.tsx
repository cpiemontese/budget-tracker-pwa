import React from "react";
import Modal from "./modal";

export default function MessageModal({
  visible,
  title,
  body,
  setVisible,
}: {
  visible: boolean;
  title: string;
  body: string;
  setVisible: (boolean) => void;
}) {
  return (
    <Modal visible={visible} title={title} setVisible={setVisible}>
      <div className="mb-4">{body}</div>
    </Modal>
  );
}
