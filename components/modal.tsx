import commonStyles from "../styles/common.module.css";

export default function Modal({
  visible,
  title,
  children,
  setVisible,
}: {
  visible: boolean;
  title: string;
  children: any;
  setVisible: (boolean) => void;
}) {
  return (
    visible && (
      <div className={`${commonStyles.modal} ${commonStyles.smooth}`}>
        <div className="mb-4 font-semibold text-xl border-b-2">{title}</div>
        {children}
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
