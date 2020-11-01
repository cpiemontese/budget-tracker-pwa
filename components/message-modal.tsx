import commonStyles from "../styles/common.module.css";

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
    visible && (
      <div className={`${commonStyles.modal} ${commonStyles.smooth}`}>
        <div className="mb-4 font-semibold text-xl border-b-2">{title}</div>
        <div className="mb-4">{body}</div>
        <div className="flex justify-end">
          <button
            className={`w-1/4 ${commonStyles.btn} ${commonStyles["btn-blue"]} ${commonStyles.smooth}`}
            onClick={() => setVisible(false)}
          >
            Close
          </button>
        </div>
      </div>
    )
  );
}
