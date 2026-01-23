const Button = ({ children, onClick, disabled, fullWidth }) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2 rounded-md bg-primary text-zinc-500 font-semibold hover:bg-primary/80 transition ${
        fullWidth ? "w-full" : ""
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
};

export default Button;
