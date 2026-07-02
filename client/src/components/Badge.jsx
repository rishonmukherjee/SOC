function Badge({ status }) {
  const styles = {
    Open: "bg-red-500/10 text-red-400 border border-red-500/20",
    Mitigated: "bg-green-500/10 text-green-400 border border-green-500/20",
    Accepted: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[status] || "bg-gray-700 text-gray-300"
      }`}
    >
      {status}
    </span>
  );
}

export default Badge;
