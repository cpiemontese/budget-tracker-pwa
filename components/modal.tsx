import commonStyles from "../styles/common.module.css";

export default function Modal({
  visible,
  title,
  children,
  setVisible,
  closeBtn = true,
}: {
  visible: boolean;
  title: string;
  children: any;
  closeBtn?: boolean;
  setVisible: (boolean) => void;
}) {
  return (
    visible && (
      <>
        <div
          className="fixed inset-0 bg-black bg-opacity-25"
          onClick={() => setVisible(false)}
        ></div>
        <div
          className={`${commonStyles.modal} ${commonStyles.smooth}`}
          style={{ top: "30%" }}
        >
          <div className="mb-4 font-semibold text-xl border-b-2">{title}</div>
          {children}
          {closeBtn && (
            <div className="flex justify-end">
              <button
                className={`w-1/4 ${commonStyles.btn} ${commonStyles["btn-blue"]} ${commonStyles.smooth}`}
                onClick={() => setVisible(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </>
    )
  );
}
