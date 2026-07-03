function Table({ columns, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
      <table className="w-full">
        <thead className="border-b border-gray-800 bg-black/30">
          <tr>
            {columns.map((column, idx) => (
              <th
                key={idx}
                className="px-6 py-4 text-left text-sm font-semibold text-gray-300"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export default Table;
